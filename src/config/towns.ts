/**
 * Das Einsatzgebiet - der eigentliche GEO-Hebel.
 *
 * Die Orte stammen woertlich vom Betrieb (22.09.2026):
 * "Serving Plainville, Farmington, Bristol, Southington, West Hartford,
 *  New Britain, Unionville, and surrounding areas."
 *
 * County und Nachbarschaften sind nachgeschlagen, nicht geraten:
 * alle sieben liegen in Hartford County, Connecticut. Plainville grenzt an
 * Bristol (West), Farmington (Nord), New Britain (Ost) und Southington (Sued).
 * West Hartford grenzt an Farmington. Unionville ist ein Village innerhalb
 * von Farmington (ZIP 06085, Farmington School District) - deshalb steht es
 * hier mit `partOf`, statt so zu tun, als waere es eine eigene Gemeinde.
 *
 * DREI REGELN, uebernommen aus dem Standort-Aufbau von ai-geotracking.com:
 *
 * 1. KEINE erfundene Ortsansaessigkeit. Der Betrieb hat EIN Zuhause. Es gibt
 *    kein LocalBusiness-Schema mit fremder Adresse je Ort - genau das ist der
 *    Fehler, der bei Google-Business-Spam abgestraft wird.
 *
 * 2. KEINE erfundenen Zahlen. Deshalb stehen hier KEINE Einwohnerzahlen und
 *    keine "seit X Jahren in Y"-Angaben.
 *
 * 3. Die Seiten unterscheiden sich durch ECHTE Felder, nicht durch eine
 *    Schablone mit ausgetauschtem Ortsnamen.
 *
 * VOM BETRIEB GEGENZULESEN: die `character`-Texte. Sie beschreiben, was an
 * einem Ort fuer die ARBEIT einen Unterschied macht (Grundstuecksgroesse,
 * Einfahrten, Platz fuer den Schnee). Das ist der Teil, den nur jemand
 * bestaetigen kann, der dort wirklich faehrt.
 */

export type Town = {
  slug: string;
  name: string;
  county: string;
  state: string;
  stateCode: string;
  /** 'core' = ausdruecklich genannt, 'extended' = "and surrounding areas". */
  zone: 'core' | 'extended';
  /** Gesetzt, wenn der Ort verwaltungstechnisch zu einer anderen Gemeinde gehoert. */
  partOf?: string;
  /** Was an diesem Ort fuer die Arbeit wirklich einen Unterschied macht. */
  character: string;
  /**
   * Arbeitsmerkmale des Ortes. Aus DIESEN Feldern werden die Leistungs-
   * Ort-Seiten gebaut - nicht aus einer Schablone mit ausgetauschtem
   * Ortsnamen. Erst dadurch unterscheidet sich "snow plowing in West
   * Hartford" inhaltlich von "snow plowing in Farmington", statt nur im
   * Ortsnamen. Ohne diesen Unterschied waeren 70 Kombiseiten Doorway-Pages,
   * und die sortieren Google wie auch die KI-Systeme aus.
   */
  merkmale: {
    /** Einfahrten: Laenge, Breite, Steigung. */
    driveways: string;
    /** Wohin der Schnee kann - der Engpass im Winter. */
    snowStorage: string;
    /** Grundstuecks- und Rasenflaeche. */
    lots: string;
    /** Baumbestand - entscheidet ueber den Laubaufwand. */
    trees: string;
    /** Zufahrt und Enge - entscheidet, was per Hand gemacht werden muss. */
    access: string;
  };
  /** Slugs der Nachbarorte - erzeugt echte interne Verlinkung. */
  neighbors: string[];
};

const COUNTY_CT = 'Hartford County';

export const TOWNS: Town[] = [
  {
    slug: 'plainville',
    name: 'Plainville',
    county: COUNTY_CT,
    state: 'Connecticut',
    stateCode: 'CT',
    zone: 'core',
    character:
      'A compact town with Bristol on one side and New Britain on the other, so most of the route runs '
      + 'through neighborhoods of modest lots and two-car driveways. Short runs mean a lot of properties '
      + 'in a small radius, which is exactly what makes same-day service possible after a storm.',
    merkmale: {
      driveways:
        'Mostly two-car driveways with a short run to the street. Few long approaches, which keeps a storm route moving.',
      snowStorage:
        'Usable side yards on most lots, so the snow has somewhere to go through a normal winter without hauling.',
      lots:
        'Modest yards — front, back and a strip along the foundation. A full cut is one visit, not half a day.',
      trees:
        'Street trees and a few mature yard trees. Fall cleanup is typically two passes, not four.',
      access:
        'Straightforward. Trucks reach almost every driveway, so hand work is limited to walks and steps.',
    },
    neighbors: ['bristol', 'farmington', 'new-britain', 'southington'],
  },
  {
    slug: 'farmington',
    name: 'Farmington',
    county: COUNTY_CT,
    state: 'Connecticut',
    stateCode: 'CT',
    zone: 'core',
    character:
      'Larger lots with more lawn per property and long approach driveways. In the green season that means '
      + 'mowing measured in acres rather than in front and back yard; in winter it means a driveway has to '
      + 'be plowed twice in a real storm or the end of it is gone by morning.',
    merkmale: {
      driveways:
        'Long approach driveways are common, some of them curved and uphill. These are the ones that need a second pass mid-storm.',
      snowStorage:
        'Plenty of room at the sides on most properties — the constraint here is distance, not space.',
      lots:
        'Large yards, often with open ground behind the house. Mowing time is measured in acres, not in front and back.',
      trees:
        'Heavy mature tree cover on many lots. Fall cleanups run in several passes into November.',
      access:
        'Good vehicle access, but the walk from a parked truck to a back bed can be long — that time is real and gets quoted.',
    },
    neighbors: ['unionville', 'plainville', 'west-hartford', 'new-britain', 'bristol'],
  },
  {
    slug: 'bristol',
    name: 'Bristol',
    county: COUNTY_CT,
    state: 'Connecticut',
    stateCode: 'CT',
    zone: 'core',
    character:
      'Hilly streets and older neighborhoods. Sloped driveways are the thing to watch here: shaded sections '
      + 'refreeze after every thaw, so treatment matters more than raw plowing.',
    merkmale: {
      driveways:
        'Sloped and hillside driveways are the norm. A slope that faces north stays icy long after the storm is over.',
      snowStorage:
        'Uphill sides fill fast and slide back down. Banks have to be pushed well off the edge early.',
      lots:
        'Mixed — older in-town lots next to larger properties further out. Terrain matters more than square footage.',
      trees:
        'Established neighborhoods with big old trees close to the houses. Leaves land in beds and gutter lines, not just on the lawn.',
      access:
        'Narrow older streets in places. Some driveways only take one pass in each direction.',
    },
    neighbors: ['plainville', 'southington', 'farmington'],
  },
  {
    slug: 'southington',
    name: 'Southington',
    county: COUNTY_CT,
    state: 'Connecticut',
    stateCode: 'CT',
    zone: 'core',
    character:
      'A large town by area, with subdivision streets running into properties that still have real open '
      + 'ground behind them. Mowing time varies more here than anywhere else on the route.',
    merkmale: {
      driveways:
        'Subdivision driveways with real open ground behind them. Length varies more here than anywhere else on the route.',
      snowStorage:
        'Rarely a problem — most properties have space at the edges.',
      lots:
        'The largest spread on the route. Some lots are suburban, others still have field behind the house.',
      trees:
        'Varies by street. Newer sections have young trees, older ones a full canopy.',
      access:
        'Wide streets, easy approach. Time goes into the property itself, not into getting to it.',
    },
    neighbors: ['plainville', 'bristol'],
  },
  {
    slug: 'west-hartford',
    name: 'West Hartford',
    county: COUNTY_CT,
    state: 'Connecticut',
    stateCode: 'CT',
    zone: 'core',
    character:
      'Dense, established neighborhoods with short driveways close to the street. Snow storage is the '
      + 'limiting factor: the banks have to be pushed back early in the season, not after the third storm, '
      + 'or there is simply nowhere left to put it.',
    merkmale: {
      driveways:
        'Short, close to the street, and often shared or side-by-side. A plow has to be placed precisely, not just driven through.',
      snowStorage:
        'The limiting factor on this part of the route. Banks have to be pushed back early in the season — after the third storm there is genuinely nowhere left.',
      lots:
        'Compact, established yards. Beds along the foundation do more work for the look than the lawn does.',
      trees:
        'Dense old street trees. Leaf volume per square foot is the highest on the route.',
      access:
        'Tight. Parked cars on the street change what is possible, and a lot of clearing is blower and shovel work.',
    },
    neighbors: ['farmington', 'new-britain'],
  },
  {
    slug: 'new-britain',
    name: 'New Britain',
    county: COUNTY_CT,
    state: 'Connecticut',
    stateCode: 'CT',
    zone: 'core',
    character:
      'City lots, multi-families and narrow side drives. A lot of the work here is walkways, steps and the '
      + 'paths between buildings - places a truck cannot reach at all, and the part most plow-only '
      + 'operators skip.',
    merkmale: {
      driveways:
        'City driveways, multi-family side drives and shared aprons. Several properties have no driveway at all, just a walk to the street.',
      snowStorage:
        'Very limited. On some lots the only honest answer is hauling it off rather than stacking it.',
      lots:
        'Small yards, often with more hard surface than grass. The work is trimming, beds and entries more than mowing.',
      trees:
        'Street trees along the sidewalk line — the leaves end up on walks and in the gutter, not on a lawn.',
      access:
        'The tightest on the route. Paths between buildings, back stairs and shared entries are all hand and blower work.',
    },
    neighbors: ['plainville', 'farmington', 'west-hartford'],
  },
  {
    slug: 'unionville',
    name: 'Unionville',
    county: COUNTY_CT,
    state: 'Connecticut',
    stateCode: 'CT',
    zone: 'core',
    partOf: 'Farmington',
    character:
      'A village inside Farmington with its own ZIP code and an older, tighter street pattern than the rest '
      + 'of the town. Mature trees mean fall cleanups here run in more than one pass, every year.',
    merkmale: {
      driveways:
        'Older, narrower driveways on a tighter street pattern than the rest of Farmington.',
      snowStorage:
        'Modest. Village lots have less edge than the larger properties elsewhere in town.',
      lots:
        'Smaller yards with established plantings. Beds carry more of the look than open lawn does.',
      trees:
        'Mature village canopy. Fall cleanups here run in more than one pass, every year.',
      access:
        'Village streets are narrow and the driveways come right off them — placement matters more than power.',
    },
    neighbors: ['farmington', 'plainville', 'bristol'],
  },
];

export const townBySlug = new Map(TOWNS.map((t) => [t.slug, t]));
export const CORE_TOWNS = TOWNS.filter((t) => t.zone === 'core');
export const EXTENDED_TOWNS = TOWNS.filter((t) => t.zone === 'extended');

/**
 * EINE Zahl fuer "wie viele Orte bedienen wir".
 * Vorher rechnete das jede Seite selbst: die Startseite nahm core+extended,
 * der Fusszeilentext CORE_TOWNS.length + "+" und die Kontaktseite schlicht
 * CORE_TOWNS.length. Drei Zahlen fuer dieselbe Aussage auf derselben Website -
 * genau die Sorte Widerspruch, die ein KI-System aufgreift und weitergibt.
 */
export const TOWN_COUNT = TOWNS.length;

/**
 * Der Betrieb schreibt "and surrounding areas". Das steht als Satz auf den
 * Seiten, aber NICHT als erfundene Ortsliste im Schema - wir wissen nicht,
 * welche Orte er damit meint, und raten waere hier eine Falschangabe.
 */
export const UMLAND_HINWEIS =
  'and surrounding areas in Central Connecticut';

/** Die Region, wie der Betrieb sie selbst nennt. */
export const REGION = 'Central Connecticut';
export const STATE = TOWNS[0].state;
export const STATE_CODE = TOWNS[0].stateCode;
export const COUNTY = TOWNS[0].county;

/**
 * Die County-Zwischenebene.
 *
 * hvnh-ai.com fuehrt zwischen Uebersicht und Stadt eine Bundeslandebene
 * (/standorte/land/[land]) - dadurch hat dort jede Ortsseite vier
 * Brotkrumen-Stufen statt drei. Hier ist Hartford County das Gegenstueck.
 * Es ist derzeit genau eine, und das ist in Ordnung: die Ebene existiert, weil
 * sie die Hierarchie vollstaendig macht und beim Wachsen des Gebiets sofort
 * traegt - nicht, um eine Seite mehr zu haben.
 */
export type County = { slug: string; name: string; state: string; stateCode: string };

export const COUNTIES: County[] = [
  { slug: 'hartford-county', name: COUNTY_CT, state: 'Connecticut', stateCode: 'CT' },
];

export const countyBySlug = new Map(COUNTIES.map((c) => [c.slug, c]));

/** Alle Orte eines Countys. */
export function townsInCounty(c: County): Town[] {
  return TOWNS.filter((t) => t.county === c.name);
}

/** Das County, in dem ein Ort liegt - fuer die Brotkrumen. */
export function countyOf(t: Town): County | undefined {
  return COUNTIES.find((c) => c.name === t.county);
}

export function neighborsOf(town: Town): Town[] {
  return town.neighbors.map((s) => townBySlug.get(s)).filter((t): t is Town => !!t);
}
