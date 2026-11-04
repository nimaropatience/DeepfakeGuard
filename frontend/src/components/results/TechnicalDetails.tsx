import type { AnalysisResult } from "@/lib/types";
import { formatIsoMinute, shortenHash } from "@/lib/format";

export function TechnicalDetails({ result }: { result: AnalysisResult }) {
  const rows = [
    { label: "Raw logit", value: result.raw_logit.toString() },
    { label: "Device", value: result.device },
    { label: "Total frames", value: result.total_frames.toString() },
    { label: "Video FPS", value: result.fps.toFixed(1) },
    { label: "Frames sampled", value: result.frames_sampled.toString() },
    { label: "Timestamp", value: formatIsoMinute(result.timestamp) },
    { label: "Model", value: result.model_id },
    { label: "SHA-256", value: shortenHash(result.file_sha256), title: result.file_sha256 },
  ];

  return (
    <div className="bg-card rounded-card p-7 sm:p-10 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Technical details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center gap-4 py-4 border-b border-border"
          >
            <span className="text-[15px] text-secondary">{row.label}</span>
            <span className="font-mono text-sm truncate" title={row.title}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
