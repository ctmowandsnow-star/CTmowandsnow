# CT Mow&Snow — website

Next.js 15 (App Router), React 19, Tailwind 3, TypeScript. Hosted on Vercel:
every push to `main` goes live (production), every other branch / pull request
gets its own preview URL. Code comments are German; everything a visitor sees
is American English.

## Where things live — change facts here, not in page text

| What | File |
|---|---|
| All business facts: name, owner, phone, email, address, hours, domain (`url`), social profiles, the draft switch `istEntwurf` | `src/config/business.ts` |
| Services (one page each, plus service × town pages) | `src/config/services.ts` |
| Service towns and the local details used on town pages | `src/config/towns.ts` |
| The three ways to hire (regular care, one-time cleanup, storm service) | `src/config/arbeitsweisen.ts` |
| Gallery, before/after pairs | `src/config/gallery.ts` |
| Photos / video | `public/images/` (each photo also as `-sm.jpg`), `public/video/` |
| Pages / components | `src/app/…`, `src/components/…` |
| Contact form backend (mail delivery) | `src/app/api/quote/route.ts` |

A fact changed in `src/config/` updates every page, the structured data
(JSON-LD), `sitemap.xml` and `llms.txt` at once. `public/llms.txt` is generated
on every build by `scripts/generate-llms-txt.js` — never edit it by hand.

## Rules — they protect the business, follow them

1. **Only say what the owner actually says.** Never invent licenses,
   insurance, certifications, guarantees, "24/7", years in business,
   "family-owned", reviews/ratings, prices or commercial work. If the owner
   confirms something new, it goes into the config first.
   `pruefungen/behauptungen.mjs` scans the built HTML for these claims.
2. **American English only** in anything rendered. No German word may appear
   in the HTML (`pruefungen/durchstich.mjs` checks it).
3. **No guessed contact data.** Empty is better than wrong — empty phone or
   email fields are hidden on the site automatically.
4. **Town pages must stay genuinely different**, not the same text with the
   town name swapped. `pruefungen/doorway.mjs` measures page similarity
   (limit 0.90).
5. **Tailwind 3 opacity only in steps of 5** (`/90`, `/95`). `/92` silently
   produces nothing. `pruefungen/tailwind-klassen.mjs` catches it.
6. **One source of truth.** Add or rename a service or town in `src/config/`,
   never in a single page.
7. **No secrets in the repo.** Keys live in Vercel → Settings → Environment
   Variables.

## Before every commit

```bash
npm ci            # once per checkout
npm run build     # must pass
npm run check     # starts the built site locally and runs all checks
```

`npm run build` also fails on an incomplete go-live (see below).
`npm run check` runs durchstich, links, doorway, behauptungen and
tailwind-klassen against the built site — everything must be green before you
push. The same runs as a GitHub Action on every pull request.

## Workflow

- `git pull --rebase` before you start — several people and Claude sessions
  edit this repository.
- Work on a branch and open a pull request. Vercel posts a preview link on the
  PR; check the change there. Merging into `main` publishes it about a minute
  later.
- Describe the change in the PR in plain words — the owner reads it.

## Draft mode and going live

`istEntwurf: true` (current state): draft banner, `noindex`, robots.txt blocks
everything, no address or rating in the structured data.

Going live:

1. Fill in `src/config/business.ts`: `ownerName`, `url` (the real domain),
   `contact.phone` + `phoneDisplay`, `contact.email`, `contact.city`
   (plus `street` and `zip` for the address schema), `profiles`.
2. Contact form mail: set `RESEND_API_KEY` in Vercel (optional
   `QUOTE_TO_EMAIL`, `QUOTE_FROM_EMAIL`) — details at the top of
   `src/app/api/quote/route.ts`. Without it the form tells visitors honestly
   that nobody was notified.
3. Set `istEntwurf: false`. `scripts/pruefe-live-bereit.js` blocks the
   production build if step 1 or 2 is missing.
4. `pruefungen/durchstich.mjs` contains draft-only assertions (robots
   `Disallow`, `noindex`, `DRAFT` in llms.txt, no address schema). Flip them
   in the same pull request.
5. Domain: Vercel → Project → Settings → Domains → add it, then create exactly
   the DNS records Vercel shows at the domain's DNS provider. Leave all
   existing MX and TXT records alone — they carry the email.

## Optional password for the draft

Set both `VORSCHAU_BENUTZER` and `VORSCHAU_PASSWORT` in Vercel → Basic Auth on
all pages (`src/middleware.ts`). Delete both at go-live.
