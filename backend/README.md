# Anaya Couture Backend

Express + Prisma + PostgreSQL API server for the Anaya Couture full-stack site.

## Quick start
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Features (initial)
- Auth (JWT httpOnly cookies)
- Products, variants, inventory
- Cart & wishlist
- Orders & payments
- Razorpay integration (coming)

## Scripts
- `npm run dev` — start dev server
- `npm run start` — start prod server
- `npm run prisma:studio` — DB studio
