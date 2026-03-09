import { HistogramBucket, LogLevel, LOG_LEVEL_STYLES } from "../types";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HistogramProps {
  data: HistogramBucket[];
}

// Priority order: most severe first
const LEVEL_ORDER: LogLevel[] = [
  LogLevel.FATAL,
  LogLevel.ERROR,
  LogLevel.WARN,
  LogLevel.INFO,
  LogLevel.DEBUG,
  LogLevel.UNSPECIFIED,
];

export function Histogram({ data }: HistogramProps) {
  const chartData = useMemo(() => {
    return data.map((bucket) => {
      const entry: any = {
        timestamp: bucket.timestamp,
        formattedTime: new Date(bucket.timestamp).toLocaleTimeString(),
        total: bucket.count,
      };

      LEVEL_ORDER.forEach((level) => {
        entry[level] = bucket.levelCounts[level] || 0;
      });

      return entry;
    });
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-gray-900 border border-gray-700 text-xs text-white p-2 rounded shadow-xl whitespace-nowrap z-50">
          <div className="text-gray-400 mb-1">{label}</div>
          <div className="font-semibold mb-1 border-b border-gray-800 pb-1">
            Total Logs: {total}
          </div>
          <div className="space-y-1 mt-1">
            {[...payload].reverse().map((entry: any) => {
              if (entry.value === 0) return null;
              const level = entry.dataKey as LogLevel;
              const styles = LOG_LEVEL_STYLES[level];
              return (
                <div key={level} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${styles?.dot}`} />
                  <span className={styles?.text}>
                    {level}: {entry.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-48 bg-gray-900 border border-gray-800 rounded-lg p-4 pb-0 flex flex-col shadow-inner">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={0}
          >
            <CartesianGrid
              vertical={false}
              stroke="#374151"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="formattedTime"
              hide={true} // We keep the custom labels below for better control
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1f2937", opacity: 0.4 }} />
            {LEVEL_ORDER.slice().reverse().map((level) => (
              <Bar
                key={level}
                dataKey={level}
                stackId="a"
                fill={LOG_LEVEL_STYLES[level]?.hex || "#8b5cf6"}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between text-[10px] text-gray-500 px-2 py-1 uppercase tracking-tighter">
        <span>{data.length > 0 ? new Date(data[0]!.timestamp).toLocaleTimeString() : ""}</span>
        <span className="text-gray-600">Time Distribution</span>
        <span>{data.length > 0 ? new Date(data[data.length - 1]!.timestamp).toLocaleTimeString() : ""}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 border-t border-gray-800">
        {LEVEL_ORDER.filter((level) =>
          data.some((bucket) => (bucket.levelCounts[level] ?? 0) > 0),
        ).map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-sm ${LOG_LEVEL_STYLES[level]?.dot}`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${LOG_LEVEL_STYLES[level]?.text}`}
            >
              {level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
