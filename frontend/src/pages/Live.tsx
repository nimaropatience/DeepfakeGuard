import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, CameraOff, Circle, LoaderCircle, Radio, ShieldCheck } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { useLiveSocket } from "../hooks/useLiveSocket";

export function Live() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { state, result, error: socketError, connect, sendFrame, disconnect } = useLiveSocket();

  const stopCamera = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    disconnect();
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      connect();
    } catch (caught) {
      setCameraError(caught instanceof Error ? caught.message : "Unable to access the camera.");
    }
  };

  useEffect(() => {
    if (state !== "connected" || !videoRef.current) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("This browser cannot capture camera frames.");
      return;
    }
    timerRef.current = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      canvas.width = 480;
      canvas.height = Math.round(480 * video.videoHeight / video.videoWidth) || 360;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) sendFrame(blob);
      }, "image/jpeg", 0.72);
    }, 750);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [state, sendFrame]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const scanning = state === "connected";
  const score = result?.score ?? null;

  return (
    <div className="container page-content">
      <Reveal>
        <div className="page-heading">
          <div><span className="eyebrow">REAL-TIME ANALYSIS / 02</span><h1>Live scan<span>.</span></h1></div>
          <p>Preview the live camera analysis. Camera frames are sent to the configured API for scoring.</p>
        </div>
      </Reveal>
      <div className="live-layout">
        <Card className="live-view-card" padded={false}>
          <div className="live-view-top"><span><span className={`live-dot${scanning ? " active" : ""}`} />{scanning ? "LIVE ANALYSIS" : state === "connecting" ? "CONNECTING" : "CAMERA OFF"}</span><span>{result?.fps ? `${result.fps} FPS` : "— FPS"}</span></div>
          <div className="live-view">
            <video ref={videoRef} muted playsInline />
            {!streamRef.current && (
              <div className="camera-placeholder"><span className="camera-icon"><CameraOff size={26} /></span><strong>Camera preview is off</strong><span>Start the scan to enable your camera.</span></div>
            )}
            <div className="camera-corners"><i /><i /><i /><i /></div>
            {result?.face_box && (
              <div
                className="face-detection-box"
                style={{
                  left: `${(result.face_box.x / 640) * 100}%`,
                  top: `${(result.face_box.y / 480) * 100}%`,
                  width: `${(result.face_box.width / 640) * 100}%`,
                  height: `${(result.face_box.height / 480) * 100}%`,
                }}
              />
            )}
            {scanning && <div className="live-scan-line" />}
            <div className="live-overlay-label"><Circle size={10} fill="currentColor" /> {scanning ? "FRAME CAPTURE ACTIVE" : "AWAITING CAMERA"}</div>
          </div>
          <div className="live-view-footer">
            {scanning ? (
              <Button variant="secondary" onClick={stopCamera}><CameraOff size={16} /> Stop scan</Button>
            ) : (
              <Button onClick={() => void startCamera()} disabled={state === "connecting"}>
                {state === "connecting" ? <LoaderCircle size={16} className="spin" /> : <Camera size={16} />}
                {state === "connecting" ? "Connecting..." : "Start live scan"}
              </Button>
            )}
            <span><ShieldCheck size={14} /> Camera permission required</span>
          </div>
        </Card>
        <div className="live-sidebar">
          <Card className="live-score-card">
            <span className="eyebrow">CURRENT FRAME SIGNAL</span>
            <div className="live-score-value">
              {score === null ? "—" : <>{Math.round(score * 100)}<small>%</small></>}
            </div>
            <div className="live-score-meter"><i style={{ width: `${score === null ? 0 : score * 100}%` }} /></div>
            <div className="score-ends"><span>LIKELY REAL</span><span>LIKELY FAKE</span></div>
            <div className={`live-verdict${result?.verdict?.includes("Fake") ? " flagged" : ""}`}>{result?.verdict ?? "No signal yet"}</div>
          </Card>
          <Card className="live-connection-card">
            <div className="panel-heading"><div><span className="eyebrow">CONNECTION</span><h3>Analysis stream</h3></div><Radio size={18} /></div>
            <div className="connection-row"><span>WebSocket</span><strong className={`connection-state ${state}`}>{state}</strong></div>
            <div className="connection-row"><span>Analysis mode</span><strong>{result?.demo_mode ? "Demo" : "Live"}</strong></div>
            {result?.error && <p className="live-api-error">{result.error}</p>}
          </Card>
          {(cameraError || socketError) && <div className="error-banner"><AlertCircle size={16} /><span>{cameraError || socketError}</span></div>}
          <div className="live-privacy"><ShieldCheck size={16} /><p>Use this preview as an experimental signal, not a definitive authenticity judgment.</p></div>
        </div>
      </div>
    </div>
  );
}
