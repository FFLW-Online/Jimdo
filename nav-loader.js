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

  window.location.replace("index.html");
}

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'de',
    autoDisplay: false
  }, 'google_translate_hidden');
}

document.addEventListener("DOMContentLoaded", function () {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/de\/([a-zA-Z-]+)/);
  const activeLang = match ? match[1] : null;

  // CSS-Schutz: Blockiert die obere Google-Leiste UND das Bewertungs-Popup
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

        // 3. NUR wenn aktuell übersetzt wird: "🇩🇪 Deutsch"-Reset-Button ganz oben ins Menü setzen
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

  // 6. Unauffälligen "SA"-Link in der Fußzeile neben Sitemap ergänzen
  const legalFooter = document.querySelector(".legal-footer");
  if (legalFooter && !legalFooter.querySelector('a[href="intern-statistik.html"]')) {
    legalFooter.insertAdjacentHTML(
      "beforeend",
      ' | <a href="intern-statistik.html" title="Interne Statistik-Analyse" style="opacity: 0.65;">SA</a>'
    );
  }
});
