import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OptimeringResultat, OptimeringStatus } from "@/types";
import { API_URL } from "@/lib/api";

async function triggerOptimering(): Promise<OptimeringResultat> {
  const response = await fetch(`${API_URL}/optimer`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Ukjent feil" }));
    throw new Error(error.detail || `Feil ved optimering: ${response.status}`);
  }

  return response.json();
}

async function resetOptimeringFn(): Promise<void> {
  const response = await fetch(`${API_URL}/optimer/reset`, { method: "POST" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Ukjent feil" }));
    throw new Error(error.detail || `Feil ved nullstilling: ${response.status}`);
  }
}

async function fetchOptimeringStatus(): Promise<OptimeringStatus> {
  const response = await fetch(`${API_URL}/optimer/status`);

  if (!response.ok) {
    throw new Error(`Feil ved henting av status: ${response.status}`);
  }

  return response.json();
}

export function useOptimering() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["optimer-status"],
    queryFn: fetchOptimeringStatus,
  });

  const mutation = useMutation({
    mutationFn: triggerOptimering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avtaler"] });
      queryClient.invalidateQueries({ queryKey: ["ikke-planlagt"] });
      queryClient.invalidateQueries({ queryKey: ["optimer-status"] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetOptimeringFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avtaler"] });
      queryClient.invalidateQueries({ queryKey: ["ikke-planlagt"] });
      queryClient.invalidateQueries({ queryKey: ["optimer-status"] });
      mutation.reset();
    },
  });

  return {
    status: statusQuery.data,
    isLoadingStatus: statusQuery.isLoading,
    runOptimering: mutation.mutate,
    isOptimering: mutation.isPending,
    optimeringResultat: mutation.data,
    optimeringError: mutation.error,
    resetOptimering: resetMutation.mutate,
    isResetting: resetMutation.isPending,
  };
}
