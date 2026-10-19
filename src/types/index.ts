export type RoleType = 
  | 'DIRECTOR'            // Lic. Elmer Torres Peres
  | 'TRAMITE_DOCUMENTARIO'// Lic. Emerita Vásquez Suárez
  | 'GESTION_ACADEMICA'   // Lic. Oscar Ortiz Regalao
  | 'TESORERIA'           // Tesorería & Facturación SUNAT
  | 'DOCENTE'             // Docentes del ITMANV
  | 'ESTUDIANTE';         // Alumnos matriculados

export interface StaffUser {
  id: string;
  name: string;
  title: string;
  role: RoleType;
  department: string;
  email: string;
  avatar?: string;
}

export type DocumentType = 'DNI' | 'CE' | 'PASAPORTE';

export interface Teacher {
  id: string;
  code: string; // e.g. "DOC-2026-001"
  name: string;
  docType: DocumentType;
  docNumber: string;
  email: string;
  phone: string;
  academicDegree: 'LICENCIADO' | 'MAGISTER' | 'DOCTOR' | 'INGENIERO';
  degreeTitle: string; // e.g. "Lic. en Administración de Empresas"
  department: string;
  condition: 'NOMBRADO' | 'CONTRATADO' | 'EXTRAORDINARIO';
  careerId: string; // 'car-ade' | 'car-anbf' | 'BOTH'
  assignedCourseIds: string[];
  status: 'ACTIVO' | 'INACTIVO';
  avatar?: string;
  hireDate?: string;
}

export type AdmissionModality = 
  | 'ORDINARIO'
  | 'PRIMEROS_PUESTOS'
  | 'DEPORTISTA_CALIFICADO'
  | 'DISCAPACIDAD_CONADIS'
  | 'TITULADO_GRADUADO'
  | 'TRASLADO_EXTERNO'
  | 'BECA_PRONABEC';

export interface Applicant {
  id: string;
  fullName: string;
  docType: DocumentType;
  docNumber: string;
  birthDate: string;
  phone: string;
  email: string;
  careerId: string;
  careerName: string;
  modality: AdmissionModality;
  modalityDetail?: string;
  period: string; // e.g. "2026-I"
  status: 'INSCRITO' | 'EN_REVISION' | 'VALIDADO' | 'APROBADO' | 'OBSERVADO' | 'MATRICULADO';
  score?: number; // Puntaje de examen (0-100)
  meritRank?: number;
  reviewedBy?: string; // Lic. Emerita Vásquez Suárez
  reviewNotes?: string;
  documents: {
    dniUploaded: boolean;
    certSecundaria: boolean;
    constanciaModality: boolean; // Certificado de deportista, primer puesto, etc.
    affidavit: boolean;
  };
  registrationDate: string;
}

export interface Career {
  id: string;
  code: string;
  name: string;
  faculty: string;
  totalCredits: number;
  durationSemesters: number;
  modality: 'Presencial' | 'Semipresencial';
  degreeTitle: string;
  totalVacancies: number;
  availableVacancies: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  careerId: string;
  cycle: number; // 1 to 6
  credits: number;
  theoryHours: number;
  practiceHours: number;
  prerequisites: string[]; // Course codes required
  syllabusUrl?: string;
}

export interface Student {
  id: string;
  studentCode: string; // e.g. "2024-IT-0084"
  fullName: string;
  docType: DocumentType;
  docNumber: string;
  email: string;
  phone: string;
  careerId: string;
  careerName: string;
  currentCycle: number;
  turn: 'MAÑANA' | 'TARDE' | 'NOCHE';
  status: 'REGULAR' | 'CONDICIONAL' | 'EGRESADO' | 'RESERVADO';
  debtStatus: 'AL_DIA' | 'MOROSO';
  totalDebt: number; // PEN S/.
  gpa: number; // Promedio Ponderado Acumulado
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  docNumber: string;
  docType: DocumentType;
  period: string;
  careerId: string;
  careerName: string;
  cycle: number;
  turn: 'MAÑANA' | 'TARDE' | 'NOCHE';
  courses: {
    courseId: string;
    courseCode: string;
    courseName: string;
    credits: number;
    section: string;
  }[];
  totalCredits: number;
  enrollmentDate: string;
  status: 'BORRADOR' | 'VALIDADA' | 'DEFINITIVA';
  approvedBy: string; // Lic. Oscar Ortiz Regalao
  qrVerificationUrl: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  period: string;
  teacherId: string;
  teacherName: string;
  // Evaluación formativa por competencias (LAG MINEDU)
  il1: number; // Indicador de Logro 1 (0-20)
  il2: number; // Indicador de Logro 2 (0-20)
  il3: number; // Indicador de Logro 3 (0-20)
  il4: number; // Indicador de Logro 4 (0-20)
  continuousAverage: number; // Promedio de indicadores
  recoveryGrade?: number; // Evaluación de Recuperación (ER) si 10 <= Promedio <= 12
  finalGrade: number; // Nota final vigesimal oficial (0-20, mín. 13)
  attendancePercentage: number; // 0-100%
  status: 'APROBADO' | 'DESAPROBADO' | 'DPI'; // DPI: Desaprobado por Inasistencia (> 30% faltas)
  isClosedInActa: boolean;
}

export interface ScheduleItem {
  id: string;
  courseId: string;
  courseName: string;
  careerId: string;
  cycle: number;
  section: string;
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  startTime: string; // "08:00"
  endTime: string;   // "10:15"
  classroom: string; // "Laboratorio C-201", "Aula 304"
  teacherId: string;
  teacherName: string;
  turn: 'MAÑANA' | 'TARDE' | 'NOCHE';
}

export interface TreasuryPayment {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  docNumber: string;
  concept: string; // "Matrícula 2026-I", "Pensión Cuota 01/05", "Certificado de Estudios"
  period: string;
  amount: number; // S/.
  dueDate: string; // "2026-03-31"
  lateFee: number; // S/. por mora
  totalDue: number;
  paidAmount: number;
  paymentDate?: string;
  paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'YAPE_PLIN';
  status: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
  invoiceId?: string;
  invoiceSeries?: string;
  invoiceNumber?: string;
}

export interface SunatInvoice {
  id: string;
  type: '03_BOLETA' | '01_FACTURA';
  series: string; // B001 o F001
  number: string; // 00001045
  issueDate: string;
  issueTime: string;
  // Emisor: IESTP ITMANV
  issuerRuc: string; // 20601849201
  issuerName: string; // INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO PRIVADO ITMAN
  // Receptor
  receiverDocType: '1' | '6' | '4' | '7'; // 1: DNI, 6: RUC, 4: CE, 7: Pasaporte
  receiverDocNumber: string;
  receiverName: string;
  receiverAddress?: string;
  // Detalle
  currency: 'PEN';
  items: {
    code: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    igv: number;
    total: number;
  }[];
  taxableOperations: number; // Operaciones gravadas
  exoneratedOperations: number; // Operaciones exoneradas (Educación según TUO IGV)
  totalIgv: number;
  totalAmount: number;
  // Criptografía y SUNAT
  hashSha256: string;
  qrContent: string;
  sunatStatus: 'ACEPTADO' | 'EN_PROCESO' | 'RECHAZADO';
  cdrResponseCode: string; // "0" = Aceptado con éxito
  cdrDescription: string;
  xmlPayloadUbl: string;
}

export interface Syllabus {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  period: string;
  careerName: string;
  competenceGeneral: string;
  competenceSpecific: string;
  learningUnits: {
    unitNumber: number;
    title: string;
    weeks: string;
    learningIndicator: string;
    contents: string[];
  }[];
  evaluationCriteria: string;
  updatedAt: string;
}
