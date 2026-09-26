import type { Metadata } from 'next';
import Image from 'next/image';
import { Verweis as Link } from '@/components/ui/Verweis';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import { SERVICES, serviceBySlug, type Service } from '@/config/services';
import { TOWNS, townBySlug, neighborsOf, REGION, type Town } from '@/config/towns';
import { BUSINESS } from '@/config/business';
import { Reveal } from '@/components/ui/Reveal';
import { Faq } from '@/components/ui/Faq';
import { Crumbs } from '@/components/site/Crumbs';
import { Cta } from '@/components/site/Cta';
import { BreadcrumbLD, FaqLD, ServiceLD, ServiceTownPageLD } from '@/components/seo/JsonLd';
import { canonical, ROBOTS } from '@/lib/seo';
import { bild } from '@/lib/pfad';

/**
 * Leistung x Ort — 10 Leistungen fuer 7 Orte, also 70 Seiten.
 *
 * DAS IST DER LONG-TAIL: Niemand tippt "landscaping services". Die echte
 * Anfrage ist "snow plowing plainville ct" oder "who plows driveways near
 * West Hartford" — und genau so fragt auch jemand ChatGPT.
 *
 * ZUGLEICH IST ES DIE GEFAEHRLICHSTE SEITENART DER GANZEN WEBSITE. 70 Seiten,
 * die sich nur durch zwei ausgetauschte Woerter unterscheiden, sind
 * Doorway-Pages. Google sortiert sie aus, und ein KI-System, das dreimal
 * denselben Satz mit anderem Ortsnamen liest, zitiert keinen davon.
 *
 * Deshalb wird der ortsspezifische Teil NICHT aus einer Schablone gebaut,
 * sondern aus `town.merkmale` — fuenf echte Arbeitsmerkmale je Ort — und
 * `service.relevant` waehlt aus, welche davon fuer DIESE Leistung zaehlen.
 * Fuers Pfluegen sind das Einfahrten und Schneelager, fuer Laubarbeit der
 * Baumbestand. Keine zwei dieser Absaetze sind gleich; pruefungen/doorway.mjs
 * misst das am ausgelieferten HTML.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.flatMap((s) => TOWNS.map((t) => ({ slug: s.slug, town: t.slug })));
}

const MERKMAL_TITEL: Record<string, string> = {
  driveways: 'Driveways',
  snowStorage: 'Where the snow goes',
  lots: 'Lot sizes',
  trees: 'Tree cover',
  access: 'Access',
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; town: string }> },
): Promise<Metadata> {
  const { slug, town } = await params;
  const s = serviceBySlug.get(slug);
  const t = townBySlug.get(town);
  if (!s || !t) return {};
  const titel = `${s.name} in ${t.name}, ${t.stateCode}`;
  return {
    title: { absolute: `${titel} — ${BUSINESS.name}` },
    description:
      `${s.summary} ${t.merkmale[s.relevant[0]]} Free estimates in ${t.name} and across ${REGION}.`
        .slice(0, 300),
    robots: ROBOTS,
    alternates: canonical(`/services/${s.slug}/${t.slug}`),
    openGraph: {
      title: titel,
      description: s.answer.slice(0, 200),
      url: `${BUSINESS.url}/services/${s.slug}/${t.slug}`,
      images: [{ url: `/images/${s.image}.jpg`, alt: s.imageAlt }],
    },
  };
}

/** Die Fragen, die zu DIESER Leistung an DIESEM Ort wirklich gestellt werden. */
function kombiFaq(s: Service, t: Town) {
  const nb = neighborsOf(t);
  const fragen = [
    {
      q: `Do you do ${s.name.toLowerCase()} in ${t.name}?`,
      a: `Yes. ${t.name}, ${t.stateCode} is a named town on our route, and ${s.name.toLowerCase()} is part of `
        + `what we do there${t.partOf ? ` — including the ${t.partOf} side of the village` : ''}. `
        + `${nb.length ? `We are usually in ${nb.slice(0, 2).map((n) => n.name).join(' and ')} the same week.` : ''}`,
    },
    {
      q: `What is different about ${s.name.toLowerCase()} in ${t.name}?`,
      a: `${t.merkmale[s.relevant[0]]} ${s.relevant[1] ? t.merkmale[s.relevant[1]] : ''}`.trim(),
    },
    {
      q: `What does it cost in ${t.name}?`,
      a: `It depends on the property — size, access and condition all move the number, and those vary a lot `
        + `even within ${t.name}. The estimate is free, we look at the place first, and there is nothing owed `
        + `if you pass.`,
    },
    ...s.faq.slice(0, 2),
  ];
  return fragen;
}

export default async function LeistungOrtSeite(
  { params }: { params: Promise<{ slug: string; town: string }> },
) {
  const { slug, town } = await params;
  const s = serviceBySlug.get(slug);
  const t = townBySlug.get(town);
  if (!s || !t) notFound();

  const nb = neighborsOf(t);
  const faq = kombiFaq(s, t);
  const geschwister = SERVICES.filter((x) => x.season === s.season && x.slug !== s.slug);
  const spur = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: s.name, path: `/services/${s.slug}` },
    { name: t.name, path: `/services/${s.slug}/${t.slug}` },
  ];

  return (
    <>
      <ServiceLD service={s} town={t} />
      <ServiceTownPageLD service={s} town={t} />
      <FaqLD id={`${s.slug}-${t.slug}`} faq={faq} />
      <BreadcrumbLD trail={spur} />

      <header className="relative isolate overflow-hidden pb-12 pt-32">
        <div className="absolute inset-0 -z-10">
          <Image src={bild(`${s.image}.jpg`)} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-bark-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-bark-950/80 via-bark-950/55 to-bark-950" />
        </div>
        <div className="wrap">
          <Crumbs trail={spur} />
          <Reveal>
            <p className="eyebrow mt-4 flex items-center gap-1.5">
              <MapPin size={13} /> {t.name}, {t.stateCode} · {t.county}
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.9rem,4.6vw,3.2rem)] font-semibold leading-[1.07] tracking-tight text-white">
              {s.name} in {t.name}, {t.stateCode}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bark-100">{s.answer}</p>
          </Reveal>
        </div>
      </header>

      {/* Der ortsspezifische Kern. Kommt aus den Merkmalen des Ortes, die
          fuer GENAU diese Leistung zaehlen - nicht aus einer Schablone. */}
      <section className="wrap py-12">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-white">
            What {t.name} properties mean for this job
          </h2>
        </Reveal>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {s.relevant.map((k, i) => (
            <Reveal key={k} delay={i * .08}>
              <div className="card h-full p-6">
                <h3 className="font-display text-base font-semibold accent-text">{MERKMAL_TITEL[k]}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-bark-200">{t.merkmale[k]}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={.14}>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-bark-300">{t.character}</p>
        </Reveal>
      </section>

      <section className="border-y border-white/5 bg-black/25 py-14">
        <div className="wrap grid gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-white">
              What is included in {t.name}
            </h2>
            <ul className="mt-6 space-y-3.5">
              {s.includes.map((line) => (
                <li key={line} className="flex gap-3">
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: 'rgb(var(--accent) / .2)', color: 'rgb(var(--accent-soft))' }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[15px] leading-relaxed text-bark-200">{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={bild(`${s.image}.jpg`)}
                alt={`${s.imageAlt} — ${s.name} in ${t.name}, ${t.stateCode}`}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="wrap py-14">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-white">
              {s.name} in {t.name} — questions
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-bark-300">
              Straight answers, including where the answer is &ldquo;it depends&rdquo;.
            </p>
          </Reveal>
          <Reveal delay={.08}>
            <Faq items={faq} />
          </Reveal>
        </div>
      </section>

      {/* Zwei Richtungen interner Verlinkung: dieselbe Leistung in den
          Nachbarorten, und die anderen Leistungen an DIESEM Ort. */}
      <section className="wrap pb-6">
        <Reveal>
          <h2 className="font-display text-xl font-semibold text-white">
            {s.name} near {t.name}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {nb.map((n) => (
              <Link
                key={n.slug}
                href={`/services/${s.slug}/${n.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[.04] px-3.5 py-2
                           text-sm text-bark-200 transition-all hover:border-white/30 hover:text-white"
              >
                <MapPin size={13} className="text-bark-500" /> {n.name}, {n.stateCode}
              </Link>
            ))}
            <Link href={`/services/${s.slug}`} className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold accent-text hover:underline">
              All towns <ArrowRight size={13} />
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="wrap py-10">
        <Reveal>
          <h2 className="font-display text-xl font-semibold text-white">
            Other {s.season === 'green' ? 'green season' : 'winter'} work in {t.name}
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {geschwister.map((g, i) => (
            <Reveal key={g.slug} delay={i * .05}>
              <Link href={`/services/${g.slug}/${t.slug}`} className="card group block h-full p-5">
                <h3 className="font-display text-base font-semibold leading-snug text-white">
                  {g.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-bark-300">{g.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold accent-text">
                  In {t.name} <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Cta
        head={`${s.name} in ${t.name} — free estimate`}
        sub={`Send the address and what you need. We look at the property first, then quote it — free, and `
          + `nothing owed if you pass.`}
      />
    </>
  );
}
