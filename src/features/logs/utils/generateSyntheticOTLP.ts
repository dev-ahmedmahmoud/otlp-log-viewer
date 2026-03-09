import { OTLPExportLogsServiceRequest } from '../types/otlp';

const SEVERITY_LEVELS = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'FATAL', 'UNSPECIFIED'];
const SERVICE_NAMES = ['api-gateway', 'auth-service', 'payment-service', 'user-service', 'notification-service'];

/**
 * Generates a synthetic OTLP log payload with the specified number of log records.
 * Distributes logs across multiple services and severity levels for realistic testing.
 */
export function generateSyntheticOTLP(logCount: number): OTLPExportLogsServiceRequest {
    const now = Date.now();
    const oneHourMs = 3_600_000;

    // Group logs into resourceLogs by service
    const logsPerService = Math.ceil(logCount / SERVICE_NAMES.length);

    const resourceLogs = SERVICE_NAMES.map((serviceName, serviceIndex) => {
        const logRecords = [];
        const recordCount = serviceIndex === SERVICE_NAMES.length - 1
            ? logCount - logsPerService * serviceIndex // Last service gets remainder
            : logsPerService;

        for (let i = 0; i < recordCount; i++) {
            const timestampMs = now - Math.floor(Math.random() * oneHourMs);
            const timeUnixNano = String(timestampMs * 1_000_000);
            const severity = SEVERITY_LEVELS[i % SEVERITY_LEVELS.length]!;

            logRecords.push({
                timeUnixNano,
                observedTimeUnixNano: timeUnixNano,
                severityNumber: (i % 6) + 1,
                severityText: severity,
                body: { stringValue: `Log message ${i} from ${serviceName}` },
                attributes: [
                    { key: 'http.method', value: { stringValue: 'GET' } },
                    { key: 'http.status_code', value: { intValue: '200' } },
                ],
                traceId: `trace-${serviceIndex}-${i}`,
                spanId: `span-${serviceIndex}-${i}`,
            });
        }

        return {
            resource: {
                attributes: [
                    { key: 'service.name', value: { stringValue: serviceName } },
                    { key: 'service.version', value: { stringValue: '1.0.0' } },
                ],
            },
            scopeLogs: [
                {
                    scope: { name: 'test-scope' },
                    logRecords,
                },
            ],
        };
    });

    return { resourceLogs };
}
