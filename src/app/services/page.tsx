import type { Metadata } from 'next';
import Image from 'next/image';
import { Verweis as Link } from '@/components/ui/Verweis';
import { ArrowRight, Leaf, Snowflake } from 'lucide-react';
import { GREEN_SERVICES, SNOW_SERVICES, type Service } from '@/config/services';
import { TOWNS, TOWN_COUNT, REGION } from '@/config/towns';
import { Reveal } from '@/components/ui/Reveal';
import { Cta } from '@/components/site/Cta';
import { BreadcrumbLD, SeiteLD } from '@/components/seo/JsonLd';
import { beschreibung, canonical, ROBOTS, titel } from '@/lib/seo';
import { bild } from '@/lib/pfad';

const TITEL = 'Lawn Care & Snow Removal Services';
const BESCHREIBUNG = beschreibung(
  `Everything we do, in both seasons: mowing, mulch and bed edging, spring and fall cleanups, shrub work, `
    + `driveway plowing, walkway clearing and ice control across ${REGION}.`,
  `Mowing, mulch, cleanups and shrub work spring through fall; driveway plowing, walkways and ice control `
    + `all winter, across ${REGION}.`,
);

export const metadata: Metadata = {
  title: titel(TITEL),
  description: BESCHREIBUNG,
  robots: ROBOTS,
  alternates: canonical('/services'),
};

function Block({ title, note, list, icon: Icon }: {
  title: string; note: string; list: Service[]; icon: typeof Leaf;
}) {
  return (
    <section className="wrap py-14">
      <Reveal>
        <div className="flex items-center gap-3">
          <span
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{ backgroundColor: 'rgb(var(--accent) / .18)', color: 'rgb(var(--accent-soft))' }}
          >
            <Icon size={17} />
          </span>
          <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-bark-300">{note}</p>
      </Reveal>

      <div className="mt-9 space-y-5">
        {list.map((s, i) => (
          <Reveal key={s.slug} delay={i * .06}>
            <Link
              href={`/services/${s.slug}`}
              className="card group grid items-stretch gap-0 overflow-hidden sm:grid-cols-[minmax(0,260px)_1fr]"
            >
              <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[190px]">
                <Image
                  src={bild(`${s.image}-sm.jpg`)}
                  alt={s.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, 260px"
                  className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-white">{s.name}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-bark-300">{s.answer}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold accent-text">
                  What is included
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      <SeiteLD typ="CollectionPage" pfad="/services" name={TITEL} beschreibung={BESCHREIBUNG} />
      <BreadcrumbLD trail={[{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]} />
      <header className="wrap pb-6 pt-36">
        <Reveal>
          <p className="eyebrow">Services</p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-white">
            Everything a property needs, in both halves of the year
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-bark-200">
            We work a fixed route across {TOWN_COUNT} towns in {REGION}. Take one service, take
            the season, or take the whole year — the crew is the same either way.
          </p>
        </Reveal>
      </header>

      <Block
        icon={Leaf}
        title="Green season"
        note="April through November, give or take the weather. This is the recurring work — the part that keeps a property from ever needing a rescue."
        list={GREEN_SERVICES}
      />
      <Block
        icon={Snowflake}
        title="Winter"
        note="December through March. Seasonal route customers are cleared automatically — no call needed when it starts snowing."
        list={SNOW_SERVICES}
      />
      <Cta />
    </>
  );
}
