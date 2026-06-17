/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Employee, Notice, StationeryItem, TransportRoute, ExamResult, DevProject, AcademicEvent, LibraryResource } from '../types';

export const initialStudents: Student[] = [
  {
    id: 's1',
    name: 'Afifa Rahman',
    banglaName: 'আফিফা রহমান',
    className: 'Class 5',
    roll: '01',
    guardianName: 'Khalid Rahman',
    guardianPhone: '01712345678',
    feesPaid: 15000,
    totalFees: 18000,
    attendancePct: 94,
    homeworkStatus: 'Completed',
  },
  {
    id: 's2',
    name: 'Tanvir Ahmed',
    banglaName: 'তানভীর আহমেদ',
    className: 'Class 5',
    roll: '02',
    guardianName: 'Monir Ahmed',
    guardianPhone: '01823456789',
    feesPaid: 12000,
    totalFees: 18000,
    attendancePct: 88,
    homeworkStatus: 'Pending',
  },
  {
    id: 's3',
    name: 'Raisa Yasmin',
    banglaName: 'রাইসা ইয়াসমিন',
    className: 'Class 4',
    roll: '01',
    guardianName: 'Sohail Yasmin',
    guardianPhone: '01934567890',
    feesPaid: 18000,
    totalFees: 18000,
    attendancePct: 98,
    homeworkStatus: 'Completed',
  },
  {
    id: 's4',
    name: 'Tahsin Islam',
    banglaName: 'তাহসিন ইসলাম',
    className: 'Class 3',
    roll: '05',
    guardianName: 'Aminul Islam',
    guardianPhone: '01545678901',
    feesPaid: 9000,
totalFees: 15000,
    attendancePct: 79,
    homeworkStatus: 'Needs-Motivation',
  },
];

export const initialEmployees: Employee[] = [
  {
    id: 'e1',
    name: 'Nusrat Jahan',
    banglaName: 'নুসরাত জাহান',
    role: 'Teacher',
    salary: 28000,
    paymentStatus: 'Paid',
    phone: '01722883344',
  },
  {
    id: 'e2',
    name: 'Zahangir Alam',
    banglaName: 'জাহাঙ্গীর আলম',
    role: 'Teacher',
    salary: 32000,
    paymentStatus: 'Paid',
    phone: '01811559900',
  },
  {
    id: 'e3',
    name: 'Faisal Kabir',
    banglaName: 'ফয়সাল কবির',
    role: 'Coordinator',
    salary: 35000,
    paymentStatus: 'Pending',
    phone: '01633556677',
  },
  {
    id: 'e4',
    name: 'Rafiqul Islam',
    banglaName: 'রফিকুল ইসলাম',
    role: 'Driver',
    salary: 16000,
    paymentStatus: 'Paid',
    phone: '01599887766',
  },
  {
    id: 'e5',
    name: 'Abul Morol',
    banglaName: 'আবুল মোড়ল',
    role: 'Staff',
    salary: 12000,
    paymentStatus: 'Pending',
    phone: '01344558833',
  },
];

export const initialNotices: Notice[] = [
  {
    id: 'n1',
    title: 'Upcoming Term-1 Examination',
    banglaTitle: 'আসন্ন প্রথম সাময়িক পরীক্ষা ২০২৬',
    date: '২০২৬-০৬-১০',
    category: 'Exam',
    content: 'প্রথম সাময়িক পরীক্ষা আগামী ১৫ই জুন ২০২৬ থেকে শুরু হতে যাচ্ছে। সকল শিক্ষার্থীকে বকেয়া বেতন পরিশোধ করে পরীক্ষার প্রবেশপত্র গ্রহণ করার অনুরোধ করা হলো।',
  },
  {
    id: 'n2',
    title: 'Rabindra Tagore Birth Anniversary Holiday',
    banglaTitle: 'পঁচিশে বৈশাখ রবীন্দ্র জয়ন্তী উপলক্ষে ছুটি',
    date: '২০২৬-০৫-০৮',
    category: 'Holiday',
    content: 'রবীন্দ্র জয়ন্তী উপলক্ষে আগামী শনিবার ডিলিকন মডেল একাডেমীর সাধারণ কার্যক্রম বন্ধ থাকবে। রোববার যথারীতি ক্লাস চলবে।',
  },
  {
    id: 'n3',
    title: 'Admissions Campaign 2026',
    banglaTitle: 'নতুন সেশনে সীমিত আসনে ভর্তি চলছে!',
    date: '২০২৬-০৫-০১',
    category: 'General',
    content: 'প্লে থেকে নবম শ্রেণী পর্যন্ত সীমিত আসনে ছাত্র-ছাত্রী ভর্তি চলছে। বিস্তারিত জানতে স্কুল অফিসে যোগাযোগ করুন অথবা আমাদের অনলাইন পোর্টালের মাধ্যমে আবেদন করুন।',
  },
];

export const initialStationery: StationeryItem[] = [
  {
    id: 'st1',
    name: 'Delicon Core English Book (Class 5)',
    banglaName: 'ডিলিকন কোর ইংলিশ বই (৫ম শ্রেণী)',
    stock: 120,
    price: 180,
    category: 'Book',
  },
  {
    id: 'st2',
    name: 'Institutional Diary 2026',
    banglaName: 'প্রাতিষ্ঠানিক ডায়েরি ২০২৬',
    stock: 250,
    price: 120,
    category: 'Diary',
  },
  {
    id: 'st3',
    name: 'Elite Uniform Set (Male)',
    banglaName: 'অভিজাত স্কুল ইউনিফর্ম সেট (ছাত্র)',
    stock: 85,
    price: 850,
    category: 'Uniform',
  },
  {
    id: 'st4',
    name: 'Official Delicon School Bag',
    banglaName: 'অফিসিয়াল ডিলিকন স্কুল ব্যাগ',
    stock: 45,
    price: 550,
    category: 'Bag',
  },
];

export const initialRoutes: TransportRoute[] = [
  {
    id: 'r1',
    routeName: 'Mirpur-10 to School Campus',
    driverName: 'Rafiqul Islam',
    driverPhone: '01599887766',
    vehicleNo: 'Dhaka Metro Cha-11-2090',
    monthlyFee: 1200,
    status: 'Active',
  },
  {
    id: 'r2',
    routeName: 'Uttara Sector-4 to School Campus',
    driverName: 'Ariful Alam',
    driverPhone: '01755663322',
    vehicleNo: 'Dhaka Metro Cha-14-5544',
    monthlyFee: 1800,
    status: 'Active',
  },
];

export const initialResults: ExamResult[] = [
  {
    studentId: 's1',
    studentName: 'Afifa Rahman',
    roll: '01',
    className: 'Class 5',
    subjects: {
      bangla: 88,
      english: 92,
      math: 95,
      science: 90,
      religion: 94,
    },
  },
  {
    studentId: 's2',
    studentName: 'Tanvir Ahmed',
    roll: '02',
    className: 'Class 5',
    subjects: {
      bangla: 78,
      english: 85,
      math: 89,
      science: 84,
      religion: 80,
    },
  },
];

export const initialDevProjects: DevProject[] = [
  {
    id: 'd1',
    title: 'Smart Classroom Digitalization Project',
    banglaTitle: 'স্মার্ট ক্লাসরুম ও প্রজেক্টর সিস্টেম স্থাপন',
    budget: 450000,
    progress: 80,
    status: 'In-Progress',
  },
  {
    id: 'd2',
    title: 'Modern Science Laboratory Extension',
    banglaTitle: 'আধুনিক বিজ্ঞান গবেষণাগার সম্প্রসারণ',
    budget: 600000,
    progress: 30,
    status: 'Planning',
  },
  {
    id: 'd3',
    title: 'Roof-top Green Campus Kindergarten Zone',
    banglaTitle: 'ছাদবাগান ও কিণ্ডারগার্টেন বিনোদন পার্ক',
    budget: 250000,
    progress: 100,
    status: 'Completed',
  },
];

export const initialAcademicEvents: AcademicEvent[] = [
  {
    id: 'evt_1',
    title: 'Midterm Examination 2026',
    banglaTitle: 'অর্ধবার্ষিক / সাময়িক পরীক্ষা ২০২৬',
    date: '2026-06-15',
    endDate: '2026-06-22',
    category: 'Exam',
    description: 'First terminal and midterm evaluation of the school year. All subjects covered.',
    banglaDescription: 'বছরের প্রথম সাময়িক মূল্যায়ন পরীক্ষা। সকল বিষয়ের লিখিত ও মৌখিক মূল্যায়ন অনুষ্ঠিত হবে।',
    className: 'All Classes',
    isHoliday: false
  },
  {
    id: 'evt_2',
    title: 'Eid al-Adha Vacation',
    banglaTitle: 'পবিত্র ঈদুল আজহা উপলক্ষে ছুটি',
    date: '2026-06-16',
    endDate: '2026-06-20',
    category: 'Holiday',
    description: 'School closed on the auspicious occasion of Eid al-Adha celebrations.',
    banglaDescription: 'পবিত্র ঈদুল আজহার কুরবানি ও সরকারি বন্ধের নিমিত্তে মাদরাসার সমস্ত সাধারণ ক্লাস বন্ধ থাকবে।',
    className: 'All Classes',
    isHoliday: true
  },
  {
    id: 'evt_3',
    title: 'Summer Annual Vacation',
    banglaTitle: 'গ্রীষ্মকালীন বার্ষিক অবকাশকালীন ছুটি',
    date: '2026-07-01',
    endDate: '2026-07-10',
    category: 'Holiday',
    description: 'Ten days summer holidays for all junior and senior levels.',
    banglaDescription: 'তীব্র গরম ও গ্রীষ্মের ছুটি উপলক্ষে ১০ দিন সাধারণ কার্যক্রম বন্ধ থাকবে।',
    className: 'All Classes',
    isHoliday: true
  },
  {
    id: 'evt_4',
    title: 'Annual Sports & Athletic League',
    banglaTitle: 'বার্ষিক ক্রীড়া ও অ্যাথলেটিকস প্রতিযোগিতা',
    date: '2026-07-25',
    category: 'Event',
    description: 'Track sports and athletic challenges for senior levels.',
    banglaDescription: 'মাদরাসা প্রাঙ্গণে বার্ষিক দৌড়, ফুটবল ও অন্যান্য ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হবে।',
    className: 'Class 5 to 9',
    isHoliday: false
  },
  {
    id: 'evt_5',
    title: 'Science Fair & Exhibition 2026',
    banglaTitle: 'বিজ্ঞান মেলা ও সৃজনশীল প্রজেক্ট প্রদর্শনী',
    date: '2026-08-12',
    category: 'Event',
    description: 'Exhibition of innovative technology models and experiments.',
    banglaDescription: 'মাদরাসা অডিটোরিয়ামে শিক্ষার্থীদের তৈরি বিভিন্ন রোবোটিক্স ও সায়েন্স প্রজেক্টের লাইভ প্রদর্শনী।',
    className: 'Class 6 to 9',
    isHoliday: false
  }
];

export const initialLibraryResources: LibraryResource[] = [
  {
    id: 'lib_1',
    title: 'Class 5 Mathematics Half-Yearly Past Paper',
    banglaTitle: 'শ্রেণী ৫ - গণিত অর্ধবার্ষিক নমুনা প্রশ্নাবলি',
    category: 'Question Paper',
    className: 'Class 5',
    subject: 'Mathematics',
    banglaSubject: 'গণিত',
    uploadedBy: 'জনাব কামরুল হাসান (গণিত বিভাগ প্রধান)',
    publishDate: '2026-05-12',
    fileSize: '1.4 MB',
    downloadCount: 42,
    content: '১। সংক্ষেপে উত্তর দাও (যেকোনো ১০টি):\nক) ১/৩ ও ২/৫ এর মধ্যে কোনটি বড়?\nখ) গুণক = গুণফল ÷ ?\n\n২। সৃজনশীল কাঠামোবদ্ধ প্রশ্নাবলি:\nক) একটি হোস্টেলে ২০ জন ছাত্রের ৩০ দিনের খাবার আছে। ৫ দিন পর ১০ জন নতুন ছাত্র আসলে বাকি খাদ্য কতদিন চলবে?\nখ) লসাগু ও গসাগু এর পূর্ণরূপ লিখুন।',
    banglaContent: '১। সংক্ষেপে উত্তর দাও (যেকোনো ১০টি):\nক) ১/৩ ও ২/৫ এর মধ্যে কোনটি বড়?\nখ) গুণক = গুণফল ÷ ?\n\n২। সৃজনশীল কাঠামোবদ্ধ প্রশ্নাবলি:\nক) একটি হোস্টেলে ২০ জন ছাত্রের ৩০ দিনের খাবার আছে। ৫ দিন পর ১০ জন নতুন ছাত্র আসলে বাকি খাদ্য কতদিন চলবে?\nখ) লসাগু ও গসাগু এর পূর্ণরূপ লিখুন।'
  },
  {
    id: 'lib_2',
    title: 'Quranic Arabic Vocabulary Lecture Note',
    banglaTitle: 'কুরআনিক আরবি ব্যাকরণ ও শব্দভাণ্ডার লেকচার শিট',
    category: 'Lecture Note',
    className: 'Class 8',
    subject: 'Arabic',
    banglaSubject: 'আরবি সাহিত্য',
    uploadedBy: 'হাফেজ মাওলানা ওবায়দুল্লাহ',
    publishDate: '2026-06-02',
    fileSize: '2.1 MB',
    downloadCount: 89,
    content: 'Quranic vocabulary root sheets for Verb and Noun identifiers. Highlights standard patterns of thulathi mujarrad (ثلاثي مجرد) verbs.\n1. فَعَلَ - يَفْعَلُ (He did)\n2. نَصَرَ - يَنْصُرُ (He helped)\n3. ضَرَبَ - يَضْرِبُ (He hit)\nThis guide provides essential translation formulas for class homework preparation.',
    banglaContent: 'কুরআনিক শব্দভাণ্ডারের মূল রূপ ও ক্রিয়াপদের প্রকারভেদ। বাবে সুলাসি মুজাররদ (ثلاثي مجرد) এর প্রধান গঠনসমূহ:\n১। فَعَلَ - يَفْعَلُ (কাজ করা)\n২। نَصَرَ - يَنْصُرُ (সাহায্য করা)\n৩। ضَرَبَ - يَضْرِبُ (আঘাত করা)\nএই নির্দেশিকাটি শিক্ষার্থীদের হোমওয়ার্ক ও পরীক্ষার প্রস্তুতির জন্য গুরুত্বপূর্ণ।'
  },
  {
    id: 'lib_3',
    title: 'English Grammar Tense Masterclass Syllabus',
    banglaTitle: 'ইংরেজি গ্রামার - টেন্স ও ভয়েস পরিবর্তনের সিলেবাস',
    category: 'Syllabus',
    className: 'Class 6',
    subject: 'English',
    banglaSubject: 'ইংরেজি',
    uploadedBy: 'মিস নুসরাত জেরিন',
    publishDate: '2026-04-18',
    fileSize: '780 KB',
    downloadCount: 125,
    content: 'Academic English Syllabus outlining second semester tense and voice structure conversions.\n- Indefinite & Continuous structures (Present, Past, Future)\n- Perfect structures and passive voice transformations.\nContains 20 exercises with solutions.',
    banglaContent: 'দ্বিতীয় সেমিস্টারের ইংরেজি ব্যাকরণ সিলেবাস রূপরেখা:\n- ইনডেফিনিট ও কন্টিনিউয়াস টেন্সের গঠন\n- পারফেক্ট টেন্স এবং প্যাসিভ ভয়েস রূপান্তর নিয়মাবলী।\nশিক্ষার্থীদের অনুশীলনের জন্য ২০টি নমুনা প্রশ্ন ও সমাধান সংবলিত।'
  },
  {
    id: 'lib_4',
    title: 'Interactive Natural Science Ebook for Juniors',
    banglaTitle: 'প্রাথমিক বিজ্ঞান পাঠ্য বই - প্রথম অধ্যায় (সচিত্র সংস্করণ)',
    category: 'E-Book',
    className: 'Class 5',
    subject: 'Science',
    banglaSubject: 'বিজ্ঞান',
    uploadedBy: 'ড. মো. আসাদুজ্জামান',
    publishDate: '2026-03-10',
    fileSize: '4.8 MB',
    downloadCount: 156,
    content: 'Full interactive PDF guide to Chapter 1: Ecosystems, Living Organisms, and Food Chains.\n- Producer, Consumer, Decomposer loop.\n- Environmental balances and safe resource consumption practices.',
    banglaContent: 'সচিত্র প্রাথমিক বিজ্ঞান পাঠ্যপুস্তক - প্রথম অধ্যায়: পরিবেশের উপাদান, খাদ্য শৃঙ্খল ও ভারসাম্য।\n- উৎপাদক, খাদক ও বিয়োজক চক্রের চিত্রসহ বিবরণ।\n- প্রাকৃতিক ভারসাম্য অক্ষুণ্ণ রাখার উপায় আলোচনা করা হয়েছে।'
  }
];


