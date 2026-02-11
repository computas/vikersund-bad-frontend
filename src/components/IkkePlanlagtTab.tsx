"use client";

import { useIkkePlanlagt } from "@/hooks";
import { InfoField } from "./InfoField";

export function IkkePlanlagtTab() {
  const { data: ikkePlanlagte = [], isLoading, error } = useIkkePlanlagt();

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
    return (
      <p className="text-sm text-zinc-500">
        Ingen ikke-planlagte timer funnet.
      </p>
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
