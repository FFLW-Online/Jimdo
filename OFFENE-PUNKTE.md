# OFFENE PUNKTE – Änderungspaket Priorität 1

Stand: 2. November 2026

## Noch fehlende Mediendatei

- `assets/eingang-deutschtraining.jpg` ist noch nicht vorhanden und gehört deshalb nicht zum Änderungspaket.
- Es wurde kein Ersatzbild und kein leerer `assets`-Ordner erzeugt.

## Spätere Einfügestelle

Das Originalbild soll später in `deutschtraining.html` im Abschnitt **Deutschtraining** direkt nach dem OpenStreetMap-Link für `Paulinenstr. 33, Winnenden` eingefügt werden.

Vorgesehene spätere Struktur:

```html
<figure>
  <img src="assets/eingang-deutschtraining.jpg"
       alt="Eingang zum Deutschtraining auf der rechten Seite"
       loading="lazy">
  <figcaption>Eingang zum Deutschtraining - auf der rechten Seite</figcaption>
</figure>
```

Vor dem späteren Upload muss die Originaldatei unter exakt `assets/eingang-deutschtraining.jpg` vorliegen.

## Weitere offene Qualitätsprüfung

- abschließende Sichtprüfung der sieben geänderten Seiten im Zusammenspiel mit dem bestehenden `style.css`
- Desktop- und Mobilansicht nach dem Hochladen prüfen
- Kontaktformular bleibt absichtlich nicht versandfähig
- OpenStreetMap bleibt vorerst als Linklösung statt eingebetteter Karte
