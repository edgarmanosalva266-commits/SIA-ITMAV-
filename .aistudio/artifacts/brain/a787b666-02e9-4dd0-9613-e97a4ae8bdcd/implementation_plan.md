# Agregar Docentes en el Módulo Portal Docente

Implement full CRUD support for adding and managing teachers directly within the Teacher Portal and syncing them with Firestore.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Confirmed Option 1**: The "Agregar Docente" button and modal will be located in the top header next to the teacher info and tabs in `TeacherPortal.tsx`.
> - **Data Scope**: New teacher registration includes code, name, DNI, email, phone, academic degree, professional title, department, condition (Nombrado/Contratado), career assignment, and initial assigned courses.
> - **Persistence**: New teachers are persisted to Firestore (`teachers` collection) and synchronized in real-time across the application.

## 1. Overview & Core Concept

- **What It Does**: Allows academic coordinators, directors, or administrators in the Teacher Portal to register new faculty members with complete credentials (DNI, academic degree, professional title, department, employment condition, assigned career, and course load), persisting them securely to Firestore and instantly updating the teacher list.
- **Target Audience**: Academic Directors, Coordinators, and Faculty staff.
- **Key Value**: Eliminates manual hardcoding of initial teachers and enables dynamic academic faculty management.

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. User navigates to the Teacher Portal.
  2. Clicks the "+ Registrar Nuevo Docente" button in the top header.
  3. Fills out the modal form (Personal info, Academic Degree, Department, Condition, Career, and Courses).
  4. Submits form -> Validates inputs -> Saves to Firestore (`saveTeacher`) -> Displays success toast and updates state.
- **Visual Identity & Theme**:
  - Clean SaaS dashboard aesthetic matching the rest of ITMANV platform (Slate neutrals, Red primary accents, clean typography).
  - Modal with backdrop blur, clear form validation, and tabular data displays.

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Integration with existing Firestore `teachers` collection and `saveTeacher` function in `db.ts`.
  - *Why*: Ensures data consistency and real-time synchronization across all institutional modules.
- **Decision 2**: Modal-based registration form.
  - *Why*: Keeps the user in context without cluttering the main dashboard view.

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                      App.tsx                           │
│   - teachers state collection                          │
│   - saveTeacher (Firestore sync)                       │
└───────────────────┬────────────────────────────────────┘
                    │ passes props
┌───────────────────▼────────────────────────────────────┐
│                  TeacherPortal.tsx                     │
│   - List & filter teachers                             │
│   - "+ Registrar Docente" button & Modal               │
│   - handleSubmitNewTeacher() -> onSaveTeacher          │
└────────────────────────────────────────────────────────┘
```

- **Data Model**: Uses the existing `Teacher` interface in `src/types/index.ts`.
- **State Flow**: `TeacherPortal` accepts `onSaveTeacher` prop from `App.tsx`, which writes to Firestore and updates local state.
