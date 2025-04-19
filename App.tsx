
import { enableScreens } from 'react-native-screens';

// Call this function before rendering any navigation stack
enableScreens();



import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (

    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>

  );
}

