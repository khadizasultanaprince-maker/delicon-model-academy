/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Student } from '../types';
import { useSchool } from '../context/SchoolContext';
import { 
  Cake, 
  Gift, 
  Sparkles, 
  Clock, 
  Calendar as CalendarIcon, 
  Heart, 
  Send, 
  Award, 
  CheckCircle2, 
  User, 
  PartyPopper, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft,
  X, 
  Eye, 
  Share2, 
  Phone,
  Search,
  Filter,
  Users,
  Grid,
  ListFilter
} from 'lucide-react';

interface GuardianBirthdayCountdownProps {
  currentStudent?: Student | null;
  students?: Student[];
}

export interface UpcomingCelebration {
  student: Student;
  dobString: string;
  birthDate: Date;
  nextBirthday: Date;
  birthMonth: number; // 0-indexed (0 to 11)
  birthDay: number;   // 1 to 31
  isToday: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  turningAge: number;
  isWithin10Days: boolean;
  isOwnChild: boolean;
}

// Convert numbers to Bengali digits
export const toBanglaDigits = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
};

// Bengali month names
export const bnMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

// Bengali week day abbreviations (Sunday to Saturday)
export const bnWeekDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

const ALL_CLASSES = [
  'All',
  'প্লে (Play)',
  'নার্সারী (Nursery)',
  'কেজি (KG)',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10'
];

export const GuardianBirthdayCountdown: React.FC<GuardianBirthdayCountdownProps> = ({ 
  currentStudent, 
  students: propStudents 
}) => {
  const { students: contextStudents, schoolName, updateStudent } = useSchool();
  const allStudents = propStudents || contextStudents || [];
  
  const [now, setNow] = useState<Date>(new Date());
  
  // Primary view mode: 'overview' (Monthly Calendar & Filtered Celebrations) vs 'countdown' (Live 10-day Countdown Focus)
  const [viewMode, setViewMode] = useState<'overview' | 'countdown'>('overview');

  // Calendar navigation state (year & 0-indexed month)
  const [calYear, setCalYear] = useState<number>(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDayOnCal, setSelectedDayOnCal] = useState<number | null>(null);

  // Filters
  const [classFilter, setClassFilter] = useState<string>('All');
  const [scopeFilter, setScopeFilter] = useState<'month' | '10days' | 'today' | 'classmates' | 'mychild' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Media
  const [selectedCelebration, setSelectedCelebration] = useState<UpcomingCelebration | null>(null);
  const [greetingModalTarget, setGreetingModalTarget] = useState<UpcomingCelebration | null>(null);
  const [greetingText, setGreetingText] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [isPlayingTune, setIsPlayingTune] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate upcoming birthdays for all students
  const celebrationsList: UpcomingCelebration[] = useMemo(() => {
    const list: UpcomingCelebration[] = [];

    allStudents.forEach(st => {
      if (!st.dob || typeof st.dob !== 'string') return;

      let year = 0;
      let month = 0; // 0-indexed
      let day = 0;

      const trimmed = st.dob.trim();
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
        return;
      }

      const birthDate = new Date(year, month, day);
      const currentYear = now.getFullYear();

      // Check if birthday is today
      const isToday = now.getMonth() === month && now.getDate() === day;

      let targetDate = new Date(currentYear, month, day, 0, 0, 0, 0);

      // If already passed earlier this year and not today, next birthday is next year
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
      const isOwnChild = Boolean(currentStudent && currentStudent.id === st.id);

      list.push({
        student: st,
        dobString: st.dob,
        birthDate,
        nextBirthday: targetDate,
        birthMonth: month,
        birthDay: day,
        isToday,
        daysRemaining: days,
        hoursRemaining: hours,
        minutesRemaining: minutes,
        secondsRemaining: seconds,
        turningAge: turningAge > 0 ? turningAge : 0,
        isWithin10Days,
        isOwnChild
      });
    });

    // Sort: isToday first, then days remaining ascending
    return list.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      if (a.daysRemaining !== b.daysRemaining) return a.daysRemaining - b.daysRemaining;
      if (a.hoursRemaining !== b.hoursRemaining) return a.hoursRemaining - b.hoursRemaining;
      return a.minutesRemaining - b.minutesRemaining;
    });
  }, [allStudents, now, currentStudent]);

  // Special groups
  const within10DaysCelebrations = useMemo(() => {
    return celebrationsList.filter(c => c.isWithin10Days);
  }, [celebrationsList]);

  const todayCelebrations = useMemo(() => {
    return celebrationsList.filter(c => c.isToday);
  }, [celebrationsList]);

  const ownChildCelebration = useMemo(() => {
    return celebrationsList.find(c => c.isOwnChild);
  }, [celebrationsList]);

  // Featured hero celebration for the ticking clock
  const featuredCelebration = useMemo(() => {
    if (ownChildCelebration && ownChildCelebration.isWithin10Days) {
      return ownChildCelebration;
    }
    if (within10DaysCelebrations.length > 0) {
      return within10DaysCelebrations[0];
    }
    return celebrationsList[0] || null;
  }, [ownChildCelebration, within10DaysCelebrations, celebrationsList]);

  // Group celebrations by calendar month and day for the monthly calendar view
  const calendarBirthdaysMap = useMemo(() => {
    const map = new Map<number, UpcomingCelebration[]>();
    celebrationsList.forEach(c => {
      if (c.birthMonth === calMonth) {
        const day = c.birthDay;
        const existing = map.get(day) || [];
        map.set(day, [...existing, c]);
      }
    });
    return map;
  }, [celebrationsList, calMonth]);

  // Total birthdays occurring in the currently navigated calendar month
  const totalInSelectedMonth = useMemo(() => {
    return celebrationsList.filter(c => c.birthMonth === calMonth).length;
  }, [celebrationsList, calMonth]);

  // Filtered celebrations for the list view
  const filteredCelebrations = useMemo(() => {
    let list = celebrationsList;

    // Scope filtering
    if (scopeFilter === 'month') {
      list = list.filter(c => c.birthMonth === calMonth);
    } else if (scopeFilter === '10days') {
      list = list.filter(c => c.isWithin10Days);
    } else if (scopeFilter === 'today') {
      list = list.filter(c => c.isToday);
    } else if (scopeFilter === 'classmates' && currentStudent) {
      list = list.filter(c => c.student.className === currentStudent.className);
    } else if (scopeFilter === 'mychild') {
      list = list.filter(c => c.isOwnChild);
    }

    // Class filtering
    if (classFilter !== 'All') {
      list = list.filter(c => c.student.className === classFilter || c.student.className?.toLowerCase().includes(classFilter.toLowerCase()));
    }

    // Specific calendar day selection
    if (selectedDayOnCal !== null && scopeFilter === 'month') {
      list = list.filter(c => c.birthDay === selectedDayOnCal);
    }

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        (c.student.banglaName && c.student.banglaName.toLowerCase().includes(q)) ||
        (c.student.name && c.student.name.toLowerCase().includes(q)) ||
        (c.student.roll && c.student.roll.toLowerCase().includes(q)) ||
        (c.student.className && c.student.className.toLowerCase().includes(q))
      );
    }

    return list;
  }, [celebrationsList, scopeFilter, calMonth, classFilter, selectedDayOnCal, searchQuery, currentStudent]);

  // Calendar generation logic for calYear & calMonth
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
    const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

    const days: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      celebrations: UpcomingCelebration[];
      isToday: boolean;
      hasOwnChild: boolean;
    }> = [];

    // Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        celebrations: [],
        isToday: false,
        hasOwnChild: false
      });
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayCelebs = calendarBirthdaysMap.get(day) || [];
      const isToday = now.getFullYear() === calYear && now.getMonth() === calMonth && now.getDate() === day;
      const hasOwnChild = dayCelebs.some(c => c.isOwnChild);

      days.push({
        dayNumber: day,
        isCurrentMonth: true,
        celebrations: dayCelebs,
        isToday,
        hasOwnChild
      });
    }

    // Trailing days from next month to complete standard 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        dayNumber: day,
        isCurrentMonth: false,
        celebrations: [],
        isToday: false,
        hasOwnChild: false
      });
    }

    return days;
  }, [calYear, calMonth, calendarBirthdaysMap, now]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    setSelectedDayOnCal(null);
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDayOnCal(null);
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  const handleJumpToCurrentMonth = () => {
    setSelectedDayOnCal(null);
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
  };

  // Play celebration melody
  const playTune = () => {
    try {
      if (isPlayingTune) return;
      setIsPlayingTune(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

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

  // Seed sample upcoming birthdays for test verification
  const handleSeedBirthdays = () => {
    if (allStudents.length === 0) return;

    const makeDob = (daysOffset: number, birthYear = 2015) => {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${birthYear}-${month}-${day}`;
    };

    if (currentStudent) {
      updateStudent(currentStudent.id, {
        dob: makeDob(3, 2015), // Child's birthday in 3 days!
        fatherDob: '1982-05-14',
        fatherBirthRegNo: '19822692518100123',
        motherDob: makeDob(7, 1986),
        motherBirthRegNo: '19862692518100456'
      });
    }

    if (allStudents[0] && allStudents[0].id !== currentStudent?.id) {
      updateStudent(allStudents[0].id, {
        dob: makeDob(1, 2015), // Tomorrow
        fatherDob: '1980-11-20',
        fatherBirthRegNo: '19802692518100789',
        motherDob: '1984-03-12',
        motherBirthRegNo: '19842692518100999'
      });
    }

    if (allStudents[1] && allStudents[1].id !== currentStudent?.id) {
      updateStudent(allStudents[1].id, {
        dob: makeDob(0, 2016), // Today!
        fatherDob: '1979-08-10',
        fatherBirthRegNo: '19792692518100555',
        motherDob: '1983-02-18',
        motherBirthRegNo: '19832692518100777'
      });
    }
  };

  // Open greeting message modal
  const handleOpenGreeting = (c: UpcomingCelebration) => {
    setGreetingModalTarget(c);
    const childTitle = `${c.student.className} ক্লাসের রোল নং ${c.student.roll} এ নাম ${c.student.banglaName || c.student.name}`;
    setGreetingText(
      `প্রিয় ${c.student.banglaName || c.student.name} (${childTitle}), জন্মদিনের অনেক অনেক শুভেচ্ছা ও শুভকামনা! তোমার সুস্বাস্থ্য ও উজ্জ্বল ভবিষ্যৎ কামনা করি। 🎂🎈 — অভিভাবক শুভেচ্ছা`
    );
  };

  // Submit greeting
  const handleSendGreeting = () => {
    if (!greetingModalTarget) return;
    setSentNotice(`শুভেচ্ছা বার্তাটি ${greetingModalTarget.student.banglaName || greetingModalTarget.student.name}-এর প্রোফাইলে সফলভাবে পৌঁছেছে! 🎉`);
    setTimeout(() => {
      setSentNotice(null);
      setGreetingModalTarget(null);
    }, 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-5 sm:p-6 text-slate-800 font-sans">
      
      {/* 1. Header Banner & View Mode Switcher */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-700 p-5 sm:p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-52 h-52 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-pink-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-2 ring-white/30 shadow-inner shrink-0">
              <Cake className="h-6 w-6 sm:h-7 sm:w-7 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-blue-950 px-2.5 py-0.5 rounded-full shadow-sm">
                  অভিভাবক পোর্টাল
                </span>
                <span className="text-xs text-rose-100 font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  <span>বার্থডে ওভারভিউ ও লাইভ ক্যালেন্ডার</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1 tracking-tight">
                🎂 শিক্ষার্থী জন্মদিন রিমাইন্ডার ও মাসিক ক্যালেন্ডার
              </h2>
              <p className="text-xs text-rose-100 mt-0.5 max-w-xl">
                আপনার সন্তান ও সহপাঠীদের জন্মদিন সহজে ট্র্যাক করার জন্য মাসিক ক্যালেন্ডার ও লাইভ কাউন্টডাউন টাইমার।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Overview (Monthly Calendar) vs Live Countdown */}
            <div className="bg-black/30 p-1 rounded-xl backdrop-blur-sm border border-white/20 flex items-center gap-1">
              <button
                onClick={() => setViewMode('overview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'overview'
                    ? 'bg-white text-blue-950 shadow-sm font-black'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5 text-rose-600" />
                <span>মাসিক ক্যালেন্ডার ওভারভিউ</span>
              </button>

              <button
                onClick={() => setViewMode('countdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'countdown'
                    ? 'bg-amber-400 text-blue-950 shadow-sm font-black'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-blue-900" />
                <span>লাইভ কাউন্টডাউন (১০ দিন)</span>
              </button>
            </div>

            <button
              onClick={playTune}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                isPlayingTune
                  ? 'bg-amber-400 text-blue-950 font-black ring-2 ring-white'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              {isPlayingTune ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span>{isPlayingTune ? 'বাজছে...' : 'বার্থডে টিউন'}</span>
            </button>

            {within10DaysCelebrations.length === 0 && (
              <button
                onClick={handleSeedBirthdays}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>টেস্ট জন্মদিন লোড করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Hero Live Countdown Clock Card (Permanent Ticker) */}
        {featuredCelebration && (
          <div className="mt-5 p-4 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/15 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-xs font-black text-amber-300 tracking-wide uppercase">
                  {featuredCelebration.isToday 
                    ? '🎉 আজ জন্মদিন উদযাপন হচ্ছে!' 
                    : featuredCelebration.isOwnChild
                    ? '🌟 আপনার সন্তানের আসন্ন জন্মদিনের লাইভ কাউন্টডাউন'
                    : '⏳ পরবর্তী আসন্ন জন্মদিনের লাইভ কাউন্টডাউন'}
                </span>
              </div>
              <span className="text-[11px] text-slate-300 font-mono">
                {toBanglaDigits(featuredCelebration.nextBirthday.getDate())} {bnMonths[featuredCelebration.nextBirthday.getMonth()]}, {toBanglaDigits(featuredCelebration.nextBirthday.getFullYear())}
              </span>
            </div>

            {/* Requirement Display: অমুক ক্লাসের রোল নং এ নাম অমুক */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-base sm:text-lg font-black text-white leading-tight">
                  <span className="text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-4">
                    {featuredCelebration.student.className}
                  </span>
                  {' '}ক্লাসের রোল নং{' '}
                  <span className="font-mono text-cyan-300 bg-white/10 px-2 py-0.5 rounded-md">
                    {toBanglaDigits(featuredCelebration.student.roll)}
                  </span>
                  {' '}এ নাম{' '}
                  <span className="text-rose-300 font-extrabold">
                    {featuredCelebration.student.banglaName || featuredCelebration.student.name}
                  </span>
                  {featuredCelebration.isOwnChild && (
                    <span className="ml-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      (আমার সন্তান)
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span>📅 জন্ম তারিখ: {featuredCelebration.dobString}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-bold">
                    {featuredCelebration.turningAge > 0 ? `${toBanglaDigits(featuredCelebration.turningAge)} বছরে পদার্পণ করবে` : ''}
                  </span>
                </div>
              </div>

              {/* 4 Ticking Digits */}
              <div className="grid grid-cols-4 gap-2 text-center shrink-0 min-w-[260px]">
                <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2">
                  <span className="block text-xl sm:text-2xl font-black text-amber-400 font-mono leading-none">
                    {toBanglaDigits(String(featuredCelebration.daysRemaining).padStart(2, '0'))}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">দিন</span>
                </div>
                <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2">
                  <span className="block text-xl sm:text-2xl font-black text-rose-400 font-mono leading-none">
                    {toBanglaDigits(String(featuredCelebration.hoursRemaining).padStart(2, '0'))}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">ঘণ্টা</span>
                </div>
                <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2">
                  <span className="block text-xl sm:text-2xl font-black text-emerald-400 font-mono leading-none">
                    {toBanglaDigits(String(featuredCelebration.minutesRemaining).padStart(2, '0'))}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">মিনিট</span>
                </div>
                <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2">
                  <span className="block text-xl sm:text-2xl font-black text-cyan-400 font-mono leading-none animate-pulse">
                    {toBanglaDigits(String(featuredCelebration.secondsRemaining).padStart(2, '0'))}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">সেকেন্ড</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MONTHLY CALENDAR VIEW (When viewMode === 'overview') */}
      {viewMode === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Calendar Header Navigation */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  {bnMonths[calMonth]}, {toBanglaDigits(calYear)}
                </h3>
                <p className="text-[11px] text-slate-500">
                  এই মাসে মোট <span className="font-bold text-rose-600">{toBanglaDigits(totalInSelectedMonth)} জন</span> শিক্ষার্থীর জন্মদিন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer transition shadow-xs"
                title="পূর্ববর্তী মাস"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={handleJumpToCurrentMonth}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer transition shadow-xs"
              >
                বর্তমান মাস
              </button>

              <button
                onClick={handleNextMonth}
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer transition shadow-xs"
                title="পরবর্তী মাস"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {selectedDayOnCal !== null && (
                <button
                  onClick={() => setSelectedDayOnCal(null)}
                  className="ml-2 text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>তারিখ ফিল্টার মুছুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Calendar Days Grid */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 bg-slate-100/80 border-b border-slate-200 text-center py-2.5 text-xs font-black text-slate-700">
              {bnWeekDays.map((w, idx) => (
                <div key={w} className={idx === 5 ? 'text-rose-600' : ''}>
                  {w}
                </div>
              ))}
            </div>

            {/* Days cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-150 text-xs">
              {calendarDays.map((cell, idx) => {
                const hasBirthdays = cell.celebrations.length > 0;
                const isSelected = selectedDayOnCal === cell.dayNumber && cell.isCurrentMonth;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!cell.isCurrentMonth) return;
                      setSelectedDayOnCal(prev => (prev === cell.dayNumber ? null : cell.dayNumber));
                    }}
                    className={`min-h-[72px] sm:min-h-[85px] p-1.5 sm:p-2 transition-all flex flex-col justify-between relative cursor-pointer ${
                      !cell.isCurrentMonth 
                        ? 'bg-slate-50/50 text-slate-300 pointer-events-none'
                        : isSelected
                        ? 'bg-purple-100/70 ring-2 ring-purple-500 z-10'
                        : cell.hasOwnChild
                        ? 'bg-emerald-50/60 hover:bg-emerald-100/70 ring-1 ring-emerald-300'
                        : cell.isToday
                        ? 'bg-amber-50 hover:bg-amber-100/60 ring-1 ring-amber-300'
                        : hasBirthdays
                        ? 'bg-rose-50/40 hover:bg-rose-100/50'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Top Row: Date Number & Badges */}
                    <div className="flex items-center justify-between">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        cell.isToday
                          ? 'bg-amber-400 text-blue-950 font-black shadow-xs'
                          : cell.hasOwnChild
                          ? 'bg-emerald-600 text-white font-black shadow-xs'
                          : isSelected
                          ? 'bg-purple-700 text-white font-black'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}>
                        {toBanglaDigits(cell.dayNumber)}
                      </span>

                      {cell.isToday && (
                        <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 rounded">
                          আজ
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Birthday indicators */}
                    {hasBirthdays && cell.isCurrentMonth && (
                      <div className="mt-1 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Cake className="h-3 w-3 text-rose-600 shrink-0" />
                          <span className="text-[10px] font-black text-rose-700 truncate leading-none">
                            {toBanglaDigits(cell.celebrations.length)} জনের জন্মদিন
                          </span>
                        </div>
                        <div className="truncate text-[9px] text-slate-600 font-semibold hidden sm:block">
                          {cell.celebrations[0].student.banglaName || cell.celebrations[0].student.name}
                          {cell.celebrations.length > 1 ? ` +${toBanglaDigits(cell.celebrations.length - 1)}` : ''}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Filter Toolbar & Search Bar */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Scope Filters */}
          <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => { setScopeFilter('month'); setSelectedDayOnCal(null); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scopeFilter === 'month'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>এই মাসের জন্মদিন</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                scopeFilter === 'month' ? 'bg-white text-blue-900' : 'bg-slate-100 text-slate-700'
              }`}>
                {toBanglaDigits(totalInSelectedMonth)}
              </span>
            </button>

            <button
              onClick={() => { setScopeFilter('10days'); setSelectedDayOnCal(null); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scopeFilter === '10days'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>১০ দিনের সতর্কতা</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                scopeFilter === '10days' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-800'
              }`}>
                {toBanglaDigits(within10DaysCelebrations.length)}
              </span>
            </button>

            <button
              onClick={() => { setScopeFilter('today'); setSelectedDayOnCal(null); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scopeFilter === 'today'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cake className="h-3.5 w-3.5" />
              <span>আজকের জন্মদিন</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                scopeFilter === 'today' ? 'bg-white text-amber-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {toBanglaDigits(todayCelebrations.length)}
              </span>
            </button>

            {currentStudent && (
              <button
                onClick={() => { setScopeFilter('classmates'); setSelectedDayOnCal(null); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  scopeFilter === 'classmates'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>সহপাঠীবৃন্দ ({currentStudent.className})</span>
              </button>
            )}

            {ownChildCelebration && (
              <button
                onClick={() => { setScopeFilter('mychild'); setSelectedDayOnCal(null); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  scopeFilter === 'mychild'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>আমার সন্তান</span>
              </button>
            )}

            <button
              onClick={() => { setScopeFilter('all'); setSelectedDayOnCal(null); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scopeFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>সকল শিক্ষার্থী ({toBanglaDigits(celebrationsList.length)})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="শিক্ষার্থীর নাম বা রোল দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-blue-900 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary filters row (Class Selector & Active Filter Indicators) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>শ্রেণি ফিল্টার:</span>
            </span>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold focus:outline-blue-900 shadow-xs cursor-pointer"
            >
              {ALL_CLASSES.map(cls => (
                <option key={cls} value={cls}>
                  {cls === 'All' ? 'সকল শ্রেণি (All Classes)' : cls}
                </option>
              ))}
            </select>

            {selectedDayOnCal !== null && (
              <span className="bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>নির্বাচিত তারিখ: {toBanglaDigits(selectedDayOnCal)} {bnMonths[calMonth]}</span>
                <button onClick={() => setSelectedDayOnCal(null)} className="hover:text-purple-950">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            ফিল্টার অনুসারে প্রদর্শিত: <strong className="text-slate-900">{toBanglaDigits(filteredCelebrations.length)} জন</strong>
          </div>
        </div>
      </div>

      {/* 5. Filtered List of Upcoming Celebrations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Gift className="h-4 w-4 text-rose-600" />
            <span>আসন্ন জন্মদিন উদযাপনের পূর্ণ তালিকা</span>
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            {toBanglaDigits(filteredCelebrations.length)} celebrations listed
          </span>
        </div>

        {filteredCelebrations.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <Gift className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-black text-slate-800">
              বর্তমান ফিল্টার অনুসারে কোনো শিক্ষার্থীর জন্মদিন পাওয়া যায়নি
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              অন্য কোনো শ্রেণি বা মাস নির্বাচন করুন অথবা 'সকল শিক্ষার্থী' অপশনে ক্লিক করুন।
            </p>
            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => { setScopeFilter('month'); setClassFilter('All'); setSelectedDayOnCal(null); setSearchQuery(''); }}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </button>
              <button
                onClick={handleSeedBirthdays}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                টেস্ট জন্মদিন লোড করুন
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCelebrations.map((c) => {
              const isToday = c.isToday;
              const isVeryClose = c.daysRemaining <= 3 && !isToday;

              return (
                <div
                  key={c.student.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between shadow-xs relative overflow-hidden ${
                    c.isOwnChild 
                      ? 'bg-gradient-to-br from-emerald-50/70 to-white border-emerald-300 ring-2 ring-emerald-400/40' 
                      : isToday
                      ? 'bg-gradient-to-br from-amber-50 to-pink-50 border-amber-300 ring-1 ring-amber-300'
                      : isVeryClose
                      ? 'bg-gradient-to-br from-rose-50/50 to-white border-rose-200'
                      : 'bg-white border-slate-200 hover:border-blue-200'
                  }`}
                >
                  <div>
                    {/* Header Line */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                          isToday 
                            ? 'bg-amber-400 text-blue-950 animate-bounce' 
                            : c.isOwnChild
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-900 text-white'
                        }`}>
                          {isToday ? '🎂' : c.isOwnChild ? '🌟' : '🎓'}
                        </div>
                        <div className="min-w-0">
                          {/* Mandatory requested format: অমুক ক্লাসের রোল নং এ নাম অমুক */}
                          <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                            <span className="text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-150 font-bold">
                              {c.student.className}
                            </span>
                            {' '}রোল{' '}
                            <span className="font-mono text-purple-900 font-extrabold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-150">
                              {toBanglaDigits(c.student.roll)}
                            </span>
                            {' '}এ নাম{' '}
                            <span className="text-rose-950 font-black">
                              {c.student.banglaName || c.student.name}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                            <span>📅 {toBanglaDigits(c.nextBirthday.getDate())} {bnMonths[c.nextBirthday.getMonth()]}, {toBanglaDigits(c.nextBirthday.getFullYear())}</span>
                            <span>•</span>
                            <span className="font-bold text-purple-900">
                              {c.turningAge > 0 ? `${toBanglaDigits(c.turningAge)} বছরে পদার্পণ` : ''}
                            </span>
                            {c.isOwnChild && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded">
                                আমার সন্তান
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div className="shrink-0 text-right">
                        {isToday ? (
                          <span className="bg-amber-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                            🎉 আজ জন্মদিন!
                          </span>
                        ) : isVeryClose ? (
                          <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                            আর {toBanglaDigits(c.daysRemaining)} দিন
                          </span>
                        ) : c.isWithin10Days ? (
                          <span className="bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ১০ দিনের মধ্যে
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                            {toBanglaDigits(c.daysRemaining)} দিন পর
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compact Countdown Bar */}
                    <div className="my-2 p-2 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 font-sans">
                        <Clock className="h-3 w-3" />
                        <span>কাউন্টডাউন:</span>
                      </span>
                      {isToday ? (
                        <span className="text-amber-300 font-black animate-pulse font-sans">
                          আজ সারাদিন চলবে শুভকামনা! 🎈
                        </span>
                      ) : (
                        <span className="font-black text-cyan-300">
                          {toBanglaDigits(c.daysRemaining)} দিন {toBanglaDigits(c.hoursRemaining)} ঘণ্টা {toBanglaDigits(c.minutesRemaining)} মিনিট {toBanglaDigits(c.secondsRemaining)} সে.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">
                      পিতা/মাতা: {c.student.fatherNameBn || c.student.motherNameBn || c.student.guardianName || 'অভিভাবক'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedCelebration(c)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold transition cursor-pointer"
                      >
                        <Gift className="h-3 w-3 text-purple-600" />
                        <span>কার্ড</span>
                      </button>
                      <button
                        onClick={() => handleOpenGreeting(c)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                      >
                        <Heart className="h-3 w-3" />
                        <span>শুভেচ্ছা</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP 1: Celebration Greetings Card Modal */}
      {selectedCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-4 border-amber-300 relative animate-scale-up">
            <button
              onClick={() => setSelectedCelebration(null)}
              className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-md cursor-pointer transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="bg-gradient-to-b from-rose-600 via-purple-700 to-indigo-900 p-6 text-center text-white">
              <div className="text-3xl mb-1">🎉 🎂 🎈</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                {schoolName} — অভিভাবক বার্তা
              </span>
              <h3 className="text-2xl font-black mt-2 text-white">শুভ জন্মদিন!</h3>
              <p className="text-[11px] text-rose-100">Happy Birthday Wishes & Blessings</p>
            </div>

            <div className="p-6 text-center space-y-4 bg-gradient-to-b from-white to-amber-50/40">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-1 mx-auto shadow-md">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-2xl font-black text-rose-600">
                  {selectedCelebration.student.banglaName?.charAt(0) || '🎂'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  শিক্ষার্থীর পূর্ণ তথ্য
                </span>
                <h4 className="text-lg font-black text-blue-950">
                  {selectedCelebration.student.banglaName || selectedCelebration.student.name}
                </h4>
                <div className="text-xs font-bold text-slate-700 mt-0.5">
                  {selectedCelebration.student.className} ক্লাসের রোল নং <span className="font-mono text-rose-700">{toBanglaDigits(selectedCelebration.student.roll)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-700 leading-relaxed italic">
                &ldquo;সুশিক্ষা, বিনয় ও আদর্শ চরিত্রের আলোয় উজ্জ্বল হোক তোমার প্রতিটি পদক্ষেপ। তোমার সুস্থতা, দীর্ঘায়ু ও প্রদীপ্ত জীবনের জন্য অন্তরের গভীর শুভকামনা।&rdquo;
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
                <span className="font-mono font-bold text-slate-700">
                  তারিখ: {toBanglaDigits(selectedCelebration.nextBirthday.getDate())} {bnMonths[selectedCelebration.nextBirthday.getMonth()]}, {toBanglaDigits(selectedCelebration.nextBirthday.getFullYear())}
                </span>
                <span className="font-bold text-blue-900">{schoolName}</span>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  কার্ড প্রিন্ট করুন
                </button>
                <button
                  onClick={() => {
                    const c = selectedCelebration;
                    setSelectedCelebration(null);
                    handleOpenGreeting(c);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  শুভেচ্ছা মেসেজ পাঠান
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: Greeting Message Modal */}
      {greetingModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            <div className="bg-gradient-to-r from-rose-600 to-purple-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-amber-300" />
                <h4 className="font-black text-sm">জন্মদিনের শুভেচ্ছা বার্তা প্রেরণ</h4>
              </div>
              <button
                onClick={() => setGreetingModalTarget(null)}
                className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {sentNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{sentNotice}</span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500">প্রাপক: </span>
                <span className="font-bold text-slate-800">
                  {greetingModalTarget.student.banglaName || greetingModalTarget.student.name} ({greetingModalTarget.student.className}, রোল: {toBanglaDigits(greetingModalTarget.student.roll)})
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার শুভেচ্ছা বার্তা:
                </label>
                <textarea
                  rows={4}
                  value={greetingText}
                  onChange={e => setGreetingText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-blue-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setGreetingModalTarget(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSendGreeting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>শুভেচ্ছা পাঠান</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Also export as BirthdayCountdown and BirthdayOverview for flexible import
export const BirthdayCountdown = GuardianBirthdayCountdown;
export const BirthdayOverview = GuardianBirthdayCountdown;
