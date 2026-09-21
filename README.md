# Los Cubes Hermanos

A Next.js app for managing a personal collection of Magic: The Gathering cubes and running a draft league around them, built for me and my brother.

## Features

- **Cube collection** — Browse, add, edit, and delete cubes (regular cubes and battleboxes), each with an image, difficulty rating, and a set of two-color archetypes with their strategy notes. Cube lists are pulled live from [CubeCobra](https://cubecobra.com).
- **Draft league** — Create seasons, register players, and run matchdays made up of best-of-three rounds. Standings (points, wins, losses, draws, bye wins) are tracked automatically per season.
- **Decklist OCR** — Upload a photo of a handwritten or printed decklist and have it transcribed into a card list automatically, powered by the Anthropic API (Claude).
- **Admin area** — Dedicated screens under `/admin` for managing cubes, seasons, matchdays, and results without touching the database directly.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Prisma 7](https://www.prisma.io) with PostgreSQL
- Tailwind CSS 4
- [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk) for decklist OCR
- react-hook-form + zod for forms and validation

## Getting started

### Prerequisites

- Node.js 22+
- pnpm
- A PostgreSQL database

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the example env file and fill in your values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   | --- | --- |
   | `DATABASE_URL` | PostgreSQL connection string |
   | `ANTHROPIC_API_KEY` | API key used by the decklist OCR endpoint |

3. Run migrations and generate the Prisma client:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

   To seed the database with sample data:

   ```bash
   npx prisma db seed
   ```

4. Start the dev server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/cubes`.

## Scripts

```bash
pnpm dev     # Run the dev server
pnpm build   # Build for production
pnpm start   # Run the production build
pnpm lint    # Lint the project
```

## Project structure

```
app/
  cubes/      # Public cube browsing pages
  league/     # Public league/standings pages
  admin/      # Admin CRUD screens for cubes and league management
  api/        # Route handlers (cubes, players, seasons, matches, CubeCobra proxy, decklist OCR)
components/   # Shared UI, plus admin/ and league/ subcomponents
lib/          # Prisma client and utilities
prisma/       # Schema, migrations, and seed script
types/        # Shared TypeScript types
```

## Deployment

A multi-stage `Dockerfile` is included that builds a standalone Next.js production image (Node 22, runs `prisma generate` at build time). Provide `DATABASE_URL` and `ANTHROPIC_API_KEY` to the container at runtime.
