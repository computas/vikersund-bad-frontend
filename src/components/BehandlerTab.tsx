"use client";

import { useState, useEffect } from "react";
import { useAvtaler } from "@/hooks";
import { useBehandlere } from "@/hooks/useBehandlere";
import { usePasienter } from "@/hooks/usePasienter";
import { InfoField } from "./InfoField";
import { WeekCalendar, formatDateLocal } from "./WeekCalendar";

type BehandlerTabProps = {
  selectedMonday: Date;
  onWeekChange: (monday: Date) => void;
};

export function BehandlerTab({ selectedMonday, onWeekChange }: BehandlerTabProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const startDato = formatDateLocal(selectedMonday);
  const {
    data: avtaler = [],
    isLoading,
    error,
  } = useAvtaler({ startDato });
  const { data: behandlere = [] } = useBehandlere();
  const { data: pasienter = [] } = usePasienter();

  useEffect(() => {
    if (selectedId === null && behandlere.length > 0) {
      setSelectedId(behandlere[0].id);
    }
  }, [selectedId, behandlere]);

  const selected = behandlere.find((b) => b.id === selectedId);
  const behandlerAvtaler = avtaler.filter((a) => a.behandlerId === selectedId);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Velg behandler
      </label>
      <select
        value={selectedId ?? ""}
        onChange={(e) =>
          setSelectedId(e.target.value ? Number(e.target.value) : null)
        }
        className="mb-6 w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
      >
        <option value="">-- Velg en behandler --</option>
        {behandlere.map((b) => (
          <option
            key={b.id}
            value={b.id}
          >
            {b.navn} ({b.spesialisering})
          </option>
        ))}
      </select>

      {!selected && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
          <svg className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Velg en behandler i listen over
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Du far se behandlerens timeplan for denne uken.
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
              label="Spesialisering"
              value={selected.spesialisering}
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
              avtaler={behandlerAvtaler}
              viewMode="behandler"
              pasienter={pasienter}
              currentMonday={selectedMonday}
              onWeekChange={onWeekChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
