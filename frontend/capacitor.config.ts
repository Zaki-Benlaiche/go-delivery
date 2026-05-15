import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.godelivery.app',
  appName: 'Réserve-vite',
  webDir: 'out',

  // Match the Next static export output. We keep the bundled web layer (the
  // app ships fully offline-capable for first-paint shell) — backend calls
  // still go to the production API at runtime.
  server: {
    androidScheme: 'https',
    // No `url` here — that would point the WebView at a remote URL and break
    // the offline shell. The app loads /out from the APK and only fetches
    // the API. If you ever want live-reload during dev, add:
    //   url: 'http://10.0.2.2:3000', cleartext: true,
  },

  // WebView tuning: speed boots, sane background colour during the white flash
  // before the first React paint, and modern WebView features turned on.
  android: {
    backgroundColor: '#0a0b0e',     // matches manifest theme — kills the white flash
    allowMixedContent: false,       // we're HTTPS-only in prod
    captureInput: true,             // faster keyboard input pipeline
    webContentsDebuggingEnabled: false, // disable in release builds; flip on locally if debugging
  },

  plugins: {
    // The system splash already covers the boot. Keep the duration short so
    // users land on the app shell quickly even on cold starts.
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: '#0a0b0e',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
