import { LogEntry } from '../types';
import { LogRow } from './LogRow';

interface LogTableProps {
    logs: LogEntry[];
}

export function LogTable({ logs }: LogTableProps) {
    if (logs.length === 0) {
        return (
            <div className="border border-gray-800 rounded-lg p-12 text-center text-gray-500">
                No logs found for this context.
            </div>
        );
    }

    return (
        <div className="border border-gray-800 rounded-lg overflow-hidden bg-black flex flex-col shadow-xl">
            <div className="hidden md:grid md:grid-cols-[140px_150px_1fr] lg:grid-cols-[150px_180px_1fr] gap-4 p-3 border-b border-gray-800 bg-gray-900/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="pl-6">Severity</div>
                <div>Timestamp</div>
                <div>Body</div>
            </div>
            <div className="flex flex-col relative divide-y divide-transparent">
                {logs.map(log => (
                    <LogRow key={log.id} log={log} />
                ))}
            </div>
        </div>
    );
}
