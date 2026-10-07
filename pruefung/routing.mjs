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
  ['Ich bin in Bern angestellt und habe ein Baby bekommen. Wie bekomme ich Kinderzulagen und wie viel gibt es?', 'fam'],
  ['Ich wohne in Bern und brauche für eine neue Wohnung einen Betreibungsregisterauszug. Wo bestelle ich ihn und was kostet er?', 'debt'],
  ['Ich brauche für eine neue Stelle einen Strafregisterauszug. Wie bestelle ich ihn und wie lange dauert es?', 'crim'],
  ['Ich wohne in Bern und habe ein Occasionsauto gekauft. Wie löse ich es ein und was kostet das?', 'car'],
  ['Ich lebe seit 12 Jahren in der Schweiz, davon 3 in der Stadt Bern, und habe den C-Ausweis. Kann ich mich einbürgern lassen und was kostet das?', 'nat'],
  ['Ich wohne im Kanton Bern und verdiene wenig. Bekomme ich Prämienverbilligung und muss ich sie beantragen?', 'pv'],
  ['Ich bin 22, wohne in Bern und wurde für den Militärdienst untauglich erklärt. Muss ich Wehrpflichtersatz zahlen und wie viel?', 'wpe'],
  ['Ich wohne in der Stadt Bern und will im Garten ein kleines Gartenhaus aufstellen. Brauche ich eine Baubewilligung?', 'bau'],
  ['Ich wohne in Bern und habe meine Identitätskarte verloren. Was muss ich tun und was kostet das?', 'lost'],
  ['Wir wohnen in der Stadt Bern und wollen unser Kind in die Kita geben. Bekommen wir Betreuungsgutscheine und wie beantragen wir sie?', 'kita'],
  ['Ich wohne in der Stadt Bern und komme mit meinem Geld nicht mehr durch. Wie beantrage ich Sozialhilfe?', 'soz'],
  ['Ich bin pensioniert, wohne in Thun und meine AHV-Rente reicht nicht. Kann ich Ergänzungsleistungen beantragen?', 'el'],
  ['Ich wohne in Bern und bin seit Monaten krank und arbeitsunfähig. Wie melde ich mich bei der IV an?', 'iv'],
  ['Ich bin angestellt und bekomme im Frühling ein Kind. Wie viel Mutterschaftsentschädigung erhalte ich und wie beantrage ich sie?', 'mse'],
  ['Ich bin angestellt und werde im Frühling Vater. Wie lange ist der Vaterschaftsurlaub und wie bekomme ich die Entschädigung?', 'pat'],
  ['Ich bin 17, wohne in Bern und will Auto fahren lernen. Wie bekomme ich den Lernfahrausweis?', 'lfa'],
  ['Ich wohne in der Stadt Bern und brauche eine Wohnsitzbestätigung. Wo bekomme ich sie und was kostet sie?', 'wsb'],
  ['Meine Mutter ist zu Hause in der Stadt Bern gestorben. Was muss ich jetzt tun und wo melde ich den Todesfall?', 'tod'],
  ['Ich wohne in der Stadt Bern und habe ein Auto. Wie bekomme ich eine Anwohnerparkkarte und was kostet sie?', 'pk'],
  ['Ich wohne in der Stadt Bern und will ein altes Sofa loswerden. Wie entsorge ich Sperrgut und was kostet das?', 'spg'],
  ['Ich habe in der Stadt Bern mein Portemonnaie verloren. Wie melde ich das beim Fundbüro?', 'fund'],
  ['Ein Kunde in Bern zahlt meine Rechnung über CHF 2\'000 nicht. Wie leite ich eine Betreibung ein?', 'bet'],
  ['Ich wohne im Kanton Bern und verkaufe mein Auto. Wie melde ich es ab und was passiert mit den Nummernschildern?', 'abm'],
  ['Ich arbeite neu in der Stadt Bern und gehe am Wochenende nach Hause ins Wallis. Wie melde ich mich als Wochenaufenthalter an?', 'wa'],
  ['Ich wohne in Bern und will aus der Kirche austreten. Wie geht das und ab wann zahle ich keine Kirchensteuer mehr?', 'kir'],
  ['Mir wurde in Bern das Velo gestohlen. Wie melde ich den Diebstahl bei der Polizei?', 'dieb'],
  // Abgrenzungen, die heute stimmen
  ['Handy gestohlen', 'dieb'],
  ['vélo volé', 'dieb'],
  ['Mein Pass wurde gestohlen', 'lost'],
  ['Kirchenaustritt Brief', 'kir'],
  ['quitter l’Église', 'kir'],
  ['Heimatausweis für Bern', 'wa'],
  ['séjour hebdomadaire Berne', 'wa'],
  ['Nummernschilder deponieren', 'abm'],
  ['Auto abmelden', 'abm'],
  ['Nummernschilder für mein neues Auto', 'car'],
  ['Ich habe einen Zahlungsbefehl erhalten', 'bet'],
  ['commandement de payer', 'bet'],
  ['Betreibungsauszug für die Wohnungssuche', 'debt'],
  ['Ich habe einen Schlüssel gefunden', 'fund'],
  ['bureau des objets trouvés', 'fund'],
  ['Ich habe meine ID verloren', 'lost'],
  ['Sperrgut nach dem Umzug abholen lassen', 'spg'],
  ['déchetterie horaires', 'spg'],
  ['Parkkarte nach Umzug', 'pk'],
  ['carte de stationnement résidents', 'pk'],
  ['Bestattung organisieren', 'tod'],
  ['annoncer un décès', 'tod'],
  ['Mein Mann ist gestorben. Bekomme ich eine AHV-Witwenrente?', 'ahv'],
  ['Wohnsitzbescheinigung bestellen', 'wsb'],
  ['attestation de domicile', 'wsb'],
  ['Neuen Wohnsitz anmelden', 'move'],
  ['Theorieprüfung buchen', 'lfa'],
  ['Nothelferkurs für den Lernfahrausweis', 'lfa'],
  ['permis d’élève conducteur', 'lfa'],
  ['Ausländischen Führerausweis umtauschen', 'drv'],
  ['Papiurlaub tageweise beziehen', 'pat'],
  ['congé paternité', 'pat'],
  ['Vaterschaftsurlaub als Selbstständiger', 'pat'],
  ['Taggeld bei Mutterschaft', 'mse'],
  ['Mutterschaftsentschädigung als Selbstständige', 'mse'],
  ['congé maternité indemnité', 'mse'],
  ['Hundesteuer bezahlen', 'dog'],
  ['Bekomme ich als Selbstständige Kinderzulagen?', 'fam'],
  ['Ausbildungszulage für meine Tochter', 'fam'],
  ['Betreibungsauszug nach Umzug bestellen', 'debt'],
  ['Leumundszeugnis für den Arbeitgeber', 'crim'],
  ['Nummernschilder für mein neues Auto', 'car'],
  ['Ich ziehe um, muss ich den Fahrzeugausweis ändern?', 'move'],
  ['Wie hoch ist die Motorfahrzeugsteuer?', 'car'],
  ['Schweizer Pass nach der Einbürgerung', 'nat'],
  ['How do I get Swiss citizenship?', 'nat'],
  ['Krankenkasse zu teuer, gibt es eine Verbilligung?', 'pv'],
  ['Krankenkasse wechseln wegen hoher Prämie', 'kk'],
  ['Ersatzabgabe zurückfordern nach Zivildienst', 'wpe'],
  ['Baugesuch über eBau einreichen', 'bau'],
  ['Mein Pass wurde gestohlen', 'lost'],
  ['My passport was stolen', 'lost'],
  ['Ich brauche einen neuen Pass', 'passport'],
  ['Kinderzulage für mein Kind in der Kita', 'fam'],
  ['Anmeldung beim Sozialdienst', 'soz'],
  ['EL zur IV beantragen', 'el'],
  ['Ich habe eine IV-Rente', 'iv'],
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
  ['Ich brauche einen Lernfahrausweis', 'lfa'],
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
  ['Ich möchte meine Adresse bei der Steuerverwaltung ändern', 'move'], // landet bei Steuerfrist
  ['Ich verliere meine Stelle', 'alv'],                   // kein Treffer, Fallback
  ['Stellensuche nach Kündigung', 'alv'],                 // kein Treffer, Fallback
];

// Alle Beispielfragen (Chips) in DE/FR/IT/EN müssen ihren Prozess treffen
const KEYS = ['move', 'passport', 'tax', 'ahv', 'alv', 'kk', 'biz', 'drv', 'wed', 'dog', 'fam', 'debt', 'crim', 'car', 'nat', 'pv', 'wpe', 'bau', 'lost', 'kita', 'soz', 'el', 'iv', 'mse', 'pat', 'lfa', 'wsb', 'tod', 'pk', 'spg', 'fund', 'bet', 'abm', 'wa', 'kir', 'dieb'];
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
