type Locale = "tr" | "id" | "de";

type Copy = {
  title: string;
  intro: string;
  feature: string;
  extensions: string;
  others: string;
  mobileExtensions: string;
  mobileOthers: string;
  rows: [string, string, string, string][];
};

const COPY: Record<Locale, Copy> = {
  tr: {
    title: "PDF Dark vs. Chrome eklentileri vs. diğer çevrimiçi araçlar",
    intro: "PDF'leri karanlık veya gece modunda okumanın birkaç yolu vardır: tarayıcı eklentileri, çevrimiçi dönüştürücüler ve yerel okuyucular. Günlük kullanımda farkları şöyle.",
    feature: "Özellik", extensions: "Chrome eklentileri", others: "Diğer çevrimiçi araçlar", mobileExtensions: "Chrome", mobileOthers: "Diğerleri",
    rows: [["Kurulum gerekmez", "evet", "hayır", "evet"], ["İndirmeden önce tarayıcıda okuma", "evet", "hayır", "Değişir"], ["Yeni PDF olarak kaydetme", "evet", "hayır", "evet"], ["Fotoğraflar renklerini korur (negatif olmaz)", "evet", "hayır", "hayır"], ["Metin seçilebilir ve aranabilir kalır", "evet", "hayır", "hayır"], ["Görsel kontrolü: Orijinal / Otomatik / Ters çevir", "evet", "hayır", "hayır"], ["Dosyaya kaydedilen koyuluk ve sıcaklık ayarları", "evet", "hayır", "hayır"], ["iOS Safari'de çalışır", "evet", "hayır", "evet"], ["%100 yerel işlem (dosya yükleme yok)", "evet", "evet", "hayır"]],
  },
  id: {
    title: "PDF Dark vs. ekstensi Chrome vs. alat online lainnya",
    intro: "Ada beberapa cara untuk membaca PDF dalam mode gelap atau mode malam: ekstensi browser, konverter online, dan pembaca bawaan. Berikut perbandingannya untuk penggunaan sehari-hari.",
    feature: "Fitur", extensions: "Ekstensi Chrome", others: "Alat online lainnya", mobileExtensions: "Ekstensi", mobileOthers: "Lainnya",
    rows: [["Tidak perlu instalasi", "ya", "tidak", "ya"], ["Baca di browser sebelum mengunduh", "ya", "tidak", "Bervariasi"], ["Simpan sebagai PDF baru", "ya", "tidak", "ya"], ["Foto mempertahankan warna asli (tidak menjadi negatif)", "ya", "tidak", "tidak"], ["Teks tetap dapat dipilih dan dicari", "ya", "tidak", "tidak"], ["Kontrol gambar: Asli / Otomatis / Balik", "ya", "tidak", "tidak"], ["Pengaturan kegelapan dan kehangatan tersimpan di file", "ya", "tidak", "tidak"], ["Berfungsi di Safari iOS", "ya", "tidak", "ya"], ["100% lokal (tanpa unggah file)", "ya", "ya", "tidak"]],
  },
  de: {
    title: "PDF Dark vs. Chrome-Erweiterungen vs. andere Online-Tools",
    intro: "PDFs lassen sich auf verschiedene Arten im Dunkel- oder Nachtmodus lesen: mit Browser-Erweiterungen, Online-Konvertern oder nativen Readern. So unterscheiden sie sich im Alltag.",
    feature: "Funktion", extensions: "Chrome-Erweiterungen", others: "Andere Online-Tools", mobileExtensions: "Chrome", mobileOthers: "Andere",
    rows: [["Keine Installation nötig", "ja", "nein", "ja"], ["Vor dem Download im Browser lesen", "ja", "nein", "Variiert"], ["Als neue PDF speichern", "ja", "nein", "ja"], ["Fotos behalten ihre Originalfarben (werden nicht negativ)", "ja", "nein", "nein"], ["Text bleibt auswählbar und durchsuchbar", "ja", "nein", "nein"], ["Bildsteuerung: Original / Auto / Umkehren", "ja", "nein", "nein"], ["Dunkelheit und Wärme werden in der Datei gespeichert", "ja", "nein", "nein"], ["Funktioniert in iOS Safari", "ja", "nein", "ja"], ["100 % lokal (kein Datei-Upload)", "ja", "ja", "nein"]],
  },
};

function Mark({ value, yes, no }: { value: string; yes: string; no: string }) {
  if (value === yes) return <span className="text-amber-400 font-semibold">✓</span>;
  if (value === no) return <span className="text-neutral-600">✗</span>;
  return <span>{value}</span>;
}

export function HomeComparison({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const [yes, no] = locale === "tr" ? ["evet", "hayır"] : locale === "id" ? ["ya", "tidak"] : ["ja", "nein"];
  return <section id={locale === "tr" ? "compare-tools" : "why"} className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"><div className="max-w-4xl mx-auto px-6"><h2 className="text-2xl font-bold mb-3 text-center">{copy.title}</h2><p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">{copy.intro}</p><div className="hidden sm:block"><table className="w-full text-sm"><thead><tr className="border-b border-neutral-800"><th className="text-left py-3 px-4 font-medium text-neutral-500">{copy.feature}</th><th className="py-3 px-4 font-medium text-amber-400">PDF Dark</th><th className="py-3 px-4 font-medium text-neutral-500">{copy.extensions}</th><th className="py-3 px-4 font-medium text-neutral-500">{copy.others}</th></tr></thead><tbody className="text-center">{copy.rows.map(([feature, dark, extension, other]) => <tr key={feature} className="border-b border-neutral-900"><td className="py-3 px-4 text-left text-neutral-200">{feature}</td><td className="py-3 px-4"><Mark value={dark} yes={yes} no={no} /></td><td className="py-3 px-4"><Mark value={extension} yes={yes} no={no} /></td><td className="py-3 px-4"><Mark value={other} yes={yes} no={no} /></td></tr>)}</tbody></table></div><div className="sm:hidden space-y-3">{copy.rows.map(([feature, dark, extension, other]) => <div key={feature} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40"><p className="font-medium text-base text-neutral-100 m-0 mb-3">{feature}</p><div className="grid grid-cols-3 gap-2 text-xs"><Cell label="PDF Dark" value={dark} yes={yes} no={no} accent /><Cell label={copy.mobileExtensions} value={extension} yes={yes} no={no} /><Cell label={copy.mobileOthers} value={other} yes={yes} no={no} /></div></div>)}</div></div></section>;
}

function Cell({ label, value, yes, no, accent = false }: { label: string; value: string; yes: string; no: string; accent?: boolean }) { return <div className="flex flex-col items-center"><span className={accent ? "text-amber-400 text-base" : "text-base"}><Mark value={value} yes={yes} no={no} /></span><span className="text-neutral-500 mt-1">{label}</span></div>; }
