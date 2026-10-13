import Image from "next/image";
const CASES = [
  { id: "invoice", title: "A tilted invoice", angle: "−3.0° correction", text: "The invoice text leans clockwise. A counterclockwise correction brings the lines back to horizontal. The full page is retained, with white space added around the rotated scan. Check the heading and totals when reviewing an invoice of your own.", original: "invoice-original.webp", corrected: "invoice-corrected.webp", pdf: "tilted-invoice.pdf", width: 600, height: 780, outWidth: 600, outHeight: 760 },
  { id: "gray-letter", title: "A scan on gray paper", angle: "+4.0° correction", text: "This sample leans counterclockwise and needs a clockwise correction. The gray paper remains gray: PDF deskew changes the angle, not the background color. Several clear text lines give the detector evidence to work with even on a darker page.", original: "gray-letter-original.webp", corrected: "gray-letter-corrected.webp", pdf: "gray-letter.pdf", width: 600, height: 780, outWidth: 600, outHeight: 754 },
  { id: "straight-report", title: "An already straight report", angle: "0.0° · already straight", text: "A straight scan does not need an extra rotation. In this sample, the tool keeps the correction at zero. A mixed document can contain both straight and tilted pages; review each result rather than applying one angle to the entire file.", original: "straight-report-original.webp", corrected: "straight-report-corrected.webp", pdf: "straight-report.pdf", width: 600, height: 780, outWidth: 600, outHeight: 780 },
];
export function DeskewExamples({ onSample }: { onSample: (name: string) => void }) {
  return <section className="mx-auto max-w-4xl px-6 pt-12">
    <h2 className="text-center text-2xl font-bold">PDF deskew examples: before and after</h2>
    <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-neutral-400">These generated sample PDFs were processed with this tool. Compare the original scans with the actual corrected previews, or open a sample to try the same result yourself.</p>
    <div className="mt-7 space-y-6">{CASES.map(item => <article key={item.id} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{item.title}</h3><span className="rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-xs text-amber-300">{item.angle}</span></div>
      <p className="mt-3 text-sm leading-relaxed text-neutral-400">{item.text}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5">{[[item.original, "Before", item.width, item.height], [item.corrected, "After", item.outWidth, item.outHeight]].map(([file, label, width, height]) => <figure key={String(file)} className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950"><figcaption className="border-b border-neutral-800 px-3 py-2 text-xs text-neutral-400">{label}</figcaption><div className="flex h-52 items-center justify-center p-3 sm:h-72"><Image unoptimized src={`/examples/deskew/${file}`} alt={`${item.title} ${String(label).toLowerCase()} PDF deskew`} width={Number(width)} height={Number(height)} loading="lazy" className="h-full w-full object-contain" /></div></figure>)}</div>
      <button type="button" className="mt-4 text-sm text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400" onClick={() => onSample(item.pdf)}>Try this sample: {item.title.toLowerCase()}</button>
    </article>)}</div>
    <p className="mt-4 text-xs text-neutral-500">Sample results illustrate these files only. Detection quality depends on the text, layout and condition of your scan.</p>
  </section>;
}
