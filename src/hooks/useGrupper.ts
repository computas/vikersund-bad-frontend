import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gruppe } from "@/types";
import { API_URL } from "@/lib/api";

async function fetchGrupper(): Promise<Gruppe[]> {
  const response = await fetch(`${API_URL}/grupper`);

  if (!response.ok) {
    throw new Error(`Feil ved henting av grupper: ${response.status}`);
  }

  return response.json();
}

export function useGrupper() {
  return useQuery({
    queryKey: ["grupper"],
    queryFn: fetchGrupper,
  });
}

export function useUpdateGruppeAktivitet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gruppeId,
      aktivitetId,
      dag,
      startTid,
      sluttTid,
      aktivitetNavn,
      aktivitetType,
      behandlerId,
    }: {
      gruppeId: string;
      aktivitetId: number;
      dag: number;
      startTid: string;
      sluttTid: string;
      aktivitetNavn: string;
      aktivitetType?: string;
      behandlerId: number | null;
    }) => {
      const response = await fetch(
        `${API_URL}/grupper/${gruppeId}/aktiviteter/${aktivitetId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dag,
            start_tid: startTid,
            slutt_tid: sluttTid,
            aktivitet_navn: aktivitetNavn,
            ...(aktivitetType !== undefined && { type: aktivitetType }),
            behandler_id: behandlerId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Feil ved oppdatering av gruppeaktivitet: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupper"] });
      queryClient.invalidateQueries({ queryKey: ["avtaler"] });
    },
  });
}

export function useDeleteGruppeAktivitet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gruppeId,
      aktivitetId,
    }: {
      gruppeId: string;
      aktivitetId: number;
    }) => {
      const response = await fetch(
        `${API_URL}/grupper/${gruppeId}/aktiviteter/${aktivitetId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error(`Feil ved sletting av gruppeaktivitet: ${response.status}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupper"] });
      queryClient.invalidateQueries({ queryKey: ["avtaler"] });
    },
  });
}

export function useCreateGruppeAktivitet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gruppeId,
      dag,
      startTid,
      sluttTid,
      aktivitetNavn,
      aktivitetType,
      behandlerId,
    }: {
      gruppeId: string;
      dag: number;
      startTid: string;
      sluttTid: string;
      aktivitetNavn: string;
      aktivitetType?: string;
      behandlerId: number | null;
    }) => {
      const response = await fetch(
        `${API_URL}/grupper/${gruppeId}/aktiviteter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dag,
            start_tid: startTid,
            slutt_tid: sluttTid,
            aktivitet_navn: aktivitetNavn,
            ...(aktivitetType && { type: aktivitetType }),
            behandler_id: behandlerId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Feil ved opprettelse av gruppeaktivitet: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupper"] });
      queryClient.invalidateQueries({ queryKey: ["avtaler"] });
    },
  });
}
