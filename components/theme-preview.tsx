import { THEMES, THEME_IDS } from "@/lib/themes";

/**
 * Static mock-document swatch per theme. Mirrors the actual conversion
 * result: pixel-dark.ts always maps black text to pure white regardless of
 * theme, only the page background changes — so the bars here are white/
 * translucent-white on each theme's background color.
 */
export function ThemePreview() {
  return (
    <div className="mt-6">
      <div className="text-xs text-neutral-500 mb-3">
        4 themes — see the colors before you drop a file
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
        {THEME_IDS.map((id) => (
          <div
            key={id}
            className="rounded-lg border border-neutral-800 overflow-hidden"
          >
            <div
              className="p-3 space-y-1.5"
              style={{ background: THEMES[id].swatch }}
            >
              <div className="h-1.5 rounded-full bg-white/80 w-3/4" />
              <div className="h-1.5 rounded-full bg-white/50 w-full" />
              <div className="h-1.5 rounded-full bg-white/50 w-5/6" />
              <div className="h-1.5 rounded-full bg-white/50 w-2/3" />
            </div>
            <div className="text-center text-xs py-1.5 bg-neutral-900 text-neutral-400">
              {THEMES[id].label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
