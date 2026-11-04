import type { AnalysisResult } from "@/lib/types";

export function TechnicalDetails({ result }: { result: AnalysisResult }) {
  const rows = [
    { label: "Raw logit", value: result.raw_logit.toString() },
    { label: "Device", value: result.device },
    { label: "Total frames", value: result.total_frames.toString() },
    { label: "Video FPS", value: result.fps.toString() },
    { label: "Frames sampled", value: result.frames_sampled.toString() },
    { label: "Timestamp", value: result.timestamp },
    { label: "Model", value: result.model_id },
    { label: "SHA-256", value: result.file_sha256 },
  ];

  return (
    <div className="bg-card rounded-card p-7 shadow-sm">
      <h3 className="text-base font-semibold mb-4">Technical details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between py-2.5 border-b border-border text-sm"
          >
            <span className="text-secondary">{row.label}</span>
            <span className="font-mono text-xs truncate max-w-[200px]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
