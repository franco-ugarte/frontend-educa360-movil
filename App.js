import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './src/state/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

// Stack de sesión + navegación por rol viven en RootNavigator.
// La sesión persiste en AsyncStorage y se restaura al arrancar.
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
