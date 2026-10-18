This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install dependencies. For a fresh clone, copy the environment template:

```bash
npm install
cp .env.example .env.local
```

If `.env.local` already exists, fill it in directly without copying the template again.
Set all three variables using the values from your Supabase project:

- `NEXT_PUBLIC_SUPABASE_URL`: the project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the public anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: the server-only service-role key, required for registration and user deletion.

Keep real credentials in `.env.local`, which Git ignores. `.env.example` contains
empty values and can be committed. Restart the development server after changing
environment values. For deployment, set the same variables in your hosting
provider's environment settings.

For Vercel, add all three variables in the project's Environment Variables
settings for every environment you deploy to (for example Production and
Preview), then redeploy. Vercel does not upload `.env.local`, and an existing
deployment does not automatically receive variables added after its build.

The committed `.env.example` must remain empty. Put real values only in
`.env.local` or in the deployment provider's encrypted environment settings.

Then, run the development server:

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

## Database migration

Final vendor package selection requires the atomic Supabase RPC in
`supabase/migrations/20261017000100_set_vendor_final_package.sql`. Apply it to a
disposable or staging database first, run
`supabase/tests/set_vendor_final_package.sql`, and only then apply the same
migration through the production database deployment process. Until the RPC is
installed, the final-package endpoint intentionally returns HTTP 503.

## Verification

Run the project checks before deployment:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

The full remediation record is in
[`docs/fixes-2026-10-17.md`](docs/fixes-2026-10-17.md).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
