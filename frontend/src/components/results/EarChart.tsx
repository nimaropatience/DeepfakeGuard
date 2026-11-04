import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { EyeMetrics } from "@/lib/types";

export function EarChart({ metrics }: { metrics: EyeMetrics }) {
  // Build chart data from the 16-frame EAR arrays
  const data = metrics.ear_left.map((_, i) => ({
    frame: i + 1,
    "Left EAR": metrics.ear_left[i],
    "Right EAR": metrics.ear_right[i],
    "L-R Diff": metrics.lr_difference[i],
  }));

  const verdictColor = metrics.eye_verdict.startsWith("Suspicious")
    ? "bg-fake-red-light text-fake-red"
    : metrics.eye_verdict === "Borderline"
      ? "bg-amber-light text-amber"
      : "bg-real-green-light text-real-green";

  return (
    <div className="bg-card rounded-card p-7 shadow-sm">
      <h3 className="text-base font-semibold mb-1">Eye-movement analysis</h3>
      <p className="text-sm text-secondary mb-3 leading-relaxed">
        Eye Aspect Ratio (EAR) measures how open the eyes are across the 16 sampled frames.
        Deepfakes often show abnormally low blink variability.
      </p>

      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-5 ${verdictColor}`}>
        {metrics.eye_verdict}
      </span>

      {/* Chart */}
      <div className="bg-bg rounded-card-sm p-4 mb-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="frame"
              tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
              label={{ value: "Frame", position: "insideBottom", offset: -5, fontSize: 11 }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
              domain={[0, 0.4]}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line
              type="monotone"
              dataKey="Left EAR"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Right EAR"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              strokeOpacity={0.4}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="L-R Diff"
              stroke="var(--color-amber)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg rounded-card-sm p-3 text-center">
          <p className="font-mono text-xl font-bold text-accent">{metrics.ear_std_dev}</p>
          <p className="text-[11px] uppercase tracking-wider text-tertiary mt-0.5">EAR Std Dev</p>
        </div>
        <div className="bg-bg rounded-card-sm p-3 text-center">
          <p className="font-mono text-xl font-bold text-accent">{metrics.ear_range}</p>
          <p className="text-[11px] uppercase tracking-wider text-tertiary mt-0.5">EAR Range</p>
        </div>
        <div className="bg-bg rounded-card-sm p-3 text-center">
          <p className="font-mono text-xl font-bold text-accent">{metrics.blink_count}</p>
          <p className="text-[11px] uppercase tracking-wider text-tertiary mt-0.5">Blinks</p>
        </div>
      </div>
    </div>
  );
}
