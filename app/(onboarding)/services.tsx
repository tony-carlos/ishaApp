import {
  StyleSheet,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Search, Shop, Consultation, Game } from '@/utils/icons';

const services = [
  {
    id: 'face-scan',
    title: 'Face Scanning',
    description:
      'Analyze your skin with AI technology for personalized recommendations',
    icon: <Search size={28} color={Colors.primary.dark} />,
    image: 'https://images.pexels.com/photos/3373716/pexels-photo-3373716.jpeg',
  },
  {
    id: 'ordering',
    title: 'Ordering Site',
    description: 'Shop for recommended products tailored to your skin needs',
    icon: <Shop size={28} color={Colors.primary.dark} />,
    image: 'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg',
  },
  {
    id: 'consultation',
    title: 'Skincare Consultation',
    description: 'Chat with dermatologists for professional advice',
    icon: <Consultation size={28} color={Colors.primary.dark} />,
    image: 'https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg',
  },
  {
    id: 'game',
    title: 'Refreshing Game',
    description: 'Have fun while learning about skincare',
    icon: <Game size={28} color={Colors.primary.dark} />,
    image: 'https://images.pexels.com/photos/3951355/pexels-photo-3951355.jpeg',
  },
];

export default function ServicesScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(onboarding)/login');
  };

  const renderServiceItem = ({ item }) => {
    return (
      <Card style={styles.serviceCard} elevation={2}>
        <Image source={{ uri: item.image }} style={styles.serviceImage} />
        <View style={styles.serviceContent}>
          <View style={styles.iconContainer}>{item.icon}</View>
          <Typography variant="h3" style={styles.serviceTitle}>
            {item.title}
          </Typography>
          <Typography variant="bodySmall" style={styles.serviceDescription}>
            {item.description}
          </Typography>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.light, Colors.neutral.white]}
        style={styles.headerGradient}
      >
        <Typography variant="display" style={styles.title} align="center">
          ISHER CARE
        </Typography>

        <Typography
          variant="h4"
          style={styles.subtitle}
          align="center"
          color={Colors.text.secondary}
        >
          Beauty powered by Science
        </Typography>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <Typography variant="h2" style={styles.sectionTitle}>
          Our Services
        </Typography>

        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.servicesList}
        />

        <Button
          label="Get Started"
          onPress={handleGetStarted}
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
  headerGradient: {
    paddingTop: 80,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.8,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  servicesList: {
    paddingBottom: 16,
  },
  serviceCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 0,
  },
  serviceImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  serviceContent: {
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    marginBottom: 8,
  },
  serviceDescription: {
    opacity: 0.8,
  },
  button: {
    marginTop: 16,
  },
});
