"use client";

import { Histogram } from "./Histogram";
import { HistogramBucket } from "../types";

interface HistogramSectionProps {
  histogram: HistogramBucket[];
  logCount: number;
  isLoading: boolean;
}

export function HistogramSection({
  histogram,
  logCount,
  isLoading,
}: HistogramSectionProps) {
  return (
    <section className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Log Distribution
        </h2>
        <span className="text-xs text-gray-500 font-mono">
          Count: {logCount} logs
        </span>
      </div>
      {isLoading && logCount === 0 ? (
        <div className="w-full h-48 bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse flex items-center justify-center">
          <div className="text-gray-600">Processing bounds...</div>
        </div>
      ) : (
        <Histogram data={histogram} />
      )}
    </section>
  );
}
