import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PRODUCT_PATH } from "../../lib/site";

type HeaderProps = { page?: "home" | "product" };

export function Announcement({ page = "home" }: HeaderProps) {
  return page === "product" ? (
    <div className="announce">★ Free UK delivery over £40 · <b>14-day returns</b> · Complimentary trial for new salons</div>
  ) : (
    <div className="announce">★ Complimentary professional trial for salons — <b>no cost, no commitment</b></div>
  );
}

export function SiteHeader({ page = "home" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const prefix = page === "home" ? "" : "/";

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header className={scrolled ? "scrolled" : undefined}>
      <div className="wrap nav">
        <Link className="logo" to="/">SUNLESS<small>BY JIMMY COCO®</small></Link>
        <span className="protag">Professional</span>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href={`${prefix}#story`}>Why Jimmy Coco</a>
          {page === "home" && <a href="#formula">The Solution</a>}
          <a href={`${prefix}#calculator`}>Profit Calculator</a>
          <a href={`${prefix}#retail`}>Retail Range</a>
          <a href={`${prefix}#trial`}>Free Trial</a>
        </nav>
        {page === "home" ? <Link className="btn btn-bronze btn-sm" to={PRODUCT_PATH}>Order Malibu 1L</Link> : <a className="btn btn-bronze btn-sm" href="#order">Compose order</a>}
      </div>
    </header>
  );
}

export function SiteFooter({ page = "home" }: HeaderProps) {
  return (
    <footer>
      <div className="wrap">
        <div>© Jimmy Coco, 2026 · Professional partnerships · <a href="mailto:pro@jimmycoco.co.uk">pro@jimmycoco.co.uk</a></div>
        <div>
          {page === "product" && <Link to="/">Professional home</Link>}
          <a href="https://jimmycoco.co.uk">Consumer site</a>
          <a href="https://jimmycoco.co.uk/policies/terms-of-service">Terms</a>
          {page === "home" && <a href="https://jimmycoco.co.uk/policies/privacy-policy">Privacy</a>}
        </div>
        <div className="buildlog"><span>Build log — how this page was made:</span> <a href="/audits/re-audit-salon-page.html">Conversion re-audit · salon page (8.2/10)</a></div>
      </div>
    </footer>
  );
}

export function StructuredData({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
