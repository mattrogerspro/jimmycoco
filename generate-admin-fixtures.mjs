import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildQuestionnaireRecommendations } from "../src/features/admin/adminMatching.js";
import { buildLeadScore } from "../src/features/admin/leadScoring.js";
import { buildLeadRouting } from "../src/features/admin/leadRouting.js";

const OUTPUT_PATH = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(process.cwd(), "fixtures/admin-matching-fixtures.json");

const SEED = 20260410;
const ADVISORS_PER_SERVICE_LINE = 12;
const QUESTIONNAIRE_COUNT = 168;
const QUESTIONNAIRE_START = new Date("2025-12-10T08:00:00.000Z");
const QUESTIONNAIRE_END = new Date("2026-04-09T18:00:00.000Z");

const createRng = (seed) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

const rng = createRng(SEED);

const pick = (items) => items[Math.floor(rng() * items.length)];
const pickInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
const chance = (threshold) => rng() < threshold;
const sampleUnique = (items, count) => {
  const pool = [...items];
  const selected = [];

  while (pool.length && selected.length < count) {
    const index = pickInt(0, pool.length - 1);
    selected.push(pool.splice(index, 1)[0]);
  }

  return selected;
};

const serviceLineLabels = {
  "nhs-pensions-retirement": "NHS pensions and retirement planning",
  "medical-mortgages": "Mortgages for medical professionals",
  "protection-insurance": "Income protection and insurance",
  "tax-planning": "Tax planning for medical professionals",
  "investment-wealth-planning": "Investment and wealth planning",
  "estate-planning": "Estate planning",
  "student-loan-strategy": "Student loan strategy",
  "holistic-financial-planning": "Holistic financial planning",
};

const personaLabels = {
  "final-year-medical-student": "Final year medical student",
  "foundation-junior-doctor": "Foundation or junior doctor",
  "specialty-registrar": "Specialty registrar",
  consultant: "Consultant",
  "gp-partner": "GP partner",
  "locum-portfolio-doctor": "Locum or portfolio doctor",
  dentist: "Dentist",
  "practice-owner": "Practice owner",
  "retired-career-break": "Retired or taking career break",
  "dual-income-medical-household": "Dual-income medical household",
  "parents-with-dependants": "Parents with dependants",
};

const capabilityLabels = {
  "nhs-pension-schemes-1995-2008-2015": "NHS pension schemes 1995, 2008, and 2015",
  "annual-allowance-and-pension-tax": "Annual allowance and pension tax planning",
  "locum-income-mortgage-packaging": "Locum income mortgage packaging",
  "first-time-buyer-doctors": "First-time buyer support for doctors",
  "islamic-mortgage-support": "Islamic mortgage support",
  "nhs-sick-pay-gap-analysis": "NHS sick pay gap analysis",
  "family-protection-structuring": "Family protection structuring",
  "private-practice-tax-structuring": "Private practice tax structuring",
  "multi-income-self-assessment": "Multi-income self assessment support",
  "investment-advice": "Investment advice",
  "mortgage-advice": "Mortgage advice",
  "protection-advice": "Protection advice",
};

const feeModelLabels = {
  "initial-consultation-free": "Initial consultation free",
  "fixed-fee": "Fixed fee",
  "hourly-fee": "Hourly fee",
  "aum-percentage": "AUM percentage",
  "mortgage-broker-fee": "Mortgage broker fee",
  "protection-commission": "Protection commission",
  "ongoing-retainer": "Ongoing retainer",
};

const regionLabels = {
  "remote-uk-wide": "Remote UK-wide",
  england: "England",
  scotland: "Scotland",
  wales: "Wales",
  "northern-ireland": "Northern Ireland",
};

const priorityToServiceLine = {
  "First-time buyer (need mortgage advice)": "medical-mortgages",
  "NHS Pension optimization / retirement planning": "nhs-pensions-retirement",
  "Tax planning (additional rate/self-assessment)": "tax-planning",
  "Income protection / sick pay gap cover": "protection-insurance",
  "Will writing / estate planning": "estate-planning",
  "Investment strategy (ISA/pension wrappers)": "investment-wealth-planning",
  "Student loan repayment strategy": "student-loan-strategy",
  "Private practice setup": "tax-planning",
  "Debt management": "holistic-financial-planning",
};

const firstNames = [
  "Aisha", "Amelia", "Anika", "Ben", "Callum", "Charlotte", "Chloe", "Daniel", "Eleanor",
  "Ella", "Emily", "Ethan", "Fatima", "Freya", "Grace", "Hannah", "Harriet", "Harry",
  "Imogen", "Isla", "Jack", "James", "Jasmine", "Joshua", "Laila", "Lucy", "Madeleine",
  "Marcus", "Maya", "Megan", "Mohammed", "Nadia", "Niall", "Noah", "Oliver", "Olivia",
  "Priya", "Rohan", "Rosie", "Ruby", "Saanvi", "Samuel", "Sophie", "Theo", "Thomas",
  "Victoria", "Will", "Yasmin", "Zara", "Ava", "Leo", "Mia", "Nina", "Owen", "Poppy",
];

const lastNames = [
  "Ahmed", "Bennett", "Campbell", "Chowdhury", "Clarke", "Collins", "Davies", "Edwards",
  "Ellis", "Foster", "Gibson", "Graham", "Hall", "Hamilton", "Harris", "Hughes", "Iqbal",
  "Jackson", "Khan", "Lewis", "MacLeod", "Mahmood", "Martin", "Mitchell", "Morgan", "Owen",
  "Palmer", "Patel", "Powell", "Rahman", "Reid", "Roberts", "Shah", "Simpson", "Singh",
  "Stewart", "Taylor", "Thomas", "Walker", "Watson", "White", "Williams", "Wilson", "Wood",
  "Wright", "Young", "Murray", "Sullivan", "Hussain", "Brown",
];

const cities = [
  { city: "London", postcode: "SW1A 1AA", region: "england" },
  { city: "Manchester", postcode: "M2 5DB", region: "england" },
  { city: "Leeds", postcode: "LS1 4DY", region: "england" },
  { city: "Bristol", postcode: "BS1 5UH", region: "england" },
  { city: "Birmingham", postcode: "B2 4QA", region: "england" },
  { city: "Edinburgh", postcode: "EH2 4AN", region: "scotland" },
  { city: "Glasgow", postcode: "G2 1DY", region: "scotland" },
  { city: "Cardiff", postcode: "CF10 1EP", region: "wales" },
  { city: "Belfast", postcode: "BT1 5GS", region: "northern-ireland" },
  { city: "Newcastle", postcode: "NE1 6AD", region: "england" },
  { city: "Sheffield", postcode: "S1 2GU", region: "england" },
  { city: "Southampton", postcode: "SO14 7DZ", region: "england" },
];

const leadChannels = [
  "email-introduction",
  "direct-phone-call",
  "calendar-booking-link",
  "crm-push",
];

const credentials = [
  "Diploma in Financial Planning",
  "Chartered Financial Planner",
  "Certified Financial Planner",
  "Mortgage advice qualification",
  "Equity release qualification",
  "Long-term care qualification",
];

const serviceLineConfigs = [
  {
    slug: "nhs-pensions-retirement",
    jobTitles: ["Chartered Financial Planner", "Retirement Planning Director"],
    personaPool: ["specialty-registrar", "consultant", "gp-partner", "retired-career-break"],
    secondaryLines: ["investment-wealth-planning", "tax-planning", "holistic-financial-planning"],
    capabilities: ["nhs-pension-schemes-1995-2008-2015", "annual-allowance-and-pension-tax", "investment-advice"],
    feeModels: ["initial-consultation-free", "fixed-fee", "ongoing-retainer", "aum-percentage"],
    summary: "Specialist in annual allowance planning, scheme choice, and retirement modelling for senior clinicians.",
    primaryPriority: "NHS Pension optimization / retirement planning",
  },
  {
    slug: "medical-mortgages",
    jobTitles: ["Senior Mortgage Adviser", "Medical Mortgage Specialist"],
    personaPool: ["final-year-medical-student", "foundation-junior-doctor", "specialty-registrar", "locum-portfolio-doctor"],
    secondaryLines: ["student-loan-strategy", "protection-insurance", "holistic-financial-planning"],
    capabilities: ["mortgage-advice", "locum-income-mortgage-packaging", "first-time-buyer-doctors", "islamic-mortgage-support"],
    feeModels: ["initial-consultation-free", "mortgage-broker-fee", "fixed-fee"],
    summary: "Strong on trainee progression, locum income packaging, and first-home affordability for medics.",
    primaryPriority: "First-time buyer (need mortgage advice)",
  },
  {
    slug: "protection-insurance",
    jobTitles: ["Protection Adviser", "Medical Family Protection Consultant"],
    personaPool: ["foundation-junior-doctor", "specialty-registrar", "consultant", "parents-with-dependants"],
    secondaryLines: ["holistic-financial-planning", "estate-planning", "medical-mortgages"],
    capabilities: ["protection-advice", "nhs-sick-pay-gap-analysis", "family-protection-structuring"],
    feeModels: ["initial-consultation-free", "protection-commission", "fixed-fee"],
    summary: "Built around NHS sick pay gaps, private-income protection, and family resilience planning.",
    primaryPriority: "Income protection / sick pay gap cover",
  },
  {
    slug: "tax-planning",
    jobTitles: ["Medical Tax Planner", "Private Practice Tax Director"],
    personaPool: ["consultant", "gp-partner", "locum-portfolio-doctor", "dentist", "practice-owner"],
    secondaryLines: ["nhs-pensions-retirement", "investment-wealth-planning", "holistic-financial-planning"],
    capabilities: ["private-practice-tax-structuring", "multi-income-self-assessment", "annual-allowance-and-pension-tax"],
    feeModels: ["fixed-fee", "hourly-fee", "ongoing-retainer"],
    summary: "Handles self-assessment complexity, threshold planning, and mixed NHS/private income structures.",
    primaryPriority: "Tax planning (additional rate/self-assessment)",
  },
  {
    slug: "investment-wealth-planning",
    jobTitles: ["Wealth Planning Adviser", "Investment Planning Partner"],
    personaPool: ["consultant", "gp-partner", "dual-income-medical-household", "retired-career-break"],
    secondaryLines: ["nhs-pensions-retirement", "estate-planning", "holistic-financial-planning"],
    capabilities: ["investment-advice", "annual-allowance-and-pension-tax"],
    feeModels: ["fixed-fee", "aum-percentage", "ongoing-retainer"],
    summary: "Focuses on ISA/pension wrapper strategy, long-term investing, and tax-efficient wealth accumulation.",
    primaryPriority: "Investment strategy (ISA/pension wrappers)",
  },
  {
    slug: "estate-planning",
    jobTitles: ["Estate Planning Adviser", "Later Life Planning Specialist"],
    personaPool: ["consultant", "gp-partner", "parents-with-dependants", "retired-career-break"],
    secondaryLines: ["investment-wealth-planning", "holistic-financial-planning", "protection-insurance"],
    capabilities: ["family-protection-structuring", "investment-advice"],
    feeModels: ["fixed-fee", "hourly-fee", "ongoing-retainer"],
    summary: "Supports wills, intergenerational planning, and family governance for senior medical households.",
    primaryPriority: "Will writing / estate planning",
  },
  {
    slug: "student-loan-strategy",
    jobTitles: ["Early Career Financial Planner", "Medical Career Strategy Adviser"],
    personaPool: ["final-year-medical-student", "foundation-junior-doctor", "specialty-registrar"],
    secondaryLines: ["medical-mortgages", "holistic-financial-planning", "tax-planning"],
    capabilities: ["first-time-buyer-doctors", "mortgage-advice"],
    feeModels: ["initial-consultation-free", "fixed-fee", "hourly-fee"],
    summary: "Useful for doctors weighing overpayments, flexibility, and early-career cashflow decisions.",
    primaryPriority: "Student loan repayment strategy",
  },
  {
    slug: "holistic-financial-planning",
    jobTitles: ["Medical Financial Planning Partner", "Holistic Planning Director"],
    personaPool: ["specialty-registrar", "consultant", "gp-partner", "dual-income-medical-household", "parents-with-dependants"],
    secondaryLines: ["investment-wealth-planning", "tax-planning", "estate-planning", "protection-insurance"],
    capabilities: ["investment-advice", "protection-advice", "mortgage-advice", "annual-allowance-and-pension-tax"],
    feeModels: ["fixed-fee", "ongoing-retainer", "aum-percentage"],
    summary: "Designed for linked decisions across pensions, tax, protection, borrowing, and household planning.",
    primaryPriority: "Investment strategy (ISA/pension wrappers)",
  },
];

const leadArchetypes = [
  {
    key: "fy1-first-home",
    careerStage: "FY1 Doctor",
    incomeBand: "£30,000 - £49,999",
    employmentType: "NHS training post",
    nhsPensionScheme: "2015 Scheme",
    housingStatus: "Renting privately",
    expectedIncomeChange: "Likely to increase slightly",
    primaryPriority: "First-time buyer (need mortgage advice)",
    secondaryPriorities: ["Student loan repayment strategy", "Income protection / sick pay gap cover"],
    financialAdviceFrustration: "Don't know where to start",
    timeframe: "Within the next month",
    advisorExperience: "No - this would be my first time",
    callbackProbability: 0.42,
    preferredPersonas: ["foundation-junior-doctor"],
    preferredCapabilities: ["first-time-buyer-doctors", "mortgage-advice"],
    avatarStory: "Early-career doctor trying to buy before rotating hospitals again.",
  },
  {
    key: "registrar-protection-gap",
    careerStage: "Specialty Registrar (ST1-ST8)",
    incomeBand: "£50,000 - £74,999",
    employmentType: "NHS training post",
    nhsPensionScheme: "2015 Scheme",
    housingStatus: "Own property with mortgage",
    expectedIncomeChange: "Likely to increase slightly",
    primaryPriority: "Income protection / sick pay gap cover",
    secondaryPriorities: ["Will writing / estate planning", "NHS Pension optimization / retirement planning"],
    financialAdviceFrustration: "Too busy to research options",
    timeframe: "As soon as possible (this week)",
    advisorExperience: "Yes, but they didn't specialize in medical careers",
    callbackProbability: 0.74,
    preferredPersonas: ["specialty-registrar", "parents-with-dependants"],
    preferredCapabilities: ["nhs-sick-pay-gap-analysis", "protection-advice", "family-protection-structuring"],
    avatarStory: "Registrar with young children reviewing what happens if illness interrupts training.",
  },
  {
    key: "consultant-pension-tax",
    careerStage: "Consultant / GP Partner",
    incomeBand: "£150,000+",
    employmentType: "Mixed NHS and private",
    nhsPensionScheme: "1995 Section",
    housingStatus: "Own property with mortgage",
    expectedIncomeChange: "Stay broadly the same",
    primaryPriority: "NHS Pension optimization / retirement planning",
    secondaryPriorities: ["Tax planning (additional rate/self-assessment)", "Investment strategy (ISA/pension wrappers)"],
    financialAdviceFrustration: "Previous advisor didn't understand medical careers",
    timeframe: "Within the next month",
    advisorExperience: "Yes, currently have an advisor but seeking second opinion",
    callbackProbability: 0.38,
    preferredPersonas: ["consultant"],
    preferredCapabilities: ["nhs-pension-schemes-1995-2008-2015", "annual-allowance-and-pension-tax", "investment-advice"],
    avatarStory: "Senior consultant worried about annual allowance drag and retirement timing.",
  },
  {
    key: "gp-partner-tax-structure",
    careerStage: "Consultant / GP Partner",
    incomeBand: "£150,000+",
    employmentType: "Private practice",
    nhsPensionScheme: "1995 Section",
    housingStatus: "Own property outright",
    expectedIncomeChange: "Likely to increase slightly",
    primaryPriority: "Tax planning (additional rate/self-assessment)",
    secondaryPriorities: ["Investment strategy (ISA/pension wrappers)", "Will writing / estate planning"],
    financialAdviceFrustration: "Conflicting advice from colleagues/family",
    timeframe: "2-3 months (planning ahead)",
    advisorExperience: "Yes, but only for specific needs (mortgage/accountant only)",
    callbackProbability: 0.18,
    preferredPersonas: ["gp-partner", "practice-owner"],
    preferredCapabilities: ["private-practice-tax-structuring", "multi-income-self-assessment"],
    avatarStory: "GP partner balancing drawings, pension considerations, and family wealth planning.",
  },
  {
    key: "locum-mortgage-package",
    careerStage: "Locum / Portfolio Doctor",
    incomeBand: "£100,000 - £149,999",
    employmentType: "Locum / agency",
    nhsPensionScheme: "Unsure - need guidance",
    housingStatus: "Renting privately",
    expectedIncomeChange: "Stay broadly the same",
    primaryPriority: "First-time buyer (need mortgage advice)",
    secondaryPriorities: ["Tax planning (additional rate/self-assessment)", "Income protection / sick pay gap cover"],
    financialAdviceFrustration: "Previous advisor didn't understand medical careers",
    timeframe: "As soon as possible (this week)",
    advisorExperience: "Yes, but they didn't specialize in medical careers",
    callbackProbability: 0.81,
    preferredPersonas: ["locum-portfolio-doctor"],
    preferredCapabilities: ["locum-income-mortgage-packaging", "mortgage-advice"],
    avatarStory: "High-earning locum rejected by lenders that do not understand rota income.",
  },
  {
    key: "dual-income-investment",
    careerStage: "Consultant / GP Partner",
    incomeBand: "£150,000+",
    employmentType: "Mixed NHS and private",
    nhsPensionScheme: "2008 Section",
    housingStatus: "Own property with mortgage",
    expectedIncomeChange: "Likely to increase slightly",
    primaryPriority: "Investment strategy (ISA/pension wrappers)",
    secondaryPriorities: ["NHS Pension optimization / retirement planning", "Will writing / estate planning"],
    financialAdviceFrustration: "Too busy to research options",
    timeframe: "2-3 months (planning ahead)",
    advisorExperience: "Yes, currently have an advisor but seeking second opinion",
    callbackProbability: 0.21,
    preferredPersonas: ["dual-income-medical-household", "consultant"],
    preferredCapabilities: ["investment-advice", "annual-allowance-and-pension-tax"],
    avatarStory: "Dual-income consultant household ready for coordinated long-term planning.",
  },
  {
    key: "student-loan-registrar",
    careerStage: "Core Trainee (CT1-CT3)",
    incomeBand: "£50,000 - £74,999",
    employmentType: "NHS training post",
    nhsPensionScheme: "2015 Scheme",
    housingStatus: "Renting privately",
    expectedIncomeChange: "Likely to increase significantly",
    primaryPriority: "Student loan repayment strategy",
    secondaryPriorities: ["First-time buyer (need mortgage advice)", "Investment strategy (ISA/pension wrappers)"],
    financialAdviceFrustration: "Don't know where to start",
    timeframe: "Not sure yet - want to understand options first",
    advisorExperience: "No - this would be my first time",
    callbackProbability: 0.12,
    preferredPersonas: ["foundation-junior-doctor", "specialty-registrar"],
    preferredCapabilities: ["first-time-buyer-doctors"],
    avatarStory: "Trainee weighing overpaying student loans versus building a deposit.",
  },
  {
    key: "retired-estate",
    careerStage: "Retired / Taking career break",
    incomeBand: "£100,000 - £149,999",
    employmentType: "Career break / retired",
    nhsPensionScheme: "1995 Section",
    housingStatus: "Own property outright",
    expectedIncomeChange: "May decrease",
    primaryPriority: "Will writing / estate planning",
    secondaryPriorities: ["Investment strategy (ISA/pension wrappers)", "NHS Pension optimization / retirement planning"],
    financialAdviceFrustration: "Worried about being sold products I don't need",
    timeframe: "2-3 months (planning ahead)",
    advisorExperience: "Yes, currently have an advisor but seeking second opinion",
    callbackProbability: 0.14,
    preferredPersonas: ["retired-career-break"],
    preferredCapabilities: ["family-protection-structuring", "investment-advice"],
    avatarStory: "Recently retired clinician reorganising assets, beneficiaries, and family legacy plans.",
  },
  {
    key: "dentist-owner-tax-investment",
    careerStage: "Consultant / GP Partner",
    incomeBand: "£150,000+",
    employmentType: "Private practice",
    nhsPensionScheme: "Not yet enrolled",
    housingStatus: "Own property with mortgage",
    expectedIncomeChange: "Likely to increase significantly",
    primaryPriority: "Tax planning (additional rate/self-assessment)",
    secondaryPriorities: ["Investment strategy (ISA/pension wrappers)", "Will writing / estate planning"],
    financialAdviceFrustration: "Conflicting advice from colleagues/family",
    timeframe: "Within the next month",
    advisorExperience: "Yes, but only for specific needs (mortgage/accountant only)",
    callbackProbability: 0.29,
    preferredPersonas: ["dentist", "practice-owner"],
    preferredCapabilities: ["private-practice-tax-structuring", "multi-income-self-assessment", "investment-advice"],
    avatarStory: "Practice owner looking to tighten tax structure and personal investment planning.",
  },
  {
    key: "consultant-private-practice-setup",
    careerStage: "Consultant / GP Partner",
    incomeBand: "£150,000+",
    employmentType: "Private practice",
    nhsPensionScheme: "2008 Section",
    housingStatus: "Own property with mortgage",
    expectedIncomeChange: "Likely to increase significantly",
    primaryPriority: "Private practice setup",
    secondaryPriorities: ["Tax planning (additional rate/self-assessment)", "Investment strategy (ISA/pension wrappers)"],
    financialAdviceFrustration: "Conflicting advice from colleagues/family",
    timeframe: "Within the next month",
    advisorExperience: "Yes, but only for specific needs (mortgage/accountant only)",
    callbackProbability: 0.36,
    preferredPersonas: ["consultant", "practice-owner"],
    preferredCapabilities: ["private-practice-tax-structuring", "multi-income-self-assessment", "investment-advice"],
    avatarStory: "Consultant preparing private-practice income, tax, and long-term planning structure.",
  },
  {
    key: "junior-doctor-debt-cashflow",
    careerStage: "FY1 Doctor",
    incomeBand: "£30,000 - £49,999",
    employmentType: "NHS training post",
    nhsPensionScheme: "2015 Scheme",
    housingStatus: "NHS hospital accommodation",
    expectedIncomeChange: "Likely to increase significantly",
    primaryPriority: "Debt management",
    secondaryPriorities: ["Student loan repayment strategy", "Income protection / sick pay gap cover"],
    financialAdviceFrustration: "Don't know where to start",
    timeframe: "Not sure yet - want to understand options first",
    advisorExperience: "No - this would be my first time",
    callbackProbability: 0.16,
    preferredPersonas: ["foundation-junior-doctor"],
    preferredCapabilities: ["first-time-buyer-doctors", "protection-advice"],
    avatarStory: "Junior doctor trying to prioritise debt, cash reserves, and early protection decisions.",
  },
  {
    key: "family-holistic",
    careerStage: "Consultant / GP Partner",
    incomeBand: "£100,000 - £149,999",
    employmentType: "Permanent NHS",
    nhsPensionScheme: "2015 Scheme",
    housingStatus: "Own property with mortgage",
    expectedIncomeChange: "Likely to increase slightly",
    primaryPriority: "Investment strategy (ISA/pension wrappers)",
    secondaryPriorities: ["Income protection / sick pay gap cover", "Will writing / estate planning"],
    financialAdviceFrustration: "Too busy to research options",
    timeframe: "Within the next month",
    advisorExperience: "Yes, but they didn't specialize in medical careers",
    callbackProbability: 0.47,
    preferredPersonas: ["parents-with-dependants", "dual-income-medical-household"],
    preferredCapabilities: ["investment-advice", "protection-advice", "family-protection-structuring"],
    avatarStory: "Medical household needing joined-up decisions across cashflow, cover, and investing.",
  },
  {
    key: "foundation-protection-renter",
    careerStage: "FY2 Doctor",
    incomeBand: "£30,000 - £49,999",
    employmentType: "NHS training post",
    nhsPensionScheme: "2015 Scheme",
    housingStatus: "Living with partner/spouse (they own/rent)",
    expectedIncomeChange: "Likely to increase significantly",
    primaryPriority: "Income protection / sick pay gap cover",
    secondaryPriorities: ["Student loan repayment strategy", "First-time buyer (need mortgage advice)"],
    financialAdviceFrustration: "Worried about being sold products I don't need",
    timeframe: "Within the next month",
    advisorExperience: "No - this would be my first time",
    callbackProbability: 0.63,
    preferredPersonas: ["foundation-junior-doctor"],
    preferredCapabilities: ["nhs-sick-pay-gap-analysis", "protection-advice"],
    avatarStory: "Foundation doctor looking for simple, medically relevant protection advice.",
  },
];

const adminUsers = [
  {
    id: "admin-super-001",
    auth_user_id: "auth-super-001",
    created_at: "2025-10-01T09:00:00.000Z",
    updated_at: "2026-04-08T07:12:00.000Z",
    email: "matthew.rogers@pmf-admin.test",
    full_name: "Matthew Rogers",
    role: "super_admin",
    is_active: true,
    invited_by_user_id: null,
    last_login_at: "2026-04-10T07:38:00.000Z",
    notes: "Primary PMF super admin used for fixture-mode dashboard testing.",
    metadata: { avatar_seed: "MR", environment: "fixture" },
  },
  {
    id: "admin-manager-001",
    auth_user_id: "auth-manager-001",
    created_at: "2025-11-14T10:15:00.000Z",
    updated_at: "2026-04-07T16:42:00.000Z",
    email: "olivia.chen@pmf-admin.test",
    full_name: "Olivia Chen",
    role: "manager",
    is_active: true,
    invited_by_user_id: "auth-super-001",
    last_login_at: "2026-04-09T14:25:00.000Z",
    notes: "Operations manager covering adviser onboarding and triage QA.",
    metadata: { avatar_seed: "OC", environment: "fixture" },
  },
  {
    id: "admin-manager-002",
    auth_user_id: "auth-manager-002",
    created_at: "2025-12-01T08:45:00.000Z",
    updated_at: "2026-04-05T11:03:00.000Z",
    email: "james.wright@pmf-admin.test",
    full_name: "James Wright",
    role: "manager",
    is_active: true,
    invited_by_user_id: "auth-super-001",
    last_login_at: "2026-04-08T09:16:00.000Z",
    notes: "Matching operations lead focused on pensions and tax referrals.",
    metadata: { avatar_seed: "JW", environment: "fixture" },
  },
  {
    id: "admin-viewer-001",
    auth_user_id: "auth-viewer-001",
    created_at: "2026-01-11T12:20:00.000Z",
    updated_at: "2026-04-03T13:19:00.000Z",
    email: "aisha.patel@pmf-admin.test",
    full_name: "Aisha Patel",
    role: "viewer",
    is_active: true,
    invited_by_user_id: "auth-manager-001",
    last_login_at: "2026-04-04T10:28:00.000Z",
    notes: "Viewer-only account for reviewing matching recommendations.",
    metadata: { avatar_seed: "AP", environment: "fixture" },
  },
  {
    id: "admin-viewer-002",
    auth_user_id: "auth-viewer-002",
    created_at: "2025-12-18T15:10:00.000Z",
    updated_at: "2026-03-30T09:49:00.000Z",
    email: "samuel.green@pmf-admin.test",
    full_name: "Samuel Green",
    role: "viewer",
    is_active: false,
    invited_by_user_id: "auth-super-001",
    last_login_at: "2026-02-12T18:14:00.000Z",
    notes: "Inactive QA account preserved for audit testing.",
    metadata: { avatar_seed: "SG", environment: "fixture" },
  },
];

const usedNames = new Set(adminUsers.map((user) => user.full_name));

const nextUniqueName = () => {
  while (true) {
    const fullName = `${pick(firstNames)} ${pick(lastNames)}`;
    if (!usedNames.has(fullName)) {
      usedNames.add(fullName);
      return fullName;
    }
  }
};

const toEmail = (fullName, domain) =>
  `${fullName.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\./, "").replace(/\.$/, "")}@${domain}`;

const makePhone = () => {
  const tail = `${pickInt(100000000, 999999999)}`;
  return `07${tail.slice(0, 9)}`;
};

const randomDateBetween = (start, end) =>
  new Date(start.getTime() + rng() * (end.getTime() - start.getTime()));

const iso = (date) => date.toISOString();

const makeFirm = (serviceLineSlug, city, sequence) => {
  const firmPrefixes = {
    "nhs-pensions-retirement": "Ward",
    "medical-mortgages": "Northpoint",
    "protection-insurance": "Harbour",
    "tax-planning": "Ledger",
    "investment-wealth-planning": "Keystone",
    "estate-planning": "Legacy",
    "student-loan-strategy": "Compass",
    "holistic-financial-planning": "Beacon",
  };

  return {
    legal_name: `${firmPrefixes[serviceLineSlug]} Medical Advisory ${city.city} Ltd`,
    trading_name: `${firmPrefixes[serviceLineSlug]} Medical Advisory`,
    fca_firm_reference_number: `${pickInt(100000, 999999)}`,
    contact_email: `team${sequence}@${firmPrefixes[serviceLineSlug].toLowerCase()}medical.test`,
    contact_phone: makePhone(),
    headquarters_postcode: city.postcode,
  };
};

const createAdvisor = (config, index) => {
  const fullName = nextUniqueName();
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");
  const city = pick(cities);
  const createdAt = randomDateBetween(new Date("2025-02-01T09:00:00.000Z"), QUESTIONNAIRE_END);
  const serviceLineSet = [
    config.slug,
    ...sampleUnique(config.secondaryLines, pickInt(1, Math.min(2, config.secondaryLines.length))),
  ];
  const personaSet = sampleUnique(config.personaPool, Math.min(config.personaPool.length, pickInt(3, 4)));
  const capabilitySet = sampleUnique(config.capabilities, Math.min(config.capabilities.length, pickInt(2, 4)));
  const feeModelSet = sampleUnique(config.feeModels, Math.min(config.feeModels.length, pickInt(2, 3)));
  const firm = makeFirm(config.slug, city, index + 1);
  const acceptsNewClients = chance(0.82);
  const registrationStatus = chance(0.72) ? "approved" : chance(0.6) ? "under_review" : "submitted";
  const listingStatus =
    registrationStatus === "approved"
      ? (chance(0.58) ? "public" : chance(0.5) ? "invite_only" : "internal_only")
      : "private";
  const advisorId = `advisor-${config.slug}-${String(index + 1).padStart(2, "0")}`;

  return {
    id: advisorId,
    created_at: iso(createdAt),
    registration_status: registrationStatus,
    listing_status: listingStatus,
    first_name: firstName,
    last_name: lastName,
    display_name: `${firstName} ${lastName}`,
    job_title: pick(config.jobTitles),
    email: toEmail(fullName, "advisor-fixture.test"),
    phone: makePhone(),
    years_experience_total: pickInt(6, 24),
    years_experience_medical: pickInt(4, 18),
    service_capacity_band: pick([
      "Boutique / highly selective",
      "Small team / steady flow",
      "Growing team / can absorb more",
      "National scale / high capacity",
    ]),
    current_client_capacity: acceptsNewClients
      ? pick(["Available immediately", "Available within 7 days", "Limited this month"])
      : pick(["Waitlist only", "Not taking new clients currently"]),
    typical_response_sla_hours: pick([2, 4, 6, 12, 24]),
    accepts_new_clients: acceptsNewClients,
    firm,
    service_lines: serviceLineSet.map((slug, idx) => ({
      is_primary: idx === 0,
      detail: {
        slug,
        name: serviceLineLabels[slug],
      },
    })),
    client_personas: personaSet.map((slug, idx) => ({
      is_core: idx < 2,
      detail: {
        slug,
        name: personaLabels[slug],
      },
    })),
    capabilities: capabilitySet.map((slug) => ({
      status: "verified",
      detail: {
        slug,
        name: capabilityLabels[slug],
      },
    })),
    fee_models: feeModelSet.map((slug) => ({
      detail: {
        slug,
        name: feeModelLabels[slug],
      },
    })),
    regions: [
      {
        coverage_type: "primary",
        detail: {
          slug: "remote-uk-wide",
          name: regionLabels["remote-uk-wide"],
        },
      },
      {
        coverage_type: "secondary",
        detail: {
          slug: city.region,
          name: regionLabels[city.region],
        },
      },
    ],
    credentials: sampleUnique(credentials, pickInt(2, 3)).map((credentialName) => ({
      credential_name: credentialName,
      verified_at: iso(randomDateBetween(new Date("2024-05-01T09:00:00.000Z"), createdAt)),
    })),
    intake_preferences: {
      preferred_lead_channels: sampleUnique(leadChannels, pickInt(2, 3)),
      preferred_contact_method: pick(["Email", "Phone", "Video call", "No preference"]),
      preferred_contact_hours: pick([
        "Early morning before clinic",
        "Lunchtime",
        "Late afternoon",
        "Evening after lists",
      ]),
      max_new_clients_per_month: pickInt(6, 24),
      ideal_client_summary: config.summary,
    },
    submissions: [
      {
        id: `${advisorId}-submission-1`,
        created_at: iso(randomDateBetween(new Date("2025-09-01T09:00:00.000Z"), QUESTIONNAIRE_END)),
        submission_status: registrationStatus,
        submission_version: "2026.04",
        consent_marketing: chance(0.7),
        consent_directory_listing: listingStatus !== "private",
      },
    ],
    metadata: {
      avatar_seed: `${firstName[0]}${lastName[0]}`,
      matching_profile: {
        primary_service_line_slug: config.slug,
        secondary_service_line_slugs: serviceLineSet.slice(1),
        preferred_persona_slugs: personaSet,
        verified_capability_slugs: capabilitySet,
        complexity_band: pick(["standard", "advanced", "specialist"]),
        household_fit: chance(0.45) ? "dual-income-friendly" : "individual-led",
      },
    },
  };
};

const questionnaireLocations = cities.map((entry) => entry.postcode);

const areaOfExpertiseOptions = [
  "Anaesthetics",
  "Cardiology",
  "Dentistry",
  "Emergency medicine",
  "General practice",
  "Obstetrics and gynaecology",
  "Paediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
];

const preferredContactMethods = ["Phone", "Zoom", "Email"];
const preferredContactTimes = [
  "Weekday morning",
  "Weekday lunchtime",
  "Weekday afternoon",
  "Weekday evening",
  "Weekend",
];

const getSavingsLevel = (incomeBand) => {
  switch (incomeBand) {
    case "£150,000+":
      return pick(["£50,000 - £99,999", "£100,000+"]);
    case "£100,000 - £149,999":
      return pick(["£20,000 - £49,999", "£50,000 - £99,999", "£100,000+"]);
    case "£75,000 - £99,999":
      return pick(["£20,000 - £49,999", "£50,000 - £99,999"]);
    case "£50,000 - £74,999":
      return pick(["£5,000 - £19,999", "£20,000 - £49,999"]);
    case "Under £30,000":
    case "£30,000 - £49,999":
    default:
      return pick(["Under £5,000", "£5,000 - £19,999", "Prefer not to say"]);
  }
};

const getExistingMortgage = (housingStatus) => {
  if (/with mortgage/i.test(housingStatus)) {
    return "Yes";
  }

  if (/outright|renting|accommodation|family/i.test(housingStatus)) {
    return "No";
  }

  return "Unsure";
};

const getExistingAdviser = (advisorExperience) =>
  /^No\b/i.test(advisorExperience) ? "No" : "Yes";

const getPreferredContactMethod = (archetype, callbackRequested) => {
  if (callbackRequested) {
    return "Phone";
  }

  if (/consultant|gp partner|private practice|tax|investment/i.test(
    `${archetype.careerStage} ${archetype.primaryPriority} ${archetype.employmentType}`,
  )) {
    return pick(["Phone", "Zoom"]);
  }

  return pick(preferredContactMethods);
};

const createQuestionnaire = (index) => {
  const archetype = pick(leadArchetypes);
  const fullName = nextUniqueName();
  const createdAt = randomDateBetween(QUESTIONNAIRE_START, QUESTIONNAIRE_END);
  const callbackRequested =
    chance(archetype.callbackProbability) ||
    archetype.timeframe === "As soon as possible (this week)";
  const primaryServiceLine = priorityToServiceLine[archetype.primaryPriority];
  const secondaryServiceLines = Array.from(
    new Set(
      archetype.secondaryPriorities
        .map((priority) => priorityToServiceLine[priority])
        .filter(Boolean),
    ),
  );
  const locationPostcode = pick(questionnaireLocations);
  const areaOfExpertise = pick(areaOfExpertiseOptions);
  const preferredContactMethod = getPreferredContactMethod(archetype, callbackRequested);

  const questionnaire = {
    id: `questionnaire-${String(index + 1).padStart(3, "0")}`,
    created_at: iso(createdAt),
    submission_status: "submitted",
    full_name: fullName,
    email: toEmail(fullName, "lead-fixture.test"),
    phone: makePhone(),
    location_postcode: locationPostcode,
    website: chance(0.22)
      ? `https://${fullName.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}.clinic.test`
      : null,
    area_of_expertise: areaOfExpertise,
    career_stage: archetype.careerStage,
    income_band: archetype.incomeBand,
    employment_type: archetype.employmentType,
    nhs_pension_scheme: archetype.nhsPensionScheme,
    housing_status: archetype.housingStatus,
    expected_income_change: archetype.expectedIncomeChange,
    savings_level: getSavingsLevel(archetype.incomeBand),
    existing_mortgage: getExistingMortgage(archetype.housingStatus),
    existing_adviser: getExistingAdviser(archetype.advisorExperience),
    primary_priority: archetype.primaryPriority,
    secondary_priorities: archetype.secondaryPriorities,
    financial_advice_frustration: archetype.financialAdviceFrustration,
    timeframe: archetype.timeframe,
    advisor_experience: archetype.advisorExperience,
    preferred_contact_method: preferredContactMethod,
    preferred_contact_time: preferredContactMethod === "Email"
      ? "Weekday afternoon"
      : pick(preferredContactTimes),
    callback_requested: callbackRequested,
    callback_requested_at: callbackRequested
      ? iso(new Date(createdAt.getTime() + pickInt(20, 180) * 60 * 1000))
      : null,
    metadata: {
      avatar_key: archetype.key,
      avatar_story: archetype.avatarStory,
      matching_profile: {
        target_service_line_slug: primaryServiceLine,
        secondary_service_line_slugs: secondaryServiceLines,
        preferred_persona_slugs: archetype.preferredPersonas,
        preferred_capability_slugs: archetype.preferredCapabilities,
        complexity_score: pickInt(35, 96),
        urgency_score:
          archetype.timeframe === "As soon as possible (this week)"
            ? pickInt(84, 98)
            : archetype.timeframe === "Within the next month"
              ? pickInt(58, 82)
              : pickInt(28, 57),
        callback_requested_score: callbackRequested ? pickInt(75, 100) : pickInt(10, 68),
        household_context: chance(0.34) ? "partner-or-family-context" : "individual-case",
      },
    },
  };

  const recommendationResult = buildQuestionnaireRecommendations(questionnaire, advisors);
  const leadRouting = buildLeadRouting(recommendationResult, { assignedAt: createdAt });
  const advisorNotifiedAt =
    leadRouting.routing_status === "auto_assigned"
      ? iso(new Date(createdAt.getTime() + pickInt(5, 20) * 60 * 1000))
      : null;

  return {
    ...questionnaire,
    ...buildLeadScore(questionnaire),
    ...leadRouting,
    advisor_notified_at: advisorNotifiedAt,
  };
};

const advisors = serviceLineConfigs.flatMap((config) =>
  Array.from({ length: ADVISORS_PER_SERVICE_LINE }, (_, index) => createAdvisor(config, index)),
);

const questionnaires = Array.from({ length: QUESTIONNAIRE_COUNT }, (_, index) =>
  createQuestionnaire(index),
).sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());

const advisorCountByPrimaryServiceLine = Object.fromEntries(
  serviceLineConfigs.map((config) => [
    config.slug,
    advisors.filter((advisor) => advisor.service_lines[0]?.detail?.slug === config.slug).length,
  ]),
);

const questionnaireCountByServiceLine = questionnaires.reduce((accumulator, questionnaire) => {
  const key = questionnaire.metadata?.matching_profile?.target_service_line_slug || "unknown";
  accumulator[key] = (accumulator[key] || 0) + 1;
  return accumulator;
}, {});

const fixture = {
  generated_at: new Date().toISOString(),
  seed: SEED,
  summary: {
    advisor_count: advisors.length,
    questionnaire_count: questionnaires.length,
    advisor_count_by_primary_service_line: advisorCountByPrimaryServiceLine,
    questionnaire_count_by_target_service_line: questionnaireCountByServiceLine,
    questionnaire_date_range: {
      start: QUESTIONNAIRE_START.toISOString(),
      end: QUESTIONNAIRE_END.toISOString(),
    },
    notes: [
      "Each primary service line contains 12 adviser profiles.",
      "Questionnaire submissions are spread across roughly four months and include matching metadata.",
      "Fixture mode is designed for admin dashboard and matching-system testing, not persistent writes.",
    ],
  },
  adminUsers,
  advisors,
  questionnaires,
};

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(fixture, null, 2)}\n`, "utf8");

console.log(
  `Wrote ${fixture.summary.advisor_count} advisors and ${fixture.summary.questionnaire_count} questionnaires to ${OUTPUT_PATH}`,
);
