"use client";

import { useState, useEffect } from "react";
import { useAvtaler } from "@/hooks";
import { InfoField } from "./InfoField";
import { WeekCalendar, getMondayOfWeek, formatDateLocal } from "./WeekCalendar";
import { usePasienter } from "@/hooks/usePasienter";
import { useBehandlere } from "@/hooks/useBehandlere";

export function PasientTab() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek(new Date()));
  const startDato = formatDateLocal(currentMonday);
  const {
    data: avtaler = [],
    isLoading,
    error,
  } = useAvtaler({ startDato });
  const { data: pasienter = [] } = usePasienter();
  const { data: behandlere = [] } = useBehandlere();

  useEffect(() => {
    if (selectedId === null && pasienter.length > 0) {
      setSelectedId(pasienter[0].id);
    }
  }, [selectedId, pasienter]);

  const selected = pasienter.find((p) => p.id === selectedId);
  const pasientAvtaler = avtaler.filter((a) => a.pasientId === selectedId);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Velg pasient
      </label>
      <select
        value={selectedId ?? ""}
        onChange={(e) =>
          setSelectedId(e.target.value ? Number(e.target.value) : null)
        }
        className="mb-6 w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
      >
        <option value="">-- Velg en pasient --</option>
        {pasienter.map((p) => (
          <option
            key={p.id}
            value={p.id}
          >
            {p.navn} ({p.ytelse})
          </option>
        ))}
      </select>

      {!selected && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
          <svg className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Velg en pasient i listen over
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Du far se ukeplanen med gruppeaktiviteter og individuelle timer.
          </p>
        </div>
      )}

      {selected && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {selected.navn}
          </h2>
          <div className="grid gap-2 text-sm">
            <InfoField
              label="Alder"
              value={`${selected.alder} ar`}
            />
            <InfoField
              label="Diagnose"
              value={selected.diagnose}
            />
          </div>

          {isLoading && (
            <p className="text-sm text-zinc-500">Laster avtaler...</p>
          )}

          {error && (
            <p className="text-sm text-red-500">
              Feil ved lasting av avtaler: {error.message}
            </p>
          )}

          {!isLoading && !error && (
            <WeekCalendar
              avtaler={pasientAvtaler}
              viewMode="pasient"
              behandlere={behandlere}
              currentMonday={currentMonday}
              onWeekChange={setCurrentMonday}
            />
          )}
        </div>
      )}
    </div>
  );
}
