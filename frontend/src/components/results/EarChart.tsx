import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { EyeMetrics } from "@/lib/types";

const LEFT = "var(--color-accent)";
const RIGHT = "var(--color-sage)";
const DIFF = "var(--color-amber)";

export function EarChart({ metrics }: { metrics: EyeMetrics }) {
  // Build chart data from the 16-frame EAR arrays
  const data = metrics.ear_left.map((_, i) => ({
    frame: i + 1,
    "Left EAR": metrics.ear_left[i],
    "Right EAR": metrics.ear_right[i],
    "L-R diff": metrics.lr_difference[i],
  }));

  const verdictColor = metrics.eye_verdict.startsWith("Suspicious")
    ? "bg-fake-red-light text-fake-red"
    : metrics.eye_verdict === "Borderline"
      ? "bg-amber-light text-amber"
      : "bg-real-green-light text-real-green";

  const tiles = [
    { label: "EAR std dev", value: metrics.ear_std_dev.toFixed(3) },
    { label: "EAR range", value: metrics.ear_range.toFixed(3) },
    { label: "Blinks", value: metrics.blink_count.toString() },
  ];

  const tick = {
    fontSize: 11,
    fill: "var(--color-text-tertiary)",
    fontFamily: "JetBrains Mono, monospace",
  };

  return (
    <div className="bg-card rounded-card p-7 sm:p-10 shadow-sm">
      <h3 className="text-xl font-semibold mb-2">Eye-movement analysis</h3>
      <p className="text-[15px] text-secondary mb-5 leading-relaxed">
        Eye Aspect Ratio (EAR) measures how open the eyes are across the 16 sampled frames.
        Deepfakes often show abnormally low blink variability.
      </p>

      <span className={`inline-block px-4 py-2 rounded-full text-[15px] font-semibold mb-6 ${verdictColor}`}>
        {metrics.eye_verdict}
      </span>

      {/* Chart */}
      <div className="bg-bg rounded-card-sm px-4 pt-6 pb-3 mb-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--color-border)"
            />
            <XAxis dataKey="frame" tick={false} tickLine={false} stroke="var(--color-border)" height={8} />
            <YAxis
              tick={tick}
              tickLine={false}
              stroke="var(--color-border)"
              domain={[0, 0.4]}
              ticks={[0, 0.2, 0.4]}
              tickFormatter={(v: number) => v.toFixed(1)}
              width={40}
            />
            <Tooltip
              labelFormatter={(f) => `Frame ${f}`}
              formatter={(v: number) => v.toFixed(3)}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                fontSize: "12px",
              }}
            />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: "12px", paddingTop: 8 }}
              formatter={(value) => <span className="text-secondary">{value}</span>}
            />
            <Line type="monotone" dataKey="Left EAR" stroke={LEFT} strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="Right EAR" stroke={RIGHT} strokeWidth={2.5} dot={false} />
            <Line
              type="monotone"
              dataKey="L-R diff"
              stroke={DIFF}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="bg-bg rounded-card-sm py-6 text-center">
            <p className="font-mono text-2xl font-semibold text-accent">{t.value}</p>
            <p className="text-xs uppercase tracking-[0.12em] text-tertiary mt-1.5">{t.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
