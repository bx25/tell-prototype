// Prüft alle externen Links in den HTML-Seiten (und den Quell-URLs in SRC_URL / PAGE).
// Aufruf: node pruefung/linkcheck.mjs [--browser] [--eigene]   (Exit-Code 1 bei toten Links)
//   Standard: HTTP-Abfrage (HEAD, dann GET) mit Browser-Kennung, Weiterleitungen werden verfolgt.
//   --browser: Links, die per HTTP nicht 200 liefern (Bot-Sperre, JS-Seiten), zusätzlich mit Playwright öffnen.
//              Playwright-Pfad über PLAYWRIGHT_CORE (Ordner von playwright-core), Browser über CHROME_PATH.
//   --eigene:  auch die eigenen Links auf bx25.github.io prüfen (sonst übersprungen, da erst nach dem Push live).
// Ergebnis: OK (200, ohne Weiterleitung auf Fehler-/Startseite), WARN (200, aber Weiterleitung auf andere Seite),
//           FEHLER (Status >= 400, Netzfehler oder Soft-404).
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const dir = new URL('../', import.meta.url);
const args = new Set(process.argv.slice(2));
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const NS = /^https?:\/\/(www\.w3\.org|schema\.org)\b/;
const EIGEN = /^https:\/\/bx25\.github\.io\/tell-prototype\//;

// Links einsammeln: Seite -> Menge von URLs
const urls = new Map();
for (const f of readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const t = readFileSync(new URL(f, dir), 'utf8').replaceAll('\\/', '/').replaceAll('&amp;', '&');
  for (const m of t.matchAll(/https?:\/\/[^\s"'<>)\\]+/g)) {
    const u = m[0].replace(/[.,;]+$/, '');
    if (NS.test(u) || (EIGEN.test(u) && !args.has('--eigene'))) continue;
    if (!urls.has(u)) urls.set(u, new Set());
    urls.get(u).add(f);
  }
}

const SOFT404 = /(seite nicht gefunden|page not found|page introuvable|pagina non trovata|404 not found|error 404|fehler 404)/i;

async function http(u) {
  const probe = async method => {
    const c = new AbortController(), to = setTimeout(() => c.abort(), 25000);
    try {
      const r = await fetch(u, { method, redirect: 'follow', signal: c.signal, headers: { 'user-agent': UA, accept: 'text/html,application/pdf,*/*', 'accept-language': 'de-CH,de;q=0.9' } });
      let soft = false;
      if (method === 'GET' && r.ok && /text\/html/.test(r.headers.get('content-type') || '')) {
        const head = (await r.text()).slice(0, 4000);
        soft = SOFT404.test(head.match(/<title[^>]*>([^<]*)/i)?.[1] || '');
      }
      return { status: r.status, final: r.url, soft };
    } catch (e) { return { status: 0, final: u, err: e.cause?.code || e.name }; }
    finally { clearTimeout(to); }
  };
  let r = await probe('HEAD');
  if (r.status !== 200 || r.final !== u) r = await probe('GET');
  else r = await probe('GET'); // Soft-404-Prüfung braucht den Titel
  return r;
}

let pw = null;
async function browserOpen(u) {
  if (!pw) {
    const base = process.env.PLAYWRIGHT_CORE || '/Users/bilalsimsek/.openclaw/tools/node-v24.21.0/lib/node_modules/openclaw/node_modules/';
    const { chromium } = createRequire(base.endsWith('/') ? base : base + '/')('playwright-core');
    let exe = process.env.CHROME_PATH;
    if (!exe) { // Playwright-Chromium aus dem Standard-Cache suchen (macOS)
      const cache = (process.env.HOME || '') + '/Library/Caches/ms-playwright/';
      const d = readdirSync(cache).filter(x => /^chromium-\d+$/.test(x)).sort().pop();
      const app = d && readdirSync(cache + d + '/chrome-mac-arm64').find(x => x.endsWith('.app'));
      if (app) exe = cache + d + '/chrome-mac-arm64/' + app + '/Contents/MacOS/' + app.replace(/\.app$/, '');
    }
    pw = await chromium.launch({ headless: true, executablePath: exe });
  }
  const ctx = await pw.newContext({ userAgent: UA, locale: 'de-CH' });
  const p = await ctx.newPage();
  try {
    const r = await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await p.waitForTimeout(2500);
    const title = await p.title();
    return { status: r?.status() ?? 0, final: p.url(), soft: SOFT404.test(title) };
  } catch (e) { return { status: 0, final: u, err: e.name }; }
  finally { await ctx.close(); }
}

const norm = s => s.replace(/^https?:\/\/(www\.)?/, '').replace(/[#?].*$/, '').replace(/\/+$/, '');
const list = [...urls.keys()].sort();
const res = [];
let idx = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (idx < list.length) {
    const u = list[idx++];
    let r = await http(u), via = 'http';
    if (args.has('--browser') && !(r.status === 200 && !r.soft)) { const b = await browserOpen(u); if (b.status === 200 && !b.soft) { r = b; via = 'browser'; } }
    const ok = r.status === 200 && !r.soft;
    const moved = ok && norm(r.final) !== norm(u);
    res.push({ u, ...r, via, level: !ok ? 'FEHLER' : moved ? 'WARN' : 'OK' });
  }
}));
if (pw) await pw.close();

res.sort((a, b) => a.u.localeCompare(b.u));
for (const r of res) {
  const info = r.level === 'OK' && r.via !== 'browser' ? '' : ` -> ${r.status || r.err}${r.soft ? ' (Soft-404)' : ''}${r.final !== r.u ? ' ' + r.final : ''}  [${[...urls.get(r.u)].join(', ')}]`;
  if (r.level !== 'OK' || r.via === 'browser') console.log(`${r.level.padEnd(6)} ${r.u}${info}${r.via === 'browser' ? ' (nur im Browser erreichbar)' : ''}`);
}
const n = l => res.filter(r => r.level === l).length, viaB = res.filter(r => r.via === 'browser').length;
console.log(`${n('OK')} OK, ${n('WARN')} WARN (Weiterleitung), ${n('FEHLER')} FEHLER von ${res.length} Links${viaB ? `; ${viaB} nur per Browser bestätigt` : ''}`);
process.exit(n('FEHLER') ? 1 : 0);
