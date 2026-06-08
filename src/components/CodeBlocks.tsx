/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Copy, Check, Search, FileCode, CheckCircle, Info, FolderTree } from 'lucide-react';
import { FIH_RESOURCES_TEMPLATES } from '../data';

export default function CodeBlocks() {
  const [activeCodeIdx, setActiveCodeIdx] = useState<number>(0);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentTemplate = FIH_RESOURCES_TEMPLATES[activeCodeIdx];

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentTemplate.code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Visual code highlighter using simple text formatting
  const highlightCode = (codeText: string, lang: string) => {
    if (!searchQuery) return codeText;
    
    // Highlight matched query parts
    try {
      const escapedQuery = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      const parts = codeText.split(regex);
      
      return parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-amber-500/30 text-amber-200 border-b border-amber-500 outline-none block inline">{part}</mark>
        ) : (
          part
        )
      );
    } catch (e) {
      return codeText;
    }
  };

  return (
    <div className="space-y-6" id="code_blocks_root">
      {/* File folder layout and directory schematic diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="font-sans font-medium text-white text-base flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-sky-400" />
          Clean IoT Directory Tree & Folder Structure
        </h4>
        <p className="font-sans text-xs text-slate-400">
          This shows the standard, industry-compliant directory path layout required to make your student code structures clear and portfolio-ready.
        </p>
        
        <div className="bg-slate-950 p-4 rounded-lg font-mono text-[11px] text-zinc-300 border border-slate-850 select-text overflow-x-auto whitespace-pre leading-relaxed">
{`Smart-Home-Energy-Monitoring-System/
├── arduino_code/
│   └── esp32_energy_meter.ino       # 1. Core ESP32 Arduino Core firmware
├── python_simulation/
│   └── energy_simulation_station.py # 2. Standalone physical testing script
├── dashboard/
│   └── home_assistant_sensors.yaml  # 3. Mappings for home integrations
├── data/
│   └── simulated_energy_history.csv # 4. Persistent local logs
├── docs/
│   └── wiring_schematics.md         # 5. Circuit conditioning specifications
├── requirements.txt                 # 6. Python platform dependencies
└── README.md                        # 7. Core project repository introduction`}
        </div>
      </div>

      {/* Actual interactive code repository panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Selecting file tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto">
          {FIH_RESOURCES_TEMPLATES.map((item, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setActiveCodeIdx(idx);
                setSearchQuery('');
              }}
              className={`px-4 py-3 text-xs font-mono font-medium border-r border-slate-800 shrink-0 transition flex items-center gap-1.5 ${
                activeCodeIdx === idx 
                  ? 'bg-slate-900 text-sky-400 border-b-2 border-b-sky-500' 
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900/30'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              {item.filename}
            </button>
          ))}
        </div>

        {/* Code description metadata */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 pr-4">
            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider font-semibold">Description</span>
            <p className="text-xs text-slate-300 mt-0.5 font-sans leading-relaxed">
              {currentTemplate.description}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            {/* Embedded text search inside code */}
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery}
                placeholder="Search code..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[160px] bg-slate-950 text-xs font-sans text-slate-300 rounded-lg pl-8 pr-3 py-1.5 border border-slate-800 outline-none focus:border-sky-500 transition"
              />
            </div>

            {/* Direct Copy Block */}
            <button 
              onClick={handleCopyToClipboard}
              className="px-3 py-1.5 rounded-lg bg-sky-950/40 border border-sky-850 text-sky-300 hover:bg-sky-900/60 hover:text-white transition text-xs font-sans flex items-center justify-center gap-1.5 shadow"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Code Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Highlighted copy-panel scrolling area */}
        <div className="bg-slate-950 p-5 overflow-auto max-h-[460px] select-text">
          <pre className="font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre">
            <code>
              {highlightCode(currentTemplate.code, currentTemplate.language)}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
