import { useQuery } from "@tanstack/react-query";
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
