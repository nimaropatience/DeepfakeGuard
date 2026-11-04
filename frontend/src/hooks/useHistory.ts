import { useCallback, useEffect, useState } from "react";
import { getHistory } from "../lib/api";
import type { HistoryItem } from "../lib/types";

export function useHistory(page = 1) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getHistory(page);
      setItems(response.items);
      setTotal(response.total);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load history.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, total, loading, error, reload };
}
