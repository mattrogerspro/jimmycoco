import { useEffect, useState } from "react";
import { Link } from "react-router";
import { openConsentPreferences } from "../../lib/consent";
import { PRODUCT_PATH } from "../../lib/site";

type HeaderProps = { page?: "home" | "product" | "content" };

export function Announcement({ page = "home" }: HeaderProps) {
  return page === "product" ? (
    <div className="announce">★ Free UK delivery over £40 · <b>14-day returns</b> · complimentary trial for new salons</div>
  ) : (
    <div className="announce">★ complimentary professional trial for salons — <b>no cost, no commitment</b></div>
  );
}

export function SiteHeader({ page = "home" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prefix = page === "home" ? "" : "/";

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`${scrolled ? "site-header scrolled" : "site-header"}${menuOpen ? " menu-open" : ""}`}>
      <div className="wrap nav">
        <Link className="logo" to="/" onClick={closeMenu}>SUNLESS<small>BY JIMMY COCO®</small></Link>
        <span className="protag">Professional</span>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href={`${prefix}#story`}>Why Jimmy Coco</a>
          {page === "home" && <a href="#formula">The Solution</a>}
          <Link to="/tools/spray-tan-profit-calculator">Profit Calculator</Link>
          <a href={`${prefix}#retail`}>Retail Range</a>
          <Link to="/articles">Articles</Link>
          <a href={`${prefix}#trial`}>Free Trial</a>
        </nav>
        {page === "product" ? <a className="btn btn-bronze btn-sm" href="#configure-solution">Start order</a> : <Link className="btn btn-bronze btn-sm" to={PRODUCT_PATH}>Order Malibu 1L</Link>}
        <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-primary-navigation" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
      </div>
      <nav id="mobile-primary-navigation" className={`mobile-nav${menuOpen ? " open" : ""}`} aria-label="Mobile navigation">
        <a href={`${prefix}#story`} onClick={closeMenu}>Why Jimmy Coco</a>
        {page === "home" && <a href="#formula" onClick={closeMenu}>The Solution</a>}
        <Link to="/tools/spray-tan-profit-calculator" onClick={closeMenu}>Profit Calculator</Link>
        <a href={`${prefix}#retail`} onClick={closeMenu}>Retail Range</a>
        <Link to="/articles" onClick={closeMenu}>Articles</Link>
        <a href={`${prefix}#trial`} onClick={closeMenu}>Free Trial</a>
        {page === "product" ? <a className="mobile-menu-order" href="#configure-solution" onClick={closeMenu}>Start order</a> : <Link className="mobile-menu-order" to={PRODUCT_PATH} onClick={closeMenu}>Order Malibu 1L</Link>}
      </nav>
    </header>
  );
}

export function SiteFooter({ page = "home" }: HeaderProps) {
  return (
    <footer>
      <div className="wrap">
        <div>© Jimmy Coco, 2026 · Professional partnerships</div>
        <div>
          {page !== "home" && <Link to="/">Professional home</Link>}
          <a href="https://jimmycoco.co.uk">Consumer site</a>
          <a href="https://jimmycoco.co.uk/policies/terms-of-service">Terms</a>
          <button type="button" className="foot-consent" onClick={() => openConsentPreferences()}>Cookie settings</button>
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
