import type { Metadata } from 'next';
import Image from 'next/image';
import { Verweis as Link } from '@/components/ui/Verweis';
import { ArrowRight, Check, X } from 'lucide-react';
import { ARBEITSWEISEN } from '@/config/arbeitsweisen';
import { TOWNS, REGION } from '@/config/towns';
import { Reveal } from '@/components/ui/Reveal';
import { Crumbs } from '@/components/site/Crumbs';
import { Cta } from '@/components/site/Cta';
import { BreadcrumbLD } from '@/components/seo/JsonLd';
import { canonical, ROBOTS } from '@/lib/seo';
import { bild } from '@/lib/pfad';

export const metadata: Metadata = {
  title: 'Ways to Work With Us',
  description:
    `Regular maintenance on a fixed day, a one-time cleanup, or snow after a storm — three ways to work `
    + `with us across ${REGION}. Free estimates either way.`,
  robots: ROBOTS,
  alternates: canonical('/how-we-work'),
};

export default function ArbeitsweisenSeite() {
  const spur = [{ name: 'Home', path: '/' }, { name: 'Ways to Work With Us', path: '/how-we-work' }];
  return (
    <>
      <BreadcrumbLD trail={spur} />
      <header className="wrap pb-8 pt-32">
        <Crumbs trail={spur} />
        <Reveal>
          <p className="eyebrow mt-4">Ways to work with us</p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-white">
            Three ways people hire us
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-bark-200">
            Regular maintenance, a one-time cleanup, or snow after a storm. Which one is right depends on the
            property and on how much you want to think about it — and we will tell you when the cheaper option
            is the better one.
          </p>
        </Reveal>
      </header>

      <section className="wrap space-y-6 py-8">
        {ARBEITSWEISEN.map((a, i) => (
          <Reveal key={a.slug} delay={i * .07}>
            <Link href={`/how-we-work/${a.slug}`} className="card group grid gap-0 overflow-hidden sm:grid-cols-[minmax(0,300px)_1fr]">
              <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[230px]">
                <Image src={bild(`${a.image}-sm.jpg`)} alt={a.imageAlt} fill sizes="(max-width: 640px) 100vw, 300px"
                       className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]" />
              </div>
              <div className="p-6">
                <h2 className="font-display text-xl font-semibold text-white">{a.name}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-bark-300">{a.answer}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold accent-text">
                  Is this the right one for you?
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>

      <section className="wrap py-10">
        <Reveal>
          <h2 className="font-display text-xl font-semibold text-white">Any of them, in any town on the route</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {TOWNS.map((t) => (
              <Link key={t.slug} href={`/service-areas/${t.slug}`}
                    className="rounded-full border border-white/12 bg-white/[.04] px-3.5 py-2 text-sm text-bark-200 transition-all hover:border-white/30 hover:text-white">
                {t.name}, {t.stateCode}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
      <Cta />
    </>
  );
}
