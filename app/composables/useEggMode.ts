const isActive = ref(false);
const STYLE_ID = "egg-mode-styles";
const TEXT_ATTR = "data-egg-text";
const CARD_ATTR = "data-egg-card";
const IMG_ATTR  = "data-egg-img";

// ─── Pools ────────────────────────────────────────────────────────────────────

const BG_PATTERNS = [
  // Images
  "url(/images/geocities-backgrounds/compact_disc.jpg)",
  "url(/images/geocities-backgrounds/lego.jpg)",
  "url(/images/geocities-backgrounds/oil_field.jpg)",
  "url(/images/geocities-backgrounds/roses_01.gif)",
  "url(/images/geocities-backgrounds/roses_02.gif)",
  "url(/images/geocities-backgrounds/space_twinkle.gif)",
  "url(/images/geocities-backgrounds/toilet_paper.jpg)",
  // Solids
  "#ff00ff",
  "#000080",
  "#00008b",
  "#4b0082",
  "#800000",
  "#006400",
  // Gradients
  "linear-gradient(135deg, #ff00ff, #000080)",
  "linear-gradient(135deg, #ff6600, #ff0099, #cc00ff)",
  "linear-gradient(135deg, #00ff99, #000080, #ff00ff)",
  "linear-gradient(180deg, #000000, #003300)",
  "linear-gradient(180deg, #1a0033, #ff00ff)",
  "repeating-linear-gradient(45deg, #000 0 10px, #ff00ff 10px 20px)",
  "repeating-linear-gradient(45deg, #000080 0 10px, #00ffff 10px 20px)",
  "repeating-linear-gradient(90deg, #ff0000 0 8px, #ff6600 8px 16px, #ffff00 16px 24px, #00ff00 24px 32px, #0000ff 32px 40px, #8b00ff 40px 48px)",
  "radial-gradient(ellipse at center, #000080, #000000)",
  "radial-gradient(ellipse at top, #ff00ff, #000000)",
  "radial-gradient(ellipse at center, #4b0082 0%, #000000 70%)",
];

const SOLIDS = [
  "#ff00ff", "#00ffff", "#ffff00", "#ff6600",
  "#00ff66", "#ff0066", "#ff3300", "#cc00ff",
  "#00ff99", "#ffcc00", "#00ccff", "#ff0099",
];

const TEXT_FILLS = [
  ...SOLIDS,
  "linear-gradient(90deg, #ff00ff, #00ffff)",
  "linear-gradient(90deg, #ffff00, #ff6600)",
  "linear-gradient(90deg, #00ff99, #00ccff)",
  "linear-gradient(90deg, #ff0066, #cc00ff)",
  "linear-gradient(135deg, #ff3300, #ffff00, #00ff66)",
  "linear-gradient(135deg, #ff00ff, #ff6600, #ffff00)",
  "linear-gradient(135deg, #00ffff, #cc00ff, #ff0099)",
  "linear-gradient(90deg, #ff0099, #ff6600, #ffff00, #00ff99, #00ccff, #cc00ff)",
  "repeating-linear-gradient(90deg, #ff00ff 0 6px, #ffff00 6px 12px)",
  "repeating-linear-gradient(90deg, #00ffff 0 4px, #ff6600 4px 8px, #00ff66 8px 12px)",
  "repeating-linear-gradient(45deg, #ff0066 0 5px, #00ccff 5px 10px)",
  "radial-gradient(circle, #ffff00, #ff00ff)",
  "radial-gradient(circle, #00ffff, #ff0066)",
  "radial-gradient(circle, #00ff99 20%, #ff6600 80%)",
];


const CURSORS = ["crosshair", "cell", "zoom-in", "not-allowed", "grab", "help"];

const FONTS = [
  '"Comic Sans MS", "Comic Sans", cursive',
  '"Courier New", Courier, monospace',
  'Impact, "Arial Narrow", sans-serif',
  '"Papyrus", fantasy',
  '"Trebuchet MS", sans-serif',
  '"Lucida Handwriting", cursive',
  '"Brush Script MT", cursive',
  '"Arial Black", sans-serif',
  'Verdana, sans-serif',
  '"Times New Roman", Times, serif',
  '"Palatino Linotype", "Book Antiqua", Palatino, serif',
  '"Copperplate Gothic Bold", fantasy',
];

// ─── Random helpers ───────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomFill()  { return pick(TEXT_FILLS); }
function randomSolid() { return pick(SOLIDS); }
function randomFont()  { return pick(FONTS); }

function randomShadow() {
  const x = Math.round(Math.random() * 8 - 4);
  const y = Math.round(Math.random() * 5 + 2);
  return `${x}px ${y}px 0 ${randomSolid()}`;
}
function randomHue()       { return `${Math.round(Math.random() * 360)}deg`; }

// ─── Text elements ────────────────────────────────────────────────────────────

const TEXT_SELECTOR = [
  '[class*="t-body-"]',
  '[class*="t-caption-"]',
  '[class*="t-headline-"]',
  '[class*="t-micro-"]',
].join(", ");

function paintElement(el: Element) {
  if (el.hasAttribute(TEXT_ATTR)) return;
  el.setAttribute(TEXT_ATTR, "1");
  const s = (el as HTMLElement).style;
  s.setProperty("background",  randomFill(),              "important");
  s.setProperty("color",       "#000",                    "important");
  s.setProperty("box-shadow",  randomShadow(),            "important");
  s.setProperty("font-family", randomFont(),              "important");
}

function paintAll() {
  document.querySelectorAll(TEXT_SELECTOR).forEach(paintElement);
}

function unpaintAll() {
  document.querySelectorAll(`[${TEXT_ATTR}]`).forEach((el) => {
    el.removeAttribute(TEXT_ATTR);
    const s = (el as HTMLElement).style;
    s.removeProperty("background");
    s.removeProperty("color");
    s.removeProperty("box-shadow");
    s.removeProperty("font-family");
  });
}

// ─── Work cards ───────────────────────────────────────────────────────────────

const CARD_SELECTOR = ".work-card";

function paintCard(el: Element) {
  if (el.hasAttribute(CARD_ATTR)) return;
  el.setAttribute(CARD_ATTR, "1");
  (el as HTMLElement).style.setProperty("background", randomFill(), "important");
}

function paintCards() {
  document.querySelectorAll(CARD_SELECTOR).forEach(paintCard);
}

function unpaintCards() {
  document.querySelectorAll(`[${CARD_ATTR}]`).forEach((el) => {
    el.removeAttribute(CARD_ATTR);
    (el as HTMLElement).style.removeProperty("background");
  });
}

// ─── Images ───────────────────────────────────────────────────────────────────

function paintImages() {
  document.querySelectorAll("img").forEach((img) => {
    if (img.hasAttribute(IMG_ATTR)) return;
    img.setAttribute(IMG_ATTR, "1");
    img.style.setProperty(
      "filter",
      `hue-rotate(${randomHue()}) saturate(2) brightness(1.1)`,
      "important",
    );
  });
}

function unpaintImages() {
  document.querySelectorAll(`[${IMG_ATTR}]`).forEach((img) => {
    img.removeAttribute(IMG_ATTR);
    (img as HTMLElement).style.removeProperty("filter");
  });
}

// ─── Mutation observer ────────────────────────────────────────────────────────

let mutationObserver: MutationObserver | null = null;

function watchForNewElements() {
  mutationObserver = new MutationObserver((mutations) => {
    for (const { addedNodes } of mutations) {
      addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as Element;
        if (el.matches(TEXT_SELECTOR)) paintElement(el);
        el.querySelectorAll(TEXT_SELECTOR).forEach(paintElement);
        if (el.matches(CARD_SELECTOR)) paintCard(el);
        el.querySelectorAll(CARD_SELECTOR).forEach(paintCard);
        if (el.tagName === "IMG") paintImages();
        el.querySelectorAll("img").forEach((img) => {
          if (!img.hasAttribute(IMG_ATTR)) paintImages();
        });
      });
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function stopWatching() {
  mutationObserver?.disconnect();
  mutationObserver = null;
}

// ─── Global styles ────────────────────────────────────────────────────────────

function injectStyles(cursor: string) {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    html.egg-mode body {
      background: var(--egg-bg) !important;
      background-repeat: repeat !important;
      background-attachment: fixed !important;
    }
    html.egg-mode,
    html.egg-mode * {
      cursor: ${cursor} !important;
    }
  `;
  document.head.appendChild(el);
}

function ejectStyles() {
  document.getElementById(STYLE_ID)?.remove();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function useEggMode() {
  function toggle() {
    isActive.value = !isActive.value;

    if (isActive.value) {
      injectStyles(pick(CURSORS));
      document.documentElement.style.setProperty("--egg-bg", pick(BG_PATTERNS));
      document.documentElement.classList.add("egg-mode");
      paintAll();
      paintCards();
      paintImages();
      watchForNewElements();
    } else {
      document.documentElement.classList.remove("egg-mode");
      document.documentElement.style.removeProperty("--egg-bg");
      ejectStyles();
      stopWatching();
      unpaintAll();
      unpaintCards();
      unpaintImages();
    }
  }

  return { isActive: readonly(isActive), toggle };
}
