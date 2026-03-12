export type Pasient = {
  id: number;
  navn: string;
  alder: number;
  diagnose: string;
  ytelse: string;
  ankomstDag?: number | null;
  avreiseDag?: number | null;
  ankomstTid?: string | null;
  avreiseTid?: string | null;
  preferanser?: Record<string, unknown>;
  ekstraBehov?: BehovTemplate[];
};

export type Behandler = {
  id: number;
  ansattnr?: string;
  navn: string;
  spesialisering: string;
  spesialiseringer?: string[];
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
  aktivitetType?: string; // f.eks. "basseng", "trening", "undervisning"
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
  løsningstid: number;
  tidspunkt: string;
};

export type BehovTemplate = {
  id?: number;
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
  id?: number;
  dag: number;
  dagNavn: string;
  startTid: string;
  sluttTid: string;
  aktivitet: string;
  type?: string; // f.eks. "basseng", "trening", "undervisning"
  behandlerId?: number | null;
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

export type BehandlerRangering = {
  gruppe_id: string;
  rangering: number;
};

export type OptimeringStatus = {
  kjorer: boolean;
  harResultat: boolean;
  sistKjort: string | null;
  planlagt: number | null;
  ikkePlanlagt: number | null;
  totalt: number | null;
  solverStatus: string | null;
  gruppeDroppet: number | null;
};
