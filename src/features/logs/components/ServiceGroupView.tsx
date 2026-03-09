import { useState, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ServiceGroup } from '../utils/groupLogsByService';
import { LogEntry, LogLevel, LOG_LEVEL_STYLES } from '../types';
import { LogRow } from './LogRow';
import { ChevronRight, ChevronDown, Server } from 'lucide-react';

// Priority order: most severe first
const LEVEL_ORDER: LogLevel[] = [
    LogLevel.FATAL,
    LogLevel.ERROR,
    LogLevel.WARN,
    LogLevel.INFO,
    LogLevel.DEBUG,
    LogLevel.UNSPECIFIED,
];

interface ServiceGroupViewProps {
    groups: ServiceGroup[];
}

type VirtualItemData =
    | { type: 'header'; groupIndex: number; group: ServiceGroup; isExpanded: boolean }
    | { type: 'log'; logIndex: number; log: LogEntry; isLast: boolean };

const HEADER_ESTIMATE_PX = 60;
const ROW_ESTIMATE_PX = 44;
const OVERSCAN_COUNT = 30;

export function ServiceGroupView({ groups }: ServiceGroupViewProps) {
    // Track which groups are expanded by their serviceName (default to none expanded)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const toggleGroup = (serviceName: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(serviceName)) {
                next.delete(serviceName);
            } else {
                next.add(serviceName);
            }
            return next;
        });
    };

    // Flatten groups and their logs into a single 1D array based on expansion state
    const flattenedItems = useMemo<VirtualItemData[]>(() => {
        const items: VirtualItemData[] = [];

        groups.forEach((group, groupIndex) => {
            const isExpanded = expandedGroups.has(group.serviceName);

            items.push({
                type: 'header',
                groupIndex,
                group,
                isExpanded,
            });

            if (isExpanded) {
                group.logs.forEach((log, logIndex) => {
                    items.push({
                        type: 'log',
                        logIndex,
                        log,
                        isLast: logIndex === group.logs.length - 1
                    });
                });
            }
        });

        return items;
    }, [groups, expandedGroups]);

    const scrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: flattenedItems.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: (index) => {
            return flattenedItems[index].type === 'header' ? HEADER_ESTIMATE_PX : ROW_ESTIMATE_PX;
        },
        overscan: OVERSCAN_COUNT,
    });

    if (groups.length === 0) {
        return (
            <div className="border border-gray-800 rounded-lg p-12 text-center text-gray-500">
                No services found for this context.
            </div>
        );
    }

    return (
        <div className="border border-gray-800 rounded-lg overflow-hidden bg-black flex flex-col shadow-xl flex-1 min-h-0 h-full">
            {/* Table Header (shows when flattened to provide context for logs) */}
            <div className="hidden md:grid md:grid-cols-[140px_150px_1fr] lg:grid-cols-[150px_180px_1fr] gap-4 p-3 border-b border-gray-800 bg-gray-900/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="pl-6">Severity</div>
                <div>Timestamp</div>
                <div>Body</div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto bg-black"
                style={{ scrollbarGutter: 'stable' }}
            >
                <div
                    className="relative w-full"
                    style={{ height: `${virtualizer.getTotalSize()}px` }}
                >
                    {virtualizer.getVirtualItems().map(virtualRow => {
                        const item = flattenedItems[virtualRow.index];

                        return (
                            <div
                                key={virtualRow.key}
                                data-index={virtualRow.index}
                                ref={virtualizer.measureElement}
                                className="absolute top-0 left-0 w-full px-2"
                                style={{
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                {item.type === 'header' ? (
                                    <div className="pt-4 pb-2">
                                        <div
                                            className="flex items-center justify-between p-3 rounded-t-lg cursor-pointer hover:bg-gray-900 transition-colors bg-gray-900/60 border border-gray-800 shadow-sm"
                                            onClick={() => toggleGroup(item.group.serviceName)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                                                <div className="bg-indigo-500/10 p-1.5 rounded-md border border-indigo-500/20">
                                                    <Server className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <h3 className="font-semibold text-gray-200 text-base">{item.group.serviceName}</h3>

                                                <span className="flex items-center gap-1.5 ml-3 bg-black/40 px-2 py-0.5 rounded text-xs text-gray-400 border border-gray-700">
                                                    <span>{item.group.logs.length}</span> logs
                                                </span>

                                                <div className="flex gap-2 ml-2">
                                                    {LEVEL_ORDER.filter(level => (item.group.levelCounts[level] ?? 0) > 0).map(level => {
                                                        const count = item.group.levelCounts[level]!;
                                                        const styles = LOG_LEVEL_STYLES[level] ?? LOG_LEVEL_STYLES[LogLevel.UNSPECIFIED];

                                                        return (
                                                            <span key={level} className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium tracking-wide border ${styles.badge}`}>
                                                                <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                                                                {count} {level}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        {/* If collapsed, cap off the bottom border */}
                                        {!item.isExpanded && <div className="h-0 border-b border-gray-800/60 rounded-b-lg -mx-[1px]" />}
                                    </div>
                                ) : (
                                    <div className={`border-x border-gray-800/40 bg-black ${item.isLast ? 'rounded-b-lg border-b mb-4' : ''}`}>
                                        {/* Pass undefined for measureRef since the wrapper div handles measurement here */}
                                        <LogRow log={item.log} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
