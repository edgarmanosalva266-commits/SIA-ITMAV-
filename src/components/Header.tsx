import React from 'react';
import { InstitutionalLogo } from './InstitutionalLogo';
import { StaffUser, RoleType } from '../types';
import { INITIAL_STAFF } from '../data/initialData';
import { 
  Shield, 
  UserCheck, 
  GraduationCap, 
  ReceiptText, 
  Briefcase, 
  User, 
  ChevronDown,
  Layers,
  CalendarClock,
  FileSpreadsheet,
  FileCheck2,
  Database
} from 'lucide-react';

interface HeaderProps {
  currentRole: RoleType;
  onSelectRole: (role: RoleType) => void;
  activeModule: string;
  onSelectModule: (module: string) => void;
  firebaseOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  activeModule,
  onSelectModule,
  firebaseOnline
}) => {
  const currentStaff = INITIAL_STAFF.find(s => s.role === currentRole) || INITIAL_STAFF[0];

  const roleIcons: Record<RoleType, React.ElementType> = {
    DIRECTOR: Shield,
    TRAMITE_DOCUMENTARIO: UserCheck,
    GESTION_ACADEMICA: GraduationCap,
    TESORERIA: ReceiptText,
    DOCENTE: Briefcase,
    ESTUDIANTE: User,
  };

  const Icon = roleIcons[currentRole];

  const navItems = [
    { id: 'architecture', label: 'Arquitectura & Reglas SIA', icon: Layers, badge: 'Ley 30512' },
    { id: 'admission', label: 'Admisión', icon: UserCheck, badge: '7 Modalidades' },
    { id: 'enrollment', label: 'Matrículas', icon: GraduationCap, badge: 'Prerrequisitos' },
    { id: 'grades', label: 'Notas & Actas', icon: FileSpreadsheet, badge: 'LAG MINEDU' },
    { id: 'schedules', label: 'Horarios', icon: CalendarClock, badge: 'Anti-Cruces' },
    { id: 'treasury', label: 'Tesorería', icon: ReceiptText, badge: 'Morosidad' },
    { id: 'sunat', label: 'Facturación SUNAT', icon: FileCheck2, badge: 'UBL 2.1' },
    { id: 'teacher_portal', label: 'Portal Docente', icon: Briefcase },
    { id: 'student_portal', label: 'Portal Estudiante', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Upper Navigation & Brand */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Official Logo */}
          <InstitutionalLogo size="md" />

          {/* Role Switcher & Database Status */}
          <div className="flex items-center gap-3">
            {/* Firebase Live Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-[11px] font-semibold">
              <span className={`w-2 h-2 rounded-full ${firebaseOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <Database className="w-3.5 h-3.5 text-amber-700" />
              <span>Firebase Firestore Enterprise</span>
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-extrabold text-slate-900 leading-tight">
                    {currentStaff.name}
                  </p>
                  <p className="text-[10.5px] text-red-700 font-semibold leading-tight">
                    {currentStaff.title}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 hidden group-hover:block transition-all z-50">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Cambiar Rol Activo (Roles Requeridos)
                  </p>
                </div>
                {INITIAL_STAFF.map((staff) => {
                  const StaffIcon = roleIcons[staff.role];
                  const isCurrent = staff.role === currentRole;

                  return (
                    <button
                      key={staff.id}
                      onClick={() => onSelectRole(staff.role)}
                      className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                        isCurrent ? 'bg-red-50 text-red-900' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCurrent ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <StaffIcon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">{staff.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{staff.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Lower Module Tabs Scrollable Bar */}
        <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-100 text-xs">
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <ItemIcon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
