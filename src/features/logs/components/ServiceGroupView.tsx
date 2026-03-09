import { ServiceGroup } from '../utils/groupLogsByService';
import { LogTable } from './LogTable';
import { useState } from 'react';
import { ChevronRight, ChevronDown, Server, AlertCircle } from 'lucide-react';

interface ServiceGroupViewProps {
    groups: ServiceGroup[];
}

export function ServiceGroupView({ groups }: ServiceGroupViewProps) {
    if (groups.length === 0) {
        return (
            <div className="border border-gray-800 rounded-lg p-12 text-center text-gray-500">
                No services found for this context.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {groups.map(group => (
                <ServiceGroupSection key={group.serviceName} group={group} />
            ))}
        </div>
    );
}

function ServiceGroupSection({ group }: { group: ServiceGroup }) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-950 shadow-md">
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-900 transition-colors bg-gray-900/40 border-b border-gray-800"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    <div className="bg-indigo-500/10 p-2 rounded-md border border-indigo-500/20">
                        <Server className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h3 className="font-semibold text-gray-200 text-lg">{group.serviceName}</h3>

                    <span className="flex items-center gap-1.5 ml-4 bg-gray-800/80 px-2 py-0.5 rounded text-xs text-gray-400 border border-gray-700">
                        <span>{group.logs.length}</span> logs
                    </span>

                    {group.errorCount > 0 && (
                        <span className="flex items-center gap-1.5 ml-2 bg-red-500/10 px-2 py-0.5 rounded text-xs text-red-500 border border-red-500/20 font-medium tracking-wide">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {group.errorCount} ERRORS
                        </span>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="p-4 bg-black">
                    <LogTable logs={group.logs} />
                </div>
            )}
        </div>
    );
}
