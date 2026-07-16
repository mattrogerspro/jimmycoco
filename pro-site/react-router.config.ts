import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  prerender: ["/", "/products/malibu-professional-spray-1l"],
} satisfies Config;
