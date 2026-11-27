/**
 * StromManager Translation-Modul – v4
 */
const SM_I18N_VERSION = "v4";

const SM_I18N = {
  de: {
    title: "StromManager",
    subtitle: "Grunddaten für Person, Wohnung, Heizkörper & Tarif",
    ttsOff: "Vorlesen: Aus", ttsOn: "Vorlesen: An",
    secPerson: "1. Person (zieht bei Umzug mit)",
    personName: "Name *", personId: "Personen-ID", autonomyLevel: "Selbstständigkeit",
    autonomy1: "1 – Mit Master-Hilfe", autonomy2: "2 – User füllt aus, Master prüft", autonomy3: "3 – Selbstständig",
    reminderCycle: "Erinnerungs-Turnus", daily: "Täglich", every2Days: "Alle 2 Tage", weekly: "Wöchentlich", custom: "Frei",
    personPhoto: "Profilbild (optional)",
    secApartment: "2. Wohnung & Einzug",
    moveInDate: "Datum Einzug *", apartmentLabel: "Wohnungs-ID / Ort *", masterName: "Master / Begleitung",
    roomCount: "Zimmer", heaterCount: "Heizkörper / Nachtspeicher", thermostatCount: "Thermostate",
    floorplanPhoto: "Foto Grundriss (optional)",
    secLabels: "Aufkleber (HK-1, TH-1)", genLabels: "Aufkleber erzeugen",
    labelHint: "Aufkleber an Heizkörper & Thermostat anbringen und Raum zuordnen.",
    secTariff: "3. Tarif, Vertrag & Endkontrolle",
    validFrom: "Tarif gültig ab", provider: "Anbieter", contractPhoto: "Foto Vertrag (für KI-Auslesung)",
    aiRead: "✨ Vertrag auslesen", priceHH: "Haushalt (ct/kWh)", basePrice: "Grundpreis (€/Monat)",
    priceNT: "Heizstrom NT (ct/kWh)", priceHT: "Heizstrom HT (ct/kWh)",
    finalCheck: "Endkontrolle durchgeführt (User oder Master)", checkedBy: "Geprüft von",
    save: "Speichern"
  },
  en: {
    title: "StromManager",
    subtitle: "Core data for person, apartment, heaters & tariff",
    ttsOff: "Read aloud: Off", ttsOn: "Read aloud: On",
    secPerson: "1. Person (moves on relocation)",
    personName: "Name *", personId: "Person ID", autonomyLevel: "Independence",
    autonomy1: "1 – With Master help", autonomy2: "2 – User fills, Master checks", autonomy3: "3 – Independent",
    reminderCycle: "Reminder cycle", daily: "Daily", every2Days: "Every 2 days", weekly: "Weekly", custom: "Custom",
    personPhoto: "Profile photo (optional)",
    secApartment: "2. Apartment & move-in",
    moveInDate: "Move-in date *", apartmentLabel: "Apartment ID / label *", masterName: "Master / support",
    roomCount: "Rooms", heaterCount: "Heaters / storage heaters", thermostatCount: "Thermostats",
    floorplanPhoto: "Floor plan photo (optional)",
    secLabels: "Stickers (HK-1, TH-1)", genLabels: "Generate stickers",
    labelHint: "Attach stickers to heaters & thermostats and enter the room.",
    secTariff: "3. Tariff, contract & final check",
    validFrom: "Tariff valid from", provider: "Provider", contractPhoto: "Contract photo (for AI)",
    aiRead: "✨ Read contract", priceHH: "Household (ct/kWh)", basePrice: "Base fee (€/month)",
    priceNT: "Heating NT (ct/kWh)", priceHT: "Heating HT (ct/kWh)",
    finalCheck: "Final check completed (User or Master)", checkedBy: "Checked by",
    save: "Save"
  }
};

function smT(key, lang) {
  if (typeof window.FFLW_I18N?.translate === "function") {
    const ext = window.FFLW_I18N.translate(`strommanager.${key}`);
    if (ext && ext !== `strommanager.${key}`) return ext;
  }
  return SM_I18N[lang]?.[key] ?? SM_I18N.de[key] ?? key;
}

function smApplyLang(lang) {
  const active = SM_I18N[lang] ? lang : "de";
  document.documentElement.lang = active;
  document.documentElement.dir = active === "ar" ? "rtl" : "ltr";
  if (typeof window.FFLW_I18N?.setLanguage === "function") window.FFLW_I18N.setLanguage(active);
  document.querySelectorAll("[data-sm-i18n]").forEach((el) => {
    el.textContent = smT(el.getAttribute("data-sm-i18n"), active);
  });
  return active;
}
