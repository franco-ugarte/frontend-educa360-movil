// Horario escolar compartido por los tres roles: días del backend, fechas
// locales, bimestres y agrupación semanal. Todo se maneja como Date local
// sin hora para evitar desfases de zona.

export const DIAS_SEMANA = [
  'DOMINGO',
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
];

export const DIAS_ORDEN = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
];

export const DIA_CORTO = {
  LUNES: 'Lun',
  MARTES: 'Mar',
  MIERCOLES: 'Mié',
  JUEVES: 'Jue',
  VIERNES: 'Vie',
  SABADO: 'Sáb',
};

export const DIA_LARGO = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
};

export function hoySinHora() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function sumarDias(date, dias) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + dias);
  return d;
}

export function diaDeFecha(date) {
  return DIAS_SEMANA[date.getDay()];
}

export function fechaDesdeApi(text) {
  const [anio, mes, dia] = String(text || '').slice(0, 10).split('-').map(Number);
  if (!anio || !mes || !dia) return null;
  return new Date(anio, mes - 1, dia);
}

export function dentroDe(date, inicio, fin) {
  const d = date.getTime();
  const desde = fechaDesdeApi(inicio);
  const hasta = fechaDesdeApi(fin);
  if (!desde || !hasta) return false;
  return d >= desde.getTime() && d <= hasta.getTime();
}

/** Retrocede hasta el día de la semana indicado (mismo día si coincide). */
export function ajustarAlDiaBloque(date, dia) {
  const objetivo = DIAS_SEMANA.indexOf(dia);
  if (objetivo < 0) return date;
  const actual = date.getDay();
  const delta = (actual - objetivo + 7) % 7;
  return sumarDias(date, -delta);
}

/** Bimestre (de cualquier estado) que contiene la fecha. */
export function bimestreDeFecha(bimestres, date) {
  if (!date) return null;
  return (
    (bimestres || []).find((b) => dentroDe(date, b.fechaInicio, b.fechaFin)) ||
    null
  );
}

/** Bimestre ABIERTO que contiene la fecha, si existe. */
export function bimestreAbiertoDeFecha(bimestres, date) {
  const bimestre = bimestreDeFecha(bimestres, date);
  return bimestre?.estado === 'ABIERTO' ? bimestre : null;
}

/**
 * Fecha inicial razonable para tomar asistencia de un bloque:
 * el día más reciente del bloque dentro de un bimestre ABIERTO.
 */
export function fechaSugeridaParaBloque(bloque, bimestres) {
  const hoy = hoySinHora();
  if (!bloque?.dia) return hoy;

  const ordenados = [...(bimestres || [])].sort((a, b) =>
    String(a.fechaFin).localeCompare(String(b.fechaFin))
  );
  const abiertos = ordenados.filter((b) => b.estado === 'ABIERTO');

  const activo = abiertos.find((b) => dentroDe(hoy, b.fechaInicio, b.fechaFin));
  const abiertosPasados = abiertos.filter(
    (b) => fechaDesdeApi(b.fechaFin) <= hoy
  );
  const todosPasados = ordenados.filter(
    (b) => fechaDesdeApi(b.fechaFin) <= hoy
  );

  const referencia =
    activo ||
    abiertosPasados[abiertosPasados.length - 1] ||
    todosPasados[todosPasados.length - 1] ||
    null;

  if (!referencia) return ajustarAlDiaBloque(hoy, bloque.dia);

  const inicio = fechaDesdeApi(referencia.fechaInicio);
  const fin = fechaDesdeApi(referencia.fechaFin);
  const tope = new Date(Math.min(fin.getTime(), hoy.getTime()));
  let fecha = ajustarAlDiaBloque(tope, bloque.dia);

  if (inicio && fecha.getTime() < inicio.getTime()) {
    let primera = new Date(inicio);
    while (diaDeFecha(primera) !== bloque.dia) {
      primera = sumarDias(primera, 1);
    }
    if (primera.getTime() <= fin.getTime() && primera.getTime() <= hoy.getTime()) {
      fecha = primera;
    }
  }

  return fecha;
}

/** Duración en minutos de un bloque "HH:MM:SS" – "HH:MM:SS". */
export function minutosDeBloque(bloque) {
  const minutos = (texto) => {
    const [h, m] = String(texto || '').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  return Math.max(0, minutos(bloque?.horaFin) - minutos(bloque?.horaInicio));
}

/** "1 h" / "45 min" / "1.5 h" para resúmenes de carga semanal. */
export function duracion(minutos) {
  if (minutos < 60) return `${minutos} min`;
  const horas = minutos / 60;
  return Number.isInteger(horas) ? `${horas} h` : `${horas.toFixed(1)} h`;
}

/** Agrupa bloques por día en orden LUNES→SÁBADO. Días sin clases no aparecen. */
export function agruparPorDia(bloques) {
  return DIAS_ORDEN.map((dia) => ({
    dia,
    bloques: (bloques || [])
      .filter((bloque) => bloque.dia === dia)
      .sort((a, b) => String(a.horaInicio).localeCompare(String(b.horaInicio))),
  })).filter((grupo) => grupo.bloques.length > 0);
}
