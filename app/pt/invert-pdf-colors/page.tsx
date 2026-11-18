import { ResponsiveNavigation } from "@/components/responsive-navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/pt/invert-pdf-colors";
const TITLE = "Inverter Cores PDF Online Grátis (Modo Escuro ou Imprimir)";
const DESCRIPTION =
  "Inverta cores de PDF grátis no navegador: passe páginas claras para modo escuro sem fotos em negativo, ou mude slides escuros para branco para imprimir.";
const SOCIAL_IMAGE_ALT =
  "Inverter cores PDF no navegador: modo escuro e impressão de slides escuros";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: SLUG,
    languages: {
      en: "/invert-pdf-colors",
      es: "/es/invert-pdf-colors",
      pt: SLUG,
      de: "/de/invert-pdf-colors",
      "x-default": "/invert-pdf-colors",
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
    images: [{ url: `${SLUG}/opengraph-image`, alt: SOCIAL_IMAGE_ALT }],
  },
};

const FAQ = [
  {
    q: "Como transformar um PDF de fundo preto ou azul-escuro em branco para imprimir?",
    a: "Selecione Escuro → Claro (Imprimir) no topo da ferramenta e solte o arquivo. Fundos pretos, azul-marinho e verdes viram branco puro (#FFFFFF) para não gastar tinta colorida na folha, páginas já brancas permanecem brancas e anotações em amarelo, ciano, azul ou verde escurecem dentro da mesma família de cor para ficarem legíveis no papel.",
  },
  {
    q: "Qual ajuste em Claro → Escuro faz uma inversão exata em escala de cinza?",
    a: "Escolha o tema OLED com Escuridão em 100% e Temperatura em 0%. Em textos e fundos acinzentados, o OLED aplica saída = 255 − entrada sem o tom azulado ou sépia de Midnight, Sepia ou Solarized. Como cores saturadas preservam o matiz e páginas rasterizadas são salvas em JPEG, processar o arquivo baixado uma segunda vez não restaura o PDF original byte a byte.",
  },
  {
    q: "Como o modo Auto decide quais imagens inverter e quais manter?",
    a: "Em Claro → Escuro, o modo Auto analisa brilho e saturação de cada imagem incorporada: mantém fotografias nas cores naturais, suaviza figuras muito vibrantes e inverte capturas de tela claras, diagramas e digitalizações de página inteira (85% ou mais da folha). Já o modo de impressão (Escuro para Claro) inverte capturas escuras de quadro e preserva questões de fundo branco coladas no slide e fotos comuns.",
  },
  {
    q: "O PDF baixado mantém texto selecionável e arquivo leve?",
    a: "Em páginas vetoriais compatíveis sem imagens invertidas, o PDF Dark recolore o fluxo de comandos do PDF diretamente (inclusive apostilas com bloqueio de cópia sem senha de abertura), preservando letras nítidas, links e tamanho enxuto sem inflar 15 a 20 vezes. Páginas digitalizadas ou com imagens invertidas são geradas em JPEG até escala 1.5x (limite de 4096 px por lado e ~8.4 MP por página) com camada Helvetica invisível para texto latino em páginas sem rotação, sem OCR.",
  },
  {
    q: "Meu PDF é enviado para algum servidor ou tem limite de páginas?",
    a: "Nada é enviado. Renderização, mapeamento de cores e montagem do novo PDF rodam localmente na aba do seu navegador (com o cálculo de pixels em segundo plano), sem cadastro, marca d'água ou cota por hora. O tamanho prático depende apenas da memória disponível no aparelho.",
  },
];

const STEPS = [
  {
    t: "Escolha a direção e o tema",
    d: "Mantenha Claro → Escuro (Midnight, Sepia, Solarized ou OLED com Imagens em Auto, Original ou Inverter), ou use Escuro → Claro (Imprimir) para slides e notas escuras.",
  },
  {
    t: "Solte seu PDF local",
    d: "Arraste o arquivo ou clique para selecionar no dispositivo. Tudo roda na aba do navegador, sem upload.",
  },
  {
    t: "Baixe o novo PDF",
    d: "O arquivo convertido baixa automaticamente como -midnight.pdf, -oled.pdf ou -light.pdf, com as novas cores gravadas no documento.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Inverter cores PDF",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any modern browser",
    screenshot: `${site}/compare/pdf-dark.png`,
    description: DESCRIPTION,
    inLanguage: "pt",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(app).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function InvertPdfColorsPtPage() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />

      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/pt"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold whitespace-nowrap">
              PDF Dark
            </span>
          </Link>
          <ResponsiveNavigation
            locale="pt"
            desktopGap="wide"
            language={<LanguageSwitcher page="invert" current="pt" />}
          >
            <Link href="/pt" className="hover:text-neutral-100">
              Leitor
            </Link>
          </ResponsiveNavigation>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Inverter cores PDF
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Ferramenta online e grátis para inverter cores PDF direto no
            navegador: escureça páginas brancas sem transformar fotos em
            negativo, ou ative o{" "}
            <strong className="text-neutral-100 font-medium">
              modo de impressão (Escuro para Claro)
            </strong>{" "}
            para converter slides e anotações de quadro escuro em folhas brancas
            prontas para imprimir.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Claro → Escuro e Impressão
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% no navegador
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> Fotos sem negativo (Auto)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Celular e PC
            </span>
          </div>

          <div className="mt-8">
            <Downloader locale="pt" />
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Só quer ler agora sem salvar uma cópia?{" "}
            <Link href="/pt" className="text-amber-400 hover:underline">
              Abra o leitor de PDF em modo escuro
            </Link>
            .
          </p>
        </section>

        {/* How it works + two real comparisons */}
        <section
          id="how"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center">
              Como inverter cores PDF
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              O conversor reescreve fundo e texto nos dois sentidos, avaliando
              fotografias e capturas embutidas separadamente para evitar
              negativos indesejados.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <div
                  key={s.t}
                  className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30"
                >
                  <div className="text-2xl font-bold text-amber-400">
                    {i + 1}
                  </div>
                  <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
                  <div className="mt-1 text-sm text-neutral-400">{s.d}</div>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <h3 className="text-lg font-semibold text-neutral-50 text-center m-0">
                Claro → Escuro: o que a opção Imagens muda
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                Texto e fundo escurecem nos dois casos. A fotografia mostra por
                que inverter cada pixel RGB às cegas estraga documentos
                ilustrados.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/original.png"
                      alt="Página PDF antes da inversão: texto preto no branco com foto colorida de pôr do sol"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    PDF original
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/naive-invert.png"
                      alt="Mesma página após inversão RGB simples, deixando a foto do pôr do sol em negativo azulado"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Inversão RGB simples
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/pdf-dark.png"
                      alt="Mesma página convertida aqui com Midnight e Imagens em Auto: fundo escuro e foto preservada"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Midnight + Imagens: Auto
                  </figcaption>
                </figure>
              </div>
            </div>

            <div className="mt-14 pt-12 border-t border-neutral-900">
              <h3 className="text-lg font-semibold text-neutral-50 text-center m-0">
                Imprimindo slides e anotações de quadro escuro
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                Apostilas de lousa digital costumam usar fundo azul-marinho ou
                verde com fórmulas em amarelo e ciano. A inversão RGB comum
                tinge a folha inteira e troca as cores; o modo de impressão
                entrega papel branco puro e tinta escura legível.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/board-source.webp"
                      alt="Slide PDF de quadro azul-escuro com equações brancas, destaques amarelos e diagrama ciano"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Slide escuro original
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/board-naive.webp"
                      alt="Inversão RGB simples deixando o fundo bege e trocando notas amarelas para azul"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    RGB simples (fundo colorido)
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/board-print.webp"
                      alt="Convertido em Escuro para Claro Imprimir: fundo branco puro e tinta escura preservando as cores"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Modo impressão (-light.pdf)
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* Why invert the file */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Por que alterar o arquivo PDF em vez de mudar o visualizador?
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Temas de leitor, extensões do navegador e filtros do sistema só
            mudam a tela enquanto o PDF está aberto naquele aplicativo; o
            documento em si continua igual. Ao gerar um{" "}
            <strong className="text-neutral-100">novo PDF</strong>, as cores
            convertidas viajam dentro do arquivo para abrir no celular, mandar
            para colegas no WhatsApp ou levar slides escuros direto à gráfica.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            A inversão de tela do sistema também trata todos os pixels do mesmo
            jeito, deixando fotos, gráficos e slides coloridos como negativos.
            Processar o próprio PDF permite classificar cada imagem embutida
            separadamente ou mantê-la intacta.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                Visualizador / extensão / inversão do sistema
              </h3>
              <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                <li>Vale apenas enquanto aquele aplicativo ou extensão está aberto</li>
                <li>Ao abrir no Acrobat, no celular ou na gráfica, volta ao original</li>
                <li>Não exporta cópia branca para imprimir slides de fundo preto</li>
                <li>Transforma fotos e gráficos embutidos em negativos</li>
                <li>Perde o efeito ao trocar de aparelho ou enviar o arquivo</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                Um arquivo PDF com cores salvas
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                <li>
                  <strong className="text-neutral-100">Gravado no arquivo:</strong>{" "}
                  abre igual no Acrobat, Preview, celular, Kindle e na impressora
                </li>
                <li>
                  Funciona nos dois sentidos: páginas claras para escuro ou
                  slides escuros para papel branco
                </li>
                <li>
                  Controle por imagem para preservar fotos naturais e inverter diagramas
                </li>
                <li>
                  Mapeamento que preserva o matiz de títulos e anotações coloridas
                </li>
                <li>
                  Páginas vetoriais são recoloridas no próprio fluxo, mantendo texto nítido e arquivo leve
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Quando usar o conversor de cores PDF
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Slides de aula e anotações de quadro escuro para imprimir
              </h3>
              <p className="text-sm text-neutral-400">
                Apostilas de cursinho e resumos escritos em lousa digital preta
                consomem muita tinta na impressão. O modo de impressão limpa o
                fundo escuro para papel branco e escurece os traços coloridos
                para estudar no papel sem desperdício de toner.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Documentos digitalizados e cadernos manuscritos
              </h3>
              <p className="text-sm text-neutral-400">
                Em um PDF escaneado não há camada de texto separada porque a
                própria página é uma imagem. Digitalizações de página inteira
                invertem automaticamente no modo Auto, e recortes menores de
                caderno ou quadro viram ao escolher Imagens: Inverter.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Artigos técnicos e apostilas com gráficos e fotos
              </h3>
              <p className="text-sm text-neutral-400">
                Diagramas de circuito, gráficos de linha, partituras e tabelas
                em fundo branco invertem com nitidez no Auto, enquanto as
                fotografias da mesma página conservam suas cores naturais.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Leitura noturna no tablet ou celular sem estragar fotos
              </h3>
              <p className="text-sm text-neutral-400">
                Livros e PDFs brancos cansam a vista à noite, principalmente em
                telas OLED. Salvar uma cópia em Midnight ou Sepia permite ler
                com conforto em qualquer aplicativo leitor nativo.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Perguntas frequentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
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
