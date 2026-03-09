import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LogDashboard } from '../components/LogDashboard';
import { mockOtlpResponse } from '../../../mocks/handlers';

describe('LogDashboard Component Integration', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders loading state initially and then shows the dashboard', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => mockOtlpResponse,
        } as Response);

        render(<LogDashboard />);

        // Check loading text 
        expect(screen.getByText(/Fetching/i)).toBeInTheDocument();

        // fetch mock will return 3 logs, 2 services
        await waitFor(() => {
            expect(screen.getByText('test-api-service')).toBeInTheDocument();
            expect(screen.getByText('checkout-service')).toBeInTheDocument();
            expect(screen.getByText(/Count: 3 logs/i)).toBeInTheDocument();
        }, { timeout: 4000 });
    });

    it('handles API errors gracefully', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        } as Response);

        render(<LogDashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Error loading logs/i)).toBeInTheDocument();
            expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
        });
    });
});
