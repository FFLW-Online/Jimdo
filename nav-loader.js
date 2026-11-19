const FFLW_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzjtI-x26-DtKdZLR0B4JprIYRdi53iG2l8TKhz6HkwPYRe70eoPOcCOixRUDxEC0k7/exec";
const FFLW_GLOBAL_MASTER_CODE = "FFLW-99";
const FFLW_STATUS_CACHE_KEY = "fflw_site_status_cache_v1";

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
          <!-- Hand zeigt nach rechts -->
          <rect x="4" y="10" width="12" height="11" rx="4" fill="${handFill}"/>
          <rect x="13" y="11.5" width="12" height="3.6" rx="1.8" fill="${handFill}"/>
          <rect x="12" y="15.5" width="7" height="2.6" rx="1.3" fill="${handFill}" opacity="0.85"/>
          <rect x="11" y="18.5" width="6" height="2.4" rx="1.2" fill="${handFill}" opacity="0.75"/>
          <!-- Klick-Kreisring & Richtungsbogen an der Fingerspitze -->
          <circle cx="27" cy="13.3" r="3.5" fill="none" stroke="${waveStroke}" stroke-width="1.8" class="fflw-wave-ring"/>
          <path d="M31 9 L35 13.3 L31 17.6" fill="none" stroke="${waveStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>
    `;
  }

  // Stil A (Standard) & Stil C: Zeigehand mit konzentrischen Radar-Kreiswellen an der Fingerspitze
  return `
    <svg width="36" height="26" viewBox="0 0 38 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g ${transformAttr}>
        <!-- Stilisierte Hand mit ausgestrecktem Zeigefinger nach rechts -->
        <rect x="3" y="10" width="12" height="11" rx="4.5" fill="${handFill}"/>
        <rect x="8" y="6.5" width="4" height="6" rx="2" fill="${handFill}"/>
        <rect x="12" y="11" width="13" height="3.8" rx="1.9" fill="${handFill}"/>
        <rect x="11" y="15.2" width="7.5" height="2.6" rx="1.3" fill="${handFill}" opacity="0.82"/>
        <rect x="10" y="18.2" width="6.5" height="2.5" rx="1.25" fill="${handFill}" opacity="0.7"/>
        <!-- Konzentrische Klick-Kreiswellen an der Fingerspitze -->
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
      <!-- Linke erhobene Hand (Handfläche nach vorne = Stopp) in Blau -->
      <g transform="translate(33, 23)">
        <rect x="10" y="24" width="24" height="24" rx="8" fill="#004080"/>
        <rect x="6" y="14" width="5" height="16" rx="2.5" fill="#004080"/>
        <rect x="12" y="7" width="5" height="21" rx="2.5" fill="#004080"/>
        <rect x="18" y="4" width="5" height="23" rx="2.5" fill="#004080"/>
        <rect x="24" y="7" width="5" height="20" rx="2.5" fill="#004080"/>
        <rect x="30" y="13" width="5" height="15" rx="2.5" fill="#004080"/>
        <path d="M13 33 Q22 30 30 35" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
      <!-- Rechte erhobene Hand (Handfläche nach vorne = Stopp) in Gold/Amber -->
      <g transform="translate(76, 23)">
        <rect x="10" y="24" width="24" height="24" rx="8" fill="#d97706"/>
        <rect x="9" y="13" width="5" height="15" rx="2.5" fill="#d97706"/>
        <rect x="15" y="7" width="5" height="20" rx="2.5" fill="#d97706"/>
        <rect x="21" y="4" width="5" height="23" rx="2.5" fill="#d97706"/>
        <rect x="27" y="7" width="5" height="21" rx="2.5" fill="#d97706"/>
        <rect x="33" y="14" width="5" height="16" rx="2.5" fill="#d97706"/>
        <path d="M14 35 Q22 30 31 33" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
      <!-- Trauriger Smiley in den Vereinsfarben -->
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
  const protectedLegal = ["impressum.html", "datenschutz.html"];
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
    .catch(() => {
      // Bei Offline-/Netzwerkproblem bleibt der letzte Stand erhalten
    });
}

// ============================================================================
// 3. GLOBALES HANDY-MASTER-FENSTER (VON JEDER SEITE AUS ÖFFENBAR)
// ============================================================================
function openGlobalMasterModal(currentPage) {
  if (document.getElementById("fflw-global-master-overlay")) return;

  const eingabe = prompt("Bitte Master-Code eingeben:");
  if (!eingabe || eingabe.trim().toLowerCase() !== FFLW_GLOBAL_MASTER_CODE.toLowerCase()) {
    if (eingabe !== null) alert("Falscher Master-Code.");
    return;
  }
  const verifiedCode = eingabe.trim();

  const overlay = document.createElement("div");
  overlay.id = "fflw-global-master-overlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.72);
    z-index: 2147483647; overflow-y: auto; padding: 14px;
    box-sizing: border-box; -webkit-overflow-scrolling: touch;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #141c24; color: #ffffff; max-width: 560px; width: 100%;
    margin: 12px auto 30px auto; border-radius: 12px; overflow: hidden;
    border: 3px solid #ffd700; box-shadow: 0 12px 35px rgba(0,0,0,0.55);
    font-family: Arial, sans-serif;
  `;

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #004080; border-bottom: 2px solid #ffd700;">
      <strong style="font-size: 1.08rem; color: #ffd700;">⚙️ FFLW Webseiten-Steuerung</strong>
      <button type="button" id="fflw-gm-close" style="background: rgba(255,255,255,0.18); color: #fff; border: 1px solid #fff; padding: 5px 11px; border-radius: 6px; font-weight: bold; cursor: pointer;">✕</button>
    </div>

    <div style="padding: 18px;">
      <div id="fflw-gm-status" style="margin-bottom: 14px; font-weight: bold; color: #ffd700;">⏳ Lade aktuelle Einstellungen aus Google Drive …</div>

      <!-- BEREICH 1: FLAGGEN-LAUFBAND UNTER DEM LOGO -->
      <div style="background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <div style="font-weight: bold; color: #ffd700; margin-bottom: 8px;">🌐 Flaggen-Laufband unter dem Logo</div>
        <div id="fflw-gm-flag-btns" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button type="button" data-stil="A" class="fflw-gm-flag-opt" style="padding: 9px; border-radius: 6px; border: 2px solid #888; background: #222; color: #fff; font-weight: bold; cursor: pointer;">Stil A (Radar-Wellen)</button>
          <button type="button" data-stil="B" class="fflw-gm-flag-opt" style="padding: 9px; border-radius: 6px; border: 2px solid #888; background: #222; color: #fff; font-weight: bold; cursor: pointer;">Stil B (3D-Chip)</button>
          <button type="button" data-stil="C" class="fflw-gm-flag-opt" style="padding: 9px; border-radius: 6px; border: 2px solid #888; background: #222; color: #fff; font-weight: bold; cursor: pointer;">Stil C (Minimalistisch)</button>
          <button type="button" data-stil="OFF" class="fflw-gm-flag-opt" style="padding: 9px; border-radius: 6px; border: 2px solid #888; background: #222; color: #fff; font-weight: bold; cursor: pointer;">Ausgeblendet</button>
        </div>
      </div>

      <!-- BEREICH 2: WARENHAUS-ZUGANGSCODE -->
      <div style="background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <div style="font-weight: bold; color: #ffd700; margin-bottom: 6px;">🔑 Warenhaus-Zugangscode (aktuelle-angebote.html)</div>
        <div style="font-size: 0.85rem; color: #ccc; margin-bottom: 8px;">Leer lassen = Zugangscode-Abfrage deaktiviert.</div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="fflw-gm-code-input" placeholder="z. B. 11" style="flex: 1; padding: 9px 11px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px; color: #111; background: #fff;">
        </div>
      </div>

      <!-- BEREICH 3: WARTUNGSMODUS FÜR SEITEN (1-KLICK) -->
      <div style="background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 14px; margin-bottom: 18px;">
        <div style="font-weight: bold; color: #ffd700; margin-bottom: 8px;">🛑 Wartungsmodus (Stopp-Hände-Sperre)</div>
        <div id="fflw-gm-pages-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 270px; overflow-y: auto; padding-right: 4px;"></div>
      </div>

      <button type="button" id="fflw-gm-save" style="width: 100%; background: #2e7d32; color: #fff; border: 2px solid #fff; padding: 13px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
        💾 Einstellungen jetzt speichern
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeOverlay = () => overlay.remove();
  document.getElementById("fflw-gm-close").addEventListener("click", closeOverlay);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeOverlay(); });

  let selectedStil = "A";
  let blockedPagesSet = new Set();

  function refreshFlagButtonsUI() {
    modal.querySelectorAll(".fflw-gm-flag-opt").forEach(btn => {
      const isSel = btn.getAttribute("data-stil") === selectedStil;
      btn.style.background = isSel ? "#004080" : "#222";
      btn.style.borderColor = isSel ? "#ffd700" : "#666";
      btn.style.color = isSel ? "#ffd700" : "#ffffff";
    });
  }

  modal.querySelectorAll(".fflw-gm-flag-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedStil = btn.getAttribute("data-stil");
      refreshFlagButtonsUI();
    });
  });

  // Seitenliste aus dem geladenen Menü (#nav-list) auslesen + "Komplette Webseite"
  function buildPagesListUI() {
    const pagesContainer = document.getElementById("fflw-gm-pages-list");
    pagesContainer.innerHTML = "";

    const eintraege = [
      { file: "*", label: "🚨 KOMPLETTE WEBSEITE (alle Seiten sperren)" },
      { file: "aktuelle-angebote.html", label: "🛋️ Virtuelles Warenhaus: Aktuelle Angebote" }
    ];

    document.querySelectorAll("#nav-list a").forEach(a => {
      const rawHref = (a.getAttribute("href") || "").split("?")[0].split("#")[0].trim();
      const text = a.textContent.replace(/\s+/g, " ").trim();
      if (rawHref && rawHref.endsWith(".html") && !eintraege.some(e => e.file === rawHref)) {
        eintraege.push({ file: rawHref, label: `${text} (${rawHref})` });
      }
    });

    eintraege.forEach(item => {
      const isBlocked = blockedPagesSet.has(item.file);
      const row = document.createElement("button");
      row.type = "button";
      row.style.cssText = `
        display: flex; justify-content: space-between; align-items: center; gap: 10px;
        width: 100%; text-align: left; padding: 9px 12px; border-radius: 6px;
        border: 1px solid ${isBlocked ? "#ff8a80" : "rgba(255,255,255,0.25)"};
        background: ${isBlocked ? "rgba(183, 28, 28, 0.45)" : "rgba(255,255,255,0.06)"};
        color: #ffffff; cursor: pointer; font-size: 0.9rem;
      `;
      row.innerHTML = `
        <span style="flex: 1;">${item.label}</span>
        <span style="flex-shrink: 0; font-weight: bold; padding: 3px 8px; border-radius: 4px; background: ${isBlocked ? "#d32f2f" : "#2e7d32"};">
          ${isBlocked ? "🛑 GESPERRT" : "✓ Aktiv"}
        </span>
      `;
      row.addEventListener("click", () => {
        if (blockedPagesSet.has(item.file)) {
          blockedPagesSet.delete(item.file);
        } else {
          blockedPagesSet.add(item.file);
        }
        buildPagesListUI();
      });
      pagesContainer.appendChild(row);
    });
  }

  // Aktuellen Stand live aus Drive laden
  fetch(`${FFLW_WEB_APP_URL}?action=site_status&t=${Date.now()}`, {
    method: "GET",
    redirect: "follow"
  })
    .then(r => r.json())
    .then(data => {
      if (!data || !data.ok) {
        document.getElementById("fflw-gm-status").textContent = "❌ Fehler beim Laden.";
        return;
      }
      selectedStil = data.flaggenStil || "A";
      blockedPagesSet = new Set(Array.isArray(data.wartungSeiten) ? data.wartungSeiten : []);
      document.getElementById("fflw-gm-code-input").value = data.zugangscode || "";
      document.getElementById("fflw-gm-status").textContent = "✓ Aktueller Stand geladen. Änderungen unten speichern:";
      refreshFlagButtonsUI();
      buildPagesListUI();
    })
    .catch(err => {
      document.getElementById("fflw-gm-status").textContent = "❌ Verbindungsfehler: " + err.message;
    });

  // Speichern
  document.getElementById("fflw-gm-save").addEventListener("click", function () {
    const saveBtn = this;
    const statusEl = document.getElementById("fflw-gm-status");
    const neuerCode = document.getElementById("fflw-gm-code-input").value.trim();

    saveBtn.disabled = true;
    saveBtn.textContent = "⏳ Wird in Google Drive gespeichert …";

    fetch(FFLW_WEB_APP_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "save_site_status",
        masterCode: verifiedCode,
        flaggenStil: selectedStil,
        wartungSeiten: Array.from(blockedPagesSet),
        zugangscode: neuerCode
      })
    })
      .then(r => r.json())
      .then(res => {
        if (res && res.ok) {
          const fresh = {
            wartungSeiten: res.wartungSeiten || [],
            flaggenStil: res.flaggenStil || "A",
            zugangscode: res.zugangscode || ""
          };
          setCachedSiteStatus(fresh);
          renderGlobalFlagBar(currentPage, fresh.flaggenStil);
          applyMaintenanceStateToPage(currentPage, fresh.wartungSeiten);
          updateStickyHeaderOffset();

          statusEl.textContent = "✅ Gespeichert und sofort auf der gesamten Webseite aktiv!";
          saveBtn.style.background = "#1b5e20";
          saveBtn.textContent = "✅ Gespeichert!";
          setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.style.background = "#2e7d32";
            saveBtn.textContent = "💾 Einstellungen jetzt speichern";
          }, 1800);
        } else {
          alert("Fehler: " + (res && res.error ? res.error : "Unbekannt"));
          saveBtn.disabled = false;
          saveBtn.textContent = "💾 Einstellungen jetzt speichern";
        }
      })
      .catch(err => {
        alert("Verbindungsfehler: " + err.message);
        saveBtn.disabled = false;
        saveBtn.textContent = "💾 Einstellungen jetzt speichern";
      });
  });
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
  const storedReturn = sessionStorage.getItem("fflw_return_page");
  const targetPage = (storedReturn && /^[a-zA-Z0-9._-]+\.html$/.test(storedReturn))
    ? storedReturn
    : "index.html";
  sessionStorage.removeItem("fflw_return_page");

  if (langCode === "de") {
    applyGoogleTranslateCookie("de");
    sessionStorage.removeItem("fflw_i18n_hint_shown");
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
        const hintOverlay = document.getElementById("fflw-lang-hint-overlay");
        if (hintOverlay) {
          setTimeout(() => forceGoogleTranslatePopup(targetLang, hintOverlay), 200);
        }
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
    forceGoogleTranslatePopup(activeLang, document.getElementById("fflw-lang-hint-overlay"));
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

function showLanguageHintOnce(activeLang) {
  if (!activeLang || activeLang === "de") return;
  if (sessionStorage.getItem("fflw_i18n_hint_shown") === "true") return;

  sessionStorage.setItem("fflw_i18n_hint_shown", "true");

  const overlay = document.createElement("div");
  overlay.id = "fflw-lang-hint-overlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65);
    display: block; z-index: 2147483647;
    padding: 10px 12px 24px 12px; box-sizing: border-box;
    overflow-y: auto; overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #ffffff; color: #1a1a1a; max-width: 480px; width: 100%;
    margin: min(4vh, 32px) auto 16px auto; border-radius: 8px; overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    border-top: 5px solid #2e7d32; font-family: inherit; line-height: 1.5;
  `;

  const deBtnStyle = `
    display: inline-block; background: #1a237e; color: #ffffff;
    border: 1px solid #0d145a; padding: 2px 8px; border-radius: 4px;
    font-weight: bold; font-size: 0.88rem; text-decoration: none;
    cursor: pointer; vertical-align: baseline;
  `;

  const inlineOkBtnStyle = `
    display: inline-block; background: #2e7d32; color: #ffffff;
    border: none; padding: 2px 9px; border-radius: 4px;
    font-weight: bold; font-size: 0.88rem; cursor: pointer;
    vertical-align: baseline;
  `;

  modal.innerHTML = `
    <div style="position: sticky; top: 0; z-index: 2; padding: 10px 14px; background: #f4f7f4; border-bottom: 1px solid #d5e2d5; display: flex; gap: 10px; justify-content: space-between; align-items: center;">
      <button type="button" id="fflw-hint-help-btn"
              style="background: #fdecea; color: #a61d24; border: 1px solid #e57373; padding: 6px 10px; border-radius: 5px; font-size: 0.76rem; font-weight: bold; line-height: 1.25; text-align: left; cursor: pointer; max-width: 230px;">
        🌐 Probleme mit dem<br>Übersetzungstool
      </button>
      <button type="button" id="fflw-hint-ok-btn"
              style="background: #2e7d32; color: #ffffff; border: none; padding: 8px 24px; border-radius: 5px; font-weight: bold; font-size: 0.95rem; cursor: pointer; flex-shrink: 0;">
        OK
      </button>
    </div>

    <div style="padding: 18px 20px 20px 20px;">
      <h3 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 1.12rem;">
        Hinweis zur Sprachauswahl
      </h3>
      <p style="margin: 0 0 10px 0; font-size: 0.92rem;">
        Aus technischen Gründen können Sie immer nur von "Deutsch" in eine andere Sprache wechseln.
      </p>
      <p style="margin: 0 0 12px 0; font-size: 0.92rem;">
        Falls Sie jetzt auch noch eine andere Sprache als die vorher gewählte ausprobieren möchten, dann müssen Sie zuerst wieder "Deutsch" auswählen.
        Das können Sie entweder hier (<a href="index.html" class="fflw-hint-de-reset notranslate" translate="no" style="${deBtnStyle}">🇩🇪 Deutsch (Original)</a>) oder im Menü machen.
      </p>
      <p style="margin: 0 0 14px 0; font-size: 0.86rem; color: #444; background: #f7f9fc; padding: 9px 10px; border-radius: 5px;">
        Funktioniert die automatische Übersetzung nicht richtig? Nur bei technischen Problemen nutzen Sie bitte den Knopf <strong>„Probleme mit dem Übersetzungstool“</strong> (oben oder im Menü).
      </p>
      <p style="margin: 0; font-size: 0.9rem; font-weight: bold; color: #2e7d32; text-align: center;">
        Um jetzt die Webseite in Ihrer gewünschten Sprache anzusehen, drücken Sie bitte oben auf den
        <button type="button" id="fflw-hint-ok-inline-btn" style="${inlineOkBtnStyle}">OK</button>-Knopf ↑
      </p>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  overlay.scrollTop = 0;

  setTimeout(() => forceGoogleTranslatePopup(activeLang, modal), 450);
  setTimeout(() => forceGoogleTranslatePopup(activeLang, modal), 1300);

  const closeModal = () => overlay.remove();

  modal.querySelectorAll(".fflw-hint-de-reset").forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      closeModal();
      setLanguage("de");
    });
  });

  document.getElementById("fflw-hint-help-btn").addEventListener("click", function () {
    closeModal();
    openTranslationHelpDialog(activeLang);
  });

  document.getElementById("fflw-hint-ok-btn").addEventListener("click", closeModal);
  document.getElementById("fflw-hint-ok-inline-btn").addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
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

  // 0. Globales Flaggen-Laufband, Sticky-Header-Höhe & globale Wartungs-Sperre aktivieren
  syncGlobalSiteStatus(currentPage);
  window.addEventListener("resize", updateStickyHeaderOffset);
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader && "ResizeObserver" in window) {
    new ResizeObserver(updateStickyHeaderOffset).observe(siteHeader);
  }

  // 1. Sprache prüfen
  let explicitLang = null;
  let activeLang = null;
  try {
    explicitLang = getExplicitUrlLanguage();
    activeLang = getActiveLanguage();

    if (activeLang && activeLang !== "de") {
      applyGoogleTranslateCookie(activeLang);
      if (explicitLang) {
        showLanguageHintOnce(activeLang);
      }
    }
  } catch (err) {
    console.error("Sprach-Init Fehler:", err);
  }

  // 2. Alle DocuSeal-Links auf allen Unterseiten automatisch auf die saubere Vorlage setzen
  const cleanDocuSealUrl = "https://docuseal.com/d/Mcvg84UEAD5aay";
  document.querySelectorAll('a[href*="docuseal.com"]').forEach(link => {
    link.href = cleanDocuSealUrl;
  });

  // 3. CSS-Schutz: Blockiert die obere Google-Leiste UND das Bewertungs-Popup
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

  // 4. Navigation laden und Google Translate starten
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
          resetLink.href = "index.html";
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

  // 5. GoatCounter Besucherzähler für "fflw" (Cookie-frei & DSGVO-konform)
  const goatCounterSite = "fflw";
  const gcScript = document.createElement("script");
  gcScript.async = true;
  gcScript.src = "//gc.zgo.at/count.js";
  gcScript.setAttribute("data-goatcounter", `https://${goatCounterSite}.goatcounter.com/count`);
  document.body.appendChild(gcScript);

  // 6. Unauffälligen "SA"-Link & globalen Master-Schalter "⚙" in der Fußzeile ergänzen
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
      trigger.href = "#";
      trigger.title = "Webseiten-Steuerung (Master)";
      trigger.style.cssText = "opacity: 0.55; margin-left: 6px; text-decoration: none;";
      trigger.textContent = "⚙";
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        openGlobalMasterModal(currentPage);
      });
      legalFooter.appendChild(document.createTextNode(" | "));
      legalFooter.appendChild(trigger);
    }
  }

  // 7. PWA-Manifest, Apple-Icon und Service Worker zentral registrieren
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
