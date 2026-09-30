/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student } from '../types';
import { 
  Gift, 
  Cake, 
  Sparkles, 
  Clock, 
  Calendar, 
  Bell, 
  Send, 
  CheckCircle2, 
  User, 
  Phone, 
  Award, 
  Volume2, 
  VolumeX, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  PartyPopper,
  Check,
  X,
  ChevronRight,
  Heart
} from 'lucide-react';

interface BirthdayItem {
  id: string;
  type: 'student' | 'father' | 'mother';
  targetName: string;
  student: Student;
  className: string;
  roll: string;
  dobString: string;
  birthDate: Date;
  nextBirthday: Date;
  isToday: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  turningAge: number;
  isWithin10Days: boolean;
  relationshipLabel?: string;
}

// Convert numbers to Bengali digits
export const toBanglaDigits = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
};

// Bengali month names
const bnMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const BirthdayReminderCountdown: React.FC<{
  onEditStudentDob?: (student: Student) => void;
  compactBanner?: boolean;
}> = ({ onEditStudentDob, compactBanner = false }) => {
  const { students, updateStudent, schoolName, schoolSlogan, schoolLogoVal } = useSchool();
  const [now, setNow] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'10days' | 'today' | 'all' | 'parents'>('10days');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  
  // Modals state
  const [selectedBirthdayCard, setSelectedBirthdayCard] = useState<BirthdayItem | null>(null);
  const [selectedSmsTarget, setSelectedSmsTarget] = useState<BirthdayItem | null>(null);
  const [smsText, setSmsText] = useState('');
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);
  const [isPlayingTune, setIsPlayingTune] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Update current time every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate birthday details for a given DOB
  const calculateBirthdayDetails = (
    dobStr: string, 
    student: Student, 
    type: 'student' | 'father' | 'mother',
    targetName: string,
    relationshipLabel?: string
  ): BirthdayItem | null => {
    if (!dobStr || typeof dobStr !== 'string') return null;

    // Support YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY
    let year = 0;
    let month = 0; // 0-indexed
    let day = 0;

    const trimmed = dobStr.trim();
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else if (parts[2].length === 4) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    } else if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else if (parts[2].length === 4) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    }

    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 0 || month > 11 || day < 1 || day > 31) {
      return null;
    }

    const birthDate = new Date(year, month, day);
    const currentYear = now.getFullYear();

    // Check if birthday is today
    const isToday = now.getMonth() === month && now.getDate() === day;

    let targetDate = new Date(currentYear, month, day, 0, 0, 0, 0);

    // If birthday date has passed earlier this year and is not today, next birthday is next year
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    if (!isToday && targetDate < startOfToday) {
      targetDate = new Date(currentYear + 1, month, day, 0, 0, 0, 0);
    }

    let diffMs = 0;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (isToday) {
      // If today, count down to end of today (23:59:59)
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      diffMs = Math.max(0, endOfToday.getTime() - now.getTime());
      days = 0;
      hours = Math.floor(diffMs / (1000 * 60 * 60));
      minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    } else {
      diffMs = Math.max(0, targetDate.getTime() - now.getTime());
      days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    }

    const turningAge = targetDate.getFullYear() - year;
    const isWithin10Days = isToday || (days >= 0 && days <= 10);

    return {
      id: `${type}_${student.id}`,
      type,
      targetName,
      student,
      className: student.className || 'শ্রেণী উল্লেখ নেই',
      roll: student.roll || '০১',
      dobString: dobStr,
      birthDate,
      nextBirthday: targetDate,
      isToday,
      daysRemaining: days,
      hoursRemaining: hours,
      minutesRemaining: minutes,
      secondsRemaining: seconds,
      turningAge: turningAge > 0 ? turningAge : 0,
      isWithin10Days,
      relationshipLabel
    };
  };

  // Compile all birthday items
  const allBirthdayItems = useMemo(() => {
    const list: BirthdayItem[] = [];

    students.forEach(st => {
      // Student's own DOB
      if (st.dob) {
        const item = calculateBirthdayDetails(
          st.dob, 
          st, 
          'student', 
          st.banglaName || st.name || 'শিক্ষার্থী'
        );
        if (item) list.push(item);
      }

      // Father's DOB
      if (st.fatherDob) {
        const item = calculateBirthdayDetails(
          st.fatherDob, 
          st, 
          'father', 
          st.fatherNameBn || st.fatherNameEn || 'পিতা',
          'পিতা'
        );
        if (item) list.push(item);
      }

      // Mother's DOB
      if (st.motherDob) {
        const item = calculateBirthdayDetails(
          st.motherDob, 
          st, 
          'mother', 
          st.motherNameBn || st.motherNameEn || 'মাতা',
          'মাতা'
        );
        if (item) list.push(item);
      }
    });

    // Sort by: isToday first, then by daysRemaining ascending, then hoursRemaining, minutesRemaining
    return list.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      if (a.daysRemaining !== b.daysRemaining) return a.daysRemaining - b.daysRemaining;
      if (a.hoursRemaining !== b.hoursRemaining) return a.hoursRemaining - b.hoursRemaining;
      return a.minutesRemaining - b.minutesRemaining;
    });
  }, [students, now]);

  // Specific student-only lists
  const studentItems = useMemo(() => {
    return allBirthdayItems.filter(item => item.type === 'student');
  }, [allBirthdayItems]);

  const active10DaysStudentItems = useMemo(() => {
    return studentItems.filter(item => item.isWithin10Days);
  }, [studentItems]);

  const todayStudentItems = useMemo(() => {
    return studentItems.filter(item => item.isToday);
  }, [studentItems]);

  const parentItems = useMemo(() => {
    return allBirthdayItems.filter(item => item.type === 'father' || item.type === 'mother');
  }, [allBirthdayItems]);

  // Selected list based on active tab
  const displayedItems = useMemo(() => {
    let source: BirthdayItem[] = [];
    if (activeTab === '10days') {
      source = active10DaysStudentItems;
    } else if (activeTab === 'today') {
      source = todayStudentItems;
    } else if (activeTab === 'parents') {
      source = parentItems;
    } else {
      source = studentItems;
    }

    return source.filter(item => {
      const matchSearch = 
        item.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.roll.includes(searchQuery);
      const matchClass = filterClass === 'All' || item.className === filterClass;
      return matchSearch && matchClass;
    });
  }, [activeTab, active10DaysStudentItems, todayStudentItems, parentItems, studentItems, searchQuery, filterClass]);

  // Classes list for filter
  const classesList = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set);
  }, [students]);

  // Seed sample birthdays so user can test live countdown immediately
  const handleSeedSampleBirthdays = () => {
    if (students.length === 0) {
      alert('ডাটাবেজে কোনো শিক্ষার্থী নেই। অনুগ্রহ করে প্রথমে ডেমো শিক্ষার্থী রিস্টোর করুন বা শিক্ষার্থী এন্ট্রি করুন।');
      return;
    }

    // Helper to format YYYY-MM-DD
    const makeDob = (daysOffset: number, birthYear = 2015) => {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${birthYear}-${month}-${day}`;
    };

    // Update first 3 students with sample birthdays: Today, 3 days later, 7 days later
    if (students[0]) {
      updateStudent(students[0].id, {
        dob: makeDob(3, 2015), // In 3 days!
        fatherDob: '1982-05-14',
        fatherBirthRegNo: '19822692518100123',
        motherDob: makeDob(6, 1986), // Mother in 6 days!
        motherBirthRegNo: '19862692518100456'
      });
    }

    if (students[1]) {
      updateStudent(students[1].id, {
        dob: makeDob(7, 2014), // In 7 days!
        fatherDob: '1980-11-20',
        fatherBirthRegNo: '19802692518100789',
        motherDob: '1984-03-12',
        motherBirthRegNo: '19842692518100999'
      });
    }

    if (students[2]) {
      updateStudent(students[2].id, {
        dob: makeDob(0, 2016), // Today!
        fatherDob: makeDob(1, 1978), // Father tomorrow!
        fatherBirthRegNo: '19782692518100555',
        motherDob: '1983-02-18',
        motherBirthRegNo: '19832692518100777'
      });
    }

    if (students[3]) {
      updateStudent(students[3].id, {
        dob: makeDob(15, 2017), // In 15 days (> 10 days)
        fatherDob: '1985-04-05',
        fatherBirthRegNo: '19852692518100111',
        motherDob: '1988-12-01',
        motherBirthRegNo: '19882692518100222'
      });
    }
  };

  // Play celebratory melody using Web Audio API
  const playBirthdayTune = () => {
    try {
      if (isPlayingTune) return;
      setIsPlayingTune(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Happy Birthday notes (frequency, duration)
      // C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, B4=493.88, C5=523.25
      const notes = [
        { f: 261.63, d: 0.3 }, // Hap-
        { f: 261.63, d: 0.3 }, // py
        { f: 293.66, d: 0.6 }, // Birth-
        { f: 261.63, d: 0.6 }, // day
        { f: 349.23, d: 0.6 }, // to
        { f: 329.63, d: 1.0 }, // you
        { f: 261.63, d: 0.3 }, // Hap-
        { f: 261.63, d: 0.3 }, // py
        { f: 293.66, d: 0.6 }, // Birth-
        { f: 261.63, d: 0.6 }, // day
        { f: 392.00, d: 0.6 }, // to
        { f: 349.23, d: 1.0 }, // you!
      ];

      let time = ctx.currentTime + 0.1;
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, time);

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + n.d - 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + n.d);
        time += n.d;
      });

      setTimeout(() => {
        setIsPlayingTune(false);
      }, (time - ctx.currentTime) * 1000);
    } catch (e) {
      console.warn('Audio playback error', e);
      setIsPlayingTune(false);
    }
  };

  // Open SMS modal with prefilled message
  const handleOpenSmsModal = (item: BirthdayItem) => {
    setSelectedSmsTarget(item);
    const targetName = item.targetName;
    const studentTitle = `${item.className} ক্লাসের রোল নং ${item.roll} এ নাম ${item.student.banglaName || item.student.name}`;
    
    if (item.type === 'student') {
      setSmsText(
        `শ্রদ্ধেয় অভিভাবক, আসসালামু আলাইকুম। ${schoolName}-এর পক্ষ থেকে আপনার সন্তান ${targetName} (${studentTitle})-এর জন্মদিনে জানাই আন্তরিক উষ্ণ শুভেচ্ছা ও প্রাণঢালা অভিনন্দন! মহান আল্লাহ তার জীবনকে প্রজ্ঞা, সুস্বাস্থ্য ও সাফল্যে ভরিয়ে দিন। শুভ জন্মদিন! 🎂🎈`
      );
    } else {
      setSmsText(
        `শ্রদ্ধেয় ${item.relationshipLabel || 'অভিভাবক'} (${targetName}), আসসালামু আলাইকুম। ${schoolName}-এর পক্ষ থেকে আপনার শুভ জন্মদিনে জানাই আন্তরিক অভিনন্দন ও শুভকামনা। আপনার দীর্ঘায়ু ও সুস্থতা কামনা করি। 🎂🎈`
      );
    }
  };

  // Send SMS confirmation
  const handleSendSms = () => {
    if (!selectedSmsTarget) return;
    const phone = selectedSmsTarget.student.guardianPhone || selectedSmsTarget.student.fatherPhone || selectedSmsTarget.student.motherPhone || '০১৭xxxxxxxx';
    
    // Save to localStorage SMS log
    const savedLogs = localStorage.getItem('delicon_sms');
    const existing = savedLogs ? JSON.parse(savedLogs) : [];
    const newLog = {
      id: 'sms_' + Date.now(),
      recipient: phone,
      recipientName: selectedSmsTarget.targetName,
      message: smsText,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      status: 'Sent',
      type: 'Birthday Greetings'
    };
    localStorage.setItem('delicon_sms', JSON.stringify([newLog, ...existing]));

    setSmsSentNotice(`শুভেচ্ছা বার্তা সফলভাবে ${phone} নম্বরে প্রেরণ করা হয়েছে!`);
    setTimeout(() => {
      setSmsSentNotice(null);
      setSelectedSmsTarget(null);
    }, 2500);
  };

  // If compactBanner is true, render a stylish compact ticker banner
  if (compactBanner) {
    if (active10DaysStudentItems.length === 0) {
      return (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 border border-amber-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
              <Gift className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>🎂 শিক্ষার্থী জন্মদিন রিমাইন্ডার সিস্টেম</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">কাউন্টডাউন একটিভ</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                কমপক্ষে ১০ দিন আগে থেকে স্বয়ংক্রিয়ভাবে ক্লাসের নাম, রোল ও শিক্ষার্থীর নামসহ লাইভ কাউন্টডাউন প্রদর্শিত হয়।
              </p>
            </div>
          </div>
          <button
            onClick={handleSeedSampleBirthdays}
            className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>টেস্ট জন্মদিন লোড করুন</span>
          </button>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-rose-50 via-purple-50 to-amber-50 border-2 border-rose-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md animate-pulse">
              <Cake className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-rose-950">🎂 জন্মদিন রিমাইন্ডার ও লাইভ কাউন্টডাউন</span>
                <span className="text-[10px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full">
                  {toBanglaDigits(active10DaysStudentItems.length)} জনের জন্মদিন আসন্ন
                </span>
              </div>
              <span className="text-[10px] text-slate-600">১০ দিন আগে থেকেই স্বয়ংক্রিয় কাউন্টডাউন চলছে</span>
            </div>
          </div>
          <button
            onClick={playBirthdayTune}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
          >
            {isPlayingTune ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{isPlayingTune ? 'বাজছে...' : 'বার্থডে টিউন'}</span>
          </button>
        </div>

        {/* List of active 10-day reminders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {active10DaysStudentItems.slice(0, 4).map(item => (
            <div 
              key={item.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 shadow-sm transition ${
                item.isToday 
                  ? 'bg-amber-100/90 border-amber-300 ring-2 ring-amber-400' 
                  : item.daysRemaining <= 3
                  ? 'bg-rose-50/90 border-rose-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1 mb-0.5">
                  {item.isToday ? (
                    <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded font-black text-[9px] animate-bounce">🎉 আজ জন্মদিন</span>
                  ) : (
                    <span>⏳ আর {toBanglaDigits(item.daysRemaining)} দিন বাকি</span>
                  )}
                  <span className="text-slate-400">•</span>
                  <span>{toBanglaDigits(item.nextBirthday.getDate())} {bnMonths[item.nextBirthday.getMonth()]}</span>
                </div>
                {/* অমুক ক্লাসের রোল নং এ নাম অমুক */}
                <div className="text-xs font-black text-slate-900 truncate">
                  <span className="text-blue-900">{item.className}</span> ক্লাসের রোল নং <span className="font-mono text-purple-900">{toBanglaDigits(item.roll)}</span> এ নাম <span className="text-rose-900">{item.targetName}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                  {item.isToday ? (
                    <span className="text-emerald-700 font-bold">আজ সারাদিন চলবে উৎসব! 🎈</span>
                  ) : (
                    <span>{toBanglaDigits(item.daysRemaining)} দিন {toBanglaDigits(item.hoursRemaining)} ঘণ্টা {toBanglaDigits(item.minutesRemaining)} মি. {toBanglaDigits(item.secondsRemaining)} সে.</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setSelectedBirthdayCard(item)}
                  title="ডিজিটাল কার্ড দেখুন"
                  className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 transition cursor-pointer"
                >
                  <Gift className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleOpenSmsModal(item)}
                  title="শুভেচ্ছা এসএমএস পাঠান"
                  className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-48 h-48 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center shadow-lg text-white ring-4 ring-white/10 shrink-0">
              <Cake className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  🎂 শিক্ষার্থী জন্মদিন রিমাইন্ডার ও লাইভ কাউন্টডাউন
                </h2>
                <span className="text-[10px] font-black bg-rose-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  ১০ দিনের সতর্কতা
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl font-medium">
                প্রতিটি শিক্ষার্থীর জন্মদিনের কমপক্ষে দশ দিন আগে থেকে <span className="text-amber-300 font-bold font-mono">অমুক ক্লাসের রোল নং এ নাম অমুক</span> ফরম্যাটে স্বয়ংক্রিয় রিমাইন্ডার এবং সেকেন্ড টু সেকেন্ড কাউন্টডাউন ঘড়ি।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={playBirthdayTune}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                isPlayingTune 
                  ? 'bg-amber-400 text-blue-950 ring-2 ring-white font-black' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {isPlayingTune ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span>{isPlayingTune ? 'মিউজিক বন্ধ করুন' : 'বার্থডে মিউজিক'}</span>
            </button>

            <button
              onClick={handleSeedSampleBirthdays}
              title="টেস্ট করার জন্য ৩ দিন, ৭ দিন ও আজকের জন্মদিন ডেটা যুক্ত করুন"
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>টেস্ট জন্মদিন লোড করুন</span>
            </button>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/15 text-xs">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-[10px] font-bold text-amber-300 block">🚨 আসন্ন ১০ দিনের রিমাইন্ডার</span>
            <span className="text-lg font-black text-white">{toBanglaDigits(active10DaysStudentItems.length)} জন</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-[10px] font-bold text-rose-300 block">🎉 আজকের জন্মদিন</span>
            <span className="text-lg font-black text-white">{toBanglaDigits(todayStudentItems.length)} জন</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-[10px] font-bold text-emerald-300 block">📅 নিবন্ধিত শিক্ষার্থী জন্মদিন</span>
            <span className="text-lg font-black text-white">{toBanglaDigits(studentItems.length)} জন</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-[10px] font-bold text-cyan-300 block">👨‍👩‍👧 পিতা-মাতার জন্মদিন প্রোফাইল</span>
            <span className="text-lg font-black text-white">{toBanglaDigits(parentItems.length)} জন</span>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('10days')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === '10days' 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              <span>আসন্ন ১০ দিনের কাউন্টডাউন</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === '10days' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-800'
              }`}>
                {toBanglaDigits(active10DaysStudentItems.length)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('today')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'today' 
                  ? 'bg-amber-500 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cake className="h-3.5 w-3.5" />
              <span>আজকের জন্মদিন</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === 'today' ? 'bg-white text-amber-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {toBanglaDigits(todayStudentItems.length)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-blue-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>সকল শিক্ষার্থী ({toBanglaDigits(studentItems.length)})</span>
            </button>

            <button
              onClick={() => setActiveTab('parents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'parents' 
                  ? 'bg-indigo-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>পিতা ও মাতার জন্মদিন ({toBanglaDigits(parentItems.length)})</span>
            </button>
          </div>

          {/* Search and class filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-blue-900"
            >
              <option value="All">সকল শ্রেণী (All Classes)</option>
              {classesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="নাম বা রোল দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-blue-900 w-44"
            />
          </div>
        </div>
      </div>

      {/* Main Content List */}
      <div className="p-4 sm:p-6 space-y-4">
        {displayedItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-sm">
              <Gift className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-black text-slate-800">
              {activeTab === '10days' 
                ? 'বর্তমানে আগামী ১০ দিনের মধ্যে কোনো শিক্ষার্থীর জন্মদিন পাওয়া যায়নি'
                : activeTab === 'today'
                ? 'আজ কোনো শিক্ষার্থীর জন্মদিন নেই'
                : 'কোনো জন্মদিনের তথ্য মেলেনি'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              শিক্ষার্থী তথ্য এন্ট্রি ফর্মে প্রতিটি শিক্ষার্থীর <span className="font-bold text-slate-700">জন্ম তারিখ (Date of Birth)</span> এবং পিতা-মাতার জন্ম তারিখ যুক্ত থাকলে স্বয়ংক্রিয়ভাবে এখানে লাইভ কাউন্টডাউন শুরু হয়।
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleSeedSampleBirthdays}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>টেস্ট জন্মদিন ডাটা যোগ করুন (৩ দিন, ৭ দিন ও আজ)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayedItems.map((item) => {
              const student = item.student;
              const isToday = item.isToday;
              const isVeryClose = item.daysRemaining <= 3 && !isToday;

              return (
                <div 
                  key={item.id}
                  className={`rounded-2xl border transition-all p-4 shadow-sm relative overflow-hidden flex flex-col justify-between ${
                    isToday
                      ? 'bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 border-amber-300 ring-2 ring-amber-400'
                      : isVeryClose
                      ? 'bg-gradient-to-br from-rose-50/60 to-white border-rose-300'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {/* Decorative Corner Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-sm ${
                        isToday 
                          ? 'bg-amber-400 text-blue-950 ring-2 ring-amber-300 animate-bounce' 
                          : isVeryClose
                          ? 'bg-rose-500 text-white'
                          : 'bg-blue-900 text-white'
                      }`}>
                        {isToday ? '🎂' : item.type === 'student' ? '🎓' : item.type === 'father' ? '👨' : '👩'}
                      </div>
                      
                      <div className="min-w-0">
                        {/* Requirement format: অমুক ক্লাসের রোল নং এ নাম অমুক */}
                        <div className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                          {item.type === 'student' ? (
                            <>
                              <span className="text-blue-900 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                {item.className}
                              </span>
                              {' '}ক্লাসের রোল নং{' '}
                              <span className="font-mono text-purple-900 font-extrabold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                {toBanglaDigits(item.roll)}
                              </span>
                              {' '}এ নাম{' '}
                              <span className="text-rose-950 font-black underline decoration-rose-300 decoration-2 underline-offset-2">
                                {item.targetName}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-indigo-900 font-bold">
                                {item.relationshipLabel}: {item.targetName}
                              </span>
                              <span className="text-slate-500 text-xs block">
                                ({item.className} ক্লাসের রোল নং {toBanglaDigits(item.roll)} এর শিক্ষার্থী {item.student.banglaName || item.student.name}-এর {item.relationshipLabel})
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">
                            📅 জন্ম তারিখ: {toBanglaDigits(item.birthDate.getFullYear())}-{toBanglaDigits(String(item.birthDate.getMonth() + 1).padStart(2, '0'))}-{toBanglaDigits(String(item.birthDate.getDate()).padStart(2, '0'))}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-purple-900">
                            {item.turningAge > 0 ? `${toBanglaDigits(item.turningAge)} বছরে পদার্পণ` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 text-right">
                      {isToday ? (
                        <span className="inline-flex items-center gap-1 bg-amber-400 text-blue-950 px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm uppercase animate-pulse">
                          <Sparkles className="h-3 w-3" />
                          <span>আজ জন্মদিন!</span>
                        </span>
                      ) : isVeryClose ? (
                        <span className="inline-flex items-center gap-1 bg-rose-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm">
                          <AlertCircle className="h-3 w-3" />
                          <span>আর {toBanglaDigits(item.daysRemaining)} দিন বাকি</span>
                        </span>
                      ) : item.isWithin10Days ? (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <Clock className="h-3 w-3" />
                          <span>১০ দিনের মধ্যে</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-medium">
                          <span>{toBanglaDigits(item.daysRemaining)} দিন পর</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* LIVE COUNTDOWN DISPLAY (কার্ডের মূল আকর্ষণ) */}
                  <div className="my-2.5 p-3 rounded-xl bg-slate-900 text-white shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1 text-amber-300">
                        <Clock className="h-3 w-3" />
                        <span>লাইভ কাউন্টডাউন টাইমার (Live Countdown)</span>
                      </span>
                      {isToday ? (
                        <span className="text-amber-400 font-black animate-pulse">🎉 আজকের শুভ দিন</span>
                      ) : (
                        <span className="text-slate-300 font-mono">
                          {toBanglaDigits(item.nextBirthday.getDate())} {bnMonths[item.nextBirthday.getMonth()]}, {toBanglaDigits(item.nextBirthday.getFullYear())}
                        </span>
                      )}
                    </div>

                    {/* 4 Digit Boxes */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-1.5">
                        <span className="block text-lg sm:text-xl font-black text-amber-400 font-mono leading-none">
                          {toBanglaDigits(String(item.daysRemaining).padStart(2, '0'))}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">দিন</span>
                      </div>
                      <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-1.5">
                        <span className="block text-lg sm:text-xl font-black text-rose-400 font-mono leading-none">
                          {toBanglaDigits(String(item.hoursRemaining).padStart(2, '0'))}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">ঘণ্টা</span>
                      </div>
                      <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-1.5">
                        <span className="block text-lg sm:text-xl font-black text-emerald-400 font-mono leading-none">
                          {toBanglaDigits(String(item.minutesRemaining).padStart(2, '0'))}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">মিনিট</span>
                      </div>
                      <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-1.5">
                        <span className="block text-lg sm:text-xl font-black text-cyan-400 font-mono leading-none animate-pulse">
                          {toBanglaDigits(String(item.secondsRemaining).padStart(2, '0'))}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">সেকেন্ড</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">
                        {student.guardianPhone || student.fatherPhone || student.motherPhone || 'ফোন নম্বর নেই'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBirthdayCard(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold border border-purple-200 text-xs transition cursor-pointer"
                      >
                        <Gift className="h-3.5 w-3.5 text-purple-600" />
                        <span>ডিজিটাল কার্ড</span>
                      </button>

                      <button
                        onClick={() => handleOpenSmsModal(item)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>শুভেচ্ছা বার্তা</span>
                      </button>

                      {onEditStudentDob && (
                        <button
                          onClick={() => onEditStudentDob(student)}
                          title="জন্ম তারিখ পরিবর্তন করুন"
                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
                        >
                          এডিট
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP 1: Birthday Card Modal */}
      {selectedBirthdayCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-amber-300 relative animate-scale-up">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedBirthdayCard(null)}
              className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-md cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Festive Card Frame */}
            <div className="bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-950 p-6 sm:p-8 text-center text-white relative">
              <div className="text-4xl mb-2">🎉 🎂 🎈</div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                {schoolName} — ডিজিটাল শুভকামনা
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-white">
                শুভ জন্মদিন!
              </h2>
              <p className="text-xs text-slate-200 mt-1">
                Happy Birthday Greetings & Blessings
              </p>
            </div>

            <div className="p-6 sm:p-8 text-center space-y-4 bg-gradient-to-b from-white to-amber-50/50">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-1 mx-auto shadow-lg">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-3xl font-black text-rose-600">
                  {selectedBirthdayCard.targetName.charAt(0) || '🎂'}
                </div>
              </div>

              {/* Requirement display: অমুক ক্লাসের রোল নং এ নাম অমুক */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  শিক্ষার্থীর পূর্ণ বিবরণ
                </span>
                <h3 className="text-xl font-black text-blue-950">
                  {selectedBirthdayCard.targetName}
                </h3>
                <div className="text-sm font-bold text-slate-700 mt-1">
                  {selectedBirthdayCard.className} ক্লাসের রোল নং <span className="font-mono text-rose-700">{toBanglaDigits(selectedBirthdayCard.roll)}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-700 leading-relaxed italic">
                &ldquo;আমাদের প্রিয় শিক্ষার্থী <span className="font-bold text-blue-950">{selectedBirthdayCard.targetName}</span>-এর জন্মদিনে জানাই অপার্থিব আনন্দ ও অন্তরের গভীর দোয়া। তুমি সুশিক্ষা, সততা ও জ্ঞানের জ্যোতিতে দীপ্ত হয়ে পরিবার ও জাতির মুখ উজ্জ্বল করো।&rdquo;
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-200">
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400">তারিখ:</span>
                  <span className="font-bold font-mono">
                    {toBanglaDigits(selectedBirthdayCard.nextBirthday.getDate())} {bnMonths[selectedBirthdayCard.nextBirthday.getMonth()]}, {toBanglaDigits(selectedBirthdayCard.nextBirthday.getFullYear())}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400">শুভেচ্ছান্তে:</span>
                  <span className="font-bold text-blue-900">{schoolName} পরিবার</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  <span>কার্ড প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => {
                    const card = selectedBirthdayCard;
                    setSelectedBirthdayCard(null);
                    handleOpenSmsModal(card);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>অভিভাবককে এসএমএস পাঠান</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: Birthday SMS Modal */}
      {selectedSmsTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            <div className="bg-gradient-to-r from-rose-600 to-purple-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-base">জন্মদিনের শুভেচ্ছা বার্তা প্রেরণ</h3>
                  <span className="text-[11px] text-rose-100">ইনস্ট্যান্ট প্যারেন্ট গেটওয়ে এসএমএস</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSmsTarget(null)}
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {smsSentNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{smsSentNotice}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">প্রাপক:</span>
                  <span className="font-bold text-slate-800">
                    {selectedSmsTarget.targetName} ({selectedSmsTarget.className}, রোল: {toBanglaDigits(selectedSmsTarget.roll)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">অভিভাবকের মোবাইল:</span>
                  <span className="font-mono font-bold text-blue-900">
                    {selectedSmsTarget.student.guardianPhone || selectedSmsTarget.student.fatherPhone || selectedSmsTarget.student.motherPhone || '০১৭xxxxxxxx'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  এসএমএস মেসেজ টেক্সট (বাংলায়):
                </label>
                <textarea
                  rows={4}
                  value={smsText}
                  onChange={e => setSmsText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-blue-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedSmsTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSendSms}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>এসএমএস পাঠিয়ে দিন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
