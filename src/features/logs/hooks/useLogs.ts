import { useState, useEffect, useMemo, useCallback } from 'react';
import { LogEntry, HistogramBucket } from '../types';
import { normalizeLogs } from '../utils/normalizeLogs';
import { buildHistogramBuckets } from '../utils/buildHistogram';
import { groupLogsByService, ServiceGroup } from '../utils/groupLogsByService';
import { OTLPExportLogsServiceRequest } from '../types/otlp';

if (!process.env.NEXT_PUBLIC_LOGS_API_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_LOGS_API_URL');
}
const API_URL: string = process.env.NEXT_PUBLIC_LOGS_API_URL;

interface UseLogsResult {
    logs: LogEntry[];
    histogram: HistogramBucket[];
    groupedLogs: ServiceGroup[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useLogs(): UseLogsResult {
    const [data, setData] = useState<OTLPExportLogsServiceRequest | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch logs: ${response.statusText}`);
            }
            const json: OTLPExportLogsServiceRequest = await response.json();
            setData(json);
        } catch (err: unknown) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Use useMemo to avoid repeated O(n) transformations during re-renders
    const logs = useMemo(() => normalizeLogs(data), [data]);
    const histogram = useMemo(() => buildHistogramBuckets(logs, 30), [logs]);
    const groupedLogs = useMemo(() => groupLogsByService(logs), [logs]);

    return {
        logs,
        histogram,
        groupedLogs,
        isLoading,
        error,
        refetch: fetchLogs,
    };
}
