/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Proxy Variable Analysis & Threat Ranking
 */

import React from 'react';
import {
  GitFork,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PROXY_VARIABLE_ANALYSIS } from '../../services/mlEngine';

export const ProxyVariableAnalysis: React.FC = () => {
  const proxies = PROXY_VARIABLE_ANALYSIS;

  const chartData = proxies.map((p) => ({
    name: p.featureName,
    score: Number((p.associationScore * 100).toFixed(1)),
    threat: p.proxyThreatLevel,
    category: p.category,
  }));

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2">
          <GitFork className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            Proxy Variable Identification & Covert Disparity Analysis
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          A proxy variable is a non-protected feature (such as homeownership or loan purpose) that statistically correlates with a protected demographic attribute (such as gender or marital status). In machine learning micro-lending systems, removing the sensitive feature does <strong>not</strong> eliminate discrimination if strong proxies remain in the model feature space.
        </p>
      </div>

      {/* Top Threat Ranking Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Proxy Association Ranking with Protected Feature (personal_status_sex)
          </h3>
          <p className="text-xs text-slate-500">
            Empirical statistical associations (Cramer&apos;s V for nominal variables, Pearson |r| for continuous variables)
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis unit="%" domain={[0, 40]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => [`${val}% association`, 'Statistical Score']} />
              <Bar dataKey="score" fill="#356AE6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Proxy Ranking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Proxy Threat Evaluation Table</h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Feature Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Association Measure</th>
                <th className="py-3 px-3">Calculated Score</th>
                <th className="py-3 px-3">Proxy Threat</th>
                <th className="py-3 px-4">Mechanism & Lending Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proxies.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.featureName}</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{p.category}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{p.associationMethod}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">
                    {(p.associationScore).toFixed(3)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        p.proxyThreatLevel === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : p.proxyThreatLevel === 'Moderate'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {p.proxyThreatLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed text-[11px]">
                    {p.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Disparity vs Discrimination Disclaimer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>Legal & Scientific Principle: Correlation vs Discriminatory Bias</span>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-2 leading-relaxed">
          <p>
            <strong>Important Legal Distinction:</strong> In fair lending jurisprudence (such as the Equal Credit Opportunity Act - Regulation B and Consumer Financial Protection Bureau guidance):
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900 pl-1">
            <li>
              A statistical correlation between a feature (e.g. <em>housing status</em> or <em>property</em>) and a protected class does <strong>not</strong> by itself establish unlawful discrimination if the variable is justified by a <strong>legitimate business necessity</strong> (e.g. verifiable debt capacity and collateral recovery).
            </li>
            <li>
              However, if an alternative feature specification or bias mitigation procedure (such as threshold optimization or reweighting) can achieve equivalent default-loss prevention with significantly lower demographic disparity, retaining the unconstrained model creates demonstrable legal and ethical vulnerability.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
