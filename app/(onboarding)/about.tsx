import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import { ArrowRight } from 'lucide-react-native';

interface GenderOption {
  id: string;
  label: string;
  value: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
}

interface AgeGroup {
  id: string;
  label: string;
  value: number;
}

const genderOptions: GenderOption[] = [
  { id: 'male', label: 'Male', value: 'male' },
  { id: 'female', label: 'Female', value: 'female' },
  { id: 'non-binary', label: 'Non-binary', value: 'non-binary' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

const ageGroups: AgeGroup[] = [
  { id: 'under18', label: 'Under 18', value: 15 },
  { id: '18-24', label: '18-24', value: 21 },
  { id: '25-34', label: '25-34', value: 30 },
  { id: '35-44', label: '35-44', value: 40 },
  { id: '45-54', label: '45-54', value: 50 },
  { id: '55+', label: '55+', value: 60 },
];

export default function AboutScreen() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  
  const [selectedGender, setSelectedGender] = useState<string>('prefer-not-to-say');
  const [selectedAge, setSelectedAge] = useState<string>('25-34');
  const [isForSelf, setIsForSelf] = useState<boolean>(true);
  
  const handleContinue = async () => {
    try {
      const selectedGenderObj = genderOptions.find(g => g.id === selectedGender);
      const selectedAgeObj = ageGroups.find(a => a.id === selectedAge);
      
      if (selectedGenderObj && selectedAgeObj) {
        await updateUser({
          gender: selectedGenderObj.value,
          age: selectedAgeObj.value,
          isForSelf,
        });
      }
      
      router.push('/(onboarding)/concerns');
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Typography variant="h1" align="center">
          About Yourself
        </Typography>
        <Typography 
          variant="body" 
          align="center" 
          style={styles.subtitle}
        >
          Help us personalize your skincare journey
        </Typography>
      </View>
      
      <View style={styles.section}>
        <Typography variant="h3" style={styles.sectionTitle}>
          Gender
        </Typography>
        
        <View style={styles.optionsContainer}>
          {genderOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedGender === option.id && styles.selectedOption,
              ]}
              onPress={() => setSelectedGender(option.id)}
            >
              <Typography
                variant="body"
                color={selectedGender === option.id ? Colors.primary.default : Colors.text.secondary}
              >
                {option.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Typography variant="h3" style={styles.sectionTitle}>
          Age Group
        </Typography>
        
        <View style={styles.optionsContainer}>
          {ageGroups.map(age => (
            <TouchableOpacity
              key={age.id}
              style={[
                styles.optionButton,
                styles.ageButton,
                selectedAge === age.id && styles.selectedOption,
              ]}
              onPress={() => setSelectedAge(age.id)}
            >
              <Typography
                variant="body"
                color={selectedAge === age.id ? Colors.primary.default : Colors.text.secondary}
              >
                {age.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Typography variant="h3" style={styles.sectionTitle}>
          Is this for you?
        </Typography>
        
        <View style={styles.forContainer}>
          <TouchableOpacity
            style={[
              styles.forButton,
              isForSelf && styles.selectedOption,
            ]}
            onPress={() => setIsForSelf(true)}
          >
            <Typography
              variant="body"
              color={isForSelf ? Colors.primary.default : Colors.text.secondary}
            >
              Yes, for myself
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.forButton,
              !isForSelf && styles.selectedOption,
            ]}
            onPress={() => setIsForSelf(false)}
          >
            <Typography
              variant="body"
              color={!isForSelf ? Colors.primary.default : Colors.text.secondary}
            >
              No, for someone else
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
      
      <Button
        label="Continue"
        onPress={handleContinue}
        variant="primary"
        size="lg"
        fullWidth
        icon={<ArrowRight size={20} color={Colors.neutral.white} />}
        iconPosition="right"
        style={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  contentContainer: {
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
    backgroundColor: Colors.neutral.lightest,
  },
  ageButton: {
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: Colors.primary.default,
    backgroundColor: Colors.primary.light,
  },
  forContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  forButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
    backgroundColor: Colors.neutral.lightest,
  },
  button: {
    marginTop: 16,
  },
});