const path = require('node:path');

/**
 * Betriebsarten:
 *
 *  1. Normal - so laeuft die Seite auf Vercel und lokal mit `npm run dev` /
 *     `npm start`: Next-Server mit API-Route fuers Kontaktformular, ohne
 *     Unterpfad. Dafuer ist hier nichts zu setzen.
 *
 *  2. Hinter einem Proxy unter einem Unterpfad (`NEXT_BASE_PATH=/ct`, siehe
 *     `npm run proxy` / `npm run proxy-build`): alle Links bekommen das
 *     Praefix. Nur fuer die Vorschau auf dem Entwicklungsserver.
 *
 *  3. Statischer Export (`VORSCHAU_BASIS=/pfad`): reines HTML ohne
 *     Serverfunktionen, fuer einen beliebigen Webserver. Dabei:
 *       - `output: 'export'`  -> reines HTML, keine Serverfunktionen
 *       - `basePath`          -> alle Links bekommen das Praefix
 *       - `images.unoptimized`-> ohne Server gibt es keine Bildoptimierung
 *     Das Formular schaltet ueber NEXT_PUBLIC_VORSCHAU in den Vorschaumodus,
 *     weil es ohne API-Route nichts senden kann.
 */
const basis = process.env.VORSCHAU_BASIS || '';

/** Unterpfad fuer den LAUFENDEN Server hinter einem Proxy (Betriebsart 2). */
const unterpfad = process.env.NEXT_BASE_PATH || '';

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.join(__dirname),
  ...(unterpfad && !basis ? { basePath: unterpfad } : {}),
  ...(basis
    ? {
        output: 'export',
        basePath: basis,
        // Ohne Schraegstrich am Ende erzeugt Next `x/y.html` statt
        // `x/y/index.html`. Das ist genau, was ein einfacher Webserver
        // braucht, der keine Verzeichnis-Indizes aufloest.
        trailingSlash: false,
        images: { unoptimized: true },
      }
    : {}),
};
