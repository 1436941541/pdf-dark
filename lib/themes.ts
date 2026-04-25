// Dark-mode theme filters, applied via CSS `filter` on each rendered page.
// These are v1 global filters. v2 will do smarter color mapping (keep images original).

export type ThemeId = "midnight" | "sepia" | "solarized" | "oled";

export const THEMES: Record<
  ThemeId,
  { label: string; filter: string; swatch: string }
> = {
  midnight: {
    label: "Midnight",
    filter: "invert(1) hue-rotate(180deg)",
    swatch: "#0a0a0a",
  },
  sepia: {
    label: "Sepia",
    filter: "invert(0.92) hue-rotate(180deg) sepia(0.4)",
    swatch: "#3b2e1f",
  },
  solarized: {
    label: "Solarized",
    filter: "invert(0.9) hue-rotate(170deg) saturate(0.6) brightness(1.02)",
    swatch: "#073642",
  },
  oled: {
    label: "OLED",
    filter: "invert(1) contrast(1.12)",
    swatch: "#000000",
  },
};

export const THEME_IDS: ThemeId[] = ["midnight", "sepia", "solarized", "oled"];
