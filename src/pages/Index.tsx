
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
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PersonalTrainer } from "@/components/PersonalTrainer";
import { Training } from "@/pages/Training";
import { MobileNavigation } from "@/components/MobileNavigation";
import { MobileHeader } from "@/components/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";

type View = "dashboard" | "form" | "list" | "details" | "admin" | "personal" | "training";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, mustChangePassword, signOut } = useAuth();
  const { races, loading, addRace, updateRace, deleteRace, getStats } = useSupabaseRaces();
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
    <div className="min-h-screen bg-background">
      {/* Mobile-first layout */}
      <MobileHeader 
        currentView={currentView}
        onBack={handleBack}
        onSignOut={handleSignOut}
      />
      
      <main className="flex-1 pb-20"> {/* Bottom padding for mobile navigation */}
        <div className="p-4 max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onAddRace={handleAddRace}
      />
      
      <ChangePasswordModal 
        isOpen={mustChangePassword} 
        onPasswordChanged={handlePasswordChanged}
      />
    </div>
  );
};

export default Index;
