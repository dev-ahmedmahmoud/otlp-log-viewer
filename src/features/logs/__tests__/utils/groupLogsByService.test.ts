import { describe, it, expect } from "vitest";
import { groupLogsByService } from "../../utils/groupLogsByService";
import { LogEntry, LogLevel } from "../../types";

describe("groupLogsByService", () => {
  it("should return empty array for formatting", () => {
    expect(groupLogsByService([])).toEqual([]);
  });

  it("should group logs correctly and count errors", () => {
    const logs: LogEntry[] = [
      { serviceName: "auth-service", severityText: "INFO" } as LogEntry,
      { serviceName: "auth-service", severityText: LogLevel.ERROR } as LogEntry,
      {
        serviceName: "checkout-service",
        severityText: LogLevel.WARN,
      } as LogEntry,
      { severityText: LogLevel.INFO } as LogEntry, // missing service name -> unknown-service
    ];

    const groups = groupLogsByService(logs);

    expect(groups).toHaveLength(3);

    // Auth service (sorted first alphabetically)
    expect(groups[0]!.serviceName).toBe("auth-service");
    expect(groups[0]!.logs).toHaveLength(2);
    expect(groups[0]!.levelCounts[LogLevel.ERROR]).toBe(1);
    expect(groups[0]!.levelCounts[LogLevel.INFO]).toBe(1);

    // Checkout service
    expect(groups[1]!.serviceName).toBe("checkout-service");
    expect(groups[1]!.logs).toHaveLength(1);
    expect(groups[1]!.levelCounts[LogLevel.WARN]).toBe(1);

    // Unknown service
    expect(groups[2]!.serviceName).toBe("unknown-service");
    expect(groups[2]!.logs).toHaveLength(1);
    expect(groups[2]!.levelCounts[LogLevel.INFO]).toBe(1);
  });
});
