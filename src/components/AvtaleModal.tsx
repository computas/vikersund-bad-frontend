"use client";

import { useEffect, useState } from "react";
import { Avtale, Behandler } from "@/types";
import { getAvtaleColor } from "@/lib/colors";
import { InfoField } from "./InfoField";

type AvtaleModalProps = {
  avtale: Avtale;
  personNavn: string | null;
  viewMode: "pasient" | "behandler";
  onClose: () => void;
  behandlere?: Behandler[];
  onSave?: (behandlerId: number | null) => Promise<void>;
};

export function AvtaleModal({
  avtale,
  personNavn,
  viewMode,
  onClose,
  behandlere,
  onSave,
}: AvtaleModalProps) {
  const color = getAvtaleColor(avtale.beskrivelse);
  const [selectedBehandlerId, setSelectedBehandlerId] = useState<number | null>(
    avtale.behandlerId
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const kanRedigeres =
    avtale.type === "gruppe" && !!behandlere && !!onSave;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(selectedBehandlerId);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 800);
    } finally {
      setSaving(false);
    }
  }

  const harEndring = selectedBehandlerId !== avtale.behandlerId;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-7 shadow-xl dark:bg-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-3 w-3 rounded-full ${color.dot}`} />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {avtale.beskrivelse}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid gap-3 text-base">
          <InfoField
            label="Type"
            value={avtale.type === "gruppe" ? "Gruppeaktivitet" : "Individuell time"}
          />

          {kanRedigeres ? (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Behandler
              </label>
              <select
                value={selectedBehandlerId ?? ""}
                onChange={(e) =>
                  setSelectedBehandlerId(e.target.value === "" ? null : Number(e.target.value))
                }
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              >
                <option value="">Ikke tildelt</option>
                {behandlere!.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.navn}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <InfoField
              label={viewMode === "pasient" ? "Behandler" : "Pasient"}
              value={personNavn ?? "Ikke tildelt"}
            />
          )}

          <InfoField label="Dato" value={avtale.dato} />
          <InfoField label="Tid" value={`${avtale.startTid} - ${avtale.sluttTid}`} />
        </div>

        {kanRedigeres && (
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
        )}
      </div>
    </div>
  );
}
