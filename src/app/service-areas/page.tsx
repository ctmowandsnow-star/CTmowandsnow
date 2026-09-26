import type { Metadata } from 'next';
import { Verweis as Link } from '@/components/ui/Verweis';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { TOWNS, COUNTY, REGION, STATE, UMLAND_HINWEIS, neighborsOf } from '@/config/towns';
import { Reveal } from '@/components/ui/Reveal';
import { Cta } from '@/components/site/Cta';
import { Crumbs } from '@/components/site/Crumbs';
import { BreadcrumbLD } from '@/components/seo/JsonLd';
import { canonical, ROBOTS } from '@/lib/seo';
import { bild } from '@/lib/pfad';

export const metadata: Metadata = {
  title: 'Service Area',
  description:
    `The towns we cover in ${COUNTY}, ${STATE} — core route and nearby. Lawn care through the green season, `
    + `snow plowing and ice management in winter.`,
  robots: ROBOTS,
  alternates: canonical('/service-areas'),
};

export default function ServiceAreasPage() {
  return (
    <>
      <BreadcrumbLD trail={[{ name: 'Home', path: '/' }, { name: 'Service Area', path: '/service-areas' }]} />

      <header className="relative isolate overflow-hidden pb-14 pt-36">
        <div className="absolute inset-0 -z-10">
          <Image src={bild('snow-plow-truck-view.jpg')} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-bark-950/95 via-bark-950/80 to-bark-950" />
        </div>
        <div className="wrap">
          <Crumbs trail={[{ name: 'Home', path: '/' }, { name: 'Service Area', path: '/service-areas' }]} />
          <Reveal>
            <p className="eyebrow mt-4">{COUNTY}, {STATE}</p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-white">
              Where we work
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bark-100">
              We keep the route tight on purpose. A short route is the reason we can come back the same day
              when a storm turns, and the reason a lawn gets cut on the day we said rather than &ldquo;this week&rdquo;.
            </p>
          </Reveal>
        </div>
      </header>

      {/* Nur EIN Block. Der Betrieb nennt sieben Orte namentlich und dahinter
          "and surrounding areas" - ohne zu sagen, welche. Ein zweiter Block
          "Nearby" waere entweder leer oder mit geratenen Ortsnamen gefuellt,
          und geratene Ortsnamen auf einer Standortseite sind genau die
          Falschangabe, die wir bei anderen messen. */}
      {[
        { head: 'On the route', note: 'Named towns, on the schedule automatically. In winter these get cleared without anyone having to call.', list: TOWNS },
      ].map((group, gi) => (
        <section key={group.head} className="wrap py-10">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-white">{group.head}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bark-300">{group.note}</p>
          </Reveal>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.list.map((t, i) => (
              <Reveal key={t.slug} delay={gi * .05 + i * .05}>
                <Link href={`/service-areas/${t.slug}`} className="card group block h-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {t.name}, {t.stateCode}
                    </h3>
                    <MapPin size={16} className="mt-1 shrink-0 text-bark-500 transition-colors group-hover:text-white" />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-bark-300">{t.character}</p>
                  <p className="mt-3 text-xs text-bark-500">
                    Near {neighborsOf(t).map((n) => n.name).join(', ')}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold accent-text">
                    Services in {t.name}
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      <section className="wrap py-10">
        <Reveal>
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-white">Just outside the area?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bark-300">
              We also work {UMLAND_HINWEIS.replace('and ', '')}. Whether we can take your property
              depends on where the rest of the route runs that season — and a straight no now is better for
              both of us than a driveway that does not get plowed in February.
            </p>
          </div>
        </Reveal>
      </section>

      <Cta />
    </>
  );
}
