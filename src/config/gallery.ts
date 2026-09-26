/**
 * Die Bilder. Alle 33 stammen vom Betrieb selbst - kein Stockfoto auf der
 * ganzen Seite. Das ist kein Prinzipienreiterei: ein Landschaftsbetrieb, der
 * mit Stockfotos wirbt, sieht aus wie jeder andere, und genau daran scheitert
 * der Vergleich beim Kunden.
 *
 * Die Vorher/Nachher-Paare habe ich durch Bildvergleich bestimmt - gleiche
 * Hausfassade, gleicher Bordstein, gleiches Aussengeraet. Jedes Paar unten ist
 * belegt, nicht geraten. Wo der Aufnahmewinkel abweicht, stehen die Bilder
 * NEBENEINANDER statt uebereinander: ein Wischregler ueber zwei verschiedenen
 * Blickwinkeln behauptet eine Deckungsgleichheit, die es nicht gibt.
 */

export type Pair = {
  id: string;
  title: string;
  before: string;
  beforeAlt: string;
  after: string;
  afterAlt: string;
  note: string;
  season: 'green' | 'snow';
};

export const PAIRS: Pair[] = [
  {
    id: 'overgrown-lot',
    title: 'Overgrown lot to cut lawn',
    before: 'mowing-before',
    beforeAlt: 'Large back lot with knee-high grass gone to seed before cutting',
    after: 'mowing-after-wide',
    afterAlt: 'The same lot after cutting, with even stripes running the length of the property',
    note: 'Same property, same shed and tree line. Grass this long comes off in more than one pass - '
      + 'cutting it down to height in a single cut tears the turf and leaves windrows that smother what is left.',
    season: 'green',
  },
  {
    id: 'foundation-mulch',
    title: 'Tired bed to fresh mulch',
    before: 'mulch-deck-before',
    beforeAlt: 'Foundation bed beside a deck with thin, faded mulch and grass creeping over the edge',
    after: 'mulch-deck-after',
    afterAlt: 'The same bed with a cut edge, fresh dark mulch and plants set clear of the siding',
    note: 'The visible change is the mulch. The change that lasts is the cut edge - that line is what keeps '
      + 'the lawn out of the bed until fall.',
    season: 'green',
  },
  {
    id: 'side-foundation',
    title: 'Bare strip to planted bed',
    before: 'foundation-bed-before',
    beforeAlt: 'Narrow strip along the side of a house with patchy soil and scattered plantings',
    after: 'foundation-bed-after',
    afterAlt: 'The same strip widened into a shaped bed with fresh mulch and plants spaced out',
    note: 'Same house, same air-conditioning unit at the right. The bed was widened and given a curve so a '
      + 'mower can actually follow it.',
    season: 'green',
  },
  {
    id: 'front-entry',
    title: 'Winter-worn entry to finished front',
    before: 'bed-entry-before',
    beforeAlt: 'Front entry bed at the end of winter with bare stems and washed-out stone',
    after: 'bed-entry-after',
    afterAlt: 'The same entry with clean gravel, granite edge and shrubs shaped back',
    note: 'Same bay window and granite cobble edge. Stone beds do not renew themselves - they need the debris '
      + 'blown out and the stone raked back to depth.',
    season: 'green',
  },
  {
    id: 'garage-approach',
    title: 'Garage approach, off-season to summer',
    before: 'entry-walk-before',
    beforeAlt: 'Paver entry court beside a garage with dormant plantings and winter debris in the bed',
    after: 'entry-walk-after',
    afterAlt: 'The same entry court with the bed shaped, plantings full and the paving swept clean',
    note: 'Same doors, same cobble edge. The paving is part of the job - a finished bed next to a dirty '
      + 'apron still reads as unkempt.',
    season: 'green',
  },
];

/** Reine Schaubilder ohne Partner - nach Thema geordnet. */
export const SHOWCASE: { image: string; alt: string; season: 'green' | 'snow'; caption: string }[] = [
  { image: 'property-full-after', season: 'green', alt: 'Single-family home with cut lawn, fresh beds and clean walkway', caption: 'Full property, end of a maintenance visit' },
  { image: 'lawn-front-manicured', season: 'green', alt: 'Front yard with shaped shrubs, paver walkway and cut lawn', caption: 'Front bed and lawn, shaped and cut' },
  { image: 'mowing-after', season: 'green', alt: 'Back lawn cut with clean stripes under a blue sky', caption: 'Stripes come from the cut, not from a filter' },
  { image: 'bed-townhouse', season: 'green', alt: 'Townhouse entry with a shaped shrub, mulched bed and swept driveway', caption: 'Townhouse entry, shaped and edged' },
  { image: 'lawn-side-yard', season: 'green', alt: 'Side yard with cut lawn running up to a deck and foundation beds', caption: 'Side yard kept up with the rest' },
  { image: 'entry-walk-after', season: 'green', alt: 'Paver entry court with shaped plantings and gravel bed', caption: 'Entry court and bed' },

  { image: 'snow-plow-truck-view', season: 'snow', alt: 'View over a plow blade clearing a long driveway toward a colonial home', caption: 'Mid-storm, first pass' },
  { image: 'snow-deep-cleared-day', season: 'snow', alt: 'Driveway and walkway cut clean through deep snow with squared banks', caption: 'After a big one. Banks squared off, walkway cut through' },
  { image: 'snow-driveway-night-estate', season: 'snow', alt: 'Long driveway cleared at night with house lights in the background', caption: 'Storms do not wait for daylight' },
  { image: 'snow-narrow-path-day', season: 'snow', alt: 'Narrow path between two houses cleared down to pavement', caption: 'Where a truck does not fit' },
  { image: 'snow-driveway-cleared-day', season: 'snow', alt: 'Driveway plowed down to bare asphalt with snow banked at the sides', caption: 'Down to pavement, not just passable' },
  { image: 'snow-walkway-night', season: 'snow', alt: 'Walkway and driveway cleared at night between high snow banks', caption: 'Walkway cut before the banks freeze solid' },
  { image: 'snow-driveway-dusk', season: 'snow', alt: 'Cleared driveway at dusk leading to a garage with snow-loaded trees behind', caption: 'Cleared and treated at first light' },
  { image: 'snow-driveway-walkway-night', season: 'snow', alt: 'Driveway and front walk both cleared at night', caption: 'Driveway and walk, same visit' },
  { image: 'snow-driveway-night-neighborhood', season: 'snow', alt: 'Cleared driveway at night in a residential neighborhood', caption: 'Route work, house by house' },
  { image: 'snow-street-night', season: 'snow', alt: 'Cleared driveway and street at night between snow-covered yards', caption: 'Keeping the apron open to the street' },
  { image: 'snow-driveway-day-cape', season: 'snow', alt: 'Cape-style home with a long plowed driveway and cleared turnaround', caption: 'Turnaround cleared, not just the run' },
  { image: 'snow-plow-truck-view2', season: 'snow', alt: 'View from the truck cab over the plow toward a snow-covered house', caption: 'Second pass, after the storm let up' },
];

export const GREEN_SHOWCASE = SHOWCASE.filter((s) => s.season === 'green');
export const SNOW_SHOWCASE = SHOWCASE.filter((s) => s.season === 'snow');
export const pairById = new Map(PAIRS.map((p) => [p.id, p]));
