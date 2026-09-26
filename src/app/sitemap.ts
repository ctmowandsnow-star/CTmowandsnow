import type { MetadataRoute } from 'next';
import { BUSINESS } from '@/config/business';
import { SERVICES } from '@/config/services';
import { TOWNS, COUNTIES } from '@/config/towns';
import { ARBEITSWEISEN } from '@/config/arbeitsweisen';

/** Beide Dateien sind reiner Inhalt - fuer den statischen Export
 *  muss das ausdruecklich dastehen, im Serverbetrieb aendert es nichts. */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const jetzt = new Date();
  const feste = ['', '/services', '/how-we-work', '/service-areas', '/gallery', '/about', '/contact'];
  return [
    ...feste.map((p) => ({
      url: `${BUSINESS.url}${p}`,
      lastModified: jetzt,
      changeFrequency: 'monthly' as const,
      priority: p === '' ? 1 : 0.8,
    })),
    ...SERVICES.map((s) => ({
      url: `${BUSINESS.url}/services/${s.slug}`,
      lastModified: jetzt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...TOWNS.map((t) => ({
      url: `${BUSINESS.url}/service-areas/${t.slug}`,
      lastModified: jetzt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...ARBEITSWEISEN.map((a) => ({
      url: `${BUSINESS.url}/how-we-work/${a.slug}`,
      lastModified: jetzt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...COUNTIES.map((c) => ({
      url: `${BUSINESS.url}/service-areas/county/${c.slug}`,
      lastModified: jetzt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    // Leistung x Ort. Diese Seiten tragen den Long-Tail ("snow plowing
    // plainville ct") und stehen deshalb ausdruecklich in der Sitemap -
    // aber mit niedrigerer Prioritaet als die Leistungs- und Ortsseiten,
    // weil sie der speziellste und nicht der wichtigste Einstieg sind.
    ...SERVICES.flatMap((s) => TOWNS.map((t) => ({
      url: `${BUSINESS.url}/services/${s.slug}/${t.slug}`,
      lastModified: jetzt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))),
  ];
}
