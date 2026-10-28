/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Fairness Audit (Fairlearn MetricFrame)
 */

import React from 'react';
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Info,
  ShieldCheck,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { VERIFIED_TEST_FAIRNESS_AUDIT } from '../../services/mlEngine';

export const FairnessAudit: React.FC = () => {
  const audit = VERIFIED_TEST_FAIRNESS_AUDIT;
  const female = audit.baseline.female;
  const male = audit.baseline.male;

  // Comparison Bar Chart Data between Female vs Male
  const groupMetricsChartData = [
    {
      metric: 'Selection Rate',
      Female: Number((female.selectionRate * 100).toFixed(1)),
      Male: Number((male.selectionRate * 100).toFixed(1)),
      unit: '%',
    },
    {
      metric: 'True Positive Rate (TPR)',
      Female: Number((female.truePositiveRate * 100).toFixed(1)),
      Male: Number((male.truePositiveRate * 100).toFixed(1)),
      unit: '%',
    },
    {
      metric: 'False Positive Rate (FPR)',
      Female: Number((female.falsePositiveRate * 100).toFixed(1)),
      Male: Number((male.falsePositiveRate * 100).toFixed(1)),
      unit: '%',
    },
    {
      metric: 'False Negative Rate (FNR)',
      Female: Number((female.falseNegativeRate * 100).toFixed(1)),
      Male: Number((male.falseNegativeRate * 100).toFixed(1)),
      unit: '%',
    },
    {
      metric: 'Accuracy',
      Female: Number((female.accuracy * 100).toFixed(1)),
      Male: Number((male.accuracy * 100).toFixed(1)),
      unit: '%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Demographic Parity Difference */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Demographic Parity Diff</span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {audit.baseline.demographicParityDifference.toFixed(4)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            |Selection Rate<sub>Male</sub> - Selection Rate<sub>Female</sub>|
          </p>
          <div className="mt-2 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
            10.6% Disparity in Baseline
          </div>
        </div>

        {/* Disparate Impact Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Disparate Impact Ratio</span>
            <TrendingDown className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {audit.baseline.demographicParityRatio.toFixed(4)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Selection Rate<sub>Female</sub> / Selection Rate<sub>Male</sub>
          </p>
          <div className="mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
            86.0% (Passes 80% Rule &gt; 0.80)
          </div>
        </div>

        {/* Equalized Odds Difference */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Equalized Odds Diff</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {audit.baseline.equalizedOddsDifference.toFixed(4)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            max(|ΔTPR|, |ΔFPR|) across demographic slices
          </p>
          <div className="mt-2 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
            10.5% Gap in Recall/TPR
          </div>
        </div>

        {/* Disparate False Rejection Gap */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>False Rejection Gap (ΔFNR)</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {((female.falseNegativeRate - male.falseNegativeRate) * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Female FNR: 25.9% vs Male FNR: 15.4%
          </p>
          <div className="mt-2 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block">
            Females rejected at higher rates
          </div>
        </div>
      </div>

      {/* Main Metric Comparison Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Fairlearn MetricFrame Slices: Female vs Male Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Empirical rates evaluated on 150 untouched test cases (Female: 43 | Male: 107)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-purple-700">
              <span className="w-3 h-3 rounded-full bg-purple-600" /> Female Applicants
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-full bg-blue-600" /> Male Applicants
            </span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupMetricsChartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => [`${val}%`, '']} />
              <Legend />
              <Bar dataKey="Female" name="Female Group" fill="#9333EA" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Male" name="Male Group" fill="#356AE6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metric Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Demographic Disparity Audit Table</h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 font-sans font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Demographic Slice</th>
                <th className="py-2.5 px-3">Count</th>
                <th className="py-2.5 px-3">Selection Rate</th>
                <th className="py-2.5 px-3">TPR (Recall)</th>
                <th className="py-2.5 px-3">FPR</th>
                <th className="py-2.5 px-3">FNR</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">F1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-purple-900">
                  Female Applicants
                </td>
                <td className="py-2.5 px-3">43</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">{(female.selectionRate * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-emerald-700">{(female.truePositiveRate * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-rose-700">{(female.falsePositiveRate * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-amber-700 font-bold">{(female.falseNegativeRate * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3">{(female.accuracy * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3">{(female.precision * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3">{(female.f1Score * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-blue-900">
                  Male Applicants
                </td>
                <td className="py-2.5 px-3">107</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">{(male.selectionRate * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-emerald-700">{(male.truePositiveRate * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-rose-700">{(male.falsePositiveRate * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-amber-700 font-bold">{(male.falseNegativeRate * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3">{(male.accuracy * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3">{(male.precision * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3">{(male.f1Score * 100).toFixed(1)}%</td>
              </tr>
              <tr className="bg-slate-50/70 font-sans font-bold text-slate-800">
                <td className="py-2.5 px-3">Absolute Disparity (|Male - Female|)</td>
                <td className="py-2.5 px-3 font-mono">-</td>
                <td className="py-2.5 px-3 font-mono text-amber-700">
                  {(audit.baseline.demographicParityDifference * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-3 font-mono text-rose-700">
                  {(audit.baseline.equalizedOddsDifference * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-3 font-mono">1.7%</td>
                <td className="py-2.5 px-3 font-mono text-rose-700">10.5%</td>
                <td className="py-2.5 px-3 font-mono">9.6%</td>
                <td className="py-2.5 px-3 font-mono">10.1%</td>
                <td className="py-2.5 px-3 font-mono">10.3%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic & Ethical Rigor Discussion */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Fairness Impossibility Theorem & Metric Conflict Discussion
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">
              1. The Conflict Between Demographic Parity & Equalized Odds
            </h4>
            <p>
              In algorithmic fairness theory (Chouldechova 2017, Kleinberg et al. 2016), when the base default rate differs across demographic groups in historical data, it is mathematically impossible for a predictive model to simultaneously satisfy:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>Demographic Parity: P(Y_hat=1 | Female) = P(Y_hat=1 | Male)</li>
              <li>Equalized Odds: TPR_Female = TPR_Male and FPR_Female = FPR_Male</li>
              <li>Predictive Parity: Equal Precision across groups</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">
              2. Why Model Blindness Fails in Micro-Lending
            </h4>
            <p>
              Excluding <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">personal_status_sex</code> from input features does <em>not</em> produce fairness. Non-protected variables such as <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">housing</code> (renting vs owning) and <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">property</code> act as proxy variables, reproducing demographic disparities through indirect statistical correlation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
