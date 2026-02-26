export type Pasient = {
  id: number;
  navn: string;
  alder: number;
  diagnose: string;
  ytelse: string;
};

export type Behandler = {
  id: number;
  navn: string;
  spesialisering: string;
};

export type Avtale = {
  id: number;
  pasientId: number;
  behandlerId: number | null;
  dato: string; // YYYY-MM-DD
  startTid: string; // HH:MM
  sluttTid: string; // HH:MM
  beskrivelse: string;
  type?: "gruppe" | "individuell";
};

export type IkkePlanlagt = {
  pasientId: number;
  pasientNavn: string;
  type: string;
  beskrivelse: string;
  årsak: string;
};

export type OptimeringResultat = {
  status: string;
  planlagt: number;
  ikkePlanlagt: number;
  gruppeDroppet: number;
  totalt: number;
  objektverdi: number;
  losningstid: number;
  tidspunkt: string;
};

export type BehovTemplate = {
  type: string;
  varighet: number;
  antall: number;
  beskrivelse: string;
};

export type GruppePasient = {
  id: number;
  navn: string;
  diagnose: string;
  ekstraBehov: BehovTemplate[];
};

export type GruppeAktivitetPlan = {
  dag: number;
  dagNavn: string;
  startTid: string;
  sluttTid: string;
  aktivitet: string;
};

export type Gruppe = {
  id: string;
  navn: string;
  startDato: string | null;
  antallPasienter: number;
  pasienter: GruppePasient[];
  gruppeAktiviteter: number;
  ukentligPlan: GruppeAktivitetPlan[];
  individuelleBehovPerPasient: BehovTemplate[];
};

export type OptimeringStatus = {
  kjorer: boolean;
  harResultat: boolean;
  sistKjort: string | null;
  planlagt: number | null;
  ikkePlanlagt: number | null;
  totalt: number | null;
  solverStatus: string | null;
};
