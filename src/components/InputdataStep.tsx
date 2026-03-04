"use client";

import { useState } from "react";
import {
  usePasienter,
  useBehandlere,
  useGrupper,
  useDeletePasient,
  useDeleteBehandler,
} from "@/hooks";
import { useBehandlereRangeringer } from "@/hooks/useBehandlere";
import { PasientFormModal } from "./PasientFormModal";
import { BehandlerFormModal } from "./BehandlerFormModal";
import type { Behandler, Pasient } from "@/types";

const DAG_NAVN = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

function formatBehov(
  behov: { type: string; varighet: number; antall: number }[]
): string {
  if (!behov || behov.length === 0) return "\u2014";
  return behov
    .map((b) => `${b.antall}\u00d7 ${b.type} (${b.varighet}min)`)
    .join(", ");
}

export function InputdataStep() {
  const { data: pasienter = [] } = usePasienter();
  const { data: behandlere = [] } = useBehandlere();
  const { data: grupper = [] } = useGrupper();
  const { data: rangeringerMap } = useBehandlereRangeringer(behandlere.map((b) => b.id));

  const [editingPasient, setEditingPasient] = useState<Pasient | null>(null);
  const [showAddPasient, setShowAddPasient] = useState(false);
  const [editingBehandler, setEditingBehandler] = useState<Behandler | null>(null);
  const [showAddBehandler, setShowAddBehandler] = useState(false);

  const deletePasient = useDeletePasient();
  const deleteBehandler = useDeleteBehandler();

  const gruppeMap = new Map(grupper.map((g) => [g.id, g]));
  const getGruppeNavn = (ytelse: string) => gruppeMap.get(ytelse)?.navn ?? ytelse;

  const getPasientEkstraBehov = (pasient: { id: number; ytelse: string }) => {
    const gruppe = gruppeMap.get(pasient.ytelse);
    if (!gruppe) return "\u2014";
    const ekstra =
      gruppe.pasienter.find((p) => p.id === pasient.id)?.ekstraBehov ?? [];
    if (ekstra.length === 0) return "\u2014";
    return formatBehov(ekstra);
  };

  const getDagNavn = (dag: number | null | undefined) => {
    if (dag === null || dag === undefined) return null;
    return DAG_NAVN[dag];
  };

  return (
    <div className="space-y-8">
      {/* Pasienter */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Pasienter
          </h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {pasienter.length}
          </span>
          <button
            onClick={() => setShowAddPasient(true)}
            className="ml-auto rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Legg til
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Navn</th>
                <th className="px-4 py-3">Alder</th>
                <th className="px-4 py-3">Diagnose</th>
                <th className="px-4 py-3">Gruppe</th>
                <th className="px-4 py-3">Tilgjengelighet</th>
                <th className="px-4 py-3">Ekstra behov</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {pasienter.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setEditingPasient(p)}
                  className="cursor-pointer border-t border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-700/50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {p.navn}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {p.alder}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {p.diagnose}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {getGruppeNavn(p.ytelse)}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {p.ankomstDag != null || p.avreiseDag != null ? (
                      <span className="text-xs">
                        {p.ankomstDag != null &&
                          `Fra ${getDagNavn(p.ankomstDag)}${p.ankomstTid ? ` kl. ${p.ankomstTid}` : ""}`}
                        {p.ankomstDag != null && p.avreiseDag != null && " \u2014 "}
                        {p.avreiseDag != null &&
                          `Til ${getDagNavn(p.avreiseDag)}${p.avreiseTid ? ` kl. ${p.avreiseTid}` : ""}`}
                      </span>
                    ) : (
                      "Hele uka"
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {getPasientEkstraBehov(p)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 opacity-0 transition-opacity [tr:hover_&]:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPasient(p);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Rediger
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Slett ${p.navn}?`))
                            deletePasient.mutate(p.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Slett
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Behandlere */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Behandlere
          </h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {behandlere.length}
          </span>
          <button
            onClick={() => setShowAddBehandler(true)}
            className="ml-auto rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Legg til
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Ansattnr</th>
                <th className="px-4 py-3">Navn</th>
                <th className="px-4 py-3">Spesialisering</th>
                <th className="px-4 py-3">Rangering</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {behandlere.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setEditingBehandler(b)}
                  className="cursor-pointer border-t border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-700/50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                    {b.ansattnr ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {b.navn}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {b.spesialisering}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {rangeringerMap?.get(b.id)?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {[...(rangeringerMap.get(b.id) ?? [])]
                          .sort((a, b) => a.rangering - b.rangering)
                          .map((r) => (
                            <span
                              key={r.gruppe_id}
                              className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                                r.rangering === 1
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                  : r.rangering === 2
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              {r.rangering}. {getGruppeNavn(r.gruppe_id)}
                            </span>
                          ))}
                      </div>
                    ) : "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 opacity-0 transition-opacity [tr:hover_&]:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBehandler(b);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Rediger
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Slett ${b.navn}?`))
                            deleteBehandler.mutate(b.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Slett
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Grupper */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Grupper
          </h2>
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
                <tr
                  key={g.id}
                  className="border-t border-zinc-100 dark:border-zinc-700/50"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {g.navn}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {g.antallPasienter}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {g.gruppeAktiviteter}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {formatBehov(g.individuelleBehovPerPasient)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      {showAddPasient && (
        <PasientFormModal
          grupper={grupper}
          pasient={null}
          onClose={() => setShowAddPasient(false)}
        />
      )}
      {editingPasient && (
        <PasientFormModal
          grupper={grupper}
          pasient={editingPasient}
          onClose={() => setEditingPasient(null)}
        />
      )}
      {showAddBehandler && (
        <BehandlerFormModal
          behandler={null}
          onClose={() => setShowAddBehandler(false)}
        />
      )}
      {editingBehandler && (
        <BehandlerFormModal
          behandler={editingBehandler}
          onClose={() => setEditingBehandler(null)}
        />
      )}
    </div>
  );
}
