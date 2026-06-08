#!/usr/bin/env python3
"""
========================================================================
Smart Home Energy Monitoring System - Root Entry Runner
========================================================================
"""
import sys
import os
import subprocess

def main():
    print("\033[96m==================================================================")
    print("   LAUNCHING SMART HOME ENERGY MONITORING SYSTEM SIMULATOR")
    print("==================================================================\033[0m")
    
    # Locate the python simulation station script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sim_script = os.path.join(script_dir, "python_simulation", "energy_simulation_station.py")
    
    if os.path.exists(sim_script):
        print(f"Executing: python {sim_script}\n")
        try:
            # Change CWD to the parent of the CSV file if wanted, or let it work in place
            subprocess.run([sys.executable, sim_script], check=True)
        except KeyboardInterrupt:
            print("\n\033[92mSimulation runner closed gracefully.\033[0m")
        except Exception as e:
            print(f"\n\033[91mError executing the simulator: {e}\033[0m")
    else:
        print(f"\033[91m[ERROR] Simulation station script not found at high-level path: {sim_script}\033[0m")

if __name__ == "__main__":
    main()
