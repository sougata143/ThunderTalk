import React from 'react';
import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Verify() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Check Your Email
      </ThemedText>
      
      <ThemedText style={styles.description}>
        We've sent you an email with a verification link. Please check your inbox and click the link to verify your account.
      </ThemedText>

      <Link href="/(auth)/sign-in" style={styles.link}>
        <ThemedText type="link">Back to Sign In</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  link: {
    marginTop: 20,
  },
}); 