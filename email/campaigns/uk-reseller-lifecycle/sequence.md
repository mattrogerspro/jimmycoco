# UK Reseller Lifecycle — copy

Event-triggered service and transactional emails for pro-site forms, reseller approval and portal orders. Tokens use the engine's uppercase Resend variable names from `api/_lib/resend.js`.

---

## 1 · Free trial request received

- **Trigger:** `reseller_trial_request_received`
- **Classification:** service
- **Source HTML:** `emails/1-free-trial-request-received.html`
- **Subject:** We have your free trial request
- **Preview:** Your complimentary trial request is with us.
- **Tokens:** `{{CONTACT_NAME}}`, `{{SALON_NAME}}`, `{{SENDER_NAME}}`, `{{SENDER_TITLE}}`, `{{BUSINESS_ADDRESS}}`, `{{PREFERENCES_LINK}}`
- **Primary CTA:** none

```text
Hi {{CONTACT_NAME}},

Your complimentary trial request for {{SALON_NAME}} has reached us. There is nothing else you need to do right now.

What happens next

- We review your salon details and check the best next step.
- If everything is suitable, the team will arrange your trial box and shade guidance.
- You can reply to this email at any point if your details need changing.

Changed your mind? Reply and we will remove the request.
```

## 2 · Product-page order request received

- **Trigger:** `reseller_order_request_received`
- **Classification:** service
- **Source HTML:** `emails/2-order-request-received.html`
- **Subject:** We have your trade order request
- **Preview:** Your order request is with us — no payment has been taken.
- **Tokens:** `{{CONTACT_NAME}}`, `{{SALON_NAME}}`, `{{ORDER_SUMMARY}}`, `{{CUSTOMER_NOTES}}`, `{{SENDER_NAME}}`, `{{SENDER_TITLE}}`, `{{BUSINESS_ADDRESS}}`, `{{PREFERENCES_LINK}}`
- **Primary CTA:** none

```text
Hi {{CONTACT_NAME}},

Your order request for {{SALON_NAME}} has reached us. No payment has been taken online.

Order requested

{{ORDER_SUMMARY}}

The partnerships team will review the request, confirm trade pricing and availability, then come back to you by email.

Notes supplied with the request: {{CUSTOMER_NOTES}}
```

## 3 · Internal pro-site request notice

- **Trigger:** `reseller_application_internal_notice`
- **Classification:** transactional
- **Source HTML:** `emails/3-internal-notice.html`
- **Subject:** New pro-site request — {{SALON_NAME}}
- **Preview:** A pro-site form has been submitted. Review it in the admin.
- **Tokens:** `{{REQUEST_TYPE}}`, `{{SALON_NAME}}`, `{{CONTACT_NAME}}`, `{{CONTACT_EMAIL}}`, `{{BUSINESS_TYPE}}`, `{{SUBMISSION_SUMMARY}}`, `{{ADMIN_LINK}}`, `{{SENDER_NAME}}`, `{{SENDER_TITLE}}`, `{{BUSINESS_ADDRESS}}`, `{{PREFERENCES_LINK}}`
- **Primary CTA:** Review in the admin

```text
A new pro-site request has come in through www.jimmycoco.pro.

- Request type: {{REQUEST_TYPE}}
- Business: {{SALON_NAME}}
- Contact: {{CONTACT_NAME}}
- Email: {{CONTACT_EMAIL}}
- Type: {{BUSINESS_TYPE}}

{{SUBMISSION_SUMMARY}}

Review in the admin: {{ADMIN_LINK}}
```

## 4 · Approved welcome / signup

- **Trigger:** `reseller_approved`
- **Classification:** service
- **Source HTML:** `emails/4-approved-welcome.html`
- **Subject:** You are approved — welcome to Jimmy Coco
- **Preview:** Your trade account is open. Set a password and your pricing is waiting.
- **Tokens:** `{{CONTACT_NAME}}`, `{{SALON_NAME}}`, `{{ACCOUNT_CODE}}`, `{{PORTAL_LINK}}`, `{{SENDER_NAME}}`, `{{SENDER_TITLE}}`, `{{BUSINESS_ADDRESS}}`, `{{PREFERENCES_LINK}}`
- **Primary CTA:** Set your password

```text
Hi {{CONTACT_NAME}},

{{SALON_NAME}} is now a Jimmy Coco trade account. Your account reference is {{ACCOUNT_CODE}}.

Set your password to open the portal: {{PORTAL_LINK}}

Once you are in, you will find your trade pricing, account details and the portal order form.
```

## 5 · Portal order received

- **Trigger:** `reseller_order_submitted`
- **Classification:** service
- **Source HTML:** `emails/5-portal-order-received.html`
- **Subject:** Thank you for your order
- **Preview:** Your trade portal order has been received.
- **Tokens:** `{{CONTACT_NAME}}`, `{{SALON_NAME}}`, `{{ORDER_REFERENCE}}`, `{{ORDER_SUMMARY}}`, `{{ORDER_TOTAL}}`, `{{CUSTOMER_NOTES}}`, `{{SENDER_NAME}}`, `{{SENDER_TITLE}}`, `{{BUSINESS_ADDRESS}}`, `{{PREFERENCES_LINK}}`
- **Primary CTA:** none

```text
Hi {{CONTACT_NAME}},

We have received order {{ORDER_REFERENCE}} for {{SALON_NAME}}. No payment has been taken in the portal.

{{ORDER_SUMMARY}}

Total: {{ORDER_TOTAL}}

The team will confirm stock and the invoice by email.

Notes supplied with the order: {{CUSTOMER_NOTES}}
```

## 6 · Internal portal order notice

- **Trigger:** `reseller_order_internal_notice`
- **Classification:** transactional
- **Source HTML:** `emails/6-order-internal-notice.html`
- **Subject:** New trade portal order — {{ORDER_REFERENCE}}
- **Preview:** An approved reseller has submitted a portal order.
- **Tokens:** `{{SALON_NAME}}`, `{{CONTACT_NAME}}`, `{{CONTACT_EMAIL}}`, `{{ACCOUNT_CODE}}`, `{{ORDER_REFERENCE}}`, `{{ORDER_SUMMARY}}`, `{{ORDER_TOTAL}}`, `{{CUSTOMER_NOTES}}`, `{{ADMIN_LINK}}`, `{{SENDER_NAME}}`, `{{SENDER_TITLE}}`, `{{BUSINESS_ADDRESS}}`, `{{PREFERENCES_LINK}}`
- **Primary CTA:** Open order in admin

```text
An approved reseller has submitted an order through the trade portal.

- Reference: {{ORDER_REFERENCE}}
- Business: {{SALON_NAME}}
- Account: {{ACCOUNT_CODE}}
- Contact: {{CONTACT_NAME}}
- Email: {{CONTACT_EMAIL}}
- Total: {{ORDER_TOTAL}}

{{ORDER_SUMMARY}}

Notes: {{CUSTOMER_NOTES}}

Open order in admin: {{ADMIN_LINK}}
```

## 7 · Declined

- **Trigger:** `reseller_declined`
- **Classification:** service
- **Source HTML:** `emails/7-declined.html`
- **Subject:** About your trade application
- **Preview:** We are not able to open an account right now.
- **Tokens:** `{{CONTACT_NAME}}`, `{{SALON_NAME}}`, `{{SENDER_NAME}}`, `{{SENDER_TITLE}}`, `{{BUSINESS_ADDRESS}}`, `{{PREFERENCES_LINK}}`
- **Primary CTA:** none

```text
Hi {{CONTACT_NAME}},

Thank you for applying for a trade account for {{SALON_NAME}}. We are not able to open one at the moment.

That is a decision about fit and timing, not about the quality of your business.

If your circumstances change, you are welcome to apply again. Replying to this email reaches us directly.
```
