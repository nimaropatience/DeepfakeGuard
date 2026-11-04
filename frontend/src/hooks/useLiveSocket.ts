/** WebSocket hook for live webcam analysis. */

import { useCallback, useEffect, useRef, useState } from "react";

export interface LiveResult {
  score: number;
  verdict: string;
  face_box: { x: number; y: number; width: number; height: number };
  fps: number;
  demo_mode?: boolean;
}

export function useLiveSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [result, setResult] = useState<LiveResult | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/ws/live`;
    const socket = new WebSocket(url);

    socket.onopen = () => setConnected(true);
    socket.onclose = () => {
      setConnected(false);
      setResult(null);
    };
    socket.onmessage = (event) => {
      try {
        setResult(JSON.parse(event.data));
      } catch {
        // ignore parse errors
      }
    };

    ws.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    ws.current?.close();
    ws.current = null;
  }, []);

  const sendFrame = useCallback((jpegBlob: Blob) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(jpegBlob);
    }
  }, []);

  useEffect(() => {
    return () => {
      ws.current?.close();
    };
  }, []);

  return { connect, disconnect, sendFrame, connected, result };
}
