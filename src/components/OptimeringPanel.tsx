"use client";

import { useOptimering } from "@/hooks/useOptimering";

type OptimeringPanelProps = {
  onNavigateToTab?: (tabId: string) => void;
};

export function OptimeringPanel({ onNavigateToTab }: OptimeringPanelProps) {
  const {
    status,
    runOptimering,
    isOptimering,
    optimeringResultat,
    optimeringError,
    resetOptimering,
    isResetting,
  } = useOptimering();

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Optimering
          </h2>
          {status?.harResultat && !isOptimering && !optimeringResultat && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sist kjort: {new Date(status.sistKjort!).toLocaleString("no-NO")}
              {" | "}
              {status.planlagt} av {status.totalt} aktiviteter planlagt
            </p>
          )}
          {!status?.harResultat && !isOptimering && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              <p className="font-medium text-zinc-700 dark:text-zinc-300">
                Gruppeaktiviteter er allerede plassert i kalenderen.
              </p>
              <p className="mt-0.5 text-xs">
                Trykk «Kjor optimering» for a planlegge individuelle timer
                (fysioterapi, kontaktperson, ernaering m.m.) rundt gruppeaktivitetene.
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          {status?.harResultat && !isOptimering && (
            <button
              onClick={() => resetOptimering()}
              disabled={isResetting}
              className={`rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors dark:border-zinc-600 dark:text-zinc-300 ${
                isResetting
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
              }`}
            >
              {isResetting ? "Nullstiller..." : "Nullstill"}
            </button>
          )}
          <button
            onClick={() => runOptimering()}
            disabled={isOptimering || isResetting}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
              isOptimering || isResetting
                ? "cursor-not-allowed bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isOptimering ? "Optimerer..." : "Kjor optimering"}
          </button>
        </div>
      </div>

      {isOptimering && (
        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Optimering pagar... Dette kan ta opptil 30 sekunder.
        </div>
      )}

      {optimeringResultat && !isOptimering && (
        <div className="mt-3 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
          <div className="flex items-start justify-between gap-4">
            <div className="text-sm">
              <p className="font-medium text-green-800 dark:text-green-300">
                Optimering fullfort — {optimeringResultat.planlagt} av{" "}
                {optimeringResultat.totalt} individuelle timer ble planlagt
              </p>
              {optimeringResultat.ikkePlanlagt > 0 && (
                <p className="mt-1 text-green-700 dark:text-green-400">
                  {optimeringResultat.ikkePlanlagt} timer kunne ikke plasseres.{" "}
                  <button
                    onClick={() => onNavigateToTab?.("ikke-planlagt")}
                    className="underline hover:no-underline"
                  >
                    Se detaljer
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {optimeringError && !isOptimering && (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm dark:bg-red-900/20">
          <p className="font-medium text-red-800 dark:text-red-300">
            Feil ved optimering
          </p>
          <p className="mt-1 text-red-700 dark:text-red-400">
            {optimeringError.message}
          </p>
        </div>
      )}
    </div>
  );
}
