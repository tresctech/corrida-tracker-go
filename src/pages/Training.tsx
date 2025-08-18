import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Activity, Timer, Route, Trophy } from "lucide-react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { Workout, WorkoutFormData } from "@/types/workout";
import { RunningCard } from "@/components/ui/running-card";
import { WorkoutForm } from "@/components/WorkoutForm";
import { WorkoutList } from "@/components/WorkoutList";
import { WorkoutDetails } from "@/components/WorkoutDetails";

type View = "dashboard" | "form" | "list" | "details";

interface TrainingProps {
  onBack: () => void;
}

export const Training = ({ onBack }: TrainingProps) => {
  const { workouts, loading, addWorkout, updateWorkout, deleteWorkout, getStats } = useWorkouts();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | undefined>();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-running-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seus treinos...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

  const handleAddWorkout = () => {
    setSelectedWorkout(undefined);
    setCurrentView("form");
  };

  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentView("form");
  };

  const handleViewDetails = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentView("details");
  };

  const handleFormSubmit = async (data: WorkoutFormData) => {
    if (selectedWorkout) {
      await updateWorkout(selectedWorkout.id, data);
    } else {
      await addWorkout(data);
    }
    setCurrentView("dashboard");
    setSelectedWorkout(undefined);
  };

  const handleDeleteWorkout = async (id: string) => {
    await deleteWorkout(id);
  };

  const handleBack = () => {
    if (currentView === "details" || currentView === "form") {
      setCurrentView("dashboard");
    } else {
      onBack();
    }
    setSelectedWorkout(undefined);
  };

  const formatPace = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}/km`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const renderNavigation = () => (
    <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:justify-between sm:items-center">
      <div className="flex items-center gap-4 sm:gap-6">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="mobile-button secondary-gradient text-white border-0 flex items-center gap-2 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          ⬅️ Voltar
        </Button>
        
        <h1 className="text-xl font-bold bg-gradient-to-r from-running-primary to-running-secondary bg-clip-text text-transparent">
          🏃‍♂️ Treinos
        </h1>
      </div>
      
      <div className="flex items-center gap-3 flex-wrap">
        {currentView === "dashboard" && (
          <Button 
            variant="outline" 
            onClick={() => setCurrentView("list")}
            className="mobile-button secondary-gradient text-white border-0 hover:scale-105"
          >
            📊 Ver Treinos
          </Button>
        )}
        
        {(currentView === "list" || currentView === "details" || currentView === "dashboard") && (
          <Button 
            onClick={handleAddWorkout}
            className="mobile-button running-gradient text-white border-0 racing-stripe"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">🏃‍♂️ Novo Treino</span>
            <span className="sm:hidden">🏃‍♂️ Novo</span>
          </Button>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "form":
        return (
          <WorkoutForm
            workout={selectedWorkout}
            onSubmit={handleFormSubmit}
            onCancel={handleBack}
          />
        );
      
      case "list":
        return (
          <WorkoutList
            workouts={workouts}
            onEditWorkout={handleEditWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onViewDetails={handleViewDetails}
          />
        );
      
      case "details":
        return selectedWorkout ? (
          <WorkoutDetails
            workout={selectedWorkout}
            onEdit={() => handleEditWorkout(selectedWorkout)}
            onClose={handleBack}
          />
        ) : null;

      default:
        return (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <RunningCard variant="glow" className="hover:scale-105 transition-all duration-300">
                <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <h3 className="text-sm font-semibold text-foreground">🏃‍♂️ Total de Treinos</h3>
                  <div className="p-2 rounded-lg bg-running-primary/20">
                    <Activity className="h-5 w-5 text-running-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-running-primary">
                  {stats.totalWorkouts}
                </div>
                <p className="text-xs text-muted-foreground mt-1">treinos realizados</p>
              </RunningCard>

              <RunningCard variant="glow" className="hover:scale-105 transition-all duration-300">
                <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <h3 className="text-sm font-semibold text-foreground">📏 Distância Total</h3>
                  <div className="p-2 rounded-lg bg-running-secondary/20">
                    <Route className="h-5 w-5 text-running-secondary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-running-secondary">
                  {stats.totalDistance.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">quilômetros</p>
              </RunningCard>

              <RunningCard variant="glow" className="hover:scale-105 transition-all duration-300">
                <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <h3 className="text-sm font-semibold text-foreground">⏱️ Tempo Total</h3>
                  <div className="p-2 rounded-lg bg-running-accent/20">
                    <Timer className="h-5 w-5 text-running-accent" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-running-accent">
                  {formatTime(stats.totalTime)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">de atividade</p>
              </RunningCard>

              <RunningCard variant="glow" className="hover:scale-105 transition-all duration-300">
                <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <h3 className="text-sm font-semibold text-foreground">🏆 Pace Médio</h3>
                  <div className="p-2 rounded-lg bg-running-primary/20">
                    <Trophy className="h-5 w-5 text-running-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-running-primary">
                  {stats.averagePace > 0 ? formatPace(stats.averagePace) : "--"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">ritmo médio</p>
              </RunningCard>
            </div>

            {/* Weekly and Monthly Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RunningCard variant="premium" className="hover:scale-105 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-4">📅 Esta Semana</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  {stats.thisWeekDistance.toFixed(1)} km
                </div>
                <p className="text-white/80">Distância percorrida</p>
              </RunningCard>

              <RunningCard variant="premium" className="hover:scale-105 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-4">📊 Este Mês</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  {stats.thisMonthDistance.toFixed(1)} km
                </div>
                <p className="text-white/80">Meta mensal</p>
              </RunningCard>
            </div>

            {/* Recent Workouts */}
            {workouts.length > 0 && (
              <RunningCard>
                <h3 className="text-lg font-bold text-foreground mb-4">🔥 Treinos Recentes</h3>
                <div className="space-y-3">
                  {workouts.slice(0, 3).map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(workout)}
                    >
                      <div>
                        <p className="font-medium text-foreground">{workout.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {workout.distance}km • {workout.date.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-running-primary">
                          {workout.workout_type.replace('_', ' ').charAt(0).toUpperCase() + workout.workout_type.slice(1)}
                        </p>
                        {workout.duration_minutes && (
                          <p className="text-xs text-muted-foreground">
                            {formatTime(workout.duration_minutes)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {workouts.length > 3 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView("list")}
                    className="w-full mt-4"
                  >
                    Ver todos os treinos
                  </Button>
                )}
              </RunningCard>
            )}

            {workouts.length === 0 && (
              <RunningCard className="text-center">
                <div className="py-8">
                  <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum treino registrado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Comece a registrar seus treinos e acompanhe seu progresso!
                  </p>
                  <Button onClick={handleAddWorkout} className="running-gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Treino
                  </Button>
                </div>
              </RunningCard>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderNavigation()}
      {renderContent()}
    </div>
  );
};