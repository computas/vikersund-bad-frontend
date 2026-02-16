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
  behandlerId: number;
  dato: string; // YYYY-MM-DD
  startTid: string; // HH:MM
  sluttTid: string; // HH:MM
  beskrivelse: string;
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
  totalt: number;
  objektverdi: number;
  losningstid: number;
  tidspunkt: string;
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
