import type { Metadata } from 'next';
import Image from 'next/image';
import { Verweis as Link } from '@/components/ui/Verweis';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin } from 'lucide-react';
import { COUNTIES, countyBySlug, townsInCounty, neighborsOf, REGION, UMLAND_HINWEIS } from '@/config/towns';
import { GREEN_SERVICES, SNOW_SERVICES } from '@/config/services';
import { BUSINESS } from '@/config/business';
import { Reveal } from '@/components/ui/Reveal';
import { Faq } from '@/components/ui/Faq';
import { Crumbs } from '@/components/site/Crumbs';
import { Cta } from '@/components/site/Cta';
import { BreadcrumbLD, FaqLD } from '@/components/seo/JsonLd';
import { canonical, ROBOTS } from '@/lib/seo';
import { bild } from '@/lib/pfad';

/**
 * Die Regionsebene zwischen Uebersicht und Ort - das Gegenstueck zu
 * /standorte/land/[land] auf hvnh-ai.com. Sie macht die Hierarchie
 * vollstaendig (vier Brotkrumen-Stufen statt drei) und fasst zusammen, was
 * allen Orten gemeinsam ist, statt es auf sieben Seiten zu wiederholen.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTIES.map((c) => ({ county: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ county: string }> },
): Promise<Metadata> {
  const { county } = await params;
  const c = countyBySlug.get(county);
  if (!c) return {};
  const orte = townsInCounty(c);
  return {
    title: { absolute: `Lawn Care & Snow Removal in ${c.name}, ${c.stateCode} — ${BUSINESS.name}` },
    description:
      `${orte.length} towns across ${c.name}: ${orte.map((t) => t.name).join(', ')}. `
      + `Mowing, mulch and cleanups through the green season, plowing and ice control all winter.`,
    robots: ROBOTS,
    alternates: canonical(`/service-areas/county/${c.slug}`),
  };
}

export default async function CountySeite({ params }: { params: Promise<{ county: string }> }) {
  const { county } = await params;
  const c = countyBySlug.get(county);
  if (!c) notFound();
  const orte = townsInCounty(c);

  const spur = [
    { name: 'Home', path: '/' },
    { name: 'Service Area', path: '/service-areas' },
    { name: c.name, path: `/service-areas/county/${c.slug}` },
  ];

  const faq = [
    {
      q: `Which towns in ${c.name} do you cover?`,
      a: `${orte.map((t) => t.name).join(', ')} — ${UMLAND_HINWEIS}. Those are the towns the route actually `
        + `runs through, which is why we can come back the same day when a storm turns.`,
    },
    {
      q: `Is the whole route inside ${c.name}?`,
      a: `Yes, and that is deliberate. A route that crosses county lines looks bigger on a map and performs `
        + `worse in a storm — the drive between jobs is the part that costs everyone time.`,
    },
    {
      q: `Do you charge more for towns further out?`,
      a: `No. Every town listed here is on the route, and the route is priced as one. What moves a price is `
        + `the property itself: size, access and condition.`,
    },
  ];

  return (
    <>
      <FaqLD id={`county-${c.slug}`} faq={faq} />
      <BreadcrumbLD trail={spur} />

      <header className="relative isolate overflow-hidden pb-12 pt-32">
        <div className="absolute inset-0 -z-10">
          <Image src={bild('snow-plow-truck-view.jpg')} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-bark-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-bark-950/80 via-bark-950/55 to-bark-950" />
        </div>
        <div className="wrap">
          <Crumbs trail={spur} />
          <Reveal>
            <p className="eyebrow mt-4">{REGION}</p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.9rem,4.6vw,3.2rem)] font-semibold leading-[1.07] tracking-tight text-white">
              Lawn care and snow removal across {c.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bark-100">
              {BUSINESS.name} works {orte.length} towns in {c.name}, {c.state}: {orte.map((t) => t.name).join(', ')}.
              One crew, both seasons, and a route tight enough that a storm does not push anyone to the
              next day.
            </p>
          </Reveal>
        </div>
      </header>

      <section className="wrap py-12">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-white">Towns in {c.name}</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orte.map((t, i) => (
            <Reveal key={t.slug} delay={i * .05}>
              <Link href={`/service-areas/${t.slug}`} className="card group block h-full p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-white">{t.name}, {t.stateCode}</h3>
                  <MapPin size={16} className="mt-1 shrink-0 text-bark-500 transition-colors group-hover:text-white" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-bark-300">{t.merkmale.lots}</p>
                <p className="mt-3 text-xs text-bark-500">
                  Near {neighborsOf(t).map((n) => n.name).join(', ')}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold accent-text">
                  Services in {t.name} <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/25 py-14">
        <div className="wrap grid gap-10 lg:grid-cols-2">
          {[
            { head: `Green season across ${c.name}`, list: GREEN_SERVICES },
            { head: `Winter across ${c.name}`, list: SNOW_SERVICES },
          ].map((b, bi) => (
            <Reveal key={b.head} delay={bi * .08}>
              <h2 className="font-display text-xl font-semibold text-white">{b.head}</h2>
              <ul className="mt-5 space-y-2.5">
                {b.list.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="group flex items-start gap-2 text-[15px] text-bark-200 hover:text-white">
                      <ArrowRight size={14} className="mt-1 shrink-0 text-bark-500 transition-transform group-hover:translate-x-0.5" />
                      <span>
                        <h3 className="inline font-medium">{s.name}</h3>
                        <span className="block text-sm text-bark-400">{s.summary}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap py-14">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-white">Questions about {c.name}</h2>
          </Reveal>
          <Reveal delay={.08}><Faq items={faq} /></Reveal>
        </div>
      </section>

      <Cta />
    </>
  );
}
