import { http, HttpResponse } from 'msw';
import { OTLPExportLogsServiceRequest } from '../features/logs/types/otlp';

export const mockOtlpResponse: OTLPExportLogsServiceRequest = {
    resourceLogs: [
        {
            resource: {
                attributes: [
                    { key: 'service.name', value: { stringValue: 'test-api-service' } },
                ],
            },
            scopeLogs: [
                {
                    logRecords: [
                        {
                            timeUnixNano: (Date.now() * 1000000).toString(),
                            severityText: 'ERROR',
                            severityNumber: 17,
                            body: { stringValue: 'Database connection failed' },
                            attributes: [{ key: 'db.host', value: { stringValue: 'localhost' } }],
                        },
                        {
                            timeUnixNano: ((Date.now() + 1000) * 1000000).toString(),
                            severityText: 'INFO',
                            severityNumber: 9,
                            body: { stringValue: 'API request successful' },
                            attributes: [{ key: 'http.status_code', value: { intValue: 200 } }],
                        },
                    ],
                },
            ],
        },
        {
            resource: {
                attributes: [
                    { key: 'service.name', value: { stringValue: 'checkout-service' } },
                ],
            },
            scopeLogs: [
                {
                    logRecords: [
                        {
                            timeUnixNano: ((Date.now() + 5000) * 1000000).toString(),
                            severityText: 'WARN',
                            severityNumber: 13,
                            body: { stringValue: 'Retrying external payment gateway' },
                            attributes: [{ key: 'retry_count', value: { intValue: 3 } }],
                        },
                    ],
                },
            ],
        },
    ],
};

export const handlers = [
    http.get('https://take-home-assignment-otlp-logs-api.vercel.app/api/logs', () => {
        return HttpResponse.json(mockOtlpResponse);
    }),
];
