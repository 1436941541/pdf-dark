import type { Metadata } from "next";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/tr/invert-pdf-colors";
const TITLE = "PDF Karanlık Mod Dönüştürücü — PDF'yi Karanlık Moda Çevir";
const DESCRIPTION =
  "PDF renklerini ters çevirin, karanlık modu dosyaya kalıcı olarak uygulayın ve yeni PDF'yi indirin. Ücretsiz, yerel ve dosya yükleme yok.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["pdf karanlık moda dönüştürme", "pdf dark mode converter", "pdf'yi karanlık moda çevir", "pdf renklerini ters çevirme", "invert pdf colors"],
  alternates: { canonical: SLUG, languages: { en: "/invert-pdf-colors", es: "/es/invert-pdf-colors", pt: "/pt/invert-pdf-colors", tr: SLUG, id: "/id/invert-pdf-colors", de: "/de/invert-pdf-colors", "x-default": "/invert-pdf-colors" } },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: SLUG, siteName: "PDF Dark" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const FAQ = [
  { q: "PDF'yi kalıcı olarak karanlık moda nasıl çeviririm?", a: "Bir tema seçin, PDF dosyanızı bırakın ve dönüştürmenin bitmesini bekleyin. Yeni dosya otomatik olarak indirilir; koyu tema PDF'nin içine yazılır." },
  { q: "Fotoğraflar da ters çevrilir mi?", a: "Varsayılan Otomatik mod fotoğrafları korumaya çalışır, beyaz diyagramları sayfayla birlikte işler. Görselleri tamamen korumak veya tamamen ters çevirmek için Görseller ayarını kullanabilirsiniz." },
  { q: "Dönüştürülen PDF metin seçilebilir kalır mı?", a: "Evet. Metin içeren sayfalarda yazı nesneleri korunur ve metin seçilebilir ve aranabilir kalır. Taranmış sayfalar kaynakta görüntü olduğu için görüntü olarak işlenir." },
  { q: "Dosyam bir sunucuya gönderiliyor mu?", a: "Hayır. PDF'nin işlenmesi, renklerin dönüştürülmesi ve yeni dosyanın oluşturulması tamamen cihazınızda gerçekleşir." },
  { q: "Koyu PDF'yi yazdırabilir miyim?", a: "Evet. Renkler dosyanın içine yazıldığı için indirdiğiniz PDF'yi herhangi bir okuyucuda açabilir veya yazdırabilirsiniz." },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = { "@context": "https://schema.org", "@type": "WebApplication", name: "PDF Dark PDF Karanlık Mod Dönüştürücü", url: `${site}${SLUG}`, applicationCategory: "UtilityApplication", operatingSystem: "Any (browser-based)", screenshot: `${site}/compare/pdf-dark.png`, description: DESCRIPTION, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } };
  const faq = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} /></>;
}

export default function TurkishInvertPage() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />
      <header className="w-full border-b border-neutral-800"><div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between"><Link href="/tr" className="flex items-center gap-2 hover:opacity-80 transition-opacity"><span className="text-2xl">🌙</span><span className="text-lg font-semibold hidden sm:inline">PDF Dark</span></Link><nav className="text-sm text-neutral-400 flex gap-5 items-center"><Link href="/tr" className="hover:text-neutral-100">Okuyucu</Link><Link href="/blog" className="hover:text-neutral-100">Blog</Link><a href="#faq" className="hover:text-neutral-100">SSS</a><LanguageSwitcher page="invert" current="tr" /></nav></div></header>
      <main className="flex-1 w-full">
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center"><h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">PDF&apos;yi karanlık moda dönüştür</h1><p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">PDF&apos;nize kalıcı bir koyu tema uygulayın ve yeni PDF&apos;yi indirin. Tema, görsel işleme, koyuluk ve sıcaklık ayarlarını seçin. Dosyanız hiçbir yere yüklenmez.</p><div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800"><IconDownload className="text-neutral-500" /> Koyu PDF&apos;yi indir</span><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800"><IconLock className="text-neutral-500" /> Yerel işlem</span><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800"><IconPalette className="text-neutral-500" /> Görsel ayarları</span><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800"><IconSmartphone className="text-neutral-500" /> Mobilde çalışır</span></div><div className="mt-8"><Downloader locale="tr" /></div><p className="mt-6 text-sm text-neutral-500">Sadece PDF okumak mı istiyorsunuz? <Link href="/tr" className="text-amber-400 hover:underline">Karanlık PDF okuyucuyu açın</Link>.</p></section>
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900"><h2 className="text-2xl font-bold mb-8 text-center">PDF Karanlık Mod Dönüştürücü nasıl çalışır?</h2><div className="grid sm:grid-cols-3 gap-6">{[["1", "Temanızı seçin", "Midnight, Sepia, Solarized veya OLED temalarından birini seçin."], ["2", "PDF'nizi bırakın", "Sürükleyip bırakın veya dosyanızı seçin. İşlem cihazınızda başlar."], ["3", "Koyu PDF'yi indirin", "Yeni PDF otomatik olarak oluşturulur ve indirilmeye hazır olur."]].map(([n, t, d]) => <div key={n} className="rounded-xl border border-neutral-800 p-5"><div className="text-amber-400 font-bold text-lg">{n}</div><h3 className="font-semibold mt-3">{t}</h3><p className="text-sm text-neutral-400 mt-2">{d}</p></div>)}</div></section>
        <section className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"><div className="max-w-3xl mx-auto px-6"><h2 className="text-2xl font-bold mb-6 text-center">Geçici filtre değil, kalıcı PDF</h2><p className="text-neutral-300 leading-relaxed">Tarayıcıdaki karanlık mod eklentileri yalnızca açık olan görüntüyü değiştirir. PDF Dark ise metni ve arka planı yeniden işler, ardından yeni PDF&apos;yi oluşturur. İndirdiğiniz dosya Acrobat, Preview, tarayıcı veya e-kitap okuyucusunda da koyu görünür.</p><h3 className="text-lg font-semibold text-neutral-100 mt-8 mb-3">Fotoğraflar için akıllı işlem</h3><p className="text-neutral-300 leading-relaxed">Basit renk ters çeviriciler fotoğrafları negatife dönüştürür. Otomatik görsel modu fotoğrafları korur, beyaz ekran görüntülerini ve diyagramları sayfayla uyumlu hale getirir. İsterseniz tüm görselleri orijinal bırakabilir veya tamamen ters çevirebilirsiniz.</p><h3 className="text-lg font-semibold text-neutral-100 mt-8 mb-3">Gizlilik önce gelir</h3><p className="text-neutral-300 leading-relaxed">Dosya yükleme, hesap veya kayıt yoktur. Dönüştürme Web Worker ile tarayıcınızda çalışır; hassas belgeleriniz cihazınızdan ayrılmaz.</p></div></section>
        <section id="faq" className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900"><h2 className="text-2xl font-bold mb-8 text-center">Sık sorulan sorular</h2><div className="space-y-7">{FAQ.map((f) => <div key={f.q}><h3 className="font-semibold text-neutral-100">{f.q}</h3><p className="mt-2 text-neutral-400 leading-relaxed">{f.a}</p></div>)}</div></section>
      </main>
      <Footer locale="tr" />
    </div>
  );
}
