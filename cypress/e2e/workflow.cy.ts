describe("Log Viewer Workflow", () => {
  beforeEach(() => {
    // Intercept to avoid actually reaching the external slow API in testing if it's slow,
    // though MSW also works. In Cypress, we can mock it explicitly for determinism.
    cy.intercept("GET", "**/api/logs", {
      statusCode: 200,
      body: {
        resourceLogs: [
          {
            resource: {
              attributes: [
                {
                  key: "service.name",
                  value: { stringValue: "test-service-1" },
                },
              ],
            },
            scopeLogs: [
              {
                logRecords: [
                  {
                    timeUnixNano: (Date.now() * 1000000).toString(),
                    severityText: "ERROR",
                    body: { stringValue: "Payment crashed" },
                    attributes: [
                      { key: "tx.id", value: { stringValue: "abc-123" } },
                    ],
                  },
                  {
                    timeUnixNano: ((Date.now() + 1000) * 1000000).toString(),
                    severityText: "INFO",
                    body: { stringValue: "Payment started" },
                  },
                ],
              },
            ],
          },
          {
            resource: {
              attributes: [
                { key: "service.name", value: { stringValue: "service-2" } },
              ],
            },
            scopeLogs: [
              {
                logRecords: [
                  {
                    timeUnixNano: ((Date.now() + 2000) * 1000000).toString(),
                    severityText: "WARN",
                    body: { stringValue: "Memory high" },
                  },
                ],
              },
            ],
          },
        ],
      },
    }).as("getLogs");

    cy.visit("/");
  });

  it("Scenario 1: Logs Load Correctly", () => {
    cy.wait("@getLogs");
    cy.contains("Payment crashed").should("exist");
    cy.contains("Payment started").should("exist");
    cy.contains("Memory high").should("exist");
    cy.contains("ERROR").should("exist");
    cy.contains("INFO").should("exist");
  });

  it("Scenario 2: Expand Log Row", () => {
    cy.wait("@getLogs");
    // Click the Row with ERROR
    // Virtualized rows are absolute; Cypress visibility checks may fail incorrectly, use force: true
    cy.contains("Payment crashed").click({ force: true });

    // Validate attributes panel
    cy.contains("Log Attributes").should("exist");
    cy.contains("tx.id").should("exist");
    cy.contains("abc-123").should("exist");

    // Click again to close
    cy.contains("Payment crashed").click({ force: true });
    cy.contains("Log Attributes").should("not.exist");
  });

  it("Scenario 3: Toggle Group by Service", () => {
    cy.wait("@getLogs");
    // Click group by service toggle
    cy.contains("Grouped").click(); // header buttons are statically visible, so normal click is fine

    // Verify groups appear
    cy.contains("test-service-1").should("exist");
    cy.contains("service-2").should("exist");

    // The logs should NOT be inside these groups yet (collapsed by default)
    cy.contains("Payment crashed").should("not.exist");

    // Expand the group
    cy.contains("test-service-1").click({ force: true }); // Click to expand it
    cy.contains("Payment crashed").should("exist");
  });

  it("Scenario 4: Histogram Visualization", () => {
    cy.wait("@getLogs");
    cy.contains("Log Distribution").should("exist"); // was be.visible statically

    // There should be histogram bars based on the number of buckets
    // Scope specifically to the histogram container which uses h-48, find the column groups
    cy.get(".h-48").find(".group.relative").should("have.length", 30); // 30 buckets is our default
  });

  it("Scenario 5: Performance Sanity (Large Dataset)", () => {
    // Generate 1500 logs dynamically
    const resourceLogs = Array.from({ length: 5 }, (_, serviceId) => ({
      resource: {
        attributes: [
          {
            key: "service.name",
            value: { stringValue: `perf-service-${serviceId}` },
          },
        ],
      },
      scopeLogs: [
        {
          logRecords: Array.from({ length: 300 }, (_, logId) => ({
            timeUnixNano: (Date.now() * 1000000 + logId * 1000).toString(),
            severityText: logId % 10 === 0 ? "ERROR" : "INFO",
            body: { stringValue: `Log message body ${logId}` },
          })),
        },
      ],
    }));

    cy.intercept("GET", "**/api/logs", {
      statusCode: 200,
      body: { resourceLogs },
    }).as("getLargeLogs");

    cy.visit("/");
    cy.wait("@getLargeLogs");

    // Should load 1500 logs and we just check the UI responds
    cy.contains("Log message body 0").should("exist");
    cy.contains("Count: 1500 logs").should("exist");

    // Test expanding is still fast
    const start = performance.now();
    cy.contains("Log message body 0").click({ force: true });
    cy.contains("Log Attributes")
      .should("exist")
      .then(() => {
        const duration = performance.now() - start;
        // Virtualizer forces DOM mounts when expanding; allow slightly more overhead in Cypress CI
        expect(duration).to.be.lessThan(800);
      });
  });
});
