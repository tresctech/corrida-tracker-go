
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Plus, Trophy, Target, Route } from "lucide-react";
import { RaceStats } from "@/types/race";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardProps {
  stats: RaceStats;
  onAddRace: () => void;
}

export const Dashboard = ({ stats, onAddRace }: DashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            RunTracker
          </h1>
          <p className="text-muted-foreground">Gerencie suas corridas de rua</p>
        </div>
        <Button onClick={onAddRace} className="running-gradient text-white hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4 mr-2" />
          Nova Corrida
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="running-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Corridas</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRaces}</div>
          </CardContent>
        </Card>

        <Card className="running-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realizadas</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedRaces}</div>
          </CardContent>
        </Card>

        <Card className="running-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Fazer</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcomingRaces}</div>
          </CardContent>
        </Card>

        <Card className="running-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Km Percorridos</CardTitle>
            <Route className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalKilometers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Next Race Highlight */}
      {stats.nextRace && (
        <Card className="running-card border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Próxima Corrida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{stats.nextRace.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(stats.nextRace.raceDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {stats.nextRace.startTime}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {stats.nextRace.distance} km
                </Badge>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Retirada do Kit</p>
                  <p className="text-sm text-blue-700">{stats.nextRace.kitPickupAddress}</p>
                  {stats.nextRace.kitPickupDates === 'to-be-defined' ? (
                    <p className="text-sm text-blue-600">A definir</p>
                  ) : (
                    stats.nextRace.kitPickupDates.length > 0 && (
                      <p className="text-sm text-blue-600">
                        {format(stats.nextRace.kitPickupDates[0].date, "dd/MM/yyyy")} às {stats.nextRace.kitPickupDates[0].time}
                        {stats.nextRace.kitPickupDates.length > 1 && ` (+${stats.nextRace.kitPickupDates.length - 1} mais)`}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
