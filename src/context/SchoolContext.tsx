/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Student, 
  Employee, 
  AttendanceLog, 
  SmsLog, 
  Lead, 
  Notice, 
  StationeryItem, 
  TransportRoute, 
  ExamResult, 
  DevProject,
  UserRole,
  PortalCredential,
  AcademicDraft,
  Requisition,
  LandingSection,
  ExamMark,
  MeritStudent,
  AcademicEvent,
  LibraryResource
} from '../types';
import { 
  initialStudents, 
  initialEmployees, 
  initialNotices, 
  initialStationery, 
  initialRoutes, 
  initialResults, 
  initialDevProjects,
  initialAcademicEvents,
  initialLibraryResources
} from '../data/mockData';
import fallbackDb from '../fallbackDb';

const getFallbackVal = (key: string, defaultValue: any) => {
  if (fallbackDb && fallbackDb[key]) {
    try {
      const val = fallbackDb[key];
      if (typeof val === 'string' && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
        return JSON.parse(val);
      }
      return val;
    } catch (e) {
      console.warn(`Failed to parse fallbackDb key ${key}`, e);
    }
  }
  return defaultValue;
};

interface SchoolContextProps {
  students: Student[];
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  smsLogs: SmsLog[];
  leads: Lead[];
  notices: Notice[];
  stationery: StationeryItem[];
  routes: TransportRoute[];
  results: ExamResult[];
  devProjects: DevProject[];
  portalCredentials: PortalCredential[];
  academicDrafts: AcademicDraft[];
  requisitions: Requisition[];
  sections: LandingSection[];
  examMarks: ExamMark[];
  
  // Video Customizer Arrays and Actions
  dtubePlaylist: any[];
  culturalPlaylist: any[];
  updateDtubePlaylist: (playlist: any[]) => void;
  updateCulturalPlaylist: (playlist: any[]) => void;
  
  // Actions
  addLead: (lead: Omit<Lead, 'id' | 'status' | 'subDate'>) => void;
  updateLeadStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  simulateAttendanceScan: (targetId: string, targetType: 'student' | 'employee', scanType: 'Check-In' | 'Check-Out') => { success: boolean; message: string };
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  deleteNotice: (id: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'attendancePct' | 'homeworkStatus'>) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'paymentStatus'>) => void;
  updateStudentHomework: (id: string, status: 'Completed' | 'Pending' | 'Needs-Motivation') => void;
  receiveFees: (studentId: string, amount: number) => void;
  paySalary: (employeeId: string) => void;
  updateStationeryStock: (id: string, qtyChange: number) => void;
  updateRouteStatus: (id: string, status: 'Active' | 'Maintenance') => void;
  addDevProject: (project: Omit<DevProject, 'id'>) => void;
  updateDevProjectProgress: (id: string, progress: number, status: DevProject['status']) => void;
  updatePortalCredential: (role: UserRole, user: string, pass: string) => void;
  addAcademicDraft: (draft: Omit<AcademicDraft, 'id' | 'status'>) => void;
  editAcademicDraft: (id: string, title: string, content: string, className: string, category: AcademicDraft['category']) => void;
  updateDraftStatusAndComments: (id: string, status: AcademicDraft['status'], approvedBy?: string, comments?: string) => void;
  
  addRequisition: (req: Omit<Requisition, 'id' | 'status' | 'subDate' | 'paymentAmount'>) => void;
  receiveRequisitionPayment: (id: string, amount: number) => void;
  approveRequisitionByAssistant: (id: string) => void;
  approveRequisitionByPrincipal: (id: string) => void;
  rejectRequisition: (id: string, comments: string) => void;

  updateSectionSetting: (id: string, title: string, visible: boolean) => void;
  resetSections: () => void;
  addExamMark: (mark: Omit<ExamMark, 'id' | 'subDate'>) => void;
  saveExamMarksBulk: (marks: Omit<ExamMark, 'id' | 'subDate'>[]) => void;
  updateStudentId: (oldId: string, newId: string) => void;

  // Branding Customization
  schoolName: string;
  schoolSlogan: string;
  schoolLogoType: 'crest' | 'text' | 'image';
  schoolLogoVal: string;
  updateSchoolBranding: (name: string, slogan: string, logoType: 'crest' | 'text' | 'image', logoVal: string) => void;
  campusPhotos: { url: string; title: string; caption: string; }[];
  updateCampusPhotos: (photos: { url: string; title: string; caption: string; }[]) => void;
  meritStudents: MeritStudent[];
  updateMeritStudents: (students: MeritStudent[]) => void;

  academicEvents: AcademicEvent[];
  addAcademicEvent: (event: Omit<AcademicEvent, 'id'>) => void;
  editAcademicEvent: (id: string, event: Partial<AcademicEvent>) => void;
  deleteAcademicEvent: (id: string) => void;

  libraryResources: LibraryResource[];
  addLibraryResource: (resource: Omit<LibraryResource, 'id' | 'downloadCount' | 'publishDate'>) => void;
  editLibraryResource: (id: string, resource: Partial<LibraryResource>) => void;
  deleteLibraryResource: (id: string) => void;
  incrementDownloadCount: (id: string) => void;
}

const SchoolContext = createContext<SchoolContextProps | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolName, setSchoolName] = useState<string>(() => {
    const saved = localStorage.getItem('delicon_school_name');
    return saved !== null ? saved : getFallbackVal('delicon_school_name', 'ডিলিকন মডেল একাডেমী');
  });

  const [schoolSlogan, setSchoolSlogan] = useState<string>(() => {
    const saved = localStorage.getItem('delicon_school_slogan');
    const defaultSlogan = 'মন থেমে যাক মুগ্ধতায়, সন্তান হাসুক চিরন্তন শ্বাশত অমর শিক্ষায়';
    if (saved === 'খাতায় লিখে পাস নয়, পরম স্নেহে ও আদর্শে জাস্টিফাইড সুনাগরিক গড়ার বিশ্বস্ত আঙিনা') {
      localStorage.setItem('delicon_school_slogan', defaultSlogan);
      return defaultSlogan;
    }
    return saved !== null ? saved : getFallbackVal('delicon_school_slogan', defaultSlogan);
  });

  const [schoolLogoType, setSchoolLogoType] = useState<'crest' | 'text' | 'image'>(() => {
    const saved = localStorage.getItem('delicon_school_logotype');
    return (saved as 'crest' | 'text' | 'image') || getFallbackVal('delicon_school_logotype', 'image');
  });

  const [schoolLogoVal, setSchoolLogoVal] = useState<string>(() => {
    const saved = localStorage.getItem('delicon_school_logoval');
    return saved !== null ? saved : getFallbackVal('delicon_school_logoval', 'https://i.postimg.cc/prHZW6n3/logo-1.png');
  });

  const updateSchoolBranding = (name: string, slogan: string, logoType: 'crest' | 'text' | 'image', logoVal: string) => {
    setSchoolName(name);
    setSchoolSlogan(slogan);
    setSchoolLogoType(logoType);
    setSchoolLogoVal(logoVal);
    localStorage.setItem('delicon_school_name', name);
    localStorage.setItem('delicon_school_slogan', slogan);
    localStorage.setItem('delicon_school_logotype', logoType);
    localStorage.setItem('delicon_school_logoval', logoVal);
  };

  const [requisitions, setRequisitions] = useState<Requisition[]>(() => {
    const saved = localStorage.getItem('delicon_requisitions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return getFallbackVal('delicon_requisitions', [
      {
        id: 'req_101',
        type: 'Admission',
        applicantName: 'আফিফা সুলতানা',
        phone: '01712345678',
        email: 'afifa@gmail.com',
        classNameOrPost: 'Class 5',
        details: 'বিজ্ঞান বিভাগে ভর্তি হতে ইচ্ছুক, পূর্ববর্তী রোল ছিল ০২।',
        status: 'Pending Payment',
        paymentAmount: 0,
        subDate: '2026-06-01'
      },
      {
        id: 'req_102',
        type: 'Job',
        applicantName: 'জনাব আরিফুল ইসলাম',
        phone: '01811223344',
        email: 'arif.ict@gmail.com',
        classNameOrPost: 'Assistant ICT Teacher',
        details: 'বিএসসি ইন সিএসই সম্পন্ন করেছি। ২ বছরের শিক্ষাদানের অভিজ্ঞতা আছে।',
        status: 'Paid (Pending Assistant Approval)',
        paymentAmount: 500,
        moneyReceiptNo: 'MR-2026-9801',
        subDate: '2026-05-31'
      }
    ]);
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('delicon_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('delicon_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem('delicon_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [smsLogs, setSmsLogs] = useState<SmsLog[]>(() => {
    const saved = localStorage.getItem('delicon_sms');
    return saved ? JSON.parse(saved) : [];
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('delicon_leads');
    return saved ? JSON.parse(saved) : [
      {
        id: 'l1',
        parentName: 'Asaduzzaman',
        studentName: 'Samiul Hasan',
        phone: '01711223344',
        email: 'asad@example.com',
        desiredClass: 'Class 6',
        status: 'Pending',
        subDate: '2026-06-01',
      },
      {
        id: 'l2',
        parentName: 'Mahmuda Begum',
        studentName: 'Sanjida Akter',
        phone: '01899001122',
        email: 'mahmuda@example.com',
        desiredClass: 'Class 1',
        status: 'Approved',
        subDate: '2026-05-28',
      }
    ];
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('delicon_notices');
    return saved ? JSON.parse(saved) : initialNotices;
  });

  const [stationery, setStationery] = useState<StationeryItem[]>(() => {
    const saved = localStorage.getItem('delicon_stationery');
    return saved ? JSON.parse(saved) : initialStationery;
  });

  const [routes, setRoutes] = useState<TransportRoute[]>(() => {
    const saved = localStorage.getItem('delicon_routes');
    return saved ? JSON.parse(saved) : initialRoutes;
  });

  const [results, setResults] = useState<ExamResult[]>(() => {
    const saved = localStorage.getItem('delicon_results');
    return saved ? JSON.parse(saved) : initialResults;
  });

  const [devProjects, setDevProjects] = useState<DevProject[]>(() => {
    const saved = localStorage.getItem('delicon_dev_projects');
    return saved ? JSON.parse(saved) : initialDevProjects;
  });

  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>(() => {
    const saved = localStorage.getItem('delicon_academic_events');
    return saved ? JSON.parse(saved) : initialAcademicEvents;
  });

  const [libraryResources, setLibraryResources] = useState<LibraryResource[]>(() => {
    const saved = localStorage.getItem('delicon_library_resources');
    return saved ? JSON.parse(saved) : initialLibraryResources;
  });

  const [portalCredentials, setPortalCredentials] = useState<PortalCredential[]>(() => {
    const saved = localStorage.getItem('delicon_credentials');
    return saved ? JSON.parse(saved) : [
      {
        role: 'Partner',
        user: 'partner',
        pass: 'partner123',
        label: '১। অংশীদার ও ম্যানেজমেন্ট ড্যাশবোর্ড',
        description: 'প্রতিষ্ঠানের সকল খাতের দৈনিক অগ্রগতি সূচক, পার্টনারদের দ্রুত সিদ্ধান্ত গ্রহণ প্যানেল'
      },
      {
        role: 'Scanner',
        user: 'scanner',
        pass: 'scanner123',
        label: '২। রিডার ও ক্লাসরুম গেট স্ক্যানার',
        description: 'শিক্ষক-শিক্ষার্থী কার্ড রিডার, আরএফআইডি উপস্থিতি ও ইনস্ট্যান্ট প্যারেন্ট এলার্ট'
      },
      {
        role: 'Accountant',
        user: 'accountant',
        pass: 'ledger123',
        label: '৩। একাউন্টিং ও অর্থব্যবস্থাপনা লেজার',
        description: 'ভর্তি, বেতন, ল্যাব ফি, বোনাস এবং অগ্রিম অর্থ লেনদেনের শক্তিশালী ডাবল-এন্ট্রি বুককিপার'
      },
      {
        role: 'Creator',
        user: 'creator',
        pass: 'content123',
        label: '৪। একাডেমিক ওয়ার্কশপ ও ক্রিয়েটিভ ল্যাব',
        description: 'প্রশ্নপত্র, নোট এবং সিলেবাস ডিজাইন; প্রিন্সিপাল এপ্রুভাল ওয়ার্কফ্লো এবং এডিট গেটওয়ে'
      },
      {
        role: 'Assistant',
        user: 'assistant',
        pass: 'assistant123',
        label: '৫। অফিস সহকারী পোর্টাল (ডাটা এন্ট্রি)',
        description: 'শিক্ষক, ড্রাইভার, নিরাপত্তাকর্মী নিয়োগ ও নতুন শিক্ষার্থীদের তথ্য ডেটা এন্ট্রি গেটওয়ে'
      }
    ];
  });

  const [academicDrafts, setAcademicDrafts] = useState<AcademicDraft[]>(() => {
    const saved = localStorage.getItem('delicon_drafts');
    return saved ? JSON.parse(saved) : [
      {
        id: 'draft_1',
        title: 'Class 5 Mathematics Half-Yearly Question Paper 2026',
        category: 'Question Paper',
        content: `১। সংক্ষেপে উত্তর দাও (যেকোনো ১০টি): \nক) ২/৩ এর সমতুল্য ভগ্নাংশ কোনটি? \nখ) ৭.৫ কে ০.৫ দিয়ে ভাগ করলে কত হয়? \n২। সৃজনশীল প্রশ্ন (যেকোনো ৩টি)`,
        className: 'Class 5',
        creatorName: 'জনাব কামরুল হাসান (গণিত ইন্সট্রাক্টর)',
        status: 'Pending Approval'
      },
      {
        id: 'draft_2',
        title: 'Class 8 English Core Syllabus 2nd Term Outline',
        category: 'Syllabus',
        content: `Paragraphs: 1. Digital Bangladesh 2. Environmental Pollution \nGrammar: Tense, Voice, Preposition (20 Marks)`,
        className: 'Class 8',
        creatorName: 'মিস নুসরাত জেরিন (ইংরেজি সিনিয়র শিক্ষক)',
        status: 'Approved',
        approvedBy: 'Principal'
      },
      {
        id: 'draft_3',
        title: 'ICT Basic Programming Lecture Note - Intro to Python loops',
        category: 'Lecture Note',
        content: `Topics covered:\n1. for i in range(5):\n2. while loop criteria\n3. Code indentation patterns`,
        className: 'Class 6',
        creatorName: 'মডেল একাডেমী আইটি ল্যাব এসিস্ট্যান্ট',
        status: 'Sent Back',
        comments: 'অনুগ্রহ করে লুপের ফ্লো-চার্ট এর একটি ভিজ্যুয়াল চিত্র কন্টেন্টে অ্যাড করুন।'
      }
    ];
  });

  const [sections, setSections] = useState<LandingSection[]>(() => {
    const saved = localStorage.getItem('delicon_sections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return getFallbackVal('delicon_sections', [
      { id: 'sec-hero', title: 'পরিচিতি ও ব্যানার', visible: true },
      { id: 'sec-today-campus-dash', title: 'আজকের ড্যাশবোর্ড ⏰', visible: true },
      { id: 'sec-merit-students', title: 'কৃতি শিক্ষার্থী 🏆', visible: true },
      { id: 'sec-all-teachers', title: 'সকল শিক্ষকগন 👥', visible: true },
      { id: 'sec-cultural-station', title: 'কালচারাল স্টেশন 🎭', visible: true },
      { id: 'sec-campus-gallery-new', title: 'ফটো গ্যালারী 📸', visible: true },
      { id: 'sec-notice', title: 'ডিজিটাল নোটিশবোর্ড 📢', visible: true },
      { id: 'sec-school-blog', title: 'একাডেমিক ব্লগ ✍️', visible: true },
      { id: 'sec-dtube-video-hub', title: 'ডিটিউব - ভিডিও হাব 📺', visible: true },
      { id: 'sec-guardian-guide-page', title: 'অভিভাবক পাতা 👨‍👩‍👦', visible: true },
      { id: 'sec-digital-classrooms', title: 'ডিজিটাল ক্লাসরুম 💻', visible: true },
      { id: 'sec-sports', title: 'সহ-শিক্ষা ও স্পোর্টস ক্লাব', visible: true },
      { id: 'sec-transport', title: 'নিরাপদ পরিবহন', visible: true },
      { id: 'sec-fees-calc', title: 'বেতন ও ফি হিসাবকারী', visible: true },
      { id: 'sec-lead-form', title: 'ভর্তি ও তথ্যের আবেদন', visible: true },
      { id: 'sec-faq', title: 'জিজ্ঞাসিত প্রশ্ন FAQ', visible: true },
      { id: 'sec-contact', title: 'যোগাযোগ ও ম্যাপ 🗺️', visible: true }
    ]);
  });

  const [examMarks, setExamMarks] = useState<ExamMark[]>(() => {
    const saved = localStorage.getItem('delicon_exammarks');
    return saved ? JSON.parse(saved) : getFallbackVal('delicon_exammarks', [
      {
        id: 'mark_1',
        studentId: 's1',
        studentName: 'Afifa Rahman',
        className: 'Class 5',
        roll: '01',
        examType: 'Terminal',
        examName: 'First Term 2026',
        subject: 'math',
        writtenMarks: 58,
        mcqMarks: 37,
        totalMarks: 95,
        grade: 'A+',
        gpa: 5,
        subDate: '2026-06-01'
      },
      {
        id: 'mark_2',
        studentId: 's1',
        studentName: 'Afifa Rahman',
        className: 'Class 5',
        roll: '01',
        examType: 'Terminal',
        examName: 'First Term 2026',
        subject: 'english',
        writtenMarks: 52,
        mcqMarks: 40,
        totalMarks: 92,
        grade: 'A+',
        gpa: 5,
        subDate: '2026-06-01'
      },
      {
        id: 'mark_3',
        studentId: 's2',
        studentName: 'Tanvir Ahmed',
        className: 'Class 5',
        roll: '02',
        examType: 'Terminal',
        examName: 'First Term 2026',
        subject: 'math',
        writtenMarks: 50,
        mcqMarks: 39,
        totalMarks: 89,
        grade: 'A',
        gpa: 4,
        subDate: '2026-06-01'
      }
    ]);
  });

  const [campusPhotos, setCampusPhotos] = useState<{ url: string; title: string; caption: string; }[]>(() => {
    const saved = localStorage.getItem('delicon_campus_photos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Parse error fallback
      }
    }
    return getFallbackVal('delicon_campus_photos', [
      {
        url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1400&q=85',
        title: 'মমতাময়ী শিক্ষিকার স্নেহের স্পন্দনময় ক্লাস রুম 🌸',
        caption: '১। শুধুমাত্র মুখস্থ করে খাতায় লিখে পাশ নয় - এখানে প্রতিটি শিক্ষিকা স্নেহের পরশে, পরম মমতায় ও ধাপে ধাপে বুঝিয়ে শিশুর জ্ঞান এবং নৈতিকতার ভিত্তি গড়ে তোলেন।'
      },
      {
        url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1400&q=85',
        title: 'আধুনিক কম্পিউটার ও প্রগতিশীল বিজ্ঞান ল্যাব 🧪',
        caption: '২। আনন্দময় বৈজ্ঞানিক ল্যাবে শিশুর সুপ্ত কৌতূহলের সঠিক বিকাশ। আধুনিক সফটওয়্যার ও প্রগতিশীল প্রযুক্তির সাথে রয়েছে নিবিড় সখ্যতা।'
      },
      {
        url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=85',
        title: 'কোনോ ভীতি ছাড়া খেলার ছলে আনন্দময় পাঠশালা 🏫',
        caption: '৩। কোনো শাসন বা আতঙ্কের পরিবেশ নয়। নিয়মানুবর্তিতা আর পরম ভালোবাসার মিষ্টি সুবাসে প্রতিটি শিশু হয়ে ওঠে প্রফুল্ল এবং আত্মবিশ্বাসী।'
      },
      {
        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=85',
        title: 'জ্ঞানের অমূল্য আলোয় আলোকিত প্রজ্ঞাময় রিডিং হাব 📚',
        caption: '৪। শিক্ষার্থীর মনে রোপণ করা হয় দায়িত্ববোধ ও নৈতিক শিক্ষার বীজ। যাতে জীবনের প্রতিটি বাস্তব কষ্টিপাথরের পরীক্ষায় সে উত্তীর্ণ হতে পারে পরম গৌরবে।'
      },
      {
        url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1400&q=85',
        title: 'সবুজ ছায়ায় সহশিক্ষামূলক ও আনন্দঘন ক্রীড়া চর্চা ⚽',
        caption: '৫। প্রতিটি আলাদা মেধার সুষম মূল্যায়ন। পিছিয়ে থাকা বা কোনো দুর্বল শিক্ষার্থীকে বিশেষ এক্সট্রা কেয়ার দিয়ে প্রস্ফুটিত করার সার্থক অঙ্গীকার।'
      }
    ]);
  });

  const updateCampusPhotos = (photos: { url: string; title: string; caption: string; }[]) => {
    setCampusPhotos(photos);
    try {
      localStorage.setItem('delicon_campus_photos', JSON.stringify(photos));
    } catch (e) {
      console.error("Local storage quota exceeded inside updateCampusPhotos", e);
    }
  };

  const [meritStudents, setMeritStudents] = useState<MeritStudent[]>(() => {
    const saved = localStorage.getItem('delicon_merit_students');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Parse error fallback
      }
    }
    return getFallbackVal('delicon_merit_students', [
      { 
        name: 'আফরিন জাহান স্মৃতি', 
        className: 'শ্রেণী: ১০ম', 
        achievement: 'এস.এস.সি বোর্ডে জিপিএ ৫.০০ (গোল্ডেন)', 
        quote: 'ডিলিকন স্কুলের সার্বক্ষণিক আরএফআইডি ট্র্যাকিং এবং লাইব্রেরি সুবিধা আমার গণিত ভিত মজবুত করেছে।', 
        award: 'বোর্ড মেরิต স্কলারশিপ ২০২৫',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
      },
      { 
        name: 'তাসনিমুল কবীর সায়েম', 
        className: 'শ্রেণী: ৮ম', 
        achievement: 'জাতীয় গণিত অলিম্পিয়াড চ্যাম্পিয়ন', 
        quote: 'শিক্ষকদের বিশেষ টিউটোরিয়াল ক্লাস এবং আইটি ল্যাবের গাইডেন্স না থাকলে রানার আপ হওয়াও কঠিন হতো।', 
        award: 'অলিম্পিয়াড গোল্ড মেডেল',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
      },
      { 
        name: 'সায়মা আক্তার মেঘা', 
        className: 'শ্রেণী: ৫ম', 
        achievement: 'ট্যালেন্টপুল বৃত্তি ১০০% প্রাপ্ত', 
        quote: 'প্রতিদিনের কুইজ এবং হোমওয়ার্ক এলার্ট সিস্টেম আমাকে পড়াশোনায় বেশি মনোযোগী হতে সাহায্য করেছে।', 
        award: 'ট্যালেন্টপুল স্কলারশিপ',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
      }
    ]);
  });

  const updateMeritStudents = (students: MeritStudent[]) => {
    setMeritStudents(students);
    try {
      localStorage.setItem('delicon_merit_students', JSON.stringify(students));
    } catch (e) {
      console.error("Local storage quota exceeded inside updateMeritStudents", e);
      alert("দুঃখিত, অনেক বড় আকারের ফাইল বা অতিরিক্ত ডাটার কারণে তথ্যটি ব্রাউজারে সংরক্ষণ করা যাচ্ছে না। দয়া করে ছোট আকারের ছবি ব্যবহার করুন বা রিফ্রেশ দিয়ে পুনরায় চেষ্টা করুন।");
    }
  };

  // State management for D-Tube and Cultural Playlist
  const [dtubePlaylist, setDtubePlaylist] = useState<any[]>(() => {
    const saved = localStorage.getItem('delicon_dtube_playlist');
    return saved ? JSON.parse(saved) : getFallbackVal('delicon_dtube_playlist', [
      { id: 'v1', title: 'শতকরা অধ্যায়ের চমৎকার সমাধান 📐', category: 'full', url: 'https://www.youtube.com/watch?v=pAnu7S8U_wI', views: 320, author: 'মিস ফারহানা চৌধুরী', duration: '১৫:০০ মিনিট', classLabel: 'Class 5 Mathematics' },
      { id: 'v2', title: 'টেন্স এবং পার্টস অভ স্পিচ সহজে সমাধান 📝', category: 'full', url: 'https://www.youtube.com/watch?v=eG_QshOve4E', views: 145, author: 'জনাব মো: রেজওয়ানুর', duration: '১২:৩০ মিনিট', classLabel: 'Class 8 English' },
      { id: 'v3', title: 'গতি ও বলবিদ্যার বেসিক সূত্রাবলি ⚡', category: 'full', url: 'https://www.youtube.com/watch?v=Aof_Zg05qYk', views: 88, author: 'জনাব আশরাফুল আমিন', duration: '১৮:১৫ মিনিট', classLabel: 'Class 10 Physics' },
      { id: 'v4', title: 'ডিলিকন মডেল একাডেমী ক্যাম্পাসের এক ঝলক 🎬', category: 'reel', url: 'https://www.youtube.com/shorts/5e_2Iitid0Y', views: 512, author: 'ডি লিকন মিডিয়া সেল', duration: '০:৫৯ মিনিট', classLabel: 'Reel / Short' },
      { id: 'v5', title: 'ছোট্ট বন্ধুদের সৃজনশীল চিত্রাংকন প্রতিযোগীতা 🎨', category: 'reel', url: 'https://www.youtube.com/shorts/XN6-M6bC8k4', views: 390, author: 'তাহমিনা সুলতানা', duration: '০:৪৫ মিনিট', classLabel: 'Reel / Short' },
    ]);
  });

  const [culturalPlaylist, setCulturalPlaylist] = useState<any[]>(() => {
    const saved = localStorage.getItem('delicon_cultural_playlist');
    return saved ? JSON.parse(saved) : getFallbackVal('delicon_cultural_playlist', [
      { id: 'cp1', title: 'রবীন্দ্র জয়ন্তী ও বসন্ত উৎসব নৃত্য ২০২৬ 🌸', url: 'https://www.youtube.com/watch?v=XN6-M6bC8k4', views: 420 },
      { id: 'cp2', title: 'কবিতা আবৃত্তি ও বার্ষিক নাটক মঞ্চায়ন 🎭', url: 'https://www.youtube.com/watch?v=8XUvMOnu8cE', views: 280 },
      { id: 'cp3', title: 'স্বাধীনতা দিবসের বিতর্ক প্রতিযোগিতা 🎤', url: 'https://www.youtube.com/watch?v=Fq2CvmgoO7I', views: 195 }
    ]);
  });

  const updateDtubePlaylist = (playlist: any[]) => {
    setDtubePlaylist(playlist);
    localStorage.setItem('delicon_dtube_playlist', JSON.stringify(playlist));
  };

  const updateCulturalPlaylist = (playlist: any[]) => {
    setCulturalPlaylist(playlist);
    localStorage.setItem('delicon_cultural_playlist', JSON.stringify(playlist));
  };

  useEffect(() => {
    localStorage.setItem('delicon_dtube_playlist', JSON.stringify(dtubePlaylist));
  }, [dtubePlaylist]);

  useEffect(() => {
    localStorage.setItem('delicon_cultural_playlist', JSON.stringify(culturalPlaylist));
  }, [culturalPlaylist]);


  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem('delicon_requisitions', JSON.stringify(requisitions));
  }, [requisitions]);

  useEffect(() => {
    localStorage.setItem('delicon_sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('delicon_exammarks', JSON.stringify(examMarks));
  }, [examMarks]);

  useEffect(() => {
    localStorage.setItem('delicon_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('delicon_credentials', JSON.stringify(portalCredentials));
  }, [portalCredentials]);

  useEffect(() => {
    localStorage.setItem('delicon_drafts', JSON.stringify(academicDrafts));
  }, [academicDrafts]);

  useEffect(() => {
    localStorage.setItem('delicon_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('delicon_attendance', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  useEffect(() => {
    localStorage.setItem('delicon_sms', JSON.stringify(smsLogs));
  }, [smsLogs]);

  useEffect(() => {
    localStorage.setItem('delicon_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('delicon_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('delicon_stationery', JSON.stringify(stationery));
  }, [stationery]);

  useEffect(() => {
    localStorage.setItem('delicon_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('delicon_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem('delicon_dev_projects', JSON.stringify(devProjects));
  }, [devProjects]);

  useEffect(() => {
    localStorage.setItem('delicon_academic_events', JSON.stringify(academicEvents));
  }, [academicEvents]);

  useEffect(() => {
    localStorage.setItem('delicon_library_resources', JSON.stringify(libraryResources));
  }, [libraryResources]);

  // Synchronously and asynchronously align old school slogan references
  useEffect(() => {
    const checkAndForceSlogan = () => {
      const defaultSlogan = 'মন থেমে যাক মুগ্ধতায়, সন্তান হাসুক চিরন্তন শ্বাশত অমর শিক্ষায়';
      const storedSlogan = localStorage.getItem('delicon_school_slogan') || schoolSlogan;
      const isOld = !storedSlogan || 
                    storedSlogan.includes('খাতায় লিখে') || 
                    storedSlogan.includes('জাস্টিফাইড') || 
                    storedSlogan.includes('পরম স্নেহে ও আদর্শে');
      if (isOld) {
        console.log('[Slogan Migration] Actively migrating slogan to:', defaultSlogan);
        setSchoolSlogan(defaultSlogan);
        localStorage.setItem('delicon_school_slogan', defaultSlogan);
      }
    };

    // Run immediately on component mount
    checkAndForceSlogan();

    // Run after a delay to ensure that the background sync server adapter is fully active and saves to db.json
    const timer = setTimeout(checkAndForceSlogan, 5000);
    return () => clearTimeout(timer);
  }, [schoolSlogan]);

  // Lead Generation on home page
  const addLead = (leadData: Omit<Lead, 'id' | 'status' | 'subDate'>) => {
    const newLead: Lead = {
      ...leadData,
      id: 'lead_' + Date.now(),
      status: 'Pending',
      subDate: new Date().toISOString().split('T')[0],
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const updateLeadStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        // If approved, dynamically register student to appropriate class
        if (status === 'Approved' && l.status !== 'Approved') {
          const classRoll = String(students.filter(s => s.className === l.desiredClass).length + 1).padStart(2, '0');
          const newStudent: Student = {
            id: 's_' + Date.now(),
            name: l.studentName,
            banglaName: l.studentName, // Fallback to entered english or bangla
            className: l.desiredClass,
            roll: classRoll,
            guardianName: l.parentName,
            guardianPhone: l.phone,
            feesPaid: 0,
            totalFees: 15000,
            attendancePct: 100,
            homeworkStatus: 'Completed',
          };
          setStudents(current => [...current, newStudent]);
        }
        return { ...l, status };
      }
      return l;
    }));
  };

  // Complex attendance logic with instant SMS Alert Generation
  const simulateAttendanceScan = (
    targetId: string, 
    targetType: 'student' | 'employee', 
    scanType: 'Check-In' | 'Check-Out'
  ) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (targetType === 'student') {
      const student = students.find(s => s.id === targetId);
      if (!student) return { success: false, message: 'শিক্ষার্থী পাওয়া যায়নি' };

      // Create attendance log
      const newLog: AttendanceLog = {
        id: 'att_' + Date.now(),
        targetId,
        targetType: 'student',
        targetName: student.name,
        className: student.className,
        roll: student.roll,
        timestamp: now.toISOString(),
        type: scanType
      };

      // Create Bangla SMS
      let smsText = '';
      if (scanType === 'Check-In') {
        smsText = `অভিভাবক মহোদয়, আপনার সন্তান নাম: ${student.banglaName}, শ্রেণী: ${student.className}, রোল: ${student.roll} আজ সময় ${timeString}-এ ডিলিকন মডেল একাডেমীতে নিরাপদে ক্লাসে প্রবেশ করেছে। ধন্যবাদ!`;
      } else {
        smsText = `অভিভাবক মহোদয়, আপনার সন্তান নাম: ${student.banglaName}, শ্রেণী: ${student.className}, রোল: ${student.roll} স্কুল থেকে বাড়ির উদ্দেশ্যে রওয়া হয়েছে। আপনি সজাগ থাকুন, এগিয়ে আসুন। বাসায় পৌছা মাত্রই তার হোমওয়ার্ক সম্পন্ন করতে তাকে অনুপ্রাণিত করুন।`;
      }

      const newSms: SmsLog = {
        id: 'sms_' + Date.now(),
        recipientPhone: student.guardianPhone,
        recipientName: student.guardianName,
        studentName: student.banglaName,
        messageType: scanType === 'Check-In' ? 'Entry' : 'Exit',
        timestamp: now.toISOString(),
        text: smsText
      };

      setAttendanceLogs(prev => [newLog, ...prev]);
      setSmsLogs(prev => [newSms, ...prev]);
      
      // Slightly tweak student overall attendance percentage
      setStudents(prev => prev.map(s => {
        if (s.id === student.id) {
          const currentPct = s.attendancePct;
          const updatedPct = scanType === 'Check-In' ? Math.min(100, currentPct + 1) : s.attendancePct;
          return { ...s, attendancePct: updatedPct };
        }
        return s;
      }));

      return { 
        success: true, 
        message: `${student.banglaName} সফলভাবে স্ক্যান করা হয়েছে। SMS সফলভাবে অভিভাবকের ফোনে পাঠানো হয়েছে।` 
      };
    } else {
      // Employee Scan
      const employee = employees.find(e => e.id === targetId);
      if (!employee) return { success: false, message: 'এমপ্লয়ী পাওয়া যায়নি' };

      // Check if employee has a previous Check-In today to calculate working hours
      let calculatedHours = undefined;
      if (scanType === 'Check-Out') {
        const todayStr = now.toISOString().split('T')[0];
        const previousCheckIn = attendanceLogs.find(log => 
          log.targetId === employee.id && 
          log.type === 'Check-In' && 
          log.timestamp.startsWith(todayStr)
        );
        if (previousCheckIn) {
          const diffMs = Math.abs(now.getTime() - new Date(previousCheckIn.timestamp).getTime());
          // Standard simulation: if scanned too close, simulate standard offset of 8.2 hours for realistic metrics
          const realHours = diffMs / (1000 * 60 * 60);
          calculatedHours = realHours < 0.05 ? +(7.5 + Math.random() * 1.5).toFixed(2) : +realHours.toFixed(2);
        } else {
          // If no check-in today, simulate default 8 hours work shift
          calculatedHours = +(8.0 + Math.random() * 0.5).toFixed(2);
        }
      }

      const newLog: AttendanceLog = {
        id: 'att_' + Date.now(),
        targetId,
        targetType: 'employee',
        targetName: employee.name,
        timestamp: now.toISOString(),
        type: scanType,
        workHours: calculatedHours
      };

      setAttendanceLogs(prev => [newLog, ...prev]);
      return { 
        success: true, 
        message: `${employee.banglaName} (${employee.role}) - ${scanType === 'Check-In' ? 'প্রবেশ' : 'প্রস্থান'} নথিভুক্ত করা হয়েছে। ${calculatedHours ? `কার্যকাল: ${calculatedHours} ঘণ্টা।` : ''}`
      };
    }
  };

  const addNotice = (noticeData: Omit<Notice, 'id'>) => {
    const newNotice = {
      ...noticeData,
      id: 'n_' + Date.now(),
    };
    setNotices(prev => [newNotice, ...prev]);
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  const addAcademicEvent = (eventData: Omit<AcademicEvent, 'id'>) => {
    const newEvent: AcademicEvent = {
      ...eventData,
      id: 'e_' + Date.now(),
    };
    setAcademicEvents(prev => [...prev, newEvent]);
  };

  const editAcademicEvent = (id: string, updatedFields: Partial<AcademicEvent>) => {
    setAcademicEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...updatedFields } : evt));
  };

  const deleteAcademicEvent = (id: string) => {
    setAcademicEvents(prev => prev.filter(evt => evt.id !== id));
  };

  const addLibraryResource = (resData: Omit<LibraryResource, 'id' | 'downloadCount' | 'publishDate'>) => {
    const newRes: LibraryResource = {
      ...resData,
      id: 'lib_' + Date.now(),
      publishDate: new Date().toISOString().split('T')[0],
      downloadCount: 0
    };
    setLibraryResources(prev => [newRes, ...prev]);
  };

  const editLibraryResource = (id: string, updatedFields: Partial<LibraryResource>) => {
    setLibraryResources(prev => prev.map(res => res.id === id ? { ...res, ...updatedFields } : res));
  };

  const deleteLibraryResource = (id: string) => {
    setLibraryResources(prev => prev.filter(res => res.id !== id));
  };

  const incrementDownloadCount = (id: string) => {
    setLibraryResources(prev => prev.map(res => res.id === id ? { ...res, downloadCount: res.downloadCount + 1 } : res));
  };

  const addStudent = (stData: Omit<Student, 'id' | 'attendancePct' | 'homeworkStatus'>) => {
    const newSt: Student = {
      ...stData,
      id: 's_' + Date.now(),
      attendancePct: 100,
      homeworkStatus: 'Completed',
    };
    setStudents(prev => [...prev, newSt]);
  };

  const updateStudentHomework = (id: string, status: Student['homeworkStatus']) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, homeworkStatus: status } : s));
  };

  const receiveFees = (studentId: string, amount: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const nextPaid = Math.min(s.totalFees, s.feesPaid + amount);
        return { ...s, feesPaid: nextPaid };
      }
      return s;
    }));
  };

  const paySalary = (employeeId: string) => {
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, paymentStatus: 'Paid' } : e));
  };

  const updateStationeryStock = (id: string, qtyChange: number) => {
    setStationery(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, stock: Math.max(0, item.stock + qtyChange) };
      }
      return item;
    }));
  };

  const updateRouteStatus = (id: string, status: TransportRoute['status']) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addDevProject = (projData: Omit<DevProject, 'id'>) => {
    const newProj: DevProject = {
      ...projData,
      id: 'dev_' + Date.now(),
    };
    setDevProjects(prev => [...prev, newProj]);
  };

  const updateDevProjectProgress = (id: string, progress: number, status: DevProject['status']) => {
    setDevProjects(prev => prev.map(p => p.id === id ? { ...p, progress, status } : p));
  };

  const updatePortalCredential = (role: UserRole, user: string, pass: string) => {
    setPortalCredentials(prev => prev.map(cred => cred.role === role ? { ...cred, user, pass } : cred));
  };

  const addAcademicDraft = (draft: Omit<AcademicDraft, 'id' | 'status'>) => {
    const newDraft: AcademicDraft = {
      ...draft,
      id: 'draft_' + Date.now(),
      status: 'Pending Approval'
    };
    setAcademicDrafts(prev => [newDraft, ...prev]);
  };

  const editAcademicDraft = (id: string, title: string, content: string, className: string, category: AcademicDraft['category']) => {
    setAcademicDrafts(prev => prev.map(draft => draft.id === id ? { ...draft, title, content, className, category, status: 'Pending Approval' } : draft));
  };

  const updateDraftStatusAndComments = (id: string, status: AcademicDraft['status'], approvedBy?: string, comments?: string) => {
    setAcademicDrafts(prev => prev.map(draft => draft.id === id ? { ...draft, status, approvedBy, comments } : draft));
  };

  const addRequisition = (req: Omit<Requisition, 'id' | 'status' | 'subDate' | 'paymentAmount'>) => {
    const newReq: Requisition = {
      ...req,
      id: 'req_' + Date.now(),
      status: 'Pending Payment',
      paymentAmount: 0,
      subDate: new Date().toISOString().split('T')[0]
    };
    setRequisitions(prev => [newReq, ...prev]);
  };

  const receiveRequisitionPayment = (id: string, amount: number) => {
    setRequisitions(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Paid (Pending Assistant Approval)',
          paymentAmount: amount,
          moneyReceiptNo: 'MR-2026-' + Math.floor(1000 + Math.random() * 9000)
        };
      }
      return req;
    }));
  };

  const approveRequisitionByAssistant = (id: string) => {
    setRequisitions(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Assistant Approved (Pending Principal Approval)'
        };
      }
      return req;
    }));
  };

  const approveRequisitionByPrincipal = (id: string) => {
    setRequisitions(prev => prev.map(req => {
      if (req.id === id) {
        const idNo = 'ID-2026-' + Math.floor(1000 + Math.random() * 9000);
        
        // Auto register to active lists
        if (req.type === 'Admission') {
          const newStudent: Student = {
            id: 's_' + Date.now(),
            name: req.applicantName,
            banglaName: req.applicantName,
            className: req.classNameOrPost,
            roll: String(students.filter(s => s.className === req.classNameOrPost).length + 1).padStart(2, '0'),
            guardianPhone: req.phone,
            guardianName: 'অভিভাবক (সিস্টেম জেনারেটেড)',
            feesPaid: req.paymentAmount,
            totalFees: 15000,
            attendancePct: 100,
            homeworkStatus: 'Completed'
          };
          setStudents(current => [...current, newStudent]);
        } else if (req.type === 'Job') {
          const newEmployee: Employee = {
            id: 'e_' + Date.now(),
            name: req.applicantName,
            banglaName: req.applicantName,
            phone: req.phone,
            role: req.classNameOrPost.includes('Teacher') ? 'Teacher' : 'Staff',
            salary: 18000,
            paymentStatus: 'Paid'
          };
          setEmployees(current => [...current, newEmployee]);
        }

        return {
          ...req,
          status: 'Principal Approved',
          idCardNo: idNo
        };
      }
      return req;
    }));
  };

  const rejectRequisition = (id: string, comments: string) => {
    setRequisitions(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Rejected',
          rejectionComments: comments
        };
      }
      return req;
    }));
  };

  const addEmployee = (empData: Omit<Employee, 'id' | 'paymentStatus'>) => {
    const newEmp: Employee = {
      ...empData,
      id: 'e_' + Date.now(),
      paymentStatus: 'Pending'
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateSectionSetting = (id: string, title: string, visible: boolean) => {
    setSections(prev => prev.map(sec => sec.id === id ? { ...sec, title, visible } : sec));
  };

  const resetSections = () => {
    const defaultSecs = [
      { id: 'sec-hero', title: 'পরিচিতি ও ব্যানার', visible: true },
      { id: 'sec-today-campus-dash', title: 'আজকের ড্যাশবোর্ড ⏰', visible: true },
      { id: 'sec-merit-students', title: 'কৃতি শিক্ষার্থী 🏆', visible: true },
      { id: 'sec-all-teachers', title: 'সকল শিক্ষকগন 👥', visible: true },
      { id: 'sec-cultural-station', title: 'কালচারাল স্টেশন 🎭', visible: true },
      { id: 'sec-campus-gallery-new', title: 'ফটো গ্যালারী 📸', visible: true },
      { id: 'sec-notice', title: 'ডিজিটাল নোটিশবোর্ড 📢', visible: true },
      { id: 'sec-school-blog', title: 'একাডেমিক ব্লগ ✍️', visible: true },
      { id: 'sec-dtube-video-hub', title: 'ডিটিউব - ভিডিও হাব 📺', visible: true },
      { id: 'sec-guardian-guide-page', title: 'অভিভাবক পাতা 👨‍👩‍👦', visible: true },
      { id: 'sec-digital-classrooms', title: 'ডিজিটাল ক্লাসরুম 💻', visible: true },
      { id: 'sec-sports', title: 'সহ-শিক্ষা ও স্পোর্টস ক্লাব', visible: true },
      { id: 'sec-transport', title: 'নিরাপদ পরিবহন', visible: true },
      { id: 'sec-fees-calc', title: 'বেতন ও ফি হিসাবকারী', visible: true },
      { id: 'sec-lead-form', title: 'ভর্তি ও তথ্যের আবেদন', visible: true },
      { id: 'sec-faq', title: 'জিজ্ঞাসিত প্রশ্ন FAQ', visible: true },
      { id: 'sec-contact', title: 'যোগাযোগ ও ম্যাপ 🗺️', visible: true }
    ];
    setSections(defaultSecs);
    localStorage.setItem('delicon_sections', JSON.stringify(defaultSecs));
  };

  const addExamMark = (markData: Omit<ExamMark, 'id' | 'subDate'>) => {
    setExamMarks(prev => {
      const existingIdx = prev.findIndex(m => 
        m.studentId === markData.studentId && 
        m.examName === markData.examName && 
        m.subject === markData.subject
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...markData,
          subDate: new Date().toISOString().split('T')[0]
        };
        return updated;
      } else {
        const newMark: ExamMark = {
          ...markData,
          id: 'mark_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          subDate: new Date().toISOString().split('T')[0]
        };
        return [newMark, ...prev];
      }
    });
  };

  const saveExamMarksBulk = (marksData: Omit<ExamMark, 'id' | 'subDate'>[]) => {
    setExamMarks(prev => {
      let updated = [...prev];
      const todayStr = new Date().toISOString().split('T')[0];
      
      marksData.forEach(markData => {
        const existingIdx = updated.findIndex(m => 
          m.studentId === markData.studentId && 
          m.examName === markData.examName && 
          m.subject === markData.subject
        );
        if (existingIdx > -1) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            ...markData,
            subDate: todayStr
          };
        } else {
          const newMark: ExamMark = {
            ...markData,
            id: 'mark_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            subDate: todayStr
          };
          updated = [newMark, ...updated];
        }
      });
      return updated;
    });
  };

  const updateStudentId = (oldId: string, newId: string) => {
    setStudents(prev => prev.map(s => s.id === oldId ? { ...s, id: newId } : s));
    setAttendanceLogs(prev => prev.map(log => log.targetId === oldId && log.targetType === 'student' ? { ...log, targetId: newId } : log));
    setExamMarks(prev => prev.map(mark => mark.studentId === oldId ? { ...mark, studentId: newId } : mark));
  };

  return (
    <SchoolContext.Provider value={{
      students,
      employees,
      attendanceLogs,
      smsLogs,
      leads,
      notices,
      stationery,
      routes,
      results,
      devProjects,
      portalCredentials,
      academicDrafts,
      requisitions,
      sections,
      examMarks,
      schoolName,
      schoolSlogan,
      schoolLogoType,
      schoolLogoVal,
      updateSchoolBranding,
      campusPhotos,
      updateCampusPhotos,
      meritStudents,
      updateMeritStudents,
      dtubePlaylist,
      culturalPlaylist,
      updateDtubePlaylist,
      updateCulturalPlaylist,
      
      addLead,
      updateLeadStatus,
      simulateAttendanceScan,
      addNotice,
      deleteNotice,
      addStudent,
      addEmployee,
      updateStudentHomework,
      receiveFees,
      paySalary,
      updateStationeryStock,
      updateRouteStatus,
      addDevProject,
      updateDevProjectProgress,
      updatePortalCredential,
      addAcademicDraft,
      editAcademicDraft,
      updateDraftStatusAndComments,
      
      addRequisition,
      receiveRequisitionPayment,
      approveRequisitionByAssistant,
      approveRequisitionByPrincipal,
      rejectRequisition,
      updateSectionSetting,
      resetSections,
      addExamMark,
      saveExamMarksBulk,
      updateStudentId,

      academicEvents,
      addAcademicEvent,
      editAcademicEvent,
      deleteAcademicEvent,

      libraryResources,
      addLibraryResource,
      editLibraryResource,
      deleteLibraryResource,
      incrementDownloadCount
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
