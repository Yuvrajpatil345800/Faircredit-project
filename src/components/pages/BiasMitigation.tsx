/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Bias Mitigation & Interactive Threshold Tuning
 */

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Scale,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Info,
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

export const BiasMitigation: React.FC = () => {
  const audit = VERIFIED_TEST_FAIRNESS_AUDIT;

  // Interactive Threshold Optimizer Workspace
  const [thresholdFemale, setThresholdFemale] = useState(0.48);
  const [thresholdMale, setThresholdMale] = useState(0.53);

  // Dynamic simulation based on threshold shift
  // Lowering female threshold increases female selection rate and TPR; raising male threshold tightens male selection
  const simulatedFemaleSelection = Math.min(
    0.95,
    Math.max(0.35, 0.6512 + (0.5 - thresholdFemale) * 0.9)
  );
  const simulatedMaleSelection = Math.min(
    0.95,
    Math.max(0.35, 0.7570 - (thresholdMale - 0.5) * 0.8)
  );
  const simulatedDPDiff = Math.abs(simulatedMaleSelection - simulatedFemaleSelection);
  const simulatedDPRatio =
    simulatedMaleSelection > 0 ? simulatedFemaleSelection / simulatedMaleSelection : 1;

  // Accuracy penalty formula modeling trade-off
  const accuracyDelta =
    -Math.abs(thresholdFemale - 0.5) * 0.04 - Math.abs(thresholdMale - 0.5) * 0.03;
  const simulatedAccuracy = Math.min(0.76, Math.max(0.65, 0.733 + accuracyDelta));

  const handleResetSliders = () => {
    setThresholdFemale(0.48);
    setThresholdMale(0.53);
  };

  // Comparison data for 3 mitigation approaches
  const approachComparison = [
    {
      approach: 'A. Baseline Model (LR)',
      type: 'Unconstrained',
      accuracy: '72.0%',
      f1Score: '79.1%',
      dpDiff: '0.1058 (10.6%)',
      eoDiff: '0.1054',
      status: 'High Disparity',
      statusColor: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      approach: 'B. Class Reweighting',
      type: 'In-Processing',
      accuracy: '70.7%',
      f1Score: '77.5%',
      dpDiff: '0.0980 (9.8%)',
      eoDiff: '0.1120',
      status: 'Moderate Trade-off',
      statusColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      approach: 'C. ThresholdOptimizer (Fairlearn)',
      type: 'Post-Processing',
      accuracy: '73.3%',
      f1Score: '79.7%',
      dpDiff: '0.0872 (8.7%)',
      eoDiff: '0.1054',
      status: 'Pareto Optimal',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ];

  const tradeOffBarData = [
    {
      metric: 'Accuracy',
      Baseline: 72.0,
      Reweighted: 70.7,
      ThresholdOptimizer: 73.3,
    },
    {
      metric: 'F1 Score',
      Baseline: 79.1,
      Reweighted: 77.5,
      ThresholdOptimizer: 79.7,
    },
    {
      metric: 'Fairness Score (1 - DP Diff)',
      Baseline: 89.4,
      Reweighted: 90.2,
      ThresholdOptimizer: 91.3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 3 Mitigation Approaches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Algorithmic Mitigation Paradigms Comparison
          </h2>
          <p className="text-xs text-slate-500">
            Evaluating pre-processing, in-processing, and post-processing fairness interventions on the test partition
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Intervention Strategy</th>
                <th className="py-3 px-3">Pipeline Stage</th>
                <th className="py-3 px-3">Test Accuracy</th>
                <th className="py-3 px-3">F1-Score</th>
                <th className="py-3 px-3">Demographic Parity Diff</th>
                <th className="py-3 px-3">Equalized Odds Diff</th>
                <th className="py-3 px-3">Audit Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {approachComparison.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">{item.approach}</td>
                  <td className="py-3 px-3 font-sans text-slate-600 font-medium">{item.type}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{item.accuracy}</td>
                  <td className="py-3 px-3 font-bold text-blue-600">{item.f1Score}</td>
                  <td className="py-3 px-3 font-bold text-amber-700">{item.dpDiff}</td>
                  <td className="py-3 px-3">{item.eoDiff}</td>
                  <td className="py-3 px-3 font-sans">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Threshold Optimizer Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">
                Fairlearn ThresholdOptimizer Interactive Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust group-specific acceptance cut-offs ($t_F$ and $t_M$) to observe live Pareto frontier trade-offs.
            </p>
          </div>

          <button
            onClick={handleResetSliders}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Optimal Thresholds</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          {/* Female Threshold */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-purple-900 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-600" />
                Female Acceptance Cut-off ($t_F$)
              </span>
              <span className="font-mono font-bold text-sm text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                {thresholdFemale.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min={0.3}
              max={0.7}
              step={0.01}
              value={thresholdFemale}
              onChange={(e) => setThresholdFemale(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0.30 (Lenient Approval)</span>
              <span>Default: 0.50</span>
              <span>0.70 (Strict Rejection)</span>
            </div>

            <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between">
              <span>Simulated Female Approval Rate:</span>
              <span className="font-bold text-purple-700">
                {(simulatedFemaleSelection * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Male Threshold */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                Male Acceptance Cut-off ($t_M$)
              </span>
              <span className="font-mono font-bold text-sm text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                {thresholdMale.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min={0.3}
              max={0.7}
              step={0.01}
              value={thresholdMale}
              onChange={(e) => setThresholdMale(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0.30 (Lenient Approval)</span>
              <span>Default: 0.50</span>
              <span>0.70 (Strict Rejection)</span>
            </div>

            <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between">
              <span>Simulated Male Approval Rate:</span>
              <span className="font-bold text-blue-700">
                {(simulatedMaleSelection * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Live Simulator KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
            <span className="text-xs text-slate-500 block mb-1">Simulated Demographic Disparity</span>
            <span
              className={`text-2xl font-black ${
                simulatedDPDiff <= 0.05
                  ? 'text-emerald-600'
                  : simulatedDPDiff <= 0.1
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {(simulatedDPDiff * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              {simulatedDPDiff <= 0.05 ? 'Nearly Parity (< 5%)' : 'Measurable Disparity'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
            <span className="text-xs text-slate-500 block mb-1">Disparate Impact Ratio</span>
            <span
              className={`text-2xl font-black ${
                simulatedDPRatio >= 0.8 && simulatedDPRatio <= 1.25
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {(simulatedDPRatio * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              {simulatedDPRatio >= 0.8 ? 'Complies with 80% Rule' : 'Adverse Impact (< 80%)'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
            <span className="text-xs text-slate-500 block mb-1">Estimated Test Accuracy</span>
            <span className="text-2xl font-black text-slate-900">
              {(simulatedAccuracy * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Penalty: {(accuracyDelta * 100).toFixed(1)}% vs baseline
            </span>
          </div>
        </div>
      </div>

      {/* Trade-off Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Performance vs Fairness Trade-off Frontier
          </h3>
          <p className="text-xs text-slate-500">
            Visualizing the subtle shift in predictive power when optimizing for equitable credit access
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tradeOffBarData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <YAxis domain={[60, 100]} unit="%" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => [`${val}%`, '']} />
              <Legend />
              <Bar dataKey="Baseline" name="Baseline Logistic Regression" fill="#356AE6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Reweighted" name="Class Reweighting" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ThresholdOptimizer" name="ThresholdOptimizer" fill="#16A6A1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
