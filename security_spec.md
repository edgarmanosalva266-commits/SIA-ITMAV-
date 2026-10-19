# Especificación de Seguridad de Firestore - SIA ITMANV

## 1. Invariantes de Datos y Reglas del Dominio Académico
1. **Invariante de Admisión**: Todo postulante debe tener documento válido (DNI de 8 dígitos o CE de 9-12 caracteres), modalidad de admisión oficial según Ley 30512, y su estado solo puede ser modificado por Trámite Documentario / Gestión Académica.
2. **Invariante de Matrícula**: Una matrícula no puede aprobarse si el estudiante registra morosidad en Tesorería o adeudo de prerrequisitos académicos.
3. **Invariante de Notas (LAG MINEDU)**: Las notas de indicadores de logro (IL1 a IL4), recuperación y promedio final deben ser valores numéricos comprendidos estrictamente en la escala vigesimal [0.0, 20.0]. La nota mínima aprobatoria es 13. Un promedio menor a 13 o inasistencias superiores al 30% determina desaprobación o DPI.
4. **Invariante de Facturación SUNAT**: Un comprobante electrónico una vez emitido y aceptado con código CDR 0001 es inmutable; no se puede alterar el monto, serie, número, ni el hash criptográfico SHA-256.
5. **Invariante de Identidad y Roles**: Los roles de Director (Lic. Elmer Torres Peres), Trámite Documentario (Lic. Emerita Vásquez Suárez), Gestión Académica (Lic. Oscar Ortiz Regalao) y Tesorería están estrictamente restringidos y no pueden ser autoasignados por estudiantes o docentes.

## 2. Las 12 Cargas Maliciosas ("Dirty Dozen" Payloads)
1. **Inyección de Rol de Administrador en Perfil de Estudiante**: Intento de un alumno de sobreescribir su documento en `students` con `role: "DIRECTOR"`.
2. **Alteración Unilateral de Calificación**: Un estudiante enviando un `update` a `grades/grade123` modificando `finalGrade: 20` directamente.
3. **Aprobación de Matrícula Estando Moroso**: Inserción de un registro en `enrollments` con estado `"DEFINITIVA"` omitiendo la validación de deuda en `treasury_payments`.
4. **Inyección de ID de Longitud Excesiva (Denial of Wallet)**: Intento de crear un documento con un ID de 2048 caracteres aleatorios.
5. **Nota Fuera de Escala Vigesimal**: Inserción de `finalGrade: 99` o `finalGrade: -5`.
6. **Alteración de Comprobante SUNAT Emitido**: Modificación del campo `total` en una Boleta electrónica ya enviada y autorizada.
7. **Suplantación de Documento de Identidad (Ghost Identity)**: Postulante intentando registrarse con DNI de otro estudiante ya existente.
8. **Modificación de Marca Temporal Inmortal**: Intento de alterar `issuedAt` o `createdAt` con fechas pasadas o arbitrarias en lugar del tiempo de servidor.
9. **Eliminación Arbitraria de Acta de Notas**: Intento de borrado de un documento en la colección `grades` por un usuario no autorizado.
10. **Lectura Masiva no Restringida de Datos Personales (PII Leak)**: Un usuario autenticado como estudiante solicitando listar todos los registros de postulantes y DNI de terceros.
11. **Bypass de Prerrequisitos**: Registro forzado de unidad didáctica avanzada sin cursar ni aprobar la unidad previa.
12. **Sobrescritura de Serie y Correlativo SUNAT**: Intento de forzar un correlativo repetido o con serie no homologada.

## 3. Matriz de Cobertura de Pruebas (firestore.rules.test.ts)
Cada una de las 12 cargas maliciosas es validada y rechazada con `PERMISSION_DENIED` mediante las reglas reforzadas basadas en los 8 pilares de ABAC y Zero-Trust.
