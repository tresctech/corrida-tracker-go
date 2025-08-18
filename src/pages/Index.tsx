
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
import { ArrowLeft, Plus, LogOut, User, Settings, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PersonalTrainer } from "@/components/PersonalTrainer";

type View = "dashboard" | "form" | "list" | "details" | "admin" | "personal";

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
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <h1 className="text-2xl font-bold text-gray-800">PulseRun</h1>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView("list")}
                className="mobile-button text-sm sm:text-base"
              >
                Ver Corridas
              </Button>

              <Button 
                variant="outline" 
                onClick={() => setCurrentView("personal")}
                className="mobile-button bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-800 hover:from-amber-100 hover:to-orange-100"
              >
                <Crown className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Personal Trainer</span>
                <span className="sm:hidden">Personal</span>
              </Button>

              {isAdmin && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView("admin")}
                  className="mobile-button"
                >
                  <Settings className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Administração</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="truncate max-w-[150px] sm:max-w-none">{user.email}</span>
              {isAdmin && <span className="text-red-500 font-medium">(Admin)</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleAddRace}
              className="mobile-button running-gradient text-white hover:opacity-90 transition-opacity flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Corrida</span>
              <span className="sm:hidden">Nova</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleSignOut}
              className="mobile-button"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mobile-button flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <h1 className="text-xl font-bold text-gray-800">PulseRun</h1>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {(currentView === "list" || currentView === "details") && (
            <Button 
              onClick={handleAddRace}
              className="mobile-button running-gradient text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nova Corrida</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          )}

          {currentView === "admin" && isAdmin && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Painel de Administração</span>
              <span className="sm:hidden">Admin</span>
            </div>
          )}
          
          <Button 
            variant="outline"
            onClick={handleSignOut}
            className="mobile-button"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
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
      
      case "personal":
        return <PersonalTrainer onBack={() => setCurrentView("dashboard")} />;
      
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 safe-area-top safe-area-bottom">
      <div className="container mx-auto mobile-container max-w-7xl">
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
