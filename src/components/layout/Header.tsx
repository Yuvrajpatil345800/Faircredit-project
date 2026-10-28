/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Main Content Header
 */

import React from 'react';
import {
  Download,
  Server,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { NavTabId } from './Sidebar';
import { BackendStatus } from '../../types';
import { SAMPLE_CSV_TEMPLATE } from '../../constants/datasetSchema';

interface HeaderProps {
  activeTab: NavTabId;
  backendStatus: BackendStatus;
  onOpenBackendModal: () => void;
  onOpenInfo: () => void;
}

const TAB_META: Record<NavTabId, { title: string; subtitle: string; category: string }> = {
  overview: {
    category: 'Dashboard',
    title: 'Executive Algorithmic Bias & Performance Overview',
    subtitle: 'Synthesizing micro-lending risk prediction accuracy, demographic parity, and equalized odds trade-offs.',
  },
  prediction: {
    category: 'Interactive Simulator',
    title: 'Applicant Simulator',
    subtitle: "Enter a sample applicant's details to see how the model evaluates the application. This is a demonstration, not a real lending decision.",
  },
  batch: {
    category: 'Processing',
    title: 'High-Throughput Batch Credit Predictions',
    subtitle: 'Upload CSV records, validate schema compliance, compute good/bad risks, and audit group approval disparities.',
  },
  dataset: {
    category: 'Exploratory Data Analysis',
    title: 'German Credit Dataset Explorer',
    subtitle: 'Comprehensive distribution profiles, attribute cardinalities, missing-value verifications, and correlation matrices.',
  },
  evaluation: {
    category: 'Model Benchmarking',
    title: 'Predictive Model Evaluation & Validation',
    subtitle: 'Strict out-of-sample benchmarking across Accuracy, Precision, Recall, F1, and ROC-AUC on untouched test records.',
  },
  fairness: {
    category: 'Fairlearn Auditing',
    title: 'Demographic Fairness & Disparity Audit',
    subtitle: 'Quantifying demographic parity difference, disparate impact ratio, and equalized odds error-rate balance.',
  },
  mitigation: {
    category: 'Algorithmic Mitigation',
    title: 'Bias Mitigation & Pareto Frontier Analysis',
    subtitle: 'Comparing Baseline Logistic Regression, Sample Reweighting, and Fairlearn ThresholdOptimizer post-processing.',
  },
  proxy: {
    category: 'Statistical Associations',
    title: 'Proxy Variable Identification & Threat Ranking',
    subtitle: 'Evaluating indirect demographic correlations through housing, property, and age to address disparate impact.',
  },
  business: {
    category: 'Decision Support',
    title: 'Financial & Business Impact Simulation',
    subtitle: 'Analyzing loan portfolio default costs, approval volume trade-offs, and ethical governance compliance.',
  },
  reports: {
    category: 'Governance & Export',
    title: 'Technical Auditing Reports & Artifact Export',
    subtitle: 'Export prediction results to CSV, structured JSON metrics, and formatted IEEE/NBA technical documentation.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  backendStatus,
  onOpenBackendModal,
  onOpenInfo,
}) => {
  const meta = TAB_META[activeTab];

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'german_credit_sample_schema.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Breadcrumbs & Page Titles */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <span>FairCredit</span>
            <span>/</span>
            <span className="text-blue-600">{meta.category}</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            {meta.title}
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-0.5 max-w-3xl">
            {meta.subtitle}
          </p>
        </div>

        {/* Right: Actions and Live Status Indicators */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {/* Dataset Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Dataset: 1,000 Records</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>

          {/* Model Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>LR + ThresholdOptimizer</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>

          {/* Backend Toggle Button */}
          <button
            onClick={onOpenBackendModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              backendStatus.mode === 'fastapi'
                ? backendStatus.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title="Configure FastAPI Python backend or verify embedded engine"
          >
            <Server className="w-3.5 h-3.5" />
            <span>{backendStatus.mode === 'fastapi' ? 'FastAPI Backend' : 'Embedded Engine'}</span>
            {backendStatus.mode === 'fastapi' && !backendStatus.isConnected && (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            )}
          </button>

          {/* Template CSV Download */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
            title="Download German Credit CSV schema template"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Template CSV</span>
          </button>

          {/* Help / Info Button */}
          <button
            onClick={onOpenInfo}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Syllabus, NBA CO-PO mapping and 25-mark rubric"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
