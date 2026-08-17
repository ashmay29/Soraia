# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Soraia is a pnpm + Turborepo monorepo for a modern Indian-European restaurant. It contains two independent apps:

- **`apps/kepler`** — the customer-facing marketing site (Next.js 16, React 19, Tailwind CSS v4, App Router).
- **`apps/recipe`** — a minimal FastAPI backend (Python) intended to pair with Kepler. Currently an in-memory recipe CRUD demo served on port 8000 with CORS open to `localhost:3000`.

The two apps are not wired together yet; Kepler does not call the FastAPI backend in current code.

## Commands

Run from the repo root (Turborepo fans out to apps):

```bash
pnpm dev          # run all apps in dev (parallel)
pnpm build        # build all apps
pnpm lint         # lint all apps
pnpm type-check   # tsc --noEmit across apps
pnpm format       # prettier --write across the repo
pnpm format:check # prettier --check
```

Kepler-only (from `apps/kepler`): `pnpm dev` (Next dev on :3000), `pnpm build`, `pnpm start`, `pnpm lint` (eslint), `pnpm type-check`.

Recipe backend (from `apps/recipe`):

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

There is no test runner configured (root `test` script intentionally errors). `husky` + `lint-staged` run Prettier on staged files at commit time.

## Architecture notes (Kepler)

- **Single-page composition**: `src/app/page.tsx` assembles the landing page from section components in `src/components/` (`Hero`, `About`, `Experience`, `Contact`, `Footer`, `ReservationCard`, `navbar/Navigation`). `src/app/menu/page.tsx` is the only other route.
- **Theming via CSS variables, not a Tailwind config file**: Tailwind v4 is configured entirely in `src/app/globals.css` using `@theme inline`. Brand colors (`--primary` `#00382e`, `--gold`, `--accent`, etc.), fonts (`--font-display` Playfair Display, `--font-body` Cormorant Garamond, loaded from Google Fonts in `layout.tsx`), and breakpoints all live there. Use these theme tokens (e.g. `text-primary`, `font-display`) rather than hard-coded hex/px.
- **Icon/logo recoloring**: monochrome image assets are tinted with the prebuilt CSS `filter` strings in `src/lib/filters.ts` (`GOLD_FILTER`, `PRIMARY_FILTER`, `WHITE_FILTER`) — reuse these instead of writing new `filter` chains.
- **SVG flower animations**: `src/components/Hero/animations/` holds decorative animated SVGs. `FlowerBorder` is mounted globally in `layout.tsx` (wraps every page); path data lives in the `*Paths.ts` files separate from the components. `flower.css` (imported by `globals.css`) drives the animations.
- Path alias `@/*` maps to `src/*`.

## Conventions

- Prettier (`.prettierrc.json`): double quotes, semicolons, 2-space indent, 100-char width, ES5 trailing commas. `prettier-plugin-tailwindcss` auto-sorts Tailwind classes.
- TypeScript `strict` is on for Kepler.
