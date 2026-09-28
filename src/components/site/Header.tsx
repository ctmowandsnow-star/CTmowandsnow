'use client';

import { Verweis as Link } from '@/components/ui/Verweis';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { bild } from '@/lib/pfad';
import { Menu, X, Phone, Snowflake, Leaf } from 'lucide-react';
import { BUSINESS } from '@/config/business';
import { useSeason } from '@/components/ui/SeasonProvider';

const NAV = [
  { href: '/services', label: 'Services' },
  { href: '/how-we-work', label: 'How It Works' },
  { href: '/gallery', label: 'Our Work' },
  { href: '/service-areas', label: 'Service Area' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { season, toggle } = useSeason();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Menue offen = Seite darf nicht mitscrollen.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-[var(--draft-h)] z-50 transition-all duration-500 ${
        solid ? 'border-b border-white/10 bg-bark-950/85 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="wrap flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          {/* Sein Logo (Mail 26.09.2026). Nur das runde Emblem: die Schrift im
              Logo ist dunkel und waere auf der dunklen Kopfzeile unsichtbar -
              der Name steht daneben als Text. Gras und Schneeflocke stecken
              beide im Emblem, deshalb kein Saisonwechsel mehr noetig. */}
          <Image
            src={bild('logo-emblem.png')}
            alt=""
            width={40}
            height={40}
            priority
            className="h-10 w-10 transition-transform duration-500 group-hover:rotate-12"
          />
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            <span className="sm:hidden">{BUSINESS.shortName}</span>
            <span className="hidden sm:inline">{BUSINESS.name}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="relative text-sm font-medium text-bark-200 transition-colors hover:text-white
                         after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-current
                         after:transition-all after:duration-300 hover:after:w-full"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={season === 'green' ? 'Show winter services' : 'Show green season services'}
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2
                       text-xs font-semibold text-white transition-all hover:border-white/35 sm:inline-flex"
          >
            {season === 'green' ? <Snowflake size={14} /> : <Leaf size={14} />}
            {season === 'green' ? 'Winter' : 'Green season'}
          </button>

          {BUSINESS.contact.phone ? (
            <a href={`tel:${BUSINESS.contact.phone}`} className="btn btn-primary !px-5 !py-2.5">
              <Phone size={15} />
              <span className="hidden sm:inline">{BUSINESS.contact.phoneDisplay}</span>
              <span className="sm:hidden">Call</span>
            </a>
          ) : (
            <Link href="/contact" className="btn btn-primary whitespace-nowrap !px-4 !py-2.5 !text-[13px] sm:!px-5 sm:!text-sm">
              <span className="hidden sm:inline">Get a Quote</span>
              <span className="sm:hidden">Quote</span>
            </Link>
          )}

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-bark-950/95 backdrop-blur-xl lg:hidden">
          <nav className="wrap flex flex-col py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/5 py-3.5 text-base font-medium text-bark-100 last:border-0"
              >
                {n.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => { toggle(); setOpen(false); }}
              className="mt-3 inline-flex items-center gap-2 self-start rounded-full border border-white/15
                         px-4 py-2 text-sm font-semibold text-white"
            >
              {season === 'green' ? <Snowflake size={14} /> : <Leaf size={14} />}
              Switch to {season === 'green' ? 'winter' : 'green season'}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
