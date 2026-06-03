# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Turbopack, http://localhost:3000)
npm run build    # production build (Turbopack)
npm run start    # serve production build
npm run lint     # run ESLint via the ESLint CLI (not `next lint`)
npx next typegen # generate PageProps/LayoutProps/RouteContext type helpers
```

## Stack

- **Next.js 16** — App Router only; no Pages Router
- **React 19**
- **TypeScript** (strict mode); path alias `@/*` → project root
- **Tailwind CSS v4** via `@tailwindcss/postcss` — no `tailwind.config.js`
- **shadcn/ui** components in `components/ui/` (configured via `components.json`)
- **lucide-react** for icons

## Key Next.js 16 Breaking Changes

Before writing any route, layout, middleware, or image-generation code, read the relevant guide in `node_modules/next/dist/docs/`.

### Async Request APIs (fully breaking in v16)

`cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are **async only** — synchronous access was removed. Always `await` them:

```tsx
// page.tsx
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  const query = await props.searchParams
}
```

Run `npx next typegen` to generate `PageProps`, `LayoutProps`, and `RouteContext` helpers for type-safe async props.

### ESLint

Use `eslint` (the CLI), not `next lint`. Config is in `eslint.config.mjs` (flat config format).

### Middleware → Proxy

The `middleware` file convention is deprecated; use `proxy.ts` instead. See `node_modules/next/dist/docs/01-app/03-api-reference/` for the `proxy` file reference.

### Turbopack (default)

Turbopack is the default bundler for both `next dev` and `next build`. Do not add `--turbopack` flags; they are redundant.

### Image generation (`opengraph-image`, `icon`, etc.)

`params` and `id` props passed to image-generating functions are now `Promise`s and must be awaited. `generateImageMetadata` still receives synchronous `params`.

## Architecture

ReadLead (`阅先`) is a Thai-language Chinese fiction reading platform supporting novels (`novel`), manga (`manga`), and audiobooks (`audiobook`).

```
app/                        # Next.js App Router routes
  page.tsx                  # home (/) — content-type filtered via ?type= searchParam
  login/ register/          # auth stubs
  dashboard/                # user library, wallet, bookmarks
  discover/                 # browse/search all works
  detail/                   # work detail page (episodes, reviews, voting)
  reader/                   # episode reader
  creator/                  # creator studio (works CRUD, episodes, promotions)
components/
  layout/                   # SiteHeader, SiteFooter, Providers, RouteGuard
  home/                     # hero slider, carousels, ranking lists
  creator/                  # studio UI (stats, revenue chart, withdraw)
  dashboard/                # profile card, wallet, bookmarks
  detail/                   # content header, episode list, reviews, voting
  reader/                   # reader toolbar, content, comments
  modals/                   # DonateModal, PurchaseEpisodeModal, TopUpModal
  shared/                   # BookCard, OrnamentalDivider
  ui/                       # shadcn/ui primitives
contexts/
  RoleContext.tsx            # role (guest|user|creator|admin) — persisted in localStorage
  ProfileContext.tsx         # user profile (display name, VIP, rank) — persisted in localStorage
  WalletContext.tsx          # coin balance — persisted in localStorage, starts at 100
lib/
  types.ts                  # all shared TypeScript types
  mock-data.ts              # all static data (MOCK_WORKS, MOCK_EPISODES, etc.)
  content-types.ts          # ContentType constants, labels, parseHomeContentType()
  utils.ts                  # cn() helper (clsx + tailwind-merge)
```

### State and data

There is **no backend or API** — all data lives in `lib/mock-data.ts`. The three React contexts (`RoleContext`, `ProfileContext`, `WalletContext`) manage client-side state persisted to `localStorage` with `rl_*` keys.

### Auth model

Auth is simulated: `RoleContext` exposes `role` and `setRole`. The header includes a dev role-switcher dropdown for toggling between `guest`, `user`, `creator`, and `admin`. `RouteGuard` (`components/layout/RouteGuard.tsx`) wraps pages that need specific roles.

### Tailwind v4 conventions

- Import with `@import "tailwindcss"` in `globals.css` (not `@tailwind base/components/utilities`)
- Theme tokens defined via `@theme inline { … }` in CSS, not in a JS config file
- PostCSS plugin: `@tailwindcss/postcss` (configured in `postcss.config.mjs`)

### Server vs. Client Components

All `app/` files are Server Components by default. Add `'use client'` only when you need state, event handlers, lifecycle hooks, or browser APIs. Context providers (`Providers.tsx`) and most `components/` files are Client Components. Pass data from Server Components to Client Components via props.
