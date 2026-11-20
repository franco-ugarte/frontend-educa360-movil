# Educa360 Móvil

Aplicación móvil del **Colegio Nuestra Señora de Monserrat** para el seguimiento
académico diario. Consume la API REST del backend institucional
(`educa360-web-backend`: Spring Boot + PostgreSQL + JWT) **sin modificarlo**:
toda la lógica académica (promedios, asistencia, tickets, permisos) vive en el
servidor y el móvil solo la presenta y ejecuta las acciones propias del celular.

| | |
|---|---|
| **Roles** | Estudiante · Apoderado · Docente (Admin y Secretaría ven un aviso de uso web) |
| **Stack** | Expo SDK 58 · React Native 0.88 · React 19 · React Navigation 7 |
| **Nativas** | Cámara/galería · Selector de PDF · Notificaciones locales · Selector de fecha · AsyncStorage |
| **Tiempo real** | WebSocket STOMP en `/ws` con el JWT; funciona en Expo Go y en builds nativos |
| **Identidad** | Morado `#5F348F`, ámbar `#F9B201` y `assets/logo.png` |

---

## Índice

1. [Qué resuelve](#qué-resuelve)
2. [Roles y alcance](#roles-y-alcance)
3. [Stack tecnológico](#stack-tecnológico)
4. [Requisitos](#requisitos)
5. [Puesta en marcha](#puesta-en-marcha)
6. [Variables de entorno](#variables-de-entorno)
7. [Cuentas demo](#cuentas-demo)
8. [Funcionalidades por rol](#funcionalidades-por-rol)
9. [Arquitectura del proyecto](#arquitectura-del-proyecto)
10. [Sesión, JWT y capa de red](#sesión-jwt-y-capa-de-red)
11. [Semáforo de rendimiento](#semáforo-de-rendimiento)
12. [Funcionalidades nativas y permisos](#funcionalidades-nativas-y-permisos)
13. [Notificaciones](#notificaciones)
14. [Endpoints consumidos](#endpoints-consumidos)
15. [Reglas de negocio que respeta la app](#reglas-de-negocio-que-respeta-la-app)
16. [Decisiones de alcance y limitaciones](#decisiones-de-alcance-y-limitaciones)
17. [Pruebas y validaciones](#pruebas-y-validaciones)
18. [Rúbrica del proyecto final](#rúbrica-del-proyecto-final)
19. [Guion para el video demo](#guion-para-el-video-demo)
20. [Convenciones para extender la app](#convenciones-para-extender-la-app)
21. [Solución de problemas](#solución-de-problemas)
22. [Créditos y licencia](#créditos-y-licencia)

---

## Qué resuelve

El colegio comunicaba notas, asistencia y avisos con agendas físicas, llamadas y
comunicados impresos. La app reemplaza esa fricción con tres acciones concretas
desde el celular:

- **Consultar** el día del estudiante: clases, promedio con semáforo, notas por
  bimestre, asistencia y comunicados.
- **Justificar** una inasistencia con una foto o un PDF del sustento, sin ir al colegio.
- **Pasar lista** por bloque y **publicar un aviso express** desde el aula.

Todo lo administrativo (matrículas, planificación, materiales, actas, cierres,
descargas) queda en la versión web: el móvil no intenta replicarlo.

## Roles y alcance

| Rol | Navegación | Qué hace |
|---|---|---|
| **Estudiante** | Inicio · Horario · Notas · Asistencia · Perfil | Clases del día, semana, promedios con **semáforo**, asistencia con porcentaje, comunicados, bandeja de notificaciones y recordatorios locales. |
| **Apoderado** | Inicio · Notas · Asistencia · Justificar · Perfil | Cambia entre hijos, revisa notas/asistencia/horario y **registra justificaciones con cámara, galería o PDF**, siguiendo el estado de cada ticket. |
| **Docente** | Inicio · Horario · Asistencia · Avisos · Perfil | Su semana completa con filtro por curso, **pase de lista por bloque y fecha**, avance del día y **avisos express** de una sección. |
| **Admin / Secretaría** | Aviso de rol | Explica que la gestión se realiza en la web y permite cambiar de cuenta. |

Los overlays (comunicados, notificaciones y horario del hijo) no ocupan una
pestaña: la barra inferior se mantiene en cinco accesos por rol.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Expo `~58.0.26` (managed workflow) |
| UI | React Native `0.88.1`, React `19.3.0`, `react-native-web` para demo en navegador |
| Navegación | React Navigation 7 (`native-stack` para sesión + tab bar propia por rol) |
| Red | `fetch` nativo envuelto en un cliente único con JWT, timeouts y errores normalizados |
| Tiempo real | `@stomp/stompjs` + `text-encoding` sobre WebSocket nativo (`/ws`) |
| Persistencia | `@react-native-async-storage/async-storage` 2.2.0 |
| Nativas | `expo-image-picker`, `expo-document-picker`, `expo-file-system`, `expo-notifications`, `@react-native-community/datetimepicker` |
| Backend | Spring Boot · PostgreSQL · JWT (24 h) · Flyway |

## Requisitos

- **Node 18+** y npm.
- **Expo Go** en el celular (Android/iOS) o un emulador.
- **Backend** en `http://<IP>:8080`. Se levanta con Docker Compose desde
  `educa360-web-backend` (API + PostgreSQL).
- Celular y PC en la **misma red WiFi** si se prueba en dispositivo físico.

## Puesta en marcha

### 1. Levantar el backend

Desde `educa360-web-backend`:

```bash
docker compose up -d --build
docker compose ps          # educa360-backend y educa360-postgres en "healthy"
```

La API queda en `http://localhost:8080` y PostgreSQL publicado en
`127.0.0.1:${POSTGRES_PORT}` (por defecto `5432`; si ese puerto está ocupado por
un PostgreSQL nativo, cambia `POSTGRES_PORT` en el `.env`, por ejemplo `5434`).

El `.env` del backend debe definir `APP_JWT_SECRET` (mínimo 32 bytes): el
contenedor no arranca sin él. Flyway crea el esquema y carga los datos demo
(`classpath:db/migration` + `classpath:db/seed`) en el primer arranque.

> `docker compose down` conserva los datos. `docker compose down -v` **borra el
> volumen** y vuelve a sembrar la base en el siguiente arranque.

Comprobación rápida:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alma@educa360.pe","password":"Alumno1234"}'
```

### 2. Configurar la app

```bash
cp .env.example .env      # y edita EXPO_PUBLIC_API_URL
npm install               # respeta package-lock.json
npx expo-doctor           # diagnóstico de dependencias
npx expo start            # escanea el QR con Expo Go
```

Si cambias `EXPO_PUBLIC_API_URL`, reinicia Metro limpiando caché:

```bash
npx expo start -c
```

### 3. Abrir desde el celular

- Misma red WiFi que la PC (o `npx expo start --tunnel`).
- Firewall de Windows: permitir los puertos **8080** (API) y **8081** (Metro).
- La URL del `.env` debe ser la **IP LAN** de la PC, nunca `localhost`.

```bash
EXPO_PUBLIC_API_URL=http://192.168.100.16:8080
```

## Variables de entorno

Solo hay una variable pública; se inyecta en el bundle en tiempo de compilación:

| Variable | Ejemplo | Uso |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://192.168.100.16:8080` | Base de la API (sin `/api/v1`, lo agrega el cliente) |

`.env` está en `.gitignore`; `.env.example` es la plantilla versionada.

`src/api/config.js` completa la ruta con `/api/v1` y define los timeouts:
**15 s** para peticiones normales y **60 s** para subidas multipart.

## Cuentas demo

Creadas por el seed del backend:

| Rol | Email | Contraseña |
|---|---|---|
| Estudiante | `alma@educa360.pe` | `Alumno1234` |
| Apoderado | `lucia@educa360.pe` | `Familia1234` |
| Docente | `dana@educa360.pe` | `Docente1234` |
| Admin | `admin@educa360.pe` | `Admin12345` |
| Secretaría | `sofia@educa360.pe` | `Secreta1234` |

Admin y Secretaría solo ven el aviso de uso web. Los datos demo incluyen
sección, cursos, horario, notas, asistencias y comunicados para probar los tres
roles sin configurar nada.

## Funcionalidades por rol

### Estudiante

- **Inicio**: saludo, sección y año, clases del día, promedio general con
  semáforo, accesos rápidos y comunicados recientes.
- **Horario**: semana completa de su sección, agrupada por día.
- **Notas**: filtro por bimestre, promedio por curso y por criterio, leyenda del
  semáforo y colores por nota.
- **Asistencia**: porcentaje del periodo, resumen (asistencias, faltas,
  tardanzas, justificadas) e historial **agrupado por día**: cada día muestra su
  resumen y se despliega para ver los cursos.
- **Perfil**: datos de la cuenta, teléfonos en modo lectura (los gestiona su
  apoderado), recordatorios locales y cierre de sesión.
- **Overlays**: comunicados y bandeja de notificaciones.

### Apoderado

- **Inicio**: selector de hijo, resumen académico con semáforo, clases del día y
  accesos a notas/asistencia/justificar.
- **Notas y Asistencia**: idénticas a las del estudiante, siempre del hijo
  seleccionado. En la asistencia, cada falta permite **justificar** o abrir su
  ticket sin salir del día desplegado.
- **Justificar**: formulario con fecha (selector nativo), alcance día completo o
  bloque, motivo y **sustento fotográfico o PDF**; historial de tickets con estado.
- **Horario del hijo**: overlay desde Inicio o Asistencia (no ocupa pestaña).
- **Perfil**: teléfonos editables (máx. 5), recordatorios del hijo activo y
  cierre de sesión.

### Docente

- **Inicio**: próxima clase, progreso de asistencia del día y accesos rápidos.
- **Horario**: semana completa de todos sus cursos, filtros por curso y acción
  directa para pasar lista.
- **Asistencia**: hoja por bloque y fecha con selector nativo; estados
  Asistió/Falta, bloqueo de filas justificadas y resumen del día.
- **Avisos**: publica, edita y elimina avisos propios de **una sección**; los
  avisos generales del colegio se muestran en modo lectura.
- **Perfil**: teléfonos editables, recordatorios de clase y de asistencia (06:45)
  y cierre de sesión.

## Arquitectura del proyecto

```
src/
  api/            Cliente HTTP y un módulo por dominio
    client.js       fetch + JWT + timeouts + 401 global + multipart
    config.js       EXPO_PUBLIC_API_URL, prefijo /api/v1, timeouts
    token.js        sesión en AsyncStorage (token + usuario)
    sessionEvents.js  bus para cerrar sesión ante 401
    auth.js · estudiante.js · apoderado.js · docente.js
    catalogos.js · notificaciones.js · dispositivos.js · mappers.js
  components/
    ui/             Reutilizables sin lógica de negocio (botones, tarjetas,
                    Overlay, ErrorCard, EmptyState, BimestrePicker,
                    SemaforoBadge, RoleNotice, SectionTitle…)
    domain/         Compartidos con reglas de presentación (ComunicadosPanel,
                    NotificacionesPanel, PhoneEditor, RecordatoriosCard)
  hooks/          useApi (estado de petición) y useRecordatorios (programa
                  avisos locales desde el horario del rol)
  navigation/     RootNavigator: stack de sesión + pantalla por rol
  pages/
    Login.js        Formulario de acceso
    WebOnlyPage.jsx Aviso para Admin/Secretaría
    estudiante/     page.jsx · data.jsx · styles.js · views/
    apoderado/      page.jsx · data.jsx · styles.js · adjunto.js · views/ · components/
    docente/        page.jsx · data.jsx · styles.js · agenda.js · views/ · components/
  services/       push (token Expo), realtime (cliente STOMP), stompPolyfill,
                  recordatorios (notificaciones locales) y notificacionRuta
                  (deep link al tocar una notificación)
  state/          AuthContext: useReducer + restauración de sesión
  utils/          format (fechas, notas, semáforo, porcentajes) y horario
  theme.js        colores, radios y sombras de la identidad visual
App.js            SafeAreaProvider + AuthProvider + RootNavigator
index.js          registerRootComponent
```

**Capas**

| Capa | Responsabilidad |
|---|---|
| Presentación | `pages/<rol>/page.jsx` orquesta la tab bar y los overlays; `views/` pinta cada pestaña |
| Estado por rol | `pages/<rol>/data.jsx` expone un contexto con los datos de la sesión y los refrescos |
| Red | `api/client.js` es el único lugar que llama a `fetch` |
| Servicios del sistema | `services/` encapsula notificaciones, push, tiempo real STOMP y ruteo |
| Transversal | `components/ui`, `hooks`, `state`, `utils`, `theme` |

**Navegación**

`RootNavigator` monta un `native-stack` con dos ramas: `Login` cuando no hay
sesión y `Main` cuando la hay. `Main` renderiza la página del rol (`appRol`
derivado del JWT) y cada página maneja su propia barra inferior
(`GradientButtonGroup`) y sus overlays (`Overlay`).

## Sesión, JWT y capa de red

```
Login  →  POST /auth/login  →  { token, user }
       →  AsyncStorage (@educa360:token, @educa360:user)
       →  GET /auth/me  →  { usuario, perfil }
       →  pantalla del rol
```

- **Cliente único** (`src/api/client.js`): inyecta `Authorization: Bearer`,
  serializa JSON, evita `Content-Type` en multipart y aplica timeout con
  `AbortController`.
- **Errores normalizados**: `err.status` (`0` = red/timeout) + `friendlyError()`
  traduce `400`, `401`, `403`, `404`, `409`, `429` (con `Retry-After`) y `5xx` a
  mensajes en español.
- **Cierre global ante 401**: cualquier respuesta 401 con token vivo emite un
  evento (`sessionEvents`), cierra STOMP, borra el token push, limpia
  AsyncStorage y devuelve al login.
- **Restauración**: al arrancar se lee el token y se valida con `/auth/me`; si
  está vencido se descarta sin mostrar pantallas a medias. Con sesión válida se
  abre el canal STOMP; `signOut()` lo cierra.
- **Multipart**: el sustento de justificación viaja como `FormData` con el campo
  `archivo` y timeout de 60 s.

## Semáforo de rendimiento

El promedio lo calcula el backend; el móvil **solo lo presenta**:

| Color | Rango | Etiqueta |
|---|---|---|
| 🟢 Verde | `>= 16.00` | Destacado |
| 🟡 Ámbar | `11.00 – 15.99` | En proceso |
| 🔴 Rojo | `< 11.00` | Requiere apoyo |

Se aplica en **Inicio** (promedio del estudiante y del hijo) y en **Notas**
(promedio general, leyenda y punto por curso). Si no hay nota, no se pinta color.

- Lógica: `semaforoNota()` y `SEMAFORO_LEYENDA` en `src/utils/format.js`.
- Componentes: `src/components/ui/SemaforoBadge.jsx`.

## Funcionalidades nativas y permisos

| Funcionalidad | Implementación | Detalle |
|---|---|---|
| **Cámara y galería** | `expo-image-picker` | Solo imágenes, edición y compresión `0.7`; se valida **máx. 5 MB** antes de subir |
| **Selector de PDF** | `expo-document-picker` | Sustento en PDF (máx. 5 MB), copiado a caché para poder subirlo |
| **Notificaciones locales** | `expo-notifications` | Canal Android `recordatorios`, programación semanal y notificación de prueba |
| **Selector de fecha** | `@react-native-community/datetimepicker` | Nativo en **Justificar** (apoderado) y en **Asistencia** (docente) |
| **Almacenamiento local** | `AsyncStorage` | Sesión, token push y preferencia de recordatorios |

Permisos declarados en `app.json` con textos en español:

- `expo-image-picker`: cámara y fotos (`microphonePermission: false`).
- `expo-notifications`: color morado y canal Android `default`.
- `datetimepicker` y `expo-status-bar`.

Si el usuario niega un permiso, la app **no se rompe**: muestra el motivo y
ofrece continuar sin cámara, sin galería o sin recordatorios.

## Notificaciones

La app cubre cuatro canales complementarios:

### 1. Bandeja dentro de la app

- Lista de notificaciones del usuario autenticado, contador de no leídas en la
  campana y acciones para marcar una o todas como leídas.
- Se refresca cada **60 s**, al volver a primer plano (`AppState`), al llegar un
  aviso STOMP y después de acciones relevantes.
- Endpoints: `GET /notificaciones`, `GET /notificaciones/contador`,
  `PATCH /notificaciones/{id}/leida`, `PATCH /notificaciones/leidas`.

### 2. Tiempo real con STOMP (Expo Go y builds nativos)

- Cliente `@stomp/stompjs` sobre **WebSocket nativo**: la URL sale de
  `EXPO_PUBLIC_API_URL` con `http→ws` (o `https→wss`) y `/ws`. No usa SockJS,
  polling como único canal ni mocks.
- `stompPolyfill.js` instala `TextEncoder`/`TextDecoder` **antes** de importar el
  cliente, necesario en Hermes.
- El frame `CONNECT` lleva `Authorization: Bearer <token>` (`connectHeaders`) y
  `beforeConnect` renueva el JWT en cada reconexión.
- Suscripción a `/user/queue/notificaciones`. El backend publica solo ahí con
  `convertAndSendToUser(email, ...)`: no hay tópicos por rol; el aislamiento de
  Estudiante, Apoderado y Docente lo hace el usuario del JWT.
- Cada mensaje dispara `notificarLocal()` (canal `default`, `sound: true`) y
  emite `onNotificacionTiempoReal`: los `data.jsx` actualizan el contador y
  `NotificacionesPanel` recarga la bandeja.
- En la consola de Expo: `[STOMP] Conectado` al abrir el túnel y
  `[STOMP] Error` si falla el frame o el WebSocket.

### 3. Recordatorios locales (funcionan en Expo Go)

Se activan en **Perfil → Recordatorios locales**:

- **Estudiante y apoderado**: aviso semanal **10 minutos antes** de cada bloque
  del horario (el del hijo activo en el apoderado).
- **Docente**: aviso antes de cada clase y recordatorio de **asistencia pendiente
  a las 06:45** en los días con horario.

Detalles: se cancelan y reprograman al cambiar horario o de hijo, se guardan en
AsyncStorage (`@educa360:recordatorios`) y llevan
`data = { origen, tipo: 'RECORDATORIO', ruta }` para abrir Horario o Asistencia.

### 4. Push remoto (opcional, requiere build)

El código está listo: la app registra el token Expo en
`POST /notificaciones/dispositivos` al iniciar sesión y lo elimina al salir. Para
que **lleguen notificaciones con la app cerrada** hacen falta tres cosas:

1. `expo.extra.eas.projectId` en `app.json` (o `eas init`).
2. Un **development build**: `npx expo run:android` o
   `eas build --profile development`. Expo Go en Android (SDK 53+) ya no admite
   push remoto.
3. En el backend, `APP_PUSH_ENABLED=true` (+ credenciales de Expo si aplica) y
   reiniciar el contenedor.

Sin esos tres puntos la app sigue funcionando con la bandeja, el polling, el
canal STOMP y los recordatorios locales. La entrega inmediata **ya está
implementada** con STOMP en `/ws` (ver sección 2), sin depender de EAS.

### Deep link al tocar una notificación

| `tipo` | Estudiante | Apoderado | Docente |
|---|---|---|---|
| `COMUNICADO` | Comunicados | Comunicados | Avisos |
| `TICKET_RESUELTO` | — | Justificar | — |
| `CALIFICACION` | Notas | Notas | — |
| `ASISTENCIA` | Asistencia | Asistencia | Asistencia |
| `CIERRE` | Notas | Notas | — |
| `MATERIAL` | Bandeja | Bandeja | Bandeja |

Si el tipo no tiene pantalla equivalente o `referenciaId` es `null`, se abre la
bandeja. La lógica vive en `src/services/notificacionRuta.js`.

## Endpoints consumidos

Todos bajo `/api/v1`. La identidad y los permisos salen del JWT, nunca del body.

### Sesión y perfil

```
POST  /auth/login
GET   /auth/me
PATCH /auth/me/telefonos          (ESTUDIANTE recibe 403)
```

### Estudiante

```
GET   /estudiante/matricula
GET   /estudiante/cursos
GET   /estudiante/horario
GET   /estudiante/calificaciones?anioId=&bimestreId=
GET   /estudiante/asistencias?anioId=&bimestreId=
GET   /estudiante/comunicados
GET   /bimestres?anioId=
```

### Apoderado

```
GET   /apoderado/hijos
GET   /apoderado/hijos/{id}/horario
GET   /apoderado/hijos/{id}/calificaciones?anioId=&bimestreId=
GET   /apoderado/hijos/{id}/asistencias?anioId=&bimestreId=
GET   /apoderado/hijos/{id}/tickets?anioId=&estado=
POST  /apoderado/hijos/{id}/tickets
POST  /apoderado/tickets/{id}/sustento        (multipart, campo `archivo`)
GET   /apoderado/tickets/{id}/sustento        (URL firmada de corta duración)
GET   /apoderado/comunicados
```

### Docente

```
GET   /docente/cursos
GET   /docente/horario
GET   /docente/cursos/{cursoId}/asistencia?bloqueId=&fecha=
PUT   /docente/cursos/{cursoId}/asistencia
GET   /docente/asistencias/resumen?fecha=
GET   /docente/comunicados?anioId=&seccionId=
POST  /docente/comunicados
PUT   /docente/comunicados/{id}
DELETE /docente/comunicados/{id}
```

### Notificaciones y dispositivos (los tres roles)

```
GET    /notificaciones?leida=
GET    /notificaciones/contador
PATCH  /notificaciones/{id}/leida
PATCH  /notificaciones/leidas
GET    /notificaciones/dispositivos
POST   /notificaciones/dispositivos        { token, plataforma }
DELETE /notificaciones/dispositivos?token=
```

## Reglas de negocio que respeta la app

### Asistencia del docente

- La hoja se abre por **bloque + fecha**. El `PUT` es un **upsert parcial**: solo
  viajan `{ matriculaId, asistio, observacion? }` de los alumnos registrados o
  corregidos.
- El docente decide **Asistió / Falta**. `TARDANZA` la calcula el servidor y
  `JUSTIFICADA` la crea Secretaría; esas filas se muestran bloqueadas.
- La fecha debe coincidir con el día del bloque, no puede ser futura y debe caer
  en un bimestre **ABIERTO**; la vista precarga la fecha válida más reciente y
  avisa cuando ajusta.
- Si el bimestre está `PLANIFICADO` o `CERRADO`, se explica el motivo y se
  deshabilita el guardado en vez de provocar un error.
- El **resumen del día** (`/docente/asistencias/resumen`) alimenta el progreso
  "X de Y clases" en Inicio y Asistencia. Un bloque está completo cuando
  `pendientes == 0`; los domingos llegan `dia: null` y `bloques: []`.

### Justificaciones

- Alcance por defecto **día completo**; si se elige un bloque, debe pertenecer a
  la sección del hijo y coincidir con su día de semana.
- No se permiten fechas futuras; los bloques sugeridos salen de las filas
  `FALTA` de esa fecha.
- Un ticket `PENDIENTE` o `APROBADO` bloquea la fecha (o el bloque); uno
  `RECHAZADO` no bloquea.
- Si la matrícula está `RETIRADA` o no hay matrícula vigente, el formulario avisa
  y deshabilita el registro.
- El sustento es opcional (**JPG, PNG o PDF, máx. 5 MB**) y solo se puede subir o
  reemplazar mientras el ticket está `PENDIENTE`.

### Horarios

- **Estudiante**: una petición a `/estudiante/horario` y vista semanal.
- **Apoderado**: overlay que se recarga al cambiar de hijo.
- **Docente**: `/docente/horario` con todos sus cursos, filtros por curso y
  acceso a pasar lista.

### Avisos express

Se publican en **una sola sección** donde el docente dicta clase o es tutor. Para
varias secciones, Secretaría o Administración publican un aviso general: el móvil
no automatiza el alta múltiple. Solo se editan o eliminan los avisos propios.

## Decisiones de alcance y limitaciones

**Fuera de alcance (por diseño)**

- **Admin y Secretaría** en el móvil: solo aviso de uso web.
- **Calendario / días no lectivos**: el backend no modela feriados; la app no
  promete bloquear asistencia por esa razón.
- **Planificación, materiales, actas y descargas**: viven en la web.
- **Aviso multi-sección**: un aviso por sección.

**Limitaciones conocidas**

- **Push remoto**: no configurado en esta entrega (`projectId` + dev build +
  `APP_PUSH_ENABLED`). La bandeja, el STOMP, el polling y los recordatorios
  locales sí funcionan en Expo Go.
- **Tiempo real**: implementado con STOMP sobre `/ws`. Requiere backend
  accesible en la IP LAN (no `localhost` en dispositivo físico). El broker del
  backend es en memoria: con varias instancias haría falta Redis u otro broker.
- **Zona horaria**: el backend envía `LocalDateTime` sin offset. Si el
  contenedor corre en UTC, la hora de la bandeja se muestra en UTC (5 h de
  diferencia en Perú). Se corrige con `TZ=America/Lima` en el compose o
  migrando a `timestamptz`.
- **Formato del sustento**: se aceptan JPG, PNG o PDF hasta 5 MB. La app valida
  extensión y tamaño antes de enviar, y el backend vuelve a validar MIME y
  extensión.

## Pruebas y validaciones

| Validación | Resultado |
|---|---|
| `npx expo-doctor` | 20/20 checks |
| `npx expo export --platform android` | Bundle generado sin errores |
| `npx expo export --platform web` | Bundle generado sin errores |
| Imports y exports de componentes | Verificados (sin rutas inexistentes) |
| Estilos por rol | Hojas `styles.js` consistentes y sin claves duplicadas |
| STOMP y polyfill | Bundle Android correcto tras integrarlos; `expo-doctor` 20/20 |
| Handshake STOMP en dispositivo | Pendiente: requiere backend en marcha e IP LAN |
| Prueba funcional | Login y endpoints de los 3 roles contra el backend |

Para repetirlas:

```bash
npx expo-doctor
npx expo export --platform android
npx expo start           # prueba manual en Expo Go o navegador
```

## Rúbrica del proyecto final

| Criterio | Peso | Cómo se cumple | Evidencia |
|---|---:|---|---|
| **Arquitectura y estructura** | 15 % | Carpeta por rol con `page.jsx`, `data.jsx`, `styles.js` y `views/`; componentes `ui`/`domain`, hooks, servicios, contexto y navegación; `.env` y repositorio en GitHub | `src/pages/*`, `src/navigation/`, `src/hooks/`, `src/services/`, `.env.example` |
| **Integración REST / JWT** | 20 % | Cliente `fetch` único con JWT, timeout, cierre global ante 401, errores por código, multipart y endpoints por rol | `src/api/client.js`, `src/api/*.js`, `src/state/AuthContext.js` |
| **Funcionalidades nativas** | 25 % | Cámara/galería con validación de 5 MB, notificaciones locales, selector de fecha nativo y AsyncStorage; permisos en español | `src/pages/apoderado/adjunto.js`, `src/services/recordatorios.js`, `src/services/push.js`, `app.json` |
| **UI/UX** | 25 % | Identidad morado/ámbar, tab bar con gradiente, cabeceras seguras, estados de carga/error/vacío, semáforo, filtros horizontales contenidos y diseño responsive | `src/theme.js`, `src/components/`, `src/pages/*/views/` |
| **Innovación y valor agregado** | 10 % | Semáforo, justificación fotográfica, avisos express, recordatorios calculados desde el horario, seguimiento multi-hijo y notificaciones STOMP en tiempo real | Inicio/Notas, Justificar, Avisos, Perfil, `src/services/realtime.js` |
| **Documentación y video** | 5 % | Este README (arquitectura, endpoints, reglas, permisos, pruebas y guion) más la demo de 3–5 min | `README.md` |

## Guion para el video demo

| Tiempo | Qué mostrar |
|---|---|
| 0:00 – 0:25 | Login del **estudiante**: Inicio con clases del día y promedio con semáforo |
| 0:25 – 1:05 | Horario, Notas (leyenda 🟢🟡🔴) y Asistencia con porcentaje |
| 1:05 – 1:35 | **Perfil → Recordatorios locales**: activar y enviar la notificación de prueba |
| 1:35 – 2:20 | **Apoderado**: cambiar de hijo, ver notas/asistencia y **justificar con cámara** |
| 2:20 – 3:05 | **Docente**: Horario con filtro, pasar lista por bloque y publicar un aviso |
| 3:05 – 3:45 | Arquitectura (carpetas por rol, `api`, `services`), `.env`, JWT/401, `[STOMP] Conectado` y errores |
| 3:45 – 4:10 | Cierre: nativas, semáforo, valor agregado y alcance web |

## Convenciones para extender la app

- **Un rol, una carpeta**: si una vista es exclusiva, va en
  `pages/<rol>/views/`; si se repite, se promueve a `components/domain`.
- **Sin `fetch` fuera de `src/api`**: cualquier endpoint nuevo se agrega al
  módulo del dominio y se consume desde `views` o `data.jsx`.
- **Estilos por rol**: cada carpeta tiene su `styles.js`; los estilos compartidos
  viven en `theme.js` o junto al componente.
- **Estados de pantalla**: toda vista con datos remotos debe cubrir carga, error
  (`ErrorCard`), vacío (`EmptyState`) y refresco.
- **Permisos**: pedir en el momento de uso, explicar en español y ofrecer una
  salida si se niega.

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `ports are not available ... 5432` al levantar Compose | Hay un PostgreSQL nativo usando 5432 | Cambia `POSTGRES_PORT` en el `.env` del backend (p. ej. `5434`) o detén el servicio nativo |
| El backend no arranca y pide `APP_JWT_SECRET` | Falta la variable en `.env` | Define un secreto de al menos 32 bytes y reinicia |
| La app no conecta desde el celular | `.env` con `localhost` o firewall cerrado | Usa la IP LAN y permite 8080/8081 |
| Cambié la URL y sigue igual | Metro conserva el bundle anterior | `npx expo start -c` |
| Vuelvo al login solo | Token vencido o 401 del backend | Es el comportamiento esperado; inicia sesión otra vez |
| No llegan push al celular | Expo Go + sin `projectId` + push apagado | Ver [Notificaciones](#notificaciones); requiere development build |
| No aparece `[STOMP] Conectado` | `.env` con `localhost`, backend caído o `/ws` bloqueado | Usa la IP LAN, revisa `[STOMP] Error` y confirma que el backend responde en `http://<IP>:8080` |
| Las horas se ven +5 h | Contenedor en UTC | `TZ=America/Lima` en el compose o corregir la zona en el backend |
| Se perdieron los datos demo | Se ejecutó `docker compose down -v` | Vuelve a levantar: Flyway re-siembra la base |

## Créditos y licencia

Proyecto académico de **Desarrollo de Aplicaciones Móviles** — Colegio Nuestra
Señora de Monserrat.

- Ugarte Quinto, Franco Javier
- Becerra Canahualpa, Marcelo Kaled

Licencia MIT (ver `LICENSE`).
