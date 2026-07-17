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
  ]),
] satisfies RouteConfig;
