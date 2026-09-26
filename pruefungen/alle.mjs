/**
 * Alle Pruefstaende ohne Browser in einem Lauf: `npm run check`.
 *
 * Fuer Claude-Sitzungen, die GitHub-Action und jeden, der vor einem Commit
 * wissen will, ob die Seite noch steht. Voraussetzung: `npm run build` ist
 * gelaufen. Startet den gebauten Server auf einem freien Port, faehrt die
 * Pruefstaende dagegen und beendet ihn wieder.
 *
 * Nicht dabei: klickweg.mjs und kontrast.mjs - sie brauchen Chromium.
 *
 * Der Server laeuft OHNE RESEND_API_KEY und ohne VERCEL-Kennung: der
 * Durchstich schickt Probe-Anfragen ueber das Formular, und die duerfen
 * niemals als echte Mail beim Betrieb landen.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRUEFSTAENDE = ['tailwind-klassen.mjs', 'durchstich.mjs', 'links.mjs', 'doorway.mjs', 'behauptungen.mjs', 'geo.mjs'];

// Unterpfad aus dem BAU lesen, nicht raten: ein mit NEXT_BASE_PATH=/ct
// gebauter Stand antwortet nur unter /ct.
let unterpfad = '';
try {
  unterpfad = JSON.parse(readFileSync(path.join(WURZEL, '.next', 'routes-manifest.json'), 'utf8')).basePath || '';
} catch {
  console.error('Kein gebauter Stand gefunden. Erst `npm run build`, dann `npm run check`.');
  process.exit(2);
}

const port = await new Promise((ok) => {
  const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => ok(p)); });
});
const HOST = `http://127.0.0.1:${port}`;

const server = spawn(process.execPath, [path.join(WURZEL, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-H', '127.0.0.1', '-p', String(port)], {
  cwd: WURZEL,
  env: { ...process.env, RESEND_API_KEY: '', VERCEL: '', NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', (d) => { serverLog += d; });
server.stderr.on('data', (d) => { serverLog += d; });

async function bereit() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${HOST}${unterpfad}/`);
      if (r.status < 500) return true;
    } catch { /* startet noch */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

let rot = 0;
try {
  if (!(await bereit())) {
    console.error(`Server kam nicht hoch.\n${serverLog.slice(-2000)}`);
    process.exitCode = 2;
  } else {
    console.log(`Server laeuft auf ${HOST}${unterpfad || ''}\n`);
    for (const f of PRUEFSTAENDE) {
      console.log(`=== ${f}`);
      const code = await new Promise((ok) => {
        const k = spawn(process.execPath, [path.join(WURZEL, 'pruefungen', f)], {
          cwd: WURZEL,
          env: { ...process.env, HOST_BASIS: HOST, NEXT_BASE_PATH: unterpfad },
          stdio: 'inherit',
        });
        k.on('exit', (c) => ok(c ?? 1));
      });
      if (code !== 0) { rot++; console.log(`>>> ROT: ${f} (Exit ${code})\n`); } else console.log('');
    }
    console.log(rot ? `${rot} von ${PRUEFSTAENDE.length} Pruefstaenden ROT.` : `Alle ${PRUEFSTAENDE.length} Pruefstaende gruen.`);
    process.exitCode = rot ? 1 : 0;
  }
} finally {
  server.kill('SIGTERM');
}
