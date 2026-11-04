import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveResult } from "../lib/types";

type SocketState = "disconnected" | "connecting" | "connected" | "error";

export function useLiveSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<SocketState>("disconnected");
  const [result, setResult] = useState<LiveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (
      socketRef.current?.readyState === WebSocket.OPEN ||
      socketRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    const apiBase = new URL(import.meta.env.VITE_API_URL ?? window.location.origin);
    apiBase.protocol = apiBase.protocol === "https:" ? "wss:" : "ws:";
    apiBase.pathname = `${apiBase.pathname.replace(/\/$/, "")}/ws/live`;
    apiBase.search = "";
    const socket = new WebSocket(apiBase);
    socketRef.current = socket;
    setState("connecting");
    setError(null);

    socket.onopen = () => setState("connected");
    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as LiveResult;
        setResult(data);
        if (data.error) setError(data.error);
      } catch {
        setError("Received an invalid response from the live analysis service.");
      }
    };
    socket.onerror = () => {
      setState("error");
      setError("Could not connect to the live analysis service.");
    };
    socket.onclose = () => setState("disconnected");
  }, []);

  const sendFrame = useCallback((frame: Blob) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(frame);
    }
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
    setState("disconnected");
    setResult(null);
  }, []);

  useEffect(() => disconnect, [disconnect]);

  return { state, result, error, connect, sendFrame, disconnect };
}
