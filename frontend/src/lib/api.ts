/** API client for the DeepfakeGuard backend. */

const API_BASE = import.meta.env.VITE_API_URL || "";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** Upload a video for analysis. Returns job_id. */
export async function analyzeVideo(
  file: File,
  modelId: string = "hybrid_fusion",
  threshold: number = 0.5
): Promise<{ job_id: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("model_id", modelId);
  form.append("threshold", threshold.toString());
  return fetchJSON("/api/analyze/video", { method: "POST", body: form });
}

/** Upload an image for synchronous analysis. */
export async function analyzeImage(
  file: File,
  modelId: string = "hybrid_fusion",
  threshold: number = 0.5
) {
  const form = new FormData();
  form.append("file", file);
  form.append("model_id", modelId);
  form.append("threshold", threshold.toString());
  return fetchJSON("/api/analyze/image", { method: "POST", body: form });
}

/** Poll job status. */
export async function getJobStatus(jobId: string) {
  return fetchJSON(`/api/jobs/${jobId}`);
}

/** List analysis history. */
export async function getHistory(
  page: number = 1,
  verdict?: string,
  modelId?: string
) {
  const params = new URLSearchParams({ page: page.toString() });
  if (verdict) params.set("verdict", verdict);
  if (modelId) params.set("model_id", modelId);
  return fetchJSON(`/api/history?${params}`);
}

/** Get one history record. */
export async function getHistoryItem(id: number) {
  return fetchJSON(`/api/history/${id}`);
}

/** List available models. */
export async function getModels() {
  return fetchJSON("/api/models");
}

/** Health check. */
export async function healthCheck() {
  return fetchJSON("/api/health");
}
