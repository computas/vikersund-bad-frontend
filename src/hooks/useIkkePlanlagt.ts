import { useQuery } from "@tanstack/react-query";
import { IkkePlanlagt } from "@/types";
import { API_URL } from "@/lib/api";

async function fetchIkkePlanlagt(): Promise<IkkePlanlagt[]> {
  const response = await fetch(`${API_URL}/ikke-planlagt`);

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Feil ved henting av ikke-planlagte timer: ${response.status}`);
  }

  return response.json();
}

export function useIkkePlanlagt() {
  return useQuery({
    queryKey: ["ikke-planlagt"],
    queryFn: fetchIkkePlanlagt,
  });
}
