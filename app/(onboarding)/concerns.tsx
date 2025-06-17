import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import { ArrowRight, Check } from 'lucide-react-native';
import SkinConcernCard from '@/components/ui/SkinConcernCard';
import { skinConcerns } from '@/assets/data/skinConcerns';
import { getEncouragementMessage } from '@/utils/helpers';

export default function ConcernsScreen() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  
  const toggleConcern = (id: string) => {
    setSelectedConcerns(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleContinue = async () => {
    try {
      await updateUser({
        skinConcerns: selectedConcerns,
      });
      
      router.push('/(onboarding)/routine');
    } catch (error) {
      console.error('Failed to update concerns:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Typography variant="h1" align="center">
            Skin Concerns
          </Typography>
          <Typography 
            variant="body" 
            align="center" 
            style={styles.subtitle}
          >
            Select all the concerns that apply to your skin
          </Typography>
        </View>
        
        <View style={styles.concernsContainer}>
          {skinConcerns.map(concern => (
            <SkinConcernCard
              key={concern.id}
              title={concern.title}
              description={concern.description}
              imageUrl={concern.imageUrl}
              selected={selectedConcerns.includes(concern.id)}
              onSelect={() => toggleConcern(concern.id)}
            />
          ))}
        </View>
        
        <View style={styles.selectionSummary}>
          <Typography variant="bodySmall" color={Colors.text.tertiary}>
            {selectedConcerns.length} concern{selectedConcerns.length !== 1 ? 's' : ''} selected
          </Typography>
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
        
        {selectedConcerns.length > 0 && (
          <Typography 
            variant="bodySmall" 
            align="center" 
            color={Colors.primary.dark}
            style={styles.encouragement}
          >
            {getEncouragementMessage()}
          </Typography>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  scrollContent: {
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
  concernsContainer: {
    gap: 16,
  },
  selectionSummary: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
  },
  encouragement: {
    marginTop: 16,
    fontStyle: 'italic',
  },
});