import { useEffect, useState } from "react";
import { AlertCircle, ArrowUpRight, Cpu, Database, Layers3, LoaderCircle, ScanFace } from "lucide-react";
import { Link } from "react-router-dom";
import { getModels } from "../lib/api";
import type { ModelInfo } from "../lib/types";
import { Card } from "../components/ui/Card";
import { Reveal } from "../components/ui/Reveal";

export function Models() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getModels()
      .then((response) => {
        if (!active) return;
        setModels(response.models);
        setDemoMode(response.demo_mode);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load models.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="container page-content">
      <Reveal>
        <div className="page-heading">
          <div><span className="eyebrow">MODEL REGISTRY / 04</span><h1>Meet the models<span>.</span></h1></div>
          <p>Compare the available architectures and understand what powers an analysis.</p>
        </div>
      </Reveal>
      {demoMode && <div className="demo-notice"><span className="pulse-dot" /> DEMO MODE <span>Weights are unavailable. Predictions are simulated and are for interface exploration only.</span></div>}
      {error && <div className="error-banner"><AlertCircle size={17} /><span>{error}</span></div>}
      {loading && <div className="loading-state"><LoaderCircle className="spin" /> Loading model registry...</div>}
      <div className="models-grid">
        {models.map((model, index) => (
          <Reveal key={model.id} className="model-reveal">
            <Card className={`model-card${model.is_default ? " model-default" : ""}`}>
              <div className="model-card-top">
                <span className="model-index">0{index + 1} / MODEL</span>
                {model.is_default && <span className="default-badge">DEFAULT</span>}
              </div>
              <div className="model-art"><div className="model-art-ring"><ScanFace size={31} /></div><span className="model-art-lines" /></div>
              <h2>{model.name}</h2>
              <p>{model.description}</p>
              <div className="model-architecture"><Layers3 size={15} /><span>{model.architecture}</span></div>
              <div className="model-facts">
                <div><span>INPUT SIZE</span><strong>{model.input_size}</strong></div>
                <div><span>PARAMETERS</span><strong>{model.param_count}</strong></div>
                <div><span>FILE SIZE</span><strong>{model.file_size}</strong></div>
              </div>
              <div className="model-benchmarks">
                <div><span>DFDC AUC</span><strong>{model.dfdc_auc || "—"}</strong></div>
                <div><span>CELEB-DF AUC</span><strong>{model.celeb_df_auc || "—"}</strong></div>
              </div>
              <div className="model-status"><span className={`model-status-dot${demoMode ? " demo" : ""}`} />{demoMode ? "Available in demo mode" : "Registry available"} <Cpu size={14} /></div>
            </Card>
          </Reveal>
        ))}
      </div>
      {!loading && models.length === 0 && !error && <Card className="empty-state"><Database size={24} /><p>No models are registered.</p></Card>}
      <div className="models-cta">
        <div><span className="eyebrow">READY TO EXPLORE?</span><h2>Put the pipeline to work.</h2></div>
        <Link to="/detect" className="button button-primary">Start an analysis <ArrowUpRight size={15} /></Link>
      </div>
    </div>
  );
}
