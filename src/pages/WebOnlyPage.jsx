import React from 'react';
import RoleNotice from '../components/ui/RoleNotice';
import { useAuth } from '../state/AuthContext';

/**
 * ADMIN y SECRETARÍA gestionan todo desde la web: en móvil solo ven un aviso
 * amable y pueden cambiar de cuenta.
 */
export default function WebOnlyPage() {
  const { signOut } = useAuth();
  return (
    <RoleNotice
      icon="laptop-outline"
      kicker="Acceso web"
      title="Esta app es para estudiantes, familias y docentes"
      message="La gestión académica y administrativa de Educa360 está disponible en la versión web."
      bullets={[
        { icon: 'grid-outline', text: 'Años, secciones, cursos y horarios en la web' },
        { icon: 'clipboard-outline', text: 'Matrículas y justificaciones desde el escritorio' },
        { icon: 'phone-portrait-outline', text: 'Aquí ingresa con una cuenta de estudiante, apoderado o docente' },
      ]}
      onSignOut={signOut}
      footer="Educa360 · Colegio Nuestra Señora de Monserrat"
    />
  );
}
