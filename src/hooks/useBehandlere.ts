import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Behandler, BehandlerRangering } from "@/types";
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

export function useBehandlereRangeringer(behandlerIds: number[]) {
  return useQuery({
    queryKey: ["behandlereRangeringer", behandlerIds],
    queryFn: async () => {
      const results = await Promise.all(
        behandlerIds.map(async (id) => {
          const res = await fetch(`${API_URL}/behandlere/${id}/rangering`);
          if (!res.ok) return { behandlerId: id, rangeringer: [] as BehandlerRangering[] };
          const rangeringer: BehandlerRangering[] = await res.json();
          return { behandlerId: id, rangeringer };
        })
      );
      return new Map(results.map((r) => [r.behandlerId, r.rangeringer]));
    },
    enabled: behandlerIds.length > 0,
  });
}
