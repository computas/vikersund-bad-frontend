"use client";

import { useIkkePlanlagt } from "@/hooks";
import { useOptimering } from "@/hooks/useOptimering";
import { InfoField } from "./InfoField";

export function IkkePlanlagtTab() {
  const { data: ikkePlanlagte = [], isLoading, error } = useIkkePlanlagt();
  const { status } = useOptimering();

  if (isLoading) {
    return (
      <p className="text-sm text-zinc-500">Laster ikke-planlagte timer...</p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Feil ved lasting av ikke-planlagte timer: {error.message}
      </p>
    );
  }

  if (ikkePlanlagte.length === 0) {
    if (!status?.harResultat) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
          <svg className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Optimering er ikke kjørt ennå
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Kjør optimering fra panelet øverst for å planlegge individuelle timer.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-green-200 py-16 text-center dark:border-green-800">
        <svg className="mb-3 h-10 w-10 text-green-400 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          Alle individuelle timer er planlagt
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {status.planlagt} av {status.totalt} aktiviteter ble plassert i timeplanen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
        Ikke-planlagte timer
      </h2>
      <div className="space-y-3">
        {ikkePlanlagte.map((item, index) => (
          <div
            key={`${item.pasientId}-${index}`}
            className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <h3 className="mb-2 font-medium text-zinc-900 dark:text-white">
              Pasient: {item.pasientNavn}
            </h3>
            <div className="grid gap-1 text-sm">
              <InfoField
                label="Type"
                value={item.type}
              />
              <InfoField
                label="Beskrivelse"
                value={item.beskrivelse}
              />
              <InfoField
                label="Årsak"
                value={item.årsak}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
