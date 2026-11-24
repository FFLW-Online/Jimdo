# Warenhaus & Aktions-Plattform – Update-Paket v26

Dieses Paket enthält den vollständigen, lauffähigen Code für GitHub Pages (inkl. Feedbackformular, Checkliste, Thumbnail-Engine und Direkt-Aktionen).

## Enthaltene Funktionen (v26)
1. **Anti-Mega-Scan & Bild-Thumbnails (`thumbnail-engine.js`):**
   - Getrennte Ordnerstruktur (`uploads/originals/` und `uploads/thumbnails/`).
   - EXIF-Auto-Drehung (kein verdrehtes Bild mehr).
   - Einheitliche `300x300`-Kacheln mit weißem Innen-Padding (`object-fit: contain`).
   - Komprimierung auf max. `1200px` Breite beim Upload zum Schutz des GitHub-Speicherlimits.
2. **KI-Größenlogik (Kleidung & Schuhe):**
   - Automatische Umschaltung auf Schuhgröße bzw. Kleidergröße (mit Schwerpunkt-Hinweis) statt falscher Zentimeter-Schätzungen.
3. **Performance & Lade-Indikator:**
   - Thumbnails im Grid, Originalbilder erst bei Klick; sich drehende Standard-Sanduhr.
4. **Supermaster-Direktzugang:**
   - Persistenter Zugang über den Button `⚡ Supermaster` (Standard-Code: `2026`, bleibt nach Reload erhalten).
5. **Zugriffsstatistik-Reset:**
   - Mit Sicherheitsabfrage und sofortiger Live-Aktualisierung.
6. **Direkt-Aktionen im Angebot:**
   - Annehmen, Ablehnen, Duplizieren und Löschen direkt in der Übersicht.
7. **Ideen-Anzeige:**
   - Sortierung (Neueste / Beliebteste), Voting und Empty State.
8. **Feedbackformular & aktive Footer-Buttons:**
   - Voll funktionsfähige Export-Knöpfe (`.txt`, `.json`, GitHub-Kommentare kopieren, Feedback öffnen) – keine toten Knöpfe.
