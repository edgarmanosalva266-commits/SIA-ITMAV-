# SIA ITMANV - Sistema Integrado Académico & Facturación SUNAT

Sistema Integrado de Gestión Académica, Admisión, Matrículas, Evaluación por Competencias MINEDU, Asignación Docente, Tesorería y Facturación Electrónica SUNAT para el Instituto de Educación Superior Tecnológico Privado ITMAN (ITMANV).

---

## 🚀 Requisitos Previos para Ejecutar Localmente

Antes de comenzar, asegúrate de tener instalado en tu computadora:

1. **Node.js** (versión 18 LTS, 20 LTS o 22 LTS recomendada):
   - Descárgalo desde [nodejs.org](https://nodejs.org/)
   - Verifica su instalación en tu terminal:
     ```bash
     node -v
     npm -v
     ```
2. **Git** (opcional, para clonar el repositorio):
   - [git-scm.com](https://git-scm.com/)

---

## 🛠️ Pasos de Instalación y Ejecución Local

### Paso 1: Descargar el Proyecto
Si descargaste el archivo ZIP desde AI Studio:
1. Descomprime la carpeta en tu computadora (ejemplo: en `C:\Proyectos\sia-itmanv` o en tu carpeta personal).
2. Abre tu terminal o consola (PowerShell, Símbolo del sistema o Terminal de macOS/Linux) y dirígete a esa carpeta:
   ```bash
   cd ruta/a/tu/proyecto
   ```

### Paso 2: Instalar Dependencias
Ejecuta el siguiente comando para descargar e instalar todas las librerías necesarias:

```bash
npm install
```

> **Nota:** Si utilizas `bun`, `pnpm` o `yarn`, también puedes usar:
> ```bash
> bun install   # o: pnpm install / yarn
> ```

### Paso 3: Configuración de Firebase y Variables de Entorno
El proyecto ya cuenta con el archivo `firebase-applet-config.json` preconfigurado con tu base de datos de Firestore (`ai-studio-a787b666-02e9-4dd0-9613-e97a4ae8bdcd`).

Si deseas configurar variables de entorno adicionales:
1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   *(En Windows CMD: `copy .env.example .env`)*

### Paso 4: Iniciar el Servidor de Desarrollo Local (Puerto 5173)
Para ejecutar en **`localhost:5173`**, ejecuta:

```bash
npm run dev:5173
```
*(O también: `npm run dev -- --port 5173` o `npx vite --port 5173`)*

Verás en la terminal:
```
  VITE v6.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://0.0.0.0:5173/
```

### Paso 5: Abrir la Aplicación en tu Navegador
Abre tu navegador web favorito (Google Chrome, Edge, Firefox, Brave) e ingresa a:

👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📦 Scripts Disponibles

En el directorio del proyecto puedes ejecutar:

- `npm run dev`: Inicia el servidor de desarrollo en tiempo real con recarga rápida (HMR).
- `npm run build`: Genera los archivos optimizados para producción en la carpeta `dist/`.
- `npm run preview`: Previsualiza localmente la versión compilada de producción.
- `npm run lint`: Ejecuta el verificador de tipos de TypeScript (`tsc --noEmit`) para asegurar cero errores.

---

## 🧩 Módulos Disponibles en la Aplicación

1. **Admisión & Registro de Postulantes:** Control de postulantes, modalidades de ingreso, validación de certificados y puntajes.
2. **Matrícula Académica & Carga de Cursos:** Fichas de matrícula oficial 2026-I, convalidaciones y reserva de matrícula.
3. **Evaluación por Competencias & Actas MINEDU:** Registro de Indicadores de Logro (IL1-IL4), cálculo de notas vigesimales, alertas de inasistencia (DPI) y generación de actas en PDF.
4. **Portal del Docente & Plana Académica:**
   - Carga lectiva y sílabos oficiales.
   - Directorio de docentes.
   - **Registro de nuevos docentes** con persistencia en Firestore.
   - **Asignación de carga académica interactiva**.
   - Control de asistencia de sesión diaria.
5. **Tesorería, Pensiones & Facturación SUNAT:**
   - Registro de pagos con cálculo de moras.
   - Generación de cronogramas y cuotas.
   - Emisión de Boletas Electrónicas SUNAT (UBL 2.1) con código QR y hash SHA-256.
   - Descarga de comprobantes en PDF.
6. **Portal del Estudiante:**
   - Selector de estudiante matriculado.
   - Consulta de notas, horario de clases, estado de cuenta y boletas electrónicas.
   - Descarga de boleta informativa de notas oficial en PDF.
