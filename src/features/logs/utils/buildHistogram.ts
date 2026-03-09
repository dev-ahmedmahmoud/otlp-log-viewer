import { HistogramBucket, LogEntry, LogLevel } from "../types";

/**
 * Builds time-based histogram buckets from a flat list of normalized logs.
 * Finds the minimum and maximum timestamp in a single pass O(n),
 * allocates exact buckets, and increments counts in a second pass O(n).
 */
export const buildHistogramBuckets = (
  logs: LogEntry[],
  bucketCount: number = 30,
): HistogramBucket[] => {
  if (!logs || logs.length === 0) return [];
  if (bucketCount <= 0) return [];

  let minTime = Number.MAX_SAFE_INTEGER;
  let maxTime = Number.MIN_SAFE_INTEGER;

  // Pass 1: find bounds
  for (const log of logs) {
    const timestamp = new Date(log.timestamp).getTime();
    if (timestamp < minTime) minTime = timestamp;
    if (timestamp > maxTime) maxTime = timestamp;
  }

  // If all logs happened precisely at the same millisecond or only one log
  if (minTime === maxTime) {
    minTime -= 1000;
    maxTime += 1000; // Add simulated 1 sec buffer around it
  }

  // Calculate bucket sizes
  const timeSpan = maxTime - minTime;
  const bucketSize = timeSpan / bucketCount;

  // Initialize buckets
  const buckets: HistogramBucket[] = Array.from(
    { length: bucketCount },
    (_, i) => ({
      timestamp: minTime + i * bucketSize,
      count: 0,
      levelCounts: {},
    }),
  );

  // Pass 2: Fill buckets
  for (const log of logs) {
    const timestamp = new Date(log.timestamp).getTime();
    // Safety check against floating point max indices boundary
    let index = Math.floor((timestamp - minTime) / bucketSize);
    if (index >= bucketCount) index = bucketCount - 1;

    const bucket = buckets[index]!;
    bucket.count++;

    const severity = log.severityText || LogLevel.UNSPECIFIED;
    if (!bucket.levelCounts[severity]) {
      bucket.levelCounts[severity] = 0;
    }
    bucket.levelCounts[severity]++;
  }

  return buckets;
};
