/**
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
