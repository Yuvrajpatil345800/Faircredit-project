/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Overview Dashboard
 */

import React from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Scale,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { NavTabId } from '../layout/Sidebar';
import { VERIFIED_TEST_FAIRNESS_AUDIT, TEST_SET_EVALUATION } from '../../services/mlEngine';

interface OverviewDashboardProps {
  onNavigate: (tab: NavTabId) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const audit = VERIFIED_TEST_FAIRNESS_AUDIT;

  // Donut chart data: Good vs Bad Risk in German Credit
  const riskDistributionData = [
    { name: 'Good Credit Risk (Approved)', value: 700, color: '#15966A' },
    { name: 'Bad Credit Risk (Default)', value: 300, color: '#D9485F' },
  ];

  // Actual vs Predicted breakdown on test set (150 observations)
  const actualVsPredictedData = [
    {
      category: 'Actual Good Loans (105)',
      PredictedGood: 86,
      PredictedBad: 19,
    },
    {
      category: 'Actual Bad Loans (45)',
      PredictedGood: 23, // False Positives
      PredictedBad: 22,  // True Negatives
    },
  ];

  // Baseline vs Mitigated Fairness comparison
  const fairnessComparisonData = [
    {
      metric: 'Demographic Parity Diff',
      Baseline: Number((audit.baseline.demographicParityDifference * 100).toFixed(1)),
      Mitigated: Number(((audit.mitigated?.demographicParityDifference ?? 0) * 100).toFixed(1)),
      unit: '%',
    },
    {
      metric: 'Disparate Impact Ratio',
      Baseline: Number((audit.baseline.demographicParityRatio * 100).toFixed(1)),
      Mitigated: Number(((audit.mitigated?.demographicParityRatio ?? 0) * 100).toFixed(1)),
      unit: '%',
    },
    {
      metric: 'Equalized Odds Diff',
      Baseline: Number((audit.baseline.equalizedOddsDifference * 100).toFixed(1)),
      Mitigated: Number(((audit.mitigated?.equalizedOddsDifference ?? 0) * 100).toFixed(1)),
      unit: '%',
    },
  ];

  // Model performance comparison (Accuracy, Precision, Recall, F1)
  const performanceComparisonData = [
    {
      metric: 'Accuracy',
      Baseline: 72.0,
      Reweighted: 70.7,
      ThresholdOpt: 73.3,
    },
    {
      metric: 'Precision',
      Baseline: 76.5,
      Reweighted: 78.9,
      ThresholdOpt: 76.8,
    },
    {
      metric: 'Recall',
      Baseline: 81.9,
      Reweighted: 76.2,
      ThresholdOpt: 82.9,
    },
    {
      metric: 'F1-Score',
      Baseline: 79.1,
      Reweighted: 77.5,
      ThresholdOpt: 79.7,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base tracking-tight">
                Authentic Evaluation Data Loaded
              </h2>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                70/15/15 Stratified Split
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Metrics calculated directly on the German Credit dataset (1,000 cases) using scikit-learn and Fairlearn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('prediction')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <span>Run Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('fairness')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            <span>Audit Slices</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Records */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Evaluation Records</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">1,000</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>700 Train / 150 Val / 150 Test</span>
            <span className="text-emerald-600 font-semibold">100% Valid</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Baseline Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">72.0%</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Mitigated: 73.3%</span>
            <span className="text-emerald-600 font-semibold">+1.3% Net</span>
          </div>
        </div>

        {/* Good Risk Selection Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Approval Rate (Test)</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">72.7%</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Male: 75.7% | Female: 65.1%</span>
            <span className="text-amber-600 font-semibold">Disparity</span>
          </div>
        </div>

        {/* Demographic Parity Difference */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Demographic Parity Diff</span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">0.1058</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Mitigated to 0.0872</span>
            <span className="text-emerald-600 font-semibold">-17.6% Bias</span>
          </div>
        </div>

        {/* Equalized Odds Difference */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Equalized Odds Diff</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">0.1054</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Max(|ΔTPR|, |ΔFPR|)</span>
            <span className="text-blue-600 font-semibold">Balanced</span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Target Variable Distribution: Credit Risk
              </h3>
              <p className="text-xs text-slate-500">
                Ground-truth credit risk labels across all 1,000 dataset samples
              </p>
            </div>
            <button
              onClick={() => onNavigate('dataset')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Dataset <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} loans (${Number(value) / 10}%)`, name]}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-emerald-900">
              <span className="font-bold block text-sm">700 Loans (70.0%)</span>
              <span className="text-emerald-700 text-[11px]">Class 1: Good Credit Risk</span>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-rose-900">
              <span className="font-bold block text-sm">300 Loans (30.0%)</span>
              <span className="text-rose-700 text-[11px]">Class 0: Bad Credit Risk</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Actual vs Predicted Grouped Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Confusion Matrix: Actual vs Predicted Classes
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation on untouched 150-applicant test partition
              </p>
            </div>
            <button
              onClick={() => onNavigate('evaluation')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Evaluation <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actualVsPredictedData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="PredictedGood" name="Predicted Good Risk" fill="#356AE6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="PredictedBad" name="Predicted Bad Risk" fill="#D9485F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>True Positives: 86 | True Negatives: 22</span>
            <span>False Positives: 23 | False Negatives: 19</span>
          </div>
        </div>
      </div>

      {/* Row 3: Fairness & Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Baseline vs Mitigated Fairness */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Fairness Audit: Baseline vs Mitigated Metrics
              </h3>
              <p className="text-xs text-slate-500">
                Fairlearn ThresholdOptimizer reduction of demographic disparities
              </p>
            </div>
            <button
              onClick={() => onNavigate('mitigation')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Mitigation <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fairnessComparisonData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [`${val}%`, '']} />
                <Legend />
                <Bar dataKey="Baseline" name="Baseline Logistic Regression" fill="#D99019" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Mitigated" name="Threshold-Optimized Model" fill="#16A6A1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
            <strong>Key Insight:</strong> Threshold optimization successfully lowers demographic parity disparity from 10.6% to 8.7% while maintaining equalized odds bounds.
          </div>
        </div>

        {/* Chart 4: Model Performance Metrics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Model Performance Across Optimization Paradigms
              </h3>
              <p className="text-xs text-slate-500">
                Comparing Accuracy, Precision, Recall, and F1 across 3 configured models
              </p>
            </div>
            <button
              onClick={() => onNavigate('evaluation')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Models <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceComparisonData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis domain={[65, 90]} unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [`${val}%`, '']} />
                <Legend />
                <Bar dataKey="Baseline" name="Baseline (LR)" fill="#356AE6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Reweighted" name="Reweighted (In-processing)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ThresholdOpt" name="ThresholdOptimizer (Post-processing)" fill="#16A6A1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
            <strong>Trade-off Observation:</strong> Post-processing maintains high F1 (79.7%) without sacrificing accuracy compared to in-processing class reweighting.
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activity & Quick Navigation Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4">
          Core Auditing Workflows & Engineering Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('prediction')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600">
                1. Individual Risk Assessment
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Test single loan applicants with all 20 German Credit attributes. Inspect model probabilities and limitation disclaimers.
            </p>
          </div>

          <div
            onClick={() => onNavigate('proxy')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600">
                2. Proxy Variable Analysis
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analyze how non-sensitive features (housing, property, age) inadvertently correlate with gender and cause covert bias.
            </p>
          </div>

          <div
            onClick={() => onNavigate('reports')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600">
                3. Reports & Academic Governance
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download complete technical reports in Word DOCX format compliant with NBA accreditation and 25-mark CIAP rubrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
