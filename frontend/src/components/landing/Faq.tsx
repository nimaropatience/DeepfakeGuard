import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How accurate is DeepfakeGuard?",
    a: "On the DFDC test split the EfficientNet-B4 model reaches a video-level AUC of about 0.92. On Celeb-DF v2, which it never saw in training, AUC drops to about 0.65, so results on unfamiliar manipulation methods are much less reliable. The test set is small (59 videos), so these figures carry wide uncertainty. See the Models page for the full table.",
  },
  {
    q: "What video formats are supported?",
    a: "MP4, MOV, AVI, WebM and MKV up to 200 MB. The pipeline extracts frames with OpenCV, so any codec FFmpeg supports will work.",
  },
  {
    q: "Does it work without a GPU?",
    a: "Yes. Inference runs on ONNX Runtime with the CPU execution provider by default. A CUDA-capable GPU accelerates processing but is not required.",
  },
  {
    q: "What is the Eye Aspect Ratio (EAR)?",
    a: "EAR measures how open an eye is using six facial landmarks. It drops sharply during blinks. Deepfakes often produce unnaturally stable EAR patterns because generators struggle to reproduce realistic blink dynamics.",
  },
  {
    q: "Can I use this in production?",
    a: "DeepfakeGuard is a research prototype developed as a BSc final-year project at Uganda Christian University. It demonstrates the hybrid detection approach but has not been validated for production forensic use.",
  },
  {
    q: "What does demo mode do?",
    a: "When no trained checkpoint is present in backend/models, the backend returns simulated results so you can explore the interface, and every result is labelled as a demo. With a checkpoint in place, verdicts, per-frame scores and Grad-CAM heatmaps come from the trained model.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto">
      {faqs.map((item, i) => (
        <div key={i} className="border-b border-border">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left"
          >
            <span className="font-medium text-primary pr-4">{item.q}</span>
            <motion.span
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 text-tertiary"
            >
              <ChevronDown size={18} />
            </motion.span>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="pb-5 text-secondary text-[15px] leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
