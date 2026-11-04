/** A fixed example result so the results screen can be previewed without uploading. */

import type { AnalysisResult } from "./types";

const left = [0.262, 0.255, 0.251, 0.257, 0.246, 0.254, 0.249, 0.259, 0.252, 0.256, 0.243, 0.249, 0.253, 0.247, 0.256, 0.252];
const right = [0.251, 0.244, 0.240, 0.246, 0.235, 0.243, 0.238, 0.248, 0.241, 0.245, 0.232, 0.238, 0.242, 0.236, 0.245, 0.241];

export const SAMPLE_RESULT: AnalysisResult = {
  id: "sample",
  verdict: "Likely Fake",
  probability: 0.873,
  threshold: 0.5,
  raw_logit: 1.932,
  device: "CPU",
  model_id: "hybrid_fusion",
  total_frames: 360,
  fps: 30,
  frames_sampled: 16,
  faces_detected: "15/16",
  duration: 12,
  resolution: "1920x1080",
  processing_time: 2.4,
  timestamp: "2026-11-03T14:22:00",
  file_sha256: "a3f8c94b1d0e6f2a7c5b8e9d3f1a6c4b2e8d7f0a9c3b5e1d4f6a8c2b0e7b2d1",
  per_frame_scores: [],
  // Image URLs intentionally don't exist, so the gallery shows gradient placeholders
  gradcam_frames: [
    [1.2, 0.91],
    [3.4, 0.89],
    [5.1, 0.87],
    [7.8, 0.85],
    [10.2, 0.82],
  ].map(([timestamp, score], i) => ({
    frame_index: Math.round(timestamp * 30),
    timestamp,
    score,
    original_url: `/outputs/gradcam/sample/frame_${i}_original.jpg`,
    heatmap_url: `/outputs/gradcam/sample/frame_${i}_heatmap.jpg`,
  })),
  eye_metrics: {
    ear_left: left,
    ear_right: right,
    lr_difference: [0.028, 0.031, 0.033, 0.029, 0.032, 0.030, 0.033, 0.031, 0.029, 0.032, 0.030, 0.033, 0.031, 0.029, 0.032, 0.030],
    ear_std_dev: 0.012,
    ear_range: 0.041,
    blink_count: 0,
    eye_verdict: "Suspicious: very low eye-movement variability",
  },
  demo_mode: true,
};
