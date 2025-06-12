# RandomSh!t Lab

This project contains a collection of physics and game simulations built with Next.js and Tailwind CSS.

## Getting Started

Install dependencies using **pnpm**:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

## Deployment

The app can be deployed to Cloudflare Workers or Pages. A basic `wrangler.toml` configuration is included. Deploy with:

```bash
npx wrangler deploy
```

Make sure you have a valid `wrangler.toml` with the correct `name`, `compatibility_date`, and `main` entry point before deploying.

### Supabase

The project integrates with Supabase for storing leaderboards. If the
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment
variables are not provided, Supabase features are disabled and the simulations
fall back to using local storage only.

