
import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { RaceForm } from "@/components/RaceForm";
import { RaceList } from "@/components/RaceList";
import { RaceDetails } from "@/components/RaceDetails";
import { useRaces } from "@/hooks/useRaces";
import { Race, RaceFormData } from "@/types/race";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type View = "dashboard" | "form" | "list" | "details";

const Index = () => {
  const { races, loading, addRace, updateRace, deleteRace, getStats } = useRaces();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedRace, setSelectedRace] = useState<Race | undefined>();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
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

  const handleFormSubmit = (data: RaceFormData) => {
    if (selectedRace) {
      updateRace(selectedRace.id, data);
    } else {
      addRace(data);
    }
    setCurrentView("dashboard");
    setSelectedRace(undefined);
  };

  const handleDeleteRace = (id: string) => {
    deleteRace(id);
    toast({
      title: "Corrida excluída",
      description: "A corrida foi excluída com sucesso.",
    });
  };

  const handleBack = () => {
    if (currentView === "details" || currentView === "form") {
      setCurrentView("dashboard");
    } else {
      setCurrentView("dashboard");
    }
    setSelectedRace(undefined);
  };

  const renderNavigation = () => {
    if (currentView === "dashboard") {
      return (
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView("list")}
            className="flex items-center gap-2"
          >
            Ver Todas as Corridas
          </Button>
          
          <Button 
            onClick={handleAddRace}
            className="running-gradient text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Corrida
          </Button>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        
        {(currentView === "list" || currentView === "details") && (
          <Button 
            onClick={handleAddRace}
            className="running-gradient text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Corrida
          </Button>
        )}
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
    </div>
  );
};

export default Index;
