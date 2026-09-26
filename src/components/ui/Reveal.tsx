'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Ein Abschnitt, der beim Hereinscrollen erscheint.
 * `once` ist Absicht: etwas, das bei jedem Vorbeiscrollen neu aufblendet,
 * wird nach dem dritten Mal zur Stoerung.
 */
export function Reveal({
  children, delay = 0, y = 22, className,
}: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const still = useReducedMotion();
  if (still) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .65, delay, ease: [.22, .9, .3, 1] }}
    >
      {children}
    </motion.div>
  );
}
