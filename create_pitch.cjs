const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Murat Manassov";
pres.title = "Togyzqumalaq Digital — Pitch Deck";

// Colors
const TEAL = "42B8B8";
const TEAL_LIGHT = "72DDE0";
const DARK = "1E1E1E";
const DARK_SUB = "444444";
const ORANGE = "E67322";
const WHITE = "FFFFFF";
const LIGHT_BG = "F5F7FA";
const CARD_BG = "FFFFFF";

// Logo as base64
const logoPath = path.join(__dirname, "public", "logo.png");
const logoBase64 = "image/png;base64," + fs.readFileSync(logoPath).toString("base64");

// Helper: factory functions to avoid object mutation
const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.12 });

// ═══════════════════════════════════════════
// SLIDE 1 — Title
// ═══════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: DARK };

  // Teal accent bar top
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: TEAL } });

  // Logo
  s.addImage({ data: logoBase64, x: 3.7, y: 0.6, w: 2.6, h: 2.6 });

  // Title
  s.addText("TOGYZQUMALAQ DIGITAL", {
    x: 0.5, y: 3.3, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Arial Black", color: WHITE, align: "center",
    charSpacing: 4, margin: 0,
  });

  // Subtitle
  s.addText("AI-платформа оцифровки турнирных бланков тогызкумалак", {
    x: 1, y: 4.0, w: 8, h: 0.5,
    fontSize: 16, fontFace: "Calibri", color: TEAL_LIGHT, align: "center",
  });

  // Tagline
  s.addText("Қазақ ұлттық ойыны — цифровая эра", {
    x: 1, y: 4.55, w: 8, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: DARK_SUB, italic: true, align: "center",
  });

  // Bottom bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: ORANGE } });
}

// ═══════════════════════════════════════════
// SLIDE 2 — Проблема
// ═══════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };

  // Header bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: DARK } });
  s.addText("ПРОБЛЕМА", {
    x: 0.7, y: 0.15, w: 8, h: 0.7,
    fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0,
  });

  // Left column — problems
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.3, w: 5.5, h: 3.8, fill: { color: LIGHT_BG }, shadow: makeShadow() });

  s.addText([
    { text: "Потеря турнирных данных", options: { bold: true, fontSize: 16, color: DARK, breakLine: true } },
    { text: "", options: { fontSize: 8, breakLine: true } },
    { text: "Тысячи партий записываются на бумажных бланках", options: { bullet: true, fontSize: 13, color: DARK_SUB, breakLine: true } },
    { text: "Бланки теряются, портятся, выцветают", options: { bullet: true, fontSize: 13, color: DARK_SUB, breakLine: true } },
    { text: "Невозможно анализировать и обмениваться партиями", options: { bullet: true, fontSize: 13, color: DARK_SUB, breakLine: true } },
    { text: "", options: { fontSize: 8, breakLine: true } },
    { text: "Отсутствие цифровой инфраструктуры", options: { bold: true, fontSize: 16, color: DARK, breakLine: true } },
    { text: "", options: { fontSize: 8, breakLine: true } },
    { text: "Нет единого стандарта хранения партий (в отличие от шахмат — PGN/FEN с 1990-х)", options: { bullet: true, fontSize: 13, color: DARK_SUB, breakLine: true } },
    { text: "Нет платформы для цифровой фиксации турнирных результатов", options: { bullet: true, fontSize: 13, color: DARK_SUB, breakLine: true } },
  ], { x: 0.8, y: 1.5, w: 5.0, h: 3.4 });

  // Right column — stats
  s.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 1.3, w: 3.3, h: 1.6, fill: { color: TEAL }, shadow: makeShadow() });
  s.addText("50+", { x: 6.3, y: 1.35, w: 3.3, h: 0.8, fontSize: 48, fontFace: "Arial Black", color: WHITE, align: "center", margin: 0 });
  s.addText("стран играют\nв тогызкумалак", { x: 6.3, y: 2.1, w: 3.3, h: 0.7, fontSize: 13, color: WHITE, align: "center" });

  s.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 3.15, w: 3.3, h: 1.6, fill: { color: ORANGE }, shadow: makeShadow() });
  s.addText("200+", { x: 6.3, y: 3.2, w: 3.3, h: 0.8, fontSize: 48, fontFace: "Arial Black", color: WHITE, align: "center", margin: 0 });
  s.addText("игроков на чемпионатах\nмира из 25+ стран", { x: 6.3, y: 3.95, w: 3.3, h: 0.7, fontSize: 13, color: WHITE, align: "center" });
}

// ═══════════════════════════════════════════
// SLIDE 3 — Решение
// ═══════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: TEAL } });
  s.addText("РЕШЕНИЕ", {
    x: 0.7, y: 0.15, w: 8, h: 0.7,
    fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0,
  });

  const features = [
    ["AI-OCR распознавание", "Автоматическая оцифровка рукописных турнирных бланков через DeepSeek OCR"],
    ["Игровой движок", "Валидация каждого хода по правилам тогызкумалак в реальном времени"],
    ["FEN & PGN нотация", "Стандартизированный формат записи позиций (совместим с playstrategy.org)"],
    ["Интерактивная доска", "Визуализация партии с навигацией, камнями и туздыком"],
    ["Экспорт", "JSON / FEN / PGN — для анализа, обмена и архивирования"],
    ["Ручной ввод", "Полная форма на 80 ходов с редактированием нотации"],
  ];

  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.7;
    const y = 1.25 + row * 1.4;

    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.4, h: 1.2, fill: { color: LIGHT_BG }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h: 1.2, fill: { color: TEAL } });

    s.addText(f[0], { x: x + 0.25, y: y + 0.1, w: 4.0, h: 0.4, fontSize: 15, fontFace: "Calibri", bold: true, color: DARK, margin: 0 });
    s.addText(f[1], { x: x + 0.25, y: y + 0.5, w: 4.0, h: 0.55, fontSize: 12, color: DARK_SUB, margin: 0 });
  });
}

// ═══════════════════════════════════════════
// SLIDE 4 — Демонстрация
// ═══════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: DARK } });
  s.addText("ДЕМОНСТРАЦИЯ ПРОДУКТА", {
    x: 0.7, y: 0.15, w: 8, h: 0.7,
    fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0,
  });

  // Flow steps
  const steps = [
    ["1", "Загрузка\nбланка"],
    ["2", "AI-OCR\nобработка"],
    ["3", "Распознанные\nходы"],
    ["4", "Доска +\nпартия"],
  ];
  steps.forEach((st, i) => {
    const x = 0.5 + i * 2.4;
    s.addShape(pres.shapes.OVAL, { x: x + 0.55, y: 1.3, w: 0.8, h: 0.8, fill: { color: i < 2 ? TEAL : ORANGE } });
    s.addText(st[0], { x: x + 0.55, y: 1.35, w: 0.8, h: 0.7, fontSize: 24, fontFace: "Arial Black", color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(st[1], { x: x, y: 2.2, w: 1.9, h: 0.7, fontSize: 13, color: DARK, align: "center", bold: true });
    if (i < 3) {
      s.addText("→", { x: x + 1.9, y: 1.35, w: 0.5, h: 0.7, fontSize: 24, color: DARK_SUB, align: "center", valign: "middle" });
    }
  });

  // URL
  s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 3.3, w: 7, h: 1.0, fill: { color: LIGHT_BG }, shadow: makeShadow() });
  s.addText([
    { text: "Попробуйте сейчас:", options: { fontSize: 14, color: DARK_SUB, breakLine: true } },
    { text: "https://togyzqumalaq-digital-tau.vercel.app", options: { fontSize: 16, bold: true, color: TEAL, breakLine: true } },
  ], { x: 1.8, y: 3.4, w: 6.5, h: 0.8, align: "center" });

  // Key features
  s.addText([
    { text: "Интерактивная доска playstrategy.org  •  FEN/PGN панель  •  Архив партий  •  OCR бланков", options: { fontSize: 12, color: DARK_SUB } },
  ], { x: 0.5, y: 4.6, w: 9, h: 0.5, align: "center" });
}

// ═══════════════════════════════════════════
// SLIDE 5 — Рынок
// ═══════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: TEAL } });
  s.addText("РЫНОК И ВОЗМОЖНОСТИ", {
    x: 0.7, y: 0.15, w: 8, h: 0.7,
    fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0,
  });

  // TAM / SAM / SOM circles
  const markets = [
    { label: "TAM", value: "$2.5B", desc: "Глобальный рынок\nоцифровки интеллектуальных\nигр", color: TEAL, x: 1.0, size: 2.8 },
    { label: "SAM", value: "$50M", desc: "Тогызкумалак +\nманкала-семейство\n50+ стран", color: "2A8A8E", x: 4.0, size: 2.2 },
    { label: "SOM", value: "$5M", desc: "Казахстан + СНГ\nпервые 2 года", color: ORANGE, x: 6.5, size: 1.6 },
  ];

  markets.forEach((m) => {
    s.addShape(pres.shapes.OVAL, { x: m.x, y: 1.3, w: m.size, h: m.size, fill: { color: m.color, transparency: 15 } });
    s.addText(m.label, { x: m.x, y: 1.3 + m.size * 0.15, w: m.size, h: 0.4, fontSize: 14, bold: true, color: m.color, align: "center", margin: 0 });
    s.addText(m.value, { x: m.x, y: 1.3 + m.size * 0.3, w: m.size, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: m.color, align: "center", margin: 0 });
    s.addText(m.desc, { x: m.x, y: 1.3 + m.size * 0.55, w: m.size, h: 0.8, fontSize: 10, color: DARK_SUB, align: "center" });
  });

  // Bottom facts
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.3, w: 9, h: 1.0, fill: { color: LIGHT_BG } });
  s.addText([
    { text: "Южная Корея создала федерацию тогызкумалак (2025)  ", options: { fontSize: 12, color: DARK, bold: true } },
    { text: "•  lichess.org: 150M партий  •  chess.com: $100M+ выручка", options: { fontSize: 12, color: DARK_SUB } },
  ], { x: 0.8, y: 4.45, w: 8.5, h: 0.6, align: "center" });
}

// ═══════════════════════════════════════════
// SLIDE 6 — Бизнес-модель
// ═══════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: DARK } });
  s.addText("БИЗНЕС-МОДЕЛЬ", {
    x: 0.7, y: 0.15, w: 8, h: 0.7,
    fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0,
  });

  const models = [
    ["Freemium SaaS", "Бесплатно: 5 бланков/мес\nPro: $4.99/мес — безлимитный OCR"],
    ["B2B Лицензии", "Для федераций и турнирных\nорганизаторов"],
    ["API", "Монетизация OCR API\nдля разработчиков"],
    ["AI-Аналитика", "Премиум-анализ партий\nс рекомендациями"],
  ];

  models.forEach((m, i) => {
    const x = 0.5 + (i % 2) * 4.7;
    const y = 1.25 + Math.floor(i / 2) * 1.7;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.4, h: 1.4, fill: { color: CARD_BG }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.4, h: 0.06, fill: { color: i < 2 ? TEAL : ORANGE } });
    s.addText(m[0], { x: x + 0.3, y: y + 0.15, w: 3.8, h: 0.4, fontSize: 16, bold: true, color: DARK, margin: 0 });
    s.addText(m[1], { x: x + 0.3, y: y + 0.6, w: 3.8, h: 0.7, fontSize: 13, color: DARK_SUB, margin: 0 });
  });

  // Revenue
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.7, w: 9, h: 0.7, fill: { color: TEAL } });
  s.addText("Прогноз:  Year 1 — $30K   |   Year 2 — $150K   |   Year 3 — $500K", {
    x: 0.5, y: 4.72, w: 9, h: 0.65, fontSize: 16, bold: true, color: WHITE, align: "center",
  });
}

// ═══════════════════════════════════════════
// SLIDE 7 — Технологии
// ═══════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: TEAL } });
  s.addText("ТЕХНОЛОГИИ", {
    x: 0.7, y: 0.15, w: 8, h: 0.7,
    fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0,
  });

  const techs = [
    ["AI / OCR", "DeepSeek OCR + AlemLLM\n(alem.plus)"],
    ["Frontend", "Next.js 16 + Mantine UI 9\nTurbopack"],
    ["Backend", "Supabase (alem.plus)\nPostgreSQL, Auth"],
    ["Deploy", "Vercel\nAuto-deploy, Edge"],
    ["Game Engine", "Pure TypeScript\nПолные правила тогызкумалак"],
    ["Репозиторий", "GitLab (alem.plus)\n+ GitHub"],
  ];

  techs.forEach((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.1;
    const y = 1.25 + row * 1.9;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.8, h: 1.6, fill: { color: LIGHT_BG }, shadow: makeShadow() });
    s.addText(t[0], { x, y: y + 0.15, w: 2.8, h: 0.4, fontSize: 15, bold: true, color: TEAL, align: "center", margin: 0 });
    s.addText(t[1], { x, y: y + 0.6, w: 2.8, h: 0.8, fontSize: 12, color: DARK_SUB, align: "center" });
  });

  // alem.plus badge
  s.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 5.0, w: 5, h: 0.45, fill: { color: ORANGE } });
  s.addText("4 инструмента alem.plus: DeepSeek OCR • AlemLLM • Supabase • GitLab", {
    x: 2.5, y: 5.0, w: 5, h: 0.45, fontSize: 12, bold: true, color: WHITE, align: "center",
  });
}

// ═══════════════════════════════════════════
// SLIDE 8 — Планы развития
// ═══════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: DARK } });
  s.addText("ПЛАНЫ РАЗВИТИЯ", {
    x: 0.7, y: 0.15, w: 8, h: 0.7,
    fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0,
  });

  const timeline = [
    ["Q2 2026", "Fine-tune OCR на 22,587\nреальных бланках", TEAL],
    ["Q3 2026", "Мобильное приложение\n(React Native)", TEAL],
    ["Q4 2026", "AI-анализ партий\n(оценка позиций)", TEAL],
    ["2027", "API для федераций\n+ playstrategy.org", ORANGE],
    ["2027+", "Платформа для всех\nманкала-игр", ORANGE],
  ];

  // Horizontal line
  s.addShape(pres.shapes.LINE, { x: 1, y: 2.6, w: 8, h: 0, line: { color: DARK_SUB, width: 2 } });

  timeline.forEach((t, i) => {
    const x = 0.6 + i * 1.85;
    // Dot on line
    s.addShape(pres.shapes.OVAL, { x: x + 0.5, y: 2.4, w: 0.4, h: 0.4, fill: { color: t[2] } });
    // Label above
    s.addText(t[0], { x, y: 1.7, w: 1.6, h: 0.5, fontSize: 14, bold: true, color: t[2], align: "center" });
    // Description below
    s.addText(t[1], { x: x - 0.1, y: 3.0, w: 1.8, h: 0.9, fontSize: 11, color: DARK_SUB, align: "center" });
  });

  // Languages
  s.addText("Мультиязычность: қазақша • русский • English • Türkçe • монгол", {
    x: 0.5, y: 4.5, w: 9, h: 0.4, fontSize: 13, color: DARK_SUB, align: "center", italic: true,
  });
}

// ═══════════════════════════════════════════
// SLIDE 9 — Команда
// ═══════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: DARK };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: TEAL } });

  s.addText("КОМАНДА", {
    x: 0.5, y: 0.5, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Arial Black", color: WHITE, align: "center", margin: 0,
  });

  s.addImage({ data: logoBase64, x: 4.0, y: 1.5, w: 2.0, h: 2.0 });

  s.addText("Murat Manassov", {
    x: 1, y: 3.6, w: 8, h: 0.5, fontSize: 22, bold: true, color: WHITE, align: "center",
  });
  s.addText("AI / Backend / Product", {
    x: 1, y: 4.1, w: 8, h: 0.4, fontSize: 14, color: TEAL_LIGHT, align: "center",
  });

  s.addText("Powered by alem.plus", {
    x: 1, y: 4.8, w: 8, h: 0.4, fontSize: 16, bold: true, color: ORANGE, align: "center",
  });
}

// ═══════════════════════════════════════════
// SLIDE 10 — Контакты
// ═══════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: DARK };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: ORANGE } });

  s.addImage({ data: logoBase64, x: 4.2, y: 0.5, w: 1.6, h: 1.6 });

  s.addText("TOGYZQUMALAQ DIGITAL", {
    x: 0.5, y: 2.2, w: 9, h: 0.6,
    fontSize: 28, fontFace: "Arial Black", color: WHITE, align: "center", charSpacing: 3, margin: 0,
  });

  s.addText("Қазақ ұлттық ойыны — цифровая эра", {
    x: 1, y: 2.85, w: 8, h: 0.35,
    fontSize: 13, color: TEAL_LIGHT, align: "center", italic: true,
  });

  // Links
  const links = [
    ["Продукт", "https://togyzqumalaq-digital-tau.vercel.app"],
    ["GitHub", "https://github.com/mms-tbe/togyzqumalaq-digital"],
    ["Email", "mms.tbe@gmail.com"],
  ];

  links.forEach((l, i) => {
    const y = 3.6 + i * 0.55;
    s.addText(l[0] + ":", { x: 2.0, y, w: 1.8, h: 0.4, fontSize: 14, bold: true, color: TEAL_LIGHT, align: "right" });
    s.addText(l[1], { x: 4.0, y, w: 4.5, h: 0.4, fontSize: 14, color: WHITE });
  });

  // Bottom
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: TEAL } });
}

// ═══════════════════════════════════════════
// Save
// ═══════════════════════════════════════════
const outPath = path.join(__dirname, "pitch_deck.pptx");
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Pitch deck created:", outPath);
}).catch((err) => {
  console.error("Error:", err);
});
