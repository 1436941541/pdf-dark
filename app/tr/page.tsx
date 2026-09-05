import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Converter } from "@/components/converter";
import { Footer } from "@/components/footer";
import { HomeComparison } from "@/components/home-comparison";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/tr";
const TITLE = "PDF Gece Modu — Ücretsiz Karanlık PDF Okuyucu | PDF Dark";
const DESCRIPTION =
  "PDF dosyalarını doğrudan tarayıcınızda karanlık modda okuyun. Ücretsiz, kayıt yok, dosya yükleme yok. İsterseniz kalıcı koyu PDF'ye dönüştürüp indirin.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "pdf gece modu",
    "pdf karanlık mod",
    "pdf koyu mod",
    "pdf okuyucu gece modu",
    "pdf dark mode",
  ],
  alternates: {
    canonical: SLUG,
    languages: {
      en: "/",
      es: "/es",
      pt: "/pt",
      tr: SLUG,
      id: "/id",
      de: "/de",
      "x-default": "/",
    },
  },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: SLUG, siteName: "PDF Dark" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const FAQ = [
  {
    q: "PDF'yi karanlık modda okuyabilir miyim?",
    a: "Evet. PDF dosyanızı bu sayfaya bırakın; belge doğrudan tarayıcınızda koyu arka plan ve açık metinle açılır. Dosyanız hiçbir sunucuya gönderilmez.",
  },
  {
    q: "PDF dosyam yükleniyor mu?",
    a: "Hayır. PDF Dark tamamen cihazınızda ve tarayıcınızda çalışır. Dosyanız bilgisayarınızdan, telefonunuzdan veya tabletinizden çıkmaz.",
  },
  {
    q: "Karanlık modu kalıcı bir PDF olarak kaydedebilir miyim?",
    a: "Evet. PDF'yi kalıcı olarak dönüştürmek ve indirmek için PDF Karanlık Mod Dönüştürücü sayfasını kullanın.",
    link: { href: "/tr/invert-pdf-colors", text: "PDF'yi karanlık moda dönüştür" },
  },
  {
    q: "Fotoğraflar PDF'de negatif olur mu?",
    a: "Varsayılan Otomatik modda fotoğraflar mümkün olduğunca orijinal renklerini korur. Beyaz ekran görüntüleri ve diyagramlar sayfayla uyumlu olacak şekilde işlenir.",
  },
  {
    q: "Telefonda PDF gece modunu kullanabilir miyim?",
    a: "Evet. iPhone, iPad ve Android cihazlarda modern bir tarayıcıyla çalışır; uygulama yüklemeniz gerekmez.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PDF Dark",
    alternateName: ["pdfdark", "PDF Karanlık Mod"],
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser-based)",
    screenshot: `${site}/compare/pdf-dark.png`,
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "PDF'yi tarayıcıda karanlık modda okuma",
      "Dosya yüklemeden yerel işlem",
      "Dört karanlık tema",
      "Fotoğrafları otomatik koruma",
      "iOS Safari desteği",
    ],
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} /></>;
}

export default function TurkishHome() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />
      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/tr" className="flex items-center gap-2 hover:opacity-80 transition-opacity"><span className="text-2xl">🌙</span><span className="text-lg font-semibold hidden sm:inline">PDF Dark</span></Link>
          <nav className="text-sm text-neutral-400 flex gap-5 items-center">
            <Link href="/tr/invert-pdf-colors" className="hover:text-neutral-100">Dönüştür ve indir</Link>
            <Link href="/blog" className="hover:text-neutral-100">Blog</Link>
            <a href="#faq" className="hover:text-neutral-100">SSS</a>
            <LanguageSwitcher page="home" current="tr" />
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">PDF&apos;leri karanlık modda okuyun</h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">PDF&apos;nizi bırakın ve gece modu ile doğrudan burada okuyun. Tema, koyuluk ve sıcaklığı ayarlayın. Her şey tarayıcınızda çalışır: yükleme yok, kayıt yok, kurulum yok.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800"><IconLock className="text-neutral-500" /> %100 tarayıcıda</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800"><IconPalette className="text-neutral-500" /> 4 tema</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800"><IconSmartphone className="text-neutral-500" /> Mobilde çalışır</span>
          </div>
          <div className="mt-8"><Converter locale="tr" /></div>
          <p className="mt-6 text-sm text-neutral-500">Koyu sürümü dosya olarak saklamak ister misiniz? <Link href="/tr/invert-pdf-colors" className="text-amber-400 hover:underline">PDF&apos;yi dönüştürüp indirin</Link>.</p>
        </section>

        <section id="compare" className="max-w-5xl mx-auto px-6 py-16 border-t border-neutral-900">
          <h2 className="text-2xl font-bold mb-3 text-center">Karanlık mod fotoğraflarınızı bozmamalı</h2>
          <p className="text-sm text-neutral-400 text-center mb-10 max-w-2xl mx-auto">Basit renk ters çeviriciler fotoğrafları negatife dönüştürür. PDF Dark metin ve arka planı koyulaştırırken fotoğrafları algılar ve renklerini korur.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              ["/compare/original.png", "Orijinal PDF", "Parlak beyaz sayfa — gündüz iyi, gece yorucu."],
              ["/compare/naive-invert.png", "Basit ters çevirici", "Her piksel ters çevrilir; fotoğraf negatif olur."],
              ["/compare/pdf-dark.png", "PDF Dark — Otomatik", "Metin ve arka plan koyulaşır; fotoğraf renklerini korur."],
            ].map(([src, title, caption]) => <figure key={src} className="m-0"><div className="rounded-xl overflow-hidden border border-neutral-800"><Image src={src} alt={title} width={720} height={933} sizes="(min-width: 640px) 33vw, 100vw" /></div><figcaption className="mt-3 text-center"><div className="font-semibold text-neutral-100 text-sm">{title}</div><div className="mt-1 text-xs text-neutral-500">{caption}</div></figcaption></figure>)}
          </div>
        </section>

        <HomeComparison locale="tr" />

        <section id="why" className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"><div className="max-w-3xl mx-auto px-6"><h2 className="text-2xl font-bold mb-6 text-center">PDF gece modu nedir?</h2><p className="text-neutral-300 leading-relaxed">PDF gece modu, parlak beyaz sayfa yerine koyu arka plan ve açık metinle okumayı sağlar. Tarayıcı eklentileri yalnızca görüntüyü değiştirir; PDF Dark ise dosyanızı yüklemeden tarayıcınızda işler. Böylece PDF&apos;yi gece okurken gözleriniz daha az parlaklıkla karşılaşır.</p><h3 className="text-lg font-semibold text-neutral-100 mt-8 mb-3">Dosyanız gizli kalır</h3><p className="text-neutral-300 leading-relaxed">PDF Dark&apos;ın dosyanızı alacak bir sunucusu yoktur. Okuma ve dönüştürme işlemleri Web Worker kullanılarak cihazınızda gerçekleşir. Hassas belgeleriniz tarayıcı sekmesinden çıkmaz.</p><h3 className="text-lg font-semibold text-neutral-100 mt-8 mb-3">Geçici okuma veya kalıcı dosya</h3><p className="text-neutral-300 leading-relaxed">Sadece okumak istiyorsanız bu sayfayı kullanın. Başka bir okuyucuda açabileceğiniz, paylaşabileceğiniz veya yazdırabileceğiniz yeni bir koyu PDF oluşturmak için <Link href="/tr/invert-pdf-colors" className="text-amber-400 hover:underline">PDF dönüştürücüye</Link> geçin.</p></div></section>

        <section id="how" className="max-w-4xl mx-auto px-6 py-16 border-t border-neutral-900"><h2 className="text-2xl font-bold mb-8 text-center">PDF gece modu nasıl kullanılır?</h2><div className="grid sm:grid-cols-3 gap-6">{[["1", "PDF'nizi seçin", "Dosyayı sürükleyin veya cihazınızdan seçin."], ["2", "Temanızı ayarlayın", "Midnight, Sepia, Solarized veya OLED seçin."], ["3", "Okumaya başlayın", "Sayfalar arasında gezinin, yakınlaştırın ve ayarları değiştirin."]].map(([n, t, d]) => <div key={n} className="rounded-xl border border-neutral-800 p-5"><div className="text-amber-400 font-bold text-lg">{n}</div><h3 className="font-semibold mt-3">{t}</h3><p className="text-sm text-neutral-400 mt-2">{d}</p></div>)}</div></section>

        <section id="faq" className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900"><h2 className="text-2xl font-bold mb-8 text-center">Sık sorulan sorular</h2><div className="space-y-7">{FAQ.map((f) => <div key={f.q}><h3 className="font-semibold text-neutral-100">{f.q}</h3><p className="mt-2 text-neutral-400 leading-relaxed">{f.a} {f.link && <Link href={f.link.href} className="text-amber-400 hover:underline">{f.link.text} →</Link>}</p></div>)}</div></section>
      </main>
      <Footer locale="tr" />
    </div>
  );
}
