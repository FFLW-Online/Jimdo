const FFLW_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzjtI-x26-DtKdZLR0B4JprIYRdi53iG2l8TKhz6HkwPYRe70eoPOcCOixRUDxEC0k7/exec";
const FFLW_GLOBAL_MASTER_CODE = "FFLW-99";
const FFLW_STATUS_CACHE_KEY = "fflw_site_status_cache_v1";
const FFLW_GITHUB_OWNER = "FFLW-Online";
const FFLW_GITHUB_REPO = "Jimdo";
const FFLW_GITHUB_BRANCH = "main";

// ============================================================================
// 0. DYNAMISCHE GITHUB-ERKENNUNG (ALLE HTML-DATEIEN VS. MENÜ-NAVIGATION)
// ============================================================================
window.fetchFflwDynamicPages = async function () {
  const hiddenManualFallback = [
    "zusammenfinden.html",
    "der-versteckte-obstgarten.html",
    "intern-statistik.html",
    "beispielbilder.html",
    "bilder-selbst-hochladen.html",
    "wie-man-den-tragegurt-einsetzt.html",
    "tipps-und-tricks.html",
    "transport-alternativen.html",
    "sitemap.html",
    "fflw-international.html",
    "master.html"
  ];

  // 1. Menü-Links aus nav.html auslesen (um zu wissen, was öffentlich im Menü steht)
  const navMap = new Map();
  try {
    const navResp = await fetch("nav.html?t=" + Date.now());
    if (navResp.ok) {
      const navHtml = await navResp.text();
      const doc = new DOMParser().parseFromString(navHtml, "text/html");
      doc.querySelectorAll("a[href]").forEach(a => {
        const href = (a.getAttribute("href") || "").split("?")[0].split("#")[0].trim();
        const label = a.textContent.replace(/\s+/g, " ").trim();
        if (href.endsWith(".html")) {
          navMap.set(href, label || href);
        }
      });
    }
  } catch (e) {}

  // Fallback aus bereits gerendertem #nav-list
  document.querySelectorAll("#nav-list a[href]").forEach(a => {
    const href = (a.getAttribute("href") || "").split("?")[0].split("#")[0].trim();
    const label = a.textContent.replace(/\s+/g, " ").trim();
    if (href.endsWith(".html") && !navMap.has(href)) {
      navMap.set(href, label || href);
    }
  });

  // 2. Live-Dateiliste aus GitHub Repository (FFLW-Online/Jimdo) abrufen
  let repoHtmlFiles = [];
  let source = "github";
  try {
    const ghUrl = `https://api.github.com/repos/${FFLW_GITHUB_OWNER}/${FFLW_GITHUB_REPO}/git/trees/${FFLW_GITHUB_BRANCH}?recursive=1`;
    const ghResp = await fetch(ghUrl, { headers: { "Accept": "application/vnd.github.v3+json" } });
    if (ghResp.ok) {
      const ghData = await ghResp.json();
      if (ghData && Array.isArray(ghData.tree)) {
        repoHtmlFiles = ghData.tree
          .filter(item => item.type === "blob" && item.path.endsWith(".html") && !item.path.includes("/"))
          .map(item => item.path);
      }
    }
  } catch (e) {}

  if (!repoHtmlFiles.length) {
    source = "fallback";
    repoHtmlFiles = Array.from(new Set([...navMap.keys(), ...hiddenManualFallback]));
  }

  const systemExclude = new Set(["google", "404.html"]);
  const pages = repoHtmlFiles
    .filter(f => !systemExclude.has(f))
    .map(file => {
      const inMenu = navMap.has(file);
      const isLegal = (file === "impressum.html" || file === "datenschutz.html");
      const isHidden = !inMenu && !isLegal;
      const niceTitle = inMenu
        ? navMap.get(file)
        : file.replace(/\.html$/i, "").replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());

      return {
        file: file,
        title: niceTitle,
        inMenu: inMenu,
        isHidden: isHidden,
        isLegal: isLegal
      };
    })
    .sort((a, b) => a.file.localeCompare(b.file, "de"));

  return { pages, source };
};

// ============================================================================
// 1. KLICK-SYMBOLE (ZEIGEHÄNDE MIT KREISWELLEN) & STOPP-HÄNDE-SVG
// ============================================================================
function getFflwTapHandSvg(direction, styleVariant) {
  const isRightMirror = direction === "right";
  const transformAttr = isRightMirror ? 'transform="scale(-1, 1)" style="transform-origin: center;"' : "";
  const handFill = styleVariant === "B" ? "#ffffff" : "#004080";
  const waveStroke = styleVariant === "B" ? "#ffd700" : "#d97706";

  if (styleVariant === "B") {
    return `
      <svg width="34" height="24" viewBox="0 0 38 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g ${transformAttr}>
          <rect x="4" y="10" width="12" height="11" rx="4" fill="${handFill}"/>
          <rect x="13" y="11.5" width="12" height="3.6" rx="1.8" fill="${handFill}"/>
          <rect x="12" y="15.5" width="7" height="2.6" rx="1.3" fill="${handFill}" opacity="0.85"/>
          <rect x="11" y="18.5" width="6" height="2.4" rx="1.2" fill="${handFill}" opacity="0.75"/>
          <circle cx="27" cy="13.3" r="3.5" fill="none" stroke="${waveStroke}" stroke-width="1.8" class="fflw-wave-ring"/>
          <path d="M31 9 L35 13.3 L31 17.6" fill="none" stroke="${waveStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>
    `;
  }

  return `
    <svg width="36" height="26" viewBox="0 0 38 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g ${transformAttr}>
        <rect x="3" y="10" width="12" height="11" rx="4.5" fill="${handFill}"/>
        <rect x="8" y="6.5" width="4" height="6" rx="2" fill="${handFill}"/>
        <rect x="12" y="11" width="13" height="3.8" rx="1.9" fill="${handFill}"/>
        <rect x="11" y="15.2" width="7.5" height="2.6" rx="1.3" fill="${handFill}" opacity="0.82"/>
        <rect x="10" y="18.2" width="6.5" height="2.5" rx="1.25" fill="${handFill}" opacity="0.7"/>
        <path d="M27.5 9.2 A 5 5 0 0 1 27.5 16.8" fill="none" stroke="${waveStroke}" stroke-width="2" stroke-linecap="round" class="fflw-wave-ring"/>
        <path d="M31 6.5 A 8.5 8.5 0 0 1 31 19.5" fill="none" stroke="${waveStroke}" stroke-width="1.8" stroke-linecap="round" opacity="0.75" class="fflw-wave-ring"/>
      </g>
    </svg>
  `;
}

function getFflwMaintenanceSvg() {
  return `
    <svg width="154" height="114" viewBox="0 0 150 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kurze Pause – zwei Stopp-Hände in den Vereinsfarben">
      <circle cx="75" cy="55" r="48" fill="#e6eff8" stroke="#004080" stroke-width="3"/>
      <g transform="translate(33, 23)">
        <rect x="10" y="24" width="24" height="24" rx="8" fill="#004080"/>
        <rect x="6" y="14" width="5" height="16" rx="2.5" fill="#004080"/>
        <rect x="12" y="7" width="5" height="21" rx="2.5" fill="#004080"/>
        <rect x="18" y="4" width="5" height="23" rx="2.5" fill="#004080"/>
        <rect x="24" y="7" width="5" height="20" rx="2.5" fill="#004080"/>
        <rect x="30" y="13" width="5" height="15" rx="2.5" fill="#004080"/>
        <path d="M13 33 Q22 30 30 35" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
      <g transform="translate(76, 23)">
        <rect x="10" y="24" width="24" height="24" rx="8" fill="#d97706"/>
        <rect x="9" y="13" width="5" height="15" rx="2.5" fill="#d97706"/>
        <rect x="15" y="7" width="5" height="20" rx="2.5" fill="#d97706"/>
        <rect x="21" y="4" width="5" height="23" rx="2.5" fill="#d97706"/>
        <rect x="27" y="7" width="5" height="21" rx="2.5" fill="#d97706"/>
        <rect x="33" y="14" width="5" height="16" rx="2.5" fill="#d97706"/>
        <path d="M14 35 Q22 30 31 33" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
      <circle cx="75" cy="87" r="13" fill="#ffffff" stroke="#004080" stroke-width="2.5"/>
      <circle cx="71" cy="84" r="1.6" fill="#004080"/>
      <circle cx="79" cy="84" r="1.6" fill="#004080"/>
      <path d="M70 92 Q75 88 80 92" stroke="#d97706" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </svg>
  `;
}

// ============================================================================
// 2. ZENTRALES STATUS-MANAGEMENT (WARTUNG & FLAGGENBAND-STIL)
// ============================================================================
function getCachedSiteStatus() {
  try {
    const raw = sessionStorage.getItem(FFLW_STATUS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          wartungSeiten: Array.isArray(parsed.wartungSeiten) ? parsed.wartungSeiten : [],
          flaggenStil: ["A", "B", "C", "OFF"].includes(parsed.flaggenStil) ? parsed.flaggenStil : "A",
          zugangscode: typeof parsed.zugangscode === "string" ? parsed.zugangscode : "11"
        };
      }
    }
  } catch (e) {}
  return { wartungSeiten: [], flaggenStil: "A", zugangscode: "11" };
}

function setCachedSiteStatus(statusObj) {
  try {
    sessionStorage.setItem(FFLW_STATUS_CACHE_KEY, JSON.stringify(statusObj));
  } catch (e) {}
}

function renderGlobalFlagBar(currentPage, flaggenStil) {
  const siteHeader = document.querySelector(".site-header");
  if (!siteHeader) return;

  const existing = siteHeader.querySelector(".global-flag-bar");
  if (existing) existing.remove();

  if (currentPage === "fflw-international.html" || flaggenStil === "OFF") {
    return;
  }

  const stil = ["A", "B", "C"].includes(flaggenStil) ? flaggenStil : "A";
  const flags = [
    "🇦🇱", "🇸🇦", "🇹🇷", "🇺🇦", "🇷🇺", "🇮🇷", "🇦🇫", "🇪🇷", "🇸🇴",
    "🇬🇧", "🇫🇷", "🇪🇸", "🇮🇹", "🇷🇴", "🇧🇬", "🇵🇱", "🇮🇳", "🇵🇰",
    "🇸🇾", "🇮🇶", "🇽🇰", "🇬🇷", "🇭🇷", "🇷🇸", "🇳🇬", "🇬🇲", "🇩🇪"
  ];
  const flagSpans = flags.map(f => `<span>${f}</span>`).join("");

  const flagBar = document.createElement("a");
  flagBar.href = `fflw-international.html?return=${encodeURIComponent(currentPage)}`;
  flagBar.className = `global-flag-bar style-${stil} notranslate`;
  flagBar.setAttribute("translate", "no");
  flagBar.setAttribute("aria-label", "Sprache wählen / Translate page");
  flagBar.title = "Sprache wählen / Translate";
  flagBar.innerHTML = `
    <span class="global-flag-hand" aria-hidden="true">${getFflwTapHandSvg("left", stil)}</span>
    <div class="global-flag-marquee" aria-hidden="true">
      <div class="global-flag-track">
        ${flagSpans}${flagSpans}
      </div>
    </div>
    <span class="global-flag-hand" aria-hidden="true">${getFflwTapHandSvg("right", stil)}</span>
  `;
  siteHeader.appendChild(flagBar);
}

function updateStickyHeaderOffset() {
  const siteHeader = document.querySelector(".site-header");
  if (!siteHeader) return;
  const h = siteHeader.offsetHeight;
  if (h > 0) {
    document.documentElement.style.setProperty("--header-offset", `${h + 12}px`);
  }
}

let fflwOriginalMainHtml = null;

function applyMaintenanceStateToPage(currentPage, wartungSeiten) {
  const protectedLegal = ["impressum.html", "datenschutz.html", "master.html"];
  if (protectedLegal.includes(currentPage)) return;

  const mainContent = document.querySelector("main.content");
  if (!mainContent) return;

  if (fflwOriginalMainHtml === null) {
    fflwOriginalMainHtml = mainContent.innerHTML;
  }

  const liste = Array.isArray(wartungSeiten) ? wartungSeiten : [];
  const isBlocked = liste.includes("*") || liste.includes(currentPage);

  if (isBlocked) {
    if (!mainContent.querySelector(".fflw-maintenance-card")) {
      mainContent.innerHTML = `
        <div class="fflw-maintenance-card">
          ${getFflwMaintenanceSvg()}
          <h2>Kurze Pause – Seite gerade in Wartung</h2>
          <p>Wir aktualisieren hier gerade die Inhalte und Angebote. Bitte schau in Kürze wieder vorbei!</p>
          <p style="font-size: 0.92rem; color: #555555;">
            In dringenden Fällen erreichst du uns jederzeit per E-Mail an
            <a href="mailto:Kontakt@freundeleuwi.org" style="color: #004080; font-weight: bold;">Kontakt@freundeleuwi.org</a>.
          </p>
          ${currentPage !== "index.html" ? `
            <p style="margin-top: 18px; margin-bottom: 0;">
              <a href="index.html" style="display: inline-block; background: #004080; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 6px; font-weight: bold;">
                Zur Startseite
              </a>
            </p>
          ` : ""}
        </div>
      `;
    }
  } else if (mainContent.querySelector(".fflw-maintenance-card") && fflwOriginalMainHtml !== null) {
    mainContent.innerHTML = fflwOriginalMainHtml;
  }
}

function syncGlobalSiteStatus(currentPage) {
  const cached = getCachedSiteStatus();
  renderGlobalFlagBar(currentPage, cached.flaggenStil);
  applyMaintenanceStateToPage(currentPage, cached.wartungSeiten);
  updateStickyHeaderOffset();

  fetch(`${FFLW_WEB_APP_URL}?action=site_status&t=${Date.now()}`, {
    method: "GET",
    redirect: "follow"
  })
    .then(res => res.json())
    .then(data => {
      if (!data || !data.ok) return;
      const fresh = {
        wartungSeiten: Array.isArray(data.wartungSeiten) ? data.wartungSeiten : [],
        flaggenStil: ["A", "B", "C", "OFF"].includes(data.flaggenStil) ? data.flaggenStil : "A",
        zugangscode: typeof data.zugangscode === "string" ? data.zugangscode : "11"
      };
      setCachedSiteStatus(fresh);
      renderGlobalFlagBar(currentPage, fresh.flaggenStil);
      applyMaintenanceStateToPage(currentPage, fresh.wartungSeiten);
      updateStickyHeaderOffset();
    })
    .catch(() => {});
}

// ============================================================================
// 4. GOOGLE TRANSLATE, POPUPS & PWA
// ============================================================================
function applyGoogleTranslateCookie(langCode) {
  const host = window.location.hostname;
  const hostParts = host.split('.');
  const rootDomain = hostParts.length > 1 ? '.' + hostParts.slice(-2).join('.') : host;

  const paths = ["/", "/Jimdo", "/Jimdo/"];
  const domains = ["", host, "." + host, rootDomain];
  paths.forEach(p => {
    domains.forEach(d => {
      const domainStr = d ? `; domain=${d}` : "";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${p}${domainStr};`;
    });
  });

  if (langCode && langCode !== "de") {
    document.cookie = `googtrans=/de/${langCode}; path=/;`;
    if (rootDomain && rootDomain.startsWith(".")) {
      document.cookie = `googtrans=/de/${langCode}; path=/; domain=${rootDomain};`;
    }
  }
}

(function rememberReturnPage() {
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  if (currentFile !== "fflw-international.html") return;

  const params = new URLSearchParams(window.location.search);
  let ret = params.get("return");

  if (!ret && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.origin === window.location.origin) {
        const refFile = refUrl.pathname.split("/").pop();
        if (refFile && refFile !== "fflw-international.html") {
          ret = refFile;
        }
      }
    } catch (e) {}
  }

  if (ret && /^[a-zA-Z0-9._-]+\.html$/.test(ret)) {
    sessionStorage.setItem("fflw_return_page", ret);
  }
})();

function getExplicitUrlLanguage() {
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  if (urlLang && urlLang !== "de") return urlLang;

  const hashMatch = window.location.hash.match(/googtrans\(de\|([a-zA-Z-]+)\)/);
  if (hashMatch && hashMatch[1] !== "de") return hashMatch[1];

  return null;
}

function getActiveLanguage() {
  const explicitLang = getExplicitUrlLanguage();
  if (explicitLang) return explicitLang;

  const cookieMatch = document.cookie.match(/(?:^|;\s*)googtrans=\/de\/([a-zA-Z-]+)/);
  return cookieMatch ? cookieMatch[1] : null;
}

function setLanguage(langCode) {
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const storedReturn = sessionStorage.getItem("fflw_return_page");

  let targetPage = currentFile;
  if (currentFile === "fflw-international.html") {
    targetPage = (storedReturn && /^[a-zA-Z0-9._-]+\.html$/.test(storedReturn))
      ? storedReturn
      : "index.html";
  }
  sessionStorage.removeItem("fflw_return_page");

  if (langCode === "de") {
    applyGoogleTranslateCookie("de");
    sessionStorage.removeItem("fflw_gt_blocked_dismissed");
    window.location.replace(targetPage);
  } else {
    applyGoogleTranslateCookie(langCode);
    sessionStorage.removeItem("fflw_gt_blocked_dismissed");
    window.location.replace(`${targetPage}?lang=${langCode}#googtrans(de|${langCode})`);
  }
}

function forceGoogleTranslatePopup(targetLang, containerEl) {
  if (!targetLang || targetLang === "de") return;
  const combo = document.querySelector(".goog-te-combo");
  if (!combo) return;

  if (containerEl && containerEl.querySelector("font")) return;

  combo.value = "";
  combo.dispatchEvent(new Event("change", { bubbles: true }));

  requestAnimationFrame(() => {
    combo.value = targetLang;
    combo.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function showTranslateBlockedFallback(targetLang) {
  if (!targetLang || targetLang === "de") return;
  if (!getExplicitUrlLanguage()) return;
  if (sessionStorage.getItem("fflw_gt_blocked_dismissed") === "true") return;
  if (document.getElementById("fflw-gt-blocked-bar")) return;

  const fallbackUrl = `https://translate.google.com/translate?sl=de&tl=${encodeURIComponent(targetLang)}&u=${encodeURIComponent(window.location.href)}`;
  const bar = document.createElement("div");
  bar.id = "fflw-gt-blocked-bar";
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647;
    background: #fff3cd; color: #333; border-bottom: 2px solid #ffb300;
    padding: 10px 16px; display: flex; flex-wrap: wrap; align-items: center;
    justify-content: center; gap: 12px; font-family: inherit; font-size: 0.9rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  `;
  bar.innerHTML = `
    <span>⚠️ Ihr Netzwerk/Browser blockiert das eingebettete Übersetzungstool.</span>
    <a href="${fallbackUrl}" target="_blank" rel="noopener"
       style="background: #2e7d32; color: #fff; text-decoration: none; padding: 6px 14px; border-radius: 5px; font-weight: bold;">
      🌐 Seite direkt über Google Translate öffnen
    </a>
    <button type="button" id="fflw-gt-blocked-close"
            style="background: transparent; border: none; font-size: 1.1rem; cursor: pointer; color: #555;">✕</button>
  `;
  document.body.appendChild(bar);
  document.getElementById("fflw-gt-blocked-close").addEventListener("click", () => {
    sessionStorage.setItem("fflw_gt_blocked_dismissed", "true");
    bar.remove();
  });
}

window.googleTranslateElementInit = function () {
  const targetLang = getActiveLanguage();

  new google.translate.TranslateElement({
    pageLanguage: 'de',
    autoDisplay: false
  }, 'google_translate_hidden');

  if (targetLang && targetLang !== "de") {
    let attempts = 0;
    const triggerInterval = setInterval(function () {
      const combo = document.querySelector(".goog-te-combo");
      const isTranslated =
        document.documentElement.classList.contains("translated-ltr") ||
        document.documentElement.classList.contains("translated-rtl");

      attempts++;

      if (combo && combo.options && combo.options.length > 1 && !isTranslated) {
        combo.value = targetLang;
        combo.dispatchEvent(new Event("change", { bubbles: true }));
      }

      if (isTranslated) {
        clearInterval(triggerInterval);
      } else if (attempts > 40) {
        clearInterval(triggerInterval);
      }
    }, 250);
  }
};

function startGoogleTranslate(activeLang) {
  if (!activeLang || activeLang === "de") return;

  if (!window.location.hash.includes(`googtrans(de|${activeLang})`)) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}#googtrans(de|${activeLang})`);
  }

  if (document.getElementById("google_translate_hidden")) {
    return;
  }

  const hiddenDiv = document.createElement("div");
  hiddenDiv.id = "google_translate_hidden";
  hiddenDiv.style.cssText = "position: fixed; left: -9999px; top: 0; width: 200px; height: 40px; opacity: 0.01; pointer-events: none;";
  document.body.appendChild(hiddenDiv);

  const gtScript = document.createElement("script");
  gtScript.type = "text/javascript";
  gtScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  gtScript.onerror = function () {
    showTranslateBlockedFallback(activeLang);
  };
  document.body.appendChild(gtScript);
}

function openTranslationHelpDialog(activeLang) {
  if (document.getElementById("fflw-help-dialog-overlay")) return;

  const openedAt = Date.now();
  const overlay = document.createElement("div");
  overlay.id = "fflw-help-dialog-overlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65);
    display: block; z-index: 2147483647;
    padding: 10px 12px 24px 12px; box-sizing: border-box;
    overflow-y: auto; overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #ffffff; color: #1a1a1a; max-width: 460px; width: 100%;
    margin: min(4vh, 32px) auto 16px auto; border-radius: 8px; overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    border-top: 5px solid #2e7d32; font-family: inherit; line-height: 1.45;
  `;

  modal.innerHTML = `
    <form id="fflw-help-form" style="margin: 0;">
      <div style="position: sticky; top: 0; z-index: 2; padding: 10px 16px; background: #f4f7f4; border-bottom: 1px solid #d5e2d5; display: flex; gap: 10px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <button type="button" id="fflw-help-cancel-btn"
                style="background: #e2e8f0; color: #333333; border: none; padding: 8px 14px; border-radius: 5px; font-weight: bold; font-size: 0.9rem; cursor: pointer;">
          Abbrechen
        </button>
        <button type="submit" id="fflw-help-submit-btn"
                style="background: #2e7d32; color: #ffffff; border: none; padding: 8px 18px; border-radius: 5px; font-weight: bold; font-size: 0.92rem; cursor: pointer;">
          ✉️ Abschicken
        </button>
      </div>

      <div style="padding: 16px 18px 18px 18px;">
        <h3 style="margin: 0 0 8px 0; color: #a61d24; font-size: 1.05rem;">
          🌐 Probleme mit dem Übersetzungstool
        </h3>
        <p style="margin: 0 0 10px 0; font-size: 0.88rem; color: #333; background: #fff8f8; padding: 8px 10px; border-radius: 5px; border-left: 3px solid #d32f2f;">
          Bitte nutzen Sie diese Meldung <strong>nur, wenn die automatische Übersetzung nicht funktioniert</strong>.
        </p>
        <p style="margin: 0 0 12px 0; font-size: 0.88rem; color: #333;">
          Einfach oben auf <strong>✉️ Abschicken</strong> drücken – wir sehen automatisch Sprache und Seite. Alle Felder darunter sind freiwillig.
        </p>

        <div style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;" aria-hidden="true">
          <label for="fflw-hp-website">Website</label>
          <input type="text" id="fflw-hp-website" name="website" tabindex="-1" autocomplete="off">
        </div>

        <label for="fflw-help-msg" style="display: block; font-size: 0.85rem; font-weight: bold; margin-bottom: 3px;">
          Optional: Was funktioniert bei der Übersetzung nicht?
        </label>
        <textarea id="fflw-help-msg" rows="2" placeholder="..."
                  style="width: 100%; padding: 7px; border: 1px solid #bbb; border-radius: 5px; font-family: inherit; font-size: 0.9rem; box-sizing: border-box; margin-bottom: 10px;"></textarea>

        <label for="fflw-help-email" style="display: block; font-size: 0.85rem; font-weight: bold; margin-bottom: 3px;">
          Optional: Ihre E-Mail-Adresse für Rückfragen
        </label>
        <input type="email" id="fflw-help-email" placeholder="name@example.com"
               style="width: 100%; padding: 7px; border: 1px solid #bbb; border-radius: 5px; font-family: inherit; font-size: 0.9rem; box-sizing: border-box; margin-bottom: 10px;">

        <p style="margin: 0; font-size: 0.88rem; font-weight: bold; color: #2e7d32; text-align: center;">
          ↑ Bitte drücken Sie oben auf ✉️ Abschicken.
        </p>
      </div>
    </form>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  overlay.scrollTop = 0;

  setTimeout(() => forceGoogleTranslatePopup(activeLang, modal), 350);
  setTimeout(() => forceGoogleTranslatePopup(activeLang, modal), 1100);

  const closeDialog = () => overlay.remove();
  document.getElementById("fflw-help-cancel-btn").addEventListener("click", closeDialog);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeDialog();
  });

  document.getElementById("fflw-help-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById("fflw-help-submit-btn");
    const honeypotVal = document.getElementById("fflw-hp-website").value.trim();
    const userMsg = document.getElementById("fflw-help-msg").value.trim();
    const userEmail = document.getElementById("fflw-help-email").value.trim();
    const elapsedMs = Date.now() - openedAt;
    const sentCount = parseInt(sessionStorage.getItem("fflw_help_sent_count") || "0", 10);

    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ ...";

    const showFakeOrRealSuccess = () => {
      submitBtn.style.background = "#1b5e20";
      submitBtn.textContent = "✅ OK!";
      setTimeout(closeDialog, 1300);
    };

    if (honeypotVal !== "" || elapsedMs < 2000 || sentCount >= 2) {
      setTimeout(showFakeOrRealSuccess, 400);
      return;
    }

    sessionStorage.setItem("fflw_help_sent_count", String(sentCount + 1));

    const hasSuspiciousLinks = /(https?:\/\/|www\.|<a\s)/i.test(userMsg);
    const subjectPrefix = hasSuspiciousLinks ? "[SPAM-VERDACHT] " : "";

    const translateLink = userMsg
      ? `https://translate.google.com/?sl=auto&tl=de&text=${encodeURIComponent(userMsg)}&op=translate`
      : "Keine Nachricht eingegeben (1-Klick-Meldung)";

    const payload = {
      _subject: `${subjectPrefix}Problem Übersetzungstool (Sprache: ${activeLang})`,
      _captcha: "false",
      _template: "table",
      Meldung: "Technisches Problem beim Übersetzungstool wurde gemeldet.",
      Sprache: activeLang,
      Nachricht_Original: userMsg || "– (ohne Text ausgelöst) –",
      Auf_Deutsch_uebersetzen: translateLink,
      Besucher_Email: userEmail || "– (keine angegeben) –",
      Seite: window.location.href,
      Geraet: `${window.innerWidth}x${window.innerHeight}px | ${navigator.userAgent}`,
      Zeitpunkt: new Date().toLocaleString("de-DE")
    };

    if (userEmail) {
      payload._replyto = userEmail;
    }

    fetch("https://formsubmit.co/ajax/Kontakt@freundeleuwi.org", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(() => showFakeOrRealSuccess())
      .catch(() => showFakeOrRealSuccess());
  });
}

let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  deferredInstallPrompt = e;
  showPwaInstallBanner("android");
});

function showPwaInstallBanner(platform) {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (isStandalone) return;
  if (localStorage.getItem("fflw_pwa_dismissed") === "true") return;
  if (document.getElementById("fflw-pwa-banner")) return;

  const banner = document.createElement("div");
  banner.id = "fflw-pwa-banner";
  banner.style.cssText = `
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 2147483640;
    background: #003366; color: #ffffff; padding: 12px 16px;
    box-shadow: 0 -4px 15px rgba(0,0,0,0.25);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    font-family: inherit; font-size: 0.9rem;
  `;

  if (platform === "android") {
    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="assets/logo-ffwl-neu-trans.png" alt="FFLW" style="width: 38px; height: 38px; border-radius: 8px; background: #fff; padding: 2px; object-fit: contain;">
        <div>
          <strong>FFLW als App speichern</strong><br>
          <span style="font-size: 0.8rem; opacity: 0.9;">Direkt auf Ihren Startbildschirm legen</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
        <button type="button" id="fflw-pwa-install-btn"
                style="background: #ffd700; color: #002244; border: none; padding: 8px 14px; border-radius: 5px; font-weight: bold; cursor: pointer;">
          Installieren
        </button>
        <button type="button" id="fflw-pwa-close-btn" aria-label="Schließen"
                style="background: transparent; color: #ffffff; border: none; font-size: 1.2rem; cursor: pointer; padding: 4px 8px;">
          ✕
        </button>
      </div>
    `;
  } else {
    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="assets/logo-ffwl-neu-trans.png" alt="FFLW" style="width: 38px; height: 38px; border-radius: 8px; background: #fff; padding: 2px; object-fit: contain;">
        <div style="line-height: 1.35;">
          <strong>FFLW als App auf das iPhone legen:</strong><br>
          <span style="font-size: 0.82rem;">Unten auf <strong>Teilen (⍗)</strong> und dann auf <strong>„Zum Home-Bildschirm“</strong> tippen.</span>
        </div>
      </div>
      <button type="button" id="fflw-pwa-close-btn" aria-label="Schließen"
              style="background: transparent; color: #ffffff; border: none; font-size: 1.2rem; cursor: pointer; padding: 4px 8px; flex-shrink: 0;">
        ✕
      </button>
    `;
  }

  document.body.appendChild(banner);

  document.getElementById("fflw-pwa-close-btn").addEventListener("click", function () {
    localStorage.setItem("fflw_pwa_dismissed", "true");
    banner.remove();
  });

  const installBtn = document.getElementById("fflw-pwa-install-btn");
  if (installBtn) {
    installBtn.addEventListener("click", async function () {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      banner.remove();
    });
  }
}

window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  syncGlobalSiteStatus(currentPage);
  window.addEventListener("resize", updateStickyHeaderOffset);
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader && "ResizeObserver" in window) {
    new ResizeObserver(updateStickyHeaderOffset).observe(siteHeader);
  }

  let activeLang = null;
  try {
    activeLang = getActiveLanguage();

    if (activeLang && activeLang !== "de") {
      applyGoogleTranslateCookie(activeLang);
    }
  } catch (err) {
    console.error("Sprach-Init Fehler:", err);
  }

  const cleanDocuSealUrl = "https://docuseal.com/d/Mcvg84UEAD5aay";
  document.querySelectorAll('a[href*="docuseal.com"]').forEach(link => {
    link.href = cleanDocuSealUrl;
  });

  const hideBarStyle = document.createElement("style");
  hideBarStyle.textContent = `
    .goog-te-banner-frame.skiptranslate,
    iframe.skiptranslate,
    #goog-gt-tt,
    .goog-te-balloon-frame,
    .VIpgJd-ZVi9od-aZ2wEe-wOHMyf {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    body { top: 0 !important; }
    .goog-text-highlight { background: none !important; box-shadow: none !important; }
  `;
  document.head.appendChild(hideBarStyle);

  const navContainer = document.getElementById("main-nav");
  if (navContainer) {
    fetch("nav.html")
      .then(response => {
        if (!response.ok) throw new Error("Menü konnte nicht geladen werden.");
        return response.text();
      })
      .then(html => {
        navContainer.innerHTML = html;

        navContainer.querySelectorAll('a[href*="docuseal.com"]').forEach(link => {
          link.href = cleanDocuSealUrl;
        });

        const links = navContainer.querySelectorAll("a");
        links.forEach(link => {
          const href = link.getAttribute("href");
          if (href === currentPage) {
            link.setAttribute("aria-current", "page");
            link.classList.add("active");
            const parentDetails = link.closest("details");
            if (parentDetails) {
              parentDetails.setAttribute("open", "");
            }
          }
          if (href === "fflw-international.html" && currentPage !== "fflw-international.html") {
            link.setAttribute("href", `fflw-international.html?return=${encodeURIComponent(currentPage)}`);
          }
        });

        const toggleBtn = document.getElementById("menu-toggle");
        const navList = document.getElementById("nav-list");

        if (toggleBtn && navList) {
          toggleBtn.addEventListener("click", function () {
            navList.classList.toggle("is-open");
          });
        }

        if (activeLang && activeLang !== "de" && navList) {
          const helpLi = document.createElement("li");
          helpLi.style.backgroundColor = "#8e1c24";
          helpLi.style.borderBottom = "2px solid #ffd700";

          const helpMenuLink = document.createElement("a");
          helpMenuLink.href = "#";
          helpMenuLink.style.cssText = "font-size: 0.78rem; line-height: 1.25; padding-top: 7px; padding-bottom: 7px;";
          helpMenuLink.innerHTML = "🌐 Probleme mit dem<br>Übersetzungstool";
          helpMenuLink.addEventListener("click", function (e) {
            e.preventDefault();
            openTranslationHelpDialog(activeLang);
          });
          helpLi.appendChild(helpMenuLink);
          navList.prepend(helpLi);

          const resetLi = document.createElement("li");
          resetLi.style.backgroundColor = "#1a237e";
          resetLi.style.borderBottom = "1px solid rgba(255, 255, 255, 0.3)";

          const resetLink = document.createElement("a");
          resetLink.href = currentPage;
          resetLink.className = "notranslate";
          resetLink.setAttribute("translate", "no");
          resetLink.textContent = "🇩🇪 Deutsch (Original)";
          resetLink.addEventListener("click", function (e) {
            e.preventDefault();
            setLanguage("de");
          });
          resetLi.appendChild(resetLink);
          navList.prepend(resetLi);
        }

        startGoogleTranslate(activeLang);
      })
      .catch(error => {
        console.error(error);
        startGoogleTranslate(activeLang);
      });
  } else {
    startGoogleTranslate(activeLang);
  }

  const goatCounterSite = "fflw";
  const gcScript = document.createElement("script");
  gcScript.async = true;
  gcScript.src = "//gc.zgo.at/count.js";
  gcScript.setAttribute("data-goatcounter", `https://${goatCounterSite}.goatcounter.com/count`);
  document.body.appendChild(gcScript);

  const legalFooter = document.querySelector(".legal-footer");
  if (legalFooter) {
    if (!legalFooter.querySelector('a[href="intern-statistik.html"]')) {
      legalFooter.insertAdjacentHTML(
        "beforeend",
        ' | <a href="intern-statistik.html" title="Vereinsinterna" style="opacity: 0.65;">SA</a>'
      );
    }
    if (!legalFooter.querySelector("#fflw-global-master-trigger")) {
      const trigger = document.createElement("a");
      trigger.id = "fflw-global-master-trigger";
      trigger.href = "master.html";
      trigger.title = "Zentrale Steuerung, Koordination & Copilot (Master)";
      trigger.style.cssText = "opacity: 0.55; margin-left: 6px; text-decoration: none;";
      trigger.textContent = "⚙";
      legalFooter.appendChild(document.createTextNode(" | "));
      legalFooter.appendChild(trigger);
    }
  }

  if (!document.querySelector('link[rel="manifest"]')) {
    const manifestLink = document.createElement("link");
    manifestLink.rel = "manifest";
    manifestLink.href = "manifest.json";
    document.head.appendChild(manifestLink);
  }

  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.href = "assets/logo-ffwl-neu-trans.png";
    document.head.appendChild(appleIcon);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(err => console.error("SW Fehler:", err));
  }

  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isInStandaloneMode = window.navigator.standalone === true;
  if (isIos && !isInStandaloneMode) {
    setTimeout(() => showPwaInstallBanner("ios"), 2500);
  }
});
