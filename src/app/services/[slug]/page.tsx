import type { Metadata } from 'next';
import Image from 'next/image';
import { Verweis as Link } from '@/components/ui/Verweis';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import { SERVICES, serviceBySlug, type Service } from '@/config/services';
import { TOWNS, REGION, STATE_CODE } from '@/config/towns';
import { PAIRS } from '@/config/gallery';
import { Reveal } from '@/components/ui/Reveal';
import { Faq } from '@/components/ui/Faq';
import { Cta } from '@/components/site/Cta';
import { Crumbs } from '@/components/site/Crumbs';
import { BreadcrumbLD, FaqLD, SeiteLD, ServiceLD } from '@/components/seo/JsonLd';
import { beschreibung, canonical, ORTE_KURZ, ROBOTS, titel } from '@/lib/seo';
import { bild } from '@/lib/pfad';

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

/**
 * Die Kurzbeschreibung ist der erste Satz der zitierbaren Antwort - keine
 * zweite Textquelle, die vom sichtbaren Inhalt abweichen kann. Metadaten und
 * Seitenknoten lesen beide hier.
 */
function texte(s: Service) {
  const ersterSatz = `${s.answer.split('. ')[0]}.`;
  return {
    titel: s.name,
    beschreibung: beschreibung(
      `${ersterSatz} Serving ${TOWNS.map((t) => t.name).slice(0, 4).join(', ')} and surrounding areas in ${REGION}.`,
      `${ersterSatz} Serving ${ORTE_KURZ} and nearby towns.`,
      `${ersterSatz} Free estimates.`,
      `${s.summary} Free estimates across ${REGION}, ${STATE_CODE}.`,
    ),
  };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceBySlug.get(slug);
  if (!s) return {};
  const t = texte(s);
  return {
    title: titel(t.titel),
    description: t.beschreibung,
    robots: ROBOTS,
    alternates: canonical(`/services/${s.slug}`),
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = serviceBySlug.get(slug);
  if (!s) notFound();

  const related = SERVICES.filter((x) => x.season === s.season && x.slug !== s.slug).slice(0, 3);
  // Passende Vorher/Nachher-Beispiele: nur die der gleichen Saison.
  const examples = PAIRS.filter((p) => p.season === s.season).slice(0, 2);

  const text = texte(s);

  return (
    <>
      <SeiteLD pfad={`/services/${s.slug}`} name={text.titel} beschreibung={text.beschreibung} />
      <ServiceLD service={s} />
      <FaqLD id={s.slug} faq={s.faq} />
      <BreadcrumbLD
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: s.name, path: `/services/${s.slug}` },
        ]}
      />

      <header className="relative isolate overflow-hidden pb-14 pt-36">
        <div className="absolute inset-0 -z-10">
          <Image src={bild(`${s.image}.jpg`)} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-bark-950/90 via-bark-950/80 to-bark-950" />
        </div>
        <div className="wrap">
          <Crumbs trail={[
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: s.name, path: `/services/${s.slug}` },
          ]} />
          <Reveal>
            <p className="eyebrow mt-4">{s.season === 'green' ? 'Green season' : 'Winter'}</p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-white">
              {s.name}
            </h1>
            {/* Der zitierbare Absatz - bewusst als erstes und ohne Werbefloskel. */}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bark-100">{s.answer}</p>
          </Reveal>
        </div>
      </header>

      <section className="wrap grid gap-12 py-14 lg:grid-cols-[1.05fr_.95fr]">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-white">What is included</h2>
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
              alt={s.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <p className="mt-3 text-xs text-bark-400">{s.imageAlt}</p>
        </Reveal>
      </section>

      {examples.length > 0 && (
        <section className="border-y border-white/5 bg-black/25 py-16">
          <div className="wrap">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold text-white">From our own properties</h2>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {examples.map((p, i) => (
                <Reveal key={p.id} delay={i * .08}>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ src: p.before, alt: p.beforeAlt, l: 'Before' }, { src: p.after, alt: p.afterAlt, l: 'After' }].map((x) => (
                      <figure key={x.l} className="relative overflow-hidden rounded-xl border border-white/10">
                        <div className="relative aspect-[4/3]">
                          <Image src={bild(`${x.src}-sm.jpg`)} alt={x.alt} fill sizes="25vw" className="object-cover" />
                        </div>
                        <figcaption className="absolute left-2 top-2 rounded-full bg-black/65 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                          {x.l}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-bark-300">{p.title}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="wrap py-16">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-white">Questions about {s.name.toLowerCase()}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-bark-300">
              If yours is not here, ask when you call — we would rather answer it before the work than after.
            </p>
          </Reveal>
          <Reveal delay={.08}>
            <Faq items={s.faq} />
          </Reveal>
        </div>
      </section>

      <section className="wrap pb-6">
        <Reveal>
          <h2 className="font-display text-xl font-semibold text-white">
            {s.name} in your town
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {TOWNS.map((t) => (
              <Link
                key={t.slug}
                href={`/service-areas/${t.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[.04] px-3.5 py-2
                           text-sm text-bark-200 transition-all hover:border-white/30 hover:text-white"
              >
                <MapPin size={13} className="text-bark-500" />
                {t.name}, {t.stateCode}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {related.length > 0 && (
        <section className="wrap py-14">
          <Reveal>
            <h2 className="font-display text-xl font-semibold text-white">Usually booked with this</h2>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((r, i) => (
              <Reveal key={r.slug} delay={i * .06}>
                <Link href={`/services/${r.slug}`} className="card group block h-full p-5">
                  <h3 className="font-display text-base font-semibold text-white">{r.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-bark-300">{r.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold accent-text">
                    Details <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <Cta />
    </>
  );
}
