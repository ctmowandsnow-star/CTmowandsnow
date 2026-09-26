import type { Metadata } from 'next';
import Image from 'next/image';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { BUSINESS } from '@/config/business';
import { TOWNS, REGION, STATE, TOWN_COUNT } from '@/config/towns';
import { QuoteForm } from '@/components/site/QuoteForm';
import { Reveal } from '@/components/ui/Reveal';
import { BreadcrumbLD } from '@/components/seo/JsonLd';
import { canonical, ROBOTS } from '@/lib/seo';
import { bild } from '@/lib/pfad';

export const metadata: Metadata = {
  title: 'Contact & Free Estimate',
  description:
    `Request a free estimate for lawn care or snow removal in ${TOWNS.map((t) => t.name).slice(0, 4).join(', ')} `
    + `and surrounding areas in ${REGION}.`,
  robots: ROBOTS,
  alternates: canonical('/contact'),
};

export default function ContactPage() {
  const hatKontakt = !!BUSINESS.contact.phone || !!BUSINESS.contact.email;
  return (
    <>
      <BreadcrumbLD trail={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />

      <header className="wrap pb-10 pt-36">
        <Reveal>
          <p className="eyebrow">Free estimate</p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-white">
            Tell us about the property
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-bark-200">
            We look at a property before quoting it. The estimate is free, and there is nothing owed if you
            decide against it.
          </p>
        </Reveal>
      </header>

      <section className="wrap grid gap-12 pb-20 lg:grid-cols-[1.05fr_.95fr]">
        <Reveal>
          <QuoteForm />
        </Reveal>

        <Reveal delay={.1}>
          <div className="space-y-5">
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-white">Reach us directly</h2>
              <div className="mt-4 space-y-3 text-sm">
                {BUSINESS.contact.phone ? (
                  <a href={`tel:${BUSINESS.contact.phone}`} className="flex items-center gap-2.5 text-bark-200 hover:text-white">
                    <Phone size={15} className="text-bark-500" /> {BUSINESS.contact.phoneDisplay}
                  </a>
                ) : null}
                {BUSINESS.contact.email ? (
                  <a href={`mailto:${BUSINESS.contact.email}`} className="flex items-center gap-2.5 text-bark-200 hover:text-white">
                    <Mail size={15} className="text-bark-500" /> {BUSINESS.contact.email}
                  </a>
                ) : null}
                {!hatKontakt && (
                  <p className="text-amber-200/85">
                    Phone number and email address are not set yet — they go in as soon as they are confirmed.
                  </p>
                )}
                <p className="flex items-center gap-2.5 text-bark-200">
                  <MapPin size={15} className="text-bark-500" />
                  {BUSINESS.contact.city
                    ? `${BUSINESS.contact.city}, ${BUSINESS.contact.state}`
                    : `${TOWN_COUNT} towns across ${REGION}`}
                </p>
                <p className="flex items-start gap-2.5 text-bark-200">
                  <Clock size={15} className="mt-0.5 shrink-0 text-bark-500" />
                  <span>
                    {BUSINESS.hours.regular}
                    <span className="block text-bark-400">{BUSINESS.hours.stormNote}</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={bild('entry-walk-after.jpg')}
                alt="Paver entry court with shaped plantings and a clean gravel bed"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
