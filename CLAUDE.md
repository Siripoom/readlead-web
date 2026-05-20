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

```
app/
  layout.tsx      # root layout — sets fonts (Geist/Geist Mono), metadata, body wrapper
  page.tsx        # home route (/)
  globals.css     # global styles; Tailwind imported with `@import "tailwindcss"`
public/           # static assets served at /
```

### Tailwind v4 conventions

- Import with `@import "tailwindcss"` in `globals.css` (not `@tailwind base/components/utilities`)
- Theme tokens defined via `@theme inline { … }` in CSS, not in a JS config file
- PostCSS plugin: `@tailwindcss/postcss` (configured in `postcss.config.mjs`)

### Server vs. Client Components

All `app/` files are Server Components by default. Add `'use client'` only when you need state, event handlers, lifecycle hooks, or browser APIs. Pass data from Server Components to Client Components via props.
