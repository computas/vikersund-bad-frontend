"use client";

import { useState } from "react";
import { useGrupper, usePasienter, useBehandlere } from "@/hooks";
import { useAvtaler } from "@/hooks";
import { useUpdateGruppeAktivitet } from "@/hooks/useGrupper";
import { WeekCalendar, formatDateLocal } from "./WeekCalendar";
import { Avtale } from "@/types";

type GruppeKalenderStepProps = {
  selectedMonday: Date;
  onWeekChange: (monday: Date) => void;
};

export function GruppeKalenderStep({ selectedMonday, onWeekChange }: GruppeKalenderStepProps) {
  const { data: grupper = [] } = useGrupper();
  const { data: pasienter = [] } = usePasienter();
  const { data: behandlere = [] } = useBehandlere();

  const [selectedGruppeId, setSelectedGruppeId] = useState<string>("YTELSE_AO");

  const startDato = formatDateLocal(selectedMonday);
  const { data: avtaler = [] } = useAvtaler({ startDato });

  const updateAktivitet = useUpdateGruppeAktivitet();

  const selectedGruppe = grupper.find((g) => g.id === selectedGruppeId);
  const representativePasientId = selectedGruppe?.pasienter[0]?.id ?? null;
  const gruppeAvtaler = avtaler
    .filter((a) => a.pasientId === representativePasientId && a.type === "gruppe")
    .map((avtale) => {
      if (!selectedGruppe) return avtale;
      const avtaleDag = new Date(avtale.dato + "T00:00:00").getDay();
      const dagIndex = (avtaleDag + 6) % 7;
      const plan = selectedGruppe.ukentligPlan.find(
        (p) => p.dag === dagIndex && p.startTid === avtale.startTid
      );
      if (!plan) return avtale;
      return {
        ...avtale,
        ...(plan.behandlerId !== undefined && { behandlerId: plan.behandlerId ?? null }),
        ...(plan.type && { aktivitetType: plan.type }),
      };
    });

  async function handleUpdateBehandler(avtale: Avtale, behandlerId: number | null) {
    if (!selectedGruppe) return;
    // Finn matchende GruppeAktivitetPlan via ukedag og starttid
    const avtaleDag = new Date(avtale.dato + "T00:00:00").getDay();
    const dagIndex = (avtaleDag + 6) % 7; // Konverter til 0=mandag
    const aktivitet = selectedGruppe.ukentligPlan.find(
      (p) => p.dag === dagIndex && p.startTid === avtale.startTid
    );
    if (!aktivitet?.id) {
      throw new Error("Fant ikke matchende gruppeaktivitet");
    }
    await updateAktivitet.mutateAsync({
      gruppeId: selectedGruppe.id,
      aktivitetId: aktivitet.id,
      dag: aktivitet.dag,
      startTid: aktivitet.startTid,
      sluttTid: aktivitet.sluttTid,
      aktivitetNavn: aktivitet.aktivitet,
      behandlerId,
    });
  }

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
        currentMonday={selectedMonday}
        onWeekChange={onWeekChange}
        hideNavigation
        onUpdateAvtaleBehandler={handleUpdateBehandler}
      />
    </div>
  );
}
