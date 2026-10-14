// Seed de usuarios contra el backend real. Idempotente (409 = ya existe).
// Uso: node scripts/seed-users.js
const BASE = process.env.BACKEND_URL || 'http://localhost:8080';
const API = `${BASE}/api/v1`;

const ADMIN = {
  email: 'admin@educa360.pe', password: 'Educa@360',
  nombres: 'Dirección', apellidos: 'General', dni: '00000001', telefonos: ['+51999000001'],
};

const PLAN = [
  { rol: 'SECRETARIA', path: '/admin/secretarias', usuario: { email: 'secretaria@educa360.pe', password: 'Educa@360', nombres: 'Rosa', apellidos: 'Quispe', dni: '00000002', telefonos: ['+51999000002'] }, perfil: {} },
  { rol: 'DOCENTE', path: '/admin/docentes', usuario: { email: 'docente1@educa360.pe', password: 'Educa@360', nombres: 'María', apellidos: 'López', dni: '00000011', telefonos: ['+51999000011'] }, perfil: { titulo: 'Lic. Matemáticas' } },
  { rol: 'DOCENTE', path: '/admin/docentes', usuario: { email: 'docente2@educa360.pe', password: 'Educa@360', nombres: 'Roberto', apellidos: 'Mendoza', dni: '00000012', telefonos: ['+51999000012'] }, perfil: { titulo: 'Lic. Comunicación' } },
  { rol: 'DOCENTE', path: '/admin/docentes', usuario: { email: 'docente3@educa360.pe', password: 'Educa@360', nombres: 'Elena', apellidos: 'Torres', dni: '00000013', telefonos: ['+51999000013'] }, perfil: { titulo: 'Lic. Ciencia' } },
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'alumno1@educa360.pe', password: 'Educa@360', nombres: 'Juan', apellidos: 'Pérez', dni: '00000101' }, perfil: { fechaNacimiento: '2011-04-10' } },
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'alumno2@educa360.pe', password: 'Educa@360', nombres: 'Ana', apellidos: 'Gómez', dni: '00000102' }, perfil: { fechaNacimiento: '2011-08-22' } },
  { rol: 'ESTUDIANTE', path: '/secretaria/estudiantes', usuario: { email: 'alumno3@educa360.pe', password: 'Educa@360', nombres: 'Mateo', apellidos: 'Quispe', dni: '00000103' }, perfil: { fechaNacimiento: '2012-01-15' } },
  { rol: 'APODERADO', path: '/secretaria/apoderados', usuario: { email: 'apoderado1@educa360.pe', password: 'Educa@360', nombres: 'Carlos', apellidos: 'Pérez', dni: '00000201', telefonos: ['+51999200201'] }, perfil: {} },
  { rol: 'APODERADO', path: '/secretaria/apoderados', usuario: { email: 'apoderado2@educa360.pe', password: 'Educa@360', nombres: 'Lucía', apellidos: 'Gómez', dni: '00000202', telefonos: ['+51999200202'] }, perfil: {} },
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
  // 1. Alta inicial del ADMIN (solo con BD vacía; 403 = ya hay usuarios).
  const reg = await call('/auth/register', { method: 'POST', body: ADMIN });
  console.log('register admin:', reg.status, reg.body?.user?.email || reg.body?.message || '');

  // 2. Login ADMIN.
  const login = await call('/auth/login', { method: 'POST', body: { email: ADMIN.email, password: ADMIN.password } });
  if (login.status !== 200) {
    console.error('No se pudo loguear ADMIN:', login.status, JSON.stringify(login.body));
    process.exit(1);
  }
  const token = login.body.token;
  console.log('login admin OK, expira en', login.body.expiresIn, 's');

  // 3. Crear el resto (409 = ya existe, se considera OK).
  let ok = 0, exists = 0, fail = 0;
  for (const item of PLAN) {
    const r = await call(item.path, { method: 'POST', body: { usuario: item.usuario, perfil: item.perfil }, token });
    if (r.status === 201) { ok++; console.log(`201 ${item.rol} ${item.usuario.email}`); }
    else if (r.status === 409) { exists++; console.log(`409 existe ${item.rol} ${item.usuario.email}`); }
    else { fail++; console.log(`FAIL ${r.status} ${item.rol} ${item.usuario.email}:`, JSON.stringify(r.body)); }
  }

  // 4. Verificar login de cada credencial.
  for (const email of ['secretaria@educa360.pe', 'docente1@educa360.pe', 'alumno1@educa360.pe', 'apoderado1@educa360.pe', 'admin@educa360.pe']) {
    const v = await call('/auth/login', { method: 'POST', body: { email, password: 'Educa@360' } });
    console.log(`verify ${email}:`, v.status, v.body?.user?.rol || JSON.stringify(v.body));
  }

  console.log(`Resumen: creados=${ok} existentes=${exists} fallos=${fail}`);
  process.exit(fail ? 1 : 0);
})();
