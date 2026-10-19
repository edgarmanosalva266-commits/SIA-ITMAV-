import React, { useState } from 'react';
import { 
  Student, 
  GradeRecord, 
  ScheduleItem, 
  TreasuryPayment, 
  SunatInvoice, 
  Enrollment,
  Course,
  Syllabus
} from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  ReceiptText, 
  Award, 
  Download, 
  Printer, 
  Clock, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  exportBoletaSunatPdf, 
  exportTreasuryPaymentPdf, 
  exportStudentReportCardPdf 
} from '../services/pdfReportService';

interface StudentPortalProps {
  student: Student;
  students?: Student[];
  grades: GradeRecord[];
  schedules: ScheduleItem[];
  treasury: TreasuryPayment[];
  invoices: SunatInvoice[];
  enrollment?: Enrollment;
  courses: Course[];
  syllabi: Syllabus[];
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  students,
  grades,
  schedules,
  treasury,
  invoices,
  enrollment,
  courses,
  syllabi
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(student.id);
  const [activeTab, setActiveTab] = useState<'grades' | 'schedule' | 'account' | 'enrollment'>('grades');

  // Currently active student (with switcher support)
  const currentStudent = students?.find(s => s.id === selectedStudentId) || student;

  // Student grades
  const studentGrades = grades.filter(g => g.studentId === currentStudent.id);
  // Student payments from treasury collection
  const studentPayments = treasury.filter(t => t.studentId === currentStudent.id);
  // Overdue / delinquent payments check from treasury collection
  const overduePayments = studentPayments.filter(
    p => p.status === 'VENCIDO' || (p.status === 'PENDIENTE' && new Date(p.dueDate).getTime() < new Date().getTime())
  );
  const totalOverdueDebt = overduePayments.reduce(
    (sum, p) => sum + (p.totalDue - (p.paidAmount || 0)), 
    0
  );
  const hasOverduePayments = overduePayments.length > 0;

  // Student invoices
  const studentInvoices = invoices.filter(
    i => i.receiverDocNumber === currentStudent.docNumber
  );

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadReportCard = () => {
    try {
      exportStudentReportCardPdf({
        student: currentStudent,
        grades: studentGrades,
        courses: courses,
        academicPeriod: '2026-I'
      });
      setDownloadNotice(`Boleta Informativa de Notas generada con éxito para ${currentStudent.fullName}.`);
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch {
      setDownloadNotice('Ocurrió un error al generar la boleta de notas en PDF.');
      setTimeout(() => setDownloadNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast de descarga de reportes */}
      {downloadNotice && (
        <div className="p-3.5 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
          <button onClick={() => setDownloadNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Student Switcher Bar (If multiple students available) */}
      {students && students.length > 1 && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <GraduationCap className="w-4 h-4 text-red-600" />
            <span className="font-semibold">Simular Vista de Alumno:</span>
          </div>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-red-500"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.debtStatus === 'MOROSO' ? '⚠️ Con Deuda Vencida' : '✓ Al Día'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* NOTIFICACIÓN VISUAL CRÍTICA: PAGOS PENDIENTES FUERA DE PLAZO (TESORERÍA) */}
      {hasOverduePayments && (
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-2 border-red-500 rounded-2xl p-5 text-white shadow-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-600/40 border border-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-200 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-wider uppercase bg-red-950/80 border border-red-400/60 px-2.5 py-0.5 rounded-full text-red-200">
                  Alerta de Tesorería • Pagos Fuera de Plazo
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
                  Registra {overduePayments.length} cuota(s) pendiente(s) vencida(s) en Tesorería
                </h3>
              </div>
            </div>
            <div className="text-left sm:text-right bg-black/40 px-3.5 py-2 rounded-xl border border-red-500/40 shrink-0">
              <span className="text-[11px] text-red-200 block font-medium">Deuda Vencida Exigible:</span>
              <span className="text-xl font-black text-red-300 font-mono">
                S/. {totalOverdueDebt.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-black/30 rounded-xl border border-red-500/20 text-xs text-red-100 space-y-2">
            <p className="leading-relaxed">
              <strong>Notificación Oficial de Morosidad:</strong> De acuerdo con el Reglamento General de Tesorería del IESTP ITMANV, registra obligaciones económicas vencidas. La entrega de constancias de notas, libreta de calificaciones oficial y la formalización de matrícula para el periodo siguiente quedan retenidas hasta la cancelación en caja.
            </p>

            {/* Overdue items list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              {overduePayments.map((p) => (
                <div key={p.id} className="bg-red-950/80 p-2.5 rounded-lg border border-red-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block truncate max-w-[200px]" title={p.concept}>{p.concept}</span>
                    <span className="text-[10px] text-red-300">Vencimiento: {p.dueDate} {p.lateFee > 0 && `(Mora: S/. ${p.lateFee.toFixed(2)})`}</span>
                  </div>
                  <span className="font-extrabold text-red-200 text-xs">
                    S/. {(p.totalDue - (p.paidAmount || 0)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-[11px] text-red-200 flex items-center gap-1.5">
              <ReceiptText className="w-4 h-4 text-red-300 shrink-0" />
              Caja institucional: Efectivo, Transferencias BCP/BBVA o Billeteras Yape / Plin.
            </span>
            <button
              onClick={() => setActiveTab('account')}
              className="w-full sm:w-auto px-4 py-2 bg-white text-rose-900 hover:bg-red-50 font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <ReceiptText className="w-4 h-4 text-rose-700" />
              Ver Estado de Cuenta y Boletas
            </button>
          </div>
        </div>
      )}

      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-2xl p-6 text-white shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-600/30 border-2 border-red-500/50 flex items-center justify-center font-extrabold text-2xl text-red-200">
              {currentStudent.fullName.split(' ')[0][0]}{currentStudent.fullName.split(' ')[1]?.[0] || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 border border-red-800 px-2 py-0.5 rounded">
                  {currentStudent.studentCode}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  {currentStudent.status}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold mt-1">
                {currentStudent.fullName}
              </h2>
              <p className="text-xs text-slate-300">
                {currentStudent.careerName} • Ciclo {currentStudent.currentCycle} • Turno {currentStudent.turn}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {currentStudent.docType}: {currentStudent.docNumber} • Sede Central Lima
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-[11px] text-slate-400">Promedio Ponderado Acumulado:</span>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                {currentStudent.gpa.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 20</span>
              </p>
            </div>
            {hasOverduePayments ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-800 px-2.5 py-1 rounded-full animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Registra Deuda Vencida (S/. {totalOverdueDebt.toFixed(2)})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Al Día en Tesorería
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'grades' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-slate-800/60 text-slate-300 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" /> Notas por Competencia (LAG)
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'schedule' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-slate-800/60 text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" /> Mi Horario Semanal
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'account' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-slate-800/60 text-slate-300 hover:text-white'
            }`}
          >
            <ReceiptText className="w-4 h-4" /> Estado de Cuenta & Boletas SUNAT
          </button>
          <button
            onClick={() => setActiveTab('enrollment')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'enrollment' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-slate-800/60 text-slate-300 hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Ficha de Matrícula Oficial
          </button>
        </div>
      </div>

      {/* Tab: Grades by Competency */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          {hasOverduePayments && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 text-rose-900 flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-extrabold text-rose-950">
                  Bloqueo Administrativo de Actas Oficiales y Libretas de Notas
                </p>
                <p className="text-rose-800 leading-relaxed">
                  Registras cuotas de enseñanza vencidas en Tesorería por un total de <strong>S/. {totalOverdueDebt.toFixed(2)}</strong>. Aunque puedes visualizar tus notas formativas aquí, la emisión de tu Libreta Oficial de Notas y Constancias Académicas queda retenida hasta cancelar la mora en caja institucional.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Récord de Calificaciones Formativas (Periodo 2026-I)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Escala Vigesimal Oficial (0 a 20) • Aprobatorio: ≥ 13.0
              </p>
            </div>
            <button
              onClick={handleDownloadReportCard}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs shrink-0"
              title="Descargar boleta individual de notas en formato PDF"
            >
              <Download className="w-3.5 h-3.5" /> Descargar Boleta de Notas PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentGrades.map((g) => {
              const isApproved = g.status === 'APROBADO';

              return (
                <div key={g.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {g.courseCode}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                        {g.courseName}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black font-mono ${
                        isApproved ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {String(g.finalGrade).padStart(2, '0')}
                      </span>
                      <span className="block text-[10px] font-bold text-slate-400">
                        {isApproved ? 'APROBADO' : 'DESAPROBADO'}
                      </span>
                    </div>
                  </div>

                  {/* Indicator Breakdown with red highlighting for < 13 */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 grid grid-cols-4 gap-1 text-center">
                    {[
                      { label: 'IL1', val: g.il1 },
                      { label: 'IL2', val: g.il2 },
                      { label: 'IL3', val: g.il3 },
                      { label: 'IL4', val: g.il4 }
                    ].map((il) => (
                      <div key={il.label}>
                        <span className="text-[10px] text-slate-500 block">{il.label}</span>
                        <span className={`font-mono font-bold text-xs inline-block px-1 py-0.5 rounded ${
                          il.val < 13 
                            ? 'text-red-700 bg-red-100 border border-red-200 font-extrabold' 
                            : 'text-slate-800'
                        }`}>
                          {il.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Asistencia: <strong className={g.attendancePercentage < 70 ? 'text-red-600' : 'text-slate-700'}>{g.attendancePercentage}%</strong></span>
                    <span className="truncate max-w-[150px]">Doc: {g.teacherName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Weekly Schedule */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Horario de Clases Semanal (Ciclo {currentStudent.currentCycle} - Turno {currentStudent.turn})
            </h3>
            <span className="text-xs text-slate-500">
              Campus Central • Laboratorios de Cómputo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {daysOfWeek.map((day) => {
              const dayClasses = schedules.filter(s => s.day === day);

              return (
                <div key={day} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between">
                    <span>{day}</span>
                    <span className="text-slate-400 font-normal">{dayClasses.length} sesión(es)</span>
                  </div>

                  <div className="p-3 space-y-2">
                    {dayClasses.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic text-center py-4">Sin actividades</p>
                    ) : (
                      dayClasses.map((item) => (
                        <div key={item.id} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-xs text-xs space-y-1">
                          <span className="font-mono font-bold text-[10px] text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            {item.startTime} - {item.endTime}
                          </span>
                          <h5 className="font-bold text-slate-900 text-xs mt-1">{item.courseName}</h5>
                          <p className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {item.classroom}
                          </p>
                          <p className="text-[10px] text-slate-500">Prof: {item.teacherName}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Account & SUNAT Invoices */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Tuition installments */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">
              Obligaciones Económicas y Pensiones 2026-I
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Concepto</th>
                    <th className="py-2.5 px-3">Vencimiento</th>
                    <th className="py-2.5 px-3 text-right">Monto</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                    <th className="py-2.5 px-3 text-right">Comprobante SUNAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {studentPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{p.concept}</td>
                      <td className="py-2.5 px-3 font-mono">{p.dueDate}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">S/. {p.totalDue.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">
                        {p.status === 'PAGADO' ? (
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            Pagado
                          </span>
                        ) : p.status === 'VENCIDO' ? (
                          <span className="font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                            Vencido
                          </span>
                        ) : (
                          <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {p.status === 'PAGADO' ? (
                          <button
                            onClick={() => {
                              exportTreasuryPaymentPdf(p, currentStudent);
                              setDownloadNotice(`Descargando comprobante de pago de ${p.concept}...`);
                              setTimeout(() => setDownloadNotice(null), 4000);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded shadow-2xs ml-auto"
                            title="Descargar comprobante en PDF"
                          >
                            <Download className="w-3 h-3" /> Boleta PDF
                          </button>
                        ) : (
                          <span className="font-mono text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Electronic invoices */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-purple-700" />
              Boletas Electrónicas SUNAT Emitidas a su Nombre
            </h4>

            <div className="space-y-2.5">
              {studentInvoices.map((inv) => (
                <div key={inv.id} className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-purple-900">{inv.series}-{inv.number}</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Fecha: {inv.issueDate} • Total: S/. {inv.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">Hash: {inv.hashSha256}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        exportBoletaSunatPdf(inv);
                        setDownloadNotice(`Descargando Boleta Electrónica ${inv.series}-${inv.number}...`);
                        setTimeout(() => setDownloadNotice(null), 4000);
                      }}
                      className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                      title="Descargar Boleta Oficial SUNAT en formato PDF"
                    >
                      <Download className="w-3 h-3" /> Descargar Boleta PDF
                    </button>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded hidden sm:inline">
                      Aceptado por SUNAT
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Ficha de Matrícula */}
      {activeTab === 'enrollment' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="text-center border-b-2 border-red-700 pb-4">
            <h3 className="font-bold text-red-700 text-base">
              INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PRIVADO ITMAN
            </h3>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">
              Ficha Oficial de Matrícula - Periodo 2026-I
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Estudiante:</span>
              <p className="font-bold">{currentStudent.fullName}</p>
            </div>
            <div>
              <span className="text-slate-500">Documento:</span>
              <p className="font-mono font-bold">{currentStudent.docType} N° {currentStudent.docNumber}</p>
            </div>
            <div>
              <span className="text-slate-500">Programa Profesional:</span>
              <p className="font-semibold text-red-700">{currentStudent.careerName}</p>
            </div>
            <div>
              <span className="text-slate-500">Ciclo / Turno:</span>
              <p className="font-bold">Ciclo {currentStudent.currentCycle} • {currentStudent.turn}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <QRCodeSVG value={`https://itmanv.edu.pe/verificar/${currentStudent.studentCode}`} size={50} />
              <span className="text-[10px] text-slate-400">Verificación MINEDU</span>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Descargar Ficha PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
