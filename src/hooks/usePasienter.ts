import { useQuery } from "@tanstack/react-query";
import { Pasient } from "@/types";

const API_URL = "http://localhost:8000/pasienter";

async function fetchPasienter(): Promise<Pasient[]> {
  const response = await fetch(API_URL);

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
