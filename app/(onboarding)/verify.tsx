import { useState, useRef } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { phoneNumber } = params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeInput, setActiveInput] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleInputChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      router.push('/(onboarding)/about');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="h1" align="center">
            Verify Your Number
          </Typography>
          <Typography variant="body" align="center" style={styles.subtitle}>
            We've sent a 6-digit code to {phoneNumber}
          </Typography>
        </View>
        <View style={styles.otpContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                activeInput === index && styles.activeInput,
              ]}
              value={otp[index]}
              onChangeText={(text) => handleInputChange(text, index)}
              keyboardType="number-pad"
              maxLength={1}
              onFocus={() => setActiveInput(index)}
            />
          ))}
        </View>
        <Button
          label="Verify Code"
          onPress={handleVerify}
          loading={isVerifying}
          disabled={isVerifying}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    marginBottom: 40,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  activeInput: {
    borderColor: Colors.primary.default,
    backgroundColor: Colors.primary.light,
  },
  button: {
    marginTop: 16,
    width: '100%',
  },
});
