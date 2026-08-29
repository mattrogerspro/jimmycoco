// pro-site/react-router.config.ts
import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  ssr: true,
  presets: [vercelPreset()],
  // Only prerender routes that are genuinely read-only. Vercel publishes the
  // generated `.data` files as static assets, so prerendering a route that also
  // exports an action makes React Router form POSTs hit the static asset and
  // return 405 before the server action can run.
  prerender: [
    "/tools/spray-tan-profit-calculator",
  ],
} satisfies Config;
