"use client";

import { useState } from "react";
import { useLogs } from "../hooks/useLogs";
import { ViewMode } from "../types";
import { AppHeader } from "./AppHeader";
import { HistogramSection } from "./HistogramSection";
import { LogListSection } from "./LogListSection";
import { ErrorBanner } from "./ErrorBanner";

export function LogDashboard() {
  const { logs, histogram, groupedLogs, isLoading, error, refetch } = useLogs();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.FLAT);

  if (error) {
    return <ErrorBanner message={error.message} onRetry={refetch} />;
  }

  return (
    <div className="h-screen bg-black text-gray-300 font-sans overflow-hidden flex flex-col">
      <AppHeader
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 flex-1 min-h-0 overflow-hidden flex flex-col w-full">
        <HistogramSection
          histogram={histogram}
          logCount={logs.length}
          isLoading={isLoading}
        />
        <LogListSection
          logs={logs}
          groupedLogs={groupedLogs}
          isLoading={isLoading}
          viewMode={viewMode}
          onRefetch={refetch}
        />
      </main>
    </div>
  );
}
