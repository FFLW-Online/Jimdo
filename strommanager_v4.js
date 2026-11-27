/**
 * StromManager Frontend-Logik – v4
 */
const SM_FRONTEND_VERSION = "v4";

const SM_CFG = {
  version: SM_FRONTEND_VERSION,
  appsScriptUrl: "https://script.google.com/macros/s/DEINE_WEB_APP_ID/exec",
  maxWidth: 1400,
  quality: 0.75
};

const smState = { lang: "de", tts: false, images: {} };

function smSpeak(text) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const map = { de: "de-DE", en: "en-US", ar: "ar-SA", uk: "uk-UA", tr: "tr-TR" };
  u.lang = map[smState.lang] || "de-DE";
  window.speechSynthesis.speak(u);
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > SM_CFG.maxWidth) {
          height = Math.round((height * SM_CFG.maxWidth) / width);
          width = SM_CFG.maxWidth;
        }
        const c = document.createElement("canvas");
        c.width = width; c.height = height;
        c.getContext("2d").drawImage(img, 0, 0, width, height);
        const dataUrl = c.toDataURL("image/jpeg", SM_CFG.quality);
        resolve({
          fileName: `${file.name.replace(/\.[^.]+$/, "")}_sm.jpg`,
          mimeType: "image/jpeg",
          width, height,
          base64: dataUrl.split(",")[1],
          dataUrl
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderThumb(id, obj) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!obj) { el.innerHTML = ""; return; }
  const kb = Math.round((obj.base64.length * 3) / 4 / 1024);
  el.innerHTML = `<img src="${obj.dataUrl}" class="sm-thumb" alt="${obj.fileName}" /><span class="sm-meta">${obj.width}×${obj.height}px, ~${kb} KB</span>`;
}

function buildLabels() {
  const hk = Math.max(0, parseInt(document.getElementById("heater-count")?.value || "0", 10));
  const th = Math.max(0, parseInt(document.getElementById("thermostat-count")?.value || "0", 10));
  const box = document.getElementById("sm-labels-list");
  if (!box) return;
  const items = [];
  for (let i = 1; i <= hk; i++) items.push({ code: `HK-${i}`, type: "Heizkörper" });
  for (let j = 1; j <= th; j++) items.push({ code: `TH-${j}`, type: "Thermostat" });
  box.innerHTML = items.map((x) => `
    <div class="sm-label-row" data-code="${x.code}" data-type="${x.type}">
      <span class="sm-badge">${x.code}</span>
      <span>${x.type}</span>
      <input type="text" class="sm-room" placeholder="Raum (z. B. Wohnzimmer)" />
      <input type="text" class="sm-note" placeholder="Hinweis / Aufkleber" />
    </div>
  `).join("");
}

function collectData() {
  const labels = Array.from(document.querySelectorAll(".sm-label-row")).map((r) => ({
    code: r.dataset.code,
    type: r.dataset.type,
    room: r.querySelector(".sm-room")?.value.trim() || "",
    note: r.querySelector(".sm-note")?.value.trim() || ""
  }));
  return {
    action: "saveGrunddaten",
    frontendVersion: SM_FRONTEND_VERSION,
    person: {
      personId: document.getElementById("person-id")?.value.trim() || `P-${Date.now()}`,
      name: document.getElementById("person-name")?.value.trim() || "",
      language: smState.lang,
      autonomyLevel: document.getElementById("autonomy-level")?.value || "assisted",
      reminderCycle: document.getElementById("reminder-cycle")?.value || "daily",
      photo: smState.images.personPhoto || null
    },
    apartment: {
      moveInDate: document.getElementById("move-in-date")?.value || "",
      apartmentLabel: document.getElementById("apartment-label")?.value.trim() || "",
      masterName: document.getElementById("master-name")?.value.trim() || "",
      roomCount: Number(document.getElementById("room-count")?.value || 0),
      heaterCount: Number(document.getElementById("heater-count")?.value || 0),
      thermostatCount: Number(document.getElementById("thermostat-count")?.value || 0),
      floorplanPhoto: smState.images.floorplanPhoto || null,
      labels
    },
    tariff: {
      validFrom: document.getElementById("tariff-valid-from")?.value || "",
      provider: document.getElementById("provider-name")?.value.trim() || "",
      priceHouseholdCt: parseFloat(document.getElementById("price-household")?.value) || null,
      basePriceEurMonth: parseFloat(document.getElementById("base-price-month")?.value) || null,
      priceNtCt: parseFloat(document.getElementById("price-nt")?.value) || null,
      priceHtCt: parseFloat(document.getElementById("price-ht")?.value) || null,
      contractPhoto: smState.images.contractPhoto || null,
      finalCheckDone: Boolean(document.getElementById("final-check-done")?.checked),
      checkedBy: document.getElementById("checked-by")?.value.trim() || ""
    }
  };
}

function bindUpload(inputId, key, previewId) {
  const el = document.getElementById(inputId);
  el?.addEventListener("change", async () => {
    const f = el.files?.[0];
    smState.images[key] = f ? await compressImage(f) : null;
    renderThumb(previewId, smState.images[key]);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const initLang = document.documentElement.getAttribute("data-fflw-lang") || "de";
  smState.lang = smApplyLang(initLang);
  const sel = document.getElementById("sm-lang-select");
  if (sel) {
    sel.value = smState.lang;
    sel.addEventListener("change", (e) => {
      smState.lang = smApplyLang(e.target.value);
    });
  }

  document.getElementById("sm-tts-toggle")?.addEventListener("click", (e) => {
    smState.tts = !smState.tts;
    e.currentTarget.setAttribute("aria-pressed", String(smState.tts));
    const span = e.currentTarget.querySelector("span");
    if (span) span.textContent = smT(smState.tts ? "ttsOn" : "ttsOff", smState.lang);
    if (smState.tts) smSpeak(smT("ttsOn", smState.lang));
  });

  document.querySelectorAll(".sm-speak-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".sm-card");
      const txt = Array.from(card?.querySelectorAll("h2, h3, label, p") || []).map((n) => n.textContent.trim()).join(". ");
      smSpeak(txt);
    });
  });

  buildLabels();
  document.getElementById("sm-generate-labels")?.addEventListener("click", buildLabels);
  document.getElementById("heater-count")?.addEventListener("change", buildLabels);
  document.getElementById("thermostat-count")?.addEventListener("change", buildLabels);

  bindUpload("person-photo", "personPhoto", "preview-person-photo");
  bindUpload("floorplan-photo", "floorplanPhoto", "preview-floorplan-photo");
  bindUpload("contract-photo", "contractPhoto", "preview-contract-photo");

  document.getElementById("sm-ai-read-contract")?.addEventListener("click", async () => {
    const status = document.getElementById("sm-ai-status");
    if (!smState.images.contractPhoto) {
      if (status) status.textContent = "Bitte zuerst ein Vertragsfoto wählen.";
      return;
    }
    if (SM_CFG.appsScriptUrl.includes("DEINE_WEB_APP_ID")) {
      if (status) status.textContent = "Testmodus: Apps-Script-URL noch nicht gesetzt – Werte bitte prüfen.";
      return;
    }
    if (status) status.textContent = "KI liest Vertrag aus...";
    const res = await fetch(SM_CFG.appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "extractContract", version: SM_FRONTEND_VERSION, contractPhoto: smState.images.contractPhoto })
    });
    const data = await res.json();
    if (data?.tariff) {
      if (data.tariff.provider) document.getElementById("provider-name").value = data.tariff.provider;
      if (data.tariff.priceHouseholdCt != null) document.getElementById("price-household").value = data.tariff.priceHouseholdCt;
      if (data.tariff.basePriceEurMonth != null) document.getElementById("base-price-month").value = data.tariff.basePriceEurMonth;
      if (data.tariff.priceNtCt != null) document.getElementById("price-nt").value = data.tariff.priceNtCt;
      if (data.tariff.priceHtCt != null) document.getElementById("price-ht").value = data.tariff.priceHtCt;
    }
    if (status) status.textContent = "Ausgelesen – bitte Endkontrolle durchführen.";
  });

  document.getElementById("sm-grunddaten-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fb = document.getElementById("sm-submit-feedback");
    const payload = collectData();
    if (!payload.person.name || !payload.apartment.apartmentLabel || !payload.apartment.moveInDate) {
      if (fb) fb.textContent = "Bitte Name, Wohnungs-ID und Einzugsdatum ausfüllen.";
      return;
    }
    if (SM_CFG.appsScriptUrl.includes("DEINE_WEB_APP_ID")) {
      console.log(`StromManager Grunddaten (${SM_FRONTEND_VERSION}):`, payload);
      if (fb) fb.textContent = "Lokal bereit (Apps-Script-URL noch nicht gesetzt). Daten in Konsole.";
      if (smState.tts) smSpeak(fb.textContent);
      return;
    }
    if (fb) fb.textContent = "Speichert...";
    const res = await fetch(SM_CFG.appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const out = await res.json();
    if (fb) fb.textContent = out?.ok ? "Gespeichert!" : (out?.error || "Fehler beim Speichern.");
    if (smState.tts && fb) smSpeak(fb.textContent);
  });
});
