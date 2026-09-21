// tr / id retired 2026-09-21 — only the German homepage uses this now.
type Locale = "de";

type Copy = {
  title: string;
  intro: string;
  feature: string;
  extensions: string;
  others: string;
  mobileExtensions: string;
  mobileOthers: string;
  rows: [string, string, string, string][];
};

const COPY: Record<Locale, Copy> = {
  de: {
    title: "PDF Dark vs. Chrome-Erweiterungen vs. andere Online-Tools",
    intro: "PDFs lassen sich auf verschiedene Arten im Dunkel- oder Nachtmodus lesen: mit Browser-Erweiterungen, Online-Konvertern oder nativen Readern. So unterscheiden sie sich im Alltag.",
    feature: "Funktion", extensions: "Chrome-Erweiterungen", others: "Andere Online-Tools", mobileExtensions: "Chrome", mobileOthers: "Andere",
    rows: [["Keine Installation nötig", "ja", "nein", "ja"], ["Vor dem Download im Browser lesen", "ja", "nein", "Variiert"], ["Als neue PDF speichern", "ja", "nein", "ja"], ["Fotos behalten ihre Originalfarben (werden nicht negativ)", "ja", "nein", "nein"], ["Text bleibt auswählbar und durchsuchbar", "ja", "nein", "nein"], ["Bildsteuerung: Original / Auto / Umkehren", "ja", "nein", "nein"], ["Dunkelheit und Wärme werden in der Datei gespeichert", "ja", "nein", "nein"], ["Funktioniert in iOS Safari", "ja", "nein", "ja"], ["100 % lokal (kein Datei-Upload)", "ja", "ja", "nein"]],
  },
};

function Mark({ value, yes, no }: { value: string; yes: string; no: string }) {
  // aria-label 让 ✓/✗ 对读屏可读（移动端列名已抽到吸顶行，卡片里不再有可见标签）
  if (value === yes) return <span className="text-amber-400 font-semibold" aria-label={yes}>✓</span>;
  if (value === no) return <span className="text-neutral-600" aria-label={no}>✗</span>;
  return <span>{value}</span>;
}

export function HomeComparison({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const [yes, no] = ["ja", "nein"];
  return <section id="why" className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"><div className="max-w-4xl mx-auto px-6"><h2 className="text-2xl font-bold mb-3 text-center">{copy.title}</h2><p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">{copy.intro}</p><div className="hidden sm:block"><table className="w-full text-sm"><thead><tr className="border-b border-neutral-800"><th className="text-left py-3 px-4 font-medium text-neutral-500">{copy.feature}</th><th className="py-3 px-4 font-medium text-amber-400">PDF Dark</th><th className="py-3 px-4 font-medium text-neutral-500">{copy.extensions}</th><th className="py-3 px-4 font-medium text-neutral-500">{copy.others}</th></tr></thead><tbody className="text-center">{copy.rows.map(([feature, dark, extension, other]) => <tr key={feature} className="border-b border-neutral-900"><td className="py-3 px-4 text-left text-neutral-200">{feature}</td><td className="py-3 px-4"><Mark value={dark} yes={yes} no={no} /></td><td className="py-3 px-4"><Mark value={extension} yes={yes} no={no} /></td><td className="py-3 px-4"><Mark value={other} yes={yes} no={no} /></td></tr>)}</tbody></table></div>{/* Mobile: shared column headers + one card per feature — same ARIA table
    structure as the English homepage, with the header pinned. */}<div className="sm:hidden" role="table" aria-label={copy.title}><div role="row" className="sticky top-0 z-10 grid grid-cols-3 gap-2 px-4 py-2 mb-3 text-center text-xs bg-[#0e0e0e] border-b border-neutral-800"><span role="columnheader" className="sr-only">{copy.feature}</span><span role="columnheader" className="font-medium text-amber-400">PDF Dark</span><span role="columnheader" className="font-medium text-neutral-500">{copy.mobileExtensions}</span><span role="columnheader" className="font-medium text-neutral-500">{copy.mobileOthers}</span></div><div role="rowgroup" className="space-y-3">{copy.rows.map(([feature, dark, extension, other]) => <div key={feature} role="row" className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40"><p role="rowheader" className="font-medium text-base text-neutral-100 m-0 mb-3">{feature}</p><div role="presentation" className="grid grid-cols-3 gap-2 text-center text-base"><span role="cell" aria-label={`PDF Dark: ${dark}`}><Mark value={dark} yes={yes} no={no} /></span><span role="cell" aria-label={`${copy.extensions}: ${extension}`}><Mark value={extension} yes={yes} no={no} /></span><span role="cell" aria-label={`${copy.others}: ${other}`}><Mark value={other} yes={yes} no={no} /></span></div></div>)}</div></div></div></section>;
}
