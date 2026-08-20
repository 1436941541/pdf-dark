/**
 * Classify pdf.js getDocument() failures so the UI can tell the user what's
 * actually wrong with their file, and so known user-input cases (encrypted
 * or empty/corrupt uploads) stay out of Sentry error alerts.
 */

export type PdfLoadErrorKind = "password" | "invalid" | "other";

// pdf.js exceptions keep a stable `name` even through minification.
export function classifyPdfLoadError(e: unknown): PdfLoadErrorKind {
  const name = (e as { name?: string } | null)?.name;
  if (name === "PasswordException") return "password";
  if (name === "InvalidPDFException") return "invalid";
  return "other";
}

export function pdfLoadErrorText(kind: PdfLoadErrorKind): string | null {
  switch (kind) {
    case "password":
      return "This PDF is password-protected. Remove the password (e.g. print it to a new PDF) and try again.";
    case "invalid":
      return "That file isn't a readable PDF — it may be empty or corrupted. Try re-selecting or re-downloading it.";
    default:
      return null;
  }
}
