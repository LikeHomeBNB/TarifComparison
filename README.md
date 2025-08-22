# LikeHome Tarif-Vergleich

Eine intelligente Web-Anwendung für die automatisierte Bewertung und den Vergleich von Versorgungstarifen mittels wissenschaftlicher Nutzwertanalyse.

## Live-Anwendung

[Zur Anwendung](https://likehome-tariff-comparison.netlify.app)

## Übersicht

Das LikeHome Tarif-Vergleichstool unterstützt Property Manager bei der objektiven Bewertung von Strom-, Gas-, Internet- und Wasseranbietern. Durch gewichtete Bewertungskriterien und automatische Punkteberechnung wird die optimale Anbieterauswahl transparent und nachvollziehbar.

### Hauptfunktionen

- **Automatisierte Nutzwertanalyse** mit wissenschaftlich fundierten Gewichtungen
- **Multi-Service-Unterstützung** für Strom, Heizung, Internet und Wasser
- **Intelligente Bewertungslogik** mit servicespezifischen Kriterien
- **PDF-Export** für Dokumentation und Präsentation
- **Responsive Design** für Desktop und mobile Nutzung

### Bewertungskriterien

**Für Strom/Heizung/Wasser:**
- Bestehende Vertragsbeziehungen (15%)
- Preisentwicklung Jahr 1 & 2 (je 20%)
- Service-Bewertungen (30%)
- Anbietergröße/Stabilität (15%)

**Für Internet:**
- Bestehende Vertragsbeziehungen (10%)
- Monatlicher Preis (35%)
- Download-Geschwindigkeit (35%)
- Technologie/Stabilität (20%)
- Service-Bewertungen (20%)

## Technische Details

- **Framework:** React 18 mit Hooks
- **Styling:** Tailwind CSS mit LikeHome-Farbschema
- **Icons:** Lucide React
- **Hosting:** Netlify mit automatischen Deployments
- **Browser-Support:** Moderne Browser (Chrome, Firefox, Safari, Edge)

## Nutzung

1. **Projekt-Informationen** eingeben (Objekt, Versorgungsart, Datum, Bearbeiter)
2. **Anbieter-Daten** erfassen (Preise, Bewertungen, technische Spezifikationen)
3. **Automatische Berechnung** des Nutzwerts basierend auf wissenschaftlichen Kriterien
4. **Ranking-Übersicht** mit Medaillen-System für Top-Anbieter
5. **PDF-Export** für Dokumentation und Stakeholder-Präsentation

## Besondere Features

### Internet-Kalkulation
- Automatische Bandbreiten-Empfehlung basierend auf Apartment-Anzahl
- Technologie-Bewertung (Glasfaser > Kabel > VDSL > DSL)
- Gaming- und Business-optimierte Kriterien

### Strom-Optimierung
- Fokus auf 100% Ökostrom-Tarife
- Wärmepumpen-Tarif-Berücksichtigung
- HT/NT-Tarif-Unterstützung

## Deployment

### Netlify Konfiguration

Erstelle eine `netlify.toml` Datei im Root-Verzeichnis:

```toml
[build]
 publish = "build"
 command = "npm run build"

[[redirects]]
 from = "/*"
 to = "/index.html"
 status = 200
