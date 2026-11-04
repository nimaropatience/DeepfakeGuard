import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const tabs = [
  {
    label: "Video analysis",
    title: "Analyze any video format",
    text: "Upload MP4, MOV, AVI, WebM or MKV files up to 200 MB. The pipeline uniformly samples 16 frames, detects faces with MTCNN, and runs both spatial and temporal branches for a fused verdict.",
  },
  {
    label: "Image analysis",
    title: "Single image detection",
    text: "Upload a JPG or PNG image for quick spatial-only analysis. The EfficientNet-B4 branch scores the face crop and generates a Grad-CAM heatmap in under a second.",
  },
  {
    label: "Eye movement",
    title: "Temporal eye tracking",
    text: "MediaPipe Face Mesh extracts Eye Aspect Ratio (EAR) across 16 frames. An LSTM processes the blink pattern into a 32-dimensional feature vector, catching unnatural eye behaviour deepfakes often exhibit.",
  },
  {
    label: "Explainability",
    title: "See what the model sees",
    text: "Grad-CAM heatmaps highlight which facial regions the EfficientNet-B4 branch focuses on. Every verdict comes with visual evidence, making the detection interpretable for forensic review.",
  },
  {
    label: "Reports",
    title: "Forensic PDF export",
    text: "Download a report including verdict, probability, Grad-CAM images, EAR chart, metadata and file SHA-256 hash for chain-of-custody documentation.",
  },
];

export function CapabilityTabs() {
  const [active, setActive] = useState(0);

  return (
    <div className="bg-card rounded-card p-8 sm:p-10 shadow-sm">
      {/* Tab bar */}
      <div className="flex gap-1 bg-bg rounded-full p-1 mb-8 overflow-x-auto w-fit max-w-full">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              i === active ? "text-primary" : "text-secondary"
            }`}
          >
            {i === active && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 bg-card rounded-full shadow-sm"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <div>
            <h3 className="font-serif text-2xl mb-3">{tabs[active].title}</h3>
            <p className="text-secondary text-[15px] leading-relaxed">{tabs[active].text}</p>
          </div>
          <div className="bg-bg rounded-card-sm h-56 flex items-center justify-center text-tertiary text-sm">
            {tabs[active].label} preview
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
