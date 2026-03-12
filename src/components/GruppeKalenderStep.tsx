"use client";

import { useState } from "react";
import { useGrupper, usePasienter, useBehandlere } from "@/hooks";
import { useAvtaler } from "@/hooks";
import { useUpdateGruppeAktivitet, useCreateGruppeAktivitet, useDeleteGruppeAktivitet } from "@/hooks/useGrupper";
import { WeekCalendar, formatDateLocal } from "./WeekCalendar";
import { AvtaleModal, GruppeAktivitetSaveData } from "./AvtaleModal";
import { GruppeAktivitetForm } from "./GruppeAktivitetForm";
import { Avtale } from "@/types";

type GruppeKalenderStepProps = {
  selectedMonday: Date;
  onWeekChange: (monday: Date) => void;
};

export function GruppeKalenderStep({
  selectedMonday,
  onWeekChange,
}: GruppeKalenderStepProps) {
  const { data: grupper = [] } = useGrupper();
  const { data: pasienter = [] } = usePasienter();
  const { data: behandlere = [] } = useBehandlere();

  const [selectedGruppeId, setSelectedGruppeId] = useState<string>("");
  const activeGruppeId = selectedGruppeId || grupper[0]?.id || "";
  const [selectedAvtale, setSelectedAvtale] = useState<Avtale | null>(null);
  const [showNyAktivitet, setShowNyAktivitet] = useState(false);

  const startDato = formatDateLocal(selectedMonday);
  const { data: avtaler = [] } = useAvtaler({ startDato });

  const updateAktivitet = useUpdateGruppeAktivitet();
  const createAktivitet = useCreateGruppeAktivitet();
  const deleteAktivitet = useDeleteGruppeAktivitet();

  async function handleCreateAktivitet({ dag, startTid, sluttTid, aktivitetNavn, aktivitetType, behandlerId }: GruppeAktivitetSaveData) {
    await createAktivitet.mutateAsync({
      gruppeId: activeGruppeId,
      dag,
      startTid,
      sluttTid,
      aktivitetNavn,
      aktivitetType: aktivitetType ?? undefined,
      behandlerId,
    });
  }

  const selectedGruppe = grupper.find((g) => g.id === activeGruppeId);
  const representativePasientId = selectedGruppe?.pasienter[0]?.id ?? null;
  const gruppeAvtaler = avtaler.filter(
    (a) => a.pasientId === representativePasientId && a.type === "gruppe",
  );

  async function handleDeleteAktivitet(avtale: Avtale) {
    if (!selectedGruppe) return;
    const originalDag = (new Date(avtale.dato + "T00:00:00").getDay() + 6) % 7;
    const aktivitet = selectedGruppe.ukentligPlan.find(
      (p) => p.dag === originalDag && p.startTid === avtale.startTid,
    );
    if (!aktivitet?.id) {
      throw new Error("Fant ikke matchende gruppeaktivitet");
    }
    await deleteAktivitet.mutateAsync({
      gruppeId: selectedGruppe.id,
      aktivitetId: aktivitet.id,
    });
  }

  async function handleSaveAktivitet(
    avtale: Avtale,
    {
      dag,
      startTid,
      sluttTid,
      aktivitetNavn,
      aktivitetType,
      behandlerId,
    }: {
      dag: number;
      startTid: string;
      sluttTid: string;
      aktivitetNavn: string;
      aktivitetType: string | null;
      behandlerId: number | null;
    },
  ) {
    if (!selectedGruppe) return;
    const originalDag = (new Date(avtale.dato + "T00:00:00").getDay() + 6) % 7;
    const aktivitet = selectedGruppe.ukentligPlan.find(
      (p) => p.dag === originalDag && p.startTid === avtale.startTid,
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
              activeGruppeId === g.id
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
        <div className="mb-4 flex items-start justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              {selectedGruppe.navn} — {selectedGruppe.antallPasienter} pasienter,{" "}
              {selectedGruppe.gruppeAktiviteter} faste gruppeaktiviteter per uke
            </p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              Kalenderen under viser de faste gruppeaktivitetene som er plassert
              for denne gruppen. Individuelle timer (fysioterapi, kontaktperson
              m.m.) planlegges i neste steg.
            </p>
          </div>
          <button
            onClick={() => setShowNyAktivitet(true)}
            className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Legg til aktivitet
          </button>
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
        editMode={true}
      />

      {showNyAktivitet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowNyAktivitet(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white p-7 shadow-xl dark:bg-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Ny gruppeaktivitet
              </h3>
              <button
                onClick={() => setShowNyAktivitet(false)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <GruppeAktivitetForm
              gruppeId={activeGruppeId}
              onSave={handleCreateAktivitet}
              onClose={() => setShowNyAktivitet(false)}
            />
          </div>
        </div>
      )}

      {selectedAvtale && (
        <AvtaleModal
          avtale={selectedAvtale}
          personNavn={
            behandlere.find((b) => b.id === selectedAvtale.behandlerId)?.navn ??
            null
          }
          viewMode="pasient"
          onClose={() => setSelectedAvtale(null)}
          gruppeId={activeGruppeId}
          onSave={(data: GruppeAktivitetSaveData) =>
            handleSaveAktivitet(selectedAvtale, data)
          }
          onDelete={() => handleDeleteAktivitet(selectedAvtale)}
        />
      )}
    </div>
  );
}
