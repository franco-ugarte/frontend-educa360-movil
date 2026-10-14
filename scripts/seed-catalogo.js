// Seed del catálogo — 7 materias, 3 secciones, 12 cursos con horario sin solapes.
// Idempotente. Uso: node scripts/seed-catalogo.js (después de seed-users.js)
// Supuesto: docentes perfil id 1..5 en orden de creación (se verifica).
const BASE = process.env.BACKEND_URL || 'http://localhost:8080';
const API = `${BASE}/api/v1`;
const ADMIN = { email: 'admin@educa360.pe', password: 'Educa@360' };

const PERIODO = { nombre: 'Bimestre I 2026', fechaInicio: '2026-03-02', fechaFin: '2026-05-08' };
// idx: 0 Mat, 1 Com, 2 Cie, 3 His, 4 EF, 5 Arte, 6 Ing
const MATERIAS = [
  { nombre: 'Matemáticas', descripcion: 'Aritmética, álgebra y razonamiento' },
  { nombre: 'Comunicación', descripcion: 'Lectura, escritura y literatura' },
  { nombre: 'Ciencia y Tecnología', descripcion: 'Laboratorio y método científico' },
  { nombre: 'Historia', descripcion: 'Historia del Perú y del mundo' },
  { nombre: 'Educación Física', descripcion: 'Deporte y vida saludable' },
  { nombre: 'Arte', descripcion: 'Expresión plástica y musical' },
  { nombre: 'Inglés', descripcion: 'Inglés como segunda lengua' },
];
// docentePerfilId -> indices de materia
const HABILITACIONES = { 1: [0], 2: [1, 6], 3: [2], 4: [3, 5], 5: [4] };
const SECCIONES = [
  { grado: 4, letra: 'A', aula: 'A-201', tutorId: 1 },
  { grado: 4, letra: 'B', aula: 'A-202', tutorId: 2 },
  { grado: 5, letra: 'A', aula: 'A-301', tutorId: 3 },
];
// [docentePerfilId, materiaIdx, seccionIdx]
const CURSOS = [
  [1, 0, 0], [2, 1, 0], [3, 2, 0], [4, 3, 0],
  [1, 0, 1], [2, 1, 1], [3, 2, 1], [2, 6, 1],
  [1, 0, 2], [3, 2, 2], [5, 4, 2], [4, 5, 2],
];
const HORARIOS = {
  '0-0': [
    { dia: 'LUNES', horaInicio: '08:00', horaFin: '09:30' },
    { dia: 'MIERCOLES', horaInicio: '08:00', horaFin: '09:30' },
  ],
  '1-0': [
    { dia: 'MARTES', horaInicio: '10:00', horaFin: '11:30' },
    { dia: 'JUEVES', horaInicio: '10:00', horaFin: '11:30' },
  ],
  '2-0': [{ dia: 'VIERNES', horaInicio: '08:00', horaFin: '10:00' }],
  '3-0': [{ dia: 'VIERNES', horaInicio: '10:00', horaFin: '11:30' }],
  '0-1': [
    { dia: 'LUNES', horaInicio: '10:00', horaFin: '11:30' },
    { dia: 'MIERCOLES', horaInicio: '10:00', horaFin: '11:30' },
  ],
  '1-1': [
    { dia: 'MARTES', horaInicio: '08:00', horaFin: '09:30' },
    { dia: 'JUEVES', horaInicio: '08:00', horaFin: '09:30' },
  ],
  '2-1': [
    { dia: 'LUNES', horaInicio: '13:00', horaFin: '14:30' },
    { dia: 'MIERCOLES', horaInicio: '13:00', horaFin: '14:30' },
  ],
  '6-1': [{ dia: 'VIERNES', horaInicio: '10:00', horaFin: '11:30' }],
  '0-2': [
    { dia: 'MARTES', horaInicio: '08:00', horaFin: '09:30' },
    { dia: 'JUEVES', horaInicio: '08:00', horaFin: '09:30' },
  ],
  '2-2': [{ dia: 'VIERNES', horaInicio: '10:00', horaFin: '12:00' }],
  '4-2': [{ dia: 'MIERCOLES', horaInicio: '08:00', horaFin: '09:30' }],
  '5-2': [{ dia: 'LUNES', horaInicio: '08:00', horaFin: '09:30' }],
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
  let creados = 0, reusados = 0;

  let periodos = (await call('/admin/periodos', { token })).body || [];
  let periodo = periodos.find((p) => p.nombre === PERIODO.nombre);
  if (!periodo) {
    const r = await call('/admin/periodos', { method: 'POST', body: PERIODO, token });
    if (r.status !== 201) throw new Error('periodo: ' + JSON.stringify(r));
    periodo = r.body; creados++;
  } else reusados++;
  const est = await call(`/admin/periodos/${periodo.id}/estado`, { method: 'PATCH', body: { estado: 'ABIERTO' }, token });
  console.log(`periodo ${periodo.nombre} id=${periodo.id} abrir:`, est.status);

  let materias = (await call('/admin/materias', { token })).body || [];
  const matId = {};
  for (const m of MATERIAS) {
    let found = materias.find((x) => x.nombre === m.nombre);
    if (!found) {
      const r = await call('/admin/materias', { method: 'POST', body: m, token });
      if (r.status !== 201) throw new Error('materia: ' + JSON.stringify(r));
      found = r.body; creados++;
    } else reusados++;
    matId[m.nombre] = found.id;
  }
  const matIds = MATERIAS.map((m) => matId[m.nombre]);

  for (const did of [1, 2, 3, 4, 5]) {
    const r = await call(`/admin/docentes/${did}/materias`, { token });
    if (r.status === 404) {
      console.error(`Docente perfil id=${did} no existe. Corre seed-users.js sobre BD vacía primero.`);
      process.exit(1);
    }
  }
  for (const [did, idxs] of Object.entries(HABILITACIONES)) {
    const r = await call(`/admin/docentes/${did}/materias`, {
      method: 'PUT', body: { materiaIds: idxs.map((i) => matIds[i]) }, token,
    });
    console.log(`habilitar docente ${did}:`, r.status);
  }

  let secciones = (await call(`/admin/secciones?periodoId=${periodo.id}`, { token })).body || [];
  const secIds = [];
  for (const s of SECCIONES) {
    let found = secciones.find((x) => x.grado === s.grado && x.letra === s.letra);
    if (!found) {
      const r = await call('/admin/secciones', { method: 'POST', body: { ...s, periodoId: periodo.id }, token });
      if (r.status !== 201) throw new Error('seccion: ' + JSON.stringify(r));
      found = r.body; creados++;
    } else reusados++;
    secIds.push(found.id);
  }

  for (const [did, mi, si] of CURSOS) {
    const lista = (await call(`/admin/cursos?seccionId=${secIds[si]}`, { token })).body || [];
    let curso = lista.find((c) => c.materiaId === matIds[mi]);
    if (!curso) {
      const r = await call('/admin/cursos', {
        method: 'POST', body: { docenteId: did, materiaId: matIds[mi], seccionId: secIds[si] }, token,
      });
      if (r.status !== 201) throw new Error('curso: ' + JSON.stringify(r));
      curso = r.body; creados++;
    } else reusados++;
    const key = `${mi}-${si}`;
    const h = await call(`/admin/cursos/${curso.id}/horario`, {
      method: 'PUT', body: { bloques: HORARIOS[key] }, token,
    });
    if (h.status === 409) {
      const actual = (await call(`/admin/cursos/${curso.id}/horario`, { token })).body || [];
      const hhmm = (t) => String(t).slice(0, 5);
      const igual = HORARIOS[key].every((b) =>
        actual.some((a) => a.dia === b.dia && hhmm(a.horaInicio) === b.horaInicio && hhmm(a.horaFin) === b.horaFin)
      ) && actual.length === HORARIOS[key].length;
      console.log(`horario curso ${curso.id} (${curso.materiaNombre} ${curso.seccionEtiqueta}): 409 pero hoja ${igual ? 'idéntica, se conserva' : 'DIFERENTE, revisar'}`);
    } else {
      console.log(`horario curso ${curso.id} (${curso.materiaNombre} ${curso.seccionEtiqueta}):`, h.status);
    }
  }

  console.log(`Resumen catálogo: creados=${creados} reusados=${reusados}`);
})();
