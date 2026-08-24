export type TrialAttribution = {
  campaignId: 'uk-salon-stockist' | 'us-west-coast-salon-stockist';
  emailStep: string;
  market: 'UK' | 'US-West-Coast';
};

export const TRIAL_ATTRIBUTION_FIELDS: Readonly<{
  campaign: 'outreach_campaign';
  email: 'outreach_step';
  market: 'outreach_market';
}>;
export const US_WEST_COAST_SERVICE_STATES: ReadonlySet<string>;
export function parseTrialAttribution(input: URLSearchParams | FormData | Record<string, unknown> | null | undefined): TrialAttribution | null;
export function buildCampaignTrialUrl(baseUrl: string, campaignId: string, emailStep: string): string;
export function isUsTrialAttribution(attribution: TrialAttribution | null | undefined): boolean;
export function classifyUsTrialServiceability(state: unknown): {
  state: string;
  status: 'review_required' | 'eligible_area' | 'outside_current_area';
};
