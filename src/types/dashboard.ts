
import { Race } from "./race";

export interface DashboardProps {
  stats: {
    totalRaces: number;
    completedRaces: number;
    upcomingRaces: number;
    interestRaces: number;
    totalKilometers: number;
    nextRace?: Race;
  };
  onAddRace: () => void;
}
