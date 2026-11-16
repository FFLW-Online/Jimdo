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

// Hilfsfunktion: Lädt Google Translate erst, wenn das Menü bereits im DOM steht
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

  // 4. Navigation laden und erst DANACH Google Translate starten
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

        // NUR wenn aktuell übersetzt wird: "🇩🇪 Deutsch"-Reset-Button ganz oben ins Menü setzen
        if (activeLang && activeLang !== "de" && navList) {
          const resetLi = document.createElement("li");
          resetLi.style.backgroundColor = "#1a237e";
          resetLi.style.borderBottom = "2px solid #ffd700";

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

        // Jetzt, wo Menü + Seite komplett bereitstehen, Übersetzung starten
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
});
