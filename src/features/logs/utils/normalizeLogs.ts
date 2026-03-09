import { LogEntry, LogLevel } from '../types';
import { OTLPExportLogsServiceRequest, OTLPKeyValue } from '../types/otlp';

const parseAttributeValue = (value: OTLPKeyValue['value']): string | number | boolean => {
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.intValue !== undefined) return Number(value.intValue);
    if (value.boolValue !== undefined) return value.boolValue;
    if (value.doubleValue !== undefined) return value.doubleValue;
    return JSON.stringify(value);
};

const parseAttributesToRecord = (attributes?: OTLPKeyValue[]): Record<string, string | number | boolean> => {
    const result: Record<string, string | number | boolean> = {};
    if (!attributes) return result;

    for (const attr of attributes) {
        result[attr.key] = parseAttributeValue(attr.value);
    }
    return result;
};

/**
 * Normalizes a deeply nested OTLP log response into a flat array of LogEntry objects.
 * Uses O(n) preprocessing by walking the tree exactly once.
 */
export const normalizeLogs = (data: OTLPExportLogsServiceRequest | null): LogEntry[] => {
    if (!data || !Array.isArray(data.resourceLogs)) {
        return [];
    }

    const result: LogEntry[] = [];

    for (const resourceLog of data.resourceLogs) {
        const resourceAttrs = parseAttributesToRecord(resourceLog.resource?.attributes);

        const serviceName = (resourceAttrs['service.name'] as string) || 'unknown-service';
        const serviceNamespace = (resourceAttrs['service.namespace'] as string) || '';
        const serviceInstanceId = (resourceAttrs['service.instance.id'] as string) || '';
        const serviceVersion = (resourceAttrs['service.version'] as string) || '';

        if (!Array.isArray(resourceLog.scopeLogs)) continue;

        for (const scopeLog of resourceLog.scopeLogs) {
            if (!Array.isArray(scopeLog.logRecords)) continue;

            for (const record of scopeLog.logRecords) {
                // timeUnixNano is reliably present as string in OTLP JSON (uint64)
                const timeNano = record.timeUnixNano || '0';
                // JS Date uses milliseconds
                const timestampMs = timeNano ? Math.floor(Number(timeNano) / 1e6) : Date.now();
                const timestampStr = new Date(timestampMs).toISOString();

                const logAttributes = parseAttributesToRecord(record.attributes);

                const logEntry: LogEntry = {
                    // Generate a pseudo-ID if traceId/spanId don't exist, using time+service to avoid layout jumps
                    id: record.traceId && record.spanId ? `${record.traceId}-${record.spanId}-${timeNano}` : `${serviceName}-${timeNano}-${Math.random().toString(36).slice(2, 6)}`,
                    timeUnixNano: timeNano,
                    timestamp: timestampStr,
                    severityText: record.severityText || LogLevel.UNSPECIFIED,
                    severityNumber: record.severityNumber || 0,
                    body: record.body?.stringValue || '',
                    attributes: logAttributes,
                    serviceName,
                    serviceNamespace,
                    serviceInstanceId,
                    serviceVersion,
                };

                result.push(logEntry);
            }
        }
    }

    return result;
};
