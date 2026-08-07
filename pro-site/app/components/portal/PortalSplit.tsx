import type { ReactNode } from "react";
import type React from "react";

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

const FIELD_ICONS = {
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.8 7 7.1 5.2a2 2 0 0 0 2.2 0L20.2 7" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8.2 10V7.6a3.8 3.8 0 0 1 7.6 0V10" />
      <circle cx="12" cy="15.2" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.2l7 2.6v5.5c0 4.3-2.9 8-7 9.5-4.1-1.5-7-5.2-7-9.5V5.8z" />
      <path d="m8.8 12.2 2.2 2.2 4.2-4.4" />
    </svg>
  ),
} as const;

type PortalFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "id" | "className"
> & {
  id: string;
  label: string;
  icon: keyof typeof FIELD_ICONS;
};

/** Label + leading icon + input, so every sign-in screen matches. */
export function PortalField({ id, label, icon, ...input }: PortalFieldProps) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <span className="portal-field">
        <i aria-hidden="true">{FIELD_ICONS[icon]}</i>
        <input id={id} {...input} />
      </span>
    </>
  );
}

/** Gold monogram medallion that sits at the top of each sign-in card. */
export function PortalEmblem() {
  return (
    <span className="portal-emblem" aria-hidden="true">
      <b>JC</b>
    </span>
  );
}
