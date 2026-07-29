# Sitewide Flash Sale — HTML email

Rebuilt from the four design pages in this folder and the clean raw photography in
`../` (`6.jpg`–`13.jpg`). All copy is live HTML text; the only baked-in type is the
hero lockup.

**Subject:** Sitewide Flash Sale — up to 25% off
**Preview text:** Up to 25% off sitewide. Malibu Beach Duo £28, A-List Glow Kit £48, A-List Essentials £37, The Glow Edit £32.

## Files

| File | Use |
|---|---|
| `index.html` | Local preview — relative `images/` paths |
| `email.html` | Send-ready — absolute `https://jimmycoco.email/email-assets/flash-sale/images/…` |
| `email.txt` | Plain-text multipart alternative |
| `images/` | 13 assets — **984 KB total** |
| `make_hero.mjs` | Composites the flash-sale lockup onto the product photograph |
| `make_assets.py` | Every other derivative, plus the scallop and connect marks |

## Hosting

Copy `images/` to `public/email-assets/flash-sale/images/` and deploy. Note the `images/`
segment — `vercel.json` now 404s a wrong path under `email-assets/` rather than silently
returning the Studio SPA.

## Structure

Hero → three bundles + SHOP NOW → model band → Kylie Jenner → The Glow Edit → Let's Connect → footer.

## The hero lockup

The design sets "UP TO 25% OFF" and a very large "FLASH SALE" in Playfair Display over the
boat photograph. Direct font downloads are blocked in this environment, so `make_hero.mjs`
renders the lockup through headless Chromium — which *can* reach Google Fonts — and
screenshots it at 1200×1700. That gives the real typeface rather than a substitute.

This is the one place type is baked into an image. The offer is carried in the subject line,
the preview text and the hero's `alt` attribute, so it still lands with images blocked.

## Photography

Six of the eight raws are A4 pages with white margins around the artwork. `trim()` finds the
real content box and crops to it — otherwise page-white leaks in as a halo against the
email's warm grey.

Two raws (`12.jpg` glow edit, `13.jpg` signature) are shot on pure white. `dekey()`
flood-fills that white **from the corners** and repaints it `#EBE7E6`, so the products sit on
the page background instead of in a white box. Corner-seeding matters: a simple threshold
would also strip the white label panels on the bottles.

| Slot | Source | Export | Display |
|---|---|---|---|
| Hero | `6.jpg` + lockup | `hero.jpg` 1200×1700 | 600×850 |
| Bundle cards | `9`, `10`, `11.jpg` | 640×800 each | 180×225 desktop, full width mobile |
| Model band | `7.jpg` | `model-band.jpg` 1200×660 | 600×330 |
| Kylie | `8.jpg` | `kylie.jpg` 760×1000 | 380×500 |
| Glow Edit | `12.jpg` | `glow-edit.jpg` 660×1094 | 330×547 |
| Signature | `13.jpg` | `signature.jpg` 560×200 | 170×61 |
| Brand mark | `fullcampaign/image.png` | `logo.png` 480×146 | 240×73 |

### Card frames

The three bundle cards carry a rounded `#AD7157` outline, matching the design. That frame is
**drawn into the JPEG**, not applied with CSS: Outlook's Word engine ignores `border-radius`,
so a CSS treatment would give rounded cards in Apple Mail and Gmail and square ones in
Outlook. `card()` masks the corners against the page background and strokes the outline,
building the mask at 4× and downsampling so the arcs stay smooth. Radius and stroke are
proportional (6.6% and 1.1% of card width), sampled off the design page.

## Recreated graphics

- **Scalloped divider** — the wavy edge where the page meets the footer band, drawn as a
  20-period cubic path and rasterised to `scallop.png` (1 KB).
- **Three connect marks** — @, envelope and globe, white on a bronze disc, flattened onto the
  band colour so they need no alpha.

## Palette, sampled from the design pages

`#EBE7E6` page · `#E2D4C8` footer band · `#A16951 → #C4835F` CTA gradient ·
`#A36B52` bronze · `#9B5F44` sale price · `#B58974` struck price · `#BC7D5F` connect discs

## Type

Playfair Display for the hero and bundle names, Poppins for everything else, both via Google
Fonts with Georgia/Arial fallbacks in Outlook.

## Mobile

Verified 320, 375, 414, 480, 600 and 700px — **0px overflow at every width**.

Two things this build had to fix, both worth remembering:

- **The wrap table was rendering 638px wide, not 600.** Cell padding is *added* to a width
  under `table-layout:fixed`, so 215+385 plus 38px of gutters inflated the whole email and
  every full-bleed image sat 38px short of the right edge. All gutters now live in nested
  tables.
- **The three bundle cards rendered at 96px on a 375px screen** — unshoppable. They stack to
  full width under 620px, which is why the mobile render is much taller than desktop.

## Before sending

1. `{{unsubscribe_url}}` needs your ESP's tag.
2. Every CTA and image points at `https://jimmycoco.co.uk`. Swap for a sale collection URL
   if you have one — a sitewide sale landing on the homepage is defensible, but a
   `/collections/sale` page would convert better.
3. **The sale has no end date.** "Flash sale" with no deadline is a weak urgency claim and
   risks a misleading-promotion complaint. Add real dates or soften the wording.
4. Confirm all four price pairs against the live store before send.
5. The connect marks currently point at Instagram, `info@jimmycoco.co.uk` and the homepage —
   confirm the email address, which I inferred.
