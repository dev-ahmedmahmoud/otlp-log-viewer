import { describe, it, expect } from 'vitest';
import { normalizeLogs } from '../../utils/normalizeLogs';
import { OTLPExportLogsServiceRequest } from '../../types/otlp';
import { LogLevel } from '../../types';

describe('normalizeLogs', () => {
    it('should return empty array for null or invalid data', () => {
        expect(normalizeLogs(null)).toEqual([]);
        expect(normalizeLogs({} as unknown as OTLPExportLogsServiceRequest)).toEqual([]);
    });

    it('should correctly flatten nested OTLP logs into LogEntry array', () => {
        const mockOTLPData: OTLPExportLogsServiceRequest = {
            resourceLogs: [
                {
                    resource: {
                        attributes: [
                            { key: 'service.name', value: { stringValue: 'test-service' } },
                            { key: 'service.version', value: { stringValue: '1.0.0' } },
                        ],
                    },
                    scopeLogs: [
                        {
                            logRecords: [
                                {
                                    timeUnixNano: '1738321289139931000',
                                    severityNumber: 17,
                                    severityText: LogLevel.ERROR,
                                    body: { stringValue: 'Test error message' },
                                    attributes: [
                                        { key: 'http.status_code', value: { intValue: 500 } },
                                        { key: 'is_retry', value: { boolValue: true } },
                                    ],
                                },
                                {
                                    timeUnixNano: '1738321289140000000',
                                    severityNumber: 9,
                                    severityText: LogLevel.INFO,
                                    body: { stringValue: 'Test info message' },
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = normalizeLogs(mockOTLPData);

        expect(result.length).toBe(2);

        const errLog = result[0]!;
        expect(errLog.serviceName).toBe('test-service');
        expect(errLog.serviceVersion).toBe('1.0.0');
        expect(errLog.serviceNamespace).toBe(''); // Defaults to empty
        expect(errLog.severityText).toBe('ERROR');
        expect(errLog.severityNumber).toBe(17);
        expect(errLog.timeUnixNano).toBe('1738321289139931000');
        expect(errLog.body).toBe('Test error message');
        expect(errLog.attributes['http.status_code']).toBe(500);
        expect(errLog.attributes['is_retry']).toBe(true);
        expect(new Date(errLog.timestamp).getTime()).toEqual(1738321289139); // 139 ms converted from nano

        const infoLog = result[1]!;
        expect(infoLog.severityText).toBe('INFO');
        expect(infoLog.body).toBe('Test info message');
        expect(infoLog.attributes).toEqual({});
    });

    it('should handle missing attributes gracefully', () => {
        const result = normalizeLogs({
            resourceLogs: [
                {
                    resource: {},
                    scopeLogs: [
                        {
                            logRecords: [
                                { timeUnixNano: '1000000' }
                            ]
                        }
                    ]
                }
            ]
        });

        expect(result[0]!.serviceName).toBe('unknown-service');
        expect(result[0]!.severityText).toBe('UNSPECIFIED');
        expect(result[0]!.body).toBe('');
    });
});
