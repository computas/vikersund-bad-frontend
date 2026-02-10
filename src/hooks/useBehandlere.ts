import { useQuery } from "@tanstack/react-query";
import { Behandler } from "@/types";

const API_URL = "http://localhost:8000/behandlere";

async function fetchBehandlere(): Promise<Behandler[]> {
  const response = await fetch(API_URL);

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
