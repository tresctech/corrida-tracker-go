
import { useState, useEffect } from 'react';
import { Race, RaceFormData, RaceStats } from '@/types/race';

const STORAGE_KEY = 'runtracker-races';

export const useRaces = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);

  // Load races from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedRaces = JSON.parse(stored).map((race: any) => ({
          ...race,
          raceDate: new Date(race.raceDate),
          kitPickupDates: race.kitPickupDates === 'to-be-defined' 
            ? 'to-be-defined' 
            : race.kitPickupDates?.map((pickup: any) => ({
                date: new Date(pickup.date),
                time: pickup.time,
              })) || [],
          createdAt: new Date(race.createdAt),
          updatedAt: new Date(race.updatedAt),
        }));
        setRaces(parsedRaces);
      }
    } catch (error) {
      console.error('Error loading races:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save races to localStorage
  const saveRaces = (newRaces: Race[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRaces));
      setRaces(newRaces);
    } catch (error) {
      console.error('Error saving races:', error);
    }
  };

  const addRace = (raceData: RaceFormData): Race => {
    const newRace: Race = {
      id: Date.now().toString(),
      name: raceData.name,
      status: raceData.status,
      raceDate: new Date(raceData.raceDate),
      startTime: raceData.startTime,
      distance: raceData.distance,
      kitPickupAddress: raceData.kitPickupAddress,
      kitPickupDates: raceData.kitPickupDates === 'to-be-defined'
        ? 'to-be-defined'
        : raceData.kitPickupDates.map(pickup => ({
            date: new Date(pickup.date),
            time: pickup.time,
          })),
      registrationProof: raceData.registrationProofUrl ? {
        type: raceData.registrationProofType || 'link',
        url: raceData.registrationProofUrl,
      } : undefined,
      observations: raceData.observations,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedRaces = [...races, newRace];
    saveRaces(updatedRaces);
    return newRace;
  };

  const updateRace = (id: string, raceData: RaceFormData): Race | null => {
    const raceIndex = races.findIndex(race => race.id === id);
    if (raceIndex === -1) return null;

    const updatedRace: Race = {
      ...races[raceIndex],
      name: raceData.name,
      status: raceData.status,
      raceDate: new Date(raceData.raceDate),
      startTime: raceData.startTime,
      distance: raceData.distance,
      kitPickupAddress: raceData.kitPickupAddress,
      kitPickupDates: raceData.kitPickupDates === 'to-be-defined'
        ? 'to-be-defined'
        : raceData.kitPickupDates.map(pickup => ({
            date: new Date(pickup.date),
            time: pickup.time,
          })),
      registrationProof: raceData.registrationProofUrl ? {
        type: raceData.registrationProofType || 'link',
        url: raceData.registrationProofUrl,
      } : undefined,
      observations: raceData.observations,
      updatedAt: new Date(),
    };

    const updatedRaces = [...races];
    updatedRaces[raceIndex] = updatedRace;
    saveRaces(updatedRaces);
    return updatedRace;
  };

  const deleteRace = (id: string): boolean => {
    const updatedRaces = races.filter(race => race.id !== id);
    saveRaces(updatedRaces);
    return true;
  };

  const getRaceById = (id: string): Race | undefined => {
    return races.find(race => race.id === id);
  };

  const getStats = (): RaceStats => {
    const completedRaces = races.filter(race => race.status === 'completed');
    const upcomingRaces = races.filter(race => race.status === 'upcoming');
    const totalKilometers = completedRaces.reduce((sum, race) => sum + race.distance, 0);
    
    const nextRace = upcomingRaces
      .sort((a, b) => a.raceDate.getTime() - b.raceDate.getTime())[0];

    return {
      totalRaces: races.length,
      completedRaces: completedRaces.length,
      upcomingRaces: upcomingRaces.length,
      totalKilometers,
      nextRace,
    };
  };

  return {
    races,
    loading,
    addRace,
    updateRace,
    deleteRace,
    getRaceById,
    getStats,
  };
};
