import { useQuery } from "@tanstack/react-query";
import { IkkePlanlagt } from "@/types";

const API_URL = "http://localhost:8000/ikke-planlagt";

async function fetchIkkePlanlagt(): Promise<IkkePlanlagt[]> {
  const response = await fetch(API_URL);

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
