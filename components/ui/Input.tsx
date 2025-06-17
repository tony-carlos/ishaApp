import React, { useState, ReactNode } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import Typography from './Typography';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helper?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  maxLength?: number;
}

export default function Input({
  value,
  onChangeText,
  label,
  placeholder,
  error,
  helper,
  secureTextEntry,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  disabled = false,
  maxLength,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Typography 
          variant="bodySmall" 
          style={styles.label}
        >
          {label}
        </Typography>
      )}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error ? styles.error : null,
          disabled && styles.disabled,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.light}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            styles.input,
            icon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          maxLength={maxLength}
        />
        
        {rightIcon && (
          <TouchableOpacity
            disabled={!onRightIconPress}
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helper) && (
        <Typography
          variant="caption"
          style={[styles.helper, error && styles.errorText]}
        >
          {error || helper}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    marginBottom: Layout.spacing.xs,
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.light,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.neutral.white,
  },
  focused: {
    borderColor: Colors.primary.default,
  },
  error: {
    borderColor: Colors.error.default,
  },
  disabled: {
    backgroundColor: Colors.neutral.lightest,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    color: Colors.text.primary,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: Layout.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Layout.spacing.xs,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  iconContainer: {
    paddingLeft: Layout.spacing.md,
  },
  rightIconContainer: {
    paddingRight: Layout.spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  helper: {
    marginTop: Layout.spacing.xs,
  },
  errorText: {
    color: Colors.error.default,
  },
});