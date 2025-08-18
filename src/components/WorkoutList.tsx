import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, Route, Edit, Trash2, Search, Filter, Activity, Timer, Heart, Zap } from "lucide-react";
import { Workout } from "@/types/workout";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkoutListProps {
  workouts: Workout[];
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
  onViewDetails: (workout: Workout) => void;
}

type SortOrder = "date-desc" | "date-asc" | "distance-desc" | "distance-asc" | "name-asc" | "name-desc";
type FilterType = "all" | "running" | "walking" | "cycling" | "interval" | "tempo" | "long_run" | "recovery";

export const WorkoutList = ({ workouts, onEditWorkout, onDeleteWorkout, onViewDetails }: WorkoutListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc");

  // Filter and sort workouts
  const filteredAndSortedWorkouts = workouts
    .filter(workout => {
      const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workout.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workout.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || workout.workout_type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "date-desc":
          return b.date.getTime() - a.date.getTime();
        case "date-asc":
          return a.date.getTime() - b.date.getTime();
        case "distance-desc":
          return b.distance - a.distance;
        case "distance-asc":
          return a.distance - b.distance;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const formatPace = (workout: Workout) => {
    if (workout.pace_minutes && workout.pace_seconds !== undefined) {
      return `${workout.pace_minutes}:${workout.pace_seconds.toString().padStart(2, '0')}/km`;
    }
    return "--";
  };

  const formatTime = (minutes?: number, seconds?: number) => {
    if (!minutes) return "--";
    const totalMinutes = minutes + (seconds || 0) / 60;
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getWorkoutTypeLabel = (type: string) => {
    const types = {
      running: "🏃‍♂️ Corrida",
      walking: "🚶‍♂️ Caminhada",
      cycling: "🚴‍♂️ Ciclismo",
      interval: "⚡ Intervalado",
      tempo: "🎯 Tempo",
      long_run: "🏔️ Longa Distância",
      recovery: "🧘‍♂️ Recuperação"
    };
    return types[type as keyof typeof types] || type;
  };

  const getWorkoutTypeColor = (type: string) => {
    const colors = {
      running: "bg-running-primary/10 text-running-primary border-running-primary/20",
      walking: "bg-running-secondary/10 text-running-secondary border-running-secondary/20",
      cycling: "bg-running-accent/10 text-running-accent border-running-accent/20",
      interval: "bg-red-500/10 text-red-500 border-red-500/20",
      tempo: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      long_run: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      recovery: "bg-green-500/10 text-green-500 border-green-500/20"
    };
    return colors[type as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const WorkoutCard = ({ workout }: { workout: Workout }) => (
    <Card className="running-card hover:shadow-lg transition-all duration-300 animate-slide-in">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground">{workout.name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(workout.date, "dd/MM/yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {workout.start_time}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={getWorkoutTypeColor(workout.workout_type)}>
            {getWorkoutTypeLabel(workout.workout_type)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Route className="w-4 h-4" />
              Distância
            </div>
            <div className="text-lg font-bold text-running-primary">{workout.distance} km</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Timer className="w-4 h-4" />
              Tempo
            </div>
            <div className="text-lg font-bold text-running-secondary">
              {formatTime(workout.duration_minutes, workout.duration_seconds)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Activity className="w-4 h-4" />
              Pace
            </div>
            <div className="text-lg font-bold text-running-accent">{formatPace(workout)}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Heart className="w-4 h-4" />
              FC Média
            </div>
            <div className="text-lg font-bold text-red-500">
              {workout.heart_rate_avg ? `${workout.heart_rate_avg} bpm` : "--"}
            </div>
          </div>
        </div>

        {/* Additional info */}
        {(workout.route_name || workout.perceived_effort) && (
          <div className="bg-muted/50 p-3 rounded-lg border space-y-2">
            {workout.route_name && (
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{workout.route_name}</span>
              </div>
            )}
            {workout.perceived_effort && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  Esforço: {workout.perceived_effort}/10
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(workout)}
            className="flex-1"
          >
            Ver Detalhes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditWorkout(workout)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Treino</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir "{workout.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteWorkout(workout.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="running-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar treinos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="running">🏃‍♂️ Corrida</SelectItem>
                  <SelectItem value="walking">🚶‍♂️ Caminhada</SelectItem>
                  <SelectItem value="cycling">🚴‍♂️ Ciclismo</SelectItem>
                  <SelectItem value="interval">⚡ Intervalado</SelectItem>
                  <SelectItem value="tempo">🎯 Tempo</SelectItem>
                  <SelectItem value="long_run">🏔️ Longa Distância</SelectItem>
                  <SelectItem value="recovery">🧘‍♂️ Recuperação</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Data ↓</SelectItem>
                  <SelectItem value="date-asc">Data ↑</SelectItem>
                  <SelectItem value="distance-desc">Distância ↓</SelectItem>
                  <SelectItem value="distance-asc">Distância ↑</SelectItem>
                  <SelectItem value="name-asc">Nome A-Z</SelectItem>
                  <SelectItem value="name-desc">Nome Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workouts Grid */}
      {filteredAndSortedWorkouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedWorkouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      ) : (
        <Card className="running-card">
          <CardContent className="pt-6 text-center">
            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all" 
                ? "Nenhum treino encontrado com os filtros aplicados." 
                : "Nenhum treino encontrado."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};