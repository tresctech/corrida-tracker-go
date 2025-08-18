import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Route, Edit, X, Activity, Timer, Heart, Zap, Thermometer, Eye, Footprints, Mountain } from "lucide-react";
import { Workout } from "@/types/workout";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkoutDetailsProps {
  workout: Workout;
  onEdit: () => void;
  onClose: () => void;
}

export const WorkoutDetails = ({ workout, onEdit, onClose }: WorkoutDetailsProps) => {
  const formatPace = () => {
    if (workout.pace_minutes && workout.pace_seconds !== undefined) {
      return `${workout.pace_minutes}:${workout.pace_seconds.toString().padStart(2, '0')}/km`;
    }
    return "N/A";
  };

  const formatTime = () => {
    if (!workout.duration_minutes) return "N/A";
    const totalMinutes = workout.duration_minutes + (workout.duration_seconds || 0) / 60;
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

  const getEffortLabel = (effort: number) => {
    if (effort <= 3) return "Fácil 😌";
    if (effort <= 6) return "Moderado 😊";
    if (effort <= 8) return "Difícil 😅";
    return "Máximo 🔥";
  };

  return (
    <Card className="running-card max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-2xl text-foreground">{workout.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={getWorkoutTypeColor(workout.workout_type)}>
                {getWorkoutTypeLabel(workout.workout_type)}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Date and Time */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-foreground">📅 Informações do Treino</h3>
          <div className="bg-running-primary/10 p-4 rounded-lg space-y-2 border border-running-primary/20">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-running-primary" />
              <div>
                <p className="font-medium text-foreground">Data do Treino</p>
                <p className="text-muted-foreground">
                  {format(workout.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-running-primary" />
              <div>
                <p className="font-medium text-foreground">Horário de Início</p>
                <p className="text-muted-foreground">{workout.start_time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Performance Metrics */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-foreground">📊 Métricas de Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-running-primary/10 p-4 rounded-lg text-center border border-running-primary/20">
              <Route className="w-6 h-6 text-running-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Distância</p>
              <p className="text-2xl font-bold text-running-primary">{workout.distance} km</p>
            </div>

            <div className="bg-running-secondary/10 p-4 rounded-lg text-center border border-running-secondary/20">
              <Timer className="w-6 h-6 text-running-secondary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Tempo</p>
              <p className="text-2xl font-bold text-running-secondary">{formatTime()}</p>
            </div>

            <div className="bg-running-accent/10 p-4 rounded-lg text-center border border-running-accent/20">
              <Activity className="w-6 h-6 text-running-accent mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Pace Médio</p>
              <p className="text-2xl font-bold text-running-accent">{formatPace()}</p>
            </div>

            <div className="bg-red-500/10 p-4 rounded-lg text-center border border-red-500/20">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">FC Média</p>
              <p className="text-2xl font-bold text-red-500">
                {workout.heart_rate_avg ? `${workout.heart_rate_avg} bpm` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        {(workout.heart_rate_max || workout.calories || workout.elevation_gain) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-foreground">📈 Métricas Adicionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workout.heart_rate_max && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-foreground">FC Máxima</p>
                      <p className="text-red-500 font-bold">{workout.heart_rate_max} bpm</p>
                    </div>
                  </div>
                )}

                {workout.calories && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-foreground">Calorias</p>
                      <p className="text-orange-500 font-bold">{workout.calories} kcal</p>
                    </div>
                  </div>
                )}

                {workout.elevation_gain && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                    <Mountain className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-foreground">Elevação</p>
                      <p className="text-green-500 font-bold">{workout.elevation_gain}m</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Conditions and Route */}
        {(workout.route_name || workout.weather || workout.temperature || workout.perceived_effort) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-foreground">🌍 Condições e Percurso</h3>
              <div className="bg-running-secondary/10 p-4 rounded-lg border border-running-secondary/20 space-y-3">
                {workout.route_name && (
                  <div className="flex items-center gap-3">
                    <Route className="w-5 h-5 text-running-secondary" />
                    <div>
                      <p className="font-medium text-foreground">Percurso</p>
                      <p className="text-muted-foreground">{workout.route_name}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {workout.weather && (
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-running-secondary" />
                      <div>
                        <p className="font-medium text-foreground">Clima</p>
                        <p className="text-muted-foreground">{workout.weather}</p>
                      </div>
                    </div>
                  )}

                  {workout.temperature && (
                    <div className="flex items-center gap-3">
                      <Thermometer className="w-5 h-5 text-running-secondary" />
                      <div>
                        <p className="font-medium text-foreground">Temperatura</p>
                        <p className="text-muted-foreground">{workout.temperature}°C</p>
                      </div>
                    </div>
                  )}

                  {workout.perceived_effort && (
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-running-secondary" />
                      <div>
                        <p className="font-medium text-foreground">Esforço Percebido</p>
                        <p className="text-muted-foreground">
                          {workout.perceived_effort}/10 - {getEffortLabel(workout.perceived_effort)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Equipment */}
        {workout.shoes_used && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-foreground">👟 Equipamento</h3>
              <div className="bg-muted/50 p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Footprints className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Tênis Usado</p>
                    <p className="text-muted-foreground">{workout.shoes_used}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        {workout.notes && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-foreground">📝 Observações</h3>
              <div className="bg-running-accent/10 p-4 rounded-lg border border-running-accent/20">
                <p className="text-foreground whitespace-pre-wrap">{workout.notes}</p>
              </div>
            </div>
          </>
        )}

        <Separator />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Criado em: {format(workout.created_at, "dd/MM/yyyy 'às' HH:mm")}</p>
          {workout.updated_at.getTime() !== workout.created_at.getTime() && (
            <p>Última atualização: {format(workout.updated_at, "dd/MM/yyyy 'às' HH:mm")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};