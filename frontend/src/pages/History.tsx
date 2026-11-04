import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Search, ChevronRight, Trash2 } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { useHistory } from "@/hooks/useHistory";
import { VerdictCard } from "@/components/results/VerdictCard";
import { StatTiles } from "@/components/results/StatTiles";
import { GradCamGallery } from "@/components/results/GradCamGallery";
import { EarChart } from "@/components/results/EarChart";
import { TechnicalDetails } from "@/components/results/TechnicalDetails";
import type { AnalysisResult } from "@/lib/types";

export default function History() {
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useHistory(1, 50, filter || undefined);
  const [selected, setSelected] = useState<AnalysisResult | null>(null);

  const items = data?.items ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
      <Reveal className="text-center">
        <motion.h1 variants={fadeUp} className="font-serif text-3xl sm:text-4xl mb-2">
          Analysis history
        </motion.h1>
        <motion.p variants={fadeUp} className="text-secondary">
          Review previous detection results stored in the local database.
        </motion.p>
      </Reveal>

      {/* Search / filter */}
      <div className="flex gap-3 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
          <input
            type="text"
            placeholder="Filter by verdict…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-tertiary"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          /* ── Detail view ── */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-accent hover:underline"
            >
              ← Back to list
            </button>

            <VerdictCard result={selected} />
            <StatTiles
              stats={[
                { label: "Confidence", value: `${(selected.probability * 100).toFixed(1)}%` },
                { label: "Faces found", value: selected.faces_detected.toString() },
                { label: "Frames sampled", value: selected.frames_sampled.toString() },
                { label: "Inference", value: `${selected.inference_time_ms} ms` },
                { label: "Device", value: selected.device },
              ]}
            />
            {selected.gradcam_frames.length > 0 && (
              <GradCamGallery frames={selected.gradcam_frames} />
            )}
            {selected.eye_metrics && <EarChart metrics={selected.eye_metrics} />}
            <TechnicalDetails result={selected} />
          </motion.div>
        ) : (
          /* ── List view ── */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isLoading && (
              <p className="text-center text-secondary py-12">Loading…</p>
            )}

            {!isLoading && items.length === 0 && (
              <div className="text-center py-16">
                <Clock size={32} className="mx-auto text-tertiary mb-3" />
                <p className="text-secondary mb-1">No analyses yet</p>
                <p className="text-sm text-tertiary">
                  Results will appear here after you{" "}
                  <Link to="/detect" className="text-accent hover:underline">
                    run a detection
                  </Link>.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {items.map((item: any) => {
                const r: AnalysisResult | null = item.result_json
                  ? JSON.parse(item.result_json)
                  : null;
                if (!r) return null;

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelected(r)}
                    className="w-full text-left bg-card rounded-card-sm p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        r.verdict === "FAKE"
                          ? "bg-fake-red-light text-fake-red"
                          : "bg-real-green-light text-real-green"
                      }`}
                    >
                      {(r.probability * 100).toFixed(0)}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {r.file_sha256?.slice(0, 12) ?? "Analysis"} · {r.model_id}
                      </p>
                      <p className="text-xs text-tertiary">
                        {r.verdict} · {r.faces_detected} face(s) · {r.timestamp}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-tertiary shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
