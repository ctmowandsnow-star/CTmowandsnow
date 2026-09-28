import Image from 'next/image';
import { bild } from '@/lib/pfad';
import { Verweis as Link } from '@/components/ui/Verweis';
import { Mail, MapPin, Phone } from 'lucide-react';
import { BUSINESS, ZEITEN_SICHTBAR } from '@/config/business';
import { GREEN_SERVICES, SNOW_SERVICES } from '@/config/services';
import { ARBEITSWEISEN } from '@/config/arbeitsweisen';
import { TOWNS, REGION, STATE_CODE, TOWN_COUNT } from '@/config/towns';

export function Footer() {
  const jahr = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="flex items-center gap-3 font-display text-xl font-semibold text-white">
            <Image src={bild('logo-emblem.png')} alt="" width={44} height={44} className="h-11 w-11" />
            {BUSINESS.name}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-bark-300">{BUSINESS.tagline}</p>
          <div className="mt-5 space-y-2 text-sm text-bark-300">
            {BUSINESS.contact.phone && (
              <a href={`tel:${BUSINESS.contact.phone}`} className="flex items-center gap-2 hover:text-white">
                <Phone size={14} /> {BUSINESS.contact.phoneDisplay}
              </a>
            )}
            {BUSINESS.contact.email && (
              <a href={`mailto:${BUSINESS.contact.email}`} className="flex items-center gap-2 hover:text-white">
                <Mail size={14} /> {BUSINESS.contact.email}
              </a>
            )}
            <p className="flex items-center gap-2">
              <MapPin size={14} />
              {BUSINESS.contact.city
                ? `${BUSINESS.contact.city}, ${BUSINESS.contact.state}`
                : `Serving ${TOWN_COUNT} towns in ${REGION}`}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Green Season</p>
          <ul className="mt-4 space-y-2.5">
            {GREEN_SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="text-sm text-bark-300 hover:text-white">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Winter</p>
          <ul className="mt-4 space-y-2.5">
            {SNOW_SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="text-sm text-bark-300 hover:text-white">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Ways to Work With Us</p>
          <ul className="mt-4 space-y-2.5">
            {ARBEITSWEISEN.map((a) => (
              <li key={a.slug}>
                <Link href={`/how-we-work/${a.slug}`} className="text-sm text-bark-300 hover:text-white">
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Service Area</p>
          <ul className="mt-4 space-y-2.5">
            {TOWNS.map((t) => (
              <li key={t.slug}>
                <Link href={`/service-areas/${t.slug}`} className="text-sm text-bark-300 hover:text-white">
                  {t.name}, {t.stateCode}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/service-areas" className="text-sm font-medium accent-text hover:underline">
                All towns we cover
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="wrap flex flex-col gap-2 py-5 text-xs text-bark-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {jahr} {BUSINESS.name}. All rights reserved.</p>
          {ZEITEN_SICHTBAR && <p>{BUSINESS.hours.regular} · {BUSINESS.hours.stormNote}</p>}
        </div>
      </div>
    </footer>
  );
}
