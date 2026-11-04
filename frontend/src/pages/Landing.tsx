import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Shield, Eye, BarChart3, FileText, Cpu } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CapabilityTabs } from "@/components/landing/CapabilityTabs";
import { Faq } from "@/components/landing/Faq";

const features = [
  {
    icon: Shield,
    title: "Hybrid CNN fusion",
    text: "EfficientNet-B4 spatial features (1,792-dim) fused with Eye-LSTM temporal features (32-dim) for a 1,824-dimensional verdict.",
  },
  {
    icon: Eye,
    title: "Eye-movement tracking",
    text: "MediaPipe Face Mesh extracts EAR across 16 frames, detecting unnatural blink patterns deepfakes struggle to reproduce.",
  },
  {
    icon: BarChart3,
    title: "Grad-CAM explainability",
    text: "Visual heatmaps show which facial regions drove the model's decision, making every verdict interpretable.",
  },
  {
    icon: FileText,
    title: "Forensic reports",
    text: "PDF exports with verdict, probability, heatmaps, EAR chart, metadata and SHA-256 hash for chain-of-custody.",
  },
  {
    icon: Cpu,
    title: "ONNX CPU inference",
    text: "Optimised ONNX Runtime execution runs on any machine without a GPU. Demo mode works with no model weights.",
  },
];

const steps = [
  { num: "01", title: "Upload", text: "Drop a video (MP4, MOV, AVI, WebM, MKV) or image (JPG, PNG) into the detection zone." },
  { num: "02", title: "Detect", text: "MTCNN finds faces, EfficientNet-B4 scores each crop, and the Eye-LSTM analyses blink dynamics." },
  { num: "03", title: "Explain", text: "Grad-CAM heatmaps and EAR charts show exactly why the model reached its verdict." },
  { num: "04", title: "Report", text: "Download a forensic PDF or review the full analysis in your browser." },
];

const useCases = [
  { title: "Digital forensics", text: "Law enforcement and forensic analysts verifying media authenticity in investigations." },
  { title: "Journalism", text: "Newsrooms fact-checking user-generated video and detecting manipulated interview footage." },
  { title: "Academic research", text: "Researchers benchmarking detection methods and studying deepfake generation artefacts." },
  { title: "Social media moderation", text: "Platform trust-and-safety teams screening uploaded content at scale." },
];

export default function Landing() {
  return (
    <div className="space-y-28 pb-20">
      {/* ── Hero ── */}
      <section className="pt-24 sm:pt-32 text-center max-w-3xl mx-auto px-4">
        <Reveal>
          <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
            BSc Final-Year Project · Uganda Christian University
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-6">
            Explainable deepfake detection powered by hybrid CNNs
          </motion.h1>
          <motion.p variants={fadeUp} className="text-secondary text-lg max-w-xl mx-auto mb-8">
            DeepfakeGuard fuses spatial and temporal neural features with
            Grad-CAM explainability to deliver transparent, forensic-grade
            media verification.
          </motion.p>
          <motion.div variants={fadeUp} className="flex gap-3 justify-center flex-wrap">
            <Link to="/detect"><Button>Start detection</Button></Link>
            <Link to="/about"><Button variant="outlined">How it works</Button></Link>
          </motion.div>
        </Reveal>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-4">
        <Reveal className="text-center mb-12">
          <motion.h2 variants={fadeUp} className="font-serif text-3xl mb-3">
            What makes it different
          </motion.h2>
          <motion.p variants={fadeUp} className="text-secondary max-w-lg mx-auto">
            A hybrid architecture that combines what the model sees with how the eyes move.
          </motion.p>
        </Reveal>

        <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="p-6">
              <motion.div variants={fadeUp}>
                <f.icon size={22} className="text-accent mb-3" />
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{f.text}</p>
              </motion.div>
            </Card>
          ))}
        </Reveal>
      </section>

      {/* ── Capability tabs ── */}
      <section className="max-w-4xl mx-auto px-4">
        <Reveal className="text-center mb-10">
          <motion.h2 variants={fadeUp} className="font-serif text-3xl mb-3">
            Capabilities
          </motion.h2>
        </Reveal>
        <CapabilityTabs />
      </section>

      {/* ── How it works ── */}
      <section className="max-w-4xl mx-auto px-4">
        <Reveal className="text-center mb-12">
          <motion.h2 variants={fadeUp} className="font-serif text-3xl mb-3">
            How it works
          </motion.h2>
        </Reveal>
        <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <motion.div key={s.num} variants={fadeUp}>
              <span className="text-5xl font-serif text-accent/20 leading-none">{s.num}</span>
              <h3 className="font-semibold mt-2 mb-1">{s.title}</h3>
              <p className="text-sm text-secondary leading-relaxed">{s.text}</p>
            </motion.div>
          ))}
        </Reveal>
      </section>

      {/* ── Use cases ── */}
      <section className="max-w-4xl mx-auto px-4">
        <Reveal className="text-center mb-10">
          <motion.h2 variants={fadeUp} className="font-serif text-3xl mb-3">
            Use cases
          </motion.h2>
        </Reveal>
        <Reveal className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {useCases.map((u) => (
            <Card key={u.title} className="p-6">
              <motion.div variants={fadeUp}>
                <h3 className="font-semibold mb-1.5">{u.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{u.text}</p>
              </motion.div>
            </Card>
          ))}
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-4xl mx-auto px-4">
        <Reveal className="text-center mb-10">
          <motion.h2 variants={fadeUp} className="font-serif text-3xl mb-3">
            Frequently asked questions
          </motion.h2>
        </Reveal>
        <Faq />
      </section>

      {/* ── CTA ── */}
      <section className="text-center px-4">
        <Reveal>
          <motion.h2 variants={fadeUp} className="font-serif text-3xl mb-4">
            Ready to detect?
          </motion.h2>
          <motion.div variants={fadeUp}>
            <Link to="/detect"><Button>Upload media</Button></Link>
          </motion.div>
        </Reveal>
      </section>
    </div>
  );
}
