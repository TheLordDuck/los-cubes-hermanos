# Los Cubes Hermanos

A Next.js app for managing a personal collection of Magic: The Gathering cubes and running a draft league around them, built for me and my brother.

## Features

- **Cube collection** — Browse, add, edit, and delete cubes (regular cubes and battleboxes), each with an image, difficulty rating, and a set of two-color archetypes with their strategy notes. Cube lists are pulled live from [CubeCobra](https://cubecobra.com).
- **Draft league** — Create seasons, register players, and run matchdays made up of best-of-three rounds. Standings (points, wins, losses, draws, bye wins) are tracked automatically per season.
- **Decklist OCR** — Upload a photo of a handwritten or printed decklist and have it transcribed into a card list in the browser with Tesseract.js, with card names checked against Scryfall. An alternative Claude-based endpoint (`/api/decklist-ocr`) exists but is disabled by default.
- **Admin area** — Dedicated screens under `/admin` for managing cubes, seasons, matchdays, and results without touching the database directly, behind a shared admin password.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Prisma 7](https://www.prisma.io) with PostgreSQL
- Tailwind CSS 4
- [Tesseract.js](https://tesseract.projectnaptha.com) for decklist OCR (optional, disabled: [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk))
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
   | `CLAUDE_DECKLIST_OCR` | Optional. Set to `1` to enable the disabled Claude OCR endpoint |
   | `ANTHROPIC_API_KEY` | Optional. Only used when `CLAUDE_DECKLIST_OCR=1` |
   | `ADMIN_PASSWORD` | Password for the `/admin` area and for every write to the API |

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

The app ships as a Docker image (multi-stage `Dockerfile`, Node 22, Next.js standalone output). On start, the container runs `prisma migrate deploy` and then launches the server on port 3000. `GET /api/health` is used as the healthcheck.

### Coolify

1. Create a PostgreSQL database in Coolify (or use an existing one) and copy its internal connection URL.
2. Add a new resource from this Git repository and pick the **Dockerfile** build pack.
3. Set **Ports Exposes** to `3000` and attach your domain. Coolify's proxy provides HTTPS, which the admin login cookie requires.
4. Add the environment variables:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Internal URL of the Coolify PostgreSQL database |
   | `ADMIN_PASSWORD` | Password for `/admin` |
   | `ANTHROPIC_API_KEY` | Not needed (Claude OCR is disabled by default) |

5. Deploy. Migrations apply automatically on each start; set `SKIP_MIGRATIONS=1` to turn that off. To load the sample cubes once, run `npx prisma db seed` locally against the same database.
