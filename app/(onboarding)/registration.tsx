import { useState } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import {
  User,
  MapPin,
  ArrowRight,
  Mail,
  Lock,
  Phone,
} from 'lucide-react-native';

export default function RegistrationScreen() {
  const router = useRouter();
  const { register } = useUser();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegistration = async () => {
    // Validation
    if (
      !fullName ||
      !email ||
      !password ||
      !passwordConfirmation ||
      !phoneNumber ||
      !location
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        full_name: fullName,
        email,
        password,
        password_confirmation: passwordConfirmation,
        phone_number: phoneNumber,
        location,
        gender: 'prefer-not-to-say', // Default value, will be updated in about screen
        age: 25, // Default value, will be updated in about screen
        is_for_self: true,
        skin_concerns: [],
        has_routine: false,
        current_products: [],
        sunscreen_frequency: 'sometimes',
      };

      await register(userData);
      router.replace('/(onboarding)/about');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.replace('/(onboarding)/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Typography variant="h1" align="center">
            Create Your Account
          </Typography>
          <Typography variant="body" align="center" style={styles.subtitle}>
            Let's get to know you better to personalize your skincare journey
          </Typography>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            icon={<User size={20} color={Colors.neutral.medium} />}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={20} color={Colors.neutral.medium} />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password (min 8 characters)"
            secureTextEntry
            icon={<Lock size={20} color={Colors.neutral.medium} />}
          />

          <Input
            label="Confirm Password"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            placeholder="Confirm your password"
            secureTextEntry
            icon={<Lock size={20} color={Colors.neutral.medium} />}
          />

          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+1 (XXX) XXX-XXXX"
            keyboardType="phone-pad"
            icon={<Phone size={20} color={Colors.neutral.medium} />}
          />

          <Input
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="City, Country"
            icon={<MapPin size={20} color={Colors.neutral.medium} />}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            label="Create Account"
            onPress={handleRegistration}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            icon={<ArrowRight size={20} color={Colors.neutral.white} />}
            iconPosition="right"
          />

          <View style={styles.loginContainer}>
            <Typography variant="body" color={Colors.text.secondary}>
              Already have an account?{' '}
            </Typography>
            <TouchableOpacity onPress={navigateToLogin}>
              <Typography variant="body" color={Colors.primary.default}>
                Sign In
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});
