import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, User, Calendar, Target, FileText } from "lucide-react";
import { usePersonalWorkouts, PersonalWorkout, WorkoutDay } from "@/hooks/usePersonalWorkouts";

interface PersonalWorkoutDetailsProps {
  workoutId: string;
  onBack: () => void;
}

export const PersonalWorkoutDetails = ({ workoutId, onBack }: PersonalWorkoutDetailsProps) => {
  const { workouts, deleteWorkout } = usePersonalWorkouts();
  const [workout, setWorkout] = useState<PersonalWorkout | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const foundWorkout = workouts.find(w => w.id === workoutId);
    setWorkout(foundWorkout || null);
  }, [workoutId, workouts]);

  if (!workout) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Treino não encontrado</h3>
          <Button onClick={onBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    const success = await deleteWorkout(workout.id);
    if (success) {
      onBack();
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

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner': return <Badge variant="secondary" className="bg-green-100 text-green-800">Iniciante</Badge>;
      case 'intermediate': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Intermediário</Badge>;
      case 'advanced': return <Badge variant="secondary" className="bg-red-100 text-red-800">Avançado</Badge>;
      default: return <Badge variant="secondary">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{workout.workout_name}</h1>
            <p className="text-gray-600">Treino personalizado</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Informações do Aluno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="font-medium">{workout.student_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{workout.student_email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Treino */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Informações do Treino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nível</p>
              <div className="mt-1">
                {getLevelBadge(workout.workout_plan.level)}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duração</p>
              <p className="font-medium">{workout.workout_plan.weeks.length} semanas</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Criado em</p>
              <p className="font-medium">{new Date(workout.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          
          {workout.workout_plan.goals && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Objetivos</p>
              <p className="text-gray-800">{workout.workout_plan.goals}</p>
            </div>
          )}
          
          {workout.notes && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Observações</p>
              <p className="text-gray-800">{workout.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plano Semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Plano de Treino
          </CardTitle>
          <CardDescription>
            Cronograma detalhado por semana
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {workout.workout_plan.weeks.map((week) => (
            <div key={week.week} className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-lg">Semana {week.week}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {week.days.map((day) => (
                  <Card key={day.day} className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Dia {day.day}</span>
                        <div className="flex flex-col gap-1">
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
                      
                      {day.type !== 'rest' && (
                        <div className="space-y-1 text-sm">
                          {day.duration && (
                            <p><span className="text-gray-600">Duração:</span> {day.duration} min</p>
                          )}
                          {day.distance && (
                            <p><span className="text-gray-600">Distância:</span> {day.distance} km</p>
                          )}
                          {day.pace && (
                            <p><span className="text-gray-600">Ritmo:</span> {day.pace}</p>
                          )}
                        </div>
                      )}
                      
                      {day.notes && (
                        <div className="text-sm">
                          <p className="text-gray-600">Observações:</p>
                          <p className="text-gray-800">{day.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600">Confirmar Exclusão</CardTitle>
              <CardDescription>
                Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                Excluir Treino
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};