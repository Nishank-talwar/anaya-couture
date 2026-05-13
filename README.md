# Anaya Couture — Full-Stack E-commerce (Heritage Luxe)

Luxury HTML/CSS/JS storefront integrated with a Node.js + Prisma backend.

## Project structure

- Frontend: static pages in repository root (`*.html`, `js/*`, `css/*`)
- Backend API: `backend/`

## Backend setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create `.env` in `backend/`:
   ```env
   PORT=5050
   NODE_ENV=development
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
   JWT_SECRET=replace_with_secure_secret
   COOKIE_SECRET=replace_with_secure_secret
   CORS_ORIGIN=http://127.0.0.1:5500

   # Optional (required only for Razorpay flow)
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxx
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
   ```
3. Generate Prisma client and run migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
4. Start backend:
   ```bash
   npm run dev
   ```

## Frontend setup

1. Serve the root directory over HTTP (do **not** use `file://`):
   - VS Code Live Server, or
   - `python -m http.server 5500`
2. Ensure the frontend origin matches `CORS_ORIGIN`.
3. Optional API override:
   - set `window.__ANAYA_API_BASE_URL__` before loading `js/config.js`.

## Supported checkout flows

- COD: direct order creation (`paymentMethod=COD`)
- Razorpay:
  - create order (`paymentMethod=RAZORPAY`)
  - create Razorpay order via backend
  - verify payment signature via backend

---

Maintained by Nishank-talwar
