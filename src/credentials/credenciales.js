// Credenciales del dataset coherente. Clave única: Educa@360. Dominio: @educa360.pe
// Se crean con scripts/seed-users.js (+ seed-catalogo.js, seed-matriculas.js). No son mock.
export const SEED_PASSWORD = 'Educa@360';

export const SEED_USERS = [
  { rol: 'ADMIN', email: 'admin@educa360.pe' },
  { rol: 'SECRETARIA', email: 'patricia.leon@educa360.pe' },
  { rol: 'DOCENTE', email: 'maria.lopez@educa360.pe', materia: 'Matemáticas' },
  { rol: 'DOCENTE', email: 'roberto.mendoza@educa360.pe', materia: 'Comunicación, Inglés' },
  { rol: 'DOCENTE', email: 'elena.torres@educa360.pe', materia: 'Ciencia y Tecnología' },
  { rol: 'DOCENTE', email: 'miguel.torres@educa360.pe', materia: 'Historia, Arte' },
  { rol: 'DOCENTE', email: 'rosa.diaz@educa360.pe', materia: 'Educación Física' },
  { rol: 'ESTUDIANTE', email: 'juan.perez@educa360.pe', seccion: '4°A' },
  { rol: 'ESTUDIANTE', email: 'ana.gomez@educa360.pe', seccion: '4°A' },
  { rol: 'ESTUDIANTE', email: 'luis.perez@educa360.pe', seccion: '4°A' },
  { rol: 'ESTUDIANTE', email: 'rosa.huaman@educa360.pe', seccion: '4°A' },
  { rol: 'ESTUDIANTE', email: 'mateo.quispe@educa360.pe', seccion: '4°B' },
  { rol: 'ESTUDIANTE', email: 'elena.quispe@educa360.pe', seccion: '4°B' },
  { rol: 'ESTUDIANTE', email: 'diego.flores@educa360.pe', seccion: '4°B' },
  { rol: 'ESTUDIANTE', email: 'sofia.ramos@educa360.pe', seccion: '5°A' },
  { rol: 'ESTUDIANTE', email: 'pedro.castillo@educa360.pe', seccion: '5°A' },
  { rol: 'ESTUDIANTE', email: 'carmen.vega@educa360.pe', seccion: '5°A' },
  { rol: 'APODERADO', email: 'carlos.perez@educa360.pe', hijos: 'Juan y Luis Pérez' },
  { rol: 'APODERADO', email: 'carmen.gomez@educa360.pe', hijos: 'Ana Gómez' },
  { rol: 'APODERADO', email: 'jose.quispe@educa360.pe', hijos: 'Mateo y Elena Quispe' },
  { rol: 'APODERADO', email: 'elena.flores@educa360.pe', hijos: 'Diego Flores' },
  { rol: 'APODERADO', email: 'jorge.ramos@educa360.pe', hijos: 'Sofía Ramos' },
  { rol: 'APODERADO', email: 'rosa.castillo@educa360.pe', hijos: 'Pedro Castillo' },
  { rol: 'APODERADO', email: 'luis.vega@educa360.pe', hijos: 'Carmen Vega' },
  { rol: 'APODERADO', email: 'juana.huaman@educa360.pe', hijos: 'Rosa Huamán' },
];
