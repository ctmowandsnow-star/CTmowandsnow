/**
 * Pfade zu eigenen Dateien (Bilder, Video).
 *
 * WARUM ES DIESE DATEI GIBT: In der statischen Vorschaufassung laeuft die
 * Website unter einem Unterpfad (`/ct-mow-snow`). `next/image` haengt den
 * basePath bei `unoptimized: true` NICHT an - und eine Nachbearbeitung des
 * HTML reicht nicht, weil die Pfade im Code zusammengesetzt werden
 * (`/images/${name}.jpg`). Im ausgelieferten JS steht dann
 * `"/images/"+name+".jpg"`, und daran scheitert jeder Textersatz.
 *
 * Gefunden wurde das NICHT durch die HTML-Pruefung, sondern erst, als ein
 * Browser die exportierte Seite geladen hat und 404 meldete. Eine statische
 * Pruefung sieht nur, was im HTML steht; was das JavaScript zur Laufzeit
 * zusammenbaut, sieht nur ein Browser.
 */
const BASIS = process.env.NEXT_PUBLIC_BASIS_PFAD || '';

/** Bild aus /public/images. `bild('mowing-after.jpg')` */
export function bild(datei: string): string {
  return `${BASIS}/images/${datei}`;
}

/** Datei aus /public/video. */
export function video(datei: string): string {
  return `${BASIS}/video/${datei}`;
}
