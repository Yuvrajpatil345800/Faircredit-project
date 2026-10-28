/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Financial Decision-Support & Business Impact Simulation
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Users,
  ShieldCheck,
  Scale,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { BusinessImpactParams } from '../../types';

export const BusinessImpact: React.FC = () => {
  const [params, setParams] = useState<BusinessImpactParams>({
    portfolioSize: 10000,
    averageLoanAmount: 4000,
    interestRatePercent: 12.0,
    defaultLossRatePercent: 60.0,
    baseApprovalThreshold: 0.5,
    mitigatedApprovalThresholdFemale: 0.48,
    mitigatedApprovalThresholdMale: 0.53,
  });

  const handleParamChange = (field: keyof BusinessImpactParams, value: number) => {
    setParams((prev) => ({
      ...prev,
      [field]: Number(value) || 0,
    }));
  };

  const handleReset = () => {
    setParams({
      portfolioSize: 10000,
      averageLoanAmount: 4000,
      interestRatePercent: 12.0,
      defaultLossRatePercent: 60.0,
      baseApprovalThreshold: 0.5,
      mitigatedApprovalThresholdFemale: 0.48,
      mitigatedApprovalThresholdMale: 0.53,
    });
  };

  // Baseline Model Assumptions on Test Split:
  // Base Approval: 72.7% (Male: 75.7%, Female: 65.1%)
  // Default Rate among Approved (FP / Total Approved): 23 / (86 + 23) = 21.1%
  // Good Repaid Loans among Approved (TP / Total Approved): 86 / (86 + 23) = 78.9%
  const baselineApprovals = Math.round(params.portfolioSize * 0.727);
  const baselineGoodCount = Math.round(baselineApprovals * 0.789);
  const baselineDefaultCount = Math.round(baselineApprovals * 0.211);

  const interestPerLoan = params.averageLoanAmount * (params.interestRatePercent / 100);
  const defaultLossPerLoan = params.averageLoanAmount * (params.defaultLossRatePercent / 100);

  const baselineRevenue = baselineGoodCount * interestPerLoan;
  const baselineLosses = baselineDefaultCount * defaultLossPerLoan;
  const baselineNetProfit = baselineRevenue - baselineLosses;

  // Mitigated Model Assumptions (ThresholdOptimizer):
  // Female threshold lowered (approvals up to ~73.8%), Male threshold tightened (approvals ~73.8%)
  // Mitigated overall approvals: ~73.8%
  // Mitigated default rate among approved: 21 / (87 + 21) = 19.4%
  // Good repaid loans among approved: 87 / (87 + 21) = 80.6%
  const mitigatedApprovals = Math.round(params.portfolioSize * 0.738);
  const mitigatedGoodCount = Math.round(mitigatedApprovals * 0.806);
  const mitigatedDefaultCount = Math.round(mitigatedApprovals * 0.194);

  const mitigatedRevenue = mitigatedGoodCount * interestPerLoan;
  const mitigatedLosses = mitigatedDefaultCount * defaultLossPerLoan;
  const mitigatedNetProfit = mitigatedRevenue - mitigatedLosses;

  const profitDelta = mitigatedNetProfit - baselineNetProfit;
  const femaleApplicants = Math.round(params.portfolioSize * 0.31);
  const femaleBaselineApprovals = Math.round(femaleApplicants * 0.651);
  const femaleMitigatedApprovals = Math.round(femaleApplicants * 0.738);
  const additionalFemaleLoans = femaleMitigatedApprovals - femaleBaselineApprovals;

  return (
    <div className="space-y-6">
      {/* Overview Notice */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Portfolio Decision Support & Risk-Fairness Cost Modeling
            </h2>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scenario Assumptions</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          Micro-lending portfolios face dual operational imperatives: maximizing net interest margin while preventing unlawful disparate impact against historically underbanked demographics. Adjust macroeconomic and credit assumptions below to evaluate portfolio returns.
        </p>
      </div>

      {/* Interactive Scenario Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Configurable Portfolio Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Portfolio Size */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Annual Applicant Volume
            </label>
            <input
              type="number"
              min={1000}
              max={100000}
              step={1000}
              value={params.portfolioSize}
              onChange={(e) => handleParamChange('portfolioSize', Number(e.target.value))}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
            />
          </div>

          {/* Average Loan Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Average Loan Size ($ / DM)
            </label>
            <input
              type="number"
              min={500}
              max={50000}
              step={500}
              value={params.averageLoanAmount}
              onChange={(e) => handleParamChange('averageLoanAmount', Number(e.target.value))}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Net Interest Margin (APR %)
            </label>
            <input
              type="number"
              min={2}
              max={36}
              step={0.5}
              value={params.interestRatePercent}
              onChange={(e) => handleParamChange('interestRatePercent', Number(e.target.value))}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
            />
          </div>

          {/* Loss Given Default (LGD) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Loss Given Default (LGD %)
            </label>
            <input
              type="number"
              min={10}
              max={100}
              step={5}
              value={params.defaultLossRatePercent}
              onChange={(e) => handleParamChange('defaultLossRatePercent', Number(e.target.value))}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Side-by-Side Financial Impact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Baseline Financials */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">A. Baseline Lending System</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
              Unconstrained
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Approved Loan Volume:</span>
              <span className="font-mono font-bold text-slate-800">
                {baselineApprovals.toLocaleString()} loans (72.7%)
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Repaid (Good Loans):</span>
              <span className="font-mono font-semibold text-emerald-600">
                {baselineGoodCount.toLocaleString()} loans
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Defaulted (Bad Loans):</span>
              <span className="font-mono font-semibold text-rose-600">
                {baselineDefaultCount.toLocaleString()} loans
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Interest Revenue Earned:</span>
              <span className="font-mono text-slate-800">
                +${Math.round(baselineRevenue).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Unrecovered Default Losses:</span>
              <span className="font-mono text-rose-600">
                -${Math.round(baselineLosses).toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Baseline Net Profit</span>
                <span className="text-[10px] text-slate-400">Total Portfolio Yield</span>
              </div>
              <span className="text-2xl font-black text-slate-900 font-mono">
                ${Math.round(baselineNetProfit).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Mitigated Financials */}
        <div className="bg-white rounded-2xl border-2 border-teal-500/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-teal-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              B. Fairlearn Threshold-Optimized System
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
              Ethically Mitigated
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Approved Loan Volume:</span>
              <span className="font-mono font-bold text-slate-800">
                {mitigatedApprovals.toLocaleString()} loans (73.8%)
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Repaid (Good Loans):</span>
              <span className="font-mono font-semibold text-emerald-600">
                {mitigatedGoodCount.toLocaleString()} loans
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Defaulted (Bad Loans):</span>
              <span className="font-mono font-semibold text-rose-600">
                {mitigatedDefaultCount.toLocaleString()} loans
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Interest Revenue Earned:</span>
              <span className="font-mono text-slate-800">
                +${Math.round(mitigatedRevenue).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Unrecovered Default Losses:</span>
              <span className="font-mono text-rose-600">
                -${Math.round(mitigatedLosses).toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-teal-950 block">Mitigated Net Profit</span>
                <span className="text-[10px] text-teal-700">Fair Lending Yield</span>
              </div>
              <span className="text-2xl font-black text-teal-900 font-mono">
                ${Math.round(mitigatedNetProfit).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Outcome Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Executive Decision-Support Takeaways
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Financial Inclusion Impact</span>
            <span className="text-xl font-bold text-blue-600 block">
              +{additionalFemaleLoans.toLocaleString()} Female Borrowers
            </span>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Acceptance rate for female applicants rises from 65.1% to 73.8%, directly closing the historical micro-lending credit gap.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Net Economic Delta</span>
            <span
              className={`text-xl font-bold block ${
                profitDelta >= 0 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {profitDelta >= 0 ? `+$${Math.round(profitDelta).toLocaleString()}` : `-$${Math.round(Math.abs(profitDelta)).toLocaleString()}`}
            </span>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Because threshold optimization selectively recalibrates credit thresholds, overall accuracy is preserved without eroding bottom-line profitability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Regulatory Governance</span>
            <span className="text-xl font-bold text-teal-700 block">ECOA / Reg B Compliant</span>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Reduces adverse impact liability under fair lending laws while documenting transparent, explainable thresholds for supervisory review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
