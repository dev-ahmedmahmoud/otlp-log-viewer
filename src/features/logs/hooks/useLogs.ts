'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LogEntry, HistogramBucket } from '../types';
import { ServiceGroup } from '../utils/groupLogsByService';
import { OTLPExportLogsServiceRequest } from '../types/otlp';
import { WorkerRequest, WorkerResponse } from '../types/worker.types';

if (!process.env.NEXT_PUBLIC_LOGS_API_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_LOGS_API_URL');
}
const API_URL: string = process.env.NEXT_PUBLIC_LOGS_API_URL;

interface UseLogsResult {
    logs: LogEntry[];
    histogram: HistogramBucket[];
    groupedLogs: ServiceGroup[];
    isLoading: boolean;
    isProcessing: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useLogs(): UseLogsResult {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [histogram, setHistogram] = useState<HistogramBucket[]>([]);
    const [groupedLogs, setGroupedLogs] = useState<ServiceGroup[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const workerRef = useRef<Worker | null>(null);

    // Initialize worker on mount, terminate on unmount
    useEffect(() => {
        const worker = new Worker(
            new URL('../workers/logProcessor.worker.ts', import.meta.url)
        );

        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
            const { type, payload } = event.data;
            if (type === 'PROCESS_LOGS_RESULT') {
                setLogs(payload.logs);
                setHistogram(payload.histogram);
                setGroupedLogs(payload.groupedLogs);
                setIsProcessing(false);

                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Worker] Processed ${payload.logs.length} logs in ${payload.durationMs}ms`);
                }
            }
        };

        worker.onerror = (err) => {
            console.error('[Worker] Error:', err);
            setIsProcessing(false);
        };

        workerRef.current = worker;

        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, []);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch logs: ${response.statusText}`);
            }
            const json: OTLPExportLogsServiceRequest = await response.json();

            // Offload processing to worker
            if (workerRef.current) {
                setIsProcessing(true);
                const request: WorkerRequest = { type: 'PROCESS_LOGS', payload: json };
                workerRef.current.postMessage(request);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return {
        logs,
        histogram,
        groupedLogs,
        isLoading,
        isProcessing,
        error,
        refetch: fetchLogs,
    };
}
