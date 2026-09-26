import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SeasonProvider } from '@/components/ui/SeasonProvider';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { DraftBanner } from '@/components/site/DraftBanner';
import { BusinessLD, WebSiteLD } from '@/components/seo/JsonLd';
import { BUSINESS } from '@/config/business';
import { TOWNS, REGION, STATE } from '@/config/towns';
import { ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.url),
  title: {
    default: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    template: `%s — ${BUSINESS.name}`,
  },
  description:
    `Lawn mowing, mulch, cleanups and bush work from spring through fall. Driveway plowing, walkways and `
    + `ice control all winter. Serving ${TOWNS.map((t) => t.name).slice(0, 4).join(', ')} and surrounding `
    + `areas in ${REGION}.`,
  robots: ROBOTS,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: BUSINESS.name,
    images: [{
      url: '/images/property-full-after.jpg',
      width: 1800,
      height: 1350,
      // Alternativtext auch fuers Vorschaubild - hvnh-ai.com liefert ihn,
      // wir hatten ihn nicht. Er wird in Slack, LinkedIn und von
      // Bildschirmlesern ausgewertet.
      alt: 'A maintained single-family property with cut lawn, fresh beds and a clean walkway',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    description: BUSINESS.claim,
    images: [{
      url: '/images/property-full-after.jpg',
      alt: 'A maintained single-family property with cut lawn, fresh beds and a clean walkway',
    }],
  },
};

export const viewport: Viewport = {
  themeColor: '#17130f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Die Bandhoehe kommt aus derselben Quelle wie das Band selbst -
    // keine zweite Stelle, die vergessen werden kann.
    <html lang="en-US" style={{ '--draft-h': BUSINESS.istEntwurf && BUSINESS.zeigeEntwurfsband ? '36px' : '0px' } as React.CSSProperties}>
      <body>
        <BusinessLD />
        <WebSiteLD />
        <SeasonProvider>
          <DraftBanner />
          <Header />
          <main>{children}</main>
          <Footer />
        </SeasonProvider>
      </body>
    </html>
  );
}
