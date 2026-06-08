/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Appliance {
  id: string;
  name: string;
  nominalPower: number; // in Watts
  typicalCurrent: number; // in Amps
  pf: number; // Power Factor (0 to 1)
  category: 'Heating' | 'Entertainment' | 'Laundry' | 'Cooling' | 'Baseload';
  isActive: boolean;
  description: string;
}

export interface EnergyMetric {
  timestamp: string;
  voltage: number;
  current: number;
  apparentPower: number; // VA
  realPower: number; // W
  powerFactor: number;
  cumulativeWh: number;
  cost: number;
  activeApplianceCount: number;
  isOverload: boolean;
}

export interface ProjectPhase {
  phase: string;
  title: string;
  objective: string;
  tasks: string[];
  expectedOutput: string;
  commonMistakes: string[];
}

export interface InterviewQnA {
  id: number;
  question: string;
  answer: string;
  concept: string;
}

export interface CircuitPin {
  pin: string;
  device: string;
  purpose: string;
}

export interface CodeTemplate {
  name: string;
  language: string;
  filename: string;
  description: string;
  code: string;
}
