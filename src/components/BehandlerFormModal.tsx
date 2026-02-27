"use client";

import { useState, useEffect, useRef } from "react";
import { useCreateBehandler, useUpdateBehandler } from "@/hooks";
import type { Behandler } from "@/types";

const SPESIALISERINGER = [
  "FYSIO",
  "LEGE",
  "SYKEPLEIER",
  "ERGOTERAPI",
  "LOGOPED",
  "PSYKOLOG",
  "ERNÆRING",
  "KONTAKTPERSON",
];

export function BehandlerFormModal({
  behandler,
  onClose,
}: {
  behandler: Behandler | null;
  onClose: () => void;
}) {
  const isEditing = behandler !== null;
  const createBehandler = useCreateBehandler();
  const updateBehandler = useUpdateBehandler();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const defaultForm = {
    ansattnr: "",
    navn: "",
    spesialiseringer: [] as string[],
  };

  const [form, setForm] = useState(
    isEditing
      ? {
          ansattnr: behandler.ansattnr ?? "",
          navn: behandler.navn,
          spesialiseringer:
            behandler.spesialiseringer ??
            (behandler.spesialisering ? behandler.spesialisering.split(", ") : []),
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

  const toggleSpec = (spec: string) => {
    setForm((prev) => ({
      ...prev,
      spesialiseringer: prev.spesialiseringer.includes(spec)
        ? prev.spesialiseringer.filter((s) => s !== spec)
        : [...prev.spesialiseringer, spec],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.spesialiseringer.length === 0) return;

    if (isEditing) {
      updateBehandler.mutate(
        {
          id: behandler.id,
          ansattnr: form.ansattnr,
          navn: form.navn,
          spesialiseringer: form.spesialiseringer,
        },
        { onSuccess: onClose }
      );
    } else {
      createBehandler.mutate(form, { onSuccess: onClose });
    }
  };

  const handleSaveAndAddNew = () => {
    if (form.spesialiseringer.length === 0) return;
    createBehandler.mutate(form, {
      onSuccess: () => {
        setForm(defaultForm);
        firstFieldRef.current?.focus();
      },
    });
  };

  const isPending = createBehandler.isPending || updateBehandler.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {isEditing ? "Rediger behandler" : "Ny behandler"}
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
                Ansattnr
              </label>
              <input
                ref={firstFieldRef}
                required
                value={form.ansattnr}
                onChange={(e) => setForm({ ...form, ansattnr: e.target.value })}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Navn
              </label>
              <input
                required
                value={form.navn}
                onChange={(e) => setForm({ ...form, navn: e.target.value })}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Spesialiseringer
            </label>
            <div className="flex flex-wrap gap-2">
              {SPESIALISERINGER.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpec(spec)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    form.spesialiseringer.includes(spec)
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
            {form.spesialiseringer.length === 0 && (
              <p className="mt-1 text-xs text-red-500">Velg minst en spesialisering</p>
            )}
          </div>

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
                disabled={isPending || form.spesialiseringer.length === 0 || !form.ansattnr || !form.navn}
                onClick={handleSaveAndAddNew}
                className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                {isPending ? "Lagrer..." : "Lagre og legg til ny"}
              </button>
            )}
            <button
              type="submit"
              disabled={isPending || form.spesialiseringer.length === 0}
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
