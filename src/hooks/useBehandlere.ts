import { useQuery } from "@tanstack/react-query";
import { Behandler } from "@/types";
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
