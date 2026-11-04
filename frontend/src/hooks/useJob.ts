/** Hook to poll a job until it completes. */

import { useQuery } from "@tanstack/react-query";
import { getJobStatus } from "@/lib/api";
import type { JobStatus } from "@/lib/types";

export function useJob(jobId: string | null) {
  return useQuery<JobStatus>({
    queryKey: ["job", jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data as JobStatus | undefined;
      if (!data) return 1000;
      if (data.status === "complete" || data.status === "failed") return false;
      return 1000; // Poll every second while processing
    },
  });
}
