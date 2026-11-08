import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Activity, TrendingUp, Zap, AlertCircle } from 'lucide-react';

export interface SpeedHistoryPoint {
  timestamp: number;
  secondsAgo: number;
  speed: number;
  speedLimit: number;
}

interface SpeedTelemetryChartProps {
  history: SpeedHistoryPoint[];
  currentSpeed: number;
  currentSpeedLimit: number;
  unit: 'km/h' | 'mph';
}

export const SpeedTelemetryChart: React.FC<SpeedTelemetryChartProps> = ({
  history,
  currentSpeed,
  currentSpeedLimit,
  unit
}) => {
  const convertedHistory = useMemo(() => {
    const isMph = unit === 'mph';
    const factor = isMph ? 0.621371 : 1;

    return history.map((pt) => ({
      ...pt,
      displaySpeed: Math.round(pt.speed * factor),
      displayLimit: Math.round(pt.speedLimit * factor),
      label: pt.secondsAgo === 0 ? 'Now' : `-${pt.secondsAgo}s`
    }));
  }, [history, unit]);

  // Telemetry statistics
  const stats = useMemo(() => {
    if (history.length === 0) {
      return { avg: 0, peak: 0, overspeedSeconds: 0 };
    }

    let totalSpeed = 0;
    let peak = 0;
    let overspeedCount = 0;

    history.forEach((pt) => {
      totalSpeed += pt.speed;
      if (pt.speed > peak) peak = pt.speed;
      if (pt.speed > pt.speedLimit) overspeedCount++;
    });

    const isMph = unit === 'mph';
    const factor = isMph ? 0.621371 : 1;

    return {
      avg: Math.round((totalSpeed / history.length) * factor),
      peak: Math.round(peak * factor),
      overspeedSeconds: overspeedCount
    };
  }, [history, unit]);

  const displayLimit = unit === 'mph' ? Math.round(currentSpeedLimit * 0.621371) : currentSpeedLimit;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100 flex flex-col gap-3">
      {/* Header and Telemetry Metrics */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            60s Speed Telemetry
          </span>
        </div>

        {/* Clean unboxed metadata with separators */}
        <div className="flex items-center gap-2 text-[11px] font-mono-nums text-slate-400">
          <span>
            Avg <strong className="text-white">{stats.avg}</strong> {unit}
          </span>
          <span className="text-slate-600">·</span>
          <span>
            Peak <strong className="text-cyan-400">{stats.peak}</strong> {unit}
          </span>
          {stats.overspeedSeconds > 0 && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {stats.overspeedSeconds}s over
              </span>
            </>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-32 relative">
        {convertedHistory.length < 2 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-mono">
            Recording speed profile... ({convertedHistory.length}/60s)
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={convertedHistory}
              margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval={Math.floor(convertedHistory.length / 5)}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                domain={[0, (dataMax: number) => Math.max(120, Math.ceil((dataMax + 15) / 20) * 20)]}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isOver = data.displaySpeed > data.displayLimit;
                    return (
                      <div className="bg-slate-950/95 border border-slate-700 p-2 rounded-lg shadow-xl text-xs font-mono">
                        <div className="text-slate-400 mb-1">T {data.label}</div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-300">Speed:</span>
                          <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-cyan-400'}`}>
                            {data.displaySpeed} {unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
                          <span>Limit:</span>
                          <span>{data.displayLimit} {unit}</span>
                        </div>
                        {isOver && (
                          <div className="text-rose-400 text-[10px] font-semibold mt-1">
                            +{data.displaySpeed - data.displayLimit} {unit} overspeeding
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Dynamic Speed Limit Reference Line */}
              <ReferenceLine
                y={displayLimit}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{
                  value: `Limit: ${displayLimit}`,
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
              {/* Vehicle Speed Line */}
              <Line
                type="monotone"
                dataKey="displaySpeed"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
            <span className="text-slate-400">Simulated Velocity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 border-dashed rounded-full" />
            <span className="text-slate-400">Zone Limit ({displayLimit} {unit})</span>
          </div>
        </div>
        <span>Last 60 Seconds</span>
      </div>
    </div>
  );
};
