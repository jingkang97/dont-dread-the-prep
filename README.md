# PrepPath

No-install colonoscopy prep microsite for HackitRx 2026 (OAS × LSS). Patients scan a QR on the SGH/NCCS yellow form.

## Run

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL on a phone or in a 430px-wide window. On a laptop, a pitch rail appears beside the patient surface.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs · health: http://127.0.0.1:8000/health · DB: http://127.0.0.1:8000/health/db

Set `DATABASE_URL` in `backend/.env` to your Supabase Postgres URI (Project Settings → Database → Connection string → URI). Prefer **Session mode** pooler or **Direct** connection for local uvicorn. `/docs` is served only when `DEBUG=true`.

## Deploy

Frontend is on Vercel at [dont-dread-the-prep.vercel.app](https://dont-dread-the-prep.vercel.app/). Backend deploys as a long-lived FastAPI process on [Railway](https://docs.railway.com/builds/build-configuration).

1. New project from this GitHub repo. In the service **Settings**, set **Root Directory** to `backend` so Railpack sees `requirements.txt` and `railpack.json` (start command is `uvicorn app.main:app`, not the FastAPI default `main:app`).
2. **Healthcheck Path**: `/health` (no database). Use `/health/db` only to confirm Postgres after the first deploy.
3. Variables:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Supabase **Session** pooler URI (port 5432) with `?sslmode=require` |
   | `CORS_ORIGINS` | `https://dont-dread-the-prep.vercel.app` |
   | `DEBUG` | `false` |
   | `SITE_URL` | `https://dont-dread-the-prep.vercel.app` (Telegram buttons; defaults to this when `DEBUG=false`) |
   | `TELEGRAM_BOT_TOKEN` | BotFather token |
   | `TELEGRAM_REMINDER_TEST` | `true` for the demo ladder (now / +1 min / +2 min, then 3 hourly, then 3 daily). `false` = live T−72 / T−24 / T−6 |
   | `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push pair (`npx web-push generate-vapid-keys`) |
   | `VAPID_MAILTO` | `mailto:you@example.com` |

   Railway injects `RAILWAY_PUBLIC_DOMAIN`; on boot the API registers a Telegram webhook at `/api/telegram/webhook`. Set `PUBLIC_API_URL` only if that domain is missing. Keep **Serverless / App Sleeping off** and **replicas = 1** so the reminder loop can run. Leave `TELEGRAM_POLL` unset on Railway. Local uvicorn should not poll the same bot (it would drop the webhook).

   Preview deploys are allowed by default via `CORS_ORIGIN_REGEX`. Set that variable empty to lock CORS to `CORS_ORIGINS` only.
4. On Vercel, set `VITE_API_URL` to the Railway HTTPS origin (`https://….up.railway.app`, no trailing slash) and `VITE_TELEGRAM_BOT_USERNAME` (no `@`), then **redeploy**. Vite bakes these in at build time.

Schema and seed (`backend/sql/mvp.sql`, `mvp.seed.sql`, `telegram.sql`, `push.sql`) still run against Supabase; Railway will not apply them. `telegram.sql` and `push.sql` are required for reminders.

## What is in the MVP

- **3-tap setup** — hospital, date, AM/PM (plus reporting time)
- **Scan demo** — rehearsed yellow-form OCR moment (not the reliable path)
- **AM/PM timeline** — hospital-faithful; SGH afternoon packet times are flagged as gaps
- **Food lookup** — retrieval-only classifier (Yes / No / Ask your care team) from Doc 03
- **Stool + call** — 6-point scale and publicly listed hospital numbers
- **Telegram + phone reminders** — `t.me/Bot?start=SESSION_ID` links the chat; Add to Home Screen enables the same T−72 / T−24 / T−6 as a notification. Live schedule is T−72 / T−24 / T−6. Demo mode (`TELEGRAM_REMINDER_TEST=true`) sends now / +1 min / +2 min, then 3 hourly, then 3 daily. Set `TELEGRAM_BOT_TOKEN`, VAPID keys, and `VITE_TELEGRAM_BOT_USERNAME`.

Draft ruleset. Not medical advice. Not dietitian-approved.
