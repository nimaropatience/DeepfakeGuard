import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Radio, Circle, StopCircle } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { useLiveSocket } from "@/hooks/useLiveSocket";

export default function Live() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { scores, connected, connect, disconnect } = useLiveSocket();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      alert("Camera access denied.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const startStreaming = () => {
    connect();
    setStreaming(true);

    // Capture a frame every 500ms and send as base64
    intervalRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
      // The WebSocket demo mode doesn't actually process frames,
      // but this shows the capture pipeline for real inference.
    }, 500);
  };

  const stopStreaming = () => {
    disconnect();
    setStreaming(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      stopStreaming();
    };
  }, []);

  const latestScore = scores.length > 0 ? scores[scores.length - 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
      <Reveal className="text-center">
        <motion.h1 variants={fadeUp} className="font-serif text-3xl sm:text-4xl mb-2">
          Live detection
        </motion.h1>
        <motion.p variants={fadeUp} className="text-secondary">
          Real-time webcam analysis via WebSocket. Currently runs in demo mode.
        </motion.p>
      </Reveal>

      {/* Video feed */}
      <div className="relative bg-black rounded-card overflow-hidden aspect-video max-w-2xl mx-auto">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/50 text-sm">Camera not active</p>
          </div>
        )}

        {/* Live overlay */}
        {streaming && latestScore && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
            <div className="flex items-center gap-2 text-xs mb-1">
              <Circle size={8} className="fill-red-500 text-red-500 animate-pulse" />
              <span>LIVE</span>
            </div>
            <p className="text-2xl font-mono font-bold">
              {(latestScore.probability * 100).toFixed(1)}%
            </p>
            <p
              className={`text-xs font-semibold ${
                latestScore.verdict === "FAKE"
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {latestScore.verdict}
            </p>
          </div>
        )}

        {/* Connection badge */}
        {streaming && (
          <div className="absolute top-4 right-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                connected
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              <Circle size={6} className={connected ? "fill-green-400" : "fill-yellow-400"} />
              {connected ? "Connected" : "Connecting…"}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 flex-wrap">
        {!cameraActive ? (
          <Button onClick={startCamera}>
            <Radio size={16} className="mr-2" />
            Start camera
          </Button>
        ) : !streaming ? (
          <>
            <Button onClick={startStreaming}>
              <Circle size={16} className="mr-2 fill-current" />
              Start detection
            </Button>
            <Button variant="outlined" onClick={stopCamera}>
              Stop camera
            </Button>
          </>
        ) : (
          <Button variant="outlined" onClick={stopStreaming}>
            <StopCircle size={16} className="mr-2" />
            Stop detection
          </Button>
        )}
      </div>

      {/* Score history */}
      {scores.length > 0 && (
        <div className="bg-card rounded-card p-6 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-sm font-semibold mb-3">Score history (last 20)</h3>
          <div className="flex items-end gap-1 h-24">
            {scores.slice(-20).map((s, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all"
                style={{
                  height: `${s.probability * 100}%`,
                  backgroundColor:
                    s.probability > 0.5
                      ? "var(--color-fake-red)"
                      : "var(--color-real-green)",
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-tertiary mt-1">
            <span>Older</span>
            <span>Recent</span>
          </div>
        </div>
      )}
    </div>
  );
}
