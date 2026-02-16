import { useQuery } from "@tanstack/react-query";
import { Avtale } from "@/types";
import { API_URL } from "@/lib/api";

type UseAvtalerOptions = {
  startDato?: string; // YYYY-MM-DD
};

async function fetchAvtaler(startDato?: string): Promise<Avtale[]> {
  const url = new URL(`${API_URL}/avtaler`);

  if (startDato) {
    url.searchParams.set("start_date", startDato);
  }

  const response = await fetch(url.toString());

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Feil ved henting av avtaler: ${response.status}`);
  }

  return response.json();
}

export function useAvtaler(options?: UseAvtalerOptions) {
  const { startDato } = options ?? {};

  return useQuery({
    queryKey: ["avtaler", startDato],
    queryFn: () => fetchAvtaler(startDato),
  });
}
