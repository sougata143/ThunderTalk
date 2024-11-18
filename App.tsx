import React from 'react';
import { Stack } from 'expo-router';
import { ExpoRoot } from 'expo-router';

export default function App() {
  return <ExpoRoot context={require.context('./app')} />;
} 