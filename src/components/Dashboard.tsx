
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
        <Card className="stats-card hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">🏆 Total de Corridas</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-red-100">
              <Trophy className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {stats.totalRaces}
            </div>
            <p className="text-xs text-gray-500 mt-1">eventos registrados</p>
          </CardContent>
        </Card>

        <Card className="stats-card hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">🥇 Realizadas</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
              <Medal className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {stats.completedRaces}
            </div>
            <p className="text-xs text-gray-500 mt-1">conquistas alcançadas</p>
          </CardContent>
        </Card>

        <Card className="stats-card hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">🎯 A Fazer</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {stats.upcomingRaces}
            </div>
            <p className="text-xs text-gray-500 mt-1">próximos desafios</p>
          </CardContent>
        </Card>

        <Card className="stats-card hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">💝 Interesse</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
              <Heart className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats.interestRaces}
            </div>
            <p className="text-xs text-gray-500 mt-1">na lista de desejos</p>
          </CardContent>
        </Card>
      </div>

      {/* Total Kilometers */}
      <Card className="running-card energy-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            🏃‍♂️ Total de Kilômetros Corridos
          </CardTitle>
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
            <span className="text-2xl">🔥</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              {stats.totalKilometers}
            </div>
            <div className="text-2xl font-bold text-gray-400 mb-1">km</div>
          </div>
          <p className="text-sm text-gray-600 mt-2 font-medium">💪 Desde o início da sua jornada no PulseRun!</p>
        </CardContent>
      </Card>

      {/* Next Race */}
      {stats.nextRace && (
        <Card className="running-card racing-stripe">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              🚀 Próxima Corrida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-bold text-xl text-gray-800 mb-3">{stats.nextRace.name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{format(stats.nextRace.raceDate, "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{stats.nextRace.startTime}</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm font-bold">
                    🏃‍♂️ {stats.nextRace.distance} km
                  </Badge>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-blue-500">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 mb-1">📦 Retirada do Kit</p>
                    <p className="text-gray-700 font-medium">{stats.nextRace.kitPickupAddress}</p>
                    {stats.nextRace.kitPickupDates === 'to-be-defined' ? (
                      <p className="text-sm text-orange-600 font-medium mt-1">⏰ A definir</p>
                    ) : (
                      stats.nextRace.kitPickupDates.length > 0 && (
                        <p className="text-sm text-blue-600 font-medium mt-1">
                          📅 {format(stats.nextRace.kitPickupDates[0].date, "dd/MM/yyyy")} 
                          ⏰ {stats.nextRace.kitPickupDates[0].startTime} às {stats.nextRace.kitPickupDates[0].endTime}
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
