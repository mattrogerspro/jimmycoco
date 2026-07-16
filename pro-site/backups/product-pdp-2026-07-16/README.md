# Product PDP rollback snapshot

This folder contains the product purchase section and header immediately before the 16 July 2026 UI/UX simplification.

To restore it from the `pro-site` directory:

```sh
cp backups/product-pdp-2026-07-16/ProductPurchase.tsx app/components/product/ProductPurchase.tsx
cp backups/product-pdp-2026-07-16/SiteChrome.tsx app/components/shared/SiteChrome.tsx
cp backups/product-pdp-2026-07-16/product.css app/styles/product.css
npm run typecheck
npm run build
```

The snapshot is excluded from the application build and is not served publicly.
