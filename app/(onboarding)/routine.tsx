import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import { ArrowRight, Check } from '@/utils/icons';
import Card from '@/components/ui/Card';
import { getEncouragementMessage } from '@/utils/helpers';

// Define types for routine-related data
interface RoutineOption {
  id: string;
  label: string;
  value: boolean;
}

interface SunscreenOption {
  id: string;
  label: string;
  value: 'never' | 'sometimes' | 'often' | 'always';
}

interface ProductOption {
  id: string;
  label: string;
}

// Define static data
const routineOptions: RoutineOption[] = [
  { id: 'yes', label: 'Yes, I follow a routine', value: true },
  { id: 'no', label: "No, I don't have a routine", value: false },
];

const productOptions: ProductOption[] = [
  { id: 'cleanser', label: 'Facial Cleanser' },
  { id: 'toner', label: 'Toner' },
  { id: 'serum', label: 'Serum' },
  { id: 'moisturizer', label: 'Moisturizer' },
  { id: 'sunscreen', label: 'Sunscreen' },
  { id: 'eye-cream', label: 'Eye Cream' },
  { id: 'mask', label: 'Face Mask' },
  { id: 'exfoliator', label: 'Exfoliator' },
  { id: 'acne-treatment', label: 'Acne Treatment' },
  { id: 'retinol', label: 'Retinol/Retinoid' },
];

const sunscreenOptions: SunscreenOption[] = [
  { id: 'never', label: 'Never', value: 'never' },
  { id: 'sometimes', label: 'Sometimes', value: 'sometimes' },
  { id: 'often', label: 'Often', value: 'often' },
  { id: 'always', label: 'Every day', value: 'always' },
];

export default function RoutineScreen() {
  const router = useRouter();
  const { user, updateUser } = useUser();

  const [hasRoutine, setHasRoutine] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [sunscreenFrequency, setSunscreenFrequency] =
    useState<string>('sometimes');

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleContinue = async () => {
    try {
      const sunscreenValue =
        sunscreenOptions.find((option) => option.id === sunscreenFrequency)
          ?.value || 'sometimes';

      await updateUser({
        has_routine: hasRoutine,
        current_products: selectedProducts,
        sunscreen_frequency: sunscreenValue,
      });

      router.push('/(onboarding)/scan');
    } catch (error) {
      console.error('Failed to update routine info:', error);
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
            Your Skincare Habits
          </Typography>
          <Typography variant="body" align="center" style={styles.subtitle}>
            Tell us about your current skincare routine
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Do you have a daily skincare routine?
          </Typography>

          <View style={styles.optionsContainer}>
            {routineOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  hasRoutine === option.value && styles.selectedOption,
                ]}
                onPress={() => setHasRoutine(option.value)}
              >
                <Typography
                  variant="body"
                  color={
                    hasRoutine === option.value
                      ? Colors.primary.default
                      : Colors.text.secondary
                  }
                >
                  {option.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {hasRoutine && (
          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Which products do you currently use?
            </Typography>

            <View style={styles.productsGrid}>
              {productOptions.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productButton,
                    selectedProducts.includes(product.id) &&
                      styles.selectedProduct,
                  ]}
                  onPress={() => toggleProduct(product.id)}
                >
                  {selectedProducts.includes(product.id) && (
                    <View style={styles.checkIcon}>
                      <Check size={16} color={Colors.neutral.white} />
                    </View>
                  )}
                  <Typography
                    variant="bodySmall"
                    color={
                      selectedProducts.includes(product.id)
                        ? Colors.primary.default
                        : Colors.text.secondary
                    }
                  >
                    {product.label}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            How often do you wear sunscreen?
          </Typography>

          <View style={styles.sunscreenOptions}>
            {sunscreenOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sunscreenButton,
                  sunscreenFrequency === option.id && styles.selectedSunscreen,
                ]}
                onPress={() => setSunscreenFrequency(option.id)}
              >
                <Typography
                  variant="body"
                  color={
                    sunscreenFrequency === option.id
                      ? Colors.primary.default
                      : Colors.text.secondary
                  }
                >
                  {option.label}
                </Typography>
              </TouchableOpacity>
            ))}
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

        <Typography
          variant="bodySmall"
          align="center"
          color={Colors.primary.dark}
          style={styles.encouragement}
        >
          {getEncouragementMessage()}
        </Typography>
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
    paddingBottom: 80,
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
    gap: 16,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
    backgroundColor: Colors.neutral.lightest,
  },
  selectedOption: {
    borderColor: Colors.primary.default,
    backgroundColor: Colors.primary.light,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
    backgroundColor: Colors.neutral.lightest,
    marginBottom: 8,
    position: 'relative',
  },
  selectedProduct: {
    borderColor: Colors.primary.default,
    backgroundColor: Colors.primary.light,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary.default,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunscreenOptions: {
    gap: 12,
  },
  sunscreenButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
    backgroundColor: Colors.neutral.lightest,
  },
  selectedSunscreen: {
    borderColor: Colors.primary.default,
    backgroundColor: Colors.primary.light,
  },
  button: {
    marginTop: 16,
  },
  encouragement: {
    marginTop: 16,
    fontStyle: 'italic',
  },
});
