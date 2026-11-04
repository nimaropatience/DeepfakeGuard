import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

const models = [
  {
    id: "hybrid_cnn",
    name: "Hybrid CNN",
    tag: "Recommended",
    desc: "EfficientNet-B4 spatial branch (1,792-dim) fused with Eye-LSTM temporal branch (32-dim) through a 3-layer fusion head. The full 1,824-dimensional feature vector captures both visual artefacts and blink dynamics.",
    arch: "EfficientNet-B4 + LSTM",
    input: "16 frames × 256×256 + EAR sequence",
    params: "~21 M (70 % frozen)",
    auc: "Placeholder — pending full training",
    dataset: "DFDC (400 videos, identity split)",
    crossDataset: "Celeb-DF v2 (6,229 videos)",
    weights: ["efficientnet_spatial.onnx", "eye_lstm_temporal.onnx"],
  },
  {
    id: "efficientnet_b4",
    name: "EfficientNet-B4",
    tag: "Spatial only",
    desc: "Standalone spatial branch. Scores individual face crops without temporal context. Faster than the hybrid but misses blink-pattern cues.",
    arch: "EfficientNet-B4",
    input: "Single frame 256×256",
    params: "~19 M (70 % frozen)",
    auc: "Placeholder — pending full training",
    dataset: "DFDC (400 videos, identity split)",
    crossDataset: "Celeb-DF v2 (6,229 videos)",
    weights: ["efficientnet_spatial.onnx"],
  },
  {
    id: "mesonet4",
    name: "MesoNet-4",
    tag: "Baseline",
    desc: "Lightweight 4-layer CNN baseline from Afchar et al. (2018). Included for comparative benchmarking.",
    arch: "MesoNet-4",
    input: "Single frame 256×256",
    params: "~28 K",
    auc: "Placeholder — pending full training",
    dataset: "DFDC (400 videos, identity split)",
    crossDataset: "Celeb-DF v2 (6,229 videos)",
    weights: ["mesonet4.onnx"],
  },
];

export default function Models() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
      <Reveal className="text-center">
        <motion.h1 variants={fadeUp} className="font-serif text-3xl sm:text-4xl mb-2">
          Models
        </motion.h1>
        <motion.p variants={fadeUp} className="text-secondary max-w-lg mx-auto">
          Three detection models ship with DeepfakeGuard. The hybrid CNN is the
          primary contribution; EfficientNet-B4 and MesoNet-4 serve as ablation
          and baseline comparisons.
        </motion.p>
      </Reveal>

      <div className="space-y-6">
        {models.map((m) => (
          <Card key={m.id} className="p-0 overflow-hidden">
            <Reveal>
              <motion.div variants={fadeUp} className="p-7">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <h2 className="font-serif text-2xl">{m.name}</h2>
                    <p className="text-sm text-secondary mt-1">{m.desc}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
                      m.tag === "Recommended"
                        ? "bg-accent/10 text-accent"
                        : m.tag === "Baseline"
                          ? "bg-amber-light text-amber"
                          : "bg-bg text-secondary"
                    }`}
                  >
                    {m.tag}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 mt-5">
                  {[
                    ["Architecture", m.arch],
                    ["Input", m.input],
                    ["Parameters", m.params],
                    ["AUC (DFDC)", m.auc],
                    ["Training dataset", m.dataset],
                    ["Cross-dataset", m.crossDataset],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[11px] uppercase tracking-wider text-tertiary font-semibold">
                        {label}
                      </p>
                      <p className="text-sm mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-[11px] uppercase tracking-wider text-tertiary font-semibold mb-1">
                    Weight files
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {m.weights.map((w) => (
                      <code
                        key={w}
                        className="bg-bg text-xs font-mono px-2.5 py-1 rounded-md"
                      >
                        {w}
                      </code>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </Card>
        ))}
      </div>

      {/* Note */}
      <div className="bg-amber-light/40 border border-amber/20 rounded-card p-5 text-sm text-secondary">
        <p className="font-semibold text-primary mb-1">AUC numbers are placeholders</p>
        <p>
          Final AUC scores will be reported once the full Kaggle training pipeline
          (DFDC 400-video identity split + Celeb-DF v2 cross-dataset evaluation)
          completes. The architecture and feature dimensions are final.
        </p>
      </div>
    </div>
  );
}
