
export interface Race {
  id: string;
  name: string;
  status: 'upcoming' | 'completed';
  raceDate: Date;
  startTime: string;
  distance: number;
  kitPickupAddress: string;
  kitPickupDates: Array<{
    date: Date;
    time: string;
  }> | 'to-be-defined';
  registrationProof?: {
    type: 'file' | 'link';
    url: string;
    name?: string;
  };
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceFormData {
  name: string;
  status: 'upcoming' | 'completed';
  raceDate: string;
  startTime: string;
  distance: number;
  kitPickupAddress: string;
  kitPickupDates: Array<{
    date: string;
    time: string;
  }> | 'to-be-defined';
  registrationProofUrl?: string;
  registrationProofType?: 'file' | 'link';
  observations?: string;
}

export interface RaceStats {
  totalRaces: number;
  completedRaces: number;
  upcomingRaces: number;
  totalKilometers: number;
  nextRace?: Race;
}

export type ViewMode = 'list' | 'calendar';
export type FilterStatus = 'all' | 'upcoming' | 'completed';
export type SortOrder = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc';
