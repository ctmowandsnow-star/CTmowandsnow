/**
 * Die dritte Ebene neben Leistungen und Orten - das Gegenstueck zu
 * /branchen/[slug] auf hvnh-ai.com, wo jede Ortsseite einen Block
 * "Loesungen fuer Ihre Branche in {Stadt}" traegt.
 *
 * Eine Branchen-Einteilung passt hier nicht: der Betrieb arbeitet fuer
 * Privatleute, nicht fuer Branchen. Was er stattdessen SELBST unterscheidet,
 * steht woertlich in seiner Anforderungsliste:
 *
 *   "Whether you need regular lawn maintenance, a one-time cleanup, or snow
 *    removal after a winter storm, CT Mow&Snow is ready to help."
 *
 * Das sind drei Auftragsarten, und sie entsprechen drei voellig
 * verschiedenen Suchanfragen ("lawn care service plainville ct" /
 * "yard cleanup near me" / "emergency snow removal"). Genau deshalb ist es
 * die richtige dritte Ebene - und sie ist vollstaendig belegt, statt eine
 * Kundensegmentierung zu erfinden.
 *
 * NICHT aufgenommen: Gewerbe/"small commercial". Das stand in einem frueheren
 * Entwurf von mir, kommt in seiner Liste aber nirgends vor. Solange er es
 * nicht bestaetigt, behauptet die Website es auch nicht.
 */

export type Arbeitsweise = {
  slug: string;
  name: string;
  /** Kurz fuer Kacheln. */
  summary: string;
  /** Direkt zitierbare Antwort. */
  answer: string;
  /** Wofuer das die richtige Wahl ist. */
  passt: string[];
  /** Wofuer eben NICHT - Ehrlichkeit verkauft hier besser als Vollmundigkeit. */
  passtNicht: string;
  image: string;
  imageAlt: string;
  faq: { q: string; a: string }[];
};

export const ARBEITSWEISEN: Arbeitsweise[] = [
  {
    slug: 'regular-maintenance',
    name: 'Regular Maintenance',
    summary: 'A fixed day every week or two, all season, without calling.',
    answer:
      'Regular maintenance means your property is on the schedule for the whole season. You get the same '
      + 'day of the week, the crew knows the property, and nobody has to call anybody. Most people who try '
      + 'it once stay on it, because the work that keeps a property looking after itself is the work that '
      + 'happens before anything gets out of hand.',
    passt: [
      'You want the lawn to look the same in August as it did in May',
      'You would rather not think about it every two weeks',
      'The property has beds, edges and shrubs that need keeping, not rescuing',
      'You want the same people on the property all year, into the winter',
    ],
    passtNicht:
      'If you cut your own grass and only want help twice a year, a one-time cleanup is the cheaper and more '
      + 'honest answer. We will say so.',
    image: 'mowing-after',
    imageAlt: 'Back lawn cut on schedule with clean stripes',
    faq: [
      {
        q: 'Am I locked into a contract?',
        a: 'It is a seasonal arrangement, not a multi-year contract. You know the day, the scope and the '
          + 'price before it starts, and it ends with the season.',
      },
      {
        q: 'What if I only want mowing, not the beds?',
        a: 'That works. Plenty of properties are mowing-only. The beds, mulch and trimming are separate '
          + 'lines you can add or leave out.',
      },
    ],
  },
  {
    slug: 'one-time-cleanup',
    name: 'One-Time Cleanup',
    summary: 'A single visit for a property that got away from you.',
    answer:
      'A one-time cleanup is exactly that: one visit, one price, no contract attached. It is for a property '
      + 'that has been let go — after a vacancy, a move, an estate, a season nobody got to, or simply before '
      + 'putting a house on the market. Afterwards you decide whether you want regular service or whether '
      + 'you take it from there yourself.',
    passt: [
      'The lawn is knee-high and you need it back to a normal starting point',
      'You are selling, renting out or handing over a property',
      'A spring or fall cleanup, without signing up for the season',
      'Beds that have not been touched in a year or two',
    ],
    passtNicht:
      'If the property needs this twice a year every year, regular maintenance costs less over a season than '
      + 'two rescues do.',
    image: 'mowing-before',
    imageAlt: 'Overgrown lot with knee-high grass before a one-time cleanup',
    faq: [
      {
        q: 'How long does a cleanup take?',
        a: 'Depends entirely on the property. Grass that long comes down in stages over more than one pass, '
          + 'because cutting it straight to height tears the turf. We tell you what it takes after seeing it.',
      },
      {
        q: 'Do I have to sign up for anything afterwards?',
        a: 'No. It is a single job and it ends when the truck leaves.',
      },
    ],
  },
  {
    slug: 'storm-service',
    name: 'Snow After a Storm',
    summary: 'Cleared when it snows — on the route, or as a one-off.',
    answer:
      'Two ways to get plowed. On the seasonal route you are cleared automatically at every qualifying storm: '
      + 'no call, no negotiating a price at 5am, and you are not behind everyone who called first. Or as a '
      + 'one-off after a storm, which we take when the route allows it — that is the honest answer, because '
      + 'during a heavy storm the route comes first.',
    passt: [
      'You want the driveway open without making a call every time',
      'Somebody in the house needs to get out early, storm or not',
      'You are away for stretches of the winter',
      'The walkway and steps matter as much as the driveway',
    ],
    passtNicht:
      'If you only want a call-out in a once-a-winter emergency, say so up front — we will be straight about '
      + 'whether we can get to you, instead of promising and arriving on day three.',
    image: 'snow-plow-truck-view',
    imageAlt: 'View over the plow blade clearing a driveway during a storm',
    faq: [
      {
        q: 'Is the seasonal route really better than calling?',
        a: 'Yes, and not only for us. Route order is driven by the storm, not by who called first — so a '
          + 'call during a storm puts you behind the route rather than at the front of it.',
      },
      {
        q: 'Can I add walkways later?',
        a: 'Yes. Walkways, entrances and treatment are separate lines and can be added to an existing '
          + 'seasonal arrangement.',
      },
    ],
  },
];

export const arbeitsweiseBySlug = new Map(ARBEITSWEISEN.map((a) => [a.slug, a]));
