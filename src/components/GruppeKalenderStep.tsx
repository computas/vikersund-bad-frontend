"use client";

import { useState } from "react";
import { useGrupper, usePasienter, useBehandlere } from "@/hooks";
import { useAvtaler } from "@/hooks";
import { useUpdateGruppeAktivitet } from "@/hooks/useGrupper";
import { WeekCalendar, formatDateLocal } from "./WeekCalendar";
import { AvtaleModal, GruppeAktivitetSaveData } from "./AvtaleModal";
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
  const [selectedAvtale, setSelectedAvtale] = useState<Avtale | null>(null);

  const startDato = formatDateLocal(selectedMonday);
  const { data: avtaler = [] } = useAvtaler({ startDato });

  const updateAktivitet = useUpdateGruppeAktivitet();

  const selectedGruppe = grupper.find((g) => g.id === selectedGruppeId);
  const representativePasientId = selectedGruppe?.pasienter[0]?.id ?? null;
  const gruppeAvtaler = avtaler.filter(
    (a) => a.pasientId === representativePasientId && a.type === "gruppe"
  );

  async function handleSaveAktivitet(
    avtale: Avtale,
    { dag, startTid, sluttTid, aktivitetNavn, aktivitetType, behandlerId }: {
      dag: number; startTid: string; sluttTid: string;
      aktivitetNavn: string; aktivitetType: string | null; behandlerId: number | null;
    }
  ) {
    if (!selectedGruppe) return;
    const originalDag = (new Date(avtale.dato + "T00:00:00").getDay() + 6) % 7;
    const aktivitet = selectedGruppe.ukentligPlan.find(
      (p) => p.dag === originalDag && p.startTid === avtale.startTid
    );
    if (!aktivitet?.id) {
      throw new Error("Fant ikke matchende gruppeaktivitet");
    }
    await updateAktivitet.mutateAsync({
      gruppeId: selectedGruppe.id,
      aktivitetId: aktivitet.id,
      dag,
      startTid,
      sluttTid,
      aktivitetNavn,
      aktivitetType: aktivitetType ?? undefined,
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
        onAvtaleClick={setSelectedAvtale}
      />

      {selectedAvtale && (
        <AvtaleModal
          avtale={selectedAvtale}
          personNavn={behandlere.find((b) => b.id === selectedAvtale.behandlerId)?.navn ?? null}
          viewMode="pasient"
          onClose={() => setSelectedAvtale(null)}
          gruppeId={selectedGruppeId}
          onSave={(data: GruppeAktivitetSaveData) => handleSaveAktivitet(selectedAvtale, data)}
        />
      )}
    </div>
  );
}
