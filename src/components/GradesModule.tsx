import React, { useState, useMemo } from 'react';
import { GradeRecord, Course, Student, TreasuryPayment, Enrollment } from '../types';
import { 
  FileSpreadsheet, 
  Search, 
  Award, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  Printer, 
  Lock, 
  Edit3, 
  X, 
  FileCheck, 
  ReceiptText,
  Download,
  RefreshCw,
  UserCheck,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { exportActaNotasPdf } from '../services/pdfReportService';

interface GradesProps {
  grades: GradeRecord[];
  courses: Course[];
  students: Student[];
  enrollments?: Enrollment[];
  treasury: TreasuryPayment[];
  onUpdateGrade: (grade: GradeRecord) => Promise<void>;
  currentUserRole: string;
}

export const GradesModule: React.FC<GradesProps> = ({
  grades,
  courses,
  students,
  enrollments = [],
  treasury = [],
  onUpdateGrade,
  currentUserRole
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [showActaModal, setShowActaModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOverdueModal, setShowOverdueModal] = useState(false);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Filter grades for the selected course
  const currentGrades = grades.filter(g => g.courseId === selectedCourseId);
  const currentCourse = courses.find(c => c.id === selectedCourseId);

  const canEdit = currentUserRole === 'DOCENTE' || currentUserRole === 'GESTION_ACADEMICA' || currentUserRole === 'DIRECTOR';
  const isDirector = currentUserRole === 'DIRECTOR';

  // Calculate stats for current course
  const totalStudents = currentGrades.length;
  const approvedCount = currentGrades.filter(g => g.status === 'APROBADO').length;
  const disapprovedCount = currentGrades.filter(g => g.status === 'DESAPROBADO').length;
  const dpiCount = currentGrades.filter(g => g.status === 'DPI').length;

  // Helper to query treasury collection for overdue / unpaid obligations
  const getStudentOverdueInfo = (studentId: string) => {
    const overdues = treasury.filter(
      t => t.studentId === studentId && (t.status === 'VENCIDO' || (t.status === 'PENDIENTE' && new Date(t.dueDate).getTime() < new Date().getTime()))
    );
    const totalDebt = overdues.reduce((acc, curr) => acc + (curr.totalDue - (curr.paidAmount || 0)), 0);
    return { hasDebt: totalDebt > 0, totalDebt, items: overdues };
  };

  const studentsWithOverdueCount = currentGrades.filter(g => getStudentOverdueInfo(g.studentId).hasDebt).length;
  const overdueStudentsList = currentGrades
    .map(g => ({ grade: g, debt: getStudentOverdueInfo(g.studentId) }))
    .filter(item => item.debt.hasDebt);

  // Consulta en tiempo real de alumnos matriculados en esta unidad didáctica (Periodo 2026-I)
  const enrolledForCourse = useMemo(() => {
    return (enrollments || []).flatMap(enr => {
      const match = enr.courses?.find(c => c.courseId === selectedCourseId);
      if (!match) return [];
      return [{
        enrollment: enr,
        courseItem: match,
        studentId: enr.studentId,
        studentCode: enr.studentCode,
        studentName: enr.studentName,
        section: match.section || `${enr.cycle}-${enr.turn[0]}1`,
        turn: enr.turn,
        cycle: enr.cycle,
        period: enr.period,
        docType: enr.docType,
        docNumber: enr.docNumber
      }];
    });
  }, [enrollments, selectedCourseId]);

  // Identificar alumnos matriculados que aún no figuran en el registro de notas
  const unsyncedEnrolled = useMemo(() => {
    return enrolledForCourse.filter(
      enr => !grades.some(g => g.studentId === enr.studentId && g.courseId === selectedCourseId)
    );
  }, [enrolledForCourse, grades, selectedCourseId]);

  const [isSyncing, setIsSyncing] = useState(false);

  // Sincronizar todos los alumnos matriculados pendientes en Firestore
  const handleSyncEnrolledStudents = async () => {
    if (!currentCourse) return;
    setIsSyncing(true);
    try {
      let addedCount = 0;
      for (const item of unsyncedEnrolled) {
        const newRecord: GradeRecord = {
          id: `grd-${item.studentId}-${selectedCourseId}`,
          studentId: item.studentId,
          studentCode: item.studentCode,
          studentName: item.studentName,
          courseId: selectedCourseId,
          courseCode: currentCourse.code,
          courseName: currentCourse.name,
          period: item.period || '2026-I',
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
        await onUpdateGrade(newRecord);
        addedCount++;
      }

      setToastMessage({
        type: 'success',
        text: addedCount > 0 
          ? `¡Sincronización Exitosa! ${addedCount} estudiante(s) matriculado(s) incorporado(s) formalmente al Registro Auxiliar de ${currentCourse.code}.`
          : 'El Registro Auxiliar ya se encuentra 100% sincronizado con los alumnos matriculados.'
      });
    } catch (error) {
      setToastMessage({
        type: 'error',
        text: `Error al sincronizar alumnos matriculados: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSingleStudent = async (item: typeof enrolledForCourse[0]) => {
    if (!currentCourse) return;
    try {
      const newRecord: GradeRecord = {
        id: `grd-${item.studentId}-${selectedCourseId}`,
        studentId: item.studentId,
        studentCode: item.studentCode,
        studentName: item.studentName,
        courseId: selectedCourseId,
        courseCode: currentCourse.code,
        courseName: currentCourse.name,
        period: item.period || '2026-I',
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
      await onUpdateGrade(newRecord);
      setToastMessage({
        type: 'success',
        text: `Estudiante ${item.studentName} sincronizado e incorporado al registro de evaluación.`
      });
    } catch (error) {
      setToastMessage({
        type: 'error',
        text: `Error al sincronizar alumno: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  // Helper to render grade with automatic red highlighting for failing grades (< 13)
  const renderGradeBadge = (val: number | undefined, isFinal = false) => {
    if (val === undefined || val === null || isNaN(val)) {
      return <span className="text-slate-300">-</span>;
    }
    const isFailing = val < 13;

    if (isFinal) {
      return (
        <span className={`text-sm font-extrabold font-mono px-2 py-0.5 rounded-md border ${
          isFailing 
            ? 'text-red-700 bg-red-100 border-red-300 ring-1 ring-red-400 shadow-xs' 
            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
        }`}>
          {String(val).padStart(2, '0')}
        </span>
      );
    }

    return (
      <span className={`inline-block font-mono font-bold px-1.5 py-0.5 rounded ${
        isFailing
          ? 'text-red-700 bg-red-100 border border-red-300 font-extrabold shadow-2xs'
          : 'text-slate-800'
      }`}>
        {String(val).padStart(2, '0')}
      </span>
    );
  };

  const handleOpenEdit = (grade: GradeRecord) => {
    setModalError(null);
    setEditingGrade({ ...grade });
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    // VALIDACIÓN ESTRICTA EN RANGO 0-20 ANTES DE GUARDAR EN FIRESTORE
    const { il1, il2, il3, il4, recoveryGrade, attendancePercentage } = editingGrade;
    const gradeInputs = [
      { label: 'Indicador de Logro 1 (IL1)', value: il1 },
      { label: 'Indicador de Logro 2 (IL2)', value: il2 },
      { label: 'Indicador de Logro 3 (IL3)', value: il3 },
      { label: 'Indicador de Logro 4 (IL4)', value: il4 }
    ];

    if (recoveryGrade !== undefined && recoveryGrade !== null && !isNaN(recoveryGrade)) {
      gradeInputs.push({ label: 'Evaluación de Recuperación (ER)', value: recoveryGrade });
    }

    // Verificar que todas las notas estén en el rango de 0 a 20
    for (const item of gradeInputs) {
      if (typeof item.value !== 'number' || isNaN(item.value) || item.value < 0 || item.value > 20) {
        setModalError(
          `Error de Validación: La nota en "${item.label}" (${item.value}) está fuera de los límites permitidos. Toda calificación debe encontrarse estrictamente en la escala vigesimal de 0 a 20 antes de persistir en Firestore.`
        );
        return;
      }
    }

    // Validar porcentaje de asistencia
    if (attendancePercentage < 0 || attendancePercentage > 100) {
      setModalError('El porcentaje de asistencia debe estar comprendido entre 0% y 100%.');
      return;
    }

    // Calcular promedio continuo
    const avg = (il1 + il2 + il3 + il4) / 4;
    let final = avg;

    // Aplicar recuperación si aplica según norma MINEDU LAG (10 <= Promedio < 13)
    if (avg >= 10 && avg < 13 && recoveryGrade !== undefined && recoveryGrade > 0) {
      final = recoveryGrade;
    }

    // Redondear nota final al entero más próximo (norma técnica LAG)
    const roundedFinal = Math.round(final);

    // Regla de DPI (> 30% inasistencia = asistencia < 70%)
    let status: 'APROBADO' | 'DESAPROBADO' | 'DPI' = roundedFinal >= 13 ? 'APROBADO' : 'DESAPROBADO';
    let finalRecorded = roundedFinal;

    if (attendancePercentage < 70) {
      status = 'DPI';
      finalRecorded = 0;
    }

    const updated: GradeRecord = {
      ...editingGrade,
      continuousAverage: Number(avg.toFixed(2)),
      finalGrade: finalRecorded,
      status
    };

    try {
      await onUpdateGrade(updated);
      setEditingGrade(null);
      setToastMessage({
        type: 'success',
        text: `Calificación de ${updated.studentName} validada (escala vigesimal 0-20) y sincronizada exitosamente en Firestore.`
      });
    } catch (error) {
      setModalError(`Error al persistir en Firestore: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleExportActaPdf = () => {
    if (!currentCourse) return;
    try {
      // Include current grades plus all matriculated students from 2026-I enrollment
      const allGradesForActa: GradeRecord[] = [...currentGrades];
      for (const unsynced of unsyncedEnrolled) {
        if (!allGradesForActa.some(g => g.studentId === unsynced.studentId)) {
          allGradesForActa.push({
            id: `provisional-${unsynced.studentId}-${selectedCourseId}`,
            studentId: unsynced.studentId,
            studentCode: unsynced.studentCode,
            studentName: unsynced.studentName,
            courseId: selectedCourseId,
            courseCode: currentCourse.code,
            courseName: currentCourse.name,
            period: unsynced.period || '2026-I',
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
          });
        }
      }

      exportActaNotasPdf({
        course: currentCourse,
        grades: allGradesForActa,
        careerName: currentCourse.careerId === 'car-anbf' 
          ? 'Administración de Negocios Bancarios y Financieros' 
          : 'Administración de Empresas',
        teacherName: 'Ing. Carlos Mendoza Villanueva',
        academicPeriod: '2026-I'
      });
      setToastMessage({
        type: 'success',
        text: `Acta Oficial de Notas (${currentCourse.code}) exportada exitosamente a PDF con ${allGradesForActa.length} alumno(s) matriculado(s).`
      });
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Ocurrió un error al generar el archivo PDF del acta de notas.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-xl border shadow-lg flex items-center justify-between transition-all ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-900 text-white border-emerald-500' 
            : 'bg-red-900 text-white border-red-500'
        }`}>
          <div className="flex items-center gap-3">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-300 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Evaluación por Competencias & Actas Oficiales MINEDU
            </h3>
            <p className="text-xs text-slate-500">
              Lineamientos Académicos Generales (LAG - R.V.M. N° 178-2018 / 049-2022-MINEDU)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportActaPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
            title="Exportar Acta Oficial a PDF de forma directa"
          >
            <Download className="w-4 h-4" />
            Descargar Acta PDF
          </button>
          <button
            onClick={() => setShowActaModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Vista Previa de Acta
          </button>
        </div>
      </div>

      {/* Course Filter & Statistics Bar with Treasury Overdue Query */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="sm:col-span-2 lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <label className="block text-xs font-semibold text-slate-600">
            Unidad Didáctica / Asignatura
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-red-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.code}] {c.name} - Ciclo {c.cycle} ({c.credits} crd)
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Aprobados (≥ 13)</span>
            <p className="text-xl font-extrabold text-emerald-700">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            {totalStudents > 0 ? `${Math.round((approvedCount / totalStudents) * 100)}%` : '0%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Desaprobados / DPI</span>
            <p className="text-xl font-extrabold text-red-600">
              {disapprovedCount + dpiCount}
              <span className="text-xs font-normal text-slate-400 ml-1">({dpiCount} faltas)</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
            {totalStudents > 0 ? `${Math.round(((disapprovedCount + dpiCount) / totalStudents) * 100)}%` : '0%'}
          </div>
        </div>

        {/* Alerta de Tesorería por Sección (Interactivo con consulta a la colección de Tesorería) */}
        <div 
          onClick={() => {
            if (studentsWithOverdueCount > 0) setShowOverdueModal(true);
          }}
          className={`p-4 rounded-xl border shadow-sm flex items-center justify-between transition-all ${
            studentsWithOverdueCount > 0 
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-200 cursor-pointer hover:bg-rose-100/80' 
              : 'bg-white border-slate-200'
          }`}
          title={studentsWithOverdueCount > 0 ? 'Haga clic para ver alumnos con deuda vencida' : 'Sin alumnos morosos en la sección'}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-rose-900">Alertas de Tesorería</span>
              {studentsWithOverdueCount > 0 && (
                <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded font-extrabold">Ver</span>
              )}
            </div>
            <p className={`text-xl font-black mt-0.5 ${studentsWithOverdueCount > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
              {studentsWithOverdueCount} <span className="text-xs font-normal text-slate-500">con mora</span>
            </p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
            studentsWithOverdueCount > 0 ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse' : 'bg-slate-100 text-slate-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sincronización en tiempo real con Módulo de Matrícula 2026-I */}
      <div className={`p-4 rounded-xl border transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        unsyncedEnrolled.length > 0 
          ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200/50' 
          : 'bg-emerald-50/80 border-emerald-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 ${
            unsyncedEnrolled.length > 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}>
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-600" />
                Sincronización con Módulo de Matrícula 2026-I
              </h4>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                unsyncedEnrolled.length > 0 
                  ? 'bg-amber-200 text-amber-900 border-amber-300 animate-pulse' 
                  : 'bg-emerald-200 text-emerald-900 border-emerald-300'
              }`}>
                {unsyncedEnrolled.length > 0 ? `${unsyncedEnrolled.length} alumnos por sincronizar` : '100% Sincronizado'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              <strong className="text-slate-800">{enrolledForCourse.length} alumnos matriculados oficialmente</strong> en esta unidad didáctica • <strong className="text-slate-800">{currentGrades.length} en registro de notas</strong>
              {unsyncedEnrolled.length > 0 
                ? ` (Se detectaron ${unsyncedEnrolled.length} alumnos con matrícula vigente en 2026-I que aún no figuran en las actas de evaluación).`
                : ' (Todos los alumnos con matrícula formal figuran en el registro y en el acta oficial).'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {unsyncedEnrolled.length > 0 ? (
            <button
              onClick={handleSyncEnrolledStudents}
              disabled={isSyncing}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : `Sincronizar ${unsyncedEnrolled.length} Alumno(s) Matriculado(s)`}
            </button>
          ) : (
            <button
              onClick={handleSyncEnrolledStudents}
              disabled={isSyncing}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-colors"
              title="Volver a verificar y sincronizar con la colección de matrículas"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Verificar Sincronización
            </button>
          )}
        </div>
      </div>

      {/* Official Grading Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              Registro Auxiliar de Evaluación Continua (Escala 0 - 20)
            </h4>
            <p className="text-[11px] text-slate-500">
              Ponderación: IL1 (25%) + IL2 (25%) + IL3 (25%) + IL4 (25%). Recuperación (ER) para notas 10-12. Inasistencia &gt; 30% = DPI.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              Notas &lt; 13: Resaltadas en rojo (Desaprobatorio)
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              Mínimo Aprobatorio: <strong>13.0</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Cód. Alumno</th>
                <th className="py-2.5 px-3">Estudiante</th>
                <th className="py-2.5 px-2 text-center bg-blue-50/50">IL1 (25%)</th>
                <th className="py-2.5 px-2 text-center bg-blue-50/50">IL2 (25%)</th>
                <th className="py-2.5 px-2 text-center bg-blue-50/50">IL3 (25%)</th>
                <th className="py-2.5 px-2 text-center bg-blue-50/50">IL4 (25%)</th>
                <th className="py-2.5 px-2 text-center bg-slate-200/50">Prom. Cont.</th>
                <th className="py-2.5 px-2 text-center bg-amber-50">Recup. (ER)</th>
                <th className="py-2.5 px-2 text-center">Asist. (%)</th>
                <th className="py-2.5 px-3 text-center bg-red-50/60 text-red-900">Nota Final</th>
                <th className="py-2.5 px-3 text-center">Condición</th>
                {canEdit && <th className="py-2.5 px-3 text-right">Editar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentGrades.map((g) => {
                const isApproved = g.status === 'APROBADO';
                const isDpi = g.status === 'DPI';
                const debtInfo = getStudentOverdueInfo(g.studentId);
                const enrInfo = enrolledForCourse.find(e => e.studentId === g.studentId);

                return (
                  <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{g.studentCode}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 leading-tight">{g.studentName}</p>
                        {enrInfo && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded font-mono font-medium">
                            {enrInfo.section} • {enrInfo.turn}
                          </span>
                        )}
                      </div>
                      {debtInfo.hasDebt && (
                        <button
                          type="button"
                          onClick={() => setShowOverdueModal(true)}
                          title={`Alerta de Tesorería: ${debtInfo.items.length} pago(s) vencido(s). Total: S/. ${debtInfo.totalDebt.toFixed(2)} (${debtInfo.items.map(i => i.concept).join(', ')})`}
                          className="inline-flex items-center gap-1 font-bold text-[10px] text-rose-700 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded mt-0.5 shadow-2xs hover:bg-rose-100 text-left"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                          Deuda vencida: S/. {debtInfo.totalDebt.toFixed(2)}
                        </button>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">{renderGradeBadge(g.il1)}</td>
                    <td className="py-2.5 px-2 text-center">{renderGradeBadge(g.il2)}</td>
                    <td className="py-2.5 px-2 text-center">{renderGradeBadge(g.il3)}</td>
                    <td className="py-2.5 px-2 text-center">{renderGradeBadge(g.il4)}</td>
                    <td className="py-2.5 px-2 text-center bg-slate-50/80">{renderGradeBadge(Math.round(g.continuousAverage))}</td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {renderGradeBadge(g.recoveryGrade)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`font-semibold ${g.attendancePercentage < 70 ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                        {g.attendancePercentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center bg-red-50/30">
                      {renderGradeBadge(g.finalGrade, true)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isApproved && (
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                          Aprobado
                        </span>
                      )}
                      {g.status === 'DESAPROBADO' && (
                        <span className="font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded text-[10px]">
                          Desaprobado
                        </span>
                      )}
                      {isDpi && (
                        <span className="font-bold text-purple-900 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded text-[10px]" title="Desaprobado por Inasistencia (> 30% faltas)">
                          DPI (Inasistencia)
                        </span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Ingresar notas e inasistencias"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Alumnos matriculados pendientes de incorporar al registro */}
              {unsyncedEnrolled.map((item) => (
                <tr key={`unsynced-${item.studentId}`} className="bg-amber-50/70 hover:bg-amber-100/70 transition-colors border-l-4 border-l-amber-500">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    {item.studentCode}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 leading-tight">{item.studentName}</p>
                      <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-extrabold flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        Matriculado 2026-I
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                      <span>Sec: {item.section}</span>
                      <span>•</span>
                      <span>Turno: {item.turn}</span>
                      <span>•</span>
                      <span>{item.docType}: {item.docNumber}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-400 font-mono">-</td>
                  <td className="py-2.5 px-2 text-center text-slate-400 font-mono">-</td>
                  <td className="py-2.5 px-2 text-center text-slate-400 font-mono">-</td>
                  <td className="py-2.5 px-2 text-center text-slate-400 font-mono">-</td>
                  <td className="py-2.5 px-2 text-center bg-slate-50/80 text-slate-400 font-mono">-</td>
                  <td className="py-2.5 px-2 text-center text-slate-400 font-mono">-</td>
                  <td className="py-2.5 px-2 text-center text-slate-500 font-mono">100%</td>
                  <td className="py-2.5 px-3 text-center bg-red-50/30 text-slate-400 font-mono">-</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      Pendiente Sincronizar
                    </span>
                  </td>
                  {canEdit && (
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleSyncSingleStudent(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors"
                        title="Incorporar alumno formalmente al registro y registrar notas"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Sincronizar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Grades & Attendance */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                Ingreso de Notas Formativas & Inasistencia
              </h3>
              <button 
                onClick={() => setEditingGrade(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 mt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900">{editingGrade.studentName}</p>
                <p className="text-slate-500 font-mono mt-0.5">
                  Cód: {editingGrade.studentCode} • Curso: {editingGrade.courseName}
                </p>
              </div>

              {/* Indicators 1 to 4 with real-time range 0-20 and failing <13 highlighting */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'il1', label: 'IL1 (0-20)', val: editingGrade.il1 },
                  { id: 'il2', label: 'IL2 (0-20)', val: editingGrade.il2 },
                  { id: 'il3', label: 'IL3 (0-20)', val: editingGrade.il3 },
                  { id: 'il4', label: 'IL4 (0-20)', val: editingGrade.il4 }
                ].map((item) => {
                  const isOutOfRange = item.val < 0 || item.val > 20;
                  const isFailing = item.val < 13;

                  return (
                    <div key={item.id}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700">{item.label}</label>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        required
                        value={item.val}
                        onChange={(e) => setEditingGrade({ 
                          ...editingGrade, 
                          [item.id]: Number(e.target.value) 
                        })}
                        className={`w-full rounded-lg p-2 font-bold text-center text-sm transition-all border ${
                          isOutOfRange
                            ? 'bg-red-100 border-red-500 text-red-900 ring-2 ring-red-400'
                            : isFailing
                              ? 'bg-red-50 border-red-400 text-red-700 ring-1 ring-red-300'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        }`}
                      />
                      <span className={`block text-[10px] mt-0.5 text-center font-bold ${
                        isOutOfRange 
                          ? 'text-red-600 animate-bounce' 
                          : isFailing 
                            ? 'text-red-600' 
                            : 'text-emerald-700'
                      }`}>
                        {isOutOfRange ? '¡Rango 0-20!' : isFailing ? '🔴 Desaprobatorio' : '🟢 Aprobatorio'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Recovery & Attendance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Evaluación de Recuperación (ER) (0-20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={editingGrade.recoveryGrade !== undefined ? editingGrade.recoveryGrade : ''}
                    onChange={(e) => setEditingGrade({ 
                      ...editingGrade, 
                      recoveryGrade: e.target.value !== '' ? Number(e.target.value) : undefined 
                    })}
                    placeholder="Solo si promedio es 10-12"
                    className={`w-full rounded-lg p-2 font-medium border ${
                      editingGrade.recoveryGrade !== undefined && (editingGrade.recoveryGrade < 0 || editingGrade.recoveryGrade > 20)
                        ? 'bg-red-100 border-red-500 text-red-900 ring-2 ring-red-400'
                        : editingGrade.recoveryGrade !== undefined && editingGrade.recoveryGrade < 13
                          ? 'bg-red-50 border-red-400 text-red-700 font-bold'
                          : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Habilitado según norma MINEDU LAG (10-12). Escala vigesimal 0-20.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Asistencia Acumulada (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={editingGrade.attendancePercentage}
                    onChange={(e) => setEditingGrade({ ...editingGrade, attendancePercentage: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-center text-sm"
                  />
                  {editingGrade.attendancePercentage < 70 && (
                    <span className="text-[10px] font-bold text-red-600 block mt-0.5">
                      ⚠ Inasistencias &gt; 30%: Aplica DPI (Nota 00)
                    </span>
                  )}
                </div>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-800 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{modalError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Guardar Calificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Alumnos con Pagos Fuera de Plazo (Colección de Tesorería) */}
      {showOverdueModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-rose-300 relative text-slate-900 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Alumnos con Obligaciones Vencidas en Tesorería
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sección: {currentCourse?.name} ({currentCourse?.code}) • Periodo 2026-I
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOverdueModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl my-4 text-xs text-rose-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                Regla de Notificación de Tesorería del ITMANV:
              </p>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Los estudiantes listados presentan cuotas de enseñanza vencidas en la colección de Tesorería. 
                El docente puede asentar calificaciones formativas, pero las actas oficiales de notas y libretas quedarán en custodia administrativa hasta regularizar la situación económica en caja.
              </p>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              {overdueStudentsList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No hay estudiantes con deuda vencida en este curso.
                </div>
              ) : (
                overdueStudentsList.map(({ grade, debt }) => (
                  <div key={grade.id} className="p-4 rounded-xl border border-rose-200 bg-white shadow-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {grade.studentCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">{grade.studentName}</h4>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-500 block">Deuda Exigible:</span>
                        <span className="font-mono font-extrabold text-sm text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md">
                          S/. {debt.totalDebt.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-600 block">Cuotas en Mora Registradas:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {debt.items.map((it) => (
                          <div key={it.id} className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-slate-800">{it.concept}</p>
                              <p className="text-[10px] text-rose-600">Vence: {it.dueDate} {it.lateFee > 0 && `(+S/. ${it.lateFee} mora)`}</p>
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                              S/. {it.totalDue.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowOverdueModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl"
              >
                Cerrar Notificación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Acta Oficial de Notas MINEDU Formato Consolidado */}
      {showActaModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-slate-300 relative text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowActaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official MINEDU Acta Header */}
            <div className="border-b-2 border-slate-800 pb-3 mb-4 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                REPÚBLICA DEL PERÚ • MINISTERIO DE EDUCACIÓN • DIRECCIÓN REGIONAL DE EDUCACIÓN DE LIMA
              </p>
              <h2 className="text-xl font-extrabold text-red-700 mt-1">
                INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PRIVADO ITMAN
              </h2>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mt-1 bg-slate-100 py-1 border border-slate-300">
                ACTA OFICIAL CONSOLIDADA DE EVALUACIÓN DEL RENDIMIENTO ACADÉMICO
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Periodo Académico: <strong>2026-I</strong> • Programa: <strong>{currentCourse?.careerId === 'car-anbf' ? 'Administración de Negocios Bancarios y Financieros' : 'Administración de Empresas'}</strong> • Ciclo: <strong>Ciclo {currentCourse?.cycle}</strong>
              </p>
            </div>

            {/* Course Specification Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-4">
              <div>
                <span className="text-slate-500">Unidad Didáctica:</span>
                <p className="font-bold text-slate-900">{currentCourse?.name}</p>
              </div>
              <div>
                <span className="text-slate-500">Código de Curso:</span>
                <p className="font-mono font-bold text-slate-900">{currentCourse?.code}</p>
              </div>
              <div>
                <span className="text-slate-500">Créditos:</span>
                <p className="font-bold">{currentCourse?.credits} créditos</p>
              </div>
              <div>
                <span className="text-slate-500">Docente Responsable:</span>
                <p className="font-bold">Lic. Carlos Mendoza Villanueva</p>
              </div>
            </div>

            {/* Grades Table for Official Acta */}
            <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-2 text-center w-10">N°</th>
                    <th className="py-2 px-3">Código SIA</th>
                    <th className="py-2 px-4">Apellidos y Nombres</th>
                    <th className="py-2 px-3 text-center">Nota en Números</th>
                    <th className="py-2 px-4">Nota en Letras (Oficial)</th>
                    <th className="py-2 px-3 text-center">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentGrades.map((g, idx) => {
                    const numberToWords: Record<number, string> = {
                      0: 'CERO',
                      13: 'TRECE',
                      14: 'CATORCE',
                      15: 'QUINCE',
                      16: 'DIECISÉIS',
                      17: 'DIECISIETE',
                      18: 'DIECIOCHO',
                      19: 'DIECINUEVE',
                      20: 'VEINTE'
                    };

                    return (
                      <tr key={g.id}>
                        <td className="py-2 px-2 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-semibold">{g.studentCode}</td>
                        <td className="py-2 px-4 font-bold uppercase">{g.studentName}</td>
                        <td className="py-2 px-3 text-center">
                          {renderGradeBadge(g.finalGrade, true)}
                        </td>
                        <td className="py-2 px-4 font-serif uppercase text-[11px] font-semibold text-slate-700">
                          {numberToWords[g.finalGrade] || 'TRECE'}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-[11px]">
                          {g.status === 'APROBADO' ? (
                            <span className="text-emerald-700">APROBADO</span>
                          ) : g.status === 'DPI' ? (
                            <span className="text-purple-900">DPI</span>
                          ) : (
                            <span className="text-red-700">DESAPROBADO</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {unsyncedEnrolled.map((item, idx) => (
                    <tr key={`acta-unsynced-${item.studentId}`} className="bg-amber-50/50">
                      <td className="py-2 px-2 text-center font-bold text-amber-700">{currentGrades.length + idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-semibold">{item.studentCode}</td>
                      <td className="py-2 px-4 font-bold uppercase">
                        {item.studentName} <span className="text-[10px] text-amber-700 font-sans font-normal">(Matriculado 2026-I)</span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-400">--</td>
                      <td className="py-2 px-4 font-serif uppercase text-[11px] font-semibold text-amber-700">EN EVALUACIÓN</td>
                      <td className="py-2 px-3 text-center font-bold text-[11px] text-amber-800">EN PROCESO</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Signatures Bar */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-300 text-center text-xs">
              <div>
                <div className="h-12 border-b border-slate-400 mx-auto w-36 flex items-center justify-center italic text-slate-400 text-[10px]">
                  [Firma Docente]
                </div>
                <p className="font-bold text-slate-900 mt-1">Ing. Carlos Mendoza V.</p>
                <p className="text-[10px] text-slate-500">Docente Titular de la Asignatura</p>
              </div>

              <div>
                <div className="h-12 border-b border-slate-400 mx-auto w-36 flex items-center justify-center italic text-slate-400 text-[10px]">
                  [Firma Registro Académico]
                </div>
                <p className="font-bold text-slate-900 mt-1">Lic. Oscar Ortiz Regalao</p>
                <p className="text-[10px] text-slate-500">Gestión Académica y Matrículas</p>
              </div>

              <div>
                <div className="h-12 border-b border-slate-400 mx-auto w-36 flex items-center justify-center italic text-slate-400 text-[10px]">
                  [Firma y Sello Rectoral]
                </div>
                <p className="font-bold text-slate-900 mt-1">Lic. Elmer Torres Peres</p>
                <p className="text-[10px] text-slate-500">Director General - IESTP ITMANV</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden pt-4 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-mono">
                Acta Generada con Ref. R.V.M. N° 049-2022-MINEDU (Exportación Cliente PDF)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportActaPdf}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  <Download className="w-4 h-4" /> Descargar Acta PDF (A4)
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-900 bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
