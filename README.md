# CT Mow&Snow website

Lawn care and snow removal in Central Connecticut. Built with Next.js, hosted
on Vercel.

Preview (draft, not indexed): https://c-tmowandsnow.vercel.app

## Change something with Claude

1. Open [claude.ai/code](https://claude.ai/code) — or the **Code** tab in the
   Claude app on your phone.
2. Pick this repository.
3. Say what you want, in plain words. For example:
   - "Change the phone number to 860-555-0100."
   - "Add Wethersfield as a service town."
   - "Put the new truck photo on the snow plowing page."
4. Claude makes the change and runs the checks. Then **Create PR** (or ask
   Claude to open the pull request). The pull request shows a **Vercel
   preview link** — open it and look.
5. Happy with it? **Merge** the pull request. The site is live about a minute
   later.

Nothing goes live without that merge.

## For developers

Everything technical — where the content lives, the rules, the checks, going
live — is in [CLAUDE.md](CLAUDE.md).

```bash
npm ci
npm run dev      # http://127.0.0.1:3210
npm run build && npm run check
```
