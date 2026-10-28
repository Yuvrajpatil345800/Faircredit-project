/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - German Credit Dataset Schema & Centralized Human-Readable Mapping
 */

import { GermanCreditApplicant } from '../types';

/**
 * Complete centralized mapping of German Credit dataset codes to clean, human-readable labels.
 * Raw codes are strictly for internal model consumption and never exposed in the UI.
 */
export const CODE_TO_LABEL_MAP: Record<string, string> = {
  // Checking Account
  A11: 'Negative balance (< 0 DM)',
  A12: '0 to 200 DM (Moderate balance)',
  A13: '≥ 200 DM (Substantial balance)',
  A14: 'No checking account',

  // Credit History
  A30: 'No credits taken / All paid back duly',
  A31: 'All credits at this bank paid back duly',
  A32: 'Existing credits paid back duly till now',
  A33: 'Delay in paying off in the past',
  A34: 'Critical account / Active credits elsewhere',

  // Purpose
  A40: 'Car (New)',
  A41: 'Car (Used)',
  A42: 'Furniture / Equipment',
  A43: 'Radio / Television',
  A44: 'Domestic Appliances',
  A45: 'Repairs',
  A46: 'Education',
  A48: 'Retraining',
  A49: 'Business / Micro-enterprise',
  A410: 'Other purpose',

  // Savings Account
  A61: '< 100 DM (Low savings)',
  A62: '100 to 500 DM (Moderate savings)',
  A63: '500 to 1,000 DM (Good savings)',
  A64: '≥ 1,000 DM (High savings)',
  A65: 'Unknown / No savings account',

  // Employment Duration
  A71: 'Unemployed',
  A72: '< 1 year',
  A73: '1–4 years',
  A74: '4–7 years',
  A75: '≥ 7 years',

  // Personal Status & Sex (Sensitive Attribute)
  A91: 'Male (Divorced / Separated)',
  A92: 'Female (Divorced / Separated / Married)',
  A93: 'Male (Single)',
  A94: 'Male (Married / Widowed)',
  A95: 'Female (Single)',

  // Other Debtors / Guarantors
  A101: 'None',
  A102: 'Co-applicant',
  A103: 'Guarantor',

  // Property / Collateral
  A121: 'Real Estate',
  A122: 'Building Society Savings / Life Insurance',
  A123: 'Car or other vehicle',
  A124: 'Unknown / No property',

  // Other Installment Plans
  A141: 'Bank',
  A142: 'Stores',
  A143: 'None',

  // Housing Situation
  A151: 'Rent',
  A152: 'Own',
  A153: 'Free Housing (Family / Employer)',

  // Job Classification
  A171: 'Unemployed / Unskilled Non-resident',
  A172: 'Unskilled Resident',
  A173: 'Skilled Employee / Official',
  A174: 'Management / Self-employed / Qualified Officer',

  // Telephone Registration
  A191: 'None',
  A192: 'Registered under customer name',

  // Foreign Worker Status
  A201: 'Yes (Foreign worker)',
  A202: 'No (Domestic citizen)',

  // Target class
  good: 'Good Credit Risk',
  bad: 'Bad Credit Risk',
};

/**
 * Converts any German Credit code into its clean, human-readable display label.
 * Returns the label if found, or the original string if not a known code.
 */
export function formatCategoryValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  return CODE_TO_LABEL_MAP[str] || str;
}

export const FEATURE_CATEGORIES = {
  checking_account: {
    label: 'Checking Account Status',
    description: 'Status of existing checking account at bank',
    options: [
      { code: 'A11', label: 'Negative balance (< 0 DM)' },
      { code: 'A12', label: '0 to 200 DM (Moderate balance)' },
      { code: 'A13', label: '≥ 200 DM (Substantial balance)' },
      { code: 'A14', label: 'No checking account' },
    ],
  },
  duration_months: {
    label: 'Duration of Credit (Months)',
    description: 'Loan repayment duration in months',
    min: 4,
    max: 72,
    default: 24,
  },
  credit_history: {
    label: 'Credit History',
    description: 'Past payment performance and existing debt records',
    options: [
      { code: 'A30', label: 'No credits taken / All paid back duly' },
      { code: 'A31', label: 'All credits at this bank paid back duly' },
      { code: 'A32', label: 'Existing credits paid back duly till now' },
      { code: 'A33', label: 'Delay in paying off in the past' },
      { code: 'A34', label: 'Critical account / Active credits elsewhere' },
    ],
  },
  purpose: {
    label: 'Purpose of Loan',
    description: 'Intended use of the credit facility',
    options: [
      { code: 'A40', label: 'Car (New)' },
      { code: 'A41', label: 'Car (Used)' },
      { code: 'A42', label: 'Furniture / Equipment' },
      { code: 'A43', label: 'Radio / Television' },
      { code: 'A44', label: 'Domestic Appliances' },
      { code: 'A45', label: 'Repairs' },
      { code: 'A46', label: 'Education' },
      { code: 'A48', label: 'Retraining' },
      { code: 'A49', label: 'Business / Micro-enterprise' },
      { code: 'A410', label: 'Other purpose' },
    ],
  },
  credit_amount: {
    label: 'Credit Amount (DM)',
    description: 'Requested principal loan amount in Deutsche Mark (DM)',
    min: 250,
    max: 20000,
    default: 3000,
  },
  savings_account: {
    label: 'Savings Account / Bonds',
    description: 'Available liquid savings balances',
    options: [
      { code: 'A61', label: '< 100 DM (Low savings)' },
      { code: 'A62', label: '100 to 500 DM (Moderate savings)' },
      { code: 'A63', label: '500 to 1,000 DM (Good savings)' },
      { code: 'A64', label: '≥ 1,000 DM (High savings)' },
      { code: 'A65', label: 'Unknown / No savings account' },
    ],
  },
  employment_since: {
    label: 'Present Employment Duration',
    description: 'Years with current employer or business',
    options: [
      { code: 'A71', label: 'Unemployed' },
      { code: 'A72', label: '< 1 year' },
      { code: 'A73', label: '1–4 years' },
      { code: 'A74', label: '4–7 years' },
      { code: 'A75', label: '≥ 7 years' },
    ],
  },
  installment_rate: {
    label: 'Installment Rate (% of Income)',
    description: 'Debt service payment as percentage of disposable income',
    min: 1,
    max: 4,
    default: 3,
  },
  personal_status_sex: {
    label: 'Personal Status & Sex (Sensitive Attribute)',
    description: 'Marital status and sex (Protected demographic feature)',
    options: [
      { code: 'A91', label: 'Male (Divorced / Separated)', gender: 'Male' },
      { code: 'A92', label: 'Female (Divorced / Separated / Married)', gender: 'Female' },
      { code: 'A93', label: 'Male (Single)', gender: 'Male' },
      { code: 'A94', label: 'Male (Married / Widowed)', gender: 'Male' },
      { code: 'A95', label: 'Female (Single)', gender: 'Female' },
    ],
  },
  other_debtors: {
    label: 'Other Debtors / Guarantors',
    description: 'Presence of co-applicants or legal guarantors',
    options: [
      { code: 'A101', label: 'None' },
      { code: 'A102', label: 'Co-applicant' },
      { code: 'A103', label: 'Guarantor' },
    ],
  },
  residence_since: {
    label: 'Present Residence Duration (Years)',
    description: 'Years living at current residence',
    min: 1,
    max: 4,
    default: 2,
  },
  property: {
    label: 'Most Valuable Property / Collateral',
    description: 'Primary tangible asset owned by applicant',
    options: [
      { code: 'A121', label: 'Real Estate' },
      { code: 'A122', label: 'Building Society Savings / Life Insurance' },
      { code: 'A123', label: 'Car or other vehicle' },
      { code: 'A124', label: 'Unknown / No property' },
    ],
  },
  age_years: {
    label: 'Age (Years)',
    description: 'Applicant chronological age',
    min: 18,
    max: 80,
    default: 35,
  },
  other_installment_plans: {
    label: 'Other Installment Plans',
    description: 'Existing installment contracts with other entities',
    options: [
      { code: 'A141', label: 'Bank' },
      { code: 'A142', label: 'Stores' },
      { code: 'A143', label: 'None' },
    ],
  },
  housing: {
    label: 'Housing Status',
    description: 'Residential accommodation type',
    options: [
      { code: 'A151', label: 'Rent' },
      { code: 'A152', label: 'Own' },
      { code: 'A153', label: 'Free Housing (Family / Employer)' },
    ],
  },
  existing_credits: {
    label: 'Existing Credits at this Bank',
    description: 'Count of active credit lines at this institution',
    min: 1,
    max: 4,
    default: 1,
  },
  job: {
    label: 'Job Classification',
    description: 'Employment category and qualification level',
    options: [
      { code: 'A171', label: 'Unemployed / Unskilled Non-resident' },
      { code: 'A172', label: 'Unskilled Resident' },
      { code: 'A173', label: 'Skilled Employee / Official' },
      { code: 'A174', label: 'Management / Self-employed / Qualified Officer' },
    ],
  },
  liable_people: {
    label: 'Number of Dependents',
    description: 'Number of persons legally dependent on applicant',
    min: 1,
    max: 5,
    default: 1,
  },
  telephone: {
    label: 'Telephone Registration',
    description: 'Registered landline or mobile contract in customer name',
    options: [
      { code: 'A191', label: 'None' },
      { code: 'A192', label: 'Registered under customer name' },
    ],
  },
  foreign_worker: {
    label: 'Foreign Worker Status',
    description: 'Jurisdictional citizenship/work permit classification',
    options: [
      { code: 'A201', label: 'Yes (Foreign worker)' },
      { code: 'A202', label: 'No (Domestic citizen)' },
    ],
  },
};

export const SENSITIVE_GENDER_MAPPING: Record<string, 'Female' | 'Male'> = {
  A92: 'Female',
  A95: 'Female',
  A91: 'Male',
  A93: 'Male',
  A94: 'Male',
};

export function getGenderGroup(code: string): 'Female' | 'Male' | 'Unknown' {
  return SENSITIVE_GENDER_MAPPING[code] || 'Unknown';
}

export const APPLICANT_PRESETS: { name: string; description: string; data: GermanCreditApplicant }[] = [
  {
    name: 'Prime Female Applicant',
    description: 'High savings, real estate owner, stable employment (Female, single)',
    data: {
      checking_account: 'A14',
      duration_months: 12,
      credit_history: 'A34',
      purpose: 'A43',
      credit_amount: 1800,
      savings_account: 'A64',
      employment_since: 'A74',
      installment_rate: 2,
      personal_status_sex: 'A92',
      other_debtors: 'A101',
      residence_since: 3,
      property: 'A121',
      age_years: 36,
      other_installment_plans: 'A143',
      housing: 'A152',
      existing_credits: 1,
      job: 'A173',
      liable_people: 1,
      telephone: 'A192',
      foreign_worker: 'A201',
    },
  },
  {
    name: 'Marginal Female Applicant (Audit Case)',
    description: 'Young professional, moderate balance, rent housing. Subject to disparate baseline rejection.',
    data: {
      checking_account: 'A12',
      duration_months: 24,
      credit_history: 'A32',
      purpose: 'A42',
      credit_amount: 3200,
      savings_account: 'A61',
      employment_since: 'A73',
      installment_rate: 3,
      personal_status_sex: 'A92',
      other_debtors: 'A101',
      residence_since: 2,
      property: 'A122',
      age_years: 26,
      other_installment_plans: 'A143',
      housing: 'A151',
      existing_credits: 1,
      job: 'A173',
      liable_people: 1,
      telephone: 'A191',
      foreign_worker: 'A201',
    },
  },
  {
    name: 'Prime Male Applicant',
    description: 'Established skilled worker, owned property, low debt ratio (Male, single)',
    data: {
      checking_account: 'A14',
      duration_months: 12,
      credit_history: 'A34',
      purpose: 'A40',
      credit_amount: 2500,
      savings_account: 'A65',
      employment_since: 'A75',
      installment_rate: 2,
      personal_status_sex: 'A93',
      other_debtors: 'A101',
      residence_since: 4,
      property: 'A121',
      age_years: 45,
      other_installment_plans: 'A143',
      housing: 'A152',
      existing_credits: 2,
      job: 'A173',
      liable_people: 1,
      telephone: 'A192',
      foreign_worker: 'A201',
    },
  },
  {
    name: 'High Risk Applicant (Delinquent History)',
    description: 'Negative checking account, past repayment delays, high requested loan',
    data: {
      checking_account: 'A11',
      duration_months: 48,
      credit_history: 'A30',
      purpose: 'A49',
      credit_amount: 11000,
      savings_account: 'A61',
      employment_since: 'A72',
      installment_rate: 4,
      personal_status_sex: 'A93',
      other_debtors: 'A101',
      residence_since: 1,
      property: 'A124',
      age_years: 23,
      other_installment_plans: 'A141',
      housing: 'A151',
      existing_credits: 1,
      job: 'A172',
      liable_people: 2,
      telephone: 'A191',
      foreign_worker: 'A201',
    },
  },
];

export const REQUIRED_COLUMNS = [
  'checking_account',
  'duration_months',
  'credit_history',
  'purpose',
  'credit_amount',
  'savings_account',
  'employment_since',
  'installment_rate',
  'personal_status_sex',
  'other_debtors',
  'residence_since',
  'property',
  'age_years',
  'other_installment_plans',
  'housing',
  'existing_credits',
  'job',
  'liable_people',
  'telephone',
  'foreign_worker',
];

export const SAMPLE_CSV_TEMPLATE = `checking_account,duration_months,credit_history,purpose,credit_amount,savings_account,employment_since,installment_rate,personal_status_sex,other_debtors,residence_since,property,age_years,other_installment_plans,housing,existing_credits,job,liable_people,telephone,foreign_worker,credit_risk
A11,6,A34,A43,1169,A65,A75,4,A93,A101,4,A121,67,A143,A152,2,A173,1,A192,A201,good
A12,48,A32,A43,5951,A61,A73,2,A92,A101,2,A121,22,A143,A152,1,A173,1,A191,A201,bad
A14,12,A34,A46,2096,A61,A74,2,A93,A101,3,A121,49,A143,A152,1,A172,2,A191,A201,good
A11,42,A32,A42,7882,A61,A74,2,A93,A103,4,A122,45,A143,A153,1,A173,2,A191,A201,good
A11,24,A33,A40,4870,A61,A73,3,A93,A101,4,A124,53,A143,A153,2,A173,2,A191,A201,bad
A14,36,A32,A46,9055,A65,A73,2,A93,A101,4,A124,35,A143,A153,1,A172,2,A192,A201,good
A14,24,A32,A42,2835,A63,A75,3,A93,A101,4,A122,53,A143,A152,1,A173,1,A191,A201,good
A12,36,A32,A41,6948,A61,A73,2,A93,A101,2,A123,35,A143,A151,1,A174,1,A192,A201,good
A14,12,A32,A43,3059,A64,A74,2,A91,A101,4,A121,61,A143,A152,1,A172,1,A191,A201,good
A12,30,A34,A40,5234,A61,A71,4,A94,A101,2,A123,28,A143,A152,2,A174,1,A191,A201,bad`;
