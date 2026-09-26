import { NextResponse } from 'next/server';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { BUSINESS } from '@/config/business';
import { TOWNS } from '@/config/towns';
import { SERVICES } from '@/config/services';

/**
 * Anfragen aus dem Formular.
 *
 * ZUSTELLUNG PER MAIL ueber Resend (resend.com), gesteuert NUR ueber
 * Umgebungsvariablen - bei Vercel unter Settings -> Environment Variables:
 *
 *   RESEND_API_KEY    Schluessel aus dem Resend-Konto. Ohne ihn wird nichts versendet.
 *   QUOTE_TO_EMAIL    Wohin die Anfragen gehen. Leer = BUSINESS.contact.email.
 *   QUOTE_FROM_EMAIL  Absender. Leer = "<Firmenname> Website <onboarding@resend.dev>".
 *                     Ohne eigene, bei Resend bestaetigte Domain nimmt Resend nur
 *                     Mails an die Adresse des Resend-Kontos selbst an - fuer ein
 *                     Kontaktformular reicht das.
 *
 * `delivered` in der Antwort ist nur wahr, wenn Resend die Mail angenommen
 * hat. Ein Formular, das "wir melden uns" sagt, waehrend die Nachricht
 * nirgends ankommt, ist schlimmer als gar kein Formular. (Die Vorfassung hat
 * `delivered` aus istEntwurf + E-Mail-Feld abgeleitet, ohne je etwas zu
 * senden - beim Scharfschalten haette sie genau das behauptet.)
 *
 * Ohne Mailversand:
 *   - lokal (npm run dev / npm start) landet die Anfrage in data/quote-requests.jsonl
 *   - auf Vercel gibt es keine beschreibbare Platte. Die Anfrage wird dort
 *     NICHT gespeichert - auch nicht im Log, das sind Personendaten - und das
 *     Formular sagt dem Absender ehrlich, dass niemand benachrichtigt wurde.
 */

const DATEI = path.join(process.cwd(), 'data', 'quote-requests.jsonl');
const AUF_VERCEL = !!process.env.VERCEL;

type Eingang = {
  name?: unknown; email?: unknown; phone?: unknown;
  town?: unknown; service?: unknown; message?: unknown; address?: unknown;
  /** Honigtopf: im Formular unsichtbar, fuellen nur Bots aus. */
  leave_empty?: unknown;
};

type Anfrage = {
  at: string; name: string; email: string; phone: string;
  address: string; town: string; service: string; message: string;
};

function text(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/** Eine Zeile fuer den Betreff - Zeilenumbrueche haben dort nichts verloren. */
function zeile(v: string): string {
  return v.replace(/[\r\n]+/g, ' ');
}

async function perMail(e: Anfrage): Promise<'gesendet' | 'nicht-eingerichtet' | 'fehler'> {
  const schluessel = process.env.RESEND_API_KEY?.trim();
  const an = process.env.QUOTE_TO_EMAIL?.trim() || BUSINESS.contact.email;
  if (!schluessel || !an) return 'nicht-eingerichtet';

  const von = process.env.QUOTE_FROM_EMAIL?.trim() || `${BUSINESS.name} Website <onboarding@resend.dev>`;
  const ort = TOWNS.find((t) => t.slug === e.town)?.name ?? '';
  const leistung = SERVICES.find((s) => s.slug === e.service)?.name ?? '';
  const inhalt = [
    `New estimate request from ${e.name}`,
    '',
    `Name:     ${e.name}`,
    `Phone:    ${e.phone || '-'}`,
    `Email:    ${e.email || '-'}`,
    `Address:  ${e.address || '-'}`,
    `Town:     ${ort || '-'}`,
    `Service:  ${leistung || '-'}`,
    '',
    e.message || '(no message)',
    '',
    `Sent ${e.at} through the website form.`,
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${schluessel}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: von,
        to: [an],
        // Antworten gehen direkt an den Anfragenden, nicht an Resend.
        ...(e.email ? { reply_to: e.email } : {}),
        subject: zeile(`Estimate request: ${leistung || 'general'}${ort ? ` in ${ort}` : ''} - ${e.name}`),
        text: inhalt,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (r.ok) return 'gesendet';
    // Status und Meldung ja, Anfragedaten nein.
    console.error('quote: Resend lehnt ab', r.status, (await r.text()).slice(0, 300));
    return 'fehler';
  } catch (err) {
    console.error('quote: Resend nicht erreichbar', err instanceof Error ? err.message : err);
    return 'fehler';
  }
}

/** Lokale Ablage - nur ausserhalb von Vercel, dort ist die Platte schreibgeschuetzt. */
async function ablegen(e: Anfrage): Promise<boolean> {
  if (AUF_VERCEL) return false;
  try {
    await mkdir(path.dirname(DATEI), { recursive: true });
    await appendFile(DATEI, `${JSON.stringify(e)}\n`, 'utf8');
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  let body: Eingang;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not read the request.' }, { status: 400 });
  }

  // Bot erkannt: nichts senden, nichts speichern. `delivered: false`, falls es
  // doch einmal ein Mensch war - der liest dann den ehrlichen Hinweis statt
  // eines "wir melden uns", auf das nie etwas folgt.
  if (text(body.leave_empty, 200)) return NextResponse.json({ ok: true, delivered: false });

  const name = text(body.name, 120);
  const email = text(body.email, 160);
  const phone = text(body.phone, 40);
  const address = text(body.address, 200);
  const town = text(body.town, 80);
  const service = text(body.service, 80);
  const message = text(body.message, 2000);

  // Pflichtfelder. `trim` steht schon in text() - ein Feld aus lauter
  // Leerzeichen zaehlt damit als leer und nicht als ausgefuellt.
  if (!name) return NextResponse.json({ ok: false, error: 'Please enter your name.' }, { status: 400 });
  if (!email && !phone) {
    return NextResponse.json(
      { ok: false, error: 'Please leave either an email address or a phone number.' },
      { status: 400 },
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'That email address does not look right.' }, { status: 400 });
  }
  // Nur Werte, die es wirklich gibt - sonst laesst sich das Feld als Ablage missbrauchen.
  if (town && !TOWNS.some((t) => t.slug === town)) {
    return NextResponse.json({ ok: false, error: 'Unknown town.' }, { status: 400 });
  }
  if (service && !SERVICES.some((s) => s.slug === service)) {
    return NextResponse.json({ ok: false, error: 'Unknown service.' }, { status: 400 });
  }

  const eintrag: Anfrage = {
    at: new Date().toISOString(),
    name, email, phone, address, town, service, message,
  };

  const mail = await perMail(eintrag);
  const abgelegt = await ablegen(eintrag);

  if (mail === 'gesendet') return NextResponse.json({ ok: true, delivered: true });

  // Versand eingerichtet, aber gescheitert: das muss der Absender erfahren,
  // sonst wartet er auf einen Rueckruf, der nie kommt.
  if (mail === 'fehler') {
    return NextResponse.json(
      { ok: false, error: 'We could not send that right now. Please call or email us instead.' },
      { status: 502 },
    );
  }

  // Kein Versand eingerichtet. Lokal ist die Anfrage abgelegt; wo nicht
  // (Vercel ohne Resend), ist sie weg - und genau das sagt `delivered: false`.
  if (!abgelegt && !AUF_VERCEL) {
    return NextResponse.json(
      { ok: false, error: 'We could not save that. Please call or email instead.' },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, delivered: false });
}
