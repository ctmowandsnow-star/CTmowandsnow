/**
 * EINE Quelle fuer alle Fakten ueber den Betrieb.
 *
 * Alles, was hier mit `PLATZHALTER` markiert ist, stammt NICHT vom Kunden,
 * sondern ist von mir gesetzt, damit die Seite baubar und vorzeigbar ist.
 * Sobald die echten Angaben da sind, wird nur diese Datei angefasst - kein
 * Text in den Seiten.
 *
 * WARUM DAS WICHTIG IST:
 * Eine KI-Antwort ist nur so gut wie die Fakten, die sie findet. Eine falsche
 * Adresse oder eine erfundene Bewertung im strukturierten Datensatz ist eine
 * Falschangabe gegenueber Google UND gegenueber ChatGPT/Perplexity. Deshalb:
 * solange `istEntwurf` true ist, wird KEIN LocalBusiness-Schema mit Adresse
 * ausgeliefert und KEIN Bewertungsschema - lieber gar kein Signal als ein
 * falsches. Siehe src/components/seo/JsonLd.tsx.
 */

export const BUSINESS = {
  /** Vom Betrieb selbst geliefert (22.09.2026). */
  name: 'CT Mow&Snow',
  /** Kurzform fuers Logo auf schmalen Bildschirmen. */
  shortName: 'CT Mow&Snow',
  /** PLATZHALTER - Name des Inhabers fehlt noch. */
  ownerName: 'Owner name pending',
  /** Seine eigene Ueberschrift. */
  tagline: 'Reliable Lawn Care & Snow Removal in Central Connecticut',
  /** Sein Claim - woertlich uebernommen. */
  claim: 'One Company. All Seasons.',

  /** Domain des Betriebs (bei Wix registriert, zeigt per A/CNAME auf Vercel). Stand 26.09.2026. */
  url: 'https://ctmowandsnowllc.com',

  contact: {
    /** PLATZHALTER. Ein Telefonlink mit falscher Nummer ist schlimmer als keiner. */
    phone: '',
    phoneDisplay: '',
    email: '',
    /** Wo der Betrieb wirklich sitzt. Ohne diese Angabe kein Adress-Schema. */
    street: '',
    city: '',
    state: 'Connecticut',
    zip: '',
    country: 'US',
    /** Fuer LocalBusiness geo - nur setzen, wenn wirklich bekannt. */
    lat: null as number | null,
    lng: null as number | null,
  },

  /** Profile, die das Unternehmen wirklich hat. Leere Eintraege fliegen raus. */
  profiles: {
    googleBusiness: '',
    facebook: '',
    instagram: '',
  },

  hours: {
    /** Normale Erreichbarkeit im Gruen-Geschaeft. */
    regular: 'Mon-Sat, 7am-6pm',
    /** Im Winter richtet sich die Arbeit nach dem Wetter, nicht nach der Uhr. */
    stormNote: 'During a storm we run around the clock until every route is clear.',
  },

  /**
   * Schaltet den Entwurfs-Modus. true = Angaben oben sind teilweise Platzhalter.
   * Solange true:
   *   - kein LocalBusiness/PostalAddress im strukturierten Datensatz
   *   - sichtbares Entwurfsband am oberen Rand
   *   - noindex, damit ein Entwurf nicht in den Index rutscht
   *
   * Stand 22.09.2026: Name, Region, Orte und Leistungen sind echt und vom
   * Betrieb geliefert. Es fehlen noch Inhaber, Telefon, E-Mail, Adresse und
   * Domain - deshalb bleibt der Schalter vorerst an.
   */
  istEntwurf: true,
} as const;

/** Felder, die zwingend vom Kunden kommen muessen, bevor die Seite live geht. */
/**
 * Die Bezeichnungen stehen SICHTBAR auf der Seite (Entwurfsband), deshalb
 * englisch - auf dieser Website erscheint kein deutsches Wort.
 */
export const PFLICHTFELDER: { feld: string; wert: string }[] = [
  { feld: 'business name', wert: BUSINESS.name },
  { feld: 'owner', wert: BUSINESS.ownerName },
  { feld: 'domain', wert: BUSINESS.url },
  { feld: 'phone', wert: BUSINESS.contact.phone },
  { feld: 'email', wert: BUSINESS.contact.email },
  { feld: 'town', wert: BUSINESS.contact.city },
];

/** true, wenn die Angabe noch Platzhalter oder leer ist. */
export function istOffen(wert: string): boolean {
  if (!wert || !wert.trim()) return true;
  return /platzhalter|pending|example-/i.test(wert);
}

export const OFFENE_FELDER = PFLICHTFELDER.filter((f) => istOffen(f.wert));

/** Nur wahr, wenn eine vollstaendige Postanschrift vorliegt. */
export const HAT_ADRESSE =
  !!BUSINESS.contact.street && !!BUSINESS.contact.city
  && !!BUSINESS.contact.state && !!BUSINESS.contact.zip;
