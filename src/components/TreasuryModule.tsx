import React, { useState, useMemo } from 'react';
import { TreasuryPayment, Student, SunatInvoice } from '../types';
import { 
  ReceiptText, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  CreditCard, 
  DollarSign, 
  Clock, 
  FileText, 
  Plus, 
  X,
  ShieldCheck,
  Send,
  Download,
  Calendar,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Users,
  Eye,
  FileCheck
} from 'lucide-react';
import { exportTreasuryPaymentPdf, exportBoletaSunatPdf } from '../services/pdfReportService';

interface TreasuryProps {
  treasury: TreasuryPayment[];
  students: Student[];
  invoices?: SunatInvoice[];
  onSavePayment: (payment: TreasuryPayment) => Promise<void>;
  onEmitInvoiceFromPayment: (payment: TreasuryPayment) => Promise<SunatInvoice | void>;
  onNavigateToModule?: (module: string) => void;
  currentUserRole: string;
}

const COMMON_CONCEPTS = [
  'Pensión Cuota 01/05 - Periodo 2026-I',
  'Pensión Cuota 02/05 - Periodo 2026-I',
  'Pensión Cuota 03/05 - Periodo 2026-I',
  'Pensión Cuota 04/05 - Periodo 2026-I',
  'Pensión Cuota 05/05 - Periodo 2026-I',
  'Derecho de Matrícula Regular 2026-I',
  'Constancia de Estudios y Matrícula',
  'Certificado Oficial Modular por Competencias',
  'Examen de Subsanación / Recuperación',
  'Carné de Medio Pasaje Estudiantil',
  'Trámite de Grado y Titulación Profesional'
];

export const TreasuryModule: React.FC<TreasuryProps> = ({
  treasury,
  students,
  invoices = [],
  onSavePayment,
  onEmitInvoiceFromPayment,
  onNavigateToModule,
  currentUserRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDIENTE' | 'PAGADO' | 'VENCIDO'>('ALL');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Modal 1: Process Payment on existing pending/overdue item
  const [payingItem, setPayingItem] = useState<TreasuryPayment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<TreasuryPayment['paymentMethod']>('TRANSFERENCIA');
  const [paymentReference, setPaymentReference] = useState('');
  const [customPaidAmount, setCustomPaidAmount] = useState<number>(0);

  // Modal 2: Direct Payment in cashier (Registrar Pago Directo)
  const [showDirectPaymentModal, setShowDirectPaymentModal] = useState(false);
  const [directStudentId, setDirectStudentId] = useState<string>(students[0]?.id || '');
  const [directConcept, setDirectConcept] = useState<string>(COMMON_CONCEPTS[0]);
  const [directCustomConcept, setDirectCustomConcept] = useState<string>('');
  const [directAmount, setDirectAmount] = useState<number>(320);
  const [directMethod, setDirectMethod] = useState<TreasuryPayment['paymentMethod']>('EFECTIVO');
  const [directReference, setDirectReference] = useState('');

  // Modal 3: Add new Cuota / Obligation (Agregar Cuota)
  const [showAddCuotaModal, setShowAddCuotaModal] = useState(false);
  const [cuotaStudentId, setCuotaStudentId] = useState<string>(students[0]?.id || '');
  const [cuotaConcept, setCuotaConcept] = useState<string>(COMMON_CONCEPTS[0]);
  const [cuotaCustomConcept, setCuotaCustomConcept] = useState<string>('');
  const [cuotaAmount, setCuotaAmount] = useState<number>(320);
  const [cuotaDueDate, setCuotaDueDate] = useState<string>('2026-03-31');
  const [cuotaPeriod, setCuotaPeriod] = useState<string>('2026-I');

  // Modal 4: Batch Schedule Generator (Cronograma Completo 5 Cuotas)
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchStudentId, setBatchStudentId] = useState<string>('ALL');
  const [batchMonthlyFee, setBatchMonthlyFee] = useState<number>(320);

  // Modal 5: View Electronic Invoice Details
  const [viewingInvoice, setViewingInvoice] = useState<SunatInvoice | null>(null);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Statistics
  const totalCollected = useMemo(() => {
    return treasury
      .filter(t => t.status === 'PAGADO')
      .reduce((acc, curr) => acc + curr.paidAmount, 0);
  }, [treasury]);

  const totalDelinquent = useMemo(() => {
    return treasury
      .filter(t => t.status === 'VENCIDO')
      .reduce((acc, curr) => acc + (curr.totalDue - curr.paidAmount), 0);
  }, [treasury]);

  const delinquentStudentsCount = useMemo(() => {
    return new Set(treasury.filter(t => t.status === 'VENCIDO').map(t => t.studentId)).size;
  }, [treasury]);

  const paidItems = useMemo(() => treasury.filter(t => t.status === 'PAGADO'), [treasury]);
  
  // Cross-reference with Facturación Module (invoices)
  const syncedWithInvoicesCount = useMemo(() => {
    return paidItems.filter(p => 
      Boolean(p.invoiceNumber) || 
      invoices.some(inv => inv.receiverDocNumber === p.docNumber && Math.abs(inv.totalAmount - p.paidAmount) < 0.01)
    ).length;
  }, [paidItems, invoices]);

  // Filtered Treasury Items
  const filteredTreasury = useMemo(() => {
    return treasury.filter(t => {
      const matchesSearch = t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.docNumber.includes(searchTerm) ||
                            t.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (t.invoiceNumber && t.invoiceNumber.includes(searchTerm));
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [treasury, searchTerm, statusFilter]);

  // Open modal to pay existing item
  const handleOpenPayItem = (item: TreasuryPayment) => {
    setPayingItem(item);
    setPaymentMethod('TRANSFERENCIA');
    setPaymentReference('');
    setCustomPaidAmount(item.totalDue);
  };

  // Process payment on an existing pending/overdue quota
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingItem) return;

    try {
      const amountToPay = customPaidAmount > 0 ? customPaidAmount : payingItem.totalDue;
      const updatedPayment: TreasuryPayment = {
        ...payingItem,
        status: 'PAGADO',
        paidAmount: amountToPay,
        paymentDate: new Date().toLocaleString('es-PE'),
        paymentMethod
      };

      await onSavePayment(updatedPayment);

      // Automated SUNAT invoice emission & synchronization with Facturación
      const emitted = await onEmitInvoiceFromPayment(updatedPayment);

      setPayingItem(null);
      setToast({
        type: 'success',
        message: `¡Pago registrado exitosamente! Se emitió la Boleta Electrónica SUNAT ${emitted && 'number' in emitted ? `B001-${emitted.number}` : 'B001'} y se sincronizó con el módulo de Facturación.`
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: `Error al procesar el pago: ${err instanceof Error ? err.message : String(err)}`
      });
    }
  };

  // Process Direct Payment (e.g. in Cashier / Ventanilla)
  const handleSaveDirectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === directStudentId);
    if (!student) {
      setToast({ type: 'error', message: 'Debe seleccionar un estudiante válido.' });
      return;
    }

    const conceptFinal = directConcept === 'OTRO' ? directCustomConcept.trim() : directConcept;
    if (!conceptFinal) {
      setToast({ type: 'error', message: 'Debe especificar el concepto del pago.' });
      return;
    }

    if (directAmount <= 0) {
      setToast({ type: 'error', message: 'El monto a cobrar debe ser mayor a 0.' });
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const newDirectPayment: TreasuryPayment = {
        id: `pay-direct-${Date.now()}`,
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: student.fullName,
        docNumber: student.docNumber,
        concept: conceptFinal,
        period: '2026-I',
        amount: Number(directAmount),
        dueDate: today,
        lateFee: 0,
        totalDue: Number(directAmount),
        paidAmount: Number(directAmount),
        paymentDate: new Date().toLocaleString('es-PE'),
        paymentMethod: directMethod,
        status: 'PAGADO'
      };

      await onSavePayment(newDirectPayment);

      // Sincronizar automáticamente con el módulo de Facturación
      const emitted = await onEmitInvoiceFromPayment(newDirectPayment);

      setShowDirectPaymentModal(false);
      setDirectCustomConcept('');
      setDirectReference('');
      setToast({
        type: 'success',
        message: `Cobro en ventanilla registrado para ${student.fullName}. Boleta SUNAT ${emitted && 'number' in emitted ? `B001-${emitted.number}` : 'B001'} sincronizada con Facturación.`
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: `Error al registrar pago directo: ${err instanceof Error ? err.message : String(err)}`
      });
    }
  };

  // Add new Cuota / Obligation
  const handleSaveNewCuota = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === cuotaStudentId);
    if (!student) {
      setToast({ type: 'error', message: 'Debe seleccionar un estudiante registrado.' });
      return;
    }

    const conceptFinal = cuotaConcept === 'OTRO' ? cuotaCustomConcept.trim() : cuotaConcept;
    if (!conceptFinal) {
      setToast({ type: 'error', message: 'El concepto de la cuota es obligatorio.' });
      return;
    }

    if (cuotaAmount <= 0) {
      setToast({ type: 'error', message: 'El monto de la cuota debe ser mayor a 0.' });
      return;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const isPastDue = new Date(cuotaDueDate).getTime() < new Date(todayStr).getTime();
      const lateFee = isPastDue ? 5 : 0;
      const totalDue = Number(cuotaAmount) + lateFee;
      const status: TreasuryPayment['status'] = isPastDue ? 'VENCIDO' : 'PENDIENTE';

      const newObligation: TreasuryPayment = {
        id: `cuota-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: student.fullName,
        docNumber: student.docNumber,
        concept: conceptFinal,
        period: cuotaPeriod || '2026-I',
        amount: Number(cuotaAmount),
        dueDate: cuotaDueDate,
        lateFee,
        totalDue,
        paidAmount: 0,
        status
      };

      await onSavePayment(newObligation);
      setShowAddCuotaModal(false);
      setCuotaCustomConcept('');
      setToast({
        type: 'success',
        message: `Nueva cuota "${conceptFinal}" (S/. ${totalDue.toFixed(2)}) asignada con éxito a ${student.fullName}.`
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: `Error al agregar cuota: ${err instanceof Error ? err.message : String(err)}`
      });
    }
  };

  // Generate batch schedule (5 quotas) for 2026-I
  const handleGenerateBatchSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudents = batchStudentId === 'ALL'
      ? students
      : students.filter(s => s.id === batchStudentId);

    if (targetStudents.length === 0) {
      setToast({ type: 'error', message: 'No hay estudiantes seleccionados para generar el cronograma.' });
      return;
    }

    try {
      const quotaSchedule = [
        { num: '01/05', due: '2026-03-31' },
        { num: '02/05', due: '2026-04-30' },
        { num: '03/05', due: '2026-05-31' },
        { num: '04/05', due: '2026-06-30' },
        { num: '05/05', due: '2026-07-31' }
      ];

      let generatedCount = 0;
      for (const std of targetStudents) {
        for (const q of quotaSchedule) {
          const concept = `Pensión Cuota ${q.num} - Periodo 2026-I`;
          // Check if already exists
          const exists = treasury.some(t => t.studentId === std.id && t.concept === concept);
          if (!exists) {
            const todayStr = new Date().toISOString().split('T')[0];
            const isPastDue = new Date(q.due).getTime() < new Date(todayStr).getTime();
            const lateFee = isPastDue ? 5 : 0;
            const totalDue = Number(batchMonthlyFee) + lateFee;
            const status: TreasuryPayment['status'] = isPastDue ? 'VENCIDO' : 'PENDIENTE';

            const item: TreasuryPayment = {
              id: `cuota-${std.id}-${q.num.replace('/', '-')}`,
              studentId: std.id,
              studentCode: std.studentCode,
              studentName: std.fullName,
              docNumber: std.docNumber,
              concept,
              period: '2026-I',
              amount: Number(batchMonthlyFee),
              dueDate: q.due,
              lateFee,
              totalDue,
              paidAmount: 0,
              status
            };
            await onSavePayment(item);
            generatedCount++;
          }
        }
      }

      setShowBatchModal(false);
      setToast({
        type: 'success',
        message: `Cronograma de cuotas 2026-I generado con éxito (${generatedCount} nuevas cuotas asignadas).`
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: `Error al generar cronograma: ${err instanceof Error ? err.message : String(err)}`
      });
    }
  };

  // Re-synchronize missing paid items with Facturación
  const handleSyncMissingInvoices = async () => {
    const unInvoiced = paidItems.filter(p => !p.invoiceNumber && !invoices.some(inv => inv.receiverDocNumber === p.docNumber && Math.abs(inv.totalAmount - p.paidAmount) < 0.01));
    if (unInvoiced.length === 0) {
      setToast({
        type: 'info',
        message: 'Todos los pagos registrados ya cuentan con su Boleta Electrónica sincronizada en Facturación.'
      });
      return;
    }

    try {
      let count = 0;
      for (const p of unInvoiced) {
        await onEmitInvoiceFromPayment(p);
        count++;
      }
      setToast({
        type: 'success',
        message: `Se sincronizaron ${count} comprobante(s) electrónico(s) faltante(s) con el módulo de Facturación SUNAT.`
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: `Error en la sincronización: ${err instanceof Error ? err.message : String(err)}`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold transition-all shadow-md ${
          toast.type === 'error'
            ? 'border-red-500 bg-red-950 text-red-200'
            : toast.type === 'info'
              ? 'border-blue-500 bg-blue-950 text-blue-200'
              : 'border-emerald-500 bg-emerald-950 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 hover:opacity-80">✕</button>
        </div>
      )}

      {/* Banner & Action Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-100 text-rose-800 rounded-lg shrink-0">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Módulo de Tesorería, Pensiones & Alertas de Morosidad
            </h3>
            <p className="text-xs text-slate-500">
              Gestión arancelaria, registro de cobros, programación de cuotas y sincronización en tiempo real con Facturación SUNAT
            </p>
          </div>
        </div>

        {/* Action Buttons: Registrar Pago, Agregar Cuota, Cronograma */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowDirectPaymentModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            title="Registrar cobro directo en ventanilla y emitir comprobante SUNAT"
          >
            <CreditCard className="w-4 h-4" />
            + Registrar Pago Directo
          </button>

          <button
            onClick={() => setShowAddCuotaModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            title="Agregar nueva cuota u obligación arancelaria a un estudiante"
          >
            <Plus className="w-4 h-4" />
            + Agregar Cuota
          </button>

          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            title="Generar cronograma de 5 cuotas del ciclo 2026-I"
          >
            <Calendar className="w-4 h-4" />
            Cronograma 2026-I
          </button>
        </div>
      </div>

      {/* Sincronización en Tiempo Real con Módulo Facturación */}
      <div className="bg-purple-50/80 border border-purple-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 text-purple-800 rounded-lg shrink-0">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900">
                Sincronización con Módulo de Facturación Electrónica SUNAT
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Enlace Activo
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              <strong className="text-purple-900">{invoices.length} Comprobantes</strong> emitidos en Facturación • <strong className="text-emerald-800">{syncedWithInvoicesCount} de {paidItems.length}</strong> pagos conciliados con Boletas B001 con firma digital SHA-256.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {paidItems.length > syncedWithInvoicesCount && (
            <button
              onClick={handleSyncMissingInvoices}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs"
              title="Sincronizar pagos pagados que no tienen boleta electrónica"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sincronizar Pendientes ({paidItems.length - syncedWithInvoicesCount})
            </button>
          )}

          {onNavigateToModule && (
            <button
              onClick={() => onNavigateToModule('sunat')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ir a Facturación SUNAT
            </button>
          )}
        </div>
      </div>

      {/* Financial Health & Morosity Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Recaudación Total (2026-I)</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            S/. {totalCollected.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Ingresos conciliados con boletas SUNAT
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Cartera Pesada / Morosidad</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700 mt-1">
            S/. {totalDelinquent.toFixed(2)}
          </p>
          <span className="text-[11px] text-rose-600 mt-1 block font-medium">
            {delinquentStudentsCount} estudiante(s) con morosidad
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Recargo Moratorio Configurado</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            S/. 5.00 <span className="text-xs font-normal text-slate-500">/ por cuota vencida</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Plazo de gracia: 5 días tras vencimiento
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Facturación Electrónica</span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">
            {invoices.length} <span className="text-xs font-normal text-slate-500">comprobantes</span>
          </p>
          <span className="text-[11px] text-purple-600 mt-1 block font-medium">
            Series B001 y F001 con CDR autorizado
          </span>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por alumno, código SIA, DNI, concepto o N° Boleta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {(['ALL', 'PENDIENTE', 'PAGADO', 'VENCIDO'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Treasury Obligations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Estudiante / Código</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Concepto Arancelario</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4 text-right">Monto Base</th>
                <th className="py-3 px-4 text-right">Mora</th>
                <th className="py-3 px-4 text-right">Total a Pagar</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Comprobante SUNAT</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTreasury.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No se encontraron obligaciones de pago con el criterio seleccionado.
                  </td>
                </tr>
              ) : (
                filteredTreasury.map((item) => {
                  const isPaid = item.status === 'PAGADO';
                  const isOverdue = item.status === 'VENCIDO';
                  
                  // Match with invoice if available
                  const matchedInvoice = invoices.find(inv => 
                    (item.invoiceNumber && inv.number === item.invoiceNumber) ||
                    (inv.receiverDocNumber === item.docNumber && Math.abs(inv.totalAmount - item.paidAmount) < 0.01)
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{item.studentName}</p>
                        <span className="font-mono text-[11px] text-slate-500">{item.studentCode}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {item.docNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.concept}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {item.dueDate}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        S/. {item.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600 font-semibold">
                        {item.lateFee > 0 ? `S/. ${item.lateFee.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        S/. {item.totalDue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Pagado
                          </span>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> Vencido
                          </span>
                        )}
                        {item.status === 'PENDIENTE' && (
                          <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                            Por Vencer
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {isPaid ? (
                          <div className="flex flex-col items-center">
                            <span 
                              onClick={() => {
                                if (matchedInvoice) setViewingInvoice(matchedInvoice);
                              }}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border cursor-pointer ${
                                matchedInvoice 
                                  ? 'text-purple-800 bg-purple-50 border-purple-200 hover:bg-purple-100' 
                                  : 'text-slate-600 bg-slate-100 border-slate-200'
                              }`}
                              title={matchedInvoice ? "Ver detalle de Boleta SUNAT en Facturación" : "Comprobante emitido"}
                            >
                              {matchedInvoice ? `${matchedInvoice.series}-${matchedInvoice.number}` : (item.invoiceNumber ? `B001-${item.invoiceNumber}` : 'B001')}
                            </span>
                            <span className="text-[9px] text-emerald-600 font-sans font-semibold">
                              Sincronizado
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-sans">
                            Pendiente emisión
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isPaid ? (
                          <button
                            onClick={() => handleOpenPayItem(item)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold shadow-xs ml-auto transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Registrar Pago
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {matchedInvoice && (
                              <button
                                onClick={() => setViewingInvoice(matchedInvoice)}
                                title="Ver comprobante electrónico SUNAT"
                                className="p-1 text-purple-700 hover:bg-purple-50 border border-purple-200 rounded text-[11px] transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const student = students.find(s => s.id === item.studentId);
                                exportTreasuryPaymentPdf(item, student);
                                setToast({
                                  type: 'info',
                                  message: `Descargando Boleta de Pago en PDF para ${item.studentName}...`
                                });
                              }}
                              title="Descargar Boleta de Pago en PDF"
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <Download className="w-3 h-3 text-emerald-700" /> Boleta PDF
                            </button>
                          </div>
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

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR PAGO SOBRE OBLIGACIÓN EXISTENTE                       */}
      {/* ========================================================================= */}
      {payingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Registrar Pago y Sincronizar Facturación
              </h3>
              <button 
                onClick={() => setPayingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4 mt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900">{payingItem.studentName}</p>
                <p className="text-slate-500 font-mono mt-0.5">Código: {payingItem.studentCode} • DNI: {payingItem.docNumber}</p>
                <p className="text-slate-800 font-semibold mt-1">{payingItem.concept}</p>
                {payingItem.lateFee > 0 && (
                  <p className="text-rose-600 font-semibold mt-0.5">
                    Monto base: S/. {payingItem.amount.toFixed(2)} + Mora vencida: S/. {payingItem.lateFee.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex justify-between items-center text-emerald-950">
                <div>
                  <span className="text-[11px] text-emerald-800 font-medium">Total a Cancelar:</span>
                  <p className="text-xs text-emerald-700">Monto total de la obligación</p>
                </div>
                <p className="text-2xl font-extrabold font-mono text-emerald-800">
                  S/. {payingItem.totalDue.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Medio de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as TreasuryPayment['paymentMethod'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-red-500"
                >
                  <option value="TRANSFERENCIA">Transferencia Bancaria (BCP / BBVA / Interbank / BN)</option>
                  <option value="YAPE_PLIN">Billetera Digital (Yape / Plin)</option>
                  <option value="TARJETA">Tarjeta de Débito / Crédito (Visa / Mastercard)</option>
                  <option value="EFECTIVO">Efectivo en Ventanilla ITMANV</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  N° de Operación / Voucher / Referencia (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: OP-849201"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  Sincronización Automática con Facturación SUNAT
                </div>
                Al confirmar, el sistema emitirá la <strong>Boleta Electrónica Serie B001</strong> con código Hash SHA-256 y CDR autorizado, sincronizándola en tiempo real con el módulo de Facturación.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingItem(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Cobrar y Sincronizar Boleta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTRAR PAGO DIRECTO EN VENTANILLA                            */}
      {/* ========================================================================= */}
      {showDirectPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Registrar Pago Directo en Ventanilla
              </h3>
              <button 
                onClick={() => setShowDirectPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDirectPayment} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Seleccionar Estudiante
                </label>
                <select
                  value={directStudentId}
                  onChange={(e) => setDirectStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-red-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.studentCode}] {s.fullName} - {s.careerName} (DNI: {s.docNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Concepto Arancelario
                </label>
                <select
                  value={directConcept}
                  onChange={(e) => setDirectConcept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-red-500 mb-2"
                >
                  {COMMON_CONCEPTS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="OTRO">Otro concepto personalizado...</option>
                </select>

                {directConcept === 'OTRO' && (
                  <input
                    type="text"
                    placeholder="Escriba la descripción del concepto a cobrar..."
                    value={directCustomConcept}
                    onChange={(e) => setDirectCustomConcept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-red-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Monto a Cobrar (S/.)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="1"
                    value={directAmount}
                    onChange={(e) => setDirectAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Medio de Pago
                  </label>
                  <select
                    value={directMethod}
                    onChange={(e) => setDirectMethod(e.target.value as TreasuryPayment['paymentMethod'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-red-500"
                  >
                    <option value="EFECTIVO">Efectivo en Ventanilla</option>
                    <option value="YAPE_PLIN">Billetera Digital (Yape / Plin)</option>
                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                    <option value="TARJETA">Tarjeta de Débito / Crédito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  N° de Operación / Voucher / Referencia (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: OP-994821"
                  value={directReference}
                  onChange={(e) => setDirectReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  Emisión en Facturación Electrónica SUNAT
                </div>
                Este cobro se registrará como <strong>PAGADO</strong> y emitirá una nueva <strong>Boleta Electrónica SUNAT Serie B001</strong> con código QR y CDR autorizado de manera inmediata en el módulo de Facturación.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDirectPaymentModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Registrar Cobro y Emitir Boleta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AGREGAR CUOTA / OBLIGACIÓN (Cronograma Individual)              */}
      {/* ========================================================================= */}
      {showAddCuotaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Agregar Cuota u Obligación Arancelaria
              </h3>
              <button 
                onClick={() => setShowAddCuotaModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCuota} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estudiante Asignado
                </label>
                <select
                  value={cuotaStudentId}
                  onChange={(e) => setCuotaStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.studentCode}] {s.fullName} - {s.careerName} (DNI: {s.docNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Concepto de la Cuota
                </label>
                <select
                  value={cuotaConcept}
                  onChange={(e) => setCuotaConcept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-indigo-500 mb-2"
                >
                  {COMMON_CONCEPTS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="OTRO">Otro concepto personalizado...</option>
                </select>

                {cuotaConcept === 'OTRO' && (
                  <input
                    type="text"
                    placeholder="Descripción de la nueva cuota u obligación..."
                    value={cuotaCustomConcept}
                    onChange={(e) => setCuotaCustomConcept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Monto Base (S/.)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="1"
                    value={cuotaAmount}
                    onChange={(e) => setCuotaAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={cuotaDueDate}
                    onChange={(e) => setCuotaDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Periodo Académico
                  </label>
                  <input
                    type="text"
                    value={cuotaPeriod}
                    onChange={(e) => setCuotaPeriod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-center">
                  <span className="text-[11px] text-slate-500 font-medium">Estado inicial estimado:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {new Date(cuotaDueDate).getTime() < new Date().getTime() 
                      ? 'VENCIDO (+S/. 5.00 mora)' 
                      : 'PENDIENTE (Por vencer)'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCuotaModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Asignar Cuota al Cronograma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: GENERAR CRONOGRAMA COMPLETO 2026-I (5 CUOTAS)                   */}
      {/* ========================================================================= */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-800" />
                Generador de Cronograma de Pensiones 2026-I
              </h3>
              <button 
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBatchSchedule} className="space-y-4 mt-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Esta acción creará automáticamente las <strong>5 cuotas mensuales de pensión de enseñanza</strong> para el semestre regular <strong>2026-I</strong>:
              </p>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between"><span>• Cuota 01/05:</span><span className="font-bold">Vence: 31/03/2026</span></div>
                <div className="flex justify-between"><span>• Cuota 02/05:</span><span className="font-bold">Vence: 30/04/2026</span></div>
                <div className="flex justify-between"><span>• Cuota 03/05:</span><span className="font-bold">Vence: 31/05/2026</span></div>
                <div className="flex justify-between"><span>• Cuota 04/05:</span><span className="font-bold">Vence: 30/06/2026</span></div>
                <div className="flex justify-between"><span>• Cuota 05/05:</span><span className="font-bold">Vence: 31/07/2026</span></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alcance de Asignación
                </label>
                <select
                  value={batchStudentId}
                  onChange={(e) => setBatchStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-slate-500"
                >
                  <option value="ALL">Para TODOS los estudiantes registrados ({students.length} estudiantes)</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      Solo para [{s.studentCode}] {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monto Mensual por Cuota (S/.)
                </label>
                <input
                  type="number"
                  step="10"
                  min="50"
                  value={batchMonthlyFee}
                  onChange={(e) => setBatchMonthlyFee(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" /> Generar Cronograma de Cuotas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DETALLE DE BOLETA ELECTRÓNICA SUNAT SINCRONIZADA                 */}
      {/* ========================================================================= */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-purple-300 relative text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl shrink-0">
                  <ShieldCheck className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Comprobante Electrónico Sincronizado
                  </h3>
                  <p className="text-xs text-slate-500">
                    Boleta Electrónica: <strong>{viewingInvoice.series}-{viewingInvoice.number}</strong> • SUNAT ACEPTADO
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Emisor Institucional:</span>
                  <p className="font-bold text-slate-900">{viewingInvoice.issuerName}</p>
                  <p className="font-mono text-slate-600">RUC: {viewingInvoice.issuerRuc}</p>
                </div>
                <div>
                  <span className="text-slate-500 block">Adquirente / Estudiante:</span>
                  <p className="font-bold text-slate-900">{viewingInvoice.receiverName}</p>
                  <p className="font-mono text-slate-600">DNI/Doc: {viewingInvoice.receiverDocNumber}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2 grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Fecha de Emisión:</span>
                  <p className="font-bold">{viewingInvoice.issueDate} {viewingInvoice.issueTime}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Moneda:</span>
                  <p className="font-bold">PEN (S/.)</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Monto Total:</span>
                  <p className="font-bold text-emerald-700 text-sm">S/. {viewingInvoice.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1">
                <span className="text-[10px] font-bold text-slate-600 block">Ítems Arancelarios Facturados:</span>
                {viewingInvoice.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                    <span>{it.description}</span>
                    <span className="font-mono font-bold">S/. {it.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Hash SHA-256:</span>
                  <span className="text-[10px] font-mono font-bold text-purple-800">{viewingInvoice.hashSha256}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-extrabold">
                  {viewingInvoice.sunatStatus}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Sincronizado con módulo de Facturación SUNAT
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => exportBoletaSunatPdf(viewingInvoice)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar Boleta PDF (A4)
                </button>
                {onNavigateToModule && (
                  <button
                    onClick={() => {
                      setViewingInvoice(null);
                      onNavigateToModule('sunat');
                    }}
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Ver en Facturación
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
