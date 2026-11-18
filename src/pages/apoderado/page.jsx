import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../state/AuthContext';
import { ApoderadoDataProvider, useApoderadoData } from './data';
import { alResponderPush, consumirPushInicial } from '../../services/push';
import {
  datosDePush,
  destinoNotificacion,
} from '../../services/notificacionRuta';
import GradientButtonGroup from '../../components/ui/GradientButtonGroup';
import Overlay from '../../components/ui/Overlay';
import ComunicadosPanel from '../../components/domain/ComunicadosPanel';
import NotificacionesPanel from '../../components/domain/NotificacionesPanel';
import InicioView from './views/InicioView';
import NotasView from './views/NotasView';
import AsistenciaView from './views/AsistenciaView';
import JustificacionesView from './views/JustificacionesView';
import HorarioView from './views/HorarioView';
import PerfilView from './views/PerfilView';
import { colors } from '../../theme';
import { primerNombre } from '../../utils/format';
import { styles } from './styles';

const TABS = [
  { id: 'inicio', label: 'Inicio', icon: 'home', iconOutline: 'home-outline' },
  { id: 'notas', label: 'Notas', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
  {
    id: 'asistencia',
    label: 'Asistencia',
    icon: 'checkmark-done',
    iconOutline: 'checkmark-done-outline',
  },
  {
    id: 'justificar',
    label: 'Justificar',
    icon: 'document-text',
    iconOutline: 'document-text-outline',
  },
  { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
];

const META = {
  inicio: { kicker: 'Panel del apoderado' },
  notas: { kicker: 'Calificaciones' },
  asistencia: { kicker: 'Asistencia' },
  justificar: { kicker: 'Justificaciones' },
  perfil: { kicker: 'Mi perfil' },
};

function ApoderadoShell() {
  const { user } = useAuth();
  const {
    hijo,
    comunicados,
    noLeidas,
    setNoLeidas,
    refreshComunicados,
  } = useApoderadoData();
  const [tab, setTab] = useState('inicio');
  const [overlay, setOverlay] = useState(null);
  const [justificarPrefill, setJustificarPrefill] = useState(null);
  const insets = useSafeAreaInsets();

  // Tocar un push abre su sección (o la bandeja), incluso en arranque en frío.
  useEffect(() => {
    const abrir = (respuesta) => {
      const destino = destinoNotificacion(datosDePush(respuesta), 'APODERADO');
      if (!destino) {
        setOverlay('notificaciones');
        return;
      }
      setOverlay(destino.overlay || null);
      if (destino.tab) setTab(destino.tab);
    };
    const sub = alResponderPush(abrir);
    consumirPushInicial().then((respuesta) => {
      if (respuesta) abrir(respuesta);
    });
    return () => sub.remove();
  }, []);

  const meta = META[tab] || META.inicio;
  const childLine = hijo
    ? hijo.seccionEtiqueta
      ? `${hijo.seccionEtiqueta} · ${hijo.anioNombre}`
      : 'Sin matrícula vigente'
    : 'Seguimiento de tus hijos';
  const subtitle =
    tab === 'perfil'
      ? 'Datos de tu cuenta'
      : tab === 'inicio'
        ? childLine
        : hijo
          ? `${hijo.nombres} · ${meta.kicker}`
          : meta.kicker;

  const abrirJustificar = useCallback((prefill) => {
    setJustificarPrefill(prefill || null);
    setTab('justificar');
  }, []);

  const consumirPrefill = useCallback(() => setJustificarPrefill(null), []);

  const renderView = () => {
    const keyChild = hijo?.estudianteId ?? 'none';
    switch (tab) {
      case 'notas':
        return <NotasView key={`notas-${keyChild}`} />;
      case 'asistencia':
        return (
          <AsistenciaView
            key={`asistencia-${keyChild}`}
            onJustificar={abrirJustificar}
            onGoJustificaciones={() => abrirJustificar(null)}
            onOpenHorario={() => setOverlay('horario')}
          />
        );
      case 'justificar':
        return (
          <JustificacionesView
            key={`justificar-${keyChild}`}
            prefill={justificarPrefill}
            onConsumePrefill={consumirPrefill}
          />
        );
      case 'perfil':
        return <PerfilView onNavigate={setTab} />;
      default:
        return (
          <InicioView
            onNavigate={setTab}
            onOpenComunicados={() => setOverlay('comunicados')}
            onOpenHorario={() => setOverlay('horario')}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={[colors.primary, colors.primaryMuted]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.heroGlow} pointerEvents="none" />
        <View style={styles.heroGlowSoft} pointerEvents="none" />
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroKicker}>{meta.kicker}</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              Hola, {primerNombre(user?.nombres, 'familia')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bellButton}
            activeOpacity={0.85}
            accessibilityLabel="Notificaciones"
            onPress={() => setOverlay('notificaciones')}
          >
            <Ionicons name="notifications-outline" size={21} color="#FFFFFF" />
            {noLeidas > 0 ? (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {noLeidas > 9 ? '9+' : noLeidas}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <Text style={styles.heroSub} numberOfLines={1}>{subtitle}</Text>
      </LinearGradient>

      <View style={styles.viewBody}>{renderView()}</View>

      <GradientButtonGroup tabs={TABS} activeTab={tab} onSelectTab={setTab} />

      <Overlay
        visible={overlay === 'comunicados'}
        onClose={() => setOverlay(null)}
        title="Comunicados"
        subtitle="Avisos del colegio para tus hijos"
      >
        {overlay === 'comunicados' ? (
          <ComunicadosPanel comunicados={comunicados} onRefresh={refreshComunicados} />
        ) : null}
      </Overlay>

      <Overlay
        visible={overlay === 'horario'}
        onClose={() => setOverlay(null)}
        title="Horario de clases"
        subtitle={
          hijo
            ? `${hijo.nombres} · ${hijo.seccionEtiqueta || 'Sin matrícula'}`
            : 'Seguimiento de tus hijos'
        }
      >
        {overlay === 'horario' ? <HorarioView /> : null}
      </Overlay>

      <Overlay
        visible={overlay === 'notificaciones'}
        onClose={() => setOverlay(null)}
        title="Notificaciones"
        subtitle={noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al día'}
      >
        {overlay === 'notificaciones' ? (
          <NotificacionesPanel noLeidas={noLeidas} onCountChange={setNoLeidas} />
        ) : null}
      </Overlay>
    </View>
  );
}

export default function ApoderadoPage() {
  return (
    <ApoderadoDataProvider>
      <ApoderadoShell />
    </ApoderadoDataProvider>
  );
}
