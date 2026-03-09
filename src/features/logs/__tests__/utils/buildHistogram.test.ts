import { describe, it, expect } from 'vitest';
import { buildHistogramBuckets } from '../../utils/buildHistogram';
import { LogEntry } from '../../types';

describe('buildHistogramBuckets', () => {
    it('should return empty array when no logs are provided', () => {
        expect(buildHistogramBuckets([])).toEqual([]);
    });

    it('should accurately bucket log counts over time', () => {
        const baseTime = 10000; // 10 seconds since epoch
        const logs: LogEntry[] = [
            { timestamp: new Date(baseTime).toISOString(), severityText: 'ERROR' } as LogEntry,
            { timestamp: new Date(baseTime + 1000).toISOString(), severityText: 'ERROR' } as LogEntry, // bucket 0 (span 1)
            { timestamp: new Date(baseTime + 4000).toISOString(), severityText: 'INFO' } as LogEntry, // bucket 1
            { timestamp: new Date(baseTime + 9000).toISOString(), severityText: 'WARN' } as LogEntry, // bucket 2
        ];

        // Span = 9000ms. 3 buckets => bucket size 3000ms.
        // Bucket 0: 10000 - 13000 (contains 10000, 11000) -> count 2
        // Bucket 1: 13000 - 16000 (contains 14000) -> count 1
        // Bucket 2: 16000 - 19000 (contains 19000) -> count 1

        const histogram = buildHistogramBuckets(logs, 3);

        expect(histogram).toHaveLength(3);
        expect(histogram[0]!.count).toBe(2);
        expect(histogram[0]!.levelCounts['ERROR']).toBe(2);
        expect(histogram[1]!.count).toBe(1);
        expect(histogram[1]!.levelCounts['INFO']).toBe(1);
        expect(histogram[2]!.count).toBe(1);
        expect(histogram[2]!.levelCounts['WARN']).toBe(1);
    });

    it('should handle logs that occur at the exact same time', () => {
        const sameTime = new Date().toISOString();
        const logs: LogEntry[] = [
            { timestamp: sameTime, severityText: 'ERROR' } as LogEntry,
            { timestamp: sameTime, severityText: 'INFO' } as LogEntry,
        ];

        const histogram = buildHistogramBuckets(logs, 5);
        expect(histogram).toHaveLength(5);

        const totalCount = histogram.reduce((sum, b) => sum + b.count, 0);
        expect(totalCount).toBe(2);
    });
});
