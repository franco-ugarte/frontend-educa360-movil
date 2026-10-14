# Credenciales del dataset (clave única `Educa@360`, dominio `@educa360.pe`)

| Rol | Email | Dato |
|---|---|---|
| ADMIN | admin@educa360.pe | Dirección General |
| SECRETARIA | patricia.leon@educa360.pe | Registro y matrículas |
| DOCENTE | maria.lopez@educa360.pe | Matemáticas |
| DOCENTE | roberto.mendoza@educa360.pe | Comunicación, Inglés |
| DOCENTE | elena.torres@educa360.pe | Ciencia y Tecnología |
| DOCENTE | miguel.torres@educa360.pe | Historia, Arte |
| DOCENTE | rosa.diaz@educa360.pe | Educación Física |
| ESTUDIANTE | juan.perez@educa360.pe | 4°A |
| ESTUDIANTE | ana.gomez@educa360.pe | 4°A |
| ESTUDIANTE | luis.perez@educa360.pe | 4°A |
| ESTUDIANTE | rosa.huaman@educa360.pe | 4°A |
| ESTUDIANTE | mateo.quispe@educa360.pe | 4°B |
| ESTUDIANTE | elena.quispe@educa360.pe | 4°B |
| ESTUDIANTE | diego.flores@educa360.pe | 4°B |
| ESTUDIANTE | sofia.ramos@educa360.pe | 5°A |
| ESTUDIANTE | pedro.castillo@educa360.pe | 5°A |
| ESTUDIANTE | carmen.vega@educa360.pe | 5°A |
| APODERADO | carlos.perez@educa360.pe | Juan y Luis Pérez |
| APODERADO | carmen.gomez@educa360.pe | Ana Gómez |
| APODERADO | jose.quispe@educa360.pe | Mateo y Elena Quispe |
| APODERADO | elena.flores@educa360.pe | Diego Flores |
| APODERADO | jorge.ramos@educa360.pe | Sofía Ramos |
| APODERADO | rosa.castillo@educa360.pe | Pedro Castillo |
| APODERADO | luis.vega@educa360.pe | Carmen Vega |
| APODERADO | juana.huaman@educa360.pe | Rosa Huamán |

Seeds (orden, `http://localhost:8080`, idempotentes):
`node scripts/seed-users.js` → `node scripts/seed-catalogo.js` → `node scripts/seed-matriculas.js`
Dump SQL: `docs/educa360-seed.sql`.
En Expo Go físico: `EXPO_PUBLIC_API_URL=http://TU-IP-LAN:8080 npx expo start`.
