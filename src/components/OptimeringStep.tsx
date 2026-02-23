"use client";

import { useOptimering } from "@/hooks/useOptimering";
import { usePasienter, useBehandlere, useGrupper } from "@/hooks";

export function OptimeringStep() {
  const {
    status,
    runOptimering,
    isOptimering,
    optimeringResultat,
    optimeringError,
    resetOptimering,
    isResetting,
  } = useOptimering();

  const { data: pasienter = [] } = usePasienter();
  const { data: behandlere = [] } = useBehandlere();
  const { data: grupper = [] } = useGrupper();

  // Beregn totale individuelle behov
  const totalIndividuelleBehov = grupper.reduce((sum, g) => {
    const behovPerPasient = (g.individuelleBehovPerPasient ?? []).reduce((s, b) => s + b.antall, 0);
    // Legg til ekstra-behov per pasient
    const ekstraBehov = g.pasienter.reduce((s, p) => s + (p.ekstraBehov ?? []).reduce((s2, b) => s2 + b.antall, 0), 0);
    return sum + behovPerPasient * g.antallPasienter + ekstraBehov;
  }, 0);

  return (
    <div className="flex flex-col items-center py-8">
      {/* Forklaring */}
      <div className="mb-8 max-w-lg text-center">
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-white">
          Planlegg individuelle timer
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Optimeringen planlegger individuelle behandlingstimer (fysioterapi, kontaktperson m.m.)
          rundt de faste gruppeaktivitetene. Algoritmen respekterer arbeidstid (09:00–16:00),
          lunsj, ingen overlapp for pasienter eller behandlere, og kvalifikasjonskrav.
        </p>
      </div>

      {/* Oppsummering */}
      <div className="mb-8 flex gap-6 text-center">
        <div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{pasienter.length}</div>
          <div className="text-xs text-zinc-500">pasienter</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{behandlere.length}</div>
          <div className="text-xs text-zinc-500">behandlere</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{totalIndividuelleBehov}</div>
          <div className="text-xs text-zinc-500">individuelle timer</div>
        </div>
      </div>

      {/* Handlingsknapp */}
      <div className="mb-6 flex gap-3">
        {status?.harResultat && !isOptimering && (
          <button
            onClick={() => resetOptimering()}
            disabled={isResetting}
            className={`rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors dark:border-zinc-600 dark:text-zinc-300 ${
              isResetting ? "cursor-not-allowed opacity-50" : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
          >
            {isResetting ? "Nullstiller..." : "Nullstill"}
          </button>
        )}
        <button
          onClick={() => runOptimering()}
          disabled={isOptimering || isResetting}
          className={`rounded-lg px-8 py-3 text-lg font-semibold text-white transition-colors ${
            isOptimering || isResetting
              ? "cursor-not-allowed bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isOptimering ? "Optimerer..." : status?.harResultat ? "Kjor optimering pa nytt" : "Kjor optimering"}
        </button>
      </div>

      {/* Spinner */}
      {isOptimering && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Optimering pagar... Dette kan ta opptil 30 sekunder.
        </div>
      )}

      {/* Resultat */}
      {optimeringResultat && !isOptimering && (
        <div className="mt-4 w-full max-w-md rounded-lg bg-green-50 p-5 text-center dark:bg-green-900/20">
          <svg className="mx-auto mb-2 h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold text-green-800 dark:text-green-300">
            {optimeringResultat.planlagt} av {optimeringResultat.totalt} individuelle timer planlagt
          </p>
          {optimeringResultat.ikkePlanlagt > 0 && (
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              {optimeringResultat.ikkePlanlagt} timer kunne ikke plasseres
            </p>
          )}
          <p className="mt-2 text-xs text-green-600 dark:text-green-500">
            Losningstid: {optimeringResultat.losningstid}s | Ga videre for a se resultatene
          </p>
        </div>
      )}

      {/* Feil */}
      {optimeringError && !isOptimering && (
        <div className="mt-4 w-full max-w-md rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
          <p className="font-medium text-red-800 dark:text-red-300">Feil ved optimering</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-400">{optimeringError.message}</p>
        </div>
      )}
    </div>
  );
}
