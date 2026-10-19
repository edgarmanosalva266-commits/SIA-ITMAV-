import React, { useState } from 'react';
import { Course, Syllabus, GradeRecord, ScheduleItem, Teacher } from '../types';
import { 
  Briefcase, 
  BookOpen, 
  Users, 
  Clock, 
  Calendar, 
  CheckSquare, 
  FileText, 
  ChevronRight, 
  AlertCircle,
  Download,
  Building2,
  X,
  UserPlus,
  Award,
  Mail,
  Phone,
  Shield,
  Check,
  Settings2
} from 'lucide-react';

interface TeacherPortalProps {
  courses: Course[];
  syllabi: Syllabus[];
  grades: GradeRecord[];
  schedules: ScheduleItem[];
  teachers: Teacher[];
  onSaveTeacher: (teacher: Teacher) => Promise<void>;
  onOpenGradesForCourse: (courseId: string) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  courses,
  syllabi,
  grades,
  schedules,
  teachers,
  onSaveTeacher,
  onOpenGradesForCourse
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [showSyllabusModal, setShowSyllabusModal] = useState<Syllabus | null>(null);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState<boolean>(false);
  const [assignLoadTeacher, setAssignLoadTeacher] = useState<Teacher | null>(null);
  const [selectedAssignedCourses, setSelectedAssignedCourses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'attendance' | 'teachers'>('courses');

  // New teacher form state
  const [newTeacherName, setNewTeacherName] = useState<string>('');
  const [newTeacherDocNumber, setNewTeacherDocNumber] = useState<string>('');
  const [newTeacherEmail, setNewTeacherEmail] = useState<string>('');
  const [newTeacherPhone, setNewTeacherPhone] = useState<string>('');
  const [newTeacherDegree, setNewTeacherDegree] = useState<'LICENCIADO' | 'MAGISTER' | 'DOCTOR' | 'INGENIERO'>('LICENCIADO');
  const [newTeacherDegreeTitle, setNewTeacherDegreeTitle] = useState<string>('Licenciado en Administración');
  const [newTeacherDepartment, setNewTeacherDepartment] = useState<string>('Gestión Empresarial');
  const [newTeacherCondition, setNewTeacherCondition] = useState<'NOMBRADO' | 'CONTRATADO' | 'EXTRAORDINARIO'>('CONTRATADO');
  const [newTeacherCareerId, setNewTeacherCareerId] = useState<string>('car-ade');
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Teacher Carlos Mendoza courses or all assigned
  const teacherCourses = courses.filter(c => c.cycle === 5 || c.cycle === 1);
  const currentSyllabus = syllabi.find(s => s.courseId === selectedCourseId) || syllabi[0];
  const currentCourse = courses.find(c => c.id === selectedCourseId) || teacherCourses[0];

  // Grade records for selected course
  const currentCourseStudents = grades.filter(g => g.courseId === selectedCourseId);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherDocNumber) return;

    setIsSubmittingTeacher(true);
    try {
      const teacherCount = teachers.length + 1;
      const code = `DOC-2026-${String(teacherCount).padStart(3, '0')}`;
      
      const newTeacher: Teacher = {
        id: `staff-doc-${Date.now()}`,
        code,
        name: newTeacherName.trim().toUpperCase(),
        docType: 'DNI',
        docNumber: newTeacherDocNumber.trim(),
        email: newTeacherEmail.trim() || `${code.toLowerCase()}@itmanv.edu.pe`,
        phone: newTeacherPhone.trim() || '999888777',
        academicDegree: newTeacherDegree,
        degreeTitle: newTeacherDegreeTitle,
        department: newTeacherDepartment,
        condition: newTeacherCondition,
        careerId: newTeacherCareerId,
        assignedCourseIds: [courses[0]?.id || 'c-ade-101'],
        status: 'ACTIVO',
        hireDate: new Date().toISOString().split('T')[0],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      };

      await onSaveTeacher(newTeacher);
      setSuccessMessage(`¡Docente ${newTeacher.name} registrado y sincronizado exitosamente!`);
      setTimeout(() => setSuccessMessage(''), 5000);

      // Reset form
      setNewTeacherName('');
      setNewTeacherDocNumber('');
      setNewTeacherEmail('');
      setNewTeacherPhone('');
      setShowAddTeacherModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  const handleOpenAssignLoad = (teacher: Teacher) => {
    setAssignLoadTeacher(teacher);
    setSelectedAssignedCourses(teacher.assignedCourseIds || []);
  };

  const handleSaveAcademicLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignLoadTeacher) return;

    setIsSubmittingTeacher(true);
    try {
      const updatedTeacher: Teacher = {
        ...assignLoadTeacher,
        assignedCourseIds: selectedAssignedCourses
      };

      await onSaveTeacher(updatedTeacher);
      setSuccessMessage(`¡Carga académica asignada exitosamente al docente ${updatedTeacher.name}!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setAssignLoadTeacher(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            CM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">
                Portal del Docente & Gestión de Plana Académica
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Portal Oficial MINEDU / SIAGIE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Departamento Académico del IESTP ITMANV • Periodo Académico: <strong>2026-I</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'courses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Carga Lectiva & Sílabos
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'attendance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Control de Asistencia
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'teachers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Plana Docente ({teachers.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddTeacherModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" /> Agregar Docente
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {activeTab === 'courses' && currentCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Assigned Academic Load Cards */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-red-600" />
              Carga Académica Asignada ({teacherCourses.length} Unidades)
            </h4>

            <div className="space-y-3">
              {teacherCourses.map((c) => {
                const isSelected = selectedCourseId === c.id;
                const schedule = schedules.find(s => s.courseId === c.id);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCourseId(c.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/70 border-red-500 ring-1 ring-red-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                      <span className="font-bold text-red-700 text-[11px]">
                        Ciclo {c.cycle} • {c.credits} crd
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 text-sm leading-tight">
                      {c.name}
                    </h5>

                    {schedule && (
                      <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{schedule.day}: {schedule.startTime} - {schedule.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{schedule.classroom}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Course Syllabus & Competencies */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Unidad Didáctica Seleccionada</span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {currentCourse.name} ({currentCourse.code})
                  </h4>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSyllabusModal(currentSyllabus)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Ver Sílabo Completo
                  </button>

                  <button
                    onClick={() => onOpenGradesForCourse(currentCourse.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Registrar Calificaciones (IL1-IL4)
                  </button>
                </div>
              </div>

              {/* Competencies summary */}
              {currentSyllabus && (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block mb-1">
                      Competencia Específica del Módulo Profesional
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {currentSyllabus.competenceSpecific}
                    </p>
                  </div>

                  <h5 className="font-bold text-slate-900 text-xs">
                    Programación de Indicadores de Logro y Unidades de Aprendizaje:
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentSyllabus.learningUnits.map((u) => (
                      <div key={u.unitNumber} className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-red-700">Unidad 0{u.unitNumber}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{u.weeks}</span>
                        </div>
                        <h6 className="font-bold text-slate-900 text-xs">{u.title}</h6>
                        <p className="text-[11px] text-slate-600 leading-snug">{u.learningIndicator}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Attendance Roll-Call */}
      {activeTab === 'attendance' && currentCourse && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Control de Asistencia en Sesión Lectiva
              </h4>
              <p className="text-xs text-slate-500">
                Curso: <strong>{currentCourse.name}</strong> • Fecha: <strong>{new Date().toLocaleDateString('es-PE')}</strong>
              </p>
            </div>
            <div className="text-xs bg-red-50 border border-red-200 text-red-900 px-3 py-1.5 rounded-lg">
              <strong>Regla MINEDU:</strong> Inasistencia acumulada &gt; 30% causa inhabilitación por DPI.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Estudiante</th>
                  <th className="py-2.5 px-3 text-center">Asistencia Acumulada</th>
                  <th className="py-2.5 px-3 text-center">Estado Académico</th>
                  <th className="py-2.5 px-3 text-center">Sesión de Hoy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currentCourseStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold">{st.studentCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{st.studentName}</td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={st.attendancePercentage < 70 ? 'text-red-600' : 'text-emerald-700'}>
                        {st.attendancePercentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {st.attendancePercentage >= 70 ? (
                        <span className="text-emerald-700 font-semibold text-[11px]">Regular</span>
                      ) : (
                        <span className="text-red-600 font-bold text-[11px] bg-red-50 px-2 py-0.5 rounded">
                          Alerta DPI (&gt; 30% faltas)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded text-[11px]">
                          Presente
                        </button>
                        <button className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded text-[11px]">
                          Tardanza
                        </button>
                        <button className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded text-[11px]">
                          Falta
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Teachers Faculty Directory */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Plana Docente Oficial del IESTP ITMANV ({teachers.length} Docentes Registrados)
              </h4>
              <p className="text-xs text-slate-500">
                Directorio sincronizado con el Sistema de Gestión Académica y Escalafón MINEDU.
              </p>
            </div>

            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <UserPlus className="w-4 h-4" /> Registrar Nuevo Docente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((t) => {
              const assignedCount = (t.assignedCourseIds || []).length;
              return (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                          alt={t.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                            {t.code}
                          </span>
                          <h5 className="font-bold text-slate-900 text-sm mt-0.5 leading-tight">{t.name}</h5>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.condition === 'NOMBRADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {t.condition}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        <span className="font-semibold text-slate-800">{t.academicDegree}: {t.degreeTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{t.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{t.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-bold text-red-700">{assignedCount} Unidades Didácticas Asignadas</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleOpenAssignLoad(t)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg shadow-xs"
                    >
                      <Settings2 className="w-3.5 h-3.5" /> Asignar Carga Académica
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Assign Academic Load */}
      {assignLoadTeacher && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-slate-800 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-red-600" />
                  Asignar Carga Académica a: {assignLoadTeacher.name}
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Seleccione las unidades didácticas que dictará el docente en el periodo 2026-I.
                </p>
              </div>
              <button 
                onClick={() => setAssignLoadTeacher(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAcademicLoad} className="space-y-4 mt-4">
              <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                {courses.map((c) => {
                  const isChecked = selectedAssignedCourses.includes(c.id);
                  return (
                    <label 
                      key={c.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked ? 'bg-red-50/60 border-red-300 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssignedCourses(prev => [...prev, c.id]);
                            } else {
                              setSelectedAssignedCourses(prev => prev.filter(id => id !== c.id));
                            }
                          }}
                          className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                        />
                        <div>
                          <span className="font-mono font-bold text-slate-600 text-[11px] mr-2">{c.code}</span>
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <p className="text-[11px] text-slate-500">Ciclo {c.cycle} • {c.credits} Créditos</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        {c.careerId === 'car-ade' ? 'Administración' : 'Negocios Bancarios'}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignLoadTeacher(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTeacher}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmittingTeacher ? 'Guardando Carga...' : 'Guardar Carga Académica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register New Teacher */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-600" />
                Registrar Nuevo Docente en el Portal
              </h3>
              <button 
                onClick={() => setShowAddTeacherModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4 mt-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Apellidos y Nombres Completos *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Dr. Ramírez Torres, Alberto"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nro. de DNI *</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="8 dígitos"
                    value={newTeacherDocNumber}
                    onChange={(e) => setNewTeacherDocNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    placeholder="999888777"
                    value={newTeacherPhone}
                    onChange={(e) => setNewTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Institucional</label>
                <input
                  type="email"
                  placeholder="alberto.ramirez@itmanv.edu.pe"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grado Académico</label>
                  <select
                    value={newTeacherDegree}
                    onChange={(e) => setNewTeacherDegree(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="LICENCIADO">Licenciado</option>
                    <option value="MAGISTER">Magíster</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="INGENIERO">Ingeniero</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condición Laboral</label>
                  <select
                    value={newTeacherCondition}
                    onChange={(e) => setNewTeacherCondition(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="NOMBRADO">Nombrado</option>
                    <option value="CONTRATADO">Contratado</option>
                    <option value="EXTRAORDINARIO">Extraordinario</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título Profesional / Especialidad</label>
                <input
                  type="text"
                  placeholder="Ej. Magíster en Administración de Negocios"
                  value={newTeacherDegreeTitle}
                  onChange={(e) => setNewTeacherDegreeTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Departamento Académico</label>
                <input
                  type="text"
                  placeholder="Ej. Gestión Empresarial y Finanzas"
                  value={newTeacherDepartment}
                  onChange={(e) => setNewTeacherDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTeacher}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmittingTeacher ? 'Guardando en Firestore...' : 'Registrar Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Syllabus Viewer */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto text-slate-800 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-600" />
                Sílabo Oficial de la Unidad Didáctica
              </h3>
              <button 
                onClick={() => setShowSyllabusModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <h4 className="font-bold text-base text-slate-900">{showSyllabusModal.courseName}</h4>
                <p className="text-slate-600 font-mono">
                  Código: {showSyllabusModal.courseCode} • Periodo: {showSyllabusModal.period} • Docente: {showSyllabusModal.teacherName}
                </p>
                <p className="text-red-700 font-medium">Programa: {showSyllabusModal.careerName}</p>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 mb-1">Competencia General:</h5>
                <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded border border-slate-100">
                  {showSyllabusModal.competenceGeneral}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 mb-2">Unidades de Aprendizaje y Contenidos:</h5>
                <div className="space-y-3">
                  {showSyllabusModal.learningUnits.map(u => (
                    <div key={u.unitNumber} className="border border-slate-200 rounded-lg p-3 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-red-700 text-xs">Unidad {u.unitNumber}: {u.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{u.weeks}</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-700">{u.learningIndicator}</p>
                      <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                        {u.contents.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                <strong>Sistema de Evaluación:</strong> {showSyllabusModal.evaluationCriteria}
              </div>
            </div>

            <div className="mt-5 flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowSyllabusModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Cerrar Sílabo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
