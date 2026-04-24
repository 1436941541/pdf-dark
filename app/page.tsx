import { DropZone } from "@/components/drop-zone";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold">PDF Dark</span>
          </div>
          <nav className="text-sm text-neutral-400 flex gap-4">
            <a href="#how" className="hover:text-neutral-100">How it works</a>
            <a href="#why" className="hover:text-neutral-100">Why us</a>
            <a href="#faq" className="hover:text-neutral-100">FAQ</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Free PDF Dark Mode Converter
          </h1>
          <p className="mt-5 text-lg text-neutral-400 max-w-2xl mx-auto">
            Instantly convert any PDF to dark mode. 100% private—runs entirely in
            your browser. No upload. No signup. Download the dark version.
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-neutral-500">
            <span className="px-3 py-1 rounded-full border border-neutral-800">
              🔒 100% Browser-side
            </span>
            <span className="px-3 py-1 rounded-full border border-neutral-800">
              🎨 4 Themes
            </span>
            <span className="px-3 py-1 rounded-full border border-neutral-800">
              💾 Download Dark PDF
            </span>
            <span className="px-3 py-1 rounded-full border border-neutral-800">
              📱 Works on Mobile
            </span>
          </div>

          {/* Drop zone */}
          <div className="mt-10">
            <DropZone />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="max-w-4xl mx-auto px-6 py-16 border-t border-neutral-900">
          <h2 className="text-2xl font-bold mb-8 text-center">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Drop your PDF", d: "Drag & drop or click to browse. Never leaves your browser." },
              { n: "2", t: "Pick a theme", d: "Midnight, Sepia, Solarized, or OLED pure black." },
              { n: "3", t: "Download", d: "Save the dark-mode PDF to your device." },
            ].map((s) => (
              <div key={s.n} className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/30">
                <div className="text-2xl font-bold text-neutral-500">{s.n}</div>
                <div className="mt-2 font-semibold">{s.t}</div>
                <div className="mt-1 text-sm text-neutral-400">{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Why us */}
        <section id="why" className="max-w-4xl mx-auto px-6 py-16 border-t border-neutral-900">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Why choose PDF Dark over a Chrome extension?
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 px-4 font-medium text-neutral-500">Feature</th>
                  <th className="py-3 px-4 font-medium">PDF Dark</th>
                  <th className="py-3 px-4 font-medium text-neutral-500">Chrome Extension</th>
                  <th className="py-3 px-4 font-medium text-neutral-500">pdf-dark-mode.com</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {[
                  ["No install needed", "✅", "❌", "✅"],
                  ["Images keep original colors", "✅", "❌", "❌"],
                  ["Save as new PDF file", "✅", "❌", "❌"],
                  ["Works on iOS Safari", "✅", "❌", "✅"],
                  ["100% local (no upload)", "✅", "✅", "❌"],
                ].map(([feat, a, b, c]) => (
                  <tr key={feat} className="border-b border-neutral-900">
                    <td className="py-3 px-4 text-left text-neutral-300">{feat}</td>
                    <td className="py-3 px-4 text-green-400">{a}</td>
                    <td className="py-3 px-4 text-neutral-500">{b}</td>
                    <td className="py-3 px-4 text-neutral-500">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900">
          <h2 className="text-2xl font-bold mb-8 text-center">FAQ</h2>
          <div className="space-y-5">
            {[
              {
                q: "Is my PDF uploaded to your server?",
                a: "No. PDF Dark runs 100% in your browser. We literally don't have a server that receives your file.",
              },
              {
                q: "How can I print a PDF in dark mode?",
                a: "Click download after conversion, then print the downloaded dark PDF from any reader.",
              },
              {
                q: "Does this work on iPhone or iPad?",
                a: "Yes. Safari on iOS can drop/upload PDFs directly to this page—no app install needed.",
              },
              {
                q: "How is this different from the Dark Reader extension?",
                a: "Dark Reader inverts everything including images. PDF Dark detects image regions and keeps them in their original colors, so photos and charts look right.",
              },
              {
                q: "Does it work for scanned PDFs?",
                a: "Yes. We render each page as an image and apply theme inversion. Handwriting and scanned text become light-on-dark automatically.",
              },
            ].map((f) => (
              <details key={f.q} className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/30 group">
                <summary className="cursor-pointer font-medium flex items-center justify-between">
                  {f.q}
                  <span className="text-neutral-500 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-3 text-sm text-neutral-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-neutral-900 mt-8">
        <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-neutral-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} PDF Dark</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-neutral-300">Privacy</a>
            <a href="/terms" className="hover:text-neutral-300">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
