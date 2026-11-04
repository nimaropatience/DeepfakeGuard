import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Check, FileImage, FileVideo2, LoaderCircle, RotateCcw, UploadCloud } from "lucide-react";
import { useJob } from "../hooks/useJob";
import { getModels, uploadImage, uploadVideo } from "../lib/api";
import type { AnalysisResult, ModelInfo } from "../lib/types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Reveal } from "../components/ui/Reveal";
import { EarChart } from "../components/results/EarChart";
import { GradCamGallery } from "../components/results/GradCamGallery";
import { StatTiles } from "../components/results/StatTiles";
import { TechnicalDetails } from "../components/results/TechnicalDetails";
import { VerdictCard } from "../components/results/VerdictCard";

type MediaKind = "video" | "image";
const acceptTypes: Record<MediaKind, string> = {
  video: ".mp4,.mov,.avi,.webm,.mkv",
  image: ".jpg,.jpeg,.png,.webp",
};

export function Detect() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<MediaKind>("video");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelId, setModelId] = useState("hybrid_fusion");
  const [threshold, setThreshold] = useState(0.5);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { job, error: jobError } = useJob(jobId);

  useEffect(() => {
    let active = true;
    getModels()
      .then(({ models: available }) => {
        if (!active) return;
        setModels(available);
        const preferred = available.find((item) => item.is_default);
        if (preferred) setModelId(preferred.id);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load models.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!job) return;
    if (job.status === "complete" && job.result) {
      setResult(job.result);
      setBusy(false);
      setError(null);
    } else if (job.status === "complete") {
      setBusy(false);
      setError("The analysis job completed without returning a result.");
    } else if (job.status === "failed") {
      setBusy(false);
      setError(job.error || "The analysis job failed.");
    }
  }, [job]);

  useEffect(() => {
    if (!jobError) return;
    setBusy(false);
    setError(jobError);
    setJobId(null);
  }, [jobError]);

  useEffect(() => {
    if (!file || kind !== "image") {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, kind]);

  const handleFile = (selected: File | undefined) => {
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setJobId(null);
    setError(null);
  };

  const analyze = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setJobId(null);
    try {
      if (kind === "image") {
        setResult(await uploadImage(file, modelId, threshold));
        setBusy(false);
      } else {
        const response = await uploadVideo(file, modelId, threshold);
        if (!response.job_id) throw new Error("The API did not return an analysis job ID.");
        setJobId(response.job_id);
      }
    } catch (caught) {
      setBusy(false);
      setError(caught instanceof Error ? caught.message : "Could not start the analysis.");
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setJobId(null);
    setError(null);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const progress = job?.progress ?? 0;

  return (
    <div className="container page-content">
      <Reveal>
        <div className="page-heading">
          <div><span className="eyebrow">MEDIA FORENSICS / 01</span><h1>Analyze a file<span>.</span></h1></div>
          <p>Inspect a video or image for visual signals of manipulation. Results include model evidence and technical details.</p>
        </div>
      </Reveal>

      {!result && (
        <div className="detect-layout">
          <Card className="upload-card">
            <div className="card-title-row">
              <div><span className="eyebrow">STEP 01</span><h2>Select your media</h2></div>
              <span className="step-counter">01 <i /> 03</span>
            </div>
            <div className="media-switch">
              <button className={kind === "video" ? "selected" : ""} onClick={() => { setKind("video"); setFile(null); }}>
                <FileVideo2 size={17} /> Video
              </button>
              <button className={kind === "image" ? "selected" : ""} onClick={() => { setKind("image"); setFile(null); }}>
                <FileImage size={17} /> Image
              </button>
            </div>
            <button
              className={`drop-zone${file ? " has-file" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); handleFile(event.dataTransfer.files[0]); }}
            >
              <input
                ref={inputRef}
                type="file"
                accept={acceptTypes[kind]}
                hidden
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              {previewUrl ? (
                <img className="image-preview" src={previewUrl} alt="Selected image preview" />
              ) : (
                <span className="upload-icon"><UploadCloud size={23} /></span>
              )}
              {file ? (
                <><strong>{file.name}</strong><span>{(file.size / (1024 * 1024)).toFixed(2)} MB · Click to replace</span></>
              ) : (
                <><strong>Drop your {kind} here</strong><span>or <u>browse files</u> from your device</span></>
              )}
              <small>SUPPORTED: {kind === "video" ? "MP4 · MOV · AVI · WEBM · MKV" : "JPG · PNG · WEBP"}</small>
            </button>

            <div className="field-grid">
              <label className="form-field">
                <span>Analysis model</span>
                <select value={modelId} onChange={(event) => setModelId(event.target.value)} disabled={busy}>
                  {models.length === 0 && <option value="hybrid_fusion">Hybrid Fusion</option>}
                  {models.map((model) => <option value={model.id} key={model.id}>{model.name}{model.is_default ? " · DEFAULT" : ""}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Decision threshold <b>{Math.round(threshold * 100)}%</b></span>
                <input type="range" min="0.1" max="0.9" step="0.05" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} disabled={busy} />
                <span className="range-labels"><small>MORE SENSITIVE</small><small>MORE CONSERVATIVE</small></span>
              </label>
            </div>

            {error && <div className="error-banner"><AlertCircle size={17} /><span>{error}</span></div>}
            {jobError && <div className="error-banner"><AlertCircle size={17} /><span>{jobError}</span></div>}
            {busy && (
              <div className="job-progress">
                <div className="progress-title"><LoaderCircle size={16} className="spin" /><span>{job?.stage || "Preparing analysis..."}</span><strong>{Math.round(progress * 100)}%</strong></div>
                <div className="progress-track"><span style={{ width: `${Math.max(4, progress * 100)}%` }} /></div>
              </div>
            )}
            <Button className="analyze-button" onClick={() => void analyze()} disabled={!file || busy}>
              {busy ? "Analysis in progress" : "Run analysis"} {busy ? <LoaderCircle size={16} className="spin" /> : <ArrowRight size={16} />}
            </Button>
          </Card>

          <aside className="detect-aside">
            <Card className="aside-note">
              <span className="aside-note-icon"><Check size={17} /></span>
              <span className="eyebrow">YOUR MEDIA, YOUR CALL</span>
              <h3>Evidence, not absolutes.</h3>
              <p>Model predictions are signals to help guide review. They should not be treated as definitive proof of authenticity or manipulation.</p>
            </Card>
            <div className="aside-checks">
              <span><Check size={14} /> Frame-level visual evidence</span>
              <span><Check size={14} /> Transparent model settings</span>
              <span><Check size={14} /> Inspectable result details</span>
            </div>
            <div className="aside-format"><span className="eyebrow">FILE SIZE LIMIT</span><strong>200 <small>MB</small></strong><span>for video uploads</span></div>
          </aside>
        </div>
      )}

      {busy && job?.status === "complete" && !job.result && (
        <div className="error-banner"><AlertCircle size={17} />Job completed but returned no analysis result.</div>
      )}

      {result && (
        <section className="results-section">
          <div className="results-heading">
            <div><span className="eyebrow">ANALYSIS REPORT · {result.id?.slice(0, 8) || "IMAGE"}</span><h2>Here’s what we found.</h2><p>{file?.name ?? "Retrieved analysis"} · {new Date(result.timestamp).toLocaleString()}</p></div>
            <Button variant="secondary" onClick={reset}><RotateCcw size={15} /> New analysis</Button>
          </div>
          <VerdictCard result={result} />
          <StatTiles result={result} />
          <div className="result-section-title"><span className="eyebrow">VISUAL EXPLANATION</span><h3>Frames that shaped the result</h3></div>
          <Card className="result-panel" padded>
            <GradCamGallery frames={result.gradcam_frames} />
          </Card>
          <div className="results-two-col">
            <Card className="result-panel">
              <div className="panel-heading"><div><span className="eyebrow">TEMPORAL SIGNAL</span><h3>Eye movement</h3></div><span className="metric-pill">{result.eye_metrics.eye_verdict}</span></div>
              <EarChart metrics={result.eye_metrics} />
              <div className="ear-summary"><span>Variability <strong>{result.eye_metrics.ear_std_dev.toFixed(4)}</strong></span><span>EAR range <strong>{result.eye_metrics.ear_range.toFixed(4)}</strong></span><span>Blinks <strong>{result.eye_metrics.blink_count}</strong></span></div>
            </Card>
            <Card className="result-panel">
              <div className="panel-heading"><div><span className="eyebrow">FRAME CONSISTENCY</span><h3>Probability by frame</h3></div></div>
              <div className="frame-score-list">
                {result.per_frame_scores.map((frame) => (
                  <div className="frame-score-row" key={frame.frame_index}>
                    <span>F{String(frame.frame_index + 1).padStart(2, "0")}</span>
                    <div className="score-bar"><i style={{ width: `${Math.round(frame.score * 100)}%` }} /></div>
                    <strong>{Math.round(frame.score * 100)}%</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card className="result-panel technical-panel">
            <div className="panel-heading"><div><span className="eyebrow">AUDIT TRAIL</span><h3>Technical details</h3></div></div>
            <TechnicalDetails result={result} />
          </Card>
        </section>
      )}
    </div>
  );
}
