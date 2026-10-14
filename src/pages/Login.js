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
import CosmicButton from '../components/ui/CosmicButton';
import ErrorCard from '../components/ui/ErrorCard';
import { styles } from '../styles/Login.styles';
import { useAuth } from '../state/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUserFocused, setIsUserFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Validación individual estricta por campo (dominio + mínimo backend 8).
  const validateField = (field, value) => {
    let errorMsg = null;

    if (field === 'usuario') {
      if (!value.trim()) {
        errorMsg = 'El correo institucional es obligatorio.';
      } else if (!value.trim().endsWith('@educa360.pe') && !value.trim().endsWith('@educa360.com')) {
        errorMsg = 'El correo debe pertenecer al dominio @educa360.pe';
      }
    }

    if (field === 'password') {
      if (!value) {
        errorMsg = 'Falta ingresar la contraseña.';
      } else if (value.length < 8) {
        errorMsg = 'La contraseña debe tener al menos 8 caracteres.';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    return errorMsg;
  };

  // useState + backend real: POST /api/v1/auth/login, sesión en AsyncStorage.
  const handleLogin = async () => {
    const userError = validateField('usuario', usuario);
    const passError = validateField('password', password);
    if (userError || passError) return;

    setLoading(true);
    setSubmitError(null);
    try {
      await signIn(usuario, password);
    } catch (e) {
      if (e.status === 401) {
        setSubmitError(e);
      } else if (e.status === 429) {
        Alert.alert('Bloqueado', `Demasiados intentos. Reintenta en ${e.retryAfter || '?'}s.`);
        setSubmitError(e);
      } else {
        setSubmitError(e);
      }
    } finally {
      setLoading(false);
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
              errors.usuario && styles.inputError,
            ]}
            placeholder="ej. nombre@educa360.pe"
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
              errors.password && styles.inputError,
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

          {submitError ? <ErrorCard error={submitError} /> : null}

          <CosmicButton
            title="Ingresar a la Plataforma"
            onPress={handleLogin}
            loading={loading}
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
