import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeleveler.app',
  appName: 'LifeLeveler',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      launchUrl: 'https://lifeleveler.netlify.app'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#111827'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    Haptics: {}
  }
};

export default config;