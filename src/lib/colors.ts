type ColorScheme = {
  bg: string;
  bgDark: string;
  text: string;
  textDark: string;
  textSecondary: string;
  textSecondaryDark: string;
  dot: string;
  label: string;
};

const COLORS: Record<string, ColorScheme> = {
  fysio: {
    bg: "bg-blue-100",
    bgDark: "dark:bg-blue-900",
    text: "text-blue-900",
    textDark: "dark:text-blue-100",
    textSecondary: "text-blue-700",
    textSecondaryDark: "dark:text-blue-300",
    dot: "bg-blue-500",
    label: "Fysioterapi",
  },
  kontaktperson: {
    bg: "bg-pink-100",
    bgDark: "dark:bg-pink-900",
    text: "text-pink-900",
    textDark: "dark:text-pink-100",
    textSecondary: "text-pink-700",
    textSecondaryDark: "dark:text-pink-300",
    dot: "bg-pink-500",
    label: "Kontaktperson",
  },
  basseng: {
    bg: "bg-teal-100",
    bgDark: "dark:bg-teal-900",
    text: "text-teal-900",
    textDark: "dark:text-teal-100",
    textSecondary: "text-teal-700",
    textSecondaryDark: "dark:text-teal-300",
    dot: "bg-teal-500",
    label: "Basseng",
  },
  trening: {
    bg: "bg-emerald-100",
    bgDark: "dark:bg-emerald-900",
    text: "text-emerald-900",
    textDark: "dark:text-emerald-100",
    textSecondary: "text-emerald-700",
    textSecondaryDark: "dark:text-emerald-300",
    dot: "bg-emerald-500",
    label: "Trening",
  },
  undervisning: {
    bg: "bg-amber-100",
    bgDark: "dark:bg-amber-900",
    text: "text-amber-900",
    textDark: "dark:text-amber-100",
    textSecondary: "text-amber-700",
    textSecondaryDark: "dark:text-amber-300",
    dot: "bg-amber-500",
    label: "Undervisning",
  },
  avspenning: {
    bg: "bg-purple-100",
    bgDark: "dark:bg-purple-900",
    text: "text-purple-900",
    textDark: "dark:text-purple-100",
    textSecondary: "text-purple-700",
    textSecondaryDark: "dark:text-purple-300",
    dot: "bg-purple-500",
    label: "Avspenning",
  },
  sykepleier: {
    bg: "bg-cyan-100",
    bgDark: "dark:bg-cyan-900",
    text: "text-cyan-900",
    textDark: "dark:text-cyan-100",
    textSecondary: "text-cyan-700",
    textSecondaryDark: "dark:text-cyan-300",
    dot: "bg-cyan-500",
    label: "Sykepleier",
  },
  synspedagog: {
    bg: "bg-violet-100",
    bgDark: "dark:bg-violet-900",
    text: "text-violet-900",
    textDark: "dark:text-violet-100",
    textSecondary: "text-violet-700",
    textSecondaryDark: "dark:text-violet-300",
    dot: "bg-violet-500",
    label: "Synspedagog",
  },
  mote: {
    bg: "bg-slate-200",
    bgDark: "dark:bg-slate-800",
    text: "text-slate-900",
    textDark: "dark:text-slate-100",
    textSecondary: "text-slate-600",
    textSecondaryDark: "dark:text-slate-300",
    dot: "bg-slate-500",
    label: "Møte/Admin",
  },
  gruppe: {
    bg: "bg-lime-100",
    bgDark: "dark:bg-lime-900",
    text: "text-lime-900",
    textDark: "dark:text-lime-100",
    textSecondary: "text-lime-700",
    textSecondaryDark: "dark:text-lime-300",
    dot: "bg-lime-500",
    label: "Gruppeaktivitet",
  },
  psykolog: {
    bg: "bg-rose-100",
    bgDark: "dark:bg-rose-900",
    text: "text-rose-900",
    textDark: "dark:text-rose-100",
    textSecondary: "text-rose-700",
    textSecondaryDark: "dark:text-rose-300",
    dot: "bg-rose-500",
    label: "Psykolog",
  },
};

const KEYWORD_MAP: [string[], string][] = [
  [["fysioterapi"], "fysio"],
  [["kontaktperson"], "kontaktperson"],
  [["basseng"], "basseng"],
  [
    [
      "sterk",
      "sirkeltrening",
      "stoltrim",
      "aktiv ute",
      "rygg",
      "game on",
      "naturlig sterk",
      "håndtrening",
      "hofte",
      "pilates",
    ],
    "trening",
  ],
  [
    [
      "fellesundervisning",
      "temasamling",
      "stress",
      "kognisjon",
      "langvarig",
      "barn som pårørende",
      "arbeid og helse",
      "ernæring",
    ],
    "undervisning",
  ],
  [["mediyoga", "hvile", "avspenning"], "avspenning"],
  [["arr kons", "sykepleier"], "sykepleier"],
  [["optometrist", "optimetrist", "synspedagog"], "synspedagog"],
  [["tverrfaglig", "arbeidsgruppe"], "mote"],
  [["psykolog"], "psykolog"],
];

export function getAvtaleColor(beskrivelse: string): ColorScheme {
  const lower = beskrivelse.toLowerCase();
  for (const [keywords, category] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return COLORS[category];
    }
  }
  return COLORS.gruppe;
}

export function getAvtaleCategory(beskrivelse: string): string {
  const lower = beskrivelse.toLowerCase();
  for (const [keywords, category] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "gruppe";
}

export function getCategoryColor(category: string): ColorScheme {
  return COLORS[category] ?? COLORS.gruppe;
}

export { COLORS };

const YTELSE_OVERRIDES: Record<string, string> = {
  YTELSE_AO: "Ytelse A+O",
};

// Konverterer f.eks. "YTELSE_B" → "Ytelse B"
export function formatYtelseId(id: string): string {
  if (id in YTELSE_OVERRIDES) return YTELSE_OVERRIDES[id];
  return id
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
