import { useState, useEffect, useRef } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { useToast } from '@/hooks/use-toast';

export interface GPSPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  timestamp: number;
  accuracy?: number;
}

export interface LiveTrackingData {
  distance: number;
  duration: number; // in seconds
  currentPace: number; // seconds per km
  averagePace: number;
  maxSpeed: number;
  averageSpeed: number;
  elevation: number;
  calories: number;
  route: GPSPoint[];
  isActive: boolean;
}

export interface TrackingStats {
  currentKm: number;
  splitTimes: number[]; // time for each km
  kmPaces: number[]; // pace for each km
}

export const useGPSTracking = () => {
  const [trackingData, setTrackingData] = useState<LiveTrackingData>({
    distance: 0,
    duration: 0,
    currentPace: 0,
    averagePace: 0,
    maxSpeed: 0,
    averageSpeed: 0,
    elevation: 0,
    calories: 0,
    route: [],
    isActive: false
  });

  const [trackingStats, setTrackingStats] = useState<TrackingStats>({
    currentKm: 0,
    splitTimes: [],
    kmPaces: []
  });

  const [hasPermission, setHasPermission] = useState(false);
  const watchId = useRef<string | null>(null);
  const startTime = useRef<number>(0);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const lastKmDistance = useRef<number>(0);
  const { toast } = useToast();

  // Calculate distance between two GPS points using Haversine formula
  const calculateDistance = (point1: GPSPoint, point2: GPSPoint): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.latitude - point1.latitude);
    const dLon = toRad(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(point1.latitude)) * Math.cos(toRad(point2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg: number): number => deg * (Math.PI / 180);

  // Calculate calories based on weight, time, and intensity
  const calculateCalories = (durationMinutes: number, weight: number = 70): number => {
    const MET = 8.0; // Running MET value (adjust based on intensity)
    return Math.round((MET * weight * durationMinutes) / 60);
  };

  // Request location permissions
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const permission = await Geolocation.requestPermissions();
      const granted = permission.location === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        toast({
          title: "Permissão GPS negada",
          description: "É necessário permitir acesso ao GPS para rastrear treinos.",
          variant: "destructive"
        });
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Erro ao solicitar permissões",
        description: "Não foi possível solicitar permissões de GPS.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Start GPS tracking
  const startTracking = async (): Promise<boolean> => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return false;
    }

    try {
      startTime.current = Date.now();
      lastKmDistance.current = 0;

      // Reset tracking data
      setTrackingData(prev => ({
        ...prev,
        distance: 0,
        duration: 0,
        currentPace: 0,
        averagePace: 0,
        maxSpeed: 0,
        averageSpeed: 0,
        elevation: 0,
        calories: 0,
        route: [],
        isActive: true
      }));

      setTrackingStats({
        currentKm: 0,
        splitTimes: [],
        kmPaces: []
      });

      // Start watching position
      watchId.current = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000
        },
        (position: Position | null, err?: any) => {
          if (err) {
            console.error('GPS tracking error:', err);
            return;
          }

          if (position && position.coords) {
            updateTrackingData(position);
          }
        }
      );

      // Start duration timer
      intervalId.current = setInterval(() => {
        setTrackingData(prev => {
          if (!prev.isActive) return prev;
          
          const newDuration = Math.floor((Date.now() - startTime.current) / 1000);
          const durationMinutes = newDuration / 60;
          
          return {
            ...prev,
            duration: newDuration,
            calories: calculateCalories(durationMinutes),
            currentPace: prev.distance > 0 ? (newDuration / 60) / prev.distance : 0,
            averagePace: prev.distance > 0 ? (newDuration / 60) / prev.distance : 0
          };
        });
      }, 1000);

      toast({
        title: "🏃‍♂️ Rastreamento iniciado!",
        description: "GPS ativo. Seu treino está sendo monitorado."
      });

      return true;
    } catch (error) {
      console.error('Error starting GPS tracking:', error);
      toast({
        title: "Erro ao iniciar rastreamento",
        description: "Não foi possível iniciar o GPS.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update tracking data with new GPS position
  const updateTrackingData = (position: Position) => {
    const newPoint: GPSPoint = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude || undefined,
      speed: position.coords.speed || undefined,
      timestamp: position.timestamp,
      accuracy: position.coords.accuracy || undefined
    };

    setTrackingData(prev => {
      const newRoute = [...prev.route, newPoint];
      let newDistance = prev.distance;
      let newElevation = prev.elevation;
      let newMaxSpeed = prev.maxSpeed;

      // Calculate distance if we have a previous point
      if (prev.route.length > 0) {
        const lastPoint = prev.route[prev.route.length - 1];
        const segmentDistance = calculateDistance(lastPoint, newPoint);
        newDistance += segmentDistance;

        // Calculate elevation gain
        if (newPoint.altitude && lastPoint.altitude) {
          const elevationDiff = newPoint.altitude - lastPoint.altitude;
          if (elevationDiff > 0) {
            newElevation += elevationDiff;
          }
        }
      }

      // Update max speed
      if (newPoint.speed && newPoint.speed > newMaxSpeed) {
        newMaxSpeed = newPoint.speed * 3.6; // Convert m/s to km/h
      }

      // Check for kilometer milestones
      const currentKm = Math.floor(newDistance);
      if (currentKm > trackingStats.currentKm) {
        const kmTime = (Date.now() - startTime.current) / 1000;
        const lastKmTime = trackingStats.splitTimes.length > 0 
          ? kmTime - trackingStats.splitTimes.reduce((a, b) => a + b, 0)
          : kmTime;
        
        const kmPace = lastKmTime / 60; // minutes per km

        setTrackingStats(prevStats => ({
          currentKm,
          splitTimes: [...prevStats.splitTimes, lastKmTime],
          kmPaces: [...prevStats.kmPaces, kmPace]
        }));

        toast({
          title: `🎯 ${currentKm}km completado!`,
          description: `Pace: ${Math.floor(kmPace)}:${Math.floor((kmPace % 1) * 60).toString().padStart(2, '0')}/km`
        });
      }

      return {
        ...prev,
        route: newRoute,
        distance: newDistance,
        elevation: newElevation,
        maxSpeed: newMaxSpeed,
        averageSpeed: newDistance > 0 ? (newDistance / (prev.duration / 3600)) : 0
      };
    });
  };

  // Stop GPS tracking
  const stopTracking = async (): Promise<void> => {
    try {
      if (watchId.current) {
        await Geolocation.clearWatch({ id: watchId.current });
        watchId.current = null;
      }

      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }

      setTrackingData(prev => ({ ...prev, isActive: false }));

      toast({
        title: "⏹️ Rastreamento finalizado",
        description: "Treino salvo com sucesso!"
      });
    } catch (error) {
      console.error('Error stopping GPS tracking:', error);
      toast({
        title: "Erro ao parar rastreamento",
        description: "Houve um problema ao finalizar o GPS.",
        variant: "destructive"
      });
    }
  };

  // Pause/Resume tracking
  const pauseTracking = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
    
    setTrackingData(prev => ({ ...prev, isActive: false }));
    
    toast({
      title: "⏸️ Treino pausado",
      description: "Toque em retomar para continuar."
    });
  };

  const resumeTracking = () => {
    intervalId.current = setInterval(() => {
      setTrackingData(prev => {
        if (!prev.isActive) return prev;
        
        const newDuration = Math.floor((Date.now() - startTime.current) / 1000);
        const durationMinutes = newDuration / 60;
        
        return {
          ...prev,
          duration: newDuration,
          calories: calculateCalories(durationMinutes),
          currentPace: prev.distance > 0 ? (newDuration / 60) / prev.distance : 0,
          averagePace: prev.distance > 0 ? (newDuration / 60) / prev.distance : 0
        };
      });
    }, 1000);

    setTrackingData(prev => ({ ...prev, isActive: true }));
    
    toast({
      title: "▶️ Treino retomado",
      description: "Rastreamento ativo novamente."
    });
  };

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permission = await Geolocation.checkPermissions();
        setHasPermission(permission.location === 'granted');
      } catch (error) {
        console.error('Error checking permissions:', error);
      }
    };

    checkPermissions();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId.current) {
        Geolocation.clearWatch({ id: watchId.current });
      }
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);

  return {
    trackingData,
    trackingStats,
    hasPermission,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    requestPermissions
  };
};