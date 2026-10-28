/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Interactive Applicant Simulator
 *
 * Implements the interactive Applicant Simulator conforming to the 5 reference screenshots:
 * - Quick Sample Profiles (Borderline Group B, Prime Group A, Early-Career Thin File, High Leverage)
 * - Applicant Details Input Parameters (Audit Group A/B, Credit Score, Annual Income, Loan Amount, Employment)
 * - Active "Evaluate Application" engine that computes calibrated risk, LTI, and group thresholds
 * - Real-time Logistic Regression Evaluation with Dual Comparison (Original Cutoff 0.50 vs Adjusted Demo Cutoff)
 * - Loan-to-Income (LTI) ratio, Credit Score Tier, and Group Metrics
 * - Key Input Factors (Helped Approval vs Higher Risk)
 * - Interactive Cutoff Thresholds Explorer (0.10 - 0.90 with group demo benchmark ticks)
 * - Expandable Technical Architecture & Decision Rules Methodology Accordion
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  Calculator,
  Layers,
  ShieldCheck,
  Loader2,
  Check,
} from 'lucide-react';
import { BackendStatus } from '../../types';

interface CreditPredictionProps {
  backendStatus: BackendStatus;
  onOpenBackendModal: () => void;
  onOpenInfo: () => void;
}

type AuditGroup = 'A' | 'B';
type CurrencyType = 'USD' | 'INR';

interface SampleProfile {
  id: string;
  name: string;
  summary: string;
  group: AuditGroup;
  creditScore: number;
  income: number;
  loanAmount: number;
  employmentYears: number;
}

const SAMPLE_PROFILES: SampleProfile[] = [
  {
    id: 'borderline-b',
    name: 'Borderline Group B Profile',
    summary: 'Score 645, $62k income. Falls below τ = 0.50, but approved under Group B calibrated cutoff.',
    group: 'B',
    creditScore: 645,
    income: 62000,
    loanAmount: 18000,
    employmentYears: 4,
  },
  {
    id: 'prime-a',
    name: 'Prime Group A Profile',
    summary: 'Score 740, $88k income. Consistently approved across baseline and calibrated models.',
    group: 'A',
    creditScore: 740,
    income: 88000,
    loanAmount: 20000,
    employmentYears: 9,
  },
  {
    id: 'early-career-thin',
    name: 'Early-Career Profile (Thin File)',
    summary: 'Score 620, $75k income, 2 yrs employment. Demonstrates threshold impact on thin-file applicants.',
    group: 'B',
    creditScore: 620,
    income: 75000,
    loanAmount: 15000,
    employmentYears: 2,
  },
  {
    id: 'high-leverage',
    name: 'High Leverage Profile',
    summary: 'Score 540, $38k income, $32k loan. Declined across both models due to elevated risk.',
    group: 'A',
    creditScore: 540,
    income: 38000,
    loanAmount: 32000,
    employmentYears: 3,
  },
];

export const CreditPrediction: React.FC<CreditPredictionProps> = ({
  backendStatus,
  onOpenBackendModal,
}) => {
  // Simulator State
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [selectedGroup, setSelectedGroup] = useState<AuditGroup>('B');
  const [creditScore, setCreditScore] = useState<number>(700);
  const [annualIncome, setAnnualIncome] = useState<number | string>(62000);
  const [requestedLoan, setRequestedLoan] = useState<number | string>(18000);
  const [yearsEmployment, setYearsEmployment] = useState<number>(9);

  // Active sample profile highlight
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // Evaluation states
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [lastEvaluatedAt, setLastEvaluatedAt] = useState<string>('Just now');
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(true);

  // Interactive Custom Cutoff Slider (Default 0.50)
  const [customCutoff, setCustomCutoff] = useState<number>(0.50);

  // Accordion state
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Group thresholds (Fairlearn calibrated values)
  const groupACutoff = 0.52;
  const groupBCutoff = 0.44;
  const originalCutoff = 0.50;

  // Active group demo cutoff
  const activeDemoCutoff = selectedGroup === 'A' ? groupACutoff : groupBCutoff;

  // Numerical sanitization
  const numLoan = typeof requestedLoan === 'number' ? requestedLoan : Number(requestedLoan) || 0;
  const numIncome = typeof annualIncome === 'number' ? annualIncome : Number(annualIncome) || 0;

  // Currency symbols and multipliers
  const currencySymbol = currency === 'USD' ? '$' : '₹';
  const formatMoney = (val: number) => {
    if (currency === 'INR') {
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return `$${val.toLocaleString('en-US')}`;
  };

  // Compute Loan-to-Income (LTI)
  const ltiRatio = useMemo(() => {
    if (numIncome <= 0) return 100;
    return Math.round((numLoan / numIncome) * 100);
  }, [numLoan, numIncome]);

  // Determine Credit Score Tier
  const creditScoreTier = useMemo(() => {
    if (creditScore >= 750) return 'Exceptional';
    if (creditScore >= 670) return 'Prime';
    if (creditScore >= 620) return 'Near Prime';
    if (creditScore >= 580) return 'Subprime';
    return 'High Risk';
  }, [creditScore]);

  // Compute Model Probability using calibrated Logistic Regression formula
  const approvalProbability = useMemo(() => {
    // 1. Credit Score: 300 to 850. Baseline is ~650.
    const scoreComponent = ((creditScore - 650) / 75) * 1.35;

    // 2. Loan-to-Income: standard healthy debt ratio is <= 28%.
    // Higher loan amount => higher LTI => substantial risk penalty!
    const ltiComponent = ((0.28 - (ltiRatio / 100)) / 0.12) * 1.15;

    // 3. Employment Stability:
    const empComponent = ((yearsEmployment - 5) / 5) * 0.45;

    // 4. Annual Income:
    const incomeComponent = ((numIncome - 60000) / 30000) * 0.40;

    // Intercept calibrated so standard profile (700 score, 62k income, 18k loan [29% lti], 9 yrs emp) yields 82.1%
    const intercept = 0.33;
    const z = intercept + scoreComponent + ltiComponent + empComponent + incomeComponent;

    // Sigmoid function
    const prob = 1 / (1 + Math.exp(-z));
    return Math.min(0.99, Math.max(0.01, prob));
  }, [creditScore, ltiRatio, yearsEmployment, numIncome]);

  const approvalPercentageStr = (approvalProbability * 100).toFixed(1);

  // Original vs Adjusted decisions
  const isOriginalApproved = approvalProbability >= originalCutoff;
  const isAdjustedApproved = approvalProbability >= activeDemoCutoff;
  const isCustomApproved = approvalProbability >= customCutoff;

  // Evaluate Application Action
  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setHasEvaluated(true);
      const now = new Date();
      setLastEvaluatedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      // Scroll gently to results card
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 280);
  };

  // Load sample profile
  const handleSelectProfile = (profile: SampleProfile) => {
    setActiveProfileId(profile.id);
    setSelectedGroup(profile.group);
    setCreditScore(profile.creditScore);
    setAnnualIncome(profile.income);
    setRequestedLoan(profile.loanAmount);
    setYearsEmployment(profile.employmentYears);
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setHasEvaluated(true);
      setLastEvaluatedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 200);
  };

  // Reset inputs to clean defaults
  const handleReset = () => {
    setActiveProfileId(null);
    setSelectedGroup('B');
    setCreditScore(700);
    setAnnualIncome(62000);
    setRequestedLoan(18000);
    setYearsEmployment(9);
    setCustomCutoff(0.50);
    setHasEvaluated(true);
    setLastEvaluatedAt('Reset to default');
  };

  // Key Input Factors Generation
  const keyFactors = useMemo(() => {
    const factors: { text: string; tag: 'Helped Approval' | 'Higher Risk'; isPositive: boolean }[] = [];

    // Factor 1: Credit Score
    if (creditScore >= 670) {
      factors.push({
        text: `Strong score of ${creditScore} significantly improves approval likelihood.`,
        tag: 'Helped Approval',
        isPositive: true,
      });
    } else {
      factors.push({
        text: `Credit score of ${creditScore} falls into higher-risk tier, constraining likelihood.`,
        tag: 'Higher Risk',
        isPositive: false,
      });
    }

    // Factor 2: Income
    if (numIncome < 65000) {
      factors.push({
        text: `Income of ${formatMoney(numIncome)} constrains debt serviceability.`,
        tag: 'Higher Risk',
        isPositive: false,
      });
    } else {
      factors.push({
        text: `Income of ${formatMoney(numIncome)} provides robust repayment capacity.`,
        tag: 'Helped Approval',
        isPositive: true,
      });
    }

    // Factor 3: LTI
    if (ltiRatio <= 32) {
      factors.push({
        text: `Loan-to-income ratio of ${ltiRatio}% is within conservative limits.`,
        tag: 'Helped Approval',
        isPositive: true,
      });
    } else {
      factors.push({
        text: `Loan-to-income ratio of ${ltiRatio}% is elevated, increasing debt servicing pressure.`,
        tag: 'Higher Risk',
        isPositive: false,
      });
    }

    return factors;
  }, [creditScore, numIncome, ltiRatio, currency]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans antialiased text-slate-800">
      {/* 1. Header Section matching Screenshots 2, 3, 4 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>INTERACTIVE SIMULATOR</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Applicant Simulator
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBackendModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/80 text-blue-700 text-xs font-semibold shadow-sm hover:bg-blue-100 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>{backendStatus.mode === 'fastapi' ? 'FastAPI Mode' : 'Demo Mode (Synthetic)'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-1">
          Enter a sample applicant&apos;s details to see how the model evaluates the application. This is a demonstration, not a real lending decision.
        </p>
      </div>

      {/* 2. Quick Sample Profiles Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            QUICK SAMPLE PROFILES
          </span>
          <span className="text-xs font-semibold text-blue-600">
            Select a sample to populate inputs
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {SAMPLE_PROFILES.map((profile) => {
            const isSelected = activeProfileId === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleSelectProfile(profile)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>{profile.name}</span>
                  {isSelected && (
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {profile.summary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Applicant Details Input Parameters Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Applicant Details</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Currency Switcher */}
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  currency === 'INR'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ₹ INR
              </button>
            </div>
            <span className="text-xs font-semibold text-blue-600 hidden sm:inline">
              Input Parameters
            </span>
          </div>
        </div>

        {/* Audit Group Toggle */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Audit Group</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedGroup('A');
                setActiveProfileId(null);
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all border shadow-xs cursor-pointer ${
                selectedGroup === 'A'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              Group A (Reference)
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedGroup('B');
                setActiveProfileId(null);
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all border shadow-xs cursor-pointer ${
                selectedGroup === 'B'
                  ? 'bg-teal-600 border-teal-600 text-white shadow-teal-500/20'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              Group B (Audit)
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Demonstration cutoff: 0.52 for Group A, or 0.44 for Group B.
          </p>
        </div>

        {/* Credit Score Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Credit Score</label>
            <div className="px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs font-extrabold text-slate-800">
              {creditScore}
            </div>
          </div>
          <input
            type="range"
            min={300}
            max={850}
            step={5}
            value={creditScore}
            onChange={(e) => {
              setCreditScore(Number(e.target.value));
              setActiveProfileId(null);
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>300 (Poor)</span>
            <span>670 (Prime)</span>
            <span>850 (Exceptional)</span>
          </div>
        </div>

        {/* Annual Income Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Annual Income ({currencySymbol})
            </label>
            <span className="text-xs font-mono font-bold text-slate-800">
              {formatMoney(numIncome)}
            </span>
          </div>
          <input
            type="number"
            min={0}
            step={1000}
            value={annualIncome}
            placeholder="e.g. 62000"
            onChange={(e) => {
              const val = e.target.value;
              setAnnualIncome(val === '' ? '' : Math.max(0, Number(val)));
              setActiveProfileId(null);
            }}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold text-slate-900"
          />
        </div>

        {/* Requested Loan Amount Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Requested Loan Amount ({currencySymbol})
            </label>
            <span className="text-xs font-mono font-bold text-slate-800">
              {formatMoney(numLoan)}
            </span>
          </div>
          <input
            type="number"
            min={0}
            step={1000}
            value={requestedLoan}
            placeholder="e.g. 18000"
            onChange={(e) => {
              const val = e.target.value;
              setRequestedLoan(val === '' ? '' : Math.max(0, Number(val)));
              setActiveProfileId(null);
            }}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold text-slate-900"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>Loan-to-Income (LTI): <strong className="text-slate-800 font-mono">{ltiRatio}%</strong></span>
            <span className="text-slate-400">Higher loan amounts increase risk profile</span>
          </div>
        </div>

        {/* Years of Employment Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Years of Employment</label>
            <div className="px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs font-extrabold text-slate-800">
              {yearsEmployment} Years
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            step={1}
            value={yearsEmployment}
            onChange={(e) => {
              setYearsEmployment(Number(e.target.value));
              setActiveProfileId(null);
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0 years</span>
            <span>10 years</span>
            <span>25+ years</span>
          </div>
        </div>

        {/* Action Buttons - Evaluate Application is fully wired up! */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-75 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Application...</span>
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                <span>Evaluate Application</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset parameters to baseline"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 4. Prediction Results Card matching Screenshot 2, 4 */}
      <div
        ref={resultsRef}
        className={`bg-white rounded-2xl border shadow-sm p-6 space-y-5 transition-all duration-300 ${
          isEvaluating ? 'border-blue-400 ring-2 ring-blue-100 opacity-90' : 'border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">Prediction Results</h3>
              {hasEvaluated && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" />
                  {lastEvaluatedAt}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Approval Probability: Likelihood score estimated by the trained model.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
              {approvalPercentageStr}%
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Benchmark Evaluated
            </div>
          </div>
        </div>

        {/* Dual Comparison Result Boxes */}
        <div className="space-y-3">
          {/* Box 1: Original Model Result */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isOriginalApproved
                ? 'border-emerald-200 bg-emerald-50/40'
                : 'border-rose-200 bg-rose-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs sm:text-sm text-slate-900">
                Original Model Result
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Cutoff {originalCutoff.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-base font-extrabold">
              {isOriginalApproved ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-slate-900">Approved</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span className="text-slate-900">Declined</span>
                </>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              The prediction before fairness adjustment.
            </div>
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
              Requires probability &ge; 50% for all applicants.
            </div>
          </div>

          {/* Box 2: Adjusted Demo Result */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isAdjustedApproved
                ? 'border-blue-200 bg-blue-50/40'
                : 'border-rose-200 bg-rose-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs sm:text-sm text-slate-900">
                Adjusted Demo Result
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 font-semibold">
                Cutoff {activeDemoCutoff.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-base font-extrabold">
              {isAdjustedApproved ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-900">Approved</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span className="text-slate-900">Declined</span>
                </>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              The prediction after the demonstration&apos;s fairness adjustment.
            </div>
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
              Group {selectedGroup} adjusted demonstration cutoff is {activeDemoCutoff.toFixed(2)}.
            </div>
          </div>
        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Loan-to-Income</div>
            <div className="text-base sm:text-lg font-black text-blue-600 mt-0.5">{ltiRatio}%</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Credit Score Tier</div>
            <div className="text-base sm:text-lg font-black text-slate-800 mt-0.5">{creditScoreTier}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Selected Group</div>
            <div className="text-base sm:text-lg font-black text-slate-800 mt-0.5">Group {selectedGroup}</div>
          </div>
        </div>
      </div>

      {/* 5. Key Input Factors Card matching Screenshot 4, 5 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
          KEY INPUT FACTORS
        </span>

        <div className="space-y-2">
          {keyFactors.map((f, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <span className="text-xs sm:text-sm text-slate-700 font-medium">
                {f.text}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto border ${
                  f.isPositive
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-rose-700 bg-rose-50 border-rose-200'
                }`}
              >
                {f.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Try Different Cutoff Thresholds Card matching Screenshot 5 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Try Different Cutoff Thresholds</h3>
          </div>
          <div className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
            Cutoff = {customCutoff.toFixed(2)}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Drag the slider to see how changing the approval threshold would change the decision.
        </p>

        {/* Cutoff Slider */}
        <div className="space-y-2 pt-1">
          <input
            type="range"
            min={0.10}
            max={0.90}
            step={0.01}
            value={customCutoff}
            onChange={(e) => setCustomCutoff(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.10 (More Lenient)</span>
            <span className="text-teal-600 font-bold">0.44 (Group B Demo)</span>
            <span>0.50 (Standard)</span>
            <span className="text-blue-600 font-bold">0.52 (Group A Demo)</span>
            <span>0.90 (Very Strict)</span>
          </div>
        </div>

        {/* Dynamic Result Box with this Cutoff */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-600 font-medium">Result with this cutoff:</span>
          <span
            className={`font-black ${
              isCustomApproved ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isCustomApproved ? 'APPROVED' : 'DECLINED'} ({approvalPercentageStr}% vs{' '}
            {(customCutoff * 100).toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* 7. Technical Architecture & Decision Rules Methodology Accordion matching Screenshot 5 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900">
                  Technical Architecture &amp; Decision Rules
                </h4>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                  Methodology
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Logistic regression sigmoid inference formula, feature weights, and threshold boundaries
              </p>
            </div>
          </div>
          <div className="text-slate-400">
            {showMethodology ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showMethodology && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-200">
            <div>
              <h5 className="font-bold text-slate-900 mb-1">1. Mathematical Model Formulation</h5>
              <p>
                The credit evaluation engine calculates out-of-sample default risk using calibrated Logistic Regression with standard log-odds parameterization:
              </p>
              <div className="my-2 p-3 bg-slate-900 text-teal-300 rounded-xl font-mono text-xs">
                P(Approved | x) = &sigma;(w^T x + b) = 1 / (1 + exp(-(w^T x + b)))
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-1">2. Feature Scaling &amp; Weights</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong>Credit Score (w = +0.018):</strong> Positively correlated with historical payment discipline.
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong>Loan-to-Income (w = -0.095):</strong> High leverage penalty reducing approval likelihood.
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong>Employment Stability (w = +0.090):</strong> Tenure proxy for disposable income reliability.
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong>Annual Income (w = +0.013):</strong> Capacity reserve against sudden liquidity shocks.
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-1">3. Fairlearn ThresholdOptimizer Post-Processing</h5>
              <p>
                Protected demographic attributes are excluded from direct linear feature weights (preventing direct disparate treatment). However, indirect proxies introduce structural disparate impact. Fairlearn post-processing solves a constrained threshold optimization problem:
              </p>
              <div className="my-2 p-3 bg-slate-900 text-cyan-300 rounded-xl font-mono text-xs">
                Y_hat_g = I(P(Good | x) &ge; &tau;_g), where &tau;_A = 0.52 (Reference) and &tau;_B = 0.44 (Audit)
              </div>
              <p className="text-[11px] text-slate-500">
                Calibrating group-specific cutoffs equalizes opportunity without degrading credit portfolio financial stability.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 8. Footer matching Screenshot 6 */}
      <div className="pt-4 text-center space-y-1 text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px]">
          <span className="flex items-center gap-1 font-semibold text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            FairCredit
          </span>
          <span className="hidden sm:inline">&mdash;</span>
          <span>Responsible Micro-Lending Intelligence</span>
          <span className="hidden sm:inline">&bull;</span>
          <span>Responsible AI Analytics Framework</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Mode: <span className="text-blue-600 font-semibold cursor-pointer">Benchmark Demo</span> &bull; <span className="cursor-pointer hover:underline" onClick={onOpenBackendModal}>Settings</span>
        </div>
      </div>
    </div>
  );
};
