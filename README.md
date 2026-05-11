# Anaya Couture — Full-Stack E-commerce (Heritage Luxe)

This repository contains the Anaya Couture website.

## Goals
- Luxury frontend experience (Heritage Luxe design system)
- Secure authentication and authorization (customer + admin)
- Products, inventory, cart, wishlist, orders (dynamic via DB)
- Razorpay payments + webhook verification
- Admin dashboard for managing products and orders

## Stack (confirmed)
- Keep your existing frontend structure and files as-is
- Add a separate backend API layer and database
- Payment methods: Razorpay + COD

## Proposed architecture
- Backend: Node.js (Express or Fastify) with REST APIs
- Database: PostgreSQL + Prisma ORM
- Images: Cloudinary (CDN + optimization)
- Auth: JWT with secure httpOnly cookies + role-based access control

## Next steps
1. Add backend scaffold (API server + env config + Prisma schema).
2. Define DB models: users, roles, products, variants, orders, payments, addresses.
3. Replace localStorage logic with API calls.
4. Integrate Razorpay checkout + payment verification.
5. Lock admin routes with RBAC.

---

> Maintained by Nishank-talwar
