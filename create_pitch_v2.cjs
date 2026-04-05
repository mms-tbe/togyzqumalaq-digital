const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Murat Manassov";
pres.title = "Togyzqumalaq Digital — Pitch Deck";

// ── Design System ──
const C = {
  dark: "0F1923",
  darkCard: "1A2836",
  teal: "42B8B8",
  tealLight: "72DDE0",
  tealBg: "E8F8F8",
  orange: "E67322",
  orangeLight: "F5A623",
  white: "FFFFFF",
  offWhite: "F7F9FC",
  gray: "8899AA",
  text: "2D3748",
  textLight: "718096",
};

// Logo
const logoData = "image/png;base64," + fs.readFileSync(path.join(__dirname, "public", "logo.png")).toString("base64");

// Shadow factory
const shadow = () => ({ type: "outer", blur: 10, offset: 3, angle: 135, color: "000000", opacity: 0.10 });
const shadowDark = () => ({ type: "outer", blur: 12, offset: 4, angle: 135, color: "000000", opacity: 0.25 });

// ════════════════════════════════════════════════
// SLIDE 1 — TITLE (Dark gradient feel)
// ════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  // Decorative teal shapes
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.teal } });
  s.addShape(pres.shapes.OVAL, { x: -2, y: -2, w: 6, h: 6, fill: { color: C.teal, transparency: 92 } });
  s.addShape(pres.shapes.OVAL, { x: 7, y: 3, w: 5, h: 5, fill: { color: C.orange, transparency: 92 } });

  // Logo centered
  s.addImage({ data: logoData, x: 3.75, y: 0.4, w: 2.5, h: 2.5 });

  // Title
  s.addText("TOGYZQUMALAQ", {
    x: 0, y: 3.1, w: 10, h: 0.7,
    fontSize: 42, fontFace: "Georgia", color: C.white, align: "center", bold: true,
    charSpacing: 6, margin: 0,
  });
  s.addText("DIGITAL", {
    x: 0, y: 3.7, w: 10, h: 0.55,
    fontSize: 28, fontFace: "Georgia", color: C.tealLight, align: "center",
    charSpacing: 10, margin: 0,
  });

  // Subtitle
  s.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 4.45, w: 5, h: 0.02, fill: { color: C.teal, transparency: 50 } });
  s.addText("AI-платформа оцифровки турнирных бланков", {
    x: 1, y: 4.55, w: 8, h: 0.4,
    fontSize: 15, fontFace: "Calibri", color: C.gray, align: "center",
  });
  s.addText("Қазақ ұлттық ойыны — цифровая эра", {
    x: 1, y: 4.95, w: 8, h: 0.35,
    fontSize: 12, fontFace: "Calibri", color: C.textLight, align: "center", italic: true,
  });

  // Bottom accent
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.575, w: 10, h: 0.05, fill: { color: C.orange } });
}

// ════════════════════════════════════════════════
// SLIDE 2 — ПРОБЛЕМА
// ════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  // Top bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.dark } });
  s.addText("ПРОБЛЕМА", {
    x: 0.6, y: 0.12, w: 5, h: 0.65,
    fontSize: 30, fontFace: "Georgia", color: C.white, bold: true, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.82, w: 1.8, h: 0.04, fill: { color: C.orange } });

  // Left card — problems
  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.15, w: 5.8, h: 4.1, fill: { color: C.white }, shadow: shadow() });

  s.addText("Потеря турнирных данных", {
    x: 0.7, y: 1.3, w: 5.3, h: 0.35, fontSize: 17, fontFace: "Calibri", bold: true, color: C.dark, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.68, w: 1.2, h: 0.03, fill: { color: C.teal } });

  s.addText([
    { text: "Тысячи партий записываются на бумажных бланках", options: { bullet: true, breakLine: true, fontSize: 13, color: C.text } },
    { text: "Бланки теряются, портятся, выцветают со временем", options: { bullet: true, breakLine: true, fontSize: 13, color: C.text } },
    { text: "Невозможно анализировать и обмениваться партиями", options: { bullet: true, breakLine: true, fontSize: 13, color: C.text } },
  ], { x: 0.7, y: 1.85, w: 5.3, h: 1.3, paraSpaceAfter: 8 });

  s.addText("Нет цифровой инфраструктуры", {
    x: 0.7, y: 3.15, w: 5.3, h: 0.35, fontSize: 17, fontFace: "Calibri", bold: true, color: C.dark, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 3.53, w: 1.2, h: 0.03, fill: { color: C.teal } });

  s.addText([
    { text: "В отличие от шахмат (PGN/FEN с 1990-х), тогызкумалак не имеет стандарта", options: { bullet: true, breakLine: true, fontSize: 13, color: C.text } },
    { text: "Нет платформы для цифровой фиксации турниров", options: { bullet: true, breakLine: true, fontSize: 13, color: C.text } },
    { text: "UNESCO включил тогызкумалак в список нематериального наследия (2020)", options: { bullet: true, fontSize: 13, color: C.text } },
  ], { x: 0.7, y: 3.7, w: 5.3, h: 1.3, paraSpaceAfter: 8 });

  // Right — stat cards
  s.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 1.15, w: 3.2, h: 1.85, fill: { color: C.teal }, shadow: shadowDark() });
  s.addText("50+", { x: 6.5, y: 1.2, w: 3.2, h: 0.9, fontSize: 56, fontFace: "Georgia", bold: true, color: C.white, align: "center", margin: 0 });
  s.addText("стран играют\nв тогызкумалак", { x: 6.5, y: 2.1, w: 3.2, h: 0.7, fontSize: 14, color: C.white, align: "center" });

  s.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 3.25, w: 3.2, h: 1.85, fill: { color: C.orange }, shadow: shadowDark() });
  s.addText("190K+", { x: 6.5, y: 3.3, w: 3.2, h: 0.9, fontSize: 48, fontFace: "Georgia", bold: true, color: C.white, align: "center", margin: 0 });
  s.addText("профессиональных\nигроков в Казахстане", { x: 6.5, y: 4.2, w: 3.2, h: 0.7, fontSize: 14, color: C.white, align: "center" });
}

// ════════════════════════════════════════════════
// SLIDE 3 — РЕШЕНИЕ
// ════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.teal } });
  s.addText("РЕШЕНИЕ", {
    x: 0.6, y: 0.12, w: 5, h: 0.65,
    fontSize: 30, fontFace: "Georgia", color: C.white, bold: true, margin: 0,
  });

  const features = [
    ["AI-OCR", "Автоматическая оцифровка\nрукописных бланков\nчерез DeepSeek OCR", C.teal],
    ["Игровой движок", "Валидация каждого хода\nпо правилам тогызкумалак\nв реальном времени", C.teal],
    ["FEN & PGN", "Стандартный формат записи\n(совместим с playstrategy.org)\nдля анализа партий", C.teal],
    ["Доска", "Интерактивная визуализация\nс камнями, туздыком\nи навигацией по ходам", C.orange],
    ["Экспорт", "JSON / FEN / PGN\nдля обмена партиями\nи архивирования", C.orange],
    ["Ручной ввод", "Форма на 80 ходов\nс нотацией 76, 47X\nи валидацией", C.orange],
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.4 + col * 3.15;
    const y = 1.15 + row * 2.15;

    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.95, h: 1.95, fill: { color: C.white }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.95, h: 0.06, fill: { color: f[2] } });

    s.addText(f[0], { x: x + 0.2, y: y + 0.2, w: 2.5, h: 0.35, fontSize: 17, fontFace: "Georgia", bold: true, color: C.dark, margin: 0 });
    s.addText(f[1], { x: x + 0.2, y: y + 0.65, w: 2.5, h: 1.1, fontSize: 12, color: C.textLight, margin: 0 });
  });
}

// ════════════════════════════════════════════════
// SLIDE 4 — ДЕМО
// ════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.teal } });
  s.addText("ДЕМОНСТРАЦИЯ", {
    x: 0, y: 0.3, w: 10, h: 0.6,
    fontSize: 30, fontFace: "Georgia", color: C.white, bold: true, align: "center", margin: 0,
  });

  // Flow
  const steps = [
    { num: "1", label: "Загрузка\nбланка", color: C.teal },
    { num: "2", label: "AI-OCR\nраспознавание", color: C.teal },
    { num: "3", label: "Распознанные\nходы (76, 47X)", color: C.tealLight },
    { num: "4", label: "Интерактивная\nдоска + FEN/PGN", color: C.orange },
  ];

  steps.forEach((st, i) => {
    const x = 0.5 + i * 2.35;
    s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: 1.2, w: 1.0, h: 1.0, fill: { color: st.color }, shadow: shadowDark() });
    s.addText(st.num, { x: x + 0.35, y: 1.25, w: 1.0, h: 0.9, fontSize: 30, fontFace: "Georgia", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    s.addText(st.label, { x: x, y: 2.35, w: 1.7, h: 0.7, fontSize: 12, color: C.gray, align: "center", bold: true });
    if (i < 3) {
      s.addText("→", { x: x + 1.7, y: 1.3, w: 0.6, h: 0.8, fontSize: 28, color: C.gray, align: "center", valign: "middle" });
    }
  });

  // Product URL card
  s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 3.3, w: 7, h: 1.3, fill: { color: C.darkCard }, shadow: shadowDark() });
  s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 3.3, w: 0.06, h: 1.3, fill: { color: C.teal } });

  s.addText("Попробуйте прямо сейчас", {
    x: 1.8, y: 3.4, w: 6.4, h: 0.4, fontSize: 14, color: C.gray, margin: 0,
  });
  s.addText("togyzqumalaq-digital-tau.vercel.app", {
    x: 1.8, y: 3.8, w: 6.4, h: 0.5, fontSize: 20, fontFace: "Calibri", bold: true, color: C.tealLight, margin: 0,
  });

  // Features bar
  s.addText("Доска playstrategy.org  •  FEN/PGN панель  •  Архив партий  •  OCR бланков  •  Экспорт", {
    x: 0.5, y: 4.9, w: 9, h: 0.35, fontSize: 12, color: C.gray, align: "center",
  });
}

// ════════════════════════════════════════════════
// SLIDE 5 — РЫНОК
// ════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.dark } });
  s.addText("РЫНОК И ВОЗМОЖНОСТИ", {
    x: 0.6, y: 0.12, w: 8, h: 0.65,
    fontSize: 30, fontFace: "Georgia", color: C.white, bold: true, margin: 0,
  });

  // TAM/SAM/SOM cards
  const markets = [
    { label: "TAM", value: "$2.5B", desc: "Глобальный рынок\nоцифровки интеллектуальных игр\n(шахматы, го, манкала)", color: C.teal, x: 0.4, w: 3.0 },
    { label: "SAM", value: "$50M", desc: "Тогызкумалак + манкала\n50+ стран\nсотни тысяч игроков", color: "2A8A8E", x: 3.6, w: 2.8 },
    { label: "SOM", value: "$5M", desc: "Казахстан + СНГ\n+ Центральная Азия\nфокус на первые 2 года", color: C.orange, x: 6.6, w: 3.0 },
  ];

  markets.forEach(m => {
    s.addShape(pres.shapes.RECTANGLE, { x: m.x, y: 1.15, w: m.w, h: 2.8, fill: { color: C.white }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: m.x, y: 1.15, w: m.w, h: 0.06, fill: { color: m.color } });

    s.addText(m.label, { x: m.x, y: 1.35, w: m.w, h: 0.3, fontSize: 14, bold: true, color: m.color, align: "center", margin: 0 });
    s.addText(m.value, { x: m.x, y: 1.7, w: m.w, h: 0.7, fontSize: 40, fontFace: "Georgia", bold: true, color: m.color, align: "center", margin: 0 });
    s.addText(m.desc, { x: m.x + 0.2, y: 2.5, w: m.w - 0.4, h: 1.2, fontSize: 12, color: C.textLight, align: "center" });
  });

  // Bottom facts
  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 4.2, w: 9.2, h: 1.1, fill: { color: C.white }, shadow: shadow() });
  s.addText([
    { text: "Тренды роста:", options: { bold: true, fontSize: 14, color: C.dark, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "Южная Корея создала федерацию тогызкумалак (2025)", options: { bullet: true, fontSize: 12, color: C.text, breakLine: true } },
    { text: "lichess.org — 150M партий, chess.com — $100M+ годовая выручка", options: { bullet: true, fontSize: 12, color: C.text, breakLine: true } },
    { text: "UNESCO включил тогызкумалак в список нематериального наследия (2020)", options: { bullet: true, fontSize: 12, color: C.text } },
  ], { x: 0.7, y: 4.3, w: 8.6, h: 0.9 });
}

// ════════════════════════════════════════════════
// SLIDE 6 — БИЗНЕС-МОДЕЛЬ
// ════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.teal } });
  s.addText("БИЗНЕС-МОДЕЛЬ", {
    x: 0.6, y: 0.12, w: 5, h: 0.65,
    fontSize: 30, fontFace: "Georgia", color: C.white, bold: true, margin: 0,
  });

  const models = [
    { title: "Freemium SaaS", desc: "Бесплатно: 5 бланков/мес\nPro: $4.99/мес — безлимит", icon: "FREE", color: C.teal },
    { title: "B2B Лицензии", desc: "Для федераций и турнирных\nорганизаторов", icon: "B2B", color: C.teal },
    { title: "OCR API", desc: "Монетизация API для\nсторонних разработчиков", icon: "API", color: C.orange },
    { title: "AI-Аналитика", desc: "Премиум анализ партий\nс рекомендациями ходов", icon: "AI", color: C.orange },
  ];

  models.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.8;
    const y = 1.15 + row * 1.75;

    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.5, h: 1.5, fill: { color: C.white }, shadow: shadow() });

    // Icon circle
    s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.25, w: 1.0, h: 1.0, fill: { color: m.color } });
    s.addText(m.icon, { x: x + 0.2, y: y + 0.3, w: 1.0, h: 0.9, fontSize: 14, fontFace: "Georgia", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });

    s.addText(m.title, { x: x + 1.4, y: y + 0.2, w: 2.9, h: 0.35, fontSize: 16, bold: true, color: C.dark, margin: 0 });
    s.addText(m.desc, { x: x + 1.4, y: y + 0.6, w: 2.9, h: 0.7, fontSize: 12, color: C.textLight, margin: 0 });
  });

  // Revenue bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 4.85, w: 9.2, h: 0.6, fill: { color: C.dark } });

  const rev = [
    { label: "Year 1", val: "$30K", x: 1.5 },
    { label: "Year 2", val: "$150K", x: 4.2 },
    { label: "Year 3", val: "$500K", x: 6.9 },
  ];
  rev.forEach(r => {
    s.addText(r.label, { x: r.x, y: 4.85, w: 1.5, h: 0.3, fontSize: 11, color: C.gray, align: "center" });
    s.addText(r.val, { x: r.x, y: 5.1, w: 1.5, h: 0.3, fontSize: 18, fontFace: "Georgia", bold: true, color: C.tealLight, align: "center", margin: 0 });
  });
}

// ════════════════════════════════════════════════
// SLIDE 7 — ТЕХНОЛОГИИ
// ════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.teal } });
  s.addText("ТЕХНОЛОГИИ", {
    x: 0, y: 0.25, w: 10, h: 0.6,
    fontSize: 30, fontFace: "Georgia", color: C.white, bold: true, align: "center", margin: 0,
  });

  const techs = [
    { title: "AI / OCR", desc: "DeepSeek OCR\n+ AlemLLM", color: C.teal },
    { title: "Frontend", desc: "Next.js 16\n+ Mantine UI 9", color: C.tealLight },
    { title: "Backend", desc: "Supabase\nPostgreSQL, Auth", color: C.teal },
    { title: "Deploy", desc: "Vercel\nEdge Network", color: C.tealLight },
    { title: "Engine", desc: "Pure TypeScript\nПолные правила", color: C.orange },
    { title: "Git", desc: "GitLab alem.plus\n+ GitHub", color: C.orangeLight },
  ];

  techs.forEach((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.15;
    const y = 1.1 + row * 1.85;

    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.85, h: 1.55, fill: { color: C.darkCard }, shadow: shadowDark() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.55, fill: { color: t.color } });

    s.addText(t.title, { x: x + 0.25, y: y + 0.15, w: 2.4, h: 0.35, fontSize: 16, fontFace: "Georgia", bold: true, color: t.color, margin: 0 });
    s.addText(t.desc, { x: x + 0.25, y: y + 0.6, w: 2.4, h: 0.7, fontSize: 13, color: C.gray });
  });

  // alem.plus badge
  s.addShape(pres.shapes.RECTANGLE, { x: 2, y: 5.0, w: 6, h: 0.45, fill: { color: C.orange } });
  s.addText("4 инструмента alem.plus:  DeepSeek OCR  •  AlemLLM  •  Supabase  •  GitLab", {
    x: 2, y: 5.0, w: 6, h: 0.45, fontSize: 13, bold: true, color: C.white, align: "center",
  });
}

// ════════════════════════════════════════════════
// SLIDE 8 — ROADMAP
// ════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.dark } });
  s.addText("ПЛАНЫ РАЗВИТИЯ", {
    x: 0.6, y: 0.12, w: 8, h: 0.65,
    fontSize: 30, fontFace: "Georgia", color: C.white, bold: true, margin: 0,
  });

  const timeline = [
    { period: "Q2 2026", title: "Fine-tune OCR", desc: "Дообучение модели\nна 22,587 реальных\nбланках", color: C.teal },
    { period: "Q3 2026", title: "Мобильное приложение", desc: "React Native\niOS + Android", color: C.teal },
    { period: "Q4 2026", title: "AI-анализ", desc: "Оценка позиций\nрекомендации ходов", color: C.teal },
    { period: "2027", title: "API + Интеграции", desc: "playstrategy.org\nФедерации", color: C.orange },
    { period: "2027+", title: "Все манкала-игры", desc: "Oware, Kalah,\nBao, Mangala", color: C.orange },
  ];

  // Timeline line
  s.addShape(pres.shapes.LINE, { x: 0.8, y: 2.8, w: 8.4, h: 0, line: { color: C.teal, width: 3 } });

  timeline.forEach((t, i) => {
    const x = 0.6 + i * 1.85;

    // Dot
    s.addShape(pres.shapes.OVAL, { x: x + 0.4, y: 2.55, w: 0.5, h: 0.5, fill: { color: t.color }, shadow: shadowDark() });

    // Period above
    s.addText(t.period, { x, y: 1.5, w: 1.5, h: 0.35, fontSize: 13, bold: true, color: t.color, align: "center" });
    s.addText(t.title, { x: x - 0.15, y: 1.85, w: 1.6, h: 0.5, fontSize: 12, bold: true, color: C.dark, align: "center" });

    // Description below
    s.addShape(pres.shapes.RECTANGLE, { x: x - 0.1, y: 3.3, w: 1.5, h: 1.2, fill: { color: C.white }, shadow: shadow() });
    s.addText(t.desc, { x: x, y: 3.4, w: 1.3, h: 1.0, fontSize: 11, color: C.textLight, align: "center" });
  });

  // Languages
  s.addText("қазақша  •  русский  •  English  •  Türkçe  •  монгол", {
    x: 0.5, y: 4.8, w: 9, h: 0.4, fontSize: 13, color: C.gray, align: "center", italic: true,
  });
}

// ════════════════════════════════════════════════
// SLIDE 9 — КОМАНДА
// ════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addShape(pres.shapes.OVAL, { x: -3, y: -3, w: 8, h: 8, fill: { color: C.teal, transparency: 93 } });
  s.addShape(pres.shapes.OVAL, { x: 6, y: 2, w: 7, h: 7, fill: { color: C.orange, transparency: 93 } });

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.teal } });

  s.addText("КОМАНДА", {
    x: 0, y: 0.4, w: 10, h: 0.55,
    fontSize: 28, fontFace: "Georgia", color: C.white, bold: true, align: "center", margin: 0,
  });

  // Logo
  s.addImage({ data: logoData, x: 4.0, y: 1.2, w: 2.0, h: 2.0 });

  // Name card
  s.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 3.4, w: 5, h: 1.5, fill: { color: C.darkCard }, shadow: shadowDark() });
  s.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 3.4, w: 5, h: 0.06, fill: { color: C.teal } });

  s.addText("Murat Manassov", {
    x: 2.5, y: 3.6, w: 5, h: 0.45, fontSize: 22, fontFace: "Georgia", bold: true, color: C.white, align: "center", margin: 0,
  });
  s.addText("AI / Backend / Product Development", {
    x: 2.5, y: 4.05, w: 5, h: 0.35, fontSize: 13, color: C.tealLight, align: "center",
  });
  s.addText("Powered by alem.plus", {
    x: 2.5, y: 4.45, w: 5, h: 0.3, fontSize: 14, bold: true, color: C.orange, align: "center",
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.575, w: 10, h: 0.05, fill: { color: C.orange } });
}

// ════════════════════════════════════════════════
// SLIDE 10 — КОНТАКТЫ
// ════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.orange } });

  s.addImage({ data: logoData, x: 4.2, y: 0.4, w: 1.6, h: 1.6 });

  s.addText("TOGYZQUMALAQ DIGITAL", {
    x: 0, y: 2.1, w: 10, h: 0.55,
    fontSize: 26, fontFace: "Georgia", color: C.white, bold: true, align: "center", charSpacing: 4, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 2.7, w: 3, h: 0.02, fill: { color: C.teal, transparency: 50 } });

  s.addText("Қазақ ұлттық ойыны — цифровая эра", {
    x: 1, y: 2.8, w: 8, h: 0.35,
    fontSize: 13, color: C.gray, align: "center", italic: true,
  });

  // Contact cards
  const links = [
    { label: "Продукт", value: "togyzqumalaq-digital-tau.vercel.app", color: C.teal },
    { label: "GitHub", value: "github.com/mms-tbe/togyzqumalaq-digital", color: C.tealLight },
    { label: "Email", value: "mms.tbe@gmail.com", color: C.orange },
  ];

  links.forEach((l, i) => {
    const y = 3.4 + i * 0.6;
    s.addShape(pres.shapes.RECTANGLE, { x: 2, y, w: 6, h: 0.48, fill: { color: C.darkCard } });
    s.addShape(pres.shapes.RECTANGLE, { x: 2, y, w: 0.06, h: 0.48, fill: { color: l.color } });
    s.addText(l.label, { x: 2.2, y, w: 1.5, h: 0.48, fontSize: 13, bold: true, color: l.color, valign: "middle" });
    s.addText(l.value, { x: 3.8, y, w: 4, h: 0.48, fontSize: 13, color: C.white, valign: "middle" });
  });

  // Bottom
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.575, w: 10, h: 0.05, fill: { color: C.teal } });
  s.addText("Decentrathon 2026 — alem.plus Track", {
    x: 0, y: 5.2, w: 10, h: 0.3, fontSize: 11, color: C.gray, align: "center",
  });
}

// Save
const outPath = path.join(__dirname, "pitch_deck.pptx");
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Pitch deck v2 created:", outPath);
});
