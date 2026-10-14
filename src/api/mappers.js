// Backend: ADMIN/SECRETARIA/DOCENTE/ESTUDIANTE/APODERADO.
// App interna: admin/secretaria/profesor/alumno/padre (colores y tabs existentes).
const MAP = {
  ADMIN: 'admin',
  SECRETARIA: 'secretaria',
  DOCENTE: 'profesor',
  ESTUDIANTE: 'alumno',
  APODERADO: 'padre',
};

export function mapRol(backendRol) {
  return MAP[backendRol] || 'alumno';
}

export function displayName(user) {
  if (!user) return 'Usuario';
  const full = `${user.nombres || ''} ${user.apellidos || ''}`.trim();
  return full || user.email || 'Usuario';
}

export function initialsOf(name) {
  return String(name || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
