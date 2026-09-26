import { Verweis as Link } from '@/components/ui/Verweis';
import { ArrowRight, Phone } from 'lucide-react';
import { BUSINESS } from '@/config/business';
import { Reveal } from '@/components/ui/Reveal';

export function Cta({
  head = 'Want a number on it?',
  sub = 'Send the address and what you need. We look at the property, then quote it — no charge for the estimate.',
}: { head?: string; sub?: string }) {
  return (
    <section className="wrap py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 p-9 sm:p-14">
          <div
            className="absolute inset-0 -z-10 opacity-[.17]"
            style={{ background: 'radial-gradient(60% 120% at 15% 0%, rgb(var(--accent)) 0%, transparent 70%)' }}
          />
          <h2 className="max-w-2xl font-display text-[clamp(1.7rem,4vw,2.6rem)] font-semibold leading-tight text-white">
            {head}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-bark-300">{sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-primary">
              Request an estimate <ArrowRight size={16} />
            </Link>
            {BUSINESS.contact.phone && (
              <a href={`tel:${BUSINESS.contact.phone}`} className="btn btn-ghost">
                <Phone size={15} /> {BUSINESS.contact.phoneDisplay}
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
