const STORAGE_KEY = 'sound-spirit-tasks';

export function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return getDefaultTasks();
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getDefaultTasks() {
  return [
    {
      id: '1',
      titel: 'Widerrufsbutton implementieren',
      prio: 'MUST',
      ice: 8.0,
      status: 'offen',
      wer: 'Michael + Ilona',
      deadline: '2026-06-19',
      details: 'Gesetzliche Pflicht ab 19.06.2026. Technische Umsetzung in Gambio, UX-Pruefung, Mobile, Dokumentation.',
    },
    {
      id: '2',
      titel: 'Showroom gegen CI/Standards pruefen',
      prio: 'MUST',
      ice: 7.0,
      status: 'offen',
      wer: 'Ilona',
      deadline: '2026-05-20',
      details: 'Farben, Wellen, Bloecke, Trust-Elemente, Mobile, Texte gegen Referenzseite pruefen.',
    },
    {
      id: '3',
      titel: 'Klangschalen-kaufen Performance fixen',
      prio: 'MUST',
      ice: 7.3,
      status: 'offen',
      wer: 'Michael',
      deadline: '2026-05-31',
      details: 'Score von 55 auf 70+. LCP 7.0s auf 2.5s. Mehrfach geladene Bilder, DOM-Groesse, Unused CSS 124KB.',
    },
    {
      id: '4',
      titel: 'Zentrales CSS dokumentieren',
      prio: 'MUST',
      ice: 7.3,
      status: 'offen',
      wer: 'Ilona + Claude',
      deadline: '2026-05-31',
      details: 'Wellen-System, Box-System, CTA-System, Button-System, Trust-System dokumentieren und durchsetzen.',
    },
    {
      id: '5',
      titel: 'API-Auslieferung Fehler beheben',
      prio: 'MUST',
      ice: 6.7,
      status: 'offen',
      wer: 'Michael',
      deadline: '2026-05-31',
      details: 'Gambio Hub SDK liefert Fehler aus. Schnittstelle pruefen.',
    },
    {
      id: '6',
      titel: 'Mehrfach geladene Bilder fixen',
      prio: 'MUST',
      ice: 7.3,
      status: 'offen',
      wer: 'Michael',
      deadline: '2026-05-20',
      details: 'Network Tab zeigt doppelt geladene Bilder. 0 Duplikate als Ziel.',
    },
    {
      id: '7',
      titel: 'Gambio API Credentials holen',
      prio: 'MUST',
      ice: 9.0,
      status: 'offen',
      wer: 'Frank',
      deadline: '2026-05-12',
      details: 'Blockiert Gstack seit 12 Tagen. Michael anrufen. 5 Minuten.',
    },
    {
      id: '8',
      titel: 'check-page.sh auf Cron setzen',
      prio: 'MUST',
      ice: 7.0,
      status: 'offen',
      wer: 'Claude',
      deadline: '2026-05-14',
      details: 'Erster automatischer Quality-Check. GitHub Actions oder lokaler Cron.',
    },
    {
      id: '9',
      titel: 'DOM-Groesse optimieren',
      prio: 'SHOULD',
      ice: 6.0,
      status: 'offen',
      wer: 'Michael',
      deadline: '2026-06-30',
      details: 'Unter 1500 DOM-Elemente. CSS-Only Responsive, SVG-Sprite, Inline-Styles auslagern.',
    },
    {
      id: '10',
      titel: 'Template-Typen definieren (5 Templates)',
      prio: 'SHOULD',
      ice: 5.7,
      status: 'offen',
      wer: 'Frank + Ilona',
      deadline: '2026-06-30',
      details: 'Tradition, Kaufen-Seite, Showroom, Ratgeber, Produktgruppe.',
    },
    {
      id: '11',
      titel: 'Doku-Inventur (alle versteckten Dokumente)',
      prio: 'SHOULD',
      ice: 5.3,
      status: 'offen',
      wer: 'Ilona',
      deadline: '2026-05-31',
      details: 'WordPress, Google Drive, Gmail, Chatbase, lokale Notizen - alles finden und klassifizieren.',
    },
    {
      id: '12',
      titel: 'mysqldump Passwort fixen',
      prio: 'MUST',
      ice: 8.0,
      status: 'offen',
      wer: 'Michael',
      deadline: '2026-05-14',
      details: 'DB-Backups laufen NICHT. Kritisch.',
    },
  ];
}
