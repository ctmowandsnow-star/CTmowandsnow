import { BUSINESS, HAT_ADRESSE } from '@/config/business';
import { SERVICES, type Service } from '@/config/services';
import { TOWNS, STATE, type Town } from '@/config/towns';

/**
 * Strukturierte Daten - der Teil, den ein KI-System zuerst liest.
 *
 * REGEL, die hier im Code steht und nicht nur in einem Dokument:
 * Solange `BUSINESS.istEntwurf` true ist, geht KEINE Postanschrift und KEIN
 * geo-Block raus. Eine erfundene Adresse in schema.org ist keine Kleinigkeit -
 * Google und die Modelle behandeln das als Tatsachenbehauptung des Betreibers.
 * Lieber ein duenner, wahrer Datensatz als ein voller, falscher.
 *
 * Ebenfalls bewusst NICHT enthalten: aggregateRating und review. Erfundene
 * Sternebewertungen sind in dieser Branche Standard und fliegen regelmaessig
 * auf. Sobald es echte Google-Bewertungen gibt, kommen sie von dort - nicht
 * von uns.
 */

function Script({ id, data }: { id: string; data: object }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Jeder Ort als bedientes Gebiet - das Kernsignal fuer "near me"-Fragen. */
function areaServed(towns: Town[] = TOWNS) {
  return towns.map((t) => ({
    '@type': 'City',
    name: t.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: t.name,
      addressRegion: t.stateCode,
      addressCountry: 'US',
    },
  }));
}

export const BUSINESS_ID = `${BUSINESS.url}/#business`;

export function BusinessLD() {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LandscapingBusiness',
    '@id': BUSINESS_ID,
    name: BUSINESS.name,
    description: BUSINESS.tagline,
    url: BUSINESS.url,
    areaServed: areaServed(),
    knowsAbout: [
      'lawn mowing', 'mulch installation', 'bed edging', 'spring cleanup',
      'fall leaf removal', 'shrub trimming', 'snow plowing', 'walkway clearing',
      'ice management', 'salting',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Lawn care and snow removal',
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.name,
          description: s.answer,
          url: `${BUSINESS.url}/services/${s.slug}`,
        },
      })),
    },
  };

  // Kontaktweg nur, wenn es ihn wirklich gibt.
  if (BUSINESS.contact.phone) data.telephone = BUSINESS.contact.phone;
  if (BUSINESS.contact.email) data.email = BUSINESS.contact.email;

  const profile = Object.values(BUSINESS.profiles).filter(Boolean);
  if (profile.length) data.sameAs = profile;

  // Adresse und Koordinaten NUR, wenn beides echt vorliegt.
  if (HAT_ADRESSE) {
    data.address = {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.contact.street,
      addressLocality: BUSINESS.contact.city,
      addressRegion: BUSINESS.contact.state,
      postalCode: BUSINESS.contact.zip,
      addressCountry: BUSINESS.contact.country,
    };
  }
  if (BUSINESS.contact.lat != null && BUSINESS.contact.lng != null) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.contact.lat,
      longitude: BUSINESS.contact.lng,
    };
  }

  return <Script id="business-ld" data={data} />;
}

/**
 * WebSite-Datensatz. Fehlte im Vergleich mit hvnh-ai.com als einziger der
 * sechs Bloecke, die eine dortige Ortsseite ausliefert. Er verbindet Domain,
 * Name und Betreiber und ist das Signal, an dem Suchmaschinen und KI-Systeme
 * die Seiten EINER Website zusammenfassen statt sie einzeln zu behandeln.
 */
export function WebSiteLD() {
  return (
    <Script
      id="website-ld"
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${BUSINESS.url}/#website`,
        name: BUSINESS.name,
        alternateName: BUSINESS.claim,
        description: BUSINESS.tagline,
        url: BUSINESS.url,
        inLanguage: 'en-US',
        publisher: { '@id': BUSINESS_ID },
      }}
    />
  );
}

export function ServiceLD({ service, town }: { service: Service; town?: Town }) {
  const url = town
    ? `${BUSINESS.url}/service-areas/${town.slug}`
    : `${BUSINESS.url}/services/${service.slug}`;
  return (
    <Script
      id={`service-ld-${service.slug}${town ? `-${town.slug}` : ''}`}
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: town ? `${service.name} in ${town.name}, ${town.stateCode}` : service.name,
        serviceType: service.name,
        description: service.answer,
        url,
        provider: { '@id': BUSINESS_ID },
        areaServed: town ? areaServed([town]) : areaServed(),
      }}
    />
  );
}

/**
 * Die Fragen kommen aus DERSELBEN Quelle, aus der auch der sichtbare Text
 * gebaut wird. Zwei Listen laufen irgendwann auseinander - dann sagt das
 * Schema etwas anderes als die Seite.
 */
export function FaqLD({ id, faq }: { id: string; faq: { q: string; a: string }[] }) {
  if (!faq.length) return null;
  return (
    <Script
      id={`faq-ld-${id}`}
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }}
    />
  );
}

export function BreadcrumbLD({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <Script
      id={`breadcrumb-ld-${trail.map((t) => t.path).join('-') || 'root'}`}
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          item: `${BUSINESS.url}${t.path}`,
        })),
      }}
    />
  );
}

/**
 * WebPage fuer eine Leistung-Ort-Seite. Ohne diesen Block fehlte den 70
 * Kombiseiten als einzigen der Website der Seitentyp im Datensatz - gemessen
 * im Vergleich mit hvnh-ai.com, wo jede Ortsseite ihn liefert.
 */
export function ServiceTownPageLD({ service, town }: { service: Service; town: Town }) {
  return (
    <Script
      id={`servicetown-ld-${service.slug}-${town.slug}`}
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${service.name} in ${town.name}, ${town.stateCode}`,
        url: `${BUSINESS.url}/services/${service.slug}/${town.slug}`,
        about: { '@id': BUSINESS_ID },
        isPartOf: { '@id': `${BUSINESS.url}/#website` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${BUSINESS.url}/images/${service.image}.jpg` },
        contentLocation: {
          '@type': 'City',
          name: town.name,
          containedInPlace: [
            { '@type': 'AdministrativeArea', name: town.county },
            { '@type': 'State', name: STATE },
          ],
        },
      }}
    />
  );
}

/** Belegt maschinenlesbar, dass eine Ortsseite wirklich von diesem Ort handelt. */
export function TownPageLD({ town }: { town: Town }) {
  return (
    <Script
      id={`townpage-ld-${town.slug}`}
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Lawn Care & Snow Removal in ${town.name}, ${town.stateCode}`,
        url: `${BUSINESS.url}/service-areas/${town.slug}`,
        about: { '@id': BUSINESS_ID },
        isPartOf: { '@id': `${BUSINESS.url}/#website` },
        contentLocation: {
          '@type': 'City',
          name: town.name,
          containedInPlace: [
            { '@type': 'AdministrativeArea', name: town.county },
            { '@type': 'State', name: STATE },
          ],
        },
      }}
    />
  );
}
