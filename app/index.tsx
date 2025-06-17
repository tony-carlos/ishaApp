import { useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useUser();

  useEffect(() => {
    const navigateToNextScreen = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(onboarding)/services');
        }
      }
    }, 3000); // 3 seconds splash screen

    return () => clearTimeout(navigateToNextScreen);
  }, [isLoading, isAuthenticated, router]);

  return (
    <LinearGradient
      colors={[Colors.primary.light, Colors.accent.light]}
      style={styles.container}
    >
      <Animated.View 
        style={styles.content}
        entering={FadeIn.duration(1000)}
        exiting={FadeOut.duration(500)}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/1029896/pexels-photo-1029896.jpeg' }}
            style={styles.logoBackground}
          />
          <View style={styles.logoOverlay} />
          <Typography variant="display" color={Colors.neutral.white} align="center">
            ISHER CARE
          </Typography>
        </View>
        
        <Typography 
          variant="h4" 
          color={Colors.neutral.white} 
          align="center"
          style={styles.tagline}
        >
          Beauty powered by Science
        </Typography>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  logoBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  logoOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  tagline: {
    marginTop: 12,
  },
});