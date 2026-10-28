/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit: Algorithmic Bias Auditing and Mitigation in Digital Micro-Lending
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTabId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BackendStatusModal } from './components/common/BackendStatusModal';
import { OverviewDashboard } from './components/pages/OverviewDashboard';
import { CreditPrediction } from './components/pages/CreditPrediction';
import { BatchPrediction } from './components/pages/BatchPrediction';
import { DatasetExplorer } from './components/pages/DatasetExplorer';
import { ModelEvaluation } from './components/pages/ModelEvaluation';
import { FairnessAudit } from './components/pages/FairnessAudit';
import { BiasMitigation } from './components/pages/BiasMitigation';
import { ProxyVariableAnalysis } from './components/pages/ProxyVariableAnalysis';
import { BusinessImpact } from './components/pages/BusinessImpact';
import { ReportsAndExports } from './components/pages/ReportsAndExports';
import { BackendStatus } from './types';
import { apiClient } from './services/apiClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    mode: 'embedded',
    apiUrl: 'http://127.0.0.1:8000',
    isConnected: true,
    isChecking: false,
  });

  useEffect(() => {
    apiClient.checkHealth().then(setBackendStatus);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800 flex font-sans antialiased">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        backendStatus={backendStatus}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        <Header
          activeTab={activeTab}
          backendStatus={backendStatus}
          onOpenBackendModal={() => setIsBackendModalOpen(true)}
          onOpenInfo={() => setActiveTab('reports')}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && <OverviewDashboard onNavigate={setActiveTab} />}
          {activeTab === 'prediction' && (
            <CreditPrediction
              backendStatus={backendStatus}
              onOpenBackendModal={() => setIsBackendModalOpen(true)}
              onOpenInfo={() => setActiveTab('reports')}
            />
          )}
          {activeTab === 'batch' && <BatchPrediction />}
          {activeTab === 'dataset' && <DatasetExplorer />}
          {activeTab === 'evaluation' && <ModelEvaluation />}
          {activeTab === 'fairness' && <FairnessAudit />}
          {activeTab === 'mitigation' && <BiasMitigation />}
          {activeTab === 'proxy' && <ProxyVariableAnalysis />}
          {activeTab === 'business' && <BusinessImpact />}
          {activeTab === 'reports' && <ReportsAndExports />}
        </main>
      </div>

      {/* Backend Integration & VS Code Setup Modal */}
      <BackendStatusModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        status={backendStatus}
        onStatusUpdated={setBackendStatus}
      />
    </div>
  );
}
