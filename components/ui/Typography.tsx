import { StyleSheet, Text, StyleProp, TextStyle } from 'react-native';
import Colors from '@/constants/Colors';

type TypographyVariant = 
  | 'display'
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body' 
  | 'bodySmall' 
  | 'caption'
  | 'overline';

interface TypographyProps {
  variant?: TypographyVariant;
  style?: StyleProp<TextStyle>;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  children: React.ReactNode;
  numberOfLines?: number;
}

export default function Typography({
  variant = 'body',
  style,
  color,
  align,
  children,
  numberOfLines,
}: TypographyProps) {
  
  const variantStyle = styles[variant];
  const colorStyle = color ? { color } : {};
  const alignStyle = align ? { textAlign: align } : {};
  
  return (
    <Text
      style={[variantStyle, colorStyle, alignStyle, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

// Using a typesafe way to define styles for our variants
const createTextVariants = () => {
  const variants: Record<TypographyVariant, TextStyle> = {
    display: {
      fontFamily: 'Poppins-Bold', 
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700',
      letterSpacing: -0.5,
      color: Colors.text.primary,
    },
    h1: {
      fontFamily: 'Poppins-Bold',
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700',
      color: Colors.text.primary,
    },
    h2: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '600',
      color: Colors.text.primary,
    },
    h3: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600',
      color: Colors.text.primary,
    },
    h4: {
      fontFamily: 'Poppins-Medium',
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '500',
      color: Colors.text.primary,
    },
    body: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      lineHeight: 24, // 150% of font size
      fontWeight: '400',
      color: Colors.text.secondary,
    },
    bodySmall: {
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      lineHeight: 21, // 150% of font size
      fontWeight: '400',
      color: Colors.text.secondary,
    },
    caption: {
      fontFamily: 'Poppins-Regular',
      fontSize: 12,
      lineHeight: 18, // 150% of font size
      fontWeight: '400',
      color: Colors.text.tertiary,
    },
    overline: {
      fontFamily: 'Poppins-Medium',
      fontSize: 10,
      lineHeight: 12,
      fontWeight: '500',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: Colors.text.tertiary,
    },
  };
  
  return StyleSheet.create(variants);
};

const styles = createTextVariants();