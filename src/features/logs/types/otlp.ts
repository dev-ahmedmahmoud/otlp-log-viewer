import { LogLevel } from ".";

export interface OTLPKeyValue {
    key: string;
    value: {
        stringValue?: string;
        intValue?: number | string;
        boolValue?: boolean;
        doubleValue?: number;
        // other types like arrayValue, kvlistValue could exist, but for logs usually string/int
    };
}

export interface OTLPResource {
    attributes?: OTLPKeyValue[];
}

export interface OTLPLogRecord {
    timeUnixNano?: string;
    observedTimeUnixNano?: string;
    severityNumber?: number;
    severityText?: LogLevel;
    body?: {
        stringValue?: string;
    };
    attributes?: OTLPKeyValue[];
    traceId?: string;
    spanId?: string;
}

export interface OTLPScopeLog {
    scope?: {
        name?: string;
        version?: string;
    };
    logRecords: OTLPLogRecord[];
}

export interface OTLPResourceLog {
    resource: OTLPResource;
    scopeLogs: OTLPScopeLog[];
}

export interface OTLPExportLogsServiceRequest {
    resourceLogs: OTLPResourceLog[];
}
