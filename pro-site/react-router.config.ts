// pro-site/react-router.config.ts
import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  ssr: true,
  presets: [vercelPreset()],
  prerender: [
    "/",
    "/products/malibu-professional-spray-1l",
    "/tools/spray-tan-profit-calculator",
  ],
} satisfies Config;