import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../state/AuthContext';
import { DocenteDataProvider, useDocenteData } from './data';
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
import HorarioView from './views/HorarioView';
import AsistenciaView from './views/AsistenciaView';
import AvisosView from './views/AvisosView';
import PerfilView from './views/PerfilView';
import { colors } from '../../theme';
import { primerNombre } from '../../utils/format';
import { styles } from './styles';

const TABS = [
  { id: 'inicio', label: 'Inicio', icon: 'home', iconOutline: 'home-outline' },
  { id: 'horario', label: 'Horario', icon: 'calendar', iconOutline: 'calendar-outline' },
  {
    id: 'asistencia',
    label: 'Asistencia',
    icon: 'checkmark-done',
    iconOutline: 'checkmark-done-outline',
  },
  {
    id: 'avisos',
    label: 'Avisos',
    icon: 'megaphone',
    iconOutline: 'megaphone-outline',
  },
  { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
];

const META = {
  inicio: { kicker: 'Panel del docente' },
  horario: { kicker: 'Mi horario' },
  asistencia: { kicker: 'Asistencia' },
  avisos: { kicker: 'Avisos express' },
  perfil: { kicker: 'Mi perfil' },
};

function DocenteShell() {
  const { user } = useAuth();
  const {
    cursos,
    curso,
    selectCurso,
    comunicados,
    noLeidas,
    setNoLeidas,
    refreshComunicados,
  } = useDocenteData();

  const [tab, setTab] = useState('inicio');
  const [overlay, setOverlay] = useState(null);
  const [asistenciaPrefill, setAsistenciaPrefill] = useState(null);
  const [avisosCompose, setAvisosCompose] = useState(false);
  const insets = useSafeAreaInsets();

  // Tocar un push abre su sección (o la bandeja), incluso en arranque en frío.
  useEffect(() => {
    const abrir = (respuesta) => {
      const destino = destinoNotificacion(datosDePush(respuesta), 'DOCENTE');
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
  const subtitle =
    tab === 'perfil'
      ? 'Datos de tu cuenta'
      : tab === 'inicio'
        ? cursos.length
          ? `${cursos.length} ${cursos.length === 1 ? 'curso' : 'cursos'} · ${cursos[0]?.anioNombre || 'Año escolar'}`
          : 'Tu aula móvil'
        : tab === 'avisos'
          ? 'Mensajes para tus secciones'
          : curso
            ? `${curso.materiaNombre} · ${curso.seccionEtiqueta}`
            : meta.kicker;

  const abrirAsistencia = useCallback(
    (prefill) => {
      if (prefill?.cursoId) selectCurso(prefill.cursoId);
      setAsistenciaPrefill(prefill ? { ...prefill } : {});
      setTab('asistencia');
    },
    [selectCurso]
  );

  const consumirAsistenciaPrefill = useCallback(
    () => setAsistenciaPrefill(null),
    []
  );

  const abrirNuevoAviso = useCallback(() => {
    setAvisosCompose(true);
    setTab('avisos');
  }, []);

  const consumirAvisosCompose = useCallback(() => setAvisosCompose(false), []);

  const renderView = () => {
    switch (tab) {
      case 'horario':
        return <HorarioView onTomarAsistencia={abrirAsistencia} />;
      case 'asistencia':
        return (
          <AsistenciaView
            prefill={asistenciaPrefill}
            onConsumePrefill={consumirAsistenciaPrefill}
          />
        );
      case 'avisos':
        return (
          <AvisosView
            openCompose={avisosCompose}
            onConsumeCompose={consumirAvisosCompose}
          />
        );
      case 'perfil':
        return <PerfilView onNavigate={setTab} />;
      default:
        return (
          <InicioView
            onNavigate={setTab}
            onOpenComunicados={() => setOverlay('comunicados')}
            onTomarAsistencia={abrirAsistencia}
            onNuevoAviso={abrirNuevoAviso}
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
              Hola, {primerNombre(user?.nombres, 'docente')}
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

        <Text style={styles.heroSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </LinearGradient>

      <View style={styles.viewBody}>{renderView()}</View>

      <GradientButtonGroup tabs={TABS} activeTab={tab} onSelectTab={setTab} />

      <Overlay
        visible={overlay === 'comunicados'}
        onClose={() => setOverlay(null)}
        title="Comunicados"
        subtitle="Avisos del colegio y de tus secciones"
      >
        {overlay === 'comunicados' ? (
          <ComunicadosPanel
            comunicados={comunicados}
            onRefresh={refreshComunicados}
          />
        ) : null}
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

export default function DocentePage() {
  return (
    <DocenteDataProvider>
      <DocenteShell />
    </DocenteDataProvider>
  );
}
