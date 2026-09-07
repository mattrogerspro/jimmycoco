import { useState } from "react";
import type { HeadersFunction, LinksFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, NavLink, Outlet, data, useLoaderData } from "react-router";
import portalStyles from "../styles/portal.css?url";
import { requireReseller } from "../lib/reseller-auth.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: portalStyles }];

export const meta: MetaFunction = () => [
  { title: "Trade portal | Sunless by Jimmy Coco" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export const headers: HeadersFunction = ({ loaderHeaders }) => loaderHeaders;

export async function loader({ request }: LoaderFunctionArgs) {
  const { responseHeaders, reseller } = await requireReseller(request);
  return data(
    {
      reseller: {
        businessName: reseller.business_name,
        contactName: reseller.contact_name,
        accountCode: reseller.account_code,
        pricingTier: reseller.pricing_tier,
        discountPercent: Number(reseller.discount_percent ?? 0),
      },
    },
    { headers: responseHeaders },
  );
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function PortalLayout() {
  const { reseller } = useLoaderData<typeof loader>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="portal portal-app">
      <button
        className="portal-mobile-nav-toggle"
        type="button"
        aria-expanded={mobileNavOpen}
        aria-controls="portal-navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <span aria-hidden="true">☰</span>
        <span>Menu</span>
      </button>
      <button
        className={`portal-mobile-nav-scrim${mobileNavOpen ? " is-visible" : ""}`}
        type="button"
        aria-label="Close navigation"
        tabIndex={mobileNavOpen ? 0 : -1}
        onClick={() => setMobileNavOpen(false)}
      />

      <aside className={`portal-side${mobileNavOpen ? " is-open" : ""}`}>
        <button className="portal-mobile-nav-close" type="button" onClick={() => setMobileNavOpen(false)}>
          <span>Close menu</span><span aria-hidden="true">×</span>
        </button>
        <div className="portal-side-top">
          <Link className="portal-org" to="/portal" onClick={() => setMobileNavOpen(false)}>
            <span className="portal-org-chip">JC</span>
            <span className="portal-org-name">
              <b>Jimmy Coco</b>
              <small>Professional</small>
            </span>
          </Link>

          <div className="portal-user">
            <span className="portal-user-name">
              <b>{reseller.businessName}</b>
              <small>{reseller.accountCode}</small>
            </span>
            <span className="portal-avatar" aria-hidden="true">
              {initialsOf(reseller.contactName)}
            </span>
          </div>

          <nav id="portal-navigation" className="portal-nav" aria-label="Trade portal navigation">
            <div className="portal-nav-block">
              <p className="portal-nav-group">Trade account</p>
              <NavLink to="/portal" end className="portal-nav-link" onClick={() => setMobileNavOpen(false)}>
                <i aria-hidden="true">◆</i><span>Account overview</span>
              </NavLink>
              <NavLink to="/portal/order" className="portal-nav-link" onClick={() => setMobileNavOpen(false)}>
                <i aria-hidden="true">▣</i><span>Place an order</span>
              </NavLink>
            </div>
          </nav>
        </div>

        <div className="portal-side-foot">
          <div className="portal-account-note">
            <b className="portal-capitalize">{reseller.pricingTier} pricing</b>
            <span>
              {reseller.discountPercent > 0
                ? `${reseller.discountPercent}% account discount on current trade prices.`
                : "Current Pro website pricing is applied automatically."}
            </span>
          </div>
          <a className="portal-side-btn" href="/" target="_blank" rel="noreferrer">
            Back to Pro website
          </a>
          <Form method="post" action="/portal/logout">
            <button className="portal-side-signout" type="submit">
              Sign out <span aria-hidden="true">→</span>
            </button>
          </Form>
        </div>
      </aside>

      <div className="portal-body">
        <Outlet />
      </div>
    </div>
  );
}
