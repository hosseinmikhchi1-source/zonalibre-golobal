/* =========================================================
   ZonaLibre — minimal vanilla JavaScript
   Only three jobs:
     1. Fill the repeated lists (features, steps, stats, FAQ, legal)
     2. Switch the language (10 languages, with RTL support)
     3. Add a class to the header when the page is scrolled
   Everything else (layout, animations, mobile menu, accordion)
   is handled by plain CSS.
   ========================================================= */

import { LANGUAGES, T } from "./translations.js";

const STORAGE_KEY = "zonalibre-lang";

/* ---------- tiny helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/** Read a nested value with a dotted path: get(dict, "hero.title") */
function get(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

/* ---------- inline SVG icons ---------- */
const svg = (inner) =>
  `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;

const ICONS = {
  gift: svg('<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12"/><path d="M12 9S10.6 4 8.2 4a2.2 2.2 0 0 0 0 5M12 9s1.4-5 3.8-5a2.2 2.2 0 0 1 0 5"/>'),
  noform: svg('<path d="M14.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5"/><path d="M14 3v5h5"/><path d="m9 12 6 6M15 12l-6 6"/>'),
  tap: svg('<path d="M12 3v6"/><path d="M7.8 6.2a6 6 0 1 0 8.4 0"/>'),
  lock: svg('<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/><path d="M12 14v2.5"/>'),
  layers: svg('<path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z"/><path d="m4 12 8 4.3 8-4.3M4 16.4l8 4.3 8-4.3"/>'),
  spark: svg('<path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.3 10.2 12.6 4.5 10.8 10.2 9 12 3.5Z"/>'),
  download: svg('<path d="M12 3.5v10.5"/><path d="m8 10.5 4 4 4-4"/><path d="M4.5 17.5v1.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-1.5"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3.2 9.5h17.6M3.2 14.5h17.6"/><path d="M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"/>'),
  plus: svg('<path d="M12 5.5v13M5.5 12h13"/>'),
  check: svg('<path d="m5 12.8 4.4 4.4L19 7.6"/>'),
};

const FEATURE_ICONS = [ICONS.gift, ICONS.noform, ICONS.tap, ICONS.lock, ICONS.layers, ICONS.spark];
const STEP_ICONS = [ICONS.download, ICONS.tap, ICONS.globe];
const STEP_GRADS = [
  "linear-gradient(140deg,#2dd4bf,#10b981)",
  "linear-gradient(140deg,#38bdf8,#6366f1)",
  "linear-gradient(140deg,#fbbf24,#f43f5e)",
];

/* ---------- 1. choose the starting language ---------- */
function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && T[saved]) return saved;
  } catch (e) {
    /* localStorage can be blocked — ignore */
  }
  const list = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || "en"];
  for (const raw of list) {
    const code = String(raw).slice(0, 2).toLowerCase();
    if (T[code]) return code;
  }
  return "en";
}

let current = "en";

/* ---------- 2. render everything for a language ---------- */
function render(code) {
  const dict = T[code];
  const meta = LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
  if (!dict) return;
  current = code;

  // page language + text direction (Arabic = RTL)
  document.documentElement.lang = meta.code;
  document.documentElement.dir = meta.dir;

  // simple text nodes marked with data-i18n="path.to.key"
  $$("[data-i18n]").forEach((el) => {
    const value = get(dict, el.dataset.i18n);
    if (typeof value === "string") el.textContent = value;
  });

  // language button label
  $("#langLabel").textContent = meta.label;

  /* --- marquee: the word "free" in all 10 languages, duplicated for the loop --- */
  const items = LANGUAGES.map(
    (l) =>
      `<span class="marquee-item"><span>${l.flag}</span>${T[l.code].marqueeWord}<i></i></span>`,
  ).join("");
  $("#marqueeTrack").innerHTML = items + items;

  /* --- feature cards --- */
  $("#featuresGrid").innerHTML = dict.features.items
    .map(
      (item, i) => `
      <article class="card">
        <div class="card-icon tone-${i + 1}">${FEATURE_ICONS[i]}</div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${item.text}</p>
      </article>`,
    )
    .join("");

  /* --- steps --- */
  $("#stepsGrid").innerHTML = dict.how.steps
    .map(
      (step, i) => `
      <div class="step">
        <div class="step-badge">
          <span class="step-halo" style="background:${STEP_GRADS[i]}"></span>
          <span class="step-icon" style="background:${STEP_GRADS[i]}">${STEP_ICONS[i]}</span>
          <span class="step-num">${i + 1}</span>
        </div>
        <h3 class="step-title">${step.title}</h3>
        <p class="step-text">${step.text}</p>
      </div>`,
    )
    .join("");

  /* --- promise stats --- */
  $("#statsGrid").innerHTML = dict.promise.stats
    .map((s) => `<div class="stat"><b>${s.n}</b><span>${s.label}</span></div>`)
    .join("");

  /* --- FAQ (native <details> = CSS-only accordion) --- */
  $("#faqList").innerHTML = dict.faq.items
    .map(
      (item, i) => `
      <details class="faq-item"${i === 0 ? " open" : ""}>
        <summary>${item.title}<span class="faq-sign">${ICONS.plus}</span></summary>
        <p class="faq-answer">${item.text}</p>
      </details>`,
    )
    .join("");

  /* --- honest note list --- */
  $("#legalList").innerHTML = dict.legal.points
    .map((p) => `<li><span class="tick-badge">${ICONS.check}</span><span>${p}</span></li>`)
    .join("");

  /* --- language dropdown --- */
  $("#langList").innerHTML = LANGUAGES.map(
    (l) => `
    <button type="button" role="option" class="lang-option${l.code === code ? " is-active" : ""}"
            data-code="${l.code}" aria-selected="${l.code === code}">
      <span class="flag">${l.flag}</span>
      <span class="name">${l.label}</span>
      <span class="tick">${ICONS.check}</span>
    </button>`,
  ).join("");

  /* --- footer language chips --- */
  $("#langChips").innerHTML = LANGUAGES.map(
    (l) => `
    <button type="button" class="lang-chip${l.code === code ? " is-active" : ""}"
            data-code="${l.code}" title="${l.english}">
      ${l.flag} ${l.code.toUpperCase()}
    </button>`,
  ).join("");
}

function setLanguage(code) {
  if (!T[code]) return;
  render(code);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch (e) {
    /* ignore */
  }
}

/* ---------- 3. wire up the interactions ---------- */
function init() {
  render(detectLanguage());

  $("#year").textContent = String(new Date().getFullYear());

  const header = $("#header");
  const langBtn = $("#langBtn");
  const langMenu = $("#langMenu");

  // header background on scroll
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // open / close the language dropdown
  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = langMenu.hasAttribute("hidden");
    langMenu.toggleAttribute("hidden", !open);
    langBtn.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (e) => {
    // pick a language (dropdown option or footer chip)
    const target = e.target.closest("[data-code]");
    if (target) {
      setLanguage(target.dataset.code);
      langMenu.setAttribute("hidden", "");
      langBtn.setAttribute("aria-expanded", "false");
      return;
    }
    // click outside closes the dropdown
    if (!e.target.closest("#lang")) {
      langMenu.setAttribute("hidden", "");
      langBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      langMenu.setAttribute("hidden", "");
      langBtn.setAttribute("aria-expanded", "false");
    }
  });

  // close the mobile menu after tapping a link
  const menuToggle = $("#menuToggle");
  $$(".nav-mobile-inner a").forEach((a) =>
    a.addEventListener("click", () => {
      menuToggle.checked = false;
    }),
  );
}

document.addEventListener("DOMContentLoaded", init);
