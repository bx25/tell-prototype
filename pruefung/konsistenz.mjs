// Prüft, dass jede Antwort aus index.html (alle Sprachen) wörtlich auch in frag-tell.html steht
// und dass die Quellen-URLs (SRC_URL) in beiden Seiten gleich sind.
// Aufruf: node pruefung/konsistenz.mjs   (Exit-Code 1 bei Abweichung)
import { readFileSync } from 'node:fs';

const lese = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const a = lese('index.html'), b = lese('frag-tell.html');
let fehler = 0;

const srcUrl = s => { const i = s.indexOf('const SRC_URL='); return s.slice(i, s.indexOf(';', i)); };
if (srcUrl(a) !== srcUrl(b)) { fehler++; console.log('FEHLER Quellen-URLs unterscheiden sich'); }

const B = b.replaceAll(' ', ' ');
for (const lang of ['de', 'fr', 'it', 'en']) {
  const st = a.indexOf('\n' + lang + ':{', a.indexOf('const I18N='));
  const blk = a.slice(a.indexOf('ans:{', st), a.indexOf('\n  }', a.indexOf('ans:{', st)));
  const texte = [...blk.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => JSON.parse('"' + m[1] + '"')).filter(t => t.length > 25);
  const fehlt = texte.filter(t => !b.includes(t) && !B.includes(t.replaceAll(' ', ' ')) && !b.includes(JSON.stringify(t).slice(1, -1)));
  fehler += fehlt.length;
  console.log(`${fehlt.length ? 'FEHLER' : 'OK    '} ${lang}: ${texte.length - fehlt.length}/${texte.length} Texte gleich`);
  fehlt.slice(0, 3).forEach(t => console.log('   fehlt:', t.slice(0, 120)));
}

// route() ist in beiden Seiten wörtlich gleich
const route = h => h.match(/function route\(q\)\{.*?\n\}\n/s)?.[0];
if (!route(a) || route(a) !== route(b)) { fehler++; console.log('FEHLER route() in index.html und frag-tell.html unterscheidet sich'); }
else console.log('OK     route() in beiden Seiten gleich');

// Zahl der Themen: eine Quelle der Wahrheit (I18N[lang].tnames); Antworten, Beispielfragen und Karten müssen dazu passen
const iStart = a.indexOf('const SRC_URL='), iEnd = a.indexOf('\n(()=>{', iStart);
const { I18N } = new Function(a.slice(iStart, iEnd) + '\nreturn { I18N };')();
const pStart = b.indexOf('const PAGE='), PAGE = JSON.parse(b.slice(pStart + 11, b.indexOf('\n', pStart) - 1));
const SRC = new Function(srcUrl(a).replace('const SRC_URL=', 'return ') + ';')(), urlKeys = Object.keys(SRC);
for (const lang of ['de', 'fr', 'it', 'en']) {
  const L = I18N[lang], n = L.tnames.length, antworten = Object.keys(L.ans);
  const karten = PAGE[lang].views.abdeckung.blocks.find(x => x.type === 'topics').items.length;
  const probleme = [];
  if (antworten.length !== n) probleme.push(`${antworten.length} Antworten`);
  if (L.chips.length !== n) probleme.push(`${L.chips.length} Beispielfragen`);
  if (karten !== n) probleme.push(`${karten} Karten in Frag Tell`);
  if (urlKeys.length !== n || urlKeys.some(k => !antworten.includes(k))) probleme.push('Quellen-URLs passen nicht zu den Antworten');
  if (!L.nw[n]) probleme.push('Zahlwort fehlt');
  if (antworten.some(k => L.ans[k].src.length !== SRC[k]?.length)) probleme.push('Zahl der Quellen passt nicht zu den URLs');
  fehler += probleme.length;
  console.log(`${probleme.length ? 'FEHLER' : 'OK    '} ${lang}: ${n} Themen in tnames, Antworten, Beispielfragen, Karten${probleme.length ? ' (' + probleme.join(', ') + ')' : ''}`);
}
process.exit(fehler ? 1 : 0);
