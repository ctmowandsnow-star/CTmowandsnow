import type { Metadata } from 'next';
import Image from 'next/image';
import { Verweis as Link } from '@/components/ui/Verweis';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, MapPin, X } from 'lucide-react';
import { ARBEITSWEISEN, arbeitsweiseBySlug, type Arbeitsweise } from '@/config/arbeitsweisen';
import { SERVICES, GREEN_SERVICES, SNOW_SERVICES } from '@/config/services';
import { TOWNS, REGION } from '@/config/towns';
import { BUSINESS } from '@/config/business';
import { Reveal } from '@/components/ui/Reveal';
import { Faq } from '@/components/ui/Faq';
import { Crumbs } from '@/components/site/Crumbs';
import { Cta } from '@/components/site/Cta';
import { BreadcrumbLD, FaqLD, SeiteLD } from '@/components/seo/JsonLd';
import { beschreibung, canonical, ORTE_KURZ, ROBOTS, titel } from '@/lib/seo';
import { bild } from '@/lib/pfad';

export const dynamicParams = false;
export function generateStaticParams() {
  return ARBEITSWEISEN.map((a) => ({ slug: a.slug }));
}

function texte(a: Arbeitsweise) {
  const ersterSatz = `${a.answer.split('. ')[0]}.`;
  return {
    titel: a.name,
    beschreibung: beschreibung(
      `${ersterSatz} Across ${REGION} — ${TOWNS.map((t) => t.name).slice(0, 4).join(', ')} and surrounding areas.`,
      `${ersterSatz} Serving ${ORTE_KURZ} and nearby towns.`,
      `${ersterSatz} Free estimates.`,
      `${a.summary} Free estimates across ${REGION}.`,
    ),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = arbeitsweiseBySlug.get(slug);
  if (!a) return {};
  const t = texte(a);
  return {
    title: titel(t.titel),
    description: t.beschreibung,
    robots: ROBOTS,
    alternates: canonical(`/how-we-work/${a.slug}`),
    openGraph: {
      title: `${a.name} — ${BUSINESS.name}`,
      description: a.summary,
      images: [{ url: `/images/${a.image}.jpg`, alt: a.imageAlt }],
    },
  };
}

export default async function ArbeitsweiseSeite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = arbeitsweiseBySlug.get(slug);
  if (!a) notFound();
  const andere = ARBEITSWEISEN.filter((x) => x.slug !== a.slug);
  // Welche Leistungen zu dieser Arbeitsweise gehoeren - das Schneegeschaeft
  // zur Sturm-Arbeitsweise, die gruenen Leistungen zu den anderen beiden.
  const passende = a.slug === 'storm-service' ? SNOW_SERVICES : GREEN_SERVICES;
  const spur = [
    { name: 'Home', path: '/' },
    { name: 'Ways to Work With Us', path: '/how-we-work' },
    { name: a.name, path: `/how-we-work/${a.slug}` },
  ];

  const text = texte(a);

  return (
    <>
      <SeiteLD pfad={`/how-we-work/${a.slug}`} name={text.titel} beschreibung={text.beschreibung} />
      <FaqLD id={`arbeitsweise-${a.slug}`} faq={a.faq} />
      <BreadcrumbLD trail={spur} />

      <header className="relative isolate overflow-hidden pb-12 pt-32">
        <div className="absolute inset-0 -z-10">
          <Image src={bild(`${a.image}.jpg`)} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-bark-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-bark-950/80 via-bark-950/55 to-bark-950" />
        </div>
        <div className="wrap">
          <Crumbs trail={spur} />
          <Reveal>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(1.9rem,4.6vw,3.2rem)] font-semibold leading-[1.07] tracking-tight text-white">
              {a.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bark-100">{a.answer}</p>
          </Reveal>
        </div>
      </header>

      {/* Wofuer es passt - und wofuer nicht. Der zweite Teil ist der, der
          Vertrauen erzeugt: ein Betrieb, der abraet, wenn die guenstigere
          Variante die richtige ist, wird eher gebucht. */}
      <section className="wrap grid gap-6 py-12 lg:grid-cols-[1.15fr_.85fr]">
        <Reveal>
          <div className="card h-full p-6">
            <h2 className="font-display text-xl font-semibold text-white">This is the right one if</h2>
            <ul className="mt-5 space-y-3.5">
              {a.passt.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                        style={{ backgroundColor: 'rgb(var(--accent) / .2)', color: 'rgb(var(--accent-soft))' }}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[15px] leading-relaxed text-bark-200">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={.08}>
          <div className="card h-full p-6">
            <h2 className="font-display text-xl font-semibold text-white">When it is not</h2>
            <div className="mt-5 flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10 text-bark-300">
                <X size={12} strokeWidth={3} />
              </span>
              <p className="text-[15px] leading-relaxed text-bark-200">{a.passtNicht}</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-white/5 bg-black/25 py-12">
        <div className="wrap">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-white">What that covers</h2>
          </Reveal>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {passende.map((s, i) => (
              <Reveal key={s.slug} delay={i * .05}>
                <Link href={`/services/${s.slug}`} className="card group block h-full p-5">
                  <h3 className="font-display text-base font-semibold text-white">{s.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-bark-300">{s.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold accent-text">
                    Details <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-12">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-white">Questions</h2>
          </Reveal>
          <Reveal delay={.08}><Faq items={a.faq} /></Reveal>
        </div>
      </section>

      <section className="wrap pb-6">
        <Reveal>
          <h2 className="font-display text-xl font-semibold text-white">Available in every town on the route</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {TOWNS.map((t) => (
              <Link key={t.slug} href={`/service-areas/${t.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[.04] px-3.5 py-2 text-sm text-bark-200 transition-all hover:border-white/30 hover:text-white">
                <MapPin size={13} className="text-bark-500" /> {t.name}, {t.stateCode}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="wrap py-10">
        <Reveal>
          <h2 className="font-display text-xl font-semibold text-white">The other two ways</h2>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {andere.map((o, i) => (
            <Reveal key={o.slug} delay={i * .06}>
              <Link href={`/how-we-work/${o.slug}`} className="card group block h-full p-5">
                <h3 className="font-display text-base font-semibold text-white">{o.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bark-300">{o.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold accent-text">
                  Compare <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <Cta />
    </>
  );
}
