import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
} from 'react-native';

import { profesores } from '../data/profesores';
import { cursos } from '../data/cursos';

export default function ProfesorPage({ usuario, setPage }) {

  const profesor = profesores.find(
    (p) => p.id === usuario.personaId
  );

  const misCursos = cursos.filter(
    (curso) => curso.profesorId === usuario.personaId
  );

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Portal del Profesor
      </Text>

      <Text style={styles.text}>
        Bienvenido, {profesor?.nombre}
      </Text>

      <Text style={styles.subtitle}>
        Mis cursos:
      </Text>

      {misCursos.map((curso) => (
        <Text
          key={curso.id}
          style={styles.course}
        >
          • {curso.nombre}
        </Text>
      ))}

      <Button
        title="Cerrar sesión"
        onPress={() => setPage('login')}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  text: {
    fontSize: 18,
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  course: {
    fontSize: 18,
    marginBottom: 8,
  },
});
