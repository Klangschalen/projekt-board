/**
 * Pre-Build-Script: Exportiert lokale Daten als JSON nach public/data/
 * Wird vor npm run build und npm run dev ausgefuehrt.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';

const CLAUDE_DIR = join(homedir(), '.claude');
const OUT_DIR = join(import.meta.dirname, '..', 'public', 'data');

mkdirSync(OUT_DIR, { recursive: true });

// 1. NAECHSTE-SESSION.md
function syncNaechsteSession() {
  const path = join(CLAUDE_DIR, 'NAECHSTE-SESSION.md');
  let content = '';
  let exists = false;
  try {
    content = readFileSync(path, 'utf-8');
    exists = true;
  } catch { /* Datei fehlt */ }
  writeFileSync(join(OUT_DIR, 'naechste-session.json'), JSON.stringify({
    exists,
    content,
    lastModified: exists ? statSync(path).mtime.toISOString() : null,
  }));
  console.log(`NAECHSTE-SESSION: ${exists ? 'OK' : 'nicht gefunden'}`);
}

// 2. Plaene aus ~/.claude/plans/
function syncPlans() {
  const plansDir = join(CLAUDE_DIR, 'plans');
  const plans = [];
  if (existsSync(plansDir)) {
    for (const file of readdirSync(plansDir)) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const fullPath = join(plansDir, file);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) continue;
      const content = readFileSync(fullPath, 'utf-8');

      // Metadaten aus dem Markdown extrahieren
      const statusMatch = content.match(/^(?:\*\*)?Status(?:\*\*)?:\s*(.+)$/mi);
      const iceMatch = content.match(/^(?:\*\*)?(?:ICE|Prioritaet)(?:\*\*)?:\s*(.+)$/mi);
      const deadlineMatch = content.match(/^(?:\*\*)?Deadline(?:\*\*)?:\s*(.+)$/mi);
      const titleMatch = content.match(/^#\s+(?:Plan:\s*)?(.+)$/m);

      // Offene Items zaehlen (Checkboxen)
      const openItems = (content.match(/^[\s]*- \[ \]/gm) || []).length;
      const doneItems = (content.match(/^[\s]*- \[x\]/gmi) || []).length;

      plans.push({
        file: file,
        title: titleMatch ? titleMatch[1].trim() : file.replace('.md', ''),
        status: statusMatch ? statusMatch[1].trim() : 'UNBEKANNT',
        ice: iceMatch ? iceMatch[1].trim() : '-',
        deadline: deadlineMatch ? deadlineMatch[1].trim() : '-',
        openItems,
        doneItems,
        totalItems: openItems + doneItems,
        lastModified: stat.mtime.toISOString(),
        content,
      });
    }
  }
  plans.sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  writeFileSync(join(OUT_DIR, 'plans.json'), JSON.stringify(plans));
  console.log(`Plaene: ${plans.length} gefunden`);
}

// 3. Deep Research / Ausgaben aus ~/.claude/docs/ausgaben/
function syncAusgaben() {
  const ausgabenDir = join(CLAUDE_DIR, 'docs', 'ausgaben');
  const ausgaben = [];
  if (existsSync(ausgabenDir)) {
    for (const dateDir of readdirSync(ausgabenDir).sort().reverse()) {
      const datePath = join(ausgabenDir, dateDir);
      if (!statSync(datePath).isDirectory()) continue;
      if (dateDir.startsWith('_') || dateDir === 'archiv') continue;
      for (const file of readdirSync(datePath).sort()) {
        if (!file.endsWith('.md') && !file.endsWith('.txt') && !file.endsWith('.html') && !file.endsWith('.json')) continue;
        const fullPath = join(datePath, file);
        const content = readFileSync(fullPath, 'utf-8');
        const titleMatch = content.match(/^#\s+(.+)$/m);
        ausgaben.push({
          date: dateDir,
          file,
          title: titleMatch ? titleMatch[1].trim() : file.replace(/\.\w+$/, '').replace(/_/g, ' '),
          path: `${dateDir}/${file}`,
          size: statSync(fullPath).size,
          content,
        });
      }
    }
  }
  writeFileSync(join(OUT_DIR, 'ausgaben.json'), JSON.stringify(ausgaben));
  console.log(`Ausgaben: ${ausgaben.length} Dateien aus ${new Set(ausgaben.map(a => a.date)).size} Tagen`);
}

// 4. OFFENE-AUFGABEN.md
function syncOffeneAufgaben() {
  const path = join(CLAUDE_DIR, 'OFFENE-AUFGABEN.md');
  let content = '';
  let exists = false;
  try {
    content = readFileSync(path, 'utf-8');
    exists = true;
  } catch { /* Datei fehlt */ }
  writeFileSync(join(OUT_DIR, 'offene-aufgaben.json'), JSON.stringify({
    exists,
    content,
    lastModified: exists ? statSync(path).mtime.toISOString() : null,
  }));
  console.log(`OFFENE-AUFGABEN: ${exists ? 'OK' : 'nicht gefunden'}`);
}

syncNaechsteSession();
syncPlans();
syncAusgaben();
syncOffeneAufgaben();
console.log('Sync fertig.');
