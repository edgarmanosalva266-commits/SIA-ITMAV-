import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GradeRecord, Course, SunatInvoice, TreasuryPayment, Student } from '../types';

// Helper to convert numbers to official Spanish words
export function numberToWordsSp(num: number): string {
  const integerPart = Math.floor(num);
  const cents = Math.round((num - integerPart) * 100);
  const centsStr = String(cents).padStart(2, '0') + '/100 SOLES';

  const units: Record<number, string> = {
    0: 'CERO',
    1: 'UN',
    2: 'DOS',
    3: 'TRES',
    4: 'CUATRO',
    5: 'CINCO',
    6: 'SEIS',
    7: 'SIETE',
    8: 'OCHO',
    9: 'NUEVE',
    10: 'DIEZ',
    11: 'ONCE',
    12: 'DOCE',
    13: 'TRECE',
    14: 'CATORCE',
    15: 'QUINCE',
    16: 'DIECISÉIS',
    17: 'DIECISIETE',
    18: 'DIECIOCHO',
    19: 'DIECINUEVE',
    20: 'VEINTE',
    21: 'VEINTIUNO',
    22: 'VEINTIDÓS',
    23: 'VEINTITRÉS',
    24: 'VEINTICUATRO',
    25: 'VEINTICINCO',
    26: 'VEINTISÉIS',
    27: 'VEINTISIETE',
    28: 'VEINTIOCHO',
    29: 'VEINTINUEVE',
    30: 'TREINTA',
    40: 'CUARENTA',
    50: 'CINCUENTA',
    60: 'SESENTA',
    70: 'SETENTA',
    80: 'OCHENTA',
    90: 'NOVENTA',
    100: 'CIEN',
    200: 'DOSCIENTOS',
    300: 'TRESCIENTOS',
    400: 'CUATROCIENTOS',
    500: 'QUINIENTOS',
    600: 'SEISCIENTOS',
    700: 'SETECIENTOS',
    800: 'OCHOCIENTOS',
    900: 'NOVECIENTOS'
  };

  const convertTens = (n: number): string => {
    if (n <= 30) return units[n] || String(n);
    const ten = Math.floor(n / 10) * 10;
    const unit = n % 10;
    if (unit === 0) return units[ten];
    return `${units[ten]} Y ${units[unit]}`;
  };

  const convertHundreds = (n: number): string => {
    if (n <= 100) return units[n] || convertTens(n);
    if (n > 100 && n < 200) return `CIENTO ${convertTens(n - 100)}`;
    const hundred = Math.floor(n / 100) * 100;
    const rest = n % 100;
    if (rest === 0) return units[hundred] || '';
    return `${units[hundred]} ${convertTens(rest)}`;
  };

  let words = '';
  if (integerPart === 0) {
    words = 'CERO';
  } else if (integerPart < 1000) {
    words = convertHundreds(integerPart);
  } else if (integerPart === 1000) {
    words = 'MIL';
  } else if (integerPart < 2000) {
    words = `MIL ${convertHundreds(integerPart - 1000)}`;
  } else if (integerPart < 1000000) {
    const thousands = Math.floor(integerPart / 1000);
    const rest = integerPart % 1000;
    words = `${convertHundreds(thousands)} MIL ${rest > 0 ? convertHundreds(rest) : ''}`.trim();
  } else {
    words = String(integerPart);
  }

  return `SON: ${words} CON ${centsStr}`;
}

export function gradeInWords(grade: number): string {
  const map: Record<number, string> = {
    0: 'CERO',
    1: 'UNO',
    2: 'DOS',
    3: 'TRES',
    4: 'CUATRO',
    5: 'CINCO',
    6: 'SEIS',
    7: 'SIETE',
    8: 'OCHO',
    9: 'NUEVE',
    10: 'DIEZ',
    11: 'ONCE',
    12: 'DOCE',
    13: 'TRECE',
    14: 'CATORCE',
    15: 'QUINCE',
    16: 'DIECISÉIS',
    17: 'DIECISIETE',
    18: 'DIECIOCHO',
    19: 'DIECINUEVE',
    20: 'VEINTE'
  };
  return map[grade] || String(grade);
}

/**
 * SERVICIO 1: Exportar Acta Oficial Consolidada de Evaluación Académica (A4)
 */
export function exportActaNotasPdf(params: {
  course: Course;
  grades: GradeRecord[];
  teacherName?: string;
  academicPeriod?: string;
  careerName?: string;
}): void {
  const { course, grades, teacherName = 'Ing. Carlos Mendoza Villanueva', academicPeriod = '2026-I' } = params;
  
  const careerName = params.careerName || 
    (course.careerId === 'car-anbf' 
      ? 'Administración de Negocios Bancarios y Financieros' 
      : 'Administración de Empresas');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado institucional oficial (Colores institucionales ITMANV: Rojo granate #991b1b, Azul marino #0f172a)
  doc.setFillColor(153, 27, 27); // #991b1b
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Membrete Oficial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('REPÚBLICA DEL PERÚ • MINISTERIO DE EDUCACIÓN • DIRECCIÓN REGIONAL DE EDUCACIÓN DE LIMA', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(153, 27, 27);
  doc.text('INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PRIVADO ITMAN', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('R.M. N° 0492-94-ED / R.D. N° 0184-2005-ED • Código Modular: 1048291 • RUC: 20601849201', pageWidth / 2, 22, { align: 'center' });

  // Título del Acta
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 25, pageWidth - 28, 10, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ACTA OFICIAL CONSOLIDADA DE EVALUACIÓN DEL RENDIMIENTO ACADÉMICO', pageWidth / 2, 31.5, { align: 'center' });

  // Cuadro de Especificación Técnica del Curso
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const startY = 38;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, startY, pageWidth - 28, 22, 1.5, 1.5, 'FD');

  // Fila 1 de datos
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Programa de Estudios:', 18, startY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(careerName, 53, startY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Periodo Académico:', 140, startY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(academicPeriod, 172, startY + 5);

  // Fila 2 de datos
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Unidad Didáctica:', 18, startY + 11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${course.name} (${course.code})`, 53, startY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Ciclo / Créditos:', 140, startY + 11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Ciclo ${course.cycle}  /  ${course.credits} Créditos`, 172, startY + 11);

  // Fila 3 de datos
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Docente Responsable:', 18, startY + 17);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(teacherName, 53, startY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Horas Semanales:', 140, startY + 17);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${course.theoryHours + course.practiceHours} Horas (${course.theoryHours}T / ${course.practiceHours}P)`, 172, startY + 17);

  // Preparar filas de tabla
  const tableData = grades.map((g, idx) => {
    const isFailing = g.finalGrade < 13;
    const gradeFormatted = String(g.finalGrade).padStart(2, '0');
    const words = gradeInWords(g.finalGrade);

    return [
      String(idx + 1),
      g.studentCode,
      g.studentName.toUpperCase(),
      String(g.il1),
      String(g.il2),
      String(g.il3),
      String(g.il4),
      String(g.continuousAverage.toFixed(0)),
      g.recoveryGrade !== undefined && g.recoveryGrade !== null ? String(g.recoveryGrade) : '-',
      gradeFormatted,
      words,
      `${g.attendancePercentage}%`,
      g.status === 'APROBADO' ? 'APROBADO' : g.status === 'DPI' ? 'D.P.I.' : 'DESAPROBADO',
      isFailing ? '1' : '0' // Flag interno para estilizar celda
    ];
  });

  // Generar tabla con jspdf-autotable
  autoTable(doc, {
    startY: startY + 26,
    head: [[
      { content: 'N°', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Código SIA', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Apellidos y Nombres', rowSpan: 2, styles: { halign: 'left', valign: 'middle' } },
      { content: 'Evaluación Formativa (LAG MINEDU)', colSpan: 6, styles: { halign: 'center' } },
      { content: 'Calificación Final', colSpan: 2, styles: { halign: 'center' } },
      { content: 'Asist.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Condición', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
    ], [
      'IL1', 'IL2', 'IL3', 'IL4', 'Prom', 'ER', 'Núm', 'En Letras Oficiales'
    ]],
    body: tableData.map(row => row.slice(0, 13)), // Quitar la flag
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      font: 'helvetica',
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 20, halign: 'center', font: 'courier' },
      2: { cellWidth: 47, halign: 'left', fontStyle: 'bold' },
      3: { cellWidth: 8, halign: 'center' },
      4: { cellWidth: 8, halign: 'center' },
      5: { cellWidth: 8, halign: 'center' },
      6: { cellWidth: 8, halign: 'center' },
      7: { cellWidth: 9, halign: 'center' },
      8: { cellWidth: 8, halign: 'center' },
      9: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      10: { cellWidth: 25, halign: 'left', fontSize: 6.5 },
      11: { cellWidth: 10, halign: 'center' },
      12: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Resaltar notas desaprobatorias (< 13) en rojo de manera automática
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const finalGradeVal = grades[rowIndex]?.finalGrade;
        const statusVal = grades[rowIndex]?.status;

        // Columna de Nota Final (índice 9)
        if (data.column.index === 9 && finalGradeVal !== undefined) {
          if (finalGradeVal < 13) {
            data.cell.styles.textColor = [185, 28, 28]; // Rojo intenso #b91c1c
            data.cell.styles.fillColor = [254, 242, 242]; // Fondo rojizo suave
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [4, 120, 87]; // Verde oscuro #047857
            data.cell.styles.fillColor = [236, 253, 245];
          }
        }

        // Columna de Condición (índice 12)
        if (data.column.index === 12) {
          if (statusVal === 'APROBADO') {
            data.cell.styles.textColor = [4, 120, 87];
          } else if (statusVal === 'DPI') {
            data.cell.styles.textColor = [109, 40, 217]; // Morado
          } else {
            data.cell.styles.textColor = [185, 28, 28]; // Rojo
          }
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  // Estadísticas del Acta
  // @ts-expect-error - jsPDF autotable attaches lastAutoTable
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 220;

  const total = grades.length;
  const aprobados = grades.filter(g => g.status === 'APROBADO').length;
  const desaprobados = grades.filter(g => g.status === 'DESAPROBADO').length;
  const dpi = grades.filter(g => g.status === 'DPI').length;
  const promPonderado = total > 0 
    ? (grades.reduce((a, b) => a + b.finalGrade, 0) / total).toFixed(2)
    : '0.00';

  // Caja de resumen estadístico
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, finalY, pageWidth - 28, 14, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('RESUMEN ESTADÍSTICO DE RENDIMIENTO:', 18, finalY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Evaluados: ${total}`, 18, finalY + 10);
  doc.text(`Aprobados: ${aprobados} (${total > 0 ? Math.round((aprobados / total) * 100) : 0}%)`, 56, finalY + 10);
  doc.text(`Desaprobados: ${desaprobados} (${total > 0 ? Math.round((desaprobados / total) * 100) : 0}%)`, 95, finalY + 10);
  doc.text(`Desaprobados p. Inasistencia (DPI): ${dpi}`, 135, finalY + 10);
  doc.text(`Promedio Grupal: ${promPonderado}`, 175, finalY + 10);

  // Firmas oficiales reglamentarias
  const signY = finalY + 24;

  // Firma 1: Docente
  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(22, signY + 12, 68, signY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(teacherName, 45, signY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Docente Titular de la Asignatura', 45, signY + 19, { align: 'center' });

  // Firma 2: Registro Académico
  doc.line(82, signY + 12, 128, signY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Lic. Oscar Ortiz Regalao', 105, signY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Gestión Académica y Matrículas', 105, signY + 19, { align: 'center' });

  // Firma 3: Director General
  doc.line(142, signY + 12, 188, signY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Lic. Elmer Torres Peres', 165, signY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Director General - IESTP ITMANV', 165, signY + 19, { align: 'center' });

  // Pie de página institucional
  doc.setLineDashPattern([], 0);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 284, pageWidth - 14, 284);

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const now = new Date().toLocaleString('es-PE');
  doc.text(`Documento generado por SIA ITMANV • Ref. R.V.M. N° 049-2022-MINEDU (Lineamientos Académicos Generales) • Fecha y hora: ${now}`, 14, 288);
  doc.text('Pág. 1 de 1', pageWidth - 14, 288, { align: 'right' });

  // Guardar archivo en el cliente
  const sanitizedCourseName = course.code.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`ACTA_NOTAS_${sanitizedCourseName}_${academicPeriod}.pdf`);
}

/**
 * SERVICIO 2: Exportar Boleta Electrónica de Venta SUNAT UBL 2.1 (A4)
 */
export function exportBoletaSunatPdf(invoice: SunatInvoice): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Barra decorativa superior
  doc.setFillColor(153, 27, 27); // Granate institucional
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Datos del Emisor (IESTP ITMANV)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(153, 27, 27);
  doc.text('INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PRIVADO ITMAN', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Principal: Av. Universitaria 1420 - San Miguel, Lima - Perú', 14, 19);
  doc.text('Teléfono: (01) 482-9100 • Correo Central: tesoreria@itmanv.edu.pe', 14, 23);
  doc.text('Portal Web: https://itmanv.edu.pe • Servicios Educativos de Educación Superior', 14, 27);

  // Recuadro RUC y Comprobante (Derecha)
  const boxX = 135;
  const boxWidth = 61;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.roundedRect(boxX, 10, boxWidth, 24, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`R.U.C. N° ${invoice.issuerRuc}`, boxX + boxWidth / 2, 15.5, { align: 'center' });

  doc.setFillColor(241, 245, 249);
  doc.rect(boxX + 0.5, 18, boxWidth - 1, 7, 'F');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const docTitle = invoice.type === '03_BOLETA' ? 'BOLETA DE VENTA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA';
  doc.text(docTitle, boxX + boxWidth / 2, 22.8, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(185, 28, 28);
  doc.text(`${invoice.series} - ${invoice.number}`, boxX + boxWidth / 2, 31, { align: 'center' });

  // Recuadro de datos del Adquirente / Cliente
  const clientY = 38;
  doc.setLineWidth(0.15);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, clientY, pageWidth - 28, 21, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('SEÑOR(ES):', 18, clientY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.receiverName.toUpperCase(), 42, clientY + 5);

  const docLabel = invoice.receiverDocType === '1' ? 'D.N.I.' : invoice.receiverDocType === '6' ? 'R.U.C.' : 'C.E.';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(`${docLabel}:`, 18, clientY + 11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.receiverDocNumber, 42, clientY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DIRECCIÓN:', 18, clientY + 17);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.receiverAddress || 'LIMA, PERÚ', 42, clientY + 17);

  // Columna derecha del cliente
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('FECHA EMISIÓN:', 130, clientY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${invoice.issueDate} ${invoice.issueTime}`, 160, clientY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('MONEDA:', 130, clientY + 11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('SOLES (PEN S/.)', 160, clientY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('FORMA DE PAGO:', 130, clientY + 17);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('CONTADO', 160, clientY + 17);

  // Tabla de Items de Boleta
  const itemsTableData = invoice.items.map((it, idx) => [
    String(idx + 1),
    String(it.quantity),
    it.code,
    it.description,
    `S/. ${it.unitPrice.toFixed(2)}`,
    `S/. ${it.subtotal.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: clientY + 25,
    head: [[
      'Ítem', 'Cant.', 'Código', 'Descripción del Servicio Educativo', 'Precio Unit.', 'Importe Total'
    ]],
    body: itemsTableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      font: 'helvetica',
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 24, halign: 'center', font: 'courier' },
      3: { cellWidth: 84, halign: 'left' },
      4: { cellWidth: 24, halign: 'right', font: 'courier' },
      5: { cellWidth: 24, halign: 'right', font: 'courier', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-expect-error - jsPDF autotable attaches lastAutoTable
  const tableBottomY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 5 : 120;

  // Leyenda en Letras
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, tableBottomY, pageWidth - 28, 8, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const wordsLiteral = numberToWordsSp(invoice.totalAmount);
  doc.text(wordsLiteral, 18, tableBottomY + 5.5);

  // Cuadro de Totales e Información Tributaria
  const totalsY = tableBottomY + 12;

  // Caja izquierda: Leyenda tributaria SUNAT y Hash
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, totalsY, 105, 34, 1.5, 1.5, 'FD');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('INFORMACIÓN DE VALIDEZ TRIBUTARIA SUNAT:', 18, totalsY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('• Servicios Educativos Inafectos del IGV conforme al Art. 19 del D.S. N° 055-99-EF', 18, totalsY + 9);
  doc.text('  (Texto Único Ordenado de la Ley del Impuesto General a las Ventas e ISC).', 18, totalsY + 12.5);
  doc.text(`• Estado SUNAT: ${invoice.sunatStatus} • CDR Código Respuesta: ${invoice.cdrResponseCode} (${invoice.cdrDescription})`, 18, totalsY + 17);
  doc.text(`• Representación impresa de la Boleta de Venta Electrónica UBL 2.1`, 18, totalsY + 21.5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text(`Código Hash SHA-256: ${invoice.hashSha256}`, 18, totalsY + 27.5);
  doc.text(`Comprobante Electrónico Autorizado mediante RS SUNAT`, 18, totalsY + 31);

  // Caja derecha: Resumen monetario
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(125, totalsY, 71, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Op. Gravadas:', 129, totalsY + 6);
  doc.text('S/. 0.00', 190, totalsY + 6, { align: 'right' });

  doc.text('Op. Exoneradas (Educación):', 129, totalsY + 11.5);
  doc.text(`S/. ${invoice.exoneratedOperations.toFixed(2)}`, 190, totalsY + 11.5, { align: 'right' });

  doc.text('I.G.V. (18%):', 129, totalsY + 17);
  doc.text('S/. 0.00', 190, totalsY + 17, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(129, totalsY + 20, 191, totalsY + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(153, 27, 27);
  doc.text('TOTAL A PAGAR:', 129, totalsY + 27);
  doc.text(`S/. ${invoice.totalAmount.toFixed(2)}`, 190, totalsY + 27, { align: 'right' });

  // Pie y consulta en línea
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Consulte la validez y autenticidad de este comprobante en el portal oficial de la SUNAT: www.sunat.gob.pe', pageWidth / 2, totalsY + 44, { align: 'center' });

  doc.save(`BOLETA_${invoice.series}_${invoice.number}.pdf`);
}

/**
 * SERVICIO 3: Exportar Boleta de Pago / Recibo de Caja desde Tesorería (A4 / Comprobante)
 */
export function exportTreasuryPaymentPdf(payment: TreasuryPayment, student?: Student): void {
  // Si tiene datos de factura SUNAT asociada, creamos un Comprobante Oficial
  const mockInvoice: SunatInvoice = {
    id: payment.invoiceId || `inv-${payment.id}`,
    type: '03_BOLETA',
    series: payment.invoiceSeries || 'B001',
    number: payment.invoiceNumber || '00001048',
    issueDate: payment.paymentDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    issueTime: '10:30:00',
    issuerRuc: '20601849201',
    issuerName: 'INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PRIVADO ITMAN',
    receiverDocType: '1',
    receiverDocNumber: payment.docNumber,
    receiverName: payment.studentName,
    receiverAddress: student ? `Estudiante SIA: ${student.studentCode} • Turno ${student.turn}` : undefined,
    currency: 'PEN',
    items: [
      {
        code: 'SRV-EDU-01',
        description: `${payment.concept} - Periodo ${payment.period}`,
        quantity: 1,
        unitPrice: payment.amount,
        subtotal: payment.amount,
        igv: 0,
        total: payment.totalDue
      }
    ],
    taxableOperations: 0,
    exoneratedOperations: payment.totalDue,
    totalIgv: 0,
    totalAmount: payment.totalDue,
    hashSha256: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
    qrContent: `20601849201|03|${payment.invoiceSeries || 'B001'}|${payment.invoiceNumber || '00001048'}|0.00|${payment.totalDue.toFixed(2)}|${payment.dueDate}|1|${payment.docNumber}|`,
    sunatStatus: 'ACEPTADO',
    cdrResponseCode: '0',
    cdrDescription: 'La Boleta de Venta Electrónica ha sido aceptada por SUNAT',
    xmlPayloadUbl: '<xml>UBL-2.1</xml>'
  };

  exportBoletaSunatPdf(mockInvoice);
}

/**
 * SERVICIO 4: Exportar Boleta de Notas Individual del Estudiante (Récord Académico A4)
 */
export function exportStudentReportCardPdf(params: {
  student: Student;
  grades: GradeRecord[];
  courses: Course[];
  academicPeriod?: string;
}): void {
  const { student, grades, courses, academicPeriod = '2026-I' } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Barra superior
  doc.setFillColor(153, 27, 27);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('REPÚBLICA DEL PERÚ • MINISTERIO DE EDUCACIÓN • DIRECCIÓN REGIONAL DE EDUCACIÓN DE LIMA', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(153, 27, 27);
  doc.text('INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PRIVADO ITMAN', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('BOLETA INFORMATIVA INDIVIDUAL DE CALIFICACIONES FORMATIVAS', pageWidth / 2, 23, { align: 'center' });

  // Recuadro Estudiante
  const boxY = 27;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, boxY, pageWidth - 28, 26, 1.5, 1.5, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Estudiante:', 18, boxY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.fullName.toUpperCase(), 45, boxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Código SIA:', 140, boxY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.studentCode, 165, boxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Programa:', 18, boxY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.careerName, 45, boxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DNI / Doc:', 140, boxY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.docNumber, 165, boxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Ciclo / Turno:', 18, boxY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Ciclo ${student.currentCycle}  •  Turno ${student.turn}`, 45, boxY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Periodo:', 140, boxY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(academicPeriod, 165, boxY + 18);

  // Tabla de Calificaciones
  const studentGrades = grades.filter(g => g.studentId === student.id || g.studentCode === student.studentCode);
  
  const reportRows = studentGrades.map((g, idx) => {
    const course = courses.find(c => c.id === g.courseId);
    return [
      String(idx + 1),
      g.courseCode || course?.code || 'CUR-01',
      g.courseName || course?.name || 'Unidad Didáctica',
      String(course?.credits || 3),
      String(g.il1),
      String(g.il2),
      String(g.il3),
      String(g.il4),
      String(g.finalGrade).padStart(2, '0'),
      gradeInWords(g.finalGrade),
      `${g.attendancePercentage}%`,
      g.status === 'APROBADO' ? 'APROBADO' : g.status === 'DPI' ? 'D.P.I.' : 'DESAPROBADO'
    ];
  });

  autoTable(doc, {
    startY: boxY + 30,
    head: [[
      'N°', 'Código', 'Unidad Didáctica', 'Créd.', 'IL1', 'IL2', 'IL3', 'IL4', 'Final', 'En Letras', 'Asist.', 'Condición'
    ]],
    body: reportRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 20, halign: 'center', font: 'courier' },
      2: { cellWidth: 50, halign: 'left', fontStyle: 'bold' },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 9, halign: 'center' },
      5: { cellWidth: 9, halign: 'center' },
      6: { cellWidth: 9, halign: 'center' },
      7: { cellWidth: 9, halign: 'center' },
      8: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      9: { cellWidth: 22, halign: 'left', fontSize: 6.5 },
      10: { cellWidth: 11, halign: 'center' },
      11: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const finalGradeVal = studentGrades[rowIndex]?.finalGrade;
        const statusVal = studentGrades[rowIndex]?.status;

        // Resaltar nota final (< 13)
        if (data.column.index === 8 && finalGradeVal !== undefined) {
          if (finalGradeVal < 13) {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fillColor = [254, 242, 242];
          } else {
            data.cell.styles.textColor = [4, 120, 87];
            data.cell.styles.fillColor = [236, 253, 245];
          }
        }

        if (data.column.index === 11) {
          if (statusVal === 'APROBADO') {
            data.cell.styles.textColor = [4, 120, 87];
          } else {
            data.cell.styles.textColor = [185, 28, 28];
          }
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-expect-error - jsPDF autotable attaches lastAutoTable
  const tableBottomY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 150;

  // Promedio ponderado y situación
  const approvedTotal = studentGrades.filter(g => g.status === 'APROBADO').length;
  const avg = studentGrades.length > 0 
    ? (studentGrades.reduce((a, b) => a + b.finalGrade, 0) / studentGrades.length).toFixed(2)
    : '0.00';

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, tableBottomY, pageWidth - 28, 14, 1.5, 1.5, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('SITUACIÓN ACADÉMICA GENERAL:', 18, tableBottomY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Unidades Aprobadas: ${approvedTotal} de ${studentGrades.length}`, 18, tableBottomY + 10);
  doc.text(`Promedio Ponderado del Ciclo: ${avg}`, 85, tableBottomY + 10);
  doc.text(`Condición: ${Number(avg) >= 13 ? 'REGULAR / PROMOVIDO' : 'EN RECUPERACIÓN'}`, 150, tableBottomY + 10);

  // Pie de página
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const now = new Date().toLocaleString('es-PE');
  doc.text(`Boleta oficial generada por SIA ITMANV • Fecha de descarga: ${now}`, 14, 288);
  doc.text('Dirección de Gestión Académica - IESTP ITMANV', pageWidth - 14, 288, { align: 'right' });

  doc.save(`BOLETA_NOTAS_${student.studentCode}_${academicPeriod}.pdf`);
}
