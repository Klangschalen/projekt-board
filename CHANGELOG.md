# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- Neuer Tab "Money-Maker": Portfolio-Ansicht je Projekt (Ø/Max ICE, Umsatz-Klassifizierung,
  geschätzter Umsatz in EUR), gespeist aus neuer Supabase-View `planning.project_portfolio`.
  Deckt Franks Lücke "welche Projekte sind Money-Maker, wie gestaffelt nach ICE" ab.
  Befund dabei: nur 8,7% der 985 `idea_scores`-Einträge sind umsatz-klassifiziert
  (`revenue_category` != NO_REVENUE), nur 1 Eintrag hat eine EUR-Schätzung — die Tabelle
  macht diese Lücke jetzt sichtbar statt sie zu verstecken.

### Geändert

- chore(workflows): pin gitleaks reusable workflow to 3797874aff12223bcf9f588a5a61a5ee8014943c (#7)

[Unreleased]: https://github.com/Klangschalen/projekt-board/commits/main
