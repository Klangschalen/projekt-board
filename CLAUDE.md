# projekt-board

React Kanban-Board fuer Sound-Spirit Team. Ilona, Frank, Christina sehen Aufgaben im Browser.

## Stack
React 18 + Vite + GitHub Pages.
Daten: Supabase (`hdxmswteiesvcwqdgpwm`) - Tasks in `planning.idea_scores`,
Goals in `public.goals`.

## Tabs (Stand 2026-05-18)

| Tab | Komponente | Was es zeigt |
|---|---|---|
| Naechste Session | NaechsteSession.jsx | NAECHSTE-SESSION.md Inhalt |
| Board (3 Status) | Board.jsx | Klassisch: offen / aktiv / erledigt, Drag-and-Drop |
| Phasen (gstack) | PhaseBoard.jsx | Garry-Tan 6-Spalten: THINK / PLAN / BUILD / REVIEW / TEST / SHIP, read-only |
| Plaene | PlanOverview.jsx | data/plans.json |
| Deep Research | DeepResearch.jsx | data/ausgaben.json |

## Filter

- **Personen / Projekt** (Header): Filter ueber `wer` oder `project`
- **Goal-Fokus** (unter Header): Filter ueber `goal_id` der Tasks. Wirkt
  auf Board UND PhaseBoard. Quelle: `public.goals` Tabelle in Supabase.

## Regeln
- Aufgaben haben: titel, prio (MUST/SHOULD/COULD), ice (Score), status,
  wer, deadline, **phase** (optional, fuer PhaseBoard), **goalId** (optional).
- Drag&Drop nur im Board-Tab (3 Status). PhaseBoard ist read-only Iteration 1.
- Mobile-first (Grid wird zu 1 Spalte unter 768px).
- Daten primaer aus Supabase. Wenn nicht erreichbar: Notice + Login-Link.

## DB-Voraussetzungen

- `planning.idea_scores` mit `goal_id`-Spalte: vorhanden (aus
  `claude-config/tools/supabase_create_goals.sql`).
- `public.goals`: vorhanden (gleiche Quelle).
- `phase`-Spalte: **optional**. PhaseBoard funktioniert auch ohne,
  mapped dann aus `status` (IDEE/EVALUATING -> THINK,
  EVALUATED/GEPLANT -> PLAN, IN_ARBEIT/PAUSIERT -> BUILD,
  FERTIG -> SHIP). REVIEW und TEST bleiben leer ohne DB-Patch.
- Fuer echte 6-Spalten-Trennung: SQL aus
  `claude-config/tools/supabase_add_phase_column.sql` ausfuehren.

## Goal-Synergie

- `/goal sf-analyse` im Claude Code -> schreibt Supabase `public.goals`
  und lokales `state/current-goal`.
- Browser oeffnen -> Goal-Filter zeigt "sf-analyse (active)".
- Auswaehlen -> Board + Phasen zeigen nur Tasks mit `goal_id` dieses Goals.

Quellen-Doku: `claude-config/docs/LERNEN-GOAL-RICE-HOOKS.md`.

## CSS-Klassen (neu)

Falls Style fehlt, in `src/style.css` ergaenzen:
- `.goal-filter` - Container fuer Goal-Dropdown
- `.goal-hint` - Hinweis wenn keine Goals
- `.phase-board`, `.phase-summary`, `.phase-progress`, `.phase-warn`
- `.phase-grid`, `.phase-col`, `.phase-col-head`, `.phase-col-body`
- `.phase-name`, `.phase-count`, `.phase-empty`
- `.phase-card`, `.phase-card-title`, `.phase-card-meta`, `.phase-card-deadline`
- `.phase-unassigned`, `.phase-tip`
- `.pill`, `.pill-must`, `.pill-should`, `.pill-could`, `.pill-wont`
