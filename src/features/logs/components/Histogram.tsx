import { HistogramBucket, LogLevel, LOG_LEVEL_STYLES } from '../types';
import { useMemo } from 'react';

interface HistogramProps {
    data: HistogramBucket[];
}

// Priority order: most severe first
const LEVEL_ORDER: LogLevel[] = [
    LogLevel.FATAL,
    LogLevel.ERROR,
    LogLevel.WARN,
    LogLevel.INFO,
    LogLevel.DEBUG,
    LogLevel.UNSPECIFIED,
];

export function Histogram({ data }: HistogramProps) {
    const maxCount = useMemo(
        () => data.reduce((max, bucket) => Math.max(max, bucket.count), 0),
        [data]
    );

    return (
        <div className="w-full h-48 bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col justify-end overflow-visible">
            <div className="flex h-full items-end gap-1">
                {data.map((bucket, index) => {
                    const heightPercent = maxCount === 0 ? 0 : (bucket.count / maxCount) * 100;
                    const totalHeight = Math.max(1, heightPercent);

                    // Build stacked segments in priority order
                    const segments = LEVEL_ORDER
                        .filter(level => (bucket.levelCounts[level] ?? 0) > 0)
                        .map(level => ({
                            level,
                            count: bucket.levelCounts[level]!,
                            pct: (bucket.levelCounts[level]! / bucket.count) * totalHeight,
                        }));

                    // If no level data, fall back to a single gray bar
                    const hasSegments = segments.length > 0;

                    return (
                        <div key={index} className="flex flex-col justify-end flex-1 h-full">
                            <div
                                className="w-full group relative min-h-[2px] transition-[height] duration-300"
                                style={{
                                    height: `${totalHeight}%`,
                                    opacity: bucket.count === 0 ? 0.15 : 1,
                                }}
                            >
                                {/* Segments clipped in their own rounded overflow-hidden box */}
                                <div className="w-full h-full overflow-hidden flex flex-col justify-end">
                                    {hasSegments ? (
                                        [...segments].reverse().map(({ level, pct }) => {
                                            const styles = LOG_LEVEL_STYLES[level] ?? LOG_LEVEL_STYLES[LogLevel.UNSPECIFIED];
                                            return (
                                                <div
                                                    key={level}
                                                    className={`w-full ${styles.bar} ${styles.hover} transition-[height,colors] duration-300`}
                                                    style={{ height: `${(pct / totalHeight) * 100}%` }}
                                                />
                                            );
                                        })
                                    ) : (
                                        <div className="w-full h-full bg-violet-900" />
                                    )}
                                </div>

                                {/* Tooltip — sibling to segments, not clipped by overflow-hidden */}
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 text-xs text-white p-2 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none transition-opacity">
                                    <div className="text-gray-400 mb-1">{new Date(bucket.timestamp).toLocaleTimeString()}</div>
                                    <div className="font-semibold mb-1">Total: {bucket.count}</div>
                                    {LEVEL_ORDER.filter(l => (bucket.levelCounts[l] ?? 0) > 0).map(level => (
                                        <div key={level} className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${LOG_LEVEL_STYLES[level]?.dot}`} />
                                            <span className={LOG_LEVEL_STYLES[level]?.text}>{level}: {bucket.levelCounts[level]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{data.length > 0 ? new Date(data[0]!.timestamp).toLocaleTimeString() : ''}</span>
                <span>{data.length > 0 ? new Date(data[data.length - 1]!.timestamp).toLocaleTimeString() : ''}</span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3 border-t border-gray-800">
                {LEVEL_ORDER.filter(level =>
                    data.some(bucket => (bucket.levelCounts[level] ?? 0) > 0)
                ).map(level => (
                    <div key={level} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-sm ${LOG_LEVEL_STYLES[level]?.dot}`} />
                        <span className={`text-xs font-medium ${LOG_LEVEL_STYLES[level]?.text}`}>{level}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
