import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { colors } from '../../theme';

const LOGO = require('../../../assets/logo.png');

/**
 * Pantalla amable para roles que aún no tienen módulo móvil
 * (apoderado/docente) o que gestionan todo desde la web (admin/secretaría).
 */
export default function RoleNotice({
  icon = 'construct-outline',
  kicker = 'Educa360 Móvil',
  title,
  message,
  bullets = [],
  onSignOut,
  footer = 'Gracias por acompañarnos.',
}) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 26,
          paddingBottom: 26,
          paddingHorizontal: 22,
          flexGrow: 1,
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={26} color={colors.primary} />
          </View>

          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.bullets}>
            {bullets.map((item) => (
              <View key={item.text} style={styles.bulletRow}>
                <View style={styles.bulletIcon}>
                  <Ionicons name={item.icon} size={14} color={colors.primary} />
                </View>
                <Text style={styles.bulletText}>{item.text}</Text>
              </View>
            ))}
          </View>

          {onSignOut ? (
            <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={onSignOut}>
              <Ionicons name="log-out-outline" size={18} color={colors.primary} />
              <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.footer}>{footer}</Text>
      </ScrollView>
    </LinearGradient>
  );
}

RoleNotice.propTypes = {
  icon: PropTypes.string,
  kicker: PropTypes.string,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  bullets: PropTypes.arrayOf(PropTypes.shape({ icon: PropTypes.string, text: PropTypes.string })),
  onSignOut: PropTypes.func,
  footer: PropTypes.string,
};

const styles = {
  logoWrap: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 22,
    width: 170,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 140, height: 95 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  kicker: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primaryMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 27,
  },
  message: {
    fontSize: 13,
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 9,
  },
  bullets: { alignSelf: 'stretch', gap: 9, marginTop: 20 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  bulletIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: { flex: 1, fontSize: 12, color: colors.textSoft, fontWeight: '600', lineHeight: 17 },
  button: {
    marginTop: 24,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    paddingVertical: 13,
  },
  buttonText: { color: colors.primary, fontSize: 13.5, fontWeight: '800' },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 18,
    fontWeight: '600',
  },
};
