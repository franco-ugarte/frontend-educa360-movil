import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import CosmicButton from '../components/ui/CosmicButton';
import { styles } from '../styles/Login.styles';
import { usuarios } from '../data/usuarios';

export default function Login({ onLogin = () => {} }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isUserFocused, setIsUserFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Validación individual estricta por campo
  const validateField = (field, value) => {
    let errorMsg = null;

    if (field === 'usuario') {
      if (!value.trim()) {
        errorMsg = 'El correo institucional es obligatorio.';
      } else if (!value.trim().endsWith('@educa360.com') && !value.trim().endsWith('@educa360.pe')) {
        errorMsg = 'El correo debe pertenecer al dominio @educa360.com';
      }
    }

    if (field === 'password') {
      if (!value) {
        errorMsg = 'Falta ingresar la contraseña.';
      } else if (value.length < 4) {
        errorMsg = 'La contraseña debe tener al menos 4 caracteres.';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    return errorMsg;
  };

  const handleLogin = () => {
    const userError = validateField('usuario', usuario);
    const passError = validateField('password', password);

    if (userError || passError) {
      return;
    }

    const inputClean = usuario.trim().toLowerCase();
    const passClean = password.trim();

    const usuarioEncontrado = usuarios.find(
      (u) =>
        u.email.trim().toLowerCase() === inputClean &&
        u.password.trim() === passClean
    );

    if (usuarioEncontrado) {
      setErrors({});
      onLogin(usuarioEncontrado);
    } else {
      Alert.alert(
        'Acceso Denegado',
        'El correo o la contraseña ingresados son incorrectos. Verifica tus datos e intenta nuevamente.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.ambientGlow} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            Acompañamiento escolar y seguimiento preventivo
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Correo Institucional</Text>
          <TextInput
            style={[
              styles.input,
              isUserFocused && styles.inputFocused,
              errors.usuario && styles.inputError, // Cambia el borde a rojo si hay error en estilos
            ]}
            placeholder="ej. nombre@educa360.com"
            placeholderTextColor="#94A3B8"
            value={usuario}
            onChangeText={(text) => {
              setUsuario(text);
              if (errors.usuario) validateField('usuario', text);
            }}
            onFocus={() => setIsUserFocused(true)}
            onBlur={() => {
              setIsUserFocused(false);
              validateField('usuario', usuario);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          {errors.usuario && (
            <Text style={styles.errorText}>{errors.usuario}</Text>
          )}

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Contraseña</Text>
          <TextInput
            style={[
              styles.input,
              isPasswordFocused && styles.inputFocused,
              errors.password && styles.inputError, // Cambia el borde a rojo si hay error en estilos
            ]}
            placeholder="••••••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) validateField('password', text);
            }}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => {
              setIsPasswordFocused(false);
              validateField('password', password);
            }}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <CosmicButton
            title="Ingresar a la Plataforma"
            onPress={handleLogin}
          />

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() =>
              Alert.alert(
                'Recuperación de Acceso',
                'Comunícate con el área de soporte tecnológico.'
              )
            }
          >
            <Text style={styles.helpText}>¿Olvidaste tu contraseña institucional?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};