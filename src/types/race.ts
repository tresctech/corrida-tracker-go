
export interface Race {
  id: string;
  name: string;
  status: 'upcoming' | 'completed' | 'interest';
  raceDate: Date;
  startTime: string;
  distance: number;
  kitPickupAddress: string;
  kitPickupDates: Array<{
    date: Date;
    startTime: string;
    endTime: string;
  }> | 'to-be-defined';
  registrationProof?: {
    type: 'file' | 'link';
    url: string;
    name?: string;
  };
  observations?: string;
  // Novos campos para corridas realizadas
  raceResults?: {
    completionTime: string; // formato HH:MM:SS
    overallPlacement?: number;
    ageGroupPlacement?: number;
    shoesUsed?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceFormData {
  name: string;
  status: 'upcoming' | 'completed' | 'interest';
  raceDate: string;
  startTime: string;
  distance: number;
  kitPickupAddress: string;
  kitPickupDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }> | 'to-be-defined';
  registrationProofUrl?: string;
  registrationProofType?: 'file' | 'link';
  observations?: string;
  // Novos campos para resultados
  completionTime?: string;
  overallPlacement?: number;
  ageGroupPlacement?: number;
  shoesUsed?: string;
}

export interface RaceStats {
  totalRaces: number;
  completedRaces: number;
  upcomingRaces: number;
  interestRaces: number;
  totalKilometers: number;
  nextRace?: Race;
}

export type ViewMode = 'list' | 'calendar';
export type FilterStatus = 'all' | 'upcoming' | 'completed' | 'interest';
export type SortOrder = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc';
