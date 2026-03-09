import { LogEntry, LogLevel } from "../types";

export interface ServiceGroup {
  serviceName: string;
  logs: LogEntry[];
  levelCounts: Partial<Record<LogLevel, number>>;
}

/**
 * Groups a flat array of logs by service name.
 * Complexity: O(n)
 */
export const groupLogsByService = (logs: LogEntry[]): ServiceGroup[] => {
  if (!logs || logs.length === 0) return [];

  const map = new Map<string, ServiceGroup>();

  for (const log of logs) {
    const serviceName = log.serviceName || "unknown-service";
    const level = (log.severityText as LogLevel) || LogLevel.UNSPECIFIED;

    let group = map.get(serviceName);
    if (!group) {
      group = { serviceName, logs: [], levelCounts: {} };
      map.set(serviceName, group);
    }

    group.logs.push(log);

    group.levelCounts[level] = (group.levelCounts[level] || 0) + 1;
  }

  // Convert map to array and sort by service name alphabetically
  return Array.from(map.values()).sort((a, b) =>
    a.serviceName.localeCompare(b.serviceName),
  );
};
