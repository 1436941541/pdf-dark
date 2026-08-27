// Shared translation strings for the interactive reader/converter panels
// (DropZone, ThemePreview, Downloader, PdfViewer). Page-level copy (H1s,
// FAQ, marketing sections) lives directly in each locale's page.tsx —
// this file is only for the client components reused across all locales.
//
// Theme names (Midnight/Sepia/Solarized/OLED) are intentionally NOT
// translated — kept as brand-like labels in every language.

export type Locale = "en" | "es" | "pt";

type Dict = {
  dropzone: {
    title: string;
    subtitle: string;
    notPdf: string;
  };
  themePreview: {
    caption: string;
  };
  imageMode: {
    label: string;
    imagesTitleAttr: string;
    original: string;
    originalTip: string;
    auto: string;
    autoTip: string;
    invert: string;
    invertTip: string;
  };
  sliders: {
    darkness: string;
    darknessTitle: string;
    warmth: string;
    warmthTitle: string;
    warmthTitleLong: string;
  };
  downloader: {
    step1: string;
    step2: string;
    convertingPage: (done: number, total: number | string) => string;
    building: string;
    runsLocally: string;
    stayActive: string;
    saved: (filename: string) => string;
    checkDownloads: string;
    convertAnother: string;
    genericError: string;
    back: string;
  };
  viewer: {
    settingsAria: string;
    settingsTitle: string;
    renderingProgress: (done: number, total: number) => string;
    applyingTheme: (themeLabel: string, cur: number, total: number) => string;
    previousPage: string;
    previousPageTitle: string;
    nextPage: string;
    nextPageTitle: string;
    jumpToPage: string;
    closeSettings: string;
    theme: string;
    waitFirstPass: string;
    zoom: string;
    zoomOut: string;
    zoomOutTitle: string;
    reset: string;
    resetTitle: string;
    zoomIn: string;
    zoomInTitle: string;
    invertAndDownload: string;
    invertAndDownloadTitle: string;
    invertHref: string;
    newFile: string;
    renderingLoading: (done: number, total: number | string) => string;
    readErrorFallback: string;
    pageAlt: (n: number) => string;
  };
  errors: {
    password: string;
    invalid: string;
  };
};

export const T: Record<Locale, Dict> = {
  en: {
    dropzone: {
      title: "Drop your PDF here or click to browse",
      subtitle: "No size limit · Never leaves your browser",
      notPdf: "Please drop a PDF file.",
    },
    themePreview: {
      caption: "4 themes — see the colors before you drop a file",
    },
    imageMode: {
      label: "Images",
      imagesTitleAttr: "How photos, figures and scanned pages are treated",
      original: "Original",
      originalTip:
        "Photos, figures and scanned pages stay exactly as in the source — only text and background are darkened",
      auto: "Auto",
      autoTip:
        "Recommended: each image gets the best treatment — white screenshots/diagrams are inverted with the page, photos stay original, bright colorful images are gently dimmed",
      invert: "Invert",
      invertTip:
        "Invert everything, images included — deepest dark, best for scanned documents",
    },
    sliders: {
      darkness: "Darkness",
      darknessTitle:
        "How dark the page gets — drag left for a softer, lighter background",
      warmth: "Warmth",
      warmthTitle:
        "Background color temperature — drag right for a warmer, candle-light tint",
      warmthTitleLong:
        "Background color temperature — drag right for a warmer, candle-light tint that's easier on the eyes at night",
    },
    downloader: {
      step1: "1 · Choose your dark theme",
      step2: "2 · Drop your PDF — the dark copy downloads automatically",
      convertingPage: (done, total) => `Converting page ${done} / ${total}…`,
      building: "Building your dark PDF…",
      runsLocally: "Runs entirely in your browser — nothing is uploaded.",
      stayActive:
        "Keep this tab open and active — switching away or minimizing may pause or interrupt the conversion.",
      saved: (filename) => `Saved ${filename}`,
      checkDownloads:
        "Check your downloads folder — the dark theme is baked into the file.",
      convertAnother: "Convert another PDF",
      genericError: "Couldn't convert that PDF. Try another file?",
      back: "Back",
    },
    viewer: {
      settingsAria: "Reader settings",
      settingsTitle: "Settings",
      renderingProgress: (done, total) => `Rendering ${done} / ${total} pages`,
      applyingTheme: (themeLabel, cur, total) =>
        `Applying ${themeLabel} · ${cur} / ${total}`,
      previousPage: "Previous page",
      previousPageTitle: "Previous page (←)",
      nextPage: "Next page",
      nextPageTitle: "Next page (→)",
      jumpToPage: "Jump to page",
      closeSettings: "Close settings",
      theme: "Theme",
      waitFirstPass: "Wait until the first pass finishes",
      zoom: "Zoom",
      zoomOut: "Zoom out",
      zoomOutTitle: "Zoom out (−)",
      reset: "Reset",
      resetTitle: "Reset zoom (0)",
      zoomIn: "Zoom in",
      zoomInTitle: "Zoom in (+)",
      invertAndDownload: "Invert & download →",
      invertAndDownloadTitle: "Invert the colors and save a copy of this PDF",
      invertHref: "/invert-pdf-colors",
      newFile: "New file",
      renderingLoading: (done, total) => `Rendering page ${done} / ${total}…`,
      readErrorFallback: "Couldn't read that PDF. Try another file?",
      pageAlt: (n) => `Page ${n} of your PDF, rendered in dark mode`,
    },
    errors: {
      password:
        "This PDF is password-protected. Remove the password (e.g. print it to a new PDF) and try again.",
      invalid:
        "That file isn't a readable PDF — it may be empty or corrupted. Try re-selecting or re-downloading it.",
    },
  },
  es: {
    dropzone: {
      title: "Suelta tu PDF aquí o haz clic para explorar",
      subtitle: "Sin límite de tamaño · Nunca sale de tu navegador",
      notPdf: "Por favor, suelta un archivo PDF.",
    },
    themePreview: {
      caption: "4 temas — mira los colores antes de soltar un archivo",
    },
    imageMode: {
      label: "Imágenes",
      imagesTitleAttr: "Cómo se tratan las fotos, figuras y páginas escaneadas",
      original: "Original",
      originalTip:
        "Las fotos, figuras y páginas escaneadas se mantienen exactamente como en el original — solo el texto y el fondo se oscurecen",
      auto: "Auto",
      autoTip:
        "Recomendado: cada imagen recibe el mejor tratamiento — las capturas/diagramas blancos se invierten con la página, las fotos mantienen su color, las imágenes muy brillantes se atenúan suavemente",
      invert: "Invertir",
      invertTip:
        "Invierte todo, imágenes incluidas — el modo más oscuro, ideal para documentos escaneados",
    },
    sliders: {
      darkness: "Oscuridad",
      darknessTitle:
        "Qué tan oscura queda la página — arrastra a la izquierda para un fondo más suave y claro",
      warmth: "Calidez",
      warmthTitle:
        "Temperatura de color del fondo — arrastra a la derecha para un tono más cálido",
      warmthTitleLong:
        "Temperatura de color del fondo — arrastra a la derecha para un tono más cálido, más cómodo para los ojos de noche",
    },
    downloader: {
      step1: "1 · Elige tu tema oscuro",
      step2: "2 · Suelta tu PDF — la copia oscura se descarga automáticamente",
      convertingPage: (done, total) =>
        `Convirtiendo página ${done} / ${total}…`,
      building: "Generando tu PDF oscuro…",
      runsLocally: "Funciona completamente en tu navegador — no se sube nada.",
      stayActive:
        "Mantén esta pestaña abierta y activa — cambiar de pestaña o minimizar puede pausar o interrumpir la conversión.",
      saved: (filename) => `${filename} guardado`,
      checkDownloads:
        "Revisa tu carpeta de descargas — el tema oscuro queda incorporado en el archivo.",
      convertAnother: "Convertir otro PDF",
      genericError: "No se pudo convertir ese PDF. ¿Probamos con otro archivo?",
      back: "Volver",
    },
    viewer: {
      settingsAria: "Configuración del lector",
      settingsTitle: "Configuración",
      renderingProgress: (done, total) =>
        `Renderizando ${done} / ${total} páginas`,
      applyingTheme: (themeLabel, cur, total) =>
        `Aplicando ${themeLabel} · ${cur} / ${total}`,
      previousPage: "Página anterior",
      previousPageTitle: "Página anterior (←)",
      nextPage: "Página siguiente",
      nextPageTitle: "Página siguiente (→)",
      jumpToPage: "Ir a la página",
      closeSettings: "Cerrar configuración",
      theme: "Tema",
      waitFirstPass: "Espera a que termine la primera pasada",
      zoom: "Zoom",
      zoomOut: "Alejar",
      zoomOutTitle: "Alejar (−)",
      reset: "Restablecer",
      resetTitle: "Restablecer zoom (0)",
      zoomIn: "Acercar",
      zoomInTitle: "Acercar (+)",
      invertAndDownload: "Invertir y descargar →",
      invertAndDownloadTitle: "Invierte los colores y guarda una copia de este PDF",
      invertHref: "/es/invert-pdf-colors",
      newFile: "Nuevo archivo",
      renderingLoading: (done, total) =>
        `Renderizando página ${done} / ${total}…`,
      readErrorFallback: "No se pudo leer ese PDF. ¿Probamos con otro archivo?",
      pageAlt: (n) => `Página ${n} de tu PDF, en modo oscuro`,
    },
    errors: {
      password:
        "Este PDF está protegido con contraseña. Quita la contraseña (por ejemplo, imprimiéndolo a un PDF nuevo) e inténtalo de nuevo.",
      invalid:
        "Ese archivo no es un PDF legible — puede estar vacío o dañado. Intenta volver a seleccionarlo o descargarlo de nuevo.",
    },
  },
  pt: {
    dropzone: {
      title: "Solte seu PDF aqui ou clique para procurar",
      subtitle: "Sem limite de tamanho · Nunca sai do seu navegador",
      notPdf: "Solte um arquivo PDF, por favor.",
    },
    themePreview: {
      caption: "4 temas — veja as cores antes de soltar um arquivo",
    },
    imageMode: {
      label: "Imagens",
      imagesTitleAttr: "Como fotos, figuras e páginas digitalizadas são tratadas",
      original: "Original",
      originalTip:
        "Fotos, figuras e páginas digitalizadas continuam exatamente como no original — só o texto e o fundo escurecem",
      auto: "Auto",
      autoTip:
        "Recomendado: cada imagem recebe o melhor tratamento — capturas/diagramas brancos são invertidos com a página, fotos mantêm a cor, imagens muito claras são levemente escurecidas",
      invert: "Inverter",
      invertTip:
        "Inverte tudo, incluindo as imagens — o modo mais escuro, ideal para documentos digitalizados",
    },
    sliders: {
      darkness: "Escuridão",
      darknessTitle:
        "Quão escura a página fica — arraste para a esquerda para um fundo mais suave e claro",
      warmth: "Temperatura",
      warmthTitle:
        "Temperatura de cor do fundo — arraste para a direita para um tom mais quente",
      warmthTitleLong:
        "Temperatura de cor do fundo — arraste para a direita para um tom mais quente, mais confortável para os olhos à noite",
    },
    downloader: {
      step1: "1 · Escolha seu tema escuro",
      step2: "2 · Solte seu PDF — a cópia escura baixa automaticamente",
      convertingPage: (done, total) => `Convertendo página ${done} / ${total}…`,
      building: "Gerando seu PDF escuro…",
      runsLocally: "Roda inteiramente no seu navegador — nada é enviado.",
      stayActive:
        "Mantenha esta aba aberta e ativa — trocar de aba ou minimizar pode pausar ou interromper a conversão.",
      saved: (filename) => `${filename} salvo`,
      checkDownloads:
        "Confira sua pasta de downloads — o tema escuro já está gravado no arquivo.",
      convertAnother: "Converter outro PDF",
      genericError: "Não deu para converter esse PDF. Tentar outro arquivo?",
      back: "Voltar",
    },
    viewer: {
      settingsAria: "Configurações do leitor",
      settingsTitle: "Configurações",
      renderingProgress: (done, total) =>
        `Renderizando ${done} / ${total} páginas`,
      applyingTheme: (themeLabel, cur, total) =>
        `Aplicando ${themeLabel} · ${cur} / ${total}`,
      previousPage: "Página anterior",
      previousPageTitle: "Página anterior (←)",
      nextPage: "Próxima página",
      nextPageTitle: "Próxima página (→)",
      jumpToPage: "Ir para a página",
      closeSettings: "Fechar configurações",
      theme: "Tema",
      waitFirstPass: "Espere a primeira passada terminar",
      zoom: "Zoom",
      zoomOut: "Diminuir zoom",
      zoomOutTitle: "Diminuir zoom (−)",
      reset: "Redefinir",
      resetTitle: "Redefinir zoom (0)",
      zoomIn: "Aumentar zoom",
      zoomInTitle: "Aumentar zoom (+)",
      invertAndDownload: "Inverter e baixar →",
      invertAndDownloadTitle: "Inverta as cores e salve uma cópia deste PDF",
      invertHref: "/pt/invert-pdf-colors",
      newFile: "Novo arquivo",
      renderingLoading: (done, total) =>
        `Renderizando página ${done} / ${total}…`,
      readErrorFallback: "Não deu para ler esse PDF. Tentar outro arquivo?",
      pageAlt: (n) => `Página ${n} do seu PDF, em modo escuro`,
    },
    errors: {
      password:
        "Este PDF está protegido por senha. Remova a senha (por exemplo, imprimindo-o em um novo PDF) e tente de novo.",
      invalid:
        "Esse arquivo não é um PDF legível — pode estar vazio ou corrompido. Tente selecioná-lo ou baixá-lo de novo.",
    },
  },
};
