document.addEventListener("DOMContentLoaded", function () {
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

        // 3. Google-Übersetzungs-Widget direkt ins Menü einfügen
        const translateBox = document.createElement("div");
        translateBox.id = "google_translate_element";
        translateBox.style.padding = "10px 18px";
        translateBox.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
        translateBox.style.borderBottom = "1px solid rgba(255, 255, 255, 0.15)";
        
        if (navList) {
          navContainer.insertBefore(translateBox, navList);
        } else {
          navContainer.prepend(translateBox);
        }

        const gtScript = document.createElement("script");
        gtScript.type = "text/javascript";
        gtScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(gtScript);
      })
      .catch(error => console.error(error));
  }

  // 4. GoatCounter Besucherzähler für "fflw" (Cookie-frei & DSGVO-konform)
  const goatCounterSite = "fflw"; 
  
  const gcScript = document.createElement("script");
  gcScript.async = true;
  gcScript.src = "//gc.zgo.at/count.js";
  gcScript.setAttribute("data-goatcounter", `https://${goatCounterSite}.goatcounter.com/count`);
  document.body.appendChild(gcScript);
});

// Initialisierungsfunktion für Google Translate
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'de',
    autoDisplay: false
  }, 'google_translate_element');
}
