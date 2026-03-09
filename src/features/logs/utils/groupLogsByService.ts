import { LogEntry, LogLevel } from '../types';

export interface ServiceGroup {
    serviceName: string;
    logs: LogEntry[];
    errorCount: number; // useful for summary UI
}

/**
 * Groups a flat array of logs by service name.
 * Complexity: O(n)
 */
export const groupLogsByService = (logs: LogEntry[]): ServiceGroup[] => {
    if (!logs || logs.length === 0) return [];

    const map = new Map<string, ServiceGroup>();

    for (const log of logs) {
        const serviceName = log.serviceName || 'unknown-service';

        let group = map.get(serviceName);
        if (!group) {
            group = { serviceName, logs: [], errorCount: 0 };
            map.set(serviceName, group);
        }

        group.logs.push(log);

        if (log.severityText === LogLevel.ERROR || log.severityText === LogLevel.FATAL) {
            group.errorCount++;
        }
    }

    // Convert map to array and sort by service name alphabetically
    return Array.from(map.values()).sort((a, b) => a.serviceName.localeCompare(b.serviceName));
};
