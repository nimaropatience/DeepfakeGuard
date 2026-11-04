import type {
  AnalysisResult,
  HistoryResponse,
  JobStatus,
  ModelsResponse,
} from "./types";

const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function assetUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : apiUrl(path);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), init);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Cannot reach the DeepfakeGuard API: ${error.message}`
        : "Cannot reach the DeepfakeGuard API.",
    );
  }

  if (!response.ok) {
    const body = await response.text();
    let detail = body;
    try {
      const parsed: unknown = JSON.parse(body);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "detail" in parsed &&
        typeof parsed.detail === "string"
      ) {
        detail = parsed.detail;
      } else if (
        typeof parsed === "object" &&
        parsed !== null &&
        "error" in parsed &&
        typeof parsed.error === "string"
      ) {
        detail = parsed.error;
      }
    } catch {
      detail = body || response.statusText;
    }
    throw new Error(`API request failed (${response.status}): ${detail}`);
  }

  return (await response.json()) as T;
}

export async function uploadVideo(
  file: File,
  modelId: string,
  threshold: number,
): Promise<{ job_id: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("model_id", modelId);
  form.append("threshold", String(threshold));
  const response = await request<{ job_id?: string; error?: string }>(
    "/api/analyze/video",
    { method: "POST", body: form },
  );
  if (!response.job_id) {
    throw new Error(response.error || "The API did not return an analysis job ID.");
  }
  return { job_id: response.job_id };
}

export async function uploadImage(
  file: File,
  modelId: string,
  threshold: number,
): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("model_id", modelId);
  form.append("threshold", String(threshold));
  const response = await request<AnalysisResult | { error: string }>(
    "/api/analyze/image",
    { method: "POST", body: form },
  );
  if ("error" in response) throw new Error(response.error);
  return response;
}

export function getJob(jobId: string): Promise<JobStatus> {
  return request(`/api/jobs/${encodeURIComponent(jobId)}`);
}

export function getHistory(page = 1): Promise<HistoryResponse> {
  return request(`/api/history?page=${page}&per_page=20`);
}

export function getHistoryResult(id: number): Promise<AnalysisResult> {
  return request(`/api/history/${id}`);
}

export function getModels(): Promise<ModelsResponse> {
  return request("/api/models");
}
