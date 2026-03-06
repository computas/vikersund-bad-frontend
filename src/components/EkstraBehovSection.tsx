"use client";

import { useState } from "react";
import {
  useEkstraBehov,
  useCreateEkstraBehov,
  useDeleteEkstraBehov,
} from "@/hooks";

const SPESIALISERINGER = [
  "FYSIO",
  "SYKEPLEIER",
  "PSYKOLOG",
  "KONTAKTPERSON",
  "SYNSPEDAGOG",
];

export type LocalBehov = { type: string; varighet: number; antall: number };

export function EkstraBehovSection({
  pasientId,
  localBehov,
  onLocalBehovChange,
}: {
  pasientId: number | null;
  localBehov: LocalBehov[];
  onLocalBehovChange: (behov: LocalBehov[]) => void;
}) {
  const { data: apiBehov = [] } = useEkstraBehov(pasientId);
  const createEkstraBehov = useCreateEkstraBehov();
  const deleteEkstraBehov = useDeleteEkstraBehov();

  const [newBehov, setNewBehov] = useState({
    type: "FYSIO",
    varighet: "30",
    antall: "1",
  });

  const displayBehov = pasientId !== null ? apiBehov : localBehov;

  const handleAdd = () => {
    const behov = {
      type: newBehov.type,
      varighet: Number(newBehov.varighet),
      antall: Number(newBehov.antall),
    };
    if (pasientId !== null) {
      createEkstraBehov.mutate({
        pasientId,
        type: behov.type,
        varighet_min: behov.varighet,
        antall_per_uke: behov.antall,
      });
    } else {
      onLocalBehovChange([...localBehov, behov]);
    }
  };

  const handleRemove = (index: number) => {
    if (pasientId !== null) {
      const b = apiBehov[index];
      if (b?.id) {
        deleteEkstraBehov.mutate({ pasientId, behovId: b.id });
      }
    } else {
      onLocalBehovChange(localBehov.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-700">
      <h4 className="mb-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        Ekstra behov
      </h4>
      {displayBehov.length > 0 && (
        <ul className="mb-3 space-y-1">
          {displayBehov.map((b, idx) => (
            <li
              key={
                pasientId !== null && "id" in b ? (b as { id: number }).id : idx
              }
              className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-1.5 text-sm dark:bg-zinc-700/50"
            >
              <span className="text-zinc-700 dark:text-zinc-300">
                {b.antall}&times; {b.type} ({b.varighet} min)
              </span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Fjern
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
            Type
          </label>
          <select
            value={newBehov.type}
            onChange={(e) => setNewBehov({ ...newBehov, type: e.target.value })}
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          >
            {SPESIALISERINGER.map((s) => (
              <option
                key={s}
                value={s}
              >
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="w-20">
          <label className="mb-1 block text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
            Varighet
          </label>
          <select
            value={newBehov.varighet}
            onChange={(e) =>
              setNewBehov({ ...newBehov, varighet: e.target.value })
            }
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          >
            {[15, 30, 45, 60, 75, 90].map((m) => (
              <option
                key={m}
                value={m}
              >
                {m} min
              </option>
            ))}
          </select>
        </div>
        <div className="w-16">
          <label className="mb-1 block text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
            Ant/uke
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={newBehov.antall}
            onChange={(e) =>
              setNewBehov({ ...newBehov, antall: e.target.value })
            }
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          />
        </div>
        <button
          type="button"
          disabled={createEkstraBehov.isPending}
          onClick={handleAdd}
          className="rounded bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-500"
        >
          + Legg til
        </button>
      </div>
    </div>
  );
}
