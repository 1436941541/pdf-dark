export function DeskewGuide() {
  return <>
    <section className="mx-auto max-w-4xl border-t border-neutral-900 px-6 py-12">
      <h2 className="text-center text-2xl font-bold">When to deskew a scanned PDF</h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-neutral-400">A page can look tilted even when its orientation is correct. This often happens when paper sits at an angle on a scanner. Deskew PDF pages when several lines lean in the same direction and you want a straighter copy for reading or printing.</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6"><h3 className="font-semibold">Best for clear, consistent text lines</h3><p className="mt-3 text-sm leading-relaxed text-neutral-400">Letters, invoices and text reports with several readable lines are good starting points. Each page is checked separately, so a document can contain pages tilted in different directions. Gray paper is supported when the text is sufficiently darker than the background.</p></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6"><h3 className="font-semibold">Review unusual or damaged pages</h3><p className="mt-3 text-sm leading-relaxed text-neutral-400">Photos, handwriting, sparse text and mixed text directions can make automatic detection uncertain. Curved book pages and perspective distortion need more than a simple rotation. This tool does not flatten curved text or reconstruct missing characters.</p></div>
      </div>
    </section>
    <section className="mx-auto max-w-4xl px-6 pb-12">
      <h2 className="text-center text-2xl font-bold">How to fine-tune PDF deskew results</h2>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-400">
        <p>Compare a long line near the top of the page with another near the bottom. Automatic detection looks for a consistent text-line angle within ±7°. If the result still looks tilted, move the correction slider in small steps and check both lines again.</p>
        <p>Negative angles rotate the page counterclockwise; positive angles rotate it clockwise. For example, a scan tilted 3° clockwise needs about −3° of correction. Manual adjustment runs from −10° to +10°, in 0.1° steps. Use Next and Previous to review the other pages before downloading.</p>
        <p>If a page already looks straight, choose Leave page unchanged to set its correction to 0°. This leaves its angle unchanged; the downloaded PDF still renders that page as an image. Use automatic result restores the detected angle after a manual adjustment.</p>
        <p>An uncertain result means the tool has not found enough reliable evidence to rotate the page automatically. Check the preview and adjust it yourself if needed. A blank page needs no correction. Straightening changes alignment, but it will not sharpen blurry text or remove a gray background.</p>
      </div>
    </section>
    <section className="mx-auto max-w-4xl px-6 pb-12">
      <h2 className="text-center text-2xl font-bold">Deskew, page rotation and OCR</h2>
      <p className="mt-4 text-sm leading-relaxed text-neutral-400">These operations solve different document problems. Choose the operation that matches what you see in the original PDF.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">{[
        ["Deskew PDF", "Correct a small tilt so scanned text lines become horizontal. This is the function provided on this page."],
        ["Rotate a page", "Turn a sideways or upside-down page by 90° or 180°. This version does not include that orientation control."],
        ["Recognize text with OCR", "Identify characters in a scan to create searchable text. Deskewing alone does not add text recognition or a searchable layer."],
      ].map(([title, text]) => <div key={title} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"><h3 className="font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-neutral-400">{text}</p></div>)}</div>
    </section>
  </>;
}
