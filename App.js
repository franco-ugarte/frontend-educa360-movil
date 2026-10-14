import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import Login from './src/pages/Login';
import AlumnoPage from './src/pages/AlumnoPage';
import ProfesorPage from './src/pages/ProfesorPage';
import PadrePage from './src/pages/PadrePage';

export default function App() {
  const [page, setPage] = useState('login');
  const [usuario, setUsuario] = useState(null);

  const handleLogin = (usuarioEncontrado) => {
    setUsuario(usuarioEncontrado);
    setPage(usuarioEncontrado.rol);
  };

  let content;

  switch (page) {
    case 'alumno':
      content = (
        <AlumnoPage
          usuario={usuario}
          setPage={setPage}
        />
      );
      break;

    case 'profesor':
      content = (
        <ProfesorPage
          usuario={usuario}
          setPage={setPage}
        />
      );
      break;

    case 'padre':
      content = (
        <PadrePage
          usuario={usuario}
          setPage={setPage}
        />
      );
      break;

    default:
      content = <Login onLogin={handleLogin} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
        />

        {content}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5F348F', 
  },
});