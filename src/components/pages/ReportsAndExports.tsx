/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Reports, Technical Documentation & Exports
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  BookOpen,
  FileCheck,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
import { VERIFIED_TEST_FAIRNESS_AUDIT, TEST_SET_EVALUATION, PROXY_VARIABLE_ANALYSIS } from '../../services/mlEngine';
import { apiClient } from '../../services/apiClient';

export const ReportsAndExports: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportJSON = () => {
    const reportData = {
      projectTitle: 'FairCredit: Algorithmic Bias Auditing and Mitigation in Digital Micro-Lending',
      courseCode: 'ADCOR1PC303',
      dataset: {
        name: 'German Credit Dataset (Statlog)',
        samples: 1000,
        features: 21,
        targetClassRatio: { good: 0.7, bad: 0.3 },
      },
      evaluationMetrics: TEST_SET_EVALUATION,
      fairnessAudit: VERIFIED_TEST_FAIRNESS_AUDIT,
      proxyVariables: PROXY_VARIABLE_ANALYSIS,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'FairCredit_Audit_Metrics.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    setExportNotice(null);

    // If FastAPI is connected, request native python-docx file
    if (apiClient.getMode() === 'fastapi') {
      try {
        const res = await fetch(`${apiClient.getApiUrl()}/api/report/download`);
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'FairCredit_Technical_Report.docx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setExportNotice('Successfully downloaded native python-docx technical report.');
          setIsExportingDocx(false);
          return;
        }
      } catch (err) {
        console.warn('Backend download failed, generating client-side formatted document:', err);
      }
    }

    // Client-side HTML/Word Document Export conforming to formatting specifications
    setTimeout(() => {
      generateClientSideWordDoc();
      setIsExportingDocx(false);
      setExportNotice('Generated standardized IEEE Micro-Project Report document (.doc / .docx compatible).');
    }, 600);
  };

  const generateClientSideWordDoc = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>FairCredit Technical Report</title>
        <style>
          @page {
            size: A4;
            margin: 1.0in 1.0in 1.0in 1.25in;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            text-align: justify;
            color: #111111;
          }
          h1 { font-size: 18pt; text-align: center; font-weight: bold; margin-bottom: 24pt; }
          h2 { font-size: 14pt; font-weight: bold; margin-top: 18pt; border-bottom: 1pt solid #333; }
          h3 { font-size: 12pt; font-weight: bold; margin-top: 12pt; }
          table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 11pt; }
          th, td { border: 1pt solid #666; padding: 6pt; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .code-block { font-family: 'Consolas', monospace; font-size: 10pt; background: #f8f8f8; padding: 6pt; border: 1pt solid #ddd; }
        </style>
      </head>
      <body>
        <h1>FAIRCREDIT: ALGORITHMIC BIAS AUDITING AND MITIGATION IN DIGITAL MICRO-LENDING</h1>
        <p style="text-align: center; font-weight: bold;">Course Code: ADCOR1PC303 | Academic Micro-Project Report</p>
        <hr/>
        <h2>PART I: PRELIMINARY PAGES</h2>
        <p><strong>Course Outcome Alignment (NBA Criterion 3):</strong></p>
        <ul>
          <li>CO1: Formulate algorithmic fairness objectives and evaluate baseline risk models (BL3/BL4)</li>
          <li>CO2: Implement bias mitigation algorithms using sample reweighting and threshold optimization (BL4/BL5)</li>
          <li>CO3: Conduct proxy variable audits, sociotechnical impact evaluations, and ethical governance (BL5/BL6)</li>
        </ul>

        <h2>CHAPTER 1: PROBLEM DEFINITION & OPERATIONAL RELEVANCE</h2>
        <p>Digital micro-lending platforms increasingly rely on automated credit-scoring algorithms to disburse capital to unbanked individuals. However, historical training data frequently encodes societal and economic disparities. This project formulates a mathematical framework to audit and mitigate disparate impact against protected demographic groups using the German Credit benchmark dataset.</p>

        <h2>CHAPTER 2: THEORETICAL FORMULATION & FAIRNESS METRICS</h2>
        <p>We evaluate two foundational criteria: Demographic Parity Difference and Equalized Odds Difference. Under the 80% Four-Fifths legal rule, a selection rate ratio below 0.80 constitutes presumptive adverse impact.</p>

        <h2>CHAPTER 3: SYSTEM ARCHITECTURE & DATA PIPELINE</h2>
        <p>The architecture consists of a dual-engine interface: a client-side TypeScript inference engine and a Python FastAPI backend running scikit-learn, Fairlearn, and python-docx.</p>

        <h2>CHAPTER 4: IMPLEMENTATION & ALGORITHMIC ARTIFACTS</h2>
        <p>Features are preprocessed using a ColumnTransformer. Personal_status_sex is separated as a protected attribute. Models evaluated include Baseline Logistic Regression, Class-Reweighted Logistic Regression, and ThresholdOptimizer.</p>

        <h2>CHAPTER 5: EXPERIMENTAL EVALUATION & TRADE-OFF ANALYSIS</h2>
        <table>
          <tr><th>Model Approach</th><th>Accuracy</th><th>F1-Score</th><th>Demographic Parity Diff</th><th>Equalized Odds Diff</th></tr>
          <tr><td>Baseline Logistic Regression</td><td>72.0%</td><td>79.1%</td><td>0.1058 (10.6%)</td><td>0.1054</td></tr>
          <tr><td>Class-Reweighted LR</td><td>70.7%</td><td>77.5%</td><td>0.0980 (9.8%)</td><td>0.1120</td></tr>
          <tr><td>Threshold-Optimized Model</td><td>73.3%</td><td>79.7%</td><td>0.0872 (8.7%)</td><td>0.1054</td></tr>
        </table>

        <h2>CHAPTER 6: SOCIETAL IMPACT & ETHICAL GOVERNANCE</h2>
        <p>Proxy variables such as housing (Cramer's V = 0.324) and property (0.286) create indirect demographic correlation. Institutional governance requires ongoing bias monitoring under ECOA (Regulation B).</p>

        <h2>CHAPTER 7: CONCLUSION & FUTURE ENHANCEMENTS</h2>
        <p>Post-processing threshold optimization achieves superior Pareto efficiency, improving female credit approvals from 65.1% to 73.8% without sacrificing portfolio accuracy.</p>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'FairCredit_Standard_Technical_Report.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CHAPTER_ITEMS = [
    { num: 1, title: 'Problem Definition & Operational Relevance' },
    { num: 2, title: 'Theoretical Formulation & Mathematical Framework' },
    { num: 3, title: 'System Architecture & Data Pipeline' },
    { num: 4, title: 'Implementation Details & Algorithmic Artifacts' },
    { num: 5, title: 'Experimental Evaluation & Trade-off Analysis' },
    { num: 6, title: 'Societal Impact, Ethical Governance & Proxy Audits' },
    { num: 7, title: 'Conclusion, Engineering Limitations & Future Scope' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Export Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Technical Documentation & Formal Reports
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formatted in strict adherence to NBA/CIAP evaluation specifications and IEEE publishing standards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingDocx ? 'Generating DOCX...' : 'Download DOCX Technical Report'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON Metrics</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Chapter Reader Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation: 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
            Table of Contents (7 Chapters)
          </span>

          <div className="space-y-1">
            {CHAPTER_ITEMS.map((ch) => {
              const isActive = activeChapter === ch.num;
              return (
                <button
                  key={ch.num}
                  onClick={() => setActiveChapter(ch.num)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ch.num}
                  </span>
                  <span className="leading-snug">{ch.title}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 px-2">
            <span className="text-[11px] text-slate-500 font-medium block">
              Layout: A4, 1.25&quot; Gutter, Times New Roman 12pt, Consolas 10pt code.
            </span>
          </div>
        </div>

        {/* Right Reader Content: 8 cols */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6 text-slate-800">
          {activeChapter === 1 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Chapter 1
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Problem Definition & Operational Relevance in Micro-Lending
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 text-justify">
                <p>
                  Digital micro-lending has expanded rapidly across emerging financial markets, leveraging automated algorithmic credit scoring to disburse credit to unbanked individuals without conventional collateral. However, when historical credit data is used to train supervised classifiers, models inherit past systemic inequities.
                </p>
                <p>
                  In this project, we audit algorithmic bias in loan approval models using the 1,000-observation German Credit benchmark dataset. We define the sensitive demographic attribute as gender and marital status (<strong>personal_status_sex</strong>), evaluating Female and Male borrower subgroups.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                  <strong>Core Research Objective:</strong>
                  <p>
                    Quantify the trade-off between credit risk prediction performance (Accuracy, ROC-AUC, F1-Score) and demographic fairness (Demographic Parity, Equalized Odds) to establish a trustworthy decision-support platform.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeChapter === 2 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Chapter 2
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Theoretical Formulation & Mathematical Fairness Framework
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 text-justify">
                <p>
                  Let X in R^d represent the non-sensitive loan feature vector, A in [0, 1] represent the protected demographic attribute (A=0 for Female, A=1 for Male), and Y in [0, 1] denote the binary ground truth credit risk outcome (Y=1 for Good Credit, Y=0 for Default).
                </p>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
                  <div>
                    <strong>1. Demographic Parity Difference (DPD):</strong>
                    <div>DPD = |P(Y_hat=1 | Male) - P(Y_hat=1 | Female)|</div>
                  </div>
                  <div>
                    <strong>2. Disparate Impact Ratio (DIR - 80% Rule):</strong>
                    <div>DIR = P(Y_hat=1 | Female) / P(Y_hat=1 | Male)</div>
                  </div>
                  <div>
                    <strong>3. Equalized Odds Difference (EOD):</strong>
                    <div>EOD = max(|TPR_Male - TPR_Female|, |FPR_Male - FPR_Female|)</div>
                  </div>
                </div>

                <p>
                  <strong>Conflict of Fairness Metrics:</strong> Under Chouldechova&apos;s Theorem (2017), if the base rates P(Y=1 | Female) &ne; P(Y=1 | Male), equalized odds and demographic parity cannot be satisfied simultaneously by any classifier with imperfect accuracy.
                </p>
              </div>
            </div>
          )}

          {activeChapter === 3 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Chapter 3
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                System Architecture & Engineering Pipeline
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 text-justify">
                <p>
                  FairCredit is engineered with a modular, dual-tier architecture:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  <li>
                    <strong>Frontend Presentation Tier:</strong> React 19, TypeScript, Tailwind CSS, Lucide icons, and Recharts providing an interactive financial analytics dashboard.
                  </li>
                  <li>
                    <strong>Embedded Client ML Tier:</strong> Built-in numerical inference engine executing standard scaling, one-hot encoding, and logistic sigmoid activations directly in-browser.
                  </li>
                  <li>
                    <strong>Python FastAPI ML Tier:</strong> Standalone RESTful backend utilizing scikit-learn for model serialization, Fairlearn for MetricFrame disparity evaluation, and python-docx for technical reports.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeChapter === 4 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Chapter 4
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Implementation Details & Technological Artifacts
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 text-justify">
                <p>
                  The dataset partition uses a 70% training split (700 rows), 15% validation split (150 rows), and 15% test split (150 rows) stratified by target class $Y$.
                </p>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                  <div className="text-slate-400"># Model Training & ThresholdOptimizer Artifact</div>
                  <div>from fairlearn.postprocessing import ThresholdOptimizer</div>
                  <div>optimizer = ThresholdOptimizer(</div>
                  <div>&nbsp;&nbsp;estimator=model,</div>
                  <div>&nbsp;&nbsp;constraints=&quot;equalized_odds&quot;,</div>
                  <div>&nbsp;&nbsp;predict_method=&apos;predict_proba&apos;</div>
                  <div>)</div>
                  <div>optimizer.fit(X_train, y_train, sensitive_features=sens_train)</div>
                </div>
                <p>
                  Feature scaling for numerical variables utilizes median imputation and StandardScaler. Categorical features are encoded with OneHotEncoder(sparse_output=False, handle_unknown=&apos;ignore&apos;).
                </p>
              </div>
            </div>
          )}

          {activeChapter === 5 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Chapter 5
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Experimental Evaluation & Empirical Trade-Off Analysis
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 text-justify">
                <p>
                  Experimental results on the untouched 150-observation test partition demonstrate the concrete performance versus fairness trade-offs:
                </p>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-700 font-sans font-semibold">
                      <tr>
                        <th className="p-2">Model Approach</th>
                        <th className="p-2">Accuracy</th>
                        <th className="p-2">F1</th>
                        <th className="p-2">DP Diff</th>
                        <th className="p-2">EO Diff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 font-sans font-medium">Baseline Logistic Regression</td>
                        <td className="p-2 font-bold">72.0%</td>
                        <td className="p-2">79.1%</td>
                        <td className="p-2 text-rose-700 font-bold">0.1058</td>
                        <td className="p-2">0.1054</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-sans font-medium">Class-Reweighted LR</td>
                        <td className="p-2 font-bold">70.7%</td>
                        <td className="p-2">77.5%</td>
                        <td className="p-2 text-amber-700">0.0980</td>
                        <td className="p-2">0.1120</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-sans font-medium">Threshold-Optimized Model</td>
                        <td className="p-2 font-bold text-emerald-700">73.3%</td>
                        <td className="p-2 text-blue-600 font-bold">79.7%</td>
                        <td className="p-2 text-emerald-700 font-bold">0.0872</td>
                        <td className="p-2">0.1054</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  Threshold optimization successfully lowers demographic disparity from 10.6% to 8.7% while raising test F1 from 79.1% to 79.7%.
                </p>
              </div>
            </div>
          )}

          {activeChapter === 6 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Chapter 6
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Societal Impact, Ethical Governance & Proxy Audits
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 text-justify">
                <p>
                  Proxy variable evaluation identified <strong>housing status</strong> (Cramer&apos;s V = 0.324) and <strong>property collateral</strong> (0.286) as moderate-to-high risk proxies for demographic status.
                </p>
                <p>
                  In compliance with the Equal Credit Opportunity Act (ECOA - Regulation B), micro-lenders cannot defend discriminatory lending outcomes by citing algorithm blindness. Continuous fairness metric monitoring and documentation of alternative less-discriminatory algorithms (LDAs) are legally required.
                </p>
              </div>
            </div>
          )}

          {activeChapter === 7 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Chapter 7
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Conclusion, Engineering Limitations & Future Enhancements
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 text-justify">
                <p>
                  The FairCredit platform demonstrates that post-processing threshold optimization presents an effective, Pareto-efficient mitigation technique for digital credit allocation.
                </p>
                <p>
                  <strong>Engineering Limitations:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  <li>Sample size constrained to 1,000 historical German Credit observations.</li>
                  <li>Binary gender encoding does not reflect intersectional demographic categories.</li>
                  <li>Threshold optimization requires access to the sensitive feature at inference time.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
