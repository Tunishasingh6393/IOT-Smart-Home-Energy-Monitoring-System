# Smart Home Energy Monitoring System

[![Build Status](https://img.shields.io/badge/Build-Returning%20Green-emerald?style=flat-square)](#)
[![Hardware Platform](https://img.shields.io/badge/Hardware-ESP32%20DevKit-blue?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-Apache%202.0-purple?style=flat-square)](#)

An industry-oriented, modular, end-to-end IoT edge platform designed to measure and monitor individual and aggregate residential circuits safely. Features continuous high-frequency digital signal processing (DSP) wave calculations on an ESP32 microcontroller, non-volatile backup storage, lightweight real-time telemetry streaming over JSON-MQTT, and tight integration with Home Assistant/Grafana dashboard pipelines.

---

## 📌 Project Overview & System Dashboard

This system solves residential energy opacity by monitoring real-time electrical parameters (Vrms, Irms, Apparent Power, Active Power, Power Factor, and cumulative energy consumption) per circuit. 

Here is a visual mockup of our unified monitoring dashboard reporting real-time load analytics:

![IoT System Dashboard Preview](./images/dashboard_analytics.png)

---

## 📁 Repository Directory Structure & Explanations

This repository is strictly partitioned into functional subdirectories to enforce enterprise boundaries, decoupling active physical firmware from virtual simulations, database captures, and academic submissions.

```
Smart-Home-Energy-Monitoring-System/
├── arduino_code/
│   └── esp32_energy_meter.ino       # 1. Core ESP32 C++ (Arduino Core) firmware
├── python_simulation/
│   └── energy_simulation_station.py # 2. Standalone physical testing script
├── dashboard/
│   └── home_assistant_sensors.yaml  # 3. Mappings for home integrations
├── data/
│   └── simulated_energy_history.csv # 4. Seeding historical telemetry log CSV
├── outputs/
│   └── placeholder.txt              # 5. Output directory for exported reports/graphs
├── images/
│   ├── dashboard_analytics.png      # 6. Dynamic analytics dashboard mockup
│   └── circuit_schematic.png        # 7. Hardware biasing circuit diagram
├── circuit_diagram/
│   └── biasing_circuit_design.txt   # 8. Analog conditioning specifications
├── reports/
│   └── academic_submission_report.md# 9. Complete academic portfolio submission documentation
├── docs/
│   └── wiring_schematics.md         # 10. Step-by-step physical assembly wiring guides
├── requirements.txt                 # 11. Python simulation dependencies
├── main.py                          # 12. Host-level single-command simulation runner
└── README.md                        # Master repository introduction
```

### Folder Explanations in Detail:
- **`arduino_code/`**  
  Holds the ready-to-flash C++ firmware for the physical ESP32. It implements 4kHz burst waveform sampling, subtraction of DC bias offsets in real-time, calculates RMS current, handles safety latch-open relays, and manages WiFi/MQTT reconnection loops.
- **`python_simulation/`**  
  Contains the virtual environmental simulation script. It models multiple active home appliance profiles (Baseload, Aircon, Space Heater, Washing Machine, and Smart TV) with randomized wave phase noises, logging outcomes cleanly into persistent tables.
- **`dashboard/`**  
  Defines native declaration YAML assets representing entity mappings and automation alert rules to pipe live MQTT streams directly into Home Assistant's Lovelace dashboards.
- **`data/`**  
  Includes the persistent database CSV storage tracking the timestamped logs of voltage, current, apparent/true power, power factors, Wh metrics, and alarm trip states.
- **`outputs/`**  
  The reserved output directory for holding any dynamically updated plots, figures, or summary reports created during simulations or testing operations.
- **`images/`**  
  Houses visual portfolio imagery (dashboard mocks, schematic charts) providing gorgeous graphical context in our repository markdown displays.
- **`circuit_diagram/`**  
  Features analog biasing descriptions detailing resistive divider designs, capacitor couplings, safety components, and physical pin maps.
- **`reports/`**  
  Contains formal, course-compliant academic submission documentation summarizing experimental test logs, discrete equations, and project outcomes.
- **`docs/`**  
  Step-by-step guides detailing physical assembly, component bill of materials (BOM), solder rules, and high-voltage circuit clamp safety protocols.
- **`requirements.txt`**  
  Declares required Python framework packages (Pandas, Matplotlib, Paho-MQTT, Numpy) used to execute local simulation stations.
- **`main.py`**  
  A root-level Python runner that immediately initializes the virtual simulation terminal panel without navigating subfolders.

---

## 🛠️ Hardware Setup & Biasing Circuit

### The Analog Conditioning Challenge
Alternating currents generate alternating waves swinging negative and positive (e.g. ±1V Peak). Micro-controllers like the ESP32 possess single-ended Analog-to-Digital Converters (ADCs) that only read relative positive voltages between **0V and 3.3V**. Receptacle negative currents fed directly would clip out, corrupt mathematical RMS evaluations, and physically degrade microcontroller silicon over time.

To resolve this, we construct a **1.65V DC Bias Node** using a resistor divider with electrolytic decoupling capacitors. The AC current signal is safely centered around this offset, swinging safely between **0.65V and 2.65V**.

Here is our complete biasing circuit diagram:

![Biasing Schematic Diagram](./images/circuit_schematic.png)

*To view the detailed hardware bill-of-materials and step-by-step assembly guides, refer to [`docs/wiring_schematics.md`](./docs/wiring_schematics.md).*

---

## 📐 Mathematical DS&P Implementations

### Root-Mean-Square (RMS) Current $I_{RMS}$
For high-frequency AC waves, we approximate continuous temporal RMS integrals inside our discrete MCU sampling loop:
$$I_{RMS} \approx K_{cal} \times \sqrt{\frac{1}{N} \sum_{n=1}^{N} \left( V_{adc}[n] - V_{bias} \right)^2}$$
Where:
- $N$ represents the sample dataset count ($N = 2000$).
- $V_{adc}[n]$ is the raw discrete volt captured.
- $V_{bias}$ is the DC offset scalar ($1.65\text{V}$, dynamically adjusted).
- $K_{cal}$ is our combined current-burden calibration coefficient.

### Power Integrations & Billing
- **Apparent Power ($S$):**  
  $$S = V_{RMS} \times I_{RMS} \quad \text{(Volt-Amps)}$$
- **True Active Power ($P$):**  
  $$P \approx \frac{1}{N} \sum_{n=1}^{N} v[n] \cdot i[n] \quad \text{(Watts)}$$
- **Power Factor ($PF$):**  
  $$PF = \frac{P}{S}$$

---

## 🚀 Quick Start Guide

### 1. Running the Local Simulation Station
You can immediately simulate environmental telemetry streams locally on your desktop.
1. Install Python 3.x.
2. Clone the repository and install dependencies from the project root:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the host-level entry runner:
   ```bash
   python main.py
   ```
4. Observe real-time CLI updates, cycle loads, and inspect historical CSV streams appended straight inside `./data/simulated_energy_history.csv`.

### 2. Physical ESP32 Node Deployment
1. Connect components according to [`docs/wiring_schematics.md`](./docs/wiring_schematics.md).
2. Open [`arduino_code/esp32_energy_meter.ino`](./arduino_code/esp32_energy_meter.ino) inside the Arduino IDE.
3. Configure your local WiFi `SSID`, `WIFI_PASSWORD`, and broker IP addresses in the top configuration header.
4. Set board config to "ESP32 Dev Module" and flash the compiled binary over a serial USB line.
5. Inspect serial monitors running at `115200` baud.
