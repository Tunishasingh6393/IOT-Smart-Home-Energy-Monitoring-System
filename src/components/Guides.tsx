/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, Layers, CheckSquare, Award, ArrowRight, HelpCircle, 
  HelpCircle as QuestionIcon, Plus, Minus, CheckCircle, Flame, ShieldAlert,
  Building, Landmark, Briefcase, ChevronRight
} from 'lucide-react';
import { TECHNICAL_PHASES, INTERVIEW_QUESTIONS } from '../data';
import { ProjectPhase, InterviewQnA } from '../types';

export default function Guides() {
  const [activeGuideTab, setActiveGuideTab] = useState<'concepts' | 'planner' | 'interview'>('concepts');
  const [expandedPhase, setExpandedPhase] = useState<string | null>('Phase 1');
  const [expandedInterviewQ, setExpandedInterviewQ] = useState<number | null>(1);

  // Active stack comparison selector
  const [selectedStack, setSelectedStack] = useState<'A' | 'B' | 'C'>('B');

  const togglePhase = (phaseName: string) => {
    setExpandedPhase(expandedPhase === phaseName ? null : phaseName);
  };

  const toggleInterviewQ = (id: number) => {
    setExpandedInterviewQ(expandedInterviewQ === id ? null : id);
  };

  return (
    <div className="space-y-6" id="guides_root">
      
      {/* Structural tabs control */}
      <div className="flex border-b border-slate-800 gap-4">
        <button 
          id="tab_guide_concepts"
          onClick={() => setActiveGuideTab('concepts')}
          className={`pb-2.5 text-sm font-medium transition font-sans ${activeGuideTab === 'concepts' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Project Core & Workflows
        </button>
        <button 
          id="tab_guide_planner"
          onClick={() => setActiveGuideTab('planner')}
          className={`pb-2.5 text-sm font-medium transition font-sans ${activeGuideTab === 'planner' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          10-Phase Student Roadmap Planner
        </button>
        <button 
          id="tab_guide_interview"
          onClick={() => setActiveGuideTab('interview')}
          className={`pb-2.5 text-sm font-medium transition font-sans ${activeGuideTab === 'interview' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Interview Prep Coach (10 Q&A)
        </button>
      </div>

      {activeGuideTab === 'concepts' && (
        <div className="space-y-6">
          {/* Section 1 Simple vs Tech Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase block font-sans">For Beginners & Non-Techs</span>
              <h4 className="font-sans font-medium text-white text-lg">Simple Analogy: The "Mains Diet Tracker"</h4>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                Think of this system like a smart calorie tracer, but for your electricity mains! Instead of wondering why your monthly electric bills came high, this monitor clamps onto your home main wiring like a smart ring. It observes exactly how much current flows, instantly categorizing heavy appliances and showing you your live billing cost. By converting "hidden" invisible electrons into visual charts, it exposes hidden standby loads (the background energy culprits) so you can optimize habits and save cash.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <span className="text-xs font-semibold text-sky-400 tracking-wider uppercase block font-sans">For Engineers & Mentors</span>
              <h4 className="font-sans font-medium text-white text-lg">Technical Statement: Non-Invasive Edge DSP</h4>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                This project represents a modular, edge-calculated real-time telemetry node. AC mains current induction is sensed via magnetic flux transformations using a <strong>SCT-013 clip sensor clamp</strong>. Mapped across a physical mid-rail resistor divider reference (offset set around 1.65V DC), the raw waveform is captured through single-ended 12-bit ADC sweeps on an ESP32 micro-controller at 4kHz. De-biased waveforms are squared and mathematically integrated to solve RMS currents and true Active Power. Real-time metrics stream outward via JSON-MQTT blocks targeting local broker channels.
              </p>
            </div>
          </div>

          {/* Workflow Sequence Representation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-sans font-medium text-white text-sm">System Signal Pipeline Flowchart</h4>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 text-center">
              <div className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-lg">
                <span className="text-xs font-mono font-bold text-sky-400 block">SCT-013 CT Clamp</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">Converts line magnetic flux to ±1V AC swing</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
              <div className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-lg">
                <span className="text-xs font-mono font-bold text-purple-400 block">Biasing Divider Node</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">Shifts and offsets waves cleanly to 1.65V DC</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
              <div className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-lg">
                <span className="text-xs font-mono font-bold text-emerald-400 block">ESP32 DSP Node</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">ADC square sweeps at ~4kHz, solves RMS math</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
              <div className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-lg">
                <span className="text-xs font-mono font-bold text-amber-500 block">MQTT Broker Payload</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">Tiny JSON telemetries pushed over WiFi</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
              <div className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-lg">
                <span className="text-xs font-mono font-bold text-rose-400 block">Dashboard & Actions</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">Home Assistant displays, trip safeties</span>
              </div>
            </div>
          </div>

          {/* Business Value & Industrial Adoption (Section 2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div>
              <h4 className="font-sans font-medium text-white text-base">Industrial Multi-Circuit Relevance</h4>
              <p className="font-sans text-xs text-slate-400 mt-0.5">
                How professional sectors employ energy monitoring systems at a larger business scale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                <div className="text-sky-400 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span className="text-xs font-bold font-sans">Smart Residential Buildings</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Avoid flat-rate billing of tenants. Integrated CT monitors allow split-housing metrics, tracking localized electrical margins for co-living halls, micro-hostels, or dynamic student rooms.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                <div className="text-emerald-400 flex items-center gap-2">
                  <Landmark className="w-4 h-4" />
                  <span className="text-xs font-bold font-sans">Commercial / Factories</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Motors degrade gradually over active hours. High-sample harmonic energy monitors detect abnormal power factor phase drifts (unusual reactive heat losses) before active motors experience terminal failures.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                <div className="text-amber-400 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-xs font-bold font-sans">Solar Integration Operators</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Managing net-metering. Systems map physical consumption waveforms over solar converter curves in real-time, matching dynamic load schedules to peak daylight solar generation arrays.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack Comparison Option Selectors (Section 3) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="font-sans font-medium text-white text-base">Course Submission Tech Stack Matrix</h4>
              <p className="font-sans text-xs text-slate-400 mt-0.5 font-sans">
                Select your student project scope level. Options map from beginner-friendly to professional deployment.
              </p>
            </div>

            <div className="flex border-b border-slate-800 gap-2">
              <button 
                onClick={() => setSelectedStack('A')}
                className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition font-mono ${selectedStack === 'A' ? 'bg-slate-800 border-t-2 border-amber-500 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Option A: Minimal (Simulation-Only)
              </button>
              <button 
                onClick={() => setSelectedStack('B')}
                className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition font-mono ${selectedStack === 'B' ? 'bg-slate-800 border-t-2 border-sky-500 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Option B: Recommended IoT Core
              </button>
              <button 
                onClick={() => setSelectedStack('C')}
                className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition font-mono ${selectedStack === 'C' ? 'bg-slate-800 border-t-2 border-purple-500 text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Option C: Industrial Grade (Modbus RS-485)
              </button>
            </div>

            {selectedStack === 'A' ? (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
                <span className="text-xs font-bold text-amber-400 block font-sans">Standard Python simulation files (Ideal for quick course labs)</span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Requires zero physical hardware expense or micro-controller links. Simulated loads run in local python blocks writing standard CSV datastores. Simple and immediately compiling on any terminal layout.
                </p>
              </div>
            ) : selectedStack === 'B' ? (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
                <span className="text-xs font-bold text-sky-400 block font-sans">ESP32 + Non-Invasive SCT-013 Clamps + MQTT + Home Assistant</span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Highly recommended structure for top-tier student resumes. Models complete end-to-end telemetry workflows, demonstrating skills in analog filter biasing, DSP firmware computations, and lightweight broker communications.
                </p>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
                <span className="text-xs font-bold text-purple-400 block font-sans">DIN-Rail SDM120 / PZEM-004T Metering Module + Modbus Serial RTU</span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Industrial standard deployment. Bypasses raw ADC offsets entirely using professional UART Modbus serial cards. Captures certified true Active Watt metrics and power factors under complex inductive distorted waves.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeGuideTab === 'planner' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="font-sans font-medium text-white text-sm">Course Project Milestones Tracker (10 Phases)</h4>
            <p className="font-sans text-xs text-slate-400 mt-1">
              Select any milestones step to expand tasks list, expected IDE compilation logs, and student diagnostic debug solutions.
            </p>
          </div>

          <div className="space-y-3">
            {TECHNICAL_PHASES.map((ph) => {
              const isOpen = expandedPhase === ph.phase;
              return (
                <div key={ph.phase} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all">
                  <div 
                    onClick={() => togglePhase(ph.phase)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-850/60 transition select-none"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-slate-810 border border-slate-700 text-sky-400 px-2 py-0.5 rounded mr-2">
                        {ph.phase}
                      </span>
                      <strong className="text-sm text-slate-200 font-sans">{ph.title}</strong>
                    </div>
                    <span className="text-xs font-sans text-slate-500">
                      {isOpen ? 'Collapse Details' : 'Expand Phase...'}
                    </span>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-slate-950/20 space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider font-semibold">Objective</span>
                        <p className="text-xs text-slate-300 font-sans mt-0.5">{ph.objective}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider font-semibold">Active Action List</span>
                        <ul className="list-disc list-inside space-y-1 mt-1 pl-1">
                          {ph.tasks.map((tsk, index) => (
                            <li key={index} className="text-xs text-slate-300 font-sans select-text">{tsk}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="border border-emerald-950 bg-emerald-950/10 rounded-lg p-3">
                          <span className="text-[10px] text-emerald-400 block font-mono font-bold">EXPECTED COMPILER OUTPUT LOGS</span>
                          <p className="text-xs text-emerald-200/90 font-mono mt-1 font-mono whitespace-pre-wrap select-text leading-tight bg-slate-950 p-2 rounded">
                            {ph.phase === 'Phase 1' && "Sketch uses 220145 bytes (16%) of program space...\nSerial port COM3 matched at 115200 baud."}
                            {ph.phase === 'Phase 2' && "[ANALOG] ADC count average window: 2045, offset: 0V\nGrid baseline calibration safe."}
                            {ph.phase === 'Phase 3' && "[DSP] Burst samples read: 2000 in 498ms\nIrms derived: 0.345 A"}
                            {ph.phase === 'Phase 4' && "[METER] Vrms: 231.2V | Irms: 4.88A\nActive P: 1120 Watts | PF: 0.98"}
                            {ph.phase === 'Phase 5' && "[FLASH-NVS] Saved cumulative Wh successfully: 1254.85\nCycles left to wearout: 100k"}
                            {ph.phase === 'Phase 6' && "[COIN] Computed aggregate spending: ${currentMetrics.cost.toFixed(5)}"}
                            {ph.phase === 'Phase 7' && "[ALERT] Power exceeded 3.0kW limit!\nEmergency trip relay GPIO25 set LOW"}
                            {ph.phase === 'Phase 8' && "[Broker] Mqtt client published topic to home/energy/main_node\nPayload: JSON packet ok"}
                            {ph.phase === 'Phase 9' && "Home Assistant successfully bound: sensor.grid_true_power"}
                            {ph.phase === 'Phase 10' && "Generating master deliverables payload... Finished."}
                          </p>
                        </div>

                        <div className="border border-rose-950 bg-rose-950/10 rounded-lg p-3">
                          <span className="text-[10px] text-rose-400 block font-mono font-bold">⚠️ COMMON STUDENT PITFALLS & MITIGATIONS</span>
                          <ul className="list-disc list-inside space-y-1 mt-1.5">
                            {ph.commonMistakes.map((mis, index) => (
                              <li key={index} className="text-xs text-rose-200 font-sans leading-snug">{mis}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeGuideTab === 'interview' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="font-sans font-medium text-white text-sm">Industrial IoT Placement Interview Coach</h4>
              <p className="font-sans text-xs text-slate-400 mt-1 font-sans">
                Review these high-importance technical questions with industry answers covering electrical DSP, biasing formulas, and MQTT networking.
              </p>
            </div>
            <Award className="w-6 h-6 text-emerald-400 hidden sm:block shrink-0" />
          </div>

          <div className="space-y-3">
            {INTERVIEW_QUESTIONS.map((item) => {
              const isQOpen = expandedInterviewQ === item.id;
              return (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div 
                    onClick={() => toggleInterviewQ(item.id)}
                    className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-850/60 transition select-none"
                  >
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-800 border border-slate-750 text-blue-400 px-2 py-0.5 rounded shrink-0 self-start mt-0.5">
                        {item.concept}
                      </span>
                      <strong className="text-sm text-slate-200 select-text leading-tight font-sans">{item.question}</strong>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 ml-4">
                      {isQOpen ? 'Hide Answer' : 'Show Answer'}
                    </span>
                  </div>

                  {isQOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-slate-950/20">
                      <p className="text-xs text-slate-300 font-sans leading-relaxed select-text font-sans">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
