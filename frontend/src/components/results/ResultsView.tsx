import type { AnalysisResult } from "@/lib/types";
import { formatDuration, formatResolution } from "@/lib/format";
import { VerdictCard } from "./VerdictCard";
import { StatTiles } from "./StatTiles";
import { GradCamGallery } from "./GradCamGallery";
import { EarChart } from "./EarChart";
import { TechnicalDetails } from "./TechnicalDetails";

interface ResultsViewProps {
  result: AnalysisResult;
  onReset?: () => void;
  onCompare?: () => void;
}

/** Two-column results layout shared by Detect and History. */
export function ResultsView({ result, onReset, onCompare }: ResultsViewProps) {
  const stats = [
    { label: "Processing", value: `${result.processing_time.toFixed(1)}s` },
    { label: "Faces", value: result.faces_detected },
    { label: "Duration", value: formatDuration(result.duration) },
    { label: "Resolution", value: formatResolution(result.resolution) },
    { label: "Compute", value: result.device },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
      {/* Left column */}
      <div className="space-y-6">
        <VerdictCard
          verdict={result.verdict}
          probability={result.probability}
          threshold={result.threshold}
          onReset={onReset}
          onCompare={onCompare}
        />
        <div className="bg-amber-light text-amber rounded-card-sm px-6 py-5 text-[15px] leading-relaxed">
          Results are probabilistic and support, not replace, expert forensic review.
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-6 min-w-0">
        <StatTiles stats={stats} />
        {result.gradcam_frames?.length > 0 && (
          <GradCamGallery frames={result.gradcam_frames} />
        )}
        {result.eye_metrics && <EarChart metrics={result.eye_metrics} />}
        <TechnicalDetails result={result} />
      </div>
    </div>
  );
}
