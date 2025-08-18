import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Workout, WorkoutFormData } from "@/types/workout";

interface WorkoutFormProps {
  workout?: Workout;
  onSubmit: (data: WorkoutFormData) => void;
  onCancel: () => void;
}

export const WorkoutForm = ({ workout, onSubmit, onCancel }: WorkoutFormProps) => {
  const [formData, setFormData] = useState<WorkoutFormData>({
    name: workout?.name || "",
    date: workout?.date || new Date(),
    start_time: workout?.start_time || "06:00",
    distance: workout?.distance || 0,
    duration_minutes: workout?.duration_minutes || undefined,
    duration_seconds: workout?.duration_seconds || 0,
    calories: workout?.calories || undefined,
    heart_rate_avg: workout?.heart_rate_avg || undefined,
    heart_rate_max: workout?.heart_rate_max || undefined,
    elevation_gain: workout?.elevation_gain || undefined,
    workout_type: workout?.workout_type || "running",
    perceived_effort: workout?.perceived_effort || undefined,
    weather: workout?.weather || "",
    temperature: workout?.temperature || undefined,
    route_name: workout?.route_name || "",
    notes: workout?.notes || "",
    shoes_used: workout?.shoes_used || ""
  });

  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof WorkoutFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const workoutTypes = [
    { value: "running", label: "🏃‍♂️ Corrida" },
    { value: "walking", label: "🚶‍♂️ Caminhada" },
    { value: "cycling", label: "🚴‍♂️ Ciclismo" },
    { value: "interval", label: "⚡ Intervalado" },
    { value: "tempo", label: "🎯 Tempo" },
    { value: "long_run", label: "🏔️ Longa Distância" },
    { value: "recovery", label: "🧘‍♂️ Recuperação" }
  ];

  return (
    <Card className="running-card max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-running-primary">
          {workout ? "✏️ Editar Treino" : "🏃‍♂️ Novo Treino"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Treino</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Corrida matinal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workout_type">Tipo de Treino</Label>
              <Select
                value={formData.workout_type}
                onValueChange={(value) => handleInputChange("workout_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Data do Treino</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      handleInputChange("date", date || new Date());
                      setShowCalendar(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Horário de Início</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange("start_time", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Distance and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="distance">Distância (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                min="0"
                value={formData.distance}
                onChange={(e) => handleInputChange("distance", parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duração (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="0"
                value={formData.duration_minutes || ""}
                onChange={(e) => handleInputChange("duration_minutes", parseInt(e.target.value) || undefined)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_seconds">Segundos extras</Label>
              <Input
                id="duration_seconds"
                type="number"
                min="0"
                max="59"
                value={formData.duration_seconds || ""}
                onChange={(e) => handleInputChange("duration_seconds", parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="calories">Calorias</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={formData.calories || ""}
                onChange={(e) => handleInputChange("calories", parseInt(e.target.value) || undefined)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heart_rate_avg">FC Média</Label>
              <Input
                id="heart_rate_avg"
                type="number"
                min="0"
                max="220"
                value={formData.heart_rate_avg || ""}
                onChange={(e) => handleInputChange("heart_rate_avg", parseInt(e.target.value) || undefined)}
                placeholder="bpm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heart_rate_max">FC Máxima</Label>
              <Input
                id="heart_rate_max"
                type="number"
                min="0"
                max="220"
                value={formData.heart_rate_max || ""}
                onChange={(e) => handleInputChange("heart_rate_max", parseInt(e.target.value) || undefined)}
                placeholder="bpm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevation_gain">Elevação (m)</Label>
              <Input
                id="elevation_gain"
                type="number"
                min="0"
                step="0.1"
                value={formData.elevation_gain || ""}
                onChange={(e) => handleInputChange("elevation_gain", parseFloat(e.target.value) || undefined)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="perceived_effort">Esforço Percebido (1-10)</Label>
              <Select
                value={formData.perceived_effort?.toString() || ""}
                onValueChange={(value) => handleInputChange("perceived_effort", parseInt(value) || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level} - {level <= 3 ? "Fácil" : level <= 6 ? "Moderado" : level <= 8 ? "Difícil" : "Máximo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weather">Clima</Label>
              <Input
                id="weather"
                value={formData.weather || ""}
                onChange={(e) => handleInputChange("weather", e.target.value)}
                placeholder="Ex: Ensolarado, Nublado..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura (°C)</Label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature || ""}
                onChange={(e) => handleInputChange("temperature", parseFloat(e.target.value) || undefined)}
                placeholder="25"
              />
            </div>
          </div>

          {/* Route and Equipment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="route_name">Nome da Rota</Label>
              <Input
                id="route_name"
                value={formData.route_name || ""}
                onChange={(e) => handleInputChange("route_name", e.target.value)}
                placeholder="Ex: Parque Ibirapuera"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shoes_used">Tênis Usado</Label>
              <Input
                id="shoes_used"
                value={formData.shoes_used || ""}
                onChange={(e) => handleInputChange("shoes_used", e.target.value)}
                placeholder="Ex: Nike Air Zoom"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Como foi o treino? Como se sentiu?"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              className="flex-1 running-gradient text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {workout ? "Atualizar Treino" : "Salvar Treino"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};