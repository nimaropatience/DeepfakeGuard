/** Display formatters shared by the results views. */

/** 3.42 → "00:03.4" */
export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
}

/** 12.3 → "0:12" */
export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** "1920x1080" → "1080p" */
export function formatResolution(resolution: string): string {
  const height = resolution.split("x")[1];
  return height ? `${height}p` : resolution;
}

/** "a3f8c9…e7b2d1" */
export function shortenHash(hash: string): string {
  return hash.length > 14 ? `${hash.slice(0, 6)}...${hash.slice(-6)}` : hash;
}

/** "2026-11-03T14:22:05.123" → "2026-11-03T14:22" */
export function formatIsoMinute(iso: string): string {
  return iso.slice(0, 16);
}
