export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  gender: 'male' | 'female';
  birthDate?: string;
  adoptionDate?: string;
  microchip?: string;
  rga?: string;
  photo?: string; // Base64 or ObjectURL string for high-reliability offline caching
}

export interface Dose {
  id: string;
  number: number;
  scheduledTime: string; // ISO string
  taken: boolean;
  takenAt?: string;
}

export interface MedicationSchedule {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  startDate: string;
  frequencyHours: number;
  durationDays: number;
  notes?: string;
  doses: Dose[];
}

export interface Vaccine {
  id: string;
  petId: string;
  name: string;
  batch?: string;
  appliedDate: string | null; // null if pending booster
  boosterDate: string; // Target date for booster/application
  veterinarian?: string;
  notes?: string;
  status: 'applied' | 'pending';
}

export interface Measurement {
  id: string;
  petId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  weight: number; // in kg
  height: number; // in cm
  notes?: string;
}

export interface ClinicalLog {
  id: string;
  petId: string;
  type: 'consultation' | 'surgery' | 'hospitalization' | 'allergy' | 'behavior';
  date: string;
  title: string;
  notes: string;
  diagnostics?: string;
}

export interface ReproCycle {
  id: string;
  petId: string;
  date: string;
  event: 'cio' | 'insemination' | 'cross';
  notes?: string;
}

export interface RoutineActivity {
  id: string;
  petId: string;
  title: string;
  lastDone: string;
  frequencyDays: number;
  notes?: string;
  category: 'cleaning' | 'litter' | 'food';
}
