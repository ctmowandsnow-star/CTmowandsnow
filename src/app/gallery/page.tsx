import type { Metadata } from 'next';
import Image from 'next/image';
import { PAIRS, GREEN_SHOWCASE, SNOW_SHOWCASE } from '@/config/gallery';
import { BeforeAfter } from '@/components/ui/BeforeAfter';
import { Reveal } from '@/components/ui/Reveal';
import { Cta } from '@/components/site/Cta';
import { BreadcrumbLD } from '@/components/seo/JsonLd';
import { canonical, ROBOTS } from '@/lib/seo';
import { bild } from '@/lib/pfad';

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'Before and after photos from properties we maintain — mowing, mulch and bed work in the green season, '
    + 'plowed driveways and cleared walkways in winter. Every photo is our own.',
  robots: ROBOTS,
  alternates: canonical('/gallery'),
};

function Tiles({ items }: { items: typeof GREEN_SHOWCASE }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s, i) => (
        <Reveal key={s.image} delay={(i % 3) * .07}>
          <figure className="group overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <div className="relative aspect-[4/3]">
              <Image
                src={bild(`${s.image}-sm.jpg`)}
                alt={s.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
              />
            </div>
            <figcaption className="px-4 py-3 text-sm text-bark-300">{s.caption}</figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <>
      <BreadcrumbLD trail={[{ name: 'Home', path: '/' }, { name: 'Our Work', path: '/gallery' }]} />

      <header className="wrap pb-10 pt-36">
        <Reveal>
          <p className="eyebrow">Our work</p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-white">
            Properties we actually worked on
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-bark-200">
            Every photo below was taken on a job. There is no stock photography anywhere on this website —
            if a picture is here, we did the work in it.
          </p>
        </Reveal>
      </header>

      <section className="wrap py-10">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-white">Before and after</h2>
        </Reveal>
        <div className="mt-10 space-y-16">
          {PAIRS.map((p) => <BeforeAfter key={p.id} pair={p} />)}
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/25 py-16">
        <div className="wrap">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-white">Green season</h2>
            <p className="mt-2 text-sm text-bark-300">Mowing, beds, cleanups and shrub work.</p>
          </Reveal>
          <Tiles items={GREEN_SHOWCASE} />
        </div>
      </section>

      <section className="wrap py-16">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-white">Winter</h2>
          <p className="mt-2 text-sm text-bark-300">
            Most of these were taken at night or mid-storm, because that is when the work happens.
          </p>
        </Reveal>
        <Tiles items={SNOW_SHOWCASE} />
      </section>

      <Cta />
    </>
  );
}
