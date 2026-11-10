import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

/* ── Architecture flowchart pieces ── */

type NodeTone = "neutral" | "spatial" | "temporal" | "output";

const toneClass: Record<NodeTone, string> = {
  neutral: "bg-bg border-2 border-transparent",
  spatial: "bg-bg border-2 border-accent",
  temporal: "bg-bg border-2 border-amber",
  output: "bg-accent-light border-2 border-transparent text-accent",
};

function FlowNode({
  title,
  detail,
  tone = "neutral",
  className = "",
}: {
  title: string;
  detail: string;
  tone?: NodeTone;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`rounded-2xl px-6 py-6 text-center ${toneClass[tone]} ${className}`}
    >
      <p className="font-semibold mb-1.5">{title}</p>
      <p className="text-sm text-tertiary">{detail}</p>
    </motion.div>
  );
}

function FlowArrow() {
  return (
    <motion.div variants={fadeUp} className="flex justify-center py-4 text-tertiary">
      <ArrowDown size={20} strokeWidth={1.5} />
    </motion.div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Reveal className="mb-6">
      <motion.h2 variants={fadeUp} className="font-serif text-3xl">
        {children}
      </motion.h2>
    </Reveal>
  );
}

const pipeline = [
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
];

const limitations = [
  "The verdict comes from the EfficientNet-B4 spatial model. In testing, the eye-movement branch added no measurable accuracy, so eye measurements are shown for reference and do not affect the verdict.",
  "Training uses 400 DFDC videos, a small subset of the full dataset. On Celeb-DF v2, which the model never saw, AUC falls from about 0.92 to about 0.65.",
  "Eye-movement analysis needs a clearly visible face and eyes across frames. Single images skip the temporal branch entirely.",
  "Grad-CAM shows where the spatial branch focused, not a guarantee of why a video is manipulated.",
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 space-y-24">
      {/* Header */}
      <Reveal className="text-center max-w-[640px] mx-auto">
        <motion.p
          variants={fadeUp}
          className="text-sm font-semibold uppercase tracking-[0.14em] text-accent mb-6"
        >
          About the project
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="font-serif text-4xl sm:text-5xl lg:text-[56px] leading-[1.35] mb-8"
        >
          Detection you can explain, not just a score
        </motion.h1>
        <motion.p variants={fadeUp} className="text-secondary text-lg leading-[1.75]">
          DeepfakeGuard is a BSc final year project at Uganda Christian University
          exploring explainable deepfake detection. Unlike black-box approaches,
          every verdict is accompanied by Grad-CAM heatmaps and eye-movement
          analysis, giving forensic analysts the evidence behind the score.
        </motion.p>
      </Reveal>

      {/* Architecture */}
      <section id="architecture" className="bg-card rounded-[28px] shadow-sm px-6 sm:px-12 py-12 sm:py-16">
        <h2 className="font-serif text-3xl text-center mb-12">System architecture</h2>
        <Reveal stagger={0.06}>
          <FlowNode
            title="Video input"
            detail="MP4, MOV, AVI, WebM, MKV"
            className="max-w-xs mx-auto"
          />
          <FlowArrow />
          <FlowNode
            title="MTCNN face detection + 16-frame sampling"
            detail="256 × 256 face crops"
            className="max-w-md mx-auto"
          />
          <FlowArrow />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <FlowNode title="EfficientNet-B4" detail="Spatial branch · 1,792-dim" tone="spatial" />
              <FlowArrow />
            </div>
            <div>
              <FlowNode title="MediaPipe + LSTM" detail="Temporal branch · 32-dim" tone="temporal" />
              <FlowArrow />
            </div>
          </div>
          <FlowNode
            title="Feature fusion"
            detail="Concatenation · 1,792 + 32 = 1,824-dim"
            className="max-w-md mx-auto"
          />
          <FlowArrow />
          <FlowNode
            title="Fusion head"
            detail="FC(256) → FC(64) → FC(1) → σ"
            className="max-w-md mx-auto"
          />
          <FlowArrow />
          <FlowNode
            title="Verdict + Grad-CAM heatmaps"
            detail="Probability (REAL ← 0.5 → FAKE) with visual evidence"
            tone="output"
            className="max-w-md mx-auto"
          />
        </Reveal>
      </section>

      {/* Pipeline stages */}
      <section>
        <SectionHeading>Processing pipeline</SectionHeading>
        <Reveal className="space-y-3">
          {pipeline.map((item) => (
            <Card key={item.stage} className="p-6">
              <motion.div variants={fadeUp}>
                <h3 className="font-semibold mb-1.5">{item.stage}</h3>
                <p className="text-[15px] text-secondary leading-relaxed">{item.detail}</p>
              </motion.div>
            </Card>
          ))}
        </Reveal>
      </section>

      {/* Datasets */}
      <section id="datasets">
        <SectionHeading>Datasets</SectionHeading>
        <Reveal className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Card className="p-7">
            <motion.div variants={fadeUp}>
              <h3 className="font-semibold mb-1.5">DFDC (training)</h3>
              <p className="text-[15px] text-secondary leading-relaxed">
                400 videos from the Facebook DeepFake Detection Challenge with a
                70/15/15 identity-aware split to prevent data leakage.
              </p>
            </motion.div>
          </Card>
          <Card className="p-7">
            <motion.div variants={fadeUp}>
              <h3 className="font-semibold mb-1.5">Celeb-DF v2 (cross-dataset)</h3>
              <p className="text-[15px] text-secondary leading-relaxed">
                6,229 videos (590 real, 5,639 fake) used exclusively for
                cross-dataset generalisation testing — never seen during training.
              </p>
            </motion.div>
          </Card>
        </Reveal>
      </section>

      {/* Limitations */}
      <section id="limitations">
        <SectionHeading>Limitations</SectionHeading>
        <Card className="p-7" hover={false}>
          <ul className="space-y-3">
            {limitations.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] text-secondary leading-relaxed">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Team */}
      <section>
        <SectionHeading>Team</SectionHeading>
        <Card className="!bg-primary text-bg p-8" hover={false}>
          <Reveal>
            <motion.div variants={fadeUp}>
              <h3 className="font-serif text-2xl">Nimaro Patience Torach</h3>
              <p className="text-sm opacity-70">
                BSc Data Science · Uganda Christian University
              </p>
            </motion.div>
          </Reveal>
        </Card>
      </section>

      {/* Ethical use + privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section id="ethics" className="bg-card rounded-card p-7 shadow-sm">
          <h2 className="font-serif text-2xl mb-3">Ethical use statement</h2>
          <p className="text-[15px] text-secondary leading-relaxed">
            DeepfakeGuard is designed to detect manipulated media and support
            digital forensics research. It must not be used to create, enhance
            or distribute deepfakes, to harass individuals, or to circumvent
            consent. The tool provides probabilistic assessments — not
            definitive legal proof. All detection results should be reviewed by
            qualified analysts before informing consequential decisions.
          </p>
        </section>
        <section id="privacy" className="bg-card rounded-card p-7 shadow-sm">
          <h2 className="font-serif text-2xl mb-3">Privacy</h2>
          <p className="text-[15px] text-secondary leading-relaxed">
            Media is analysed on the server running DeepfakeGuard and is not
            sent to any third party. Uploaded videos are deleted once analysis
            finishes. Results — verdict, scores, heatmaps and a SHA-256 hash of
            the file — are kept in a local database so they appear in History.
            No account or personal details are required.
          </p>
        </section>
      </div>
    </div>
  );
}
