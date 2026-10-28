/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Batch CSV Predictions
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
} from 'lucide-react';
import { GermanCreditApplicant, BatchPredictionRow } from '../../types';
import { REQUIRED_COLUMNS, SAMPLE_CSV_TEMPLATE, formatCategoryValue } from '../../constants/datasetSchema';
import { parseCsvText } from '../../services/dataService';
import { predictApplicant } from '../../services/mlEngine';

export const BatchPrediction: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<GermanCreditApplicant[]>([]);
  const [results, setResults] = useState<BatchPredictionRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<'all' | 'GOOD' | 'BAD'>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'Female' | 'Male'>('all');

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'german_credit_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileProcess = (file: File) => {
    setSelectedFile(file);
    setValidationErrors([]);
    setResults([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setValidationErrors(['The uploaded file is empty.']);
        return;
      }

      const rows = parseCsvText(text);
      if (rows.length === 0) {
        setValidationErrors(['Failed to parse CSV lines or no data found.']);
        return;
      }

      // Validate columns
      const firstRow = rows[0] as unknown as Record<string, any>;
      const missing = REQUIRED_COLUMNS.filter((col) => !(col in firstRow));
      if (missing.length > 0) {
        setValidationErrors([
          `Missing required columns: ${missing.slice(0, 5).join(', ')}${
            missing.length > 5 ? ` (+${missing.length - 5} more)` : ''
          }. Please check template schema.`,
        ]);
        return;
      }

      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRunBatch = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const batchResults: BatchPredictionRow[] = parsedRows.map((applicant, index) => {
        const pred = predictApplicant(applicant);
        const actualRisk = applicant.credit_risk;
        const isCorrect = actualRisk
          ? (actualRisk === 'good' && pred.prediction === 'GOOD') ||
            (actualRisk === 'bad' && pred.prediction === 'BAD')
          : undefined;

        return {
          ...applicant,
          id: index + 1,
          prediction: pred.prediction,
          probabilityGood: pred.probabilityGood,
          probabilityBad: pred.probabilityBad,
          derivedGender: pred.derivedGender,
          actualRisk,
          isCorrect,
        };
      });

      setResults(batchResults);
      setIsProcessing(false);
    }, 250);
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = [
      'id',
      'prediction',
      'probability_good',
      'probability_bad',
      'derived_gender',
      'actual_risk',
      ...REQUIRED_COLUMNS,
    ];

    const lines = [headers.join(',')];
    results.forEach((row) => {
      const vals = [
        row.id,
        row.prediction,
        row.probabilityGood,
        row.probabilityBad,
        row.derivedGender,
        row.actualRisk || '',
        ...REQUIRED_COLUMNS.map((col) => (row as any)[col] ?? ''),
      ];
      lines.push(vals.join(','));
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'faircredit_batch_predictions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (results.length === 0) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'faircredit_batch_predictions.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Aggregates
  const totalProcessed = results.length;
  const goodCount = results.filter((r) => r.prediction === 'GOOD').length;
  const badCount = results.filter((r) => r.prediction === 'BAD').length;
  const approvalRate = totalProcessed > 0 ? (goodCount / totalProcessed) * 100 : 0;

  const femaleResults = results.filter((r) => r.derivedGender === 'Female');
  const maleResults = results.filter((r) => r.derivedGender === 'Male');
  const femaleApprovalRate =
    femaleResults.length > 0
      ? (femaleResults.filter((r) => r.prediction === 'GOOD').length / femaleResults.length) * 100
      : 0;
  const maleApprovalRate =
    maleResults.length > 0
      ? (maleResults.filter((r) => r.prediction === 'GOOD').length / maleResults.length) * 100
      : 0;

  // Labeled performance if ground-truth present
  const labeledRows = results.filter((r) => r.actualRisk !== undefined);
  const correctCount = labeledRows.filter((r) => r.isCorrect).length;
  const batchAccuracy = labeledRows.length > 0 ? (correctCount / labeledRows.length) * 100 : null;

  // Filtered rows for table
  const filteredResults = results.filter((r) => {
    if (filterClass !== 'all' && r.prediction !== filterClass) return false;
    if (filterGender !== 'all' && r.derivedGender !== filterGender) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toString().includes(q) ||
        r.checking_account.toLowerCase().includes(q) ||
        r.purpose.toLowerCase().includes(q) ||
        r.credit_amount.toString().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Upload CSV Loan Portfolio</h2>
            <p className="text-xs text-slate-500">
              Process applicants in bulk through the scikit-learn Logistic Regression inference model.
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download Schema Template</span>
          </button>
        </div>

        {/* Drag Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center transition-all bg-slate-50/50 hover:bg-blue-50/20 cursor-pointer"
          onClick={() => document.getElementById('csv-file-input')?.click()}
        >
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />

          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-sm font-bold text-slate-800">
            {selectedFile ? selectedFile.name : 'Drag and drop your CSV file here, or browse files'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Accepts UTF-8 encoded CSV files matching the 20 German Credit features
          </p>

          {selectedFile && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100/60 text-blue-800 rounded-full text-xs font-semibold">
              <FileCheck className="w-4 h-4" />
              <span>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB) - {parsedRows.length} valid rows
              </span>
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-900">
              <AlertCircle className="w-4 h-4" />
              CSV Schema Validation Failed
            </div>
            {validationErrors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        {/* Action Button */}
        {parsedRows.length > 0 && validationErrors.length === 0 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-medium">
              Ready to process <strong>{parsedRows.length}</strong> applicant records
            </span>
            <button
              onClick={handleRunBatch}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Scoring Records...' : 'Run Batch Predictions'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Cards when Processed */}
      {results.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block mb-1">Total Processed</span>
              <div className="text-2xl font-bold text-slate-900">{totalProcessed}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">100% evaluated</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block mb-1">Approvals (Good Risk)</span>
              <div className="text-2xl font-bold text-emerald-600">{goodCount}</div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                {approvalRate.toFixed(1)}% of portfolio
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block mb-1">Declines (Bad Risk)</span>
              <div className="text-2xl font-bold text-rose-600">{badCount}</div>
              <span className="text-[11px] text-rose-700 font-semibold mt-1 block">
                {(100 - approvalRate).toFixed(1)}% rejection
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block mb-1">Gender Approval Disparity</span>
              <div className="text-xl font-bold text-slate-900">
                {(maleApprovalRate - femaleApprovalRate).toFixed(1)}% Gap
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Male: {maleApprovalRate.toFixed(1)}% | Female: {femaleApprovalRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* If actual labels present, show accuracy */}
          {batchAccuracy !== null && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>Ground-truth credit_risk verified:</strong> Batch accuracy is{' '}
                  <strong>{batchAccuracy.toFixed(1)}%</strong> ({correctCount}/{labeledRows.length} matched).
                </span>
              </div>
            </div>
          )}

          {/* Table Toolbar & Exports */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search applicant ID, checking, purpose..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Class */}
                <select
                  value={filterClass}
                  onChange={(e: any) => setFilterClass(e.target.value)}
                  className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="all">All Outcomes</option>
                  <option value="GOOD">Good Risk Only</option>
                  <option value="BAD">Bad Risk Only</option>
                </select>

                {/* Filter Gender */}
                <select
                  value={filterGender}
                  onChange={(e: any) => setFilterGender(e.target.value)}
                  className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="all">All Genders</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              {/* Download buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Prediction</th>
                    <th className="py-2.5 px-3">P(Good)</th>
                    <th className="py-2.5 px-3">Gender</th>
                    <th className="py-2.5 px-3">Account</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">History</th>
                    <th className="py-2.5 px-3">Purpose</th>
                    {labeledRows.length > 0 && <th className="py-2.5 px-3">Actual</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.slice(0, 50).map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-mono text-slate-400">{row.id}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            row.prediction === 'GOOD'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {row.prediction}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold">
                        {(row.probabilityGood * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            row.derivedGender === 'Female'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {row.derivedGender}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-800">{formatCategoryValue(row.checking_account)}</td>
                      <td className="py-2 px-3 font-mono">{row.duration_months} mo</td>
                      <td className="py-2 px-3 font-mono">{row.credit_amount.toLocaleString()} DM</td>
                      <td className="py-2 px-3 text-slate-800">{formatCategoryValue(row.credit_history)}</td>
                      <td className="py-2 px-3 text-slate-800">{formatCategoryValue(row.purpose)}</td>
                      {labeledRows.length > 0 && (
                        <td className="py-2 px-3 font-bold">
                          {row.actualRisk ? (
                            <span
                              className={
                                row.isCorrect ? 'text-emerald-600' : 'text-rose-600'
                              }
                            >
                              {row.actualRisk.toUpperCase()}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>Showing up to 50 of {filteredResults.length} filtered records</span>
              <span>Export CSV/JSON to download full portfolio predictions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
