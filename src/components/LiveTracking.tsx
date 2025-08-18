import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  Square, 
  MapPin, 
  Timer, 
  Activity, 
  Heart, 
  Zap,
  Route,
  Mountain,
  Smartphone,
  Wifi,
  WifiOff
} from "lucide-react";
import { useGPSTracking } from "@/hooks/useGPSTracking";
import { useHealthIntegration } from "@/hooks/useHealthIntegration";
import { RunningCard } from "@/components/ui/running-card";

interface LiveTrackingProps {
  onSaveWorkout: (trackingData: any) => void;
  onBack: () => void;
}

export const LiveTracking = ({ onSaveWorkout, onBack }: LiveTrackingProps) => {
  const {
    trackingData,
    trackingStats,
    hasPermission,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    requestPermissions
  } = useGPSTracking();

  const {
    healthData,
    integration,
    connectToHealth,
    syncHealthData,
    writeWorkoutToHealth
  } = useHealthIntegration();

  const [workoutType, setWorkoutType] = useState<'running' | 'walking' | 'cycling'>('running');
  const [isStarted, setIsStarted] = useState(false);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number): string => {
    if (pace === 0) return "--:--";
    const minutes = Math.floor(pace);
    const seconds = Math.floor((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  const handleStart = async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    const success = await startTracking();
    if (success) {
      setIsStarted(true);
    }
  };

  const handleStop = async () => {
    await stopTracking();
    
    // Save workout data
    const workoutData = {
      name: `${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} - ${new Date().toLocaleDateString()}`,
      date: new Date(),
      start_time: new Date(Date.now() - trackingData.duration * 1000).toTimeString().slice(0, 5),
      distance: trackingData.distance,
      duration_minutes: Math.floor(trackingData.duration / 60),
      duration_seconds: trackingData.duration % 60,
      calories: trackingData.calories,
      elevation_gain: trackingData.elevation,
      workout_type: workoutType,
      notes: `Treino rastreado por GPS\nDistância: ${trackingData.distance.toFixed(2)}km\nRota: ${trackingData.route.length} pontos GPS`,
      route_data: trackingData.route // Store GPS route data
    };

    // Write to health app if connected
    if (integration.isConnected) {
      await writeWorkoutToHealth({
        type: workoutType,
        startTime: new Date(Date.now() - trackingData.duration * 1000),
        endTime: new Date(),
        distance: trackingData.distance,
        calories: trackingData.calories,
        heartRate: healthData.heartRate
      });
    }

    onSaveWorkout(workoutData);
    setIsStarted(false);
  };

  const handlePause = () => {
    if (trackingData.isActive) {
      pauseTracking();
    } else {
      resumeTracking();
    }
  };

  if (!isStarted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            ← Voltar
          </Button>
          <h1 className="text-2xl font-bold text-running-primary">🏃‍♂️ Live Tracking</h1>
        </div>

        {/* GPS Status */}
        <RunningCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${hasPermission ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {hasPermission ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
              </div>
              <div>
                <p className="font-medium text-foreground">GPS Status</p>
                <p className="text-sm text-muted-foreground">
                  {hasPermission ? 'Pronto para rastrear' : 'Permissão necessária'}
                </p>
              </div>
            </div>
            {!hasPermission && (
              <Button onClick={requestPermissions} size="sm">
                Permitir GPS
              </Button>
            )}
          </div>
        </RunningCard>

        {/* Health Integration */}
        <RunningCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${integration.isConnected ? 'bg-blue-500/20' : 'bg-gray-500/20'}`}>
                  <Smartphone className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Health Integration</p>
                  <p className="text-sm text-muted-foreground">
                    {integration.isConnected 
                      ? `Conectado ${integration.platform === 'ios' ? 'Apple Health' : 'Google Fit'}`
                      : 'Não conectado'
                    }
                  </p>
                </div>
              </div>
              {integration.isAvailable && (
                <Button 
                  onClick={integration.isConnected ? syncHealthData : connectToHealth}
                  size="sm"
                  variant={integration.isConnected ? "outline" : "default"}
                >
                  {integration.isConnected ? 'Sincronizar' : 'Conectar'}
                </Button>
              )}
            </div>

            {/* Health Data Display */}
            {integration.isConnected && Object.keys(healthData).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {healthData.heartRate && (
                  <div className="text-center">
                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">FC Atual</p>
                    <p className="font-bold text-red-500">{healthData.heartRate} bpm</p>
                  </div>
                )}
                {healthData.steps && (
                  <div className="text-center">
                    <Activity className="w-5 h-5 text-running-primary mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">Passos Hoje</p>
                    <p className="font-bold text-running-primary">{healthData.steps.toLocaleString()}</p>
                  </div>
                )}
                {healthData.calories && (
                  <div className="text-center">
                    <Zap className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">Calorias</p>
                    <p className="font-bold text-orange-500">{healthData.calories} kcal</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </RunningCard>

        {/* Workout Type Selection */}
        <RunningCard>
          <h3 className="font-semibold text-lg text-foreground mb-4">Tipo de Treino</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'running' as const, label: '🏃‍♂️ Corrida', icon: Activity },
              { type: 'walking' as const, label: '🚶‍♂️ Caminhada', icon: Activity },
              { type: 'cycling' as const, label: '🚴‍♂️ Ciclismo', icon: Activity }
            ].map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant={workoutType === type ? "default" : "outline"}
                onClick={() => setWorkoutType(type)}
                className="h-20 flex flex-col gap-2"
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm">{label}</span>
              </Button>
            ))}
          </div>
        </RunningCard>

        {/* Start Button */}
        <RunningCard variant="premium">
          <Button
            onClick={handleStart}
            disabled={!hasPermission}
            className="w-full h-16 text-xl font-bold bg-white text-running-primary hover:bg-white/90"
          >
            <Play className="w-8 h-8 mr-3" />
            Iniciar Treino
          </Button>
        </RunningCard>
      </div>
    );
  }

  // Live tracking display
  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          🟢 AO VIVO
        </Badge>
        <div className="flex gap-2">
          <Button
            onClick={handlePause}
            variant="outline"
            size="sm"
          >
            {trackingData.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleStop}
            variant="destructive"
            size="sm"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <RunningCard variant="glow">
          <div className="text-center">
            <Timer className="w-8 h-8 text-running-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Tempo</p>
            <p className="text-3xl font-bold text-running-primary">{formatTime(trackingData.duration)}</p>
          </div>
        </RunningCard>

        <RunningCard variant="glow">
          <div className="text-center">
            <Route className="w-8 h-8 text-running-secondary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Distância</p>
            <p className="text-3xl font-bold text-running-secondary">{trackingData.distance.toFixed(2)} km</p>
          </div>
        </RunningCard>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RunningCard>
          <div className="text-center">
            <Activity className="w-6 h-6 text-running-accent mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Pace Atual</p>
            <p className="text-lg font-bold text-running-accent">{formatPace(trackingData.currentPace)}</p>
          </div>
        </RunningCard>

        <RunningCard>
          <div className="text-center">
            <Activity className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Pace Médio</p>
            <p className="text-lg font-bold text-purple-500">{formatPace(trackingData.averagePace)}</p>
          </div>
        </RunningCard>

        <RunningCard>
          <div className="text-center">
            <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Calorias</p>
            <p className="text-lg font-bold text-orange-500">{trackingData.calories}</p>
          </div>
        </RunningCard>

        <RunningCard>
          <div className="text-center">
            <Mountain className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Elevação</p>
            <p className="text-lg font-bold text-green-500">{trackingData.elevation.toFixed(0)}m</p>
          </div>
        </RunningCard>
      </div>

      {/* Split Times */}
      {trackingStats.splitTimes.length > 0 && (
        <RunningCard>
          <h3 className="font-semibold text-lg text-foreground mb-4">Splits por Km</h3>
          <div className="space-y-2">
            {trackingStats.splitTimes.map((time, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                <span className="font-medium">Km {index + 1}</span>
                <div className="text-right">
                  <p className="font-bold">{formatTime(Math.floor(time))}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPace(trackingStats.kmPaces[index])}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </RunningCard>
      )}

      {/* Health Data (if available) */}
      {integration.isConnected && healthData.heartRate && (
        <RunningCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-medium text-foreground">Frequência Cardíaca</p>
                <p className="text-2xl font-bold text-red-500">{healthData.heartRate} bpm</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              📱 Live
            </Badge>
          </div>
        </RunningCard>
      )}

      {/* GPS Info */}
      <RunningCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-medium text-foreground">GPS Tracking</p>
              <p className="text-sm text-muted-foreground">
                {trackingData.route.length} pontos registrados
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            🛰️ Ativo
          </Badge>
        </div>
      </RunningCard>
    </div>
  );
};