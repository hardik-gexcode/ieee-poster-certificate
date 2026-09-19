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
   draws the name onto the name-line in a script font (`@napi-rs/canvas`),
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
index.html               # Vite entry
api/
  verify.js               # POST /api/verify
  certificate.js           # GET  /api/certificate
lib/
  roster.js                # CSV loading + name/email verification
  certificate.js            # draws the name onto the right template
certificates/               # the 4 blank certificate templates
fonts/DancingScript-Bold.ttf
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

Vite runs the React app at **http://localhost:5173**. The `/api/*` calls
need Vercel's runtime though (they're serverless functions, not part of the
Vite dev server) — easiest is to run both together:

```bash
npm install -g vercel   # one-time
vercel dev
```

`vercel dev` serves the whole thing (frontend + functions) on one port —
usually **http://localhost:3000** — and reproduces Vercel's actual
production routing, so if it works there, it'll work deployed. Test with
the sample record already in `data/participants.csv`:
Hardik Gupta / guptahardik014@gmail.com.

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

- **Certificate templates**: swap the PNGs in `certificates/`. If the
  layout changes, update the pixel boxes in `NAME_BOX` in
  `lib/certificate.js`.
- **Name font/color**: `FONT_PATH` / `NAME_COLOR` in `lib/certificate.js`.
- **Page design/copy**: `src/App.tsx` (Tailwind utility classes).
