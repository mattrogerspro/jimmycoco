/**
 * Canonical machine-readable campaign definitions.
 *
 * The repository owns timing, template selection, classification and exit rules.
 * Resend owns the published template content and transport. A campaign must be
 * enabled here AND EMAIL_LIVE_MODE must be true before the worker can send it.
 */
export const campaignRegistry = [
  {
    id: 'au-salon-seeding',
    version: '2026-07-14.1',
    name: 'AU Salon Seeding',
    market: 'AU',
    mode: 'sequence',
    classification: 'promotional',
    enabled: false,
    timezone: 'Australia/Sydney',
    localSendHour: 10,
    minimumContactGapHours: 16,
    exitEvents: ['reply', 'sample_requested', 'call_booked', 'trial_requested', 'unsubscribe', 'complaint', 'hard_bounce', 'existing_customer', 'manual_suppression'],
    steps: [
      { key: '01', number: 1, day: 0, templateAlias: 'au-seeding-1-opener', templateId: '8799d25e-07f9-4510-8678-73404c08b6bb', subject: 'A red-carpet tan for your salon?', requiredVariables: ['SALON_NAME', 'SENDER_EMAIL', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS'] },
      { key: '02', number: 2, day: 3, templateAlias: 'au-seeding-2-nudge', templateId: 'b65dc68f-38eb-4b3f-a442-a484fc7d866e', subject: 'A quick Jimmy Coco follow-up', requiredVariables: ['SALON_NAME', 'SENDER_EMAIL', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS'] },
      { key: '03', number: 3, day: 8, templateAlias: 'au-seeding-3-two-revenue-lines', templateId: 'e8af69af-18a1-4c70-b029-f2be59cef606', subject: 'Two tan revenue lines, one partner', requiredVariables: ['SALON_NAME', 'CALENDAR_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS'] },
      { key: '04', number: 4, day: 13, templateAlias: 'au-seeding-4-season-readiness', templateId: 'ce0aa808-9d4b-4a0b-ba1e-daece7697e53', subject: 'Before the spring racing rush', requiredVariables: ['SALON_NAME', 'CALENDAR_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS'] },
      { key: '05', number: 5, day: 20, templateAlias: 'au-seeding-5-last-call', templateId: '274f3c0d-3440-4cc7-a74a-d939b9844b5a', subject: 'Should I close the file?', requiredVariables: ['SALON_NAME', 'SHADE_GUIDE_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS'] },
    ],
    triggeredSteps: [
      { key: 'onboarding', trigger: 'sample_requested', delayDays: 0, number: 90, templateAlias: 'au-seeding-onboarding-welcome', templateId: '76bfbbee-d356-4b74-b373-e8f16f729fa5', classification: 'service', subject: "Welcome to Jimmy Coco — here's what happens next", requiredVariables: ['SALON_NAME', 'CALENDAR_LINK', 'SHADE_GUIDE_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS'] },
    ],
  },
  {
    id: 'au-salon-account-flow',
    version: '2026-07-14.1',
    name: 'AU Salon Account Flow',
    market: 'AU',
    mode: 'event',
    classification: 'service',
    enabled: false,
    timezone: 'Australia/Sydney',
    localSendHour: 10,
    steps: [
      { key: 'sample-check-in', trigger: 'sample_dispatched', delayDays: 4, number: 1, templateAlias: 'au-account-1-sample-check-in', templateId: 'ac587ebf-d58c-42bd-901b-edb239369b3d', classification: 'lifecycle', subject: 'How did the Sunset tan turn out?', requiredVariables: ['SALON_NAME', 'CALENDAR_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS', 'PREFERENCES_LINK'] },
      { key: 'terms-summary', trigger: 'setup_call_completed', delayDays: 0, number: 2, templateAlias: 'au-account-2-trade-terms-summary', templateId: '5cd45a65-aa79-40bc-af99-54ae2d67c278', classification: 'service', subject: 'Your Jimmy Coco partner terms — as promised', requiredVariables: ['WHOLESALE_MARGIN', 'MIN_OPENING_ORDER', 'REORDER_MINIMUM', 'LEAD_TIME', 'ORDER_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS', 'PREFERENCES_LINK'] },
      { key: 'order-confirmation', trigger: 'opening_order_placed', delayDays: 0, number: 3, templateAlias: 'au-account-3-first-order-confirmation', templateId: 'ab113de0-cecd-4e05-9ca8-55574785b7ae', classification: 'service', subject: 'Order confirmed — welcome to Jimmy Coco', requiredVariables: ['SALON_NAME', 'ORDER_NUMBER', 'ORDER_SUMMARY', 'ORDER_TOTAL', 'DISPATCH_DATE', 'LEAD_TIME', 'TRACKING_LINK', 'ORDER_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS', 'PREFERENCES_LINK'] },
    ],
  },
  {
    id: 'uk-salon-stockist',
    version: '2026-08-19.2',
    name: 'UK Jimmy Coco Pro Recruitment — 28-Day Seven Email',
    market: 'UK',
    mode: 'sequence',
    classification: 'promotional',
    enabled: false,
    timezone: 'Europe/London',
    localSendHour: 10,
    minimumContactGapHours: 16,
    exitEvents: ['reply', 'sample_requested', 'trial_requested', 'unsubscribe', 'complaint', 'hard_bounce', 'existing_customer', 'manual_suppression'],
    steps: [
      { key: '01-trial', number: 1, day: 0, templateAlias: 'jc-uk-prospect-01-trial-v2', templateId: 'eba8d19c-55ec-4ee0-b7e4-2f145a02ec0b', subject: 'Complimentary Jimmy Coco professional trial for {{BUSINESS_NAME}}', requiredVariables: ['BUSINESS_NAME', 'BUSINESS_TYPE', 'TRIAL_LINK'] },
      { key: '02-result', number: 2, day: 3, templateAlias: 'jc-uk-prospect-02-result-v2', templateId: 'ffdc157c-a2ee-4f85-b286-bf20af24d8a5', subject: 'The formula details clients notice after their tan', requiredVariables: ['BUSINESS_NAME', 'TRIAL_LINK'] },
      { key: '03-economics', number: 3, day: 6, templateAlias: 'jc-uk-prospect-03-economics-v2', templateId: '708c8ac6-ef80-4d98-803f-09cc1de9ddda', subject: 'The salon maths behind a premium tan (£2.14 per treatment)', requiredVariables: ['BUSINESS_NAME', 'TRIAL_LINK'] },
      { key: '04-retail', number: 4, day: 10, templateAlias: 'jc-uk-prospect-04-retail-v2', templateId: '603bcb34-1e75-44cc-83bd-eca9aea8518c', subject: 'The second revenue moment after the treatment', requiredVariables: ['BUSINESS_NAME', 'TRIAL_LINK'] },
      { key: '05-trial-guide', number: 5, day: 15, templateAlias: 'jc-uk-prospect-06-process-v2', templateId: 'fe598cad-a067-4d1a-8416-55b4d75b298e', subject: 'What to look for when you test Jimmy Coco Pro', requiredVariables: ['BUSINESS_NAME', 'TRIAL_LINK'] },
      { key: '06-onboarding', number: 6, day: 21, templateAlias: 'jc-uk-prospect-07-choice-v2', templateId: '0eb5e875-776e-4dbc-a791-5588e622066b', subject: 'How to introduce Jimmy Coco Pro to your treatment menu', requiredVariables: ['BUSINESS_NAME', 'TRIAL_LINK'] },
      { key: '07-close', number: 7, day: 28, templateAlias: 'jc-uk-prospect-05-close-v2', templateId: 'ff9a1c83-db9a-4d46-b544-fb9c542388c2', subject: 'Shall I close your file for now, {{FIRST_NAME}}?', requiredVariables: ['BUSINESS_NAME', 'TRIAL_LINK'] },
    ],
  },
  {
    id: 'us-west-coast-salon-stockist',
    version: '2026-08-19.1',
    name: 'US West Coast Jimmy Coco Pro Recruitment — V2 — Seven Email',
    market: 'US-West-Coast',
    mode: 'sequence',
    classification: 'promotional',
    enabled: false,
    timezone: 'America/Los_Angeles',
    localSendHour: 10,
    minimumContactGapHours: 16,
    exitEvents: ['reply', 'trial_requested', 'application_submitted', 'unsubscribe', 'complaint', 'hard_bounce', 'existing_customer', 'ineligible', 'manual_suppression'],
    steps: [
      { key: '01-trial', number: 1, day: 0, templateAlias: 'jc-us-wc-prospect-01-trial-v2', templateId: '8760b944-c87a-46eb-9223-8d24edafb81c', subject: 'A premium spray-tan service — with a second client-care moment after the appointment', requiredVariables: ['BUSINESS_NAME', 'BUSINESS_TYPE', 'SENDER_NAME', 'SENDER_TITLE', 'TRIAL_LINK'] },
      { key: '02-result', number: 2, day: 4, templateAlias: 'jc-us-wc-prospect-02-result-v2', templateId: '2e5cdaeb-1f61-47ce-9b62-4732a154f406', subject: 'The result is what gives a premium tan its value', requiredVariables: ['SENDER_NAME', 'SENDER_TITLE', 'TRIAL_LINK'] },
      { key: '03-retail', number: 3, day: 8, templateAlias: 'jc-us-wc-prospect-03-retail-v2', templateId: '0e3c37f9-31ad-4277-a6fc-75222a29e569', subject: 'The commercial question is not “what does it cost?” It is “what can the service support?”', requiredVariables: ['SENDER_NAME', 'SENDER_TITLE', 'TRIAL_LINK'] },
      { key: '04-partner-path', number: 4, day: 13, templateAlias: 'jc-us-wc-prospect-04-partner-path-v2', templateId: '55de732a-c2c8-42de-813d-715a1ec1acda', subject: 'One client relationship. Two useful revenue moments.', requiredVariables: ['SENDER_NAME', 'SENDER_TITLE', 'TRIAL_LINK'] },
      { key: '06-process', number: 5, day: 21, templateAlias: 'jc-us-wc-prospect-06-process-v2', templateId: 'fd62292a-a7ba-4c69-a8b0-f0db0533584f', subject: 'What happens after you request information?', requiredVariables: ['BUSINESS_NAME', 'SENDER_NAME', 'SENDER_TITLE', 'TRIAL_LINK'] },
      { key: '07-choice', number: 6, day: 32, templateAlias: 'jc-us-wc-prospect-07-choice-v2', templateId: '612adfab-caa7-4947-a5e5-e98bd306f8b2', subject: 'Would more detail be useful?', requiredVariables: ['SENDER_NAME', 'SENDER_TITLE', 'TRIAL_LINK'] },
      { key: '05-close', number: 7, day: 45, templateAlias: 'jc-us-wc-prospect-05-close-v2', templateId: 'f4d561b0-cb75-43b5-bdc3-f035068ce8fa', subject: 'Shall I close this for now?', requiredVariables: ['SENDER_NAME', 'SENDER_TITLE', 'TRIAL_LINK'] },
    ],
  },
  {
    id: 'uk-salon-onboarding',
    version: '2026-07-14.1',
    name: 'UK Salon Onboarding',
    market: 'UK',
    mode: 'sequence',
    classification: 'promotional',
    enabled: false,
    timezone: 'Europe/London',
    localSendHour: 10,
    minimumContactGapHours: 16,
    exitEvents: ['reply', 'sample_requested', 'call_booked', 'unsubscribe', 'complaint', 'hard_bounce', 'existing_customer', 'manual_suppression'],
    steps: [
      { key: '01', number: 1, day: 0, templateAlias: 'uk-onboarding-1-welcome', templateId: '25c26e93-81aa-4d98-b8fb-ae358fe02a12', subject: 'Your clients already know this name', requiredVariables: [] },
      { key: '02', number: 2, day: 3, templateAlias: 'uk-onboarding-2-the-formula', templateId: 'd412ae30-dfbe-427b-8cdd-460bb66a5617', subject: 'The professional formula, in one litre', requiredVariables: [] },
      { key: '03', number: 3, day: 6, templateAlias: 'uk-onboarding-3-the-glow', templateId: 'c381236c-37ab-47be-bb89-b01991bfc9ea', subject: 'The glow clients book again for', requiredVariables: [] },
      { key: '04', number: 4, day: 9, templateAlias: 'uk-onboarding-4-red-carpet', templateId: '1497f3a4-4693-44a0-817e-45ec6e193820', subject: 'The tan behind the red carpet', requiredVariables: [] },
      { key: '05', number: 5, day: 12, templateAlias: 'uk-onboarding-5-the-commercial-case', templateId: 'c5235369-6d83-443b-8b8a-908569677cf8', subject: 'Why the professional line pays for itself', requiredVariables: [] },
      { key: '06', number: 6, day: 16, templateAlias: 'uk-onboarding-6-whats-included', templateId: 'f9932856-8c0b-46f3-987f-fe13f5b5b880', subject: 'What a Jimmy Coco partnership includes', requiredVariables: [] },
      { key: '07', number: 7, day: 21, templateAlias: 'uk-onboarding-7-become-a-stockist', templateId: 'e6bc10c4-85db-485c-8bc9-f8f5e0a018d5', subject: 'Ready to bring it to your salon?', requiredVariables: [] },
    ],
  },
  {
    id: 'uae-dubai-salon-stockist',
    version: '2026-07-14.1',
    name: 'Dubai Stockist Recruitment',
    market: 'UAE',
    mode: 'sequence',
    classification: 'promotional',
    enabled: false,
    timezone: 'Asia/Dubai',
    localSendHour: 10,
    minimumContactGapHours: 16,
    exitEvents: ['reply', 'trial_requested', 'call_booked', 'unsubscribe', 'complaint', 'hard_bounce', 'existing_customer', 'current_negotiation', 'manual_suppression'],
    steps: [
      { key: '01', number: 1, day: 0, templateAlias: 'uae-stockist-1-dubai-introduction', templateId: 'c3d0ff13-85cb-4670-b7cc-e303babec1c4', subject: 'A Jimmy Coco introduction for your business', requiredVariables: ['BUSINESS_NAME', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS', 'TRIAL_LINK'] },
      { key: '02', number: 2, day: 4, templateAlias: 'uae-stockist-2-colour-in-dubai-light', templateId: '355ca12b-1faa-4117-bddc-7e5a43643051', subject: 'Colour that still looks right in Dubai light', requiredVariables: ['SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS', 'TRIAL_LINK'] },
      { key: '03', number: 3, day: 8, templateAlias: 'uae-stockist-3-service-and-retail', templateId: 'c7ec7c71-0143-43ca-8511-604d3f46944e', subject: 'One tan client, two considered revenue lines', requiredVariables: ['TRADE_LINK', 'CALENDAR_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS'] },
      { key: '04', number: 4, day: 13, templateAlias: 'uae-stockist-4-partner-support', templateId: 'b438770c-8bf5-44d9-a44a-528028e7d0fd', subject: 'What a Jimmy Coco partnership includes', requiredVariables: ['UAE_DELIVERY_STATEMENT', 'UAE_PARTNER_TERMS', 'CALENDAR_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS'] },
      { key: '05', number: 5, day: 18, templateAlias: 'uae-stockist-5-close-the-loop', templateId: '5b53dafb-1349-4616-93b9-e74368135c70', subject: 'Shall I close this for now?', requiredVariables: ['BUSINESS_NAME', 'SHADE_GUIDE_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS'] },
    ],
  },
  {
    id: 'au-sydney-salon-stockist',
    version: '2026-07-14.1',
    name: 'Sydney Stockist Recruitment',
    market: 'AU',
    mode: 'sequence',
    classification: 'promotional',
    enabled: false,
    timezone: 'Australia/Sydney',
    localSendHour: 10,
    minimumContactGapHours: 16,
    exitEvents: ['reply', 'trial_requested', 'sample_requested', 'call_booked', 'unsubscribe', 'complaint', 'hard_bounce', 'existing_customer', 'manual_suppression'],
    steps: [
      { key: '01', number: 1, day: 0, templateAlias: 'au-sydney-stockist-1-opener', templateId: '49f9fe6c-62f5-4dec-83ae-839692875e35', subject: 'A sun-safe glow for your salon?', requiredVariables: ['SALON_NAME', 'SENDER_EMAIL', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS', 'CITY'] },
      { key: '02', number: 2, day: 3, templateAlias: 'au-sydney-stockist-2-believable-colour', templateId: '21274f8f-af91-45b7-bad6-9cefb77ce275', subject: 're: colour that survives a Sydney summer', requiredVariables: ['SALON_NAME', 'SENDER_EMAIL', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS', 'CITY'] },
      { key: '03', number: 3, day: 8, templateAlias: 'au-sydney-stockist-3-two-revenue-lines', templateId: '4378deba-1be5-4a7b-ab5f-c758812e63e2', subject: 'Two tan revenue lines, one partner', requiredVariables: ['SALON_NAME', 'CALENDAR_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS', 'CITY'] },
      { key: '04', number: 4, day: 13, templateAlias: 'au-sydney-stockist-4-season-readiness', templateId: '6d3b070c-5ccb-4116-8965-d57b3529ec72', subject: 'Your summer is booked before summer starts', requiredVariables: ['SALON_NAME', 'CALENDAR_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS', 'CITY'] },
      { key: '05', number: 5, day: 20, templateAlias: 'au-sydney-stockist-5-last-call', templateId: '8187b327-1679-4399-a40c-9f4b5b50d642', subject: 'Shall I close the file?', requiredVariables: ['SALON_NAME', 'SHADE_GUIDE_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'BUSINESS_ADDRESS', 'CITY'] },
    ],
  },
  {
    id: 'uk-reseller-lifecycle',
    version: '2026-08-17.2',
    name: 'UK Reseller Lifecycle',
    market: 'UK',
    mode: 'event',
    classification: 'service',
    enabled: true,
    timezone: 'Europe/London',
    localSendHour: 9,
    steps: [
      { key: 'trial-request-received', trigger: 'reseller_trial_request_received', delayDays: 0, number: 1, enabled: true, templateAlias: 'jc-transactional-free-sample-request-received-v2', templateId: '5dfc9c2c-5c07-4f32-9520-708ff743ae0a', classification: 'service', subject: 'We have your free sample request', requiredVariables: ['APPLICANT_NAME', 'BUSINESS_NAME', 'SENDER_NAME'] },
      { key: 'order-request-received', trigger: 'reseller_order_request_received', delayDays: 0, number: 2, enabled: false, templateAlias: 'uk-reseller-2-order-request-received', templateId: null, classification: 'service', subject: 'We have your trade order request', requiredVariables: ['SALON_NAME', 'CONTACT_NAME', 'ORDER_SUMMARY', 'CUSTOMER_NOTES', 'SENDER_NAME', 'SENDER_TITLE', 'PREFERENCES_LINK'] },
      { key: 'internal-notice', trigger: 'reseller_application_internal_notice', delayDays: 0, number: 3, enabled: true, templateAlias: 'jc-transactional-free-sample-internal-notice-v2', templateId: 'c5199b11-c9a1-4c52-8bae-923a6ba92658', classification: 'transactional', subject: 'New free sample request — {{BUSINESS_NAME}}', requiredVariables: ['BUSINESS_NAME', 'APPLICANT_NAME', 'APPLICANT_EMAIL', 'BUSINESS_TYPE', 'SUBMISSION_SUMMARY', 'ADMIN_LINK'] },
      { key: 'approved-welcome', trigger: 'reseller_approved', delayDays: 0, number: 4, enabled: false, templateAlias: 'uk-reseller-4-approved-welcome', templateId: null, classification: 'service', subject: 'You are approved — welcome to Jimmy Coco', requiredVariables: ['SALON_NAME', 'CONTACT_NAME', 'ACCOUNT_CODE', 'PORTAL_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'PREFERENCES_LINK'] },
      { key: 'portal-order-received', trigger: 'reseller_order_submitted', delayDays: 0, number: 5, enabled: false, templateAlias: 'uk-reseller-5-portal-order-received', templateId: null, classification: 'service', subject: 'Thank you for your order', requiredVariables: ['SALON_NAME', 'CONTACT_NAME', 'ORDER_REFERENCE', 'ORDER_SUMMARY', 'ORDER_TOTAL', 'CUSTOMER_NOTES', 'SENDER_NAME', 'SENDER_TITLE', 'PREFERENCES_LINK'] },
      { key: 'order-internal-notice', trigger: 'reseller_order_internal_notice', delayDays: 0, number: 6, enabled: false, templateAlias: 'uk-reseller-6-order-internal-notice', templateId: null, classification: 'transactional', subject: 'New trade portal order — {{ORDER_REFERENCE}}', requiredVariables: ['SALON_NAME', 'CONTACT_NAME', 'CONTACT_EMAIL', 'ACCOUNT_CODE', 'ORDER_REFERENCE', 'ORDER_SUMMARY', 'ORDER_TOTAL', 'CUSTOMER_NOTES', 'ADMIN_LINK', 'SENDER_NAME', 'SENDER_TITLE', 'PREFERENCES_LINK'] },
      { key: 'declined', trigger: 'reseller_declined', delayDays: 0, number: 7, enabled: false, templateAlias: 'uk-reseller-7-declined', templateId: null, classification: 'service', subject: 'About your trade application', requiredVariables: ['SALON_NAME', 'CONTACT_NAME', 'SENDER_NAME', 'SENDER_TITLE', 'PREFERENCES_LINK'] },
    ],
  },
]

export const campaignsById = Object.fromEntries(campaignRegistry.map((campaign) => [campaign.id, campaign]))

export function findCampaign(id) {
  return campaignsById[id] || null
}

export function findStepByTemplateId(templateId) {
  for (const campaign of campaignRegistry) {
    const steps = [...campaign.steps, ...(campaign.triggeredSteps || [])]
    const step = steps.find((candidate) => candidate.templateId === templateId)
    if (step) return { campaign, step }
  }
  return null
}

export function findTriggeredStep(campaign, trigger) {
  return [...campaign.steps, ...(campaign.triggeredSteps || [])].find((step) => step.trigger === trigger && step.enabled !== false) || null
}
