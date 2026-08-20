# Gmail Open Rates — Data Analysis & Action Plan

**Date:** 30 July 2026 (revised — see correction below)
**Inputs:** Send-volume + open/click charts, live DNS, and the **raw headers of a delivered campaign**

---

## ⚠️ CORRECTION — authentication is fine (verified from raw headers)

An earlier version of this report concluded the campaigns were failing authentication. **That was wrong**, and it's now disproven by the raw headers of a real delivered send (`Summer Flash Sale`, 29 July, to a Gmail inbox):

```
dkim=pass   header.i=@send.jimmycoco.co.uk  header.s=s1
spf=pass    smtp.mailfrom=bounces+…@k1.send.jimmycoco.co.uk
dmarc=pass  (p=NONE)  header.from=jimmycoco.co.uk
```

**DKIM, SPF and DMARC all pass**, and the email reached the Gmail inbox. The mistake was mine: `send.jimmycoco.co.uk` is NS-delegated to Klaviyo's nameservers, so its DKIM/SPF records live on Klaviyo's side and weren't visible when I queried your DNS. **Your Klaviyo sending setup is correct.** Sections 4 and 8 below are superseded by this and by the corrected findings here.

### So the low Gmail open rate is NOT an authentication problem. What the headers *do* show:

- **You're on Klaviyo's shared IP pool** (`o1290.shared.klaviyomail.com`). Normal for your size, but your reputation is shared with other senders on that pool. A dedicated IP is only worth it above ~100k sends/month.
- **One-click unsubscribe is present** (`List-Unsubscribe-Post: One-Click`) ✅ — a Gmail bulk requirement you're already meeting.
- **Tracking is on** — open pixel and wrapped click links are both present. So the near-zero click figure isn't a tracking gap; if it's representative it's a real content/engagement signal (though the dashboard likely mixed in automated flows).
- **DMARC policy is `p=none`.** Mail passes, but the policy isn't enforced — worth moving to `p=quarantine`→`p=reject` for spoofing protection and to unlock BIMI (logo in inbox). Hardening, not urgent.
- **🐞 Real bug found:** the branded footer's "Unsubscribe" link rendered as `href=""` (empty) in the live send — our template used `{{unsubscribe_url}}`, which Klaviyo doesn't recognise. Fixed in the template to Klaviyo's `{% unsubscribe %}` tag. (Klaviyo auto-appends its own unsubscribe + the header one, so you were legally covered, but the visible link was dead.)

**Bottom line:** the Gmail number is driven by **Promotions-tab placement, list engagement, and image-heavy content** — not authentication. Focus there (sections 5B, 6) and treat the DNS items as light hardening.

---

## 1. The headline: your open-rate "ranking" is mostly a measurement artefact

Read the two charts together:

| Provider | Share of volume | Open rate | What the open rate actually means |
|---|---:|---:|---|
| **Gmail** | ~36% | ~10% | The **most honest** number here |
| Hotmail / Outlook | ~27% | ~14% | Fairly honest |
| Verizon (Yahoo/AOL) | ~12% | ~30% | Partly inflated |
| Other | ~9% | ~10% | Honest |
| **Apple** | ~7% | ~58% | **Almost entirely fake** |

Your instinct was that Gmail opens are low because mail lands in spam or Promotions. That's part of it. But the more important point is this: **Gmail isn't your worst-performing segment — it's your most accurately-measured one.**

Since 2021, **Apple Mail Privacy Protection** pre-loads the tracking pixel on the device whether or not a human opens the email. So Apple's "58%" counts machines, not people. Yahoo/Verizon does a milder version of the same thing. Gmail does the least of it, so Gmail's ~10% is the closest thing you have to a *real* human open rate.

**The uncomfortable implication:** the true open rate across your whole list is probably nearer Gmail's 10–12% than the flattering blended figure the dashboard shows. The high numbers are a mirage. Don't chase them.

---

## 2. Two-thirds of your list sits with the two hardest providers

Gmail (36%) + Hotmail/Outlook (27%) = **~63% of everything you send.** Those are also the two lowest-opening columns, and Microsoft is now the strictest of all: since **5 May 2025 Microsoft rejects non-compliant bulk mail outright** rather than just filtering it. So the majority of your list is concentrated exactly where the rules are tightest and the opens are lowest. Improving Gmail *and* Outlook placement is not a nice-to-have — it's most of your reachable audience.

---

## 3. The real emergency isn't opens — it's clicks

Look at the second chart again: **click rate is essentially zero for every provider**, including the ones with "high" opens. Apple shows ~58% open and ~0.3% click. Even Gmail's honest 10% open converts to almost no clicks.

An open-to-click ratio that low means one of three things, and you need to find out which:

1. **Click tracking isn't fully configured** — the most likely culprit given it's near-zero *everywhere*.
2. This data is dominated by **onboarding / transactional** sends where clicks aren't the goal.
3. The emails genuinely aren't driving clicks (image-heavy, weak CTAs).

**Action:** confirm click tracking is switched on in your ESP before drawing any conclusion from these numbers. If it's off, every "click rate" here is meaningless and the flash sale will look like it failed even if it worked.

---

## 4. What your DNS actually says (this is the fixable part)

**Correction (per Matt):** `jimmycoco.email` is only the **image host** (the Vercel site where `public/email-assets/` deploys) — it is *not* where campaigns send from. So the analysis below is corrected accordingly.

I looked up the live records. Here's what's there and why it matters for Gmail:

### `jimmycoco.email` — image hosting only
```
SPF:   v=spf1 include:_spf.mlsend.com +a +mx
       include:jimmycoco.email.spf.auto.dnssmarthost.net ~all
DMARC: p=none
also:  brevo-code + mailerlite-domain-verification tokens
```

Here's the thing worth flagging: **a pure image host doesn't need SPF, DKIM or MailerLite/Brevo verification** — those records only exist to *send* mail. So either this domain sent campaigns in the past (MailerLite and Brevo were both set up on it), or someone configured it to send and it isn't used that way now. **Recommendation: clean these up.** Stale sending records on a domain that only serves images are pure risk — if the domain is ever spoofed, `p=none` means nothing stops it, and the leftover config muddies your overall sending picture. Add a strict `v=DMARC1; p=reject;` and an empty/neutral SPF to a non-sending domain.

### `jimmycoco.co.uk` — brand / corporate domain
```
SPF:   v=spf1 include:spf.protection.outlook.com -all   ← Microsoft 365, correctly hardfailed
DMARC: p=none
MX:    Microsoft 365
also:  klaviyo-site-verification present
```

Corporate mail runs cleanly through Microsoft 365. The `klaviyo-site-verification` token is for **onsite tracking and signup forms — not sending**; I checked and there is **no dedicated Klaviyo sending domain configured** (`kl._domainkey`, `kl2._domainkey`, `em.`, `send.` etc. all return NXDOMAIN).

### Confirmed: campaigns send from `orders@jimmycoco.co.uk`

This is the root brand domain — and here's the problem. I scanned it for DKIM keys and found **none** (checked ~25 common selectors: Microsoft, SendGrid, Mailchimp, MailerLite, Klaviyo, Resend, Brevo — all NXDOMAIN). The SPF authorises **only Microsoft 365** and ends in `-all`.

So when a marketing email goes out from `orders@jimmycoco.co.uk` via any outside platform, here's what a receiving Gmail server sees:

- **SPF** — the platform's servers aren't in `spf.protection.outlook.com`. At best SPF passes on the *platform's* own return-path domain, which **doesn't align** with `jimmycoco.co.uk`. At worst, if the envelope sender is your domain, it **hard-fails**.
- **DKIM** — no key is published for your domain, so the platform signs with *its* domain (e.g. `klaviyomail.com`). That **doesn't align** either.
- **DMARC** — needs one aligned method. Neither aligns, so **DMARC fails on every campaign.** Only `p=none` stops it being quarantined — but a DMARC-failing message is exactly what Gmail files under Promotions or Spam.

**This is very likely a leading cause of your ~10% Gmail open rate.** Gmail strongly rewards mail it can authenticate as the brand it claims to be, and yours currently can't be.

There's a second problem on top: **you're sending bulk marketing from the same root domain as your real order confirmations and customer replies.** Every spam complaint on a promo email erodes the reputation of the domain your *transactional* mail depends on. Marketing belongs on a subdomain precisely to firewall this.

(Also minor: `orders@` reads as a transactional address, not a marketing one — a `hello@` or `news@` sender suits a flash sale better.)

---

## 5. Why Gmail *specifically* buries you — and what to do

Gmail placement is driven by three things, in order of leverage:

### A. Authentication & compliance — do this first (technical, ~half a day)
*These apply to whatever domain actually sends your campaigns — confirm which one first (section 4).*
1. **Move that domain's DMARC from `p=none` → `p=quarantine`.** Monitor the aggregate reports for a week or two first, then enforce. This is the biggest single trust signal you're likely missing.
2. **SPF `-all` (hardfail), lean includes.** Only the ESP you actually send from. A lean SPF beats a permissive one.
3. **Confirm DKIM is signing at 2048-bit** for whichever platform sends the campaigns.
4. **Lock down `jimmycoco.email` (image host):** it doesn't send, so give it `p=reject` DMARC and remove the stale MailerLite/Brevo sending records.
4. **One-click unsubscribe (RFC 8058 `List-Unsubscribe-Post` header).** Gmail *requires* this for bulk senders and honours it as a positive signal — it's far better for reputation than people hitting "report spam" because they can't find the unsubscribe.
5. **Turn on Google Postmaster Tools** for the sending domain. It shows you Gmail's *actual* reputation score for your domain and your real spam-complaint rate — you're currently flying blind on the one dashboard Google gives you for free.

Google's 2026 rules: authentication mandatory, spam-complaint rate must stay **under 0.1%** and never hit **0.3%**, one-click unsubscribe required, processed within 2 days.

### B. Escaping Promotions & rebuilding reputation (ongoing)
Gmail sorts bulk promotional mail into the **Promotions tab** — that's not spam, but it's checked far less often, which is most of your missing 10%. You can't reliably force Primary, but you improve the odds:

- **Reduce the image-to-text ratio.** Heavy, single-image promotional emails are a Promotions-tab and spam-heuristic magnet. Worth noting: the flash sale email is image-led (a big hero, baked-in headline type). It's beautiful, but it's exactly the profile Gmail files under Promotions. A more balanced live-text-to-image ratio helps placement.
- **Malibu unengaged Gmail subscribers.** Anyone on Gmail who hasn't opened in 90–180 days is actively *dragging down* your Gmail reputation — Gmail watches per-recipient engagement and learns to junk senders their users ignore. Cutting dead weight raises placement for everyone else. Counterintuitive but it's the highest-return list action you have.
- **Warm the good signal first.** On a big send, mail your most-engaged Gmail users *first*; a strong early open/click burst tells Gmail this is wanted mail before the rest goes out.
- **Ask once for the Primary tab.** In your welcome email, a line like *"drag us to your Primary tab so you don't miss a drop"* plus encouraging a reply trains Gmail that you're wanted.

### C. Open-rate levers once you're actually in the inbox
- **Recognisable from-name** — "Jimmy Coco" or "Sunless by Jimmy Coco", consistently. The from-name drives opens more than the subject.
- Subject line, preheader and send-time — covered in the flash-sale report; the Thursday-evening timing applies here too.

---

## 6. Stop optimising on open rate

Because of Apple MPP, your open rate is now a **vanity metric contaminated by machine opens**. If you tune subject lines or send times to maximise "opens," you're partly optimising for when Apple's servers pre-fetch.

Optimise on **click rate and revenue per recipient** instead — once you've confirmed click tracking is actually on (section 3). Those are the numbers that survive MPP and that actually correlate with sales.

---

## 7. Prioritised action list

### This week (technical, high-certainty)
1. **Turn on DMARC reporting** (`rua=`) on `jimmycoco.co.uk` — section 8, step 1. Zero risk, do today.
2. **Authenticate your sending platform** on the domain (DKIM + return-path CNAMEs) — section 8, step 2. *This is the big one.*
3. Confirm **click tracking** is enabled — before trusting any of this data
4. Set up **Google Postmaster Tools** for `jimmycoco.co.uk`
5. **Lock down `jimmycoco.email`** with `p=reject` + `v=spf1 -all` — section 8, step 4. Zero risk.

### This month (reputation & list)
6. **Suppress unengaged Gmail addresses** (no open in 90–180 days)
7. Consolidate to **one marketing platform** so reputation stops splitting
8. Rebalance campaign templates toward more **live text vs image**
9. Segment big sends to **engaged-first**

### Strategic (needs a decision)
10. Evaluate moving marketing from `jimmycoco.email` to a **subdomain of `jimmycoco.co.uk`** with a proper warm-up — the most likely structural lift for Gmail trust and it unlocks your logo in the inbox via BIMI once DMARC is enforced

---

## 8. The exact DNS records to add

Your marketing is unauthenticated as the brand. Here's the fix, in the order to do it. Steps 1 and 4 are zero-risk and can go in today; steps 2–3 need values from whichever platform actually sends the campaigns.

### Step 1 — Turn on DMARC reporting (do today, zero delivery risk)
Replace the bare `_dmarc.jimmycoco.co.uk` record with one that keeps `p=none` (so nothing changes yet) but starts collecting reports, so you can *see* exactly which senders are failing:

```
Host:  _dmarc.jimmycoco.co.uk
Type:  TXT
Value: v=DMARC1; p=none; rua=mailto:dmarc@jimmycoco.co.uk; fo=1; adkim=r; aspf=r
```

Feed those reports into a free reader — **Postmark DMARC**, **dmarcian**, or **Valimail** — because the raw XML is unreadable. Within a few days you'll know precisely what's failing and from where.

### Step 2 — Authenticate the sending platform (the fix that matters most)
In whichever platform sends your campaigns (Klaviyo / MailerLite / Resend — tell me and I'll be specific), run its **"Authenticate domain" / "Branded sending domain"** wizard. It will output **2–3 CNAME records** to publish on `jimmycoco.co.uk`, typically:

```
Host:  <sel>._domainkey.jimmycoco.co.uk   Type: CNAME   Value: <given by ESP>   ← DKIM
Host:  <sel2>._domainkey.jimmycoco.co.uk  Type: CNAME   Value: <given by ESP>   ← DKIM
Host:  <bounce/em>.jimmycoco.co.uk         Type: CNAME   Value: <given by ESP>   ← return-path (aligns SPF)
```

Publishing these gives you **aligned DKIM + aligned SPF**, which is what makes DMARC pass. This single step is the biggest lever on your Gmail placement. Don't hand-edit the root SPF for this — the ESP's return-path CNAME handles SPF alignment on a subdomain, which is cleaner.

### Step 3 — Move DMARC to enforcement (after step 2 verifies)
Once your reports show all legitimate mail passing (usually 1–2 weeks), tighten:

```
v=DMARC1; p=quarantine; rua=mailto:dmarc@jimmycoco.co.uk; fo=1   ← then, after another week or two:
v=DMARC1; p=reject; rua=mailto:dmarc@jimmycoco.co.uk; fo=1
```

`p=reject` is what Gmail (and Microsoft, which now *rejects* non-compliant bulk mail) treats as a fully trusted sender — and it's the prerequisite for your logo in the inbox.

### Step 4 — Lock down the image host (do today, zero risk)
`jimmycoco.email` only serves images, so make it un-spoofable and strip the stale sending config:

```
Host:  _dmarc.jimmycoco.email   Type: TXT   Value: v=DMARC1; p=reject;
Host:  jimmycoco.email           Type: TXT   Value: v=spf1 -all          ← "this domain sends no mail"
```
(and delete the old MailerLite/Brevo SPF and verification tokens once you've confirmed nothing sends from it.)

### Step 5 — Later, once at `p=reject`: BIMI (your logo in Gmail)
Requires DMARC enforcement plus a Verified Mark Certificate. Nice brand lift, not urgent — do it after steps 1–4 are bedded in.

### The bigger move (recommended): a dedicated marketing subdomain
Rather than authenticating `orders@` on the root, set the platform up on **`send.jimmycoco.co.uk`** (or `news.`) and send all marketing from `hello@send.jimmycoco.co.uk`. Same records as above, just on the subdomain. This **firewalls marketing complaints from your order/transactional reputation**, still looks unmistakably like you, and builds Gmail trust you own. It's the standard architecture and the right long-term setup.

**A no-DKIM, hard-`-all` root domain sending bulk marketing is the single biggest deliverability issue in this whole analysis — fixing authentication will likely move your Gmail number more than any creative change.**

---

## Caveats

- `jimmycoco.email` is your image host, not your sender (per Matt). I don't yet know the real sending domain — the **From address on your last campaign** resolves it, and several authentication recommendations depend on it.
- The near-zero click rate could be a tracking gap rather than a performance failure. Verify before acting on it.
- Domain/authentication changes affect live deliverability. Make DMARC and SPF changes carefully, ideally with whoever manages the DNS, and monitor Postmaster Tools after each change.

---

## Sources

- [Red Sift — 2026 bulk email sender requirements: Microsoft, Google, Yahoo](https://redsift.com/guides/bulk-email-sender-requirements)
- [Google — Email sender guidelines FAQ](https://support.google.com/a/answer/14229414)
- [Chronos — Gmail & Yahoo sender requirements 2026 for ecommerce](https://chronos.agency/blog/gmail-yahoo-email-sender-requirements-2026/)

DNS records read live on 30 July 2026. Volume and engagement figures read from the supplied dashboard screenshots.
