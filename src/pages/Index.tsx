
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
import { ArrowLeft, LogOut, User, Plus, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PersonalTrainer } from "@/components/PersonalTrainer";
import { Training } from "@/pages/Training";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

type View = "dashboard" | "form" | "list" | "details" | "admin" | "personal" | "training";

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
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-xl font-bold text-foreground hidden sm:block">
                Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-3 h-3 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{user.email}</span>
                  {isAdmin && <span className="text-xs text-primary font-semibold">👑 Admin</span>}
                </div>
              </div>
              
              <ThemeToggle />
              
              <Button 
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </header>
      );
    }

    return (
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
          
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
            🏃‍♂️ PulseRun
          </h1>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {(currentView === "list" || currentView === "details") && (
            <Button 
              onClick={handleAddRace}
              className="mobile-button running-gradient text-white border-0 racing-stripe"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">🚀 Nova Corrida</span>
              <span className="sm:hidden">🚀 Nova</span>
            </Button>
          )}

          {currentView === "admin" && isAdmin && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/20 backdrop-blur-sm border border-purple-300/30">
              <Settings className="w-5 h-5 text-purple-300" />
              <span className="hidden sm:inline text-white font-medium">⚙️ Painel de Administração</span>
              <span className="sm:hidden text-white font-medium">⚙️ Admin</span>
            </div>
          )}
          
          <Button 
            variant="outline"
            onClick={handleSignOut}
            className="mobile-button bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
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
      
      case "training":
        return <Training onBack={() => setCurrentView("dashboard")} />;
      
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
          onAddRace={handleAddRace}
        />
        
        <main className="flex-1 flex flex-col min-w-0">
          {renderNavigation()}
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
      
      <ChangePasswordModal 
        isOpen={mustChangePassword} 
        onPasswordChanged={handlePasswordChanged}
      />
    </SidebarProvider>
  );
};

export default Index;
