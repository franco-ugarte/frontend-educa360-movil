import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../state/AuthContext';
import LoginScreen from '../pages/Login';
import EstudiantePage from '../pages/estudiante/page';
import ApoderadoPage from '../pages/apoderado/page';
import DocentePage from '../pages/docente/page';
import WebOnlyPage from '../pages/WebOnlyPage';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.line,
  },
};

function RoleScreen({ rol }) {
  switch (rol) {
    case 'estudiante':
      return <EstudiantePage />;
    case 'apoderado':
      return <ApoderadoPage />;
    case 'docente':
      return <DocentePage />;
    default:
      return <WebOnlyPage />;
  }
}

export default function RootNavigator() {
  const { status, user, appRol } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main">
            {() => <RoleScreen rol={appRol} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
