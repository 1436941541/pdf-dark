import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/pt/invert-pdf-colors";
const TITLE = "Inverter Cores de PDF Online — Conversor Grátis, Sem Enviar Arquivos";
const DESCRIPTION =
  "Inverta as cores de um PDF e baixe o arquivo invertido. As fotos podem manter as próprias cores em vez de virar negativo. Grátis, roda no navegador, sem enviar arquivos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: SLUG,
    languages: {
      en: "/invert-pdf-colors",
      es: "/es/invert-pdf-colors",
      pt: SLUG,
      "x-default": "/invert-pdf-colors",
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SLUG,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const FAQ = [
  {
    q: "O que exatamente inverter um PDF produz?",
    a: "Um PDF novinho em folha com as cores invertidas dentro do próprio conteúdo da página — fundo e texto trocados, imagens tratadas conforme sua configuração de Imagens. Abra em Acrobat, Preview, navegador ou e-reader e vai parecer igual em todos, porque a mudança está no arquivo, não numa preferência do visualizador.",
  },
  {
    q: "Qual configuração dá uma inversão exata de verdade?",
    a: "O tema OLED. Com o OLED o mapeamento é exatamente saída = 255 − entrada para conteúdo em escala de cinza: branco puro vira preto puro, preto puro vira branco puro, e passar a saída de volta pelo processo retorna o original. Midnight, Sepia e Solarized colocam o branco sobre um fundo com tonalidade em vez de uma inversão matematicamente exata — mais fácil de ler em sessões longas, mas não é a mesma coisa.",
  },
  {
    q: "Consegue transformar um PDF com fundo preto de volta em branco?",
    a: "Sim. Como o mapeamento do OLED é simétrico, um documento escuro que passa por ele sai claro: fundos pretos viram brancos e texto claro vira preto. Geralmente é por isso que as pessoas querem isso — um material com tema escuro sai caríssimo pra imprimir, e invertê-lo antes economiza tinta.",
  },
  {
    q: "As fotos também vão virar negativo?",
    a: "Só se você quiser. O modo Auto padrão mantém as fotos nas cores originais, inverte capturas de tela e diagramas brancos para combinar com a página, e escurece levemente imagens muito claras. O interruptor Imagens na barra de ferramentas deixa você forçar tudo para Original ou tudo para Inverter.",
  },
  {
    q: "Consigo inverter o texto e o fundo mas deixar as imagens intactas?",
    a: "Sim — coloque Imagens em Original. Cada imagem embutida fica idêntica pixel a pixel à fonte, incluindo digitalizações de página inteira, e só o texto e o fundo são invertidos. Imagens recortadas em círculo, como fotos de perfil, são restauradas dentro da moldura circular, então nenhum canto claro sobra na página escura.",
  },
  {
    q: "O PDF invertido continua com o texto selecionável?",
    a: "Sim, onde a página de origem permitir. Páginas com texto são recoloridas como objetos vetoriais, então o texto de saída continua selecionável e pesquisável. Páginas digitalizadas já são imagens desde o início, então são invertidas como imagens.",
  },
  {
    q: "Posso imprimir a versão invertida?",
    a: "Sim — esse é um dos principais motivos para inverter o arquivo em vez de usar um tema do visualizador. Imprima o arquivo baixado em qualquer leitor e a página sai exatamente como você vê na tela.",
  },
  {
    q: "Existe um limite de tamanho de arquivo?",
    a: "Não há um limite fixo. A conversão roda inteiramente no seu dispositivo, então o limite prático é a memória do seu navegador — documentos grandes só demoram mais.",
  },
  {
    q: "Meu PDF é enviado para um servidor?",
    a: "Não. Renderizar, inverter e reconstruir o PDF acontece tudo dentro da aba do seu navegador. O arquivo baixado é montado localmente — não existe servidor que chegue a ver o seu documento.",
  },
  {
    q: "Posso compartilhar o arquivo invertido com outra pessoa?",
    a: "Sim. Envie por e-mail, AirDrop, suba pro Google Drive ou Dropbox — quem receber verá a versão invertida automaticamente. Sem nenhuma configuração do lado dela.",
  },
];

const STEPS = [
  {
    t: "Escolha suas configurações",
    d: "Defina até onde vai a inversão — Imagens: Original, Auto ou Inverter tudo — mais o fundo, a escuridão e a temperatura.",
  },
  {
    t: "Solte seu PDF",
    d: "Arraste e solte, ou clique para procurar. Nunca sai do seu navegador.",
  },
  {
    t: "Baixe o PDF invertido",
    d: "A conversão começa na hora e o novo arquivo se baixa sozinho — com as cores gravadas no documento, pronto para compartilhar, imprimir ou ler em qualquer lugar.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Color Inverter",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser-based)",
    screenshot: `${site}/compare/pdf-dark.png`,
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Como inverter as cores de um PDF",
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: 0 },
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.t,
      text: s.d,
    })),
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
    </>
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
            <span className="text-lg font-semibold hidden sm:inline">
              PDF Dark
            </span>
          </Link>
          <nav className="text-sm text-neutral-400 flex gap-5">
            <Link href="/pt" className="hover:text-neutral-100">
              Leitor
            </Link>
            <Link href="/blog" className="hover:text-neutral-100">
              Blog
            </Link>
            <a href="#faq" className="hover:text-neutral-100">
              FAQ
            </a>
            <LanguageSwitcher page="invert" current="pt" />
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Inverter cores de PDF
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Escolha suas configurações, solte seu PDF, e a cópia invertida se
            baixa sozinha. As cores ficam gravadas no próprio arquivo, então
            ele continua assim em qualquer visualizador — Acrobat, Preview,
            navegadores, e-readers. Grátis, e seu arquivo nunca sai do
            navegador.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Baixar PDF invertido
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% no navegador
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> 3 modos de imagem
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Funciona no celular
            </span>
          </div>

          <div className="mt-8">
            <Downloader locale="pt" />
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Só veio para ler, não para salvar um arquivo?{" "}
            <Link href="/pt" className="text-amber-400 hover:underline">
              Abra o leitor de PDF em modo escuro
            </Link>
            .
          </p>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center">
              Como inverter as cores de um PDF
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              O texto e o fundo sempre são invertidos. O que acontece com as
              imagens depende de você — é pra isso que serve o controle
              Imagens: deixe intactas, inverta junto com a página, ou deixe
              cada uma ser avaliada separadamente. Curioso sobre como essa
              detecção decide?{" "}
              <Link
                href="/blog/how-pdf-dark-mode-conversion-works"
                className="text-amber-400 hover:underline"
              >
                Veja como funciona a conversão
              </Link>
              .
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <div
                  key={s.t}
                  className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30"
                >
                  <div className="text-2xl font-bold text-amber-400">{i + 1}</div>
                  <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
                  <div className="mt-1 text-sm text-neutral-400">{s.d}</div>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <h3 className="text-lg font-semibold text-neutral-50 text-center m-0">
                O que a configuração Imagens muda
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                O texto e o fundo se invertem de qualquer forma. A foto é onde
                a diferença aparece — e onde inverter cada pixel às cegas falha.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/original.png"
                      alt="Página de PDF antes da inversão: texto preto sobre fundo branco com uma foto colorida de um pôr do sol"
                      width={720}
                      height={933}
                      sizes="33vw"
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
                      alt="A mesma página depois de uma inversão simples de pixels — a foto do pôr do sol vira um negativo de cor falsa"
                      width={720}
                      height={933}
                      sizes="33vw"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Todo pixel invertido
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/pdf-dark.png"
                      alt="A mesma página invertida aqui — fundo e texto invertidos, a foto mantém as cores originais"
                      width={720}
                      height={933}
                      sizes="33vw"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Invertido aqui, Imagens: Auto
                  </figcaption>
                </figure>
              </div>
              <p className="mt-3 text-xs text-neutral-600 text-center">
                Resultado real, não um mockup: à esquerda a página de origem,
                no centro uma inversão RGB simples de cada pixel, à direita
                esta ferramenta no Auto (tema Midnight). Escolher Imagens:
                Inverter também inverte as fotos junto com a página — que é o
                que uma digitalização ou foto de quadro branco precisa.
              </p>
            </div>
          </div>
        </section>

        {/* Why invert the file */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Por que inverter o arquivo em vez de mudar uma configuração do visualizador?
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Temas de visualizador, extensões do navegador e o inversor do
            sistema só mudam a aparência de um PDF enquanto ele está aberto
            naquele app — o arquivo em si não muda. Inverter gera um{" "}
            <strong className="text-neutral-100">novo PDF</strong>: envie para
            o celular ou e-reader, compartilhe com um colega, imprima ou
            arquive, e as cores viajam junto com o arquivo.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            Tem mais uma diferença que importa: uma inversão a nível de
            sistema não sabe o que está invertendo, então toda foto, gráfico e
            captura de tela sai como negativo. Trabalhar no arquivo permite
            que cada imagem seja avaliada separadamente — ou deixada intacta.
            Se você só precisa terminar um documento hoje à noite, pule o
            download e{" "}
            <Link href="/pt" className="text-amber-400 hover:underline">
              leia em modo escuro no navegador
            </Link>{" "}
            em vez disso.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                Visualizador / extensão / inversão do sistema
              </h3>
              <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                <li>Invertido só enquanto aquele app/extensão está rodando</li>
                <li>Reabra em outro leitor e volta ao original</li>
                <li>Não dá pra compartilhar ou imprimir a versão invertida</li>
                <li>
                  Inverte fotos, capturas de tela e gráficos sem como excluir
                  nenhum
                </li>
                <li>Quebra quando você atualiza ou troca de dispositivo</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                Um arquivo PDF invertido
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                <li>
                  <strong className="text-neutral-100">Permanente</strong> — as
                  cores estão no arquivo
                </li>
                <li>
                  Aparece igual em <strong className="text-neutral-100">qualquer</strong> leitor
                  de PDF, em qualquer dispositivo
                </li>
                <li>
                  Compartilhável — e-mail, AirDrop, Drive, qualquer coisa; quem
                  recebe vê a versão invertida sem configurar nada
                </li>
                <li>
                  Controle por imagem — as fotos mantêm as cores enquanto a
                  página ao redor inverte
                </li>
                <li>
                  Mapeamento de cor que preserva o tom — um título azul escuro
                  vira azul claro, não cinza
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-neutral-500 text-center mt-8">
            Pense assim: uma extensão é maquiagem no PDF. Inverter é um PDF novo.
          </p>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Quando inverter um PDF é a melhor opção
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Documentos digitalizados e anotações manuscritas
              </h3>
              <p className="text-sm text-neutral-400">
                Numa digitalização não existe camada de texto — a escrita{" "}
                <em>é</em> a imagem. Coloque Imagens em Inverter e a página
                inteira vira, então a letra manuscrita fica clara sobre
                escuro.{" "}
                <Link
                  href="/blog/scanned-pdf-dark-mode"
                  className="text-amber-400 hover:underline"
                >
                  Mais sobre PDFs digitalizados
                </Link>
                .
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Um PDF escuro que você precisa imprimir
              </h3>
              <p className="text-sm text-neutral-400">
                Materiais com tema escuro e slides exportados são brutais para
                a impressora. Passe pelo OLED e ele volta a ser texto preto
                sobre branco, pronto para imprimir sem redesenhar nada — a
                inversão funciona nos dois sentidos.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Artigos e apresentações cheios de figuras
              </h3>
              <p className="text-sm text-neutral-400">
                Gráficos de linha, diagramas de circuito, partituras, desenhos
                técnicos — arte preto no branco inverte limpo e continua
                legível. O Auto lida com o caso misto, quando um artigo tem
                diagramas e fotografias na mesma página.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Ler à noite sem estragar as imagens
              </h3>
              <p className="text-sm text-neutral-400">
                O motivo mais comum para inverter um PDF é uma página clara em
                um quarto escuro. O motivo mais comum para desistir é as
                imagens saírem como negativo — que é exatamente o caso para o
                qual o Auto existe.
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
