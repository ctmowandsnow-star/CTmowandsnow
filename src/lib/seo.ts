import type { Metadata } from 'next';
import { BUSINESS } from '@/config/business';

/**
 * Solange die Seite ein Entwurf mit Platzhalter-Stammdaten ist, darf sie nicht
 * in einen Index rutschen. Ein halbfertiger Eintrag mit falschem Firmennamen
 * ist spaeter schwerer loszuwerden als gar keiner.
 */
export const ROBOTS: Metadata['robots'] = BUSINESS.istEntwurf
  ? { index: false, follow: false }
  : { index: true, follow: true };

export function canonical(path: string): Metadata['alternates'] {
  return { canonical: `${BUSINESS.url}${path}` };
}
