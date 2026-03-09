export enum LogLevel {
    ERROR = 'ERROR',
    FATAL = 'FATAL',
    WARN = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    UNSPECIFIED = 'UNSPECIFIED',
}

export enum ViewMode {
    FLAT = 'flat',
    GROUPED = 'grouped',
}

export interface LogEntry {
    id: string;
    timestamp: string; // ISO String for display
    timeUnixNano: string; // The original nanosecond precision
    severityText: string;
    severityNumber: number;
    body: string;
    attributes: Record<string, string | number | boolean>;
    serviceName: string;
    serviceNamespace: string;
    serviceInstanceId: string;
    serviceVersion: string;
}

export interface HistogramBucket {
    timestamp: number;
    count: number;
    levelCounts: Record<string, number>;
}
