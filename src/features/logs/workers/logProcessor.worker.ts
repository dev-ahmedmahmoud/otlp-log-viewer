import { normalizeLogs } from "../utils/normalizeLogs";
import { buildHistogramBuckets } from "../utils/buildHistogram";
import { groupLogsByService } from "../utils/groupLogsByService";
import { WorkerRequest, WorkerResponse } from "../types/worker.types";

// eslint-disable-next-line no-restricted-globals
addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const { type, payload } = event.data;

  if (type === "PROCESS_LOGS") {
    const start = performance.now();

    const logs = normalizeLogs(payload);
    const histogram = buildHistogramBuckets(logs, 30);
    const groupedLogs = groupLogsByService(logs);

    const durationMs = Math.round(performance.now() - start);

    const response: WorkerResponse = {
      type: "PROCESS_LOGS_RESULT",
      payload: { logs, histogram, groupedLogs, durationMs },
    };

    postMessage(response);
  }
});
