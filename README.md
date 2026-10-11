# Tell (Konzeptprototyp)

Privates Konzept von Bilal Simsek, Bern. Kein Angebot und keine offizielle Seite des Bundes, der Kantone oder der Gemeinden. Alle Fallbeispiele sind frei erfunden; die Prozessangaben in der Chatbox stammen aus öffentlichen Quellen (Stand Oktober 2026, ohne Gewähr).

Bildnachweis:
- Matterhorn: «Sunrise on the Matterhorn», Jean Schmitt, CC BY-SA 4.0, via Wikimedia Commons (bearbeitet).
- Bundeshaus (freigestellt, bearbeitet): «Bundeshaus Bern 20180827-2», Suicasmo, CC BY-SA 4.0, via Wikimedia Commons. Die bearbeitete Fassung steht unter derselben Lizenz (CC BY-SA 4.0).
- Vorschaubild und Fotos zusätzlich: «Summer evening in Bern», Karlheinz Klingbeil, CC BY 4.0, via Wikimedia Commons (bearbeitet).
- Schrift Switzer, Indian Type Foundry (Fontshare), ITF Free Font License.

Prozess-Check (`prozesse.html`): zeigt, welche Chat-Prozesse belegt, korrekt und aktuell sind. Prüfskripte:
- `node pruefung/routing.mjs`: Fragen landen beim richtigen Prozess (alle Beispielfragen in vier Sprachen, Freitext-Fragen zu «Gewerbe / Einzelfirma», «Wegzug ins Ausland», «Zuzug aus dem Ausland» und «Arbeitslos melden», Abgrenzungen Zuzug / Umzug in der Schweiz / Wegzug).
- `node pruefung/konsistenz.mjs`: Antworten und `route()` in index.html und frag-tell.html sind in allen Sprachen gleich; die Zahl der Themen (`tnames`) passt zu Antworten, Beispielfragen und Karten in «Frag Tell». Texte nennen die Zahl nicht von Hand (`{n}`, `{list}`).
- `node pruefung/linkcheck.mjs [--browser] [--eigene]`: prüft alle externen Links in allen Seiten (HTTP, Weiterleitungen, Soft-404); mit `--browser` werden Links, die per HTTP nicht antworten, mit Playwright nachgeprüft (`PLAYWRIGHT_CORE`, `CHROME_PATH` setzen, falls nötig). Exit-Code 1 bei toten Links.
