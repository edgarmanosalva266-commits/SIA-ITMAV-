import { StaffUser, Teacher, Career, Course, Applicant, Student, Enrollment, GradeRecord, ScheduleItem, TreasuryPayment, SunatInvoice, Syllabus } from '../types';

export const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'staff-dir-01',
    name: 'Lic. Elmer Torres Peres',
    title: 'Director General',
    role: 'DIRECTOR',
    department: 'Dirección General Institucional',
    email: 'elmer.torres@itmanv.edu.pe',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'staff-adm-02',
    name: 'Lic. Emerita Vásquez Suárez',
    title: 'Jefa de Trámite Documentario y Admisión',
    role: 'TRAMITE_DOCUMENTARIO',
    department: 'Mesa de Partes y Admisión',
    email: 'emerita.vasquez@itmanv.edu.pe',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'staff-acad-03',
    name: 'Lic. Oscar Ortiz Regalao',
    title: 'Coordinador de Gestión Académica y Matrículas',
    role: 'GESTION_ACADEMICA',
    department: 'Secretaría y Registros Académicos',
    email: 'oscar.ortiz@itmanv.edu.pe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'staff-tes-04',
    name: 'CP. Maritza Saldaña Paredes',
    title: 'Encargada de Tesorería y Facturación SUNAT',
    role: 'TESORERIA',
    department: 'Área Financiera y Tributaria',
    email: 'tesoreria@itmanv.edu.pe',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'staff-doc-05',
    name: 'Lic. Carlos Mendoza Villanueva',
    title: 'Docente Titular de Gestión y Finanzas',
    role: 'DOCENTE',
    department: 'Gestión Empresarial y Negocios Bancarios',
    email: 'carlos.mendoza@itmanv.edu.pe',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'staff-est-06',
    name: 'Juan Diego Pérez Huamán',
    title: 'Estudiante V Ciclo - Administración de Empresas',
    role: 'ESTUDIANTE',
    department: 'Administración de Empresas',
    email: 'juan.perez@itmanv.edu.pe',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'staff-doc-05',
    code: 'DOC-2026-001',
    name: 'Lic. Carlos Mendoza Villanueva',
    docType: 'DNI',
    docNumber: '41829304',
    email: 'carlos.mendoza@itmanv.edu.pe',
    phone: '984512301',
    academicDegree: 'LICENCIADO',
    degreeTitle: 'Licenciado en Administración y Finanzas (Colegiado CLAD 14829)',
    department: 'Gestión Empresarial y Negocios Bancarios',
    condition: 'NOMBRADO',
    careerId: 'BOTH',
    assignedCourseIds: ['c-ade-501', 'c-ade-502', 'c-ade-503', 'c-anbf-101', 'c-anbf-501'],
    status: 'ACTIVO',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    hireDate: '2019-03-01'
  },
  {
    id: 'doc-002',
    code: 'DOC-2026-002',
    name: 'Mag. Rosa María Huamán Valdivia',
    docType: 'DNI',
    docNumber: '09817263',
    email: 'rosa.huaman@itmanv.edu.pe',
    phone: '971238491',
    academicDegree: 'MAGISTER',
    degreeTitle: 'Magíster en Contabilidad y Costos Empresariales',
    department: 'Gestión Empresarial y Negocios Bancarios',
    condition: 'NOMBRADO',
    careerId: 'car-ade',
    assignedCourseIds: ['c-ade-102', 'c-ade-202', 'c-ade-401'],
    status: 'ACTIVO',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    hireDate: '2020-08-15'
  },
  {
    id: 'doc-003',
    code: 'DOC-2026-003',
    name: 'Dr. Javier Fernández Benavides',
    docType: 'DNI',
    docNumber: '10928374',
    email: 'javier.fernandez@itmanv.edu.pe',
    phone: '992837412',
    academicDegree: 'DOCTOR',
    degreeTitle: 'Doctor en Economía y Mercado de Capitales SBS',
    department: 'Banca, Finanzas y Mercado de Valores',
    condition: 'CONTRATADO',
    careerId: 'car-anbf',
    assignedCourseIds: ['c-anbf-102', 'c-anbf-301', 'c-anbf-401'],
    status: 'ACTIVO',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    hireDate: '2022-03-01'
  },
  {
    id: 'doc-004',
    code: 'DOC-2026-004',
    name: 'Ing. Silvia Paredes Cárdenas',
    docType: 'DNI',
    docNumber: '45192837',
    email: 'silvia.paredes@itmanv.edu.pe',
    phone: '954182930',
    academicDegree: 'INGENIERO',
    degreeTitle: 'Ingeniera Comercial especialista en Banca Digital y Fintech',
    department: 'Innovación Financiera y Medios de Pago',
    condition: 'CONTRATADO',
    careerId: 'car-anbf',
    assignedCourseIds: ['c-anbf-201', 'c-anbf-501', 'c-anbf-502'],
    status: 'ACTIVO',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    hireDate: '2023-03-15'
  }
];

export const INITIAL_CAREERS: Career[] = [
  {
    id: 'car-ade',
    code: 'ADE-01',
    name: 'Administración de Empresas',
    faculty: 'Ciencias de la Gestión y Negocios',
    totalCredits: 128,
    durationSemesters: 6,
    modality: 'Presencial',
    degreeTitle: 'Profesional Técnico en Administración de Empresas',
    totalVacancies: 80,
    availableVacancies: 24,
  },
  {
    id: 'car-anbf',
    code: 'ANBF-02',
    name: 'Administración de Negocios Bancarios y Financieros',
    faculty: 'Banca, Finanzas y Gestión Empresarial',
    totalCredits: 128,
    durationSemesters: 6,
    modality: 'Presencial',
    degreeTitle: 'Profesional Técnico en Administración de Negocios Bancarios y Financieros',
    totalVacancies: 80,
    availableVacancies: 18,
  }
];

export const INITIAL_COURSES: Course[] = [
  // Carrera: Administración de Empresas (car-ade)
  // Ciclo I
  { id: 'c-ade-101', code: 'ADE-101', name: 'Fundamentos de Administración y Gestión Empresarial', careerId: 'car-ade', cycle: 1, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: [] },
  { id: 'c-ade-102', code: 'ADE-102', name: 'Contabilidad General y Costos', careerId: 'car-ade', cycle: 1, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: [] },
  { id: 'c-ade-103', code: 'ADE-103', name: 'Matemática para la Gestión de Negocios', careerId: 'car-ade', cycle: 1, credits: 3, theoryHours: 2, practiceHours: 2, prerequisites: [] },
  // Ciclo II
  { id: 'c-ade-201', code: 'ADE-201', name: 'Gestión del Talento Humano y Liderazgo', careerId: 'car-ade', cycle: 2, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['ADE-101'] },
  { id: 'c-ade-202', code: 'ADE-202', name: 'Costos y Presupuestos Empresariales', careerId: 'car-ade', cycle: 2, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['ADE-102'] },
  // Ciclo III
  { id: 'c-ade-301', code: 'ADE-301', name: 'Marketing Estratégico y Comercio Digital', careerId: 'car-ade', cycle: 3, credits: 5, theoryHours: 2, practiceHours: 6, prerequisites: ['ADE-201'] },
  { id: 'c-ade-302', code: 'ADE-302', name: 'Logística y Cadena de Suministros', careerId: 'car-ade', cycle: 3, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['ADE-202'] },
  // Ciclo IV
  { id: 'c-ade-401', code: 'ADE-401', name: 'Gestión Financiera y Flujo de Caja', careerId: 'car-ade', cycle: 4, credits: 5, theoryHours: 2, practiceHours: 6, prerequisites: ['ADE-202'] },
  { id: 'c-ade-402', code: 'ADE-402', name: 'Legislación Laboral y Tributaria Empresarial', careerId: 'car-ade', cycle: 4, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['ADE-201'] },
  // Ciclo V
  { id: 'c-ade-501', code: 'ADE-501', name: 'Planeamiento Estratégico y Control de Gestión', careerId: 'car-ade', cycle: 5, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['ADE-401'] },
  { id: 'c-ade-502', code: 'ADE-502', name: 'Formulación y Evaluación de Proyectos de Inversión', careerId: 'car-ade', cycle: 5, credits: 5, theoryHours: 2, practiceHours: 6, prerequisites: ['ADE-401', 'ADE-301'] },
  { id: 'c-ade-503', code: 'ADE-503', name: 'Comercio Exterior y Negocios Internacionales', careerId: 'car-ade', cycle: 5, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['ADE-401'] },

  // Carrera: Administración de Negocios Bancarios y Financieros (car-anbf)
  // Ciclo I
  { id: 'c-anbf-101', code: 'NBF-101', name: 'Sistema Financiero Peruano y Mercado de Capitales', careerId: 'car-anbf', cycle: 1, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: [] },
  { id: 'c-anbf-102', code: 'NBF-102', name: 'Matemática Financiera y Tasas de Interés SBS', careerId: 'car-anbf', cycle: 1, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: [] },
  { id: 'c-anbf-103', code: 'NBF-103', name: 'Contabilidad de Instituciones Financieras', careerId: 'car-anbf', cycle: 1, credits: 3, theoryHours: 2, practiceHours: 2, prerequisites: [] },
  // Ciclo II
  { id: 'c-anbf-201', code: 'NBF-201', name: 'Productos Financieros Pasivos y de Ahorro', careerId: 'car-anbf', cycle: 2, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['NBF-101'] },
  { id: 'c-anbf-202', code: 'NBF-202', name: 'Evaluación de Créditos Personales y de Consumo', careerId: 'car-anbf', cycle: 2, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['NBF-102'] },
  // Ciclo III
  { id: 'c-anbf-301', code: 'NBF-301', name: 'Evaluación y Análisis de Créditos MYPES', careerId: 'car-anbf', cycle: 3, credits: 5, theoryHours: 2, practiceHours: 6, prerequisites: ['NBF-202'] },
  { id: 'c-anbf-302', code: 'NBF-302', name: 'Normativa SBS y Prevención de Lavado de Activos (PLAFT)', careerId: 'car-anbf', cycle: 3, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['NBF-201'] },
  // Ciclo IV
  { id: 'c-anbf-401', code: 'NBF-401', name: 'Gestión de Riesgo Crediticio y Operativo', careerId: 'car-anbf', cycle: 4, credits: 5, theoryHours: 2, practiceHours: 6, prerequisites: ['NBF-301'] },
  { id: 'c-anbf-402', code: 'NBF-402', name: 'Finanzas Corporativas y Mercado de Valores', careerId: 'car-anbf', cycle: 4, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['NBF-301'] },
  // Ciclo V
  { id: 'c-anbf-501', code: 'NBF-501', name: 'Banca Digital, Fintech y Medios de Pago', careerId: 'car-anbf', cycle: 5, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['NBF-401'] },
  { id: 'c-anbf-502', code: 'NBF-502', name: 'Gestión y Recuperación de Cartera Vencida', careerId: 'car-anbf', cycle: 5, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['NBF-401'] },
  { id: 'c-anbf-503', code: 'NBF-503', name: 'Auditoría y Control Interno Bancario', careerId: 'car-anbf', cycle: 5, credits: 4, theoryHours: 2, practiceHours: 4, prerequisites: ['NBF-302'] }
];

export const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: 'app-001',
    fullName: 'Paredes Gonzales, Alexander Mateo',
    docType: 'DNI',
    docNumber: '72849102',
    birthDate: '2005-04-12',
    phone: '984512301',
    email: 'alex.paredes@gmail.com',
    careerId: 'car-ade',
    careerName: 'Administración de Empresas',
    modality: 'ORDINARIO',
    period: '2026-I',
    status: 'VALIDADO',
    score: 84.5,
    meritRank: 4,
    reviewedBy: 'Lic. Emerita Vásquez Suárez',
    reviewNotes: 'Documentación completa cotejada con RENIEC. Certificado de secundaria visado.',
    documents: { dniUploaded: true, certSecundaria: true, constanciaModality: false, affidavit: true },
    registrationDate: '2026-02-15'
  },
  {
    id: 'app-002',
    fullName: 'Villanueva Quispe, Andrea Nicole',
    docType: 'DNI',
    docNumber: '74563829',
    birthDate: '2006-01-28',
    phone: '951234789',
    email: 'andrea.villanueva@hotmail.com',
    careerId: 'car-anbf',
    careerName: 'Administración de Negocios Bancarios y Financieros',
    modality: 'PRIMEROS_PUESTOS',
    modalityDetail: '1er Puesto I.E. Emblemática Melitón Carvajal (Promedio 18.6)',
    period: '2026-I',
    status: 'APROBADO',
    score: 96.0,
    meritRank: 1,
    reviewedBy: 'Lic. Emerita Vásquez Suárez',
    reviewNotes: 'Exonerada por Primer Puesto según Ley 30512 Art. 24. Documentación verificada en SIAGIE.',
    documents: { dniUploaded: true, certSecundaria: true, constanciaModality: true, affidavit: true },
    registrationDate: '2026-02-10'
  },
  {
    id: 'app-003',
    fullName: 'Dubois Saint-Marc, Mariana Sofía',
    docType: 'CE',
    docNumber: '002938192',
    birthDate: '2004-09-17',
    phone: '912837465',
    email: 'mariana.dubois@gmail.com',
    careerId: 'car-anbf',
    careerName: 'Administración de Negocios Bancarios y Financieros',
    modality: 'DEPORTISTA_CALIFICADO',
    modalityDetail: 'Federación Peruana de Atletismo - Registro IPD N° 84920',
    period: '2026-I',
    status: 'APROBADO',
    score: 91.0,
    meritRank: 2,
    reviewedBy: 'Lic. Emerita Vásquez Suárez',
    reviewNotes: 'Carné de Extranjería vigente verificado ante Migraciones. Acreditación IPD vigente.',
    documents: { dniUploaded: true, certSecundaria: true, constanciaModality: true, affidavit: true },
    registrationDate: '2026-02-12'
  },
  {
    id: 'app-004',
    fullName: 'Mamani Condori, Juan Carlos',
    docType: 'DNI',
    docNumber: '70918234',
    birthDate: '2003-11-05',
    phone: '976543210',
    email: 'juan.mamani@outlook.com',
    careerId: 'car-ade',
    careerName: 'Administración de Empresas',
    modality: 'BECA_PRONABEC',
    modalityDetail: 'Preseleccionado Beca 18 Convocatoria 2026',
    period: '2026-I',
    status: 'VALIDADO',
    score: 89.0,
    meritRank: 3,
    reviewedBy: 'Lic. Emerita Vásquez Suárez',
    reviewNotes: 'Constancia de Preselección PRONABEC validada con código QR institucional.',
    documents: { dniUploaded: true, certSecundaria: true, constanciaModality: true, affidavit: true },
    registrationDate: '2026-02-18'
  },
  {
    id: 'app-005',
    fullName: 'Sánchez Rentería, Brayan Smith',
    docType: 'DNI',
    docNumber: '76891234',
    birthDate: '2005-08-20',
    phone: '923847561',
    email: 'brayan.sanchez@gmail.com',
    careerId: 'car-ade',
    careerName: 'Administración de Empresas',
    modality: 'DISCAPACIDAD_CONADIS',
    modalityDetail: 'Carné CONADIS N° 049281-2022',
    period: '2026-I',
    status: 'EN_REVISION',
    reviewedBy: 'Lic. Emerita Vásquez Suárez',
    reviewNotes: 'En espera de cotejo con Registro Nacional CONADIS.',
    documents: { dniUploaded: true, certSecundaria: true, constanciaModality: true, affidavit: false },
    registrationDate: '2026-02-22'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-001',
    studentCode: '2024-IT-0084',
    fullName: 'Pérez Huamán, Juan Diego',
    docType: 'DNI',
    docNumber: '74819234',
    email: 'juan.perez@itmanv.edu.pe',
    phone: '987654321',
    careerId: 'car-ade',
    careerName: 'Administración de Empresas',
    currentCycle: 5,
    turn: 'NOCHE',
    status: 'REGULAR',
    debtStatus: 'AL_DIA',
    totalDebt: 0,
    gpa: 16.85
  },
  {
    id: 'stu-002',
    studentCode: '2024-IT-0112',
    fullName: 'Dubois Saint-Marc, Mariana Sofía',
    docType: 'CE',
    docNumber: '002938192',
    email: 'mariana.dubois@itmanv.edu.pe',
    phone: '912837465',
    careerId: 'car-anbf',
    careerName: 'Administración de Negocios Bancarios y Financieros',
    currentCycle: 5,
    turn: 'NOCHE',
    status: 'REGULAR',
    debtStatus: 'AL_DIA',
    totalDebt: 0,
    gpa: 17.40
  },
  {
    id: 'stu-003',
    studentCode: '2024-IT-0045',
    fullName: 'Castillo Rojas, Ronald Javier',
    docType: 'DNI',
    docNumber: '71293845',
    email: 'ronald.castillo@itmanv.edu.pe',
    phone: '945678123',
    careerId: 'car-ade',
    careerName: 'Administración de Empresas',
    currentCycle: 5,
    turn: 'MAÑANA',
    status: 'CONDICIONAL',
    debtStatus: 'MOROSO',
    totalDebt: 320.0,
    gpa: 12.40
  },
  {
    id: 'stu-004',
    studentCode: '2025-IT-0021',
    fullName: 'Torres Benavides, Camila Lucía',
    docType: 'DNI',
    docNumber: '73948572',
    email: 'camila.torres@itmanv.edu.pe',
    phone: '965432187',
    careerId: 'car-anbf',
    careerName: 'Administración de Negocios Bancarios y Financieros',
    currentCycle: 3,
    turn: 'MAÑANA',
    status: 'REGULAR',
    debtStatus: 'AL_DIA',
    totalDebt: 0,
    gpa: 15.90
  }
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-2026-001',
    studentId: 'stu-001',
    studentCode: '2024-IT-0084',
    studentName: 'Pérez Huamán, Juan Diego',
    docType: 'DNI',
    docNumber: '74819234',
    period: '2026-I',
    careerId: 'car-ade',
    careerName: 'Administración de Empresas',
    cycle: 5,
    turn: 'NOCHE',
    totalCredits: 13,
    enrollmentDate: '2026-03-01 09:30:15',
    status: 'DEFINITIVA',
    approvedBy: 'Lic. Oscar Ortiz Regalao',
    qrVerificationUrl: 'https://itmanv.edu.pe/verificar-matricula/2026-IT-0084-V',
    courses: [
      { courseId: 'c-ade-501', courseCode: 'ADE-501', courseName: 'Planeamiento Estratégico y Control de Gestión', credits: 4, section: 'V-N1' },
      { courseId: 'c-ade-502', courseCode: 'ADE-502', courseName: 'Formulación y Evaluación de Proyectos de Inversión', credits: 5, section: 'V-N1' },
      { courseId: 'c-ade-503', courseCode: 'ADE-503', courseName: 'Comercio Exterior y Negocios Internacionales', credits: 4, section: 'V-N1' }
    ]
  }
];

export const INITIAL_GRADES: GradeRecord[] = [
  {
    id: 'grd-001',
    studentId: 'stu-001',
    studentCode: '2024-IT-0084',
    studentName: 'Pérez Huamán, Juan Diego',
    courseId: 'c-ade-501',
    courseCode: 'ADE-501',
    courseName: 'Planeamiento Estratégico y Control de Gestión',
    period: '2026-I',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    il1: 17,
    il2: 18,
    il3: 16,
    il4: 17,
    continuousAverage: 17.0,
    finalGrade: 17,
    attendancePercentage: 96,
    status: 'APROBADO',
    isClosedInActa: true
  },
  {
    id: 'grd-002',
    studentId: 'stu-001',
    studentCode: '2024-IT-0084',
    studentName: 'Pérez Huamán, Juan Diego',
    courseId: 'c-ade-502',
    courseCode: 'ADE-502',
    courseName: 'Formulación y Evaluación de Proyectos de Inversión',
    period: '2026-I',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    il1: 16,
    il2: 16,
    il3: 17,
    il4: 18,
    continuousAverage: 16.75,
    finalGrade: 17,
    attendancePercentage: 94,
    status: 'APROBADO',
    isClosedInActa: true
  },
  {
    id: 'grd-003',
    studentId: 'stu-001',
    studentCode: '2024-IT-0084',
    studentName: 'Pérez Huamán, Juan Diego',
    courseId: 'c-ade-503',
    courseCode: 'ADE-503',
    courseName: 'Comercio Exterior y Negocios Internacionales',
    period: '2026-I',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    il1: 18,
    il2: 19,
    il3: 17,
    il4: 19,
    continuousAverage: 18.25,
    finalGrade: 18,
    attendancePercentage: 98,
    status: 'APROBADO',
    isClosedInActa: true
  },
  {
    id: 'grd-004',
    studentId: 'stu-003',
    studentCode: '2024-IT-0045',
    studentName: 'Castillo Rojas, Ronald Javier',
    courseId: 'c-ade-501',
    courseCode: 'ADE-501',
    courseName: 'Planeamiento Estratégico y Control de Gestión',
    period: '2026-I',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    il1: 10,
    il2: 11,
    il3: 9,
    il4: 11,
    continuousAverage: 10.25,
    recoveryGrade: 13,
    finalGrade: 13,
    attendancePercentage: 74,
    status: 'APROBADO',
    isClosedInActa: false
  },
  {
    id: 'grd-005',
    studentId: 'stu-003',
    studentCode: '2024-IT-0045',
    studentName: 'Castillo Rojas, Ronald Javier',
    courseId: 'c-ade-503',
    courseCode: 'ADE-503',
    courseName: 'Comercio Exterior y Negocios Internacionales',
    period: '2026-I',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    il1: 8,
    il2: 7,
    il3: 6,
    il4: 0,
    continuousAverage: 5.25,
    finalGrade: 0,
    attendancePercentage: 62, // inasistencias superan el 30%
    status: 'DPI', // Desaprobado por Inasistencia
    isClosedInActa: false
  },
  {
    id: 'grd-006',
    studentId: 'stu-002',
    studentCode: '2024-IT-0112',
    studentName: 'Dubois Saint-Marc, Mariana Sofía',
    courseId: 'c-anbf-501',
    courseCode: 'NBF-501',
    courseName: 'Banca Digital, Fintech y Medios de Pago',
    period: '2026-I',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    il1: 19,
    il2: 18,
    il3: 19,
    il4: 20,
    continuousAverage: 19.0,
    finalGrade: 19,
    attendancePercentage: 98,
    status: 'APROBADO',
    isClosedInActa: true
  }
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch-01',
    courseId: 'c-ade-501',
    courseName: 'Planeamiento Estratégico y Control de Gestión',
    careerId: 'car-ade',
    cycle: 5,
    section: 'V-N1',
    day: 'Lunes',
    startTime: '18:30',
    endTime: '21:30',
    classroom: 'Aula A-201 (Simulación Empresarial)',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    turn: 'NOCHE'
  },
  {
    id: 'sch-02',
    courseId: 'c-ade-502',
    courseName: 'Formulación y Evaluación de Proyectos de Inversión',
    careerId: 'car-ade',
    cycle: 5,
    section: 'V-N1',
    day: 'Miércoles',
    startTime: '18:30',
    endTime: '22:15',
    classroom: 'Lab B-102 (Finanzas & Proyectos)',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    turn: 'NOCHE'
  },
  {
    id: 'sch-03',
    courseId: 'c-ade-503',
    courseName: 'Comercio Exterior y Negocios Internacionales',
    careerId: 'car-ade',
    cycle: 5,
    section: 'V-N1',
    day: 'Viernes',
    startTime: '18:30',
    endTime: '21:30',
    classroom: 'Aula A-203 (Negocios Globales)',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    turn: 'NOCHE'
  },
  {
    id: 'sch-04',
    courseId: 'c-anbf-101',
    courseName: 'Sistema Financiero Peruano y Mercado de Capitales',
    careerId: 'car-anbf',
    cycle: 1,
    section: 'I-M1',
    day: 'Martes',
    startTime: '08:00',
    endTime: '11:15',
    classroom: 'Lab B-104 (Banca Digital y Bolsa)',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    turn: 'MAÑANA'
  },
  {
    id: 'sch-05',
    courseId: 'c-anbf-501',
    courseName: 'Banca Digital, Fintech y Medios de Pago',
    careerId: 'car-anbf',
    cycle: 5,
    section: 'V-N1',
    day: 'Jueves',
    startTime: '18:30',
    endTime: '21:30',
    classroom: 'Lab B-104 (Banca Digital y Bolsa)',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    turn: 'NOCHE'
  }
];

export const INITIAL_TREASURY: TreasuryPayment[] = [
  {
    id: 'pay-001',
    studentId: 'stu-001',
    studentCode: '2024-IT-0084',
    studentName: 'Pérez Huamán, Juan Diego',
    docNumber: '74819234',
    concept: 'Matrícula Académica Semestre 2026-I - Administración de Empresas',
    period: '2026-I',
    amount: 180.0,
    dueDate: '2026-03-05',
    lateFee: 0,
    totalDue: 180.0,
    paidAmount: 180.0,
    paymentDate: '2026-03-01 11:20:00',
    paymentMethod: 'TRANSFERENCIA',
    status: 'PAGADO',
    invoiceId: 'inv-sunat-001',
    invoiceSeries: 'B001',
    invoiceNumber: '00000452'
  },
  {
    id: 'pay-002',
    studentId: 'stu-001',
    studentCode: '2024-IT-0084',
    studentName: 'Pérez Huamán, Juan Diego',
    docNumber: '74819234',
    concept: 'Pensión Cuota 01/05 - Semestre 2026-I',
    period: '2026-I',
    amount: 350.0,
    dueDate: '2026-03-31',
    lateFee: 0,
    totalDue: 350.0,
    paidAmount: 350.0,
    paymentDate: '2026-03-25 15:40:12',
    paymentMethod: 'YAPE_PLIN',
    status: 'PAGADO',
    invoiceId: 'inv-sunat-002',
    invoiceSeries: 'B001',
    invoiceNumber: '00000489'
  },
  {
    id: 'pay-003',
    studentId: 'stu-001',
    studentCode: '2024-IT-0084',
    studentName: 'Pérez Huamán, Juan Diego',
    docNumber: '74819234',
    concept: 'Pensión Cuota 02/05 - Semestre 2026-I',
    period: '2026-I',
    amount: 350.0,
    dueDate: '2026-04-30',
    lateFee: 0,
    totalDue: 350.0,
    paidAmount: 0,
    status: 'PENDIENTE'
  },
  {
    id: 'pay-004',
    studentId: 'stu-003',
    studentCode: '2024-IT-0045',
    studentName: 'Castillo Rojas, Ronald Javier',
    docNumber: '71293845',
    concept: 'Pensión Cuota 01/05 - Semestre 2026-I',
    period: '2026-I',
    amount: 300.0,
    dueDate: '2026-03-15',
    lateFee: 20.0,
    totalDue: 320.0,
    paidAmount: 0,
    status: 'VENCIDO'
  }
];

export const INITIAL_INVOICES: SunatInvoice[] = [
  {
    id: 'inv-sunat-001',
    type: '03_BOLETA',
    series: 'B001',
    number: '00000452',
    issueDate: '2026-03-01',
    issueTime: '11:20:00',
    issuerRuc: '20601849201',
    issuerName: 'INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO PRIVADO ITMAN',
    receiverDocType: '1',
    receiverDocNumber: '74819234',
    receiverName: 'PEREZ HUAMAN JUAN DIEGO',
    receiverAddress: 'Av. Universitaria 1420, San Miguel, Lima',
    currency: 'PEN',
    items: [
      {
        code: 'MAT-2026',
        description: 'DERECHO DE MATRICULA ACADEMICA 2026-I - ADMINISTRACION DE EMPRESAS',
        quantity: 1,
        unitPrice: 180.0,
        subtotal: 180.0,
        igv: 0.0,
        total: 180.0
      }
    ],
    taxableOperations: 0.0,
    exoneratedOperations: 180.0,
    totalIgv: 0.0,
    totalAmount: 180.0,
    hashSha256: 'K8fX91wLmPQrt2z/vYaO99nN3uE=',
    qrContent: '20601849201|03|B001|00000452|0.00|180.00|2026-03-01|1|74819234|K8fX91wLmPQrt2z/vYaO99nN3uE=|',
    sunatStatus: 'ACEPTADO',
    cdrResponseCode: '0',
    cdrDescription: 'La Boleta número B001-00000452 ha sido aceptada por la SUNAT en tiempo real.',
    xmlPayloadUbl: `<?xml version="1.0" encoding="ISO-8859-1"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>B001-00000452</cbc:ID>
  <cbc:IssueDate>2026-03-01</cbc:IssueDate>
  <cbc:IssueTime>11:20:00</cbc:IssueTime>
  <cbc:InvoiceTypeCode listID="0101">03</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>PEN</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="6">20601849201</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO PRIVADO ITMAN</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="1">74819234</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>PEREZ HUAMAN JUAN DIEGO</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="PEN">180.00</cbc:LineExtensionAmount>
    <cbc:PayableAmount currencyID="PEN">180.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`
  },
  {
    id: 'inv-sunat-002',
    type: '03_BOLETA',
    series: 'B001',
    number: '00000489',
    issueDate: '2026-03-25',
    issueTime: '15:40:12',
    issuerRuc: '20601849201',
    issuerName: 'INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO PRIVADO ITMAN',
    receiverDocType: '1',
    receiverDocNumber: '74819234',
    receiverName: 'PEREZ HUAMAN JUAN DIEGO',
    currency: 'PEN',
    items: [
      {
        code: 'PEN-01-2026',
        description: 'PENSION CUOTA 01/05 SEMESTRE ACADEMICO 2026-I - ADMINISTRACION DE EMPRESAS',
        quantity: 1,
        unitPrice: 350.0,
        subtotal: 350.0,
        igv: 0.0,
        total: 350.0
      }
    ],
    taxableOperations: 0.0,
    exoneratedOperations: 350.0,
    totalIgv: 0.0,
    totalAmount: 350.0,
    hashSha256: 'Z9aY44vKnMNrt1x/wZbP88mO2tF=',
    qrContent: '20601849201|03|B001|00000489|0.00|350.00|2026-03-25|1|74819234|Z9aY44vKnMNrt1x/wZbP88mO2tF=|',
    sunatStatus: 'ACEPTADO',
    cdrResponseCode: '0',
    cdrDescription: 'La Boleta número B001-00000489 ha sido aceptada por la SUNAT en tiempo real.',
    xmlPayloadUbl: `<?xml version="1.0" encoding="ISO-8859-1"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ID>B001-00000489</cbc:ID>
  <cbc:IssueDate>2026-03-25</cbc:IssueDate>
  <cac:LegalMonetaryTotal>
    <cbc:PayableAmount currencyID="PEN">350.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`
  }
];

export const INITIAL_SYLLABI: Syllabus[] = [
  {
    id: 'syl-ade-501',
    courseId: 'c-ade-501',
    courseCode: 'ADE-501',
    courseName: 'Planeamiento Estratégico y Control de Gestión',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    period: '2026-I',
    careerName: 'Administración de Empresas',
    competenceGeneral: 'Diseña, implementa y evalúa planes estratégicos de negocio y modelos de control de gestión alineados a la sostenibilidad y competitividad empresarial.',
    competenceSpecific: 'Formula matrices FODA, mapa de procesos, Balanced Scorecard (BSC) y cuadros de mando integral orientados a la optimización de recursos corporativos.',
    learningUnits: [
      {
        unitNumber: 1,
        title: 'Diagnóstico Estratégico y Análisis del Entorno Empresarial',
        weeks: 'Semanas 01 a 04',
        learningIndicator: 'IL1: Aplica herramientas de diagnóstico PESTEL, 5 Fuerzas de Porter y Matriz FODA cruzada.',
        contents: ['Visión, misión y valores corporativos', 'Análisis del micro y macroentorno peruano', 'Determinación de ventajas competitivas']
      },
      {
        unitNumber: 2,
        title: 'Formulación de Objetivos y Estrategias Corporativas',
        weeks: 'Semanas 05 a 08',
        learningIndicator: 'IL2: Elabora el mapa estratégico institucional alineado al crecimiento y rentabilidad.',
        contents: ['Estrategias genéricas de Porter y océano azul', 'Perspectivas financiera, clientes, procesos y aprendizaje', 'Diseño de KPIs estratégicos']
      },
      {
        unitNumber: 3,
        title: 'Tablero de Control y Cuadro de Mando Integral (Balanced Scorecard)',
        weeks: 'Semanas 09 a 13',
        learningIndicator: 'IL3: Modela tableros de control de gestión con metas cuantitativas y planes de acción.',
        contents: ['Metodología BSC Kaplan & Norton', 'Monitoreo de metas semestrales y anuales', 'Auditoría de gestión y desvíos operativos']
      },
      {
        unitNumber: 4,
        title: 'Evaluación del Desempeño y Sostenibilidad Organizacional',
        weeks: 'Semanas 14 a 18',
        learningIndicator: 'IL4: Diseña planes de contingencia estratégica y gobierno corporativo para PYMES y empresas.',
        contents: ['Responsabilidad Social Empresarial (RSE)', 'Planes de continuidad de negocio y reingeniería', 'Sustentación de plan estratégico final']
      }
    ],
    evaluationCriteria: 'Evaluación continua formativa por indicadores de logro (IL1 a IL4: 25% c/u). Calificación vigesimal 0 a 20. Nota mínima aprobatoria: 13.',
    updatedAt: '2026-03-01'
  },
  {
    id: 'syl-anbf-501',
    courseId: 'c-anbf-501',
    courseCode: 'NBF-501',
    courseName: 'Banca Digital, Fintech y Medios de Pago',
    teacherId: 'staff-doc-05',
    teacherName: 'Lic. Carlos Mendoza Villanueva',
    period: '2026-I',
    careerName: 'Administración de Negocios Bancarios y Financieros',
    competenceGeneral: 'Gestiona soluciones de innovación financiera, productos bancarios digitales y plataformas de intermediación crediticia bajo regulación de la SBS y Banco Central de Reserva del Perú (BCRP).',
    competenceSpecific: 'Analiza modelos de negocio Fintech (billeteras electrónicas, pasarelas de pago, factoring digital y scoring crediticio alternativo) mitigando el riesgo operativo.',
    learningUnits: [
      {
        unitNumber: 1,
        title: 'Ecosistema Financiero Digital y Nuevas Tecnologías',
        weeks: 'Semanas 01 a 04',
        learningIndicator: 'IL1: Identifica la arquitectura de banca por internet, aplicaciones móviles y billeteras electrónicas.',
        contents: ['Transformación digital en el sistema bancario peruano', 'Billeteras digitales: Yape, Plin y modelo CCE', 'Open Banking y APIs financieras']
      },
      {
        unitNumber: 2,
        title: 'Modelos de Negocio Fintech y Criptoactivos',
        weeks: 'Semanas 05 a 08',
        learningIndicator: 'IL2: Evalúa plataformas de Crowdfunding, Factoring electrónico y pasarelas de pago.',
        contents: ['Plataformas de cambio de divisas y factoring digital', 'Scoring crediticio con Machine Learning', 'Bancos 100% digitales (Neobanks)']
      },
      {
        unitNumber: 3,
        title: 'Ciberseguridad y Prevención del Fraude Financiero',
        weeks: 'Semanas 09 a 13',
        learningIndicator: 'IL3: Aplica protocolos de autenticación biométrica y prevención de estafas electrónicas.',
        contents: ['Reglamento de Gestión de Riesgo Operacional SBS', 'Tokenización de tarjetas y autenticación 3DS', 'Monitoreo transaccional antifraude']
      },
      {
        unitNumber: 4,
        title: 'Regulación SBS y Tendencias Futuras en Banca y Finanzas',
        weeks: 'Semanas 14 a 18',
        learningIndicator: 'IL4: Desarrolla propuestas de inclusión financiera y digitalización de carteras bancarias.',
        contents: ['Inclusión financiera en zonas rurales y urbanas', 'Monedas digitales de banco central (CBDC)', 'Proyecto aplicativo final de banca digital']
      }
    ],
    evaluationCriteria: 'Evaluación formativa continua según R.V.M. N° 178-2018-MINEDU. Escala 0 a 20. Resaltado de desaprobados (< 13). Promedio mínimo aprobatorio: 13.',
    updatedAt: '2026-03-01'
  }
];
