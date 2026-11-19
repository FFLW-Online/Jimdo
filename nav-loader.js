// Hilfsfunktion: Bereinigt und setzt das Google-Translate-Cookie sauber ohne Duplikate
function applyGoogleTranslateCookie(langCode) {
  const host = window.location.hostname;
  const hostParts = host.split('.');
  const rootDomain = hostParts.length > 1 ? '.' + hostParts.slice(-2).join('.') : host;

  // Zuerst alle eventuell vorhandenen alten Cookies auf allen Ebenen löschen
  const paths = ["/", "/Jimdo", "/Jimdo/"];
  const domains = ["", host, "." + host, rootDomain];
  paths.forEach(p => {
    domains.forEach(d => {
      const domainStr = d ? `; domain=${d}` : "";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${p}${domainStr};`;
    });
  });

  // Danach nur ein einziges sauberes Cookie setzen
  if (langCode && langCode !== "de") {
    document.cookie = `googtrans=/de/${langCode}; path=/;`;
    if (rootDomain && rootDomain.startsWith(".")) {
      document.cookie = `googtrans=/de/${langCode}; path=/; domain=${rootDomain};`;
    }
  }
}

// Merkt sich beim Öffnen der Sprachauswahl (fflw-international.html) die Herkunftsseite für den direkten Rücksprung
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
    } catch (e) {
      // Referrer ignorieren, falls nicht parsbar
    }
  }

  if (ret && /^[a-zA-Z0-9._-]+\.html$/.test(ret)) {
    sessionStorage.setItem("fflw_return_page", ret);
  }
})();

// Prüft, ob in der aktuellen URL (Parameter oder Hash) ausdrücklich eine Fremdsprache angefordert wurde
function getExplicitUrlLanguage() {
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  if (urlLang && urlLang !== "de") return urlLang;

  const hashMatch = window.location.hash.match(/googtrans\(de\|([a-zA-Z-]+)\)/);
  if (hashMatch && hashMatch[1] !== "de") return hashMatch[1];

  return null;
}

// Hilfsfunktion: Liest die aktuell per URL, Hash oder Cookie gesetzte Sprache aus
function getActiveLanguage() {
  const explicitLang = getExplicitUrlLanguage();
  if (explicitLang) return explicitLang;

  const cookieMatch = document.cookie.match(/(?:^|;\s*)googtrans=\/de\/([a-zA-Z-]+)/);
  return cookieMatch ? cookieMatch[1] : null;
}

// Globale Funktion zum Wechseln oder Zurücksetzen der Sprache über die Flaggen
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

// Erzwingt auf Desktop & Mobil eine echte Neu-Übersetzung dynamischer Dialoge (nur falls noch unübersetzt)
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

// Zeigt einen Fallback-Balken NUR dann, wenn der Nutzer aktiv eine Sprache gewählt hat UND der Browser blockiert
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

// Globaler Callback für Google Translate (explizit an window gebunden)
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

// Hilfsfunktion: Lädt Google Translate (sichtbar im Render-Baum, aber außerhalb des Viewports)
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

// Einheitliches, einmaliges Hinweis-Pop-up für Desktop UND Mobilgeräte
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

// Öffnet das Dialogfenster für Probleme mit dem Übersetzungstool
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

// PWA App-Installation (1-Klick-Banner für Android + Kurzhinweis für iPhone)
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

// Schützt vor eingefrorenem Handy-Cache beim Nutzen der Browser-Zurück-Taste
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});

// Baut das globale Flaggen-Laufband direkt unter dem Logo auf und hält die Header-Höhe aktuell
function initGlobalFlagBarAndStickyOffset(currentPage) {
  const siteHeader = document.querySelector(".site-header");
  if (!siteHeader) return;

  // Globales Flaggen-Laufband direkt unter dem Logo einfügen (auf allen Seiten außer der Sprachwahl selbst)
  if (currentPage !== "fflw-international.html" && !siteHeader.querySelector(".global-flag-bar")) {
    const flags = [
      "🇦🇱", "🇸🇦", "🇹🇷", "🇺🇦", "🇷🇺", "🇮🇷", "🇦🇫", "🇪🇷", "🇸🇴",
      "🇬🇧", "🇫🇷", "🇪🇸", "🇮🇹", "🇷🇴", "🇧🇬", "🇵🇱", "🇮🇳", "🇵🇰",
      "🇸🇾", "🇮🇶", "🇽🇰", "🇬🇷", "🇭🇷", "🇷🇸", "🇳🇬", "🇬🇲", "🇩🇪"
    ];
    const flagSpans = flags.map(f => `<span>${f}</span>`).join("");

    const flagBar = document.createElement("a");
    flagBar.href = `fflw-international.html?return=${encodeURIComponent(currentPage)}`;
    flagBar.className = "global-flag-bar notranslate";
    flagBar.setAttribute("translate", "no");
    flagBar.setAttribute("aria-label", "Sprache wählen / Translate page");
    flagBar.innerHTML = `
      <div class="global-flag-marquee" aria-hidden="true">
        <div class="global-flag-track">
          ${flagSpans}${flagSpans}
        </div>
      </div>
      <span class="global-flag-cta">🌐 Sprache / Language ▸</span>
    `;
    siteHeader.appendChild(flagBar);
  }

  // Exakte Höhe des Headers messen, damit das linke Desktop-Menü immer nahtlos darunter klebt
  const updateHeaderOffset = () => {
    const h = siteHeader.offsetHeight;
    if (h > 0) {
      document.documentElement.style.setProperty("--header-offset", `${h + 12}px`);
    }
  };

  updateHeaderOffset();
  window.addEventListener("resize", updateHeaderOffset);
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(updateHeaderOffset);
    ro.observe(siteHeader);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // 0. Globales Flaggen-Laufband direkt unter dem Logo & Sticky-Menü-Abstand aktivieren
  initGlobalFlagBarAndStickyOffset(currentPage);

  // 1. Sprache prüfen: Wenn URL-Parameter oder Hash eine Sprache verlangen,
  //    Cookie synchronisieren und Hinweis-Pop-up einmalig öffnen
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
          // Auch dem Menü-Link zu fflw-international.html den Rücksprung-Parameter mitgeben
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

  // 6. Unauffälligen "SA"-Link in der Fußzeile neben Sitemap ergänzen
  const legalFooter = document.querySelector(".legal-footer");
  if (legalFooter && !legalFooter.querySelector('a[href="intern-statistik.html"]')) {
    legalFooter.insertAdjacentHTML(
      "beforeend",
      ' | <a href="intern-statistik.html" title="Vereinsinterna" style="opacity: 0.65;">SA</a>'
    );
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

  // Auf iPhone/iPad (Safari) den kurzen Homescreen-Hinweis einblenden
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isInStandaloneMode = window.navigator.standalone === true;
  if (isIos && !isInStandaloneMode) {
    setTimeout(() => showPwaInstallBanner("ios"), 2500);
  }
});
