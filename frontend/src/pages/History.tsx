import { useState } from "react";
import { AlertCircle, ArrowDown, ArrowUpRight, Clock3, FileSearch, LoaderCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useHistory } from "../hooks/useHistory";
import { getHistoryResult } from "../lib/api";
import type { AnalysisResult } from "../lib/types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Reveal } from "../components/ui/Reveal";
import { VerdictCard } from "../components/results/VerdictCard";

function tone(verdict: string) {
  return verdict.toLowerCase().includes("fake") ? "danger" : verdict.toLowerCase().includes("real") ? "safe" : "neutral";
}

export function History() {
  const { items, total, loading, error, reload } = useHistory();
  const [selected, setSelected] = useState<AnalysisResult | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const openResult = async (id: number) => {
    setLoadingId(id);
    setDetailError(null);
    try {
      setSelected(await getHistoryResult(id));
    } catch (caught) {
      setDetailError(caught instanceof Error ? caught.message : "Could not open this result.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container page-content">
      <Reveal>
        <div className="page-heading">
          <div><span className="eyebrow">YOUR WORKSPACE / 03</span><h1>Analysis history<span>.</span></h1></div>
          <p>Revisit completed media scans and open a saved report to review its details.</p>
        </div>
      </Reveal>
      <div className="history-toolbar">
        <span><strong>{total}</strong> {total === 1 ? "analysis" : "analyses"} recorded</span>
        <Button size="small" variant="secondary" onClick={() => void reload()} disabled={loading}><RefreshCw size={14} /> Refresh</Button>
      </div>
      {error && <div className="error-banner"><AlertCircle size={17} /><span>{error}</span></div>}
      {detailError && <div className="error-banner"><AlertCircle size={17} /><span>{detailError}</span></div>}
      {selected && (
        <div className="history-detail">
          <div className="results-heading">
            <div><span className="eyebrow">SAVED REPORT</span><h2>Analysis details</h2></div>
            <Button variant="secondary" onClick={() => setSelected(null)}>Close report</Button>
          </div>
          <VerdictCard result={selected} />
          <Card className="result-panel">
            <div className="panel-heading"><div><span className="eyebrow">FILE FINGERPRINT</span><h3>Technical reference</h3></div></div>
            <code className="history-hash">{selected.file_sha256}</code>
          </Card>
        </div>
      )}
      <div className="history-list">
        {loading && items.length === 0 && <div className="loading-state"><LoaderCircle className="spin" /> Loading analyses...</div>}
        {!loading && !error && items.length === 0 && (
          <Card className="empty-state">
            <span className="empty-icon"><FileSearch size={25} /></span>
            <h2>No analyses yet</h2><p>Your completed scans will appear here.</p>
            <Link to="/detect" className="button button-primary">Analyze a file <ArrowUpRight size={15} /></Link>
          </Card>
        )}
        {items.map((item, index) => (
          <Card className="history-row" key={item.id} onClick={() => void openResult(item.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") void openResult(item.id); }}>
            <span className="history-index">{String(index + 1).padStart(2, "0")}</span>
            <div className="history-file">
              <strong>{item.filename}</strong>
              <span><Clock3 size={13} /> {new Date(item.timestamp).toLocaleString()}</span>
            </div>
            <span className={`verdict-chip ${tone(item.verdict)}`}>{item.verdict}</span>
            <div className="history-prob"><span>FAKE SCORE</span><strong>{Math.round(item.probability * 100)}%</strong></div>
            <span className="history-model">{item.model_id.replace(/_/g, " ")}</span>
            <span className="history-open">{loadingId === item.id ? <LoaderCircle size={17} className="spin" /> : <ArrowDown size={17} />}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
