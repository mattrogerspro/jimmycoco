# Monday newsletter — 3 August 2026

Editorial newsletter for Sunless by Jimmy Coco. Built in the same technical
and brand system as `existing-campaigns/flashsale/fullcampaign/`.

**Status: DRAFT — NOT APPROVED FOR SEND.** Nothing published, nothing sent.

## Files

| File | What it is |
|---|---|
| `index.html` | Reviewer preview — inbox line, desktop 600px and mobile 375px side by side, plus the click-target list. Open this first. |
| `index-email.html` | The email with local `images/` paths (what the preview renders). |
| `email.html` | Production copy — same markup, absolute image URLs. Paste into Klaviyo. |
| `images/` | Assets, copied from the flash-sale campaign folder. |

## Send plan

- **Audience:** Segment A — Engaged (`V4mDxv`, 4,771), UK-filtered. Not the full list.
- **Send time:** Monday 3 August, 10:00–11:00 UK. Not Smart Send Time.
- **Subject:** why your tan goes patchy on day three
- **A/B variant:** the bit everyone skips before tanning
- **Preview text:** It's almost never the tan itself. Here's what's actually going on.
- **Winner decided on click rate, not opens.**

## Design rationale

Click rate is the bottleneck (0.42–0.62% against a 1–2% benchmark), so this is
built for click surface rather than polish:

- No hero image. The first link lands inside the first 100px.
- Seven click targets instead of one.
- Live text throughout; a text link sits alongside every button.
- Two content images only, both with alt text.
- No discount — discounting lowered both AOV and click rate on the last send.

## Before send — outstanding

1. **Asset hosting.** `email.html` currently points at
   `jimmycoco.email/email-assets/flash-sale/images/` because those files are
   already live. Re-host under a path of this campaign's own and update the URLs.
2. **Claims sign-off.** The three tanning-technique claims need Jimmy's approval.
3. **Link destinations.** Links currently point at the collection page and The
   Glow Edit PDP. Confirm these are the intended destinations.
4. **Real test send** to 360precision@gmail.com — not an in-panel preview.

## Notes

- `_to_delete/` holds two scratch files from the build. Delete that folder.
- Nothing in `email/campaigns/` was touched. No Resend template was created,
  published or synced. No campaign was enabled.
