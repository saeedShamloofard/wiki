This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Unit tests

Run the Vitest unit suite once:

```bash
npm test
```

Watch for changes while developing:

```bash
npm run test:watch
```

Tests live beside the code in `src/**/*.test.ts`. They cover article action
authentication and ownership, image upload validation and storage failures,
article cache reads, and summary generation during updates. Database, Redis,
authentication, Blob storage, and AI calls are mocked; no service credentials or
running development server are needed. These tests do not verify real service
integrations or browser interactions.

## End-to-end tests

Install the Chromium browser once, then run the Playwright suite:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright uses your running app at `http://localhost:3000`, or starts it with
`npm run dev` if needed. In CI it always starts a fresh server. The Playwright
version is pinned to 1.55.1 to support the project's macOS 13 development machine.

Unlike the unit tests, these tests exercise the real Next.js pages, Server
Components, and configured services. Use a **development/test environment** with
working Hexclave, Neon, and Redis configuration and at least one article with an
author. They do not create, edit, delete, or upload articles; reading an article
does increment its view count. Do not run the destructive `db:seed` script against
a database you want to preserve just to prepare tests.

The suite starts each test with a fresh signed-out browser context and covers:

- Article listing and sign-in navigation
- Opening an article and navigating back, with owner-only controls hidden
- Custom 404 pages for unknown routes and missing article ID `0` (reserved as absent in test data)
- Redirects to sign-in when visiting new/edit article pages anonymously

To target another already-running development or staging app:

```bash
E2E_BASE_URL=http://localhost:3100 npm run test:e2e
```

For interactive debugging and reports:

```bash
npm run test:e2e:ui
npm run test:e2e:report
```

Failure screenshots and traces are saved in `test-results/`; the HTML report is
in `playwright-report/`. Both are ignored by Git. Authenticated editing and real
upload flows are not covered by this initial suite.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
