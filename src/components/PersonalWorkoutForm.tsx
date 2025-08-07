import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Play, Users } from "lucide-react";
import { usePersonalWorkouts, WorkoutDay, WorkoutWeek, WorkoutPlan } from "@/hooks/usePersonalWorkouts";

interface PersonalWorkoutFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const PersonalWorkoutForm = ({ onBack, onSuccess }: PersonalWorkoutFormProps) => {
  const { createWorkout } = usePersonalWorkouts();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [goals, setGoals] = useState("");
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [notes, setNotes] = useState("");
  const [weeks, setWeeks] = useState<WorkoutWeek[]>([
    {
      week: 1,
      days: [
        { day: 1, type: 'run', duration: 30, distance: 3, intensity: 'easy' },
        { day: 2, type: 'rest', intensity: 'easy' },
        { day: 3, type: 'run', duration: 25, distance: 2.5, intensity: 'moderate' },
        { day: 4, type: 'rest', intensity: 'easy' },
        { day: 5, type: 'run', duration: 35, distance: 4, intensity: 'easy' },
        { day: 6, type: 'cross-training', duration: 45, intensity: 'moderate' },
        { day: 7, type: 'rest', intensity: 'easy' },
      ]
    }
  ]);

  const addWeek = () => {
    const newWeek: WorkoutWeek = {
      week: weeks.length + 1,
      days: [
        { day: 1, type: 'run', duration: 30, distance: 3, intensity: 'easy' },
        { day: 2, type: 'rest', intensity: 'easy' },
        { day: 3, type: 'run', duration: 25, distance: 2.5, intensity: 'moderate' },
        { day: 4, type: 'rest', intensity: 'easy' },
        { day: 5, type: 'run', duration: 35, distance: 4, intensity: 'easy' },
        { day: 6, type: 'cross-training', duration: 45, intensity: 'moderate' },
        { day: 7, type: 'rest', intensity: 'easy' },
      ]
    };
    setWeeks([...weeks, newWeek]);
  };

  const removeWeek = (weekIndex: number) => {
    const updatedWeeks = weeks.filter((_, index) => index !== weekIndex)
      .map((week, index) => ({ ...week, week: index + 1 }));
    setWeeks(updatedWeeks);
  };

  const updateDay = (weekIndex: number, dayIndex: number, updates: Partial<WorkoutDay>) => {
    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].days[dayIndex] = {
      ...updatedWeeks[weekIndex].days[dayIndex],
      ...updates
    };
    setWeeks(updatedWeeks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail || !workoutName) return;

    setLoading(true);
    
    const workoutPlan: WorkoutPlan = {
      weeks,
      goals,
      level,
      notes
    };

    const result = await createWorkout({
      student_name: studentName,
      student_email: studentEmail,
      workout_name: workoutName,
      workout_plan: workoutPlan,
      notes
    });

    setLoading(false);
    
    if (result) {
      onSuccess();
    }
  };

  const getDayTypeColor = (type: WorkoutDay['type']) => {
    switch (type) {
      case 'run': return 'bg-blue-100 text-blue-800';
      case 'rest': return 'bg-gray-100 text-gray-800';
      case 'cross-training': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntensityColor = (intensity: WorkoutDay['intensity']) => {
    switch (intensity) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Criar Treino Personalizado</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações do Aluno */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Informações do Aluno
            </CardTitle>
            <CardDescription>
              Dados básicos do estudante que receberá o treino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Nome do Aluno *</Label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentEmail">Email do Aluno *</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="Ex: joao@email.com"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Treino */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Treino</CardTitle>
            <CardDescription>
              Configure os detalhes gerais do plano de treino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workoutName">Nome do Treino *</Label>
              <Input
                id="workoutName"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Ex: Preparação para 5K"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Nível do Aluno</Label>
                <Select value={level} onValueChange={(value: any) => setLevel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Objetivos do Treino</Label>
              <Textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Ex: Completar uma corrida de 5K em 8 semanas"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações Gerais</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Aluno tem histórico de lesão no joelho direito"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Plano Semanal */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Plano Semanal</CardTitle>
                <CardDescription>
                  Configure os treinos para cada semana
                </CardDescription>
              </div>
              <Button type="button" onClick={addWeek} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Semana
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {weeks.map((week, weekIndex) => (
              <div key={week.week} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Semana {week.week}</h3>
                  {weeks.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeWeek(weekIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {week.days.map((day, dayIndex) => (
                    <div key={day.day} className="border rounded p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Dia {day.day}</span>
                        <div className="flex gap-1">
                          <Badge className={getDayTypeColor(day.type)} variant="secondary">
                            {day.type === 'run' ? 'Corrida' : 
                             day.type === 'rest' ? 'Descanso' : 'Cross-training'}
                          </Badge>
                          <Badge className={getIntensityColor(day.intensity)} variant="secondary">
                            {day.intensity === 'easy' ? 'Leve' :
                             day.intensity === 'moderate' ? 'Moderado' : 'Intenso'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Select 
                          value={day.type} 
                          onValueChange={(value: any) => updateDay(weekIndex, dayIndex, { type: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="run">Corrida</SelectItem>
                            <SelectItem value="rest">Descanso</SelectItem>
                            <SelectItem value="cross-training">Cross-training</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select 
                          value={day.intensity} 
                          onValueChange={(value: any) => updateDay(weekIndex, dayIndex, { intensity: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Leve</SelectItem>
                            <SelectItem value="moderate">Moderado</SelectItem>
                            <SelectItem value="hard">Intenso</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {day.type !== 'rest' && (
                          <>
                            <Input
                              type="number"
                              placeholder="Duração (min)"
                              value={day.duration || ''}
                              onChange={(e) => updateDay(weekIndex, dayIndex, { duration: parseInt(e.target.value) || undefined })}
                              className="h-8"
                            />
                            {day.type === 'run' && (
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="Distância (km)"
                                value={day.distance || ''}
                                onChange={(e) => updateDay(weekIndex, dayIndex, { distance: parseFloat(e.target.value) || undefined })}
                                className="h-8"
                              />
                            )}
                          </>
                        )}
                        
                        <Input
                          placeholder="Observações"
                          value={day.notes || ''}
                          onChange={(e) => updateDay(weekIndex, dayIndex, { notes: e.target.value })}
                          className="h-8"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              "Criando..."
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Criar Treino
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};