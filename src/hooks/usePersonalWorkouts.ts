import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PersonalWorkout {
  id: string;
  trainer_id: string;
  student_email: string;
  student_name: string;
  workout_name: string;
  workout_plan: WorkoutPlan;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlan {
  weeks: WorkoutWeek[];
  goals: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
}

export interface WorkoutWeek {
  week: number;
  days: WorkoutDay[];
}

export interface WorkoutDay {
  day: number;
  type: 'run' | 'rest' | 'cross-training';
  duration?: number; // em minutos
  distance?: number; // em km
  pace?: string; // ex: "5:30/km"
  intensity: 'easy' | 'moderate' | 'hard';
  notes?: string;
}

export const usePersonalWorkouts = () => {
  const [workouts, setWorkouts] = useState<PersonalWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadWorkouts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('personal_workouts')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading workouts:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar treinos",
          variant: "destructive",
        });
      } else {
        setWorkouts((data || []) as unknown as PersonalWorkout[]);
      }
    } catch (error) {
      console.error('Exception loading workouts:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar treinos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkout = async (workoutData: Omit<PersonalWorkout, 'id' | 'trainer_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('personal_workouts')
        .insert({
          ...workoutData,
          trainer_id: user.id,
          workout_plan: workoutData.workout_plan as any,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating workout:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar treino",
          variant: "destructive",
        });
        return null;
      } else {
        toast({
          title: "Sucesso",
          description: "Treino criado com sucesso!",
        });
        await loadWorkouts();
        return data;
      }
    } catch (error) {
      console.error('Exception creating workout:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar treino",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateWorkout = async (id: string, workoutData: Partial<PersonalWorkout>) => {
    try {
      const { data, error } = await supabase
        .from('personal_workouts')
        .update({
          ...workoutData,
          workout_plan: workoutData.workout_plan ? workoutData.workout_plan as any : undefined,
        })
        .eq('id', id)
        .eq('trainer_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating workout:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar treino",
          variant: "destructive",
        });
        return null;
      } else {
        toast({
          title: "Sucesso",
          description: "Treino atualizado com sucesso!",
        });
        await loadWorkouts();
        return data;
      }
    } catch (error) {
      console.error('Exception updating workout:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar treino",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      const { error } = await supabase
        .from('personal_workouts')
        .delete()
        .eq('id', id)
        .eq('trainer_id', user?.id);

      if (error) {
        console.error('Error deleting workout:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar treino",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Sucesso",
          description: "Treino deletado com sucesso!",
        });
        await loadWorkouts();
        return true;
      }
    } catch (error) {
      console.error('Exception deleting workout:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar treino",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [user]);

  return {
    workouts,
    loading,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    refreshWorkouts: loadWorkouts,
  };
};