import { Pasient } from "@/types";

// Patients in a VIDEO_* group are at home this week and only have video meetings
// (before arrival or 6 weeks after the stay). See seed2.py in the backend.
const VIDEO_GRUPPE_PREFIX = "VIDEO_";

export function erKunVideo(pasient: Pasient): boolean {
  return pasient.ytelse.startsWith(VIDEO_GRUPPE_PREFIX);
}

// A short, stable number per patient (1, 2, 3 …) so patients are easy to find across views.
// The database id keeps growing after every reseed, so it is not useful to show.
export function nummererPasienter(pasienter: Pasient[]): Pasient[] {
  return [...pasienter]
    .sort((a, b) => a.id - b.id)
    .map((p, i) => ({ ...p, nr: i + 1 }));
}

export function formatNr(nr: number | undefined): string {
  return nr === undefined ? "" : String(nr).padStart(2, "0");
}

export function pasientEtikett(pasient: Pasient | undefined): string | null {
  if (!pasient) return null;
  return pasient.nr === undefined ? pasient.navn : `${formatNr(pasient.nr)} ${pasient.navn}`;
}

export function delPasienter(pasienter: Pasient[]) {
  const kunVideo = pasienter.filter(erKunVideo);
  return { paaHuset: pasienter.length - kunVideo.length, kunVideo: kunVideo.length };
}
