'use client';

import { RefreshCw } from 'lucide-react';
import { LogTable } from './LogTable';
import { ServiceGroupView } from './ServiceGroupView';
import { LogEntry, ViewMode } from '../types';
import { ServiceGroup } from '../utils/groupLogsByService';

interface LogListSectionProps {
    logs: LogEntry[];
    groupedLogs: ServiceGroup[];
    isLoading: boolean;
    viewMode: ViewMode;
    onRefetch: () => void;
}

export function LogListSection({ logs, groupedLogs, isLoading, viewMode, onRefetch }: LogListSectionProps) {
    return (
        <section className="animate-fade-in-up flex-1 min-h-0 flex flex-col" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    {viewMode === ViewMode.FLAT ? 'Recent Logs' : 'Services'}
                </h2>
                <button onClick={onRefetch} title="Refresh Logs" className="text-gray-500 hover:text-gray-300 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {isLoading && logs.length === 0 ? (
                <div className="h-64 border border-gray-800 rounded-lg p-12 animate-pulse space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 bg-gray-800 rounded w-full"></div>
                    ))}
                </div>
            ) : (
                viewMode === ViewMode.FLAT ? <LogTable logs={logs} /> : <ServiceGroupView groups={groupedLogs} />
            )}
        </section>
    );
}
