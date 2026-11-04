import { ArrowDownRight, ArrowUpRight, CircleHelp } from "lucide-react";
import { Card } from "../ui/Card";
import type { AnalysisResult } from "../../lib/types";

function verdictTone(verdict: string) {
  if (verdict.toLowerCase().includes("fake")) return "danger";
  if (verdict.toLowerCase().includes("real")) return "safe";
  return "neutral";
}

export function VerdictCard({ result }: { result: AnalysisResult }) {
  const percentage = Math.round(result.probability * 100);
  const tone = verdictTone(result.verdict);
  const GaugeIcon = percentage >= 50 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className={`verdict-card verdict-${tone}`}>
      <div className="verdict-top">
        <span className="eyebrow">AUTHENTICITY ASSESSMENT</span>
        {result.demo_mode && <span className="demo-badge">DEMO RESULT</span>}
      </div>
      <div className="verdict-main">
        <div>
          <span className="verdict-label">Model verdict</span>
          <h2>{result.verdict}</h2>
          <p className="verdict-subtitle">
            {result.probability >= result.threshold
              ? "Probability is above the selected decision threshold."
              : "Probability is below the selected decision threshold."}
          </p>
        </div>
        <div
          className="probability-gauge"
          style={{ "--gauge-value": `${percentage}%` } as React.CSSProperties}
          aria-label={`${percentage}% manipulation probability`}
        >
          <div className="gauge-inner">
            <GaugeIcon size={18} />
            <strong>{percentage}%</strong>
            <span>FAKE SCORE</span>
          </div>
        </div>
      </div>
      <div className="verdict-foot">
        <span><CircleHelp size={15} /> Decision threshold</span>
        <strong>{Math.round(result.threshold * 100)}%</strong>
        <div className="threshold-track">
          <span style={{ left: `${Math.min(100, result.threshold * 100)}%` }} />
        </div>
      </div>
    </Card>
  );
}
