#!/usr/bin/env python3
"""
========================================================================
Smart Home Energy Monitoring System - Virtual Simulation Station
========================================================================
This program generates a completely virtualized IoT environmental model
incorporating multiple active household appliance presets. It streams
instantaneous voltage, current, power factor, power, cost estimates,
logs data straight to CSV, and automatically generates alert triggers.
========================================================================
"""
import os
import sys
import time
import csv
import math
import random
import signal
from datetime import datetime

# Resolve default logging directory relative to project root
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
data_dir = os.path.join(project_root, "data")
os.makedirs(data_dir, exist_ok=True)

CSV_LOG_FILENAME = os.path.join(data_dir, "simulated_energy_history.csv")
GRID_VOLTAGE_NOMINAL = 230.0 # Standard grid Volts
ENERGY_COST_PER_KWH = 0.15   # USD rate or custom coin
CURRENT_LIMIT_AMPS = 12.0    # Overload emergency safety breaker threshold

# Appliance preset banks
APPLIANCE_PRESETS = [
    {"name": "Baseload (Standby Always-On)", "watts": 75, "pf": 0.85, "active": True},
    {"name": "Inverter Air Conditioner", "watts": 1100, "pf": 0.92, "active": False},
    {"name": "Electric Space Heater", "watts": 1600, "pf": 1.00, "active": False},
    {"name": "Inverter Washing Machine", "watts": 400, "pf": 0.68, "active": False},
    {"name": "Smart TV & Soundbar Center", "watts": 180, "pf": 0.77, "active": False}
]

# Accumulators
cumulative_watt_seconds = 0.0
total_samples_collected = 0

def clean_terminal():
    os.system('cls' if os.name == 'nt' else 'clear')

def render_ascii_header():
    print("\033[96m==================================================================")
    print("      SMART HOME ENERGY MONITORING SYSTEM - IOT SIMULATOR")
    print("==================================================================\033[0m")
    print(" This script models SCT-013 clamps and streams processed analytics.")
    print(f" Datastore Target:  {os.path.relpath(CSV_LOG_FILENAME)}")
    print(f" Cost Bracket:      USD {ENERGY_COST_PER_KWH:.2f} per kWh")
    print(f" Breaker Threshold: {CURRENT_LIMIT_AMPS:.1f} Amps Peak Limit")
    print("\033[93m==================================================================\033[0m")

def initialize_csv():
    # Verify or generate new tracking log
    if not os.path.exists(CSV_LOG_FILENAME):
        try:
            with open(CSV_LOG_FILENAME, mode='w', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([
                    "Timestamp", "Voltage_V", "Current_A", 
                    "ApparentPower_VA", "ActivePower_W", "PowerFactor", 
                    "CumulativeEnergy_kWh", "EstimatedCost_USD", "BreakerStatus"
                ])
            print(f"[INIT] Created new database: {os.path.relpath(CSV_LOG_FILENAME)}")
        except Exception as e:
            print(f"[ERR] Failed to set up CSV database track: {e}")

def run_simulation_loop():
    global cumulative_watt_seconds, total_samples_collected
    
    initialize_csv()
    time.sleep(1.5)
    
    iteration = 0
    while True:
        clean_terminal()
        render_ascii_header()
        
        # User dynamic control prompts
        print("\033[94m[DEVICE ACTIVE UTILITY SELECTION] Toggle loads in real-time script settings!\033[0m")
        print("To activate/deactivate loads, edit presets or toggle through CLI triggers if extended.")
        print("-" * 66)
        
        # Display appliance controls
        for idx, app in enumerate(APPLIANCE_PRESETS):
            status = "\033[92m[ACTIVE]\033[0m" if app["active"] else "\033[90m[OFF]\033[0m"
            print(f" {idx + 1}. {app['name']:<35} - Rating: {app['watts']:>4}W | PF: {app['pf']:.2f} | Status: {status}")
        
        # Calculate load aggregates
        total_active_w = 0.0
        total_apparent_va = 0.0
        
        for app in APPLIANCE_PRESETS:
            if app["active"]:
                # Add minor wave noise to model physical appliances
                noise_scale = random.uniform(0.97, 1.03)
                current_w = app["watts"] * noise_scale
                current_va = current_w / app["pf"]
                
                total_active_w += current_w
                total_apparent_va += current_va
        
        # Simulate slight random grid utility voltage fluctuations
        grid_volts = GRID_VOLTAGE_NOMINAL + random.uniform(-3.5, 3.5)
        
        # Solve corresponding RMS active Amps
        # Apparent = V * I -> I = Apparent / V
        combined_current_amps = total_apparent_va / grid_volts
        
        # Derive composite power factor
        composite_pf = total_active_w / total_apparent_va if total_apparent_va > 0 else 1.0
        
        # Check current safety conditions (Overload)
        is_tripped = combined_current_amps > CURRENT_LIMIT_AMPS
        
        # Power calculation integrations
        # Wh cumulative calculation
        seconds_incrementNode = 2.0 # Loop runs every 2 seconds
        cumulative_watt_seconds += (total_active_w * seconds_incrementNode)
        cumulative_energy_kwh = (cumulative_watt_seconds / 3600.0) / 1000.0
        cumulative_cost = cumulative_energy_kwh * ENERGY_COST_PER_KWH
        
        # Trigger Alerts if overload happens
        status_text = "NORMAL"
        status_color = "\033[92m" # Green
        if is_tripped:
            status_text = "EMERGENCY TRIP - SYSTEM OVERLOAD"
            status_color = "\033[91m" # Red
        
        # Render system monitor panels
        print("-" * 66)
        print("\033[1;95mLIVE METERING STREAM SUMMARY:\033[0m")
        print(f" Grid Voltage:       {grid_volts:.1f} V RMS")
        print(f" Measured Current:   {combined_current_amps:.3f} A RMS")
        print(f" Power Factor:       {composite_pf:.2f}")
        print(f" Apparent Power:     {total_apparent_va:.1f} VA")
        print(f" Active Power:       {total_active_w:.1f} Watts")
        print("-" * 66)
        print("\033[1;93mACCUMULATED METRICS & BILLING:\033[0m")
        print(f" Total Energy:       {cumulative_energy_kwh:.6f} kWh")
        print(f" Estimated Bill:     USD {cumulative_cost:.5f}")
        print(f" Current Alert State: {status_color}{status_text}\033[0m")
        print("-" * 66)
        
        # Append data straight into persistent CSV log
        timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            with open(CSV_LOG_FILENAME, mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([
                    timestamp_str,
                    f"{grid_volts:.2f}",
                    f"{combined_current_amps:.3f}",
                    f"{total_apparent_va:.2f}",
                    f"{total_active_w:.2f}",
                    f"{composite_pf:.3f}",
                    f"{cumulative_energy_kwh:.6f}",
                    f"{cumulative_cost:.5f}",
                    status_text
                ])
            total_samples_collected += 1
        except Exception as e:
            print(f"[ERR] Continuous CSV writing failed: {e}")
            
        print(f" Sample index: {total_samples_collected} written. Press Ctrl+C to terminate.")
        print("\033[90mTip: To simulate load variations, toggle appliance configurations.\033[0m")
        
        # Cycle appliance states on timed schedule to simulate dynamic actions
        iteration += 1
        if iteration == 6:
            print("\033[94m\n[SIM EVENT] Turning ON TV and Air Conditioner!\033[0m")
            APPLIANCE_PRESETS[1]["active"] = True # Aircon ON
            APPLIANCE_PRESETS[4]["active"] = True # TV ON
            time.sleep(1.5)
        elif iteration == 12:
            print("\033[91m\n[SIM EVENT] Adding High Power Space Heater! Threshold overload test incoming...\033[0m")
            APPLIANCE_PRESETS[2]["active"] = True # Heater ON
            time.sleep(1.5)
        elif iteration == 18:
            print("\033[94m\n[SIM EVENT] Safety mitigation. Turning OFF Heater and Aircon.\033[0m")
            APPLIANCE_PRESETS[1]["active"] = False 
            APPLIANCE_PRESETS[2]["active"] = False
            time.sleep(1.5)
            
        time.sleep(2.0)

if __name__ == "__main__":
    def handle_sigint(signum, frame):
        print("\n\n\033[92mSimulation gracefully terminated by user. Data preserved in CSV!\033[0m")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, handle_sigint)
    try:
        run_simulation_loop()
    except KeyboardInterrupt:
        print("\n\n\033[92mSimulation gracefully terminated by user. Data preserved in CSV!\033[0m")
        sys.exit(0)
