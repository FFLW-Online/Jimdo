/**
 * Warenhaus & Aktions-Plattform v26
 * Beinhaltet alle 8 Kernpunkte + Feedbackformular + Export-Funktionen (keine toten Knöpfe)
 */
const ACTIVE_CAMPAIGN = "AKTION-2026-Q4";
const STORAGE_KEY = "warenhaus_v26_state";

const GITHUB_COMMITS = [
    "feat(media): separate originals/thumbnails folders, compress uploads to protect repo size",
    "feat(media): eliminate recursive folder scans via status flag and active-campaign scope",
    "feat(media): add EXIF auto-rotation and uniform square padded thumbnails",
    "feat(ai): switch to apparel/shoe size labels and suppress dimension guessing for clothing",
    "perf(ui): load thumbnails in grid, fetch originals on click, use rotating spinner fallback",
    "feat(auth): add persistent supermaster direct access route and guard",
    "feat(analytics): implement access stats reset with confirmation modal and live state update",
    "feat(offers): wire inline quick-actions and remove dead buttons near text export",
    "feat(ideas): add ideas list view with sorting, permissions, and empty state"
];

let state = loadState();

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.warn("Reset corrupt state"); }
    }
    const demoThumb1 = ThumbnailEngine.createPlaceholderThumb("Kaffeemaschine");
    const demoThumb2 = ThumbnailEngine.createPlaceholderThumb("Winterstiefel Gr. 42");
    const demoThumb3 = ThumbnailEngine.createPlaceholderThumb("Outdoor-Jacke (L)");

    return {
        supermasterUnlocked: false,
        stats: { views: 142, originalClicks: 28 },
        items: [
            {
                id: "ART-101",
                title: "Espresso-Maschine Kompakt",
                category: "standard",
                sizeText: "32 x 24 x 35 cm",
                campaign: ACTIVE_CAMPAIGN,
                thumbnail_ready: true,
                thumbSrc: demoThumb1,
                origSrc: demoThumb1
            },
            {
                id: "ART-102",
                title: "Wander- & Winterstiefel",
                category: "shoes",
                sizeText: "Schuhgröße 42 (Etikett geprüft)",
                campaign: ACTIVE_CAMPAIGN,
                thumbnail_ready: true,
                thumbSrc: demoThumb2,
                origSrc: demoThumb2
            },
            {
                id: "ART-103",
                title: "Funktionsjacke Herren",
                category: "clothing",
                sizeText: "Kleidergröße L (Hinweis: Kleidung kein Schwerpunkt)",
                campaign: ACTIVE_CAMPAIGN,
                thumbnail_ready: true,
                thumbSrc: demoThumb3,
                origSrc: demoThumb3
            }
        ],
        offers: [
            { id: "ANG-201", title: "Paket Haushalt & Küche", campaign: ACTIVE_CAMPAIGN, status: "Offen" },
            { id: "ANG-202", title: "Restposten Winterschuhe", campaign: ACTIVE_CAMPAIGN, status: "Angenommen" }
        ],
        ideas: [
            { id: "ID-1", title: "Barcode-Scanner für Wareneingang", author: "Team Süd", votes: 9, createdAt: 1732400000000 },
            { id: "ID-2", title: "Sammel-Export für Monatsabschluss", author: "Supermaster", votes: 14, createdAt: 1732450000000 }
        ],
        feedbacks: []
    };
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showLoader(text = "Lade Daten...") {
    document.getElementById("loader-text").textContent = text;
    document.getElementById("global-loader").classList.remove("hidden");
}

function hideLoader() {
    document.getElementById("global-loader").classList.add("hidden");
}

// Initialisierung
document.addEventListener("DOMContentLoaded", () => {
    // Seitenaufruf zählen
    state.stats.views += 1;
    saveState();

    // Supermaster-Status nach Reload beibehalten
    if (state.supermasterUnlocked || window.location.hash === "#supermaster") {
        state.supermasterUnlocked = true;
        saveState();
        openSupermasterPanel();
    }

    setupNavigation();
    setupWarehouse();
    setupOffers();
    setupIdeas();
    setupFeedbackAndFooter();
    updateStatsUI();
});

// Navigation zwischen Views
function setupNavigation() {
    document.querySelectorAll(".nav-btn[data-target]").forEach(btn => {
        btn.addEventListener("click", () => {
            switchView(btn.dataset.target);
        });
    });

    // Supermaster Direktzugang
    document.getElementById("btn-supermaster-direct").addEventListener("click", () => {
        if (!state.supermasterUnlocked) {
            const code = prompt("Supermaster-Direktzugang (Passcode eingeben, Standard: 2026):", "2026");
            if (code !== "2026") {
                alert("Zugang verweigert.");
                return;
            }
            state.supermasterUnlocked = true;
            saveState();
        }
        openSupermasterPanel();
    });

    document.getElementById("btn-close-supermaster").addEventListener("click", () => {
        document.getElementById("supermaster-panel").classList.add("hidden");
    });

    // Zugriffsstatistik-Reset mit Sicherheitsabfrage & Live-Update
    document.getElementById("btn-reset-stats").addEventListener("click", () => {
        if (confirm("Zugriffsstatistik wirklich unwiderruflich auf 0 zurücksetzen?")) {
            state.stats = { views: 0, originalClicks: 0 };
            saveState();
            updateStatsUI();
            alert("Zugriffsstatistik wurde auf 0 zurückgesetzt.");
        }
    });

    // Anti-Mega-Scan Thumbnail-Sync (nur aktuelle Aktionswährung & thumbnail_ready === false)
    document.getElementById("btn-sync-thumbs").addEventListener("click", () => {
        showLoader("Prüfe ausschließlich aktuelle Aktionswährung...");
        setTimeout(() => {
            const pending = state.items.filter(
                i => i.campaign === ACTIVE_CAMPAIGN && !i.thumbnail_ready
            );
            pending.forEach(item => {
                item.thumbSrc = ThumbnailEngine.createPlaceholderThumb(item.title);
                item.thumbnail_ready = true;
            });
            saveState();
            renderWarehouse();
            updateStatsUI();
            hideLoader();
            alert(`Fertig! ${pending.length} fehlende Thumbnails in ${ACTIVE_CAMPAIGN} verarbeitet. Alte Ordner wurden ignoriert.`);
        }, 350);
    });
}

function switchView(targetId) {
    document.querySelectorAll(".view-section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(targetId).classList.remove("hidden");
    document.querySelectorAll(".nav-btn[data-target]").forEach(b => {
        b.classList.toggle("active", b.dataset.target === targetId);
    });
}

function openSupermasterPanel() {
    const panel = document.getElementById("supermaster-panel");
    panel.classList.remove("hidden");
    document.getElementById("btn-supermaster-direct").classList.add("active-mode");
    updateStatsUI();
}

function updateStatsUI() {
    document.getElementById("stat-views").textContent = state.stats.views;
    document.getElementById("stat-clicks").textContent = state.stats.originalClicks;
    const activeItems = state.items.filter(i => i.campaign === ACTIVE_CAMPAIGN);
    const readyCount = activeItems.filter(i => i.thumbnail_ready).length;
    document.getElementById("stat-thumbs").textContent = `${readyCount} / ${activeItems.length} bereit`;
}

// 1 & 2. Warenhaus, Thumbnails & KI-Größenlogik für Kleidung/Schuhe
function setupWarehouse() {
    const uploadPanel = document.getElementById("upload-panel");
    const catSelect = document.getElementById("item-category");
    const sizeLabel = document.getElementById("item-size-label");
    const sizeInput = document.getElementById("item-size");
    const aiHint = document.getElementById("ai-size-hint");
    const titleInput = document.getElementById("item-title");

    document.getElementById("btn-open-upload").addEventListener("click", () => {
        uploadPanel.classList.remove("hidden");
    });
    document.getElementById("btn-cancel-upload").addEventListener("click", () => {
        uploadPanel.classList.add("hidden");
    });

    // Automatische KI-Schlagworterkennung beim Tippen des Titels
    titleInput.addEventListener("input", () => {
        const val = titleInput.value.toLowerCase();
        if (/(schuh|stiefel|sneaker|sandale|pumps)/.test(val)) {
            catSelect.value = "shoes";
            updateCategoryFields();
        } else if (/(jacke|hose|hemd|kleid|pullover|shirt|mantel|rock)/.test(val)) {
            catSelect.value = "clothing";
            updateCategoryFields();
        }
    });

    catSelect.addEventListener("change", updateCategoryFields);

    function updateCategoryFields() {
        const cat = catSelect.value;
        if (cat === "shoes") {
            sizeLabel.textContent = "Schuhgröße (z. B. EU 42) *";
            sizeInput.placeholder = "z. B. 42 (bitte Etikett prüfen)";
            aiHint.textContent = "KI-Hinweis: Normale cm-Maße deaktiviert – Schuhgröße aktiv.";
        } else if (cat === "clothing") {
            sizeLabel.textContent = "Kleidergröße (S / M / L / Konfektion)";
            sizeInput.placeholder = "z. B. L oder 40 (falls unbekannt: Nachfragen)";
            aiHint.textContent = "KI-Hinweis: Kleidung ist kein Hauptschwerpunkt – cm-Schätzung unterdrückt.";
        } else {
            sizeLabel.textContent = "Abmessungen (cm)";
            sizeInput.placeholder = "z. B. 40 x 30 x 20 cm";
            aiHint.textContent = "";
        }
    }

    document.getElementById("item-upload-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        showLoader("Drehe Bild (EXIF) & erzeuge 300x300 Thumbnail...");
        try {
            const title = titleInput.value.trim();
            const category = catSelect.value;
            let rawSize = sizeInput.value.trim();

            if (category === "shoes") {
                rawSize = rawSize ? `Schuhgröße ${rawSize}` : "Schuhgröße bitte nachfragen";
            } else if (category === "clothing") {
                rawSize = rawSize
                    ? `Kleidergröße ${rawSize} (Kein Schwerpunkt)`
                    : "Kleidergröße unbekannt (Kein Schwerpunkt)";
            } else {
                rawSize = rawSize || "Maße folgen";
            }

            const fileInput = document.getElementById("item-image");
            let thumbSrc, origSrc;
            if (fileInput.files && fileInput.files[0]) {
                const processed = await ThumbnailEngine.processUpload(fileInput.files[0]);
                thumbSrc = processed.thumbnailDataUrl;
                origSrc = processed.originalDataUrl;
            } else {
                thumbSrc = ThumbnailEngine.createPlaceholderThumb(title);
                origSrc = thumbSrc;
            }

            state.items.unshift({
                id: "ART-" + Math.floor(100 + Math.random() * 900),
                title,
                category,
                sizeText: rawSize,
                campaign: ACTIVE_CAMPAIGN,
                thumbnail_ready: true,
                thumbSrc,
                origSrc
            });
            saveState();
            renderWarehouse();
            updateStatsUI();
            e.target.reset();
            updateCategoryFields();
            uploadPanel.classList.add("hidden");
        } finally {
            hideLoader();
        }
    });

    // Modal schließen
    document.getElementById("btn-close-modal").addEventListener("click", () => {
        document.getElementById("image-modal").classList.add("hidden");
    });

    renderWarehouse();
}

function renderWarehouse() {
    const grid = document.getElementById("warehouse-grid");
    // Strikte Begrenzung auf aktuelle Aktionswährung
    const activeItems = state.items.filter(i => i.campaign === ACTIVE_CAMPAIGN);

    if (activeItems.length === 0) {
        grid.innerHTML = `<div class="card">Keine Artikel in der aktuellen Aktionswährung vorhanden.</div>`;
        return;
    }

    grid.innerHTML = activeItems.map(item => `
        <article class="item-card">
            <div class="thumb-wrapper" onclick="openOriginalImage('${item.id}')" title="Klicken für großes Originalbild">
                <img src="${item.thumbSrc}" alt="${item.title}" loading="lazy">
                <span class="thumb-badge">300×300 Thumb</span>
            </div>
            <div class="item-body">
                <h3 class="item-title">${item.title}</h3>
                <span class="item-meta">ID: ${item.id} · ${item.campaign}</span>
                <div>
                    <span class="size-pill ${item.category !== 'standard' ? 'apparel' : ''}">
                        ${item.sizeText}
                    </span>
                </div>
            </div>
        </article>
    `).join("");
}

window.openOriginalImage = function(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    state.stats.originalClicks += 1;
    saveState();
    updateStatsUI();

    document.getElementById("modal-title").textContent = `${item.title} (${item.id})`;
    document.getElementById("modal-full-img").src = item.origSrc;
    document.getElementById("modal-meta").textContent = `Größe/Maße: ${item.sizeText} | Aktionswährung: ${item.campaign}`;
    document.getElementById("image-modal").classList.remove("hidden");
};

// 6. Angebote & Direkt-Aktionen
function setupOffers() {
    document.getElementById("btn-new-offer").addEventListener("click", () => {
        const title = prompt("Titel des neuen Angebots:");
        if (!title || !title.trim()) return;
        state.offers.unshift({
            id: "ANG-" + Math.floor(200 + Math.random() * 800),
            title: title.trim(),
            campaign: ACTIVE_CAMPAIGN,
            status: "Offen"
        });
        saveState();
        renderOffers();
    });
    renderOffers();
}

function renderOffers() {
    const tbody = document.getElementById("offers-tbody");
    tbody.innerHTML = state.offers.map(offer => {
        const badgeClass =
            offer.status === "Angenommen" ? "status-angenommen" :
            offer.status === "Abgelehnt" ? "status-abgelehnt" : "status-offen";
        return `
            <tr>
                <td><strong>${offer.id}</strong></td>
                <td>${offer.title}</td>
                <td>${offer.campaign}</td>
                <td><span class="status-badge ${badgeClass}">${offer.status}</span></td>
                <td>
                    <div class="action-group">
                        <button class="btn-small btn-primary" onclick="setOfferStatus('${offer.id}', 'Angenommen')">✓ Annehmen</button>
                        <button class="btn-small btn-secondary" onclick="setOfferStatus('${offer.id}', 'Abgelehnt')">✕ Ablehnen</button>
                        <button class="btn-small btn-secondary" onclick="duplicateOffer('${offer.id}')">⧉ Duplizieren</button>
                        <button class="btn-small btn-danger" onclick="deleteOffer('${offer.id}')">🗑 Löschen</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

window.setOfferStatus = function(id, status) {
    const offer = state.offers.find(o => o.id === id);
    if (!offer) return;
    offer.status = status;
    saveState();
    renderOffers();
};

window.duplicateOffer = function(id) {
    const offer = state.offers.find(o => o.id === id);
    if (!offer) return;
    state.offers.unshift({
        ...offer,
        id: "ANG-" + Math.floor(200 + Math.random() * 800),
        title: offer.title + " (Kopie)",
        status: "Offen"
    });
    saveState();
    renderOffers();
};

window.deleteOffer = function(id) {
    if (!confirm(`Angebot ${id} wirklich löschen?`)) return;
    state.offers = state.offers.filter(o => o.id !== id);
    saveState();
    renderOffers();
};

// 7. Ideen-Anzeige
function setupIdeas() {
    document.getElementById("ideas-sort").addEventListener("change", renderIdeas);
    document.getElementById("btn-add-idea").addEventListener("click", () => {
        const title = prompt("Deine neue Idee / Verbesserungsvorschlag:");
        if (!title || !title.trim()) return;
        state.ideas.unshift({
            id: "ID-" + Date.now(),
            title: title.trim(),
            author: state.supermasterUnlocked ? "Supermaster" : "Nutzer",
            votes: 1,
            createdAt: Date.now()
        });
        saveState();
        renderIdeas();
    });
    renderIdeas();
}

function renderIdeas() {
    const list = document.getElementById("ideas-list");
    const sortBy = document.getElementById("ideas-sort").value;

    if (state.ideas.length === 0) {
        list.innerHTML = `<div class="card">Noch keine Ideen vorhanden. Klicke auf „+ Neue Idee“, um den Anfang zu machen!</div>`;
        return;
    }

    const sorted = [...state.ideas].sort((a, b) =>
        sortBy === "votes" ? b.votes - a.votes : b.createdAt - a.createdAt
    );

    list.innerHTML = sorted.map(idea => `
        <div class="card">
            <h3>${idea.title}</h3>
            <p class="item-meta">Von: ${idea.author} · ${new Date(idea.createdAt).toLocaleDateString("de-DE")}</p>
            <button class="btn-small btn-secondary" onclick="voteIdea('${idea.id}')">👍 Unterstützen (${idea.votes})</button>
        </div>
    `).join("");
}

window.voteIdea = function(id) {
    const idea = state.ideas.find(i => i.id === id);
    if (!idea) return;
    idea.votes += 1;
    saveState();
    renderIdeas();
};

// 8. Feedbackformular & funktionsfähige Footer-Buttons (Textdatei, GitHub-Kommentare, JSON-Backup)
function setupFeedbackAndFooter() {
    document.getElementById("feedback-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("fb-name").value.trim();
        const area = document.getElementById("fb-area").value;
        const message = document.getElementById("fb-message").value.trim();

        state.feedbacks.unshift({
            id: "FB-" + Date.now(),
            name,
            area,
            message,
            date: new Date().toLocaleString("de-DE")
        });
        saveState();
        renderFeedbackHistory();
        e.target.reset();
        alert("Vielen Dank! Dein Feedback wurde gespeichert.");
    });

    // Footer Button 1: Textdatei (.txt) herunterladen
    document.getElementById("btn-export-txt").addEventListener("click", () => {
        const lines = [
            "=== WARENHAUS UPDATE-PAKET v26 – STATUS & FEEDBACK ===",
            `Datum: ${new Date().toLocaleString("de-DE")}`,
            `Aktive Aktionswährung: ${ACTIVE_CAMPAIGN}`,
            `Artikel im Bestand: ${state.items.length}`,
            `Seitenaufrufe: ${state.stats.views} | Original-Klicks: ${state.stats.originalClicks}`,
            "",
            "--- GITHUB COMMIT-KOMMENTARE ---",
            ...GITHUB_COMMITS.map(c => `* ${c}`),
            "",
            "--- GESPEICHERTES FEEDBACK ---",
            ...(state.feedbacks.length
                ? state.feedbacks.map(f => `[${f.date}] ${f.name} (${f.area}): ${f.message}`)
                : ["Noch kein Feedback eingetragen."])
        ];
        downloadFile("warenhaus_v26_bericht.txt", lines.join("\n"), "text/plain;charset=utf-8");
    });

    // Footer Button 2: GitHub-Kommentare in Zwischenablage kopieren
    document.getElementById("btn-copy-github").addEventListener("click", async () => {
        const text = GITHUB_COMMITS.join("\n");
        try {
            await navigator.clipboard.writeText(text);
            alert("Alle GitHub-Commit-Kommentare wurden in die Zwischenablage kopiert!");
        } catch (err) {
            prompt("Bitte kopieren (Strg+C):", text);
        }
    });

    // Footer Button 3: Komplettes Daten-Backup (.json) herunterladen
    document.getElementById("btn-export-json").addEventListener("click", () => {
        downloadFile(
            "warenhaus_v26_backup.json",
            JSON.stringify(state, null, 2),
            "application/json;charset=utf-8"
        );
    });

    // Footer Button 4: Direkt zum Feedbackformular springen
    document.getElementById("btn-quick-feedback").addEventListener("click", () => {
        switchView("view-feedback");
        document.getElementById("fb-message").focus();
    });

    renderFeedbackHistory();
}

function renderFeedbackHistory() {
    const container = document.getElementById("feedback-history");
    if (!state.feedbacks.length) {
        container.innerHTML = `<p class="item-meta" style="margin-top:1rem;">Noch keine Rückmeldungen gesendet.</p>`;
        return;
    }
    container.innerHTML = `<h4 style="margin-top:1.25rem;">Letzte Rückmeldungen:</h4>` + state.feedbacks.map(f => `
        <div class="stat-box" style="margin-bottom:0.5rem;">
            <strong>${f.name}</strong> · <span class="item-meta">${f.area} (${f.date})</span>
            <p style="margin:0.35rem 0 0;">${f.message}</p>
        </div>
    `).join("");
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
