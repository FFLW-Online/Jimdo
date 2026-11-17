// Sprachauswahl-Untermenü (ÜTool / Flaggen) während aktiver Übersetzung ausblenden,
          // damit erst über „🇩🇪 Deutsch (Original)“ gewechselt wird
          navContainer.querySelectorAll("details, li").forEach(el => {
            const hasLangTrigger = el.querySelector('[onclick*="setLanguage"]');
            const isSummaryUTool = el.tagName === "DETAILS" && /ütool/i.test(el.textContent);
            if (isSummaryUTool || (hasLangTrigger && el.tagName === "DETAILS")) {
              el.style.display = "none";
            }
          });
