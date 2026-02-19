import { useQuery } from "@tanstack/react-query";
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
