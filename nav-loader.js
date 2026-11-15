// Globale Funktion zum Wechseln oder Zurücksetzen der Sprache über die Flaggen
function setLanguage(langCode) {
  const domain = window.location.hostname;
  if (langCode === "de") {
    // Cookie löschen -> Zurück zum deutschen Original
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + domain + ";";
  } else {
    // Sitzungs-Cookie für die gewählte Sprache setzen (gilt für alle Unterseiten)
    document.cookie = "googtrans=/de/" + langCode + "; path=/;";
    document.cookie = "googtrans=/de/" + langCode + "; path=/; domain=" + domain + ";";
  }
  window.location.href = "index.html";
}

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'de',
    autoDisplay: false
  }, 'google_translate_hidden');
}

document.addEventListener("DOMContentLoaded", function () {
  // Prüfen, ob aktuell eine Fremdsprache per Cookie aktiv ist
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/de\/([a-zA-Z-]+)/);
  const activeLang = match ? match[1] : null;

  // CSS-Schutz: Verhindert, dass Google oben eine Leiste einblendet und das Handy-Menü verdeckt
  const hideBarStyle = document.createElement("style");
  hideBarStyle.textContent = `
    .goog-te-banner-frame.skiptranslate, iframe.skiptranslate { display: none !important; }
    body { top: 0 !important; }
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

        // 1. Aktuelle Seite im Menü markieren & übergeordnetes Sub-Menü öffnen
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

        // 2. Mobile-Menü Toggle (Ein-/Ausklappen)
        const toggleBtn = document.getElementById("menu-toggle");
        const navList = document.getElementById("nav-list");

        if (toggleBtn && navList) {
          toggleBtn.addEventListener("click", function () {
            navList.classList.toggle("is-open");
          });
        }

        // 3. NUR wenn aktuell übersetzt wird: "🇩🇪 Deutsch"-Reset-Button ins Menü einfügen
        if (activeLang && activeLang !== "de" && navList) {
          const resetLi = document.createElement("li");
          resetLi.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
          resetLi.style.borderBottom = "1px solid rgba(255, 255, 255, 0.3)";
          resetLi.innerHTML = `<a href="#" onclick="setLanguage('de'); return false;" class="notranslate" translate="no">🇩🇪 Deutsch (Original)</a>`;
          navList.prepend(resetLi);
        }
      })
      .catch(error => console.error(error));
  }

  // 4. Google Translate nur im Hintergrund laden, wenn eine Sprache gewählt wurde
  if (activeLang && activeLang !== "de") {
    const hiddenDiv = document.createElement("div");
    hiddenDiv.id = "google_translate_hidden";
    hiddenDiv.style.display = "none";
    document.body.appendChild(hiddenDiv);

    const gtScript = document.createElement("script");
    gtScript.type = "text/javascript";
    gtScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(gtScript);
  }

  // 5. GoatCounter Besucherzähler für "fflw" (Cookie-frei & DSGVO-konform)
  const goatCounterSite = "fflw";
  const gcScript = document.createElement("script");
  gcScript.async = true;
  gcScript.src = "//gc.zgo.at/count.js";
  gcScript.setAttribute("data-goatcounter", `https://${goatCounterSite}.goatcounter.com/count`);
  document.body.appendChild(gcScript);
});
