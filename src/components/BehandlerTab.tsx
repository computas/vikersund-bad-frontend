"use client";

import { useState } from "react";
import { useAvtaler } from "@/hooks";
import { useBehandlere } from "@/hooks/useBehandlere";
import { usePasienter } from "@/hooks/usePasienter";
import { InfoField } from "./InfoField";
import { WeekCalendar } from "./WeekCalendar";

export function BehandlerTab() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const {
    data: avtaler = [],
    isLoading,
    error,
  } = useAvtaler({ startDato: "2026-02-09" });
  const { data: behandlere = [] } = useBehandlere();
  const { data: pasienter = [] } = usePasienter();

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
            />
          )}
        </div>
      )}
    </div>
  );
}
