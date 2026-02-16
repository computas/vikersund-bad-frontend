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
  ernaering: {
    bg: "bg-orange-100",
    bgDark: "dark:bg-orange-900",
    text: "text-orange-900",
    textDark: "dark:text-orange-100",
    textSecondary: "text-orange-700",
    textSecondaryDark: "dark:text-orange-300",
    dot: "bg-orange-500",
    label: "Ernæring",
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
    bg: "bg-indigo-100",
    bgDark: "dark:bg-indigo-900",
    text: "text-indigo-900",
    textDark: "dark:text-indigo-100",
    textSecondary: "text-indigo-700",
    textSecondaryDark: "dark:text-indigo-300",
    dot: "bg-indigo-500",
    label: "Gruppeaktivitet",
  },
};

const KEYWORD_MAP: [string[], string][] = [
  [["fysioterapi"], "fysio"],
  [["kontaktperson"], "kontaktperson"],
  [["basseng"], "basseng"],
  [["sterk", "sirkeltrening", "stoltrim", "aktiv ute", "rygg", "game on", "naturlig sterk", "håndtrening", "hofte"], "trening"],
  [["fellesundervisning", "temasamling", "stress", "kognisjon", "langvarig"], "undervisning"],
  [["mediyoga", "hvile", "avspenning"], "avspenning"],
  [["ernæring", "ernaering"], "ernaering"],
  [["tverrfaglig", "arbeidsgruppe", "arbeid og helse"], "mote"],
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
