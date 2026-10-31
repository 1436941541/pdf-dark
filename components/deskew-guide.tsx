import Link from "next/link";

export function DeskewGuide() {
  return <>
    <section id="when-to-deskew" className="mx-auto max-w-4xl scroll-mt-6 border-t border-neutral-900 px-6 py-12">
      <h2 className="text-center text-2xl font-bold">When to deskew a scanned PDF</h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-neutral-400">Deskew PDF pages when the text has a small, consistent tilt. This often happens when paper sits at an angle on a scanner. A correction turns the whole page slightly so the text lines look level, making a copy easier to read or print.</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
          <h3 className="font-semibold">Follow the text lines</h3>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">Look at the bottom of several lines of text, rather than just the paper edges or a dark scanner border. If the text is already horizontal, rotating it to straighten the border could make the words tilt. Letters, invoices and reports with clear lines of print are useful starting points.</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
          <h3 className="font-semibold">Look for one angle across the page</h3>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">A simple rotation fits a page whose lines lean together. Curved book text, a sloping photographed page, or blocks pointing in different directions need other corrections. Photos, handwriting and sparse pages can make detection uncertain. Gray paper can work when its text is sufficiently darker than the background.</p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-neutral-400">Check each page on its own. One sheet may lean left, another right, and another may already be straight. The tool checks them separately, so you can review a different correction for every page.</p>
    </section>

    <section id="deskew-workflow" className="mx-auto max-w-4xl scroll-mt-6 px-6 pb-12">
      <h2 className="text-center text-2xl font-bold">A practical workflow to deskew PDF scans</h2>
      <p className="mt-4 text-sm leading-relaxed text-neutral-400">A few checks before and after conversion help you decide whether the result meets your needs. Work from the source scan, review the individual pages, and keep the corrected file as a separate copy.</p>
      <ol className="mt-6 space-y-5 text-sm leading-relaxed text-neutral-400">
        <li className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold text-neutral-200">1. Choose the right source</h3><p className="mt-2">Decide whether a straightened reading copy is what you need from Deskew PDF, or whether you also need searchable text and an editable document. Use the original scan when you have it. A copy already reduced for email may contain less detail. If the PDF combines scans with editable pages, consider whether converting that entire document suits your goal.</p></li>
        <li className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold text-neutral-200">2. Open one PDF</h3><p className="mt-2">Choose a PDF from your device or drag it into the file area. JPG and PNG images are not direct inputs here; they need to be placed in a PDF first. The sample invoice lets you try the controls before choosing your document. Select “Choose another PDF” when you want to start over.</p></li>
        <li className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold text-neutral-200">3. Let the page analysis finish</h3><p className="mt-2">The progress indicator shows how many pages have been checked. Wait until analysis finishes before making adjustments; the controls are disabled while it runs. A suggested angle belongs to that individual page. Do not assume the same number is right for the whole scan just because the sheets came from the same scanner.</p></li>
        <li className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold text-neutral-200">4. Review mixed pages individually</h3><p className="mt-2">A text page may offer clear evidence while a cover illustration, blank sheet or short receipt does not. Leave pages that already look level at 0°. For a page with several angled text blocks, choose whether one whole-page correction is useful. It cannot align every block separately. A sideways sheet needs a separate orientation correction.</p></li>
        <li className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold text-neutral-200">5. Settle the angles before exporting</h3><p className="mt-2">Compare the previews and adjust only the pages that need it. Revisit a page after changing it if you want to check the angle alongside the surrounding sheets. Finish the review in the current workspace, then download once you are satisfied with the alignment.</p></li>
        <li className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold text-neutral-200">6. Open and check the saved copy</h3><p className="mt-2">The suggested filename ends in -deskewed.pdf so you can distinguish it from the source. Open that file in your usual PDF viewer. Confirm the page count, reading order, small print and print preview before sharing it. Keep the source nearby in case a different angle or another type of processing is needed.</p></li>
      </ol>
    </section>

    <section id="adjust-skew-angle" className="mx-auto max-w-4xl scroll-mt-6 px-6 pb-12">
      <h2 className="text-center text-2xl font-bold">Adjust the correction angle</h2>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-400">
        <p>Compare a long text line near the top, another in the middle and one near the bottom. Use the text itself as your guide: a table border or illustration may have a different angle. Automatic detection looks for a consistent text-line angle within ±7°. Review its suggestion before deciding to keep it.</p>
        <p>Manual adjustment runs from −10° to +10° in 0.1° steps. Negative angles turn the page counterclockwise; positive angles turn it clockwise. For example, a scan tilted about 3° clockwise needs about −3° of correction. Move the slider a little, wait for the preview, and compare those lines again.</p>
        <p>An uncertain result means there was not enough reliable evidence to choose an angle automatically. It does not by itself mean the PDF is damaged. Faint print, large illustrations, few text lines or mixed directions can cause uncertainty. The correction stays at 0° until you adjust it yourself.</p>
        <p>Use “Previous” and “Next” to check the other pages. Choose “Use automatic result” to restore a detected angle after experimenting. “Leave page unchanged” sets the angle to 0°; it keeps that page facing the same way, but the download still converts it to an image.</p>
      </div>
    </section>

    <section id="deskew-output" className="mx-auto max-w-4xl scroll-mt-6 px-6 pb-12">
      <h2 className="text-center text-2xl font-bold">What changes when you deskew PDF pages</h2>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-400">
        <p>The download is a new PDF built from page images. Each original page is rendered, rotated by its chosen angle and embedded as a PNG image in the new document. This happens to every page, including pages with a 0° correction. Keep your source file if you may need to edit it later.</p>
        <p>Output resolution is up to 144 DPI. Large pages may be rendered at a lower resolution to stay within the export limits. Small lettering, punctuation and thin drawing lines can soften. This is not a lossless export, and straightening does not sharpen blurred text or recover detail missing from the scan.</p>
        <p>The page expands to fit the rotated content, with white added around its edges. This keeps the original corners inside the output, but changes the page dimensions. It does not whiten an existing gray background, remove shadows or change the document to black and white. Check the print settings if the final paper size matters.</p>
        <p>Selectable text, searchable text layers, interactive links, forms, bookmarks and digital signatures are not retained. Image-based output can also be larger than the original file; this tool does not promise compression. Save it as a separate copy and keep the original for its text, document features and original resolution.</p>
      </div>
    </section>

    <section id="deskew-vs-rotation-ocr" className="mx-auto max-w-4xl scroll-mt-6 px-6 pb-12">
      <h2 className="text-center text-2xl font-bold">Choose between deskew, rotation and OCR</h2>
      <p className="mt-4 text-sm leading-relaxed text-neutral-400">Start with what you see on the page and what you need from the finished file. These operations address different problems.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">{[
        ["Deskew PDF", "Correct a small, consistent tilt so text lines become horizontal. This is the operation provided here, with automatic suggestions and a manual angle for each page."],
        ["Rotate a page", "Turn a sideways or upside-down page by 90° or 180°. This version has no orientation controls for those turns; its slider is limited to small corrections."],
        ["Recognize text with OCR", "Read characters from a scan to create searchable or selectable text. This tool does not perform OCR or add a text layer to its exported page images."],
        ["Flatten curves or correct perspective", "Reshape curved book text or a page photographed at an angle. A whole-page rotation cannot straighten every line in those images, and those reshaping features are not included here."],
      ].map(([title, text]) => <div key={title} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-neutral-400">{text}</p></div>)}</div>
      <p className="mt-5 text-sm leading-relaxed text-neutral-400">If searchable text is your main goal, consider OCR software that can deskew the original scan during recognition. That avoids sending an additional rendered copy through another conversion. You can also run separate OCR on this output, but its resolution and the quality of the original print still matter. Straightening alone does not guarantee more accurate recognition.</p>
    </section>

    <section id="check-deskew-result" className="mx-auto max-w-4xl scroll-mt-6 px-6 pb-12">
      <h2 className="text-center text-2xl font-bold">Check the result before you use it</h2>
      <p className="mt-4 text-sm leading-relaxed text-neutral-400">A Deskew PDF preview is a useful first check, but the downloaded file also needs a review. Compare alignment and legibility at the size you plan to use.</p>
      <ul className="mt-5 space-y-3 text-sm leading-relaxed text-neutral-400">
        <li><strong className="font-medium text-neutral-200">Read the smallest print.</strong> Inspect footnotes, punctuation, numbers and fine table lines at a useful zoom level.</li>
        <li><strong className="font-medium text-neutral-200">Check the page edges.</strong> Look at headers, footers, page numbers and text close to the corners.</li>
        <li><strong className="font-medium text-neutral-200">Review every page.</strong> A good result on the first sheet does not confirm the remaining correction angles.</li>
        <li><strong className="font-medium text-neutral-200">Check the print preview.</strong> Expanded pages may need scaling to fit your paper. Confirm the margins and text size before printing the document.</li>
      </ul>
      <p className="mt-5 text-sm leading-relaxed text-neutral-400">If an angle needs another change, adjust it while the original is still open in the workspace. Repeatedly loading and exporting the corrected copy adds more image rendering. For other needs, explore <Link href="/whiten-pdf" className="text-amber-400 hover:underline">scan background cleanup</Link>, <Link href="/pdf-to-black-and-white" className="text-amber-400 hover:underline">black-and-white conversion</Link> or <Link href="/invert-pdf-colors" className="text-amber-400 hover:underline">PDF color inversion</Link>. Keep the source file so you can choose the processing order and compare the results.</p>
    </section>

    <section id="deskew-troubleshooting" className="mx-auto max-w-4xl scroll-mt-6 px-6 pb-12">
      <h2 className="text-center text-2xl font-bold">Troubleshooting</h2>
      <p className="mt-4 text-sm leading-relaxed text-neutral-400">An uncertain angle, a loading error and an unwanted print size have different causes. Start with the stage that caused the problem, then use the checks below to decide what to try next.</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">The file is rejected</dt><dd className="mt-3 text-sm leading-relaxed text-neutral-400">Check that you selected a PDF. Changing an image filename from .jpg to .pdf does not convert it into a PDF document. If your source is a photo or image, create a PDF with an image-to-PDF tool first, then open that document here. Only one file is opened at a time.</dd></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">The document requires a password</dt><dd className="mt-3 text-sm leading-relaxed text-neutral-400">This workspace has no password entry field. If a PDF needs a password to open, use a PDF application where you can enter it and, if permitted, save an unprotected copy. Choose that copy here. Retrying the same protected file will not add a password prompt to this tool.</dd></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">The PDF will not open</dt><dd className="mt-3 text-sm leading-relaxed text-neutral-400">Try opening the source in another PDF viewer to check whether it is readable. If it also fails there, obtain a fresh copy from its source or scanner. This tool does not repair damaged documents. If other viewers can open it, a new PDF export from that application may be worth trying.</dd></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">Analysis or export takes a long time</dt><dd className="mt-3 text-sm leading-relaxed text-neutral-400">Processing time depends on the number and complexity of pages and the resources available to your browser. Watch the page progress rather than expecting a fixed completion time. You can cancel the current operation. Closing other demanding tabs or trying a smaller document may help when the browser is under load.</dd></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">The automatic angle looks wrong</dt><dd className="mt-3 text-sm leading-relaxed text-neutral-400">Use the slider to judge the correction against ordinary body text. A heading, stamp or illustration may point in a different direction. Choose “Use automatic result” to restore the suggested angle, or “Leave page unchanged” to reset it to 0°. Neither action removes a page from the document.</dd></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">The print looks smaller than expected</dt><dd className="mt-3 text-sm leading-relaxed text-neutral-400">Check the output page dimensions and your viewer&apos;s scaling setting. Fitting an expanded page onto the original paper size can reduce the printed text. Compare Fit and Actual size in the print preview; the latter can clip content when the page exceeds the paper. Choose the setting that suits the document.</dd></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">The result is softer or the file is larger</dt><dd className="mt-3 text-sm leading-relaxed text-neutral-400">Compare the same small text in the original and saved copy at similar zoom levels. This workspace has no export quality or compression slider. If the result loses detail you need, return to the source and choose a tool with output controls suited to your document. Re-exporting this copy cannot recover that detail.</dd></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><dt className="font-semibold text-neutral-200">You need text, links or form fields</dt><dd className="mt-3 text-sm leading-relaxed text-neutral-400">Return to the original document when these features matter. Choose OCR software for scanned text or software that explicitly retains existing PDF content and interactive elements. Check its output on a copy before replacing the source. A visually straight page does not confirm that its document features have been preserved.</dd></div>
      </dl>
    </section>
  </>;
}
