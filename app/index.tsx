import { useEffect, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function IndexScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useUser();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-navigate only if user is already authenticated
  useEffect(() => {
    if (!showSplash && !isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [showSplash, isLoading, isAuthenticated, router]);

  const handleGetStarted = () => {
    router.push('/(onboarding)/login');
  };

  if (showSplash) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary.default, Colors.primary.dark]}
          style={styles.gradient}
        >
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.content}
          >
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
            />
            <Typography
              variant="h2"
              color={Colors.neutral.white}
              align="center"
            >
              IsherCare
            </Typography>
            <Typography
              variant="body"
              color={Colors.neutral.white}
              align="center"
              style={styles.subtitle}
            >
              Your Personal Skin Care Assistant
            </Typography>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  // Show Get Started screen after splash
  if (!isAuthenticated && !isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary.default, Colors.primary.dark]}
          style={styles.gradient}
        >
          <View style={styles.getStartedContent}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
            />
            <Typography
              variant="h2"
              color={Colors.neutral.white}
              align="center"
            >
              Welcome to IsherCare
            </Typography>
            <Typography
              variant="body"
              color={Colors.neutral.white}
              align="center"
              style={styles.description}
            >
              Discover personalized skincare solutions tailored just for you
            </Typography>

            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
            >
              <Typography
                variant="body"
                color={Colors.primary.default}
                align="center"
                style={styles.buttonText}
              >
                Get Started
              </Typography>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Loading state
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  getStartedContent: {
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 10,
    opacity: 0.9,
  },
  description: {
    marginTop: 15,
    marginBottom: 40,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
