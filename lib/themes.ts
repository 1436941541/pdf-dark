// Dark-mode themes. Each theme defines the background RGB the algorithm
// in pixel-dark.ts / dark-worker.ts maps "white" pixels to (black pixels map
// to white). `swatch` is the same color in hex, used to paint the page frame.

export type ThemeId = "midnight" | "sepia" | "solarized" | "oled";

export const THEMES: Record<
  ThemeId,
  { label: string; r: number; g: number; b: number; swatch: string }
> = {
  midnight: {
    label: "Midnight",
    r: 25,
    g: 30,
    b: 45,
    swatch: "rgb(25, 30, 45)",
  },
  sepia: {
    label: "Sepia",
    r: 40,
    g: 35,
    b: 25,
    swatch: "rgb(40, 35, 25)",
  },
  solarized: {
    label: "Solarized",
    r: 0,
    g: 43,
    b: 54,
    swatch: "rgb(0, 43, 54)",
  },
  oled: {
    label: "OLED",
    r: 0,
    g: 0,
    b: 0,
    swatch: "rgb(0, 0, 0)",
  },
};

export const THEME_IDS: ThemeId[] = ["midnight", "sepia", "solarized", "oled"];
