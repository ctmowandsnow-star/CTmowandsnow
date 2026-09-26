/**
 * Die Leistungen - abgebildet nach der Liste, die der Betrieb selbst geliefert
 * hat (22.09.2026), nicht aus einem Branchenkatalog abgeschrieben.
 *
 * Seine 13 Punkte sind zu 10 Seiten gebuendelt, weil einige zusammengehoeren
 * ("weekly and biweekly lawn mowing" + "lawn edging and trimming" ist EIN
 * Besuch, "residential snow plowing" + "driveway clearing" ist EINE Fahrt).
 * Nichts wurde weggelassen, und nichts ist dazuerfunden.
 *
 * BEWUSST ENTFERNT: eine Seite "Stone & Gravel Beds", die ich vorher aus den
 * Fotos abgeleitet hatte. Die Kiesbeete sind auf seinen Bildern klar zu sehen,
 * aber er fuehrt sie nicht als Leistung - also sind sie Teil der Beet-Arbeit
 * und stehen in der Galerie, nicht als eigenes Angebot. Seine Liste schlaegt
 * meine Auslegung seiner Fotos.
 *
 * `answer` ist der wichtigste Text der Datei: ein direkt zitierbarer Satz.
 * Genau solche Saetze uebernehmen ChatGPT & Co. in ihre Antworten. Er steht
 * sichtbar auf der Seite UND maschinenlesbar im FAQ-Schema - eine Quelle,
 * damit beide nie auseinanderlaufen.
 */

export type Season = 'green' | 'snow';

export type Service = {
  slug: string;
  name: string;
  /**
   * Kurzform fuer den Fliesstext ("... serves Plainville year-round: mowing,
   * mulch and bed cleanup, ..."). Steht hier ausdruecklich, statt aus `name`
   * gerechnet zu werden: ein erster Versuch schnitt am "&" ab und machte aus
   * "Spring & Fall Cleanups" das Wort "spring" und aus "Walkway & Entrance
   * Clearing" das Wort "walkway". Wie man einen Namen kuerzt, kann man nicht
   * raten - man muss es sagen.
   */
  shortName: string;
  season: Season;
  /** Ein Satz fuer Kacheln und Navigation. */
  summary: string;
  /** Direkt zitierbare Antwort auf "Was ist das und fuer wen?". */
  answer: string;
  /** Was konkret gemacht wird. Keine Werbebegriffe, nur Taetigkeiten. */
  includes: string[];
  /**
   * Welche Ortsmerkmale fuer diese Leistung den Unterschied machen.
   * Daraus baut die Leistung-Ort-Seite ihren ortsspezifischen Teil: fuers
   * Pfluegen zaehlen Einfahrten und Schneelager, fuer Laubarbeit der
   * Baumbestand. Ohne diese Zuordnung waeren die 70 Kombiseiten eine
   * Schablone mit ausgetauschtem Ortsnamen - also Doorway-Pages.
   */
  relevant: ('driveways' | 'snowStorage' | 'lots' | 'trees' | 'access')[];
  /** Hauptbild (Dateiname ohne Endung in /public/images). */
  image: string;
  imageAlt: string;
  faq: { q: string; a: string }[];
};

export const SERVICES: Service[] = [
  {
    slug: 'lawn-mowing',
    name: 'Lawn Mowing, Edging & Trimming',
    shortName: 'mowing',
    season: 'green',
    summary: 'Weekly or biweekly, cut and trimmed and blown clean.',
    answer:
      'We mow residential properties on a set weekly or biweekly schedule from spring '
      + 'through fall. Every visit includes the cut, edging along walks and drives, string trimming around '
      + 'beds and foundations, and blowing the clippings off the hard surfaces before we leave. You get the '
      + 'same day of the week each week, so you always know when we are coming.',
    includes: [
      'Weekly or biweekly cutting on a fixed day',
      'Edging along walkways, curbs and driveways',
      'String trimming around beds, fences and foundations',
      'Clippings blown off all hard surfaces before we leave',
      'Cutting height adjusted through the season so the lawn is not scalped in July',
    ],
    relevant: ['lots', 'access'],
    image: 'mowing-after',
    imageAlt: 'Large back lawn freshly cut with clean, straight mowing stripes',
    faq: [
      {
        q: 'Should I go weekly or biweekly?',
        a: 'Weekly through the main growing season keeps the lawn even and means we never take off more than '
          + 'a third of the blade at once. Biweekly works for slower-growing lawns and in the midsummer heat. '
          + 'We will tell you which one your lawn actually needs instead of billing you for a cut it did not.',
      },
      {
        q: 'Do you take the clippings away?',
        a: 'We mulch them back into the lawn by default, which puts nitrogen back in the soil. If the grass '
          + 'got long or wet and the clippings would smother the turf, we bag and remove them.',
      },
    ],
  },
  {
    slug: 'mulch-installation',
    name: 'Mulch Installation & Garden Bed Cleanup',
    shortName: 'mulch installation',
    season: 'green',
    summary: 'Beds cleaned out, edged and topped with fresh mulch.',
    answer:
      'We clean out the beds, pull the weeds, cut a clean spade edge and lay fresh mulch to an even depth. '
      + 'The edge is what makes the difference - it is a cut trench, not a plastic strip, so the mulch stays '
      + 'in the bed and the grass stays out of it for the whole season.',
    includes: [
      'Beds cleaned out and weeded before anything goes down',
      'Hand-cut spade edge around every bed',
      'Fresh mulch at even depth, hand-raked around plantings',
      'Mulch pulled back off stems and trunks so nothing rots',
      'Walkways and driveway blown clean afterwards',
    ],
    relevant: ['lots', 'access'],
    image: 'mulch-deck-after',
    imageAlt: 'Foundation bed with fresh dark mulch and a sharply cut edge against green lawn',
    faq: [
      {
        q: 'How often does mulch need to be replaced?',
        a: 'Once a year in spring for most properties. Mulch breaking down into the soil is what you want - '
          + 'it just means the color and the depth need refreshing each season.',
      },
      {
        q: 'Do you use plastic or metal edging strips?',
        a: 'No. We cut the edge by hand with a spade. Strips heave out of the ground after a few Connecticut '
          + 'frost cycles, and then you are looking at a crooked strip instead of a clean line.',
      },
    ],
  },
  {
    slug: 'spring-and-fall-cleanups',
    name: 'Spring & Fall Cleanups',
    shortName: 'seasonal cleanups',
    season: 'green',
    summary: 'Leaves, winter debris and dead growth off the property.',
    answer:
      'A seasonal cleanup is a full pass over the property: leaves off the lawn and out of the beds, sticks '
      + 'and winter debris removed, perennials cut back, and everything hauled away. In fall we come back as '
      + 'often as the leaves require, because one pass in October is never the whole story in Connecticut.',
    includes: [
      'Leaves cleared from lawn, beds and around the foundation',
      'Sticks and winter debris removed',
      'Perennials and ornamental grasses cut back',
      'Walkways, drives and entry areas blown out',
      'All material hauled off the property',
    ],
    relevant: ['trees', 'lots'],
    image: 'property-full-after',
    imageAlt: 'Single-family home with cleared lawn, fresh beds and clean walkways after a full cleanup',
    faq: [
      {
        q: 'When should the fall cleanup be done?',
        a: 'The last one goes in after the trees are bare - usually late October into November here. Leaves '
          + 'left on the lawn over winter mat down under the snow and kill the grass underneath.',
      },
      {
        q: 'Do I need a spring cleanup if you did one in the fall?',
        a: 'Usually yes, but a smaller one. Winter puts down road sand and grit, breaks branches, and blows '
          + 'in the leaves that came down after the last fall visit. The spring pass is what gets the lawn '
          + 'ready to grow.',
      },
    ],
  },
  {
    slug: 'bush-trimming-and-removal',
    name: 'Bush Trimming & Removal',
    shortName: 'bush trimming',
    season: 'green',
    summary: 'Shaped by hand — or taken out entirely, roots included.',
    answer:
      'We trim foundation bushes, hedges and ornamentals to shape and haul the clippings away. When a shrub '
      + 'is too far gone, too big for the spot or simply in the way, we take it out completely rather than '
      + 'cutting it back one more time and leaving you the same problem next year.',
    includes: [
      'Shaping cut on foundation bushes and hedges',
      'Dead and crossing wood taken out',
      'Growth pulled back off siding, windows and walkways',
      'Full removal including the root ball where a shrub has to go',
      'All clippings and debris collected and hauled off',
    ],
    relevant: ['lots', 'trees'],
    image: 'lawn-front-manicured',
    imageAlt: 'Front of a house with shaped foundation bushes, paver walkway and cut lawn',
    faq: [
      {
        q: 'When is the best time to trim?',
        a: 'For most evergreens, late spring after the new growth hardens off. For anything that flowers, '
          + 'right after it finishes blooming - cutting later removes the buds for next year.',
      },
      {
        q: 'Can you take out a shrub without wrecking the bed around it?',
        a: 'Yes. Removal means the stump and root ball come out, the hole gets backfilled and the bed gets '
          + 'raked back level, so the spot is ready to plant or mulch rather than left as a crater.',
      },
    ],
  },
  {
    slug: 'property-cleanups',
    name: 'Property Cleanups',
    shortName: 'property cleanups',
    season: 'green',
    summary: 'One-time cleanup for a property that got away from you.',
    answer:
      'A one-time cleanup for a property that has been let go - after a vacancy, a move, an estate, or just '
      + 'a season nobody got to. Overgrown lawn cut back in stages, beds cleared, brush and debris hauled '
      + 'off. No contract attached: it is a single job, and afterwards you decide whether you want regular '
      + 'maintenance or not.',
    includes: [
      'Overgrown lawn cut down in stages, not scalped in one pass',
      'Beds cleared of weeds and volunteer growth',
      'Brush, branches and yard debris removed',
      'Walks, drives and entries cleared and blown out',
      'Everything hauled away - nothing left in a pile for you',
    ],
    relevant: ['lots', 'access'],
    image: 'mowing-before',
    imageAlt: 'Large lot with knee-high overgrown grass before a cleanup',
    faq: [
      {
        q: 'My lawn is knee-high. Can it be saved?',
        a: 'Usually, yes. It comes down in stages over more than one pass - cutting grass that long straight '
          + 'to height tears the turf and leaves windrows that smother whatever is left underneath.',
      },
      {
        q: 'Do I have to sign up for regular service afterwards?',
        a: 'No. A cleanup is a one-time job. Plenty of people book one and handle it themselves from there.',
      },
    ],
  },
  {
    slug: 'snow-plowing',
    name: 'Residential Snow Plowing',
    shortName: 'driveway plowing',
    season: 'snow',
    summary: 'Driveways plowed during the storm, and again once it stops.',
    answer:
      'We plow residential driveways across Central Connecticut. On a normal storm you get cleared during '
      + 'the storm so you can get out, and again after it ends so the driveway is actually finished. We push '
      + 'the snow to the sides you tell us to use, and we keep the banks back from the end of the driveway '
      + 'so you can still see the road when you pull out.',
    includes: [
      'Cleared during the storm and again after it ends',
      'Snow pushed to agreed sides, not piled against the garage',
      'Banks kept back from the driveway end for sight lines',
      'Mailbox and trash-barrel area kept accessible',
      'Driveway markers set before the first storm',
    ],
    relevant: ['driveways', 'snowStorage'],
    image: 'snow-driveway-cleared-day',
    imageAlt: 'Asphalt driveway plowed down to bare pavement with clean snow banks on both sides',
    faq: [
      {
        q: 'At how much snow do you show up?',
        a: 'Standard trigger is two inches. Below that a plow blade does more harm to the surface than good, '
          + 'and we treat instead. If you want a lower trigger we can set that on your account.',
      },
      {
        q: 'Do I have to call you when it snows?',
        a: 'Not if you are on the seasonal route - we come automatically. Calling during a storm just puts '
          + 'you behind the route, which is why the seasonal arrangement is the better deal.',
      },
      {
        q: 'What time will you get to me?',
        a: 'Order on the route is driven by the storm, not by who calls first. What we commit to is that you '
          + 'are cleared during the storm and finished after it ends - not a clock time nobody who plows '
          + 'honestly can promise.',
      },
    ],
  },
  {
    slug: 'walkway-clearing',
    name: 'Walkway & Entrance Clearing',
    shortName: 'walkway clearing',
    season: 'snow',
    summary: 'The places a plow cannot reach, done by hand or blower.',
    answer:
      'Front walks, steps, entrances, side paths between houses and anything a truck cannot fit into get '
      + 'cleared by snow blower or by hand. This is the part most plow-only operators skip, and it is the '
      + 'part that decides whether you can actually get from your door to your car.',
    includes: [
      'Front walk, steps and entrance cleared to the door',
      'Side and back paths between buildings',
      'Path to the mailbox and trash barrels',
      'Area around the parked car cleared, not just plowed past',
      'Treated afterwards where there is ice underneath',
    ],
    relevant: ['access', 'driveways'],
    image: 'snow-narrow-path-day',
    imageAlt: 'Narrow path between two houses cleared down to pavement with snow banked on both sides',
    faq: [
      {
        q: 'Is walkway clearing included with plowing?',
        a: 'It is a separate line because it is separate work - hand and blower time, not truck time. Most '
          + 'customers take both; some only want the driveway.',
      },
      {
        q: 'Do you do multi-family entrances?',
        a: 'Yes. Shared entries, common walks and the paths between buildings are a regular part of the '
          + 'route, particularly in the denser New Britain and West Hartford neighborhoods.',
      },
    ],
  },
  {
    slug: 'snow-removal',
    name: 'Snow Removal',
    shortName: 'snow removal',
    season: 'snow',
    summary: 'When there is nowhere left on the property to push it.',
    answer:
      'After a heavy winter the banks get so high that a plow has nowhere left to put the next storm. Snow '
      + 'removal means physically relieving the property: cutting the banks back, opening up sight lines at '
      + 'the end of the driveway, clearing around vehicles, and hauling snow off the lot where there is '
      + 'genuinely no room left.',
    includes: [
      'Banks cut back and pushed further out',
      'Sight lines reopened at the end of the driveway',
      'Snow cleared from around parked vehicles',
      'Roof-drop and shoveled piles relocated off walkways',
      'Hauling off the property where nothing more can be stacked',
    ],
    relevant: ['snowStorage', 'access'],
    image: 'snow-deep-cleared-day',
    imageAlt: 'Driveway and walkway cut clean through deep snow with squared-off banks',
    faq: [
      {
        q: 'How is this different from plowing?',
        a: 'Plowing pushes the snow to the side. Removal deals with the snow that is already there and has '
          + 'nowhere to go - usually after two or three storms without a thaw in between.',
      },
    ],
  },
  {
    slug: 'salting-and-ice-control',
    name: 'Salting & Ice Control',
    shortName: 'ice control',
    season: 'snow',
    summary: 'Treating before it bonds, and again after the plow.',
    answer:
      'We treat driveways, walkways and steps with salt or a sand mix. The timing is what matters: material '
      + 'put down before a storm keeps the snow from bonding to the pavement, which is why some driveways '
      + 'plow down to bare asphalt and others stay locked under a sheet of ice.',
    includes: [
      'Pre-treatment ahead of a forecast storm',
      'Treatment after plowing where refreeze is likely',
      'Sand mix on the steep and shaded sections where salt alone will not hold',
      'Reduced application near beds and plantings',
      'Steps and entrances treated, not just the driveway',
    ],
    relevant: ['driveways', 'snowStorage'],
    image: 'snow-driveway-night-brick',
    imageAlt: 'Treated driveway at night in front of a brick home, surface cleared and gritted',
    faq: [
      {
        q: 'Will salt damage my lawn or plantings?',
        a: 'Heavy salt right along a bed edge will burn the plants. We cut back the application near beds '
          + 'and use a sand mix in those sections instead of loading up the same material everywhere.',
      },
      {
        q: 'Why does my driveway ice up when my neighbor’s does not?',
        a: 'Usually slope and shade. A driveway that never gets sun holds a film of water that refreezes '
          + 'every night. Those get treated on a different schedule than an open, south-facing drive.',
      },
    ],
  },
  {
    slug: 'seasonal-snow-service',
    name: 'Seasonal Snow Service',
    shortName: 'seasonal snow service',
    season: 'snow',
    summary: 'One arrangement for the whole winter — no calling, no per-storm haggling.',
    answer:
      'A seasonal arrangement puts your property on the route for the entire winter. Every qualifying storm '
      + 'is handled automatically: you do not call, you do not negotiate a price at 5am, and you do not end '
      + 'up behind everyone who called before you. It is also the only way we can promise to come back the '
      + 'same day when a storm turns.',
    includes: [
      'On the route for the whole winter, every qualifying storm',
      'No call needed - we come automatically',
      'Driveway markers set before the first storm',
      'Your snow-storage preferences noted once and kept on file',
      'Walkway clearing and treatment can be added to the same arrangement',
    ],
    relevant: ['driveways', 'snowStorage'],
    image: 'snow-plow-truck-view',
    imageAlt: 'View over a plow blade clearing a long driveway toward a colonial home',
    faq: [
      {
        q: 'What if it barely snows all winter?',
        a: 'That is the trade in a seasonal arrangement, and it runs both ways - in a heavy winter you are '
          + 'covered for every storm at the same price. If you would rather pay per storm, say so and we '
          + 'will quote it that way.',
      },
      {
        q: 'When do I need to sign up?',
        a: 'Before the first storm, because that is when the driveway markers go in and your property gets '
          + 'placed in the route. Signing up mid-winter is possible but depends on how full the route is.',
      },
    ],
  },
];

export const GREEN_SERVICES = SERVICES.filter((s) => s.season === 'green');
export const SNOW_SERVICES = SERVICES.filter((s) => s.season === 'snow');
export const serviceBySlug = new Map(SERVICES.map((s) => [s.slug, s]));
