/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Prospect' | 'Student' | 'Guardian' | 'Teacher' | 'Admin' | 'Developer' | 'Partner' | 'Scanner' | 'Accountant' | 'Creator' | 'Assistant';

export interface PortalCredential {
  role: UserRole;
  user: string;
  pass: string;
  label: string;
  description: string;
}

export interface Student {
  id: string;
  name: string;
  banglaName: string;
  className: string;
  roll: string;
  guardianName: string;
  guardianPhone: string;
  feesPaid: number;
  totalFees: number;
  attendancePct: number;
  homeworkStatus: 'Completed' | 'Pending' | 'Needs-Motivation';
}

export interface Employee {
  id: string;
  name: string;
  banglaName: string;
  role: 'Teacher' | 'Coordinator' | 'Staff' | 'Driver' | 'Management';
  salary: number;
  paymentStatus: 'Paid' | 'Pending';
  phone: string;
  subject?: string;
  qualification?: string;
}

export interface AttendanceLog {
  id: string;
  targetId: string; // studentId or employeeId
  targetType: 'student' | 'employee';
  targetName: string;
  className?: string; // for students
  roll?: string; // for students
  timestamp: string; // ISO String
  type: 'Check-In' | 'Check-Out';
  workHours?: number; // Calculated on Check-Out for employees
}

export interface SmsLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  studentName: string;
  messageType: 'Entry' | 'Exit';
  timestamp: string;
  text: string;
}

export interface Lead {
  id: string;
  parentName: string;
  studentName: string;
  phone: string;
  email: string;
  desiredClass: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  subDate: string;
}

export interface Notice {
  id: string;
  title: string;
  banglaTitle: string;
  date: string;
  category: 'General' | 'Exam' | 'Holiday' | 'Event';
  content: string;
}

export interface StationeryItem {
  id: string;
  name: string;
  banglaName: string;
  stock: number;
  price: number;
  category: 'Book' | 'Uniform' | 'Diary' | 'Bag' | 'Other';
}

export interface TransportRoute {
  id: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  vehicleNo: string;
  monthlyFee: number;
  status: 'Active' | 'Maintenance';
}

export interface ExamResult {
  studentId: string;
  studentName: string;
  roll: string;
  className: string;
  subjects: {
    bangla: number;
    english: number;
    math: number;
    science: number;
    religion: number;
  };
}

export interface DevProject {
  id: string;
  title: string;
  banglaTitle: string;
  budget: number;
  progress: number; // 0 to 100
  status: 'Planning' | 'In-Progress' | 'Completed';
}

export interface AcademicDraft {
  id: string;
  title: string;
  category: 'Question Paper' | 'Lecture Note' | 'Syllabus';
  content: string;
  className: string;
  creatorName: string;
  status: 'Pending Approval' | 'Approved' | 'Sent Back';
  approvedBy?: string;
  comments?: string;
}

export interface Requisition {
  id: string;
  type: 'Admission' | 'Job';
  applicantName: string;
  phone: string;
  email: string;
  classNameOrPost: string;
  details: string;
  status: 'Pending Payment' | 'Paid (Pending Assistant Approval)' | 'Assistant Approved (Pending Principal Approval)' | 'Principal Approved' | 'Rejected';
  paymentAmount: number;
  subDate: string;
  moneyReceiptNo?: string;
  idCardNo?: string;
  rejectionComments?: string;
}

export interface LandingSection {
  id: string;
  title: string;
  visible: boolean;
}

export interface ExamMark {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  roll: string;
  examType: 'Terminal' | 'Midterm';
  examName: string; // e.g., 'Term 1', 'Midterm 1'
  subject: string; // e.g., 'bangla', 'english', 'math', 'science', 'ict'
  writtenMarks: number;
  mcqMarks: number;
  totalMarks: number;
  grade: string;
  gpa: number;
  subDate: string;
  questionPaperId?: string;
}

export interface MeritStudent {
  name: string;
  className: string;
  achievement: string;
  quote: string;
  award: string;
  photoUrl?: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  banglaTitle: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD optional
  category: 'Holiday' | 'Exam' | 'Event' | 'Other';
  description: string;
  banglaDescription: string;
  className?: string; // e.g. "All Classes" or "Class 5"
  isHoliday: boolean;
}



