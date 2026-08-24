// updatesdsdsdsdsd
import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import consentStyles from "./styles/consent.css?url";
import chatStyles from "./styles/chat.css?url";
import { CONSENT_BOOTSTRAP, GA_MEASUREMENT_ID } from "./lib/consent";
import { CookieConsent } from "./components/shared/CookieConsent";
import { AnalyticsBridge } from "./components/shared/AnalyticsBridge";
import { ChatWidget } from "./components/shared/ChatWidget";
import { CurrencyProvider } from "./components/shared/CurrencyContext";
import { getSupabasePublicConfig } from "./lib/supabase.server";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "react-router";

export const links: LinksFunction = () => [
  { rel: "preload", href: "/fonts/walbaum.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: "/fonts/montserrat-var.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://www.googletagmanager.com" },
  { rel: "stylesheet", href: consentStyles },
  { rel: "stylesheet", href: chatStyles },
  { rel: "icon", href: "/img/favicon.svg", type: "image/svg+xml" },
  { rel: "manifest", href: "/site.webmanifest" },
];

export async function loader(_args: LoaderFunctionArgs) {
  return data({ supabase: getSupabasePublicConfig() });
}

// Walbaum Com Roman is a single static weight with no italic companion, so the
// display face is declared once at weight 400. Montserrat carries the whole
// 100–900 range in one variable file per style. Only the two upright faces the
// public site needs are preloaded; the italic can arrive a beat later.
// Fraunces and Jost stay declared for the admin UI, which is still on them —
// an unused @font-face costs nothing, the file is only fetched when matched.
const FONT_FACES = `@font-face{font-family:'Walbaum';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/walbaum.woff2) format('woff2')}
@font-face{font-family:'Montserrat';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/montserrat-var.woff2) format('woff2-variations')}
@font-face{font-family:'Montserrat';font-style:italic;font-weight:100 900;font-display:swap;src:url(/fonts/montserrat-var-italic.woff2) format('woff2-variations')}
@font-face{font-family:'Fraunces';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/fraunces-var.woff2) format('woff2-variations')}
@font-face{font-family:'Fraunces';font-style:italic;font-weight:100 900;font-display:swap;src:url(/fonts/fraunces-var-italic.woff2) format('woff2-variations')}
@font-face{font-family:'Jost';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/jost-var.woff2) format('woff2-variations')}`;

// A visitor can leave the site open while a deployment replaces its hashed
// JavaScript chunks. If that tab later requests an old chunk, refresh once so
// it receives the current HTML and current asset names. The session guard
// prevents a broken deployment from creating a reload loop.
const ASSET_RECOVERY_BOOTSTRAP = `(()=>{const key='jc_asset_recovery';let failed=false;const recover=()=>{failed=true;try{const page=location.pathname+location.search;if(sessionStorage.getItem(key)===page)return;sessionStorage.setItem(key,page)}catch{}location.reload()};addEventListener('vite:preloadError',event=>{event.preventDefault();recover()});addEventListener('error',event=>{const node=event.target,tag=node&&node.tagName,url=node&&(node.src||node.href);if((tag==='SCRIPT'||tag==='LINK')&&url&&/\\/assets\\/.*\\.(?:js|css)(?:\\?|$)/.test(url))recover()},true);addEventListener('load',()=>{if(!failed)try{sessionStorage.removeItem(key)}catch{}},{once:true})})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" data-asset-revision="2026-08-13-reset-2">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3a332c" />
        <Meta />
        <style dangerouslySetInnerHTML={{ __html: FONT_FACES }} />
        <script dangerouslySetInnerHTML={{ __html: CONSENT_BOOTSTRAP }} />
        <script dangerouslySetInnerHTML={{ __html: ASSET_RECOVERY_BOOTSTRAP }} />
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
  const { supabase } = useLoaderData<typeof loader>();

  return (
    <CurrencyProvider>
      <Outlet />
      <ChatWidget config={supabase} />
    </CurrencyProvider>
  );
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
