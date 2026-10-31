import Link from "next/link";

const sectionClass = "mx-auto max-w-4xl scroll-mt-6 px-6 pb-12";
const paragraphClass = "text-sm leading-relaxed text-neutral-400";
const linkClass = "text-amber-400 hover:underline";

export function WhitenGuide() {
  return <>
    <section id="whiten-scan-use-cases" className={sectionClass}>
      <h2 className="text-center text-2xl font-bold">When to whiten PDF scans</h2>
      <div className={`mt-5 space-y-4 ${paragraphClass}`}>
        <p>You can whiten PDF backgrounds when the words are readable but the surrounding paper looks gray or yellow. Scanned letters, invoices, copied worksheets and older forms are useful starting points. The goal is a cleaner reading or printing copy, with less distracting paper shading around the content.</p>
        <p>Look for a light background and print that is darker than the paper. Gentle, gradual shading may respond to cleaning. Deep book shadows, dark folds, strong paper texture and large stains are harder to separate from useful detail. Raising strength cannot recover a word hidden by a crease or sharpen a blurred scan.</p>
        <p>A multi-page scan can combine these situations: clean white sheets, yellowed inserts and a photographed receipt may sit in the same file. Assess each page by its content. A single setting can be convenient, but the pages do not have to share the same cleaning decision.</p>
        <p>Photographs need a different judgment. Their light areas may resemble paper, while pale pencil, signatures and fine diagram lines can resemble shading. A page with a full photograph or delicate drawing may look better with cleaning disabled. Check what carries meaning before deciding which tones should become lighter.</p>
        <p>If the original scan is already clean, another conversion may offer little benefit. Keep that original, especially when it contains searchable text or interactive fields. This tool creates a new image-based copy, so its value depends on whether the visible improvement is useful for your document.</p>
      </div>
    </section>

    <section id="whiten-workflow" className={sectionClass}>
      <h2 className="text-center text-2xl font-bold">A page-by-page cleanup workflow</h2>
      <p className={`mt-5 ${paragraphClass}`}>A practical way to whiten PDF pages is to start gently, compare both previews and review the whole document before exporting. One bright first page does not confirm the rest.</p>
      <ol className={`mt-6 space-y-4 ${paragraphClass}`}>
        <li className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold text-neutral-200">1. Open your source PDF</h3><p className="mt-2">Choose a PDF from your device or drag it into the file area. Use the original scan when available; a copy reduced for email may have lost detail. The gray-paper sample lets you try the controls first. Document processing happens in your browser without uploading your file.</p></li>
        <li className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold text-neutral-200">2. Compare paper and content</h3><p className="mt-2">Wait for the Original and Cleaned previews. Start at the default 65% strength with color protection enabled. Look at a blank margin, then a line of small text and any faint marks. Judge those areas together.</p></li>
        <li className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold text-neutral-200">3. Browse every page</h3><p className="mt-2">Use Previous and Next. Strength and color protection apply across all pages with cleaning enabled. The Clean page checkbox controls only the current page. Turn it off where cleanup harms a photo, note or drawing; that page stays in the download. After changing a shared setting, return to a page with faint content before saving. A setting chosen for a darker sheet may be too strong for its lighter neighbor.</p></li>
        <li className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold text-neutral-200">4. Download and reopen the copy</h3><p className="mt-2">Choose download quality, then select Download cleaned PDF. The suggested filename ends in -whitened.pdf. Open the saved file in your usual viewer, check its pages and keep the source alongside it.</p></li>
      </ol>
    </section>

    <section id="whitening-strength" className={sectionClass}>
      <h2 className="text-center text-2xl font-bold">Choose strength without losing faint detail</h2>
      <div className={`mt-5 space-y-4 ${paragraphClass}`}>
        <p>Cleaning strength runs from 0% to 100% in five-point steps. The default 65% is a starting point, not a recommendation for every scan. Raise it one step, wait for the preview to update and compare the same areas again. Lower it if pale writing or fine lines become harder to see.</p>
        <p>A useful comparison includes punctuation, decimal points, table borders and the lightest handwritten note. Strong black headings may remain easy to read even while these smaller details fade. In a worksheet, losing a pencil answer matters more than removing the last trace of gray from the margin.</p>
        <p>Check several parts of a shaded page rather than just its darkest corner. Paper brightness can vary across a scan, and the tool estimates that variation locally. The result may improve the broad shading while leaving a narrow dark edge or a heavy fold visible.</p>
        <p>When you whiten PDF pages, pure white margins do not have to be the goal. Some remaining tint can be a sensible tradeoff for clearer faint content. Because the setting is shared, revisit earlier pages after adjusting it for a later sheet. Use the page checkbox for exceptions rather than assuming every sheet needs the strongest setting.</p>
      </div>
    </section>

    <section id="protect-coloured-marks" className={sectionClass}>
      <h2 className="text-center text-2xl font-bold">Protect colored marks and review the samples</h2>
      <div className={`mt-5 space-y-4 ${paragraphClass}`}>
        <p>Protect colored text &amp; marks is enabled by default. The cleaner estimates nearby paper brightness and color, then tries to leave pixels with a sufficiently different color unchanged. It does not recognize a stamp, signature, highlight or photograph by meaning. A faint mark close to the paper color may still change.</p>
        <p>When you whiten PDF scans of marked forms, compare the marks themselves. Check that a blue stamp remains legible and that highlighted text is readable through the highlight. Turning protection off can change colored content as well as the background. Try that only while comparing the previews, and restore it if the result is worse.</p>
        <p>The generated samples above offer three checks: inspect faint lines on gray paper, compare blue ink and a yellow highlight on yellow paper, and follow the gradual shadow across the shaded page. Their after images show actual default-setting output. They demonstrate those files; they cannot predict how every scan will respond.</p>
        <p>For a mixed document, leave cleaning enabled on ordinary text pages and disable it on delicate pages when needed. This preserves their uncleaned appearance within the limits of the image export, rather than copying their original PDF structure. Also inspect colored areas that touch the paper closely, such as a pale yellow note on cream paper. Protection depends on color differences, so an obvious mark to a reader may still be difficult to separate.</p>
      </div>
    </section>

    <section id="whiten-output" className={sectionClass}>
      <h2 className="text-center text-2xl font-bold">What changes when you whiten PDF pages</h2>
      <div className={`mt-5 space-y-4 ${paragraphClass}`}>
        <p>The download is a new PDF made from rendered page images. Each page keeps its displayed dimensions and orientation. It is still an image conversion: turning cleaning off for a page, or setting strength to zero, does not copy that page&apos;s original objects into the output.</p>
        <p>Selectable text, existing searchable text layers, interactive links, forms, bookmarks and digital signatures are not retained. No OCR is added. Visible lettering is part of the page image, so being able to read a word does not mean you can search or select it. Keep the original for those document features.</p>
        <p>Sharper renders at up to 144 DPI, while Compact renders at up to 72 DPI. These are upper limits. Unusually large pages use a lower resolution to remain within export limits. Choose Sharper when small print matters, then check the downloaded file; neither option restores detail missing from the source.</p>
        <p>The preview and download are rendered at different resolutions, so inspect the final copy at a useful zoom level. Changing download quality does not update the current preview; export renders again from the original PDF. Compact trades image detail for a lower rendering resolution. It is not a guaranteed file-size reduction: image-based PDFs can be larger than their originals. Download quality and cleaning strength control different things.</p>
        <p>If a recipient needs searchable text or a working form, share the original or choose a workflow that explicitly preserves those features. A clean-looking exported page is a visual copy, not evidence that its document functions survived.</p>
      </div>
    </section>

    <section id="whitening-vs-other-tools" className={sectionClass}>
      <h2 className="text-center text-2xl font-bold">White paper, grayscale or transparent background?</h2>
      <p className={`mt-5 ${paragraphClass}`}>Whiten PDF paper when light scan shading is the problem. Other changes can look similar at first, but serve different purposes.</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">Paper cleanup</dt><dd className={`mt-3 ${paragraphClass}`}>Lightens gray or yellow paper toward white while retaining continuous tones and, where protected, colored marks. This is the operation provided here.</dd></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">Grayscale or two-color conversion</dt><dd className={`mt-3 ${paragraphClass}`}>Grayscale removes color but can leave gray paper behind. A two-color conversion uses only black and white. Compare the <Link href="/pdf-to-black-and-white" className={linkClass}>black-and-white converter</Link> when that is your printing goal.</dd></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">Transparent output</dt><dd className={`mt-3 ${paragraphClass}`}>Removes a fill so content can sit over another design. Whitening leaves an opaque page background; it does not create transparency or extract a photo subject.</dd></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">Editor-added backgrounds</dt><dd className={`mt-3 ${paragraphClass}`}>An added PDF background may be removable in the editor that manages it. See <a href="https://helpx.adobe.com/acrobat/desktop/edit-documents/add-backgrounds-and-watermarks/remove-background.html" target="_blank" rel="noopener noreferrer" className={linkClass}>Adobe Acrobat&apos;s background removal guide</a>. Paper tint inside a flattened scan is part of its image.</dd></div>
      </dl>
      <p className={`mt-5 ${paragraphClass}`}>Cleanup does not level tilted text or recognize words. Use <Link href="/deskew-pdf" className={linkClass}>scan straightening</Link> for a small tilt and OCR software for searchable text. The cleaner does not whiten pages it detects as very dark; they still pass through image export. Explore <Link href="/invert-pdf-colors" className={linkClass}>PDF color inversion</Link> to reverse a dark page, or use the <Link href="/" className={linkClass}>dark-mode PDF reader</Link> for comfortable reading. Keep the source when comparing workflows so each starts with the original detail.</p>
    </section>

    <section id="whiten-checklist" className={sectionClass}>
      <h2 className="text-center text-2xl font-bold">Check the saved copy before printing or sharing</h2>
      <p className={`mt-5 ${paragraphClass}`}>Review the download as a whole document. A cleaner margin is useful only if the information you need remains readable.</p>
      <ul className={`mt-5 space-y-3 ${paragraphClass}`}>
        <li><strong className="font-medium text-neutral-200">Background:</strong> Compare margins and shaded areas without expecting every mark to disappear. Check that useful light areas inside images have not washed out.</li>
        <li><strong className="font-medium text-neutral-200">Small content:</strong> Read footnotes, totals, punctuation, pencil notes and fine rules at comparable zoom levels in the source and result.</li>
        <li><strong className="font-medium text-neutral-200">Color:</strong> Check stamps, colored annotations and highlights, including pages where you changed the protection setting.</li>
        <li><strong className="font-medium text-neutral-200">Document:</strong> Confirm page count, order and orientation. Review pages with cleaning disabled too, since they still pass through image export.</li>
        <li><strong className="font-medium text-neutral-200">Print:</strong> Check your viewer&apos;s paper size and scaling. Print one representative page before a long run; screen appearance alone cannot predict a particular printer&apos;s output.</li>
      </ul>
      <p className={`mt-5 ${paragraphClass}`}>If you need another adjustment, return to the original in the workspace. Repeatedly opening and exporting the cleaned copy adds more image rendering without recovering lost detail. When sharing the result, give it a clear filename so the recipient can distinguish it from the source. Keep the original available if they later need better resolution, searchable content or an unprocessed version of a mark.</p>
    </section>

    <section id="whiten-troubleshooting" className={sectionClass}>
      <h2 className="text-center text-2xl font-bold">Troubleshooting loading and export</h2>
      <p className={`mt-5 ${paragraphClass}`}>If you cannot whiten PDF pages as expected, check whether the problem is opening the source, processing it or reviewing the result.</p>
      <dl className="mt-6 space-y-5">
        <div><dt className="font-semibold text-neutral-200">The file will not open</dt><dd className={`mt-2 ${paragraphClass}`}>Choose a PDF; renaming a JPG or PNG does not convert it. Try opening the source in another PDF viewer. If it also fails there, obtain a fresh copy. This tool does not repair damaged documents.</dd></div>
        <div><dt className="font-semibold text-neutral-200">The PDF requires a password</dt><dd className={`mt-2 ${paragraphClass}`}>There is no password entry field here. Open the document in an application that accepts its password and, if permitted, save an unprotected copy to use.</dd></div>
        <div><dt className="font-semibold text-neutral-200">Processing is slow or fails on a large file</dt><dd className={`mt-2 ${paragraphClass}`}>Page count, page complexity and browser memory affect processing. Watch the progress indicator, use Cancel if needed, and try a smaller document or fewer pages. Closing other demanding tabs may free resources. There is no fixed completion time for every file.</dd></div>
        <div><dt className="font-semibold text-neutral-200">The paper remains gray or the result looks soft</dt><dd className={`mt-2 ${paragraphClass}`}>Adjust strength for remaining paper tint, watching faint marks. Choose Sharper for more export detail. These controls solve different problems: more whitening does not increase resolution, and Compact does not promise compression. If important content still suffers, keep the original or try a better source scan.</dd></div>
      </dl>
    </section>
  </>;
}
