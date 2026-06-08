/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Copy, Check, FileDown, Eye, Code2, AlertCircle, CheckCircle, 
  Tag, Compass, GitMerge, FileText 
} from 'lucide-react';
import { RAW_README_MARKDOWN } from '../data';

export default function ReadmeMarkup() {
  const [activeView, setActiveView] = useState<'preview' | 'raw'>('preview');
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  const handleCopyReadme = () => {
    navigator.clipboard.writeText(RAW_README_MARKDOWN);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="readme_markup_root">
      
      {/* Portfolio Github Strategy recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Repo Naming Advice */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sky-400">
            <Compass className="w-4 h-4" />
            <strong className="text-xs font-sans font-bold">Best Repository Name</strong>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            smart-home-energy-monitoring
          </p>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Short, SEO-friendly, and captures exact search queries of hardware recruiters. Use lowercase with hyphens.
          </p>
        </div>

        {/* Short description for bio */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-teal-400">
            <Tag className="w-4 h-4" />
            <strong className="text-xs font-sans font-bold">Optimal Description & Tags</strong>
          </div>
          <p className="text-[11px] text-slate-300 font-sans italic line-clamp-2">
            "End-to-end IoT Energy Monitor using ESP32 edge power DSP calculation RMS currents, MQTT JSON telemetry logs, and Grafana dashboard trackers."
          </p>
          <div className="flex flex-wrap gap-1 text-[8px] font-mono text-teal-300 font-semibold uppercase">
            <span>#esp32</span>
            <span>#iot</span>
            <span>#mqtt</span>
            <span>#grafana</span>
            <span>#firmware</span>
          </div>
        </div>

        {/* Dynamic Commit Map */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-purple-400">
            <GitMerge className="w-4 h-4" />
            <strong className="text-xs font-sans font-bold">GitHub Commit Timeline</strong>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 space-y-1 leading-none pt-0.5">
            <p className="text-emerald-400">✓ git commit -m "feat: init biasing schematic AFE"</p>
            <p className="text-slate-400">✓ git commit -m "feat: add 4kHz burst sampling DSP"</p>
            <p className="text-slate-400">✓ git commit -m "feat: release local MQTT telemetry"</p>
          </div>
        </div>
      </div>

      {/* Main copy and preview tab control */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        
        {/* Tab Selection Row */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              id="btn_readme_preview"
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans transition flex items-center gap-1 ${
                activeView === 'preview' 
                  ? 'bg-slate-800 text-sky-400 font-medium' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Rendered README Preview
            </button>
            <button 
              id="btn_readme_raw"
              onClick={() => setActiveView('raw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans transition flex items-center gap-1 ${
                activeView === 'raw' 
                  ? 'bg-slate-800 text-sky-400 font-medium' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Copyable Markdown Source
            </button>
          </div>

          <button 
            id="btn_readme_copy"
            onClick={handleCopyReadme}
            className="px-3 py-1.5 rounded-lg bg-sky-950 border border-sky-850 text-sky-300 hover:bg-sky-900 text-xs font-sans flex items-center justify-center gap-1.5 transition select-none font-semibold"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> README Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Entire README.md
              </>
            )}
          </button>
        </div>

        {/* View switching panel scroll area */}
        <div className="bg-slate-950 p-6 overflow-auto max-h-[460px] select-text">
          {activeView === 'preview' ? (
            <div className="text-slate-300 font-sans space-y-6 max-w-none text-xs md:text-sm leading-relaxed">
              {/* Cover Headers block */}
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-bold font-sans text-white tracking-tight">Smart Home Energy Monitoring System</h1>
                <p className="text-slate-400 mt-2 font-sans font-medium text-sm">
                  An industry-oriented, modular IoT edge platform designed to measure, evaluate, and throttle electrical loads safely.
                </p>
              </div>

              {/* Badges block mockup */}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-500">
                <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded font-bold font-sans">BUILD: RETURNING GREEN</span>
                <span className="bg-sky-950 border border-sky-800 text-sky-400 px-2 py-0.5 rounded font-bold font-sans">HARDWARE: ESP32 DEVKIT</span>
                <span className="bg-purple-950 border border-purple-800 text-purple-400 px-2 py-0.5 rounded font-bold font-sans">LICENSE: APACHE-2.0</span>
              </div>

              {/* Core Features */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-sans">🚀 Key System Features</h3>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1 font-sans">
                  <li><strong>Non-Invasive CT Sensing:</strong> Reads load signals safely through insulated jackets using <em>SCT-013-050</em> clamps, requiring zero line disruption.</li>
                  <li><strong>DSP Root-Mean-Square Calculations:</strong> Captures AC scans at 4kHz, stripping DC offsets dynamically and solving true RMS values.</li>
                  <li><strong>Apparent and True Power Analytics:</strong> Resolves phase alignments, active power Watts, and reactive VA.</li>
                  <li><strong>Persistent Vault Accumulation:</strong> Vaults precise cumulative energy on physical FLASH memory (Preferences.h).</li>
                  <li><strong>Active Alarm Safety:</strong> Tripping threshold values automatically cuts supply routing lines via localized relay relays.</li>
                </ul>
              </div>

              {/* Quick Biasing wire ASCII map representation */}
              <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-sky-400" />
                  Hardware Schematic Map Preview
                </h3>
                <pre className="font-mono text-zinc-300 text-[10px] whitespace-pre overflow-x-auto leading-relaxed pt-2 select-text">
{`   [ SCT-013 Clamp ] 
        | (AC Swing ±1V Peak)
        v
    (Tip)--------- [ 100k coupling resistor ] ---> GPIO34 (ESP32 ADC)
    (Sleeve)          |
        |             +---- [ 0.1uF Cap ] -------+
        |             |                          |
        +------- (Bias Node ~1.65V)              | (Filtered Safe Wave)
                      |                          v
             [ Resistor Divider ]               GND
         3.3V --[10k]--+--[10k]-- GND
                       |
                   [10uF Cap]
                       |
                      GND`}
                </pre>
              </div>

              {/* Sample output metrics logs visual representation */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-sans">📊 Live Metrics JSON Output Sample</h3>
                <pre className="font-mono text-emerald-400 text-xs bg-slate-900 border border-slate-800 p-3 rounded-lg overflow-x-auto leading-tight select-text">
{`{
  "voltage": 230.4,
  "current": 4.882,
  "power": 1124.8,
  "energy_kwh": 0.04512,
  "overload": false
}`}
                </pre>
              </div>
            </div>
          ) : (
            <pre className="font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre select-text">
              <code>
                {RAW_README_MARKDOWN}
              </code>
            </pre>
          )}
        </div>
      </div>

      {/* Practical screenshot and validation checks checklist (Section 15) */}
      <div className="bg-slate-900 border border-slate-805 rounded-xl p-5 space-y-4">
        <div>
          <h4 className="font-sans font-medium text-white text-base">Course Evaluation Screenshots Portfolio Checklist</h4>
          <p className="font-sans text-xs text-slate-400">
            Ensure you capture these precise visuals from this dashboard and your ESP32 IDE to secure maximum grades in your IoT examination evaluations:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex items-start gap-2.5">
            <input type="checkbox" defaultChecked className="mt-1 rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0" />
            <div>
              <strong className="text-xs font-bold text-white font-sans block">1. Clean File Directory Map</strong>
              <span className="text-[10px] text-slate-400 font-sans leading-tight block mt-0.5">
                Capture the side files directory tree mapping your local workspaces. Matches Phase 10 structure guidelines perfectly.
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex items-start gap-2.5">
            <input type="checkbox" defaultChecked className="mt-1 rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0" />
            <div>
              <strong className="text-xs font-bold text-white font-sans block">2. Analog Biasing Wave Oscilloscope</strong>
              <span className="text-[10px] text-slate-400 font-sans leading-tight block mt-0.5">
                Take a snippet representation of our visual scope screen showing biased waves sliding beautifully inside boundaries.
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex items-start gap-2.5">
            <input type="checkbox" defaultChecked className="mt-1 rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0" />
            <div>
              <strong className="text-xs font-bold text-white font-sans block">3. Safety Overload Breaker Cutoffs</strong>
              <span className="text-[10px] text-slate-400 font-sans leading-tight block mt-0.5">
                Click "💥 Trigger Safety Overload" and screen-capture the red emergency alert shutdown pane.
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex items-start gap-2.5">
            <input type="checkbox" defaultChecked className="mt-1 rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0" />
            <div>
              <strong className="text-xs font-bold text-white font-sans block">4. Persisted Energy Log CSV logs</strong>
              <span className="text-[10px] text-slate-400 font-sans leading-tight block mt-0.5">
                Click download links and preview how variables are being dynamically logged in column-ordered standard CSV layouts!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
