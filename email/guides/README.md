# Studio Help & Guides

Employee-facing guides that appear automatically in the Studio's **Help & guides** section. They teach anyone at Sunless how to request, generate and release email campaigns — no tooling or repository knowledge required.

## How this folder works

- Every `*.md` file here (except this README) is discovered automatically by the Studio via `src/data/content.js` and rendered in the Help & guides view.
- Files are listed in filename order — keep the `00-`, `01-` numbering.
- The first `#` heading becomes the guide title; the first paragraph becomes its excerpt.
- The branded reports live in `public/guides/` (`subject-line-system-report.html`, `how-a-campaign-is-built.html`) and are embedded in the same view.

## Editing rules

These guides are a **teaching layer**, not a second source of truth. The canonical rules live in `email/00-strategy/` … `email/07-resend-integration/` and `email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md`. If a guide and a playbook ever disagree, the playbook wins — fix the guide.
