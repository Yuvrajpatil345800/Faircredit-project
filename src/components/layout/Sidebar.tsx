/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FairCredit Platform - Sidebar Navigation
 */

import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  FileSpreadsheet,
  Database,
  Gauge,
  Scale,
  SlidersHorizontal,
  GitFork,
  TrendingUp,
  FileText,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Activity,
  Server,
} from 'lucide-react';
import { BackendStatus } from '../../types';

export type NavTabId =
  | 'overview'
  | 'prediction'
  | 'batch'
  | 'dataset'
  | 'evaluation'
  | 'fairness'
  | 'mitigation'
  | 'proxy'
  | 'business'
  | 'reports';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  backendStatus: BackendStatus;
  onOpenBackendModal: () => void;
}

const NAV_ITEMS: { id: NavTabId; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'prediction', label: 'Applicant Simulator', icon: UserCheck, badge: 'Interactive' },
  { id: 'batch', label: 'Batch Predictions', icon: FileSpreadsheet },
  { id: 'dataset', label: 'Dataset Explorer', icon: Database },
  { id: 'evaluation', label: 'Model Evaluation', icon: Gauge },
  { id: 'fairness', label: 'Fairness Audit', icon: Scale, badge: 'Fairlearn' },
  { id: 'mitigation', label: 'Bias Mitigation', icon: SlidersHorizontal },
  { id: 'proxy', label: 'Proxy Variable Analysis', icon: GitFork },
  { id: 'business', label: 'Business Impact', icon: TrendingUp },
  { id: 'reports', label: 'Reports & Exports', icon: FileText },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  backendStatus,
  onOpenBackendModal,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-72'
      }`}
      style={{ backgroundColor: '#074C59' }}
    >
      {/* Top Brand Header */}
      <div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#0C5F6F]/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-300 via-teal-200 to-sky-300 flex items-center justify-center text-[#074C59] shadow-md shadow-[#04333C]/40 shrink-0 font-bold">
              <ShieldCheck className="w-6 h-6 text-[#074C59]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-white font-bold tracking-tight text-lg flex items-center gap-1.5">
                  FairCredit
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-300/30">
                    Audit
                  </span>
                </span>
                <span className="text-xs text-cyan-100/80 truncate max-w-[170px]">
                  Algorithmic Fairness Lab
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-cyan-200 hover:text-white hover:bg-[#0A5C6C] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-thin scrollbar-thumb-[#0C5F6F]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#088395] text-white shadow-md shadow-[#04333C]/40 font-semibold'
                    : 'text-cyan-100 hover:text-white hover:bg-[#0A5C6C]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isActive ? 'text-white' : 'text-cyan-200 group-hover:text-white'
                  }`}
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-cyan-600/90 text-white border border-cyan-300/40'
                        : 'bg-[#0A5C6C]/80 text-cyan-100 border border-[#0C5F6F]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#03252C] text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-[#0C5F6F]">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Mode Panel */}
      <div className="p-3 border-t border-[#0C5F6F]/60 bg-[#04333C]/50">
        <button
          onClick={onOpenBackendModal}
          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-colors border ${
            backendStatus.mode === 'fastapi'
              ? backendStatus.isConnected
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200 hover:bg-cyan-900/60'
                : 'bg-rose-950/60 border-rose-700/60 text-rose-200 hover:bg-rose-900/60'
              : 'bg-[#0A5C6C]/60 border-[#0C5F6F] text-cyan-100 hover:bg-[#0A5C6C]'
          }`}
        >
          <Server className="w-4 h-4 shrink-0 text-cyan-300" />
          {!collapsed && (
            <div className="flex flex-col text-left truncate flex-1">
              <span className="font-semibold text-white">
                {backendStatus.mode === 'fastapi' ? 'FastAPI Mode' : 'Embedded ML'}
              </span>
              <span className="text-[11px] text-cyan-200 flex items-center gap-1.5 truncate">
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendStatus.isConnected ? 'bg-teal-300 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {backendStatus.isConnected ? 'Active & Calibrated' : 'Backend Disconnected'}
              </span>
            </div>
          )}
        </button>

        {!collapsed && (
          <div className="mt-2.5 px-2 flex items-center justify-between text-[11px] text-cyan-200/80">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-300" />
              German Credit (1000)
            </span>
            <span className="font-mono text-cyan-300">v1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
};
