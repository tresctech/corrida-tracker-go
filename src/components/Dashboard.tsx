
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Medal, Trophy, Heart } from "lucide-react";
import { DashboardProps } from "@/types/dashboard";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const Dashboard = ({ stats, onAddRace }: DashboardProps) => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="running-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Corridas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRaces}</div>
          </CardContent>
        </Card>

        <Card className="running-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realizadas</CardTitle>
            <Medal className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedRaces}</div>
          </CardContent>
        </Card>

        <Card className="running-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Fazer</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcomingRaces}</div>
          </CardContent>
        </Card>

        <Card className="running-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interesse</CardTitle>
            <Heart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.interestRaces}</div>
          </CardContent>
        </Card>
      </div>

      {/* Total Kilometers */}
      <Card className="running-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Kilômetros Corridos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalKilometers} km</div>
          <p className="text-sm text-muted-foreground">Desde o início do RunTracker</p>
        </CardContent>
      </Card>

      {/* Next Race */}
      {stats.nextRace && (
        <Card className="running-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Próxima Corrida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{stats.nextRace.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(stats.nextRace.raceDate, "dd/MM/yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {stats.nextRace.startTime}
                  </div>
                  <Badge variant="secondary">{stats.nextRace.distance} km</Badge>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Retirada do Kit</p>
                    <p className="text-sm text-gray-600">{stats.nextRace.kitPickupAddress}</p>
                    {stats.nextRace.kitPickupDates === 'to-be-defined' ? (
                      <p className="text-sm text-gray-500">A definir</p>
                    ) : (
                      stats.nextRace.kitPickupDates.length > 0 && (
                        <p className="text-sm text-gray-500">
                          {format(stats.nextRace.kitPickupDates[0].date, "dd/MM/yyyy")} das {stats.nextRace.kitPickupDates[0].startTime} às {stats.nextRace.kitPickupDates[0].endTime}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
