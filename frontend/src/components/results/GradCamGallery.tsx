import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { formatTimestamp } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { FramePlaceholder } from "@/components/ui/FramePlaceholder";
import type { GradCamFrame } from "@/lib/types";

/** Frame image that falls back to a gradient placeholder if it fails to load. */
function FrameImage({
  src,
  variant,
  className,
}: {
  src: string;
  variant: "original" | "heatmap";
  className: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (failedSrc === src) return <FramePlaceholder variant={variant} className={className} />;
  return (
    <img
      src={src}
      alt=""
      onError={() => setFailedSrc(src)}
      className={`object-cover ${className}`}
    />
  );
}

export function GradCamGallery({ frames: input }: { frames: GradCamFrame[] }) {
  // Show the top-scoring frames in playback order
  const frames = [...input].sort((a, b) => a.timestamp - b.timestamp);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const variant = showHeatmap ? "heatmap" : "original";
  const srcOf = (f: GradCamFrame) => (showHeatmap ? f.heatmap_url : f.original_url);

  return (
    <div className="bg-card rounded-card p-7 sm:p-10 shadow-sm">
      <h3 className="text-xl font-semibold mb-2">Grad-CAM explainability</h3>
      <p className="text-[15px] text-secondary mb-7 leading-relaxed">
        Heatmaps show which facial regions contributed most to the model's decision.
        Warmer colours indicate stronger activation.
      </p>

      <Reveal className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {frames.map((frame, i) => (
          <motion.button
            key={i}
            variants={fadeUp}
            layoutId={`frame-${i}`}
            onClick={() => setSelected(i)}
            className="text-left rounded-card-sm overflow-hidden bg-bg hover:scale-[1.03] transition-transform"
          >
            <FrameImage src={srcOf(frame)} variant={variant} className="w-full h-32 block" />
            <div className="px-3.5 py-3 text-sm flex justify-between">
              <span className="text-tertiary">{formatTimestamp(frame.timestamp)}</span>
              <span className="font-semibold text-fake-red">{frame.score.toFixed(2)}</span>
            </div>
          </motion.button>
        ))}
      </Reveal>

      {/* Toggle */}
      <div className="flex gap-1 mt-4 bg-bg rounded-full p-1 w-fit">
        {(["original", "heatmap"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setShowHeatmap(v === "heatmap")}
            className={`px-6 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              variant === v ? "bg-card text-primary shadow-sm" : "text-secondary"
            }`}
          >
            {v}
          </button>
        ))}
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
              <FrameImage
                src={srcOf(frames[selected])}
                variant={variant}
                className="w-full aspect-square rounded-card-sm block"
              />
              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm text-tertiary">
                  Frame {frames[selected].frame_index} at {formatTimestamp(frames[selected].timestamp)}
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
