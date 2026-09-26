'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Die Fragen stehen sichtbar auf der Seite UND im FAQ-Schema - aus derselben
 * Quelle.
 *
 * WICHTIG und der Grund, warum hier KEIN AnimatePresence steht: ein Crawler,
 * der kein JavaScript ausfuehrt (und die meisten KI-Crawler tun das nicht),
 * sieht nur das ausgelieferte HTML. Wuerde der zugeklappte Block aus dem DOM
 * genommen, stuende im HTML genau EINE Antwort - die zuerst geoeffnete. Der
 * Rest waere unsichtbar fuer genau die Systeme, fuer die der Text geschrieben
 * ist. Deshalb sind alle Antworten immer im Markup; animiert wird nur die
 * Hoehe ueber grid-template-rows.
 */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[.03]"
              >
                <span className="text-[15px] font-semibold text-white">{it.q}</span>
                <ChevronDown
                  size={18}
                  className={`mt-0.5 shrink-0 text-bark-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </h3>
            <div
              id={`faq-answer-${i}`}
              className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.22,.9,.3,1)]"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-bark-300">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
