import { ReactNode } from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 0 | 1 | 2 | 3;
  padded?: boolean;
}

export default function Card({ 
  children, 
  style, 
  elevation = 1,
  padded = true 
}: CardProps) {
  const elevationStyle = ELEVATION_STYLES[elevation];
  
  return (
    <View 
      style={[
        styles.card, 
        elevationStyle, 
        padded && styles.padded,
        style
      ]}
    >
      {children}
    </View>
  );
}

const ELEVATION_STYLES = {
  0: {},
  1: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  2: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4, 
  },
  3: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
  },
  padded: {
    padding: Layout.spacing.md,
  },
});