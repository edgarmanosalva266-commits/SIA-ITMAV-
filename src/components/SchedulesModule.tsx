import React, { useState } from 'react';
import { ScheduleItem, Course, Career } from '../types';
import { 
  CalendarClock, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  User, 
  Filter, 
  X,
  Layers
} from 'lucide-react';

interface SchedulesProps {
  schedules: ScheduleItem[];
  courses: Course[];
  careers: Career[];
  onSaveSchedule: (item: ScheduleItem) => Promise<void>;
  currentUserRole: string;
}

export const SchedulesModule: React.FC<SchedulesProps> = ({
  schedules,
  courses,
  careers,
  onSaveSchedule,
  currentUserRole
}) => {
  const [selectedTurn, setSelectedTurn] = useState<'ALL' | 'MAÑANA' | 'TARDE' | 'NOCHE'>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [collisionError, setCollisionError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [day, setDay] = useState<ScheduleItem['day']>('Lunes');
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('21:30');
  const [classroom, setClassroom] = useState('Aula A-201 (Simulación Empresarial)');
  const [section, setSection] = useState('V-N1');
  const [turn, setTurn] = useState<ScheduleItem['turn']>('NOCHE');
  const [teacherName, setTeacherName] = useState('Lic. Carlos Mendoza Villanueva');

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Collision detection algorithm
  const checkCollision = (
    targetDay: string,
    targetStart: string,
    targetEnd: string,
    targetClassroom: string,
    targetTeacher: string,
    targetSection: string
  ) => {
    // Time to minutes helper
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const newStartMin = toMinutes(targetStart);
    const newEndMin = toMinutes(targetEnd);

    if (newEndMin <= newStartMin) {
      return { hasCollision: true, reason: 'La hora de fin debe ser posterior a la hora de inicio.' };
    }

    for (const item of schedules) {
      if (item.day !== targetDay) continue;

      const itemStartMin = toMinutes(item.startTime);
      const itemEndMin = toMinutes(item.endTime);

      // Overlap condition: (StartA < EndB) && (EndA > StartB)
      const hasOverlap = (newStartMin < itemEndMin) && (newEndMin > itemStartMin);

      if (hasOverlap) {
        if (item.classroom.toLowerCase() === targetClassroom.toLowerCase()) {
          return {
            hasCollision: true,
            reason: `CRUCE DE AULA: El ambiente "${item.classroom}" ya está ocupado por "${item.courseName}" de ${item.startTime} a ${item.endTime}.`
          };
        }
        if (item.teacherName.toLowerCase() === targetTeacher.toLowerCase()) {
          return {
            hasCollision: true,
            reason: `CRUCE DE DOCENTE: El docente "${item.teacherName}" ya tiene clase programada en "${item.courseName}" de ${item.startTime} a ${item.endTime}.`
          };
        }
        if (item.section.toLowerCase() === targetSection.toLowerCase()) {
          return {
            hasCollision: true,
            reason: `CRUCE DE SECCIÓN: La sección "${item.section}" ya cursa simultáneamente "${item.courseName}" de ${item.startTime} a ${item.endTime}.`
          };
        }
      }
    }

    return { hasCollision: false, reason: null };
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    const collision = checkCollision(day, startTime, endTime, classroom, teacherName, section);
    if (collision.hasCollision) {
      setCollisionError(collision.reason);
      return;
    }

    const selectedCourse = courses.find(c => c.id === courseId);
    if (!selectedCourse) return;

    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      courseId,
      courseName: selectedCourse.name,
      careerId: selectedCourse.careerId,
      cycle: selectedCourse.cycle,
      section,
      day,
      startTime,
      endTime,
      classroom,
      teacherId: 'staff-doc-05',
      teacherName,
      turn
    };

    await onSaveSchedule(newItem);
    setCollisionError(null);
    setShowAddModal(false);
    setToast(`Horario de ${selectedCourse.name} programado exitosamente sin cruces.`);
  };

  const filteredSchedules = schedules.filter(item => {
    const matchesTurn = selectedTurn === 'ALL' || item.turn === selectedTurn;
    const matchesDay = selectedDay === 'ALL' || item.day === selectedDay;
    return matchesTurn && matchesDay;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="p-4 rounded-xl border border-emerald-500 bg-emerald-950 text-emerald-200 flex items-center justify-between text-xs font-bold transition-all shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 hover:opacity-80">✕</button>
        </div>
      )}
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-lg">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Programación de Horarios & Motor Anti-Cruces
            </h3>
            <p className="text-xs text-slate-500">
              Algoritmo de validación de colisiones de aula, docente y sección en tiempo real
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Programar Bloque Horario
        </button>
      </div>

      {/* Collision Prevention Engine Info Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Motor Preventivo de Cruces Activo:</span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              El sistema verifica cruces en 3 dimensiones: <strong>Aulas físicas/Laboratorios</strong>, <strong>Disponibilidad Docente</strong> y <strong>Sección académica</strong> antes de registrar cualquier sesión.
            </p>
          </div>
        </div>
        <span className="shrink-0 bg-white border border-amber-300 font-bold px-3 py-1 rounded-full text-[11px] text-amber-800 shadow-xs">
          0 Cruces Detectados
        </span>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filtrar por Turno:</span>
          <div className="flex gap-1.5">
            {(['ALL', 'MAÑANA', 'TARDE', 'NOCHE'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTurn(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  selectedTurn === t
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t === 'ALL' ? 'Todos los Turnos' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Día:</span>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-3 focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">Toda la Semana</option>
            {daysOfWeek.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {daysOfWeek.map((currentDay) => {
          const dayItems = filteredSchedules.filter(s => s.day === currentDay);

          return (
            <div key={currentDay} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">{currentDay}</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {dayItems.length} bloques
                </span>
              </div>

              <div className="p-3 space-y-2.5 flex-1">
                {dayItems.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-xs text-slate-400 italic">
                    Sin clases programadas
                  </div>
                ) : (
                  dayItems.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded text-[10px]">
                          <Clock className="w-3 h-3" /> {item.startTime} - {item.endTime}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                          Sec. {item.section}
                        </span>
                      </div>

                      <h5 className="font-bold text-slate-900 text-xs leading-snug">
                        {item.courseName}
                      </h5>

                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{item.classroom}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{item.teacherName}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Programar Bloque con Detección de Cruces */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-amber-600" />
                Programación de Bloque Horario
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unidad Didáctica</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-red-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name} - Ciclo {c.cycle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Día de la Semana</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as ScheduleItem['day'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-red-500"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Turno</label>
                  <select
                    value={turn}
                    onChange={(e) => setTurn(e.target.value as ScheduleItem['turn'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="MAÑANA">Mañana (08:00 - 13:00)</option>
                    <option value="TARDE">Tarde (13:30 - 18:30)</option>
                    <option value="NOCHE">Noche (18:30 - 22:30)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aula / Laboratorio</label>
                  <select
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Aula A-201 (Simulación Empresarial)">Aula A-201 (Simulación Empresarial)</option>
                    <option value="Lab B-102 (Finanzas & Proyectos)">Lab B-102 (Finanzas & Proyectos)</option>
                    <option value="Lab B-104 (Banca Digital y Bolsa)">Lab B-104 (Banca Digital y Bolsa)</option>
                    <option value="Aula A-203 (Negocios Globales)">Aula A-203 (Negocios Globales)</option>
                    <option value="Auditorio Central ITMAN">Auditorio Central ITMAN</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sección / Grupo</label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="V-N1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Docente Asignado</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              {collisionError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Colisión Horaria Detectada:</span>
                    <span>{collisionError}</span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                <strong>Verificación Anti-Cruces:</strong> Al presionar guardar, el algoritmo validará que no exista colisión horaria con el ambiente, el docente ni la cohorte académica.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Validar y Programar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
