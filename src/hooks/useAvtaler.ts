import { useQuery } from "@tanstack/react-query";
import { Avtale } from "@/types";

const API_URL = "http://localhost:8000/avtaler";

type UseAvtalerOptions = {
  startDato?: string; // YYYY-MM-DD
};

async function fetchAvtaler(startDato?: string): Promise<Avtale[]> {
  const url = new URL(API_URL);

  if (startDato) {
    url.searchParams.set("start_date", startDato);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Feil ved henting av avtaler: ${response.status}`);
  }
  console.log("Fetched avtaler:", await response.clone().json());

  return response.json();
}

export function useAvtaler(options?: UseAvtalerOptions) {
  const { startDato } = options ?? {};

  return useQuery({
    queryKey: ["avtaler", startDato],
    queryFn: () => fetchAvtaler(startDato),
  });
}
