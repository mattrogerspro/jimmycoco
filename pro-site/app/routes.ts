import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products/malibu-professional-spray-1l", "routes/product.tsx"),
  route("articles", "routes/articles.tsx"),
  route("articles/:slug", "routes/article.tsx"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("rss.xml", "routes/rss.ts"),
  route("admin/login", "routes/admin.login.tsx"),
  route("admin/logout", "routes/admin.logout.tsx"),
  route("admin", "routes/admin.layout.tsx", [
    index("routes/admin.index.tsx"),
    route("articles", "routes/admin.articles.tsx"),
    route("articles/:articleId", "routes/admin.article-editor.tsx"),
    route("media", "routes/admin.media.tsx"),
    route("resellers", "routes/admin.resellers.tsx"),
  ]),
  route("portal/login", "routes/portal.login.tsx"),
  route("portal/register", "routes/portal.register.tsx"),
  route("portal/logout", "routes/portal.logout.tsx"),
  route("portal", "routes/portal.layout.tsx", [
    index("routes/portal.index.tsx"),
    route("order", "routes/portal.order.tsx"),
  ]),
] satisfies RouteConfig;
