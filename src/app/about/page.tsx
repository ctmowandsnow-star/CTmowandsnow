import type { Metadata } from 'next';
import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import { Cta } from '@/components/site/Cta';
import { BreadcrumbLD } from '@/components/seo/JsonLd';
import { BUSINESS } from '@/config/business';
import { TOWN_COUNT, COUNTY, REGION, STATE, UMLAND_HINWEIS } from '@/config/towns';
import { canonical, ROBOTS } from '@/lib/seo';
import { bild } from '@/lib/pfad';

export const metadata: Metadata = {
  title: 'About',
  description:
    `${BUSINESS.name} is a local lawn care and snow removal business working ${COUNTY}, ${STATE}. `
    + `Same crew year-round, a tight route, and free estimates.`,
  robots: ROBOTS,
  alternates: canonical('/about'),
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbLD trail={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />

      <header className="wrap pb-10 pt-36">
        <Reveal>
          <p className="eyebrow">About</p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-white">
            A small outfit that does both halves of the year
          </h1>
        </Reveal>
      </header>

      <section className="wrap grid gap-12 pb-16 lg:grid-cols-[1.05fr_.95fr]">
        <Reveal>
          <div className="space-y-5 text-[15px] leading-relaxed text-bark-200">
            <p>
              {BUSINESS.name} maintains residential properties across {COUNTY}. In the
              green season that means mowing, beds, mulch, trimming and cleanups. Once the ground freezes it
              means driveways, walkways and ice.
            </p>
            <p>
              We are deliberately not a large company. The route covers {TOWN_COUNT} towns {UMLAND_HINWEIS},
              and keeping it that tight is on purpose — it is the only way to come back the same day when a
              storm turns, or to hold a fixed mowing day through a wet June.
            </p>
            <p>
              The reason we do both seasons is simpler than it sounds: a property is easier to look after when
              the same people see it all year. Where the snow can go, which side of the driveway drops off,
              where the irrigation heads sit — that knowledge does not survive a handoff every November.
            </p>
            <p>
              Estimates are free. We look at a property before quoting it, because a number given over the
              phone without seeing the place is a number someone is going to be unhappy about later.
            </p>
          </div>
        </Reveal>

        <Reveal delay={.1}>
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={bild('property-full-after.jpg')}
                alt="A maintained single-family property with cut lawn and fresh beds"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={bild('snow-plow-truck-view2.jpg')}
                alt="View from the truck cab over the plow during a storm"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>
      </section>

      <Cta />
    </>
  );
}
