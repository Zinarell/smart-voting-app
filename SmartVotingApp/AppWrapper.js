import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';

export default function AppWrapper() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}