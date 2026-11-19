import Image from "next/image";
import type { MonochromeMode } from "@/lib/monochrome";

const EXAMPLES: {
  id: number;
  badge: string;
  title: string;
  description: string;
  button: string;
  mode: MonochromeMode;
}[] = [
  {
    id: 4,
    badge: "128 vs. 190 cutoff",
    title: "Stamped invoice scan on tinted paper",
    description:
      "Grayscale turns the blue signature and red PAID stamp gray while leaving the warm scan sheet visibly gray (~206 luminance). At cutoff 128, the paper snaps to pure white and dark print plus blue ink turn solid black, whereas the lighter red stamp (luminance 142) and pencil note drop out. Raising the slider to 190 recovers both the red stamp and pencil note as crisp black without bringing back the paper tint.",
    button: "Load stamped-invoice sample ↑",
    mode: "black-and-white",
  },
  {
    id: 3,
    badge: "Grayscale recommended",
    title: "Report page with studio portrait",
    description:
      "Grayscale preserves natural skin shading, blazer folds, and studio lighting gradients across 256 gray levels. Cutoff 128 collapses midtones into stark black-and-white stencil patches.",
    button: "Load portrait-report sample ↑",
    mode: "grayscale",
  },
];

const BASE = "/examples/black-and-white";

function previewSrc(file: string, id: number) {
  const isWebp = file === "original" || file === "gray";
  return `${BASE}/${file}-${id}.${isWebp ? "webp" : "png"}`;
}

function panelsFor(id: number) {
  if (id === 4) {
    return [
      { label: "Original", file: "original", detail: "Tan paper, blue & red ink" },
      { label: "Grayscale", file: "gray", detail: "Gray paper tint remains" },
      { label: "Threshold 128", file: "bw128", detail: "White page, red stamp lost" },
      { label: "Threshold 190", file: "bw190", detail: "Stamp & pencil recovered" },
    ] as const;
  }
  return [
    { label: "Original", file: "original", detail: "Color studio photo" },
    { label: "Grayscale", file: "gray", detail: "Smooth 256-gray shading" },
    { label: "Threshold 128", file: "bw128", detail: "Midtones clipped to B&W" },
  ] as const;
}

export function MonochromeExamples({
  onTrySample,
}: {
  onTrySample: (id: number, mode: MonochromeMode) => void;
}) {
  return (
    <section
      id="examples"
      className="mx-auto max-w-5xl border-t border-neutral-900 px-6 py-12"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Real page outputs: grayscale vs. two-color threshold
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
          Actual pages exported from this converter. Load either sample into the
          workspace above to test the page-by-page preview.
        </p>
      </div>
      <div className="mt-7 space-y-6">
        {EXAMPLES.map((example, idx) => {
          const panels = panelsFor(example.id);
          return (
            <article
              key={example.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-neutral-100">
                  {example.title}
                </h3>
                <span className="rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-xs text-amber-300">
                  {example.badge}
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-400">
                {example.description}
              </p>
              <div
                className={`mt-5 grid gap-4 ${
                  example.id === 4
                    ? "sm:grid-cols-2 lg:grid-cols-4"
                    : "sm:grid-cols-3"
                }`}
              >
                {panels.map(({ label, file, detail }) => (
                  <figure key={label} className="min-w-0">
                    <figcaption className="mb-2 flex flex-wrap items-baseline justify-between gap-1 text-sm">
                      <span className="font-medium text-neutral-200">
                        {label}
                      </span>
                      <span className="text-xs text-neutral-500">{detail}</span>
                    </figcaption>
                    <div className="overflow-hidden rounded-lg border border-neutral-700 bg-white">
                      <Image
                        src={previewSrc(file, example.id)}
                        alt={`${example.title}: ${label.toLowerCase()} PDF output`}
                        width={720}
                        height={614}
                        sizes={
                          example.id === 4
                            ? "(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 23vw"
                            : "(max-width: 639px) 90vw, 30vw"
                        }
                        unoptimized
                        loading={idx === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className="h-auto w-full"
                      />
                    </div>
                  </figure>
                ))}
              </div>
              <div className="mt-4 border-t border-neutral-800 pt-3">
                <button
                  type="button"
                  onClick={() => onTrySample(example.id, example.mode)}
                  className="inline-flex min-h-10 items-center rounded-lg border border-amber-400/40 px-4 py-1.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-400/10"
                >
                  {example.button}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
