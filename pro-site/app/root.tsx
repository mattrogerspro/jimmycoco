import type { LinksFunction } from "react-router";
import consentStyles from "./styles/consent.css?url";
import { CONSENT_BOOTSTRAP, GA_MEASUREMENT_ID } from "./lib/consent";
import { CookieConsent } from "./components/shared/CookieConsent";
import { AnalyticsBridge } from "./components/shared/AnalyticsBridge";
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
  { rel: "preload", href: "/fonts/fraunces-var.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: "/fonts/jost-var.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: "/fonts/fraunces-var-italic.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: "/fonts/literata-var.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://www.googletagmanager.com" },
  { rel: "stylesheet", href: consentStyles },
  { rel: "icon", href: "/img/favicon.svg", type: "image/svg+xml" },
  { rel: "manifest", href: "/site.webmanifest" },
];

const FONT_FACES = `@font-face{font-family:'Fraunces';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/fraunces-var.woff2) format('woff2-variations')}
@font-face{font-family:'Fraunces';font-style:italic;font-weight:100 900;font-display:swap;src:url(/fonts/fraunces-var-italic.woff2) format('woff2-variations')}
@font-face{font-family:'Jost';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/jost-var.woff2) format('woff2-variations')}
@font-face{font-family:'Literata';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/literata-var.woff2) format('woff2-variations')}
@font-face{font-family:'Literata';font-style:italic;font-weight:100 900;font-display:swap;src:url(/fonts/literata-var-italic.woff2) format('woff2-variations')}`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3a332c" />
        <Meta />
        <style dangerouslySetInnerHTML={{ __html: FONT_FACES }} />
        <script dangerouslySetInnerHTML={{ __html: CONSENT_BOOTSTRAP }} />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Links />
      </head>
      <body>
        {children}
        <AnalyticsBridge />
        <CookieConsent />
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
