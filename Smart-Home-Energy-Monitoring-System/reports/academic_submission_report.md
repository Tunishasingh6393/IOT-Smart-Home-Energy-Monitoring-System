# Academic Audit & IoT Project Submission Report
**Project Title:** End-to-End Non-Invasive Smart Home Power Monitoring Node  
**Target Course:** Electrical and Computer Engineering (ECE) - IoT & Senior Design Lab  

---

## 1. Executive Summary & Design Challenge
Residential energy management is fundamentally critical for smart grid alignment and consumer cost optimization. This report documents the development and validation of a secure, low-overhead Internet-of-Things (IoT) edge node designed to monitor high-frequency AC load lines non-invasively. Using an **ESP32 microcontroller** and **SCT-013-050 Current Transformers**, the edge device samples continuous current waveforms, applies discrete digital signal processing (DSP) to strip DC offset and compute true RMS parameters, and pipes standard telemetry over lightweight MQ Telemetry Transport (MQTT) protocols for continuous Grafana tracking.

---

## 2. Mathematical Formulations & DSP Algorithms

### A. Discrete Root-Mean-Square (RMS) Current $I_{RMS}$
In a continuous time-domain system, the Root-Mean-Square current for a periodic wave with period $T$ is expressed as:
$$I_{RMS} = \sqrt{\frac{1}{T} \int_{0}^{T} [i(t)]^2 dt}$$

In our embedded software running on single-threaded core loops, we approximate this using high-frequency discrete burst samples. Over a sampling window of $N$ sequential acquisitions ($N = 2000$ sequential samples captured at $\Delta t = 250\mu\text{s}$ or approximately 4kHz, fully satisfying the Nyquist-Shannon criteria for 50Hz/60Hz mains):
$$I_{RMS} \approx \text{Calibration\_Scale} \times \sqrt{\frac{1}{N} \sum_{n=1}^{N} \left[ V_{adc}[n] - V_{bias} \right]^2}$$
Where:
- $V_{adc}[n]$ is the instantaneous voltage computed at index $n$.
- $V_{bias}$ is the calculated static DC bias offset (theoretically 1.65V, updated continuously).

### B. True Active Power ($P$) vs. Apparent Power ($S$)
- **Apparent Power ($S$)** is the raw theoretical peak power assuming complete in-phase voltage and current curves:
  $$S = V_{RMS} \times I_{RMS} \quad \text{(Volt-Amps)}$$

- **True Active Power ($P$)** represents the actual physical work done by resistive, inductive, and capacitive appliances sharing the grid line. It is obtained by integrating instantaneous voltage $v(t)$ and current $i(t)$ products over time:
  $$P = \frac{1}{T} \int_{0}^{T} v(t) \cdot i(t) \, dt \approx \frac{1}{N} \sum_{n=1}^{N} v[n] \cdot i[n] \quad \text{(Watts)}$$

- **Power Factor ($PF$)** represents the phase shift penalty caused by reactive loads (e.g. compressors, motors) distorting grid wave alignment:
  $$PF = \frac{\text{Active Power } (P)}{\text{Apparent Power } (S)}$$

---

## 3. Hardware Interfacing & Pin Map

To ensure stable sensor routing, the ESP32 GPIO configuration is established as follows:

| Physical Pin | Connected Peripheral Device | Functional System Purpose |
| :--- | :--- | :--- |
| **GPIO34 (ADC1_CH6)** | SCT-013-050 Current Clamp | Reads shifted alternating current waveform analog outputs. |
| **GPIO35 (ADC1_CH7)** | ZMPT101B Voltage module | Reads analog voltage sine wave for true phase angle tracking. |
| **GPIO25** | 5V Single-Channel Relay | Hardware disconnect switch triggered under emergency overloads. |
| **GPIO26** | Piezo Active Buzzer | Direct acoustic buzzer alarm emitting on safety breaches. |
| **GPIO33** | Green LED Indicator | Solid lit indicator confirming normal system health. |
| **GPIO32** | Red LED Warning | Blinks continuously on overload situations or trip disconnects. |
| **GPIO21 / GPIO22** | SSD1306 128x64 OLED Display | Displays local RMS voltage, current, power, and accumulation. |

---

## 4. Verification & Testing Log

Experimental simulations were conducted across a sequence of dynamic load profiles. The system logged cumulative Watt-hours across simulated and hardware loads.

| Run # | Active Appliances Selected | Real Power (W) | Irms (A) | Measured PF | Tripped Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Standby / Baseloads Only | 75 | 0.35 | 0.85 | NORMAL (No Trip) |
| 2 | Baseload + Air Conditioner | 1175 | 5.23 | 0.92 | NORMAL (No Trip) |
| 3 | Baseload + Space Heater | 1675 | 7.28 | 0.99 | NORMAL (No Trip) |
| 4 | Baseload + Heater + Aircon | 2775 | 12.06 | 0.95 | **TRIPPED (Immediate Cutoff)** |

The firmware safely detected current limits ($>12.0\text{ Amps}$) in Run 4, instantly engaging GPIO25 to cut active power rails, saving downstream hardware components and preventing domestic breaker overloads.

---

## 5. Course Outcomes Met
1. **Discrete Signal Integration:** Applied high-speed ADC sampling and offset filtering techniques.
2. **Resource-Constrained IoT Programming:** Integrated asynchronous OLED updates, non-blocking timers (`millis()`), and low-frequency EEPROM/NVS writes to guarantee 100,000+ write-cycle cells remain functional.
3. **Safety Engineering:** Developed software-authoritative breakers mapping hardware safety limits.
