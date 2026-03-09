import { LogEntry, LogLevel, LOG_LEVEL_STYLES } from '../types';
import { useState } from 'react';
import { ChevronRight, ChevronDown, AlertCircle, Info, FileWarning, SearchCode } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const ICON_CLASSNAME = "w-4 h-4";
const SEVERITY_ICONS: Record<LogLevel, React.ReactElement> = {
    [LogLevel.FATAL]: <AlertCircle className={ICON_CLASSNAME} />,
    [LogLevel.ERROR]: <AlertCircle className={ICON_CLASSNAME} />,
    [LogLevel.WARN]: <FileWarning className={ICON_CLASSNAME} />,
    [LogLevel.INFO]: <Info className={ICON_CLASSNAME} />,
    [LogLevel.DEBUG]: <SearchCode className={ICON_CLASSNAME} />,
    [LogLevel.UNSPECIFIED]: <SearchCode className={ICON_CLASSNAME} />,
};

interface LogRowProps {
    log: LogEntry;
    measureRef?: (node: HTMLDivElement | null) => void;
    virtualIndex?: number;
}

export function LogRow({ log, measureRef, virtualIndex }: LogRowProps) {
    const [expanded, setExpanded] = useState(false);

    const level = (log.severityText in LogLevel)
        ? log.severityText as LogLevel
        : LogLevel.UNSPECIFIED;

    const styles = LOG_LEVEL_STYLES[level];
    const icon = SEVERITY_ICONS[level];

    const timeStr = new Date(log.timestamp).toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3
    });

    return (
        <div ref={measureRef} data-testid="log-row" data-index={virtualIndex}>
            <div
                onClick={() => setExpanded(!expanded)}
                className="group grid grid-cols-[1fr_8fr] md:grid-cols-[140px_150px_1fr] lg:grid-cols-[150px_180px_1fr] gap-4 p-3 border-b border-gray-800/60 hover:bg-gray-800/40 cursor-pointer transition-colors items-start"
            >
                <div className="flex items-center gap-2">
                    {expanded ? <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                    <span className={twMerge('text-xs px-2 py-0.5 rounded border uppercase font-medium tracking-wide flex items-center gap-1.5', styles.badge)}>
                        <span className={styles.icon}>{icon}</span>
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
        </div>
    );
}
