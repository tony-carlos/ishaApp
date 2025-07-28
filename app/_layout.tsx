import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { UserProvider } from '@/contexts/UserContext';
import { SkinAnalysisProvider } from '@/contexts/SkinAnalysisContext';
import { CartProvider } from '@/contexts/CartContext';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Light': Poppins_300Light,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    async function initializeApp() {
      if (fontsLoaded || fontError) {
        // Initialize TensorFlow.js
        try {
          console.log('🔧 Initializing TensorFlow.js platform...');
          await tf.ready();
          console.log('✅ TensorFlow.js platform ready');
        } catch (error) {
          console.error('❌ TensorFlow.js initialization failed:', error);
        }

        // Hide splash screen
        SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    }

    initializeApp();
  }, [fontsLoaded, fontError]);

  if (!appIsReady) {
    return null;
  }

  return (
    <UserProvider>
      <SkinAnalysisProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen
              name="(onboarding)"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen
              name="scan-results"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="product-detail"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar
            style="dark"
            backgroundColor="transparent"
            translucent={Platform.OS === 'android'}
          />
        </CartProvider>
      </SkinAnalysisProvider>
    </UserProvider>
  );
}
