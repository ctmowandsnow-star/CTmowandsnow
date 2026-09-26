import type { Metadata } from 'next';
import Image from 'next/image';
import { Verweis as Link } from '@/components/ui/Verweis';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin } from 'lucide-react';
import { TOWNS, townBySlug, neighborsOf, countyOf, REGION, STATE, UMLAND_HINWEIS, type Town } from '@/config/towns';
import { GREEN_SERVICES, SNOW_SERVICES, SERVICES } from '@/config/services';
import { ARBEITSWEISEN } from '@/config/arbeitsweisen';

const MERKMAL_TITEL: Record<string, string> = {
  driveways: 'Driveways',
  snowStorage: 'Where the snow goes',
  lots: 'Lot sizes',
  trees: 'Tree cover',
  access: 'Access',
};
import { Reveal } from '@/components/ui/Reveal';
import { Faq } from '@/components/ui/Faq';
import { Cta } from '@/components/site/Cta';
import { Crumbs } from '@/components/site/Crumbs';
import { BreadcrumbLD, FaqLD, ServiceLD, TownPageLD } from '@/components/seo/JsonLd';
import { BUSINESS } from '@/config/business';
import { beschreibung, canonical, ROBOTS, titel } from '@/lib/seo';
import { bild } from '@/lib/pfad';

export function generateStaticParams() {
  return TOWNS.map((t) => ({ town: t.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ town: string }> },
): Promise<Metadata> {
  const { town: slug } = await params;
  const t = townBySlug.get(slug);
  if (!t) return {};
  return {
    title: titel(`Lawn Care & Snow Removal in ${t.name}, ${t.stateCode}`),
    description: beschreibung(
      `Lawn mowing, mulch, cleanups and bush work in ${t.name}, ${t.stateCode} — plus driveway plowing, `
        + `walkway clearing and ice control all winter. Free estimates.`,
      `Lawn care and snow removal in ${t.name}, ${t.stateCode}: mowing, mulch and cleanups, then plowing `
        + `and ice control all winter.`,
    ),
    robots: ROBOTS,
    alternates: canonical(`/service-areas/${t.slug}`),
  };
}

/**
 * Der Jahresverlauf an diesem Ort. Vier Absaetze, jeder aus einem anderen
 * Ortsmerkmal gebaut - dadurch liest sich der Herbst in Unionville anders als
 * in Southington, statt nur einen anderen Ortsnamen zu tragen.
 */
function jahreslauf(t: Town) {
  return [
    {
      zeit: 'March to May',
      titel: 'Spring cleanup and the first cuts',
      text: `Winter leaves behind road sand, grit and whatever blew in after the last fall visit. `
        + `${t.merkmale.access} That decides how much of the spring cleanup in ${t.name} is machine work `
        + `and how much is done by hand. Once the ground firms up, the mowing schedule starts and you get `
        + `a fixed weekday.`,
    },
    {
      zeit: 'May to August',
      titel: 'The mowing season',
      text: `${t.merkmale.lots} Weekly is the standard through the growing season; in the midsummer heat `
        + `some ${t.name} lawns slow down enough to go every other week, and we say so instead of billing `
        + `for a cut the lawn did not need. Beds get mulched once in spring and edged as the season goes on.`,
    },
    {
      zeit: 'September to November',
      titel: 'Leaves, and the last cuts',
      text: `${t.merkmale.trees} The last cleanup goes in after the trees are bare, usually late October `
        + `into November here. Leaves left on a lawn over winter mat down under the snow and kill the grass `
        + `underneath — which is why the fall pass in ${t.name} is not optional.`,
    },
    {
      zeit: 'December to March',
      titel: 'Winter footing',
      text: `Driveway markers go in before the first storm. ${t.merkmale.driveways} `
        + `${t.merkmale.snowStorage} Seasonal customers in ${t.name} are cleared automatically — during the `
        + `storm so you can get out, and again after it ends so the driveway is actually finished.`,
    },
  ];
}

/**
 * Macht aus den Kurzformen der Leistungen einen lesbaren Satzteil.
 *
 * Die Trennung mit " and " vor dem letzten Eintrag geht nur, solange kein
 * Eintrag selbst ein "and" enthaelt - sonst steht da "... salting and ice
 * control and seasonal snow service". Enthaelt einer eins, bleibt es bei
 * Kommas. Die Regel steht hier, damit sie auch dann noch haelt, wenn spaeter
 * jemand eine Kurzform mit "and" ergaenzt.
 */
function kurzListe(list: { shortName: string }[]): string {
  const namen = list.map((s) => s.shortName);
  if (namen.length <= 1) return namen[0] ?? '';
  if (namen.some((n) => / and /.test(n))) return namen.join(', ');
  return `${namen.slice(0, -1).join(', ')} and ${namen[namen.length - 1]}`;
}

/**
 * Die Ortsfragen werden aus ECHTEN Feldern des Ortes gebaut (Nachbarorte,
 * County, Zone, Eigenart), nicht aus einer Schablone mit ausgetauschtem
 * Ortsnamen. Wer zehn dieser Seiten nebeneinander legt, muss zehn
 * verschiedene Texte sehen - sonst ist es eine Doorway-Page, und die
 * KI-Systeme sortieren sie genauso aus wie Google.
 */
function townFaq(t: Town) {
  const nb = neighborsOf(t);
  return [
    {
      q: `Do you actually cover ${t.name}?`,
      a: `Yes — ${t.name} is a named town on our route, along with ${nb.map((n) => n.name).join(', ')}. `
        + `${t.partOf ? `It sits inside ${t.partOf}, which is on the route as well. ` : ''}`
        + `That matters most in winter: a town on the route gets cleared automatically, without anyone `
        + `having to call us during a storm. We also work ${UMLAND_HINWEIS.replace('and ', '')} — if you are `
        + `just outside, ask.`,
    },
    {
      q: `What is different about properties in ${t.name}?`,
      a: `${t.character} It is the kind of thing that decides how a job is quoted, which is why we look at a `
        + `property before putting a number on it.`,
    },
    {
      q: `Do you do both lawn care and snow removal in ${t.name}?`,
      a: `Yes. The same crew handles both — mowing, mulch and cleanups from spring through fall, then `
        + `plowing, walkways and ice management once winter sets in. You keep one point of contact all year.`,
    },
    {
      q: `What does lawn care cost in ${t.name}?`,
      a: `There is no flat rate, and any number given over the phone without seeing the property is a number `
        + `somebody will be unhappy about later. ${t.merkmale.lots} That alone moves the price more than `
        + `anything else. The estimate is free and there is nothing owed if you pass.`,
    },
    {
      q: `Can you handle the parts a truck cannot reach in ${t.name}?`,
      a: `${t.merkmale.access} Walks, steps, entrances and the paths between buildings are done by blower or `
        + `by hand — that is a separate line from plowing because it is separate work, and it is the part most `
        + `plow-only operators skip.`,
    },
    {
      q: `How fast can you get to me in ${t.name} after a storm?`,
      a: `${t.name} is in ${t.county}, and the whole route sits inside ${REGION} — that is deliberate. What we commit `
        + `to is that you are cleared during the storm and finished after it ends. We will not promise a clock `
        + `time during a storm, because nobody who plows honestly can.`,
    },
  ];
}

export default async function TownPage({ params }: { params: Promise<{ town: string }> }) {
  const { town: slug } = await params;
  const t = townBySlug.get(slug);
  if (!t) notFound();

  const nb = neighborsOf(t);
  const faq = townFaq(t);
  const c = countyOf(t);
  // Vier Stufen statt drei - die County-Ebene macht die Hierarchie
  // vollstaendig und entspricht dem Aufbau auf hvnh-ai.com.
  const spur = [
    { name: 'Home', path: '/' },
    { name: 'Service Area', path: '/service-areas' },
    ...(c ? [{ name: c.name, path: `/service-areas/county/${c.slug}` }] : []),
    { name: t.name, path: `/service-areas/${t.slug}` },
  ];

  return (
    <>
      <TownPageLD town={t} />
      <FaqLD id={`town-${t.slug}`} faq={faq} />
      <BreadcrumbLD trail={spur} />
      {/* Jede Leistung ausdruecklich fuer DIESEN Ort als bedientes Gebiet. */}
      {SERVICES.map((s) => (
        <ServiceLD key={s.slug} service={s} town={t} />
      ))}

      <header className="relative isolate overflow-hidden pb-14 pt-36">
        <div className="absolute inset-0 -z-10">
          <Image src={bild('lawn-front-manicured.jpg')} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-bark-950/95 via-bark-950/80 to-bark-950" />
        </div>
        <div className="wrap">
          <Crumbs trail={spur} />
          <Reveal>
            <p className="eyebrow mt-4 flex items-center gap-1.5">
              <MapPin size={13} /> {t.county}, {STATE}
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-white">
              Lawn care and snow removal in {t.name}, {t.stateCode}
            </h1>
            {/* Der Satz, den eine KI auf "wer maeht/plow in {Ort}" zitieren kann. */}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bark-100">
              {BUSINESS.name} serves {t.name} year-round: {kurzListe(GREEN_SERVICES)} through the green
              season, then {kurzListe(SNOW_SERVICES)} all winter.{' '}
              {t.partOf
                ? `${t.name} sits inside ${t.partOf}, and both are on the route.`
                : `${t.name} is one of the ${TOWNS.length} towns the route runs through.`}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-bark-300">{t.character}</p>
          </Reveal>

          <Reveal delay={.1}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Free estimate in {t.name} <ArrowRight size={16} />
              </Link>
              <Link href="/gallery" className="btn btn-ghost">See our work</Link>
            </div>
          </Reveal>
        </div>
      </header>

      {/* Die Arbeitsmerkmale des Ortes. Fuenf echte Felder statt eines
          Absatzes mit ausgetauschtem Ortsnamen - und dieselbe Quelle, aus der
          auch die 70 Leistung-Ort-Seiten ihren eigenen Teil bauen. */}
      <section className="wrap py-14">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-white">
            What {t.name} properties are like to work on
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-bark-300">
            Every town on the route has its own quirks, and they decide how a job gets quoted and how long it
            takes. These are the ones that matter in {t.name}.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(['driveways', 'snowStorage', 'lots', 'trees', 'access'] as const).map((k, i) => (
            <Reveal key={k} delay={i * .06}>
              <div className="card h-full p-5">
                <h3 className="font-display text-base font-semibold accent-text">{MERKMAL_TITEL[k]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bark-200">{t.merkmale[k]}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap grid gap-10 py-14 lg:grid-cols-2">
        {[
          { head: `Green season in ${t.name}`, list: GREEN_SERVICES, img: 'mowing-after-wide' },
          { head: `Winter in ${t.name}`, list: SNOW_SERVICES, img: 'snow-deep-cleared-day' },
        ].map((block, bi) => (
          <Reveal key={block.head} delay={bi * .1}>
            <div className="card h-full overflow-hidden">
              <div className="relative aspect-[16/9]">
                <Image
                  src={bild(`${block.img}-sm.jpg`)}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bark-950 to-transparent" />
              </div>
              <div className="p-6">
                <h2 className="font-display text-xl font-semibold text-white">{block.head}</h2>
                <ul className="mt-4 space-y-2.5">
                  {block.list.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}/${t.slug}`}
                        className="group flex items-start gap-2 text-[15px] text-bark-200 hover:text-white"
                      >
                        <ArrowRight
                          size={14}
                          className="mt-1 shrink-0 text-bark-500 transition-transform group-hover:translate-x-0.5"
                        />
                        <span>
                          <h3 className="inline font-medium">{s.name} in {t.name}</h3>
                          <span className="block text-sm text-bark-400">{s.summary}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Die drei Arbeitsweisen an diesem Ort. Gegenstueck zum Block
          "Loesungen fuer Ihre Branche in {Stadt}" auf hvnh-ai.com - nur dass
          hier nicht nach Branche unterschieden wird, sondern danach, wie
          jemand uns beauftragt. Das ist die Unterscheidung, die der Betrieb
          selbst trifft. */}
      <section className="wrap py-14">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-white">
            Three ways to hire us in {t.name}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-bark-300">
            Regular maintenance, a single cleanup, or snow after a storm. Which one fits depends on the
            property and on how much you want to think about it.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {ARBEITSWEISEN.map((a, i) => (
            <Reveal key={a.slug} delay={i * .06}>
              <Link href={`/how-we-work/${a.slug}`} className="card group block h-full p-5">
                <h3 className="font-display text-base font-semibold text-white">{a.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bark-300">{a.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold accent-text">
                  In {t.name} <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Der Jahresverlauf. Fuer einen Betrieb, der zwei Geschaefte in einem
          Jahr fuehrt, ist das die Frage, die Kunden wirklich stellen. */}
      <section className="border-y border-white/5 bg-black/25 py-14">
        <div className="wrap">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-white">
              A year on a {t.name} property
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-bark-300">
              One crew, four seasons. This is how a year runs on a property in {t.name}.
            </p>
          </Reveal>
          <div className="mt-9 space-y-4">
            {jahreslauf(t).map((j, i) => (
              <Reveal key={j.zeit} delay={i * .06}>
                <div className="card grid gap-4 p-6 sm:grid-cols-[150px_1fr]">
                  <p className="text-sm font-semibold accent-text">{j.zeit}</p>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">{j.titel}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-bark-200">{j.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-14">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-white">
              Questions from {t.name}
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

      {nb.length > 0 && (
        <section className="wrap pb-10">
          <Reveal>
            <h2 className="font-display text-xl font-semibold text-white">Also on the route near {t.name}</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {nb.map((n) => (
                <Link
                  key={n.slug}
                  href={`/service-areas/${n.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[.04]
                             px-4 py-2 text-sm text-bark-200 transition-all hover:border-white/30 hover:text-white"
                >
                  <MapPin size={13} className="text-bark-500" /> {n.name}, {n.stateCode}
                </Link>
              ))}
              <Link href="/service-areas" className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold accent-text hover:underline">
                All towns <ArrowRight size={13} />
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      <Cta
        head={`Estimate for a property in ${t.name}`}
        sub="Send the address and what you need. We look at the property first, then quote it — free, and nothing owed if you pass."
      />
    </>
  );
}
