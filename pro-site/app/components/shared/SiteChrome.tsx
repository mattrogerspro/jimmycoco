import { Link } from "react-router";

type HeaderProps = { page?: "home" | "product" };

export function Announcement({ page = "home" }: HeaderProps) {
  return page === "product" ? (
    <div className="announce">★ Free UK delivery over £40 · <b>14-day returns</b> · Complimentary trial for new salons</div>
  ) : (
    <div className="announce">★ Complimentary professional trial for salons — <b>no cost, no commitment</b></div>
  );
}

export function SiteHeader({ page = "home" }: HeaderProps) {
  const prefix = page === "home" ? "" : "/";
  return (
    <header>
      <div className="wrap nav">
        <Link className="logo" to="/">SUNLESS<small>BY JIMMY COCO®</small></Link>
        <span className="protag">Professional</span>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href={`${prefix}#story`}>Why Jimmy Coco</a>
          {page === "home" && <a href="#formula">The Solution</a>}
          <a href={`${prefix}#calculator`}>Profit Calculator</a>
          <a href={`${prefix}#retail`}>Retail Range</a>
          {page === "product" && <a href="/#trial">Free Trial</a>}
        </nav>
        <a className="btn btn-bronze btn-sm" href={page === "home" ? "#trial" : "#order"}>
          {page === "home" ? "Request a trial" : "Order for your salon"}
        </a>
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
      </div>
    </footer>
  );
}

export function StructuredData({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
