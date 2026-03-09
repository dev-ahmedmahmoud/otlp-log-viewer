export enum LogLevel {
  ERROR = "ERROR",
  FATAL = "FATAL",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
  UNSPECIFIED = "UNSPECIFIED",
}

export enum ViewMode {
  FLAT = "flat",
  GROUPED = "grouped",
}

export interface LogLevelStyle {
  hex: string; // hex color for charting libs (Recharts)
  dot: string; // bg-* class for legend/tooltip dot
  text: string; // text-* class for badge text and tooltip labels
  badge: string; // full badge class: text + bg + border for LogRow pill
  icon: string; // text-* class for the icon inside the badge
}

export const LOG_LEVEL_STYLES: Record<LogLevel, LogLevelStyle> = {
  [LogLevel.FATAL]: {
    hex: "#b91c1c",
    dot: "bg-red-700",
    text: "text-red-400",
    badge: "text-red-500 bg-red-500/10 border-red-500/20",
    icon: "text-red-500",
  },
  [LogLevel.ERROR]: {
    hex: "#ef4444",
    dot: "bg-red-500",
    text: "text-red-400",
    badge: "text-red-500 bg-red-500/10 border-red-500/20",
    icon: "text-red-500",
  },
  [LogLevel.WARN]: {
    hex: "#eab308",
    dot: "bg-yellow-500",
    text: "text-yellow-400",
    badge: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    icon: "text-yellow-500",
  },
  [LogLevel.INFO]: {
    hex: "#3b82f6",
    dot: "bg-blue-500",
    text: "text-blue-400",
    badge: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    icon: "text-blue-500",
  },
  [LogLevel.DEBUG]: {
    hex: "#14b8a6",
    dot: "bg-teal-500",
    text: "text-teal-400",
    badge: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    icon: "text-teal-400",
  },
  [LogLevel.UNSPECIFIED]: {
    hex: "#8b5cf6",
    dot: "bg-violet-500",
    text: "text-violet-400",
    badge: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    icon: "text-violet-400",
  },
};

export interface LogEntry {
  id: string;
  timestamp: string; // ISO String for display
  timeUnixNano: string; // The original nanosecond precision
  severityText: LogLevel;
  severityNumber: number;
  body: string;
  attributes: Record<string, string | number | boolean>;
  serviceName: string;
  serviceNamespace: string;
  serviceInstanceId: string;
  serviceVersion: string;
}

export interface HistogramBucket {
  timestamp: number;
  count: number;
  levelCounts: Record<string, number>;
}
