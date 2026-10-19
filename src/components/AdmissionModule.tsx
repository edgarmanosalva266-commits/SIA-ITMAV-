import React, { useState } from 'react';
import { 
  Applicant, 
  AdmissionModality, 
  DocumentType, 
  Career 
} from '../types';
import { 
  UserPlus, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Printer, 
  Award, 
  Filter, 
  Eye, 
  X,
  BadgeCheck,
  Building
} from 'lucide-react';

interface AdmissionProps {
  applicants: Applicant[];
  careers: Career[];
  onSaveApplicant: (applicant: Applicant) => Promise<void>;
  onUpdateStatus: (id: string, status: Applicant['status'], reviewedBy: string, score?: number) => Promise<void>;
  currentUserRole: string;
}

export const AdmissionModule: React.FC<AdmissionProps> = ({
  applicants,
  careers,
  onSaveApplicant,
  onUpdateStatus,
  currentUserRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);
  const [viewingApplicant, setViewingApplicant] = useState<Applicant | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<Applicant | null>(null);
  const [toast, setToast] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // New applicant form state
  const [fullName, setFullName] = useState('');
  const [docType, setDocType] = useState<DocumentType>('DNI');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [careerId, setCareerId] = useState(careers[0]?.id || 'car-ade');
  const [modality, setModality] = useState<AdmissionModality>('ORDINARIO');
  const [modalityDetail, setModalityDetail] = useState('');

  const isEmerita = currentUserRole === 'TRAMITE_DOCUMENTARIO' || currentUserRole === 'DIRECTOR';

  // Filter applicants
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.docNumber.includes(searchTerm) ||
                          app.careerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality = selectedModality === 'ALL' || app.modality === selectedModality;
    return matchesSearch && matchesModality;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Doc length
    if (docType === 'DNI' && docNumber.length !== 8) {
      setToast({ type: 'error', text: 'El DNI debe contener exactamente 8 dígitos numéricos.' });
      return;
    }
    if (docType === 'CE' && (docNumber.length < 9 || docNumber.length > 12)) {
      setToast({ type: 'error', text: 'El Carné de Extranjería (CE) debe contener entre 9 y 12 caracteres.' });
      return;
    }

    const selectedCareer = careers.find(c => c.id === careerId) || careers[0];

    const newApplicant: Applicant = {
      id: `app-${Date.now()}`,
      fullName,
      docType,
      docNumber,
      birthDate: '2006-05-10',
      phone,
      email,
      careerId: selectedCareer ? selectedCareer.id : 'car-ade',
      careerName: selectedCareer ? selectedCareer.name : 'Administración de Empresas',
      modality,
      modalityDetail: modalityDetail.trim() ? modalityDetail : undefined,
      period: '2026-I',
      status: 'INSCRITO',
      documents: {
        dniUploaded: true,
        certSecundaria: true,
        constanciaModality: modality !== 'ORDINARIO',
        affidavit: true
      },
      registrationDate: new Date().toISOString().split('T')[0]
    };

    await onSaveApplicant(newApplicant);
    setShowNewModal(false);
    // Reset
    setFullName('');
    setDocNumber('');
    setPhone('');
    setEmail('');
    setModalityDetail('');
    setToast({
      type: 'success',
      text: `Postulante ${newApplicant.fullName} inscrito con éxito en ${newApplicant.careerName}. Expediente derivado a Trámite Documentario.`
    });
  };

  const modalityLabels: Record<AdmissionModality, string> = {
    ORDINARIO: 'Examen Ordinario',
    PRIMEROS_PUESTOS: 'Primeros Puestos (Ley 30512)',
    DEPORTISTA_CALIFICADO: 'Deportista Calificado (IPD)',
    DISCAPACIDAD_CONADIS: 'Discapacidad (CONADIS)',
    TITULADO_GRADUADO: 'Titulados y Graduados',
    TRASLADO_EXTERNO: 'Traslado Externo / Interno',
    BECA_PRONABEC: 'Beca 18 / PRONABEC'
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold transition-all shadow-md ${
          toast.type === 'error' ? 'bg-red-950 text-red-200 border-red-700' : 'bg-emerald-950 text-emerald-200 border-emerald-700'
        }`}>
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* Module Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Módulo de Admisión y Convocatoria 2026-I
              </h3>
              <p className="text-xs text-slate-500">
                Responsable del Cotejo Documental: <strong className="text-slate-800">Lic. Emerita Vásquez Suárez</strong> (Trámite Documentario)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Inscribir Postulante
          </button>
        </div>
      </div>

      {/* Vacancy and Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {careers.map((career) => (
          <div key={career.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">{career.code}</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {career.availableVacancies} Vacantes
              </span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm mt-1 truncate" title={career.name}>
              {career.name}
            </h4>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Aforo cubierto</span>
                <span className="font-bold">{career.totalVacancies - career.availableVacancies} / {career.totalVacancies}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-600 h-full rounded-full transition-all"
                  style={{ width: `${((career.totalVacancies - career.availableVacancies) / career.totalVacancies) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por DNI, CE o Apellidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">Todas las Modalidades (Ley 30512)</option>
            <option value="ORDINARIO">Examen Ordinario</option>
            <option value="PRIMEROS_PUESTOS">Primeros Puestos</option>
            <option value="DEPORTISTA_CALIFICADO">Deportista Calificado (IPD)</option>
            <option value="DISCAPACIDAD_CONADIS">Discapacidad (CONADIS)</option>
            <option value="TITULADO_GRADUADO">Titulados y Graduados</option>
            <option value="BECA_PRONABEC">Beca 18 / PRONABEC</option>
          </select>
        </div>
      </div>

      {/* Table of Applicants */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Postulante</th>
                <th className="py-3 px-4">Carrera Solicitada</th>
                <th className="py-3 px-4">Modalidad de Ingreso</th>
                <th className="py-3 px-4">Puntaje / Mérito</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApplicants.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    <span className="text-[10px] text-slate-500 font-normal mr-1">{app.docType}:</span>
                    {app.docNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{app.fullName}</p>
                    <p className="text-[11px] text-slate-500">{app.email} • {app.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">{app.careerName}</span>
                    <span className="block text-[10px] text-slate-400">Periodo {app.period}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                      {modalityLabels[app.modality]}
                    </span>
                    {app.modalityDetail && (
                      <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs truncate" title={app.modalityDetail}>
                        {app.modalityDetail}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {app.score !== undefined ? (
                      <div>
                        <span className="font-bold text-slate-900">{app.score.toFixed(1)} pts</span>
                        {app.meritRank && (
                          <span className="block text-[10px] text-emerald-700 font-semibold">
                            Puesto N° {app.meritRank}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Pendiente examen</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {app.status === 'APROBADO' && (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle className="w-3 h-3" /> Admitido
                      </span>
                    )}
                    {app.status === 'VALIDADO' && (
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                        <BadgeCheck className="w-3 h-3" /> Validado
                      </span>
                    )}
                    {app.status === 'INSCRITO' && (
                      <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                        Inscrito
                      </span>
                    )}
                    {app.status === 'EN_REVISION' && (
                      <span className="font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                        En Revisión
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingApplicant(app)}
                        title="Ver Expediente"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {app.status === 'APROBADO' && (
                        <button
                          onClick={() => setShowCertificateModal(app)}
                          title="Constancia Oficial de Ingreso"
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs"
                        >
                          <Printer className="w-3 h-3" /> Constancia
                        </button>
                      )}

                      {isEmerita && app.status !== 'APROBADO' && (
                        <button
                          onClick={async () => {
                            const scoreVal = app.score || 88.0;
                            await onUpdateStatus(app.id, 'APROBADO', 'Lic. Emerita Vásquez Suárez', scoreVal);
                            setToast({
                              type: 'success',
                              text: `Postulante ${app.fullName} APROBADO como admitido con puntaje ${scoreVal}/100.`
                            });
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md"
                        >
                          Admitir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Inscribir Postulante */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-600" />
                Ficha de Inscripción de Postulante 2026-I
              </h3>
              <button 
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Documento</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-500"
                  >
                    <option value="DNI">DNI (Perú - 8 dígitos)</option>
                    <option value="CE">Carné de Extranjería (CE)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Número de Documento {docType === 'DNI' ? '(8 dígitos)' : '(9-12 caracteres)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value.trim())}
                    placeholder={docType === 'DNI' ? '74819234' : '002938192'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Apellidos y Nombres Completos</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Mendoza Huamán, Ricardo Raúl"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono Móvil (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="987654321"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="postulante@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Carrera Profesional Técnica</label>
                  <select
                    value={careerId}
                    onChange={(e) => setCareerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-500"
                  >
                    {careers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.availableVacancies} vacantes)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modalidad de Admisión (Ley 30512)</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as AdmissionModality)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-500"
                  >
                    <option value="ORDINARIO">Examen Ordinario</option>
                    <option value="PRIMEROS_PUESTOS">Primeros Puestos de Educación Secundaria</option>
                    <option value="DEPORTISTA_CALIFICADO">Deportista Calificado (IPD)</option>
                    <option value="DISCAPACIDAD_CONADIS">Personas con Discapacidad (CONADIS)</option>
                    <option value="TITULADO_GRADUADO">Titulados o Graduados</option>
                    <option value="TRASLADO_EXTERNO">Traslados Externos e Internos</option>
                    <option value="BECA_PRONABEC">Beca 18 / PRONABEC</option>
                  </select>
                </div>
              </div>

              {modality !== 'ORDINARIO' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Detalle / Número de Resolución o Acreditación Especial
                  </label>
                  <input
                    type="text"
                    value={modalityDetail}
                    onChange={(e) => setModalityDetail(e.target.value)}
                    placeholder="Ej: Resolución IPD N° 482-2025 o Certificado 1er Puesto SIAGIE"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] leading-relaxed">
                <strong>Regla de Admisión Peruana:</strong> El postulante declara bajo juramento cumplir con los requisitos estipulados en la Ley N° 30512 y el Reglamento Institucional. La documentación será refrendada por <strong>Lic. Emerita Vásquez Suárez</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Confirmar Inscripción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Constancia Oficial de Ingreso (A4 Formato Oficial ITMANV) */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-300 relative text-slate-800">
            <button
              onClick={() => setShowCertificateModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="text-center border-b-2 border-red-700 pb-4 mb-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Ministerio de Educación • República del Perú
              </p>
              <h2 className="text-xl font-extrabold text-red-700 mt-1">
                INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PRIVADO ITMAN
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                R.M. N° 0418-94-ED • Código Modular: 0849201 • Licenciamiento Institucional
              </p>
              <div className="inline-block mt-3 px-4 py-1 bg-red-50 border border-red-300 text-red-800 rounded-full font-bold text-xs tracking-wider uppercase">
                CONSTANCIA OFICIAL DE INGRESO
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-800 text-justify">
              <p>
                La suscrita, <strong>Lic. Emerita Vásquez Suárez</strong>, Jefa del Área de Trámite Documentario y Admisión del IESTP ITMANV, que suscribe:
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 font-sans">
                <p>
                  <strong>HACE CONSTAR QUE:</strong> Don(ña) <span className="text-base font-bold text-slate-900 uppercase">{showCertificateModal.fullName}</span>, identificado(a) con <strong>{showCertificateModal.docType} N° {showCertificateModal.docNumber}</strong>, ha alcanzado una vacante en el <strong>PROCESO DE ADMISIÓN 2026-I</strong>.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500">Programa de Estudios:</span>
                    <p className="font-bold text-red-700">{showCertificateModal.careerName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Modalidad de Ingreso:</span>
                    <p className="font-bold">{modalityLabels[showCertificateModal.modality]}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Puntaje Final de Mérito:</span>
                    <p className="font-bold text-emerald-800">{showCertificateModal.score || 85.0} / 100 puntos</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Cuadro de Mérito:</span>
                    <p className="font-bold">Puesto N° {showCertificateModal.meritRank || 1}</p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 italic">
                Se expide la presente a solicitud del(de la) interesado(a) para los fines de Matrícula Académica y expedición de carné de educación superior tecnológica conforme a la Ley N° 30512.
              </p>
            </div>

            {/* Certificate Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-200 text-center text-xs">
              <div>
                <div className="w-36 h-12 mx-auto border-b border-slate-400 flex items-center justify-center">
                  <span className="font-serif italic text-slate-400 text-xs">[Firma Digital RENIEC]</span>
                </div>
                <p className="font-bold text-slate-800 mt-1">Lic. Emerita Vásquez Suárez</p>
                <p className="text-[10px] text-slate-500">Trámite Documentario y Admisión</p>
              </div>

              <div>
                <div className="w-36 h-12 mx-auto border-b border-slate-400 flex items-center justify-center">
                  <span className="font-serif italic text-slate-400 text-xs">[V° B° Rectoral]</span>
                </div>
                <p className="font-bold text-slate-800 mt-1">Lic. Elmer Torres Peres</p>
                <p className="text-[10px] text-slate-500">Director General - IESTP ITMANV</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-between items-center print:hidden pt-4 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-mono">
                Cód. Verificación: ITMAN-ADM-2026-{showCertificateModal.docNumber}
              </span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                <Printer className="w-4 h-4" /> Imprimir Constancia A4
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expediente Modal */}
      {viewingApplicant && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Expediente Digital de Postulante
              </h3>
              <button 
                onClick={() => setViewingApplicant(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-sm text-slate-900">{viewingApplicant.fullName}</p>
                <p className="text-slate-600 font-mono mt-0.5">
                  {viewingApplicant.docType}: {viewingApplicant.docNumber} • Tel: {viewingApplicant.phone}
                </p>
                <p className="text-blue-700 font-semibold mt-1">
                  Carrera: {viewingApplicant.careerName}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-1.5">Documentos Cotejados:</h4>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Copia legible de {viewingApplicant.docType} (Cotejado en RENIEC/Migraciones)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Certificado Oficial de Estudios de Educación Secundaria (SIAGIE)
                  </li>
                  {viewingApplicant.modality !== 'ORDINARIO' && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      Acreditación de Modalidad: {viewingApplicant.modalityDetail || 'Documento oficial en archivo'}
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Declaración Jurada de no registrar antecedentes penales
                  </li>
                </ul>
              </div>

              {viewingApplicant.reviewNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                  <strong>Dictamen de Trámite Documentario:</strong> {viewingApplicant.reviewNotes}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingApplicant(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
