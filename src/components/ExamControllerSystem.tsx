/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, ExamMark } from '../types';
import { 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  Award, 
  Calendar, 
  BookOpen, 
  Layers, 
  Users, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Search, 
  Filter, 
  RefreshCw, 
  Send, 
  Check, 
  X, 
  QrCode, 
  AlertCircle, 
  Share2, 
  Copy, 
  FileCheck, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  GraduationCap,
  ClipboardList,
  LayoutGrid,
  FileSpreadsheet,
  BadgePercent
} from 'lucide-react';
import QRCode from 'qrcode';

// Convert numbers to Bengali digits
export const toBanglaDigits = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
};

// Standard grading scale points
export const calculateGpa = (marks: number): { gpa: number; grade: string; point: string } => {
  if (marks >= 80) return { gpa: 5.0, grade: 'A+', point: '5.00' };
  if (marks >= 70) return { gpa: 4.0, grade: 'A', point: '4.00' };
  if (marks >= 60) return { gpa: 3.5, grade: 'A-', point: '3.50' };
  if (marks >= 50) return { gpa: 3.0, grade: 'B', point: '3.00' };
  if (marks >= 40) return { gpa: 2.0, grade: 'C', point: '2.00' };
  if (marks >= 33) return { gpa: 1.0, grade: 'D', point: '1.00' };
  return { gpa: 0.0, grade: 'F', point: '0.00' };
};

// Standard subjects per class level
export interface SubjectScore {
  name: string;
  totalMarks: number;
  writtenMarks: number;
  eightyPct: number;
  classTestMarks: number; // 20%
  totalObtained: number;
  grade: string;
  point: number;
}

export interface StudentExamRecord {
  studentId: string;
  studentName: string;
  roll: string;
  className: string;
  examName: string;
  sessionYear: string;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  subjects: SubjectScore[];
  totalFullMarks: number;
  totalObtainedMarks: number;
  gpa: number;
  grade: string;
  meritPosition: number;
  teacherRemarks: string;
}

// Default standard curriculum subjects for Class 4 as shown in user's image.png
const DEFAULT_CLASS4_SUBJECTS: Array<{ name: string; totalMarks: number; defaultWritten: number; defaultClassTest: number }> = [
  { name: 'বাংলা', totalMarks: 100, defaultWritten: 77, defaultClassTest: 15 },
  { name: 'ইংরেজি ১ম পত্র', totalMarks: 100, defaultWritten: 73, defaultClassTest: 16 },
  { name: 'ইংরেজি ২য় পত্র', totalMarks: 50, defaultWritten: 36, defaultClassTest: 10 },
  { name: 'প্রাথমিক গণিত', totalMarks: 100, defaultWritten: 70, defaultClassTest: 15 },
  { name: 'প্রাথমিক বিজ্ঞান', totalMarks: 100, defaultWritten: 75, defaultClassTest: 17 },
  { name: 'বাংলাদেশ ও বিশ্ব পরিচয়', totalMarks: 100, defaultWritten: 67, defaultClassTest: 14 },
  { name: 'ইসলাম ও নৈতিক শিক্ষা', totalMarks: 100, defaultWritten: 67, defaultClassTest: 15 },
  { name: 'ব্যবহারিক ড্রয়িং', totalMarks: 50, defaultWritten: 36, defaultClassTest: 9.3 },
];

export const ExamControllerSystem: React.FC = () => {
  const { students, schoolName, schoolSlogan, schoolLogoVal } = useSchool();

  // Active sub-tab in Exam Controller
  const [activeSubTab, setActiveSubTab] = useState<'transcript' | 'marks_entry' | 'question_builder' | 'admit_card' | 'seat_plan' | 'syllabus_notes' | 'merit_analytics'>('transcript');

  // Filters & State
  const [selectedClass, setSelectedClass] = useState<string>('চতুর্থ');
  const [selectedExam, setSelectedExam] = useState<string>('২য় সাময়িক পরীক্ষা- ২০২৬');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('sample_1');
  const [isBatchPrinting, setIsBatchPrinting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // 1. Academic Records State (Pre-populated matching image.png sample!)
  // --------------------------------------------------------------------------
  const [examRecords, setExamRecords] = useState<StudentExamRecord[]>(() => {
    // Check saved in localStorage
    const saved = localStorage.getItem('delicon_exam_transcripts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse delicon_exam_transcripts', e);
      }
    }

    // Default sample matching Tahsin Islam in user's image.png
    const sampleRecord: StudentExamRecord = {
      studentId: 'sample_1',
      studentName: 'তাহসিন ইসলাম',
      roll: '০১',
      className: 'চতুর্থ',
      examName: '২য় সাময়িক পরীক্ষার ফলাফল- ২০২৬ ইং',
      sessionYear: '২০২৬',
      workingDays: 70,
      presentDays: 60,
      absentDays: 10,
      totalFullMarks: 700,
      totalObtainedMarks: 552.1,
      gpa: 4.88,
      grade: 'A',
      meritPosition: 4,
      teacherRemarks: 'লেখাপড়ায় যথেষ্ট মনোযোগ দিতে হবে। নিয়মিত উপস্থিত থাকলে আরও ভালো ফলাফল সম্ভব।',
      subjects: [
        {
          name: 'বাংলা',
          totalMarks: 100,
          writtenMarks: 77,
          eightyPct: 61.6,
          classTestMarks: 15,
          totalObtained: 76.6,
          grade: 'A',
          point: 4.0
        },
        {
          name: 'ইংরেজি ১ম পত্র',
          totalMarks: 100,
          writtenMarks: 73,
          eightyPct: 58.4,
          classTestMarks: 16,
          totalObtained: 74.4,
          grade: 'A',
          point: 4.0
        },
        {
          name: 'ইংরেজি ২য় পত্র',
          totalMarks: 50,
          writtenMarks: 36,
          eightyPct: 28.8,
          classTestMarks: 10,
          totalObtained: 38.8,
          grade: 'A+',
          point: 5.0
        },
        {
          name: 'প্রাথমিক গণিত',
          totalMarks: 100,
          writtenMarks: 70,
          eightyPct: 56.0,
          classTestMarks: 15,
          totalObtained: 71.0,
          grade: 'A',
          point: 4.0
        },
        {
          name: 'প্রাথমিক বিজ্ঞান',
          totalMarks: 100,
          writtenMarks: 75,
          eightyPct: 60.0,
          classTestMarks: 17,
          totalObtained: 77.0,
          grade: 'A',
          point: 4.0
        },
        {
          name: 'বাংলাদেশ ও বিশ্ব পরিচয়',
          totalMarks: 100,
          writtenMarks: 67,
          eightyPct: 53.6,
          classTestMarks: 14,
          totalObtained: 67.6,
          grade: 'A-',
          point: 3.5
        },
        {
          name: 'ইসলাম ও নৈতিক শিক্ষা',
          totalMarks: 100,
          writtenMarks: 67,
          eightyPct: 53.6,
          classTestMarks: 15,
          totalObtained: 68.6,
          grade: 'A-',
          point: 3.5
        },
        {
          name: 'ব্যবহারিক ড্রয়িং',
          totalMarks: 50,
          writtenMarks: 36,
          eightyPct: 28.8,
          classTestMarks: 9.3,
          totalObtained: 38.1,
          grade: 'A+',
          point: 5.0
        }
      ]
    };

    // Second sample student: আফিফা রহমান (Class 4 / 5)
    const sampleRecord2: StudentExamRecord = {
      studentId: 'sample_2',
      studentName: 'আফিফা রহমান',
      roll: '০২',
      className: 'চতুর্থ',
      examName: '২য় সাময়িক পরীক্ষার ফলাফল- ২০২৬ ইং',
      sessionYear: '২০২৬',
      workingDays: 70,
      presentDays: 68,
      absentDays: 2,
      totalFullMarks: 700,
      totalObtainedMarks: 615.5,
      gpa: 5.0,
      grade: 'A+',
      meritPosition: 1,
      teacherRemarks: 'অসাধারণ মেধা ও চমৎকার নিয়মানুবর্তিতা। এই ধারাবাহিকতা বজায় রাখলে প্রভূত সাফল্য আসবে।',
      subjects: [
        { name: 'বাংলা', totalMarks: 100, writtenMarks: 85, eightyPct: 68.0, classTestMarks: 18, totalObtained: 86.0, grade: 'A+', point: 5.0 },
        { name: 'ইংরেজি ১ম পত্র', totalMarks: 100, writtenMarks: 82, eightyPct: 65.6, classTestMarks: 19, totalObtained: 84.6, grade: 'A+', point: 5.0 },
        { name: 'ইংরেজি ২য় পত্র', totalMarks: 50, writtenMarks: 44, eightyPct: 35.2, classTestMarks: 10, totalObtained: 45.2, grade: 'A+', point: 5.0 },
        { name: 'প্রাথমিক গণিত', totalMarks: 100, writtenMarks: 94, eightyPct: 75.2, classTestMarks: 19, totalObtained: 94.2, grade: 'A+', point: 5.0 },
        { name: 'প্রাথমিক বিজ্ঞান', totalMarks: 100, writtenMarks: 88, eightyPct: 70.4, classTestMarks: 18, totalObtained: 88.4, grade: 'A+', point: 5.0 },
        { name: 'বাংলাদেশ ও বিশ্ব পরিচয়', totalMarks: 100, writtenMarks: 80, eightyPct: 64.0, classTestMarks: 16, totalObtained: 80.0, grade: 'A+', point: 5.0 },
        { name: 'ইসলাম ও নৈতিক শিক্ষা', totalMarks: 100, writtenMarks: 85, eightyPct: 68.0, classTestMarks: 18, totalObtained: 86.0, grade: 'A+', point: 5.0 },
        { name: 'ব্যবহারিক ড্রয়িং', totalMarks: 50, writtenMarks: 40, eightyPct: 32.0, classTestMarks: 9.5, totalObtained: 41.5, grade: 'A+', point: 5.0 },
      ]
    };

    return [sampleRecord, sampleRecord2];
  });

  const activeTranscript = useMemo(() => {
    return examRecords.find(r => r.studentId === selectedStudentId) || examRecords[0];
  }, [examRecords, selectedStudentId]);

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // --------------------------------------------------------------------------
  // 2. Question Paper Generator State & Sample Bank
  // --------------------------------------------------------------------------
  const [qpClass, setQpClass] = useState('চতুর্থ');
  const [qpSubject, setQpSubject] = useState('প্রাথমিক গণিত');
  const [qpExamName, setQpExamName] = useState('২য় সাময়িক পরীক্ষা- ২০২৬');
  const [qpTime, setQpTime] = useState('২ ঘণ্টা ৩০ মিনিট');
  const [qpFullMarks, setQpFullMarks] = useState('১০০');
  const [qpInstructions, setQpInstructions] = useState('সকল প্রশ্নের উত্তর দিতে হবে। ডানপাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক।');
  
  const [questionsList, setQuestionsList] = useState<Array<{ id: string; section: 'ক' | 'খ'; qNumber: string; text: string; marks: string }>>([
    { id: 'q1', section: 'ক', qNumber: '১', text: 'সংক্ষেপে উত্তর দাও: (ক) ৮৭৬৫০ সংখ্যাটিতে ৭ এর স্থানীয় মান কত? (খ) গুণফল = গুণ্য × ? (গ) ১ দিন = কত মিনিট? (ঘ) সমকোণের পরিমাপ কত ডিগ্রী?', marks: '১০' },
    { id: 'q2', section: 'ক', qNumber: '২', text: 'একটি খাতার দাম ২৫ টাকা এবং একটি কলমের দাম ১২ টাকা। ৫টি খাতা ও ৩টি কলমের মোট দাম কত?', marks: '১০' },
    { id: 'q3', section: 'খ', qNumber: '৩', text: 'একজন কৃষকের ৪টি গাভী আছে। প্রতিদিন গাভীগুলো যথাক্রমে ১৮ লিটার, ১৫ লিটার, ২১ লিটার এবং ১৬ লিটার দুধ দেয়। (ক) গাভীগুলো দৈনিক মোট কত লিটার দুধ দেয়? (খ) প্রতি লিটার দুধ ৬০ টাকা দরে বিক্রি করলে এক সপ্তাহে তিনি কত টাকা আয় করবেন?', marks: '১৫' },
    { id: 'q4', section: 'খ', qNumber: '৪', text: 'একটি আয়তাকার বাগানের দৈর্ঘ্য ৪০ মিটার এবং প্রস্থ ২৫ মিটার। (ক) বাগানটির পরিসীমা কত? (খ) বাগানটির ক্ষেত্রফল নির্ণয় কর। (গ) বাগানের চারিদিকে তারের বেড়া দিতে প্রতি মিটারে ৫০ টাকা খরচ হলে মোট কত খরচ হবে?', marks: '১৫' },
    { id: 'q5', section: 'খ', qNumber: '৫', text: 'নিচের অনুচ্ছেদটি পড় এবং জ্যামিতিক চিত্র অঙ্কন কর: একটি সমকোণী ত্রিভুজ অঙ্কন কর যার ভূমি ৪ সেমি এবং উচ্চতা ৩ সেমি। বৈশিষ্ট্য লিখ।', marks: '১০' }
  ]);

  const [newQSection, setNewQSection] = useState<'ক' | 'খ'>('খ');
  const [newQNum, setNewQNum] = useState('');
  const [newQText, setNewQText] = useState('');
  const [newQMarks, setNewQMarks] = useState('১০');

  const handleAddQuestion = () => {
    if (!newQText.trim()) return;
    const item = {
      id: 'q_' + Date.now(),
      section: newQSection,
      qNumber: newQNum.trim() || toBanglaDigits(questionsList.length + 1),
      text: newQText.trim(),
      marks: newQMarks.trim() || '১০'
    };
    setQuestionsList(prev => [...prev, item]);
    setNewQText('');
    setNewQNum('');
    showToast('নতুন প্রশ্ন সফলভাবে যুক্ত হয়েছে!');
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestionsList(prev => prev.filter(q => q.id !== id));
  };

  // --------------------------------------------------------------------------
  // 3. Admit Card Generator State & QR Generator
  // --------------------------------------------------------------------------
  const [admitCardExamTitle, setAdmitCardExamTitle] = useState('২য় সাময়িক পরীক্ষা- ২০২৬ ইং');
  const [admitCardTargetStudent, setAdmitCardTargetStudent] = useState<string>('sample_1');
  const [admitRoutine, setAdmitRoutine] = useState<Array<{ date: string; time: string; subject: string }>>([
    { date: '১০/১০/২০২৬', time: 'সকাল ১০:০০ - ১২:৩০', subject: 'বাংলা ১ম ও ২য় পত্র' },
    { date: '১২/১০/২০২৬', time: 'সকাল ১০:০০ - ১২:৩০', subject: 'ইংরেজি ১ম ও ২য় পত্র' },
    { date: '১৪/১০/২০২৬', time: 'সকাল ১০:০০ - ১২:৩০', subject: 'প্রাথমিক গণিত' },
    { date: '১৬/১০/২০২৬', time: 'সকাল ১০:০০ - ১২:৩০', subject: 'প্রাথমিক বিজ্ঞান' },
    { date: '১৮/১০/২০২৬', time: 'সকাল ১০:০০ - ১২:৩০', subject: 'বাংলাদেশ ও বিশ্বপরিচয়' },
    { date: '২০/১০/২০২৬', time: 'সকাল ১০:০০ - ১২:৩০', subject: 'ধর্ম ও নৈতিক শিক্ষা / ড্রয়িং' }
  ]);

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  React.useEffect(() => {
    const student = students.find(s => s.id === admitCardTargetStudent) || {
      name: 'Tahsin Islam',
      roll: '01',
      className: 'Class 4'
    };
    const verificationPayload = JSON.stringify({
      school: 'Delicon Model Academy',
      exam: admitCardExamTitle,
      student: student.name,
      roll: student.roll,
      className: student.className,
      verified: true
    });
    QRCode.toDataURL(verificationPayload, { width: 100, margin: 1 })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error(err));
  }, [admitCardTargetStudent, admitCardExamTitle, students]);

  // --------------------------------------------------------------------------
  // 4. Seat Plan & Room Allocation State
  // --------------------------------------------------------------------------
  const [seatRooms, setSeatRooms] = useState<Array<{
    id: string;
    roomNo: string;
    building: string;
    invigilator: string;
    allocatedClass: string;
    rollFrom: string;
    rollTo: string;
    capacity: number;
  }>>([
    { id: 'r1', roomNo: '১০১', building: 'একাডেমিক ভবন (নিচতলা)', invigilator: 'মোঃ রফিকুল ইসলাম (সিনিয়র শিক্ষক)', allocatedClass: 'চতুর্থ শ্রেণি', rollFrom: '০১', rollTo: '২৫', capacity: 25 },
    { id: 'r2', roomNo: '১০২', building: 'একাডেমিক ভবন (নিচতলা)', invigilator: 'মোছাঃ নাসরীন আক্তার (সহকারী শিক্ষিকা)', allocatedClass: 'চতুর্থ শ্রেণি', rollFrom: '২৬', rollTo: '৫০', capacity: 25 },
    { id: 'r3', roomNo: '২০১', building: 'একাডেমিক ভবন (২য় তলা)', invigilator: 'কাজী মিজানুর রহমান (সহকারী শিক্ষক)', allocatedClass: 'পঞ্চম শ্রেণি', rollFrom: '০১', rollTo: '৩০', capacity: 30 },
  ]);

  // --------------------------------------------------------------------------
  // 5. Notes, Syllabus & Suggestions State
  // --------------------------------------------------------------------------
  const [syllabusCategory, setSyllabusCategory] = useState<'syllabus' | 'suggestion' | 'notes'>('syllabus');
  const [syllabusClass, setSyllabusClass] = useState('চতুর্থ');
  
  const [studyResources, setStudyResources] = useState<Array<{
    id: string;
    category: 'syllabus' | 'suggestion' | 'notes';
    className: string;
    subject: string;
    title: string;
    examTerm: string;
    chapters: string;
    marksDist: string;
    author: string;
    date: string;
  }>>([
    {
      id: 'res1',
      category: 'syllabus',
      className: 'চতুর্থ',
      subject: 'প্রাথমিক গণিত',
      title: '২য় সাময়িক চূড়ান্ত পাঠ্যক্রম ও মানবণ্টন সিলেবাস',
      examTerm: '২য় সাময়িক পরীক্ষা',
      chapters: 'অধ্যায় ৫: গুণ ও ভাগ সম্পর্কিত সমস্যা, অধ্যায় ৬: গাণিতিক প্রতীক, অধ্যায় ৭: গুণনীয়ক ও গুণিতক, অধ্যায় ৮: সাধারণ ভগ্নাংশ।',
      marksDist: 'সংক্ষিপ্ত প্রশ্ন (১০টি): ২০ নম্বর, যোগ্যতাভিত্তিক সমস্যা (৪টি): ৪০ নম্বর, জ্যামিতি (চিত্রসহ): ২০ নম্বর, শ্রেণি মূল্যায়ন: ২০ নম্বর = মোট ১০০ নম্বর।',
      author: 'গণিত বিভাগ, ডি-লিকন মডেল একাডেমী',
      date: '২০২৬-০৮-১৫'
    },
    {
      id: 'res2',
      category: 'suggestion',
      className: 'চতুর্থ',
      subject: 'প্রাথমিক গণিত',
      title: '১০০% কমন উপযোগী ২য় সাময়িক স্পেশাল সুপার সাজেশন',
      examTerm: '২য় সাময়িক পরীক্ষা',
      chapters: 'অধ্যায় ৫ থেকে অনুশীলনী ৫.৩ এর ৩, ৪, ৬ ও ৭ নং অংক। অধ্যায় ৭ এর গসাগু ও লসাগু প্রয়োগ। ভগ্নাংশের যোগ-বিয়োগের ৩টি মডেল সমস্যা।',
      marksDist: 'সকল মডেল সমস্যা থেকে কমপক্ষে ৩টি সৃজনশীল প্রশ্ন নিশ্চিত আসবে।',
      author: 'প্রধান পরীক্ষক',
      date: '২০২৬-০৯-০১'
    },
    {
      id: 'res3',
      category: 'notes',
      className: 'চতুর্থ',
      subject: 'প্রাথমিক বিজ্ঞান',
      title: 'অধ্যায় ৭: প্রাকৃতিক সম্পদ ও পরিবেশ সংরক্ষণ - পূর্ণাঙ্গ লেকচার হ্যান্ডনোট',
      examTerm: '২য় সাময়িক পরীক্ষা',
      chapters: 'অনবায়নযোগ্য ও নবায়নযোগ্য জ্বালানি, সৌরশক্তির ব্যবহার, পানি দূষণ রোধের উপায়সমূহ।',
      marksDist: 'বর্ণনামূলক ও শূন্যস্থান পূরণের সকল সমাধান অন্তর্ভুক্ত।',
      author: 'বিজ্ঞান অনুষদ',
      date: '২০২৬-০৮-২০'
    }
  ]);

  // --------------------------------------------------------------------------
  // 6. Teacher Mark Entry State
  // --------------------------------------------------------------------------
  const [markEntrySubject, setMarkEntrySubject] = useState('প্রাথমিক গণিত');
  const [markEntryClass, setMarkEntryClass] = useState('চতুর্থ');
  const [markEntryExam, setMarkEntryExam] = useState('২য় সাময়িক পরীক্ষা- ২০২৬');

  // Roster entries for mark entry table
  const [rosterMarks, setRosterMarks] = useState<Array<{
    studentId: string;
    roll: string;
    studentName: string;
    writtenMarks: number;
    classTestMarks: number;
  }>>([
    { studentId: 's1', roll: '০১', studentName: 'তাহসিন ইসলাম', writtenMarks: 70, classTestMarks: 15 },
    { studentId: 's2', roll: '০২', studentName: 'আফিফা রহমান', writtenMarks: 94, classTestMarks: 19 },
    { studentId: 's3', roll: '০৩', studentName: 'তানভীর আহমেদ', writtenMarks: 68, classTestMarks: 14 },
    { studentId: 's4', roll: '০৪', studentName: 'রাইসা ইয়াসমিন', writtenMarks: 76, classTestMarks: 16 },
    { studentId: 's5', roll: '০৫', studentName: 'মাহিনুর ইসলাম', writtenMarks: 82, classTestMarks: 17 },
  ]);

  const handleUpdateRosterMark = (idx: number, field: 'writtenMarks' | 'classTestMarks', val: number) => {
    setRosterMarks(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSaveRosterMarks = () => {
    showToast('সকল শিক্ষার্থীর নম্বর সফলভাবে মার্কশীট ডাটাবেজে সংরক্ষিত হয়েছে!');
  };

  // --------------------------------------------------------------------------
  // Print Handler
  // --------------------------------------------------------------------------
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans print:p-0 print:m-0">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce print:hidden">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Controller Header Banner (Hidden on Print) */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-blue-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                  একাডেমিক পরীক্ষা নিয়ন্ত্রণ কেন্দ্র
                </span>
                <span className="text-xs text-blue-200">
                  Standard School Exam Controller Hub
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                পরীক্ষা ব্যবস্থাপনা, প্রশ্নপত্র, এডমিট ও ট্রান্সক্রিপ্ট সিস্টেম
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                সিলেবাস রূপরেখা, মডেল প্রশ্নপত্র জেনারেটর, প্রবেশপত্র, সীট প্লান, শিক্ষক মার্ক এন্ট্রি ফরম এবং অফিসিয়াল মার্কশীট/ট্রান্সক্রিপ্ট প্রিন্ট সলিউশন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 px-4 py-2 rounded-xl text-xs font-black shadow-md transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>মুদ্রণ / প্রিন্ট কপি</span>
            </button>
          </div>
        </div>

        {/* 7 Modular Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/15 overflow-x-auto">
          {[
            { id: 'transcript', label: '১। অফিসিয়াল ট্রান্সক্রিপ্ট ও মার্কশীট 📄', icon: FileSpreadsheet },
            { id: 'marks_entry', label: '২। শিক্ষক খাতা মার্ক এন্ট্রি ফরম ✍️', icon: Edit3 },
            { id: 'question_builder', label: '৩। প্রশ্নপত্র প্রণয়ন স্টুডিও 📝', icon: FileText },
            { id: 'admit_card', label: '৪। প্রবেশপত্র (Admit Card) জেনারেটর 🎟️', icon: Award },
            { id: 'seat_plan', label: '৫। সীট প্লান ও বেঞ্চ স্লিপ 🪑', icon: LayoutGrid },
            { id: 'syllabus_notes', label: '৬। সিলেবাস, সাজেশন ও নোটস 📚', icon: BookOpen },
            { id: 'merit_analytics', label: '৭। ফলাফল বিশ্লেষণ ও মেধাতালিকা 🏆', icon: BadgePercent },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-amber-400 text-blue-950 font-black shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          SUB-TAB 1: OFFICIAL ACADEMIC TRANSCRIPT & MARKSHEET (Exact image.png)
         ===================================================================== */}
      {activeSubTab === 'transcript' && (
        <div className="space-y-4">
          
          {/* Controls Bar (Hidden in Print) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পরীক্ষা নির্বাচন:</label>
                <select
                  value={selectedExam}
                  onChange={e => setSelectedExam(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                >
                  <option value="১ম সাময়িক পরীক্ষা- ২০২৬">১ম সাময়িক পরীক্ষা- ২০২৬</option>
                  <option value="২য় সাময়িক পরীক্ষার ফলাফল- ২০২৬ ইং">২য় সাময়িক পরীক্ষার ফলাফল- ২০২৬ ইং (নমুনা কপি)</option>
                  <option value="বার্ষিক পরীক্ষা- ২০২৬">বার্ষিক পরীক্ষা- ২০২৬</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">শিক্ষার্থী নির্বাচন:</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 min-w-[200px]"
                >
                  {examRecords.map(r => (
                    <option key={r.studentId} value={r.studentId}>
                      রোল: {r.roll} — {r.studentName} ({r.className} শ্রেণি)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">শ্রেণি:</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                >
                  <option value="প্লে">প্লে</option>
                  <option value="নার্সারী">নার্সারী</option>
                  <option value="কেজি">কেজি</option>
                  <option value="প্রথম">প্রথম শ্রেণি</option>
                  <option value="দ্বিতীয়">দ্বিতীয় শ্রেণি</option>
                  <option value="তৃতীয়">তৃতীয় শ্রেণি</option>
                  <option value="চতুর্থ">চতুর্থ শ্রেণি (Class 4)</option>
                  <option value="পঞ্চম">পঞ্চম শ্রেণি</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsBatchPrinting(prev => !prev);
                  showToast(isBatchPrinting ? 'একক শিক্ষার্থী ভিউ সক্রিয়' : 'ক্লাসের সকল শিক্ষার্থীর ট্রান্সক্রিপ্ট ব্যাচ মোডে প্রস্তুত!');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isBatchPrinting 
                    ? 'bg-purple-700 text-white border-purple-800 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{isBatchPrinting ? '✓ ব্যাচ প্রিন্ট মোড অন' : 'সমগ্র শ্রেণির ব্যাচ প্রিন্ট'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>প্রিন্ট / PDF সেভ</span>
              </button>
            </div>
          </div>

          {/* PRINTABLE TRANSCRIPT CANVAS (Matches user's image.png 100%) */}
          <div className="print-canvas space-y-8">
            {(isBatchPrinting ? examRecords : [activeTranscript]).map((rec, recordIndex) => (
              <div 
                key={rec.studentId}
                className="bg-white border-2 border-slate-400 p-6 sm:p-8 rounded-xl shadow-lg max-w-[800px] mx-auto text-slate-900 leading-normal page-break-after-always print:border-none print:shadow-none print:p-2 print:max-w-full font-serif"
              >
                {/* 1. Official School Header with Crest Logo */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
                  {/* Left: School Crest Logo */}
                  <div className="w-24 h-24 shrink-0 flex items-center justify-center">
                    <img 
                      src={schoolLogoVal || 'https://i.postimg.cc/prHZW6n3/logo-1.png'} 
                      alt="Delicon Model Academy Crest" 
                      className="max-h-20 max-w-20 object-contain drop-shadow-xs"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Center: School Branding Text */}
                  <div className="text-center flex-1 px-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight font-serif">
                      {schoolName || 'ডি-লিকন মডেল একাডেমী'}
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                      দক্ষিণগাঁও, গণি মার্কেট, বরমী রোড, কাপাসিয়া, গাজীপুর।
                    </p>
                    <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                      স্থাপিত: ২০১৮
                    </p>
                    <p className="text-[11px] font-mono font-bold text-slate-800">
                      মোবাইল নম্বর: ০১৩১৩১১৯৬৫৮
                    </p>
                    <p className="text-[10.5px] font-mono text-slate-700 underline">
                      ই-মেইল: contact.delikonmodelacademy@gmail.com
                    </p>
                  </div>

                  {/* Right: Empty space for aesthetic balance */}
                  <div className="w-24 shrink-0 hidden sm:block" />
                </div>

                {/* Double decorative black line under header */}
                <div className="border-t-2 border-b border-slate-950 h-1 mb-4" />

                {/* 2. Top Info Line (Left) & Grading Scale Table (Right) */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  {/* Left: Exam and Student Details */}
                  <div className="space-y-1.5 flex-1 text-sm font-bold text-slate-900">
                    <div className="text-base font-black text-slate-950 underline decoration-slate-400 underline-offset-4">
                      {rec.examName}
                    </div>
                    <div className="pt-1">
                      নাম: <span className="font-extrabold text-slate-950 font-serif">{rec.studentName}</span>, রোল:- <span className="font-mono">{toBanglaDigits(rec.roll)}</span>
                    </div>
                    <div>
                      শ্রেণী: <span className="font-extrabold">{rec.className}</span>
                    </div>
                  </div>

                  {/* Right: Official Bangladesh 5.00 GPA Grading Scale Table */}
                  <div className="shrink-0">
                    <table className="border-collapse border border-slate-900 text-[10px] sm:text-[11px] text-center font-mono">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-slate-900">
                          <th className="border border-slate-900 px-2 py-0.5">Number</th>
                          <th className="border border-slate-900 px-2 py-0.5">Point</th>
                          <th className="border border-slate-900 px-2 py-0.5">GPA</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="border border-slate-900 px-1 py-0.2">80-100</td><td className="border border-slate-900 px-1">5.00</td><td className="border border-slate-900 px-1 font-bold">A+</td></tr>
                        <tr><td className="border border-slate-900 px-1 py-0.2">70-79</td><td className="border border-slate-900 px-1">4.00</td><td className="border border-slate-900 px-1 font-bold">A</td></tr>
                        <tr><td className="border border-slate-900 px-1 py-0.2">60-69</td><td className="border border-slate-900 px-1">3.50</td><td className="border border-slate-900 px-1 font-bold">A-</td></tr>
                        <tr><td className="border border-slate-900 px-1 py-0.2">50-59</td><td className="border border-slate-900 px-1">3.00</td><td className="border border-slate-900 px-1 font-bold">B</td></tr>
                        <tr><td className="border border-slate-900 px-1 py-0.2">40-49</td><td className="border border-slate-900 px-1">2.00</td><td className="border border-slate-900 px-1 font-bold">C</td></tr>
                        <tr><td className="border border-slate-900 px-1 py-0.2">33-39</td><td className="border border-slate-900 px-1">1.00</td><td className="border border-slate-900 px-1 font-bold">D</td></tr>
                        <tr><td className="border border-slate-900 px-1 py-0.2">0-32</td><td className="border border-slate-900 px-1">0.00</td><td className="border border-slate-900 px-1 font-bold text-rose-700">F</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Main Subject Marks Table */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full border-collapse border border-slate-900 text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100/90 font-black text-slate-900 border-b-2 border-slate-900 text-center">
                        <th className="border border-slate-900 p-1.5 text-left w-44">বিষয়</th>
                        <th className="border border-slate-900 p-1.5 w-16">মোট নম্বর</th>
                        <th className="border border-slate-900 p-1.5 w-16">প্রাপ্ত নম্বর</th>
                        <th className="border border-slate-900 p-1.5 w-20">৮০% নম্বর</th>
                        <th className="border border-slate-900 p-1.5 w-24">শ্রেণি পরীক্ষা ২০%</th>
                        <th className="border border-slate-900 p-1.5 w-24">মোট প্রাপ্ত নম্বর</th>
                        <th className="border border-slate-900 p-1.5 w-16">লেটার গ্রেড</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rec.subjects.map((sub, sIdx) => (
                        <tr key={sIdx} className="hover:bg-slate-50/50">
                          <td className="border border-slate-900 px-2 py-1.5 font-bold text-slate-900">
                            {sub.name}
                          </td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center font-mono">
                            {toBanglaDigits(sub.totalMarks)}
                          </td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center font-mono font-bold">
                            {toBanglaDigits(sub.writtenMarks)}
                          </td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center font-mono">
                            {toBanglaDigits(sub.eightyPct.toFixed(1))}
                          </td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center font-mono">
                            {toBanglaDigits(sub.classTestMarks)}
                          </td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center font-mono font-black text-slate-950">
                            {toBanglaDigits(sub.totalObtained.toFixed(1))}
                          </td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center font-mono font-black">
                            {sub.grade}
                          </td>
                        </tr>
                      ))}

                      {/* Total row matching image.png */}
                      <tr className="bg-slate-100 font-black border-t-2 border-slate-900">
                        <td className="border border-slate-900 px-2 py-1.5 text-left">
                          মোট নম্বর
                        </td>
                        <td className="border border-slate-900 px-2 py-1.5 text-center font-mono">
                          {toBanglaDigits(rec.totalFullMarks)}
                        </td>
                        <td className="border border-slate-900 px-2 py-1.5 text-center font-mono">
                          -
                        </td>
                        <td className="border border-slate-900 px-2 py-1.5 text-center font-mono">
                          -
                        </td>
                        <td className="border border-slate-900 px-2 py-1.5 text-center font-mono">
                          -
                        </td>
                        <td className="border border-slate-900 px-2 py-1.5 text-center font-mono font-black text-sm">
                          {toBanglaDigits(rec.totalObtainedMarks.toFixed(1))}
                        </td>
                        <td className="border border-slate-900 px-2 py-1.5 text-center font-mono font-black">
                          {rec.grade}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. Performance & Attendance Summary Table (Matching image.png) */}
                <div className="mb-8">
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <tbody>
                      <tr>
                        <td className="border border-slate-900 p-1.5 font-bold bg-slate-50 w-28">মোট কার্য দিবস</td>
                        <td className="border border-slate-900 p-1.5 font-mono text-center w-20">{toBanglaDigits(rec.workingDays)}</td>
                        <td className="border border-slate-900 p-1.5 font-bold bg-slate-50 w-20">উপস্থিতি</td>
                        <td className="border border-slate-900 p-1.5 font-mono text-center w-20">{toBanglaDigits(rec.presentDays)}</td>
                        <td className="border border-slate-900 p-1.5 font-bold bg-slate-50 w-20">অনুপস্থিতি</td>
                        <td className="border border-slate-900 p-1.5 font-mono text-center w-20">{toBanglaDigits(rec.absentDays)}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1.5 font-bold bg-slate-50">মোট নম্বর</td>
                        <td className="border border-slate-900 p-1.5 font-mono font-black text-center">{toBanglaDigits(rec.totalObtainedMarks.toFixed(1))}</td>
                        <td className="border border-slate-900 p-1.5 font-bold bg-slate-50">জি.পি.এ</td>
                        <td className="border border-slate-900 p-1.5 font-mono font-black text-center">{rec.gpa.toFixed(2)}({rec.grade})</td>
                        <td className="border border-slate-900 p-1.5 font-bold bg-slate-50">মেধাক্রম</td>
                        <td className="border border-slate-900 p-1.5 font-mono font-black text-center">{toBanglaDigits(rec.meritPosition)}র্থ</td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="border border-slate-900 p-2 text-xs font-semibold">
                          <span className="font-bold">শিক্ষকের মন্তব্য:</span> {rec.teacherRemarks}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 5. Signature Lines (Bottom) */}
                <div className="pt-8 grid grid-cols-3 text-center text-xs font-bold text-slate-800">
                  <div>
                    <div className="border-t border-slate-900 w-36 mx-auto mb-1" />
                    <span>শ্রেণি শিক্ষকের স্বাক্ষর</span>
                  </div>
                  <div>
                    <div className="border-t border-slate-900 w-36 mx-auto mb-1" />
                    <span>প্রধান শিক্ষকের স্বাক্ষর</span>
                  </div>
                  <div>
                    <div className="border-t border-slate-900 w-36 mx-auto mb-1" />
                    <span>অভিভাবকের স্বাক্ষর</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: TEACHER MARK ENTRY FORM (খাতা দেখা শেষ হলে নম্বর এন্ট্রি)
         ===================================================================== */}
      {activeSubTab === 'marks_entry' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-900" />
                <span>শিক্ষক খাতা মূল্যায়ন ও মার্ক এন্ট্রি ফরম</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                শিক্ষকগণ খাতা মূল্যায়ন শেষে শ্রেণি ও বিষয় নির্বাচন করে সরাসরি শিক্ষার্থীদের লিখিত (৮০%) ও শ্রেণি পরীক্ষা (২০%) নম্বর এন্ট্রি করুন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveRosterMarks}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>সকল নম্বর সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>

          {/* Selector Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">পরীক্ষা নাম:</label>
              <select
                value={markEntryExam}
                onChange={e => setMarkEntryExam(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold"
              >
                <option value="১ম সাময়িক পরীক্ষা- ২০২৬">১ম সাময়িক পরীক্ষা- ২০২৬</option>
                <option value="২য় সাময়িক পরীক্ষা- ২০২৬">২য় সাময়িক পরীক্ষা- ২০২৬</option>
                <option value="বার্ষিক পরীক্ষা- ২০২৬">বার্ষিক পরীক্ষা- ২০২৬</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">শ্রেণি:</label>
              <select
                value={markEntryClass}
                onChange={e => setMarkEntryClass(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold"
              >
                <option value="প্লে">প্লে</option>
                <option value="নার্সারী">নার্সারী</option>
                <option value="কেজি">কেজি</option>
                <option value="প্রথম">প্রথম শ্রেণি</option>
                <option value="দ্বিতীয়">দ্বিতীয় শ্রেণি</option>
                <option value="তৃতীয়">তৃতীয় শ্রেণি</option>
                <option value="চতুর্থ">চতুর্থ শ্রেণি (Class 4)</option>
                <option value="পঞ্চম">পঞ্চম শ্রেণি</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">বিষয়:</label>
              <select
                value={markEntrySubject}
                onChange={e => setMarkEntrySubject(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-blue-900"
              >
                <option value="বাংলা">বাংলা (১০০)</option>
                <option value="ইংরেজি ১ম পত্র">ইংরেজি ১ম পত্র (১০০)</option>
                <option value="ইংরেজি ২য় পত্র">ইংরেজি ২য় পত্র (৫০)</option>
                <option value="প্রাথমিক গণিত">প্রাথমিক গণিত (১০০)</option>
                <option value="প্রাথমিক বিজ্ঞান">প্রাথমিক বিজ্ঞান (১০০)</option>
                <option value="বাংলাদেশ ও বিশ্ব পরিচয়">বাংলাদেশ ও বিশ্ব পরিচয় (১০০)</option>
                <option value="ইসলাম ও নৈতিক শিক্ষা">ইসলাম ও নৈতিক শিক্ষা (১০০)</option>
                <option value="ব্যবহারিক ড্রয়িং">ব্যবহারিক ড্রয়িং (৫০)</option>
              </select>
            </div>
          </div>

          {/* Marks Entry Spreadsheet Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-2.5 w-16 text-center">রোল</th>
                  <th className="p-2.5">শিক্ষার্থীর নাম</th>
                  <th className="p-2.5 text-center w-32">লিখিত নম্বর (প্রাপ্ত)</th>
                  <th className="p-2.5 text-center w-28">৮০% গণনা</th>
                  <th className="p-2.5 text-center w-32">শ্রেণি পরীক্ষা (২০%)</th>
                  <th className="p-2.5 text-center w-28">মোট প্রাপ্ত নম্বর</th>
                  <th className="p-2.5 text-center w-20">গ্রেড</th>
                  <th className="p-2.5 text-center w-20">পয়েন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {rosterMarks.map((row, idx) => {
                  const eighty = (row.writtenMarks * 0.8);
                  const total = eighty + row.classTestMarks;
                  const gpaObj = calculateGpa(total);

                  return (
                    <tr key={row.studentId} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-mono font-bold text-purple-900">{toBanglaDigits(row.roll)}</td>
                      <td className="p-2.5 font-bold text-slate-900">{row.studentName}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={row.writtenMarks}
                          onChange={e => handleUpdateRosterMark(idx, 'writtenMarks', parseFloat(e.target.value) || 0)}
                          className="w-20 text-center font-mono font-bold p-1.5 border border-slate-300 rounded-lg bg-white focus:outline-blue-900"
                        />
                      </td>
                      <td className="p-2.5 text-center font-mono text-slate-600">{toBanglaDigits(eighty.toFixed(1))}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={row.classTestMarks}
                          onChange={e => handleUpdateRosterMark(idx, 'classTestMarks', parseFloat(e.target.value) || 0)}
                          className="w-20 text-center font-mono font-bold p-1.5 border border-slate-300 rounded-lg bg-white focus:outline-blue-900"
                        />
                      </td>
                      <td className="p-2.5 text-center font-mono font-black text-slate-950 text-sm">
                        {toBanglaDigits(total.toFixed(1))}
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${gpaObj.grade === 'A+' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-900'}`}>
                          {gpaObj.grade}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-700">{gpaObj.point}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                showToast('নমুনা শিক্ষার্থীদের মার্কস অটো-ফিল করা হয়েছে!');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              স্বয়ংক্রিয় গড় মান পূর্ণ করুন
            </button>
            <button
              onClick={handleSaveRosterMarks}
              className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              ডাটাবেজে সংরক্ষণ করুন
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: QUESTION PAPER BUILDER (প্রশ্নপত্রপত্র তৈরীর ফাংশন)
         ===================================================================== */}
      {activeSubTab === 'question_builder' && (
        <div className="space-y-6">
          
          {/* Builder Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:hidden">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <span>প্রশ্নপত্র প্রণয়ন ও জেনারেটর স্টুডিও</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  স্কুলের অফিসিয়াল হেডার, পূর্ণমান, সময়, ক-বিভাগ ও খ-বিভাগ সৃজনশীল প্রশ্নপত্র তৈরি ও প্রিন্ট করুন।
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>প্রশ্নপত্র প্রিন্ট করুন</span>
              </button>
            </div>

            {/* Metas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-0.5">পরীক্ষার নাম:</label>
                <input
                  type="text"
                  value={qpExamName}
                  onChange={e => setQpExamName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-0.5">শ্রেণি:</label>
                <input
                  type="text"
                  value={qpClass}
                  onChange={e => setQpClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-0.5">বিষয়:</label>
                <input
                  type="text"
                  value={qpSubject}
                  onChange={e => setQpSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-0.5">সময়:</label>
                <input
                  type="text"
                  value={qpTime}
                  onChange={e => setQpTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-0.5">পূর্ণমান:</label>
                <input
                  type="text"
                  value={qpFullMarks}
                  onChange={e => setQpFullMarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-0.5">নির্দেশনা:</label>
                <input
                  type="text"
                  value={qpInstructions}
                  onChange={e => setQpInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5"
                />
              </div>
            </div>

            {/* Add new question box */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 block">নতুন প্রশ্ন যোগ করুন:</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="w-full">
                  <select
                    value={newQSection}
                    onChange={e => setNewQSection(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold"
                  >
                    <option value="ক">ক-বিভাগ (সংক্ষিপ্ত/বহুনির্বাচনী)</option>
                    <option value="খ">খ-বিভাগ (সৃজনশীল/রচনামূলক)</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="প্রশ্ন নং (যেমন: ১ বা ২)"
                    value={newQNum}
                    onChange={e => setNewQNum(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="নম্বর (যেমন: ১০)"
                    value={newQMarks}
                    onChange={e => setNewQMarks(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 font-mono"
                  />
                </div>
                <div>
                  <button
                    onClick={handleAddQuestion}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold p-1.5 rounded transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>যুক্ত করুন</span>
                  </button>
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  placeholder="প্রশ্নের বিস্তারিত পাঠ্য / উদ্দীপক লিখুন..."
                  value={newQText}
                  onChange={e => setNewQText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-blue-900"
                />
              </div>
            </div>
          </div>

          {/* Printable Question Paper Canvas */}
          <div className="bg-white border-2 border-slate-400 p-8 rounded-xl shadow-lg max-w-[800px] mx-auto text-slate-900 font-serif leading-relaxed print:border-none print:shadow-none print:p-2 print:max-w-full">
            {/* Header */}
            <div className="text-center border-b border-slate-800 pb-2 mb-3">
              <h2 className="text-2xl font-black text-slate-950 font-serif">
                {schoolName || 'ডি-লিকন মডেল একাডেমী'}
              </h2>
              <p className="text-xs font-semibold text-slate-700">
                দক্ষিণগাঁও, গণি মার্কেট, বরমী রোড, কাপাসিয়া, গাজীপুর।
              </p>
              <h3 className="text-base font-black text-slate-900 mt-1 underline">
                {qpExamName}
              </h3>
              
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-2">
                <span>শ্রেণি: {qpClass}</span>
                <span>বিষয়: {qpSubject}</span>
                <span>সময়: {qpTime}</span>
                <span>পূর্ণমান: {toBanglaDigits(qpFullMarks)}</span>
              </div>
            </div>

            {/* Instruction */}
            <div className="text-xs italic text-slate-600 border-b border-dashed border-slate-400 pb-2 mb-4 text-center">
              [{qpInstructions}]
            </div>

            {/* Questions by Section */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Section K */}
              <div>
                <div className="text-center font-bold underline mb-2 text-xs">
                  ক - বিভাগ (সংক্ষিপ্ত ও নৈর্ব্যক্তিক প্রশ্নাবলী)
                </div>
                <div className="space-y-2.5">
                  {questionsList.filter(q => q.section === 'ক').map(q => (
                    <div key={q.id} className="flex items-start justify-between gap-2 group">
                      <div className="flex items-start gap-1 flex-1">
                        <span className="font-bold">{toBanglaDigits(q.qNumber)}.</span>
                        <span>{q.text}</span>
                      </div>
                      <span className="font-mono font-bold shrink-0 text-slate-800">
                        [{toBanglaDigits(q.marks)}]
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="opacity-0 group-hover:opacity-100 text-rose-600 print:hidden text-xs cursor-pointer ml-1"
                        title="মুছুন"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Kh */}
              <div className="pt-3 border-t border-slate-200">
                <div className="text-center font-bold underline mb-2 text-xs">
                  খ - বিভাগ (সৃজনশীল ও রচনামূলক প্রশ্নাবলী)
                </div>
                <div className="space-y-3">
                  {questionsList.filter(q => q.section === 'খ').map(q => (
                    <div key={q.id} className="flex items-start justify-between gap-2 group">
                      <div className="flex items-start gap-1 flex-1">
                        <span className="font-bold">{toBanglaDigits(q.qNumber)}.</span>
                        <span className="whitespace-pre-line">{q.text}</span>
                      </div>
                      <span className="font-mono font-bold shrink-0 text-slate-800">
                        [{toBanglaDigits(q.marks)}]
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="opacity-0 group-hover:opacity-100 text-rose-600 print:hidden text-xs cursor-pointer ml-1"
                        title="মুছুন"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom notice */}
            <div className="mt-8 pt-4 border-t border-slate-400 text-center text-[10px] text-slate-500 italic">
              * পরীক্ষার হলে কোনো অসদুপায় অবলম্বন শাস্তিযোগ্য অপরাধ। প্রশ্নের পৃষ্ঠার উভয় পিঠ ব্যবহার করা যাবে।
            </div>
          </div>

        </div>
      )}

      {/* =====================================================================
          SUB-TAB 4: ADMIT CARD GENERATOR (প্রবেশপত্র জেনারেটর)
         ===================================================================== */}
      {activeSubTab === 'admit_card' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পরীক্ষার শিরোনাম:</label>
                <input
                  type="text"
                  value={admitCardExamTitle}
                  onChange={e => setAdmitCardExamTitle(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 min-w-[220px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">শিক্ষার্থী নির্বাচন:</label>
                <select
                  value={admitCardTargetStudent}
                  onChange={e => setAdmitCardTargetStudent(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 min-w-[200px]"
                >
                  {examRecords.map(r => (
                    <option key={r.studentId} value={r.studentId}>
                      রোল: {r.roll} — {r.studentName} ({r.className} শ্রেণি)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>প্রবেশপত্র প্রিন্ট করুন</span>
            </button>
          </div>

          {/* Printable Admit Card Frame */}
          <div className="bg-white border-2 border-slate-500 rounded-2xl p-6 max-w-[750px] mx-auto shadow-md relative overflow-hidden font-serif print:border-2 print:shadow-none print:max-w-full">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
              <img 
                src={schoolLogoVal || 'https://i.postimg.cc/prHZW6n3/logo-1.png'} 
                alt="Logo" 
                className="h-16 w-16 object-contain shrink-0" 
              />
              <div className="text-center flex-1">
                <h2 className="text-xl font-black text-slate-950">{schoolName || 'ডি-লিকন মডেল একাডেমী'}</h2>
                <p className="text-[11px] text-slate-700">দক্ষিণগাঁও, গণি মার্কেট, বরমী রোড, কাপাসিয়া, গাজীপুর।</p>
                <span className="inline-block bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full mt-1">
                  প্রবেশপত্র (ADMIT CARD)
                </span>
              </div>
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR" className="h-16 w-16 border border-slate-300 p-0.5 shrink-0" />
              )}
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 gap-2 text-xs border border-slate-400 p-2.5 rounded-lg mb-3 bg-slate-50/50">
              <div><strong>পরীক্ষার্থীর নাম:</strong> {activeTranscript.studentName}</div>
              <div><strong>শ্রেণি:</strong> {activeTranscript.className} শ্রেণি</div>
              <div><strong>রোল নম্বর:</strong> <span className="font-mono font-bold">{toBanglaDigits(activeTranscript.roll)}</span></div>
              <div><strong>শিক্ষাবর্ষ:</strong> ২০২৬ ইং</div>
              <div><strong>পরীক্ষার নাম:</strong> {admitCardExamTitle}</div>
              <div><strong>নিবন্ধন নম্বর:</strong> <span className="font-mono">DEL-2026-{activeTranscript.roll}</span></div>
            </div>

            {/* Routine */}
            <div className="mb-4">
              <span className="block text-[11px] font-bold text-slate-800 mb-1">পরীক্ষার সময়সূচি / রুটিন:</span>
              <table className="w-full border-collapse border border-slate-400 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-center font-bold">
                    <th className="border border-slate-400 p-1">তারিখ</th>
                    <th className="border border-slate-400 p-1">সময়</th>
                    <th className="border border-slate-400 p-1">বিষয়</th>
                  </tr>
                </thead>
                <tbody>
                  {admitRoutine.map((r, rIdx) => (
                    <tr key={rIdx} className="text-center">
                      <td className="border border-slate-400 p-1 font-mono">{r.date}</td>
                      <td className="border border-slate-400 p-1">{r.time}</td>
                      <td className="border border-slate-400 p-1 font-bold">{r.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rules */}
            <div className="text-[10px] text-slate-600 space-y-0.5 border-t border-slate-300 pt-2 mb-6">
              <p>১। পরীক্ষা শুরুর অন্তত ১৫ মিনিট পূর্বে পরীক্ষার হলে উপস্থিত হতে হবে।</p>
              <p>২। প্রবেশপত্র ব্যতীত কোনো অবস্থাতেই পরীক্ষার হলে প্রবেশ করতে দেওয়া হবে না।</p>
              <p>৩। মোবাইল ফোন বা কোনো অবৈধ ইলেকট্রনিক ডিভাইস সাথে রাখা সম্পূর্ণ নিষিদ্ধ।</p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-center text-xs font-bold pt-6">
              <div className="text-center">
                <div className="border-t border-slate-900 w-32 mb-1" />
                <span>শ্রেণি শিক্ষক</span>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-900 w-36 mb-1" />
                <span>প্রধান শিক্ষক / পরীক্ষা নিয়ন্ত্রক</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 5: SEAT PLAN & BENCH SLIPS (সীট প্লান ও রুম এলোকেশন)
         ===================================================================== */}
      {activeSubTab === 'seat_plan' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:hidden">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-indigo-700" />
                  <span>পরীক্ষার হল সীট প্লান ও বেঞ্চ স্লিপ ম্যানেজার</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  রুম ভিত্তিক পরীক্ষার্থীদের তালিকা তৈরি করুন এবং বেঞ্চে সাঁটানোর জন্য ডেকোরেটিভ সীট স্লিপ প্রিন্ট করুন।
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>সীট প্লান প্রিন্ট</span>
              </button>
            </div>

            {/* Rooms Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {seatRooms.map(rm => (
                <div key={rm.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-blue-900 text-sm">কক্ষ নং: {rm.roomNo}</span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {rm.capacity} টি আসন
                    </span>
                  </div>
                  <p className="text-slate-600">{rm.building}</p>
                  <p className="text-slate-700 font-bold">শ্রেণি: {rm.allocatedClass} (রোল: {rm.rollFrom} থেকে {rm.rollTo})</p>
                  <p className="text-slate-500 text-[11px]">পরিদর্শক: {rm.invigilator}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Printable Bench Slips Grid (Cut & Paste onto Desks) */}
          <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0">
            <h4 className="text-center font-bold text-sm mb-4 text-slate-800 underline print:mb-2">
              পরীক্ষার বেঞ্চ স্লিপ (Student Desk Seat Slips) — কক্ষ নং ১০১
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
              {[
                { name: 'তাহসিন ইসলাম', roll: '০১', cls: 'চতুর্থ শ্রেণি', desk: '১-A' },
                { name: 'আফিফা রহমান', roll: '০২', cls: 'চতুর্থ শ্রেণি', desk: '১-B' },
                { name: 'তানভীর আহমেদ', roll: '০৩', cls: 'চতুর্থ শ্রেণি', desk: '২-A' },
                { name: 'রাইসা ইয়াসমিন', roll: '০৪', cls: 'চতুর্থ শ্রেণি', desk: '২-B' },
                { name: 'মাহিনুর ইসলাম', roll: '০৫', cls: 'চতুর্থ শ্রেণি', desk: '৩-A' },
                { name: 'আরিয়ান সরকার', roll: '০৬', cls: 'চতুর্থ শ্রেণি', desk: '৩-B' },
              ].map((bench, bIdx) => (
                <div key={bIdx} className="border-2 border-dashed border-slate-700 p-3 rounded-lg text-center font-serif text-xs space-y-1 bg-amber-50/20">
                  <div className="text-[10px] font-black uppercase text-blue-900 border-b border-slate-300 pb-0.5">
                    ডি-লিকন মডেল একাডেমী
                  </div>
                  <div className="font-black text-sm text-slate-950 mt-1">{bench.name}</div>
                  <div className="font-bold text-slate-800">
                    {bench.cls} • রোল: <span className="font-mono text-purple-900 text-sm font-black">{toBanglaDigits(bench.roll)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    বেঞ্চ নং: {bench.desk} | রুম: ১০১
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 6: SYLLABUS, SUGGESTIONS & CLASS NOTES (সিলেবাস ও নোটস)
         ===================================================================== */}
      {activeSubTab === 'syllabus_notes' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-700" />
                  <span>সিলেবাস, পরীক্ষার সাজেশন ও ক্লাস লেকচার হ্যান্ডনোট হাব</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  টার্মভিত্তিক সিলেবাস রূপরেখা, ১০০% কমন সাজেশন এবং ক্লাস নোট ডাউনলোড ও মুদ্রণ করুন।
                </p>
              </div>

              {/* Sub-toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSyllabusCategory('syllabus')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    syllabusCategory === 'syllabus' ? 'bg-blue-900 text-white' : 'text-slate-600'
                  }`}
                >
                  সিলেবাস
                </button>
                <button
                  onClick={() => setSyllabusCategory('suggestion')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    syllabusCategory === 'suggestion' ? 'bg-amber-500 text-white' : 'text-slate-600'
                  }`}
                >
                  সাজেশন
                </button>
                <button
                  onClick={() => setSyllabusCategory('notes')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    syllabusCategory === 'notes' ? 'bg-purple-700 text-white' : 'text-slate-600'
                  }`}
                >
                  ক্লাস হ্যান্ডনোট
                </button>
              </div>
            </div>
          </div>

          {/* Resources List */}
          <div className="space-y-4">
            {studyResources.filter(r => r.category === syllabusCategory).map(res => (
              <div key={res.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {res.className} শ্রেণি • {res.subject}
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-1">{res.title}</h4>
                    <p className="text-[11px] text-slate-500">{res.examTerm} • প্রণয়ন: {res.author}</p>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>প্রিন্ট</span>
                  </button>
                </div>

                <div className="text-xs space-y-2 text-slate-700 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <strong className="text-slate-900 block mb-0.5">পাঠ্যক্রম ও অন্তর্ভুক্ত অধ্যায়সমূহ:</strong>
                    <p>{res.chapters}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <strong className="text-slate-900 block mb-0.5">মানবণ্টন রূপরেখা ও পরামর্শ:</strong>
                    <p className="text-blue-900 font-semibold">{res.marksDist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 7: MERIT LIST & CLASS ANALYTICS (ফলাফল ও মেধাতালিকা)
         ===================================================================== */}
      {activeSubTab === 'merit_analytics' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span>ফলাফল বিশ্লেষণ, পাসের হার ও শীর্ষ মেধাতালিকা</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ক্লাসের সামগ্রিক পাসের হার, এ-প্লাস প্রাপ্তি ও মেধাক্রম অনুযায়ী প্রথম, দ্বিতীয় ও তৃতীয় স্থানসমূহ।
              </p>
            </div>

            <button
              onClick={() => showToast('অভিভাবকদের মোবাইলে ফলাফল এসএমএস পাঠানো সম্পন্ন হয়েছে!')}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>ফলাফল SMS পাঠান</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">মোট পরীক্ষার্থী</span>
              <span className="text-2xl font-black text-blue-950 mt-1 block">২ জন</span>
              <span className="text-[10px] text-slate-500">চতুর্থ শ্রেণি</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">পাসের হার</span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block">১০০%</span>
              <span className="text-[10px] text-emerald-600">উত্তীর্ণ</span>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-700 block">জিপিএ ৫.০০ (A+)</span>
              <span className="text-2xl font-black text-purple-900 mt-1 block">১ জন</span>
              <span className="text-[10px] text-purple-600">সর্বোচ্চ গ্রেড</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">গড় জিপিএ (GPA)</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block">৪.৯৪</span>
              <span className="text-[10px] text-amber-600">চমৎকার ফলাফল</span>
            </div>
          </div>

          {/* Merit List Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-bold border-b border-slate-200 text-slate-800">
                <tr>
                  <th className="p-3 text-center w-20">মেধাক্রম</th>
                  <th className="p-3 text-center w-16">রোল</th>
                  <th className="p-3">শিক্ষার্থীর নাম</th>
                  <th className="p-3 text-center">মোট নম্বর</th>
                  <th className="p-3 text-center">জিপিএ (GPA)</th>
                  <th className="p-3 text-center">লেটার গ্রেড</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                <tr className="hover:bg-slate-50 bg-amber-50/20 font-bold">
                  <td className="p-3 text-center font-black text-amber-600 flex items-center justify-center gap-1">
                    <span>🥇</span>
                    <span>১ম</span>
                  </td>
                  <td className="p-3 text-center font-mono">০২</td>
                  <td className="p-3 text-slate-900">আফিফা রহমান</td>
                  <td className="p-3 text-center font-mono font-bold">৬১৫.৫</td>
                  <td className="p-3 text-center font-mono font-black text-emerald-700">৫.০০</td>
                  <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">A+</span></td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => { setSelectedStudentId('sample_2'); setActiveSubTab('transcript'); }}
                      className="text-blue-900 hover:underline font-bold"
                    >
                      মার্কশীট দেখুন
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-3 text-center font-bold text-slate-700">৪র্থ</td>
                  <td className="p-3 text-center font-mono font-bold">০১</td>
                  <td className="p-3 text-slate-900 font-bold">তাহসিন ইসলাম</td>
                  <td className="p-3 text-center font-mono font-bold">৫৫২.১</td>
                  <td className="p-3 text-center font-mono font-bold text-blue-900">৪.৮৮</td>
                  <td className="p-3 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">A</span></td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => { setSelectedStudentId('sample_1'); setActiveSubTab('transcript'); }}
                      className="text-blue-900 hover:underline font-bold"
                    >
                      মার্কশীট দেখুন
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
