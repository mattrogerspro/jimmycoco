import type { HeadersFunction, LinksFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, NavLink, Outlet, data } from "react-router";
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

export default function PortalLayout() {
  return (
    <div className="portal">
      <header className="portal-bar">
        <div className="portal-bar-inner">
          <Link className="portal-brand" to="/portal">
            SUNLESS<small>Trade portal</small>
          </Link>
          <nav className="portal-nav">
            <NavLink to="/portal" end>
              Account
            </NavLink>
            <NavLink to="/portal/order">Place an order</NavLink>
            <Form method="post" action="/portal/logout">
              <button type="submit">Sign out</button>
            </Form>
          </nav>
        </div>
      </header>
      <main className="portal-main">
        <Outlet />
      </main>
    </div>
  );
}
