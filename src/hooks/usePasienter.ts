import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pasient } from "@/types";
import { API_URL } from "@/lib/api";

async function fetchPasienter(): Promise<Pasient[]> {
  const response = await fetch(`${API_URL}/pasienter`);
  if (!response.ok) {
    throw new Error(`Feil ved henting av pasienter: ${response.status}`);
  }
  return response.json();
}

export function usePasienter() {
  return useQuery({
    queryKey: ["pasienter"],
    queryFn: fetchPasienter,
  });
}

export function useCreatePasient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      navn: string;
      alder: number;
      diagnose: string;
      gruppe_id: string;
      ytelse_id?: string | null;
      ankomst_dag?: number | null;
      avreise_dag?: number | null;
      ankomst_tid?: string | null;
      avreise_tid?: string | null;
    }) => {
      const response = await fetch(`${API_URL}/pasienter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Kunne ikke opprette pasient");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasienter"] });
      queryClient.invalidateQueries({ queryKey: ["grupper"] });
    },
  });
}

export function useUpdatePasient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      navn?: string;
      alder?: number;
      diagnose?: string;
      gruppe_id?: string;
      ytelse_id?: string | null;
      ankomst_dag?: number | null;
      avreise_dag?: number | null;
      ankomst_tid?: string | null;
      avreise_tid?: string | null;
    }) => {
      const response = await fetch(`${API_URL}/pasienter/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Kunne ikke oppdatere pasient");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasienter"] });
      queryClient.invalidateQueries({ queryKey: ["grupper"] });
    },
  });
}

export function useDeletePasient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/pasienter/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Kunne ikke slette pasient");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasienter"] });
      queryClient.invalidateQueries({ queryKey: ["grupper"] });
    },
  });
}

export function useEkstraBehov(pasientId: number | null) {
  return useQuery({
    queryKey: ["ekstra-behov", pasientId],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/pasienter/${pasientId}/ekstra-behov`
      );
      if (!response.ok) throw new Error("Feil ved henting av ekstra behov");
      return response.json() as Promise<
        {
          id: number;
          type: string;
          varighet: number;
          antall: number;
          beskrivelse: string;
        }[]
      >;
    },
    enabled: pasientId !== null,
  });
}

export function useCreateEkstraBehov() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pasientId,
      type,
      varighet_min,
      antall_per_uke,
      beskrivelse,
    }: {
      pasientId: number;
      type: string;
      varighet_min: number;
      antall_per_uke: number;
      beskrivelse?: string;
    }) => {
      const response = await fetch(
        `${API_URL}/pasienter/${pasientId}/ekstra-behov`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            varighet_min,
            antall_per_uke,
            beskrivelse: beskrivelse ?? "",
          }),
        }
      );
      if (!response.ok) throw new Error("Kunne ikke opprette ekstra behov");
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ekstra-behov", variables.pasientId],
      });
      queryClient.invalidateQueries({ queryKey: ["pasienter"] });
      queryClient.invalidateQueries({ queryKey: ["grupper"] });
    },
  });
}

export function useDeleteEkstraBehov() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pasientId,
      behovId,
    }: {
      pasientId: number;
      behovId: number;
    }) => {
      const response = await fetch(
        `${API_URL}/pasienter/${pasientId}/ekstra-behov/${behovId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Kunne ikke slette ekstra behov");
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ekstra-behov", variables.pasientId],
      });
      queryClient.invalidateQueries({ queryKey: ["pasienter"] });
      queryClient.invalidateQueries({ queryKey: ["grupper"] });
    },
  });
}
