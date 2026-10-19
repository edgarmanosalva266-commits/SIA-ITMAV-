import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Server, 
  FileCheck2, 
  GraduationCap, 
  CalendarClock, 
  ReceiptText, 
  UserCheck, 
  FileSpreadsheet, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Database,
  Building2,
  Lock,
  Workflow
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'table' | 'normative'>('table');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const modulesData = [
    {
      id: 'admision',
      name: '1. Admisión y Convocatoria',
      icon: UserCheck,
      color: 'blue',
      actors: 'Lic. Emerita Vásquez Suárez (Jefa de Trámite Documentario y Admisión), Postulantes.',
      features: [
        'Inscripción de postulantes con DNI (8 dígitos) y Carné de Extranjería (CE)',
        'Gestión de 7 modalidades oficiales según Ley 30512 (Ordinario, Exonerados: Primeros Puestos, Deportistas Calificados IPD, Discapacidad CONADIS, Titulados, Traslados y Beca 18 PRONABEC)',
        'Cotejo y validación documental de certificados de educación secundaria',
        'Generación de Ficha de Inscripción con código de barras y Constancia de Ingreso oficial'
      ],
      rules: [
        'Validación estricta de vacantes disponibles por carrera profesional antes de confirmar postulaciones',
        'Acreditación obligatoria de constancia oficial para modalidades especiales (Resolución IPD, Carné CONADIS, Acta SIAGIE)',
        'Puntaje mínimo aprobatorio de 70.0/100 en examen ordinario o convalidación directa para exonerados calificados'
      ],
      accessPolicy: 'Público para registro de postulantes. Edición, validación y desempate exclusivo para Lic. Emerita Vásquez Suárez.'
    },
    {
      id: 'matriculas',
      name: '2. Matrículas y Control de Aforo',
      icon: GraduationCap,
      color: 'indigo',
      actors: 'Lic. Oscar Ortiz Regalao (Coordinador de Gestión Académica y Matrículas), Estudiantes.',
      features: [
        'Matrícula regular y extemporánea por periodo académico (2026-I, 2026-II)',
        'Verificación automatizada de prerrequisitos según plan curricular modular',
        'Validación instantánea de antecedentes financieros (Semáforo de Tesorería)',
        'Emisión de Ficha Oficial de Matrícula en PDF con código QR de trazabilidad institucional'
      ],
      rules: [
        'Regla de Bloqueo por Morosidad: Si el estudiante registra cuotas o pensiones vencidas, el sistema impide la confirmación de matrícula',
        'Regla de Prerrequisitos Académicos: Bloqueo de cursos de ciclos avanzados si no se ha aprobado la unidad didáctica prerrequisito',
        'Control de Aforo: Límite estricto de 35 estudiantes por aula teórica y 25 por laboratorio tecnológico'
      ],
      accessPolicy: 'Consulta para Estudiantes. Aprobación final, apertura de cupos y convalidaciones reservado para Lic. Oscar Ortiz Regalao.'
    },
    {
      id: 'notas',
      name: '3. Gestión de Notas (Competencias LAG MINEDU)',
      icon: FileSpreadsheet,
      color: 'emerald',
      actors: 'Docentes del IESTP ITMANV, Lic. Oscar Ortiz Regalao, Lic. Elmer Torres Peres (Director General).',
      features: [
        'Registro formativo por Indicadores de Logro (IL1, IL2, IL3, IL4)',
        'Escala vigesimal oficial peruana (0.0 a 20.0)',
        'Cálculo de Evaluación de Recuperación (ER) para estudiantes con promedio entre 10.0 y 12.0',
        'Cierre de Periodo y Emisión de Actas Oficiales Consolidadas según formato MINEDU'
      ],
      rules: [
        'Nota mínima aprobatoria institucional: 13.0 (trece) según Lineamientos Académicos Generales (LAG)',
        'Regla de DPI (Desaprobado por Inasistencia): Inasistencias acumuladas > 30% inhabilita automáticamente al estudiante y registra nota 00 en acta',
        'Cierre de acta digital inmutable: Una vez refrendada por Lic. Elmer Torres Peres y Lic. Oscar Ortiz Regalao, no admite alteraciones'
      ],
      accessPolicy: 'Docentes cargan indicadores de sus asignaturas. Cierre y emisión de actas oficiales por Gestión Académica y Dirección.'
    },
    {
      id: 'horarios',
      name: '4. Programación de Horarios y Aulas',
      icon: CalendarClock,
      color: 'amber',
      actors: 'Lic. Oscar Ortiz Regalao (Gestión Académica), Docentes, Estudiantes.',
      features: [
        'Matriz de horarios semanales por turno (Mañana: 08:00-13:00, Tarde: 13:30-18:30, Noche: 18:30-22:30)',
        'Asignación de laboratorios informáticos, talleres y aulas multimedia',
        'Motor algorítmico de prevención de colisiones horarias en tiempo real',
        'Exportación de horarios por sección y carga horaria individual docente'
      ],
      rules: [
        'Detección de Cruces: Impedir duplicidad horaria de un docente en dos asignaturas simultáneas',
        'Conflicto de Infraestructura: Impedir reserva simultánea del mismo ambiente físico o laboratorio',
        'Consistencia de Sección: Garantizar que una misma cohorte no tenga dos cursos programados a la misma hora'
      ],
      accessPolicy: 'Diseño y modificación por Lic. Oscar Ortiz Regalao. Visualización pública para docentes y alumnos.'
    },
    {
      id: 'tesoreria',
      name: '5. Tesorería y Cobranzas',
      icon: ReceiptText,
      color: 'rose',
      actors: 'Área de Tesorería (CP. Maritza Saldaña), Lic. Elmer Torres Peres (Director General).',
      features: [
        'Emisión de cronogramas de pensiones (5 cuotas semestrales) y derechos académicos',
        'Motor de alertas de morosidad con cálculo automático de recargos e intereses',
        'Integración con pasarelas de pago peruanas (Yape, Plin, Transferencias BCP/BBVA/Interbank)',
        'Liquidación de caja diaria y conciliación con comprobantes electrónicos SUNAT'
      ],
      rules: [
        'Vigencia de Cuotas: Días de gracia configurables (máximo 5 días calendario tras el vencimiento)',
        'Generación de Alerta de Deuda: Notificación automática en el portal del estudiante ante mora acumulada',
        'Enlace Contable: Todo cobro monetario registrado debe derivar inmediatamente en la emisión de un comprobante de pago tributario'
      ],
      accessPolicy: 'Operación financiera exclusiva del área de Tesorería. Supervisión gerencial por el Director Lic. Elmer Torres Peres.'
    },
    {
      id: 'facturacion',
      name: '6. Facturación Electrónica SUNAT (UBL 2.1)',
      icon: ShieldCheck,
      color: 'purple',
      actors: 'Tesorería, SUNAT (Servicio OSE/SEE), Estudiantes y Empresas (Clientes).',
      features: [
        'Emisión en tiempo real de Boletas de Venta Electrónicas (Serie B001) con DNI o Carné de Extranjería',
        'Emisión de Facturas Electrónicas (Serie F001) con RUC de 11 dígitos para convenios y empresas',
        'Generación de firma digital y Código Hash SHA-256 en estándar XML UBL 2.1',
        'Generación de Código QR con especificación técnica de la Resolución de Superintendencia SUNAT',
        'Descarga de archivo XML firmado y representación impresa en formato ticket y A4 con CDR simulado'
      ],
      rules: [
        'Tratamiento Tributario Educativo: Aplicación de exoneración del IGV en pensiones y matrículas según Art. 19 del TUO de la Ley del IGV',
        'Inmutabilidad Fiscal: Un comprobante con CDR aceptado (Código 0) no puede modificarse; solo se anula mediante Nota de Crédito Electrónica',
        'Trazabilidad SUNAT: Envío dentro del plazo legal de 3 días calendario a los servidores de SUNAT'
      ],
      accessPolicy: 'Emisión por Tesorería. Consulta y descarga de comprobantes abierta para el estudiante y titular del documento.'
    },
    {
      id: 'portales',
      name: '7. Portales Autónomos (Estudiante & Docente)',
      icon: Layers,
      color: 'teal',
      actors: 'Estudiantes del ITMANV, Docentes Titulares, Lic. Elmer Torres Peres (Dirección Institucional).',
      features: [
        'Portal Estudiante: Horario en vivo, semaforización de notas por competencia, estado de cuenta y descarga de sílabos',
        'Portal Docente: Carga académica lectiva asignada, registro de asistencia con cálculo de porcentaje de inasistencias y subida de sílabos',
        'Panel Rectoral (Lic. Elmer Torres Peres): Cuadro de mando con KPIs de matrícula, deserción, cobranza y firma digital de actas'
      ],
      rules: [
        'Privacidad de Datos (Ley N° 29733): Cada estudiante accede únicamente a sus notas y comprobantes emitidos a su nombre',
        'Competencias por Docente: Cada docente solo puede ingresar notas en las unidades didácticas asignadas en su carga lectiva',
        'Fechas de Apertura de Actas: El registro de notas docentes se cierra automáticamente según el calendario académico aprobado'
      ],
      accessPolicy: 'Acceso autenticado con roles segregados (RBAC) con persistencia en Firebase Firestore.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Hero Badge */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-semibold mb-2">
              <Workflow className="w-3.5 h-3.5" /> Arquitectura Empresarial de Software - MINEDU & SUNAT
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              SIA ITMANV: Sistema Integrado Académico
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mt-1 leading-relaxed">
              Diseño integral para Institutos de Educación Superior Tecnológica del Perú bajo la 
              <strong className="text-white"> Ley N° 30512</strong>, lineamientos académicos por competencias y facturación electrónica 
              <strong className="text-white"> SUNAT UBL 2.1</strong> con persistencia en <strong className="text-white">Firebase Firestore</strong>.
            </p>
          </div>

          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'table' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Matriz Estructurada
            </button>
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'diagram' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Diagrama de Bloques
            </button>
            <button
              onClick={() => setActiveTab('normative')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'normative' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Base Legal Peruana
            </button>
          </div>
        </div>

        {/* Roles Highlights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2.5 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-red-600/30 flex items-center justify-center font-bold text-red-300 border border-red-500/30">
              ET
            </div>
            <div>
              <p className="font-bold text-white">Lic. Elmer Torres Peres</p>
              <p className="text-slate-400 text-[11px]">Director General Institucional</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center font-bold text-blue-300 border border-blue-500/30">
              EV
            </div>
            <div>
              <p className="font-bold text-white">Lic. Emerita Vásquez Suárez</p>
              <p className="text-slate-400 text-[11px]">Trámite Documentario y Admisión</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-emerald-600/30 flex items-center justify-center font-bold text-emerald-300 border border-emerald-500/30">
              OO
            </div>
            <div>
              <p className="font-bold text-white">Lic. Oscar Ortiz Regalao</p>
              <p className="text-slate-400 text-[11px]">Gestión Académica y Matrículas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 1: Detailed Table of Modules */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-red-600" />
              Matriz Integral de Módulos, Actores y Reglas Críticas
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              SIA ITMANV v2.4 • Normativa MINEDU & SUNAT
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {modulesData.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedModule === m.id;

              return (
                <div 
                  key={m.id}
                  className={`bg-white rounded-xl border transition-all shadow-sm overflow-hidden ${
                    isSelected ? 'border-red-500 ring-2 ring-red-100 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div 
                    onClick={() => setSelectedModule(isSelected ? null : m.id)}
                    className="p-4 cursor-pointer flex items-center justify-between gap-4 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{m.name}</h4>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          <strong className="text-slate-700">Responsables:</strong> {m.actors}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline-flex text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-md">
                        {m.rules.length} Reglas Críticas
                      </span>
                      <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <div className="p-5 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white">
                    {/* Key Features */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Funcionalidades Clave
                      </h5>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {m.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-500 mt-0.5 font-bold">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Critical Business Rules */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-red-600" />
                        Reglas de Negocio Críticas
                      </h5>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {m.rules.map((r, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-red-500 mt-0.5 font-bold">▪</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Access Policies & Security */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Políticas de Acceso y RBAC
                      </h5>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        {m.accessPolicy}
                      </div>
                      <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        Persistencia sincronizada en Firebase Firestore
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Diagram of Blocks */}
      {activeTab === 'diagram' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              Arquitectura en 4 Capas del SIA ITMANV
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Desacoplamiento limpio entre interfaces de usuario, motores de reglas académicas/tributarias e infraestructura cloud.
            </p>
          </div>

          <div className="space-y-4">
            {/* Layer 1: Presentation & Portals */}
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                  Capa 1
                </span>
                <h4 className="font-bold text-slate-800 text-sm">
                  Capa de Presentación y Portales Segregados (RBAC)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm text-center">
                  <p className="text-xs font-bold text-slate-800">Portal Estudiante</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Notas, horarios, boletas SUNAT y sílabos</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm text-center">
                  <p className="text-xs font-bold text-slate-800">Portal Docente</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Carga lectiva, asistencia y registro IL1-IL4</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm text-center">
                  <p className="text-xs font-bold text-slate-800">Módulos Administrativos</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Admisión, Matrículas, Horarios y Tesorería</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm text-center">
                  <p className="text-xs font-bold text-slate-800">Panel Rectoral</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Lic. Elmer Torres Peres (Firma y Supervisión)</p>
                </div>
              </div>
            </div>

            {/* Connecting arrows */}
            <div className="flex justify-center text-slate-400 text-xs font-mono">
              ↓ Interacción Segura / Tokens de Sesión y Restricción por Roles ↓
            </div>

            {/* Layer 2: Business Logic & Academic Rules */}
            <div className="border-2 border-dashed border-red-200 bg-red-50/40 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                  Capa 2
                </span>
                <h4 className="font-bold text-slate-800 text-sm">
                  Capa de Lógica del Dominio Académico & Reglas de Negocio
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                  <p className="font-bold text-slate-800">Validador de Prerrequisitos</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Auditoría curricular secuencial obligatoria.</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                  <p className="font-bold text-slate-800">Filtro de Morosidad Financiera</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Bloqueo de matrícula y trámites por deuda vencida.</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                  <p className="font-bold text-slate-800">Motor Anti-Cruces de Horarios</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Verificación tridimensional (Docente, Aula, Sección).</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                  <p className="font-bold text-slate-800">Evaluación Formativa MINEDU</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Promedio IL1 a IL4, filtro de 30% inasistencias y DPI.</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                  <p className="font-bold text-slate-800">Validador de Vacantes</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Cupos máximos por carrera y turno en Admisión.</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                  <p className="font-bold text-slate-800">Generador Criptográfico SUNAT</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Hash SHA-256, XML UBL 2.1 y cadena QR fiscal.</p>
                </div>
              </div>
            </div>

            {/* Connecting arrows */}
            <div className="flex justify-center text-slate-400 text-xs font-mono">
              ↓ Transacciones y Consultas Criptográficas ↓
            </div>

            {/* Layer 3 & 4: Integrations & Real Database */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-purple-200 bg-purple-50/40 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                    Capa 3
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Servicios Externos de Integración
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 mt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <strong>SUNAT SEE / OSE:</strong> Recepción y emisión UBL 2.1 con CDR.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <strong>RENIEC / MIGRACIONES:</strong> Validación de DNI y Carné de Extranjería.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <strong>MINEDU / SIAGIE:</strong> Certificados de secundaria y títulos.
                  </li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-amber-200 bg-amber-50/40 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                    Capa 4
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Persistencia Real: Firebase Firestore
                  </h4>
                </div>
                <div className="text-xs text-slate-700 space-y-1 mt-2">
                  <p>Colecciones aprovisionadas en la nube:</p>
                  <p className="font-mono text-[11px] text-amber-900 bg-amber-100/60 p-1.5 rounded">
                    applicants • students • enrollments • grades • schedules • treasury_payments • sunat_invoices • syllabi
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Reglas de seguridad ABAC activas con verificación de pertenencia e inmutabilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Normative & Legal Framework */}
      {activeTab === 'normative' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-600" />
            Marco Legal y Normativo Peruano Aplicado al SIA ITMANV
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                Ley N° 30512
              </span>
              <p className="font-bold text-slate-800 text-sm">
                Ley de Institutos y Escuelas de Educación Superior
              </p>
              <p className="text-slate-600 leading-relaxed">
                Regula la creación, licenciamiento, régimen académico y modalidades de admisión en institutos públicos y privados del Perú. En el SIA ITMANV fundamenta las 7 modalidades de ingreso (ordinario, primeros puestos, deportistas calificados IPD, personas con discapacidad CONADIS y traslados).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                R.V.M. N° 178-2018 / 049-2022-MINEDU
              </span>
              <p className="font-bold text-slate-800 text-sm">
                Lineamientos Académicos Generales (LAG)
              </p>
              <p className="text-slate-600 leading-relaxed">
                Establece la evaluación formativa basada en competencias con indicadores de logro (IL1 a IL4), escala vigesimal (0-20), nota mínima aprobatoria de trece (13), derecho a evaluación de recuperación (promedio entre 10 y 12) e inhabilitación por DPI ante inasistencias superiores al 30%.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Resolución SUNAT N° 097-2012 / RS 000193-2020
              </span>
              <p className="font-bold text-slate-800 text-sm">
                Sistema de Emisión Electrónica SUNAT (SEE - UBL 2.1)
              </p>
              <p className="text-slate-600 leading-relaxed">
                Norma técnica que regula la emisión de Boletas de Venta Electrónicas (Serie B001) y Facturas (Serie F001), obligando al uso del formato XML UBL 2.1, generación de código Hash SHA-256, representación impresa con código QR y recepción de Constancia de Recepción (CDR).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                D.S. N° 055-99-EF / TUO Ley del IGV (Art. 19)
              </span>
              <p className="font-bold text-slate-800 text-sm">
                Inafectación Tributaria de Servicios Educativos
              </p>
              <p className="text-slate-600 leading-relaxed">
                Dispone que los servicios de enseñanza, matrículas y pensiones prestados por centros educativos e institutos autorizados se encuentran inafectos o exonerados del IGV (18%), debiendo declararse en las boletas electrónicas bajo el código de afectación correspondiente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
