"use client";

import { useEffect } from "react";
import { Avtale } from "@/types";
import { getAvtaleColor } from "@/lib/colors";
import { InfoField } from "./InfoField";

type AvtaleModalProps = {
  avtale: Avtale;
  personNavn: string | null;
  viewMode: "pasient" | "behandler";
  onClose: () => void;
};

export function AvtaleModal({ avtale, personNavn, viewMode, onClose }: AvtaleModalProps) {
  const color = getAvtaleColor(avtale.beskrivelse);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
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

        <div className="grid gap-2 text-sm">
          <InfoField
            label={viewMode === "pasient" ? "Behandler" : "Pasient"}
            value={personNavn ?? "Ikke tildelt"}
          />
          <InfoField label="Dato" value={avtale.dato} />
          <InfoField label="Tid" value={`${avtale.startTid} - ${avtale.sluttTid}`} />
        </div>
      </div>
    </div>
  );
}
