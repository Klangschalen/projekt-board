# Changelog

## 2026-08-05 - Zentrales Claude-Plugin aktiviert (Konsolidierung Phase 1)

### Added
- `.claude/settings.json`: Marketplace `sound-spirit` (Klangschalen/claude-config)
  registriert und Plugin `sound-spirit-core` aktiviert. Textpruefung laeuft ab jetzt
  ueber den zentralen Skill `/text-check` (HWG aus Supabase-SSoT + Cialdini) statt
  ueber repo-lokale Kopien. Details: claude-config docs/KONSOLIDIERUNG-2026-08.md

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- Neuer Tab "Money-Maker": Portfolio-Ansicht je Projekt (Ø/Max ICE, Umsatz-Klassifizierung,
  geschätzter Umsatz in EUR), gespeist aus der Supabase-View `planning.project_portfolio`.
  Zusätzlich im Kanban-Tab: Revenue-Badge auf einzelnen Aufgaben-Karten und Filter
  "Nur Money-Maker" (aus `planning.idea_scores.revenue_category`). Deckt Franks Lücke
  "welche Projekte sind Money-Maker, wie gestaffelt nach ICE" ab.
- DB-seitig (nicht Teil dieses Diffs, live in Supabase repariert): Der Trigger
  `planning.idea_scores_auto_fields()` berechnete `moscow_priority`/`revenue_score` nicht
  mehr korrekt (634 von 985 Zeilen falsch eingestuft, 983 von 985 mit `revenue_score = 0`).
  Trigger repariert, alle Bestandszeilen neu durchgerechnet.

### Geändert

- chore(workflows): pin gitleaks reusable workflow to 3797874aff12223bcf9f588a5a61a5ee8014943c (#7)

[Unreleased]: https://github.com/Klangschalen/projekt-board/commits/main
