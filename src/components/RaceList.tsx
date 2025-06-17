import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, MapPin, Edit, Trash2, ExternalLink, FileText, Search, Filter, List, Calendar as CalendarIcon, Heart } from "lucide-react";
import { Race, ViewMode, FilterStatus, SortOrder } from "@/types/race";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RaceListProps {
  races: Race[];
  onEditRace: (race: Race) => void;
  onDeleteRace: (id: string) => void;
  onViewDetails: (race: Race) => void;
}

export const RaceList = ({ races, onEditRace, onDeleteRace, onViewDetails }: RaceListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Filter and sort races
  const filteredAndSortedRaces = races
    .filter(race => {
      const matchesSearch = race.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || race.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "date-asc":
          return a.raceDate.getTime() - b.raceDate.getTime();
        case "date-desc":
          return b.raceDate.getTime() - a.raceDate.getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const upcomingRaces = filteredAndSortedRaces.filter(race => race.status === "upcoming");
  const completedRaces = filteredAndSortedRaces.filter(race => race.status === "completed");
  const interestRaces = filteredAndSortedRaces.filter(race => race.status === "interest");

  const RaceCard = ({ race }: { race: Race }) => (
    <Card className="running-card hover:shadow-lg transition-all duration-300 animate-slide-in">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{race.name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(race.raceDate, "dd/MM/yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {race.startTime}
              </div>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={
              race.status === "upcoming" 
                ? "bg-blue-50 text-blue-700 border-blue-200" 
                : race.status === "completed"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-purple-50 text-purple-700 border-purple-200"
            }
          >
            {race.status === "upcoming" ? "A Fazer" : race.status === "completed" ? "Realizada" : "Interesse"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{race.distance} km</Badge>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Retirada do Kit</p>
              <p className="text-sm text-gray-600">{race.kitPickupAddress}</p>
              {race.kitPickupDates === 'to-be-defined' ? (
                <p className="text-sm text-gray-500">A definir</p>
              ) : (
                race.kitPickupDates.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {format(race.kitPickupDates[0].date, "dd/MM/yyyy")} das {race.kitPickupDates[0].startTime} às {race.kitPickupDates[0].endTime}
                    {race.kitPickupDates.length > 1 && ` (+${race.kitPickupDates.length - 1} mais)`}
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        {race.registrationProof && (
          <div className="flex items-center gap-2">
            {race.registrationProof.type === "file" ? (
              <FileText className="w-4 h-4 text-blue-600" />
            ) : (
              <ExternalLink className="w-4 h-4 text-blue-600" />
            )}
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-blue-600"
              onClick={() => window.open(race.registrationProof!.url, "_blank")}
            >
              Ver Comprovante
            </Button>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(race)}
            className="flex-1"
          >
            Ver Detalhes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditRace(race)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Corrida</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir "{race.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteRace(race.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="running-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar corridas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="upcoming">A Fazer</SelectItem>
                  <SelectItem value="completed">Realizadas</SelectItem>
                  <SelectItem value="interest">Interesse</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-asc">Data ↑</SelectItem>
                  <SelectItem value="date-desc">Data ↓</SelectItem>
                  <SelectItem value="name-asc">Nome A-Z</SelectItem>
                  <SelectItem value="name-desc">Nome Z-A</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="rounded-l-none border-l"
                >
                  <CalendarIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Race Lists */}
      {viewMode === "list" ? (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              A Fazer ({upcomingRaces.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-4 h-4 p-0">
                ✓
              </Badge>
              Realizadas ({completedRaces.length})
            </TabsTrigger>
            <TabsTrigger value="interest" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Interesse ({interestRaces.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-4">
            {upcomingRaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingRaces.map((race) => (
                  <RaceCard key={race.id} race={race} />
                ))}
              </div>
            ) : (
              <Card className="running-card">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Nenhuma corrida a fazer encontrada.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {completedRaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedRaces.map((race) => (
                  <RaceCard key={race.id} race={race} />
                ))}
              </div>
            ) : (
              <Card className="running-card">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Nenhuma corrida realizada encontrada.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="interest" className="mt-4">
            {interestRaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interestRaces.map((race) => (
                  <RaceCard key={race.id} race={race} />
                ))}
              </div>
            ) : (
              <Card className="running-card">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Nenhuma corrida de interesse encontrada.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="running-card">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Visualização em calendário será implementada em uma próxima versão.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
