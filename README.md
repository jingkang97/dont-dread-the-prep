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

Set `DATABASE_URL` in `backend/.env` to your Supabase Postgres URI (Project Settings → Database → Connection string → URI). Prefer **Session mode** pooler or **Direct** connection for local uvicorn.

## What is in the MVP

- **3-tap setup** — hospital, date, AM/PM (plus reporting time)
- **Scan demo** — rehearsed yellow-form OCR moment (not the reliable path)
- **AM/PM timeline** — hospital-faithful; SGH afternoon packet times are flagged as gaps
- **Food lookup** — retrieval-only classifier (Yes / No / Ask your care team) from Doc 03
- **Stool + call** — 6-point scale and publicly listed hospital numbers
- **WhatsApp opt-in** — `wa.me` to the Twilio sandbox with session id
- **EN / 中文 / Melayu / தமிழ்** — UI chrome only. Cited hospital wording stays in English.

Draft ruleset. Not medical advice. Not dietitian-approved.
