import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      {/* Header */}
      <Reveal className="text-center">
        <motion.h1 variants={fadeUp} className="font-serif text-3xl sm:text-4xl mb-2">
          About DeepfakeGuard
        </motion.h1>
        <motion.p variants={fadeUp} className="text-secondary max-w-lg mx-auto">
          A BSc Computer Science final-year project at Uganda Christian
          University, supervised by Mr Julius Torach.
        </motion.p>
      </Reveal>

      {/* Architecture */}
      <section>
        <Reveal className="mb-6">
          <motion.h2 variants={fadeUp} className="font-serif text-2xl">
            System architecture
          </motion.h2>
        </Reveal>
        <Card className="p-7">
          <div className="bg-bg rounded-card-sm p-6 font-mono text-xs leading-relaxed text-secondary overflow-x-auto">
            <pre>{`Video / Image
      │
      ▼
┌─────────────┐
│   MTCNN      │  Face detection + cropping (256×256)
└──────┬──────┘
       │
       ├────────────────────┐
       ▼                    ▼
┌──────────────┐   ┌───────────────────┐
│ EfficientNet │   │  MediaPipe Face   │
│    B4        │   │  Mesh (468 lm)    │
│ (spatial)    │   │  → EAR sequence   │
│ 1,792-dim    │   │  → Eye-LSTM       │
└──────┬───────┘   │    32-dim         │
       │           └────────┬──────────┘
       │                    │
       ▼                    ▼
┌──────────────────────────────────┐
│  Concatenation: 1,792 + 32       │
│  = 1,824-dim fusion vector       │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Fusion head                     │
│  FC(256) → FC(64) → FC(1) → σ   │
└──────────────┬───────────────────┘
               │
               ▼
         Probability
     (REAL ← 0.5 → FAKE)
               │
               ▼
┌──────────────────────────────────┐
│  Grad-CAM (EfficientNet branch)  │
│  → heatmap overlays              │
└──────────────────────────────────┘`}</pre>
          </div>
        </Card>
      </section>

      {/* Pipeline stages */}
      <section>
        <Reveal className="mb-6">
          <motion.h2 variants={fadeUp} className="font-serif text-2xl">
            Processing pipeline
          </motion.h2>
        </Reveal>
        <Reveal className="space-y-3">
          {[
            {
              stage: "1. Frame sampling",
              detail:
                "16 frames are uniformly sampled from the video to capture temporal variation without processing every frame.",
            },
            {
              stage: "2. Face detection",
              detail:
                "MTCNN detects and crops faces with a margin, resizing each to 256×256 for the spatial branch.",
            },
            {
              stage: "3. Spatial feature extraction",
              detail:
                "EfficientNet-B4 (70 % layers frozen for transfer learning) extracts a 1,792-dimensional feature vector per face crop.",
            },
            {
              stage: "4. Eye-movement analysis",
              detail:
                "MediaPipe Face Mesh extracts 468 landmarks per frame. The Eye Aspect Ratio (EAR) is computed for left and right eyes across all 16 frames. The LSTM encodes this into a 32-dimensional temporal feature.",
            },
            {
              stage: "5. Feature fusion",
              detail:
                "Spatial (1,792) and temporal (32) vectors are concatenated into a 1,824-dimensional vector and passed through the fusion head: FC(256) → FC(64) → FC(1) → sigmoid.",
            },
            {
              stage: "6. Explainability",
              detail:
                "Grad-CAM generates heatmaps from the EfficientNet-B4 branch, highlighting which facial regions influenced the verdict.",
            },
          ].map((item) => (
            <Card key={item.stage} className="p-5">
              <motion.div variants={fadeUp}>
                <h3 className="font-semibold text-sm mb-1">{item.stage}</h3>
                <p className="text-sm text-secondary leading-relaxed">{item.detail}</p>
              </motion.div>
            </Card>
          ))}
        </Reveal>
      </section>

      {/* Datasets */}
      <section>
        <Reveal className="mb-6">
          <motion.h2 variants={fadeUp} className="font-serif text-2xl">
            Datasets
          </motion.h2>
        </Reveal>
        <Reveal className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Card className="p-6">
            <motion.div variants={fadeUp}>
              <h3 className="font-semibold mb-1">DFDC (training)</h3>
              <p className="text-sm text-secondary leading-relaxed">
                400 videos from the Facebook DeepFake Detection Challenge with a
                70/15/15 identity-aware split to prevent data leakage.
              </p>
            </motion.div>
          </Card>
          <Card className="p-6">
            <motion.div variants={fadeUp}>
              <h3 className="font-semibold mb-1">Celeb-DF v2 (cross-dataset)</h3>
              <p className="text-sm text-secondary leading-relaxed">
                6,229 videos (590 real, 5,639 fake) used exclusively for
                cross-dataset generalisation testing — never seen during training.
              </p>
            </motion.div>
          </Card>
        </Reveal>
      </section>

      {/* Team */}
      <section>
        <Reveal className="mb-6">
          <motion.h2 variants={fadeUp} className="font-serif text-2xl">
            Team
          </motion.h2>
        </Reveal>
        <Card className="bg-[var(--color-text-primary)] text-[var(--color-bg)] p-8">
          <Reveal>
            <motion.div variants={fadeUp} className="space-y-4">
              <div>
                <h3 className="font-serif text-xl">Nimaro Patience Torach</h3>
                <p className="text-sm opacity-70">
                  BSc Computer Science · Uganda Christian University
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl">Mr Julius Torach</h3>
                <p className="text-sm opacity-70">Project Supervisor</p>
              </div>
            </motion.div>
          </Reveal>
        </Card>
      </section>

      {/* Ethical use */}
      <section className="bg-card rounded-card p-7 shadow-sm border border-border">
        <Reveal>
          <motion.h2 variants={fadeUp} className="font-serif text-xl mb-3">
            Ethical use statement
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-secondary leading-relaxed">
            DeepfakeGuard is designed to detect manipulated media and support
            digital forensics research. It must not be used to create, enhance
            or distribute deepfakes, to harass individuals, or to circumvent
            consent. The tool provides probabilistic assessments — not
            definitive legal proof. All detection results should be reviewed by
            qualified analysts before informing consequential decisions.
          </motion.p>
        </Reveal>
      </section>
    </div>
  );
}
