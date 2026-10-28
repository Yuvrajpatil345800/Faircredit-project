/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Backend Configuration & VS Code Setup Modal
 */

import React, { useState } from 'react';
import {
  X,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  FileCode,
  ExternalLink,
  Cpu,
  Layers,
} from 'lucide-react';
import { BackendStatus } from '../../types';
import { apiClient } from '../../services/apiClient';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: BackendStatus;
  onStatusUpdated: (newStatus: BackendStatus) => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onStatusUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'endpoints' | 'vscode'>('status');
  const [urlInput, setUrlInput] = useState(status.apiUrl);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    apiClient.setApiUrl(urlInput);

    const updated = await apiClient.checkHealth();
    setIsPinging(false);
    onStatusUpdated(updated);

    if (updated.isConnected) {
      setPingResult('SUCCESS: FastAPI backend is running and responding to /api/health!');
    } else {
      setPingResult(updated.error || 'Connection failed. Ensure `uvicorn main:app --reload` is running on port 8000.');
    }
  };

  const handleToggleMode = (mode: 'embedded' | 'fastapi') => {
    apiClient.setMode(mode);
    apiClient.checkHealth().then(onStatusUpdated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Backend Architecture & Engine Settings
              </h2>
              <p className="text-xs text-slate-500">
                Configurable integration between Embedded Client ML and Python FastAPI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-6 bg-slate-50/30">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Engine Mode & Status
          </button>
          <button
            onClick={() => setActiveTab('vscode')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'vscode'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            VS Code Setup Guide (Windows)
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'endpoints'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            FastAPI API Endpoints
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Mode Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Embedded Card */}
                <div
                  onClick={() => handleToggleMode('embedded')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    status.mode === 'embedded'
                      ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      Embedded Client ML
                    </span>
                    {status.mode === 'embedded' && (
                      <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Calculates predictions, fairness metrics, and bias mitigations directly in the browser using the exact verified model parameters and German Credit dataset.
                  </p>
                  <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Zero external setup required. Ideal for faculty evaluations.
                  </div>
                </div>

                {/* FastAPI Card */}
                <div
                  onClick={() => handleToggleMode('fastapi')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    status.mode === 'fastapi'
                      ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Server className="w-4 h-4 text-purple-600" />
                      Standalone Python FastAPI
                    </span>
                    {status.mode === 'fastapi' && (
                      <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Connects directly to your local or remote Python FastAPI backend running scikit-learn, Fairlearn, and python-docx report generation.
                  </p>
                  <div
                    className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                      status.isConnected
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}
                  >
                    {status.isConnected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected to {status.apiUrl}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        Backend not detected on {status.apiUrl}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Endpoint URL Input */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  FastAPI Backend URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="http://127.0.0.1:8000"
                    className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    onClick={handleTestPing}
                    disabled={isPinging}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>{isPinging ? 'Pinging...' : 'Test Connection'}</span>
                  </button>
                </div>

                {pingResult && (
                  <p
                    className={`mt-2.5 text-xs font-medium ${
                      pingResult.startsWith('SUCCESS') ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {pingResult}
                  </p>
                )}
              </div>

              {/* Current Server Info */}
              {status.serverInfo && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 border-b border-slate-200">
                    Engine Artifacts & Runtime Specs
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Version</span>
                      <span className="font-semibold text-slate-800">{status.serverInfo.version}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">scikit-learn</span>
                      <span className="font-semibold text-slate-800">
                        {status.serverInfo.scikitLearnVersion}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Fairlearn</span>
                      <span className="font-semibold text-slate-800">
                        {status.serverInfo.fairlearnVersion}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-slate-400 block">Active Classifier</span>
                      <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {status.serverInfo.activeModel}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vscode' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
                <strong>Windows VS Code Quick Start:</strong> Follow these exact terminal commands to run the Python FastAPI backend on Windows alongside this React frontend.
              </div>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1.5">
                  <div className="text-slate-400"># 1. Open VS Code terminal in the project directory</div>
                  <div className="text-teal-400">cd backend</div>
                  <div className="text-slate-400"># 2. Create and activate Python virtual environment</div>
                  <div className="text-teal-400">python -m venv venv</div>
                  <div className="text-teal-400">.\venv\Scripts\activate</div>
                  <div className="text-slate-400"># 3. Install required Python packages</div>
                  <div className="text-teal-400">pip install -r requirements.txt</div>
                  <div className="text-slate-400"># 4. Train baseline and mitigation models, exporting artifacts</div>
                  <div className="text-teal-400">python train_and_export.py</div>
                  <div className="text-slate-400"># 5. Start the FastAPI server on port 8000</div>
                  <div className="text-teal-400">uvicorn main:app --reload --port 8000</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900">Verifying Backend Deployment:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>
                    Open interactive Swagger UI docs:{' '}
                    <a
                      href="http://127.0.0.1:8000/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-mono"
                    >
                      http://127.0.0.1:8000/docs
                    </a>
                  </li>
                  <li>
                    Run automated test suite: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">pytest tests/</code>
                  </li>
                  <li>Switch the toggle above to &quot;FastAPI Backend&quot; to test real-time predictions!</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                The Python FastAPI backend exposes these production-ready endpoints adhering to OpenAPI specifications:
              </p>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden font-mono text-[11px]">
                <div className="p-2.5 flex items-center justify-between bg-slate-50">
                  <span className="font-bold text-slate-700">GET /api/health</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-sans font-semibold text-[10px]">
                    System Status & Model Health
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="font-bold text-slate-700">POST /api/predict</span>
                  <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-sans font-semibold text-[10px]">
                    Manual Applicant Prediction
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between bg-slate-50">
                  <span className="font-bold text-slate-700">POST /api/predict/batch</span>
                  <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-sans font-semibold text-[10px]">
                    Batch CSV Predictions
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="font-bold text-slate-700">GET /api/dataset/summary</span>
                  <span className="text-slate-700 bg-slate-200 px-2 py-0.5 rounded font-sans font-semibold text-[10px]">
                    Descriptive Statistics & Cardinality
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between bg-slate-50">
                  <span className="font-bold text-slate-700">GET /api/evaluation</span>
                  <span className="text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded font-sans font-semibold text-[10px]">
                    Model Performance & ROC-AUC
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="font-bold text-slate-700">GET /api/fairness</span>
                  <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-sans font-semibold text-[10px]">
                    Fairlearn MetricFrame Disparity Audit
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between bg-slate-50">
                  <span className="font-bold text-slate-700">GET /api/proxy-analysis</span>
                  <span className="text-teal-700 bg-teal-100 px-2 py-0.5 rounded font-sans font-semibold text-[10px]">
                    Cramer&apos;s V Proxy Ranking
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="font-bold text-slate-700">POST /api/report/generate</span>
                  <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-sans font-semibold text-[10px]">
                    python-docx IEEE Technical Report
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
