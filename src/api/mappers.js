// Backend: ADMIN/SECRETARIA/DOCENTE/ESTUDIANTE/APODERADO.
// App móvil: estudiante/apoderado/docente; las cuentas de gestión usan la web.
const MAP = {
  ADMIN: 'admin',
  SECRETARIA: 'secretaria',
  DOCENTE: 'docente',
  ESTUDIANTE: 'estudiante',
  APODERADO: 'apoderado',
};

export function mapRol(backendRol) {
  return MAP[backendRol] || null;
}

export function displayName(user) {
  if (!user) return 'Usuario';
  const full = `${user.nombres || ''} ${user.apellidos || ''}`.trim();
  return full || user.email || 'Usuario';
}
