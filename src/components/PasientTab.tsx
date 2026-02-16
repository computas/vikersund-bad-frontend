"use client";

import { useState } from "react";
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
