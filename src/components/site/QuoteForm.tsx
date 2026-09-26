'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Send } from 'lucide-react';
import { TOWNS } from '@/config/towns';
import { SERVICES } from '@/config/services';

/**
 * In der statischen Vorschaufassung gibt es keine API-Route - ein Absenden
 * liefe dort ins Leere und zeigte dem Betrachter einen Fehler, obwohl nichts
 * kaputt ist. Deshalb sagt das Formular dort von vornherein, was es ist.
 */
const VORSCHAU = process.env.NEXT_PUBLIC_VORSCHAU === '1';

type Zustand =
  | { art: 'ruht' }
  | { art: 'sendet' }
  | { art: 'fehler'; text: string }
  | { art: 'fertig'; delivered: boolean };

export function QuoteForm() {
  const [z, setZ] = useState<Zustand>({ art: 'ruht' });

  async function absenden(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (VORSCHAU) {
      setZ({ art: 'fertig', delivered: false });
      return;
    }
    const f = new FormData(e.currentTarget);
    setZ({ art: 'sendet' });
    try {
      const r = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(f.entries())),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setZ({ art: 'fehler', text: d.error || 'Something went wrong. Please call or email instead.' });
        return;
      }
      setZ({ art: 'fertig', delivered: !!d.delivered });
    } catch {
      setZ({ art: 'fehler', text: 'Could not reach the server. Please call or email instead.' });
    }
  }

  if (z.art === 'fertig') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/12 bg-white/[.04] p-7"
      >
        <span
          className="grid h-11 w-11 place-items-center rounded-full"
          style={{ backgroundColor: 'rgb(var(--accent) / .2)', color: 'rgb(var(--accent-soft))' }}
        >
          <Check size={20} strokeWidth={3} />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-white">Got it — thank you.</h3>
        {z.delivered ? (
          <p className="mt-2 text-sm leading-relaxed text-bark-300">
            We will look at the property and come back to you with a number. If it is urgent, calling is
            still the fastest way to reach us.
          </p>
        ) : (
          // Ehrlich bleiben, solange niemand benachrichtigt wird. Ein
          // "wir melden uns" waere hier schlicht nicht wahr.
          <p className="mt-2 text-sm leading-relaxed text-amber-200/90">
            {VORSCHAU
              ? 'This is a preview of the site — the form is not connected yet, so nothing was sent. '
                + 'It will work as soon as the contact details are in.'
              : 'Heads up: the form is not connected to an inbox yet, so no one has been notified. '
                + 'Please reach out directly until it is.'}
          </p>
        )}
      </motion.div>
    );
  }

  const busy = z.art === 'sendet';

  return (
    <form onSubmit={absenden} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-bark-200">Name *</span>
          <input name="name" required maxLength={120} className="field" placeholder="Your name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-bark-200">Phone</span>
          <input name="phone" type="tel" maxLength={40} className="field" placeholder="(000) 000-0000" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-bark-200">Email</span>
        <input name="email" type="email" maxLength={160} className="field" placeholder="you@example.com" />
      </label>
      <p className="text-xs text-bark-400">Leave a phone number or an email — whichever you prefer we use.</p>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-bark-200">Property address</span>
        <input name="address" maxLength={200} className="field" placeholder="Street address" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-bark-200">Town</span>
          <select name="town" className="field" defaultValue="">
            <option value="">Select a town</option>
            {TOWNS.map((t) => (
              <option key={t.slug} value={t.slug}>{t.name}, {t.stateCode}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-bark-200">What do you need?</span>
          <select name="service" className="field" defaultValue="">
            <option value="">Select a service</option>
            {SERVICES.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-bark-200">Anything we should know?</span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          className="field resize-y"
          placeholder="Size of the lot, gates, slopes, where the snow can go — whatever matters."
        />
      </label>

      {/* Honigtopf gegen Formular-Bots: fuer Menschen unsichtbar und nicht
          per Tab erreichbar. Wer es ausfuellt, wird serverseitig verworfen
          (src/app/api/quote/route.ts). Kein display:none - das erkennen Bots. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Leave this field empty
          <input name="leave_empty" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {z.art === 'fehler' && (
        <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {z.text}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary w-full sm:w-auto disabled:opacity-60">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
        {busy ? 'Sending…' : VORSCHAU ? 'Request a free estimate (preview)' : 'Request a free estimate'}
      </button>
    </form>
  );
}
