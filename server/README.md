# Nabis Fashton — Clothing Server API

This repository contains the backend API for the Nabis Fashton clothing store.

**Quick:** Node + Express (TypeScript), Prisma (Postgres), Cloudinary for images, better-auth for auth.

**Environment**

- Required env vars (minimum):
  - `BETTER_AUTH_SECRET` - secret used by better-auth
  - `STRIPE_WEBHOOK_SECRET` - Stripe endpoint signing secret (`whsec_...`)
  - `DATABASE_URL` — Postgres connection used by Prisma
  - `PORT` — server port
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials
  - `TRUSTED_ORIGIN(S)` — allowed CORS origins

- Stripe checkout setup also uses `STRIPE_SECRET_KEY`,
  `STRIPE_PUBLIC_KEY`, and optional `STRIPE_CURRENCY` (defaults to `bdt`).

**Authentication**

- Authentication is handled via `better-auth` session cookies/headers.
- Use the existing `/api/auth` endpoints provided by better-auth (mounted at `/api/auth`).
- Email/password registration is `POST /api/auth/sign-up/email`. Send JSON in this shape:
  `{ "name": "Jane Doe", "email": "jane@example.com", "phone": "+8801712345678", "password": "at-least-12-characters" }`.
  Include an absolute `callbackURL` when calling it from another origin.
- `PUT /api/user/me` accepts `{ "image": "https://..." }` for the current
  user's profile image. Only absolute HTTP(S) image URLs are accepted; send
  `{ "image": null }` to remove it.
- Protected endpoints require a valid session (middleware: `requireAuth`).
- Admin-only endpoints require both `requireAuth` and `requireAdmin`. `requireAdmin` checks `res.locals.authUser.role === 'admin'`.

**File uploads**

- Product image uploads use `multipart/form-data` with a single file field named `image`.
- Multer memory storage is used and images are uploaded to Cloudinary. Max file size: 5MB (see multer.config).

**Rules & Behavior**

- Category create/update/delete: Admin-only. Categories with associated products cannot be deleted.
- Reviews:
  - Users can create or update a single review per product (`POST /api/reviews/product/:productId`).
  - Public review listings exclude hidden reviews. Admins can list and manage hidden reviews.
  - Admins can hide/unhide and delete any review.
- Product images: Admin-only to add/delete images.

**Endpoints (summary table)**

| Method   |                              Path |            Auth            | Admin | Description                                                           |
| -------- | --------------------------------: | :------------------------: | :---: | --------------------------------------------------------------------- |
| GET      |                             /api/ |            none            |  no   | API root / health                                                     |
| POST/GET |                      /api/auth/\* |            none            |  no   | Auth handled by better-auth (sessions)                                |
| GET      |                      /api/user/me |        requireAuth         |  no   | Get current user profile                                              |
| PUT      |                      /api/user/me |        requireAuth         |  no   | Update own profile                                                    |
| GET      |             /api/user/admin/users |        requireAuth         |  yes  | List all users (admin)                                                |
| GET      |         /api/user/admin/users/:id |        requireAuth         |  yes  | Get user by id (admin)                                                |
| DELETE   |         /api/user/admin/users/:id |        requireAuth         |  yes  | Delete user (admin)                                                   |
| GET      |                  /api/categories/ |            none            |  no   | List categories                                                       |
| GET      |        /api/categories/slug/:slug |            none            |  no   | Get category by slug                                                  |
| GET      |               /api/categories/:id |            none            |  no   | Get category by id                                                    |
| POST     |                  /api/categories/ |        requireAuth         |  yes  | Create category (body: { name, slug })                                |
| PUT      |               /api/categories/:id |        requireAuth         |  yes  | Update category (body: { name?, slug? })                              |
| DELETE   |               /api/categories/:id |        requireAuth         |  yes  | Delete category (fails if products exist)                             |
| GET      |                    /api/products/ |            none            |  no   | List products                                                         |
| GET      |          /api/products/slug/:slug |            none            |  no   | Get product by slug                                                   |
| GET      |                 /api/products/:id |            none            |  no   | Get product by id (includes images & reviews)                         |
| GET      |          /api/products/:id/images |            none            |  no   | List product images                                                   |
| POST     |          /api/products/:id/images |        requireAuth         |  yes  | Upload product image (multipart `image`)                              |
| DELETE   |     /api/products/images/:imageId |        requireAuth         |  yes  | Delete product image by id                                            |
| GET      |                        /api/cart/ |        requireAuth         |  no   | Get current user's cart                                               |
| POST     |                   /api/cart/items |        requireAuth         |  no   | Add item to cart (body: { productVariantId, quantity })               |
| PATCH    | /api/cart/items/:productVariantId |        requireAuth         |  no   | Update cart item quantity                                             |
| DELETE   | /api/cart/items/:productVariantId |        requireAuth         |  no   | Remove item from cart                                                 |
| DELETE   |                   /api/cart/clear |        requireAuth         |  no   | Clear cart                                                            |
| POST     |             /api/webhooks/stripe |      Stripe signature      |  no   | Process Stripe payment events                                         |
| GET      |                     /api/reviews/ | requireAuth & requireAdmin |  yes  | Admin: list reviews (query: page, limit, productId, userId)           |
| GET      |   /api/reviews/product/:productId |            none            |  no   | List public reviews for a product (query: page, limit)                |
| POST     |   /api/reviews/product/:productId |        requireAuth         |  no   | Create/update current user's review (body: { rating (1-5), comment }) |
| DELETE   |   /api/reviews/product/:productId |        requireAuth         |  no   | Delete current user's review for product                              |
| DELETE   |                  /api/reviews/:id | requireAuth & requireAdmin |  yes  | Admin: delete any review by id                                        |
| PATCH    |             /api/reviews/:id/hide | requireAuth & requireAdmin |  yes  | Admin: hide/unhide review (body: { hidden: true/false })              |

Notes:

- All `requireAuth` endpoints expect a valid session from `better-auth` sent in request headers/cookies.
- Admin endpoints require the user's `role` to be `admin`.
- Configure Stripe to send `checkout.session.completed`,
  `payment_intent.succeeded`, and `payment_intent.payment_failed` to
  `https://your-api.example.com/api/webhooks/stripe`.
- Stripe Checkout or PaymentIntent metadata must include `orderId`.

**Examples**

- Upload product image (curl):

```bash
curl -X POST "https://your-api.example.com/api/products/123/images" \
  -H "Authorization: Bearer <token-or-session>" \
  -F "image=@./photo.jpg" \
  -v
```

- Create category (admin):

```bash
curl -X POST "https://your-api.example.com/api/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Shirts","slug":"shirts"}'
```

- Post review (authenticated user):

```bash
curl -X POST "https://your-api.example.com/api/reviews/product/123" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"rating":5,"comment":"Great product!"}'
```

**Where to look in code**

- Routes: `src/modules/*/*.routes.ts`
- Controllers: `src/modules/*/*.controller.ts`
- Services: `src/modules/*/*.service.ts`
- Cloudinary helper: `src/config/cloudinary.config.ts`
- Multer config: `src/config/multer.config.ts`

If you'd like, I can also generate an OpenAPI/Swagger spec from these routes next.
