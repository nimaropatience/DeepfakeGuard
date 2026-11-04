import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fadeUp, scaleIn } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import type { GradCamFrame } from "@/lib/types";

export function GradCamGallery({ frames }: { frames: GradCamFrame[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <div className="bg-card rounded-card p-7 shadow-sm">
      <h3 className="text-base font-semibold mb-1">Grad-CAM explainability</h3>
      <p className="text-sm text-secondary mb-5 leading-relaxed">
        Heatmaps show which facial regions contributed most to the model's decision.
        Warmer colours indicate stronger activation.
      </p>

      <Reveal className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {frames.map((frame, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            layoutId={`frame-${i}`}
            onClick={() => setSelected(i)}
            className="rounded-card-sm overflow-hidden bg-bg cursor-pointer hover:scale-[1.03] transition-transform"
          >
            <img
              src={showHeatmap ? frame.heatmap_url : frame.original_url}
              alt={`Frame at ${frame.timestamp.toFixed(1)}s`}
              className="w-full h-24 object-cover"
            />
            <div className="p-2 text-xs flex justify-between">
              <span className="text-tertiary">{frame.timestamp.toFixed(1)}s</span>
              <span className="font-semibold text-fake-red">{frame.score.toFixed(2)}</span>
            </div>
          </motion.div>
        ))}
      </Reveal>

      {/* Toggle */}
      <div className="flex gap-1 mt-3 bg-bg rounded-full p-0.5 w-fit">
        <button
          onClick={() => setShowHeatmap(false)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            !showHeatmap ? "bg-card text-primary shadow-sm" : "text-secondary"
          }`}
        >
          Original
        </button>
        <button
          onClick={() => setShowHeatmap(true)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            showHeatmap ? "bg-card text-primary shadow-sm" : "text-secondary"
          }`}
        >
          Heatmap
        </button>
      </div>

      {/* Enlarged modal */}
      <AnimatePresence>
        {selected !== null && frames[selected] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              layoutId={`frame-${selected}`}
              className="bg-card rounded-card p-4 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={showHeatmap ? frames[selected].heatmap_url : frames[selected].original_url}
                alt="Enlarged frame"
                className="w-full rounded-card-sm"
              />
              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm text-tertiary">
                  Frame {frames[selected].frame_index} at {frames[selected].timestamp.toFixed(1)}s
                </span>
                <span className="text-sm font-semibold text-fake-red">
                  Score: {frames[selected].score.toFixed(4)}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
