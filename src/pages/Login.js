import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CosmicButton from '../components/ui/CosmicButton';
import ErrorCard from '../components/ui/ErrorCard';
import { styles } from '../styles/Login.styles';
import { useAuth } from '../state/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(null);

  const validateEmail = (value) => {
    if (!value.trim()) return 'Ingresa tu correo institucional.';
    if (!EMAIL_RE.test(value.trim())) return 'El correo no tiene un formato válido.';
    return null;
  };

  // useState + backend real: POST /api/v1/auth/login, sesión en AsyncStorage.
  const handleLogin = async () => {
    const emailError = validateEmail(email);
    const passwordError = password ? null : 'Ingresa tu contraseña.';
    setErrors({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;

    setLoading(true);
    setSubmitError(null);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e) {
      setSubmitError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FC" />
      <View style={styles.ambientGlow} pointerEvents="none" />
      <View style={styles.ambientGlowSoft} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 22 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitle}>
            Tus notas, asistencia y avisos del colegio, en un solo lugar.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Correo institucional</Text>
          <View
            style={[
              styles.inputRow,
              focus === 'email' && styles.inputRowFocused,
              errors.email && styles.inputRowError,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color={focus === 'email' ? '#5F348F' : '#94A3B8'}
            />
            <TextInput
              style={styles.input}
              placeholder="nombre@educa360.pe"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              onFocus={() => setFocus('email')}
              onBlur={() => {
                setFocus(null);
                validateEmail(email);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Contraseña</Text>
          <View
            style={[
              styles.inputRow,
              focus === 'password' && styles.inputRowFocused,
              errors.password && styles.inputRowError,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={focus === 'password' ? '#5F348F' : '#94A3B8'}
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              onFocus={() => setFocus('password')}
              onBlur={() => setFocus(null)}
              textContentType="password"
              autoComplete="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={19}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {submitError ? <ErrorCard error={submitError} /> : null}

          <CosmicButton
            title="Ingresar a la plataforma"
            onPress={handleLogin}
            loading={loading}
          />

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() =>
              Alert.alert(
                'Recuperación de acceso',
                'Comunícate con el área de soporte del colegio para recuperar tu contraseña institucional.'
              )
            }
          >
            <Text style={styles.helpText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.roleRow}>
          <View style={styles.roleChip}>
            <Ionicons name="school-outline" size={13} color="#5F348F" />
            <Text style={styles.roleChipText}>Estudiante</Text>
          </View>
          <View style={styles.roleChip}>
            <Ionicons name="people-outline" size={13} color="#5F348F" />
            <Text style={styles.roleChipText}>Apoderado</Text>
          </View>
          <View style={styles.roleChip}>
            <Ionicons name="easel-outline" size={13} color="#5F348F" />
            <Text style={styles.roleChipText}>Docente</Text>
          </View>
        </View>

        <Text style={styles.webNote}>
          La gestión administrativa se realiza en la versión web.
        </Text>
        <Text style={styles.footer}>
          Educa360 · Colegio Nuestra Señora de Monserrat
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
