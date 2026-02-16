"use client";

import { useOptimering } from "@/hooks/useOptimering";

export function OptimeringPanel() {
  const {
    status,
    runOptimering,
    isOptimering,
    optimeringResultat,
    optimeringError,
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
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Ingen optimering er kjort enna.
            </p>
          )}
        </div>

        <button
          onClick={() => runOptimering()}
          disabled={isOptimering}
          className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
            isOptimering
              ? "cursor-not-allowed bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isOptimering ? "Optimerer..." : "Kjor optimering"}
        </button>
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
        <div className="mt-3 rounded-md bg-green-50 p-3 text-sm dark:bg-green-900/20">
          <p className="font-medium text-green-800 dark:text-green-300">
            Optimering fullfort
          </p>
          <div className="mt-1 text-green-700 dark:text-green-400">
            <span>
              {optimeringResultat.planlagt} av {optimeringResultat.totalt} aktiviteter planlagt
            </span>
            {" | "}
            <span>Tid: {optimeringResultat.losningstid}s</span>
            {" | "}
            <span>Status: {optimeringResultat.status}</span>
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
