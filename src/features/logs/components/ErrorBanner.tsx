"use client";

import { RefreshCw } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex flex-col items-center justify-center text-red-400">
        <h2 className="text-xl font-bold mb-2">Error loading logs</h2>
        <p className="mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/50 transition duration-200"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );
}
