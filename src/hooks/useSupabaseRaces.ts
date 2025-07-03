import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Race, RaceFormData, RaceStats } from '@/types/race';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useSupabaseRaces = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load races from Supabase
  const loadRaces = async () => {
    if (!user) {
      setRaces([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .eq('user_id', user.id)
        .order('race_date', { ascending: false });

      if (error) throw error;

      const formattedRaces: Race[] = data.map((race: any) => ({
        id: race.id,
        name: race.name,
        status: race.status as 'upcoming' | 'completed' | 'interest',
        raceDate: new Date(race.race_date),
        startTime: race.start_time,
        distance: parseFloat(race.distance.toString()),
        kitPickupAddress: race.kit_pickup_address,
        kitPickupDates: race.kit_pickup_dates === 'to-be-defined' 
          ? 'to-be-defined' 
          : Array.isArray(race.kit_pickup_dates) 
            ? race.kit_pickup_dates.map((pickup: any) => ({
                date: new Date(pickup.date),
                startTime: pickup.startTime,
                endTime: pickup.endTime,
              }))
            : [],
        registrationProof: race.registration_proof as Race['registrationProof'],
        observations: race.observations,
        raceResults: race.race_results as Race['raceResults'],
        createdAt: new Date(race.created_at),
        updatedAt: new Date(race.updated_at),
      }));

      setRaces(formattedRaces);
    } catch (error) {
      console.error('Error loading races:', error);
      toast({
        title: 'Erro ao carregar corridas',
        description: 'Não foi possível carregar suas corridas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRaces();
  }, [user]);

  const addRace = async (raceData: RaceFormData): Promise<Race | null> => {
    if (!user) return null;

    try {
      const raceToInsert = {
        user_id: user.id,
        name: raceData.name,
        status: raceData.status,
        race_date: raceData.raceDate,
        start_time: raceData.startTime,
        distance: raceData.distance, // Keep as number
        kit_pickup_address: raceData.kitPickupAddress,
        kit_pickup_dates: raceData.kitPickupDates === 'to-be-defined'
          ? 'to-be-defined'
          : raceData.kitPickupDates,
        registration_proof: raceData.registrationProofUrl ? {
          type: raceData.registrationProofType || 'link',
          url: raceData.registrationProofUrl,
        } : null,
        observations: raceData.observations,
        race_results: raceData.status === 'completed' && raceData.completionTime ? {
          completionTime: raceData.completionTime,
          overallPlacement: raceData.overallPlacement,
          ageGroupPlacement: raceData.ageGroupPlacement,
          shoesUsed: raceData.shoesUsed,
        } : null,
      };

      const { data, error } = await supabase
        .from('races')
        .insert(raceToInsert) // Remove array wrapper
        .select()
        .single();

      if (error) throw error;

      const newRace: Race = {
        id: data.id,
        name: data.name,
        status: data.status as 'upcoming' | 'completed' | 'interest',
        raceDate: new Date(data.race_date),
        startTime: data.start_time,
        distance: parseFloat(data.distance.toString()),
        kitPickupAddress: data.kit_pickup_address,
        kitPickupDates: data.kit_pickup_dates === 'to-be-defined' 
          ? 'to-be-defined' 
          : Array.isArray(data.kit_pickup_dates)
            ? data.kit_pickup_dates.map((pickup: any) => ({
                date: new Date(pickup.date),
                startTime: pickup.startTime,
                endTime: pickup.endTime,
              }))
            : [],
        registrationProof: data.registration_proof as Race['registrationProof'],
        observations: data.observations,
        raceResults: data.race_results as Race['raceResults'],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setRaces(prev => [newRace, ...prev]);
      
      toast({
        title: 'Corrida criada!',
        description: 'A corrida foi salva com sucesso.',
      });

      return newRace;
    } catch (error) {
      console.error('Error adding race:', error);
      toast({
        title: 'Erro ao criar corrida',
        description: 'Não foi possível salvar a corrida.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateRace = async (id: string, raceData: RaceFormData): Promise<Race | null> => {
    if (!user) return null;

    try {
      const raceToUpdate = {
        name: raceData.name,
        status: raceData.status,
        race_date: raceData.raceDate,
        start_time: raceData.startTime,
        distance: raceData.distance, // Keep as number
        kit_pickup_address: raceData.kitPickupAddress,
        kit_pickup_dates: raceData.kitPickupDates === 'to-be-defined'
          ? 'to-be-defined'
          : raceData.kitPickupDates,
        registration_proof: raceData.registrationProofUrl ? {
          type: raceData.registrationProofType || 'link',
          url: raceData.registrationProofUrl,
        } : null,
        observations: raceData.observations,
        race_results: raceData.status === 'completed' && raceData.completionTime ? {
          completionTime: raceData.completionTime,
          overallPlacement: raceData.overallPlacement,
          ageGroupPlacement: raceData.ageGroupPlacement,
          shoesUsed: raceData.shoesUsed,
        } : null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('races')
        .update(raceToUpdate)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedRace: Race = {
        id: data.id,
        name: data.name,
        status: data.status as 'upcoming' | 'completed' | 'interest',
        raceDate: new Date(data.race_date),
        startTime: data.start_time,
        distance: parseFloat(data.distance.toString()),
        kitPickupAddress: data.kit_pickup_address,
        kitPickupDates: data.kit_pickup_dates === 'to-be-defined' 
          ? 'to-be-defined' 
          : Array.isArray(data.kit_pickup_dates)
            ? data.kit_pickup_dates.map((pickup: any) => ({
                date: new Date(pickup.date),
                startTime: pickup.startTime,
                endTime: pickup.endTime,
              }))
            : [],
        registrationProof: data.registration_proof as Race['registrationProof'],
        observations: data.observations,
        raceResults: data.race_results as Race['raceResults'],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setRaces(prev => prev.map(race => race.id === id ? updatedRace : race));
      
      toast({
        title: 'Corrida atualizada!',
        description: 'As alterações foram salvas com sucesso.',
      });

      return updatedRace;
    } catch (error) {
      console.error('Error updating race:', error);
      toast({
        title: 'Erro ao atualizar corrida',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteRace = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('races')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setRaces(prev => prev.filter(race => race.id !== id));
      
      toast({
        title: 'Corrida excluída',
        description: 'A corrida foi removida com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Error deleting race:', error);
      toast({
        title: 'Erro ao excluir corrida',
        description: 'Não foi possível remover a corrida.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getRaceById = (id: string): Race | undefined => {
    return races.find(race => race.id === id);
  };

  const getStats = (): RaceStats => {
    const completedRaces = races.filter(race => race.status === 'completed');
    const upcomingRaces = races.filter(race => race.status === 'upcoming');
    const interestRaces = races.filter(race => race.status === 'interest');
    const totalKilometers = completedRaces.reduce((sum, race) => sum + race.distance, 0);
    
    const nextRace = upcomingRaces
      .sort((a, b) => a.raceDate.getTime() - b.raceDate.getTime())[0];

    return {
      totalRaces: races.length,
      completedRaces: completedRaces.length,
      upcomingRaces: upcomingRaces.length,
      interestRaces: interestRaces.length,
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
