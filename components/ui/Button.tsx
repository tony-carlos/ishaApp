import { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export default function Button({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  labelStyle,
  fullWidth = false,
}: ButtonProps) {
  const getButtonStyles = () => {
    const baseStyle: ViewStyle = {
      borderRadius: Layout.borderRadius.medium,
      opacity: disabled ? 0.6 : 1,
      minHeight: 56,
    };

    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      sm: { paddingVertical: 8, paddingHorizontal: 16 },
      md: { paddingVertical: 12, paddingHorizontal: 20 },
      lg: { paddingVertical: 16, paddingHorizontal: 24 },
    };

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: { backgroundColor: Colors.primary.default },
      secondary: { backgroundColor: Colors.secondary.default },
      outline: {
        backgroundColor: Colors.transparent,
        borderWidth: 1,
        borderColor: Colors.primary.default,
      },
      ghost: { backgroundColor: Colors.transparent },
    };

    const widthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};

    return [baseStyle, sizeStyles[size], variantStyles[variant], widthStyle];
  };

  const getLabelStyles = () => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles: Record<ButtonSize, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    const variantStyles: Record<ButtonVariant, TextStyle> = {
      primary: { color: Colors.text.inverted },
      secondary: { color: Colors.text.inverted },
      outline: { color: Colors.primary.default },
      ghost: { color: Colors.primary.default },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'secondary'
              ? Colors.text.inverted
              : Colors.primary.default
          }
        />
      );
    }

    const labelComponent = (
      <Text style={[getLabelStyles(), labelStyle]}>{label}</Text>
    );

    if (icon) {
      return (
        <View style={styles.row}>
          {iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          {labelComponent}
          {iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      );
    }

    return labelComponent;
  };

  const isPrimary = variant === 'primary';

  if (isPrimary) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.container, fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={[Colors.primary.default, Colors.accent.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[getButtonStyles(), styles.gradient]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        getButtonStyles(),
        styles.container,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 56,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
