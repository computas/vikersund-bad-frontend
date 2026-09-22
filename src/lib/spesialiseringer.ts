// Må holdes i synk med Specialty i backend (models.py) — solveren avviser ukjente verdier.
export const SPESIALISERINGER = [
  "FYSIO",
  "SPESIAL_FYSIO",
  "KONTAKTPERSON",
  "LEGE",
  "SYKEPLEIER",
  "ERGOTERAPI",
  "LOGOPED",
  "PSYKOLOG",
  "SYNSPEDAGOG",
  "ERNÆRING",
] as const;
