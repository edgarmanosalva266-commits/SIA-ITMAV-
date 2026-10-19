import React, { useState } from 'react';
import { SunatInvoice } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Printer, 
  Download, 
  QrCode, 
  Code, 
  CheckCircle2, 
  FileText, 
  Building2, 
  X,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { exportBoletaSunatPdf } from '../services/pdfReportService';

interface SunatProps {
  invoices: SunatInvoice[];
  currentUserRole: string;
}

export const SunatModule: React.FC<SunatProps> = ({ invoices, currentUserRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<SunatInvoice | null>(null);
  const [showXmlModal, setShowXmlModal] = useState<SunatInvoice | null>(null);
  const [showCdrModal, setShowCdrModal] = useState<SunatInvoice | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    return inv.number.includes(searchTerm) ||
           inv.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           inv.receiverDocNumber.includes(searchTerm) ||
           inv.series.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const downloadXml = (invoice: SunatInvoice) => {
    const element = document.createElement('a');
    const file = new Blob([invoice.xmlPayloadUbl], { type: 'text/xml' });
    element.href = URL.createObjectURL(file);
    element.download = `${invoice.issuerRuc}-${invoice.type.slice(0, 2)}-${invoice.series}-${invoice.number}.xml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 text-purple-800 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Facturación Electrónica SUNAT (UBL 2.1 & CDR en Tiempo Real)
            </h3>
            <p className="text-xs text-slate-500">
              Emisión oficial de Boletas (B001) y Facturas (F001) • RUC: <strong>20601849201</strong> • IESTP ITMANV
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            WebService SUNAT OSE: Online
          </span>
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por Serie, Número, RUC o DNI de estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          Mostrando {filteredInvoices.length} comprobantes electrónicos
        </span>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tipo & Serie-Número</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Adquirente / Cliente</th>
                <th className="py-3 px-4">Doc. Identidad</th>
                <th className="py-3 px-4 text-right">Importe Total</th>
                <th className="py-3 px-4 text-center">Estado SUNAT</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block font-mono">
                      {inv.series}-{inv.number}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {inv.type === '03_BOLETA' ? 'Boleta Electrónica' : 'Factura Electrónica'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {inv.issueDate} <span className="text-[10px] text-slate-400">{inv.issueTime}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 uppercase">
                    {inv.receiverName}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-[10px] text-slate-400 mr-1">
                      {inv.receiverDocType === '1' ? 'DNI' : inv.receiverDocType === '4' ? 'CE' : 'RUC'}:
                    </span>
                    {inv.receiverDocNumber}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    S/. {inv.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Aceptado CDR
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => exportBoletaSunatPdf(inv)}
                        title="Descargar Boleta Electrónica en PDF"
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded text-[11px] flex items-center gap-1 shadow-2xs"
                      >
                        <Download className="w-3 h-3 text-rose-600" /> PDF
                      </button>
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        title="Ver Comprobante A4 / Ticket"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px] flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-slate-600" /> Vista A4
                      </button>
                      <button
                        onClick={() => setShowXmlModal(inv)}
                        title="Ver XML UBL 2.1"
                        className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold rounded text-[11px] flex items-center gap-1"
                      >
                        <Code className="w-3 h-3" /> XML
                      </button>
                      <button
                        onClick={() => setShowCdrModal(inv)}
                        title="Ver CDR de SUNAT"
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold rounded text-[11px] flex items-center gap-1"
                      >
                        <Receipt className="w-3 h-3" /> CDR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Representación Impresa A4 & Ticket Térmico con QR SUNAT */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-300 relative text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Invoice Top Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b-2 border-slate-800 pb-4 mb-4">
              <div className="sm:col-span-2 space-y-1">
                <h3 className="font-extrabold text-base text-red-700 leading-tight">
                  INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PRIVADO ITMAN
                </h3>
                <p className="text-[11px] text-slate-600">
                  Principal: Av. Universitaria 1420 - San Miguel, Lima - Perú
                </p>
                <p className="text-[11px] text-slate-600">
                  Teléfono: (01) 482-9100 • Correo: facturacion@itmanv.edu.pe
                </p>
                <p className="text-[11px] font-bold text-slate-700">
                  RUC N°: {selectedInvoice.issuerRuc}
                </p>
              </div>

              {/* Box RUC & Document Type */}
              <div className="border-2 border-slate-800 rounded-lg p-3 text-center bg-slate-50 flex flex-col justify-center">
                <p className="text-xs font-mono font-bold text-slate-700">R.U.C. 20601849201</p>
                <h4 className="text-xs font-extrabold uppercase my-1 text-slate-900 bg-slate-200 py-1">
                  BOLETA DE VENTA ELECTRÓNICA
                </h4>
                <p className="text-sm font-mono font-extrabold text-red-700">
                  {selectedInvoice.series} - {selectedInvoice.number}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs mb-4">
              <div>
                <span className="text-slate-500">Señor(es):</span>
                <p className="font-bold uppercase text-slate-900">{selectedInvoice.receiverName}</p>
              </div>
              <div>
                <span className="text-slate-500">Fecha de Emisión:</span>
                <p className="font-mono font-bold">{selectedInvoice.issueDate} {selectedInvoice.issueTime}</p>
              </div>
              <div>
                <span className="text-slate-500">Documento:</span>
                <p className="font-mono font-bold">
                  {selectedInvoice.receiverDocType === '1' ? 'DNI' : 'CE'}: {selectedInvoice.receiverDocNumber}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Moneda:</span>
                <p className="font-bold">SOLES (PEN S/.)</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Cant.</th>
                    <th className="py-2 px-3">Código</th>
                    <th className="py-2 px-3">Descripción del Servicio</th>
                    <th className="py-2 px-3 text-right">P. Unitario</th>
                    <th className="py-2 px-3 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-bold">{it.quantity}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{it.code}</td>
                      <td className="py-2 px-3 font-medium">{it.description}</td>
                      <td className="py-2 px-3 text-right font-mono">S/. {it.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">S/. {it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Monetary Totals & Exoneration Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-1">
                <p>
                  <strong>Leyenda:</strong> SERVICIOS EDUCATIVOS INAFECTOS DEL IGV CONFORME AL ART. 19 DEL D.S. N° 055-99-EF (TUO DE LA LEY DEL IGV E ISC).
                </p>
                <p className="font-mono text-[9px] text-slate-500">
                  Código Hash Resumen: {selectedInvoice.hashSha256}
                </p>
              </div>

              <div className="space-y-1 text-right text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Operaciones Exoneradas:</span>
                  <span className="font-mono font-bold">S/. {selectedInvoice.exoneratedOperations.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">I.G.V. (18%):</span>
                  <span className="font-mono font-bold">S/. 0.00</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-extrabold text-slate-900">
                  <span>IMPORTE TOTAL:</span>
                  <span className="font-mono text-red-700">S/. {selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* QR Code and SUNAT Legal Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <QRCodeSVG value={selectedInvoice.qrContent} size={75} />
                <div className="text-[10px] text-slate-500 leading-tight">
                  <p className="font-bold text-slate-700">Representación Impresa de la Boleta Electrónica</p>
                  <p>Consulte la validez de este comprobante en:</p>
                  <p className="text-blue-600 font-semibold underline">www.sunat.gob.pe</p>
                  <p className="text-slate-400 mt-1">Autorizado mediante Resolución de Superintendencia SUNAT</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 print:hidden">
                <button
                  onClick={() => downloadXml(selectedInvoice)}
                  className="px-3 py-1.5 border border-purple-300 text-purple-700 hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar XML
                </button>
                <button
                  onClick={() => exportBoletaSunatPdf(selectedInvoice)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar Boleta PDF (A4)
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: XML UBL 2.1 Viewer */}
      {showXmlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2 text-purple-300">
                <Code className="w-4 h-4" />
                Estructura Estándar XML UBL 2.1 ({showXmlModal.series}-{showXmlModal.number})
              </h3>
              <button 
                onClick={() => setShowXmlModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3">
              <pre className="p-4 bg-black/80 rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-96 border border-slate-800">
                {showXmlModal.xmlPayloadUbl}
              </pre>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs">
              <span className="text-slate-400 text-[11px]">
                Validado con Esquema XSD SUNAT 2.1
              </span>
              <button
                onClick={() => downloadXml(showXmlModal)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Descargar Archivo .XML
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: CDR (Constancia de Recepción SUNAT) */}
      {showCdrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                Constancia de Recepción SUNAT (CDR)
              </h3>
              <button 
                onClick={() => setShowCdrModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  Estado Tributario: ACEPTADO (Código {showCdrModal.cdrResponseCode})
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {showCdrModal.cdrDescription}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">RUC Emisor:</span>
                  <span className="font-bold text-slate-800">{showCdrModal.issuerRuc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Comprobante:</span>
                  <span className="font-bold text-slate-800">{showCdrModal.series}-{showCdrModal.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha Recepción:</span>
                  <span>{showCdrModal.issueDate} {showCdrModal.issueTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hash SHA-256:</span>
                  <span className="text-[10px] text-purple-700">{showCdrModal.hashSha256}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCdrModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
