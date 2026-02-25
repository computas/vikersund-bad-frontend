import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Behandler, Fravaer } from "@/types";
import { API_URL } from "@/lib/api";

async function fetchBehandlere(): Promise<Behandler[]> {
  const response = await fetch(`${API_URL}/behandlere`);
  if (!response.ok) {
    throw new Error(`Feil ved henting av behandlere: ${response.status}`);
  }
  return response.json();
}

export function useBehandlere() {
  return useQuery({
    queryKey: ["behandlere"],
    queryFn: fetchBehandlere,
  });
}

export function useCreateBehandler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      ansattnr: string;
      navn: string;
      spesialiseringer: string[];
    }) => {
      const response = await fetch(`${API_URL}/behandlere`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Kunne ikke opprette behandler");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["behandlere"] });
    },
  });
}

export function useUpdateBehandler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      ansattnr?: string;
      navn?: string;
      spesialiseringer?: string[];
    }) => {
      const response = await fetch(`${API_URL}/behandlere/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Kunne ikke oppdatere behandler");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["behandlere"] });
    },
  });
}

export function useDeleteBehandler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/behandlere/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Kunne ikke slette behandler");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["behandlere"] });
    },
  });
}

export function useFravaer(behandlerId: number) {
  return useQuery({
    queryKey: ["fravaer", behandlerId],
    queryFn: async (): Promise<Fravaer[]> => {
      const response = await fetch(
        `${API_URL}/behandlere/${behandlerId}/fravaer`
      );
      if (!response.ok) throw new Error("Feil ved henting av fravaer");
      return response.json();
    },
    enabled: !!behandlerId,
  });
}

export function useCreateFravaer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      behandlerId,
      dato,
      grunn,
    }: {
      behandlerId: number;
      dato: string;
      grunn?: string;
    }) => {
      const response = await fetch(
        `${API_URL}/behandlere/${behandlerId}/fravaer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dato, grunn: grunn ?? "" }),
        }
      );
      if (!response.ok) throw new Error("Kunne ikke registrere fravaer");
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fravaer", variables.behandlerId],
      });
    },
  });
}

export function useDeleteFravaer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      behandlerId,
      fravaerId,
    }: {
      behandlerId: number;
      fravaerId: number;
    }) => {
      const response = await fetch(
        `${API_URL}/behandlere/${behandlerId}/fravaer/${fravaerId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Kunne ikke slette fravaer");
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fravaer", variables.behandlerId],
      });
    },
  });
}
