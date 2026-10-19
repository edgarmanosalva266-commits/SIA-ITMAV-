import React, { useState } from 'react';
import { Career, Student, Applicant, TreasuryPayment, GradeRecord, SunatInvoice } from '../types';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Signature
} from 'lucide-react';

interface DirectorDashboardProps {
  careers: Career[];
  students: Student[];
  applicants: Applicant[];
  treasury: TreasuryPayment[];
  grades: GradeRecord[];
  invoices: SunatInvoice[];
  onNavigateToModule: (moduleId: string) => void;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  careers,
  students,
  applicants,
  treasury,
  grades,
  invoices,
  onNavigateToModule
}) => {
  const [signedResolution, setSignedResolution] = useState(false);

  // Statistics
  const totalStudents = students.length;
  const totalApplicants = applicants.length;
  const approvedApplicants = applicants.filter(a => a.status === 'APROBADO').length;

  const totalCollected = treasury
    .filter(t => t.status === 'PAGADO')
    .reduce((acc, t) => acc + t.paidAmount, 0);

  const totalOverdue = treasury
    .filter(t => t.status === 'VENCIDO')
    .reduce((acc, t) => acc + (t.totalDue - t.paidAmount), 0);

  const totalInvoicesAmount = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Banner Rectoral */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-red-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest bg-red-950/60 border border-red-800 px-3 py-1 rounded-full">
            Despacho Rectoral • Dirección General
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
            Lic. Elmer Torres Peres
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            Supervisión integral institucional, control de licenciamiento tecnológico MINEDU (Ley 30512), aprobación de actas oficiales de notas y cumplimiento tributario SUNAT.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => {
              setSignedResolution(true);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {signedResolution ? 'R.D. N° 014-2026 Refrendada ✓' : 'Firmar R.D. 2026-I'}
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateToModule('admission')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-red-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Admisión 2026-I</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {approvedApplicants} <span className="text-xs font-normal text-slate-500">/ {totalApplicants} inscritos</span>
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
            Revisado por Lic. Emerita Vásquez
          </span>
        </div>

        <div 
          onClick={() => onNavigateToModule('enrollment')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-red-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Matrículas Activas</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {totalStudents} Alumnos
          </p>
          <span className="text-[11px] text-indigo-700 font-semibold block mt-1">
            Supervisado por Lic. Oscar Ortiz
          </span>
        </div>

        <div 
          onClick={() => onNavigateToModule('treasury')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-red-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Recaudación de Pensiones</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            S/. {totalCollected.toFixed(2)}
          </p>
          <span className="text-[11px] text-rose-600 font-semibold block mt-1">
            Mora por cobrar: S/. {totalOverdue.toFixed(2)}
          </span>
        </div>

        <div 
          onClick={() => onNavigateToModule('sunat')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-red-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Facturación SUNAT</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-800 mt-2">
            {invoices.length} Boletas
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
            100% Validadas con CDR SUNAT
          </span>
        </div>
      </div>

      {/* Program Academic Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600" />
              Aforo y Ocupación por Carreras Profesionales
            </h4>
            <span className="text-xs text-slate-500">R.M. 0418-94-ED</span>
          </div>

          <div className="space-y-3">
            {careers.map((career) => {
              const enrolled = career.totalVacancies - career.availableVacancies;
              const pct = Math.round((enrolled / career.totalVacancies) * 100);

              return (
                <div key={career.id} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-slate-800">{career.name}</span>
                    <span className="text-slate-600 font-mono">{enrolled} / {career.totalVacancies} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-600 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legal Resolutions in Effect */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              Resoluciones Directorales Emitidas (Periodo 2026)
            </h4>
            <span className="text-xs font-mono font-bold text-slate-500">ITMANV</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                R.D.
              </div>
              <div>
                <p className="font-bold text-slate-900">R.D. N° 008-2026-DG/IESTP-ITMAN</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Aprueba el Calendario Académico 2026-I y el cronograma del Proceso de Admisión en sus 7 modalidades conforme a la Ley 30512.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                R.D.
              </div>
              <div>
                <p className="font-bold text-slate-900">R.D. N° 012-2026-DG/IESTP-ITMAN</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Designa al comité de evaluación del concurso de admisión presidido por la Lic. Emerita Vásquez Suárez.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                R.D.
              </div>
              <div>
                <p className="font-bold text-slate-900">R.D. N° 014-2026-DG/IESTP-ITMAN</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Aprueba los aranceles institucionales, escala de pensiones y el régimen de emisión electrónica SUNAT SEE UBL 2.1.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
