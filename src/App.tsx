/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Zap, Cpu, Terminal, BookOpen, FileText, Activity, AlertTriangle, 
  HelpCircle, Eye, ShieldCheck, Heart 
} from 'lucide-react';
import DashboardSimulation from './components/DashboardSimulation';
import CircuitDiagrams from './components/CircuitDiagrams';
import CodeBlocks from './components/CodeBlocks';
import Guides from './components/Guides';
import ReadmeMarkup from './components/ReadmeMarkup';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sim' | 'circuit' | 'code' | 'education' | 'deliverables'>('sim');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white" id="main_app_wrapper">
      
      {/* Decorative top ambient grid header */}
      <header className="bg-slate-900 border-b border-slate-800 shrink-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-sky-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-sky-400">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-white font-sans tracking-tight leading-none">
                Smart Home Energy Monitoring System
              </h1>
              <p className="text-[10px] text-sky-400 font-mono mt-1 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Interactive IoT Developer Portal & Simulation Lab
              </p>
            </div>
          </div>

          {/* Master Tabs Controller Nav */}
          <nav className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto w-full sm:w-auto">
            <button 
              id="nav_tab_sim"
              onClick={() => setActiveTab('sim')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sim' 
                  ? 'bg-slate-800 text-sky-400 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Simulation Lab
            </button>
            <button 
              id="nav_tab_circuit"
              onClick={() => setActiveTab('circuit')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'circuit' 
                  ? 'bg-slate-800 text-sky-400 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Biasing Circuit
            </button>
            <button 
              id="nav_tab_code"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'code' 
                  ? 'bg-slate-800 text-sky-400 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Code & File Tree
            </button>
            <button 
              id="nav_tab_education"
              onClick={() => setActiveTab('education')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'education' 
                  ? 'bg-slate-800 text-sky-400 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Learning & Interview
            </button>
            <button 
              id="nav_tab_deliverables"
              onClick={() => setActiveTab('deliverables')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'deliverables' 
                  ? 'bg-slate-800 text-sky-400 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> README Deliverables
            </button>
          </nav>
        </div>
      </header>

      {/* Primary responsive body stage content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'sim' && <DashboardSimulation />}
        {activeTab === 'circuit' && <CircuitDiagrams />}
        {activeTab === 'code' && <CodeBlocks />}
        {activeTab === 'education' && <Guides />}
        {activeTab === 'deliverables' && <ReadmeMarkup />}
      </main>

      {/* Footer bar */}
      <footer className="bg-slate-900 border-t border-slate-800 shrink-0 text-center py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p className="font-sans">
            IoT Multi-Circuit Smart Power Monitor - Student Course Deliverables Portfolio Builder
          </p>
          <p className="flex items-center gap-1 font-sans">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for your IoT Academic Submissions and Placement Resume
          </p>
        </div>
      </footer>
    </div>
  );
}

