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
