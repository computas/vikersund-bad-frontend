"use client";

import { useState, useEffect, useMemo } from "react";
import { SolverEvent } from "@/hooks/useOptimering";

type Phase = "idle" | "klargjoring" | "modellbygging" | "solving" | "done";

type PhaseData = {
  phase: Phase;
  klargjoring: { pasienter: number; behandlere: number; behov: number; grupper: number } | null;
  modellbygging: { variabler: number; constraints: number } | null;
  latestSolution: { scheduled: number; total: number; objective: number; bound: number; elapsed: number; solutionCount: number } | null;
};

function derivePhaseData(events: SolverEvent[]): PhaseData {
  const data: PhaseData = {
    phase: "idle",
    klargjoring: null,
    modellbygging: null,
    latestSolution: null,
  };

  for (const event of events) {
    switch (event.type) {
      case "klargjoring":
        data.phase = "klargjoring";
        data.klargjoring = { pasienter: event.pasienter, behandlere: event.behandlere, behov: event.behov, grupper: event.grupper };
        break;
      case "modellbygging":
        data.phase = "modellbygging";
        data.modellbygging = { variabler: event.variabler, constraints: event.constraints };
        break;
      case "solving_start":
        data.phase = "solving";
        break;
      case "solution":
        data.phase = "solving";
        data.latestSolution = { scheduled: event.scheduled, total: event.total, objective: event.objective, bound: event.bound, elapsed: event.elapsed, solutionCount: event.solutionCount };
        break;
      case "done":
        data.phase = "done";
        break;
      case "error":
        data.phase = "done";
        break;
    }
  }

  return data;
}

function useRotatingMessage(
  meldinger: string[],
  active: boolean,
  intervalMs: number = 4000,
) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [prevMeldinger, setPrevMeldinger] = useState(meldinger);

  if (prevMeldinger !== meldinger) {
    setPrevMeldinger(meldinger);
    setIndex(0);
    setVisible(true);
  }

  useEffect(() => {
    if (!active || meldinger.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % meldinger.length);
        setVisible(true);
      }, 250);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [active, meldinger, intervalMs]);

  return { message: meldinger[index % meldinger.length], visible };
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

const PHASE_SEGMENTS: Phase[] = ["klargjoring", "modellbygging", "solving"];
function RotatingText({ message, visible }: { message: string; visible: boolean }) {
  return (
    <p
      className={`text-xs text-blue-600/70 transition-opacity duration-250 dark:text-blue-400/60 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {message}
    </p>
  );
}

function PhaseCardShell({ label, status, children }: { label: string; status: "completed" | "active" | "upcoming"; children?: React.ReactNode }) {
  if (status === "upcoming") return null;

  return (
    <div
      className={`overflow-hidden rounded-lg transition-all duration-300 ${
        status === "active" ? "bg-blue-50/60 dark:bg-blue-950/20" : ""
      }`}
    >
      <div className="flex items-center gap-2.5 px-3 py-2">
        {status === "completed" ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
            <CheckIcon className="h-3 w-3 text-white" />
          </div>
        ) : (
          <div className="relative h-5 w-5">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <svg className="h-5 w-5 animate-spin text-blue-400/50" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="20 44" />
            </svg>
          </div>
        )}
        <span
          className={`text-sm font-semibold ${
            status === "completed"
              ? "text-zinc-600 dark:text-zinc-400"
              : "text-zinc-900 dark:text-white"
          }`}
        >
          {label}
        </span>
      </div>
      {children && (
        <div className="pb-2.5 pl-10 pr-3">
          {children}
        </div>
      )}
    </div>
  );
}

function KlargjorFaseCard({ status, data }: { status: "completed" | "active" | "upcoming"; data: PhaseData["klargjoring"] }) {
  const meldinger = useMemo(() => {
    if (!data) return ["Laster inn pasienter, behandlere og grupper..."];
    return [
      `Fant ${data.pasienter} pasienter fordelt på ${data.grupper} gruppe${data.grupper !== 1 ? "r" : ""}`,
      `${data.behov} individuelle behandlingstimer skal planlegges`,
      `${data.behandlere} behandlere tilgjengelig denne uka`,
    ];
  }, [data]);

  const { message, visible } = useRotatingMessage(meldinger, status === "active");

  return (
    <PhaseCardShell label="Klargjøring" status={status}>
      {status === "active" && <RotatingText message={message} visible={visible} />}
      {status === "completed" && data && (
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          {data.pasienter} pasienter, {data.behandlere} behandlere, {data.behov} behov
        </p>
      )}
    </PhaseCardShell>
  );
}

function ModellbyggFaseCard({ status, data }: { status: "completed" | "active" | "upcoming"; data: PhaseData["modellbygging"] }) {
  const meldinger = useMemo(() => {
    if (!data) return ["Bygger optimaliseringsmodell..."];
    return [
      `Oppretter ${data.variabler.toLocaleString("no")} variabler for mulige timeplasseringer`,
      `Legger til ${data.constraints.toLocaleString("no")} regler og begrensninger`,
      "Matcher behov med kvalifiserte behandlere...",
      "Sikrer at ingen har to aktiviteter på samme tid...",
      "Reserverer lunsj fra 11:30 til 12:00 for alle...",
    ];
  }, [data]);

  const { message, visible } = useRotatingMessage(meldinger, status === "active");

  return (
    <PhaseCardShell label="Bygger modell" status={status}>
      {status === "active" && <RotatingText message={message} visible={visible} />}
      {status === "completed" && data && (
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          {data.variabler.toLocaleString("no")} variabler, {data.constraints.toLocaleString("no")} regler
        </p>
      )}
    </PhaseCardShell>
  );
}

function SolvingFaseCard({ status, solution }: { status: "completed" | "active" | "upcoming"; solution: PhaseData["latestSolution"] }) {
  const meldinger = useMemo(() => {
    const base = [
      "Prioriterer individuelle timer over gruppeaktiviteter...",
      "Forsøker å gi pasienten samme behandler gjennom uka...",
      "Legger inn tid til hvile mellom behandlingene...",
      "Sprer timene jevnt utover ukedagene...",
    ];
    if (solution) {
      return [
        `Beste løsning: ${solution.scheduled} av ${solution.total} timer planlagt`,
        ...base,
      ];
    }
    return ["Søker etter en god løsning...", ...base];
  }, [solution]);

  const { message, visible } = useRotatingMessage(meldinger, status === "active");

  return (
    <PhaseCardShell label="Finner beste løsning" status={status}>
      {status === "active" && (
        <>
          {solution && (
            <div className="mb-1.5 flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${solution.total > 0 ? (solution.scheduled / solution.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                {solution.scheduled}/{solution.total}
              </span>
            </div>
          )}
          <RotatingText message={message} visible={visible} />
          {solution && (
            <p className="mt-1 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-600">
              Løsning #{solution.solutionCount} &middot; {solution.elapsed.toFixed(1)}s brukt
            </p>
          )}
        </>
      )}
      {status === "completed" && solution && (
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          {solution.scheduled} av {solution.total} timer planlagt på {solution.elapsed.toFixed(1)}s
        </p>
      )}
    </PhaseCardShell>
  );
}

export function SolverProgress({
  isOptimering,
  events,
}: {
  isOptimering: boolean;
  events: SolverEvent[];
}) {
  const phaseData = derivePhaseData(events);
  const started = isOptimering || events.length > 0;
  const completedAll = !isOptimering && events.length > 0 && phaseData.phase !== "idle";

  if (!started) return null;

  const phaseStatus = (target: Phase): "completed" | "active" | "upcoming" => {
    if (completedAll) return "completed";
    const order: Phase[] = ["klargjoring", "modellbygging", "solving"];
    const currentIdx = order.indexOf(phaseData.phase);
    const targetIdx = order.indexOf(target);
    if (targetIdx < currentIdx) return "completed";
    if (targetIdx === currentIdx) return "active";
    return "upcoming";
  };

  return (
    <div className="mt-6 w-full max-w-lg">
      <div className="space-y-1">
        <KlargjorFaseCard status={phaseStatus("klargjoring")} data={phaseData.klargjoring} />
        <ModellbyggFaseCard status={phaseStatus("modellbygging")} data={phaseData.modellbygging} />
        <SolvingFaseCard status={phaseStatus("solving")} solution={phaseData.latestSolution} />
      </div>
    </div>
  );
}
