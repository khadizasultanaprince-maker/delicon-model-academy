/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { MarksController } from './MarksController';
import { GuardianPerformanceCharts } from './GuardianPerformanceCharts';
import { DigitalStudentIdCard } from './DigitalStudentIdCard';
import { StudentFeeManagement } from './StudentFeeManagement';
import { AcademicCalendar } from './AcademicCalendar';
import { DigitalLibrary } from './DigitalLibrary';
import { AcademicAiAssistant } from './AcademicAiAssistant';
import { StudentProgressTracker } from './StudentProgressTracker';
import { UserRole, Student } from '../types';
import { 
  Plus, Trash2, Check, BookOpen, Clock, AlertTriangle, 
  CreditCard, MessageSquare, Save, Edit3, Send, ShieldAlert,
  UserCheck, Receipt, GraduationCap, ChevronRight, Volume2,
  Users
} from 'lucide-react';

interface DashboardPortalsProps {
  role: UserRole;
  onLogout: () => void;
  prospectData?: {
    studentName: string;
    parentName: string;
    phone: string;
    className: string;
  } | null;
  onUpgradeToGuardian?: () => void;
}

export const DashboardPortals: React.FC<DashboardPortalsProps> = ({ role, onLogout, prospectData, onUpgradeToGuardian }) => {
  const { 
    students, 
    teachers, 
    notices, 
    addNotice, 
    deleteNotice, 
    results, 
    smsLogs, 
    attendanceLogs,
    simulateAttendanceScan,
    updateStudentHomework,
    receiveFees,
    leads,
    employees,
    stationery,
    routes,
    devProjects,
    academicDrafts,
    addAcademicDraft,
    editAcademicDraft,
    updateDraftStatusAndComments,
    addStudent,
    addEmployee,
    requisitions,
    approveRequisitionByAssistant,
    rejectRequisition,
    meritStudents,
    examMarks
  } = useSchool();

  // Selected student for Guardian/Teacher actions
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const targetStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Prospect Interactive Portal States
  const [prospectMeritIndex, setProspectMeritIndex] = useState(0);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [kidsPuzzleAnswer, setKidsPuzzleAnswer] = useState('');
  const [kidsPuzzleFeedback, setKidsPuzzleFeedback] = useState<string | null>(null);
  const [kidsScore, setKidsScore] = useState(0);

  // bKash Checkout States
  const [bkashOpen, setBkashOpen] = useState(false);
  const [bkashFlowStep, setBkashFlowStep] = useState<'phone' | 'otp' | 'pin' | 'success'>('phone');
  const [bkashPhoneNumber, setBkashPhoneNumber] = useState('');
  const [bkashVerifyOtp, setBkashVerifyOtp] = useState('');
  const [bkashSecretPin, setBkashSecretPin] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [bkashError, setBkashError] = useState('');

  React.useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Forms and actions states
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeBangla, setNewNoticeBangla] = useState('');
  const [newNoticeCat, setNewNoticeCat] = useState<'General' | 'Exam' | 'Holiday' | 'Event'>('General');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // Fee inputs
  const [paymentAmount, setPaymentAmount] = useState('1500');
  const [paySuccess, setPaySuccess] = useState(false);

  // Broadcast notice simulator
  const [pubSuccess, setPubSuccess] = useState(false);

  // Chat simulator
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string, text: string, time: string }>>([
    { sender: 'Counselor', text: 'আসসালামু আলাইকুম। ডিলিকন মডেল একাডেমীর অনলাইন ভর্তি ডেস্কে আপনাকে স্বাগতম! আপনার সন্তান কোন শ্রেণীতে ভর্তি হতে ইচ্ছুক?', time: '07:12 PM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // --- NEW WORKSHOPS & PORTALS HELPER STATES ---
  // A. Accounting & Transaction logs
  const [txnDesc, setTxnDesc] = useState('');
  const [txnAmt, setTxnAmt] = useState('');
  const [txnType, setTxnType] = useState<'Credit' | 'Debit'>('Debit');
  const [txnCategory, setTxnCategory] = useState('Utility Bills');
  const [txnSuccess, setTxnSuccess] = useState(false);
  const [ledgerLogs, setLedgerLogs] = useState<Array<{ id: string, desc: string, amount: number, type: 'Credit' | 'Debit', category: string, date: string, entryBy: string }>>(() => {
    const saved = localStorage.getItem('delicon_ledger');
    return saved ? JSON.parse(saved) : [
      { id: 'tx_1', desc: 'অফিস কারেন্ট বিল মে ২০২৬', amount: 8200, type: 'Debit', category: 'Utilities', date: '2026-05-28', entryBy: 'Accountant' },
      { id: 'tx_2', desc: '৩য় শ্রেণী সেশন ফি কালেকশন', amount: 45000, type: 'Credit', category: 'Tuition Fees', date: '2026-05-29', entryBy: 'Systems Proxy' },
      { id: 'tx_3', desc: 'আইসিটি ল্যাব নতুন চেয়ার ক্রয়', amount: 15400, type: 'Debit', category: 'Capital Expenses', date: '2026-05-30', entryBy: 'Accountant' },
      { id: 'tx_4', desc: 'নতুন স্টেশনারি বই ক্রয় স্টক ইনভেস্ট', amount: 12000, type: 'Debit', category: 'Inventory', date: '2026-05-31', entryBy: 'Accountant' },
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('delicon_ledger', JSON.stringify(ledgerLogs));
  }, [ledgerLogs]);

  // B. Creative Draft workspace states
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftClass, setDraftClass] = useState('Class 5');
  const [draftCat, setDraftCat] = useState<'Question Paper' | 'Lecture Note' | 'Syllabus'>('Question Paper');
  const [draftSuccess, setDraftSuccess] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  // C. Partner reviews state
  const [partnerComments, setPartnerComments] = useState<{ [draftId: string]: string }>({});

  // D. QR Scanner Terminal Simulator states
  const [scannerSelectedEntity, setScannerSelectedEntity] = useState<string>(students[0]?.id || '');
  const [scannerSelectedType, setScannerSelectedType] = useState<'student' | 'employee'>('student');
  const [scannerSelectedPunch, setScannerSelectedPunch] = useState<'Check-In' | 'Check-Out'>('Check-In');
  const [scannerLogStatus, setScannerLogStatus] = useState<string | null>(null);

  // E. Office Assistant (অফিস সহকারী) - Student & Employee entry states
  const [astStNameEng, setAstStNameEng] = useState('');
  const [astStNameBng, setAstStNameBng] = useState('');
  const [astStClass, setAstStClass] = useState('Class 1');
  const [astStRoll, setAstStRoll] = useState('');
  const [astStGuardian, setAstStGuardian] = useState('');
  const [astStGPhone, setAstStGPhone] = useState('');
  const [astStTotalFees, setAstStTotalFees] = useState('15000');
  const [astStFeesPaid, setAstStFeesPaid] = useState('0');
  const [astStSuccess, setAstStSuccess] = useState(false);

  const [astEmpNameEng, setAstEmpNameEng] = useState('');
  const [astEmpNameBng, setAstEmpNameBng] = useState('');
  const [astEmpPhone, setAstEmpPhone] = useState('');
  const [astEmpSalary, setAstEmpSalary] = useState('18000');
  const [astEmpRole, setAstEmpRole] = useState<'Teacher' | 'Coordinator' | 'Staff' | 'Driver' | 'Management'>('Teacher');
  const [astEmpSuccess, setAstEmpSuccess] = useState(false);

  // --- NEW WORKSHOPS & PORTALS HELPER SUBMITS ---
  const handleAddLedgerTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txnAmt);
    if (!txnDesc || isNaN(amt) || amt <= 0) return;

    const newTx = {
      id: 'tx_' + Date.now(),
      desc: txnDesc,
      amount: amt,
      type: txnType,
      category: txnCategory,
      date: new Date().toISOString().split('T')[0],
      entryBy: 'Accountant'
    };

    setLedgerLogs(prev => [newTx, ...prev]);
    setTxnDesc('');
    setTxnAmt('');
    setTxnSuccess(true);
    setTimeout(() => setTxnSuccess(false), 3000);
  };

  const handleCreateOrEditDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle || !draftContent) return;

    if (editingDraftId) {
      editAcademicDraft(editingDraftId, draftTitle, draftContent, draftClass, draftCat);
      setEditingDraftId(null);
    } else {
      addAcademicDraft({
        title: draftTitle,
        category: draftCat,
        content: draftContent,
        className: draftClass,
        creatorName: 'আপনার ক্রিয়েটিভ প্যানেল'
      });
    }

    setDraftTitle('');
    setDraftContent('');
    setDraftSuccess(true);
    setTimeout(() => setDraftSuccess(false), 3000);
  };

  const startEditDraft = (id: string) => {
    const target = academicDrafts.find(d => d.id === id);
    if (!target) return;
    setEditingDraftId(target.id);
    setDraftTitle(target.title);
    setDraftContent(target.content);
    setDraftClass(target.className);
    setDraftCat(target.category);
  };

  const handleQRScanSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerSelectedEntity) return;

    const res = simulateAttendanceScan(scannerSelectedEntity, scannerSelectedType, scannerSelectedPunch);
    setScannerLogStatus(res.message);
    setTimeout(() => setScannerLogStatus(null), 5000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'You', text: chatInput, time: nowStr };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let replyText = 'ধন্যবাদ আপনার মেসেজের জন্য। আবেদনের বিস্তারিত জানতে অনুগ্রহ করে আপনার এডমিশন ফোন ট্র্যাকিং সম্পন্ন করুন অথবা আমাদের হেল্পলাইনে কল করুন।';
      if (chatInput.includes('ফি') || chatInput.includes('বেতন')) {
        replyText = 'আমাদের মাসিক বেতন প্লে থেকে ৫ম শ্রেণী ১২০০-১৮০০ টাকা এবং ৬ষ্ঠ থেকে ১০ম শ্রেণী ২৫০০ টাকা পর্যন্ত। বৃত্তির সুবিধা রয়েছে।';
      } else if (chatInput.includes('বাস') || chatInput.includes('পরিবহন')) {
        replyText = 'হ্যাঁ! আমাদের নিজস্ব স্কুল পরিবহন বা ডিলিকন বাস সার্ভিস মিরপুর ও উত্তরা রুটে নিয়মিত চলাচল করে।';
      }
      setChatMessages(prev => [...prev, { sender: 'Counselor', text: replyText, time: nowStr }]);
    }, 1200);
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;
    addNotice({
      title: newNoticeTitle,
      banglaTitle: newNoticeBangla || newNoticeTitle,
      date: new Date().toISOString().split('T')[0],
      category: newNoticeCat,
      content: newNoticeContent
    });
    setPubSuccess(true);
    setNewNoticeTitle('');
    setNewNoticeBangla('');
    setNewNoticeContent('');
    setTimeout(() => setPubSuccess(false), 3000);
  };

  const handlePayFees = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0 || !targetStudent) return;
    receiveFees(targetStudent.id, amt);
    setPaySuccess(true);
    setTimeout(() => setPaySuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Portal Indicator */}
      <div className="mb-6 flex flex-col justify-between border-b border-blue-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <p className="text-xs font-bold tracking-wider text-blue-900 uppercase font-mono">
              ACTIVE ACADEMIC PORTAL
            </p>
          </div>
          <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
            {role === 'Prospect' && 'প্রসপেক্ট ও ভর্তি ইচ্ছুক ড্যাশবোর্ড'}
            {role === 'Student' && 'শিক্ষার্থী ডিজিটাল পোর্টাল'}
            {role === 'Guardian' && 'অভিভাবক ডিজিটাল গেটওয়ে'}
            {role === 'Teacher' && 'শিক্ষক প্রশাসন কন্ট্রোল রুম'}
            {role === 'Partner' && 'পিয়ার পার্টনারশিপ প্যানেল'}
            {role === 'Scanner' && 'স্মার্ট আরএফআইডি / কিউআর অ্যাটেনডেন্স টার্মিনাল'}
            {role === 'Accountant' && 'হিসাব ও অর্থ নিরীক্ষণ উইং'}
            {role === 'Creator' && 'ডিন / কন্টেন্ট মেকার স্টুডিও'}
            {role === 'Assistant' && 'অফিস সহকারী ইন্টারফেস'}
          </h1>
        </div>
      </div>

      {role === 'Prospect' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL: 8 cols */}
          <div className="lg:col-span-8 space-y-6">

            {/* 1A. Welcome Banner / Lead Information */}
            <div className="bg-indigo-600 text-white p-6 rounded-3xl border border-indigo-500 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15)_0%,transparent_60%)]"></div>
              <h2 className="text-xl font-black mb-1">স্বাগতম, {prospectData?.parentName || 'সম্মানিত অভিভাবক'}!</h2>
              <p className="text-xs text-indigo-100 leading-relaxed max-w-xl">
                ডিলিকন মডেল একাডেমীর অনলাইন প্রক্রিয়ায় আপনার স্বকীয় উপস্থিতি আমাদের ধন্য করেছে। আপনার ভবিষ্যৎ প্রজন্মের সুকীর্তি ও শিক্ষা সুনিশ্চিত করতে আমরা অঙ্গীকারবদ্ধ।
              </p>
            </div>
            <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm text-left">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                    <span>🏆</span> কৃতি শিক্ষার্থীদের গৌরবময় সাফল্যায়ন স্লাইডশো
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-sans">আমাদের সোনালী বাগানের বিকশিত ফুল ও তাদের অনুভূতি</p>
                </div>
                <div className="flex gap-1.5 select-none">
                  <button 
                    onClick={() => {
                      const totalCount = (meritStudents && meritStudents.length > 0) ? meritStudents.length : 3;
                      setProspectMeritIndex((prev) => (prev - 1 + totalCount) % totalCount);
                    }}
                    className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                  >
                    ‹
                  </button>
                  <button 
                    onClick={() => {
                      const totalCount = (meritStudents && meritStudents.length > 0) ? meritStudents.length : 3;
                      setProspectMeritIndex((prev) => (prev + 1) % totalCount);
                    }}
                    className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>

              {(() => {
                const meritDataFallback = [
                  {
                    name: "আদনান সামি",
                    className: "১০ম শ্রেণী",
                    achievement: "এস.এস.সি বোর্ডে গোল্ডেন এ+",
                    quote: "ডিলিকন একাডেমীর সুশৃঙ্খল পরিবেশ ও দ্বিমুখী কুইজ সিস্টেমে যুক্ত থেকে আনন্দের সাথে প্রতিটি বিষয় শিখে আজ আমি গোল্ডেন এ+ অর্জন করতে সমর্থ হয়েছি।",
                    photoUrl: "",
                    award: "গোল্ডেন স্টার",
                    color: "bg-amber-50 border-amber-200 text-amber-900",
                    avatarFallback: "🧑‍🎓"
                  },
                  {
                    name: "ফারহানা ইয়াসমিন",
                    className: "৮ম শ্রেণী",
                    achievement: "জাতীয় ট্যালেন্ট স্কলারশিপ ২৫",
                    quote: "শিক্ষকদের যত্ন ও পরম স্নেহের অনুপ্রেরণায় আমি গণিত ভীতি কাটিয়ে সাফল্য পেয়েছি। এখানে কোনো শারীরিক শাস্তি নেই, শিক্ষকরা আমাদের পরম মমতায় পড়ান।",
                    photoUrl: "",
                    award: "ট্যালেন্ট স্কলার",
                    color: "bg-emerald-50 border-emerald-200 text-emerald-950",
                    avatarFallback: "👩‍🎓"
                  },
                  {
                    name: "তাসনিমুল কবীর সায়েম",
                    className: "৫ম শ্রেণী",
                    achievement: "জাতীয় অলিম্পিয়াড চ্যাম্পিয়ন",
                    quote: "স্কুলের বাস্তবভিত্তিক শিক্ষা কাস্ট এবং রোবোটিক্স ক্লাবের মেন্টরিং ক্লাবের জন্যই আমি প্রথম অলিম্পিয়াডেই গোল্ড মেডেল জয়ী হয়ে স্কুলকে ধন্য করেছি।",
                    photoUrl: "",
                    award: "অলিম্পিয়াড গোল্ড মেডেল",
                    color: "bg-indigo-50 border-indigo-200 text-indigo-900",
                    avatarFallback: "🧑‍💻"
                  }
                ];

                const activeList = meritStudents && meritStudents.length > 0 ? meritStudents : meritDataFallback;
                const safeIndex = prospectMeritIndex % activeList.length;
                const activeMerit = activeList[safeIndex];

                if (!activeMerit) {
                  return (
                    <div className="p-5 text-center text-xs text-slate-400">কোনো কৃতি শিক্ষার্থী পাওয়া যায়নি</div>
                  );
                }

                const colorPresets = [
                  "bg-amber-50/75 border-amber-100 text-amber-950/90",
                  "bg-emerald-50/70 border-emerald-100 text-emerald-950/90",
                  "bg-indigo-50/70 border-indigo-100 text-indigo-955 bg-indigo-50/20",
                  "bg-sky-50/70 border-sky-100 text-sky-955",
                  "bg-rose-50/70 border-rose-100 text-rose-955"
                ];

                const cardColor = activeMerit.color || colorPresets[safeIndex % colorPresets.length];
                const fallbackAvatar = activeMerit.avatarFallback || "⭐";

                return (
                  <div className={`p-5 rounded-2xl border-2 ${cardColor} transition-all duration-500 flex flex-col md:flex-row items-center gap-4 text-left`}>
                    <div className="shrink-0">
                      {activeMerit.photoUrl ? (
                        <div className="h-16 w-16 rounded-2xl border-2 border-white shadow bg-white overflow-hidden flex items-center justify-center">
                          <img 
                            src={activeMerit.photoUrl} 
                            alt={activeMerit.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentNode as HTMLDivElement;
                              const fallbackSpan = document.createElement('span');
                              fallbackSpan.innerText = fallbackAvatar;
                              fallbackSpan.className = 'text-3xl flex h-full w-full items-center justify-center';
                              parent.appendChild(fallbackSpan);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-3xl bg-white p-3 rounded-2xl shadow-sm h-14 w-14 flex items-center justify-center">
                          {fallbackAvatar}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-extrabold text-sm text-slate-900">{activeMerit.name}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded border font-bold text-slate-600 font-sans">{activeMerit.className || (activeMerit as any).class}</span>
                        <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse leading-none font-sans">{activeMerit.achievement}</span>
                        {activeMerit.award && (
                          <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded shadow-sm font-bold font-sans">★ {activeMerit.award}</span>
                        )}
                      </div>
                      <p className="text-xs italic leading-relaxed mt-2.5 text-slate-700">
                        “{activeMerit.quote}”
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-center gap-1.5 mt-3.5">
                {(() => {
                  const totalCount = meritStudents && meritStudents.length > 0 ? meritStudents.length : 3;
                  return Array.from({ length: totalCount }).map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setProspectMeritIndex(idx)}
                      className={`h-2 w-2 rounded-full transition-all cursor-pointer ${prospectMeritIndex === idx ? 'bg-indigo-600 w-4 font-bold' : 'bg-slate-300'}`}
                    />
                  ));
                })()}
              </div>
            </div>

            {/* 1C. FEATURED TEACHERS (সেরা শিক্ষকদের পরিচিতি) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md">
              <h3 className="font-black text-slate-900 text-sm sm:text-base mb-4 flex items-center gap-1.5">
                <span>👩‍🏫</span> আমাদের কদমতলীর মালী: আমাদের বরণীয় সেরা কিছু শিক্ষকবৃন্দ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "তাহমিনা সুলতানা", role: "সিনিয়র মেন্টর (বাংলা)", exper: "১২+ বছরের শিক্ষকতা", slogan: "স্নেহ ও আদর্শই সৃষ্টির জাদুকরী সুর।", avatar: "👩‍🏫" },
                  { name: "প্রকৌশলী মফিজুল রহমান", role: "আইসিটি ও রোবোটিক্স গবেষক", exper: "বুয়েট গ্র্যাজুয়েট মেন্টর", slogan: "কোডিং ও যুক্তি দিয়ে হোক মেধার সৃজনশীল উন্মেষ।", avatar: "👨‍💻" },
                  { name: "অধ্যাপিকা সানজিদা আক্তার", role: "শিশু মনোবিজ্ঞান ও কনসালট্যান্ট", exper: "শিশুর সার্বিক বিকাশ পরামর্শক", slogan: "প্রতিটি শিশুই ইউনিক সৌরভে বিকশিত হতে চায়।", avatar: "👩‍⚕️" }
                ].map((tc, idx) => (
                  <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 hover:border-indigo-400 transition-all text-center flex flex-col justify-between items-center group shadow-sm">
                    <span className="text-3xl bg-white h-12 w-12 rounded-full flex items-center justify-center shadow-sm mb-3.5 transition group-hover:scale-110">
                      {tc.avatar}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-xs.5">{tc.name}</h4>
                      <p className="text-[10px] text-indigo-700 font-extrabold mt-0.5">{tc.role}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-mono">১৩+ বছর শিক্ষকতা</p>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2.5 pt-2 border-t border-slate-200 italic leading-snug w-full">
                      “{tc.slogan}”
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 1D. VIRTUAL KIDS' ZONE (ভার্চুয়াল কিডস জোন + Math Puzzle) */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-[radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.2)_0%,transparent_60%)]"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl animate-bounce">🎨</span>
                <div>
                  <h3 className="font-black text-rose-400 tracking-wide text-sm sm:text-base">ভার্চুয়াল কিডস জোন (Virtual Kids' Zone)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">অভিভাবক ও শিশুদের জন্য ম্যাথমেটিক্যাল গেম এবং কুইজ ল্যাব</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div className="md:col-span-7 space-y-3 text-xs text-slate-300">
                  <span className="bg-purple-500/20 text-purple-300 text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded border border-purple-500/20 block w-max">
                    PUZZLE OF THE WEEK
                  </span>
                  <p className="font-bold text-slate-100 text-sm">আপেল গণনাকারীর মজার ধাঁধাঃ</p>
                  <p className="leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 italic">
                    “একটি লাল ঝুড়িতে <strong className="text-amber-400 font-extrabold">৭টি লাল আপেল</strong> এবং পার্শ্ববর্তী সবুজ ঝুড়িতে <strong className="text-emerald-400 font-extrabold">৮টি সবুজ আপেল</strong> আছে। তাহলে বলুন তো, দুটি ঝুড়িতে মোট কয়টি আপেল আছে?”
                  </p>
                  
                  {/* Puzzle Form input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="সরল উত্তর টাইপ করুন (যেমন: ১৫)"
                      value={kidsPuzzleAnswer}
                      onChange={(e) => {
                        setKidsPuzzleAnswer(e.target.value);
                        setKidsPuzzleFeedback(null);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs w-full text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => {
                        const sanitized = kidsPuzzleAnswer.trim().replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
                        if (sanitized === '15') {
                          setKidsPuzzleFeedback('correct');
                          setKidsScore(prev => prev + 10);
                        } else {
                          setKidsPuzzleFeedback('incorrect');
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 font-black rounded-xl cursor-pointer shrink-0 transition"
                    >
                      উত্তর দিন 🎯
                    </button>
                  </div>

                  {kidsPuzzleFeedback === 'correct' && (
                    <p className="text-xs text-emerald-400 font-extrabold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5 leading-none animate-bounce">
                      <span>✓</span> চমৎকার! আপনার দেওয়া উত্তরটি ১০০% সঠিক হয়েছে। কিডস জোনে +১০ স্কোর অর্জিত! 🎉
                    </p>
                  )}
                  {kidsPuzzleFeedback === 'incorrect' && (
                    <p className="text-xs text-rose-450 font-extrabold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-rose-400">
                      ⚠ দুঃখিত! উত্তরটি সঠিক হয়নি। আবার চেষ্টা করুন! (ইঙ্গিত: ৭ + ৮)
                    </p>
                  )}
                </div>

                <div className="md:col-span-5 bg-slate-950 rounded-2xl p-4 border border-slate-800 text-center flex flex-col items-center justify-center">
                  <span className="text-4xl animate-pulse">👑</span>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">KIDS COMPASS CREDENTIAL</p>
                  <p className="text-2xl font-black text-rose-455 mt-1 text-rose-450">৮৫% মেমোরি স্কোর</p>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-3 max-w-[150px]">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-purple-600 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 font-mono">My Score: {kidsScore} XP</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Parent's Interactive Quiz, Duties & bKash Fee Payment (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1E. BKASH FEES PAYMENT ENROLLMENT CORE MODULE (বিকাশ পেমেন্ট গেটওয়ে) */}
            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider leading-none">
                Admission billing gate
              </div>
              <h3 className="font-black text-slate-800 text-sm mb-1">ভর্তি নিশ্চিতকরণ ফি বিলিং প্যানেল</h3>
              <p className="text-[10px] text-slate-500">পরিবার ভেরিফিকেশন ও সেশন ফি পেমেন্ট</p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-3.5 space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">আবেদনকারীর নামঃ</span>
                  <span className="font-extrabold text-slate-800">{prospectData?.studentName || 'আফিফা সুলতানা'}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">বিলিং বিবরণঃ</span>
                  <span className="font-bold text-slate-600">ভর্তি ফরম ও সেশন আইডি বুকিং</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">আবেদন কোডঃ</span>
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-[10px] text-slate-500">DL-REG-2026</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500 font-bold">মোট প্রদেয় বিলঃ</span>
                  <span className="text-base font-black text-indigo-700">৳ ১,২০০/- টাকা</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    setBkashPhoneNumber(prospectData?.phone || '01712345678');
                    setBkashFlowStep('phone');
                    setBkashError('');
                    setBkashOpen(true);
                  }}
                  className="w-full bg-[#E2125D] hover:bg-[#C00F4E] text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 font-black text-xs transition shadow-md active:scale-98 cursor-pointer"
                >
                  <span className="bg-white text-[#E2125D] text-[10px] font-black h-5 w-10 flex items-center justify-center rounded">বিকাশ</span>
                  বিকাশ গেটওয়ে দিয়ে বিল পরিশোধ করুন ৳১,২০০
                </button>
              </div>

              {/* bkash checkout modal simulation frame */}
              {bkashOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
                  <div className="w-full max-w-sm bg-[#E2125D] rounded-t-3xl rounded-b-xl overflow-hidden shadow-2xl relative border-2 border-[#ff3682]">
                    
                    {/* Header with bKash Brand Logo */}
                    <div className="bg-white p-4 flex justify-between items-center border-b border-rose-100">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-[#E2125D] text-white font-black text-xs h-7 w-12 flex items-center justify-center rounded-md italic">
                          bKash
                        </div>
                        <div className="text-left leading-none">
                          <span className="text-[12px] font-extrabold text-[#E2125D] block">ডি লিকন মডেল একাডেমী</span>
                          <span className="text-[9px] text-slate-400 font-mono font-bold block mt-0.5">Merchant Payment Gate</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setBkashOpen(false)}
                        className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Bill / Invoice Summary Block inside modal */}
                    <div className="bg-rose-50 px-4 py-3.5 flex justify-between items-center text-slate-700 border-b border-[#ffacc8] text-xs">
                      <div>
                        <p className="text-[10px] text-slate-500 leading-tight">ভর্তি বুকিং মার্চেন্ট স্লট</p>
                        <p className="font-extrabold text-slate-800 text-[11px] leading-tight mt-0.5">Booking ID: DL-2026</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 leading-tight">মোট বিল ফি</p>
                        <p className="font-black text-[#E2125D] leading-tight mt-0.5 text-sm">৳ ১,২০০.০০</p>
                      </div>
                    </div>

                    {/* Step Content of bKash Flow */}
                    <div className="p-6 text-white space-y-4">
                      
                      {bkashFlowStep === 'phone' && (
                        <div className="space-y-3">
                          <label className="text-xs font-bold block">আপনার বিকাশ অ্যাকাউন্ট নম্বর প্রদান করুনঃ</label>
                          <input
                            type="text"
                            placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                            value={bkashPhoneNumber}
                            onChange={(e) => {
                              setBkashPhoneNumber(e.target.value);
                              setBkashError('');
                            }}
                            className="w-full bg-white border border-rose-300 text-slate-900 font-bold px-3 py-2.5 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-400"
                          />
                          <p className="text-[9px] text-[#ffbccc] leading-tight">
                            পরবর্তী ধাপে এই নাম্বারে একটি ৬ সংখ্যার ভেরিফিকেশন কোড (OTP) প্রেরণ করা হবে।
                          </p>

                          <div className="pt-3 flex gap-2">
                            <button
                              onClick={() => setBkashOpen(false)}
                              className="w-1/2 bg-[#C00F4E] hover:bg-[#92093a] text-white font-bold text-xs py-2.5 rounded border border-[#ff3682] cursor-pointer"
                            >
                              বাতিল করুন
                            </button>
                            <button
                              onClick={() => {
                                if (bkashPhoneNumber.length < 11) {
                                  setBkashError('অনুগ্রহ করে সঠিক ১১-সংখ্যার বিকাশ মোবাইল নাম্বার ইনপুট দিন।');
                                  return;
                                }
                                setBkashFlowStep('otp');
                                setOtpTimer(120); // 2 minutes countdown
                                // Show OTP on screen so user can easily types it!
                                alert('বিকাশ পেমেন্ট গেটওয়েঃ আপনার টেস্ট OTP কোড হলো: "১২০৪৫৯"');
                              }}
                              className="w-1/2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2.5 rounded shadow cursor-pointer text-center"
                            >
                              এগিয়ে যান ➔
                            </button>
                          </div>
                        </div>
                      )}

                      {bkashFlowStep === 'otp' && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold block">৬ সংখ্যার ভেরিফিকেশন ওটিপি (OTP) দিনঃ</label>
                            <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">
                              {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <input
                            type="text"
                            placeholder="১২০৪৫৯ টাইপ করুন"
                            value={bkashVerifyOtp}
                            onChange={(e) => {
                              setBkashVerifyOtp(e.target.value);
                              setBkashError('');
                            }}
                            className="w-full bg-white border border-rose-300 text-slate-900 font-bold px-3 py-2.5 rounded-lg text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                          <p className="text-[10px] text-[#ffcccb] text-center leading-none">
                            টেস্ট ওটিপি ও কনফার্মেশন কোডঃ <strong className="text-white font-bold font-mono">১২০৪৫৯</strong>
                          </p>

                          <div className="pt-3 flex gap-2">
                            <button
                              onClick={() => setBkashFlowStep('phone')}
                              className="w-1/2 bg-[#C00F4E] hover:bg-[#92093a] text-white font-bold text-xs py-2.5 rounded border border-[#ff3682] cursor-pointer"
                            >
                              পেছনে যান
                            </button>
                            <button
                              onClick={() => {
                                if (bkashVerifyOtp.trim() !== '120459') {
                                  setBkashError('ভুল ওটিপি (OTP) দিয়েছেন! দয়া করে সঠিক কোড ১২০৪৫৯ টাইপ করুন।');
                                  return;
                                }
                                setBkashFlowStep('pin');
                              }}
                              className="w-1/2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2.5 rounded shadow cursor-pointer text-center"
                            >
                              নিশ্চিত করুন
                            </button>
                          </div>
                        </div>
                      )}

                      {bkashFlowStep === 'pin' && (
                        <div className="space-y-3">
                          <label className="text-xs font-bold block">আপনার বিকাশ পিন নম্বর (PIN) লিখুনঃ</label>
                          <input
                            type="password"
                            placeholder="••••"
                            maxLength={4}
                            value={bkashSecretPin}
                            onChange={(e) => {
                              setBkashSecretPin(e.target.value);
                              setBkashError('');
                            }}
                            className="w-full bg-white border border-rose-300 text-slate-900 font-bold px-3 py-2.5 rounded-lg text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                          <p className="text-[9px] text-[#ffbccc] leading-tight text-center">
                            নিরাপত্তা সতর্কতাঃ কোনো অবস্থাতেই কারো সাথে আপনার পিন নম্বরটি শেয়ার করবেন না।
                          </p>

                          <div className="pt-3 flex gap-2">
                            <button
                              onClick={() => setBkashFlowStep('otp')}
                              className="w-1/2 bg-[#C00F4E] text-white font-bold text-xs py-2.5 rounded border border-[#ff3682] cursor-pointer"
                            >
                              পেছনে যান
                            </button>
                            <button
                              onClick={() => {
                                if (bkashSecretPin.replace(/\s/g, '').length < 4) {
                                  setBkashError('৪-সংখ্যার পিন নাম্বার লিখুন (যেমন: ৫২৫২)।');
                                  return;
                                }
                                setBkashFlowStep('success');
                                setTimeout(() => {
                                  setBkashOpen(false);
                                  // TRIGGER GUARDIAN ROLE UPGRADE IMMEDIATELY ON SITE
                                  if (onUpgradeToGuardian) {
                                    onUpgradeToGuardian();
                                  }
                                }, 2200);
                              }}
                              className="w-1/2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2.5 rounded shadow cursor-pointer text-center flex items-center justify-center gap-1.5"
                            >
                              পেমেন্ট করুন ➔
                            </button>
                          </div>
                        </div>
                      )}

                      {bkashFlowStep === 'success' && (
                        <div className="text-center py-6 space-y-4">
                          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-[#E2125D] mx-auto text-3xl font-bold border-4 border-emerald-400 shadow-md">
                            ✓
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-white text-base">পেমেন্ট সফল হয়েছে! 🎉</h4>
                            <p className="text-xs text-rose-100">ট্রানজেকশন আইডিঃ <span className="font-mono bg-rose-950 px-1 py-0.5 rounded text-[11px] font-bold">TXN84725DL2026</span></p>
                          </div>
                          <p className="text-xs text-slate-100 bg-rose-950/40 p-2 rounded-xl text-center">
                            পেমেন্ট সাকসেসের সাথে সাথেই আপনার পোর্টাটি মুহূর্তের মধ্যে অভিভাবক ড্যাশবোর্ডে রূপান্তরিত হচ্ছে... লোডিং প্লিজ!
                          </p>
                          <div className="inline-block h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}

                      {bkashError && (
                        <p className="text-[10px] font-bold text-amber-200 bg-[#7c0730]/60 p-2.5 rounded-xl border border-rose-450/40">
                          ⚠ {bkashError}
                        </p>
                      )}

                    </div>

                    {/* bKash security verification footer */}
                    <div className="bg-[#bc0b4b] p-3 text-center text-[10px] text-rose-100/70 border-t border-[#ff3682]">
                      🔒 128-bit Secured payment via SSL & bKash APIs
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* 1F. PARENT READINESS AT BOOKING CONTEST (কুইজ কন্টেস্ট) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md">
              <h3 className="font-black text-slate-800 text-sm mb-1">অভিভাবক সচেতনতা মূল্যায়ন কুইজ</h3>
              <p className="text-[10px] text-slate-500">সন্তানের ভবিষ্যৎ গঠনে আপনার সঠিক পদক্ষেপ যাচাই</p>

              {quizFinished ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mt-3 text-center space-y-2 text-slate-700">
                  <span className="text-3xl">🥳</span>
                  <p className="font-black text-xs text-emerald-900 leading-tight">অভিনন্দন! কুইজটি সফলভাবে সম্পন্ন হয়েছে।</p>
                  <p className="text-[11px]">আপনার সচেতনতা স্কোরঃ <strong className="text-emerald-700 text-sm font-mono">{quizScore}/২</strong></p>
                  <button
                    onClick={() => {
                      setQuizQuestionIndex(0);
                      setQuizScore(0);
                      setQuizFinished(false);
                      setQuizSelectedOption(null);
                    }}
                    className="mt-1 bg-white border border-emerald-300 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
                  >
                    আবার কুইজে অংশ নিন
                  </button>
                </div>
              ) : (
                <div className="mt-3.5 space-y-3.5">
                  {(() => {
                    const quizQuestions = [
                      {
                        q: "১. শিক্ষা ক্ষেত্রে শিক্ষার্থীর সর্বোচ্চ মেধার উন্মেষ ঘটে কোন উপায়ে?",
                        options: [
                          "কঠোর শাসক ও ভীতি প্রদর্শনের মাধ্যমে",
                          "মুখস্থ বিদ্যা ও শতভাগ চাপের মাধ্যমে",
                          "পরম স্নেহ, প্রণোদনা ও আনন্দের সাথে ব্যবহারিক অনুশীলনে"
                        ],
                        correct: "পরম স্নেহ, প্রণোদনা ও আনন্দের সাথে ব্যবহারিক অনুশীলনে",
                        tip: "ডিলিকন একাডেমী বিশ্বাস করে স্নেহেই পরম সুকৃতি লুকিয়ে আছে।"
                      },
                      {
                        q: "২. পরীক্ষায় জিপিএ ৫ পাওয়ার চেয়েও সন্তানের পরবর্তী জীবনে কোনটি বেশি গুরুত্বপূর্ণ?",
                        options: [
                          "বই মুখস্থ করা ও ক্লাসরুম ফার্স্ট হওয়া",
                          "সৎ, সাহসী, সহনশীল ও জাস্টিফাইড নাগরিক হওয়া",
                          "অভিভাবকের নিজস্ব গৌরব ও অহংকার রাখা"
                        ],
                        correct: "সৎ, সাহসী, সহনশীল ও জাস্টিফাইড নাগরিক হওয়া",
                        tip: "জাস্টিফাইড নাগরিকত্বই সোনার বাংলা গড়ার অন্যতম মাপকাঠি।"
                      }
                    ];
                    const activeQ = quizQuestions[quizQuestionIndex];
                    return (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-800 leading-relaxed bg-slate-50 py-2 px-3 rounded-lg border-l-2 border-indigo-500">
                          {activeQ.q}
                        </p>
                        <div className="space-y-1.5">
                          {activeQ.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => setQuizSelectedOption(option)}
                              className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition-all flex justify-between items-center cursor-pointer ${
                                quizSelectedOption === option 
                                  ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-extrabold' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span>{option}</span>
                              {quizSelectedOption === option && <span className="h-4 w-4 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[8px]">✓</span>}
                            </button>
                          ))}
                        </div>

                        <button
                          disabled={!quizSelectedOption}
                          onClick={() => {
                            if (quizSelectedOption === activeQ.correct) {
                              setQuizScore(prev => prev + 1);
                            }
                            if (quizQuestionIndex < quizQuestions.length - 1) {
                              setQuizQuestionIndex(prev => prev + 1);
                              setQuizSelectedOption(null);
                            } else {
                              setQuizFinished(true);
                            }
                          }}
                          className={`w-full text-white font-extrabold text-[10px] py-2 rounded-xl transition ${
                            quizSelectedOption ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-sm' : 'bg-slate-300 cursor-not-allowed'
                          }`}
                        >
                          পরবর্তী প্রশ্ন ➔
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 1G. PARENTAL DUTIES CHECKS (বাবা মা হিসেবে সন্তানের প্রতি কর্তব্য) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md">
              <h3 className="font-black text-slate-800 text-sm mb-1">অভিভাবক হিসেবে আপনার প্রাত্যহিক দায়িত্ব</h3>
              <p className="text-[10px] text-slate-500">পরম অভিভাবক বা মালী হিসেবে প্রতিদিনের প্রতি সংকল্প</p>
              
              <div className="mt-3.5 space-y-2.5">
                {[
                  { title: "প্রতিদিন অন্তত ৩০ মিনিট কোয়ালিটি সময় দেওয়া", desc: "শাসন নয়, তার ভালো কাজকে পরম স্নেহে প্রশংসা করুন।" },
                  { title: "পড়া মুখস্থ চাপিয়ে না দিয়ে জীবনমুখী পাঠে উৎসাহিত করা", desc: "পরীক্ষার সীমানার চেয়ে মানুষের মানবিক উৎকর্ষ অনেক দামী।" },
                  { title: "শিক্ষকদের সাথে নিয়মিত যোগাযোগ নিশ্চিত করা", desc: "বাগান সুন্দর রাখতে মালী এবং অভিভাবকের যৌথ কাজ চমৎকার।" }
                ].map((duty, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-2.5 hover:shadow-sm transition-all">
                    <input type="checkbox" defaultChecked={idx === 0} className="mt-0.5 accent-indigo-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs leading-tight">{duty.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">{duty.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          3. GUARDIAN PORTAL (অভিভাবক গেটওয়ে)
         ======================================================== */}
      {(role === 'Guardian' || role === 'Student') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Child Selector */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">সহজ সন্তান সিলেকশন</span>
                <select 
                  value={selectedStudentId} 
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="rounded border border-slate-200 p-1 text-xs text-slate-700 focus:outline-blue-600 mt-1 bg-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.banglaName} ({s.className} - রোল: {s.roll})</option>
                  ))}
                </select>
              </div>
              <div className="text-right">
                {(() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const myCheckins = attendanceLogs.filter(log => log.targetId === (targetStudent?.id || '') && log.type === 'Check-In');
                  const checkInToday = myCheckins.some(log => log.timestamp.startsWith(todayStr));
                  const checkOutToday = attendanceLogs.some(log => log.targetId === (targetStudent?.id || '') && log.type === 'Check-Out' && log.timestamp.startsWith(todayStr));
                  
                  // Calculate dynamic percentage
                  const activePct = myCheckins.length > 0 
                    ? Math.min(100, 85 + myCheckins.length * 5) 
                    : 0;

                  return (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-500 block">উপস্থিতির হার</span>
                      <span className="text-base font-extrabold text-blue-900 leading-none mt-0.5">{activePct}%</span>
                      <span className={`inline-block text-[8px] font-bold px-2 py-0.5 rounded-full mt-1.5 border leading-none ${
                        checkOutToday 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : checkInToday 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {checkOutToday ? 'ছুটি (ইতিমধ্যে প্রস্থান কৃত)' : checkInToday ? 'ক্যাম্পাসে উপস্থিত' : 'আজ অনুপস্থিত (নো স্ক্যান)'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Digital Student ID Card Component */}
            {targetStudent && (
              <DigitalStudentIdCard student={targetStudent} />
            )}

            {/* Visual Progress Tracker & Academic Milestones */}
            {targetStudent && (
              <StudentProgressTracker student={targetStudent} />
            )}

            {/* Student Attendance and Grades Analytics Visualization */}
            {targetStudent && (
              <GuardianPerformanceCharts 
                student={targetStudent} 
                examMarks={examMarks} 
                attendanceLogs={attendanceLogs} 
              />
            )}

            {/* Parent Entry Tracker & Live SMS Log Feed */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">হাজিরা ট্র্যাকিং ও তাৎক্ষণিক Guardian SMS লগ</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">আপনার সন্তান স্কুলে পাঞ্চ করার সাথে সাথে যে নোটিফিকেশন মেসেজ পেয়েছেন তার রেকর্ড ট্রেইল</p>
                </div>
              </div>

              {smsLogs.filter(log => log.studentName === targetStudent?.banglaName).length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">বর্তমানে কোনো ডিজিটাল মেসেজ লগ নেই।</p>
                  <p className="text-[10px] text-blue-900 mt-2 font-semibold">পরীক্ষার জন্য এডমিন প্যানেল বা এটেনডেন্স সিমুলেটরে গিয়ে একটি পাঞ্চ ট্রাই করুন!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {smsLogs.filter(log => log.studentName === targetStudent?.banglaName).map((sms, i) => (
                    <div key={i} className="p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm relative pr-20">
                      <div className="flex gap-2 items-center mb-1.5 border-b border-blue-50 pb-1.5 text-[9px] font-bold text-blue-900 uppercase">
                        <Volume2 className="h-3 w-3 text-amber-500" />
                        <span>দ্বিমুখী ডিজিটাল SMS নিশ্চিতকরণ</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">"{sms.text}"</p>
                      <div className="absolute top-4 right-4 text-right">
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-50/80 px-1.5 py-0.5 rounded border border-slate-105">{new Date(sms.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Invoices & Billing */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-4">স্কুল গেটওয়ে ফি পেমেন্ট ও কুইক এন্ট্রি</h3>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl mb-4 border border-slate-150">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">ইনভয়েস ব্যালেন্স</span>
                  <p className="text-xl font-black text-rose-600">৳ {targetStudent ? (targetStudent.totalFees - targetStudent.feesPaid) : 0}</p>
                  <p className="text-[10px] text-slate-400 mt-1">সর্বমোট পরিশোধিত বকেয়া: ৳ {targetStudent?.feesPaid} / ৳ {targetStudent?.totalFees}</p>
                </div>
                
                {paySuccess ? (
                  <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">ইনভয়েস ফি প্রদান সফল হয়েছে!</p>
                ) : (
                  <form onSubmit={handlePayFees} className="flex gap-1.5 w-full sm:w-auto">
                    <input 
                      type="number" 
                      value={paymentAmount} 
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="টাকার পরিমাণ..."
                      className="border rounded p-2 text-xs focus:outline-blue-600 bg-white text-slate-800 w-24"
                    />
                    <button type="submit" className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2 flex items-center gap-1 shrink-0 cursor-pointer">
                      <CreditCard className="h-3.5 w-3.5 text-amber-400" />
                      ফি পে করুন
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Dynamic Monthly Student Fee Management Dashboard */}
            {targetStudent && (
              <StudentFeeManagement student={targetStudent} />
            )}

            {/* Academic Event Calendar & Holidays Component */}
            <AcademicCalendar role={role} />

            {/* Digital Academic Library Component */}
            <DigitalLibrary role={role} />

            {/* Academic AI Assistant for Guardians */}
            {targetStudent && (
              <AcademicAiAssistant student={targetStudent} examMarks={examMarks} />
            )}

          </div>

          {/* Sidebar controls for Guardian */}
          <div className="space-y-6">
            {/* Homework Encouragement & Validation Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2">হোমওয়ার্ক প্রটোকল মনিটর</h3>
              <p className="text-[10px] text-slate-500 mb-4 leading-snug">
                আপনার সন্তানের হোমওয়ার্ক মনিটর করে শিক্ষকের জন্য কমেন্ট বা স্টেটাস আপডেট করুন।
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-slate-800 text-xs">বর্তমান স্টেটাস</h4>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                    targetStudent?.homeworkStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    targetStudent?.homeworkStatus === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {targetStudent?.homeworkStatus === 'Completed' ? 'সম্পন্ন (Completed)' :
                     targetStudent?.homeworkStatus === 'Pending' ? 'চলমান (Pending)' : 'সহযোগিতা চাই (Needs-Motivation)'}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">স্টেটাস পরিবর্তন করুন</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button 
                      onClick={() => updateStudentHomework(targetStudent.id, 'Completed')}
                      className="p-1 px-1.5 border rounded text-[9px] hover:bg-emerald-50 text-emerald-700 bg-white font-bold cursor-pointer"
                    >
                      সম্পন্ন
                    </button>
                    <button 
                      onClick={() => updateStudentHomework(targetStudent.id, 'Pending')}
                      className="p-1 px-1.5 border rounded text-[9px] hover:bg-amber-50 text-amber-700 bg-white font-bold cursor-pointer"
                    >
                      পেন্ডিং
                    </button>
                    <button 
                      onClick={() => updateStudentHomework(targetStudent.id, 'Needs-Motivation')}
                      className="p-1 px-1.5 border rounded text-[9px] hover:bg-rose-50 text-rose-700 bg-white font-bold cursor-pointer"
                    >
                      সহায়তা চাই
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* School Coordinator support */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-xs mb-2">জরুরী প্রক্টরিয়াল লিংক</h3>
              <p className="text-[10px] text-slate-500 mb-3 leading-snug">আপনার কোনো প্রশ্ন বা পরামর্শ থাকলে সরাসরি স্কুল কো-অর্ডিনেটরের হটলাইনে মেসেজ করুন।</p>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 py-1.5 text-[10px] font-bold text-blue-900 border border-blue-200 hover:bg-blue-100/60 cursor-pointer">
                কো-অর্ডিনেটর চ্যাট রুম
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. TEACHER PORTAL (শিক্ষক ড্যাশবোর্ড)
         ======================================================== */}
      {role === 'Teacher' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Class attendance roller */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="border-b pb-3 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">শিক্ষার্থী হাজিরা প্যানেল ও লাইভ রোল ট্র্যাকার</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">ট্যাপ করে সরাসরি ক্লাসরুমে শিক্ষার্থীর প্রবেশ বা ছুটি দিন। তাৎক্ষণিক অভিভাবক ফোনে বাংলা মেসেজ ট্রিগার হবে!</p>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">Class 5 - Session 2026</span>
              </div>

              <div className="space-y-2">
                {students.map((student, idx) => (
                  <div key={student.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{student.banglaName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">শ্রেণী: {student.className} • রোল: {student.roll} • মাউথ কমেন্ট: {student.guardianPhone}</p>
                    </div>
                    
                    <div className="flex gap-1.5 w-full sm:w-auto">
                      <button 
                        onClick={() => {
                          const res = simulateAttendanceScan(student.id, 'student', 'Check-In');
                          alert(res.message);
                        }}
                        className="rounded bg-blue-50 border border-blue-150 text-blue-900 text-[10px] font-extrabold px-3 py-1.5 hover:bg-blue-100 transition-all uppercase tracking-wide flex items-center gap-1 flex-1 sm:flex-none text-center justify-center cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        ইন-স্ক্যান (Entry)
                      </button>
                      <button 
                        onClick={() => {
                          const res = simulateAttendanceScan(student.id, 'student', 'Check-Out');
                          alert(res.message);
                        }}
                        className="rounded bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-extrabold px-3 py-1.5 hover:bg-rose-100 transition-all uppercase tracking-wide flex items-center gap-1 flex-1 sm:flex-none text-center justify-center cursor-pointer"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        আউট-স্ক্যান (Exit)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam result management sheet */}
            <MarksController />

          </div>

          {/* Notice announcement publisher */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-sm">নতুন নোটিশ বা এলার্ট প্রকাশ</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">প্রকাশিত নোটিশটি মূল ওয়েবসাইটের নোটিশবোর্ডে তাৎক্ষণিক যুক্ত হবে</p>
              </div>

              {pubSuccess ? (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
                  <p className="text-xs text-blue-900 font-bold">নোটিশ সফলভাবে প্রকাশিত!</p>
                </div>
              ) : (
                <form onSubmit={handlePostNotice} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">নোটিশ শিরোনাম (English)</label>
                    <input 
                      type="text" 
                      value={newNoticeTitle} 
                      onChange={(e) => setNewNoticeTitle(e.target.value)}
                      placeholder="e.g. National Holiday Announcement" 
                      required
                      className="w-full rounded border border-slate-200 p-2 text-xs text-slate-800 focus:outline-blue-650 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">নোটিশের বাংলা অনুবাদ</label>
                    <input 
                      type="text" 
                      value={newNoticeBangla} 
                      onChange={(e) => setNewNoticeBangla(e.target.value)}
                      placeholder="যেমন: ছুটির সাধারণ ঘোষণা" 
                      className="w-full rounded border border-slate-200 p-2 text-xs text-slate-800 focus:outline-blue-650 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">ক্যাটাগরি</label>
                    <select 
                      value={newNoticeCat} 
                      onChange={(e) => setNewNoticeCat(e.target.value as any)}
                      className="w-full rounded border border-slate-200 p-2 text-xs text-blue-900 focus:outline-blue-655 bg-white font-semibold"
                    >
                      <option value="General">General (সাধারণ)</option>
                      <option value="Exam">Exam (পরীক্ষা)</option>
                      <option value="Holiday">Holiday (ছুটি)</option>
                      <option value="Event">Event (ইভেন্ট)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">মূল বিবরণ / মূলবার্তা</label>
                    <textarea 
                      value={newNoticeContent} 
                      onChange={(e) => setNewNoticeContent(e.target.value)}
                      rows={3}
                      placeholder="বিস্তারিত বিবৃতিটি এখানে লিখুন..."
                      required
                      className="w-full rounded border border-slate-200 p-2 text-xs text-slate-800 focus:outline-blue-650 bg-white"
                    />
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-blue-900 hover:bg-blue-800 p-2 text-xs font-bold text-white uppercase tracking-wider transition-all cursor-pointer">
                    বিজ্ঞপ্তিটি পাবলিশ করুন
                  </button>
                </form>
              )}
            </div>

            {/* Quick stats for Teacher */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-xs mb-3">শ্রেণী শিক্ষক সাধারণ দায়িত্ব</h3>
              <ul className="text-[10px] text-slate-600 space-y-2 leading-relaxed">
                <li className="flex gap-2 items-start">
                  <Check className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                  <span>সকাল ০৯:১৫ এর পূর্বে শিক্ষার্থীর প্রবেশ স্ক্যান সম্পন্ন করুন।</span>
                </li>
                <li className="flex gap-2 items-start">
                  <Check className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                  <span>ছুটির সময় (দুপুর ০১:৩০) অবশ্যই আউট-স্ক্যান শেষ করুন।</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. PARTNER DASHBOARD (ম্যানেজমেন্ট পার্টনার প্যানেল)
         ======================================================== */}
      {role === 'Partner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: ERP Overview & Financial Health Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-4">বিদ্যালয়ের সার্বিক অর্থনৈতিক ও ভর্তি প্রবাহ</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-50 border rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">মোট শিক্ষার্থী ফিস</span>
                  <p className="text-lg font-black text-slate-800 mt-1">৳{students.reduce((sum, s) => sum + s.feesPaid, 0)}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">টার্গেট: ৮০% সংগৃহীত</p>
                </div>
                <div className="p-4 bg-slate-50 border rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">মোট ভর্তি আবেদন</span>
                  <p className="text-lg font-black text-slate-800 mt-1">{leads.length} জন</p>
                  <p className="text-[10px] text-blue-900 font-semibold mt-0.5">অনুমোদন হার: ৭০%</p>
                </div>
                <div className="p-4 bg-slate-50 border rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">সক্রিয় স্টেশনারি স্টক</span>
                  <p className="text-lg font-black text-slate-800 mt-1">{stationery.reduce((sum, item) => sum + item.stock, 0)} টি</p>
                  <p className="text-[10px] text-amber-700 font-semibold mt-0.5">আইটেম ভিন: ৫টি</p>
                </div>
                <div className="p-4 bg-slate-50 border rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">সক্রিয় উন্নয়ন প্রকল্প</span>
                  <p className="text-lg font-black text-slate-800 mt-1">{devProjects.filter(p => p.status === 'In-Progress').length} টি</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">বাজেট: ৪.৫ লাখ</p>
                </div>
              </div>

              {/* Progress of Fee Collection */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>অভিভাবক ফি আদায় অগ্রগতির হার (মোট লক্ষ্যের তুলনায়)</span>
                  <span>{Math.round((students.reduce((sum, s) => sum + s.feesPaid, 0) / Math.max(1, students.reduce((sum, s) => sum + s.totalFees, 0))) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className="bg-blue-900 h-3 rounded-full transition-all" 
                    style={{ width: `${(students.reduce((sum, s) => sum + s.feesPaid, 0) / Math.max(1, students.reduce((sum, s) => sum + s.totalFees, 0))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Approvals and Document Routing panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-2">একাডেমিক ওয়ার্কফ্লো অনুমোদন ট্র্যাকার (এপ্রুভাল রাউটার)</h3>
              <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                বিদ্যালয়ের ক্রিয়েটিভ শিক্ষক-মন্ডলী যখন কোনো প্রশ্নপত্র, নোটস বা সিলেবাস প্রণয়ন করেন, তখন পার্টনার বা প্রিন্সিপাল এই প্যানেল থেকে অনুমোদন দিলে সেটি চূড়ান্তভাবে সিস্টেমে যুক্ত হয়।
              </p>

              {academicDrafts.filter(d => d.status === 'Pending Approval').length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">বর্তমানে কোনো পেন্ডিং অনুমোদন আবেদন নেই।</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {academicDrafts.filter(d => d.status === 'Pending Approval').map((draft) => (
                    <div key={draft.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-start gap-2 border-b border-slate-200 pb-2">
                        <div>
                          <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">{draft.category}</span>
                          <h4 className="font-bold text-slate-800 text-xs mt-1.5">{draft.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">শ্রেণী: {draft.className} • প্রণেতা: {draft.creatorName}</p>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">PENDING VIEW</span>
                      </div>
                      
                      <div className="bg-white p-3 rounded border text-xs text-slate-700 font-serif max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {draft.content}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[9px] font-bold text-slate-650">দিকনির্দেশনা / রিভিও কমেন্ট (যদি পুনরায় সংশোধনে ফেরাতে চান)</label>
                        <input 
                          type="text" 
                          placeholder="কমেন্টস এখানে লিখুন..."
                          value={partnerComments[draft.id] || ''}
                          onChange={(e) => setPartnerComments(prev => ({ ...prev, [draft.id]: e.target.value }))}
                          className="w-full rounded border border-slate-200 p-2 text-xs bg-white text-slate-800 focus:outline-blue-600"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            updateDraftStatusAndComments(draft.id, 'Sent Back', 'Partner & Principal Office', partnerComments[draft.id] || 'অনুগ্রহ করে পর্যালোচনা করে সংশোধনটি সম্পন্ন করুন।');
                            alert('খসড়াটি সংশোধনের জন্য ফেরত পাঠানো হয়েছে।');
                          }}
                          className="rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-[10px] px-3.5 py-2 transition-all cursor-pointer"
                        >
                          সংশোধনে ফেরত পাঠান (Send Back)
                        </button>
                        <button 
                          onClick={() => {
                            updateDraftStatusAndComments(draft.id, 'Approved', 'Partner Board', partnerComments[draft.id] || 'চমৎকার হয়েছে! অনুমোদন দেওয়া হলো।');
                            alert('প্রশ্নোত্তর/সিলেবাসটি চূড়ান্ত অনুমোদন দেওয়া হয়েছে!');
                          }}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-4 py-2 transition-all cursor-pointer shadow-sm"
                        >
                          অনুমোদন দিন (Approve & Publish)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Transport Routes & Dev Projects progress */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-4">সকল বাস রুট ও লাইভ স্ট্যাটাস</h3>
              <div className="space-y-3">
                {routes.map((route) => (
                  <div key={route.id} className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">{route.routeName}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">ড্রাইভার: {route.driverName} ({route.vehicleNo})</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${route.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {route.status === 'Active' ? 'সচল' : 'মেনটেইন্যান্স'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl text-slate-200 border border-slate-950">
              <h3 className="font-bold text-amber-400 text-xs mb-3">বিদ্যালয় প্রোটোকল সিদ্ধান্ত</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                ম্যানেজমেন্ট বোর্ড মিটিংয়ের সিদ্ধান্ত অনুযায়ী ১ জুনের মধ্যে ভর্তি কার্যক্রম শতভাগ ক্লোজ করার প্রস্তাব গৃহিত হয়েছে। প্রতিটি বাসের রুট মনিটরে রাখতে হবে এবং স্টেশনারি ইনভেনটরি রুল অনুযায়ী সচল রাখুন।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. SCANNER PORTAL (ক্লাসরুম QR দরজা পাঞ্চ সিমুলেটর)
         ======================================================== */}
      {role === 'Scanner' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="border-b pb-3 mb-6">
            <h3 className="font-bold text-slate-800 text-sm">ডোরওয়ে আরএফআইডি ও কিউআর স্ক্যান রিফিকেশন টার্মিনাল</h3>
            <p className="text-[10px] text-slate-500 mt-1">শিক্ষার্থী ও স্টাফ দরজা পাঞ্চ সম্পন্ন করতে এটি সিমুলেট করুন। পাঞ্চ হলে সাথে সাথে বাংলা এসএমএস অ্যালার্ট সার্ভিস ফোনে প্রেরণ করা হবে।</p>
          </div>

          <form onSubmit={handleQRScanSimulation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">রোল / টার্গেট প্রকার</label>
                <select 
                  value={scannerSelectedType} 
                  onChange={(e) => {
                    const type = e.target.value as 'student' | 'employee';
                    setScannerSelectedType(type);
                    if (type === 'student') {
                      setScannerSelectedEntity(students[0]?.id || '');
                    } else {
                      setScannerSelectedEntity(employees[0]?.id || '');
                    }
                  }}
                  className="w-full rounded border border-slate-200 p-2 text-xs text-blue-900 bg-white font-semibold focus:outline-blue-600"
                >
                  <option value="student">শিক্ষার্থী আইডি (Student ID Card)</option>
                  <option value="employee">শিক্ষক / স্টাফ মেম্বার (Employee Card)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">পাঞ্চ টাইপ</label>
                <select 
                  value={scannerSelectedPunch} 
                  onChange={(e) => setScannerSelectedPunch(e.target.value as any)}
                  className="w-full rounded border border-slate-200 p-2 text-xs text-blue-900 bg-white font-semibold focus:outline-blue-600"
                >
                  <option value="Check-In">প্রবেশ (Entry Check-In)</option>
                  <option value="Check-Out">ছুটি (Exit Check-Out)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">পাঞ্চ করার মতো ব্যক্তি নির্বাচন করুন</label>
              <select 
                value={scannerSelectedEntity} 
                onChange={(e) => setScannerSelectedEntity(e.target.value)}
                className="w-full rounded border border-slate-200 p-2 text-xs text-slate-800 bg-white focus:outline-blue-600 font-medium"
              >
                {scannerSelectedType === 'student' ? (
                  students.map(s => (
                    <option key={s.id} value={s.id}>{s.banglaName} (শ্রেণী: {s.className} | রোল: {s.roll})</option>
                  ))
                ) : (
                  employees.map(e => (
                    <option key={e.id} value={e.id}>{e.banglaName} ({e.designation})</option>
                  ))
                )}
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full rounded-lg bg-blue-900 hover:bg-blue-800 p-4 text-xs font-bold text-white uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Users className="h-5 w-5 text-amber-500 animate-pulse" />
              ডিজিটাল কিউআর কোড স্ক্যান সম্পন্ন করুন
            </button>
          </form>

          {scannerLogStatus && (
            <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm font-mono text-xs">
              <span className="text-[10px] font-bold bg-blue-900 text-white px-1.5 py-0.5 rounded mb-1.5 block w-max">HARDWARE LIVE FEED LOG</span>
              <p className="text-slate-800 leading-relaxed font-semibold whitespace-pre-wrap">{scannerLogStatus}</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          7. ACCOUNTANT PORTAL (হিসাব মহা-রক্ষক গেটওয়ে)
         ======================================================== */}
      {role === 'Accountant' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Finance Overview KPIs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-emerald-800 block uppercase font-mono">সর্বমোট জমা (Credit Ledger)</span>
                <p className="text-2xl font-black text-emerald-700 mt-2">৳{ledgerLogs.reduce((sum, tx) => sum + (tx.type === 'Credit' ? tx.amount : 0), 0) + students.reduce((sum, s) => sum + s.feesPaid, 0)}</p>
                <span className="text-[9.5px] text-slate-500 mt-1">শিক্ষার্থী ফি + কাস্টম ক্রেডিট</span>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-rose-800 block uppercase font-mono">সর্বমোট ব্যয় (Debit Ledger)</span>
                <p className="text-2xl font-black text-rose-700 mt-2">৳{ledgerLogs.reduce((sum, tx) => sum + (tx.type === 'Debit' ? tx.amount : 0), 0)}</p>
                <span className="text-[9.5px] text-slate-500 mt-1 font-semibold">স্টাফ অন-হ্যান্ড পে-রোল + ব্যয়</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-150 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-blue-900 block uppercase font-mono">অবশিষ্ট নেট ব্যালেন্স (Cash Balance)</span>
                <p className="text-2xl font-black text-blue-900 mt-2">৳{(ledgerLogs.reduce((sum, tx) => sum + (tx.type === 'Credit' ? tx.amount : 0), 0) + students.reduce((sum, s) => sum + s.feesPaid, 0)) - ledgerLogs.reduce((sum, tx) => sum + (tx.type === 'Debit' ? tx.amount : 0), 0)}</p>
                <span className="text-[9.5px] text-slate-500 mt-1 font-semibold">কার্যকরী ক্যাশ তহবিল</span>
              </div>
            </div>

            {/* Financial Ledger Log timeline */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-sm">হাজিরা ও ফাইনান্সিয়াল ট্রানজেকশন খতিয়ান তালিকা</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">অডিট লগইন রিলেটেড তথ্যসমূহ (পড়তে পারবেন: প্রিন্সিপাল, এসিস্ট্যান্ট ও পার্টনার্স)</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600 border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                      <th className="p-3">বিবরণ / খাত</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3 text-center">প্রকার</th>
                      <th className="p-3 text-right">টাকা পরিমাণ</th>
                      <th className="p-3 text-right">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerLogs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-800">{tx.desc}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{tx.category}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.type === 'Credit' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                            {tx.type === 'Credit' ? 'Credit' : 'Debit'}
                          </span>
                        </td>
                        <td className={`p-3 text-right font-bold ${tx.type === 'Credit' ? 'text-emerald-700' : 'text-rose-700'}`}>৳{tx.amount}</td>
                        <td className="p-3 text-right text-slate-400 font-mono text-[10px]">{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form and ledger composition handler */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4">ঐতিহাসিক ভাউচার খতিয়ান পোস্টিং</h3>

              {txnSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-center rounded-xl mb-4">
                  <p className="text-xs text-emerald-800 font-bold">ভাউচার খতিয়ানে এন্ট্রি সফল হয়েছে!</p>
                </div>
              ) : null}

              <form onSubmit={handleAddLedgerTransaction} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">ট্রানজেকশন বিবরণ (বাংলা/English)</label>
                  <input 
                    type="text" 
                    value={txnDesc}
                    onChange={(e) => setTxnDesc(e.target.value)}
                    required
                    placeholder="যেমন- নতুন চেয়ার বা কারেন্ট বিল বা অনুদান"
                    className="w-full rounded border border-slate-200 p-2 text-xs bg-white text-slate-800 focus:outline-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">টাকার পরিমাণ (৳)</label>
                  <input 
                    type="number" 
                    value={txnAmt}
                    onChange={(e) => setTxnAmt(e.target.value)}
                    required
                    placeholder="৳ টাকার পরিমাণ..."
                    className="w-full rounded border border-slate-200 p-2 text-xs bg-white text-slate-800 focus:outline-blue-600 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">লেনদেন প্রকার</label>
                    <select 
                      value={txnType} 
                      onChange={(e) => setTxnType(e.target.value as any)}
                      className="w-full rounded border border-slate-200 p-2 text-xs bg-white text-slate-800 focus:outline-blue-600"
                    >
                      <option value="Debit">Debit (মাসিক ব্যয়)</option>
                      <option value="Credit">Credit (আয়/ফি প্রাপ্তি)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">শ্রেণী খাত</label>
                    <select 
                      value={txnCategory} 
                      onChange={(e) => setTxnCategory(e.target.value)}
                      className="w-full rounded border border-slate-200 p-2 text-xs bg-white text-slate-850 focus:outline-blue-600"
                    >
                      <option value="Utilities">Utilities (বিদ্যুৎ/পানি বিল)</option>
                      <option value="Inventory">Inventory (স্টেশনারি ক্রয়)</option>
                      <option value="Tuition Fees">Tuition Fees (টিউশন আদায়)</option>
                      <option value="Salaries">Salaries (স্টাফ বোনাস/পে)</option>
                      <option value="Capital Expenses">Capital Expenses (মূলধনী সামগ্রী)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full rounded-lg bg-blue-900 hover:bg-blue-800 p-2.5 text-xs font-bold text-white uppercase tracking-wider transition-all cursor-pointer">
                  লেনদেন লিপিবদ্ধ করুন
                </button>
              </form>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
              <h4 className="font-bold text-slate-800">অডিটিং সিকিউরিটি প্রোটোকল</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                এই প্যানেলে সংরক্ষিত এন্ট্রিগুলো সরাসরি সিস্টেম কোড দ্বারা লকডাউন করা থাকে। এগুলো ডিলিট বা মুছে ফেলা প্রক্টরিয়াল আইন অনুযায়ী অপরাধ এবং প্রিন্সিপাল বরাবর সাইলেন্ট নোটিফিকেশন পাঠায়।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          8. CREATOR PORTAL (প্রশ্নোত্তর, সিলেটাস ও ক্রিয়েটিভ ল্যাব)
         ======================================================== */}
      {role === 'Creator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creative Compose Workbench Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-sm">
                  {editingDraftId ? 'পুনর্বিবেচনা সম্পাদন ও খসড়া রি-কম্পোজিশন' : 'একাডেমিক প্রশ্নপত্র, সিলেবাস ও ডকস রচনা ল্যাব'}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  {editingDraftId ? 'দিকনির্দেশনা অনুযায়ী সংশোধিত ডাটা দিয়ে পুনরায় পাঠিয়ে সাবমিট দিন।' : 'বিষয়ভিত্তিক পরীক্ষা পত্র তৈরি কিংবা টার্ম সিলেবাস রচনার খসড়া প্রণয়ন হাব।'}
                </p>
              </div>

              {draftSuccess && (
                <div className="p-4 bg-blue-50 border border-blue-200 text-center rounded-xl mb-4 text-xs text-blue-950 font-bold">
                  ডকুমেন্টটি সফলভাবে প্রণয়ন করে বোর্ডের অনুমোদনের জন্য প্রেরণ করা হয়েছে!
                </div>
              )}

              <form onSubmit={handleCreateOrEditDraft} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 font-mono">DOCUMENT WORK TITLE</label>
                    <input 
                      type="text" 
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      required
                      placeholder="e.g. Class 10 Chemistry 2nd Term MCQ Test"
                      className="w-full rounded border border-slate-200 p-2 text-xs bg-white text-slate-850 font-medium focus:outline-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 font-mono">TARGET CLASS</label>
                    <input 
                      type="text" 
                      value={draftClass}
                      onChange={(e) => setDraftClass(e.target.value)}
                      required
                      placeholder="e.g. Class 10"
                      className="w-full rounded border border-slate-200 p-2 text-xs bg-white text-slate-800 focus:outline-blue-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 block">ক্যাটাগরি</label>
                  <select 
                    value={draftCat} 
                    onChange={(e) => setDraftCat(e.target.value as any)}
                    className="w-full rounded border border-slate-200 p-2 text-xs bg-white text-blue-900 font-bold focus:outline-blue-600"
                  >
                    <option value="Question Paper">Question Paper (পরীক্ষার প্রশ্নপত্র)</option>
                    <option value="Lecture Note">Lecture Note (লেকচার ও রিভিশন নোটস)</option>
                    <option value="Syllabus">Syllabus (টার্ম কোর্স সিলেবাস)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">ডকুমেন্ট কনটেন্ট বডি (ডিটেইলস কন্টেন্ট লিখুন)</label>
                  <textarea 
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    required
                    rows={6}
                    placeholder="সৃজনশীল বা প্রশ্নের বর্ণনা বা অধ্যায়ের তালিকা..."
                    className="w-full rounded border border-slate-200 p-3 text-xs bg-white text-slate-800 focus:outline-blue-600 leading-relaxed font-serif"
                  />
                </div>

                <div className="flex gap-2">
                  {editingDraftId && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingDraftId(null);
                        setDraftTitle('');
                        setDraftContent('');
                      }}
                      className="rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs p-2.5 cursor-pointer"
                    >
                      বাতিল করুন
                    </button>
                  )}
                  <button type="submit" className="flex-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs p-2.5 uppercase tracking-wide cursor-pointer transition-all">
                    {editingDraftId ? 'সংশোধন সেভ করে পুনরায় এপ্রুভালে পাঠান' : 'তৈরি করে পার্টনার/প্রিন্সিপাল বোর্ডে পাঠান'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Dynamic History and Locked evaluations status */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4">আপনার রচনা খসড়াসমূহ এবং লাইভ ট্র্যাকিং</h3>
              
              <div className="space-y-4">
                {academicDrafts.map((draft) => (
                  <div key={draft.id} className="p-3.5 border rounded-xl bg-slate-50/50 space-y-2 text-xs relative">
                    <div className="flex justify-between items-center border-b pb-1.5 mb-1.5">
                      <span className="text-[9px] font-extrabold bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded uppercase">{draft.category}</span>
                      <span className={`text-[10px] font-bold ${
                        draft.status === 'Approved' ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100' :
                        draft.status === 'Sent Back' ? 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 animate-pulse' :
                        'text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100'
                      }`}>
                        {draft.status === 'Approved' ? 'চূড়ান্ত অনুমোদিত' :
                         draft.status === 'Sent Back' ? 'সংশোধন আবশ্যক' : 'অনুমোদন পেন্ডিং'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800">{draft.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">আইডি: {draft.id.toUpperCase()}</p>

                    {draft.status === 'Sent Back' && draft.comments && (
                      <div className="p-2.5 bg-rose-50 rounded border border-rose-100 font-semibold text-[10px] text-rose-800 leading-snug">
                        <strong>বোর্ড রিভিউ কমেন্ট:</strong> "{draft.comments}"
                      </div>
                    )}

                    {draft.status === 'Approved' && draft.approvedBy && (
                      <div className="p-2.5 bg-emerald-50 rounded border border-emerald-100 text-[10px] text-emerald-800 leading-snug">
                        <strong>অনুমোদন এক্সেস:</strong> {draft.approvedBy} দ্বারা চূড়ান্ত প্রকাশিত ও লকড।
                      </div>
                    )}

                    {/* Action buttons based on testing restrictions */}
                    <div className="pt-2 flex justify-end">
                      {draft.status === 'Sent Back' ? (
                        <button 
                          onClick={() => startEditDraft(draft.id)}
                          className="rounded-lg bg-blue-900 text-white font-bold text-[10px] px-3 py-1 cursor-pointer hover:bg-blue-800 transition-all"
                        >
                          সংশোধন ও পুনরায় কম্পোজ করুন
                        </button>
                      ) : (
                        <span className="text-[9.5px] font-mono text-slate-400">ব্যক্তিগত এডিটিং লকড রয়েছে</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          9. ASSISTANT PORTAL (অফিস সহকারী - ডাটা এন্ট্রি)
         ======================================================== */}
      {role === 'Assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* KPI Cards */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center font-bold">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">সর্বমোট শিক্ষার্থী</span>
                  <p className="text-xl font-black text-blue-950 mt-0.5">{students.length} জন</p>
                </div>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">সর্বমোট এমপ্লয়ী (স্টাফ)</span>
                  <p className="text-xl font-black text-emerald-950 mt-0.5">{employees.length} জন</p>
                </div>
              </div>
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-150 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500 text-blue-950 flex items-center justify-center font-bold">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">রিসিভড রিকুইজিশন</span>
                  <p className="text-xl font-black text-amber-950 mt-0.5">
                    {requisitions.filter(r => r.status.includes('Assistant') || r.status.includes('Paid')).length} টি
                  </p>
                </div>
              </div>
            </div>

            {/* Main Double Forms Container */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-8 animate-fade-in">
              
              <div className="border-b pb-4">
                <h3 className="font-bold text-slate-800 text-sm">ডিজিটাল ডাটা এন্ট্রি ডেক্স (শিক্ষার্থী ও এমপ্লয়ী)</h3>
                <p className="text-[10px] text-slate-500 mt-1">অফিস সহকারী হিসেবে এখান থেকে নতুন শিক্ষার্থী ভর্তি এবং শিক্ষক-কর্মচারীদের ডাটাবেজ আপডেট সম্পন্ন করুন।</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* A. STUDENT DATA ENTRY */}
                <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-4">
                  <div className="flex items-center gap-2 text-blue-900 border-b pb-2 mb-2">
                    <GraduationCap className="h-4.5 w-4.5 text-amber-500" />
                    <h4 className="font-bold text-xs">১। ভর্তি হওয়া নতুন শিক্ষার্থীর ডাটা এন্ট্রি</h4>
                  </div>

                  {astStSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-lg text-[11px] font-bold text-center animate-fade-in">
                      নতুন শিক্ষার্থীর তথ্য সফলভাবে ডাটাবেজে যুক্ত হয়েছে!
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!astStNameEng || !astStNameBng || !astStGuardian || !astStGPhone) return;
                      addStudent({
                        name: astStNameEng,
                        banglaName: astStNameBng,
                        className: astStClass,
                        roll: astStRoll || String(students.filter(s => s.className === astStClass).length + 1).padStart(2, '0'),
                        guardianName: astStGuardian,
                        guardianPhone: astStGPhone,
                        feesPaid: parseFloat(astStFeesPaid) || 0,
                        totalFees: parseFloat(astStTotalFees) || 15000,
                      });
                      setAstStNameEng('');
                      setAstStNameBng('');
                      setAstStRoll('');
                      setAstStGuardian('');
                      setAstStGPhone('');
                      setAstStFeesPaid('0');
                      setAstStSuccess(true);
                      setTimeout(() => setAstStSuccess(false), 3000);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-slate-650 block mb-1">শিক্ষার্থীর নাম (ইংরেজি)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="উদা: Afifa Sultana"
                        value={astStNameEng}
                        onChange={e => setAstStNameEng(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-650 block mb-1">শিক্ষার্থীর নাম (বাংলা)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="উদা: আফিফা সুলতানা"
                        value={astStNameBng}
                        onChange={e => setAstStNameBng(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-650 block mb-1">ক্লাস / শ্রেণী</label>
                        <select 
                          value={astStClass}
                          onChange={e => setAstStClass(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900"
                        >
                          {['Play', 'Nursery', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-650 block mb-1">রোল নম্বর (ঐচ্ছিক)</label>
                        <input 
                          type="text" 
                          placeholder="উদা: ০৩ (বা অটো-এসাইন)"
                          value={astStRoll}
                          onChange={e => setAstStRoll(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-650 block mb-1">অভিভাবকের নাম</label>
                        <input 
                          type="text" 
                          required
                          placeholder="উদা: জনাব আমিনুল হক"
                          value={astStGuardian}
                          onChange={e => setAstStGuardian(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-650 block mb-1">অভিভাবকের মোবাইল</label>
                        <input 
                          type="text" 
                          required
                          placeholder="উদা: 01700000000"
                          value={astStGPhone}
                          onChange={e => setAstStGPhone(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-650 block mb-1">সর্বমোট সেশন ফি (৳)</label>
                        <input 
                          type="number" 
                          required
                          placeholder="৳১৫০০০"
                          value={astStTotalFees}
                          onChange={e => setAstStTotalFees(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-650 block mb-1">পরিশোধিত ফি (৳)</label>
                        <input 
                          type="number" 
                          placeholder="৳৫০০০ বা ০"
                          value={astStFeesPaid}
                          onChange={e => setAstStFeesPaid(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900 font-mono"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs p-2.5 rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                      ভর্তি ডাটা কনফার্ম করুন
                    </button>
                  </form>
                </div>

                {/* B. EMPLOYEE DATA ENTRY */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-850 border-b pb-2 mb-2">
                    <UserCheck className="h-4.5 w-4.5 text-emerald-600" />
                    <h4 className="font-bold text-xs font-sans text-emerald-900">২। শিক্ষক, ড্রাইভার ও নিরাপত্তাকর্মী নিয়োগ ডেটা এন্ট্রি</h4>
                  </div>

                  {astEmpSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-lg text-[11px] font-bold text-center animate-fade-in">
                      এমপ্লয়ীর নিয়োগ ডেটা স্কুল ডাটাবেজে সফলভাবে যুক্ত হয়েছে!
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!astEmpNameEng || !astEmpNameBng || !astEmpPhone || !astEmpSalary) return;
                      addEmployee({
                        name: astEmpNameEng,
                        banglaName: astEmpNameBng,
                        role: astEmpRole,
                        salary: parseFloat(astEmpSalary) || 18000,
                        phone: astEmpPhone
                      });
                      setAstEmpNameEng('');
                      setAstEmpNameBng('');
                      setAstEmpPhone('');
                      setAstEmpSalary('18000');
                      setAstEmpSuccess(true);
                      setTimeout(() => setAstEmpSuccess(false), 3000);
                    }}
                    className="space-y-2.5"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-slate-650 block mb-1">হায়ারকৃত এমপ্লয়ীর নাম (ইংরেজি)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="উদা: Aminul Islam"
                        value={astEmpNameEng}
                        onChange={e => setAstEmpNameEng(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-650 block mb-1">এমপ্লয়ীর নাম (বাংলা)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="উদা: আমিনুল ইসলাম (সিকিউরিটি গার্ড / চালক / শিক্ষক)"
                        value={astEmpNameBng}
                        onChange={e => setAstEmpNameBng(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-650 block mb-1">মোবাইল ফোন নম্বর</label>
                      <input 
                        type="text" 
                        required
                        placeholder="উদা: 01800000000"
                        value={astEmpPhone}
                        onChange={e => setAstEmpPhone(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-650 block mb-1">মূল পদের ক্যাটাগরি</label>
                        <select 
                          value={astEmpRole}
                          onChange={e => setAstEmpRole(e.target.value as any)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900"
                        >
                          <option value="Teacher">Teacher (শিক্ষক)</option>
                          <option value="Driver">Driver (ড্রাইভার)</option>
                          <option value="Staff">Staff (নিরাপত্তাকর্মী / গার্ড / স্টাফ)</option>
                          <option value="Coordinator">Coordinator (নিবন্ধক / কোঅর্ডিনেটর)</option>
                          <option value="Management">Management (ম্যানেজমেন্ট কর্মকর্তা)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-650 block mb-1">মাসিক মূল বেতন (টাকা)</label>
                        <input 
                          type="number" 
                          required
                          placeholder="উদা: ১৮০০০"
                          value={astEmpSalary}
                          onChange={e => setAstEmpSalary(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-blue-900 font-mono"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-2.5 rounded-lg transition-all cursor-pointer shadow-sm mt-3"
                    >
                      নিয়োগ ডাটাবেজে যুক্ত করুন
                    </button>
                  </form>
                </div>

              </div>
            </div>

            {/* LIVE REGISTER VIEW TABLE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">হালনাগাদ লাইভ রেজিস্টার ও এন্ট্রি তালিকা</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">অফিস ম্যানেজমেন্টে চলমান সকল শিক্ষক, চালক, প্রহরী এবং শিক্ষার্থীদের ডাটাবেজ ভিউ</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Recents Students */}
                <div className="border border-slate-100 p-4 rounded-xl">
                  <h4 className="font-bold text-blue-905 text-xs border-b pb-2 mb-3 flex justify-between">
                    <span>১। কৃতি ও সদ্য ভর্তি সম্পন্ন ছাত্র-ছাত্রী</span>
                    <span className="text-[10.5px] text-blue-900 font-mono">মোট: {students.length} জন</span>
                  </h4>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {students.slice().reverse().map((st) => (
                      <div key={st.id} className="p-2.5 rounded bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{st.banglaName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{st.className} • রোল: {st.roll}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-mono">{st.guardianPhone}</p>
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.25 rounded border border-blue-50">৳{st.feesPaid} / ৳{st.totalFees}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Recents Employees */}
                <div className="border border-slate-100 p-4 rounded-xl">
                  <h4 className="font-bold text-emerald-805 text-xs border-b pb-2 mb-3 flex justify-between">
                    <span>২। কর্মরত শিক্ষক, চালক ও নিরাপত্তাকর্মী দল</span>
                    <span className="text-[10.5px] text-emerald-900 font-mono">মোট: {employees.length} জন</span>
                  </h4>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {employees.slice().reverse().map((emp) => (
                      <div key={emp.id} className="p-2.5 rounded bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-808">{emp.banglaName}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded border ${
                            emp.role === 'Teacher' ? 'bg-blue-50 text-blue-900 border-blue-105' :
                            emp.role === 'Driver' ? 'bg-amber-50 text-amber-900 border-amber-105' :
                            emp.role === 'Staff' ? 'bg-rose-50 text-rose-900 border-rose-105' : 'bg-slate-50 text-slate-800 border-slate-105'
                          }`}>
                            {emp.role === 'Teacher' ? 'শিক্ষক (Teacher)' :
                             emp.role === 'Driver' ? 'ড্রাইভার (Driver)' :
                             emp.role === 'Staff' ? 'স্টাফ/প্রহরী (Staff)' : emp.role}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-505 font-mono">{emp.phone}</p>
                          <p className="font-bold text-slate-700 text-[11px] font-mono">বেতন: ৳{emp.salary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Right Column: Pending Requisition Portal Router */}
          <div className="space-y-6">
            <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 text-blue-900 border-b pb-3 mb-4 font-sans">
                <Receipt className="h-5 w-5 text-amber-500" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                  পেমেন্ট প্রাপ্ত সেশন ভর্তির রিকুইজিশন
                </h3>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                যে সকল অভিভাবক অনলাইনে সফলভাবে সেশন ফি বা ভর্তি ফি পেমেন্ট সম্পন্ন করেছেন, অফিস সহকারী হিসেবে তাদের প্রদত্ত ফি ও রশিদ মিলিয়ে দেখে প্রথম ধাপের চূড়ান্ত অনুমোদন সম্পন্ন করুন।
              </p>

              {requisitions.filter(r => r.status === 'Paid (Pending Assistant Approval)').length === 0 ? (
                <div className="text-center p-8 bg-white/70 rounded-xl border border-dashed border-amber-200">
                  <p className="text-[11px] text-slate-500 font-bold">কোন পেন্ডিং ভেরিফিকেশন পেমেন্ট নেই।</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requisitions.filter(r => r.status === 'Paid (Pending Assistant Approval)').map((req) => (
                    <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-150 space-y-3 relative shadow-sm hover:shadow transition-all text-slate-700">
                      <div className="flex justify-between items-center border-b pb-2">
                        <div>
                          <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded ${
                            req.type === 'Admission' ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                          }`}>
                            {req.type === 'Admission' ? 'অনলাইন ভর্তি' : 'নিয়োগ আবেদন'}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono font-bold">ID: #{req.id}</span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-slate-800">আবেদনকারী: {req.applicantName}</p>
                        <p className="text-[11px] text-slate-500">ফোন: <span className="font-mono">{req.phone}</span></p>
                        <p className="text-[11px] text-slate-500 font-bold text-blue-900">শ্রেণী/পোস্ট: {req.classNameOrPost}</p>
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded leading-snug">"{req.details}"</p>
                      </div>

                      <div className="bg-amber-50 p-2.5 rounded border border-amber-200 space-y-1 text-xs">
                        <p className="font-bold text-amber-950 flex justify-between items-center">
                          <span>প্রদত্ত সেশন পেমেন্ট:</span>
                          <span className="font-mono text-xs font-black text-amber-900">৳{req.paymentAmount}</span>
                        </p>
                        <p className="text-[9.5px] text-slate-500 font-medium">রশিদ নং: <span className="font-mono font-bold">{req.moneyReceiptNo}</span></p>
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            rejectRequisition(req.id, 'কাগজপত্রে ত্রুটি অথবা ট্রানজেকশনে গরমিল পাওয়া গিয়েছে। অফিস সহকারী প্রত্যাখ্যান করেছেন।');
                            alert('পেমেন্ট রিকুইজিশন বাতিল করা হয়েছে।');
                          }}
                          className="flex-1 rounded border border-slate-300 hover:bg-slate-50 hover:text-rose-700 text-slate-600 text-[10px] font-bold py-1.5 transition-all cursor-pointer"
                        >
                          খারিজ করুন
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            approveRequisitionByAssistant(req.id);
                            alert('অনুমোদন প্রদান সফল হয়েছে! এখন এটি প্রিন্সিপাল প্যানেলে চূড়ান্ত অনুমোদনের জন্য অপেক্ষমান।');
                          }}
                          className="flex-1 bg-blue-900 hover:bg-blue-800 text-amber-400 text-[10px] font-bold py-1.5 rounded transition-all cursor-pointer shadow-sm text-center"
                        >
                          অনুমোদন দিন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Helper guidelines card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3 shadow-inner animate-fade-in">
              <h4 className="font-black text-slate-905 border-b pb-1.5 flex items-center gap-1.5 text-xs">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-900"></span>
                সহকারী ডাটা গাইডলাইন
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px] leading-relaxed">
                <li>নতুন শিক্ষার্থী এন্ট্রি দেওয়ার সাথে সাথে তার হাজিরা % অটোমেটিক ১০০% সেট করা হবে।</li>
                <li>নিয়োগপ্রাপ্ত সকল কর্মকর্তার বেতন ক্যাটেগরি ফাইন্যান্স লেজারের বাজেট ভিউতে সংযুক্ত হয়।</li>
                <li>নিরাপত্তাকর্মী বা প্রহরীর নতুন নিয়োগ এন্ট্রি "Staff" সিলেক্ট করে ডাটাবেজ করতে হবে।</li>
                <li>অনুমোদিত রিকুইজিশনগুলো সরাসরি প্রিন্সিপাল অনুমোদনের পর চূড়ান্ত শিক্ষক/শিক্ষার্থী মেম্বার হিসেবে প্রমোট হয়ে যায়।</li>
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
