import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { 
  Applicant, 
  Student, 
  Enrollment, 
  GradeRecord, 
  ScheduleItem, 
  TreasuryPayment, 
  SunatInvoice,
  Career,
  Course,
  Syllabus,
  Teacher
} from '../types';
import { 
  INITIAL_APPLICANTS, 
  INITIAL_STUDENTS, 
  INITIAL_ENROLLMENTS, 
  INITIAL_GRADES, 
  INITIAL_SCHEDULES, 
  INITIAL_TREASURY, 
  INITIAL_INVOICES,
  INITIAL_CAREERS,
  INITIAL_COURSES,
  INITIAL_SYLLABI,
  INITIAL_TEACHERS
} from '../data/initialData';

// Firestore collection names
export const COLLECTIONS = {
  APPLICANTS: 'applicants',
  STUDENTS: 'students',
  ENROLLMENTS: 'enrollments',
  GRADES: 'grades',
  SCHEDULES: 'schedules',
  TREASURY: 'treasury_payments',
  INVOICES: 'sunat_invoices',
  CAREERS: 'careers',
  COURSES: 'courses',
  SYLLABI: 'syllabi',
  TEACHERS: 'teachers'
};

// Seed initial data to Firestore
export async function seedInitialFirestoreData(force = false): Promise<void> {
  try {
    const careerCheck = await getDocs(collection(db, COLLECTIONS.CAREERS));
    const needsSeed = careerCheck.empty || force || !careerCheck.docs.some(d => d.id === 'car-ade');

    if (needsSeed) {
      console.log('[SIA ITMANV] Sincronizando carreras oficiales (Administración de Empresas y Administración de Negocios Bancarios y Financieros)...');
      for (const item of INITIAL_CAREERS) {
        await setDoc(doc(db, COLLECTIONS.CAREERS, item.id), item);
      }
      for (const item of INITIAL_COURSES) {
        await setDoc(doc(db, COLLECTIONS.COURSES, item.id), item);
      }
      for (const item of INITIAL_SYLLABI) {
        await setDoc(doc(db, COLLECTIONS.SYLLABI, item.id), item);
      }
      for (const item of INITIAL_APPLICANTS) {
        await setDoc(doc(db, COLLECTIONS.APPLICANTS, item.id), item);
      }
      for (const item of INITIAL_STUDENTS) {
        await setDoc(doc(db, COLLECTIONS.STUDENTS, item.id), item);
      }
      for (const item of INITIAL_ENROLLMENTS) {
        await setDoc(doc(db, COLLECTIONS.ENROLLMENTS, item.id), item);
      }
      for (const item of INITIAL_GRADES) {
        await setDoc(doc(db, COLLECTIONS.GRADES, item.id), item);
      }
      for (const item of INITIAL_SCHEDULES) {
        await setDoc(doc(db, COLLECTIONS.SCHEDULES, item.id), item);
      }
      for (const item of INITIAL_TREASURY) {
        await setDoc(doc(db, COLLECTIONS.TREASURY, item.id), item);
      }
      for (const item of INITIAL_INVOICES) {
        await setDoc(doc(db, COLLECTIONS.INVOICES, item.id), item);
      }
      for (const item of INITIAL_TEACHERS) {
        await setDoc(doc(db, COLLECTIONS.TEACHERS, item.id), item);
      }
      console.log('[SIA ITMANV] Base de datos actualizada con las dos carreras técnicas oficiales del Instituto ITMANV.');
    }
  } catch (error) {
    console.warn('[SIA ITMANV] Seed en Firestore completado con fallback local:', error);
  }
}

// Subscription helper with safety fallback
export function subscribeToCollection<T>(
  collectionName: string, 
  fallbackData: T[], 
  callback: (data: T[]) => void
): () => void {
  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef, 
      (snapshot) => {
        if (!snapshot.empty) {
          const items: T[] = [];
          snapshot.forEach(docSnap => {
            items.push(docSnap.data() as T);
          });
          callback(items);
        } else {
          callback(fallbackData);
        }
      },
      (error) => {
        console.warn(`[Firestore ${collectionName}] Acceso local fallback:`, error.message);
        callback(fallbackData);
      }
    );
    return unsubscribe;
  } catch {
    callback(fallbackData);
    return () => {};
  }
}

// Data Mutation Services with Firestore sync
export async function saveApplicant(applicant: Applicant): Promise<void> {
  const path = `${COLLECTIONS.APPLICANTS}/${applicant.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.APPLICANTS, applicant.id), applicant);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateApplicantStatus(
  id: string, 
  status: Applicant['status'], 
  reviewedBy: string, 
  score?: number
): Promise<void> {
  const path = `${COLLECTIONS.APPLICANTS}/${id}`;
  try {
    const docRef = doc(db, COLLECTIONS.APPLICANTS, id);
    const updatePayload: Record<string, any> = { status, reviewedBy };
    if (score !== undefined) updatePayload.score = score;
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveEnrollment(enrollment: Enrollment): Promise<void> {
  const path = `${COLLECTIONS.ENROLLMENTS}/${enrollment.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.ENROLLMENTS, enrollment.id), enrollment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateGradeRecord(grade: GradeRecord): Promise<void> {
  // Validación estricta en el rango 0-20 antes de guardar en Firestore
  const gradesToCheck = [grade.il1, grade.il2, grade.il3, grade.il4, grade.finalGrade];
  if (grade.recoveryGrade !== undefined && grade.recoveryGrade !== null) {
    gradesToCheck.push(grade.recoveryGrade);
  }
  const hasInvalidGrade = gradesToCheck.some(
    val => (val !== undefined && val !== null) && (typeof val !== 'number' || isNaN(val) || val < 0 || val > 20)
  );

  if (hasInvalidGrade) {
    throw new Error('Validación de Notas Fallida: Toda calificación debe encontrarse estrictamente en la escala vigesimal de 0 a 20.');
  }

  const path = `${COLLECTIONS.GRADES}/${grade.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.GRADES, grade.id), grade);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveGradeRecord(grade: GradeRecord): Promise<void> {
  return updateGradeRecord(grade);
}

export async function saveSunatInvoice(invoice: SunatInvoice): Promise<void> {
  const path = `${COLLECTIONS.INVOICES}/${invoice.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.INVOICES, invoice.id), invoice);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveTreasuryPayment(payment: TreasuryPayment): Promise<void> {
  const path = `${COLLECTIONS.TREASURY}/${payment.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.TREASURY, payment.id), payment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveScheduleItem(item: ScheduleItem): Promise<void> {
  const path = `${COLLECTIONS.SCHEDULES}/${item.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.SCHEDULES, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCourse(course: Course): Promise<void> {
  const path = `${COLLECTIONS.COURSES}/${course.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.COURSES, course.id), course);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveStudent(student: Student): Promise<void> {
  const path = `${COLLECTIONS.STUDENTS}/${student.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveTeacher(teacher: Teacher): Promise<void> {
  const path = `${COLLECTIONS.TEACHERS}/${teacher.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.TEACHERS, teacher.id), teacher);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

