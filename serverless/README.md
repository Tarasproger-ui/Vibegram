# Vibegram serverless (Vercel + Supabase) PoC

This folder contains a proof-of-concept migration of the Vibegram backend to serverless functions (suitable for Vercel). It uses Supabase (Postgres) for storage.

Required environment variables (set these in Vercel and locally):

- `SUPABASE_URL` - your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side; keep secret)
- `JWT_SECRET` - secret for signing JWTs (or use default for dev)

How to test locally:

1. Install dependencies for the serverless functions:

```powershell
cd serverless
npm install
```

2. Create the tables in your Supabase database (use `migrations/init.sql`) or run the SQL in Supabase SQL editor.

3. Run `vercel dev` in the repo root (requires Vercel CLI) and set env vars with `vercel env pull` or `--env`.

4. Endpoints (examples):
- `POST /api/auth/register` { phone, username, password }
- `POST /api/auth/login` { phone, password }
- `GET|PUT /api/auth/profile` (requires Authorization: Bearer <token>)

Notes:
- This is a PoC for auth endpoints. Next steps: migrate `friends` and `messages` functions, move file uploads to Supabase Storage, and replace real-time (Socket.IO) with Supabase Realtime or a small Cloud Run socket server.
