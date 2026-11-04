import { useEffect, useState } from "react";
import { getJob } from "../lib/api";
import type { JobStatus } from "../lib/types";

export function useJob(jobId: string | null) {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setError(null);
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const status = await getJob(jobId);
        if (!active) return;
        setJob(status);
        setError(null);
        if (status.status === "queued" || status.status === "processing") {
          timer = setTimeout(poll, 900);
        }
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "Unable to check job.");
      }
    };

    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [jobId]);

  return { job, error };
}
