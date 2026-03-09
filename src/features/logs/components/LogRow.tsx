import { LogEntry, LogLevel } from '../types';
import { useState } from 'react';
import { ChevronRight, ChevronDown, AlertCircle, Info, FileWarning, SearchCode } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface LogRowProps {
    log: LogEntry;
}

export function LogRow({ log }: LogRowProps) {
    const [expanded, setExpanded] = useState(false);

    const getSeverityIcon = (level: string) => {
        switch (level.toUpperCase()) {
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case LogLevel.WARN:
                return <FileWarning className="w-4 h-4 text-yellow-500" />;
            case LogLevel.INFO:
                return <Info className="w-4 h-4 text-blue-500" />;
            case LogLevel.DEBUG:
            default:
                return <SearchCode className="w-4 h-4 text-gray-400" />;
        }
    };

    const getSeverityColor = (level: string) => {
        switch (level.toUpperCase()) {
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                return 'text-red-500 bg-red-500/10 border-red-500/20';
            case LogLevel.WARN:
                return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case LogLevel.INFO:
                return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case LogLevel.DEBUG:
            default:
                return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const timeStr = new Date(log.timestamp).toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3
    });

    return (
        <>
            <div
                onClick={() => setExpanded(!expanded)}
                className="group grid grid-cols-[1fr_8fr] md:grid-cols-[140px_150px_1fr] lg:grid-cols-[150px_180px_1fr] gap-4 p-3 border-b border-gray-800/60 hover:bg-gray-800/40 cursor-pointer transition-colors items-start"
            >
                <div className="flex items-center gap-2">
                    {expanded ? <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                    <span className={twMerge('text-xs px-2 py-0.5 rounded border uppercase font-medium tracking-wide flex items-center gap-1.5', getSeverityColor(log.severityText))}>
                        {getSeverityIcon(log.severityText)}
                        <span className="truncate">{log.severityText || 'UNKNOWN'}</span>
                    </span>
                </div>
                <div className="text-gray-400 text-sm font-mono self-center hidden md:block">{timeStr}</div>
                <div className="text-gray-200 text-sm font-mono truncate">{log.body}</div>
            </div>

            {expanded && (
                <div className="bg-gray-900 border-b border-gray-800/60 p-4 pl-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Resource Metadata */}
                        <div>
                            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Resource Attributes</h4>
                            <div className="space-y-1">
                                <div className="grid grid-cols-[120px_1fr] text-sm">
                                    <span className="text-gray-500">service.name</span>
                                    <span className="text-gray-300 font-mono">{log.serviceName}</span>
                                </div>
                                {log.serviceVersion && (
                                    <div className="grid grid-cols-[120px_1fr] text-sm">
                                        <span className="text-gray-500">service.version</span>
                                        <span className="text-gray-300 font-mono">{log.serviceVersion}</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-[120px_1fr] text-sm mt-1">
                                    <span className="text-gray-500">time_unix_nano</span>
                                    <span className="text-gray-300 font-mono">{log.timeUnixNano}</span>
                                </div>
                            </div>
                        </div>

                        {/* Log Attributes */}
                        <div>
                            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Log Attributes</h4>
                            {Object.keys(log.attributes).length > 0 ? (
                                <div className="space-y-1 bg-black/20 rounded p-2">
                                    {Object.entries(log.attributes).map(([key, value]) => (
                                        <div key={key} className="grid grid-cols-[140px_1fr] text-sm">
                                            <span className="text-gray-500 font-mono text-xs">{key}</span>
                                            <span className="text-indigo-300 font-mono text-xs break-all">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-600 text-sm italic">No additional attributes</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
