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
- Umsatz-Einschätzung ist jetzt im Board selbst eintragbar: Task-Detail (Klick auf eine
  Aufgabe, sowohl im Kanban- als auch im Canvas-Tab) hat einen neuen Block "Bringt das
  Umsatz?" mit drei Buttons (Kein Umsatz / Indirekt / Direkt) + optionalem EUR-Feld.
  Vorher gab es dafür keine UI - Umsatz-Info konnte nur direkt in Supabase gesetzt werden.
- Bugfix: Klick auf eine Aufgaben-Karte im Kanban-Tab öffnete das Task-Detail-Modal nicht
  (Board.jsx/Column.jsx gaben den `onTaskClick`-Handler aus App.jsx nie weiter, seit dem
  Team-Plattform-Merge). Jetzt durchgereicht, Karten-Klick öffnet das Modal wie im Canvas-Tab.
- DB-seitig (nicht Teil dieses Diffs, live in Supabase repariert): Der Trigger
  `planning.idea_scores_auto_fields()` berechnete `moscow_priority`/`revenue_score` nicht
  mehr korrekt (634 von 985 Zeilen falsch eingestuft, 983 von 985 mit `revenue_score = 0`).
  Trigger repariert, alle Bestandszeilen neu durchgerechnet.
- DB-seitig (nicht Teil dieses Diffs, live in Supabase repariert): Die RLS-Policy
  `idea_scores_auth_update` verlangte `owner_user_id = eigene User-ID`, aber keine der
  1498 Zeilen hatte `owner_user_id` gesetzt - dadurch konnte kein eingeloggtes Team-Mitglied
  irgendeine Aufgabe ändern (Status per Drag&Drop, Zuständigkeit, jetzt auch Umsatz).
  Policy geöffnet für alle authentifizierten Nutzer, deckungsgleich mit der bestehenden
  Lese-Policy (die App hat ohnehin kein Einzel-Besitz-Konzept im Frontend).

- Money-Maker-Tab zeigt jetzt "X offen (von Y gesamt)" statt nur der Gesamtzahl je Projekt,
  weil erledigte (FERTIG) und verworfene (VERWORFEN) Aufgaben bisher unverändert mitzählten
  und die Rangliste verzerrten. Projekte ohne offene Aufgaben stehen nicht mehr in der
  aktiven Liste, sondern in einem eigenen einklappbaren Bereich "komplett erledigt" darunter.
- Projekt-Zeile im Money-Maker-Tab ist jetzt anklickbar und zeigt die konkreten offenen
  Aufgaben darunter (Titel, Priorität, Zuständigkeit) statt nur der Summenzahl - vorher war
  unklar, was an einem Projekt überhaupt noch zu tun ist. Klick auf eine Aufgabe öffnet
  das gewohnte Task-Detail-Modal.

### Geändert

- chore(workflows): pin gitleaks reusable workflow to 3797874aff12223bcf9f588a5a61a5ee8014943c (#7)

[Unreleased]: https://github.com/Klangschalen/projekt-board/commits/main
