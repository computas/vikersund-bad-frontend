"use client";

import { useState } from "react";
import { PasientTab } from "./PasientTab";
import { BehandlerTab } from "./BehandlerTab";
import { IkkePlanlagtTab } from "./IkkePlanlagtTab";
import { useOptimering } from "@/hooks/useOptimering";

type ResultatView = "pasient" | "behandler" | "ikke-planlagt";

export function ResultaterStep() {
  const [view, setView] = useState<ResultatView>("pasient");
  const { status } = useOptimering();

  const ikkePlanlagtCount = status?.ikkePlanlagt ?? 0;

  const views: { id: ResultatView; label: string; badge?: number }[] = [
    { id: "pasient", label: "Pasientkalender" },
    { id: "behandler", label: "Behandlerkalender" },
    { id: "ikke-planlagt", label: "Ikke-planlagt", badge: ikkePlanlagtCount },
  ];

  return (
    <div>
      {/* Pill toggle */}
      <div className="mb-6 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {views.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === item.id
                ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            {item.label}
            {item.badge != null && item.badge > 0 && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === "pasient" && <PasientTab />}
      {view === "behandler" && <BehandlerTab />}
      {view === "ikke-planlagt" && <IkkePlanlagtTab />}
    </div>
  );
}
