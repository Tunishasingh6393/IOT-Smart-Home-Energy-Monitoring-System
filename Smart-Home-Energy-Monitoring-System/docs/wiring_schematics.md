# Physical Assembly & Wiring Guidelines
This document guides developers through assembling the conditioning hardware, safely mounting current clamps, and wiring the ESP32 microcontroller pins.

---

## 1. Safety Warnings (CRITICAL)
- **HIGH VOLTAGE WARNING:** Mains power lines (230V or 110V) carry lethal voltages and currents. Never touch bare copper wires, open outlets, or strip active circuits.
- **NO INTRUSIVE SPLICES:** The SCT-013-050 is a *non-invasive* current transformer. You do **NOT** need to cut open or touch the inner copper core of any circuit line. Mount the sensor strictly by clipping the clamp around the outer insulated jacket.
- **SINGLE-WIRE CLAMPING RULE:** You must clamp only the **Live (Phase)** or **Neutral** wire inside the supply line. If you clamp the combined cable (containing both Hot/Live and Neutral together), the magnetic fields will be of equal value and opposite direction, canceling each other out. This results in the sensor reading exactly **0 Amps**.

---

## 2. Hardware Assembly Blueprint
Follow these step-by-step soldering/prototyping steps:

### Step 1: Construct the Resistor Divider
1. Connect a `10k Ohm` resistor from the ES32 **3.3V** pin to a vacant breadboard row (Label this **Bias Center**).
2. Connect a second `10k Ohm` resistor from the **Bias Center** row to the **GND** pin.
3. This creates a voltage divider pulling the idle bias voltage exactly to:
   $$\text{Bias Voltage} = \frac{3.3\text{V} \times 10\text{k}\Omega}{10\text{k}\Omega + 10\text{k}\Omega} = 1.65\text{V}$$

### Step 2: Decouple & Clean Waveforms
1. Connect the Positive leg of your `10uF Electrolytic Capacitor` directly to the **Bias Center** row.
2. Connect the Negative leg of the capacitor to **GND**.
3. This capacitor shunts any AC current variations or grid noise, keeping the 1.65V bias node perfectly stable.

### Step 3: Connect the SCT-013 TRS Audio Jack Interface
1. Slice or interface your SCT-013-050 audio jack connector. If splicing a typical 3.5mm headphone-style jack:
   - **Tip Pin** (SCT-013 Output): Connect through a `100k Ohm` safety series resistor to ESP32 **GPIO34**.
   - **Sleeve Pin** (SCT-013 Shared ground): Connect directly to the **Bias Center** row (NOT GND!).
   - **Ring Pin** (Not used / shield): Leave disconnected.
2. Connect a small `100nF Ceramic Capacitor` between **GPIO34** and **GND** to act as a high-frequency low-pass RF filter.

---

## 3. Microcontroller Node Wiring Definitions

```
                     +-------------------+
                     |       ESP32       |
                     |                   |
 3.3V Power Out ---- | 3.3V          SDA | ---- GPIO21 <---> [ OLED SDA ]
 GND Ground -------- | GND           SCL | ---- GPIO22 <---> [ OLED SCL ]
                     |                   |
 SCT-013 Sensor --   | GPIO34         D25 | ---- GPIO25 <---> [ 5V Safety Relay Close ]
                     | GPIO35         D26 | ---- GPIO26 <---> [ Alarm Buzzer Signal ]
                     |                D33 | ---- GPIO33 <---> [ Green Safe Status LED ]
                     |                D32 | ---- GPIO32 <---> [ Red Overload Warning LED ]
                     +-------------------+
```

- Ensure the relay module uses a proper 5V-to-3.3V logic level shifter, or uses an optoisolated pathway to protect the ESP32 pins from back-EMF feedback.
- Add flyback diodes across any inductive relays or alarm buzzers to prevent dynamic inductive spikes.
