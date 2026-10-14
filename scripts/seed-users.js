// Seed de usuarios — dataset coherente del colegio (25 cuentas, clave única Educa@360).
// Idempotente (409 = ya existe). Uso: node scripts/seed-users.js
const BASE = process.env.BACKEND_URL || 'http://localhost:8080';
const API = `${BASE}/api/v1`;
const PASS = 'Educa@360';

const ADMIN = {
  email: 'admin@educa360.pe', password: PASS,
  nombres: 'Dirección', apellidos: 'General', dni: '00000001', telefonos: ['+51999000001'],
};

// Orden de creación = id de perfil 1..5 en BD vacía (lo verifica seed-catalogo.js).
const PLAN = [
  { rol: 'SECRETARIA', path: '/admin/secretarias', usuario: { email: 'patricia.leon@educa360.pe', password: PASS, nombres: 'Patricia', apellidos: 'León', dni: '00000002', telefonos: ['+51999000002'] }, perfil: {} },
  { rol: 'DOCENTE', path: '/admin/docentes', usuario: { email: 'maria.lopez@educa360.pe', password: PASS, nombres: 'María', apellidos: 'López', dni: '00000011', telefonos: ['+51999000011'] }, perfil: { titulo: 'Lic. Matemáticas' } },
  { rol: 'DOCENTE', path: '/admin/docentes', usuario: { email: 'roberto.mendoza@educa360.pe', password: PASS, nombres: 'Roberto', apellidos: 'Mendoza', dni: '00000012', telefonos: ['+51999000012'] }, perfil: { titulo: 'Lic. Comunicación' } },
  { rol: 'DOCENTE', path: '/admin/docentes', usuario: { email: 'elena.torres@educa360.pe', password: PASS, nombres: 'Elena', apellidos: 'Torres', dni: '00000013', telefonos: ['+51999000013'] }, perfil: { titulo: 'Lic. Ciencia y Tecnología' } },
  { rol: 'DOCENTE', path: '/admin/docentes', usuario: { email: 'miguel.torres@educa360.pe', password: PASS, nombres: 'Miguel', apellidos: 'Torres', dni: '00000014', telefonos: ['+51999000014'] }, perfil: { titulo: 'Lic. Historia y Arte' } },
  { rol: 'DOCENTE', path: '/admin/docentes', usuario: { email: 'rosa.diaz@educa360.pe', password: PASS, nombres: 'Rosa', apellidos: 'Díaz', dni: '00000015', telefonos: ['+51999000015'] }, perfil: { titulo: 'Lic. Educación Física' } },
  // 4°A
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'juan.perez@educa360.pe', password: PASS, nombres: 'Juan', apellidos: 'Pérez', dni: '00000101' }, perfil: { fechaNacimiento: '2011-04-10' } },
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'ana.gomez@educa360.pe', password: PASS, nombres: 'Ana', apellidos: 'Gómez', dni: '00000102' }, perfil: { fechaNacimiento: '2011-08-22' } },
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'luis.perez@educa360.pe', password: PASS, nombres: 'Luis', apellidos: 'Pérez', dni: '00000103' }, perfil: { fechaNacimiento: '2012-02-05' } },
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'rosa.huaman@educa360.pe', password: PASS, nombres: 'Rosa', apellidos: 'Huamán', dni: '00000104' }, perfil: { fechaNacimiento: '2011-11-30' } },
  // 4°B
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'mateo.quispe@educa360.pe', password: PASS, nombres: 'Mateo', apellidos: 'Quispe', dni: '00000105' }, perfil: { fechaNacimiento: '2012-01-15' } },
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'elena.quispe@educa360.pe', password: PASS, nombres: 'Elena', apellidos: 'Quispe', dni: '00000106' }, perfil: { fechaNacimiento: '2011-06-18' } },
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'diego.flores@educa360.pe', password: PASS, nombres: 'Diego', apellidos: 'Flores', dni: '00000107' }, perfil: { fechaNacimiento: '2011-09-09' } },
  // 5°A
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'sofia.ramos@educa360.pe', password: PASS, nombres: 'Sofía', apellidos: 'Ramos', dni: '00000108' }, perfil: { fechaNacimiento: '2010-05-25' } },
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'pedro.castillo@educa360.pe', password: PASS, nombres: 'Pedro', apellidos: 'Castillo', dni: '00000109' }, perfil: { fechaNacimiento: '2010-12-01' } },
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'carmen.vega@educa360.pe', password: PASS, nombres: 'Carmen', apellidos: 'Vega', dni: '00000110' }, perfil: { fechaNacimiento: '2010-07-14' } },
  // Apoderados (uno por familia; Carlos y José con 2 hijos cada uno)
  { rol: 'APODERADO', path: '/secretaria/apoderados', usuario: { email: 'carlos.perez@educa360.pe', password: PASS, nombres: 'Carlos', apellidos: 'Pérez', dni: '00000201', telefonos: ['+51999200201'] }, perfil: {} },
  { rol: 'APODERADO', path: '/secretaria/apoderados', usuario: { email: 'carmen.gomez@educa360.pe', password: PASS, nombres: 'Carmen', apellidos: 'Gómez', dni: '00000202', telefonos: ['+51999200202'] }, perfil: {} },
  { rol: 'APODERADO', path: '/secretaria/apoderados', usuario: { email: 'jose.quispe@educa360.pe', password: PASS, nombres: 'José', apellidos: 'Quispe', dni: '00000203', telefonos: ['+51999200203'] }, perfil: {} },
  { rol: 'APODERADO', path: '/secretaria/apoderados', usuario: { email: 'elena.flores@educa360.pe', password: PASS, nombres: 'Elena', apellidos: 'Flores', dni: '00000204', telefonos: ['+51999200204'] }, perfil: {} },
  { rol: 'APODERADO', path: '/secretaria/apoderados', usuario: { email: 'jorge.ramos@educa360.pe', password: PASS, nombres: 'Jorge', apellidos: 'Ramos', dni: '00000205', telefonos: ['+51999200205'] }, perfil: {} },
  { rol: 'APODERADO', path: '/secretaria/apoderados', usuario: { email: 'rosa.castillo@educa360.pe', password: PASS, nombres: 'Rosa', apellidos: 'Castillo', dni: '00000206', telefonos: ['+51999200206'] }, perfil: {} },
  { rol: 'APODERADO', path: '/secretaria/apoderados', usuario: { email: 'luis.vega@educa360.pe', password: PASS, nombres: 'Luis', apellidos: 'Vega', dni: '00000207', telefonos: ['+51999200207'] }, perfil: {} },
  { rol: 'APODERADO', path: '/secretaria/apoderados', usuario: { email: 'juana.huaman@educa360.pe', password: PASS, nombres: 'Juana', apellidos: 'Huamán', dni: '00000208', telefonos: ['+51999200208'] }, perfil: {} },
];

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

(async () => {
  const reg = await call('/auth/register', { method: 'POST', body: ADMIN });
  console.log('register admin:', reg.status, reg.body?.user?.email || reg.body?.message || '');

  const login = await call('/auth/login', { method: 'POST', body: { email: ADMIN.email, password: ADMIN.password } });
  if (login.status !== 200) {
    console.error('No se pudo loguear ADMIN:', login.status, JSON.stringify(login.body));
    process.exit(1);
  }
  const token = login.body.token;
  console.log('login admin OK, expira en', login.body.expiresIn, 's');

  let ok = 0, exists = 0, fail = 0;
  for (const item of PLAN) {
    const r = await call(item.path, { method: 'POST', body: { usuario: item.usuario, perfil: item.perfil }, token });
    if (r.status === 201) { ok++; console.log(`201 ${item.rol} ${item.usuario.email}`); }
    else if (r.status === 409) { exists++; console.log(`409 existe ${item.rol} ${item.usuario.email}`); }
    else { fail++; console.log(`FAIL ${r.status} ${item.rol} ${item.usuario.email}:`, JSON.stringify(r.body)); }
  }
  console.log(`Resumen usuarios: creados=${ok} existentes=${exists} fallos=${fail}`);
  process.exit(fail ? 1 : 0);
})();
