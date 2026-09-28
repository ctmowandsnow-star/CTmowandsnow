'use client';

import Image from 'next/image';
import { Verweis as Link } from '@/components/ui/Verweis';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Leaf, Snowflake } from 'lucide-react';
import { useRef } from 'react';
import { useSeason } from '@/components/ui/SeasonProvider';
import { TOWNS, REGION, STATE_CODE } from '@/config/towns';
import { BUSINESS } from '@/config/business';
import { bild, video } from '@/lib/pfad';

/**
 * Ueberschrift und Text hat der Inhaber selbst vorgegeben (Mail an Niclas,
 * 26.09.2026: "for number one put this ... for number two put this").
 * Sie gelten fuer BEIDE Saisons - sonst waere seine Ueberschrift ab Dezember,
 * wenn die Seite im Winter startet, gar nicht mehr zu sehen. Die Zeile spiegelt
 * den Claim in seinem Logo ("Professional Care. Year-Round.").
 * Der Saison-Umschalter wechselt weiter Kulisse, Zeile darueber und Knopf.
 */
const KOPF = {
  head: 'Professional care.',
  headAccent: 'Year-round.',
  sub:
    'Reliable property care throughout every season. From weekly lawn maintenance and landscape '
    + 'cleanups to mulching, trimming, and winter snow services, we keep your property looking its '
    + 'best year-round.',
} as const;

const COPY = {
  green: {
    eyebrow: 'Spring · Summer · Fall',
    ...KOPF,
    cta: 'Get a lawn quote',
  },
  snow: {
    eyebrow: 'December · January · February · March',
    ...KOPF,
    cta: 'Get on the snow route',
  },
} as const;

export function Hero() {
  const { season, setSeason } = useSeason();
  const still = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Sanfter Parallax: der Hintergrund laeuft langsamer als der Text.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const fgY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const fade = useTransform(scrollYProgress, [0, .75], [1, 0]);

  const c = COPY[season];

  return (
    <section ref={ref} className="relative isolate flex min-h-[92svh] items-center overflow-hidden">
      {/* Hintergrund: im Winter das Pflugvideo, in der gruenen Saison ein Foto.
          Beide sind echtes Material des Betriebs. */}
      <motion.div className="absolute inset-0 -z-10" style={still ? undefined : { y: bgY }}>
        <AnimatePresence mode="sync">
          {season === 'snow' ? (
            <motion.div
              key="snow-bg"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: .8 }}
            >
              <video
                className="h-full w-full object-cover"
                src={video('plowing.mp4')}
                poster={video('plowing-poster.jpg')}
                autoPlay
                muted
                loop
                playsInline
                // Kein Ton, keine Bedienelemente: das ist Kulisse, kein Inhalt.
                aria-hidden="true"
              />
            </motion.div>
          ) : (
            <motion.div
              key="green-bg"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: .8 }}
            >
              <Image
                src={bild('property-full-after.jpg')}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Abdunklung DORT, wo der Text steht - nicht flaechendeckend.
            Eine gleichmaessige Abdunklung macht entweder das Foto unkenntlich
            oder laesst den Flisstext auf heller Hausfassade durchfallen.
            Gemessen mit pruefungen/kontrast.mjs (WCAG AA, 4.5:1 fuer den
            Flisstext); die Werte in den Klassen sind das Ergebnis dieser
            Messung, nicht Augenmass.
            Auf dem Handy laeuft der Text ueber die volle Breite - dort ist
            der Verlauf senkrecht und kraeftiger, weil es rechts kein freies
            Bild zu bewahren gibt. */}
        <div className="absolute inset-0 bg-bark-950/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-bark-950/70 via-transparent to-bark-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-bark-950/70 via-bark-950/75 to-bark-950 sm:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-bark-950/90 via-bark-950/55 to-transparent sm:block" />
      </motion.div>

      <motion.div className="wrap pt-28" style={still ? undefined : { y: fgY, opacity: fade }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={season}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: .45, ease: [.22, .9, .3, 1] }}
          >
            <p className="eyebrow">{c.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.4rem,7vw,4.6rem)] font-semibold leading-[1.02] tracking-tight text-white">
              {c.head}{' '}
              <span className="relative inline-block">
                <span className="relative z-10 accent-text">{c.headAccent}</span>
                <motion.span
                  className="absolute inset-x-0 bottom-1 -z-0 h-[.28em] origin-left rounded"
                  style={{ backgroundColor: 'rgb(var(--accent) / .32)' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: .7, delay: .25, ease: [.22, .9, .3, 1] }}
                />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-bark-100 sm:text-lg">{c.sub}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/contact" className="btn btn-primary">
            {c.cta} <ArrowRight size={16} />
          </Link>
          <Link href="/gallery" className="btn btn-ghost">See our work</Link>
        </div>

        {/* Der Umschalter erklaert das Geschaeftsmodell schneller als ein Absatz:
            zwei Saisons, ein Betrieb. */}
        <div className="mt-12 inline-flex rounded-full border border-white/15 bg-black/35 p-1 backdrop-blur">
          {(['green', 'snow'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeason(s)}
              aria-pressed={season === s}
              className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                season === s ? 'text-white' : 'text-bark-300 hover:text-white'
              }`}
            >
              {season === s && (
                <motion.span
                  layoutId="season-pill"
                  className="absolute inset-0 -z-10 rounded-full"
                  style={{ backgroundColor: 'rgb(var(--accent))' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {s === 'green' ? <Leaf size={15} /> : <Snowflake size={15} />}
              {s === 'green' ? 'Green season' : 'Winter'}
            </button>
          ))}
        </div>

        <p className="mt-8 font-display text-base font-semibold tracking-tight text-white/90">
          {BUSINESS.claim}
        </p>
        <p className="mt-3 text-xs uppercase tracking-[.16em] text-bark-400">
          {TOWNS.map((t) => t.name).join(' · ')} · {STATE_CODE}
        </p>
      </motion.div>
    </section>
  );
}
