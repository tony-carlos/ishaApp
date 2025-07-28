export default {
  expo: {
    name: 'ISHER CARE',
    slug: 'isher-care',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    sdkVersion: '53.0.0',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription:
          'This app uses the camera to take photos for skin analysis and personalized skincare recommendations.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: ['CAMERA'],
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-camera',
        {
          cameraPermission:
            'Allow ISHER CARE to access your camera for skin analysis photos.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      // PerfectCorp Configuration
      EXPO_PUBLIC_PERFECTCORP_API_KEY:
        process.env.EXPO_PUBLIC_PERFECTCORP_API_KEY,
      EXPO_PUBLIC_PC_SECRET_PEM: process.env.EXPO_PUBLIC_PC_SECRET_PEM,
      EXPO_PUBLIC_PERFECTCORP_BASE_URL:
        process.env.EXPO_PUBLIC_PERFECTCORP_BASE_URL,
    },
  },
};
