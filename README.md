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

   Preview deploys are allowed by default via `CORS_ORIGIN_REGEX`. Set that variable empty to lock CORS to `CORS_ORIGINS` only.
4. On Vercel, set `VITE_API_URL` to the Railway HTTPS origin (`https://….up.railway.app`, no trailing slash) and **redeploy**. Vite bakes this in at build time.

Schema and seed (`backend/sql/mvp.sql`, `mvp.seed.sql`) still run against Supabase; Railway will not apply them.

## What is in the MVP

- **3-tap setup** — hospital, date, AM/PM (plus reporting time)
- **Scan demo** — rehearsed yellow-form OCR moment (not the reliable path)
- **AM/PM timeline** — hospital-faithful; SGH afternoon packet times are flagged as gaps
- **Food lookup** — retrieval-only classifier (Yes / No / Ask your care team) from Doc 03
- **Stool + call** — 6-point scale and publicly listed hospital numbers
- **WhatsApp opt-in** — `wa.me` to the Twilio sandbox with session id
- **EN / 中文 / Melayu / தமிழ்** — UI chrome only. Cited hospital wording stays in English.

Draft ruleset. Not medical advice. Not dietitian-approved.
