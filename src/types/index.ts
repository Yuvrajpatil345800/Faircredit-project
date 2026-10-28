/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Type Definitions
 */

export interface GermanCreditApplicant {
  checking_account: 'A11' | 'A12' | 'A13' | 'A14';
  duration_months: number;
  credit_history: 'A30' | 'A31' | 'A32' | 'A33' | 'A34';
  purpose: 'A40' | 'A41' | 'A42' | 'A43' | 'A44' | 'A45' | 'A46' | 'A48' | 'A49' | 'A410';
  credit_amount: number;
  savings_account: 'A61' | 'A62' | 'A63' | 'A64' | 'A65';
  employment_since: 'A71' | 'A72' | 'A73' | 'A74' | 'A75';
  installment_rate: number;
  personal_status_sex: 'A91' | 'A92' | 'A93' | 'A94' | 'A95';
  other_debtors: 'A101' | 'A102' | 'A103';
  residence_since: number;
  property: 'A121' | 'A122' | 'A123' | 'A124';
  age_years: number;
  other_installment_plans: 'A141' | 'A142' | 'A143';
  housing: 'A151' | 'A152' | 'A153';
  existing_credits: number;
  job: 'A171' | 'A172' | 'A173' | 'A174';
  liable_people: number;
  telephone: 'A191' | 'A192';
  foreign_worker: 'A201' | 'A202';
  credit_risk?: 'good' | 'bad';
}

export type GenderGroup = 'Female' | 'Male' | 'Unknown';

export interface PredictionResult {
  prediction: 'GOOD' | 'BAD';
  predictionNumeric: 1 | 0;
  probabilityGood: number;
  probabilityBad: number;
  riskScore: number; // 0-100 scale
  riskTier: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  derivedGender: GenderGroup;
  explanation: string;
  limitations: string;
  mitigatedPrediction?: 'GOOD' | 'BAD';
  mitigatedProbabilityGood?: number;
  thresholdApplied?: number;
}

export interface BatchPredictionRow extends GermanCreditApplicant {
  id: number;
  prediction: 'GOOD' | 'BAD';
  probabilityGood: number;
  probabilityBad: number;
  derivedGender: GenderGroup;
  actualRisk?: 'good' | 'bad';
  isCorrect?: boolean;
}

export interface MetricByGroup {
  group: 'Female' | 'Male';
  sampleCount: number;
  positiveCount: number;
  negativeCount: number;
  selectionRate: number; // Approved rate
  truePositiveRate: number; // TPR (Sensitivity/Recall)
  falsePositiveRate: number; // FPR
  falseNegativeRate: number; // FNR
  trueNegativeRate: number; // TNR (Specificity)
  accuracy: number;
  precision: number;
  f1Score: number;
}

export interface FairnessAuditSummary {
  sampleSize: number;
  protectedAttribute: string;
  baseline: {
    female: MetricByGroup;
    male: MetricByGroup;
    demographicParityDifference: number;
    demographicParityRatio: number; // Disparate Impact
    equalizedOddsDifference: number;
    accuracyDifference: number;
  };
  mitigated?: {
    female: MetricByGroup;
    male: MetricByGroup;
    demographicParityDifference: number;
    demographicParityRatio: number;
    equalizedOddsDifference: number;
    accuracyDifference: number;
  };
}

export interface ModelPerformanceMetrics {
  modelName: string;
  modelType: 'baseline' | 'reweighted' | 'threshold_optimizer';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  isTrained: boolean;
  statusNote: string;
}

export interface ProxyVariableAnalysisItem {
  featureName: string;
  category: 'Financial' | 'Employment' | 'Personal' | 'Collateral';
  associationScore: number; // 0 to 1
  associationMethod: "Cramer's V" | 'Pearson r' | 'ANOVA eta-squared';
  proxyThreatLevel: 'High' | 'Moderate' | 'Low' | 'Negligible';
  explanation: string;
}

export interface BusinessImpactParams {
  portfolioSize: number;
  averageLoanAmount: number;
  interestRatePercent: number;
  defaultLossRatePercent: number;
  baseApprovalThreshold: number;
  mitigatedApprovalThresholdFemale: number;
  mitigatedApprovalThresholdMale: number;
}

export interface BusinessImpactResult {
  baselineLoansApproved: number;
  baselineDefaultCount: number;
  baselineNetProfit: number;
  baselineApprovalRateFemale: number;
  baselineApprovalRateMale: number;
  
  mitigatedLoansApproved: number;
  mitigatedDefaultCount: number;
  mitigatedNetProfit: number;
  mitigatedApprovalRateFemale: number;
  mitigatedApprovalRateMale: number;
  
  profitDelta: number;
  demographicInclusionGainFemale: number;
  tradeoffRatioText: string;
}

export interface BackendStatus {
  mode: 'embedded' | 'fastapi';
  apiUrl: string;
  isConnected: boolean;
  isChecking: boolean;
  lastChecked?: string;
  serverInfo?: {
    version?: string;
    modelArtifactsLoaded?: boolean;
    scikitLearnVersion?: string;
    fairlearnVersion?: string;
    activeModel?: string;
  };
  error?: string;
}
