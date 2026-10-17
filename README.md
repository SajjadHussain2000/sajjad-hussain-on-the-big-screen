# Sajjad Hussain — Portfolio

Personal portfolio built with Next.js 16. Includes an avatar tour guide, a site-wide Bug Hunt game with a live leaderboard, and project case studies.

See [PLAN.md](PLAN.md) for the full plan, design decisions and roadmap.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Upstash keys the Bug Hunt uses an in-memory store, which is fine for local development.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need:

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Leaderboards and hunt sessions. **Required in production.** |
| `HUNT_CODES` | Code words for the technical bugs (JSON). Use your own in production. |
| `ADMIN_SECRET` | Enables `DELETE /api/hunt?mode=…&id=…` for removing leaderboard entries. |
| `NEXT_PUBLIC_SITE_URL` | Custom domain. Defaults to the Vercel production URL. |

## Deploy

Hosted on Vercel. Every push to `main` deploys to production; pull requests get preview URLs. CI runs lint and build on every push and pull request.
