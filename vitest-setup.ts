import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./src/mocks/server";

// Mock environment variables for testing
process.env.NEXT_PUBLIC_LOGS_API_URL = "http://localhost:3000/api/logs";

// Mock ResizeObserver for TanStack Virtual
class MockResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }
    observe(target: Element) {
        // Trigger callback immediately with the mocked dimensions
        setTimeout(() => {
            this.callback(
                [
                    {
                        contentRect: { width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600, x: 0, y: 0 } as DOMRectReadOnly,
                        target,
                    } as ResizeObserverEntry,
                ],
                this as any,
            );
        }, 0);
    }
    unobserve() { }
    disconnect() { }
}
global.ResizeObserver = MockResizeObserver as any;


// Mock virtualization-related DOM properties
const originalGetBCR = Element.prototype.getBoundingClientRect;
beforeAll(() => {
    Element.prototype.getBoundingClientRect = function () {
        return {
            width: 800,
            height: 600,
            top: 0,
            left: 0,
            bottom: 600,
            right: 800,
            x: 0,
            y: 0,
            toJSON: () => { },
        };
    };

    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
        configurable: true,
        value: 600,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
        configurable: true,
        value: 600,
    });
});

afterAll(() => {
    Element.prototype.getBoundingClientRect = originalGetBCR;
});


// Mock Web Worker for JSDOM
class MockWorker {
    url: string;
    onmessage: (e: any) => void = () => { };
    onerror: (e: any) => void = () => { };

    constructor(url: string) {
        this.url = url;
    }

    postMessage(request: any) {
        if (request.type === "PROCESS_LOGS") {
            const data = request.payload;
            const logs: any[] = [];
            const groups: any[] = [];
            const groupMap = new Map();

            // Simple normalization for tests
            if (data && data.resourceLogs) {
                for (const res of data.resourceLogs) {
                    const serviceName = res.resource?.attributes?.find((a: any) => a.key === 'service.name')?.value?.stringValue || 'unknown-service';

                    let group = groupMap.get(serviceName);
                    if (!group) {
                        group = { serviceName, logs: [], levelCounts: {} };
                        groupMap.set(serviceName, group);
                        groups.push(group);
                    }

                    for (const scope of res.scopeLogs || []) {
                        for (const rec of scope.logRecords || []) {
                            const log = {
                                id: String(logs.length),
                                timestamp: new Date().toISOString(),
                                serviceName,
                                severityText: rec.severityText || 'INFO',
                                body: rec.body?.stringValue || ''
                            };

                            logs.push(log);
                            group.logs.push(log);
                            const level = log.severityText;
                            group.levelCounts[level] = (group.levelCounts[level] || 0) + 1;
                        }
                    }
                }
            }

            setTimeout(() => {
                if (this.onmessage) {
                    this.onmessage({
                        data: {
                            type: "PROCESS_LOGS_RESULT",
                            payload: {
                                logs,
                                histogram: [],
                                groupedLogs: groups.sort((a, b) => a.serviceName.localeCompare(b.serviceName)),
                                durationMs: 1
                            }
                        }
                    } as any);
                }
            }, 0);
        }
    }

    terminate() { }
    addEventListener() { }
    removeEventListener() { }
}

global.Worker = MockWorker as any;



beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
