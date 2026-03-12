"use client";

import { useState, useEffect, useRef } from "react";
import { useCreatePasient, useUpdatePasient, useCreateEkstraBehov } from "@/hooks";
import { EkstraBehovSection, type LocalBehov } from "./EkstraBehovSection";
import type { Gruppe, Pasient } from "@/types";

const DAG_NAVN = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

const TID_VALG = (() => {
  const tider: string[] = [];
  for (let h = 9; h < 16; h++) {
    for (let m = 0; m < 60; m += 15) {
      tider.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return tider;
})();

export function PasientFormModal({
  grupper,
  pasient,
  onClose,
}: {
  grupper: Gruppe[];
  pasient: Pasient | null;
  onClose: () => void;
}) {
  const isEditing = pasient !== null;
  const createPasient = useCreatePasient();
  const updatePasient = useUpdatePasient();
  const createEkstraBehov = useCreateEkstraBehov();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [pendingBehov, setPendingBehov] = useState<LocalBehov[]>([]);

  const defaultForm = {
    navn: "",
    alder: "",
    diagnose: "",
    gruppe_id: grupper[0]?.id ?? "",
    ankomst_dag: "",
    avreise_dag: "",
    ankomst_tid: "",
    avreise_tid: "",
  };

  const [form, setForm] = useState(
    isEditing
      ? {
          navn: pasient.navn,
          alder: pasient.alder?.toString() ?? "",
          diagnose: pasient.diagnose,
          gruppe_id: pasient.ytelse ?? grupper[0]?.id ?? "",
          ankomst_dag: pasient.ankomstDag?.toString() ?? "",
          avreise_dag: pasient.avreiseDag?.toString() ?? "",
          ankomst_tid: pasient.ankomstTid ?? "",
          avreise_tid: pasient.avreiseTid ?? "",
        }
      : defaultForm
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const saveAndCreate = async () => {
    const payload = {
      navn: form.navn,
      alder: Number(form.alder),
      diagnose: form.diagnose,
      gruppe_id: form.gruppe_id,
      ankomst_dag: form.ankomst_dag ? Number(form.ankomst_dag) : null,
      avreise_dag: form.avreise_dag ? Number(form.avreise_dag) : null,
      ankomst_tid: form.ankomst_tid || null,
      avreise_tid: form.avreise_tid || null,
    };

    const newPasient = await createPasient.mutateAsync(payload);
    for (const behov of pendingBehov) {
      await createEkstraBehov.mutateAsync({
        pasientId: newPasient.id,
        type: behov.type,
        varighet_min: behov.varighet,
        antall_per_uke: behov.antall,
      });
    }
    return newPasient;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updatePasient.mutate(
        {
          id: pasient.id,
          navn: form.navn,
          alder: Number(form.alder),
          diagnose: form.diagnose,
          gruppe_id: form.gruppe_id,
          ankomst_dag: form.ankomst_dag ? Number(form.ankomst_dag) : null,
          avreise_dag: form.avreise_dag ? Number(form.avreise_dag) : null,
          ankomst_tid: form.ankomst_tid || null,
          avreise_tid: form.avreise_tid || null,
        },
        { onSuccess: onClose }
      );
    } else {
      await saveAndCreate();
      onClose();
    }
  };

  const handleSaveAndAddNew = async () => {
    await saveAndCreate();
    setForm(defaultForm);
    setPendingBehov([]);
    firstFieldRef.current?.focus();
  };

  const isPending =
    createPasient.isPending || updatePasient.isPending || createEkstraBehov.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {isEditing ? "Rediger pasient" : "Ny pasient"}
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Navn
              </label>
              <input
                ref={firstFieldRef}
                required
                value={form.navn}
                onChange={(e) => setForm({ ...form, navn: e.target.value })}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Alder
              </label>
              <input
                required
                type="number"
                min={0}
                max={120}
                value={form.alder}
                onChange={(e) => setForm({ ...form, alder: e.target.value })}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Diagnose
              </label>
              <input
                required
                value={form.diagnose}
                onChange={(e) => setForm({ ...form, diagnose: e.target.value })}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Gruppe (ytelse)
              </label>
              <select
                value={form.gruppe_id}
                onChange={(e) => setForm({ ...form, gruppe_id: e.target.value })}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                {grupper.map((g) => (
                  <option key={g.id} value={g.id}>{g.navn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Ankomstdag
              </label>
              <div className="flex gap-2">
                <select
                  value={form.ankomst_dag}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ankomst_dag: e.target.value,
                      ...(!e.target.value ? { ankomst_tid: "" } : {}),
                    })
                  }
                  className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Hele uka</option>
                  {DAG_NAVN.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
                {form.ankomst_dag && (
                  <select
                    value={form.ankomst_tid}
                    onChange={(e) => setForm({ ...form, ankomst_tid: e.target.value })}
                    className="w-24 rounded-md border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Kl.</option>
                    {TID_VALG.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Avreisedag
              </label>
              <div className="flex gap-2">
                <select
                  value={form.avreise_dag}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      avreise_dag: e.target.value,
                      ...(!e.target.value ? { avreise_tid: "" } : {}),
                    })
                  }
                  className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Hele uka</option>
                  {DAG_NAVN.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
                {form.avreise_dag && (
                  <select
                    value={form.avreise_tid}
                    onChange={(e) => setForm({ ...form, avreise_tid: e.target.value })}
                    className="w-24 rounded-md border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Kl.</option>
                    {TID_VALG.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <EkstraBehovSection
            pasientId={isEditing ? pasient.id : null}
            localBehov={pendingBehov}
            onLocalBehovChange={setPendingBehov}
          />

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Avbryt
            </button>
            {!isEditing && (
              <button
                type="button"
                disabled={isPending || !form.navn || !form.alder || !form.diagnose}
                onClick={handleSaveAndAddNew}
                className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                {isPending ? "Lagrer..." : "Lagre og legg til ny"}
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Lagrer..." : isEditing ? "Lagre endringer" : "Lagre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
