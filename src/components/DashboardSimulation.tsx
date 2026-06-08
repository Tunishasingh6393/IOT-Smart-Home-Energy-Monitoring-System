/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Zap, AlertTriangle, CheckCircle2, TrendingUp, Coins, Download, 
  RefreshCw, Play, Square, Activity, HelpCircle, ShieldAlert, FileText 
} from 'lucide-react';
import { Appliance, EnergyMetric } from '../types';
import { INITIAL_APPLIANCES } from '../data';

export default function DashboardSimulation() {
  const [appliances, setAppliances] = useState<Appliance[]>(INITIAL_APPLIANCES);
  const [voltageNominal, setVoltageNominal] = useState<number>(230); // Volts RMS
  const [costRate, setCostRate] = useState<number>(10.0); // Rate per kWh (e.g. ₹ or $)
  const [breakerLimitAmps, setBreakerLimitAmps] = useState<number>(12); // Limit before trip
  const [isLive, setIsLive] = useState<boolean>(true);
  const [gridNoise, setGridNoise] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // seconds per sample
  
  // Real-time metrics
  const [currentMetrics, setCurrentMetrics] = useState<EnergyMetric>({
    timestamp: new Date().toLocaleTimeString(),
    voltage: 230,
    current: 0.35,
    apparentPower: 80.5,
    realPower: 68.4,
    powerFactor: 0.85,
    cumulativeWh: 1.25, // Initial starting Wh
    cost: 0.0125,
    activeApplianceCount: 1,
    isOverload: false
  });

  // History buffer for graphing (last 20 logs)
  const [history, setHistory] = useState<EnergyMetric[]>([]);

  // CSV log buffer
  const [csvLogs, setCsvLogs] = useState<string[][]>([
    ["Timestamp", "Voltage_V", "Current_A", "ApparentPower_VA", "ActivePower_W", "PowerFactor", "CumulativeEnergy_kWh", "EstimatedCost", "BreakerStatus"]
  ]);

  // Wave oscilloscope control
  const [wavePhase, setWavePhase] = useState<number>(0);

  // Interval timers
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Create slight random grid voltage fluctuation
      const noiseV = gridNoise ? (Math.sin(Date.now() / 5000) * 1.8 + (Math.random() - 0.5) * 0.6) : 0;
      const v = parseFloat((voltageNominal + noiseV).toFixed(1));

      // Calculate aggregated current, real wattage, and apparent power
      let totalWatts = 0;
      let totalVA = 0;
      let activeCount = 0;

      appliances.forEach((app) => {
        if (app.isActive) {
          activeCount++;
          // Add micro-noise per active load (simulating thermostat, friction, line state)
          const loadNoise = gridNoise ? (1 + (Math.random() - 0.5) * 0.04) : 1;
          const w = app.nominalPower * loadNoise;
          const va = w / app.pf;
          totalWatts += w;
          totalVA += va;
        }
      });

      // Avoid division by zero
      const calculatedCurrent = totalVA > 0 ? totalVA / v : 0;
      const compositePF = totalVA > 0 ? totalWatts / totalVA : 1.0;
      const roundedCurrent = parseFloat(calculatedCurrent.toFixed(3));
      
      const isOverload = roundedCurrent > breakerLimitAmps;

      // Cumulative energy step calculation (Wh = Watts * time in hours)
      const hoursInterval = (1 * simulationSpeed) / 3600;
      const incrementalWh = (isOverload ? 0 : totalWatts) * hoursInterval; // Trip interrupts power
      
      setCurrentMetrics((prev) => {
        const nextWh = prev.cumulativeWh + incrementalWh;
        const nextCost = (nextWh / 1000) * costRate;
        const timestamp = new Date().toLocaleTimeString();

        const metricItem: EnergyMetric = {
          timestamp,
          voltage: v,
          current: isOverload ? 0 : roundedCurrent,
          apparentPower: isOverload ? 0 : parseFloat(totalVA.toFixed(1)),
          realPower: isOverload ? 0 : parseFloat(totalWatts.toFixed(1)),
          powerFactor: isOverload ? 1.0 : parseFloat(compositePF.toFixed(2)),
          cumulativeWh: nextWh,
          cost: nextCost,
          activeApplianceCount: isOverload ? 0 : activeCount,
          isOverload
        };

        // Update local history buffer
        setHistory((h) => {
          const updated = [...h, metricItem];
          if (updated.length > 20) updated.shift();
          return updated;
        });

        // Append to local CSV Logger data array
        setCsvLogs((logs) => [
          ...logs,
          [
            new Date().toISOString(),
            v.toString(),
            (isOverload ? 0 : roundedCurrent).toString(),
            (isOverload ? 0 : totalVA).toFixed(1),
            (isOverload ? 0 : totalWatts).toFixed(1),
            (isOverload ? 1.0 : compositePF).toFixed(2),
            (nextWh / 1000).toFixed(6),
            nextCost.toFixed(5),
            isOverload ? "TRIPPED" : "SECURE"
          ]
        ]);

        return metricItem;
      });

      // Animate oscilloscope phase shift
      setWavePhase((p) => (p + 0.5) % (Math.PI * 2));

    }, 1000 * simulationSpeed);

    return () => clearInterval(interval);
  }, [appliances, voltageNominal, costRate, breakerLimitAmps, isLive, gridNoise, simulationSpeed]);

  const toggleAppliance = (id: string) => {
    setAppliances((apps) =>
      apps.map((app) => app.id === id ? { ...app, isActive: !app.isActive } : app)
    );
  };

  const resetAccumulation = () => {
    setCurrentMetrics((prev) => ({
      ...prev,
      cumulativeWh: 0,
      cost: 0
    }));
    setHistory([]);
    setCsvLogs([
      ["Timestamp", "Voltage_V", "Current_A", "ApparentPower_VA", "ActivePower_W", "PowerFactor", "CumulativeEnergy_kWh", "EstimatedCost", "BreakerStatus"]
    ]);
  };

  // Pre-configured virtual testing scripts
  const applyPresetScenario = (type: 'standby' | 'high_usage' | 'heavy_inductive' | 'overload') => {
    setAppliances((apps) =>
      apps.map((app) => {
        if (type === 'standby') {
          return { ...app, isActive: app.id === 'baseload' };
        }
        if (type === 'high_usage') {
          return { ...app, isActive: app.id === 'baseload' || app.id === 'air_con' || app.id === 'tv' };
        }
        if (type === 'heavy_inductive') {
          return { ...app, isActive: app.id === 'baseload' || app.id === 'washing_machine' };
        }
        if (type === 'overload') {
          // Trigger breaker shutdown by turning on heavy loads
          return { ...app, isActive: true };
        }
        return app;
      })
    );
  };

  // Convert logs to downloadable client-side CSV data link
  const csvDownloadHref = useMemo(() => {
    const csvContent = csvLogs.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  }, [csvLogs]);

  // Generate simulated instant text report
  const handleDownloadTextReport = () => {
    const reportText = `========================================================================
            SMART RESIDENTIAL ENERGY AUDIT REPORT
========================================================================
Generated: ${new Date().toLocaleString()}
Grid Reference: Single-Phase ~${voltageNominal}V RMS @ 50Hz
Baseline Tariff Rate: Key Rate ₹/kWh or $/kWh: ${costRate}
Safety Cutoff Limit: ${breakerLimitAmps} Amps Peak Threshold

ACTIVE LOADS REPORT:
${appliances.map(a => `- ${a.name}: ${a.isActive ? 'ACTIVE' : 'OFF'} (${a.nominalPower}W, PF: ${a.pf})`).join("\n")}

AGGREGATED METER READINGS (LAST RUN):
- Operating Voltage:   ${currentMetrics.voltage} V RMS
- Aggregate Current:   ${currentMetrics.current.toFixed(3)} A RMS
- Active Load:         ${currentMetrics.realPower.toFixed(1)} Watts
- Apparent Load:       ${currentMetrics.apparentPower.toFixed(1)} VA
- Derived Power Factor:${currentMetrics.powerFactor}
- Safety Relay State:  ${currentMetrics.isOverload ? 'TRIPPED (OVER-CURRENT ALARM)' : 'SECURE (CLOSED CIRCUIT)'}

CUMULATIVE BILLING:
- Energy Consumed:     ${(currentMetrics.cumulativeWh / 1000).toFixed(6)} kWh
- Total Cost Charge:   ₹ / $ ${currentMetrics.cost.toFixed(5)}
- Log Entries Cached:  ${csvLogs.length - 1} samples in CSV stack
========================================================================`;
    
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smart_energy_report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Draw AC waveform oscilloscope curves dynamically based on activated load behaviors
  const drawWaveform = () => {
    const pointsV: string[] = [];
    const pointsI: string[] = [];
    const pointsIBias: string[] = [];
    
    const width = 450;
    const height = 140;
    const midY = height / 2;
    
    // Wave parameters based on active appliances
    let currentAmplitudeScale = 0;
    let currentPhaseShift = 0;
    let powerIsDistorted = false;

    appliances.forEach(a => {
      if (a.isActive) {
        currentAmplitudeScale += (a.nominalPower / 300); // Scale draw
        // Weighted phase shift based on active appliances PF
        if (a.pf < 1.0) {
          currentPhaseShift += Math.acos(a.pf) * 1.5; 
        }
        if (a.category === 'Entertainment') {
          powerIsDistorted = true; // LED TV smps distorts wave
        }
      }
    });

    if (currentMetrics.isOverload) {
      currentAmplitudeScale = 0; // Breaker cut current to zero
    }

    // Limit amp visual heights
    currentAmplitudeScale = Math.min(currentAmplitudeScale * 8, 55);

    for (let x = 0; x <= width; x += 3) {
      const angle = (x / width) * Math.PI * 4 + wavePhase;
      
      // Voltage wave: clean beautiful sine
      const yV = midY + Math.sin(angle) * 45;
      pointsV.push(`${x},${yV}`);

      // Current wave: check phase shifting and noise distortion
      let currentAngle = angle - (currentPhaseShift / Math.max(1, currentMetrics.activeApplianceCount));
      let currentBaseSin = Math.sin(currentAngle);
      
      if (powerIsDistorted) {
        // Overlay harmonic ripples (3rd and 5th harmonics) to show distortion visually!
        currentBaseSin = 0.8 * currentBaseSin + 0.25 * Math.sin(currentAngle * 3) + 0.1 * Math.sin(currentAngle * 5);
      }

      const yI = midY + currentBaseSin * currentAmplitudeScale;
      pointsI.push(`${x},${yI}`);

      // ESP32 actual centered shifted ADC wave (shifted around 1.65V mid rail viz)
      // Visualizing ADC reading range 0 - 4095
      const yBias = (yI / height) * 1.2 + 0.5; // Scale and drift
      const scaledBiasY = yI + 15; // Visually offset downward to show stacked plot
      pointsIBias.push(`${x},${scaledBiasY}`);
    }

    return { 
      voltagePath: `M ${pointsV.join(' L ')}`,
      currentPath: `M ${pointsI.join(' L ')}`,
      biasPath: `M ${pointsIBias.join(' L ')}`
    };
  };

  const paths = drawWaveform();

  return (
    <div className="space-y-6" id="dashboard_simulation_root">
      {/* Simulation scenario controller topbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-medium text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Virtual IoT Laboratory & Digital Twin
          </h3>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Simulates actual load currents clamped by a non-invasive SCT-013-050 sensor mapped to an ESP32 ADC.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            id="btn_sim_standby"
            onClick={() => applyPresetScenario('standby')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs hover:bg-slate-700 transition"
          >
            Idle Standby
          </button>
          <button 
            id="btn_sim_inductive"
            onClick={() => applyPresetScenario('heavy_inductive')}
            className="px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-800 text-teal-300 text-xs hover:bg-teal-900/60 transition"
          >
            Heavy Inductive (Isolates Low PF)
          </button>
          <button 
            id="btn_sim_high"
            onClick={() => applyPresetScenario('high_usage')}
            className="px-3 py-1.5 rounded-lg bg-sky-950/40 border border-sky-800 text-sky-300 text-xs hover:bg-sky-900/60 transition"
          >
            High Power AC Usage
          </button>
          <button 
            id="btn_sim_overload"
            onClick={() => applyPresetScenario('overload')}
            className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs hover:bg-rose-900/60 hover:text-white transition"
          >
            💥 Trigger Safety Overload
          </button>
        </div>
      </div>

      {/* Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Voltage Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 block">AC Grid Voltage (Vrms)</span>
            <span className="text-2xl font-mono font-semibold text-white tracking-tight mt-1 inline-block">
              {currentMetrics.voltage} <span className="text-sm font-sans font-normal text-slate-400">V</span>
            </span>
            <span className="text-slate-400 text-xs block mt-1 hover:underline cursor-pointer" onClick={() => setVoltageNominal(prev => prev === 230 ? 220 : 230)}>
              Standard frequency: 50Hz (Click to togg.)
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Current Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 block">Current Loading (Irms)</span>
            <span className="text-2xl font-mono font-semibold text-white tracking-tight mt-1 inline-block">
              {currentMetrics.current.toFixed(3)} <span className="text-sm font-sans font-normal text-slate-400">A</span>
            </span>
            <span className="text-slate-400 text-xs block mt-1">
              CT Clamp Limit: 50.0 Amps
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Real Power Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 block">Active/True Power (P)</span>
            <span className="text-2xl font-mono font-semibold text-white tracking-tight mt-1 inline-block">
              {currentMetrics.realPower.toFixed(1)} <span className="text-sm font-sans font-normal text-slate-400">W</span>
            </span>
            <span className="text-slate-400 text-xs block mt-1">
              Apparent: {currentMetrics.apparentPower.toFixed(1)} VA
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Cost Accumulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 block">Billing Tariff Aggregate</span>
            <span className="text-2xl font-mono font-semibold text-amber-400 tracking-tight mt-1 inline-block">
              ₹ {currentMetrics.cost.toFixed(4)}
            </span>
            <span className="text-slate-400 text-xs block mt-1">
              Total Energy: {(currentMetrics.cumulativeWh / 1000).toFixed(5)} kWh
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main interactive grid layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Appliance Controller & Settings (Left Column) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div>
            <h4 className="font-sans font-medium text-white text-base">Select Load Node Allocations</h4>
            <p className="font-sans text-xs text-slate-400 mt-1">
              Simulate electrical appliances to feed load signatures dynamically onto the virtual sensors.
            </p>
          </div>

          <div className="space-y-3">
            {appliances.map((app) => (
              <div 
                key={app.id} 
                onClick={() => toggleAppliance(app.id)}
                className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer select-none transition-all ${
                  app.isActive 
                    ? 'bg-slate-850 border-sky-500/40 shadow-md shadow-sky-500/5' 
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${app.isActive ? 'bg-sky-400' : 'bg-slate-600'}`}></span>
                    <span className="text-sm font-sans font-medium text-slate-200">{app.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-sans">{app.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold font-mono text-white block">{app.nominalPower} W</span>
                  <span className="text-[10px] font-mono text-slate-500">PF: {app.pf.toFixed(2)} | ~{app.typicalCurrent}A</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h5 className="text-sm font-sans font-medium text-white flex items-center gap-1">Local Circuit Variables</h5>
              <button 
                onClick={resetAccumulation}
                className="text-xs font-sans text-slate-300 hover:text-white flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Accumulator
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block font-sans mb-1">Local Tariff Rate (₹ per kWh)</label>
                <input 
                  type="number" 
                  value={costRate}
                  onChange={(e) => setCostRate(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block font-sans mb-1">Overload Threshold (Amps)</label>
                <input 
                  type="number" 
                  value={breakerLimitAmps}
                  onChange={(e) => setBreakerLimitAmps(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-400 flex items-center gap-1">
                <input 
                  type="checkbox" 
                  checked={gridNoise} 
                  onChange={(e) => setGridNoise(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0" 
                />
                Simulate Ambient Grid Harmonics / Noise
              </span>

              <span className="text-slate-400">
                Time Tick Rate:
                <select 
                  value={simulationSpeed} 
                  onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded text-xs ml-1 py-0.5 px-1 font-mono text-slate-200"
                >
                  <option value={1}>1s Realtime</option>
                  <option value={10}>10s Fast-fwd</option>
                  <option value={60}>1m Fast-fwd</option>
                </select>
              </span>
            </div>
          </div>
        </div>

        {/* Live AC Wave Oscilloscope & System Logs (Right Column) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Wave Oscilloscope Screen */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-sans font-medium text-slate-200 text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                Sensing wave Oscilloscope (Node CT vs voltage)
              </h4>
              <span className="font-sans text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Sample Sweep: ~4.0kHz
              </span>
            </div>

            <div className="relative border border-emerald-950 bg-emerald-950/5 rounded-xl h-[150px] flex items-center justify-center overflow-hidden">
              {/* Scope Background Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:15px_15px] opacity-25"></div>
              
              {/* Actual plot vectors */}
              <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 450 140" preserveAspectRatio="none">
                {/* Voltage Line (Amber) */}
                <path d={paths.voltagePath} fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity="0.85" />
                {/* Current Line (Teal/Sky) */}
                <path d={paths.currentPath} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
                {/* ESP32 Centered shift line (Light purple) */}
                <path d={paths.biasPath} fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="2,3" opacity="0.6" />
              </svg>

              {/* Float informational indicators overlay */}
              <div className="absolute bottom-2 left-3 flex gap-3 text-[9px] font-mono select-none">
                <span className="text-amber-400 flex items-center gap-1 font-sans">
                  <span className="w-2.5 h-0.5 bg-amber-500 inline-block font-sans"></span> Grid Voltage (Vrms)
                </span>
                <span className="text-sky-400 flex items-center gap-1 font-sans">
                  <span className="w-2.5 h-0.5 bg-sky-500 inline-block font-sans"></span> Calculated Current wave
                </span>
                <span className="text-purple-400 flex items-center gap-1 font-sans">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-purple-500 inline-block font-sans"></span> Shifted Biased Analog Input (0-3.3V)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono">
                <span className="text-slate-500 block text-[9px] font-sans">Measured Power Factor</span>
                <span className={`font-semibold ${currentMetrics.powerFactor < 0.8 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {currentMetrics.powerFactor}
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono">
                <span className="text-slate-500 block text-[9px] font-sans">Total VA (Apparent)</span>
                <span className="text-slate-200 font-semibold">{currentMetrics.apparentPower} VA</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono">
                <span className="text-slate-500 block text-[9px] font-sans">Active Watts (Real Work)</span>
                <span className="text-emerald-400 font-semibold">{currentMetrics.realPower} W</span>
              </div>
            </div>
          </div>

          {/* Current system alarms engine status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-sans font-medium text-white text-sm">System Protection & Data Logging Engine</h4>
            
            {currentMetrics.isOverload ? (
              <div className="bg-rose-950/40 border border-rose-850 rounded-xl p-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-rose-400 font-sans">💥 CORE OVERLOAD CRITICAL SHUTDOWN</h5>
                  <p className="text-xs text-rose-200/90 font-sans mt-0.5">
                    Aggregated load reached <span className="font-mono font-semibold">{currentMetrics.current.toFixed(2)}A</span>, exceeding safety rating limit of <span className="font-mono font-semibold">{breakerLimitAmps}A</span>. 
                    Local safety relay cut circuit lines instantaneously to prevent terminal fire failures.
                  </p>
                  <p className="text-xs text-rose-300 font-mono mt-2 bg-rose-950 px-2 py-1 rounded inline-block">
                    [ALARM RELAY TRIPPED GPIO25 LED BLINKING]
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/20 border border-emerald-900 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-emerald-400 font-sans">System Security Secured</h5>
                  <p className="text-xs text-emerald-200/90 font-sans mt-0.5">
                    Total current draw is within the safety breaker rating of <span className="font-mono font-semibold">{breakerLimitAmps}A</span>. 
                    The ESP32 is running high-speed sampling while writing data packages over JSON-MQTT smoothly.
                  </p>
                </div>
              </div>
            )}

            {/* Generated Reports & Downloads Area */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-center sm:text-left">
                <span className="text-xs font-semibold text-white block">Simulated Datastores Available</span>
                <span className="text-[10px] text-slate-400 font-sans">Contains CSV history logs and structured text audit summaries.</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {/* Simulated CSV Logger download */}
                <a 
                  id="csv_download_btn"
                  href={csvDownloadHref} 
                  download="simulated_energy_history.csv"
                  className="flex-1 sm:flex-none text-center bg-slate-800 text-slate-200 px-3 py-2 rounded-lg text-xs font-sans hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> CSV Logs ({csvLogs.length - 1})
                </a>
                
                {/* Simulated text report generator */}
                <button
                  id="text_report_download_btn"
                  onClick={handleDownloadTextReport}
                  className="flex-1 sm:flex-none bg-sky-950 border border-sky-850 hover:bg-sky-900 text-sky-200 px-3 py-2 rounded-lg text-xs font-sans transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Energy Report (Text)
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
