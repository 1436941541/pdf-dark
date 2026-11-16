import Image from "next/image";

const CASES = [
  {
    id: "invoice",
    title: "Clockwise-tilted invoice",
    angle: "−3.0° auto",
    button: "Load tilted invoice sample",
    text: "Applies a −3.0° counterclockwise rotation to level the invoice lines, adding thin white margins so corner headings and totals stay intact.",
    original: "invoice-original.webp",
    corrected: "invoice-corrected.webp",
    pdf: "tilted-invoice.pdf",
    width: 600,
    height: 780,
    outWidth: 600,
    outHeight: 760,
  },
  {
    id: "gray-letter",
    title: "Counterclockwise letter on gray paper",
    angle: "+4.0° auto",
    button: "Load gray-letter sample",
    text: "Applies a +4.0° clockwise correction to level counterclockwise text lines on dark gray scan paper without altering the paper tone.",
    original: "gray-letter-original.webp",
    corrected: "gray-letter-corrected.webp",
    pdf: "gray-letter.pdf",
    width: 600,
    height: 780,
    outWidth: 600,
    outHeight: 754,
  },
  {
    id: "straight-report",
    title: "Already straight report",
    angle: "0.0° auto",
    button: "Load straight-report sample",
    text: "Recognizes horizontal print (under 0.2° tilt) and keeps the angle at 0.0° instead of introducing unwanted rotation.",
    original: "straight-report-original.webp",
    corrected: "straight-report-corrected.webp",
    pdf: "straight-report.pdf",
    width: 600,
    height: 780,
    outWidth: 600,
    outHeight: 780,
  },
];

export function DeskewExamples({ onSample }: { onSample: (name: string) => void }) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h2 className="text-center text-2xl font-bold sm:text-3xl">Before and after on tilted test scans</h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-neutral-400">
        Actual outputs from the browser detector. Click any sample below to open the Original vs Straightened preview and test the 0.1° angle slider without choosing a file.
      </p>
      <div className="mt-7 space-y-6">
        {CASES.map((item, idx) => (
          <article key={item.id} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-neutral-100">{item.title}</h3>
              <span className="rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-xs text-amber-300">
                {item.angle}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.text}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5">
              {(
                [
                  [item.original, "Before", item.width, item.height],
                  [item.corrected, "After", item.outWidth, item.outHeight],
                ] as const
              ).map(([file, label, width, height]) => (
                <figure key={file} className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                  <figcaption className="border-b border-neutral-800 px-3 py-2 text-xs text-neutral-400">{label}</figcaption>
                  <div className="flex h-52 items-center justify-center p-3 sm:h-72">
                    <Image
                      unoptimized
                      src={`/examples/deskew/${file}`}
                      alt={`${item.title} (${label.toLowerCase()})`}
                      width={width}
                      height={height}
                      loading={idx === 0 ? "eager" : "lazy"}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </figure>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-left text-sm text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400"
              onClick={() => onSample(item.pdf)}
            >
              {item.button}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
