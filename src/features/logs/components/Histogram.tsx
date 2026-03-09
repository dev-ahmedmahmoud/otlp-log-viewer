import { HistogramBucket } from '../types';
import { useMemo } from 'react';

interface HistogramProps {
    data: HistogramBucket[];
}

export function Histogram({ data }: HistogramProps) {
    const maxCount = useMemo(() => {
        return data.reduce((max, bucket) => Math.max(max, bucket.count), 0);
    }, [data]);

    return (
        <div className="w-full h-48 bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col justify-end">
            <div className="flex h-full items-end gap-1">
                {data.map((bucket, index) => {
                    const heightPercent = maxCount === 0 ? 0 : (bucket.count / maxCount) * 100;

                    return (
                        <div
                            key={index}
                            className="flex flex-col justify-end flex-1 group relative h-full"
                        >
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-xs text-white p-2 rounded shadow-xl whitespace-nowrap z-10 pointer-events-none transition-opacity">
                                <div>Time: {new Date(bucket.timestamp).toLocaleTimeString()}</div>
                                <div>Count: {bucket.count}</div>
                                {Object.entries(bucket.levelCounts).map(([lvl, cnt]) => (
                                    <div key={lvl} className="text-gray-400 capitalize">{lvl.toLowerCase()}: {cnt}</div>
                                ))}
                            </div>

                            {/* Bar */}
                            <div
                                className="w-full bg-blue-500 rounded-sm min-h-[2px] transition-all duration-300 hover:bg-blue-400"
                                style={{ height: `${Math.max(1, heightPercent)}%`, opacity: bucket.count === 0 ? 0.1 : 1 }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                {/* Time bounds */}
                <span>{data.length > 0 ? new Date(data[0]!.timestamp).toLocaleTimeString() : ''}</span>
                <span>{data.length > 0 ? new Date(data[data.length - 1]!.timestamp).toLocaleTimeString() : ''}</span>
            </div>
        </div>
    );
}
