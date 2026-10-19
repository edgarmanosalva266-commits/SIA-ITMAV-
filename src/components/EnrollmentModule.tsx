import React, { useState } from 'react';
import { 
  Student, 
  Course, 
  Enrollment, 
  TreasuryPayment, 
  Career,
  Applicant,
  GradeRecord
} from '../types';
import { 
  GraduationCap, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Printer, 
  Lock, 
  FileCheck, 
  Layers, 
  X,
  BookOpen,
  QrCode,
  Plus,
  Edit3,
  UserCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Filter,
  ShieldCheck,
  Eye,
  Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface EnrollmentProps {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  treasury: TreasuryPayment[];
  careers: Career[];
  applicants?: Applicant[];
  onSaveEnrollment: (enrollment: Enrollment) => Promise<void>;
  onSaveCourse?: (course: Course) => Promise<void>;
  onSaveStudent?: (student: Student) => Promise<void>;
  onSaveGrade?: (grade: GradeRecord) => Promise<void>;
  onUpdateApplicantStatus?: (id: string, status: Applicant['status'], reviewedBy: string, score?: number) => Promise<void>;
  currentUserRole: string;
}

export const EnrollmentModule: React.FC<EnrollmentProps> = ({
  students,
  courses,
  enrollments,
  treasury,
  careers,
  applicants = [],
  onSaveEnrollment,
  onSaveCourse,
  onSaveStudent,
  onSaveGrade,
  onUpdateApplicantStatus,
  currentUserRole
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'enrollment' | 'courses' | 'admission-sync' | 'history'>('enrollment');

  // Enrollment Tab State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedTurn, setSelectedTurn] = useState<'MAÑANA' | 'TARDE' | 'NOCHE'>('NOCHE');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [viewingFicha, setViewingFicha] = useState<Enrollment | null>(null);
  const [notification, setNotification] = useState<{ type: 'error' | 'warning' | 'success'; message: string } | null>(null);

  // Courses (Didactic Units) Management State
  const [courseSearch, setCourseSearch] = useState('');
  const [courseCareerFilter, setCourseCareerFilter] = useState<string>('ALL');
  const [courseCycleFilter, setCourseCycleFilter] = useState<string>('ALL');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Course Form State
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCareerId, setCourseCareerId] = useState('car-ade');
  const [courseCycle, setCourseCycle] = useState<number>(1);
  const [courseCredits, setCourseCredits] = useState<number>(3);
  const [courseTheoryHours, setCourseTheoryHours] = useState<number>(2);
  const [coursePracticeHours, setCoursePracticeHours] = useState<number>(2);
  const [coursePrerequisites, setCoursePrerequisites] = useState<string[]>([]);

  // Admission Sync Tab State
  const [syncSearch, setSyncSearch] = useState('');
  const [syncStatusFilter, setSyncStatusFilter] = useState<'ALL' | 'APROBADO' | 'MATRICULADO' | 'INSCRITO'>('ALL');
  const [syncingApplicant, setSyncingApplicant] = useState<Applicant | null>(null);
  const [syncTurn, setSyncTurn] = useState<'MAÑANA' | 'TARDE' | 'NOCHE'>('NOCHE');
  const [syncSelectedCourses, setSyncSelectedCourses] = useState<string[]>([]);

  // Determine active student
  const activeStudent = students.find(s => s.id === selectedStudentId);

  // Check student debt in treasury
  const studentDebtItems = treasury.filter(
    t => t.studentId === selectedStudentId && t.status === 'VENCIDO'
  );
  const totalDebt = studentDebtItems.reduce((acc, curr) => acc + (curr.totalDue - curr.paidAmount), 0);
  const isMoroso = totalDebt > 0;

  // Filter courses for active student career and cycle
  const availableCourses = courses.filter(c => {
    if (!activeStudent) return false;
    return c.careerId === activeStudent.careerId && c.cycle <= activeStudent.currentCycle;
  });

  // Prerequisite check logic
  const passedCoursesCodes = activeStudent?.currentCycle === 5 ? [
    'ADE-101', 'ADE-102', 'ADE-103', 'ADE-201', 'ADE-202', 'ADE-301', 'ADE-302', 'ADE-401', 'ADE-402',
    'NBF-101', 'NBF-102', 'NBF-103', 'NBF-201', 'NBF-202', 'NBF-301', 'NBF-302', 'NBF-401', 'NBF-402'
  ] : activeStudent?.currentCycle === 1 ? [] : [
    'ADE-101', 'ADE-102', 'ADE-103', 'NBF-101', 'NBF-102', 'NBF-103'
  ];

  const toggleCourse = (course: Course) => {
    const missingPrereqs = course.prerequisites.filter(req => !passedCoursesCodes.includes(req));
    if (missingPrereqs.length > 0) {
      setNotification({
        type: 'warning',
        message: `Prerrequisito requerido: No puede matricularse en ${course.name}. Requiere tener aprobado: ${missingPrereqs.join(', ')}.`
      });
      return;
    }

    if (selectedCourseIds.includes(course.id)) {
      setSelectedCourseIds(selectedCourseIds.filter(id => id !== course.id));
    } else {
      setSelectedCourseIds([...selectedCourseIds, course.id]);
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!activeStudent) return;

    if (isMoroso) {
      setNotification({
        type: 'error',
        message: `BLOQUEO DE MATRÍCULA: El estudiante registra una deuda vencida de S/. ${totalDebt.toFixed(2)} en Tesorería. Debe regularizar sus cuotas para continuar.`
      });
      return;
    }

    if (selectedCourseIds.length === 0) {
      setNotification({
        type: 'warning',
        message: 'Debe seleccionar al menos una unidad didáctica para formalizar la matrícula.'
      });
      return;
    }

    const enrolledCourseObjects = courses
      .filter(c => selectedCourseIds.includes(c.id))
      .map(c => ({
        courseId: c.id,
        courseCode: c.code,
        courseName: c.name,
        credits: c.credits,
        section: `${activeStudent.currentCycle}-${selectedTurn[0]}1`
      }));

    const totalCreds = enrolledCourseObjects.reduce((acc, c) => acc + c.credits, 0);

    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      studentId: activeStudent.id,
      studentCode: activeStudent.studentCode,
      studentName: activeStudent.fullName,
      docType: activeStudent.docType,
      docNumber: activeStudent.docNumber,
      period: '2026-I',
      careerId: activeStudent.careerId,
      careerName: activeStudent.careerName,
      cycle: activeStudent.currentCycle,
      turn: selectedTurn,
      totalCredits: totalCreds,
      enrollmentDate: new Date().toLocaleString('es-PE'),
      status: 'DEFINITIVA',
      approvedBy: 'Lic. Oscar Ortiz Regalao',
      qrVerificationUrl: `https://itmanv.edu.pe/verificar-matricula/${activeStudent.studentCode}-2026I`,
      courses: enrolledCourseObjects
    };

    await onSaveEnrollment(newEnrollment);

    // Synchronize grades: initialize grade records for each enrolled course in 2026-I
    if (onSaveGrade) {
      for (const c of enrolledCourseObjects) {
        const gradeRec: GradeRecord = {
          id: `grd-${activeStudent.id}-${c.courseId}`,
          studentId: activeStudent.id,
          studentCode: activeStudent.studentCode,
          studentName: activeStudent.fullName,
          courseId: c.courseId,
          courseCode: c.courseCode,
          courseName: c.courseName,
          period: '2026-I',
          teacherId: 'staff-doc-05',
          teacherName: 'Ing. Carlos Mendoza Villanueva',
          il1: 14,
          il2: 14,
          il3: 14,
          il4: 14,
          continuousAverage: 14.0,
          finalGrade: 14,
          attendancePercentage: 100,
          status: 'APROBADO',
          isClosedInActa: false
        };
        await onSaveGrade(gradeRec);
      }
    }

    setViewingFicha(newEnrollment);
    setSelectedCourseIds([]);
    setNotification({
      type: 'success',
      message: `Matrícula procesada y refrendada con éxito para ${activeStudent.fullName}. Generando Ficha Oficial A4 y sincronizado con Actas de Notas.`
    });
  };

  // --- HANDLERS FOR COURSES (DIDACTIC UNITS) ADD/EDIT ---
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseCode('');
    setCourseName('');
    setCourseCareerId('car-ade');
    setCourseCycle(1);
    setCourseCredits(3);
    setCourseTheoryHours(2);
    setCoursePracticeHours(2);
    setCoursePrerequisites([]);
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseCode(course.code);
    setCourseName(course.name);
    setCourseCareerId(course.careerId);
    setCourseCycle(course.cycle);
    setCourseCredits(course.credits);
    setCourseTheoryHours(course.theoryHours);
    setCoursePracticeHours(course.practiceHours);
    setCoursePrerequisites(course.prerequisites || []);
    setShowCourseModal(true);
  };

  const handleSaveCourseForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseCode.trim()) {
      setNotification({ type: 'error', message: 'El código de la unidad didáctica es obligatorio.' });
      return;
    }
    if (!courseName.trim()) {
      setNotification({ type: 'error', message: 'El nombre de la unidad didáctica es obligatorio.' });
      return;
    }
    if (courseCredits <= 0) {
      setNotification({ type: 'error', message: 'El número de créditos debe ser mayor a 0.' });
      return;
    }

    const courseData: Course = {
      id: editingCourse ? editingCourse.id : `crs-${Date.now()}`,
      code: courseCode.trim().toUpperCase(),
      name: courseName.trim(),
      careerId: courseCareerId,
      cycle: Number(courseCycle),
      credits: Number(courseCredits),
      theoryHours: Number(courseTheoryHours),
      practiceHours: Number(coursePracticeHours),
      prerequisites: coursePrerequisites
    };

    if (onSaveCourse) {
      await onSaveCourse(courseData);
    }

    setShowCourseModal(false);
    setNotification({
      type: 'success',
      message: editingCourse 
        ? `Unidad didáctica "${courseData.code} - ${courseData.name}" actualizada con éxito en Firestore.`
        : `Nueva unidad didáctica "${courseData.code} - ${courseData.name}" agregada a la malla curricular 2026-I.`
    });
  };

  // --- HANDLERS FOR ADMISSION SYNC ---
  const handleOpenSyncModal = (applicant: Applicant) => {
    setSyncingApplicant(applicant);
    setSyncTurn('NOCHE');
    // Preselect all cycle 1 courses for their career
    const cycle1Courses = courses.filter(c => c.careerId === applicant.careerId && c.cycle === 1);
    setSyncSelectedCourses(cycle1Courses.map(c => c.id));
  };

  const handleConfirmAdmissionSync = async () => {
    if (!syncingApplicant) return;

    if (syncSelectedCourses.length === 0) {
      setNotification({
        type: 'warning',
        message: 'Debe seleccionar al menos una unidad didáctica del Ciclo I para matricular al ingresante.'
      });
      return;
    }

    // 1. Generate unique SIA student code: e.g. 2026-IT-0091
    const nextCodeNum = 85 + students.length + 1;
    const studentCode = `2026-IT-${String(nextCodeNum).padStart(4, '0')}`;
    const studentId = `std-adm-${syncingApplicant.id}`;

    // 2. Create official Student record
    const newStudent: Student = {
      id: studentId,
      studentCode,
      fullName: syncingApplicant.fullName,
      docType: syncingApplicant.docType,
      docNumber: syncingApplicant.docNumber,
      email: syncingApplicant.email,
      phone: syncingApplicant.phone,
      careerId: syncingApplicant.careerId,
      careerName: syncingApplicant.careerName,
      currentCycle: 1,
      turn: syncTurn,
      status: 'REGULAR',
      debtStatus: 'AL_DIA',
      totalDebt: 0,
      gpa: 14.0
    };

    if (onSaveStudent) {
      await onSaveStudent(newStudent);
    }

    // 3. Create official Enrollment record for 2026-I
    const enrolledObjs = courses
      .filter(c => syncSelectedCourses.includes(c.id))
      .map(c => ({
        courseId: c.id,
        courseCode: c.code,
        courseName: c.name,
        credits: c.credits,
        section: `1-${syncTurn[0]}1`
      }));

    const totalCreds = enrolledObjs.reduce((acc, c) => acc + c.credits, 0);

    const newEnrollment: Enrollment = {
      id: `enr-adm-${Date.now()}`,
      studentId: newStudent.id,
      studentCode: newStudent.studentCode,
      studentName: newStudent.fullName,
      docType: newStudent.docType,
      docNumber: newStudent.docNumber,
      period: '2026-I',
      careerId: newStudent.careerId,
      careerName: newStudent.careerName,
      cycle: 1,
      turn: syncTurn,
      totalCredits: totalCreds,
      enrollmentDate: new Date().toLocaleString('es-PE'),
      status: 'DEFINITIVA',
      approvedBy: 'Lic. Oscar Ortiz Regalao',
      qrVerificationUrl: `https://itmanv.edu.pe/verificar-matricula/${newStudent.studentCode}-2026I`,
      courses: enrolledObjs
    };

    await onSaveEnrollment(newEnrollment);

    // Synchronize grades: initialize grade records for each enrolled course for the admitted student in 2026-I
    if (onSaveGrade) {
      for (const c of enrolledObjs) {
        const gradeRec: GradeRecord = {
          id: `grd-${newStudent.id}-${c.courseId}`,
          studentId: newStudent.id,
          studentCode: newStudent.studentCode,
          studentName: newStudent.fullName,
          courseId: c.courseId,
          courseCode: c.courseCode,
          courseName: c.courseName,
          period: '2026-I',
          teacherId: 'staff-doc-05',
          teacherName: 'Ing. Carlos Mendoza Villanueva',
          il1: 14,
          il2: 14,
          il3: 14,
          il4: 14,
          continuousAverage: 14.0,
          finalGrade: 14,
          attendancePercentage: 100,
          status: 'APROBADO',
          isClosedInActa: false
        };
        await onSaveGrade(gradeRec);
      }
    }

    // 4. Update applicant status in Admission to 'MATRICULADO'
    if (onUpdateApplicantStatus) {
      await onUpdateApplicantStatus(
        syncingApplicant.id,
        'MATRICULADO',
        'Lic. Oscar Ortiz Regalao (Gestión Académica)',
        syncingApplicant.score || 88.0
      );
    }

    // Set active student to the newly synced student
    setSelectedStudentId(newStudent.id);
    setSyncingApplicant(null);
    setViewingFicha(newEnrollment);

    setNotification({
      type: 'success',
      message: `¡Sincronización Exitosa! El ingresante ${newStudent.fullName} ha sido registrado como Alumno Regular (Código ${newStudent.studentCode}), matriculado oficialmente en Ciclo I y sincronizado con Actas de Evaluación Oficiales MINEDU.`
    });
  };

  // Filtered lists
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(courseSearch.toLowerCase()) || 
                          c.code.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesCareer = courseCareerFilter === 'ALL' || c.careerId === courseCareerFilter;
    const matchesCycle = courseCycleFilter === 'ALL' || String(c.cycle) === courseCycleFilter;
    return matchesSearch && matchesCareer && matchesCycle;
  });

  const admittedApplicants = applicants.filter(a => {
    const matchesSearch = a.fullName.toLowerCase().includes(syncSearch.toLowerCase()) || 
                          a.docNumber.includes(syncSearch) ||
                          a.careerName.toLowerCase().includes(syncSearch.toLowerCase());
    const matchesStatus = syncStatusFilter === 'ALL' || a.status === syncStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAdmittedCount = applicants.filter(a => a.status === 'APROBADO').length;
  const totalEnrolledApplicantsCount = applicants.filter(a => a.status === 'MATRICULADO').length;

  return (
    <div className="space-y-6">
      {/* In-app Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold transition-all shadow-md ${
          notification.type === 'error'
            ? 'bg-red-950 text-red-200 border-red-700'
            : notification.type === 'warning'
              ? 'bg-amber-950 text-amber-200 border-amber-700'
              : 'bg-emerald-950 text-emerald-200 border-emerald-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Module Title Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Módulo de Matrícula y Control de Prerrequisitos 2026-I
            </h3>
            <p className="text-xs text-slate-500">
              Coordinador de Registros: <strong className="text-slate-800">Lic. Oscar Ortiz Regalao</strong> (Gestión Académica & Currícula)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Periodo Activo: <strong className="text-slate-900">2026-I Regular</strong>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('enrollment')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'enrollment'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Proceso de Matrícula & Prerrequisitos
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'courses'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Unidades Didácticas (Malla Curricular)
          <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full text-[10px]">
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('admission-sync')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'admission-sync'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Sincronización con Admisión (Ingresantes)
          {totalAdmittedCount > 0 && (
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold animate-pulse">
              {totalAdmittedCount} listos
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Fichas Emitidas
          <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {enrollments.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MATRÍCULA Y PRERREQUISITOS (REGULARES E INGRESANTES)              */}
      {/* ========================================================================= */}
      {activeTab === 'enrollment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Student Selection & Info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-500" />
                  Selección de Alumno
                </h4>
                <button
                  onClick={() => setActiveTab('admission-sync')}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" /> + Ingresante Admisión
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Estudiante Registrado en el SIA
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setSelectedCourseIds([]);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <optgroup label="Alumnos Regulares (SIA ITMANV)">
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.docType}: {s.docNumber}) - Ciclo {s.currentCycle}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {activeStudent && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Código SIA:</span>
                    <span className="font-mono font-bold text-slate-900">{activeStudent.studentCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Documento:</span>
                    <span className="font-bold">{activeStudent.docType} N° {activeStudent.docNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Programa:</span>
                    <span className="font-semibold text-red-700">{activeStudent.careerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ciclo a Cursar:</span>
                    <span className="font-bold text-indigo-700">Ciclo {activeStudent.currentCycle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Promedio Acumulado:</span>
                    <span className="font-bold text-emerald-800">{activeStudent.gpa.toFixed(2)} vigesimal</span>
                  </div>
                </div>
              )}

              {/* Morosity Warning Gatekeeper */}
              {isMoroso ? (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-red-700">
                    <Lock className="w-4 h-4 text-red-600" />
                    BLOQUEO POR MOROSIDAD FINANCIERA
                  </div>
                  <p className="text-xs leading-relaxed">
                    El alumno registra <strong>S/. {totalDebt.toFixed(2)}</strong> de pensiones vencidas en Tesorería.
                  </p>
                  <div className="text-[11px] bg-white/80 p-2 rounded border border-red-200 font-mono">
                    {studentDebtItems.map(d => (
                      <div key={d.id} className="flex justify-between">
                        <span>{d.concept}</span>
                        <span className="font-bold">S/. {(d.totalDue - d.paidAmount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-red-600 italic">
                    * Conforme al reglamento de Tesorería, la matrícula está deshabilitada hasta el pago.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Semáforo Financiero Verde:</strong> Estudiante sin deuda exigible. Habilitado para matrícula 2026-I.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Turno de Matrícula
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MAÑANA', 'TARDE', 'NOCHE'] as const).map((turn) => (
                    <button
                      key={turn}
                      type="button"
                      onClick={() => setSelectedTurn(turn)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        selectedTurn === turn
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {turn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Course Selection with Prerequisite Logic */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Unidades Didácticas Disponibles (Ciclo {activeStudent?.currentCycle})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Seleccione las unidades a matricular. El sistema verifica prerrequisitos automáticamente.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenAddCourse}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nueva Unidad
                  </button>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Créditos:</span>
                    <p className="text-base font-bold text-indigo-700">
                      {courses.filter(c => selectedCourseIds.includes(c.id)).reduce((acc, c) => acc + c.credits, 0)} crd
                    </p>
                  </div>
                </div>
              </div>

              {/* Courses List */}
              <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                {availableCourses.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs border border-dashed rounded-xl p-6">
                    No hay unidades didácticas registradas para este ciclo y carrera.
                    <br />
                    <button
                      onClick={handleOpenAddCourse}
                      className="mt-2 text-indigo-600 font-bold hover:underline"
                    >
                      + Agregar la primera unidad didáctica
                    </button>
                  </div>
                ) : (
                  availableCourses.map((course) => {
                    const isSelected = selectedCourseIds.includes(course.id);
                    const missingPrereqs = course.prerequisites.filter(req => !passedCoursesCodes.includes(req));
                    const hasBlockedPrereq = missingPrereqs.length > 0;

                    return (
                      <div
                        key={course.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          hasBlockedPrereq 
                            ? 'bg-slate-100/70 border-slate-200 opacity-60'
                            : isSelected
                              ? 'bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-500'
                              : isMoroso
                                ? 'bg-white border-slate-200 opacity-70'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div 
                          onClick={() => !hasBlockedPrereq && !isMoroso && toggleCourse(course)}
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={hasBlockedPrereq || isMoroso}
                            onChange={() => {}}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                {course.code}
                              </span>
                              <h5 className="font-bold text-slate-900 text-xs">{course.name}</h5>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span>{course.credits} Créditos</span>
                              <span>•</span>
                              <span>{course.theoryHours}h Teoría + {course.practiceHours}h Práctica</span>
                              {course.prerequisites.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className={hasBlockedPrereq ? 'text-red-600 font-semibold' : 'text-slate-500'}>
                                    Prerreq: {course.prerequisites.join(', ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {hasBlockedPrereq && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              <Lock className="w-3 h-3" /> Bloqueado
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditCourse(course);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar Unidad Didáctica"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Responsable de Matrícula: <strong>Lic. Oscar Ortiz Regalao</strong>
                </div>

                <button
                  onClick={handleConfirmEnrollment}
                  disabled={isMoroso || selectedCourseIds.length === 0}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                    isMoroso || selectedCourseIds.length === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  Emitir Ficha Oficial de Matrícula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GESTIÓN DE UNIDADES DIDÁCTICAS (MALLA CURRICULAR)                  */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por código o nombre..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={courseCareerFilter}
                onChange={(e) => setCourseCareerFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg text-xs py-2 px-3 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Todas las Carreras Técnicas</option>
                <option value="car-ade">Administración de Empresas</option>
                <option value="car-anbf">Administración de Negocios Bancarios y Financieros</option>
              </select>

              <select
                value={courseCycleFilter}
                onChange={(e) => setCourseCycleFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg text-xs py-2 px-3 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Todos los Ciclos (I al VI)</option>
                <option value="1">Ciclo I</option>
                <option value="2">Ciclo II</option>
                <option value="3">Ciclo III</option>
                <option value="4">Ciclo IV</option>
                <option value="5">Ciclo V</option>
                <option value="6">Ciclo VI</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddCourse}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> Agregar Unidad Didáctica
            </button>
          </div>

          {/* Courses Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Unidad Didáctica</th>
                    <th className="py-3 px-4">Carrera Profesional</th>
                    <th className="py-3 px-4 text-center">Ciclo</th>
                    <th className="py-3 px-4 text-center">Créditos</th>
                    <th className="py-3 px-4 text-center">Horas Sem.</th>
                    <th className="py-3 px-4">Prerrequisitos</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No se encontraron unidades didácticas con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.code}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            c.careerId === 'car-anbf' 
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}>
                            {c.careerId === 'car-anbf' ? 'Negocios Bancarios y Finanzas' : 'Administración de Empresas'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-indigo-700">Ciclo {c.cycle}</td>
                        <td className="py-3 px-4 text-center font-bold">{c.credits} crd</td>
                        <td className="py-3 px-4 text-center text-[11px] text-slate-600">
                          {c.theoryHours}T / {c.practiceHours}P ({c.theoryHours + c.practiceHours}h)
                        </td>
                        <td className="py-3 px-4">
                          {c.prerequisites && c.prerequisites.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {c.prerequisites.map(pr => (
                                <span key={pr} className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                  {pr}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Sin prerrequisito</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenEditCourse(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded font-semibold text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" /> Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SINCRONIZACIÓN CON ALUMNOS DE ADMISIÓN                            */}
      {/* ========================================================================= */}
      {activeTab === 'admission-sync' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Postulantes Inscritos</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{applicants.length}</p>
              <span className="text-[10px] text-slate-400">Total en proceso de admisión</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-emerald-700 font-semibold">Ingresantes Admitidos</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">{totalAdmittedCount}</p>
              <span className="text-[10px] text-emerald-600">Listos para sincronizar y matricular</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-indigo-700 font-semibold">Ya Matriculados en SIA</span>
              <p className="text-2xl font-extrabold text-indigo-700 mt-1">{totalEnrolledApplicantsCount}</p>
              <span className="text-[10px] text-indigo-600">Con código y ficha 2026-I</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-amber-700 font-semibold">Vacantes Disponibles</span>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">
                {careers.reduce((acc, c) => acc + c.availableVacancies, 0)}
              </p>
              <span className="text-[10px] text-slate-500">En las 2 carreras técnicas</span>
            </div>
          </div>

          {/* Sync Header and Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-80">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar ingresante por DNI, nombre o carrera..."
                  value={syncSearch}
                  onChange={(e) => setSyncSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={syncStatusFilter}
                onChange={(e) => setSyncStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-2 px-3 focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL">Todos los Estados de Admisión</option>
                <option value="APROBADO">Admitidos (Pendientes de Matrícula)</option>
                <option value="MATRICULADO">Ya Matriculados (Sincronizados)</option>
                <option value="INSCRITO">Inscritos / En Revisión</option>
              </select>
            </div>
          </div>

          {/* Admitted Applicants Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Documento</th>
                    <th className="py-3 px-4">Ingresante / Postulante</th>
                    <th className="py-3 px-4">Carrera Técnica Adjudicada</th>
                    <th className="py-3 px-4">Modalidad</th>
                    <th className="py-3 px-4 text-center">Puntaje</th>
                    <th className="py-3 px-4 text-center">Estado Admisión</th>
                    <th className="py-3 px-4 text-right">Sincronización SIA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {admittedApplicants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No se encontraron postulantes de admisión con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    admittedApplicants.map((app) => {
                      const isAdmitted = app.status === 'APROBADO';
                      const isEnrolled = app.status === 'MATRICULADO';

                      return (
                        <tr key={app.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {app.docType}: {app.docNumber}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{app.fullName}</p>
                            <p className="text-[11px] text-slate-500">{app.email} • {app.phone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">{app.careerName}</span>
                            <span className="block text-[10px] text-slate-400">Periodo {app.period}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                              {app.modality}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            {app.score ? `${app.score.toFixed(1)} pts` : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isEnrolled ? (
                              <span className="inline-flex items-center gap-1 font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded text-[10px]">
                                <CheckCircle2 className="w-3 h-3" /> Matriculado
                              </span>
                            ) : isAdmitted ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                                <UserCheck className="w-3 h-3" /> Admitido
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                                {app.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isAdmitted ? (
                              <button
                                onClick={() => handleOpenSyncModal(app)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                              >
                                <ArrowRight className="w-3 h-3" /> Sincronizar y Matricular
                              </button>
                            ) : isEnrolled ? (
                              <span className="text-[11px] font-semibold text-slate-400 italic">
                                Alumno Registrado en Ciclo I
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Requiere admisión previa
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HISTORIAL DE FICHAS EMITIDAS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            Fichas Oficiales de Matrícula Emitidas (Periodo 2026-I)
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Código Matrícula</th>
                  <th className="py-2.5 px-3">Estudiante</th>
                  <th className="py-2.5 px-3">Documento</th>
                  <th className="py-2.5 px-3">Carrera / Ciclo</th>
                  <th className="py-2.5 px-3">Créditos</th>
                  <th className="py-2.5 px-3">Turno</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Ficha Oficial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{enr.id}</td>
                    <td className="py-2.5 px-3 font-semibold">{enr.studentName}</td>
                    <td className="py-2.5 px-3 font-mono">{enr.docType}: {enr.docNumber}</td>
                    <td className="py-2.5 px-3">{enr.careerName} (Ciclo {enr.cycle})</td>
                    <td className="py-2.5 px-3 font-bold text-indigo-700">{enr.totalCredits} crd</td>
                    <td className="py-2.5 px-3 font-semibold">{enr.turn}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                        {enr.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setViewingFicha(enr)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px]"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" /> Ver Ficha A4
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR / EDITAR UNIDAD DIDÁCTICA (CURSO)                           */}
      {/* ========================================================================= */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                {editingCourse ? 'Editar Unidad Didáctica' : 'Agregar Nueva Unidad Didáctica'}
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourseForm} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código de Curso *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: ADE-504"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Carrera Profesional Técnica *
                  </label>
                  <select
                    value={courseCareerId}
                    onChange={(e) => setCourseCareerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="car-ade">Administración de Empresas</option>
                    <option value="car-anbf">Administración de Negocios Bancarios y Financieros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre de la Unidad Didáctica *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gestión de Tesorería e Inversiones Financieras"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Ciclo (1 a 6)</label>
                  <select
                    value={courseCycle}
                    onChange={(e) => setCourseCycle(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6].map(c => (
                      <option key={c} value={c}>Ciclo {c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Créditos</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Horas Teoría</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={courseTheoryHours}
                    onChange={(e) => setCourseTheoryHours(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Horas Práctica</label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    required
                    value={coursePracticeHours}
                    onChange={(e) => setCoursePracticeHours(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-center"
                  />
                </div>
              </div>

              {/* Prerequisites Multi-Select */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Prerrequisitos de la Unidad (Opcional)
                </label>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-36 overflow-y-auto space-y-1.5">
                  {courses
                    .filter(c => c.careerId === courseCareerId && (!editingCourse || c.id !== editingCourse.id))
                    .map(c => {
                      const isChecked = coursePrerequisites.includes(c.code);
                      return (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setCoursePrerequisites(coursePrerequisites.filter(p => p !== c.code));
                              } else {
                                setCoursePrerequisites([...coursePrerequisites, c.code]);
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-mono font-bold text-[11px] text-slate-700">{c.code}</span>
                          <span className="text-slate-600 truncate">{c.name} (Ciclo {c.cycle})</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm"
                >
                  {editingCourse ? 'Guardar Cambios' : 'Crear Unidad Didáctica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SINCRONIZAR Y MATRICULAR INGRESANTE DE ADMISIÓN                     */}
      {/* ========================================================================= */}
      {syncingApplicant && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Sincronización y Matrícula Oficial de Ingresante
              </h3>
              <button
                onClick={() => setSyncingApplicant(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Postulante Admitido:</span>
                  <span className="font-bold text-slate-900">{syncingApplicant.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Documento:</span>
                  <span className="font-mono font-bold">{syncingApplicant.docType}: {syncingApplicant.docNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Carrera Adjudicada:</span>
                  <span className="font-bold text-red-700">{syncingApplicant.careerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Modalidad de Ingreso:</span>
                  <span className="font-medium text-slate-800">{syncingApplicant.modality}</span>
                </div>
                {syncingApplicant.score && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Puntaje Examen de Admisión:</span>
                    <span className="font-bold text-emerald-800">{syncingApplicant.score.toFixed(1)} / 100</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Turno Asignado para Ciclo I
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MAÑANA', 'TARDE', 'NOCHE'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSyncTurn(t)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        syncTurn === t
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unidades Didácticas de Ciclo I a Asignar
                </label>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                  {courses
                    .filter(c => c.careerId === syncingApplicant.careerId && c.cycle === 1)
                    .map(course => {
                      const isChecked = syncSelectedCourses.includes(course.id);
                      return (
                        <div
                          key={course.id}
                          onClick={() => {
                            if (isChecked) {
                              setSyncSelectedCourses(syncSelectedCourses.filter(id => id !== course.id));
                            } else {
                              setSyncSelectedCourses([...syncSelectedCourses, course.id]);
                            }
                          }}
                          className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between text-xs ${
                            isChecked ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-mono font-bold text-slate-700">{course.code}</span>
                            <span className="font-semibold text-slate-900">{course.name}</span>
                          </div>
                          <span className="font-bold text-indigo-700">{course.credits} crd</span>
                        </div>
                      );
                    })}
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                  <span>Todas las materias pertenecen al Ciclo 1 reglamentario</span>
                  <span className="font-bold text-slate-800">
                    Total: {courses.filter(c => syncSelectedCourses.includes(c.id)).reduce((acc, c) => acc + c.credits, 0)} créditos
                  </span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  Efectos de la Sincronización en el SIA ITMANV:
                </p>
                <p className="text-slate-600 leading-relaxed">
                  1. Se registrará al postulante en la colección oficial de <strong>Alumnos</strong> con código SIA (ej: <code>2026-IT-XXXX</code>).
                  <br />
                  2. Se emitirá su <strong>Ficha Oficial de Matrícula 2026-I</strong> refrendada por Registros Académicos.
                  <br />
                  3. Su estado en Admisión pasará automáticamente a <strong>MATRICULADO</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSyncingApplicant(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdmissionSync}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Formalizar Matrícula y Sincronizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FICHA OFICIAL DE MATRÍCULA (MINEDU FORMAT A4)                      */}
      {/* ========================================================================= */}
      {viewingFicha && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-300 relative text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingFicha(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Institutional Header */}
            <div className="flex items-center justify-between border-b-2 border-red-700 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  MINISTERIO DE EDUCACIÓN • DRE LIMA METROPOLITANA
                </span>
                <h2 className="text-lg font-extrabold text-red-700">
                  INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PRIVADO ITMAN
                </h2>
                <p className="text-xs text-slate-600">
                  Código Modular: 0849201 • Licenciado por R.M. N° 0418-94-ED
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded">
                  FICHA OFICIAL DE MATRÍCULA
                </span>
                <p className="font-mono text-xs text-slate-500 mt-1 font-bold">
                  Periodo: {viewingFicha.period}
                </p>
              </div>
            </div>

            {/* Student Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div>
                <span className="text-slate-500">Código de Estudiante:</span>
                <p className="font-mono font-bold text-slate-900">{viewingFicha.studentCode}</p>
              </div>
              <div>
                <span className="text-slate-500">Documento de Identidad:</span>
                <p className="font-mono font-bold text-slate-900">{viewingFicha.docType}: {viewingFicha.docNumber}</p>
              </div>
              <div>
                <span className="text-slate-500">Apellidos y Nombres:</span>
                <p className="font-bold text-slate-900 uppercase">{viewingFicha.studentName}</p>
              </div>
              <div>
                <span className="text-slate-500">Programa de Estudios:</span>
                <p className="font-bold text-red-700">{viewingFicha.careerName}</p>
              </div>
              <div>
                <span className="text-slate-500">Ciclo / Turno:</span>
                <p className="font-bold text-slate-900">Ciclo {viewingFicha.cycle} • Turno {viewingFicha.turn}</p>
              </div>
              <div>
                <span className="text-slate-500">Fecha y Hora de Emisión:</span>
                <p className="font-mono text-slate-700">{viewingFicha.enrollmentDate}</p>
              </div>
            </div>

            {/* Enrolled Courses Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Código</th>
                    <th className="py-2 px-3">Unidad Didáctica / Asignatura</th>
                    <th className="py-2 px-3 text-center">Sección</th>
                    <th className="py-2 px-3 text-right">Créditos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingFicha.courses.map((c) => (
                    <tr key={c.courseId}>
                      <td className="py-2 px-3 font-mono font-bold text-slate-700">{c.courseCode}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{c.courseName}</td>
                      <td className="py-2 px-3 text-center font-mono">{c.section}</td>
                      <td className="py-2 px-3 text-right font-bold text-indigo-700">{c.credits}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-right">Total Créditos Matriculados:</td>
                    <td className="py-2 px-3 text-right text-indigo-700 font-bold">{viewingFicha.totalCredits} créditos</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer with Legal & Signatures */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <QRCodeSVG value={viewingFicha.qrVerificationUrl} size={65} />
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <p className="font-bold text-slate-700">Verificación Digital de Matrícula</p>
                  <p className="font-mono">{viewingFicha.qrVerificationUrl}</p>
                  <p className="text-slate-400">Refrendado por {viewingFicha.approvedBy}</p>
                </div>
              </div>

              <div className="flex gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Imprimir Ficha Oficial A4
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
