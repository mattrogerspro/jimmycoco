# UK Reseller Lifecycle — copy

Event-triggered service sequence. Tokens use the engine's **uppercase** Resend variable names, which
are the names `buildTemplateVariables` actually sends (`api/_lib/resend.js`). Do not switch these to
lowercase — the variable would arrive unresolved.

---

## 1 · Application received

- **Trigger:** `reseller_application_received` (immediate)
- **Classification:** service
- **Source HTML:** `emails/1-application-received.html`
- **Subject A:** We have your trade application
- **Subject B:** Your Jimmy Coco trade application
- **Preview:** It is with us — here is what happens next, and when you will hear back.
- **Tokens:** `{{CONTACT_NAME}}`, `{{SALON_NAME}}`, `{{SENDER_NAME}}`, `{{SENDER_TITLE}}`, `{{BUSINESS_ADDRESS}}`, `{{PREFERENCES_LINK}}`
- **Primary CTA:** none — this message asks for nothing
- **Secondary path:** reply to the email
- **Exit effect:** none

```text
Hi {{CONTACT_NAME}},

Your trade application for {{SALON_NAME}} has reached us. Nothing else is needed from you at this
stage.

What happens next

- We read every application ourselves — there is no automated decision.
- We look at where you are, the treatments you already offer, and whether the professional line
  genuinely suits your room.
- You will hear back from us either way. If the answer is yes, your account and trade pricing come
  with it.

If anything has changed since you applied, or you would rather talk it through first, reply to this
email — it comes straight to us.

Applied by mistake, or changed your mind? Reply and we will remove your details.

{{SENDER_NAME}}
{{SENDER_TITLE}}
```

**Deliberately absent:** any promise of a response time. No service-level target has been approved,
and a missed one on the very first message costs more than it gains.

---

## 2 · Internal new-application notice

- **Trigger:** `reseller_application_internal_notice` (immediate, alongside 1)
- **Classification:** transactional · **internal recipient only**
- **Source HTML:** `emails/2-internal-notice.html`
- **Subject A:** New trade application — {{SALON_NAME}}
- **Preview:** A salon has applied for a trade account. Review it in the admin.
- **Tokens:** `{{SALON_NAME}}`, `{{CONTACT_NAME}}`, `{{CONTACT_EMAIL}}`, `{{BUSINESS_TYPE}}`, `{{ADMIN_LINK}}`
- **Primary CTA:** Review in the admin → `{{ADMIN_LINK}}`
- **Exit effect:** none

```text
A new trade application has come in through www.jimmycoco.pro.

- Business: {{SALON_NAME}}
- Contact: {{CONTACT_NAME}}
- Email: {{CONTACT_EMAIL}}
- Type: {{BUSINESS_TYPE}}

Approving it creates the trade account and sends the welcome pack. Declining sends a courteous
close. Putting it on hold sends nothing.

Review in the admin: {{ADMIN_LINK}}

Internal notification. Not sent to the applicant.
```

---

## 3 · Approved — welcome pack

- **Trigger:** `reseller_approved` (on approval in `/admin/resellers`)
- **Classification:** service
- **Source HTML:** `emails/3-approved-welcome.html`
- **Subject A:** You are approved — welcome to Jimmy Coco
- **Subject B:** Your Jimmy Coco trade account is open
- **Preview:** Your trade account is open. Set a password and your pricing is waiting.
- **Tokens:** `{{CONTACT_NAME}}`, `{{SALON_NAME}}`, `{{ACCOUNT_CODE}}`, `{{PORTAL_LINK}}`, `{{SENDER_NAME}}`, `{{SENDER_TITLE}}`, `{{BUSINESS_ADDRESS}}`, `{{PREFERENCES_LINK}}`, `{{approved_trade_terms}}`
- **Primary CTA:** Set your password → `{{PORTAL_LINK}}`
- **Exit effect:** converts the contact; no further application-stage messages

```text
Hi {{CONTACT_NAME}},

{{SALON_NAME}} is now a Jimmy Coco trade account. Your account reference is {{ACCOUNT_CODE}}.

Set your password to open the portal

Use the email address this message was sent to. Once you are in, you will find your trade pricing,
your order history, and a form to place an order whenever you need stock.

Set your password: {{PORTAL_LINK}}

What is waiting for you

- Your trade pricing on the professional litre and the retail range.
- Order requests straight from the portal — we confirm stock and invoice you, nothing is charged
  online.
- Jimmy's shade method training and the shade guide, so your team is confident from the first
  client.

Trade terms, minimum order and lead times: {{approved_trade_terms}}

If anything is unclear, reply to this email and a person will answer.

{{SENDER_NAME}}
{{SENDER_TITLE}}
```

**Blocked fact:** `{{approved_trade_terms}}` has no approved wording. It must be supplied or that
line removed before this template is published.

---

## 4 · Declined

- **Trigger:** `reseller_declined` (on decline in `/admin/resellers`)
- **Classification:** service
- **Source HTML:** `emails/4-declined.html`
- **Subject A:** About your trade application
- **Subject B:** Your Jimmy Coco trade application
- **Preview:** We are not able to open an account right now — and what that does and does not mean.
- **Tokens:** `{{CONTACT_NAME}}`, `{{SALON_NAME}}`, `{{SENDER_NAME}}`, `{{SENDER_TITLE}}`, `{{BUSINESS_ADDRESS}}`, `{{PREFERENCES_LINK}}`
- **Primary CTA:** none
- **Secondary path:** reply to the email
- **Exit effect:** closes the application; no further messages

```text
Hi {{CONTACT_NAME}},

Thank you for applying for a trade account for {{SALON_NAME}}. We are not able to open one at the
moment.

That is a decision about fit and timing, not about the quality of your business. We keep the
professional line deliberately tight in each area, and we would rather say so plainly than leave you
waiting.

If your circumstances change — a new site, a change of treatment mix, or simply a later date — you
are welcome to apply again. Replying to this email reaches us directly if you would like to talk it
through.

We will keep your details only as long as we need them for this decision. Reply at any time and we
will remove them.

{{SENDER_NAME}}
{{SENDER_TITLE}}
```

**Deliberately absent:** a stated reason. Giving a specific one invites a rebuttal, and no approved
decline criteria exist to quote. The wording keeps the door open without implying a future yes.
