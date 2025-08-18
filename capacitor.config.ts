import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.60b059af735d48798f5b7e3b97a29817',
  appName: 'corrida-tracker-go',
  webDir: 'dist',
  server: {
    url: 'https://60b059af-735d-4879-8f5b-7e3b97a29817.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    },
    Geolocation: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3600000
    }
  }
};

export default config;