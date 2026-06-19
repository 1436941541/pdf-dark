import Link from "next/link";
import { VARIANTS } from "@/lib/variants";

export function RelatedVariants({ currentSlug }: { currentSlug: string }) {
  const others = VARIANTS.filter((v) => v.slug !== currentSlug);
  if (others.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto px-6 py-20 border-t border-neutral-900">
      <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
        More from the PDF Dark blog
      </h2>
      <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
        Different angles on the same converter — pick the post that matches
        your scenario. The drop zone is at the top of every page.
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {others.map((v) => (
          <Link
            key={v.slug}
            href={`/blog/${v.slug}`}
            className="group p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 hover:border-amber-400/40 transition-colors"
          >
            <div className="text-neutral-50 group-hover:text-amber-400 transition-colors flex items-center justify-between">
              <h3 className="text-base font-semibold m-0">{v.title}</h3>
              <span
                aria-hidden
                className="text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all"
              >
                →
              </span>
            </div>
            <div className="mt-1 text-sm text-neutral-400">{v.blurb}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
