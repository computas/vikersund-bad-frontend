"use client";

import { useState } from "react";
import { useGrupper } from "@/hooks/useGrupper";
import { Gruppe } from "@/types";

const UKEDAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

function GruppeKort({ gruppe }: { gruppe: Gruppe }) {
  const [visPlan, setVisPlan] = useState(false);

  const planPerDag = UKEDAGER.map((dagNavn, i) => ({
    dagNavn,
    aktiviteter: gruppe.ukentligPlan.filter((a) => a.dag === i),
  }));

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
        {gruppe.navn}
      </h3>

      <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
        <div>
          <span className="font-medium">Pasienter:</span> {gruppe.antallPasienter}
        </div>
        <div>
          <span className="font-medium">Gruppeaktiviteter:</span> {gruppe.gruppeAktiviteter}/uke
        </div>
        {gruppe.startDato && (
          <div className="col-span-2">
            <span className="font-medium">Ukestart:</span>{" "}
            {new Date(gruppe.startDato).toLocaleDateString("no-NO")}
          </div>
        )}
      </div>

      {gruppe.individuelleBehovPerPasient.length > 0 && (
        <div className="mb-3">
          <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Individuelle behov per pasient
          </h4>
          <ul className="space-y-1 text-sm">
            {gruppe.individuelleBehovPerPasient.map((behov, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-zinc-700 dark:text-zinc-300"
              >
                <span>{behov.beskrivelse}</span>
                <span className="ml-2 shrink-0 text-xs text-zinc-500">
                  {behov.antall}x {behov.varighet} min
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-3">
        <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Pasienter i gruppen
        </h4>
        <ul className="space-y-1 text-sm">
          {gruppe.pasienter.map((pasient) => (
            <li
              key={pasient.id}
              className="text-zinc-700 dark:text-zinc-300"
            >
              {pasient.navn}
              <span className="ml-1 text-xs text-zinc-500">
                ({pasient.diagnose})
              </span>
              {pasient.ekstraBehov.length > 0 && (
                <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400">
                  + {pasient.ekstraBehov.map((b) => `${b.antall}x ${b.beskrivelse}`).join(", ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <button
          onClick={() => setVisPlan(!visPlan)}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg
            className={`h-3 w-3 transition-transform ${visPlan ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {visPlan ? "Skjul ukeplan" : "Vis ukeplan"}
        </button>
        {visPlan && (
          <div className="mt-2 space-y-2">
            {planPerDag.map(({ dagNavn, aktiviteter }) =>
              aktiviteter.length > 0 ? (
                <div key={dagNavn}>
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {dagNavn}
                  </div>
                  <ul className="ml-2 space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {aktiviteter.map((a, i) => (
                      <li key={i}>
                        {a.startTid}–{a.sluttTid} {a.aktivitet}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function GruppeOversikt() {
  const { data: grupper = [], isLoading, error } = useGrupper();

  if (isLoading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Laster gruppedata...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Feil ved lasting av grupper: {error.message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Oversikt over pasientgrupper og deres behandlingsbehov som brukes av optimeringen.
      </p>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {grupper.map((gruppe) => (
          <GruppeKort key={gruppe.id} gruppe={gruppe} />
        ))}
      </div>
    </div>
  );
}
