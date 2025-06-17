import { useState } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { User, MapPin, ArrowRight } from 'lucide-react-native';

export default function RegistrationScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegistration = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(onboarding)/about');
    }, 1000);
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
          />
          
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
          />
          
          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+1 (XXX) XXX-XXXX"
            keyboardType="phone-pad"
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
            label="Continue"
            onPress={handleRegistration}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            icon={<ArrowRight size={20} color={Colors.neutral.white} />}
            iconPosition="right"
          />
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
    paddingHorizontal: 24,
    paddingBottom: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.neutral.white,
  },
});
