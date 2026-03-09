'use client';

import { useLogs } from '../hooks/useLogs';
import { LogTable } from './LogTable';
import { ServiceGroupView } from './ServiceGroupView';
import { Histogram } from './Histogram';
import { useState } from 'react';
import Image from 'next/image';
import { LayoutList, Server, RefreshCw } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ViewMode } from '../types';

export function LogDashboard() {
    const { logs, histogram, groupedLogs, isLoading, error, refetch } = useLogs();
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.FLAT);

    if (error) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex flex-col items-center justify-center text-red-400">
                    <h2 className="text-xl font-bold mb-2">Error loading logs</h2>
                    <p className="mb-4">{error.message}</p>
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/50 transition duration-200"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans pb-20">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-950 px-6 py-4 sticky top-0 z-20 shadow-xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/icon.png" alt="Logo" width={32} height={32} className="w-8 h-8" priority />
                        <h1 className="text-xl font-bold text-indigo-500 uppercase tracking-wide">Logy</h1>
                        {isLoading && (
                            <span className="ml-4 flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Fetching
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
                        <button
                            onClick={() => setViewMode(ViewMode.FLAT)}
                            className={twMerge(
                                "flex items-center gap-2 px-3 py-1.5 rounded transition duration-200 text-sm font-medium",
                                viewMode === ViewMode.FLAT ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                            )}
                        >
                            <LayoutList className="w-4 h-4" />
                            Flat
                        </button>
                        <button
                            onClick={() => setViewMode(ViewMode.GROUPED)}
                            className={twMerge(
                                "flex items-center gap-2 px-3 py-1.5 rounded transition duration-200 text-sm font-medium",
                                viewMode === ViewMode.GROUPED ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                            )}
                        >
                            <Server className="w-4 h-4" />
                            Grouped
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Histogram Section */}
                <section className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Log Distribution</h2>
                        <span className="text-xs text-gray-500 font-mono">Count: {logs.length} logs</span>
                    </div>
                    {isLoading && logs.length === 0 ? (
                        <div className="w-full h-48 bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse flex items-center justify-center">
                            <div className="text-gray-600">Processing bounds...</div>
                        </div>
                    ) : (
                        <Histogram data={histogram} />
                    )}
                </section>

                {/* List Section */}
                <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            {viewMode === ViewMode.FLAT ? 'Recent Logs' : 'Services'}
                        </h2>
                        <button onClick={() => refetch()} title="Refresh Logs" className="text-gray-500 hover:text-gray-300 transition-colors">
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

            </main>
        </div>
    );
}
