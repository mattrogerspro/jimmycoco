import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products/malibu-professional-spray-1l", "routes/product.tsx"),
] satisfies RouteConfig;
