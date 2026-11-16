// Globale Funktion zum Wechseln oder Zurücksetzen der Sprache über die Flaggen
function setLanguage(langCode) {
  const host = window.location.hostname;
  const hostParts = host.split('.');
  const rootDomain = hostParts.length > 1 ? '.' + hostParts.slice(-2).join('.') : host;

  if (langCode === "de") {
    const paths = ["/", "/Jimdo", "/Jimdo/"];
    const domains = ["", host, "." + host, rootDomain];

    paths.forEach(p => {
      domains.forEach(d => {
        const domainStr = d ? `; domain=${d}` : "";
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${p}${domainStr};`;
      });
    });
    sessionStorage.removeItem("fflw_i18n_hint_shown");
  } else {
    document.cookie = `googtrans=/de/${langCode}; path=/;`;
    document.cookie = `googtrans=/de/${langCode}; path=/; domain=${host};`;
  }

  const targetUrl = langCode === "de" ? "index.html" : `index.html?lang=${langCode}`;
  window.location.replace(targetUrl);
}

// Hilfsfunktion: Liest die aktuell per Cookie gesetzte Sprache aus
function getActiveLanguage() {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/de\/([a-zA-Z-]+)/);
  return match ? match[1] : null;
}

// Initialisiert Google Translate und erzwingt sofortige Übersetzung
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'de',
    autoDisplay: false
  }, 'google_translate_hidden');

  const targetLang = getActiveLanguage();
  if (targetLang && targetLang !== "de") {
    let attempts = 0;
    const triggerInterval = setInterval(function () {
      const combo = document.querySelector(".goog-te-combo");
      attempts++;
      if (combo) {
        if (combo.value !== targetLang) {
          combo.value = targetLang;
          combo.dispatchEvent(new Event("change"));
        }
        clearInterval(triggerInterval);
      } else if (attempts > 30) {
        clearInterval(triggerInterval);
      }
    }, 200);
  }
}

// Hilfsfunktion: Lädt Google Translate erst, wenn Menü und Hinweis-Box im DOM stehen
function startGoogleTranslate(activeLang) {
  if (!activeLang || activeLang === "de") return;
  if (document.getElementById("google_translate_hidden")) return;

  const hiddenDiv = document.createElement("div");
  hiddenDiv.id = "google_translate_hidden";
  hiddenDiv.style.display = "none";
  document.body.appendChild(hiddenDiv);

  const gtScript = document.createElement("script");
  gtScript.type = "text/javascript";
  gtScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(gtScript);
}

// Öffnet das kompakte Hilfe-Dialogfenster (1-Klick-Versand + optionale Felder + Bot-Schutz)
function openTranslationHelpDialog(activeLang) {
  if (document.getElementById("fflw-help-dialog-overlay")) return;

  const openedAt = Date.now();
  const overlay = document.createElement("div");
  overlay.id = "fflw-help-dialog-overlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 100000; padding: 16px;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #ffffff; color: #1a1a1a; max-width: 440px; width: 100%;
    border-radius: 8px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.35);
    border-top: 5px solid #d32f2f; font-family: inherit; line-height: 1.5;
  `;

  modal.innerHTML = `
    <h3 style="margin: 0 0 8px 0; color: #b71c1c; font-size: 1.15rem;">
      🆘 Hilfe anfordern
    </h3>
    <p style="margin: 0 0 14px 0; font-size: 0.92rem; color: #333;">
      Sie können einfach direkt auf <strong>Senden</strong> drücken – wir sehen automatisch, welche Sprache und Seite geöffnet ist. Alle Felder darunter sind freiwillig.
    </p>
    <form id="fflw-help-form">
      <!-- Unsichtbares Honigtopf-Feld gegen Bots -->
      <div style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;" aria-hidden="true">
        <label for="fflw-hp-website">Website</label>
        <input type="text" id="fflw-hp-website" name="website" tabindex="-1" autocomplete="off">
      </div>

      <label for="fflw-help-msg" style="display: block; font-size: 0.88rem; font-weight: bold; margin-bottom: 4px;">
        Optional: Nachricht in Ihrer Sprache
      </label>
      <textarea id="fflw-help-msg" rows="3" placeholder="..."
                style="width: 100%; padding: 8px; border: 1px solid #bbb; border-radius: 5px; font-family: inherit; font-size: 0.95rem; box-sizing: border-box; margin-bottom: 12px;"></textarea>

      <label for="fflw-help-email" style="display: block; font-size: 0.88rem; font-weight: bold; margin-bottom: 4px;">
        Optional: Ihre E-Mail-Adresse für Rückfragen
      </label>
      <input type="email" id="fflw-help-email" placeholder="name@example.com"
             style="width: 100%; padding: 8px; border: 1px solid #bbb; border-radius: 5px; font-family: inherit; font-size: 0.95rem; box-sizing: border-box; margin-bottom: 16px;">

      <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
        <button type="button" id="fflw-help-cancel-btn"
                style="background: #eeeeee; color: #333333; border: none; padding: 9px 16px; border-radius: 5px; font-weight: bold; font-size: 0.92rem; cursor: pointer;">
          Abbrechen
        </button>
        <button type="submit" id="fflw-help-submit-btn"
                style="background: #d32f2f; color: #ffffff; border: none; padding: 9px 20px; border-radius: 5px; font-weight: bold; font-size: 0.95rem; cursor: pointer;">
          Senden
        </button>
      </div>
    </form>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

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
      submitBtn.style.background = "#2e7d32";
      submitBtn.textContent = "✅ OK!";
      setTimeout(closeDialog, 1300);
    };

    // 1. Harter Bot-Check (Honigtopf gefüllt, unter 2 Sek. abgeschickt oder Sitzungslimit > 2):
    // Silent Drop -> Vorgaukeln von Erfolg, aber nichts versenden
    if (honeypotVal !== "" || elapsedMs < 2000 || sentCount >= 2) {
      setTimeout(showFakeOrRealSuccess, 400);
      return;
    }

    sessionStorage.setItem("fflw_help_sent_count", String(sentCount + 1));

    // 2. Verdächtige Merkmale prüfen (Links im Nachrichtentext -> Betreff markieren)
    const hasSuspiciousLinks = /(https?:\/\/|www\.|<a\s)/i.test(userMsg);
    const subjectPrefix = hasSuspiciousLinks ? "[SPAM-VERDACHT] " : "";

    // 1-Klick-Übersetzungslink für das FFLW-Postfach generieren, falls Text eingegeben wurde
    const translateLink = userMsg
      ? `https://translate.google.com/?sl=auto&tl=de&text=${encodeURIComponent(userMsg)}&op=translate`
      : "Keine Nachricht eingegeben (1-Klick-Notruf)";

    const payload = {
      _subject: `${subjectPrefix}Notruf Übersetzungstool (Sprache: ${activeLang})`,
      _captcha: "false",
      _template: "table",
      Meldung: "Hilfe-Knopf beim Übersetzungstool wurde ausgelöst.",
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

// Einmaliges schwebendes Hinweisfenster nach dem ersten Sprachwechsel
function showLanguageHintOnce(activeLang) {
  if (!activeLang || activeLang === "de") return;
  if (sessionStorage.getItem("fflw_i18n_hint_shown") === "true") return;

  sessionStorage.setItem("fflw_i18n_hint_shown", "true");

  const overlay = document.createElement("div");
  overlay.id = "fflw-lang-hint-overlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 99999; padding: 16px;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #ffffff; color: #1a1a1a; max-width: 440px; width: 100%;
    border-radius: 8px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    border-top: 5px solid #004080; font-family: inherit; line-height: 1.5;
  `;

  modal.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #004080; font-size: 1.15rem;">
      Hinweis zur Sprachauswahl
    </h3>
    <p style="margin: 0 0 10px 0; font-size: 0.95rem;">
      Sie können im Menü jederzeit über den Punkt
      <strong class="notranslate" translate="no" style="background: #eef3fa; padding: 2px 6px; border-radius: 4px; color: #1a237e;">🇩🇪 Deutsch (Original)</strong>
      zur deutschen Originalsprache zurückkehren.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 0.95rem;">
      Wenn Sie in eine <strong>andere Sprache</strong> wechseln möchten, gehen Sie bitte zuerst über diesen Knopf zurück zu Deutsch und wählen Sie danach eine neue Flagge aus.
    </p>
    <p style="margin: 0 0 18px 0; font-size: 0.9rem; color: #444; background: #f7f9fc; padding: 10px; border-radius: 5px;">
      Gibt es Schwierigkeiten mit der Übersetzung? Über den Hilfe-Knopf (hier oder oben im Menü) können Sie uns direkt benachrichtigen.
    </p>
    <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
      <button type="button" id="fflw-hint-help-btn"
              style="background: #fff3f3; color: #b71c1c; border: 1px solid #d32f2f; padding: 9px 14px; border-radius: 5px; font-weight: bold; font-size: 0.92rem; cursor: pointer;">
        🆘 Help / Hilfe
      </button>
      <button type="button" id="fflw-hint-ok-btn"
              style="background: #004080; color: #ffffff; border: none; padding: 9px 20px; border-radius: 5px; font-weight: bold; font-size: 0.95rem; cursor: pointer;">
        OK
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeModal = () => overlay.remove();

  document.getElementById("fflw-hint-help-btn").addEventListener("click", function () {
    closeModal();
    openTranslationHelpDialog(activeLang);
  });

  document.getElementById("fflw-hint-ok-btn").addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
}

// Schützt vor eingefrorenem Handy-Cache beim Nutzen der Browser-Zurück-Taste
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // 1. URL-Parameter ?lang=xx sofort mit Cookie synchronisieren
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("lang");
  if (urlLang && urlLang !== "de") {
    document.cookie = `googtrans=/de/${urlLang}; path=/;`;
    document.cookie = `googtrans=/de/${urlLang}; path=/; domain=${window.location.hostname};`;
  }

  const activeLang = getActiveLanguage();

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

  // 4. Navigation laden, Hinweis-Box vorbereiten und Google Translate starten
  const navContainer = document.getElementById("main-nav");
  if (navContainer) {
    fetch("nav.html")
      .then(response => {
        if (!response.ok) throw new Error("Menü konnte nicht geladen werden.");
        return response.text();
      })
      .then(html => {
        navContainer.innerHTML = html;

        // DocuSeal-Links prüfen, falls auch im Menü einer vorkommt
        navContainer.querySelectorAll('a[href*="docuseal.com"]').forEach(link => {
          link.href = cleanDocuSealUrl;
        });

        // Aktuelle Seite im Menü markieren & übergeordnetes Sub-Menü öffnen
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        const links = navContainer.querySelectorAll("a");

        links.forEach(link => {
          if (link.getAttribute("href") === currentPath) {
            link.setAttribute("aria-current", "page");
            link.classList.add("active");
            const parentDetails = link.closest("details");
            if (parentDetails) {
              parentDetails.setAttribute("open", "");
            }
          }
        });

        // Mobile-Menü Toggle (Ein-/Ausklappen)
        const toggleBtn = document.getElementById("menu-toggle");
        const navList = document.getElementById("nav-list");

        if (toggleBtn && navList) {
          toggleBtn.addEventListener("click", function () {
            navList.classList.toggle("is-open");
          });
        }

        // NUR wenn aktuell übersetzt wird: "🇩🇪 Deutsch"-Reset + dauerhaften Hilfe-Knopf oben ins Menü setzen
        if (activeLang && activeLang !== "de" && navList) {
          const helpLi = document.createElement("li");
          helpLi.style.backgroundColor = "#7f1d1d";
          helpLi.style.borderBottom = "2px solid #ffd700";

          const helpMenuLink = document.createElement("a");
          helpMenuLink.href = "#";
          helpMenuLink.textContent = "🆘 Help / Hilfe";
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

        // 5. Einmaligen Hinweis einblenden & Übersetzung für Menü + Fenster starten
        showLanguageHintOnce(activeLang);
        startGoogleTranslate(activeLang);
      })
      .catch(error => {
        console.error(error);
        showLanguageHintOnce(activeLang);
        startGoogleTranslate(activeLang);
      });
  } else {
    showLanguageHintOnce(activeLang);
    startGoogleTranslate(activeLang);
  }

  // 6. GoatCounter Besucherzähler für "fflw" (Cookie-frei & DSGVO-konform)
  const goatCounterSite = "fflw";
  const gcScript = document.createElement("script");
  gcScript.async = true;
  gcScript.src = "//gc.zgo.at/count.js";
  gcScript.setAttribute("data-goatcounter", `https://${goatCounterSite}.goatcounter.com/count`);
  document.body.appendChild(gcScript);

  // 7. Unauffälligen "SA"-Link in der Fußzeile neben Sitemap ergänzen
  const legalFooter = document.querySelector(".legal-footer");
  if (legalFooter && !legalFooter.querySelector('a[href="intern-statistik.html"]')) {
    legalFooter.insertAdjacentHTML(
      "beforeend",
      ' | <a href="intern-statistik.html" title="Vereinsinterna" style="opacity: 0.65;">SA</a>'
    );
  }
});
