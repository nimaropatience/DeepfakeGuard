import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Shield, Eye, BarChart3, FileText, Cpu } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FramePlaceholder } from "@/components/ui/FramePlaceholder";
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
    title: "CPU inference",
    text: "Runs on an ordinary laptop without a GPU: a 16-frame video takes roughly 5 to 10 seconds with EfficientNet-B4 and 1 to 2 seconds with MesoNet-4.",
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
      <div>
        {/* ── Announcement band ── */}
        <Link
          to="/detect"
          className="flex items-center justify-center gap-3 bg-accent-light border-b border-accent/10 py-3 px-4 text-sm text-accent font-medium"
        >
          <span className="bg-accent text-white text-[11px] font-bold tracking-wide px-2.5 py-0.5 rounded-full">
            NEW
          </span>
          Grad-CAM explainability for every verdict
        </Link>

        {/* ── Hero ── */}
        <section className="max-w-6xl mx-auto px-6 pt-20 sm:pt-24 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <motion.p
              variants={fadeUp}
              className="text-sm font-semibold uppercase tracking-[0.14em] text-accent mb-6"
            >
              Explainable deepfake detection
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-serif text-5xl sm:text-6xl lg:text-[64px] leading-[1.08] mb-7"
            >
              Detect deepfakes in seconds.
              <br />
              <em className="text-accent">See the evidence.</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-secondary text-lg leading-relaxed max-w-[470px] mb-9"
            >
              A hybrid CNN framework combining spatial analysis with eye-movement
              tracking. Every verdict comes with Grad-CAM heatmaps showing exactly
              what the model sees.
            </motion.p>
            <motion.div variants={fadeUp} className="flex gap-3 flex-wrap mb-6">
              <Link to="/detect">
                <Button className="!px-7 !py-3.5 !text-base">Analyze a video</Button>
              </Link>
              <Link to="/live">
                <Button variant="outlined" className="!px-7 !py-3.5 !text-base">
                  Try live webcam
                </Button>
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="text-sm text-tertiary">
              No account required for the prototype
            </motion.p>
          </Reveal>

          {/* Evidence preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid grid-cols-2 gap-4 pb-6"
          >
            <div className="bg-card rounded-card overflow-hidden shadow-sm">
              <FramePlaceholder variant="original" label="Source frame" className="h-44 sm:h-[180px]" />
              <div className="px-4 py-4">
                <p className="text-xs text-tertiary mb-1">Original</p>
                <p className="text-sm font-semibold">Frame at 00:03.42</p>
              </div>
            </div>
            <div className="bg-card rounded-card overflow-hidden shadow-sm">
              <FramePlaceholder variant="heatmap" label="Grad-CAM overlay" className="h-44 sm:h-[180px]" />
              <div className="px-4 py-4">
                <p className="text-xs text-tertiary mb-1">Heatmap</p>
                <p className="text-sm font-semibold">Attention regions</p>
              </div>
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, delay: 0.6 }}
              style={{ x: "-50%" }}
              className="absolute left-1/2 bottom-0 whitespace-nowrap bg-fake-red text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-fake-red/25"
            >
              Likely Fake · 87.3%
            </motion.span>
          </motion.div>
        </section>
      </div>

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
