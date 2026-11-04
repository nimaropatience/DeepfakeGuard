import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { analyzeVideo, analyzeImage, getJobStatus } from "@/lib/api";
import { ResultsView } from "@/components/results/ResultsView";
import { SAMPLE_RESULT } from "@/lib/sampleResult";
import type { AnalysisResult } from "@/lib/types";

const VIDEO_EXT = [".mp4", ".mov", ".avi", ".webm", ".mkv"];
const IMAGE_EXT = [".jpg", ".jpeg", ".png"];
const ALL_EXT = [...VIDEO_EXT, ...IMAGE_EXT];

const MODELS = [
  { id: "hybrid_fusion", label: "Hybrid Fusion (Default)" },
  { id: "efficientnet_b4", label: "EfficientNet-B4 (Spatial only)" },
  { id: "mesonet4", label: "MesoNet-4 (Baseline)" },
];

function isVideo(name: string) {
  return VIDEO_EXT.some((e) => name.toLowerCase().endsWith(e));
}

type Stage = "idle" | "uploading" | "processing" | "done" | "error";

export default function Detect() {
  const [stage, setStage] = useState<Stage>("idle");
  const [progressText, setProgressText] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [model, setModel] = useState("hybrid_fusion");
  const [threshold, setThreshold] = useState(0.5);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStage("idle");
    setResult(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!ALL_EXT.some((e) => file.name.toLowerCase().endsWith(e))) {
        setError("Unsupported file type. Use MP4, MOV, AVI, WebM, MKV, JPG or PNG.");
        setStage("error");
        return;
      }

      setStage("uploading");
      setError("");
      setResult(null);
      setProgress(0);

      try {
        if (isVideo(file.name)) {
          setProgressText("Uploading video…");
          const { job_id } = await analyzeVideo(file, model, threshold);
          setStage("processing");

          // Poll job
          const poll = async () => {
            try {
              const job = await getJobStatus(job_id);
              setProgressText(job.stage || "Processing…");
              setProgress(job.progress ?? 0);
              if (job.status === "complete" && job.result) {
                setResult(job.result);
                setStage("done");
              } else if (job.status === "failed") {
                setError(job.error || "Analysis failed");
                setStage("error");
              } else {
                setTimeout(poll, 1000);
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : "Lost connection to the server");
              setStage("error");
            }
          };
          poll();
        } else {
          setProgressText("Analysing image…");
          const res = await analyzeImage(file, model, threshold);
          setResult(res);
          setStage("done");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
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

  const busy = stage === "uploading" || stage === "processing";
  const isSample = result === SAMPLE_RESULT;

  const showSample = () => {
    setResult(SAMPLE_RESULT);
    setStage("done");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <AnimatePresence mode="wait">
        {stage === "done" && result ? (
          /* ── Results ── */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {isSample && (
              <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 bg-accent-light text-accent rounded-card-sm px-5 py-3 text-sm">
                <span>
                  <strong className="font-semibold">Sample result.</strong> These are example
                  values. Upload a video or image to analyse your own media.
                </span>
                <button onClick={reset} className="font-semibold underline underline-offset-2">
                  Upload a file
                </button>
              </div>
            )}
            <ResultsView result={result} onReset={reset} onCompare={reset} />
          </motion.div>
        ) : (
          /* ── Upload ── */
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-[640px] mx-auto"
          >
            <Reveal className="text-center mb-12">
              <motion.h1 variants={fadeUp} className="font-serif text-5xl sm:text-[56px] leading-tight mb-4">
                Analyze media
              </motion.h1>
              <motion.p variants={fadeUp} className="text-secondary text-lg">
                Upload a video or image to detect potential deepfake manipulation
              </motion.p>
            </Reveal>

            {/* Drop zone */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !busy && inputRef.current?.click()}
              className={`bg-card rounded-card border-2 border-dashed transition-colors px-8 py-16 text-center ${
                busy ? "cursor-default" : "cursor-pointer"
              } ${dragOver ? "border-accent bg-accent-light/40" : "border-border hover:border-accent/40"}`}
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
                <>
                  <div className="w-14 h-14 rounded-2xl bg-bg flex items-center justify-center mx-auto mb-8">
                    <Upload size={24} className="text-accent" />
                  </div>
                  <p className="text-lg font-semibold mb-3">Drop a video or image here</p>
                  <p className="text-secondary mb-6">or click to browse your files</p>
                  <p className="text-xs text-tertiary">
                    MP4, MOV, AVI, WebM, MKV, JPG, PNG · Max 200 MB
                  </p>
                </>
              )}

              {busy && (
                <div className="flex flex-col items-center gap-4 py-6">
                  <Loader2 size={28} className="animate-spin text-accent" />
                  <p className="text-secondary">{progressText}</p>
                  {stage === "processing" && (
                    <div className="w-full max-w-xs h-1.5 bg-bg rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent rounded-full"
                        animate={{ width: `${Math.max(5, progress * 100)}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              )}

              {stage === "error" && (
                <div className="flex flex-col items-center gap-4 py-6 text-fake-red">
                  <AlertCircle size={28} />
                  <p>{error}</p>
                  <Button
                    variant="outlined"
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                  >
                    Try again
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="bg-card rounded-card-sm px-6 py-6 shadow-sm">
                <label
                  htmlFor="model"
                  className="block text-xs font-medium uppercase tracking-[0.12em] text-tertiary mb-3"
                >
                  Model
                </label>
                <select
                  id="model"
                  value={model}
                  disabled={busy}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:border-accent"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="bg-card rounded-card-sm px-6 py-6 shadow-sm">
                <label
                  htmlFor="threshold"
                  className="block text-xs font-medium uppercase tracking-[0.12em] text-tertiary mb-3"
                >
                  Threshold
                </label>
                <div className="flex items-center gap-4 h-[42px]">
                  <input
                    id="threshold"
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    value={threshold}
                    disabled={busy}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="flex-1 accent-[var(--color-accent)]"
                  />
                  <span className="font-mono text-sm w-10 text-right">{threshold.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-tertiary mt-8">
              No file to hand?{" "}
              <button
                onClick={showSample}
                disabled={busy}
                className="text-accent font-medium hover:underline disabled:opacity-50"
              >
                View a sample result
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
