// Prüft die Zuordnung Frage -> Prozess in index.html (Funktion route).
// Aufruf: node pruefung/routing.mjs   (Exit-Code 1 bei Abweichung)
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const src = html.slice(html.indexOf('function route(q)'), html.indexOf('function goAsk'));
const route = new Function(src + '\nreturn route;')();

// [Frage, erwarteter Prozess oder null = Fallback "noch keine Antwort"]
const FAELLE = [
  // Die Beispielfragen (Chips) müssen exakt treffen; unten kommen alle Chips in DE/FR/IT/EN dazu
  ['Ich ziehe von Bern nach Winterthur: Wie und bis wann melde ich mich ab und an?', 'move'],
  ['Ich wohne in Bern und brauche einen neuen Pass und eine Identitätskarte. Wie und wo bestelle ich die?', 'passport'],
  ['Ich wohne in Bern und schaffe meine Steuererklärung nicht bis Mitte März. Wie verlängere ich die Frist und was kostet das?', 'tax'],
  ['Ich bin Jahrgang 1962 und wohne in Thun: Wann und wo melde ich meine AHV-Rente an?', 'ahv'],
  ['Ich wohne in Thun und verliere Ende Monat meine Stelle. Wo und wann muss ich mich melden, und wie bekomme ich Arbeitslosengeld?', 'alv'],
  ['Bis wann kann ich meine Krankenkasse wechseln und wie geht das?', 'kk'],
  // Abgrenzungen, die heute stimmen
  ['Hundesteuer bezahlen', null],
  ['Ich ziehe um, muss ich die Krankenkasse informieren?', 'move'],
  ['Ich will eine Firma gründen', null],
  ['Mir wurde gekündigt, was nun?', 'alv'],
  ['Wie melde ich mich beim RAV an?', 'alv'],
  // Thema «Gewerbe / Einzelfirma anmelden» (gew): kein Beispiel-Chip, nur per Freitext
  ['Wie melde ich eine Einzelfirma an?', 'gew'],
  ['Ich mache mich selbständig, was muss ich tun?', 'gew'],
  ['Ich möchte mich selbstständig machen', 'gew'],
  ['Gewerbe anmelden', 'gew'],
  ['Muss ich mich ins Handelsregister eintragen?', 'gew'],
  ['Ab wann bin ich mehrwertsteuerpflichtig?', 'gew'],
  ['Als Einzelunternehmer bei der Ausgleichskasse anmelden', 'gew'],
  ['Comment créer mon entreprise individuelle ?', 'gew'],
  ['Je veux me mettre à mon compte, que dois-je faire ?', 'gew'],
  ['Quand faut-il s’inscrire au registre du commerce ?', 'gew'],
  ['Comment devenir indépendant en Suisse ?', 'gew'],
  ['Come apro una ditta individuale?', 'gew'],
  ['Voglio mettermi in proprio: cosa devo fare?', 'gew'],
  ['Quando devo iscrivermi al registro di commercio?', 'gew'],
  ['How do I register as a sole proprietor?', 'gew'],
  ['I want to become self-employed in Switzerland', 'gew'],
  ['When do I have to register for VAT?', 'gew'],
  // Abgrenzungen zu «gew»: die anderen Themen behalten Vorrang
  ['Wie gründe ich eine GmbH?', null],
  ['Mehrwertsteuer auf einer Restaurantrechnung', null],
  ['Ich bin selbständig und brauche eine Fristverlängerung für die Steuererklärung', 'tax'],
  ['Je suis indépendant, comment prolonger le délai de ma déclaration d’impôt ?', 'tax'],
  ['Mir wurde gekündigt, ich will mich selbständig machen', 'alv'],
  ['Wann kann ich als Selbständiger meine AHV-Rente anmelden?', 'ahv'],
  ['I am self-employed, when can I claim my AHV pension?', 'ahv'],
  // Thema «Wegzug ins Ausland» (wegz)
  ['Wie melde ich mich bei einem Wegzug ins Ausland ab?', 'wegz'],
  ['Ich ziehe ins Ausland, was muss ich tun?', 'wegz'],
  ['Umzug ins Ausland: Bis wann muss ich mich abmelden?', 'wegz'],
  ['Abmeldung ins Ausland', 'wegz'],
  ['Ich wandere nach Kanada aus', 'wegz'],
  ['Ich verlasse Ende Jahr die Schweiz', 'wegz'],
  ['Ich ziehe nach Deutschland, was muss ich in der Schweiz erledigen?', 'wegz'],
  ['Ich ziehe ins Ausland. Was passiert mit meiner Krankenkasse?', 'wegz'],
  ['Ich ziehe ins Ausland. Muss ich noch eine Steuererklärung machen?', 'wegz'],
  ['Ich bin selbständig und ziehe ins Ausland', 'wegz'],
  ['Je pars vivre à l’étranger : comment annoncer mon départ ?', 'wegz'],
  ['Je quitte la Suisse pour l’Allemagne', 'wegz'],
  ['Je déménage à l’étranger, quand dois-je me désinscrire ?', 'wegz'],
  ['Je veux émigrer au Canada', 'wegz'],
  ['Mi trasferisco all’estero, come mi annuncio?', 'wegz'],
  ['Voglio lasciare la Svizzera', 'wegz'],
  ['Parto per l’estero: entro quando devo annunciare la partenza?', 'wegz'],
  ['I am moving abroad, how do I deregister?', 'wegz'],
  ['How do I leave Switzerland for good?', 'wegz'],
  ['I want to emigrate from Switzerland', 'wegz'],
  // Abgrenzungen zu «wegz»: Wörter wie «Ausland» allein genügen nicht, andere Themen und Inlandumzüge bleiben unberührt
  ['Ich brauche im Ausland einen neuen Pass', 'passport'],
  ['Ich wohne im Ausland und muss eine Steuererklärung abgeben', 'tax'],
  ['Wann kann ich meine AHV-Rente im Ausland beziehen?', 'ahv'],
  ['Ich ziehe von Bern nach Winterthur', 'move'],
  ['Ich ziehe nach Bern, wo melde ich mich an?', 'move'],
  // Thema «Arbeitslos melden» (alv): neue Wendungen für Stellenverlust und Kündigung (T3)
  ['Ich verliere meine Stelle', 'alv'],
  ['Stellensuche nach Kündigung', 'alv'],
  ['Ich habe die Kündigung erhalten, was muss ich tun?', 'alv'],
  ['Wie viele Wartetage habe ich bei der Arbeitslosenversicherung?', 'alv'],
  ['Wie viele Taggelder bekomme ich?', 'alv'],
  ['Ich verliere meine Stelle und ziehe ins Ausland', 'alv'],
  ['Je perds mon emploi, que dois-je faire ?', 'alv'],
  ['Je vais perdre mon emploi à la fin du mois', 'alv'],
  ['Perdo il lavoro alla fine del mese, cosa devo fare?', 'alv'],
  ['I am losing my job at the end of the month', 'alv'],
  ['I lose my job next week, who do I contact?', 'alv'],
  ['I am looking for a job after my dismissal', 'alv'],
  // Thema «Zuzug aus dem Ausland» (zuz)
  ['Ich ziehe aus dem Ausland in die Schweiz, wo melde ich mich an?', 'zuz'],
  ['Zuzug aus dem Ausland: Was muss ich tun?', 'zuz'],
  ['Ich komme aus Deutschland in die Schweiz zum Arbeiten', 'zuz'],
  ['Ich wandere in die Schweiz ein', 'zuz'],
  ['Ich bin Schweizerin und kehre aus dem Ausland zurück', 'zuz'],
  ['Ich ziehe zurück in die Schweiz', 'zuz'],
  ['Wie bekomme ich eine Aufenthaltsbewilligung?', 'zuz'],
  ['Wie lange darf ich ohne Aufenthaltsbewilligung in der Schweiz bleiben?', 'zuz'],
  ['Bis wann muss ich mich nach dem Zuzug aus dem Ausland krankenversichern?', 'zuz'],
  ['Ich ziehe aus dem Ausland in die Schweiz, was muss ich mit der Krankenkasse tun?', 'zuz'],
  ['Ich bin neu in der Schweiz, was muss ich anmelden?', 'zuz'],
  ['Je viens m’installer en Suisse, que dois-je faire ?', 'zuz'],
  ['J’arrive de l’étranger : dans quel délai dois-je m’annoncer à la commune ?', 'zuz'],
  ['Comment obtenir un permis de séjour ?', 'zuz'],
  ['Mi trasferisco in Svizzera dall’estero, come mi annuncio?', 'zuz'],
  ['Come ottengo il permesso di dimora?', 'zuz'],
  ['Arrivo in Svizzera: entro quando devo assicurarmi?', 'zuz'],
  ['I am moving to Switzerland from abroad', 'zuz'],
  ['How do I get a residence permit?', 'zuz'],
  ['I just arrived in Switzerland, what do I need to do?', 'zuz'],
  ['I am a Swiss citizen returning to Switzerland', 'zuz'],
  // Abgrenzung Zuzug / Umzug innerhalb der Schweiz / Wegzug
  ['Ich ziehe von Bern nach Winterthur', 'move'],
  ['Ich ziehe innerhalb der Schweiz um, wo melde ich mich ab?', 'move'],
  ['Ich ziehe nach Zürich, wo melde ich mich an?', 'move'],
  ['Je déménage de Berne à Winterthour', 'move'],
  ['Mi trasferisco da Berna a Winterthur', 'move'],
  ['I am moving from Bern to Winterthur', 'move'],
  ['Ich ziehe aus der Schweiz weg', 'wegz'],
  ['Ich ziehe ins Ausland', 'wegz'],
  ['Ich ziehe von der Schweiz nach Deutschland', 'wegz'],
  ['Wegzug aus der Schweiz: Was passiert mit der Krankenkasse?', 'wegz'],
  ['I am leaving Switzerland to live abroad', 'wegz'],
  ['I am moving abroad from Switzerland', 'wegz'],
  ['Je quitte la Suisse pour vivre à l’étranger', 'wegz'],
  ['Lascio la Svizzera per vivere all’estero', 'wegz'],
  // Abgrenzung zu «zuz»: Steuer-, AHV-, Pass- und Gewerbe-Wörter behalten ihr Thema
  ['Ich ziehe aus dem Ausland in die Schweiz, muss ich eine Steuererklärung machen?', 'tax'],
  ['Ich komme aus dem Ausland und brauche einen neuen Pass', 'passport'],
  ['Ich ziehe aus dem Ausland in die Schweiz und mache mich selbständig', 'gew'],
  ['I moved to Switzerland from abroad, do I need a tax return?', 'tax'],
  ['Ich bin aus dem Ausland zurückgekehrt und arbeitslos', 'alv'],
  ['Stimmrecht für Auslandschweizer', null],
  ['Je m’installe dans la Suisse romande, où dois-je m’annoncer ?', null],
];

// Bekannte offene Fehler (Stand 11.10.2026). Werden angezeigt, brechen den Test aber nicht ab.
// Wer einen davon behebt, verschiebt ihn nach oben in FAELLE.
const OFFEN = [
  ['Pensionskasse auszahlen lassen', null],               // landet bei AHV (2. statt 1. Säule)
  ['Ich habe eine IV-Rente', null],                       // landet bei AHV
  ['Ich möchte meine Adresse bei der Steuerverwaltung ändern', 'move'], // landet bei Steuerfrist
];

// Alle Beispielfragen (Chips) in DE/FR/IT/EN müssen ihren Prozess treffen
const KEYS = ['move', 'passport', 'tax', 'ahv', 'alv', 'kk', 'gew', 'wegz', 'zuz'];
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
