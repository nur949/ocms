# Office Coordinator Management System (OCMS)

A professional management software built with a modern monorepo architecture.

## Tech Stack
- **Frontend:** React 19, Vite, Ant Design, TanStack Query, Zustand.
- **Backend:** Node.js, Express, Prisma ORM, SQLite.
- **Monorepo:** Turborepo, pnpm.

## Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm

### Installation
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Setup Environment Variables:
   - Create `.env` in `apps/api` (refer to `.env.example`).
   - `DATABASE_URL` should point to a local SQLite file (e.g., `file:./dev.db`).
3. Run Database Migrations & Seed:
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```
4. Start Development Server:
   ```bash
   pnpm dev
   ```

## Architecture
- `apps/web`: React Frontend.
- `apps/api`: Express Backend.
- `packages/types`: Shared TypeScript definitions.
- `packages/ui`: Reusable UI components.
- `packages/utils`: Shared helper functions.
