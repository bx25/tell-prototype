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
process.exit(fehler ? 1 : 0);
