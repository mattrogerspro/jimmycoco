# Sunless by Jimmy Coco Professional

React Router framework-mode application built with React and Vite. Public routes are statically prerendered for crawlable HTML while route modules and page styles are emitted as separate production chunks.

## Commands

- `npm run dev` — local development server
- `npm run typecheck` — generate route types and run TypeScript
- `npm run build` — create the production site in `build/client`
- `npm run start` — serve the production build locally

## Routes

- `/` — professional salon landing page
- `/products/malibu-professional-spray-1l` — Malibu professional product page

## SEO

Each public route owns its title, description, canonical URL, social metadata and structured data. The build prerenders both routes, and `public/robots.txt` plus `public/sitemap.xml` expose them to crawlers.
