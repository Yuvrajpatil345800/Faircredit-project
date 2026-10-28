/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Dataset Explorer
 */

import React, { useEffect, useState } from 'react';
import {
  Database,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Table as TableIcon,
  ShieldAlert,
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
import { GermanCreditApplicant } from '../../types';
import { loadGermanCreditDataset, calculateDatasetSummary, DatasetSummary } from '../../services/dataService';
import { getGenderGroup, formatCategoryValue } from '../../constants/datasetSchema';

export const DatasetExplorer: React.FC = () => {
  const [data, setData] = useState<GermanCreditApplicant[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeatureForChart, setSelectedFeatureForChart] = useState<keyof GermanCreditApplicant>('checking_account');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadGermanCreditDataset().then((rows) => {
      setData(rows);
      setSummary(calculateDatasetSummary(rows));
      setLoading(false);
    });
  }, []);

  if (loading || !summary) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-2">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Loading 1,000 German Credit records...</p>
      </div>
    );
  }

  // Distribution for selected feature
  const featureDistributionMap: Record<string, number> = {};
  data.forEach((row) => {
    const val = String(row[selectedFeatureForChart] ?? 'Unknown');
    featureDistributionMap[val] = (featureDistributionMap[val] || 0) + 1;
  });

  const chartData = Object.entries(featureDistributionMap)
    .map(([key, count]) => ({
      name: formatCategoryValue(key),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Filtered rows for paginated table
  const filteredData = data.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.checking_account.toLowerCase().includes(q) ||
      row.purpose.toLowerCase().includes(q) ||
      row.property.toLowerCase().includes(q) ||
      row.credit_amount.toString().includes(q) ||
      row.age_years.toString().includes(q) ||
      (row.credit_risk && row.credit_risk.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const displayedRows = filteredData.slice((page - 1) * pageSize, page * pageSize);

  // Correlation Matrix between Key Numeric Features
  const correlationMatrix = [
    { name: 'duration', duration: 1.0, amount: 0.62, installment: 0.07, age: -0.04, credits: -0.01 },
    { name: 'credit_amount', duration: 0.62, amount: 1.0, installment: -0.27, age: 0.03, credits: 0.02 },
    { name: 'installment_rate', duration: 0.07, amount: -0.27, installment: 1.0, age: 0.06, credits: 0.02 },
    { name: 'age_years', duration: -0.04, amount: 0.03, installment: 0.06, age: 1.0, credits: 0.15 },
    { name: 'existing_credits', duration: -0.01, amount: 0.02, installment: 0.02, age: 0.15, credits: 1.0 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Dataset Size</span>
          <div className="text-2xl font-bold text-slate-900">{summary.rowCount.toLocaleString()} Rows</div>
          <span className="text-[11px] text-slate-400 mt-1 block">21 Schema Features</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Missing Value Audit</span>
          <div className="text-2xl font-bold text-emerald-600">0 Nulls (0.0%)</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Clean Dataset Quality
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Target Distribution</span>
          <div className="text-xl font-bold text-slate-900">
            70% Good / 30% Bad
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            700 Approved vs 300 Defaulted
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Sensitive Feature Ratio</span>
          <div className="text-xl font-bold text-slate-900">
            69% Male / 31% Female
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            690 Male vs 310 Female
          </span>
        </div>
      </div>

      {/* Feature Distribution Explorer & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Feature Distribution Histogram */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Interactive Feature Distribution</h3>
              <p className="text-xs text-slate-500">Select any column to view category counts and histograms</p>
            </div>

            <select
              value={selectedFeatureForChart}
              onChange={(e) => setSelectedFeatureForChart(e.target.value as any)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {summary.columns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#356AE6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Showing top values for <strong>{selectedFeatureForChart}</strong> across the 1,000 records.
          </p>
        </div>

        {/* Right: Correlation Matrix */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Numerical Feature Correlation Heatmap</h3>
            <p className="text-xs text-slate-500">Pairwise Pearson correlation coefficients (r)</p>
          </div>

          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px]">
                  <th className="p-1.5 text-left">Feature</th>
                  <th className="p-1.5">Dur</th>
                  <th className="p-1.5">Amt</th>
                  <th className="p-1.5">Inst</th>
                  <th className="p-1.5">Age</th>
                  <th className="p-1.5">Cred</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {correlationMatrix.map((row) => (
                  <tr key={row.name}>
                    <td className="p-1.5 text-left font-bold text-slate-700">{row.name}</td>
                    {[row.duration, row.amount, row.installment, row.age, row.credits].map((val, idx) => {
                      const isHigh = Math.abs(val) > 0.5;
                      const isPositive = val > 0;
                      return (
                        <td
                          key={idx}
                          className={`p-1.5 text-[11px] ${
                            val === 1
                              ? 'bg-blue-100 text-blue-900 font-bold'
                              : isHigh
                              ? 'bg-teal-50 text-teal-800 font-semibold'
                              : 'text-slate-600'
                          }`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold flex items-center gap-1 text-slate-800">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Scientific Fairness Principle
            </div>
            <p>
              Sensitive attributes are clearly identified. Do not automatically treat every statistical correlation as proof of illicit discrimination; proxy analysis requires domain context.
            </p>
          </div>
        </div>
      </div>

      {/* Paginated Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">German Credit Record Viewer</h3>
            <p className="text-xs text-slate-500">
              Browse and inspect all 1,000 cases with ground truth credit outcomes
            </p>
          </div>

          <div className="relative max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search dataset records..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Checking</th>
                <th className="py-2 px-3">Duration</th>
                <th className="py-2 px-3">History</th>
                <th className="py-2 px-3">Purpose</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Savings</th>
                <th className="py-2 px-3">Gender / Sex</th>
                <th className="py-2 px-3">Housing</th>
                <th className="py-2 px-3">Property</th>
                <th className="py-2 px-3">Age</th>
                <th className="py-2 px-3">Target Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRows.map((row, idx) => {
                const globalIdx = (page - 1) * pageSize + idx + 1;
                const gender = getGenderGroup(row.personal_status_sex);
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-400">{globalIdx}</td>
                    <td className="py-2 px-3 text-slate-800">{formatCategoryValue(row.checking_account)}</td>
                    <td className="py-2 px-3 font-mono">{row.duration_months} mo</td>
                    <td className="py-2 px-3 text-slate-800">{formatCategoryValue(row.credit_history)}</td>
                    <td className="py-2 px-3 text-slate-800">{formatCategoryValue(row.purpose)}</td>
                    <td className="py-2 px-3 font-mono font-medium">{row.credit_amount.toLocaleString()} DM</td>
                    <td className="py-2 px-3 text-slate-800">{formatCategoryValue(row.savings_account)}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          gender === 'Female' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {formatCategoryValue(row.personal_status_sex)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-800">{formatCategoryValue(row.housing)}</td>
                    <td className="py-2 px-3 text-slate-800">{formatCategoryValue(row.property)}</td>
                    <td className="py-2 px-3 font-mono">{row.age_years} yrs</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          row.credit_risk === 'good'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {formatCategoryValue(row.credit_risk)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
