
import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { RaceForm } from "@/components/RaceForm";
import { RaceList } from "@/components/RaceList";
import { RaceDetails } from "@/components/RaceDetails";
import { AuthPage } from "@/components/AuthPage";
import UserManagement from "@/components/UserManagement";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseRaces } from "@/hooks/useSupabaseRaces";
import { Race, RaceFormData } from "@/types/race";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type View = "dashboard" | "form" | "list" | "details" | "admin";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, mustChangePassword, signOut } = useAuth();
  const { races, loading, addRace, updateRace, deleteRace, getStats } = useSupabaseRaces();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedRace, setSelectedRace] = useState<Race | undefined>();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando PulseRun...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando suas corridas...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

  const handleAddRace = () => {
    setSelectedRace(undefined);
    setCurrentView("form");
  };

  const handleEditRace = (race: Race) => {
    setSelectedRace(race);
    setCurrentView("form");
  };

  const handleViewDetails = (race: Race) => {
    setSelectedRace(race);
    setCurrentView("details");
  };

  const handleFormSubmit = async (data: RaceFormData) => {
    if (selectedRace) {
      await updateRace(selectedRace.id, data);
    } else {
      await addRace(data);
    }
    setCurrentView("dashboard");
    setSelectedRace(undefined);
  };

  const handleDeleteRace = async (id: string) => {
    await deleteRace(id);
  };

  const handleBack = () => {
    if (currentView === "details" || currentView === "form") {
      setCurrentView("dashboard");
    } else {  
      setCurrentView("dashboard");
    }
    setSelectedRace(undefined);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",  
      description: "Você foi desconectado com sucesso.",
    });
  };

  const handlePasswordChanged = () => {
    toast({
      title: "Senha alterada com sucesso",
      description: "Sua senha foi alterada e você já pode usar o sistema.",
    });
  };

  const renderNavigation = () => {
    if (currentView === "dashboard") {
      return (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">PulseRun</h1>
            
            <Button 
              variant="outline" 
              onClick={() => setCurrentView("list")}
            >
              Ver Todas as Corridas
            </Button>

            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentView("admin")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Administração
              </Button>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
              {isAdmin && <span className="text-red-500 font-medium">(Admin)</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleAddRace}
              className="running-gradient text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Corrida
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <h1 className="text-xl font-bold text-gray-800">PulseRun</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {(currentView === "list" || currentView === "details") && (
            <Button 
              onClick={handleAddRace}
              className="running-gradient text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Corrida
            </Button>
          )}

          {currentView === "admin" && isAdmin && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings className="w-4 h-4" />
              <span>Painel de Administração</span>
            </div>
          )}
          
          <Button 
            variant="outline"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case "form":
        return (
          <RaceForm
            race={selectedRace}
            onSubmit={handleFormSubmit}
            onCancel={handleBack}
          />
        );
      
      case "list":
        return (
          <RaceList
            races={races}
            onEditRace={handleEditRace}
            onDeleteRace={handleDeleteRace}
            onViewDetails={handleViewDetails}
          />
        );
      
      case "details":
        return selectedRace ? (
          <RaceDetails
            race={selectedRace}
            onEdit={() => handleEditRace(selectedRace)}
            onClose={handleBack}
          />
        ) : null;

      case "admin":
        return isAdmin ? <UserManagement /> : null;
      
      default:
        return (
          <Dashboard 
            stats={stats} 
            onAddRace={handleAddRace}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {renderNavigation()}
        {renderContent()}
      </div>
      
      <ChangePasswordModal 
        isOpen={mustChangePassword} 
        onPasswordChanged={handlePasswordChanged}
      />
    </div>
  );
};

export default Index;
