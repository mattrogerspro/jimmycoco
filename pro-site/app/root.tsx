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
  { rel: "preload", href: "/fonts/manrope-var.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://www.googletagmanager.com" },
  // Article covers and the journal hero are served from Supabase Storage — a
  // third origin, which the browser cannot start connecting to until it has
  // parsed the HTML. That handshake was sitting directly in front of the LCP
  // image. crossOrigin is required: images are fetched anonymously, and a
  // preconnect without it opens a connection the image request cannot reuse.
  { rel: "preconnect", href: SUPABASE_ORIGIN, crossOrigin: "anonymous" },
  { rel: "dns-prefetch", href: SUPABASE_ORIGIN },
  { rel: "stylesheet", href: consentStyles },
  { rel: "icon", href: "/img/favicon.svg", type: "image/svg+xml" },
  { rel: "manifest", href: "/site.webmanifest" },
  // Advertise the LLM-readable index from the head, the way above-guide does.
  // Nothing requires it, but it is how an agent finds the file without guessing.
  { rel: "alternate", type: "text/plain", href: "https://www.jimmycoco.pro/llms.txt", title: "Sunless by Jimmy Coco Professional — LLM-readable site index" },
];

const SUPABASE_ORIGIN = "https://tfiumxnztxacsmgccukt.supabase.co";

/** Loads gtag once the page is idle, on first interaction, or after 4s. */
const ANALYTICS_DEFER = `(function(){var l=false;function go(){if(l)return;l=true;
var s=document.createElement('script');s.async=true;
s.src='https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
document.head.appendChild(s);}
['pointerdown','keydown','touchstart','scroll'].forEach(function(e){
addEventListener(e,go,{once:true,passive:true});});
if('requestIdleCallback' in window){requestIdleCallback(go,{timeout:4000});}
else{setTimeout(go,2500);}})();`;

const FONT_FACES = `@font-face{font-family:'Fraunces';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/fraunces-var.woff2) format('woff2-variations')}
@font-face{font-family:'Fraunces';font-style:italic;font-weight:100 900;font-display:swap;src:url(/fonts/fraunces-var-italic.woff2) format('woff2-variations')}
@font-face{font-family:'Jost';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/jost-var.woff2) format('woff2-variations')}
@font-face{font-family:'Manrope';font-style:normal;font-weight:200 800;font-display:swap;src:url(/fonts/manrope-var.woff2) format('woff2-variations')}`;

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
        {/* GTM is 161KB and roughly two thirds of it goes unused on a first
            visit. Loaded async in the head it still competed with the cover
            image for bandwidth on a slow connection, which is paid for in LCP.
            Deferring it to the first idle moment (or the first interaction,
            whichever comes first) keeps every measurement while taking it off
            the critical path. The 4s ceiling is there so a page that never goes
            idle still reports. */}
        <script dangerouslySetInnerHTML={{ __html: ANALYTICS_DEFER }} />
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
