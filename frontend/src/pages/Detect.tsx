import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Image, Film, Loader2, AlertCircle } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { analyzeVideo, analyzeImage, getJobStatus } from "@/lib/api";
import { VerdictCard } from "@/components/results/VerdictCard";
import { StatTiles } from "@/components/results/StatTiles";
import { GradCamGallery } from "@/components/results/GradCamGallery";
import { EarChart } from "@/components/results/EarChart";
import { TechnicalDetails } from "@/components/results/TechnicalDetails";
import type { AnalysisResult } from "@/lib/types";

const VIDEO_EXT = [".mp4", ".mov", ".avi", ".webm", ".mkv"];
const IMAGE_EXT = [".jpg", ".jpeg", ".png"];
const ALL_EXT = [...VIDEO_EXT, ...IMAGE_EXT];

function isVideo(name: string) {
  return VIDEO_EXT.some((e) => name.toLowerCase().endsWith(e));
}

type Stage = "idle" | "uploading" | "processing" | "done" | "error";

export default function Detect() {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [model, setModel] = useState("hybrid_cnn");
  const [threshold, setThreshold] = useState(0.5);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setStage("uploading");
      setError("");
      setResult(null);

      try {
        if (isVideo(file.name)) {
          setProgress("Uploading video…");
          const { job_id } = await analyzeVideo(file, model, threshold);
          setStage("processing");

          // Poll job
          const poll = async () => {
            const job = await getJobStatus(job_id);
            setProgress(job.stage || "Processing…");
            if (job.status === "completed" && job.result) {
              setResult(job.result);
              setStage("done");
            } else if (job.status === "failed") {
              setError(job.error || "Analysis failed");
              setStage("error");
            } else {
              setTimeout(poll, 1500);
            }
          };
          poll();
        } else {
          setProgress("Analysing image…");
          const res = await analyzeImage(file, model, threshold);
          setResult(res);
          setStage("done");
        }
      } catch (err: any) {
        setError(err.message || "Upload failed");
        setStage("error");
      }
    },
    [model, threshold],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const stats = result
    ? [
        { label: "Confidence", value: `${(result.probability * 100).toFixed(1)}%` },
        { label: "Faces found", value: result.faces_detected.toString() },
        { label: "Frames sampled", value: result.frames_sampled.toString() },
        { label: "Inference", value: `${result.inference_time_ms} ms` },
        { label: "Device", value: result.device },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
      <Reveal className="text-center">
        <motion.h1 variants={fadeUp} className="font-serif text-3xl sm:text-4xl mb-2">
          Detect
        </motion.h1>
        <motion.p variants={fadeUp} className="text-secondary">
          Upload a video or image for deepfake analysis.
        </motion.p>
      </Reveal>

      {/* ── Controls ── */}
      <Reveal className="flex flex-wrap gap-6 items-end justify-center">
        <motion.div variants={fadeUp}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-tertiary mb-1.5">
            Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="hybrid_cnn">Hybrid CNN (EfficientNet + Eye-LSTM)</option>
            <option value="efficientnet_b4">EfficientNet-B4 (spatial only)</option>
            <option value="mesonet4">MesoNet-4 (baseline)</option>
          </select>
        </motion.div>
        <motion.div variants={fadeUp}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-tertiary mb-1.5">
            Threshold: {threshold.toFixed(2)}
          </label>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-40 accent-[var(--color-accent)]"
          />
        </motion.div>
      </Reveal>

      {/* ── Upload zone ── */}
      {stage !== "done" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-card border-2 border-dashed transition-colors p-12 text-center ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ALL_EXT.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {stage === "idle" && (
            <div className="space-y-3">
              <div className="flex justify-center gap-3 text-tertiary">
                <Film size={28} />
                <Image size={28} />
              </div>
              <p className="text-secondary">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-tertiary">
                MP4, MOV, AVI, WebM, MKV, JPG, PNG · max 200 MB
              </p>
            </div>
          )}

          {(stage === "uploading" || stage === "processing") && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-secondary text-sm">{progress}</p>
            </div>
          )}

          {stage === "error" && (
            <div className="flex flex-col items-center gap-3 text-fake-red">
              <AlertCircle size={28} />
              <p className="text-sm">{error}</p>
              <Button variant="outlined" onClick={(e) => { e.stopPropagation(); setStage("idle"); }}>
                Try again
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Results ── */}
      <AnimatePresence>
        {stage === "done" && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-2xl">Results</h2>
              <Button
                variant="outlined"
                onClick={() => {
                  setStage("idle");
                  setResult(null);
                }}
              >
                New analysis
              </Button>
            </div>

            <VerdictCard result={result} />
            <StatTiles stats={stats} />

            {result.gradcam_frames.length > 0 && (
              <GradCamGallery frames={result.gradcam_frames} />
            )}

            {result.eye_metrics && <EarChart metrics={result.eye_metrics} />}
            <TechnicalDetails result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
