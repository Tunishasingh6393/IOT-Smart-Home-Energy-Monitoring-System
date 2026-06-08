/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Info, ShieldAlert, Zap, HelpCircle } from 'lucide-react';
import { CIRCUIT_CONNECTIONS } from '../data';

export default function CircuitDiagrams() {
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [interactiveTab, setInteractiveTab] = useState<'schematic' | 'wave_clipping'>('schematic');

  return (
    <div className="space-y-6" id="circuit_diagrams_root">
      
      {/* Structural tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button 
          onClick={() => setInteractiveTab('schematic')}
          className={`pb-2.5 text-sm font-medium transition font-sans ${interactiveTab === 'schematic' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Resistor Biasing Front-End Schematic
        </button>
        <button 
          onClick={() => setInteractiveTab('wave_clipping')}
          className={`pb-2.5 text-sm font-medium transition font-sans ${interactiveTab === 'wave_clipping' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Wave Offset & Clipping Explained
        </button>
      </div>

      {interactiveTab === 'schematic' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive biasing schematic rendered in crisp vector SVG */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h4 className="font-sans font-medium text-slate-200 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                SCT-013-050 to ESP32 Signal Biasing Circuit (Safe Analog Front-End)
              </h4>
              <p className="font-sans text-xs text-slate-400 mt-1">
                Hover over or click nodes in this vector diagram to inspect component functions and electrical physics.
              </p>
            </div>

            <div className="relative border border-slate-900 bg-slate-950 rounded-xl my-6 p-4 flex items-center justify-center min-h-[300px]">
              <svg className="w-full max-w-[500px] h-auto" viewBox="0 0 500 300" fill="none">
                {/* Connection lines */}
                {/* 3.3V Power Line */}
                <path d="M 50,40 L 150,40" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,2" />
                <text x="50" y="32" fill="#f43f5e" fontSize="10" fontFamily="monospace">3.3V VCC</text>
                
                {/* Resistor Bias Dividers */}
                <path d="M 150,40 L 150,80" stroke="#94a3b8" strokeWidth="2" />
                {/* Resistor R1 10k */}
                <rect x="135" y="80" width="30" height="40" rx="3" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" cursor="pointer" onClick={() => setSelectedPin('R1')} />
                <text x="142" y="103" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">10k</text>
                <text x="172" y="102" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">R1 (V_div)</text>

                {/* Bias node line */}
                <path d="M 150,120 L 150,180" stroke="#c084fc" strokeWidth="3" />
                <circle cx="150" cy="140" r="5" fill="#a855f7" />
                <text x="162" y="144" fill="#c084fc" fontSize="9" fontFamily="monospace" fontWeight="bold">BIAS (1.65V)</text>

                {/* Decoupling capacitor branch */}
                <path d="M 150,140 L 240,140" stroke="#94a3b8" strokeWidth="2" />
                {/* Decoupling Cap C1 */}
                <rect x="238" y="125" width="4" height="30" fill="#fb7185" />
                <rect x="248" y="125" width="4" height="30" fill="#fb7185" />
                <path d="M 252,140 L 290,140" stroke="#94a3b8" strokeWidth="2" />
                <text x="238" y="115" fill="#fb7185" fontSize="8" fontFamily="monospace">C1 (10uF)</text>

                {/* Resistor R2 10k */}
                <rect x="135" y="180" width="30" height="40" rx="3" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" cursor="pointer" onClick={() => setSelectedPin('R2')} />
                <text x="142" y="203" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">10k</text>
                <text x="172" y="202" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">R2 (V_div)</text>
                <path d="M 150,220 L 150,260" stroke="#94a3b8" strokeWidth="2" />

                {/* Ground plane */}
                <path d="M 100,260 L 320,260" stroke="#10b981" strokeWidth="3" />
                <path d="M 150,260 Q 150,270 150,275" stroke="#10b981" strokeWidth="2" />
                {/* Ground Symbol */}
                <path d="M 140,275 L 160,275 M 144,280 L 156,280 M 148,285 L 152,285" stroke="#10b981" strokeWidth="2" />
                <text x="170" y="282" fill="#10b981" fontSize="10" fontFamily="monospace">GND</text>

                {/* Sensor Current input lines */}
                {/* SCT-013 Jack Terminal Node */}
                <rect x="20" y="120" width="40" height="40" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                <text x="26" y="143" fill="#38bdf8" fontSize="7" fontFamily="sans-serif">SCT-013</text>
                <path d="M 60,135 L 150,135" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="85" cy="135" r="3" fill="#0ea5e9" />
                
                {/* Burden Protection System */}
                <rect x="70" y="85" width="28" height="15" rx="2" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" cursor="pointer" onClick={() => setSelectedPin('burden')} />
                <text x="74" y="95" fill="#f59e0b" fontSize="7" fontFamily="monospace">100R</text>
                <path d="M 85,100 L 85,135" stroke="#94a3b8" strokeWidth="1" />
                <path d="M 85,135 L 85,170" stroke="#94a3b8" strokeWidth="1" />
                <path d="M 70,170 L 100,170" stroke="#94a3b8" strokeWidth="1" />
                <text x="72" y="182" fill="#94a3b8" fontSize="6" fontFamily="sans-serif">Burden</text>

                {/* Output route pointing to MCU */}
                <path d="M 150,135 L 320,135" stroke="#c084fc" strokeWidth="3" />
                
                {/* Coupling Limiting Resistor R3 */}
                <rect x="310" y="115" width="40" height="30" rx="3" fill="#1e293b" stroke="#a855f7" strokeWidth="2" cursor="pointer" onClick={() => setSelectedPin('R3')} />
                <text x="315" y="133" fill="#a855f7" fontSize="9" fontFamily="monospace" fontWeight="bold">100k</text>
                <text x="310" y="105" fill="#c084fc" fontSize="8" fontFamily="sans-serif">R3 (Limit)</text>

                <path d="M 350,135 L 410,135" stroke="#c084fc" strokeWidth="3" />
                
                {/* ESP32 pin terminal board */}
                <rect x="410" y="105" width="70" height="60" rx="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                <text x="424" y="125" fill="#818cf8" fontSize="9" fontFamily="monospace" fontWeight="bold">ESP-32</text>
                <text x="418" y="145" fill="#38bdf8" fontSize="8" fontFamily="monospace">GPIO34 (ADC)</text>
                
                {/* High current protection bleed cap */}
                <path d="M 380,135 L 380,210" stroke="#94a3b8" strokeWidth="1" />
                <rect x="368" y="210" width="24" height="4" fill="#475569" />
                <rect x="368" y="218" width="24" height="4" fill="#475569" />
                <path d="M 380,222 L 380,260" stroke="#10b981" strokeWidth="1" />
                <text x="396" y="222" fill="#94a3b8" fontSize="7" fontFamily="monospace">0.1uF</text>
              </svg>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg flex items-start gap-2.5">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="font-sans text-[11px] text-slate-300 leading-relaxed">
                <strong>Why Burden?</strong> The SCT-013-050 contains a built-in burden resistor converting current output to voltage. If using raw current-output clamps (like SCT-013-000), you <strong>MUST</strong> solder an external 100-Ohm burden resistor (R_burden) in parallel across terminals prior to biasing to avoid open secondary terminal voltage spikes!
              </p>
            </div>
          </div>

          {/* Connective details and instructions checklist (Right Column) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="font-sans font-medium text-white text-sm">Interactive Inspector Details</h4>
              
              {selectedPin === 'R1' || selectedPin === 'R2' ? (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-xs font-mono font-bold text-sky-400 block">[Node: R1 & R2 voltage divider]</span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    These balance resistors connected across 3.3V and Ground act as a standard half-rail divider. They pull the DC middle point of our AC clamp exactly to <strong>1.65V</strong>. This ensures that the sine wave fluctuates cleanly in positive ADC bounds (0.65V to 2.65V) without dropping negative which would destroy the chip.
                  </p>
                </div>
              ) : selectedPin === 'R3' ? (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-xs font-mono font-bold text-purple-400 block">[Node: R3 Current Overdrive Limiter]</span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    A high-value 100k Ohm resistor limits any potential current spikes going into the sensitive ESP32 GPIO. Under transient grid surges, this protects the internal chip components from failing or degrading.
                  </p>
                </div>
              ) : selectedPin === 'burden' ? (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-400 block">[Node: Built-In Burden Resistor]</span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Standard current transformer clamps output micro-amps. A burden resistor converts that physical induction current directly into readable AC millivolt swings (V = I * R). The SCT-013-050 possesses an internal 100-Ohm burden delivering a pre-scaled safe 1V amplitude peak output.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-sans italic">
                  Click on R1, R2, R3 or the Burden resistor in the vector blueprint left to show electrical calculations and safety notes.
                </p>
              )}

              {/* Pin allocation spreadsheet */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-300 block">ESP32 Pin Allocation Map</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-sans">
                        <th className="pb-2">MCU GPIO</th>
                        <th className="pb-2">Target Terminal</th>
                        <th className="pb-2">Purpose / Logic</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {CIRCUIT_CONNECTIONS.map((conn, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40">
                          <td className="py-2.5 font-bold text-sky-400">{conn.pin}</td>
                          <td className="py-2.5 text-slate-200 font-sans">{conn.device}</td>
                          <td className="py-2.5 text-slate-400 text-[10px] font-sans leading-tight">{conn.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="font-sans font-medium text-white text-sm">Signal Distortion and Input Clipping Behaviors</h4>
          <p className="font-sans text-xs text-slate-300 leading-relaxed">
            The mathematical root-mean-square calculations process physical AC waveforms by mapping their physical swings. Explore the difference under biased vs unbiased direct ADC links:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Direct Link Clipping */}
            <div className="border border-rose-950 bg-rose-950/10 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-rose-400 block font-sans">❌ Unbiased Connection (Physical Failure)</span>
              <div className="h-[80px] bg-slate-950 border border-rose-900/40 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                <div className="absolute inset-x-0 h-px bg-slate-800"></div>
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  {/* Clipped bottom wave representing direct AC input into 0-3V single ended ADC */}
                  <path d="M 0,20 Q 25,0 50,20 Q 75,20 100,20" fill="none" stroke="#f43f5e" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-xs text-rose-200 font-sans leading-relaxed">
                Placing an AC signal directly without DC biasing clips the physical negative half-wave completely to 0V. The mathematical calculation squares mostly zeroes, creating <strong>50% absolute measurement distortion</strong>. Furthermore, negative peaks will burn/damage micro-controller ADC channels.
              </p>
            </div>

            {/* Shift Biased Linking */}
            <div className="border border-emerald-950 bg-emerald-950/10 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-emerald-400 block font-sans">✅ Biased Connection (Optimized Front-End)</span>
              <div className="h-[80px] bg-slate-950 border border-emerald-900/40 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                <div className="absolute inset-y-0 h-px bg-purple-900/30 w-full top-[25px]"></div>
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  {/* Beautiful shifted waves */}
                  <path d="M 0,25 Q 25,10 50,25 Q 75,40 100,25" fill="none" stroke="#10b981" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-xs text-emerald-200 font-sans leading-relaxed">
                By sliding the middle bias exactly to 1.65V, the wave swings cleanly in positive space (0.65V to 2.65V). The ESP32 ADC reads the full cycle without wave clipping. Hardware-level accuracy remains consistently clean (below 1-2% deviation).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
