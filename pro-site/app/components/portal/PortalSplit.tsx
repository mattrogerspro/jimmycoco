import type { ReactNode } from "react";

type PortalSplitProps = {
  eyebrow: string;
  headline: ReactNode;
  blurb: string;
  children: ReactNode;
};

/** Shared split-screen frame for the trade portal's sign-in screens. */
export function PortalSplit({ eyebrow, headline, blurb, children }: PortalSplitProps) {
  return (
    <div className="portal portal-split">
      <section className="portal-visual" aria-hidden="true">
        <img
          src="/assets/site/glow-duo-bikini.webp"
          alt=""
          width="1080"
          height="1620"
          fetchPriority="high"
        />
        <div className="portal-chip portal-chip-a">
          <i>◈</i>
          <div>
            <b>Approx. 28</b>
            <span>Tans per bottle</span>
          </div>
        </div>
        <div className="portal-chip portal-chip-b">
          <i>✦</i>
          <div>
            <b>~£2.15</b>
            <span>Cost per tan</span>
          </div>
        </div>
        <div className="portal-visual-card">
          <p className="portal-visual-brand">
            SUNLESS
            <small>By Jimmy Coco</small>
          </p>
          <p className="portal-visual-eyebrow">{eyebrow}</p>
          <h2>{headline}</h2>
          <p>{blurb}</p>
        </div>
      </section>
      <section className="portal-aside">{children}</section>
    </div>
  );
}
