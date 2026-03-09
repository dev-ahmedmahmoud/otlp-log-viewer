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
                            attributes: [{ key: 'service.name', value: { stringValue: 'test-service-1' } }],
                        },
                        scopeLogs: [
                            {
                                logRecords: [
                                    {
                                        timeUnixNano: (Date.now() * 1000000).toString(),
                                        severityText: 'ERROR',
                                        body: { stringValue: 'Payment crashed' },
                                        attributes: [{ key: 'tx.id', value: { stringValue: 'abc-123' } }],
                                    },
                                    {
                                        timeUnixNano: ((Date.now() + 1000) * 1000000).toString(),
                                        severityText: 'INFO',
                                        body: { stringValue: 'Payment started' },
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        resource: {
                            attributes: [{ key: 'service.name', value: { stringValue: 'service-2' } }],
                        },
                        scopeLogs: [
                            {
                                logRecords: [
                                    {
                                        timeUnixNano: ((Date.now() + 2000) * 1000000).toString(),
                                        severityText: 'WARN',
                                        body: { stringValue: 'Memory high' },
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }).as("getLogs");

        cy.visit("/");
    });

    it("Scenario 1: Logs Load Correctly", () => {
        cy.wait("@getLogs");
        cy.contains("Payment crashed").should("be.visible");
        cy.contains("Payment started").should("be.visible");
        cy.contains("Memory high").should("be.visible");
        cy.contains("ERROR").should("be.visible");
        cy.contains("INFO").should("be.visible");
    });

    it("Scenario 2: Expand Log Row", () => {
        cy.wait("@getLogs");
        // Click the Row with ERROR
        cy.contains("Payment crashed").click();

        // Validate attributes panel
        cy.contains("Log Attributes").should("be.visible");
        cy.contains("tx.id").should("be.visible");
        cy.contains("abc-123").should("be.visible");

        // Click again to close
        cy.contains("Payment crashed").click();
        cy.contains("Log Attributes").should("not.exist");
    });

    it("Scenario 3: Toggle Group by Service", () => {
        cy.wait("@getLogs");
        // Click group by service toggle
        cy.contains('Grouped').click();

        // Verify groups appear
        cy.contains("test-service-1").should("be.visible");
        cy.contains("service-2").should("be.visible");

        // The logs should be inside these groups
        cy.contains("Payment crashed").should("be.visible");

        // Collapse
        cy.contains("test-service-1").click(); // Click to collapse it
        cy.contains("Payment crashed").should("not.exist");
    });

    it("Scenario 4: Histogram Visualization", () => {
        cy.wait("@getLogs");
        cy.contains("Log Distribution").should("be.visible");

        // There should be histogram bars based on the number of buckets
        cy.get(".bg-blue-500.rounded-sm").should('have.length', 30); // 30 buckets is our default
    });

    it("Scenario 5: Performance Sanity (Large Dataset)", () => {
        // Generate 1500 logs dynamically
        const resourceLogs = Array.from({ length: 5 }, (_, serviceId) => ({
            resource: { attributes: [{ key: 'service.name', value: { stringValue: `perf-service-${serviceId}` } }] },
            scopeLogs: [{
                logRecords: Array.from({ length: 300 }, (_, logId) => ({
                    timeUnixNano: (Date.now() * 1000000 + logId * 1000).toString(),
                    severityText: logId % 10 === 0 ? 'ERROR' : 'INFO',
                    body: { stringValue: `Log message body ${logId}` }
                }))
            }]
        }));

        cy.intercept("GET", "**/api/logs", {
            statusCode: 200,
            body: { resourceLogs }
        }).as("getLargeLogs");

        cy.visit("/");
        cy.wait("@getLargeLogs");

        // Should load 1500 logs and we just check the UI responds
        cy.contains("Log message body 0").should("be.visible");
        cy.contains("Count: 1500 logs").should("be.visible");

        // Test expanding is still fast
        const start = performance.now();
        cy.contains("Log message body 0").click();
        cy.contains("Log Attributes").should('exist').then(() => {
            const duration = performance.now() - start;
            expect(duration).to.be.lessThan(500); // UI re-render should be quick due to React memoization
        });
    });
});
