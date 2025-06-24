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

## Available Simulations

- **Photoelectric Effect** – Explore how light intensity, wavelength and voltage affect electron emission in a Phet-style setup.
- **Signal Lab** – Visualize amplitude-modulated signals and compare wireless bands with penetration ratings.

## Grade Calculator Modes

The grade calculator supports several scenarios:

- **Grade Required on Final** – Calculate the score needed on a single final exam.
- **Overall Grade After Final** – See your final grade after entering your exam score.
- **Final Counts as a Test** – Find the required mark when the exam is part of the test category.
- **Multi-part Final Average** – Determine the needed average on remaining parts of a multi-day exam.
- **Weight of Final from Points** – Compute the exam weight when using a point system.
- **Final Exam with Dropped Tests** – Handle dropped test grades when the exam also counts as a test.
- **Top 6 Average** – Evaluate conditional offers based on your best course marks.

Select the desired mode from the dropdown to see the relevant inputs and results.
