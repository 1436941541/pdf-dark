import Link from "next/link";

const paragraph = "mt-4 text-base leading-7 text-neutral-400";
const heading = "text-xl font-semibold tracking-tight text-neutral-100 sm:text-2xl";
const link = "text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400";

export function MonochromeGuide() {
  return (
    <section id="conversion-guide" aria-labelledby="conversion-guide-title" className="mx-auto max-w-5xl border-t border-neutral-900 px-6 py-14 sm:py-16">
      <header className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-widest text-amber-400">Practical conversion guide</p>
        <h2 id="conversion-guide-title" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Choose settings that keep your PDF readable</h2>
        <p className={paragraph}>Removing color is easy to describe, but the right result depends on what is on the page. A report with photographs needs a different approach from a faint scan of typed notes. Start with the information you need to keep, then use the preview to choose between gray tones and a strict two-color result.</p>
        <nav aria-label="Conversion guide sections" className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 sm:p-5">
          <p className="text-sm font-medium text-neutral-200">In this guide</p>
          <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm leading-6 sm:grid-cols-2">
            {[
              ["choose-conversion-mode", "Choose a conversion mode"],
              ["black-and-white-threshold", "Set the threshold"],
              ["conversion-workflow", "Preview and download"],
              ["printing-and-backgrounds", "Prepare a print copy"],
              ["conversion-quality-and-text", "Understand quality and text"],
              ["pdf-size-and-device-memory", "Check size and memory"],
              ["monochrome-troubleshooting", "Troubleshoot the result"],
              ["converted-pdf-checklist", "Review your saved copy"],
            ].map(([id, label]) => <li key={id}><a href={`#${id}`} className="text-neutral-400 transition-colors hover:text-amber-400">{label}</a></li>)}
          </ul>
        </nav>
      </header>

      <div className="mx-auto mt-12 max-w-3xl space-y-12">
        <section id="choose-conversion-mode" className="scroll-mt-8">
          <h3 className={heading}>Match the conversion mode to your document</h3>
          <p className={paragraph}>Grayscale is a useful starting point when a document mixes text, pictures and graphics. It keeps a range of light and dark tones, so a photograph can retain shadows and a chart can retain differences in brightness. Removing the hue does not guarantee that every original distinction remains visible: red and green elements with similar brightness can become similar shades of gray.</p>
          <p className={paragraph}>Pure black and white assigns each rendered pixel to one of two values. This can give typed text, simple diagrams and line drawings a more direct appearance. It also removes intermediate tones. Pale handwriting may disappear, shaded cells may become solid black, and photographs may lose the details that make them useful. Choose it because the content suits two colors, then check the smallest important marks.</p>
          <div role="region" aria-label="Conversion mode comparison" tabIndex={0} className="mt-5 overflow-x-auto rounded-xl border border-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400">
            <table className="w-full min-w-[540px] text-left text-sm leading-6">
              <caption className="sr-only">Starting modes and checks for different PDF content</caption>
              <thead className="bg-neutral-900 text-neutral-200"><tr><th scope="col" className="px-4 py-3 font-medium">Document content</th><th scope="col" className="px-4 py-3 font-medium">Start with</th><th scope="col" className="px-4 py-3 font-medium">Check in the preview</th></tr></thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-400">
                <tr><th scope="row" className="px-4 py-3 font-medium text-neutral-300">Photographs or illustrations</th><td className="px-4 py-3">Grayscale</td><td className="px-4 py-3">Faces, shadows and subtle textures</td></tr>
                <tr><th scope="row" className="px-4 py-3 font-medium text-neutral-300">Reports with charts</th><td className="px-4 py-3">Grayscale</td><td className="px-4 py-3">Series, legends and pale labels</td></tr>
                <tr><th scope="row" className="px-4 py-3 font-medium text-neutral-300">Typed notes or line art</th><td className="px-4 py-3">Pure black &amp; white</td><td className="px-4 py-3">Small letters, punctuation and thin rules</td></tr>
                <tr><th scope="row" className="px-4 py-3 font-medium text-neutral-300">Uneven or faint scans</th><td className="px-4 py-3">Compare both</td><td className="px-4 py-3">Faint strokes and paper shadows together</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs leading-5 text-neutral-500 sm:hidden">Swipe the table to compare all columns.</p>
          <p className={paragraph}>For a mixed document, choose a setting that works across its different page types. A clean-looking text page is not enough if a later page contains an essential photograph or a color-coded chart. The tool applies one chosen mode to the entire exported PDF.</p>
          <p className={paragraph}>For example, a meeting pack may begin with plain agenda text and end with a sales chart. Check whether the chart&apos;s lines and labels remain distinct before deciding on pure black and white for the pack. Highlighted passages deserve the same attention: a yellow highlight and the white paper beneath it can become very similar, even though the dark text survives.</p>
        </section>

        <section id="black-and-white-threshold" className="scroll-mt-8">
          <h3 className={heading}>Adjust the black-and-white threshold with a purpose</h3>
          <p className={paragraph}>The threshold is the dividing point between pixels that become black and pixels that become white. The converter evaluates brightness on a scale from 0 to 255; the slider lets you choose values from 1 to 254, starting at 128. Moving it toward a higher number sends more tones to black. Moving it lower leaves more of the page white. Grayscale mode does not use this threshold control.</p>
          <p className={paragraph}>With clean typed pages, begin at 128 and inspect small text before moving the slider. Look at the centers of letters such as e and a, decimal points, footnotes and narrow table borders. More black can make strokes appear heavier, but it can also fill small gaps and join nearby marks. A darker result is not automatically a more readable one.</p>
          <p className={paragraph}>For faint text, raise the threshold gradually and watch the lightest meaningful strokes. The scanned-page example above lets you compare 128 with 190, showing both the extra marks and the extra background that can turn black. Treat those values as a demonstration, not a preset for every scan. The useful setting depends on the brightness of your document.</p>
          <p className={paragraph}>For gray paper, a dark page edge or a shadow near a binding, try lowering the threshold. Stop if letters begin breaking apart or disappearing. When faint ink and paper shading have similar brightness, a single threshold may not separate them successfully. Grayscale may preserve more information, even if it leaves some background visible.</p>
          <p className={paragraph}>This control does not sharpen a blurred scan, remove individual stains or reconstruct missing text. It also uses the same value on every exported page, rather than calculating a different setting for each area. If you need to reduce paper shading, compare the separate <Link href="/whiten-pdf" className={link}>PDF background whitening tool</Link> and inspect its result before deciding which copy to keep.</p>
        </section>

        <section id="conversion-workflow" className="scroll-mt-8">
          <h3 className={heading}>Use a preview-first workflow for the whole PDF</h3>
          <ol className="mt-5 list-decimal space-y-4 pl-5 text-base leading-7 text-neutral-400 marker:font-medium marker:text-amber-400">
            <li><strong className="font-medium text-neutral-200">Choose a starting mode.</strong> Select Grayscale for tonal detail, or Pure black &amp; white when a two-color result suits the content. You can change this after opening the file.</li>
            <li><strong className="font-medium text-neutral-200">Open one PDF.</strong> Drop it into the file area or use the file picker. Check the displayed filename and page count so you know which document you are converting.</li>
            <li><strong className="font-medium text-neutral-200">Compare representative pages.</strong> Use the previous and next preview buttons to inspect more than the first page. Include small print, charts, photographs or faint scanned text when your PDF contains them.</li>
            <li><strong className="font-medium text-neutral-200">Adjust and wait for the preview.</strong> Change the mode or threshold, then let the updated result finish appearing. Check the converted side beside the original, especially where fine detail matters.</li>
            <li><strong className="font-medium text-neutral-200">Convert and download.</strong> The download button processes all pages using your current settings. The preview page is a viewing choice, not an export page range. Keep the tab open while the progress indicator runs.</li>
            <li><strong className="font-medium text-neutral-200">Reopen the saved copy.</strong> Check that it has the expected pages and appearance in the reader you normally use. If you plan to print it, test a representative page before printing the full document.</li>
          </ol>
          <p className={paragraph}>The result is downloaded as a separate PDF, with a mode suffix such as <span className="text-neutral-300">-grayscale.pdf</span> or <span className="text-neutral-300">-black-and-white.pdf</span>. Your source file is not overwritten. To compare settings, export another copy and give it a descriptive name in your downloads folder; this page does not process several selected PDFs as a batch.</p>
          <p className={paragraph}>If you need to stop an export, use Cancel conversion and wait for the controls to become available again. You can then adjust the settings or choose another file. The completed download is the copy to review; a progress indicator partway through the document does not mean the remaining pages have already been saved.</p>
        </section>

        <section id="printing-and-backgrounds" className="scroll-mt-8">
          <h3 className={heading}>Choose between conversion, printer settings and background cleanup</h3>
          <p className={paragraph}>If you only need one paper copy, your printer dialog may already offer a grayscale or monochrome option. A converted PDF is useful when you want to review the monochrome result beforehand, share that appearance with another person, or keep a separate digital copy. You still need to check the printer settings and paper size when you print.</p>
          <p className={paragraph}>Removing color is not the same as removing a background. A large gray rectangle remains a gray rectangle in grayscale mode. In pure black and white, the threshold can turn that rectangle black or white, potentially affecting text over it at the same time. Neither mode guarantees lower ink use, and a mostly black output can be a poor choice for everyday printing.</p>
          <p className={paragraph}>For a PDF that already has white text on a dark background, consider the <Link href="/invert-pdf-colors" className={link}>PDF color inverter</Link> before converting it to monochrome. Inversion changes light and dark values; grayscale removes hue. Check photographs and colored elements after either operation, because they may need a different treatment from the text.</p>
          <p className={paragraph}>Keep chart labels, hatch patterns and legends in view when preparing a print copy. Two colored lines can become difficult to tell apart even when every word remains readable. When color carries essential meaning, retain the color original or obtain an accessible version with distinct labels and patterns. A converter cannot add explanations that were missing from the source.</p>
          <p className={paragraph}>For a reading copy with a dark background, the goal is different from printing on white paper. The <Link href="/blog/scanned-pdf-dark-mode" className={link}>scanned PDF dark mode guide</Link> explains that separate use case.</p>
        </section>

        <section id="conversion-quality-and-text" className="scroll-mt-8">
          <h3 className={heading}>Understand what changes in the downloaded PDF</h3>
          <p className={paragraph}>This converter renders the appearance of each page into an image, changes its colors, and places the result into a new PDF. Physical page dimensions are retained, but original vector paths, fonts and interactive objects are not copied as their original objects. At high zoom, fine lines and small lettering can look softer than they do in a vector source.</p>
          <p className={paragraph}>The preview is intended to help you choose settings, rather than act as a complete proof of the saved file. Export uses a different rendering size from the preview, and unusually large page dimensions can require a reduced scale. Reopen the download to judge the actual result, particularly for architectural drawings, dense spreadsheets, tiny annotations or material you need to enlarge.</p>
          <p className={paragraph}>Where supported, the tool adds an invisible text layer from text already present in the source. That can preserve some search and selection, but it is not OCR. A scanned page that contains only a picture of words does not gain recognized text through this conversion. Some existing text, including rotated text and characters outside the supported font, may not carry over.</p>
          <p className={paragraph}>Check search, selection and copied text separately from visual appearance. A page can look right while a word is missing from its searchable layer. Interactive links, fillable forms, bookmarks and digital signatures are not preserved in the converted copy. Keep the original for those features, and use a tool designed to preserve them when they are essential to your workflow.</p>
          <p className={paragraph}>Conversion also does not repair a tilted scan or recover detail lost before the file reached you. If alignment is the problem, try the <Link href="/deskew-pdf" className={link}>PDF deskew tool</Link>. For background on the difference between rendered page images and document objects, read <Link href="/blog/how-pdf-dark-mode-conversion-works" className={link}>how PDF conversion works</Link>.</p>
        </section>

        <section id="pdf-size-and-device-memory" className="scroll-mt-8">
          <h3 className={heading}>Expect file size and processing time to vary</h3>
          <p className={paragraph}>A black-and-white PDF is not automatically smaller than a color PDF. A compact text document may begin as font instructions and a small amount of text; converting its pages into images can make the download larger. A scan may already contain compressed page pictures. Its new size depends on the source, page count and the images created during conversion.</p>
          <p className={paragraph}>The selected file&apos;s size is only one part of the workload. Browsers also need working space for decoded pages, image processing and the output PDF. A small PDF with many pages can therefore take substantial memory. There is no fixed upload limit on this page, but that does not mean a browser can process a document of any size.</p>
          <p className={paragraph}>Pure black and white describes the visible colors, not a promise of a specially compressed one-bit file. If a recipient requires a particular encoding or a strict file-size ceiling, check those requirements separately. Confirm that the saved PDF meets them before replacing another version or submitting it.</p>
          <p className={paragraph}>For a long or image-heavy document, keep the tab open and allow the conversion to finish. Closing other demanding tabs or using a device with more available memory may help. If the browser runs out of resources, try a smaller document or prepare shorter files in another PDF application. This page does not include a split-PDF or page-range export control.</p>
        </section>

        <section id="monochrome-troubleshooting" className="scroll-mt-8">
          <h3 className={heading}>Troubleshoot the result you actually see</h3>
          <dl className="mt-5 space-y-5 text-base leading-7">
            <div><dt className="font-medium text-neutral-200">Faint letters disappear.</dt><dd className="mt-1 text-neutral-400">In pure black and white, raise the threshold a little and recheck punctuation as well as full letters. If paper shading becomes black before the letters become clear, switch to grayscale. Neither choice can restore strokes that are absent from the source image.</dd></div>
            <div><dt className="font-medium text-neutral-200">The background becomes a solid dark block.</dt><dd className="mt-1 text-neutral-400">Lower the threshold and compare the original beside the result. The same change can lighten useful marks, so inspect both. For a dark reading background, inversion may suit the document better; for uneven paper shading, compare the whitening tool.</dd></div>
            <div><dt className="font-medium text-neutral-200">Photos or chart series lose detail.</dt><dd className="mt-1 text-neutral-400">Try grayscale. A two-color result cannot retain all the tones in a photograph, and grayscale still cannot guarantee separation between colors of similar brightness. Keep the color copy when those distinctions carry information you need.</dd></div>
            <div><dt className="font-medium text-neutral-200">The PDF will not open or conversion stops.</dt><dd className="mt-1 text-neutral-400">Confirm that the original opens in your usual PDF reader. This page does not provide a password-entry or unlocking workflow. For an otherwise readable file, try an updated browser or a smaller document, and keep the original available for another attempt.</dd></div>
            <div><dt className="font-medium text-neutral-200">The download is larger or less sharp than expected.</dt><dd className="mt-1 text-neutral-400">That can follow from rebuilding pages as images. Compare the saved file at your intended viewing size and test a printed page. If you need to retain original vector detail or editable content, keep the source and choose a conversion method that preserves those objects.</dd></div>
          </dl>
        </section>

        <section id="converted-pdf-checklist" className="scroll-mt-8">
          <h3 className={heading}>Check the copy before you share or print it</h3>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-base leading-7 text-neutral-400 marker:text-amber-400">
            <li>Confirm the page count, orientation and physical page size.</li>
            <li>Read small text, punctuation, light handwriting and thin borders.</li>
            <li>Check photographs, shaded areas, chart legends and colored highlights.</li>
            <li>Try searching and copying an important phrase if you need a text layer.</li>
            <li>Keep the original for forms, links, signatures and future color reference.</li>
            <li>Print a representative page before committing to the complete print job.</li>
          </ul>
          <p className={paragraph}>Opening a file here processes its PDF data in your browser rather than uploading it for server-side conversion. The website can still load ordinary page resources, advertising and analytics; see the <Link href="/privacy" className={link}>privacy policy</Link> for those details. Preserve a separate source copy so you can change your settings later without repeatedly converting an already rendered result.</p>
        </section>
      </div>
    </section>
  );
}
