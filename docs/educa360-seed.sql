-- ============================================================================
-- Educa360 · Dataset coherente de desarrollo (25 usuarios, 7 materias,
-- 3 secciones, 12 cursos, 10 matrículas, 10 vínculos, 18 bloques de horario)
-- Clave única: Educa@360 (hashes BCrypt reales) · Dominio: @educa360.pe
-- Generado con pg_dump --data-only --inserts desde Postgres 17 en Docker.
--
-- Cómo reponerlo desde cero:
--   1) docker compose down -v            (borra datos)
--   2) docker compose up -d              (BD vacía; el backend crea el esquema)
--   3) psql -h 127.0.0.1 -U postgres -d educa360 -f docs/educa360-seed.sql
-- Limpia antes con TRUNCATE para evitar duplicados por uniques.
-- ============================================================================
TRUNCATE TABLE public.apoderado_estudiante, public.apoderados, public.cursos, public.docente_materia, public.docentes, public.estudiantes, public.horario_bloques, public.materias, public.matriculas, public.periodos_academicos, public.secciones, public.secretarias, public.telefonos, public.users RESTART IDENTITY CASCADE;
--
-- PostgreSQL database dump
--

\restrict F8Ymog7wXpLcPwjwEOQgshIWRui5t9G3XNu1R0m0K97dliqXc3Sbvjjg2ses8n0

-- Dumped from database version 17.11 (Debian 17.11-1.pgdg13+2)
-- Dumped by pg_dump version 17.11 (Debian 17.11-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (1, '2026-10-14 06:38:29.436047', '2026-10-14 06:38:29.436047', true, 'General', '00000001', 'admin@educa360.pe', 'Direcci├│n', '$2a$10$s4cZ2TMvFQXmZ5QiR3uBiO71nQu93Q3smJu4m.xMxFmdTTyaM/2BW', 'ADMIN');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (2, '2026-10-14 06:38:29.905084', '2026-10-14 06:38:29.905084', true, 'Le├│n', '00000002', 'patricia.leon@educa360.pe', 'Patricia', '$2a$10$8zbD2GiKgW18AQB6mMuzPuXpTPKqWyo5TgjJCYvuMd/.NTaJi6yDC', 'SECRETARIA');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (3, '2026-10-14 06:38:30.006056', '2026-10-14 06:38:30.006056', true, 'L├│pez', '00000011', 'maria.lopez@educa360.pe', 'Mar├¡a', '$2a$10$xgg3OvOxjlaxMtUSj7p72u73r8UdNIG/3ixAXs9olJQp/mPTUFRKG', 'DOCENTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (4, '2026-10-14 06:38:30.101678', '2026-10-14 06:38:30.101678', true, 'Mendoza', '00000012', 'roberto.mendoza@educa360.pe', 'Roberto', '$2a$10$70ouoD8JQM9bI6Ia5DwA4.kqlsdewxemC2zemlSTx/yBNZfdaEA/y', 'DOCENTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (5, '2026-10-14 06:38:30.18288', '2026-10-14 06:38:30.18288', true, 'Torres', '00000013', 'elena.torres@educa360.pe', 'Elena', '$2a$10$DDEpt1JNT9s1pqWJunrL4Osv1qH08x54jEF6FcK6oGOs9pE9omFJ.', 'DOCENTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (6, '2026-10-14 06:38:30.262603', '2026-10-14 06:38:30.262603', true, 'Torres', '00000014', 'miguel.torres@educa360.pe', 'Miguel', '$2a$10$S7jGPDRRnSPHU7NHvYSbeeCYa.QJ0FB4ycU2Kd3q2ik9xakF3yQom', 'DOCENTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (7, '2026-10-14 06:38:30.342911', '2026-10-14 06:38:30.342911', true, 'D├¡az', '00000015', 'rosa.diaz@educa360.pe', 'Rosa', '$2a$10$Ozo0BVVibJLnnmdXriQsn.WVvfExhzR1caNVPjxhEc.ovVnLH6QDK', 'DOCENTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (8, '2026-10-14 06:38:30.430977', '2026-10-14 06:38:30.430977', true, 'P├®rez', '00000101', 'juan.perez@educa360.pe', 'Juan', '$2a$10$fX1SUNpHuycC/CRk.RPguOFLhlQpQCBvuSBxhfVqHib9DGSWVEMWa', 'ESTUDIANTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (9, '2026-10-14 06:38:30.51657', '2026-10-14 06:38:30.51657', true, 'G├│mez', '00000102', 'ana.gomez@educa360.pe', 'Ana', '$2a$10$RgofiJVfT6d5UyTWevrKceGRORT.LfvKc685jb26JkGchpDTtarFa', 'ESTUDIANTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (10, '2026-10-14 06:38:30.596343', '2026-10-14 06:38:30.596343', true, 'P├®rez', '00000103', 'luis.perez@educa360.pe', 'Luis', '$2a$10$p8nKW.OOvIFjr/BwphOiEeglAwoMnCq9yn0/QkI/GdiduKlfXysuu', 'ESTUDIANTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (11, '2026-10-14 06:38:30.675504', '2026-10-14 06:38:30.675504', true, 'Huam├ín', '00000104', 'rosa.huaman@educa360.pe', 'Rosa', '$2a$10$PsmHZi5ruO8By9n.Mhm0cOrK7TFhKPVV9PkN7Ww.rXaRyVlYFVvNK', 'ESTUDIANTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (12, '2026-10-14 06:38:30.757575', '2026-10-14 06:38:30.757575', true, 'Quispe', '00000105', 'mateo.quispe@educa360.pe', 'Mateo', '$2a$10$L0tMu0hjnYXPCrQvwvoJPOe6tVuCokRzvqhcNB/TY8UnlK28axa7y', 'ESTUDIANTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (13, '2026-10-14 06:38:30.835455', '2026-10-14 06:38:30.835455', true, 'Quispe', '00000106', 'elena.quispe@educa360.pe', 'Elena', '$2a$10$vLxk6dwTGKF6hvr8k8771ewcM2GUWpG5yfQLj45VU9psHVWyXtPoW', 'ESTUDIANTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (14, '2026-10-14 06:38:30.912042', '2026-10-14 06:38:30.912042', true, 'Flores', '00000107', 'diego.flores@educa360.pe', 'Diego', '$2a$10$7eP6UCkVumgi5GFTxk3WAeANlYtqWrOlWEwMoETiGGD2/2RUnB2tW', 'ESTUDIANTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (15, '2026-10-14 06:38:30.987593', '2026-10-14 06:38:30.987593', true, 'Ramos', '00000108', 'sofia.ramos@educa360.pe', 'Sof├¡a', '$2a$10$VoYafv2.mPWONA1AsABh6uQcLHHy6uGADBS9aRvVdafp6G8cUD52a', 'ESTUDIANTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (16, '2026-10-14 06:38:31.063137', '2026-10-14 06:38:31.063137', true, 'Castillo', '00000109', 'pedro.castillo@educa360.pe', 'Pedro', '$2a$10$2WdLHxWEaStrUVP8SPo8C.D3euQtqxURyFbjXba.yCAklLeyOANJK', 'ESTUDIANTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (17, '2026-10-14 06:38:31.141934', '2026-10-14 06:38:31.141934', true, 'Vega', '00000110', 'carmen.vega@educa360.pe', 'Carmen', '$2a$10$sFRvtSWWF0p4WXeXKHPE4.HViof0nL9HVRVFYJ7q/0wVFKRtZb9/y', 'ESTUDIANTE');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (18, '2026-10-14 06:38:31.223371', '2026-10-14 06:38:31.223371', true, 'P├®rez', '00000201', 'carlos.perez@educa360.pe', 'Carlos', '$2a$10$s6PxCCym7IRKKJsEsHu52uwagrXEkjOVCdXejsMPhvUo1mIuYBin6', 'APODERADO');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (19, '2026-10-14 06:38:31.299874', '2026-10-14 06:38:31.299874', true, 'G├│mez', '00000202', 'carmen.gomez@educa360.pe', 'Carmen', '$2a$10$1Q6P7Xkir4hkothnqyjMWuDBDHh0.TiAVLWb2z3djj4Q4fm/mZlj2', 'APODERADO');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (20, '2026-10-14 06:38:31.377835', '2026-10-14 06:38:31.377835', true, 'Quispe', '00000203', 'jose.quispe@educa360.pe', 'Jos├®', '$2a$10$uEULktOrqH36ptXrTmpwJ.XTkNZx3Lyhi/giflyYP0T2yVrDow1.u', 'APODERADO');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (21, '2026-10-14 06:38:31.454119', '2026-10-14 06:38:31.454119', true, 'Flores', '00000204', 'elena.flores@educa360.pe', 'Elena', '$2a$10$MJCQAvXZIIddzCiAFaWfq.A2yYOmgJKn8n3D8kLxcqv9GN3qo8ubu', 'APODERADO');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (22, '2026-10-14 06:38:31.529684', '2026-10-14 06:38:31.529684', true, 'Ramos', '00000205', 'jorge.ramos@educa360.pe', 'Jorge', '$2a$10$EbHNQoOtrWGL9y1QYJGGMuXNk1k5a0SRbuAnu.mEQSk75my2CAyt6', 'APODERADO');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (23, '2026-10-14 06:38:31.604495', '2026-10-14 06:38:31.604495', true, 'Castillo', '00000206', 'rosa.castillo@educa360.pe', 'Rosa', '$2a$10$OcGyV5KHrvLaiKUu5KVvAeIPqv84f8VsfZjNBv4YGp7W4W39nJaAm', 'APODERADO');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (24, '2026-10-14 06:38:31.680382', '2026-10-14 06:38:31.680382', true, 'Vega', '00000207', 'luis.vega@educa360.pe', 'Luis', '$2a$10$ynce2Ch9OtJkSGpTzPeOcuqDjxhyvEn9uRD6LE.6l50HYgtCVorJq', 'APODERADO');
INSERT INTO public.users (id, created_at, updated_at, activo, apellidos, dni, email, nombres, password, rol) VALUES (25, '2026-10-14 06:38:31.756296', '2026-10-14 06:38:31.756296', true, 'Huam├ín', '00000208', 'juana.huaman@educa360.pe', 'Juana', '$2a$10$TEkLY/SlymbwT.aFthqCT.lWNUXO8FvdJFAr6Y4a/8dB2jB3nJuRS', 'APODERADO');


--
-- Data for Name: apoderados; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.apoderados (id, created_at, updated_at, user_id) VALUES (1, '2026-10-14 06:38:31.226544', '2026-10-14 06:38:31.226544', 18);
INSERT INTO public.apoderados (id, created_at, updated_at, user_id) VALUES (2, '2026-10-14 06:38:31.303149', '2026-10-14 06:38:31.303149', 19);
INSERT INTO public.apoderados (id, created_at, updated_at, user_id) VALUES (3, '2026-10-14 06:38:31.381212', '2026-10-14 06:38:31.381212', 20);
INSERT INTO public.apoderados (id, created_at, updated_at, user_id) VALUES (4, '2026-10-14 06:38:31.456764', '2026-10-14 06:38:31.456764', 21);
INSERT INTO public.apoderados (id, created_at, updated_at, user_id) VALUES (5, '2026-10-14 06:38:31.532534', '2026-10-14 06:38:31.532534', 22);
INSERT INTO public.apoderados (id, created_at, updated_at, user_id) VALUES (6, '2026-10-14 06:38:31.60716', '2026-10-14 06:38:31.60716', 23);
INSERT INTO public.apoderados (id, created_at, updated_at, user_id) VALUES (7, '2026-10-14 06:38:31.682943', '2026-10-14 06:38:31.682943', 24);
INSERT INTO public.apoderados (id, created_at, updated_at, user_id) VALUES (8, '2026-10-14 06:38:31.759169', '2026-10-14 06:38:31.759169', 25);


--
-- Data for Name: estudiantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.estudiantes (id, created_at, updated_at, estado, fecha_nacimiento, user_id) VALUES (1, '2026-10-14 06:38:30.43362', '2026-10-14 06:38:30.43362', 'ACTIVO', '2011-04-10', 8);
INSERT INTO public.estudiantes (id, created_at, updated_at, estado, fecha_nacimiento, user_id) VALUES (2, '2026-10-14 06:38:30.518665', '2026-10-14 06:38:30.518665', 'ACTIVO', '2011-08-22', 9);
INSERT INTO public.estudiantes (id, created_at, updated_at, estado, fecha_nacimiento, user_id) VALUES (3, '2026-10-14 06:38:30.598796', '2026-10-14 06:38:30.598796', 'ACTIVO', '2012-02-05', 10);
INSERT INTO public.estudiantes (id, created_at, updated_at, estado, fecha_nacimiento, user_id) VALUES (4, '2026-10-14 06:38:30.677557', '2026-10-14 06:38:30.677557', 'ACTIVO', '2011-11-30', 11);
INSERT INTO public.estudiantes (id, created_at, updated_at, estado, fecha_nacimiento, user_id) VALUES (5, '2026-10-14 06:38:30.759696', '2026-10-14 06:38:30.759696', 'ACTIVO', '2012-01-15', 12);
INSERT INTO public.estudiantes (id, created_at, updated_at, estado, fecha_nacimiento, user_id) VALUES (6, '2026-10-14 06:38:30.837402', '2026-10-14 06:38:30.837402', 'ACTIVO', '2011-06-18', 13);
INSERT INTO public.estudiantes (id, created_at, updated_at, estado, fecha_nacimiento, user_id) VALUES (7, '2026-10-14 06:38:30.913962', '2026-10-14 06:38:30.913962', 'ACTIVO', '2011-09-09', 14);
INSERT INTO public.estudiantes (id, created_at, updated_at, estado, fecha_nacimiento, user_id) VALUES (8, '2026-10-14 06:38:30.989479', '2026-10-14 06:38:30.989479', 'ACTIVO', '2010-05-25', 15);
INSERT INTO public.estudiantes (id, created_at, updated_at, estado, fecha_nacimiento, user_id) VALUES (9, '2026-10-14 06:38:31.065253', '2026-10-14 06:38:31.065253', 'ACTIVO', '2010-12-01', 16);
INSERT INTO public.estudiantes (id, created_at, updated_at, estado, fecha_nacimiento, user_id) VALUES (10, '2026-10-14 06:38:31.144101', '2026-10-14 06:38:31.144101', 'ACTIVO', '2010-07-14', 17);


--
-- Data for Name: apoderado_estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.apoderado_estudiante (id, created_at, updated_at, activo, parentesco, responsable_principal, apoderado_id, estudiante_id) VALUES (1, '2026-10-14 06:38:37.311561', '2026-10-14 06:38:37.311561', true, 'PADRE', true, 1, 1);
INSERT INTO public.apoderado_estudiante (id, created_at, updated_at, activo, parentesco, responsable_principal, apoderado_id, estudiante_id) VALUES (2, '2026-10-14 06:38:37.334167', '2026-10-14 06:38:37.334167', true, 'PADRE', true, 1, 3);
INSERT INTO public.apoderado_estudiante (id, created_at, updated_at, activo, parentesco, responsable_principal, apoderado_id, estudiante_id) VALUES (3, '2026-10-14 06:38:37.354718', '2026-10-14 06:38:37.354718', true, 'MADRE', true, 2, 2);
INSERT INTO public.apoderado_estudiante (id, created_at, updated_at, activo, parentesco, responsable_principal, apoderado_id, estudiante_id) VALUES (4, '2026-10-14 06:38:37.374054', '2026-10-14 06:38:37.374054', true, 'PADRE', true, 3, 5);
INSERT INTO public.apoderado_estudiante (id, created_at, updated_at, activo, parentesco, responsable_principal, apoderado_id, estudiante_id) VALUES (5, '2026-10-14 06:38:37.392617', '2026-10-14 06:38:37.392617', true, 'PADRE', true, 3, 6);
INSERT INTO public.apoderado_estudiante (id, created_at, updated_at, activo, parentesco, responsable_principal, apoderado_id, estudiante_id) VALUES (6, '2026-10-14 06:38:37.410585', '2026-10-14 06:38:37.410585', true, 'MADRE', true, 4, 7);
INSERT INTO public.apoderado_estudiante (id, created_at, updated_at, activo, parentesco, responsable_principal, apoderado_id, estudiante_id) VALUES (7, '2026-10-14 06:38:37.428647', '2026-10-14 06:38:37.428647', true, 'PADRE', true, 5, 8);
INSERT INTO public.apoderado_estudiante (id, created_at, updated_at, activo, parentesco, responsable_principal, apoderado_id, estudiante_id) VALUES (8, '2026-10-14 06:38:37.447491', '2026-10-14 06:38:37.447491', true, 'MADRE', true, 6, 9);
INSERT INTO public.apoderado_estudiante (id, created_at, updated_at, activo, parentesco, responsable_principal, apoderado_id, estudiante_id) VALUES (9, '2026-10-14 06:38:37.467782', '2026-10-14 06:38:37.467782', true, 'PADRE', true, 7, 10);
INSERT INTO public.apoderado_estudiante (id, created_at, updated_at, activo, parentesco, responsable_principal, apoderado_id, estudiante_id) VALUES (10, '2026-10-14 06:38:37.486921', '2026-10-14 06:38:37.486921', true, 'MADRE', true, 8, 4);


--
-- Data for Name: docentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.docentes (id, created_at, updated_at, titulo, user_id) VALUES (1, '2026-10-14 06:38:30.010017', '2026-10-14 06:38:30.010017', 'Lic. Matem├íticas', 3);
INSERT INTO public.docentes (id, created_at, updated_at, titulo, user_id) VALUES (2, '2026-10-14 06:38:30.105528', '2026-10-14 06:38:30.105528', 'Lic. Comunicaci├│n', 4);
INSERT INTO public.docentes (id, created_at, updated_at, titulo, user_id) VALUES (3, '2026-10-14 06:38:30.186221', '2026-10-14 06:38:30.186221', 'Lic. Ciencia y Tecnolog├¡a', 5);
INSERT INTO public.docentes (id, created_at, updated_at, titulo, user_id) VALUES (4, '2026-10-14 06:38:30.265642', '2026-10-14 06:38:30.265642', 'Lic. Historia y Arte', 6);
INSERT INTO public.docentes (id, created_at, updated_at, titulo, user_id) VALUES (5, '2026-10-14 06:38:30.346129', '2026-10-14 06:38:30.346129', 'Lic. Educaci├│n F├¡sica', 7);


--
-- Data for Name: materias; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.materias (id, created_at, updated_at, activa, descripcion, nombre) VALUES (1, '2026-10-14 06:38:35.598718', '2026-10-14 06:38:35.598718', true, 'Aritm├®tica, ├ílgebra y razonamiento', 'Matem├íticas');
INSERT INTO public.materias (id, created_at, updated_at, activa, descripcion, nombre) VALUES (2, '2026-10-14 06:38:35.616111', '2026-10-14 06:38:35.616111', true, 'Lectura, escritura y literatura', 'Comunicaci├│n');
INSERT INTO public.materias (id, created_at, updated_at, activa, descripcion, nombre) VALUES (3, '2026-10-14 06:38:35.633367', '2026-10-14 06:38:35.633367', true, 'Laboratorio y m├®todo cient├¡fico', 'Ciencia y Tecnolog├¡a');
INSERT INTO public.materias (id, created_at, updated_at, activa, descripcion, nombre) VALUES (4, '2026-10-14 06:38:35.651075', '2026-10-14 06:38:35.651075', true, 'Historia del Per├║ y del mundo', 'Historia');
INSERT INTO public.materias (id, created_at, updated_at, activa, descripcion, nombre) VALUES (5, '2026-10-14 06:38:35.670462', '2026-10-14 06:38:35.670462', true, 'Deporte y vida saludable', 'Educaci├│n F├¡sica');
INSERT INTO public.materias (id, created_at, updated_at, activa, descripcion, nombre) VALUES (6, '2026-10-14 06:38:35.688202', '2026-10-14 06:38:35.688202', true, 'Expresi├│n pl├ística y musical', 'Arte');
INSERT INTO public.materias (id, created_at, updated_at, activa, descripcion, nombre) VALUES (7, '2026-10-14 06:38:35.705221', '2026-10-14 06:38:35.705221', true, 'Ingl├®s como segunda lengua', 'Ingl├®s');


--
-- Data for Name: periodos_academicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.periodos_academicos (id, created_at, updated_at, estado, fecha_fin, fecha_inicio, nombre) VALUES (1, '2026-10-14 06:38:35.507519', '2026-10-14 06:38:35.551809', 'ABIERTO', '2026-05-08', '2026-03-02', 'Bimestre I 2026');


--
-- Data for Name: secciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.secciones (id, created_at, updated_at, aula, grado, letra, periodo_id, tutor_id) VALUES (1, '2026-10-14 06:38:35.92929', '2026-10-14 06:38:35.92929', 'A-201', 4, 'A', 1, 1);
INSERT INTO public.secciones (id, created_at, updated_at, aula, grado, letra, periodo_id, tutor_id) VALUES (2, '2026-10-14 06:38:35.949934', '2026-10-14 06:38:35.949934', 'A-202', 4, 'B', 1, 2);
INSERT INTO public.secciones (id, created_at, updated_at, aula, grado, letra, periodo_id, tutor_id) VALUES (3, '2026-10-14 06:38:35.96848', '2026-10-14 06:38:35.96848', 'A-301', 5, 'A', 1, 3);


--
-- Data for Name: cursos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (1, '2026-10-14 06:38:36.018717', '2026-10-14 06:38:36.018717', 1, 1, 1);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (2, '2026-10-14 06:38:36.098139', '2026-10-14 06:38:36.098139', 2, 2, 1);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (3, '2026-10-14 06:38:36.151456', '2026-10-14 06:38:36.151456', 3, 3, 1);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (4, '2026-10-14 06:38:36.202376', '2026-10-14 06:38:36.202376', 4, 4, 1);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (5, '2026-10-14 06:38:36.25053', '2026-10-14 06:38:36.25053', 1, 1, 2);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (6, '2026-10-14 06:38:36.300001', '2026-10-14 06:38:36.300001', 2, 2, 2);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (7, '2026-10-14 06:38:36.350985', '2026-10-14 06:38:36.350985', 3, 3, 2);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (8, '2026-10-14 06:38:36.408684', '2026-10-14 06:38:36.408684', 2, 7, 2);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (9, '2026-10-14 06:38:36.450236', '2026-10-14 06:38:36.450236', 1, 1, 3);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (10, '2026-10-14 06:38:36.499208', '2026-10-14 06:38:36.499208', 3, 3, 3);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (11, '2026-10-14 06:38:36.545097', '2026-10-14 06:38:36.545097', 5, 5, 3);
INSERT INTO public.cursos (id, created_at, updated_at, docente_id, materia_id, seccion_id) VALUES (12, '2026-10-14 06:38:36.590011', '2026-10-14 06:38:36.590011', 4, 6, 3);


--
-- Data for Name: docente_materia; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.docente_materia (docente_id, materia_id) VALUES (1, 1);
INSERT INTO public.docente_materia (docente_id, materia_id) VALUES (2, 7);
INSERT INTO public.docente_materia (docente_id, materia_id) VALUES (2, 2);
INSERT INTO public.docente_materia (docente_id, materia_id) VALUES (3, 3);
INSERT INTO public.docente_materia (docente_id, materia_id) VALUES (4, 4);
INSERT INTO public.docente_materia (docente_id, materia_id) VALUES (4, 6);
INSERT INTO public.docente_materia (docente_id, materia_id) VALUES (5, 5);


--
-- Data for Name: horario_bloques; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (1, '2026-10-14 06:38:36.065299', '2026-10-14 06:38:36.065299', 'LUNES', '09:30:00', '08:00:00', 1);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (2, '2026-10-14 06:38:36.067302', '2026-10-14 06:38:36.067302', 'MIERCOLES', '09:30:00', '08:00:00', 1);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (3, '2026-10-14 06:38:36.118551', '2026-10-14 06:38:36.118551', 'MARTES', '11:30:00', '10:00:00', 2);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (4, '2026-10-14 06:38:36.119795', '2026-10-14 06:38:36.119795', 'JUEVES', '11:30:00', '10:00:00', 2);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (5, '2026-10-14 06:38:36.170786', '2026-10-14 06:38:36.170786', 'VIERNES', '10:00:00', '08:00:00', 3);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (6, '2026-10-14 06:38:36.222665', '2026-10-14 06:38:36.222665', 'VIERNES', '11:30:00', '10:00:00', 4);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (7, '2026-10-14 06:38:36.272027', '2026-10-14 06:38:36.272027', 'LUNES', '11:30:00', '10:00:00', 5);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (8, '2026-10-14 06:38:36.272952', '2026-10-14 06:38:36.272952', 'MIERCOLES', '11:30:00', '10:00:00', 5);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (9, '2026-10-14 06:38:36.320405', '2026-10-14 06:38:36.320405', 'MARTES', '09:30:00', '08:00:00', 6);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (10, '2026-10-14 06:38:36.321524', '2026-10-14 06:38:36.321524', 'JUEVES', '09:30:00', '08:00:00', 6);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (11, '2026-10-14 06:38:36.371255', '2026-10-14 06:38:36.371255', 'LUNES', '14:30:00', '13:00:00', 7);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (12, '2026-10-14 06:38:36.372191', '2026-10-14 06:38:36.372191', 'MIERCOLES', '14:30:00', '13:00:00', 7);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (13, '2026-10-14 06:38:36.425894', '2026-10-14 06:38:36.425894', 'VIERNES', '11:30:00', '10:00:00', 8);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (14, '2026-10-14 06:38:36.470306', '2026-10-14 06:38:36.470306', 'MARTES', '09:30:00', '08:00:00', 9);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (15, '2026-10-14 06:38:36.471276', '2026-10-14 06:38:36.471276', 'JUEVES', '09:30:00', '08:00:00', 9);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (16, '2026-10-14 06:38:36.517022', '2026-10-14 06:38:36.517022', 'VIERNES', '12:00:00', '10:00:00', 10);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (17, '2026-10-14 06:38:36.561204', '2026-10-14 06:38:36.561204', 'MIERCOLES', '09:30:00', '08:00:00', 11);
INSERT INTO public.horario_bloques (id, created_at, updated_at, dia, hora_fin, hora_inicio, curso_id) VALUES (18, '2026-10-14 06:38:36.606624', '2026-10-14 06:38:36.606624', 'LUNES', '09:30:00', '08:00:00', 12);


--
-- Data for Name: matriculas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.matriculas (id, created_at, updated_at, estado, estudiante_id, seccion_id) VALUES (1, '2026-10-14 06:38:36.983684', '2026-10-14 06:38:37.009108', 'PAGADO', 1, 1);
INSERT INTO public.matriculas (id, created_at, updated_at, estado, estudiante_id, seccion_id) VALUES (2, '2026-10-14 06:38:37.026477', '2026-10-14 06:38:37.043617', 'PAGADO', 2, 1);
INSERT INTO public.matriculas (id, created_at, updated_at, estado, estudiante_id, seccion_id) VALUES (3, '2026-10-14 06:38:37.060956', '2026-10-14 06:38:37.07906', 'PAGADO', 3, 1);
INSERT INTO public.matriculas (id, created_at, updated_at, estado, estudiante_id, seccion_id) VALUES (4, '2026-10-14 06:38:37.095632', '2026-10-14 06:38:37.112424', 'PAGADO', 4, 1);
INSERT INTO public.matriculas (id, created_at, updated_at, estado, estudiante_id, seccion_id) VALUES (5, '2026-10-14 06:38:37.129075', '2026-10-14 06:38:37.145917', 'PAGADO', 5, 2);
INSERT INTO public.matriculas (id, created_at, updated_at, estado, estudiante_id, seccion_id) VALUES (6, '2026-10-14 06:38:37.161537', '2026-10-14 06:38:37.177529', 'PAGADO', 6, 2);
INSERT INTO public.matriculas (id, created_at, updated_at, estado, estudiante_id, seccion_id) VALUES (7, '2026-10-14 06:38:37.192535', '2026-10-14 06:38:37.192535', 'PENDIENTE', 7, 2);
INSERT INTO public.matriculas (id, created_at, updated_at, estado, estudiante_id, seccion_id) VALUES (8, '2026-10-14 06:38:37.209103', '2026-10-14 06:38:37.224402', 'PAGADO', 8, 3);
INSERT INTO public.matriculas (id, created_at, updated_at, estado, estudiante_id, seccion_id) VALUES (9, '2026-10-14 06:38:37.239522', '2026-10-14 06:38:37.25604', 'PAGADO', 9, 3);
INSERT INTO public.matriculas (id, created_at, updated_at, estado, estudiante_id, seccion_id) VALUES (10, '2026-10-14 06:38:37.271508', '2026-10-14 06:38:37.287177', 'PAGADO', 10, 3);


--
-- Data for Name: secretarias; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.secretarias (id, created_at, updated_at, user_id) VALUES (1, '2026-10-14 06:38:29.908933', '2026-10-14 06:38:29.908933', 2);


--
-- Data for Name: telefonos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (1, '2026-10-14 06:38:29.465704', '2026-10-14 06:38:29.465704', '+51999000001', 1);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (2, '2026-10-14 06:38:29.907234', '2026-10-14 06:38:29.907234', '+51999000002', 2);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (3, '2026-10-14 06:38:30.008241', '2026-10-14 06:38:30.008241', '+51999000011', 3);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (4, '2026-10-14 06:38:30.103877', '2026-10-14 06:38:30.103877', '+51999000012', 4);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (5, '2026-10-14 06:38:30.185158', '2026-10-14 06:38:30.185158', '+51999000013', 5);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (6, '2026-10-14 06:38:30.264511', '2026-10-14 06:38:30.264511', '+51999000014', 6);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (7, '2026-10-14 06:38:30.344895', '2026-10-14 06:38:30.344895', '+51999000015', 7);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (8, '2026-10-14 06:38:31.225314', '2026-10-14 06:38:31.225314', '+51999200201', 18);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (9, '2026-10-14 06:38:31.301742', '2026-10-14 06:38:31.301742', '+51999200202', 19);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (10, '2026-10-14 06:38:31.380103', '2026-10-14 06:38:31.380103', '+51999200203', 20);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (11, '2026-10-14 06:38:31.455786', '2026-10-14 06:38:31.455786', '+51999200204', 21);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (12, '2026-10-14 06:38:31.531477', '2026-10-14 06:38:31.531477', '+51999200205', 22);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (13, '2026-10-14 06:38:31.606103', '2026-10-14 06:38:31.606103', '+51999200206', 23);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (14, '2026-10-14 06:38:31.68203', '2026-10-14 06:38:31.68203', '+51999200207', 24);
INSERT INTO public.telefonos (id, created_at, updated_at, numero, user_id) VALUES (15, '2026-10-14 06:38:31.757987', '2026-10-14 06:38:31.757987', '+51999200208', 25);


--
-- Name: apoderado_estudiante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.apoderado_estudiante_id_seq', 10, true);


--
-- Name: apoderados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.apoderados_id_seq', 8, true);


--
-- Name: cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cursos_id_seq', 12, true);


--
-- Name: docentes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.docentes_id_seq', 5, true);


--
-- Name: estudiantes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estudiantes_id_seq', 10, true);


--
-- Name: horario_bloques_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horario_bloques_id_seq', 18, true);


--
-- Name: materias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materias_id_seq', 7, true);


--
-- Name: matriculas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.matriculas_id_seq', 10, true);


--
-- Name: periodos_academicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.periodos_academicos_id_seq', 1, true);


--
-- Name: secciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.secciones_id_seq', 3, true);


--
-- Name: secretarias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.secretarias_id_seq', 1, true);


--
-- Name: telefonos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.telefonos_id_seq', 15, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 25, true);


--
-- PostgreSQL database dump complete
--

\unrestrict F8Ymog7wXpLcPwjwEOQgshIWRui5t9G3XNu1R0m0K97dliqXc3Sbvjjg2ses8n0


-- Secuencias al máximo id insertado (para que los próximos INSERT no choquen).
SELECT pg_catalog.setval('public.users_id_seq', 25, true);
SELECT pg_catalog.setval('public.secretarias_id_seq', 1, true);
SELECT pg_catalog.setval('public.docentes_id_seq', 5, true);
SELECT pg_catalog.setval('public.estudiantes_id_seq', 10, true);
SELECT pg_catalog.setval('public.apoderados_id_seq', 8, true);
SELECT pg_catalog.setval('public.materias_id_seq', 7, true);
SELECT pg_catalog.setval('public.telefonos_id_seq', 15, true);
SELECT pg_catalog.setval('public.apoderado_estudiante_id_seq', 10, true);
SELECT pg_catalog.setval('public.periodos_academicos_id_seq', 1, true);
SELECT pg_catalog.setval('public.secciones_id_seq', 3, true);
SELECT pg_catalog.setval('public.cursos_id_seq', 12, true);
SELECT pg_catalog.setval('public.horario_bloques_id_seq', 18, true);
SELECT pg_catalog.setval('public.matriculas_id_seq', 10, true);
