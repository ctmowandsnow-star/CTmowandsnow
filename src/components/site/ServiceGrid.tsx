'use client';

import Image from 'next/image';
import { Verweis as Link } from '@/components/ui/Verweis';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useSeason } from '@/components/ui/SeasonProvider';
import { GREEN_SERVICES, SNOW_SERVICES } from '@/config/services';
import { bild } from '@/lib/pfad';

/** Die Kachelliste wechselt mit der Saison - dieselbe Umschaltung wie im Hero. */
export function ServiceGrid() {
  const { season } = useSeason();
  const list = season === 'green' ? GREEN_SERVICES : SNOW_SERVICES;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={season}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: .3 }}
      >
        {list.map((s, i) => (
          <motion.div
            key={s.slug}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .45, delay: i * .06, ease: [.22, .9, .3, 1] }}
          >
            <Link href={`/services/${s.slug}`} className="card group block h-full overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={bild(`${s.image}-sm.jpg`)}
                  alt={s.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bark-950 via-bark-950/20 to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold leading-snug text-white">{s.name}</h3>
                  <ArrowUpRight
                    size={18}
                    className="mt-1 shrink-0 text-bark-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                  />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-bark-300">{s.summary}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
