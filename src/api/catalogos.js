import { apiFetch, queryString } from './client';

// Catálogos de solo lectura compartidos por los roles.

/** Bimestres del año (todos si no se pasa anioId). */
export const bimestres = (anioId) =>
  apiFetch(`/bimestres${queryString({ anioId })}`);
