import React, { forwardRef } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface AuthButtonProps extends TouchableOpacityProps {
  loading?: boolean;
  children: React.ReactNode;
  textStyle?: object;
}

export const AuthButton = forwardRef<TouchableOpacity, AuthButtonProps>(
  ({ loading, children, style, textStyle, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.button, style]}
        disabled={loading}
        {...props}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={[styles.text, textStyle]}>
            {children}
          </ThemedText>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 