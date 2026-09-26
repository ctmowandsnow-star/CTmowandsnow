import type { MetadataRoute } from 'next';
import { BUSINESS } from '@/config/business';

/**
 * KI-Crawler ausdruecklich erlauben.
 *
 * Das ist der billigste und am haeufigsten uebersehene GEO-Hebel: viele
 * Firmenseiten sperren GPTBot & Co. aus - teils aus einer Vorlage, teils weil
 * ein Plugin es so gesetzt hat - und wundern sich dann, dass ChatGPT sie nie
 * nennt. Wer in KI-Antworten vorkommen will, muss zuerst gelesen werden duerfen.
 *
 * Solange die Seite ein Entwurf ist, wird ALLES gesperrt: ein halbfertiger
 * Eintrag mit Platzhalter-Firmennamen ist spaeter schwer loszuwerden.
 */
/** Beide Dateien sind reiner Inhalt - fuer den statischen Export
 *  muss das ausdruecklich dastehen, im Serverbetrieb aendert es nichts. */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  if (BUSINESS.istEntwurf) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      // Namentlich, damit es auch dann gilt, wenn jemand spaeter ein
      // restriktives Standardregelwerk darueberlegt.
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
    ],
    sitemap: `${BUSINESS.url}/sitemap.xml`,
    host: BUSINESS.url,
  };
}
