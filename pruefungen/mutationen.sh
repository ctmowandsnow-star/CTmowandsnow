#!/usr/bin/env bash
# Gegenproben zum Durchstich.
#
# Jede Mutation baut EINEN Fehler ein, der wirklich vorkommen kann, und
# verlangt, dass der Durchstich rot wird. Ein Pruefstand, der bei Sabotage
# gruen bleibt, misst nichts - das ist mir oft genug passiert, um es nicht
# mehr ungeprueft zu lassen.
#
# Der Durchstich misst am LAUFENDEN Server, also muss nach jeder Mutation neu
# gebaut und neu gestartet werden. Das macht den Lauf langsam (~2 Min je
# Mutation) und ist der Preis dafuer, dass gemessen wird, was ausgeliefert
# wird, und nicht, was im Quelltext steht.
set -uo pipefail
cd "$(dirname "$0")/.."

PORT=${PORT:-3210}
gruen=0; rot=0

# Die Sicherung liegt IM PROJEKT mit festem Namen, nicht in einem
# mktemp-Ordner.
#
# WARUM (22.09.2026, echter Vorfall): Der erste Lauf wurde mitten in
# Mutation 3 hart beendet. Bei SIGKILL feuert kein trap - der sabotierte
# Quelltext ("Ueber uns - wir machen Ihnen gerne ein kostenlos Angebot")
# blieb stehen. Die Sicherung lag in $TMPDIR und war nicht dort, wo ich sie
# gesucht habe.
#
# Der wirklich gefaehrliche Fall waere aber der naechste Start gewesen:
# ein frisches `cp -r src sicherung` haette den SABOTIERTEN Stand als
# Original gesichert und ihn anschliessend brav zurueckgespielt. Die
# Sabotage waere damit dauerhaft im Produkt gelandet, und kein Pruefstand
# haette je wieder etwas gemeldet.
# Deshalb: feste Ablage + Abbruch, wenn beim Start schon eine daliegt.
SICHERUNG="$(pwd)/.mutation-sicherung"

if [ -d "$SICHERUNG" ] && [ "${1:-}" = "--wiederherstellen" ]; then
  rm -rf src && cp -r "$SICHERUNG" src && rm -rf "$SICHERUNG"
  echo "Quelltext aus $SICHERUNG wiederhergestellt, Sicherung entfernt."
  exit 0
fi

if [ -d "$SICHERUNG" ]; then
  echo "ABBRUCH: $SICHERUNG existiert bereits."
  echo "Der letzte Lauf wurde abgebrochen und hat moeglicherweise sabotierten"
  echo "Quelltext hinterlassen. Erst wiederherstellen, dann neu starten:"
  echo "    ./pruefungen/mutationen.sh --wiederherstellen"
  exit 2
fi

if [ "${1:-}" = "--wiederherstellen" ]; then
  echo "Keine Sicherung vorhanden - es gibt nichts wiederherzustellen."
  exit 0
fi

cp -r src "$SICHERUNG"

aufraeumen() {
  rm -rf src && cp -r "$SICHERUNG" src && rm -rf "$SICHERUNG"
  echo "  (Quelltext wiederhergestellt)"
}
trap aufraeumen EXIT INT TERM

neustart() {
  local pid
  pid=$(ss -ltnp 2>/dev/null | grep ":$PORT" | grep -oP 'pid=\K[0-9]+' | head -1)
  [ -n "$pid" ] && kill "$pid" 2>/dev/null
  sleep 2
  npx next start -p "$PORT" > /tmp/mutation-server.log 2>&1 &
  for _ in $(seq 1 25); do
    sleep 1
    curl -sf -o /dev/null "http://127.0.0.1:$PORT/" && return 0
  done
  return 1
}

pruefe() {
  local name="$1"
  if npm run build > /tmp/mutation-build.log 2>&1 && neustart; then
    if node pruefungen/durchstich.mjs > /tmp/mutation-lauf.log 2>&1; then
      echo "ROT  $name: Durchstich blieb GRUEN, obwohl der Fehler drin ist"
      rot=$((rot+1))
    else
      echo " ok  $name: Durchstich wird rot"
      grep -m2 '^ROT' /tmp/mutation-lauf.log | sed 's/^/        /'
      gruen=$((gruen+1))
    fi
  else
    # Ein Bauabbruch ist auch eine Entdeckung - aber eine andere. Getrennt
    # ausweisen, sonst zaehlt ein Tippfehler als bestandene Gegenprobe.
    echo " ok  $name: schon der Bau bricht ab (Fehler wird ebenfalls bemerkt)"
    gruen=$((gruen+1))
  fi
  rm -rf src && cp -r "$SICHERUNG" src
}

echo "== Mutation 1: Adresse trotz Entwurfsstand ins Schema =="
python3 - <<'PY'
p='src/components/seo/JsonLd.tsx'
t=open(p).read()
t=t.replace('  if (HAT_ADRESSE) {', '  if (true) {')
t=t.replace("      streetAddress: BUSINESS.contact.street,", "      streetAddress: '1 Made Up Road',")
t=t.replace("      addressLocality: BUSINESS.contact.city,", "      addressLocality: 'Nowhere',")
t=t.replace("      addressRegion: BUSINESS.contact.state,", "      addressRegion: 'MA',")
t=t.replace("      postalCode: BUSINESS.contact.zip,", "      postalCode: '01545',")
open(p,'w').write(t)
PY
pruefe "erfundene Adresse im Schema"

echo "== Mutation 2: erfundene Sternebewertung =="
python3 - <<'PY'
p='src/components/seo/JsonLd.tsx'
t=open(p).read()
t=t.replace("  if (BUSINESS.contact.phone) data.telephone = BUSINESS.contact.phone;",
 "  data.aggregateRating = { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127' };\n"
 "  if (BUSINESS.contact.phone) data.telephone = BUSINESS.contact.phone;")
open(p,'w').write(t)
PY
pruefe "erfundenes Bewertungsschema"

echo "== Mutation 3: deutscher Text im Frontend =="
python3 - <<'PY'
p='src/app/about/page.tsx'
t=open(p).read()
t=t.replace('<p className="eyebrow">About</p>',
            '<p className="eyebrow">Ueber uns - wir machen Ihnen gerne ein kostenlos Angebot</p>')
open(p,'w').write(t)
PY
pruefe "deutscher Text auf einer Seite"

echo "== Mutation 4: FAQ-Antworten fallen beim Zuklappen aus dem HTML =="
python3 - <<'PY'
p='src/components/ui/Faq.tsx'
t=open(p).read()
t=t.replace("""              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-bark-300">{it.a}</p>
              </div>""",
"""              <div className="overflow-hidden">
                {isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-bark-300">{it.a}</p>}
              </div>""")
open(p,'w').write(t)
PY
pruefe "zugeklappte FAQ-Antwort nicht im HTML"

echo "== Mutation 5: Name aus Leerzeichen wird angenommen =="
python3 - <<'PY'
p='src/app/api/quote/route.ts'
t=open(p).read()
t=t.replace("  return typeof v === 'string' ? v.trim().slice(0, max) : '';",
            "  return typeof v === 'string' ? v.slice(0, max) : '';")
open(p,'w').write(t)
PY
pruefe "Name aus lauter Leerzeichen"

echo "== Mutation 6: Formular behauptet Zustellung =="
# Seit 26.09.2026 gibt es echten Mailversand; `delivered` darf nur nach einer
# von Resend angenommenen Mail wahr sein. Sabotiert wird der Schlusszweig
# "kein Versand eingerichtet". Der Anker wird geprueft - ein Ersatz, der
# nichts findet, baut keinen Fehler ein und liesse die Mutation still
# "bemerkt" aussehen (genau so war diese Mutation nach dem Umbau tot).
python3 - <<'PY'
p='src/app/api/quote/route.ts'
t=open(p).read()
a="  return NextResponse.json({ ok: true, delivered: false });\n}\n"
assert t.count(a) == 1, 'ANKER FEHLT: Schlusszweig von route.ts'
t=t.replace(a, "  return NextResponse.json({ ok: true, delivered: true });\n}\n")
open(p,'w').write(t)
PY
pruefe "falsche Zustellbestaetigung"

echo "== Mutation 6b: Honigtopf wirkungslos =="
python3 - <<'PY'
p='src/app/api/quote/route.ts'
t=open(p).read()
a="  if (text(body.leave_empty, 200)) return NextResponse.json({ ok: true, delivered: false });\n"
assert t.count(a) == 1, 'ANKER FEHLT: Honigtopf in route.ts'
t=t.replace(a, "")
open(p,'w').write(t)
PY
pruefe "Bot-Anfrage wird abgelegt"

echo "== Mutation 7: Sitemap laesst Ortsseiten weg =="
# Der erste Versuch war "ein Ort verschwindet aus towns.ts". Der blieb gruen -
# und zwar zu Recht: faellt ein Ort ueberall gleichzeitig weg, ist das eine
# Konfigurationsaenderung, kein Defekt. Die Mutation hat also gar keinen Fehler
# eingebaut, und ein Pruefstand kann nichts melden, was nicht kaputt ist.
# Der ECHTE Fehler ist, wenn Konfiguration und ausgeliefertes Erzeugnis
# auseinanderlaufen: Orte in towns.ts vorhanden, Seiten fehlen in der Sitemap.
python3 -c "
p='src/app/sitemap.ts'
t=open(p).read()
t=t.replace('...TOWNS.map((t) => ({', '...TOWNS.slice(0, 5).map((t) => ({')
open(p,'w').write(t)
"
pruefe "Sitemap nennt nur einen Teil der Orte"

echo "== Mutation 8: Kombiseiten verlieren ihren ortsspezifischen Teil =="
# Die gefaehrlichste Aenderung an dieser Website: 70 Seiten, die alle
# dasselbe sagen. Keine Einzelseite sieht dabei kaputt aus - nur der
# Vergleich zweier Seiten zeigt es. Genau dafuer gibt es doorway.mjs.
python3 -c "
p='src/app/services/[slug]/[town]/page.tsx'
t=open(p).read()
t=t.replace('{t.merkmale[k]}', '{\\'Every property is different, and we treat it that way.\\'}')
t=t.replace('{t.character}', '{\\'We work across the whole area.\\'}')
open(p,'w').write(t)
"
if npm run build > /tmp/mutation-build.log 2>&1 && neustart; then
  if node pruefungen/doorway.mjs > /tmp/mutation-doorway.log 2>&1; then
    echo "ROT  Kombiseiten ohne Ortsbezug: doorway.mjs blieb GRUEN"
    rot=$((rot+1))
  else
    echo " ok  Kombiseiten ohne Ortsbezug: doorway.mjs wird rot"
    grep -m2 '^ROT' /tmp/mutation-doorway.log | sed 's/^/        /'
    gruen=$((gruen+1))
  fi
else
  echo " ok  Kombiseiten ohne Ortsbezug: schon der Bau bricht ab"
  gruen=$((gruen+1))
fi
rm -rf src && cp -r "$SICHERUNG" src

echo
echo "$gruen von $((gruen+rot)) Mutationen wurden bemerkt."
[ "$rot" -eq 0 ] || exit 1
