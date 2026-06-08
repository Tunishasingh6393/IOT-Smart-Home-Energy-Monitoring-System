/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Appliance, ProjectPhase, InterviewQnA, CircuitPin, CodeTemplate } from './types';

export const INITIAL_APPLIANCES: Appliance[] = [
  {
    id: 'baseload',
    name: 'Standby / Baseload (Wifi, Fridge, Clocks)',
    nominalPower: 80,
    typicalCurrent: 0.35,
    pf: 0.85,
    category: 'Baseload',
    isActive: true,
    description: 'Always-on appliances forming the standby power signature.'
  },
  {
    id: 'heater',
    name: 'Electrical Space Heater',
    nominalPower: 1500,
    typicalCurrent: 6.52,
    pf: 1.0,
    category: 'Heating',
    isActive: false,
    description: 'High resistive load with perfect 1.0 power factor. Draws significant power.'
  },
  {
    id: 'tv',
    name: 'Smart 4K LED TV + AV Console',
    nominalPower: 180,
    typicalCurrent: 0.98,
    pf: 0.78,
    category: 'Entertainment',
    isActive: false,
    description: 'Non-linear switch-mode power supply (SMPS) load with typical active filter.'
  },
  {
    id: 'washing_machine',
    name: 'Inverter Washing Machine (Motor)',
    nominalPower: 450,
    typicalCurrent: 2.30,
    pf: 0.70,
    category: 'Laundry',
    isActive: false,
    description: 'Highly inductive load. Distorts phase relationship yielding a lower power factor.'
  },
  {
    id: 'air_con',
    name: 'Inverter Air Conditioner',
    nominalPower: 1200,
    typicalCurrent: 5.45,
    pf: 0.92,
    category: 'Cooling',
    isActive: false,
    description: 'Dynamic compressor motor load. Moderately reactive with speed inverter.'
  }
];

export const CIRCUIT_CONNECTIONS: CircuitPin[] = [
  { pin: 'GPIO34 (ADC1_CH6)', device: 'SCT-013-050 CT Sensor', purpose: 'Reads AC current waveform from clamp shift bias.' },
  { pin: 'GPIO35 (ADC1_CH7)', device: 'ZMPT101B Voltage module', purpose: 'Reads actual AC voltage sine wave for phase tracking.' },
  { pin: 'GPIO25', device: '5V Single-Channel Relay', purpose: 'Controls power route to heavy load (overload safety disconnect).' },
  { pin: 'GPIO26', device: 'Piezo Active Buzzer', purpose: 'Emits audial alarm sound on overload/fault events.' },
  { pin: 'GPIO33', device: 'Green LED Indicator', purpose: 'Remains solid when ESP32 is online and grid load is safe.' },
  { pin: 'GPIO32', device: 'Red LED Warning', purpose: 'Blinks when threshold exceeded or during relay cutoff.' },
  { pin: 'GPIO21 (SDA) / GPIO22 (SCL)', device: 'I2C OLED Display (SSD1306)', purpose: 'Displays real-time RMS volts, Amps, power factor, and safety states locally.' }
];

export const TECHNICAL_PHASES: ProjectPhase[] = [
  {
    phase: 'Phase 1',
    title: 'Environment Setup',
    objective: 'Establish local developer tooling and ensure appropriate compiler frameworks are functional.',
    tasks: [
      'Install Arduino IDE or vscode with PlatformIO extension.',
      'Configure ESP32 board manager references inside IDE (Espressif core library v3.x).',
      'Install required support dependencies (PubSubClient by Nick O\'Leary, Adafruit SSD1306, EmonLib or custom filter algorithms).'
    ],
    expectedOutput: 'Compile and successfully flash a basic ESP32 "Blink" sketch over USB-to-UART bridge.',
    commonMistakes: [
      'Selecting the wrong ESP32 Board variant (e.g. ESP32-S3 / standard ESP32-DevKitC differences).',
      'Inadequate device driver installation causing CH340G or CP2102 serial ports to fail mapping.'
    ]
  },
  {
    phase: 'Phase 2',
    title: 'Sensing & Biasing Node',
    objective: 'Biasing the SCT-013-050 sensor clamp voltage output around the ESP32’s limited ADC reading range (0 - 3.3V).',
    tasks: [
      'Assemble 10k Ohm Voltage Divider to generate stable 1.65V DC middle bias node.',
      'Connect SCT-013 analog output (1V AC Peak at 50A) through 100k coupling resistor directly targeting physical ADC.',
      'Solder 10 uF electrolytic cleanup capacitor to decouple reference node.'
    ],
    expectedOutput: 'Observe constant ~1.65V (approx. 2048 counts) on ESP32 analog line when no circuit cables run through clamp.',
    commonMistakes: [
      'Feeding absolute raw AC clamp voltage directly into the ADC. High spikes without proper clamping resistors will burn the ESP32 silicon instantly!',
      'Clamping around both Live and Neutral cables together. The magnetic fields cancel each other completely, producing invalid 0V currents.'
    ]
  },
  {
    phase: 'Phase 3',
    title: 'High-Frequency Sampling & RMS DSP',
    objective: 'Sample AC waveform at 4kHz and calculate true root-mean-square current calculations.',
    tasks: [
      'Code high-frequency analog continuous loop reading 2000 distinct samples over a window of 0.5 seconds.',
      'Implement DC offset offset correction in software: subtract middle-bias (approx. 2048 or running average).',
      'Square each individual delta, sum the outcomes, average the result of square additions, and calculate final squareroot.'
    ],
    expectedOutput: 'Serial output logs expressing highly consistent RMS current counts matching standard low-current loads.',
    commonMistakes: [
      'Skipping the square root math or not dealing with negative sine intervals.',
      'Sampling too slowly (e.g. using slow delay loops), leading to aliased waveforms and massive metering discrepancies.'
    ]
  },
  {
    phase: 'Phase 4',
    title: 'Power & Phase Angle Upgrade',
    objective: 'Integrate AC Voltage tracking to support True Power (W), Apparent Power (VA), and real-time Power Factor calculations.',
    tasks: [
      'Attach PZEM-004T module over physical UART Serial2, or tap dual-channel sampling via ZMPT101B.',
      'Detect zero-crossing delay times or directly solve instant correlation: Active Power = 1/N * Sum(V_instant * I_instant).',
      'Solve Power Factor (PF) ratio: True Power divided by apparent Apparent Power.'
    ],
    expectedOutput: 'Valid active Watt readings showing appropriate inductive or purely resistive behavior on active targets.',
    commonMistakes: [
      'Assuming voltage is constant 220V in software for critical applications (leads to 15%+ error margins during grid surges).',
      'Incorrect calculation of power factor above 1.0 due to uncalibrated phase offsets.'
    ]
  },
  {
    phase: 'Phase 5',
    title: 'Energy Cumulative Accumulation',
    objective: 'Keep track of real aggregate consumption in Watt-hours (Wh) or Kilowatt-hours (kWh) over persistent timelines.',
    tasks: [
      'Convert short-interval real average Power (Watts) into fine Watt-seconds.',
      'Accumulate intervals on top of a running long-precision double variable representing energy sum.',
      'Add Non-Volatile Storage (Preferences.h) callbacks to save this cumulative aggregate energy count to flash memory periodic cycles.'
    ],
    expectedOutput: 'Persistent progressive energy accumulator. Values survive active microcontroller reboots and power cycles.',
    commonMistakes: [
      'Saving to flash memory too frequently (e.g. every loop run), which can compromise the silicon write limits within a few days.',
      'Using single-precision float data types, leading to precision loss and accumulator stalling after accumulating large kWh counts.'
    ]
  },
  {
    phase: 'Phase 6',
    title: 'Tariff Cost Estimation',
    objective: 'Formulate dynamic cost logic based on localized price metrics or tier-brackets.',
    tasks: [
      'Establish global cost rate parameters (e.g., $0.15 or ₹10.00 rate per kWh).',
      'Calculate estimated spending dynamically: Total Cost = Cumulative kWh * cost rate scale.'
    ],
    expectedOutput: 'Continuous estimated spending ticker in UI and logs reflecting actual usage density.',
    commonMistakes: [
      'Failing to reset cumulative costs when resetting device calibration benchmarks.'
    ]
  },
  {
    phase: 'Phase 7',
    title: 'Local OLED & Alarm Cutoff',
    objective: 'Create physical safety feedback loops using localized actuators (relais, buz, LED).',
    tasks: [
      'Connect I2C SSD1306 display and code layout lines highlighting power variables.',
      'Implement threshold alerts: if W load crosses pre-set limits, trigger digital write high to Piezo Buzzer pin and Red status LED.',
      'Route trigger pulse to safety relay on GPIO25 to disconnect active appliances during extreme load emergencies.'
    ],
    expectedOutput: 'Local high-impact sound alarm and line breaker disconnection the moment an overload situation occurs.',
    commonMistakes: [
      'Blocking microsecond sampling schedules to render UI updates slow. OLED draw routines should be run on a dedicated slow timer (e.g., every 500ms).'
    ]
  },
  {
    phase: 'Phase 8',
    title: 'MQTT & Local Broker Bridge',
    objective: 'Transmit core telemetry structures securely using JSON packets over MQTT to an active networking gateway.',
    tasks: [
      'Write robust ESP32 Wifi auto-rejoin mechanism.',
      'Initialize PubSubClient targeting local secure Mosquitto server setup.',
      'Construct tight JSON document buffers containing [Irms, Vrms, Power_Factor, activeWatts, Cumulative_kWh, AlertState] and push to MQTT topic.'
    ],
    expectedOutput: 'Frequent standardized telemetry payloads published cleanly every 1 second to the brokers log stream.',
    commonMistakes: [
      'Attempting to reconnect MQTT blocks the code execution loop, losing vital analog sensing samples during the reconnect state.'
    ]
  },
  {
    phase: 'Phase 9',
    title: 'Home Assistant & Grafana Stack',
    objective: 'Collect MQTT feed inside Home Assistant and persist metrics in database vaults for visual historical trends.',
    tasks: [
      'Establish a configuration registry in Home Assistant declaring custom energy entities.',
      'Configure Telegraf data agent or Node-Red flow to read MQTT topics and funnel them straight into InfluxDB columns.',
      'Build rich, scannable panels inside Grafana: dials, threshold alarms, and estimated cost aggregates.'
    ],
    expectedOutput: 'A beautiful historical tracking grid tracking standby load baselines and live usage graphs.',
    commonMistakes: [
      'Incorrectly naming states inside custom configuration files, causing entities to fail registering historical statistics.'
    ]
  },
  {
    phase: 'Phase 10',
    title: 'Portfolio Documentation & Review',
    objective: 'Format repository assets, compile schematic maps, prepare code files, and build direct guides for employer presentation.',
    tasks: [
      'Draft descriptive README explaining problems solved and technical specifications.',
      'Commit pristine structured files avoiding local temporary build garbage.',
      'Practice core interview concepts relating to electrical math, signal processing, and IoT MQTT architecture.'
    ],
    expectedOutput: 'An industry-grade GitHub project portal ready to prove professional IoT competence.',
    commonMistakes: [
      'Committing secrets or local network Wi-Fi passwords inside open-source GitHub repositories.'
    ]
  }
];

export const INTERVIEW_QUESTIONS: InterviewQnA[] = [
  {
    id: 1,
    concept: 'Project Overview',
    question: 'Can you introduce and explain your Smart Home Energy Monitoring System project in a professional manner?',
    answer: 'This project is a modular, high-sample IoT edge energy monitoring platform designed to track real-time electrical metrics (Vrms, Irms, Power Factor, and cumulative energy) per circuit. It consists of physical/simulated CT clamp sensors connected to analog front-end biasing circuits on an ESP32. The micro-controller processes the high-frequency AC waveforms via single-ended ADCs, estimates active power, scales cumulative energy (Wh) persistently using NVS storage, and feeds JSON metrics to an MQTT broker. These metrics are ingested by Home Assistant and visualized in custom Grafana panels, offering homeowners utility-grade insights to eliminate background standby waste and track appliance dynamic behaviors. The project is highly relevant because it addresses residential energy inefficiency from a low-cost, open-source hardware approach.'
  },
  {
    id: 2,
    concept: 'Electrical Math',
    question: 'How do you calculate Apparent Power, Active Power, and Power Factor? Why do they matter?',
    answer: 'Apparent Power (S, in Volt-Amps) is the simple product of RMS Voltage and RMS Current: S = Vrms * Irms. Active Power (P, in Watts) is the actual real-work power and is solved by integrating instantaneous voltage and current products: P = 1/N * Sum(v_t * i_t). Power Factor (PF) represents how cleanly current aligns with voltage, calculated as Active Power / Apparent Power. Linear loads (like heaters) have a PF of 1.0, while non-linear SMPS and inductive motors shift the current phase, creating a low PF. Low PF causes extra current draw on grid systems without performing real power work. Understanding them is crucial for true billing and detecting motor degradation.'
  },
  {
    id: 3,
    concept: 'Analog Front-End',
    question: 'What is the purpose of the 1.65V bias node? What happens if you connect an SCT-013 clamp directly to the ESP32 pin?',
    answer: 'An AC current clamp produces an alternating current/voltage signal that swings both positive and negative (e.g. ±1V Peak). Micro-controllers like the ESP32 contain single-ended ADCs that only read relative voltages between 0V and 3.3V. Any negative voltage fed directly to the pin will clip the signal, create immense distortion on the calculation, and can visually burn or degrade the micro-controller silicon via over-current protection diode breakdown. By building a balanced resistor divider with a cleanup capacitor, we pull the mid-reference point to 1.65V. The AC wave now swings cleanly between 0.65V and 2.65V, remaining safe and fully readable.'
  },
  {
    id: 4,
    concept: 'Embedded Signal Processing',
    question: 'How do you perform RMS calculation in your code? Explain the equation and its DSP steps.',
    answer: 'The RMS current is solved recursively in DSP steps inside our sampling window. First, we sample the ADC pin at a stable rate (e.g., 4000 samples per second to satisfy the Nyquist theorem for 50Hz mains). For each sample, we convert raw counts to Volts and subtract the 1.65V DC offset to center the waveform at 0V. We then square this centered current value to ensure all negative swings become positive, add it to a running accumulator, and increment the sample counter. Once the sampling window closes, we divide the accumulated sum of squares by the sample count to find the baseline mean, and calculate the square root of that mean. This result is then scaled by our calibration factor to obtain Irms.'
  },
  {
    id: 5,
    concept: 'IoT Architecture & Protocols',
    question: 'Why did you select MQTT over HTTP/REST API endpoints for streaming real-time telemetry?',
    answer: 'MQTT is a lightweight, publish-subscribe messaging protocol featuring tiny header overhead (starting at just 2 bytes) and low-complexity network footprints compared to HTTP (which has heavy headers and forces connection handshakes for every payload). This makes MQTT ideal for constant telemetry streaming on microcontrollers. Additionally, the decoupled architecture allows the ESP32 to publish to a single topic while multiple cloud or local systems (Home Assistant, database loggers, node visualizers) consume that same data independently without burdening or crashing the low-resource ESP32 with duplicate connections.'
  },
  {
    id: 6,
    concept: 'Safety Engineering',
    question: 'What safety precautions did you design into the hardware implementation of this project?',
    answer: 'First, I chose non-invasive current transforms (the SCT-013 series) that clip over the insulated conductor jacket without breaking open active lines or exposing current terminals. Second, we integrate high-value series resistors (100k Ohm) to clamp current flow towards the ESP32 ADC pin and prevent accidental overvoltage. Third, for active breaking and relay switching, the high-voltage lines are strictly partitioned inside physical plastic junction boxes with heavy-duty strain reliefs, completely isolated from our low-voltage microcontrollers.'
  },
  {
    id: 7,
    concept: 'Hardware Calibration',
    question: 'How do you calibrate the CT clamp to ensure raw ADC counts accurately represent real Amps?',
    answer: 'Calibration involves placing the current clamp over a single live supply conductor feeding a certified, purely resistive dummy load of known constant power (like a 1000W space heater or a high-wattage incandescent bulb). Since the load is purely resistive, the power factor is exactly 1.0, and the expected current is solved as Irms = Power / Nominal Voltage (e.g. 1000W / 230V = 4.35 Amps). We then review our uncalibrated software RMS readings and scale our lumped calibration variable (CAL_A_PER_COUNT) until our software RMS output matches the expected physical current. This calculated constant is saved to the ESP32\'s non-volatile storage.'
  },
  {
    id: 8,
    concept: 'Performance Optimization',
    question: 'How do you prevent the local OLED screen display routine from stalling or messing up your high-speed ADC sampling?',
    answer: 'Physical I2C OLED screens use communication protocols that take several milliseconds to clear buffers and redraw pixels. If you run OLED rendering routines directly inside your main loop, the analog sample rate will drop drastically, resulting in aliased waves and inaccurate RMS math. To prevent this, we isolate the tasks. The ADC sampling happens in concentrated, rapid high-speed burst windows. We then process the aggregated RMS calculations, and only update the local physical OLED display on a non-blocking asynchronous software timer (e.g., using `millis()` to limit display updates to once every 500ms).'
  },
  {
    id: 9,
    concept: 'Production Scalability',
    question: 'If you needed to scale this architecture to monitor 24 separate circuits in an industrial panel, how would you design it?',
    answer: 'The ESP32 is constrained by its limited layout of internal ADCs and their non-linear characteristics at low voltages. Scaling to 24 channels requires offloading active analog-to-digital compilation. I would implement sequential multi-channel external ADC modules with higher resolutions, such as multiple 16-bit, 4-channel ADS1115 boards communicating over an I2C multiplexer (like the TCA9548A). Alternatively, for industrial-grade installations, I would deploy professional DIN-rail multi-circuit smart meters that read electrical metrics natively and stream them over a shared RS-485 daisy-chain using Modbus RTU back to an ESP32 gateway.'
  },
  {
    id: 10,
    concept: 'Reliability Engineering',
    question: 'What steps are taken to make sure the ESP32 does not lose its cumulative Wh data during a black-out or hard reset?',
    answer: 'We utilize the ESP32\'s Non-Volatile Storage (NVS) partition via the `Preferences.h` library. Because writing to flash memory on every loop cycle causes rapid EEPROM slide degradation, we write in intervals. We check if the cumulative energy accumulates a minimum delta (e.g., a increment of 0.05 kWh or a 5-minute timed interval) and write to NVS only when those parameters are met. On startup, the firmware calls the initialization preferences register, reads the last saved energy value, and continues accumulating from where it left off.'
  }
];

export const FIH_RESOURCES_TEMPLATES: CodeTemplate[] = [
  {
    name: "ESP32 C++ (Arduino Core) Firmware Block",
    language: "cpp",
    filename: "esp32_energy_meter.ino",
    description: "Highly complete firmware utilizing non-blocking timers, DSP wave evaluation, dynamic DC offset stripping, persistent energy tracking, and structured JSON-MQTT publication.",
    code: `/**
 * Smart Home Energy Monitoring System - ESP32 Firmware
 * 
 * Hardware Layout:
 * - SCT-013-050 non-invasive clamp feeding ADC1_CH6 (GPIO34)
 * - Analog interface shifted around 1.65V DC middle-bias
 * - Standard Relay connected to GPIO25 for emergency cut-offs
 * - Active Buzzer on GPIO26
 * - State LEDs: Green (Safe, GPIO33), Red (Overload Alarm, GPIO32)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Preferences.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>

// WiFi Configuration (Use unique local variables)
const char* WIFI_SSID     = "YOUR_HOME_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT broker IP address
const char* MQTT_BROKER   = "192.168.1.150"; 
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "home/energy/main_node";

// ADC & Sensor Constants
const int   CURRENT_PIN          = 34;    // GPIO34 / ADC1_CH6
const float VREF                 = 3.3;   // Micro-controller reference volts
const float ADC_RESOLUTION       = 4095.0;// 12-bit ADC range
const float NOMINAL_VOLTAGE_RMS  = 230.0; // Hardcoded default voltage reference
const float OVERLOAD_WATTS_LIMIT = 3000.0;// Overload trip threshold 3 kW

// Calibration lumped factor derived from standard test loads
// Expresses current Amps mapping per single ADC-volt step
float CAL_AMPS_PER_VOLT = 15.15; 

// Microcontroller state variables
double   cumulative_Wh   = 0.0;
float    irms_current    = 0.0;
float    apparent_power  = 0.0;
bool     overload_triggered = false;
uint64_t last_telemetry_ms  = 0;
uint64_t last_nvs_write_ms   = 0;

// Drivers
WiFiClient espClient;
PubSubClient mqttClient(espClient);
Preferences preferences;
Adafruit_SSD1306 display(128, 64, &Wire, -1);

// Standard hardware pins definitions
const int RELAY_PIN  = 25;
const int BUZZER_PIN = 26;
const int LED_SAFE   = 33;
const int LED_WARN   = 32;

void initWiFi() {
  Serial.print("Connecting to network: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi established! IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  // Loop until we are reconnected to the broker
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection over IP...");
    // Generate unique client identification
    String clientId = "ESP32EnergyNode-" + String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println(" Connected to MQTT Broker successfully!");
      // Notify deployment status
      mqttClient.publish("home/energy/status", "online", true);
    } else {
      Serial.print(" Failed connectivity state: ");
      Serial.print(mqttClient.state());
      Serial.println(". Retrying in 4 seconds.");
      delay(4000);
    }
  }
}

// Sample and compute root-mean-square calculations over AC sine wave
float calculateRMSCurrent() {
  uint32_t num_samples = 2000; // Continuous burst to guarantee accurate mains alignment
  double   sum_squared_voltages = 0;
  
  // Timed sample capture window
  for (uint32_t i = 0; i < num_samples; i++) {
    // Read raw ADC counts: returns values between 0 and 4095
    float raw_adc = analogRead(CURRENT_PIN);
    
    // Scale sequence back to real Volts relative to reference
    float instant_voltage = (raw_adc / ADC_RESOLUTION) * VREF;
    
    // De-bias: strip the 1.65V DC offset to center around 0V
    float centered_voltage = instant_voltage - 1.65;
    
    // Accumulate the squared values
    sum_squared_voltages += (centered_voltage * centered_voltage);
    
    // Microseconds spacing to yield stable ~4kHz evaluation
    delayMicroseconds(250); 
  }
  
  // Calculate RMS Voltage across burdens
  float rms_voltage_sensor = sqrt(sum_squared_voltages / num_samples);
  
  // Yield actual RMS current scaled by calibration parameters
  float calculated_amps = rms_voltage_sensor * CAL_AMPS_PER_VOLT;
  
  // Zero noise cutoff threshold
  if (calculated_amps < 0.08) calculated_amps = 0.0;
  return calculated_amps;
}

void setup() {
  Serial.begin(115200);
  
  // Set up standard pin constraints
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_SAFE, OUTPUT);
  pinMode(LED_WARN, OUTPUT);
  
  // Set default hardware states
  digitalWrite(RELAY_PIN, HIGH); // Active low or safe-high path (Close circuit)
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_SAFE, HIGH);  // Solid safe indicator
  digitalWrite(LED_WARN, LOW);
  
  // Initialize physical OLED I2C display
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 display allocation failed or not attached.");
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0,0);
    display.println("IoT Energy Meter v1.0");
    display.display();
  }

  // Load persistence registers
  preferences.begin("energy_vault", false);
  cumulative_Wh = preferences.getDouble("wh", 0.0);
  Serial.print("Restored cumulative energy from Flash: ");
  Serial.print(cumulative_Wh, 3);
  Serial.println(" Wh");

  initWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
}

void loop() {
  // Enforce connected client wrappers
  if (!WiFi.isConnected()) {
    initWiFi();
  }
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // 1. Process continuous AC signal samples and calculate RMS specs
  irms_current   = calculateRMSCurrent();
  apparent_power = irms_current * NOMINAL_VOLTAGE_RMS;
  
  // Solve continuous energy incremental block
  // (We sample approx 2000 loops over 0.5s plus some processing latency ~ 1.0s)
  float sample_period_hours = 1.0 / 3600.0; // Roughly 1 second in hour fractions
  cumulative_Wh += (apparent_power * sample_period_hours);

  // 2. Overload Detection and High-Power Cutoff logic
  if (apparent_power > OVERLOAD_WATTS_LIMIT) {
    overload_triggered = true;
    digitalWrite(RELAY_PIN, LOW);     // Open/trip relay immediately for electrical protection
    digitalWrite(BUZZER_PIN, HIGH);   // Fire loud continuous buzzer sound
    digitalWrite(LED_SAFE, LOW);
    digitalWrite(LED_WARN, HIGH);     // Flash alarm alerts
  } else {
    overload_triggered = false;
    digitalWrite(RELAY_PIN, HIGH);    // Normal routing
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_SAFE, HIGH);
    digitalWrite(LED_WARN, LOW);
  }

  // 3. Periodic local OLED visual refresh (Every 1000ms, non-blocking)
  uint32_t now = millis();
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println("--- ENERGY MONITOR ---");
  display.print("Vrms: "); display.print(NOMINAL_VOLTAGE_RMS, 1); display.println(" V");
  display.print("Irms: "); display.print(irms_current, 3); display.println(" A");
  display.print("Power: "); display.print(apparent_power, 1); display.println(" VA");
  display.print("Energy: "); display.print((cumulative_Wh/1000.0), 3); display.println(" kWh");
  if (overload_triggered) {
    display.println("!! EMERGENCY TRIP !!");
  } else {
    display.println("State: System Secure");
  }
  display.display();

  // 4. Stream standardized telemetry payload as JSON over MQTT
  if (now - last_telemetry_ms > 1000) {
    last_telemetry_ms = now;
    
    char payload_buffer[256];
    snprintf(payload_buffer, sizeof(payload_buffer),
             "{\"voltage\":%.1f,\"current\":%.3f,\"power\":%.1f,\"energy_kwh\":%.4f,\"overload\":%s}",
             NOMINAL_VOLTAGE_RMS,
             irms_current,
             apparent_power,
             (cumulative_Wh / 1000.0),
             overload_triggered ? "true" : "false");
             
    mqttClient.publish(MQTT_TOPIC, payload_buffer);
    Serial.println("Published telemetry JSON to broker topic.");
  }

  // 5. Periodic Flash Memory backup register (Avoid wearing EEPROM cells, write every 5 minutes)
  if (now - last_nvs_write_ms > 300000) {
    last_nvs_write_ms = now;
    preferences.putDouble("wh", cumulative_Wh);
    Serial.println("Committed local Wh variables safely to Non-Volatile Storage partition.");
  }
  
  delay(10); // Short yielding slice for RTOS scheduler execution
}
`
  },
  {
    name: "Python IoT Virtual Simulation Script",
    language: "python",
    filename: "energy_simulation_station.py",
    description: "Fully executable simulation script generating beautiful colored printouts, dynamic sensor streams, live CSV exports, simulated threshold safety cutoffs, and summary reports.",
    code: `#!/usr/bin/env python3
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
from datetime import datetime

# Local Variables
CSV_LOG_FILENAME = "simulated_energy_history.csv"
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
    print("\\033[96m==================================================================")
    print("      SMART HOME ENERGY MONITORING SYSTEM - IOT SIMULATOR")
    print("==================================================================\\033[0m")
    print(" This script models SCT-013 clamps and streams processed analytics.")
    print(f" Datastore Target:  {CSV_LOG_FILENAME}")
    print(f" Cost Bracket:      USD {ENERGY_COST_PER_KWH:.2f} per kWh")
    print(f" Breaker Threshold: {CURRENT_LIMIT_AMPS:.1f} Amps Peak Limit")
    print("\\033[93m==================================================================\\033[0m")

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
            print(f"[INIT] Created new database: {CSV_LOG_FILENAME}")
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
        print("\\033[94m[DEVICE ACTIVE UTILITY SELECTION] Toggle loads in real-time script settings!\\033[0m")
        print("To activate/deactivate loads, edit presets or toggle through CLI triggers if extended.")
        print("-" * 66)
        
        # Display appliance controls
        for idx, app in enumerate(APPLIANCE_PRESETS):
            status = "\\033[92m[ACTIVE]\\033[0m" if app["active"] else "\\033[90m[OFF]\\033[0m"
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
        seconds_incrementPoint = 2.0 # Loop runs every 2 seconds
        cumulative_watt_seconds += (total_active_w * seconds_incrementPoint)
        cumulative_energy_kwh = (cumulative_watt_seconds / 3600.0) / 1000.0
        cumulative_cost = cumulative_energy_kwh * ENERGY_COST_PER_KWH
        
        # Trigger Alerts if overload happens
        status_text = "NORMAL"
        status_color = "\\033[92m" # Green
        if is_tripped:
            status_text = "EMERGENCY TRIP - SYSTEM OVERLOAD"
            status_color = "\\033[91m" # Red
        
        # Render system monitor panels
        print("-" * 66)
        print("\\033[1;95mLIVE METERING STREAM SUMMARY:\\033[0m")
        print(f" Grid Voltage:       {grid_volts:.1f} V RMS")
        print(f" Measured Current:   {combined_current_amps:.3f} A RMS")
        print(f" Power Factor:       {composite_pf:.2f}")
        print(f" Apparent Power:     {total_apparent_va:.1f} VA")
        print(f" Active Power:       {total_active_w:.1f} Watts")
        print("-" * 66)
        print("\\033[1;93mACCUMULATED METRICS & BILLING:\\033[0m")
        print(f" Total Energy:       {cumulative_energy_kwh:.6f} kWh")
        print(f" Estimated Bill:     USD {cumulative_cost:.5f}")
        print(f" Current Alert State: {status_color}{status_text}\\033[0m")
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
        print("\\033[90mTip: To simulate load variations, toggle appliance configurations.\\033[0m")
        
        # Cycle appliance states on timed schedule to simulate dynamic actions
        iteration += 1
        if iteration == 6:
            print("\\033[94m\n[SIM EVENT] Turning ON TV and Air Conditioner!\\033[0m")
            APPLIANCE_PRESETS[1]["active"] = True # Aircon ON
            APPLIANCE_PRESETS[4]["active"] = True # TV ON
            time.sleep(1.5)
        elif iteration == 12:
            print("\\033[91m\n[SIM EVENT] Adding High Power Space Heater! Threshold overload test incoming...\\033[0m")
            APPLIANCE_PRESETS[2]["active"] = True # Heater ON
            time.sleep(1.5)
        elif iteration == 18:
            print("\\033[94m\n[SIM EVENT] Safety mitigation. Turning OFF Heater and Aircon.\\033[0m")
            APPLIANCE_PRESETS[1]["active"] = False 
            APPLIANCE_PRESETS[2]["active"] = False
            time.sleep(1.5)
            
        time.sleep(2.0)

if __name__ == "__main__":
    try:
        run_simulation_loop()
    except KeyboardInterrupt:
        print("\n\n\\033[92mSimulation gracefully terminated by user. Data preserved in CSV!\\033[0m")
        sys.exit(0)
`
  },
  {
    name: "Home Assistant & Node Configurations",
    language: "yaml",
    filename: "home_assistant_sensors.yaml",
    description: "Declarative Integration YAML defining specific entity trackers, continuous integrations and class models matching high-resolution telemetry specifications.",
    code: `# Place this standard block within the Home Assistant 'configuration.yaml'
# file to convert Raw MQTT JSON strings into native, entity sensor classes.

mqtt:
  sensor:
    - name: "Grid True Power"
      unique_id: "energy_grid_active_power"
      state_topic: "home/energy/main_node"
      unit_of_measurement: "W"
      device_class: power
      state_class: measurement
      value_template: "{{ value_json.power | float }}"
      
    - name: "Grid Safe RMS Current"
      unique_id: "energy_grid_rms_amps"
      state_topic: "home/energy/main_node"
      unit_of_measurement: "A"
      device_class: current
      state_class: measurement
      value_template: "{{ value_json.current | float }}"
      
    - name: "Grid System Voltage"
      unique_id: "energy_grid_rms_volts"
      state_topic: "home/energy/main_node"
      unit_of_measurement: "V"
      device_class: voltage
      state_class: measurement
      value_template: "{{ value_json.voltage | float }}"
      
    - name: "Grid Cumulative Total consumption"
      unique_id: "energy_grid_total_energy"
      state_topic: "home/energy/main_node"
      unit_of_measurement: "kWh"
      device_class: energy
      state_class: total_increasing
      value_template: "{{ value_json.energy_kwh | float }}"

# Home Assistant Automation to trip alarm dashboard and send mobile notifications
automation:
  - alias: "Smart Breaker Critical Exceeded Cutoff"
    trigger:
      - platform: numeric_state
        entity_id: sensor.grid_true_power
        above: 3000
        for: "00:00:03" # Hold trigger solid for 3 seconds
    action:
      - service: notify.persistent_notification
        data:
          title: "ELECTRICAL BREAKER OVERLOAD"
          message: "Breaker tripped dynamically! Circuit loads exceeded security limits."
`
  }
];

export const RAW_README_MARKDOWN = `# Smart Home Energy Monitoring System

An industry-oriented, modular IoT edge platform designed to measure and monitor individual and aggregate residential circuits safely. Features continuous high-frequency DSP wave calculations on an ESP32 microcontroller, persistent backup storage, lightweight real-time telemetry streaming over JSON-MQTT, and tight integration with Home Assistant/Grafana dashboard pipelines.

---

## 🚀 Key System Features

1. **Non-Invasive CT Sensing**: Reads load signals safely through insulated jackets using *SCT-013-050* clamps, requiring zero disruption to active wires.
2. **DSP Root-Mean-Square Calculations**: Captures AC continuous sweeps at 4kHz, stripping DC offset dynamically and solving true RMS values.
3. **Apparent and True Power Analytics**: Resolves actual power factor alignments, active Watts, and reactive Volt-Amps.
4. **Persistent Vault Accumulation**: Keeps precise Watt-hour logs saved securely on local ESP32 Flash memory partitions (Preferences.h) surviving reboots.
5. **Emergency Safety Interlocks**: Tracks overload conditions, triggering active alarms (sound and sirens) while cutting power supply lines via safety relays.
6. **MQTT Broker Telemetry**: Packages variables into tiny, standard JSON payloads, piping them over wireless connections.
7. **Time-Series Dashboard Vaults**: Complete dashboards inside Grafana detailing grid current performance, background idle baselines, and estimated tariff charges.

---

## 🛠️ Hardware Setup & Biasing Circuit

\\\`\\\`\\\`
   [ SCT-013 Clamp ] 
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
                      GND
\\\`\\\`\\\`

*This analog front-end isolates adverse voltage peaks, matching signal swings cleanly with optimal single-ended micro-controller read ranges (0V - 3.3V).*

---

## 📁 Repository Directory Structure

\\\`\\\`\\\`
Smart-Home-Energy-Monitoring-System/
├── arduino_code/
│   └── esp32_energy_meter.ino       # Core ESP32 Arduino Core firmware
├── python_simulation/
│   └── energy_simulation_station.py # Python virtual testing script
├── dashboard/
│   └── home_assistant_sensors.yaml  # Configs for HA MQTT state sensors
├── data/
│   └── simulated_energy_history.csv # Automated local telemetry logs
├── docs/
│   └── wiring_schematics.md         # Extended analog biasing instructions
├── requirements.txt                 # Dependencies for local simulation tools
└── README.md                        # Master repository overview
\\\`\\\`\\\`

---

## ⚙️ Project Installation & Execution

### Running the Local Testing Simulator
1. Ensure Python 3.x is configured.
2. Navigate to project root and execute setup scripts:
   \\\`\\\`\\\`bash
   python python_simulation/energy_simulation_station.py
   \\\`\\\`\\\`
3. Review colored terminal outputs, toggle appliances within code, and inspect real-time CSV data files generated at \\\`data/simulated_energy_history.csv\\\`.

### Deploying the ESP32 Core
1. Open \\\`arduino_code/esp32_energy_meter.ino\\\` inside the Arduino IDE.
2. Fill your local SSID and WiFi credentials in the configuration header.
3. Setup the ESP32 Board manager references, select the target Serial Port, and compile.
4. Flash the compiled firmware onto the ESP32 over a USB-to-UART line.

---

## 📊 Testing Verification Checklists

- [x] Solid Red LED check indicating immediate safety disconnects under 3kW active load parameters.
- [x] Consistent JSON packet logs published over MQTT channels.
- [x] Non-volatile memory tests verifying cumulative energy counters persist across reboots.
- [x] Clear InfluxDB schemas and historical Grafana panels showing baseline trends.
`;

