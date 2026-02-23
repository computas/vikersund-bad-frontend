"use client";

import { useState } from "react";
import { useGrupper, usePasienter, useBehandlere } from "@/hooks";
import { useAvtaler } from "@/hooks";
import { WeekCalendar, getMondayOfWeek, formatDateLocal } from "./WeekCalendar";

export function GruppeKalenderStep() {
  const { data: grupper = [] } = useGrupper();
  const { data: pasienter = [] } = usePasienter();
  const { data: behandlere = [] } = useBehandlere();

  const [selectedGruppeId, setSelectedGruppeId] = useState<string>("YTELSE_AO");
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek(new Date()));

  const startDato = formatDateLocal(currentMonday);
  const { data: avtaler = [] } = useAvtaler({ startDato });

  const selectedGruppe = grupper.find((g) => g.id === selectedGruppeId);
  const representativePasientId = selectedGruppe?.pasienter[0]?.id ?? null;
  const gruppeAvtaler = avtaler.filter((a) => a.pasientId === representativePasientId && a.type === "gruppe");

  return (
    <div>
      {/* Group selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {grupper.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGruppeId(g.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              selectedGruppeId === g.id
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            {g.navn}
            <span className="ml-1.5 text-xs opacity-75">
              ({g.gruppeAktiviteter} akt/uke)
            </span>
          </button>
        ))}
      </div>

      {/* Group info card */}
      {selectedGruppe && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            {selectedGruppe.navn} — {selectedGruppe.antallPasienter} pasienter, {selectedGruppe.gruppeAktiviteter} faste gruppeaktiviteter per uke
          </p>
          <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
            Kalenderen under viser de faste gruppeaktivitetene som er plassert for denne gruppen. Individuelle timer (fysioterapi, kontaktperson m.m.) planlegges i neste steg.
          </p>
        </div>
      )}

      {/* Calendar */}
      <WeekCalendar
        avtaler={gruppeAvtaler}
        viewMode="pasient"
        pasienter={pasienter}
        behandlere={behandlere}
        currentMonday={currentMonday}
        onWeekChange={setCurrentMonday}
        hideNavigation
      />
    </div>
  );
}
