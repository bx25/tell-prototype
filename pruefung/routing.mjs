// Prüft die Zuordnung Frage -> Prozess in index.html (Funktion route).
// Aufruf: node pruefung/routing.mjs   (Exit-Code 1 bei Abweichung)
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const src = html.slice(html.indexOf('function route(q)'), html.indexOf('function goAsk'));
const route = new Function(src + '\nreturn route;')();

// [Frage, erwarteter Prozess oder null = Fallback "noch keine Antwort"]
const FAELLE = [
  // Die Beispielfragen (DE) (Chips) müssen exakt treffen
  ['Ich ziehe von Bern nach Winterthur: Wie und bis wann melde ich mich ab und an?', 'move'],
  ['Ich wohne in Bern und brauche einen neuen Pass und eine Identitätskarte. Wie und wo bestelle ich die?', 'passport'],
  ['Ich wohne in Bern und schaffe meine Steuererklärung nicht bis Mitte März. Wie verlängere ich die Frist und was kostet das?', 'tax'],
  ['Ich bin Jahrgang 1962 und wohne in Thun: Wann und wo melde ich meine AHV-Rente an?', 'ahv'],
  ['Ich wohne in Thun und verliere Ende Monat meine Stelle. Wo und wann muss ich mich melden, und wie bekomme ich Arbeitslosengeld?', 'alv'],
  ['Bis wann kann ich meine Krankenkasse wechseln und wie geht das?', 'kk'],
  ['Ich wohne in Bern und mache mich mit einer Einzelfirma selbstständig. Was muss ich wo anmelden?', 'biz'],
  ['Ich wohne seit einigen Monaten in Bern und habe einen deutschen Führerausweis. Muss ich ihn umtauschen, und wie?', 'drv'],
  ['Wir sind beide Schweizer, wohnen in Zürich und wollen heiraten. Wie läuft das und was kostet es?', 'wed'],
  ['Ich wohne in der Stadt Bern und habe einen Hund übernommen. Wo melde ich ihn an und was kostet das?', 'dog'],
  // Abgrenzungen, die heute stimmen
  ['Hundesteuer bezahlen', 'dog'],
  ['Ich ziehe mit meinem Hund um', 'dog'],
  ['Ich ziehe um, muss ich die Krankenkasse informieren?', 'move'],
  ['Ich will eine Firma gründen', 'biz'],
  ['Brauche ich einen Eintrag im Handelsregister?', 'biz'],
  ['Ab wann muss ich Mehrwertsteuer abrechnen?', 'biz'],
  ['Welche AHV-Beiträge zahle ich als Selbstständiger?', 'biz'],
  ['Steuererklärung als Selbstständige: Frist verlängern', 'tax'],
  ['AHV-Rente anmelden, ich war selbstständig', 'ahv'],
  ['Selbstständig nach Kündigung, muss ich zum RAV?', 'alv'],
  ['Muss ich mein Gewerbe anmelden?', 'biz'],
  ['Nach der Heirat brauche ich einen neuen Pass', 'passport'],
  ['Wann muss ich die Ehevorbereitung machen?', 'wed'],
  ['Ich bin verheiratet und mache die Steuererklärung', 'tax'],
  ['We want to get married in Switzerland', 'wed'],
  ['Hochzeit im Standesamt planen', 'wed'],
  ['Wie tausche ich meinen Führerschein aus den USA um?', 'drv'],
  ['Führerausweis: neue Adresse nach Umzug melden', 'move'],
  ['Ich brauche einen Lernfahrausweis', null],
  ['Muss ich mit meinem Führerausweis aus Brasilien eine Kontrollfahrt machen?', 'drv'],
  ['Échanger mon permis de conduire étranger', 'drv'],
  ['How do I exchange my foreign driving licence?', 'drv'],
  ['Je deviens indépendant, que faire ?', 'biz'],
  ['Registering as self-employed in Switzerland', 'biz'],
  ['Mir wurde gekündigt, was nun?', 'alv'],
  ['Wie melde ich mich beim RAV an?', 'alv'],
];

// Bekannte offene Fehler (Stand 7.10.2026). Werden angezeigt, brechen den Test aber nicht ab.
// Wer einen davon behebt, verschiebt ihn nach oben in FAELLE.
const OFFEN = [
  ['Pensionskasse auszahlen lassen', null],               // landet bei AHV (2. statt 1. Säule)
  ['Ich habe eine IV-Rente', null],                       // landet bei AHV
  ['Ich möchte meine Adresse bei der Steuerverwaltung ändern', 'move'], // landet bei Steuerfrist
  ['Ich verliere meine Stelle', 'alv'],                   // kein Treffer, Fallback
  ['Stellensuche nach Kündigung', 'alv'],                 // kein Treffer, Fallback
];

// Alle Beispielfragen (Chips) in DE/FR/IT/EN müssen ihren Prozess treffen
const KEYS = ['move', 'passport', 'tax', 'ahv', 'alv', 'kk', 'biz', 'drv', 'wed', 'dog'];
const chipRe = /\{"?l"?:\s*"([^"]+)",\s*"?q"?:\s*"([^"]+)"\}/g;
let m, n = 0;
while ((m = chipRe.exec(html))) FAELLE.push([m[2], KEYS[n++ % KEYS.length]]);
if (n !== 4 * KEYS.length) { console.log(`FEHLER: ${n} statt ${4 * KEYS.length} Beispielfragen gefunden`); process.exit(1); }

let fehler = 0;
for (const [frage, soll] of FAELLE) {
  const ist = route(frage);
  const ok = ist === soll;
  if (!ok) fehler++;
  console.log(`${ok ? 'OK    ' : 'FEHLER'} soll=${String(soll).padEnd(8)} ist=${String(ist).padEnd(8)} ${frage}`);
}
console.log(`\n${FAELLE.length - fehler}/${FAELLE.length} Pflichtfälle korrekt\n\nBekannte offene Fehler:`);
for (const [frage, soll] of OFFEN) {
  const ist = route(frage);
  console.log(`${ist === soll ? 'BEHOBEN' : 'OFFEN  '} soll=${String(soll).padEnd(8)} ist=${String(ist).padEnd(8)} ${frage}`);
}
process.exit(fehler ? 1 : 0);
