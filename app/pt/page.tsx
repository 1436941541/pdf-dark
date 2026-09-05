import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Converter } from "@/components/converter";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/pt";
const TITLE = "PDF Modo Escuro — Leitor de PDF Grátis Online | PDF Dark";
const DESCRIPTION =
  "Leia qualquer PDF em modo escuro direto no seu navegador. Grátis, sem enviar arquivos, sem cadastro. Quer manter o resultado? Converta e baixe um PDF escuro permanente.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "pdf modo escuro",
    "converter pdf para modo escuro",
    "pdfdark",
    "pdf modo noturno",
    "leitor pdf modo escuro",
  ],
  alternates: {
    canonical: SLUG,
    languages: {
      en: "/",
      es: "/es",
      pt: SLUG,
      tr: "/tr",
      id: "/id",
      de: "/de",
      "x-default": "/",
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SLUG,
    siteName: "PDF Dark",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const COMPARISON_ROWS: [string, string, string, string][] = [
  ["Não precisa instalar nada", "sim", "não", "sim"],
  ["Ler no navegador antes de baixar", "sim", "não", "Varia"],
  ["Salvar como novo PDF", "sim", "não", "sim"],
  ["As fotos mantêm as cores originais (não viram negativo)", "sim", "não", "não"],
  ["O texto continua selecionável e pesquisável", "sim", "não", "não"],
  ["Controle de imagens: Original / Auto / Inverter", "sim", "não", "não"],
  ["Sliders de escuridão e temperatura, salvos no arquivo", "sim", "não", "não"],
  ["Funciona no Safari do iOS", "sim", "não", "sim"],
  ["100% local (sem enviar arquivos)", "sim", "sim", "não"],
];

type FaqItem = {
  q: string;
  a: string;
  link?: { href: string; text: string };
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Posso converter um PDF para o modo escuro?",
    a: "Sim — grátis e sem instalar nada. Solte o PDF nesta página para lê-lo imediatamente sobre um fundo escuro, ou inverta as cores e baixe uma cópia com o tema escuro gravado no arquivo.",
  },
  {
    q: "Meu PDF é enviado para algum servidor?",
    a: "Não. O PDF Dark roda 100% no seu navegador. Literalmente não temos nenhum servidor que receba o seu arquivo.",
  },
  {
    q: "Como imprimir um PDF em modo escuro?",
    a: "Baixe primeiro uma cópia com o tema escuro, depois imprima em qualquer leitor. Como as cores ficam gravadas no próprio arquivo, a impressão também sai escura, não só a visualização na tela.",
    link: { href: "/pt/invert-pdf-colors", text: "Inverter cores de PDF" },
  },
  {
    q: "Funciona no iPhone ou iPad?",
    a: "Sim. O Safari no iOS abre PDFs direto nesta página, sem instalar nenhum app, e o arquivo nunca sai do seu dispositivo.",
  },
  {
    q: "Qual a diferença para uma extensão de modo escuro do navegador?",
    a: "As extensões só mudam o estilo da página enquanto ela está aberta no navegador — feche a aba ou passe o arquivo para outra pessoa e ele volta a ficar claro. O PDF Dark reescreve o PDF de verdade: o texto e o fundo são recoloridos no tema escolhido, as imagens são tratadas conforme sua configuração, e o resultado fica salvo no próprio arquivo. O tema escuro acompanha o PDF onde quer que ele seja aberto.",
    link: { href: "/blog/pdf-dark-mode-chrome", text: "PDF em modo escuro no Chrome" },
  },
  {
    q: "Funciona com PDFs escaneados?",
    a: "Sim. As páginas escaneadas são tratadas como o que são — imagens — e invertidas de forma uniforme, então a letra manuscrita e o texto escaneado ficam claros sobre fundo escuro automaticamente. Até escaneamentos antigos e amarelados se normalizam para o fundo do seu tema.",
    link: {
      href: "/blog/scanned-pdf-dark-mode",
      text: "PDF escaneado em modo escuro",
    },
  },
  {
    q: "Como ler um PDF à noite sem cansar a vista?",
    a: "Converta o PDF para modo escuro aqui e escolha OLED ou Midnight — os dois transformam o fundo branco em preto puro ou quase puro, para que seus olhos não precisem lutar contra uma página clara em um quarto escuro. O texto vira tons claros; as imagens recebem um tratamento inteligente para as fotos não virarem negativo.",
  },
  {
    q: "Minhas fotos também vão ser invertidas?",
    a: "Só se você quiser. Por padrão, cada imagem recebe o melhor tratamento automaticamente: as fotos mantêm as cores originais, capturas de tela e diagramas brancos são invertidos para combinar com a página, e imagens muito claras recebem uma leve escurecida. O interruptor Imagens na barra de ferramentas (ao lado dos temas) deixa você forçar tudo para Original ou tudo para Invertido.",
    link: {
      href: "/pt/invert-pdf-colors",
      text: "Inverter cores de PDF",
    },
  },
  {
    q: "Posso deixar o fundo de um PDF preto?",
    a: "Sim. O tema OLED renderiza o fundo em preto puro (#000) e o texto em tons claros — quase branco para o texto do corpo — que é o modo escuro mais agressivo para PDFs. Também dá para baixar o PDF já com esse fundo preto gravado.",
  },
  {
    q: "Isso é um modo escuro para o Adobe Acrobat?",
    a: "Não exatamente. O Acrobat tem seu próprio modo escuro interno, mas ele só muda como você vê o PDF dentro do Acrobat — o arquivo em si continua claro. O PDF Dark gera um arquivo PDF com modo escuro de verdade, que abre em qualquer leitor (Acrobat, Preview, navegador) e continua escuro.",
    link: { href: "/blog/pdf-dark-mode-adobe-acrobat", text: "PDF em modo escuro no Adobe Acrobat" },
  },
  {
    q: "O modo escuro do PDF funciona no Firefox?",
    a: "Sim. O visualizador PDF.js embutido do Firefox só escurece a barra de ferramentas, não o conteúdo da página. O PDF Dark converte o conteúdo real da página, então o arquivo fica escuro em qualquer leitor, incluindo o Firefox.",
    link: { href: "/blog/pdf-dark-mode-firefox", text: "PDF em modo escuro no Firefox" },
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PDF Dark",
    alternateName: ["pdfdark", "pdfdark.org", "PDF Modo Escuro"],
    url: `${site}${SLUG}`,
    sameAs: [
      "https://github.com/1436941541/pdf-dark",
      "https://www.saashub.com/pdf-dark",
      "https://www.libhunt.com/r/pdf-dark",
      "https://devpost.com/software/pdf-dark",
      "https://www.producthunt.com/products/pdf-dark",
      "https://yunjie3.substack.com/p/stop-installing-pdf-dark-mode-extensions",
      "https://www.youtube.com/watch?v=ugLGDvqoSe0",
    ],
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser-based)",
    screenshot: `${site}/compare/pdf-dark.png`,
    description:
      "Conversor e leitor de PDF em modo escuro, grátis e executado no navegador. Leia PDFs sobre um fundo escuro direto no navegador ou baixe o arquivo com o tema aplicado. Roda 100% localmente — feito para ler PDFs à noite.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Conversão 100% no navegador (sem enviar arquivos)",
      "Quatro temas: Midnight, Sepia, Solarized, OLED",
      "As fotos mantêm as cores originais — sem imagens em negativo",
      "Tratamento por imagem: Original, Auto (inteligente) ou Inverter tudo",
      "O texto de saída continua selecionável e pesquisável",
      "Ler no navegador antes de baixar",
      "Baixar como novo PDF",
      "Funciona no Safari do iOS",
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

function Mark({ v }: { v: "sim" | "não" | string }) {
  if (v === "sim") return <span className="text-amber-400 font-semibold">✓</span>;
  if (v === "não") return <span className="text-neutral-600">✗</span>;
  return <span>{v}</span>;
}

export default function HomePt() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />
      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold hidden sm:inline">PDF Dark</span>
          </div>
          <nav className="text-sm text-neutral-400 flex gap-5">
            <Link href="/pt/invert-pdf-colors" className="hover:text-neutral-100">Inverter e baixar</Link>
            <Link href="/blog" className="hover:text-neutral-100">Blog</Link>
            <a href="#faq" className="hover:text-neutral-100">FAQ</a>
            <LanguageSwitcher page="home" current="pt" />
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Leia PDFs em modo escuro
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Solte um PDF e leia aqui mesmo sobre um fundo escuro — escolha um
            tema, ajuste a escuridão e a temperatura, e passe as páginas com
            conforto à noite. Tudo roda no seu navegador: sem enviar arquivos,
            sem cadastro, sem instalar nada.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% no navegador
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> 4 temas
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Funciona no celular
            </span>
          </div>

          <div className="mt-8">
            <Converter locale="pt" />
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Quer manter a versão escura?{" "}
            <Link href="/pt/invert-pdf-colors" className="text-amber-400 hover:underline">
              Inverta as cores e baixe o arquivo
            </Link>
            .
          </p>
        </section>

        {/* Visual proof */}
        <section
          id="compare"
          className="max-w-5xl mx-auto px-6 py-16 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-3 text-center">
            Modo escuro não devia estragar suas fotos
          </h2>
          <p className="text-sm text-neutral-400 text-center mb-10 max-w-2xl mx-auto">
            A mesma página, de três formas. Um inversor básico vira cada pixel,
            então as fotos saem como negativos. O PDF Dark escurece o texto e o
            fundo, mas detecta as fotos e mantém as cores.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <figure className="m-0">
              <div className="rounded-xl overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="Página de PDF original antes da conversão para modo escuro: texto preto sobre fundo branco brilhante com uma foto colorida de um pôr do sol"
                  width={720}
                  height={933}
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
              <figcaption className="mt-3 text-center">
                <div className="font-semibold text-neutral-100 text-sm">
                  PDF original
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Uma página branca e brilhante — ótima de dia, dura à noite.
                </div>
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-xl overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/naive-invert.png"
                  alt="A mesma página escurecida por um inversor de pixels ingênuo: o fundo fica preto, mas a foto do pôr do sol vira um negativo de cor falsa"
                  width={720}
                  height={933}
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
              <figcaption className="mt-3 text-center">
                <div className="font-semibold text-neutral-100 text-sm">
                  Inversor básico
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Todo pixel invertido — o pôr do sol vira um negativo de cor falsa.
                </div>
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-xl overflow-hidden border border-amber-400/40">
                <Image
                  src="/compare/pdf-dark.png"
                  alt="A mesma página convertida para modo escuro com o PDF Dark: fundo escuro, texto claro, e a foto do pôr do sol mantém as cores originais"
                  width={720}
                  height={933}
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
              <figcaption className="mt-3 text-center">
                <div className="font-semibold text-amber-400 text-sm">
                  PDF Dark — Auto
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Texto e fundo escurecem; a foto mantém suas cores originais.
                </div>
              </figcaption>
            </figure>
          </div>
          <p className="mt-8 text-xs text-neutral-600 text-center max-w-2xl mx-auto">
            Esquerda: a página original como renderizada. Centro: a mesma
            página depois de uma inversão bruta de pixels RGB — o método que a
            maioria das ferramentas básicas usa. Direita: resultado real deste
            conversor (tema Midnight, modo de imagem Auto).
          </p>
          <p className="mt-4 text-sm text-center">
            <Link href="/pt/invert-pdf-colors" className="text-amber-400 hover:underline">
              Inverta as cores do seu próprio PDF →
            </Link>
          </p>
        </section>

        {/* Why us */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center">
              PDF Dark vs. extensões do Chrome vs. outras ferramentas online
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              Existem várias formas de ler PDFs em modo escuro ou modo noturno
              hoje em dia — extensões do navegador, outros conversores online,
              leitores nativos. Veja como cada um se compara no uso do dia a dia.
            </p>

            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">
                      Recurso
                    </th>
                    <th className="py-3 px-4 font-medium text-amber-400">PDF Dark</th>
                    <th className="py-3 px-4 font-medium text-neutral-500">
                      Extensões do Chrome
                    </th>
                    <th className="py-3 px-4 font-medium text-neutral-500">
                      Outras ferramentas online
                    </th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {COMPARISON_ROWS.map(([feat, a, b, c]) => (
                    <tr key={feat} className="border-b border-neutral-900">
                      <td className="py-3 px-4 text-left text-neutral-200">{feat}</td>
                      <td className="py-3 px-4"><Mark v={a} /></td>
                      <td className="py-3 px-4"><Mark v={b} /></td>
                      <td className="py-3 px-4"><Mark v={c} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-3">
              {COMPARISON_ROWS.map(([feat, a, b, c]) => (
                <div
                  key={feat}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40"
                >
                  <p className="font-medium text-base text-neutral-100 m-0 mb-3">{feat}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center">
                      <span className="text-amber-400 text-base"><Mark v={a} /></span>
                      <span className="text-neutral-500 mt-1">PDF Dark</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-base"><Mark v={b} /></span>
                      <span className="text-neutral-500 mt-1">Ext. Chrome</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-base"><Mark v={c} /></span>
                      <span className="text-neutral-500 mt-1">Outras</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What & why */}
        <section
          id="what"
          className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">
            O que é o modo escuro para PDF?
          </h2>

          <h3 className="text-lg font-semibold text-neutral-100 mt-2 mb-3">
            Em resumo
          </h3>
          <p className="text-neutral-300 leading-relaxed">
            É uma forma de ler documentos PDF com fundo escuro e texto claro em
            vez da página branca padrão. Também é chamado de PDF modo noturno,
            leitor de PDF escuro, ou PDF invertido — nomes diferentes para a
            mesma coisa: um tema de pouca luz embutido no arquivo, então ele
            continua escuro em qualquer visualizador, não só no que você abriu.
          </p>

          <h3 className="text-lg font-semibold text-neutral-100 mt-8 mb-3">
            Por que usar um PDF em modo escuro
          </h3>
          <p className="text-neutral-300 leading-relaxed">
            As pessoas usam o modo escuro em PDF para ler à noite e reduzir o
            cansaço visual, para prolongar a bateria em telas OLED, para
            estudar artigos até tarde, e para deixar documentos cheios de
            texto ou código menos pesados sob luz forte de escritório.
            Extensões do navegador conseguem simular um tema escuro dentro do
            visualizador, mas o arquivo PDF em si continua claro. O PDF Dark
            gera um PDF com tema escuro de verdade, que você pode salvar,
            compartilhar e reabrir em qualquer lugar — um PDF escuro de fato,
            não um truque do visualizador.
          </p>

          <h3 className="text-lg font-semibold text-neutral-100 mt-8 mb-3">
            Conversão, não só um truque do visualizador
          </h3>
          <p className="text-neutral-300 leading-relaxed">
            Um bom leitor de PDF em modo escuro faz mais do que pintar a tela
            de escuro — ele reescreve o arquivo com as cores invertidas para
            que o documento continue escuro onde quer que você o abra. Com o
            PDF Dark você pode ler no Chrome, Firefox, Safari ou Edge, e depois
            levar o arquivo convertido para o celular ou e-reader. Ele nunca
            sai do seu dispositivo: toda a conversão roda no navegador via Web
            Worker, então nada é enviado.
          </p>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="max-w-4xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-3 text-center">
            Como ler um PDF em modo escuro
          </h2>
          <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
            O texto e o fundo são invertidos para um tema de pouca luz enquanto
            as imagens recebem um tratamento inteligente individual — as fotos
            mantêm suas cores. Você pode começar a ler assim que a primeira
            página é renderizada.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Solte seu PDF", d: "Arraste e solte, ou clique para procurar. Nunca sai do seu navegador.", offset: "sm:translate-y-0" },
              { n: "2", t: "Escolha um tema", d: "Midnight, Sepia, Solarized, ou OLED preto puro — mais sliders de escuridão e temperatura.", offset: "sm:-translate-y-2" },
              { n: "3", t: "Leia", d: "Passe as páginas com o teclado, o toque ou os controles. Precisa de um arquivo para guardar? Use o conversor.", offset: "sm:translate-y-0" },
            ].map((s) => (
              <div
                key={s.n}
                className={`p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 transition-transform ${s.offset}`}
              >
                <div className="text-2xl font-bold text-amber-400">{s.n}</div>
                <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
                <div className="mt-1 text-sm text-neutral-400">{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20"
        >
          <h2 className="text-2xl font-bold mb-10 text-center">
            Perguntas frequentes
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border border-neutral-800 bg-neutral-900/30 open:bg-neutral-900/60 transition-colors [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="cursor-pointer p-4 flex items-center justify-between list-none text-neutral-100">
                  <h3 className="font-medium text-base m-0">{f.q}</h3>
                  <span
                    aria-hidden
                    className="text-neutral-500 transition-transform group-open:rotate-180 group-hover:text-amber-400"
                  >
                    ⌄
                  </span>
                </summary>
                <p className="px-4 pb-4 -mt-1 text-sm text-neutral-400">
                  {f.a}
                  {f.link && (
                    <>
                      {" "}
                      <Link
                        href={f.link.href}
                        className="text-amber-400 hover:underline"
                      >
                        {f.link.text}
                      </Link>
                      .
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer locale="pt" />
    </div>
  );
}
