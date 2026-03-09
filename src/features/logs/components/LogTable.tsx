'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { LogEntry } from '../types';
import { LogRow } from './LogRow';

const ROW_ESTIMATE_PX = 44;
const OVERSCAN_COUNT = 20;

interface LogTableProps {
    logs: LogEntry[];
}

export function LogTable({ logs }: LogTableProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: logs.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => ROW_ESTIMATE_PX,
        overscan: OVERSCAN_COUNT,
    });

    if (logs.length === 0) {
        return (
            <div className="border border-gray-800 rounded-lg p-12 text-center text-gray-500">
                No logs found for this context.
            </div>
        );
    }

    return (
        <div className="border border-gray-800 rounded-lg overflow-hidden bg-black flex flex-col shadow-xl flex-1 min-h-0 h-full">
            <div className="hidden md:grid md:grid-cols-[140px_150px_1fr] lg:grid-cols-[150px_180px_1fr] gap-4 p-3 border-b border-gray-800 bg-gray-900/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="pl-6">Severity</div>
                <div>Timestamp</div>
                <div>Body</div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto"
            >
                <div
                    className="relative w-full"
                    style={{ height: `${virtualizer.getTotalSize()}px` }}
                >
                    {virtualizer.getVirtualItems().map(virtualRow => (
                        <div
                            key={logs[virtualRow.index].id}
                            className="absolute top-0 left-0 w-full"
                            style={{ transform: `translateY(${virtualRow.start}px)` }}
                        >
                            <LogRow
                                log={logs[virtualRow.index]}
                                measureRef={virtualizer.measureElement}
                                virtualIndex={virtualRow.index}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
