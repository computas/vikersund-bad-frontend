import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OptimeringResultat, OptimeringStatus } from "@/types";
import { API_URL } from "@/lib/api";

export type SolverEvent =
  | { type: "klargjoring"; pasienter: number; behandlere: number; behov: number; grupper: number }
  | { type: "modellbygging"; variabler: number; constraints: number }
  | { type: "solving_start"; totalBehov: number }
  | { type: "solution"; scheduled: number; total: number; objective: number; bound: number; elapsed: number; solutionCount: number }
  | { type: "done"; resultat: OptimeringResultat }
  | { type: "error"; message: string };

async function resetOptimeringFn(): Promise<void> {
  const response = await fetch(`${API_URL}/optimer/reset`, { method: "POST" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Ukjent feil" }));
    throw new Error(error.detail || `Feil ved nullstilling: ${response.status}`);
  }
}

async function fetchOptimeringStatus(): Promise<OptimeringStatus> {
  const response = await fetch(`${API_URL}/optimer/status`);
  if (!response.ok) {
    throw new Error(`Feil ved henting av status: ${response.status}`);
  }
  return response.json();
}

export function useOptimering() {
  const queryClient = useQueryClient();

  const [events, setEvents] = useState<SolverEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamResult, setStreamResult] = useState<OptimeringResultat | null>(null);
  const [streamError, setStreamError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const statusQuery = useQuery({
    queryKey: ["optimer-status"],
    queryFn: fetchOptimeringStatus,
  });

  const startOptimering = useCallback(async (opts?: { startDate?: string }) => {
    if (isStreaming) return;

    setEvents([]);
    setStreamResult(null);
    setStreamError(null);
    setIsStreaming(true);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const url = opts?.startDate
        ? `${API_URL}/optimer/stream?start_date=${opts.startDate}`
        : `${API_URL}/optimer/stream`;
      const response = await fetch(url, {
        method: "POST",
        signal: abort.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Ukjent feil" }));
        throw new Error(error.detail || `Feil ved optimering: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Ingen response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: SolverEvent = JSON.parse(line.slice(6));
            setEvents((prev) => [...prev, event]);

            if (event.type === "done") {
              setStreamResult(event.resultat);
              queryClient.invalidateQueries({ queryKey: ["avtaler"] });
              queryClient.invalidateQueries({ queryKey: ["ikke-planlagt"] });
              queryClient.invalidateQueries({ queryKey: ["optimer-status"] });
            } else if (event.type === "error") {
              setStreamError(new Error(event.message));
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStreamError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming, queryClient]);

  const resetMutation = useMutation({
    mutationFn: resetOptimeringFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avtaler"] });
      queryClient.invalidateQueries({ queryKey: ["ikke-planlagt"] });
      queryClient.invalidateQueries({ queryKey: ["optimer-status"] });
      setStreamResult(null);
      setStreamError(null);
      setEvents([]);
    },
  });

  return {
    status: statusQuery.data,
    isLoadingStatus: statusQuery.isLoading,
    runOptimering: startOptimering,
    isOptimering: isStreaming,
    optimeringResultat: streamResult,
    optimeringError: streamError,
    resetOptimering: resetMutation.mutate,
    isResetting: resetMutation.isPending,
    events,
  };
}
