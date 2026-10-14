// Seed Módulo 3: 10 matrículas + 10 vínculos (un principal por alumno).
// Idempotente. Uso: node scripts/seed-matriculas.js
const BASE = process.env.BACKEND_URL || 'http://localhost:8080';
const API = `${BASE}/api/v1`;
const ADMIN = { email: 'admin@educa360.pe', password: 'Educa@360' };

const MATRICULAS = {
  'juan.perez@educa360.pe': { seccion: '4°A', estado: 'PAGADO' },
  'ana.gomez@educa360.pe': { seccion: '4°A', estado: 'PAGADO' },
  'luis.perez@educa360.pe': { seccion: '4°A', estado: 'PAGADO' },
  'rosa.huaman@educa360.pe': { seccion: '4°A', estado: 'PAGADO' },
  'mateo.quispe@educa360.pe': { seccion: '4°B', estado: 'PAGADO' },
  'elena.quispe@educa360.pe': { seccion: '4°B', estado: 'PAGADO' },
  'diego.flores@educa360.pe': { seccion: '4°B', estado: 'PENDIENTE' },
  'sofia.ramos@educa360.pe': { seccion: '5°A', estado: 'PAGADO' },
  'pedro.castillo@educa360.pe': { seccion: '5°A', estado: 'PAGADO' },
  'carmen.vega@educa360.pe': { seccion: '5°A', estado: 'PAGADO' },
};
const VINCULOS = {
  'carlos.perez@educa360.pe': [
    { alumno: 'juan.perez@educa360.pe', parentesco: 'PADRE', responsablePrincipal: true },
    { alumno: 'luis.perez@educa360.pe', parentesco: 'PADRE', responsablePrincipal: true },
  ],
  'carmen.gomez@educa360.pe': [
    { alumno: 'ana.gomez@educa360.pe', parentesco: 'MADRE', responsablePrincipal: true },
  ],
  'jose.quispe@educa360.pe': [
    { alumno: 'mateo.quispe@educa360.pe', parentesco: 'PADRE', responsablePrincipal: true },
    { alumno: 'elena.quispe@educa360.pe', parentesco: 'PADRE', responsablePrincipal: true },
  ],
  'elena.flores@educa360.pe': [
    { alumno: 'diego.flores@educa360.pe', parentesco: 'MADRE', responsablePrincipal: true },
  ],
  'jorge.ramos@educa360.pe': [
    { alumno: 'sofia.ramos@educa360.pe', parentesco: 'PADRE', responsablePrincipal: true },
  ],
  'rosa.castillo@educa360.pe': [
    { alumno: 'pedro.castillo@educa360.pe', parentesco: 'MADRE', responsablePrincipal: true },
  ],
  'luis.vega@educa360.pe': [
    { alumno: 'carmen.vega@educa360.pe', parentesco: 'PADRE', responsablePrincipal: true },
  ],
  'juana.huaman@educa360.pe': [
    { alumno: 'rosa.huaman@educa360.pe', parentesco: 'MADRE', responsablePrincipal: true },
  ],
};

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
  const login = await call('/auth/login', { method: 'POST', body: ADMIN });
  if (login.status !== 200) {
    console.error('Sin ADMIN:', login.status, JSON.stringify(login.body));
    process.exit(1);
  }
  const token = login.body.token;
  let creados = 0, reusados = 0, fallos = 0;

  const estudiantes = await call('/secretaria/estudiantes', { token });
  const apoderados = await call('/secretaria/apoderados', { token });
  const secciones = await call('/admin/secciones', { token });
  if ([estudiantes, apoderados, secciones].some((r) => r.status !== 200)) {
    console.error('Faltan endpoints. ¿Backend reconstruido?');
    process.exit(1);
  }
  const estByEmail = Object.fromEntries(estudiantes.body.map((e) => [e.email, e]));
  const apoByEmail = Object.fromEntries(apoderados.body.map((a) => [a.email, a]));
  const secByEtiqueta = Object.fromEntries(secciones.body.map((s) => [s.etiqueta, s]));

  for (const [email, plan] of Object.entries(MATRICULAS)) {
    const est = estByEmail[email];
    const sec = secByEtiqueta[plan.seccion];
    if (!est || !sec) {
      fallos++;
      console.log(`FAIL ${email}: falta estudiante o sección ${plan.seccion}`);
      continue;
    }
    const r = await call('/secretaria/matriculas', {
      method: 'POST', body: { estudianteId: est.id, seccionId: sec.id }, token,
    });
    const matId = r.body?.id;
    if (r.status === 201) {
      creados++;
      console.log(`201 matrícula ${email} → ${plan.seccion} (id=${matId})`);
    } else if (r.status === 409) {
      reusados++;
      console.log(`409 existe matrícula ${email} → ${plan.seccion}`);
    } else {
      fallos++;
      console.log(`FAIL matrícula ${email}:`, r.status, JSON.stringify(r.body));
      continue;
    }
    if (matId && plan.estado !== 'PENDIENTE') {
      const e2 = await call(`/secretaria/matriculas/${matId}/estado`, {
        method: 'PATCH', body: { estado: plan.estado }, token,
      });
      console.log(`  estado → ${plan.estado}:`, e2.status);
    }
  }

  for (const [apoEmail, lista] of Object.entries(VINCULOS)) {
    const apo = apoByEmail[apoEmail];
    if (!apo) {
      fallos++;
      console.log(`FAIL: falta apoderado ${apoEmail}`);
      continue;
    }
    for (const v of lista) {
      const est = estByEmail[v.alumno];
      if (!est) {
        fallos++;
        console.log(`FAIL: falta estudiante ${v.alumno}`);
        continue;
      }
      const r = await call(`/secretaria/apoderados/${apo.id}/representados`, {
        method: 'POST',
        body: { estudianteId: est.id, parentesco: v.parentesco, responsablePrincipal: v.responsablePrincipal },
        token,
      });
      if (r.status === 201) {
        creados++;
        console.log(`201 vínculo ${apoEmail} → ${v.alumno} (${v.parentesco})`);
      } else if (r.status === 409) {
        reusados++;
        console.log(`409 existe vínculo ${apoEmail} → ${v.alumno}`);
      } else {
        fallos++;
        console.log(`FAIL vínculo ${apoEmail} → ${v.alumno}:`, r.status, JSON.stringify(r.body));
      }
    }
  }
  console.log(`Resumen módulo 3: creados=${creados} reusados=${reusados} fallos=${fallos}`);
  process.exit(fallos ? 1 : 0);
})();
