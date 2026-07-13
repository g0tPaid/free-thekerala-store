# The Kerala Store · free thekerala.store

Next.js storefront + admin for **thekerala.store** (Malayalam + English), deployed like rep.markets on Railway.

## Local

```bash
pnpm install
cp .env.example .env
# set DATABASE_URL, NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
pnpm dev
```

App: http://localhost:3003 · Admin: http://localhost:3003/admin

## Railway (same pattern as rep.markets)

1. Push this repo to GitHub
2. New Railway project → Deploy from GitHub repo
3. Add **PostgreSQL** plugin (sets `DATABASE_URL`)
4. Set variables:

| Variable | Example |
|---|---|
| `NEXTAUTH_URL` | `https://your-app.up.railway.app` |
| `NEXTAUTH_SECRET` | long random string |
| `ADMIN_EMAIL` | `admin@thekerala.store` |
| `ADMIN_PASSWORD` | strong password |
| `DATABASE_URL` | from Postgres plugin |

5. Deploy. Dockerfile runs `prisma migrate deploy` then `next start`.
6. Optional: custom domain `thekerala.store` → Railway service
7. After first deploy: `pnpm db:seed` via Railway shell, or seed locally against prod DB once

## Notes

- Currency: INR · WhatsApp: +971 58 906 1969
- Homepage banners: Admin → Settings (or random Unsplash defaults)
- Payment: UPI or COD at checkout — set real UPI in `src/lib/brand.ts` (`upiId`)
