import { useEffect } from 'react';
import {
  prepararRecordatorios,
  sincronizarRecordatorios,
} from '../services/recordatorios';

/**
 * Mantiene los recordatorios locales alineados con el horario del rol.
 *
 * En el primer arranque pide permiso; si el usuario los apaga desde Perfil,
 * no vuelve a preguntar. El horario se re-sincroniza cuando cambia (por
 * ejemplo, al cambiar de hijo en el apoderado).
 */
export default function useRecordatorios({ rol, horario, cursos, nombre, seccion }) {
  useEffect(() => {
    let vivo = true;

    (async () => {
      const activo = await prepararRecordatorios();
      if (!vivo || !activo) return;
      await sincronizarRecordatorios({ rol, horario, cursos, nombre, seccion });
    })();

    return () => {
      vivo = false;
    };
  }, [rol, horario, cursos, nombre, seccion]);
}
