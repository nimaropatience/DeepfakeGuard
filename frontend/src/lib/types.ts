/** TypeScript interfaces matching the backend schemas. */

export interface FrameScore {
  frame_index: number;
  timestamp: number;
  score: number;
}

export interface GradCamFrame {
  frame_index: number;
  timestamp: number;
  score: number;
  original_url: string;
  heatmap_url: string;
}

export interface EyeMetrics {
  ear_left: number[];
  ear_right: number[];
  lr_difference: number[];
  ear_std_dev: number;
  ear_range: number;
  blink_count: number;
  eye_verdict: string;
}

export interface AnalysisResult {
  id?: string;
  verdict: string;
  probability: number;
  threshold: number;
  raw_logit: number;
  device: string;
  model_id: string;
  total_frames: number;
  fps: number;
  frames_sampled: number;
  faces_detected: string;
  duration: number;
  resolution: string;
  processing_time: number;
  timestamp: string;
  file_sha256: string;
  per_frame_scores: FrameScore[];
  gradcam_frames: GradCamFrame[];
  eye_metrics: EyeMetrics;
  demo_mode?: boolean;
}

export interface JobStatus {
  job_id: string;
  status: "queued" | "processing" | "complete" | "failed";
  stage?: string;
  progress: number;
  result?: AnalysisResult;
  error?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  architecture: string;
  input_size: string;
  param_count: string;
  file_size: string;
  dfdc_auc?: string;
  celeb_df_auc?: string;
  is_default: boolean;
}

export interface HistoryItem {
  id: number;
  job_id: string;
  filename: string;
  verdict: string;
  probability: number;
  model_id: string;
  processing_time: number;
  timestamp: string;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  per_page: number;
}
