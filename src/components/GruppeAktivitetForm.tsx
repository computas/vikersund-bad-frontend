"use client";

import { useState } from "react";
import { Avtale, Behandler, GruppeAktivitetPlan } from "@/types";
import { AKTIVITET_TYPER } from "@/lib/colors";

export type GruppeAktivitetSaveData = {
  dag: number;
  startTid: string;
  sluttTid: string;
  aktivitetNavn: string;
  aktivitetType: string | null;
  behandlerId: number | null;
};

type Props = {
  avtale: Avtale;
  behandlere: Behandler[];
  gruppeAktiviteter: GruppeAktivitetPlan[];
  alleGruppeAktiviteter?: (GruppeAktivitetPlan & { gruppeNavn?: string })[];
  onSave: (data: GruppeAktivitetSaveData) => Promise<void>;
  onClose: () => void;
};

const UKEDAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

const TIDSLOTS: string[] = [];
for (let hour = 9; hour <= 16; hour++) {
  for (const min of [0, 15, 30, 45]) {
    if (hour === 16 && min > 0) break;
    TIDSLOTS.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
}

const SELECT_CLASS =
  "rounded-md border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white";

const LABEL_CLASS =
  "text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

export function GruppeAktivitetForm({ avtale, behandlere, gruppeAktiviteter, alleGruppeAktiviteter, onSave, onClose }: Props) {
  const originalDag = (new Date(avtale.dato + "T00:00:00").getDay() + 6) % 7;

  const [dag, setDag] = useState(originalDag);
  const [startTid, setStartTid] = useState(avtale.startTid);
  const [sluttTid, setSluttTid] = useState(avtale.sluttTid);
  const [aktivitetNavn, setAktivitetNavn] = useState(avtale.beskrivelse);
  const [aktivitetType, setAktivitetType] = useState(avtale.aktivitetType ?? "");
  const [behandlerId, setBehandlerId] = useState<number | null>(avtale.behandlerId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const harEndring =
    dag !== originalDag ||
    startTid !== avtale.startTid ||
    sluttTid !== avtale.sluttTid ||
    aktivitetNavn !== avtale.beskrivelse ||
    aktivitetType !== (avtale.aktivitetType ?? "") ||
    behandlerId !== avtale.behandlerId;

  function validate(): string | null {
    if (!aktivitetNavn.trim()) return "Aktivitetsnavn kan ikke være tomt";
    if (sluttTid <= startTid) return "Slutttid må være etter starttid";

    const conflicting = gruppeAktiviteter
      .filter((p) => !(p.dag === originalDag && p.startTid === avtale.startTid))
      .filter((p) => p.dag === dag)
      .find((p) => startTid < p.sluttTid && sluttTid > p.startTid);

    if (conflicting) {
      return `Overlapper med "${conflicting.aktivitet}" (${conflicting.startTid}–${conflicting.sluttTid})`;
    }

    if (behandlerId !== null && alleGruppeAktiviteter) {
      const currentAktivitetId = gruppeAktiviteter.find(
        (p) => p.dag === originalDag && p.startTid === avtale.startTid
      )?.id;
      const behandlerConflict = alleGruppeAktiviteter
        .filter((p) => (currentAktivitetId !== undefined ? p.id !== currentAktivitetId : !(p.dag === originalDag && p.startTid === avtale.startTid)))
        .find(
          (p) =>
            p.behandlerId === behandlerId &&
            p.dag === dag &&
            startTid < p.sluttTid &&
            sluttTid > p.startTid
        );
      if (behandlerConflict) {
        const behandler = behandlere.find((b) => b.id === behandlerId);
        const gruppeInfo = behandlerConflict.gruppeNavn ? ` (${behandlerConflict.gruppeNavn})` : "";
        return `${behandler?.navn ?? "Behandleren"} har allerede en gruppetime: "${behandlerConflict.aktivitet}"${gruppeInfo} (${behandlerConflict.startTid}–${behandlerConflict.sluttTid})`;
      }
    }

    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { setError(err); return; }
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

  return (
    <>
      <div className="grid gap-4 text-base">
        <div className="flex flex-col gap-1">
          <label className={LABEL_CLASS}>Navn</label>
          <input
            type="text"
            value={aktivitetNavn}
            onChange={(e) => setAktivitetNavn(e.target.value)}
            className={SELECT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL_CLASS}>
            Type <span className="normal-case">(valgfri)</span>
          </label>
          <select value={aktivitetType} onChange={(e) => setAktivitetType(e.target.value)} className={SELECT_CLASS}>
            <option value="">Ingen type valgt</option>
            {AKTIVITET_TYPER.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL_CLASS}>Dag</label>
          <select value={dag} onChange={(e) => setDag(Number(e.target.value))} className={SELECT_CLASS}>
            {UKEDAGER.map((navn, i) => (
              <option key={i} value={i}>{navn}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label className={LABEL_CLASS}>Fra</label>
            <select value={startTid} onChange={(e) => setStartTid(e.target.value)} className={SELECT_CLASS}>
              {TIDSLOTS.slice(0, -1).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className={LABEL_CLASS}>Til</label>
            <select value={sluttTid} onChange={(e) => setSluttTid(e.target.value)} className={SELECT_CLASS}>
              {TIDSLOTS.slice(1).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL_CLASS}>Behandler</label>
          <select
            value={behandlerId ?? ""}
            onChange={(e) => setBehandlerId(e.target.value === "" ? null : Number(e.target.value))}
            className={SELECT_CLASS}
          >
            <option value="">Ikke tildelt</option>
            {behandlere.map((b) => (
              <option key={b.id} value={b.id}>{b.navn}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2">
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
          {saved ? "Lagret!" : saving ? "Lagrer..." : "Lagre"}
        </button>
      </div>
    </>
  );
}
