import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workout, WorkoutFormData, WorkoutStats } from '@/types/workout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchWorkouts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedWorkouts: Workout[] = data.map(workout => ({
        ...workout,
        date: new Date(workout.date),
        created_at: new Date(workout.created_at),
        updated_at: new Date(workout.updated_at),
        workout_type: workout.workout_type as Workout['workout_type']
      }));

      setWorkouts(formattedWorkouts);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar treinos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async (workoutData: WorkoutFormData) => {
    if (!user) return;

    try {
      // Calculate pace if duration and distance are provided
      let pace_minutes, pace_seconds;
      if (workoutData.duration_minutes && workoutData.distance > 0) {
        const totalMinutes = workoutData.duration_minutes + (workoutData.duration_seconds || 0) / 60;
        const pacePerKm = totalMinutes / workoutData.distance;
        pace_minutes = Math.floor(pacePerKm);
        pace_seconds = Math.round((pacePerKm - pace_minutes) * 60);
      }

      const { data, error } = await supabase
        .from('workouts')
        .insert([{
          ...workoutData,
          date: workoutData.date.toISOString().split('T')[0],
          user_id: user.id,
          pace_minutes,
          pace_seconds
        }])
        .select()
        .single();

      if (error) throw error;

      const newWorkout: Workout = {
        ...data,
        date: new Date(data.date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        workout_type: data.workout_type as Workout['workout_type']
      };

      setWorkouts(prev => [newWorkout, ...prev]);
      
      toast({
        title: "Treino adicionado!",
        description: `Treino "${workoutData.name}" foi criado com sucesso.`
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar treino",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateWorkout = async (id: string, workoutData: WorkoutFormData) => {
    try {
      // Calculate pace if duration and distance are provided
      let pace_minutes, pace_seconds;
      if (workoutData.duration_minutes && workoutData.distance > 0) {
        const totalMinutes = workoutData.duration_minutes + (workoutData.duration_seconds || 0) / 60;
        const pacePerKm = totalMinutes / workoutData.distance;
        pace_minutes = Math.floor(pacePerKm);
        pace_seconds = Math.round((pacePerKm - pace_minutes) * 60);
      }

      const { data, error } = await supabase
        .from('workouts')
        .update({
          ...workoutData,
          date: workoutData.date.toISOString().split('T')[0],
          pace_minutes,
          pace_seconds
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedWorkout: Workout = {
        ...data,
        date: new Date(data.date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        workout_type: data.workout_type as Workout['workout_type']
      };

      setWorkouts(prev => prev.map(workout => 
        workout.id === id ? updatedWorkout : workout
      ));

      toast({
        title: "Treino atualizado!",
        description: `Treino "${workoutData.name}" foi atualizado com sucesso.`
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar treino",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkouts(prev => prev.filter(workout => workout.id !== id));
      
      toast({
        title: "Treino excluído!",
        description: "Treino foi removido com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir treino",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStats = (): WorkoutStats => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
    const totalTime = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

    const thisWeekWorkouts = workouts.filter(w => w.date >= startOfWeek);
    const thisWeekDistance = thisWeekWorkouts.reduce((sum, w) => sum + w.distance, 0);

    const thisMonthWorkouts = workouts.filter(w => w.date >= startOfMonth);
    const thisMonthDistance = thisMonthWorkouts.reduce((sum, w) => sum + w.distance, 0);

    const longestRun = Math.max(...workouts.map(w => w.distance), 0);

    // Calculate average pace (in seconds per km)
    const workoutsWithPace = workouts.filter(w => w.pace_minutes && w.pace_seconds);
    const averagePace = workoutsWithPace.length > 0
      ? workoutsWithPace.reduce((sum, w) => sum + (w.pace_minutes! * 60 + w.pace_seconds!), 0) / workoutsWithPace.length
      : 0;

    // Calculate average heart rate
    const workoutsWithHR = workouts.filter(w => w.heart_rate_avg);
    const averageHeartRate = workoutsWithHR.length > 0
      ? workoutsWithHR.reduce((sum, w) => sum + w.heart_rate_avg!, 0) / workoutsWithHR.length
      : undefined;

    return {
      totalWorkouts: workouts.length,
      totalDistance,
      totalTime,
      averagePace,
      thisWeekDistance,
      thisMonthDistance,
      longestRun,
      averageHeartRate,
      totalCalories
    };
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  return {
    workouts,
    loading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getStats,
    refetch: fetchWorkouts
  };
};