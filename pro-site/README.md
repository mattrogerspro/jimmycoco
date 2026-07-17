# Sunless by Jimmy Coco Professional

React Router framework-mode application built with React and Vite. The app uses a hybrid Vercel deployment: stable marketing routes are statically prerendered, while a Node SSR bundle handles dynamic routes. Route modules and page styles are emitted as separate production chunks.

## Commands

- `npm run dev` — local development server
- `npm run typecheck` — generate route types and run TypeScript
- `npm run build` — create prerendered assets in `build/client` and the SSR runtime in `build/server`
- `npm run start` — serve the production build locally

## Routes

- `/` — professional homepage, prerendered
- `/products/malibu-professional-spray-1l` — product page, prerendered
- `/admin/login` — private article staff login
- `/admin/articles` — server-rendered admin/editor workspace
- `/articles` and `/articles/:slug` — crawlable public journal
- `/sitemap.xml` and `/rss.xml` — live publishing feeds

## Article admin authentication

The admin uses Supabase Auth with request-scoped SSR clients and HttpOnly,
SameSite cookies. Every protected request verifies the signed JWT and then
checks the active `article_admin_profiles` role through RLS. Admin responses
are private, non-cacheable and excluded from indexing.

Set these runtime variables locally and in Vercel:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

The secret/service-role key is not required by the deployed site. It is only
used by the local, one-time first-admin command.

Run the bootstrap as a dry run first:

```bash
npm run admin:bootstrap -- --email admin@example.com --name "Admin Name"
```

If the Auth user already exists, add `--apply`. If the project has no Auth
user yet, also add `--create-user` and provide a unique password of at least
12 characters through `ARTICLE_ADMIN_INITIAL_PASSWORD` in either the shared
root `.env.local` or `pro-site/.env.local`. The bootstrap refuses to promote
another account after an active administrator exists.

## Publishing

Published articles render through SSR immediately. Production builds also
prerender the article index and every published slug. Configure
`VERCEL_DEPLOY_HOOK_URL` to start a fresh Vercel build whenever an administrator
publishes, matching the static-on-publish workflow while retaining SSR as a
reliable fallback.

## SEO

Each public route owns its title, description, canonical URL, social metadata and structured data. The build prerenders both routes, and `public/robots.txt` plus `public/sitemap.xml` expose them to crawlers.
