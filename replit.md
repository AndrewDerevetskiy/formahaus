# FormaHaus — Furniture Marketplace

## Overview

pnpm workspace monorepo using TypeScript. Full furniture marketplace with React frontend, Express API, and PostgreSQL database.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL (raw `pg` pool) + Drizzle ORM for migrations
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle for api-server)

## Structure

```text
├── artifacts/
│   ├── furniture-store/    # React + Vite + Three.js frontend (port: 23155, path: /)
│   ├── api-server/         # Express 5 API server (port: 8080)
│   └── mockup-sandbox/     # Component preview server (port: 8081)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only emit `.d.ts` files during typecheck
- **Project references** — cross-package imports require `references` entries in `tsconfig.json`

## Packages

### `artifacts/furniture-store` (`@workspace/furniture-store`)

**FormaHaus** — Full furniture marketplace storefront with 3D room editor.

- Port: `23155`, serves at path `/`
- Stack: React 19 + Vite + TypeScript, Three.js (`three@0.160.0`), Tailwind CSS, wouter
- Entry: `src/main.tsx` → `src/App.tsx` (CartProvider + wouter router)
- API proxy: Vite server proxy forwards `/api/*` and `/uploads/*` to api-server at `localhost:8080`
- API lib: `src/lib/api.ts` exports `API_BASE = ""` (relative via proxy)

**Routes:**
- `/` → `Home.tsx` — storefront: hero, catalog grid (loads categories from API), vendor CTA
- `/category/:id` → `CategoryPage.tsx` — product grid for a category (loads from API)
- `/product/:id` → `ProductPage.tsx` — product detail with "Add to cart" + "Try in 3D"
- `/designer` → `FormaHaus.tsx` — 3D room editor (Three.js, React Three Fiber)
- `/cart` → `Cart.tsx` — cart with floor/wall materials + order summary
- `/vendor/register` → `VendorRegister.tsx` — vendor signup/login form
- `/vendor/dashboard` → `VendorDashboard.tsx` — product upload dashboard for vendors

**3D Editor** (`FormaHaus.tsx`):
- Full Three.js scene with OrbitControls, 14 furniture types via procedural geometry
- Canvas-generated floor textures (oak herringbone, walnut plank, marble, concrete)
- Drag-to-place furniture, real-time pricing
- Thumbnail generation via off-screen WebGL renderer

**CartContext** (`src/context/CartContext.tsx`):
- `CartItem`: `{ id, type, label, price, icon }`
- Also manages `floorKind` and `wallColorId` for the 3D designer materials
- `addItem(item: CartItem)`, `removeItem(id)`, `clearItems()`
- Exports `itemCount`, `floorTotal`, `wallTotal`, `furnitureTotal`, `grandTotal`

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Runs on port `8080`.

- Entry: `src/index.ts`
- App setup: `src/app.ts` — CORS, JSON, static `/uploads`, routes at `/api`
- Database: raw `pg` Pool via `src/lib/db.ts` (uses `DATABASE_URL` env var)
- File uploads: `multer` writes to `public/uploads/images/` and `public/uploads/models/`

**Routes** (all under `/api/`):
- `GET /api/healthz` — health check
- `GET /api/categories` — list all categories
- `GET /api/products?category=<id>` — list products (with optional category filter)
- `GET /api/products/:id` — single product (joined with category + vendor names)
- `POST /api/products` — create product (multipart: image + model files, vendor auth via header)
- `DELETE /api/products/:id` — delete product (vendor auth via header)
- `POST /api/vendor/register` — register vendor (shop_name, email, password → bcrypt hash)
- `POST /api/vendor/login` — login vendor (email, password → vendor object)

**Database schema** (raw SQL, not Drizzle):
```sql
categories(id TEXT PK, name_uk TEXT, image_url TEXT)
vendors(id SERIAL PK, shop_name TEXT, email UNIQUE, password_hash TEXT)
products(id SERIAL PK, vendor_id INT FK, category_id TEXT FK, name TEXT, description TEXT,
         price NUMERIC, image_url TEXT, model_path TEXT, designer_type TEXT, created_at TIMESTAMPTZ)
```

**Seeded data**: 4 categories (tables/chairs/lighting/decor), 12 sample products.

**Vendor auth**: Simple header-based auth `x-vendor-id` for product upload/delete. Frontend stores `{ id, shop_name, email }` in `localStorage["vendor"]`.

### `lib/db` (`@workspace/db`)

Drizzle ORM + PostgreSQL. Used for migrations only; api-server uses raw `pg` directly.

- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`)
- Run migrations: `pnpm --filter @workspace/db run push`

### `lib/api-spec`, `lib/api-zod`, `lib/api-client-react`

OpenAPI spec + generated Zod schemas + generated React Query hooks (legacy/unused by furniture pages, used by original health check route only).

- Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `scripts` (`@workspace/scripts`)

Utility scripts. Run via `pnpm --filter @workspace/scripts run <script>`.

## Root Scripts

- `pnpm run build` — typecheck then build all packages
- `pnpm run typecheck` — `tsc --build --emitDeclarationOnly`
