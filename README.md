# Educa360 Móvil — Avance 02

App Expo / React Native del colegio Nuestra Señora de Monserrat (secundaria):
gestión académica, seguimiento y comunicación entre dirección, secretaría,
docentes, estudiantes y apoderados. Consume el backend Spring Boot (PostgreSQL).

## Requisitos

- Node 18+, Expo Go en el celular (mismo WiFi) o emulador.
- Backend corriendo en `http://localhost:8080` (ver `educa360-web-backend/`).

## Instalación

```bash
npx expo install          # dependencias compatibles con el SDK (no usar npm add)
npx expo-doctor           # 21/21 checks esperados
```

## Ejecución

```bash
npx expo start            # escanea el QR con Expo Go
```

En celular físico la app llama a `EXPO_PUBLIC_API_URL` (ver `.env`, ej.
`http://192.168.100.16:8080`): el `localhost` del celu es él mismo.
Abrir en firewall los puertos 8080 (backend) y 8081 (Expo).

## Cuentas de prueba (clave única `Educa@360`)

Ver `src/credentials/README.md` (25 usuarios: admin, secretaría, 5 docentes,
10 estudiantes, 8 apoderados) y `docs/educa360-seed.sql`.

## Estructura

```
src/
  api/          cliente fetch, auth, admin, secretaria, catalogo
  hooks/        useApi, useDebouncedValue (búsquedas con debounce)
  state/        AuthContext (useReducer: sesión global)
  navigation/   Stack (Login↔Main) + Tabs por rol (React Navigation)
  pages/        Login + 5 dashboards (Admin, Secretaria, Profesor, Alumno, Padre)
  components/   ui/ reutilizables + admin/ (formularios y secciones)
  credentials/  cuentas seed (no son mock)
  styles/       StyleSheet con Flexbox (#5F348F / #F9B201)
scripts/        seed-users/catalogo/matriculas.js (idempotentes)
docs/           educa360-seed.sql (dump real de Postgres)
```

## Objetivo del avance

5 roles con datos reales del API (Auth JWT en AsyncStorage, Stack+Tabs,
Hooks, fetch con loading/error, FlatList, pull-to-refresh y CRUD de
administración) según rúbrica 02.
