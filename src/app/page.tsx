import { Verweis as Link } from '@/components/ui/Verweis';
import Image from 'next/image';
import { ArrowRight, CalendarCheck, MapPin, Truck, Users } from 'lucide-react';
import { Hero } from '@/components/site/Hero';
import { ServiceGrid } from '@/components/site/ServiceGrid';
import { Cta } from '@/components/site/Cta';
import { Reveal } from '@/components/ui/Reveal';
import { BeforeAfter } from '@/components/ui/BeforeAfter';
import { Faq } from '@/components/ui/Faq';
import { FaqLD } from '@/components/seo/JsonLd';
import { PAIRS } from '@/config/gallery';
import { ARBEITSWEISEN } from '@/config/arbeitsweisen';
import { REGION, STATE_CODE, TOWN_COUNT, TOWNS, UMLAND_HINWEIS } from '@/config/towns';
import { BUSINESS } from '@/config/business';
import { bild } from '@/lib/pfad';

/**
 * Die Fragen, die Leute wirklich stellen - und zwar so formuliert, wie sie in
 * ein Suchfeld oder in ChatGPT getippt werden. Sie stehen sichtbar auf der
 * Seite und im FAQ-Schema, aus dieser einen Quelle.
 */
const HOME_FAQ = [
  {
    q: `Do you do both lawn care and snow removal?`,
    a: `Yes - that is the whole point of how we are set up. The same crew that mows your lawn from spring `
      + `through fall plows your driveway in winter. You are not handing your property to a stranger in `
      + `November, and nobody has to be told twice where the septic cover is or which side the snow goes on.`,
  },
  {
    q: `What towns do you cover?`,
    a: `${TOWNS.map((t) => t.name).join(', ')} — ${UMLAND_HINWEIS}. `
      + `If you are just outside that, ask: whether we can take it depends on where the rest of the route `
      + `runs that season.`,
  },
  {
    q: `Do I have to sign up for the whole year?`,
    a: `No. Plenty of customers take lawn care only or snow only. Taking both is simpler for you and for us, `
      + `and it is the reason we can keep the same crew on a property year-round.`,
  },
  {
    q: `How much does it cost?`,
    a: `It depends on the size of the property, what is on it and how much access there is - which is why an `
      + `honest number needs a look at the place first. The estimate itself is free and there is no obligation `
      + `attached to it.`,
  },
  {
    q: `When do you switch from lawn care to snow removal?`,
    a: `The last fall cleanups run into November, and driveway markers go in before the first storm. From `
      + `there we are on winter footing until the ground thaws, then spring cleanups start the green season again.`,
  },
];

const PROOF = [
  { icon: Users, head: 'One crew, both seasons', text: 'The people who know your property in July are the ones plowing it in January.' },
  { icon: CalendarCheck, head: 'A fixed day, not a window', text: 'Green-season visits land on the same weekday so you can plan around them.' },
  { icon: Truck, head: 'Two passes in a storm', text: 'Cleared during the storm so you can get out, and again after it stops so it is finished.' },
  { icon: MapPin, head: 'A real route, not a radius', text: `We work a tight area in ${REGION}. That is why we can come back the same day.` },
];

export default function HomePage() {
  return (
    <>
      <FaqLD id="home" faq={HOME_FAQ} />
      <Hero />

      {/* Das Geschaeftsmodell in einem Abschnitt: zwei Saisons, ein Betrieb. */}
      <section className="wrap py-20 sm:py-28">
        <Reveal>
          <p className="eyebrow">How this works</p>
          <h2 className="mt-4 max-w-3xl font-display text-[clamp(1.8rem,4.4vw,3rem)] font-semibold leading-[1.1] tracking-tight text-white">
            Two seasons that could not look more different. Same crew, same property, same phone number.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-bark-300">
            Most properties around here get handed off twice a year — a mowing outfit until the leaves are
            down, then whoever answers the phone when it snows. We do both, which means nobody has to be
            shown where the sprinkler heads are, where the snow can go, or which side of the driveway drops off.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF.map((p, i) => (
            <Reveal key={p.head} delay={i * .08}>
              <div className="card h-full p-6">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: 'rgb(var(--accent) / .22)', color: 'rgb(var(--accent-soft))' }}
                >
                  <p.icon size={18} />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-white">{p.head}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bark-300">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Leistungen - wechseln mit der Saison. */}
      <section className="border-y border-white/5 bg-black/25 py-20 sm:py-28">
        <div className="wrap">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">What we do</p>
                <h2 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.6rem)] font-semibold tracking-tight text-white">
                  Services
                </h2>
              </div>
              <Link href="/services" className="btn btn-ghost !py-2.5">
                All services <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <div className="mt-10">
            <ServiceGrid />
          </div>
        </div>
      </section>

      {/* Die drei Arbeitsweisen - woertlich aus seinem eigenen Satz:
          "regular lawn maintenance, a one-time cleanup, or snow removal
          after a winter storm". */}
      <section className="wrap py-20 sm:py-24">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.7rem,4vw,2.6rem)] font-semibold leading-tight tracking-tight text-white">
            Three ways people hire us
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bark-300">
            Regular maintenance, a single cleanup, or snow after a storm. We will tell you when the cheaper
            option is the better one.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {ARBEITSWEISEN.map((a, i) => (
            <Reveal key={a.slug} delay={i * .08}>
              <Link href={`/how-we-work/${a.slug}`} className="card group block h-full p-6">
                <h3 className="font-display text-lg font-semibold text-white">{a.name}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-bark-300">{a.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold accent-text">
                  More <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Vorher/Nachher - der wichtigste Beweis in dieser Branche. */}
      <section className="wrap py-20 sm:py-28">
        <Reveal>
          <p className="eyebrow">Before and after</p>
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.7rem,4vw,2.6rem)] font-semibold leading-tight tracking-tight text-white">
            Every photo on this site is a property we worked on
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bark-300">
            No stock photography anywhere on this website. If you want to see the rest, the full set is in
            the gallery.
          </p>
        </Reveal>

        <div className="mt-12 space-y-16">
          {PAIRS.slice(0, 3).map((p) => (
            <BeforeAfter key={p.id} pair={p} />
          ))}
        </div>

        <Reveal>
          <div className="mt-12">
            <Link href="/gallery" className="btn btn-ghost">
              See the full gallery <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Einsatzgebiet - jede Stadt verlinkt auf ihre eigene Seite. */}
      <section className="border-y border-white/5 bg-black/25 py-20 sm:py-28">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Where we work</p>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.6rem)] font-semibold tracking-tight text-white">
              Serving {TOWN_COUNT} towns across {REGION}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-bark-300">
              {UMLAND_HINWEIS.replace('and ', 'Plus ')} — but the named towns are where the route
              actually runs. Keeping it tight is what makes it possible to come back the same day when a
              storm turns, instead of putting you on a list.
            </p>
          </Reveal>

          <div className="mt-10 flex flex-wrap gap-2.5">
            {TOWNS.map((t, i) => (
              <Reveal key={t.slug} delay={i * .03}>
                <Link
                  href={`/service-areas/${t.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.04]
                             px-4 py-2.5 text-sm font-medium text-bark-200 transition-all
                             hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  <MapPin size={14} className="text-bark-400 transition-colors group-hover:text-white" />
                  {t.name}
                  {t.partOf && (
                    <span className="text-[10px] uppercase tracking-wider text-bark-500">
                      in {t.partOf}
                    </span>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Fragen */}
      <section className="wrap py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <Reveal>
            <p className="eyebrow">Questions</p>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.6rem)] font-semibold leading-tight tracking-tight text-white">
              The things people ask before they call
            </h2>
            <div className="relative mt-8 hidden aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 lg:block">
              <Image
                src={bild('snow-deep-cleared-day.jpg')}
                alt="Driveway and walkway cut clean through deep snow with squared banks"
                fill
                sizes="40vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={.1}>
            <Faq items={HOME_FAQ} />
          </Reveal>
        </div>
      </section>

      <Cta
        head={`Get a free estimate for your property`}
        sub={`Tell us the address and what you are looking for. We will look at the property and come back `
          + `with a number — no charge, and nothing owed if you pass.${
            BUSINESS.contact.phone ? '' : ' (Phone number goes here once it is set.)'}`}
      />
    </>
  );
}
