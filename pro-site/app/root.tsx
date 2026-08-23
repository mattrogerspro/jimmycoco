// updatesdsdsd
import type { LinksFunction } from "react-router";
import consentStyles from "./styles/consent.css?url";
import { CONSENT_BOOTSTRAP, GA_MEASUREMENT_ID } from "./lib/consent";
import { CookieConsent } from "./components/shared/CookieConsent";
import { AnalyticsBridge } from "./components/shared/AnalyticsBridge";
import { CurrencyProvider } from "./components/shared/CurrencyContext";
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
  { rel: "preload", href: "/fonts/walbaum.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: "/fonts/montserrat-var.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://www.googletagmanager.com" },
  { rel: "stylesheet", href: consentStyles },
  { rel: "icon", href: "/img/favicon.svg", type: "image/svg+xml" },
  { rel: "manifest", href: "/site.webmanifest" },
];

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

// The Jimmy-to-Heidi reveal is a core part of the homepage. Initialise it
// directly from the rendered document, before route hydration, so it remains
// available even when an older open tab briefly requests a replaced route
// chunk during deployment.
const STORY_MOTION_BOOTSTRAP = `(()=>{const scene=document.querySelector('.story-portrait');if(!scene||scene.dataset.storyMotion||matchMedia('(prefers-reduced-motion: reduce)').matches)return;scene.dataset.storyMotion='bootstrap';let frame=0,x=0,y=0;const render=()=>{frame=0;const section=scene.closest('#story'),track=scene.closest('.story-visual-track'),sr=section&&section.getBoundingClientRect(),tr=track&&track.getBoundingClientRect(),cr=scene.getBoundingClientRect(),vh=innerHeight,desktop=matchMedia('(min-width: 901px)').matches,header=document.querySelector('header.site-header'),hh=(header&&header.offsetHeight)||74,sticky=Math.max(vh-hh,1),range=Math.max(((section&&section.offsetHeight)||sticky)-sticky,1),mobileRange=Math.max(((track&&track.offsetHeight)||cr.height)-cr.height,1),progress=desktop?Math.max(0,Math.min(1,(hh-((sr&&sr.top)||cr.top))/range)):Math.max(0,Math.min(1,(hh-((tr&&tr.top)||cr.top))/mobileRange)),reveal=desktop?Math.max(0,Math.min(1,(progress-.18)/.64)):progress;scene.style.setProperty('--story-x',x.toFixed(3));scene.style.setProperty('--story-y',y.toFixed(3));scene.style.setProperty('--story-scroll',(progress*2-1).toFixed(3));scene.style.setProperty('--story-reveal',reveal.toFixed(3))},schedule=()=>{if(!frame)frame=requestAnimationFrame(render)};addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;x=Math.max(-1,Math.min(1,(event.clientX/innerWidth-.5)*2));y=Math.max(-1,Math.min(1,(event.clientY/innerHeight-.5)*2));schedule()},{passive:true});addEventListener('pageshow',schedule);render();requestAnimationFrame(schedule)})();`;

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
        <script dangerouslySetInnerHTML={{ __html: STORY_MOTION_BOOTSTRAP }} />
        <AnalyticsBridge />
        <CookieConsent />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
      <Outlet />
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
