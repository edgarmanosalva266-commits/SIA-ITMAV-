/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { testConnection } from './firebase/config';
import { 
  seedInitialFirestoreData, 
  subscribeToCollection, 
  saveApplicant, 
  updateApplicantStatus, 
  saveEnrollment, 
  updateGradeRecord, 
  saveTreasuryPayment, 
  saveSunatInvoice,
  saveScheduleItem,
  saveCourse,
  saveStudent,
  saveTeacher,
  COLLECTIONS 
} from './firebase/db';
import { 
  RoleType, 
  Applicant, 
  Student, 
  Enrollment, 
  GradeRecord, 
  ScheduleItem, 
  TreasuryPayment, 
  SunatInvoice,
  Course,
  Career,
  Syllabus,
  Teacher
} from './types';
import { 
  INITIAL_APPLICANTS, 
  INITIAL_STUDENTS, 
  INITIAL_ENROLLMENTS, 
  INITIAL_GRADES, 
  INITIAL_SCHEDULES, 
  INITIAL_TREASURY, 
  INITIAL_INVOICES,
  INITIAL_COURSES,
  INITIAL_CAREERS,
  INITIAL_SYLLABI,
  INITIAL_STAFF,
  INITIAL_TEACHERS
} from './data/initialData';

import { Header } from './components/Header';
import { ArchitectureView } from './components/ArchitectureView';
import { AdmissionModule } from './components/AdmissionModule';
import { EnrollmentModule } from './components/EnrollmentModule';
import { GradesModule } from './components/GradesModule';
import { SchedulesModule } from './components/SchedulesModule';
import { TreasuryModule } from './components/TreasuryModule';
import { SunatModule } from './components/SunatModule';
import { TeacherPortal } from './components/TeacherPortal';
import { StudentPortal } from './components/StudentPortal';
import { DirectorDashboard } from './components/DirectorDashboard';

export default function App() {
  const [currentRole, setCurrentRole] = useState<RoleType>('DIRECTOR');
  const [activeModule, setActiveModule] = useState<string>('architecture');
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);

  // Core application collections state
  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(INITIAL_ENROLLMENTS);
  const [grades, setGrades] = useState<GradeRecord[]>(INITIAL_GRADES);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(INITIAL_SCHEDULES);
  const [treasury, setTreasury] = useState<TreasuryPayment[]>(INITIAL_TREASURY);
  const [invoices, setInvoices] = useState<SunatInvoice[]>(INITIAL_INVOICES);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [careers, setCareers] = useState<Career[]>(INITIAL_CAREERS);
  const [syllabi] = useState<Syllabus[]>(INITIAL_SYLLABI);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);

  // Initial boot and Firestore setup
  useEffect(() => {
    async function boot() {
      const isOnline = await testConnection();
      setFirebaseConnected(isOnline);
      await seedInitialFirestoreData();
    }
    boot();

    // Subscribe to Firestore collections
    const unsubCareers = subscribeToCollection<Career>(
      COLLECTIONS.CAREERS,
      INITIAL_CAREERS,
      setCareers
    );
    const unsubCourses = subscribeToCollection<Course>(
      COLLECTIONS.COURSES,
      INITIAL_COURSES,
      setCourses
    );
    const unsubApplicants = subscribeToCollection<Applicant>(
      COLLECTIONS.APPLICANTS, 
      INITIAL_APPLICANTS, 
      setApplicants
    );
    const unsubStudents = subscribeToCollection<Student>(
      COLLECTIONS.STUDENTS, 
      INITIAL_STUDENTS, 
      setStudents
    );
    const unsubEnrollments = subscribeToCollection<Enrollment>(
      COLLECTIONS.ENROLLMENTS, 
      INITIAL_ENROLLMENTS, 
      setEnrollments
    );
    const unsubGrades = subscribeToCollection<GradeRecord>(
      COLLECTIONS.GRADES, 
      INITIAL_GRADES, 
      setGrades
    );
    const unsubSchedules = subscribeToCollection<ScheduleItem>(
      COLLECTIONS.SCHEDULES, 
      INITIAL_SCHEDULES, 
      setSchedules
    );
    const unsubTreasury = subscribeToCollection<TreasuryPayment>(
      COLLECTIONS.TREASURY, 
      INITIAL_TREASURY, 
      setTreasury
    );
    const unsubInvoices = subscribeToCollection<SunatInvoice>(
      COLLECTIONS.INVOICES, 
      INITIAL_INVOICES, 
      setInvoices
    );
    const unsubTeachers = subscribeToCollection<Teacher>(
      COLLECTIONS.TEACHERS,
      INITIAL_TEACHERS,
      setTeachers
    );

    return () => {
      unsubCareers();
      unsubCourses();
      unsubApplicants();
      unsubStudents();
      unsubEnrollments();
      unsubGrades();
      unsubSchedules();
      unsubTreasury();
      unsubInvoices();
      unsubTeachers();
    };
  }, []);

  // Role selection router
  const handleSelectRole = (role: RoleType) => {
    setCurrentRole(role);
    if (role === 'DIRECTOR') setActiveModule('director');
    else if (role === 'TRAMITE_DOCUMENTARIO') setActiveModule('admission');
    else if (role === 'GESTION_ACADEMICA') setActiveModule('enrollment');
    else if (role === 'TESORERIA') setActiveModule('treasury');
    else if (role === 'DOCENTE') setActiveModule('teacher_portal');
    else if (role === 'ESTUDIANTE') setActiveModule('student_portal');
  };

  // Automated SUNAT invoice emission from a treasury payment and bidirectional sync
  const handleEmitInvoiceFromPayment = async (payment: TreasuryPayment): Promise<SunatInvoice> => {
    const invoiceNumber = String(invoices.length + 500).padStart(8, '0');
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0];

    const newInvoice: SunatInvoice = {
      id: `inv-sunat-${Date.now()}`,
      type: '03_BOLETA',
      series: 'B001',
      number: invoiceNumber,
      issueDate: today,
      issueTime: time,
      issuerRuc: '20601849201',
      issuerName: 'INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO PRIVADO ITMAN',
      receiverDocType: '1',
      receiverDocNumber: payment.docNumber,
      receiverName: payment.studentName.toUpperCase(),
      currency: 'PEN',
      items: [
        {
          code: `SERV-${payment.id}`,
          description: payment.concept.toUpperCase(),
          quantity: 1,
          unitPrice: payment.totalDue,
          subtotal: payment.totalDue,
          igv: 0.0,
          total: payment.totalDue
        }
      ],
      taxableOperations: 0.0,
      exoneratedOperations: payment.totalDue,
      totalIgv: 0.0,
      totalAmount: payment.totalDue,
      hashSha256: `SHA256-${Math.random().toString(36).substring(2, 9).toUpperCase()}=`,
      qrContent: `20601849201|03|B001|${invoiceNumber}|0.00|${payment.totalDue.toFixed(2)}|${today}|1|${payment.docNumber}|`,
      sunatStatus: 'ACEPTADO',
      cdrResponseCode: '0',
      cdrDescription: `La Boleta número B001-${invoiceNumber} ha sido aceptada por la SUNAT en tiempo real.`,
      xmlPayloadUbl: `<?xml version="1.0" encoding="ISO-8859-1"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ID>B001-${invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${today}</cbc:IssueDate>
  <cbc:IssueTime>${time}</cbc:IssueTime>
  <cac:LegalMonetaryTotal>
    <cbc:PayableAmount currencyID="PEN">${payment.totalDue.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`
    };

    await saveSunatInvoice(newInvoice);
    setInvoices(prev => [newInvoice, ...prev]);

    // Update payment record in Firestore and state with the official invoice linkage
    const linkedPayment: TreasuryPayment = {
      ...payment,
      invoiceId: newInvoice.id,
      invoiceSeries: newInvoice.series,
      invoiceNumber: newInvoice.number
    };
    await saveTreasuryPayment(linkedPayment);
    setTreasury(prev => prev.map(t => t.id === payment.id ? linkedPayment : t));

    return newInvoice;
  };

  const handleSaveOrUpdateGrade = async (grd: GradeRecord) => {
    await updateGradeRecord(grd);
    setGrades(prev => {
      const idx = prev.findIndex(g => g.id === grd.id || (g.studentId === grd.studentId && g.courseId === grd.courseId));
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = grd;
        return updated;
      }
      return [...prev, grd];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Institutional Header with Persona Switcher */}
      <Header
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        firebaseOnline={firebaseConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeModule === 'architecture' && (
          <ArchitectureView />
        )}

        {activeModule === 'director' && (
          <DirectorDashboard
            careers={careers}
            students={students}
            applicants={applicants}
            treasury={treasury}
            grades={grades}
            invoices={invoices}
            onNavigateToModule={setActiveModule}
          />
        )}

        {activeModule === 'admission' && (
          <AdmissionModule
            applicants={applicants}
            careers={careers}
            onSaveApplicant={async (app) => {
              await saveApplicant(app);
              setApplicants(prev => [app, ...prev]);
            }}
            onUpdateStatus={async (id, status, reviewedBy, score) => {
              await updateApplicantStatus(id, status, reviewedBy, score);
              setApplicants(prev => prev.map(a => a.id === id ? { ...a, status, reviewedBy, score: score ?? a.score } : a));
            }}
            currentUserRole={currentRole}
          />
        )}

        {activeModule === 'enrollment' && (
          <EnrollmentModule
            students={students}
            courses={courses}
            enrollments={enrollments}
            treasury={treasury}
            careers={careers}
            applicants={applicants}
            onSaveEnrollment={async (enr) => {
              await saveEnrollment(enr);
              setEnrollments(prev => [enr, ...prev]);
            }}
            onSaveCourse={async (crs) => {
              await saveCourse(crs);
              setCourses(prev => {
                const idx = prev.findIndex(c => c.id === crs.id);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = crs;
                  return updated;
                }
                return [...prev, crs];
              });
            }}
            onSaveStudent={async (std) => {
              await saveStudent(std);
              setStudents(prev => {
                const idx = prev.findIndex(s => s.id === std.id);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = std;
                  return updated;
                }
                return [std, ...prev];
              });
            }}
            onSaveGrade={handleSaveOrUpdateGrade}
            onUpdateApplicantStatus={async (id, status, reviewedBy, score) => {
              await updateApplicantStatus(id, status, reviewedBy, score);
              setApplicants(prev => prev.map(a => a.id === id ? { ...a, status, reviewedBy, score: score ?? a.score } : a));
            }}
            currentUserRole={currentRole}
          />
        )}

        {activeModule === 'grades' && (
          <GradesModule
            grades={grades}
            courses={courses}
            students={students}
            enrollments={enrollments}
            treasury={treasury}
            onUpdateGrade={handleSaveOrUpdateGrade}
            currentUserRole={currentRole}
          />
        )}

        {activeModule === 'schedules' && (
          <SchedulesModule
            schedules={schedules}
            courses={courses}
            careers={careers}
            onSaveSchedule={async (sch) => {
              await saveScheduleItem(sch);
              setSchedules(prev => [...prev, sch]);
            }}
            currentUserRole={currentRole}
          />
        )}

        {activeModule === 'treasury' && (
          <TreasuryModule
            treasury={treasury}
            students={students}
            invoices={invoices}
            onSavePayment={async (p) => {
              await saveTreasuryPayment(p);
              setTreasury(prev => {
                const idx = prev.findIndex(t => t.id === p.id);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = p;
                  return updated;
                }
                return [p, ...prev];
              });
            }}
            onEmitInvoiceFromPayment={handleEmitInvoiceFromPayment}
            onNavigateToModule={setActiveModule}
            currentUserRole={currentRole}
          />
        )}

        {activeModule === 'sunat' && (
          <SunatModule
            invoices={invoices}
            currentUserRole={currentRole}
          />
        )}

        {activeModule === 'teacher_portal' && (
          <TeacherPortal
            courses={courses}
            syllabi={syllabi}
            grades={grades}
            schedules={schedules}
            teachers={teachers}
            onSaveTeacher={async (newTeacher) => {
              await saveTeacher(newTeacher);
              setTeachers(prev => [newTeacher, ...prev]);
            }}
            onOpenGradesForCourse={(cId) => {
              setActiveModule('grades');
            }}
          />
        )}

        {activeModule === 'student_portal' && (
          <StudentPortal
            student={students[0]}
            students={students}
            grades={grades}
            schedules={schedules}
            treasury={treasury}
            invoices={invoices}
            enrollment={enrollments[0]}
            courses={courses}
            syllabi={syllabi}
          />
        )}
      </main>

      {/* Institutional Legal Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-slate-200 font-bold">
              INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PRIVADO ITMAN (ITMANV)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              R.M. N° 0418-94-ED • Código Modular: 0849201 • Licenciamiento Ley N° 30512
            </p>
          </div>

          <div className="text-center sm:text-right text-[11px] space-y-0.5">
            <p className="text-slate-400">
              SIA ITMANV • Conexión Segura con SUNAT SEE (UBL 2.1) & SIAGIE MINEDU
            </p>
            <p className="text-slate-500">
              Dirección General: <span className="text-slate-300">Lic. Elmer Torres Peres</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
