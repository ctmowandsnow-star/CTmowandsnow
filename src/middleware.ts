import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Optionale Passwortschranke fuer den Entwurf.
 *
 * Wirkt nur, wenn BEIDE Umgebungsvariablen gesetzt sind - bei Vercel unter
 * Settings -> Environment Variables, lokal in .env.local:
 *   VORSCHAU_BENUTZER, VORSCHAU_PASSWORT
 * Die Zugangsdaten stehen nie im Quelltext. Sobald die Seite live geht,
 * werden beide Variablen geloescht und die Schranke ist weg.
 */
const BENUTZER = process.env.VORSCHAU_BENUTZER || '';
const PASSWORT = process.env.VORSCHAU_PASSWORT || '';

export function middleware(req: NextRequest) {
  // Ohne gesetztes Passwort KEINE Schranke vortaeuschen: dann bleibt alles
  // offen und das muss auffallen, statt still zu schuetzen.
  if (!BENUTZER || !PASSWORT) return NextResponse.next();

  const kopf = req.headers.get('authorization') || '';
  if (kopf.startsWith('Basic ')) {
    try {
      const roh = atob(kopf.slice(6));
      const i = roh.indexOf(':');
      if (roh.slice(0, i) === BENUTZER && roh.slice(i + 1) === PASSWORT) {
        return NextResponse.next();
      }
    } catch { /* kaputter Kopf -> wie kein Kopf */ }
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="CT Mow&Snow preview", charset="UTF-8"' },
  });
}

export const config = {
  /**
   * Ausgenommen: Next-eigene Dateien UND die eigenen Medienordner.
   *
   * DER FEHLER, DEN DAS BEHEBT: Die Bildoptimierung von Next holt sich das
   * Original ueber eine HTTP-Anfrage an den eigenen Server (`/images/x.jpg`).
   * Diese interne Anfrage traegt keinen Authorization-Kopf, lief also gegen
   * die Schranke und bekam 401 - Next meldete daraufhin fuer JEDES Bild
   * "The requested resource isn't a valid image" (HTTP 400). Auf der Seite
   * waren damit alle Fotos weg.
   *
   * Gefunden hat das erst der Klickweg-Pruefstand, der jede Antwort >= 400
   * mitschreibt. Ein Abruf der HTML-Seiten allein meldete 200 und sah gesund
   * aus.
   *
   * Die Fotos sind damit ohne Passwort abrufbar, wenn jemand die genaue
   * Adresse kennt. Das ist vertretbar: es sind Arbeitsfotos, keine Daten.
   * Die Seiten selbst bleiben geschuetzt.
   */
  matcher: ['/((?!_next/static|_next/image|images/|video/|favicon.ico).*)'],
};
