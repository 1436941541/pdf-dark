/**
 * Classify pdf.js getDocument() failures so the UI can tell the user what's
 * actually wrong with their file, and so known user-input cases (encrypted
 * or empty/corrupt uploads) stay out of Sentry error alerts.
 */

import { T, type Locale } from "./i18n";

export type PdfLoadErrorKind = "password" | "invalid" | "other";

// pdf.js exceptions keep a stable `name` even through minification.
export function classifyPdfLoadError(e: unknown): PdfLoadErrorKind {
  const name = (e as { name?: string } | null)?.name;
  if (name === "PasswordException") return "password";
  if (name === "InvalidPDFException") return "invalid";
  return "other";
}

export function pdfLoadErrorText(
  kind: PdfLoadErrorKind,
  locale: Locale = "en",
): string | null {
  switch (kind) {
    case "password":
      return T[locale].errors.password;
    case "invalid":
      return T[locale].errors.invalid;
    default:
      return null;
  }
}
