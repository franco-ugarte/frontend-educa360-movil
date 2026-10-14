import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../state/AuthContext';

import LoginScreen from '../pages/Login';
import AlumnoPage from '../pages/AlumnoPage';
import ProfesorPage from '../pages/ProfesorPage';
import PadrePage from '../pages/PadrePage';
import SecretariaPage from '../pages/SecretariaPage';
import AdminPage from '../pages/AdminPage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function tabIcon(name, outline) {
  return ({ color, size, focused }) => (
    <Ionicons name={focused ? name : outline || name} size={size} color={color} />
  );
}

const TAB_STYLE = {
  headerShown: false,
  tabBarActiveTintColor: '#5F348F',
  tabBarInactiveTintColor: '#94A3B8',
  tabBarStyle: { borderTopColor: '#E2E8F0' },
};

function AlumnoTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_STYLE}>
      <Tab.Screen name="Alumno" component={AlumnoPage} options={{ title: 'Mi panel', tabBarIcon: tabIcon('home', 'home-outline') }} />
    </Tab.Navigator>
  );
}

function RoleTabs({ rol }) {
  if (rol === 'admin')
    return (
      <Tab.Navigator screenOptions={TAB_STYLE}>
        <Tab.Screen name="Admin" component={AdminPage} options={{ title: 'Panel', tabBarIcon: tabIcon('grid', 'grid-outline') }} />
      </Tab.Navigator>
    );
  if (rol === 'secretaria')
    return (
      <Tab.Navigator screenOptions={TAB_STYLE}>
        <Tab.Screen name="Secretaria" component={SecretariaPage} options={{ title: 'Registro', tabBarIcon: tabIcon('clipboard', 'clipboard-outline') }} />
      </Tab.Navigator>
    );
  if (rol === 'profesor')
    return (
      <Tab.Navigator screenOptions={TAB_STYLE}>
        <Tab.Screen name="Profesor" component={ProfesorPage} options={{ title: 'Portal', tabBarIcon: tabIcon('book', 'book-outline') }} />
      </Tab.Navigator>
    );
  if (rol === 'padre')
    return (
      <Tab.Navigator screenOptions={TAB_STYLE}>
        <Tab.Screen name="Padre" component={PadrePage} options={{ title: 'Hijos', tabBarIcon: tabIcon('people', 'people-outline') }} />
      </Tab.Navigator>
    );
  return <AlumnoTabs />;
}

export default function RootNavigator() {
  const { status, user, appRol } = useAuth();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#5F348F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main">
            {() => <RoleTabs rol={appRol} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
