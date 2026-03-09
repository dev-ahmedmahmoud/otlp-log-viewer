import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogTable } from '../components/LogTable';
import { LogEntry, LogLevel } from '../types';

/**
 * TanStack Virtual needs a scroll element with measurable dimensions.
 * JSDOM elements have 0 height by default, so the virtualizer renders nothing.
 * We mock getBoundingClientRect and scrollHeight/offsetHeight to simulate a
 * visible container.
 */
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

    // Mock scrollHeight/offsetHeight for the scroll container
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        value: 600,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        value: 600,
    });
});

afterAll(() => {
    Element.prototype.getBoundingClientRect = originalGetBCR;
});

describe('LogTable Component', () => {
    const mockLogs: LogEntry[] = [
        {
            id: 'log1',
            timestamp: '2024-01-31T10:00:00Z',
            timeUnixNano: '1738321289139931000',
            severityText: LogLevel.ERROR,
            severityNumber: 17,
            body: 'Message Test body here',
            attributes: { 'test.attr': 'val' },
            serviceName: 'test-service',
            serviceNamespace: '',
            serviceInstanceId: '',
            serviceVersion: '1.0'
        }
    ];

    it('renders empty state correctly', () => {
        render(<LogTable logs={[]} />);
        expect(screen.getByText(/No logs found/i)).toBeInTheDocument();
    });

    it('renders table rows and can expand attributes', () => {
        render(<LogTable logs={mockLogs} />);

        // Check initial render
        expect(screen.getByText('ERROR')).toBeInTheDocument();
        expect(screen.getByText(/Message Test body here/i)).toBeInTheDocument();

        // Check attribute NOT in doc initially
        expect(screen.queryByText('test.attr')).not.toBeInTheDocument();

        // Click row to expand
        const row = screen.getByText('ERROR').closest('div[class*="group grid"]');
        fireEvent.click(row!);

        // Should now see attributes
        expect(screen.getByText('test.attr')).toBeInTheDocument();
        expect(screen.getByText('val')).toBeInTheDocument();
        expect(screen.getByText('test-service')).toBeInTheDocument(); // Service name attribute
    });
});
