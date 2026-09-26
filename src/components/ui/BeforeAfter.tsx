'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import type { Pair } from '@/config/gallery';
import { bild } from '@/lib/pfad';

/**
 * Vorher/Nachher NEBENEINANDER, nicht uebereinander.
 *
 * Ein Wischregler setzt voraus, dass beide Aufnahmen denselben Bildausschnitt
 * haben. Diese Fotos sind aus der Hand an verschiedenen Tagen entstanden, die
 * Winkel weichen ab. Ein Regler wuerde also eine Deckungsgleichheit behaupten,
 * die es nicht gibt, und beim Ziehen springt das Bild - der Betrachter haelt
 * das fuer einen Trick. Nebeneinander ist ehrlich und liest sich sofort.
 */
export function BeforeAfter({ pair }: { pair: Pair }) {
  const still = useReducedMotion();

  const Frame = ({
    src, alt, label, tone, delay,
  }: { src: string; alt: string; label: string; tone: 'before' | 'after'; delay: number }) => (
    <motion.figure
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30"
      initial={still ? false : { opacity: 0, y: 24 }}
      whileInView={still ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .6, delay, ease: [.22, .9, .3, 1] }}
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={bild(`${src}.jpg`)}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className={`object-cover transition-transform duration-[900ms] group-hover:scale-[1.04] ${
            tone === 'before' ? 'saturate-[.72]' : ''
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      </div>
      <figcaption
        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[.14em] ${
          tone === 'before'
            ? 'bg-black/65 text-bark-200 backdrop-blur'
            : 'text-white shadow-lg'
        }`}
        style={tone === 'after' ? { backgroundColor: 'rgb(var(--accent))' } : undefined}
      >
        {label}
      </figcaption>
    </motion.figure>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Frame src={pair.before} alt={pair.beforeAlt} label="Before" tone="before" delay={0} />
        <Frame src={pair.after} alt={pair.afterAlt} label="After" tone="after" delay={.12} />
      </div>
      <div className="mt-4">
        <h3 className="font-display text-xl font-semibold text-white">{pair.title}</h3>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-bark-300">{pair.note}</p>
      </div>
    </div>
  );
}
