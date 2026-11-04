import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Search, ChevronRight, Loader2 } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { useHistory } from "@/hooks/useHistory";
import { ResultsView } from "@/components/results/ResultsView";
import { getHistoryItem } from "@/lib/api";
import type { AnalysisResult, HistoryItem } from "@/lib/types";

export default function History() {
  const [filter, setFilter] = useState("");
  const { data, isLoading, isError } = useHistory(1);
  const [selected, setSelected] = useState<AnalysisResult | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const query = filter.trim().toLowerCase();
  const items = (data?.items ?? []).filter(
    (item) =>
      !query ||
      item.verdict.toLowerCase().includes(query) ||
      item.filename.toLowerCase().includes(query),
  );

  const openItem = async (item: HistoryItem) => {
    setLoadingId(item.id);
    try {
      setSelected(await getHistoryItem(item.id));
    } catch {
      alert("Could not load this analysis.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-8">
      <Reveal className="text-center">
        <motion.h1 variants={fadeUp} className="font-serif text-3xl sm:text-4xl mb-2">
          Analysis history
        </motion.h1>
        <motion.p variants={fadeUp} className="text-secondary">
          Review previous detection results stored in the local database.
        </motion.p>
      </Reveal>

      {/* Search / filter */}
      <div className="flex gap-3 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
          <input
            type="text"
            placeholder="Filter by verdict or filename…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-tertiary"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          /* ── Detail view ── */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-accent hover:underline"
            >
              ← Back to list
            </button>

            <ResultsView result={selected} />
          </motion.div>
        ) : (
          /* ── List view ── */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isLoading && (
              <p className="text-center text-secondary py-12">Loading…</p>
            )}

            {isError && (
              <p className="text-center text-fake-red py-12">
                Could not reach the backend. Is it running on port 8000?
              </p>
            )}

            {!isLoading && !isError && items.length === 0 && (
              <div className="text-center py-16">
                <Clock size={32} className="mx-auto text-tertiary mb-3" />
                <p className="text-secondary mb-1">No analyses yet</p>
                <p className="text-sm text-tertiary">
                  Results will appear here after you{" "}
                  <Link to="/detect" className="text-accent hover:underline">
                    run a detection
                  </Link>.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => openItem(item)}
                  disabled={loadingId !== null}
                  className="w-full text-left bg-card rounded-card-sm p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      item.verdict === "Likely Fake"
                        ? "bg-fake-red-light text-fake-red"
                        : "bg-real-green-light text-real-green"
                    }`}
                  >
                    {(item.probability * 100).toFixed(0)}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.filename} · {item.model_id}
                    </p>
                    <p className="text-xs text-tertiary">
                      {item.verdict} · {item.processing_time.toFixed(2)} s · {item.timestamp}
                    </p>
                  </div>
                  {loadingId === item.id ? (
                    <Loader2 size={16} className="animate-spin text-tertiary shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-tertiary shrink-0" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
