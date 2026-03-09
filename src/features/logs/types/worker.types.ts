import { LogEntry, HistogramBucket } from './index';
import { ServiceGroup } from '../utils/groupLogsByService';
import { OTLPExportLogsServiceRequest } from './otlp';

export interface WorkerRequest {
    type: 'PROCESS_LOGS';
    payload: OTLPExportLogsServiceRequest;
}

export interface WorkerResponse {
    type: 'PROCESS_LOGS_RESULT';
    payload: {
        logs: LogEntry[];
        histogram: HistogramBucket[];
        groupedLogs: ServiceGroup[];
        durationMs: number;
    };
}
