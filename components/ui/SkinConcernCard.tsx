import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Typography from './Typography';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Check } from '@/utils/icons';

interface SkinConcernCardProps {
  title: string;
  imageUrl: ImageSourcePropType;
  selected?: boolean;
  onSelect: () => void;
  description?: string;
}

export default function SkinConcernCard({
  title,
  imageUrl,
  selected = false,
  onSelect,
  description,
}: SkinConcernCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      activeOpacity={0.9}
      onPress={onSelect}
    >
      <Image source={imageUrl} style={styles.image} resizeMode="cover" />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <Typography
          variant="h4"
          color={Colors.neutral.white}
          style={styles.title}
        >
          {title}
        </Typography>

        {description && (
          <Typography variant="caption" color={Colors.neutral.white}>
            {description}
          </Typography>
        )}
      </View>

      {selected && (
        <View style={styles.selectedIndicator}>
          <Check size={18} color={Colors.neutral.white} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
    height: 160,
    marginBottom: Layout.spacing.md,
    position: 'relative',
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.primary.default,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Layout.spacing.md,
  },
  title: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.primary.default,
    borderRadius: Layout.borderRadius.full,
    padding: 4,
  },
});
