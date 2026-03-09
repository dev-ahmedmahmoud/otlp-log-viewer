import { describe, it, expect } from "vitest";
import { normalizeLogs } from "../../utils/normalizeLogs";
import { buildHistogramBuckets } from "../../utils/buildHistogram";
import { groupLogsByService } from "../../utils/groupLogsByService";
import { generateSyntheticOTLP } from "../../utils/generateSyntheticOTLP";

const LOG_COUNT = 100_000;
const MAX_DURATION_MS = 2000; // 2 second budget for 100K logs

describe("Log Processing Pipeline — Stress Test", () => {
  const syntheticData = generateSyntheticOTLP(LOG_COUNT);

  it(`normalizes ${LOG_COUNT.toLocaleString()} logs within ${MAX_DURATION_MS}ms`, () => {
    const start = performance.now();
    const logs = normalizeLogs(syntheticData);
    const duration = performance.now() - start;

    expect(logs).toHaveLength(LOG_COUNT);
    expect(logs[0]).toHaveProperty("id");
    expect(logs[0]).toHaveProperty("severityText");
    expect(logs[0]).toHaveProperty("serviceName");

    console.log(
      `normalizeLogs: ${LOG_COUNT.toLocaleString()} logs in ${Math.round(duration)}ms`,
    );
    expect(duration).toBeLessThan(MAX_DURATION_MS);
  });

  it(`builds histogram from ${LOG_COUNT.toLocaleString()} logs within ${MAX_DURATION_MS}ms`, () => {
    const logs = normalizeLogs(syntheticData);

    const start = performance.now();
    const histogram = buildHistogramBuckets(logs, 30);
    const duration = performance.now() - start;

    expect(histogram).toHaveLength(30);

    const totalCount = histogram.reduce((sum, b) => sum + b.count, 0);
    expect(totalCount).toBe(LOG_COUNT);

    console.log(
      `buildHistogramBuckets: ${LOG_COUNT.toLocaleString()} logs in ${Math.round(duration)}ms`,
    );
    expect(duration).toBeLessThan(MAX_DURATION_MS);
  });

  it(`groups ${LOG_COUNT.toLocaleString()} logs by service within ${MAX_DURATION_MS}ms`, () => {
    const logs = normalizeLogs(syntheticData);

    const start = performance.now();
    const groups = groupLogsByService(logs);
    const duration = performance.now() - start;

    expect(groups.length).toBe(5); // 5 synthetic services

    const totalLogs = groups.reduce((sum, g) => sum + g.logs.length, 0);
    expect(totalLogs).toBe(LOG_COUNT);

    // Verify alphabetical sort
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i]!.serviceName >= groups[i - 1]!.serviceName).toBe(true);
    }

    console.log(
      `groupLogsByService: ${LOG_COUNT.toLocaleString()} logs in ${Math.round(duration)}ms`,
    );
    expect(duration).toBeLessThan(MAX_DURATION_MS);
  });

  it(`runs the full pipeline end-to-end within ${MAX_DURATION_MS}ms`, () => {
    const start = performance.now();

    const logs = normalizeLogs(syntheticData);
    const histogram = buildHistogramBuckets(logs, 30);
    const groups = groupLogsByService(logs);

    const duration = performance.now() - start;

    expect(logs).toHaveLength(LOG_COUNT);
    expect(histogram).toHaveLength(30);
    expect(groups.length).toBe(5);

    console.log(
      `Full pipeline: ${LOG_COUNT.toLocaleString()} logs in ${Math.round(duration)}ms`,
    );
    expect(duration).toBeLessThan(MAX_DURATION_MS);
  });
});
