import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AuthButton } from '@/components/auth/AuthButton';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Index() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/(tabs)/chats" />;
  }

  const handleSkip = () => {
    router.push('/(tabs)/chats');
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['rgba(10, 126, 164, 0.2)', 'transparent']}
        style={styles.gradient}
      />
      
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            Thunder Talk
          </ThemedText>
        </View>
        <ThemedText style={styles.subtitle}>
          Connect instantly. Chat seamlessly.
        </ThemedText>
        <ThemedText style={styles.description}>
          Experience lightning-fast messaging with end-to-end encryption and seamless file sharing.
        </ThemedText>
      </View>

      <View style={styles.buttons}>
        <AuthButton 
          onPress={handleSignIn}
          style={styles.signInButton}
        >
          Get Started
        </AuthButton>
        <AuthButton 
          onPress={handleSkip} 
          style={styles.skipButton}
          textStyle={styles.skipButtonText}
        >
          Continue as Guest
        </AuthButton>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: '20%',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0a7ea4',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 50,
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: '#334155',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttons: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    gap: 16,
  },
  signInButton: {
    backgroundColor: '#0a7ea4',
    height: 56,
    borderRadius: 28,
    shadowColor: '#0a7ea4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  skipButton: {
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#0a7ea4',
  },
  skipButtonText: {
    color: '#0a7ea4',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
  },
}); 