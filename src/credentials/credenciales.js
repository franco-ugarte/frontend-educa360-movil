// Credenciales seed del colegio. Clave única: Educa@360. Dominio: @educa360.pe
// Se crean contra el backend real (ver scripts/seed-users.js). No son mock.
export const SEED_PASSWORD = 'Educa@360';

export const SEED_USERS = [
  {
    rol: 'ADMIN',
    usuario: { email: 'admin@educa360.pe', password: SEED_PASSWORD, nombres: 'Dirección', apellidos: 'General', dni: '00000001', telefonos: ['+51999000001'] },
    perfil: null, via: 'register|admin/usuarios',
  },
  {
    rol: 'SECRETARIA',
    usuario: { email: 'secretaria@educa360.pe', password: SEED_PASSWORD, nombres: 'Rosa', apellidos: 'Quispe', dni: '00000002', telefonos: ['+51999000002'] },
    perfil: {}, via: 'admin/secretarias',
  },
  {
    rol: 'DOCENTE',
    usuario: { email: 'docente1@educa360.pe', password: SEED_PASSWORD, nombres: 'María', apellidos: 'López', dni: '00000011', telefonos: ['+51999000011'] },
    perfil: { titulo: 'Lic. Matemáticas' }, via: 'admin/docentes',
  },
  {
    rol: 'DOCENTE',
    usuario: { email: 'docente2@educa360.pe', password: SEED_PASSWORD, nombres: 'Roberto', apellidos: 'Mendoza', dni: '00000012', telefonos: ['+51999000012'] },
    perfil: { titulo: 'Lic. Comunicación' }, via: 'admin/docentes',
  },
  {
    rol: 'DOCENTE',
    usuario: { email: 'docente3@educa360.pe', password: SEED_PASSWORD, nombres: 'Elena', apellidos: 'Torres', dni: '00000013', telefonos: ['+51999000013'] },
    perfil: { titulo: 'Lic. Ciencia' }, via: 'admin/docentes',
  },
  {
    rol: 'ESTUDIANTE',
    usuario: { email: 'alumno1@educa360.pe', password: SEED_PASSWORD, nombres: 'Juan', apellidos: 'Pérez', dni: '00000101' },
    perfil: { fechaNacimiento: '2011-04-10' }, via: 'secretaria/estudiantes',
  },
  {
    rol: 'ESTUDIANTE',
    usuario: { email: 'alumno2@educa360.pe', password: SEED_PASSWORD, nombres: 'Ana', apellidos: 'Gómez', dni: '00000102' },
    perfil: { fechaNacimiento: '2011-08-22' }, via: 'secretaria/estudiantes',
  },
  {
    rol: 'ESTUDIANTE',
    usuario: { email: 'alumno3@educa360.pe', password: SEED_PASSWORD, nombres: 'Mateo', apellidos: 'Quispe', dni: '00000103' },
    perfil: { fechaNacimiento: '2012-01-15' }, via: 'secretaria/estudiantes',
  },
  {
    rol: 'APODERADO',
    usuario: { email: 'apoderado1@educa360.pe', password: SEED_PASSWORD, nombres: 'Carlos', apellidos: 'Pérez', dni: '00000201', telefonos: ['+51999200201'] },
    perfil: {}, via: 'secretaria/apoderados',
  },
  {
    rol: 'APODERADO',
    usuario: { email: 'apoderado2@educa360.pe', password: SEED_PASSWORD, nombres: 'Lucía', apellidos: 'Gómez', dni: '00000202', telefonos: ['+51999200202'] },
    perfil: {}, via: 'secretaria/apoderados',
  },
];
