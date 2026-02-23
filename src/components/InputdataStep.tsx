"use client";

import { usePasienter, useBehandlere, useGrupper } from "@/hooks";

function formatBehov(behov: { type: string; varighet: number; antall: number }[]): string {
  if (!behov || behov.length === 0) return "—";
  return behov
    .map((b) => `${b.antall}× ${b.type} (${b.varighet}min)`)
    .join(", ");
}

export function InputdataStep() {
  const { data: pasienter = [] } = usePasienter();
  const { data: behandlere = [] } = useBehandlere();
  const { data: grupper = [] } = useGrupper();

  const gruppeMap = new Map(grupper.map((g) => [g.id, g]));

  const getGruppeNavn = (ytelse: string) => gruppeMap.get(ytelse)?.navn ?? ytelse;

  const getPasientEkstraBehov = (pasient: { id: number; ytelse: string }) => {
    const gruppe = gruppeMap.get(pasient.ytelse);
    if (!gruppe) return "—";
    const ekstra = gruppe.pasienter.find((p) => p.id === pasient.id)?.ekstraBehov ?? [];
    if (ekstra.length === 0) return "—";
    return formatBehov(ekstra);
  };

  return (
    <div className="space-y-8">
      {/* Pasienter */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Pasienter</h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {pasienter.length}
          </span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Navn</th>
                <th className="px-4 py-3">Alder</th>
                <th className="px-4 py-3">Diagnose</th>
                <th className="px-4 py-3">Gruppe</th>
                <th className="px-4 py-3">Ekstra behov</th>
              </tr>
            </thead>
            <tbody>
              {pasienter.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-700/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{p.navn}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.alder}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.diagnose}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{getGruppeNavn(p.ytelse)}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{getPasientEkstraBehov(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Behandlere */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Behandlere</h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {behandlere.length}
          </span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Navn</th>
                <th className="px-4 py-3">Spesialisering</th>
              </tr>
            </thead>
            <tbody>
              {behandlere.map((b) => (
                <tr key={b.id} className="border-t border-zinc-100 dark:border-zinc-700/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{b.navn}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{b.spesialisering}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Grupper */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Grupper</h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {grupper.length}
          </span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Gruppenavn</th>
                <th className="px-4 py-3">Pasienter</th>
                <th className="px-4 py-3">Gruppeakt./uke</th>
                <th className="px-4 py-3">Ind. behov per pasient</th>
              </tr>
            </thead>
            <tbody>
              {grupper.map((g) => (
                <tr key={g.id} className="border-t border-zinc-100 dark:border-zinc-700/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{g.navn}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{g.antallPasienter}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{g.gruppeAktiviteter}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{formatBehov(g.individuelleBehovPerPasient)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
