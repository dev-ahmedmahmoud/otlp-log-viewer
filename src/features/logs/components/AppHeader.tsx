'use client';

import Image from 'next/image';
import { LayoutList, Server, RefreshCw } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ViewMode } from '../types';

interface AppHeaderProps {
    isLoading: boolean;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export function AppHeader({ isLoading, viewMode, onViewModeChange }: AppHeaderProps) {
    return (
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
                        onClick={() => onViewModeChange(ViewMode.FLAT)}
                        className={twMerge(
                            "flex items-center gap-2 px-3 py-1.5 rounded transition duration-200 text-sm font-medium",
                            viewMode === ViewMode.FLAT ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                        )}
                    >
                        <LayoutList className="w-4 h-4" />
                        Flat
                    </button>
                    <button
                        onClick={() => onViewModeChange(ViewMode.GROUPED)}
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
    );
}
