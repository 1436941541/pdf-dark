import Link from "next/link";

const GITHUB_URL = "https://github.com/1436941541/pdf-dark";

type Locale = "en" | "es" | "pt" | "tr" | "id" | "de";

// Home / Invert PDF Colors link to the locale's own pages. The trust pages
// (About/Changelog/Privacy/Terms) aren't translated yet, so es/pt labels
// still point at the English URLs — see pdf-dark/AGENTS.md scope notes.
const COPY: Record<
  Locale,
  { home: string; invert: string; about: string; changelog: string; contact: string; privacy: string; terms: string }
> = {
  en: {
    home: "Home",
    invert: "Invert PDF Colors",
    about: "About",
    changelog: "Changelog",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
  },
  es: {
    home: "Inicio",
    invert: "Invertir Colores de PDF",
    about: "Acerca de",
    changelog: "Novedades",
    contact: "Contacto",
    privacy: "Privacidad",
    terms: "Términos",
  },
  pt: {
    home: "Início",
    invert: "Inverter Cores de PDF",
    about: "Sobre",
    changelog: "Novidades",
    contact: "Contato",
    privacy: "Privacidade",
    terms: "Termos",
  },
  tr: {
    home: "Ana sayfa",
    invert: "PDF Renklerini Ters Çevir",
    about: "Hakkında",
    changelog: "Yenilikler",
    contact: "İletişim",
    privacy: "Gizlilik",
    terms: "Koşullar",
  },
  id: {
    home: "Beranda",
    invert: "Balik Warna PDF",
    about: "Tentang",
    changelog: "Pembaruan",
    contact: "Kontak",
    privacy: "Privasi",
    terms: "Ketentuan",
  },
  de: {
    home: "Startseite",
    invert: "PDF-Farben umkehren",
    about: "Über uns",
    changelog: "Änderungen",
    contact: "Kontakt",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
  },
};

const HOME_HREF: Record<Locale, string> = { en: "/", es: "/es", pt: "/pt", tr: "/tr", id: "/id", de: "/de" };
const INVERT_HREF: Record<Locale, string> = {
  en: "/invert-pdf-colors",
  es: "/es/invert-pdf-colors",
  pt: "/pt/invert-pdf-colors",
  tr: "/tr/invert-pdf-colors",
  id: "/id/invert-pdf-colors",
  de: "/de/invert-pdf-colors",
};

export function Footer({ locale = "en" }: { locale?: Locale }) {
  const t = COPY[locale];
  return (
    <footer className="w-full border-t border-neutral-900 mt-4">
      <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-neutral-500 flex flex-wrap items-center justify-between gap-y-2">
        <span>© {new Date().getFullYear()} PDF Dark · pdfdark.org</span>
        <div className="flex flex-wrap gap-4">
          <Link href={HOME_HREF[locale]} className="hover:text-neutral-300">{t.home}</Link>
          <Link href={INVERT_HREF[locale]} className="hover:text-neutral-300">{t.invert}</Link>
          <Link href="/about" className="hover:text-neutral-300">{t.about}</Link>
          <Link href="/changelog" className="hover:text-neutral-300">{t.changelog}</Link>
          <Link href="/about#contact" className="hover:text-neutral-300">{t.contact}</Link>
          <Link href="/privacy" className="hover:text-neutral-300">{t.privacy}</Link>
          <Link href="/terms" className="hover:text-neutral-300">{t.terms}</Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-300"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
