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

### Geändert

- chore(workflows): pin gitleaks reusable workflow to 3797874aff12223bcf9f588a5a61a5ee8014943c (#7)

[Unreleased]: https://github.com/Klangschalen/projekt-board/commits/main
