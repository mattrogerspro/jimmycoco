import type { LinksFunction } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Jost:wght@300;400;500;600&display=swap",
  },
  { rel: "icon", href: "/img/favicon.svg", type: "image/svg+xml" },
  { rel: "manifest", href: "/site.webmanifest" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3a332c" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main style={{ fontFamily: "Jost, sans-serif", padding: "12vh 8vw", textAlign: "center" }}>
      <p style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Sunless by Jimmy Coco</p>
      <h1 style={{ fontFamily: "Fraunces, serif", fontSize: "clamp(42px, 8vw, 84px)", fontWeight: 400 }}>
        {notFound ? "Page not found." : "Something went wrong."}
      </h1>
      <a href="/">Return to the professional site</a>
    </main>
  );
}
