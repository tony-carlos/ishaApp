import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { User, ArrowRight } from '@/utils/icons';

export default function DependentInfoScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/(onboarding)/about');
    }, 1000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" align="center">
          Dependent Information
        </Typography>
        <Typography variant="body" align="center" style={styles.subtitle}>
          Please provide information about your dependent
        </Typography>
      </View>
      <View style={styles.form}>
        <Input
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter full name"
          icon={<User size={20} color={Colors.neutral.medium} />}
        />
        <Input
          label="Relationship"
          value={relationship}
          onChangeText={setRelationship}
          placeholder="Relationship (e.g. Child, Parent)"
        />
        <Input
          label="Age"
          value={age}
          onChangeText={setAge}
          placeholder="Enter age"
          keyboardType="number-pad"
        />
        <Button
          label="Continue"
          onPress={handleContinue}
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          icon={<ArrowRight size={20} color={Colors.neutral.white} />}
          iconPosition="right"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.neutral.white,
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
  button: {
    marginTop: 16,
  },
});
