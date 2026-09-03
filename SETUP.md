# 🚀 Complete Step-by-Step Setup Guide — Hackathon 2026

This guide covers getting all free API keys, setting up environment variables, seeding the database, and running the full system locally or deploying it.

---

## Step 1: Get Free Keys from External Services

### 1.1 Neon PostgreSQL (Database)
1. Go to [neon.tech](https://neon.tech) and sign up with GitHub/Google.
2. Click **Create Project** → Name it `hackathon-2026`.
3. In the Dashboard under **Connection Details**:
   - Select **Pooled Connection** → Copy string as `DATABASE_URL`.
   - Select **Direct Connection** → Copy string as `DIRECT_URL`.

---

### 1.2 Resend (Transactional Email)
1. Go to [resend.com](https://resend.com) and sign up for a free account.
2. Go to **API Keys** → Click **Create API Key** → Name it `Crucible API`.
3. Copy key (starts with `re_...`) as `RESEND_API_KEY`.
4. *(Optional)* Verify your custom domain or use `onboarding@resend.dev` for testing.

---

### 1.3 Cloudflare R2 (Submission File Storage)
1. In the Cloudflare dashboard, open **R2** -> **Manage R2 API Tokens** and create an API token with access to the submissions bucket.
2. Copy the account ID as `CLOUDFLARE_ACCOUNT_ID`.
3. Copy the token's access key and secret as `CLOUDFLARE_R2_ACCESS_KEY_ID` and `CLOUDFLARE_R2_SECRET_ACCESS_KEY`.
4. Set `CLOUDFLARE_R2_BUCKET` to the private bucket name, usually `hackathon-submissions`.

---

### 1.4 Upstash Redis (Rate Limiting)
1. Go to [upstash.com](https://upstash.com) and sign up.
2. Click **Create Database** → Select **Global / Serverless Redis** → Name it `crucible-ratelimit`.
3. Scroll down to **REST API** section:
   - Copy `UPSTASH_REDIS_REST_URL`.
   - Copy `UPSTASH_REDIS_REST_TOKEN`.

---

### 1.5 Cloudflare Turnstile (CAPTCHA)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile**.
2. Click **Add Site** → Site Name: `Hackathon 2026` → Domain: `localhost` (and your production domain).
3. Copy **Site Key** (`VITE_TURNSTILE_SITE_KEY`) for frontend.
4. Copy **Secret Key** (`TURNSTILE_SECRET_KEY`) for backend.

---

## Step 2: Configure Environment Files

### 2.1 Backend Environment (`server/.env`)
Create `server/.env` and paste your keys:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.pooler.neon.tech/neondb?pgbouncer=true&connect_timeout=15&sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"

JWT_SECRET="generate-a-random-64-character-string-here"
JWT_EXPIRES_IN="7d"

RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"
EMAIL_FROM="Hackathon 2026 <noreply@yourdomain.com>"

CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-32-character-r2-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-64-character-r2-secret-access-key"
CLOUDFLARE_R2_BUCKET="hackathon-submissions"

UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxxxx..."

TURNSTILE_SECRET_KEY="0x4AAA..."
PORT=4000
CORS_ORIGINS="http://localhost:5173"
SKIP_TURNSTILE="true"  # set to false when testing Turnstile CAPTCHA locally
```

### 2.2 Frontend Environment (`.env`)
Create `.env` in the root folder:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_TURNSTILE_SITE_KEY=0x4AAA...
```

---

## Step 3: Initialize Database & Seed Admin Account

Open your terminal and run:

```bash
# Push Prisma schema to Neon DB
cd server
npx prisma db push

# Seed initial Admin, Judges, and Problem Tracks
node prisma/seed.js
```

---

## Step 4: Run Locally

### Start Backend Server
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:4000` (Health check: `http://localhost:4000/api/health`)*

### Start Frontend App (in a second terminal)
```bash
# In project root
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## Step 5: Default Credentials (from Seed Script)

| Account Type | Email | Password | Access Level |
|---|---|---|---|
| **Participant (Team Lead)** | `participant@crucible.dev` | `TeamLead@2026!` | Participant Dashboard, PPT upload, team view (Join code: `HACK-2026`) |
| **Admin** | `admin@crucible.dev` | `Admin@2026!` | Full control, registration toggle, shortlist release, announcement composer |
| **Judge 1** | `judge1@crucible.dev` | `Judge@2026!` | Submissions table, signed file download, score evaluation |
| **Judge 2** | `judge2@crucible.dev` | `Judge@2026!` | Submissions table, signed file download, score evaluation |
