import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Calendar, ArrowLeft, Crown } from "lucide-react";
import { usePersonalWorkouts } from "@/hooks/usePersonalWorkouts";
import { useSubscription } from "@/hooks/useSubscription";
import { PersonalWorkoutForm } from "./PersonalWorkoutForm";
import { PersonalWorkoutDetails } from "./PersonalWorkoutDetails";

interface PersonalTrainerProps {
  onBack: () => void;
}

export const PersonalTrainer = ({ onBack }: PersonalTrainerProps) => {
  const [currentView, setCurrentView] = useState<"list" | "form" | "details">("list");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  
  const { workouts, loading: workoutsLoading } = usePersonalWorkouts();
  const { subscribed, loading: subscriptionLoading, createCheckout, manageSubscription } = useSubscription();

  // Show premium upgrade prompt if not subscribed
  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscribed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Personal Trainer</h1>
        </div>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-amber-800">Área Premium</CardTitle>
            <CardDescription className="text-amber-700">
              Esta funcionalidade é exclusiva para assinantes Premium
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Com o plano Premium você pode:</h3>
              <ul className="text-left space-y-2 max-w-md mx-auto">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Criar treinos personalizados para seus alunos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Gerenciar planos de corrida semanais
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Acompanhar o progresso dos estudantes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Ferramenta profissional para personal trainers
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-800 mb-1">R$ 29,90/mês</div>
              <div className="text-sm text-amber-600">Cancele quando quiser</div>
            </div>

            <Button 
              onClick={createCheckout}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-3"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Assinar Premium
            </Button>
            
            <p className="text-xs text-amber-600">
              O pagamento será processado de forma segura através do Stripe
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "form") {
    return (
      <PersonalWorkoutForm 
        onBack={() => setCurrentView("list")}
        onSuccess={() => setCurrentView("list")}
      />
    );
  }

  if (currentView === "details" && selectedWorkoutId) {
    return (
      <PersonalWorkoutDetails
        workoutId={selectedWorkoutId}
        onBack={() => setCurrentView("list")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">Personal Trainer</h1>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={manageSubscription} variant="outline" size="sm">
            Gerenciar Assinatura
          </Button>
          <Button onClick={() => setCurrentView("form")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Treino
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Alunos</p>
                <p className="text-xl font-bold">{new Set(workouts.map(w => w.student_email)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Treinos Criados</p>
                <p className="text-xl font-bold">{workouts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-xl font-bold text-purple-600">Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workouts List */}
      <Card>
        <CardHeader>
          <CardTitle>Treinos Personalizados</CardTitle>
          <CardDescription>
            Gerencie os treinos criados para seus alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workoutsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treino criado</h3>
              <p className="text-gray-500 mb-4">Comece criando seu primeiro treino personalizado</p>
              <Button onClick={() => setCurrentView("form")}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Treino
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <Card key={workout.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedWorkoutId(workout.id);
                        setCurrentView("details");
                      }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium">{workout.workout_name}</h3>
                        <p className="text-sm text-gray-600">
                          Aluno: {workout.student_name} ({workout.student_email})
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{workout.workout_plan.level}</Badge>
                          <Badge variant="secondary">
                            {workout.workout_plan.weeks.length} semanas
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>Criado em</p>
                        <p>{new Date(workout.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};