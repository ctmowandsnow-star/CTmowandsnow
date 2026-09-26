import { BUSINESS, HAT_ADRESSE, HAT_INHABER } from '@/config/business';
import { SERVICES, type Service } from '@/config/services';
import { TOWNS, STATE, STATE_CODE, COUNTY, REGION, type Town } from '@/config/towns';
import { aufzaehlung } from '@/lib/seo';

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
export const WEBSITE_ID = `${BUSINESS.url}/#website`;

/**
 * Ein Typ, den es in schema.org WIRKLICH gibt.
 *
 * Bis 26.09.2026 stand hier 'LandscapingBusiness'. Diesen Typ kennt schema.org
 * nicht (die Untertypen von LocalBusiness enden bei HomeAndConstructionBusiness
 * mit Electrician, Plumber, RoofingContractor usw. - Landschaftsbau ist nicht
 * dabei). Ein unbekannter Typ ist fuer Validatoren und Suchmaschinen kein
 * Unternehmen, sondern ein unbekanntes Ding: der GEO-Check von
 * ai-geotracking.com fand deshalb "kein maschinenlesbares Firmenprofil"
 * (Identitaet 0 von 15), obwohl der Datensatz auf jeder Seite stand.
 * Was der Betrieb genau tut, sagen knowsAbout und der Leistungskatalog.
 * pruefungen/geo.mjs laesst nur Typen aus der schema.org-Liste durch.
 */
export const BUSINESS_TYPE = 'HomeAndConstructionBusiness';

export function BusinessLD() {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': BUSINESS_TYPE,
    '@id': BUSINESS_ID,
    name: BUSINESS.name,
    description: BUSINESS.tagline,
    /*
     * In Connecticut gibt es einen zweiten Betrieb mit fast gleichem Namen -
     * anderer Ort, andere Domain, eigenes Google-Profil. Ein Sprachmodell, das
     * nur den Namen sieht, mischt die beiden: fremde Telefonnummer, fremde
     * Bewertungen. Dieser Satz sagt einer Maschine, woran sie DIESEN Betrieb
     * erkennt (Orte + Domain), ohne den anderen zu nennen.
     */
    disambiguatingDescription:
      `Residential lawn care and snow removal in ${REGION} (${COUNTY}, ${STATE_CODE}), serving `
      + `${aufzaehlung(TOWNS.map((t) => t.name))}. Website: ${BUSINESS.url.replace(/^https?:\/\//, '')}.`,
    slogan: BUSINESS.claim,
    url: BUSINESS.url,
    // Ein eigenes Arbeitsfoto - dasselbe, das die Seite als Vorschaubild nutzt.
    image: `${BUSINESS.url}/images/property-full-after.jpg`,
    mainEntityOfPage: { '@id': WEBSITE_ID },
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

  // Offizieller Name wie im Google-Profil - der Anzeigename bleibt die Marke.
  if (BUSINESS.legalName) data.legalName = BUSINESS.legalName;

  // Kontaktweg nur, wenn es ihn wirklich gibt.
  if (BUSINESS.contact.phone) data.telephone = BUSINESS.contact.phone;
  if (BUSINESS.contact.email) data.email = BUSINESS.contact.email;
  if (BUSINESS.contact.phone || BUSINESS.contact.email) {
    data.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      ...(BUSINESS.contact.phone ? { telephone: BUSINESS.contact.phone } : {}),
      ...(BUSINESS.contact.email ? { email: BUSINESS.contact.email } : {}),
    };
  }

  // Wer dahinter steht - erst, wenn ein echter Name eingetragen ist. KI-Systeme
  // ziehen Quellen mit erkennbarer Person vor; ein Platzhaltername waere eine
  // Falschangabe. "employee" + jobTitle, weil nur die Inhaberschaft belegt
  // sein wird, nicht die Gruendung.
  if (HAT_INHABER) {
    data.employee = {
      '@type': 'Person',
      '@id': `${BUSINESS.url}/#owner`,
      name: BUSINESS.ownerName,
      jobTitle: 'Owner',
      worksFor: { '@id': BUSINESS_ID },
    };
  }

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
        '@id': WEBSITE_ID,
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
        '@id': `${BUSINESS.url}/services/${service.slug}/${town.slug}#webpage`,
        name: `${service.name} in ${town.name}, ${town.stateCode}`,
        url: `${BUSINESS.url}/services/${service.slug}/${town.slug}`,
        inLanguage: 'en-US',
        about: { '@id': BUSINESS_ID },
        isPartOf: { '@id': WEBSITE_ID },
        ...HERKUNFT,
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
        '@id': `${BUSINESS.url}/service-areas/${town.slug}#webpage`,
        name: `Lawn Care & Snow Removal in ${town.name}, ${town.stateCode}`,
        url: `${BUSINESS.url}/service-areas/${town.slug}`,
        inLanguage: 'en-US',
        about: { '@id': BUSINESS_ID },
        isPartOf: { '@id': WEBSITE_ID },
        ...HERKUNFT,
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

/**
 * Wer die Seite verantwortet - fuer jeden Seitenknoten dieselbe Angabe.
 * KI-Systeme stuetzen sich lieber auf Quellen mit erkennbarer Herkunft; ohne
 * author/publisher ist eine Seite fuer sie eine Behauptung ohne Absender.
 */
const HERKUNFT = {
  author: { '@id': BUSINESS_ID },
  publisher: { '@id': BUSINESS_ID },
};

export type SeitenTyp = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'ImageGallery';

/**
 * Seitenknoten fuer alle Seiten, die keinen eigenen haben. Bis 26.09.2026
 * hatten nur die 77 Orts- und Kombiseiten einen - Startseite, Leistungen,
 * Ueber uns, Kontakt und Galerie nicht. Name und Beschreibung kommen aus
 * DENSELBEN Konstanten wie die Metadaten der Seite.
 */
export function SeiteLD({ typ = 'WebPage', pfad, name, beschreibung }: {
  typ?: SeitenTyp; pfad: string; name: string; beschreibung: string;
}) {
  const url = pfad === '/' ? BUSINESS.url : `${BUSINESS.url}${pfad}`;
  const hauptsache = typ === 'AboutPage' || typ === 'ContactPage' ? { mainEntity: { '@id': BUSINESS_ID } } : {};
  return (
    <Script
      id={`seite-ld-${pfad === '/' ? 'start' : pfad.slice(1).replace(/\//g, '-')}`}
      data={{
        '@context': 'https://schema.org',
        '@type': typ,
        '@id': `${pfad === '/' ? `${BUSINESS.url}/` : url}#webpage`,
        url,
        name,
        description: beschreibung,
        inLanguage: 'en-US',
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': BUSINESS_ID },
        ...hauptsache,
        ...HERKUNFT,
      }}
    />
  );
}
