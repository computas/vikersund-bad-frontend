"use client";

import { useState } from "react";
import { Avtale } from "@/types";
import { AKTIVITET_TYPER } from "@/lib/colors";
import { useBehandlere } from "@/hooks/useBehandlere";
import { useGrupper } from "@/hooks/useGrupper";

export type GruppeAktivitetSaveData = {
  dag: number;
  startTid: string;
  sluttTid: string;
  aktivitetNavn: string;
  aktivitetType: string | null;
  behandlerId: number | null;
};

type Props = {
  avtale?: Avtale; // undefined = create mode
  gruppeId: string;
  onSave: (data: GruppeAktivitetSaveData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
};

const UKEDAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

// 09:00 to 16:00 in 15-minute steps (29 slots)
const TIDSLOTS = Array.from({ length: 29 }, (_, i) => {
  const totalMinutter = 9 * 60 + i * 15;
  const h = Math.floor(totalMinutter / 60);
  const m = totalMinutter % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

const INPUT =
  "rounded-md border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white";

const LABEL =
  "text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

export function GruppeAktivitetForm({
  avtale,
  gruppeId,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const { data: behandlere = [] } = useBehandlere();
  const { data: grupper = [] } = useGrupper();

  const gruppe = grupper.find((g) => g.id === gruppeId);
  const gruppeAktiviteter = gruppe?.ukentligPlan ?? [];
  const alleGruppeAktiviteter = grupper.flatMap((g) =>
    g.ukentligPlan.map((p) => ({ ...p, gruppeNavn: g.navn })),
  );

  const isCreateMode = !avtale;
  const originalDag = avtale
    ? (new Date(avtale.dato + "T00:00:00").getDay() + 6) % 7
    : 0;

  const [dag, setDag] = useState(originalDag);
  const [startTid, setStartTid] = useState(avtale?.startTid ?? "09:00");
  const [sluttTid, setSluttTid] = useState(avtale?.sluttTid ?? "10:00");
  const [aktivitetNavn, setAktivitetNavn] = useState(avtale?.beskrivelse ?? "");
  const [aktivitetType, setAktivitetType] = useState(avtale?.aktivitetType ?? "");
  const [behandlerId, setBehandlerId] = useState<number | null>(avtale?.behandlerId ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const harEndring =
    isCreateMode ||
    dag !== originalDag ||
    startTid !== avtale!.startTid ||
    sluttTid !== avtale!.sluttTid ||
    aktivitetNavn !== avtale!.beskrivelse ||
    aktivitetType !== (avtale!.aktivitetType ?? "") ||
    behandlerId !== avtale!.behandlerId;

  function validate(): string | null {
    if (!aktivitetNavn.trim()) return "Aktivitetsnavn kan ikke være tomt";
    if (sluttTid <= startTid) return "Slutttid må være etter starttid";

    const gruppekonflikt = gruppeAktiviteter
      .filter((p) => (avtale ? !(p.dag === originalDag && p.startTid === avtale.startTid) : true))
      .filter((p) => p.dag === dag)
      .find((p) => startTid < p.sluttTid && sluttTid > p.startTid);

    if (gruppekonflikt) {
      return `Overlapper med "${gruppekonflikt.aktivitet}" (${gruppekonflikt.startTid}–${gruppekonflikt.sluttTid})`;
    }

    if (behandlerId !== null) {
      const currentAktivitetId = avtale
        ? gruppeAktiviteter.find((p) => p.dag === originalDag && p.startTid === avtale.startTid)?.id
        : undefined;

      const behandlerkonflikt = alleGruppeAktiviteter
        .filter((p) => (currentAktivitetId !== undefined ? p.id !== currentAktivitetId : true))
        .find(
          (p) =>
            p.behandlerId === behandlerId &&
            p.dag === dag &&
            startTid < p.sluttTid &&
            sluttTid > p.startTid,
        );

      if (behandlerkonflikt) {
        const navn = behandlere.find((b) => b.id === behandlerId)?.navn ?? "Behandleren";
        const gruppeInfo = behandlerkonflikt.gruppeNavn ? ` (${behandlerkonflikt.gruppeNavn})` : "";
        return `${navn} har allerede en gruppetime: "${behandlerkonflikt.aktivitet}"${gruppeInfo} (${behandlerkonflikt.startTid}–${behandlerkonflikt.sluttTid})`;
      }
    }

    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({ dag, startTid, sluttTid, aktivitetNavn: aktivitetNavn.trim(), aktivitetType: aktivitetType || null, behandlerId });
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noe gikk galt ved lagring");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noe gikk galt ved sletting");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {gruppe && (
        <p className="mb-4 text-base text-zinc-500 dark:text-zinc-400">
          Gruppe:{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-200">{gruppe.navn}</span>
        </p>
      )}

      <div className="grid gap-4 text-base">
        <Field label="Navn">
          <input
            type="text"
            value={aktivitetNavn}
            onChange={(e) => setAktivitetNavn(e.target.value)}
            className={INPUT}
            placeholder="Navn på aktiviteten"
          />
        </Field>

        <Field label={<>Type <span className="normal-case">(valgfri)</span></>}>
          <select value={aktivitetType} onChange={(e) => setAktivitetType(e.target.value)} className={INPUT}>
            <option value="">Ingen type valgt</option>
            {AKTIVITET_TYPER.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>

        <Field label="Dag">
          <select value={dag} onChange={(e) => setDag(Number(e.target.value))} className={INPUT}>
            {UKEDAGER.map((navn, i) => <option key={i} value={i}>{navn}</option>)}
          </select>
        </Field>

        <div className="flex gap-3">
          <Field label="Fra">
            <select value={startTid} onChange={(e) => setStartTid(e.target.value)} className={INPUT}>
              {TIDSLOTS.slice(0, -1).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Til">
            <select value={sluttTid} onChange={(e) => setSluttTid(e.target.value)} className={INPUT}>
              {TIDSLOTS.slice(1).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <Field label={<>Behandler <span className="normal-case">(valgfri)</span></>}>
          <select
            value={behandlerId ?? ""}
            onChange={(e) => setBehandlerId(e.target.value === "" ? null : Number(e.target.value))}
            className={INPUT}
          >
            <option value="">Ikke tildelt</option>
            {behandlere.map((b) => <option key={b.id} value={b.id}>{b.navn}</option>)}
          </select>
        </Field>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-2">
        {onDelete && !isCreateMode && (
          confirmDelete ? (
            <>
              <span className="self-center text-sm text-zinc-500 dark:text-zinc-400">Sikker?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Sletter..." : "Ja, slett"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Avbryt
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-md px-4 py-2 text-base text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Slett aktivitet
            </button>
          )
        )}

        <div className="ml-auto flex gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-base text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={!harEndring || saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saved ? "Lagret!" : saving ? "Lagrer..." : isCreateMode ? "Legg til" : "Lagre"}
          </button>
        </div>
      </div>
    </>
  );
}
