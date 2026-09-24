# Poster Creation Impressions — Certificate Portal

**Vite + React + TypeScript + Tailwind**, with the verification/certificate
logic as Vercel serverless functions — same stack as our other Vercel
projects, so it deploys the same easy way.

Students verify with **name + email**, then instantly download their
certificate — a regular **Certificate of Participation**, or, for the top
three, a **Certificate of Appreciation** with the matching gold/silver/bronze
seal. No database, no admin panel — two CSV files are the entire backend.

---

## How it works

1. Student types their **name**, then their **email**, in the React form.
2. It calls `POST /api/verify`, which checks the pair against
   `data/winners.csv` first, then `data/participants.csv`. The student is
   **never** asked for a position — it's only ever looked up server-side.
3. On a match, a **Download Certificate** button hits `GET /api/certificate`
   — the function opens the right blank template from `certificates/`,
   draws the name onto the name-line in the same script font as the design
   (Great Vibes, `@napi-rs/canvas`), centred and auto-shrunk for long names,
   and streams back the finished PNG. Nothing is pre-rendered or written to
   disk.
4. `/api/certificate` re-verifies the pair itself, so a certificate can't
   be pulled just by guessing a name in the URL.

---

## Project layout

```
src/                     # the React app (Vite)
  App.tsx
  main.tsx
  index.css
public/developer.jpg     # photo for the "Meet the Developer" card
index.html               # Vite entry
api/
  verify.js               # POST /api/verify
  certificate.js           # GET  /api/certificate
lib/
  roster.js                # CSV loading + name/email verification
  certificate.js            # draws the name onto the right template
dev-api.js                  # dev-only: lets `npm run dev` serve /api/* (not used on Vercel)
certificates/               # the 4 blank certificate templates (name area left empty)
fonts/GreatVibes-Regular.ttf  # name font for the participation certificate
fonts/DancingScript-Bold.ttf  # name font for the old 1st/2nd/3rd templates
data/
  participants.csv          # everyone who took part (name, email)
  winners.csv                # only the top 3 (name, email, position)
vercel.json                  # bundles certificates/fonts/data into the functions
```

---

## Adding participants & winners — exactly where to paste, on GitHub

Two separate files, on purpose — the site never asks anyone for their
position; it's only ever looked up server-side.

**On GitHub.com:** open the file → pencil icon ("Edit this file") → paste
your rows below the header → **Commit changes**. Vercel redeploys
automatically on every push.

### `data/participants.csv`

```csv
name,email
Hardik Gupta,guptahardik014@gmail.com
Jane Doe,jane@example.com
```

### `data/winners.csv`

```csv
name,email,position
Jane Doe,jane@example.com,1st
John Smith,john@example.com,2nd
Aisha Khan,aisha@example.com,3rd
```

- `position` must be exactly `1st`, `2nd`, or `3rd`.
- A `winners.csv` match always wins over `participants.csv` — you don't
  need to remove winners from the general list.
- `name` must match **exactly** what the student types (case-insensitive,
  trimmed) — keep it exactly as it should appear on the certificate.

---

## Running it locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173** — that's the whole thing. `npm run dev` serves
the React app *and* the `/api/verify` + `/api/certificate` functions (via
`dev-api.js`, a small dev-only Vite plugin that runs the exact same handlers
Vercel deploys). No `vercel dev`, no second terminal, no login needed.
Edits to `api/`, `lib/` and the CSVs are picked up without restarting.

Test with any row from `data/participants.csv`, e.g.
`Hardik Gupta` / `guptahardik014@gmail.com`.

(`vercel dev` still works too if you prefer it — it just isn't required.)

---

## Deploying on Vercel

1. Push this repo to GitHub (already a git repo — just add your remote and
   push).
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Leave every setting on default — Vercel auto-detects Vite for the
   frontend and `api/*.js` as functions, together, with no extra config.
4. **Deploy.**

If it ever asks which existing project to link mid-deploy, say no / don't
pick one — this is a new project, not a redeploy of something else.

---

## Customizing

- **Certificate templates**: swap the PNGs in `certificates/` (leave the name
  area empty — the name is drawn by the code). If the layout changes, update
  that certificate's `line` (`[x1, x2, y]` of the name underline, in template
  pixels) in the `CERTS` table in `lib/certificate.js`.
- **Name font/colour/size**: `font`, `color`, `startSize` in the same table.
- **Meet the Developer card**: bottom of `src/App.tsx`; photo is
  `public/developer.jpg`.
- **Page design/copy**: `src/App.tsx` (Tailwind utility classes).
