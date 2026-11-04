/** Hook to fetch analysis history. */

import { useQuery } from "@tanstack/react-query";
import { getHistory } from "@/lib/api";

export function useHistory(page = 1, verdict?: string, modelId?: string) {
  return useQuery({
    queryKey: ["history", page, verdict, modelId],
    queryFn: () => getHistory(page, verdict, modelId),
  });
}
