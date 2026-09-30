/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Student } from '../types';
import { useSchool } from '../context/SchoolContext';
import { 
  Bell, 
  Cake, 
  Sparkles, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Gift, 
  Eye, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ShieldAlert, 
  Heart,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';

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

export interface AdminBirthdayAlert {
  id: string;
  student: Student;
  className: string;
  roll: string;
  studentName: string;
  dobString: string;
  birthDate: Date;
  nextBirthday: Date;
  isToday: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  turningAge: number;
  priority: 'TODAY' | 'CRITICAL' | 'UPCOMING';
  isDismissed: boolean;
}

interface AdminBirthdayAlertSystemProps {
  onNavigateToTab?: (tabId: string) => void;
  renderMode?: 'banner' | 'bell_dropdown' | 'full';
}

export const AdminBirthdayAlertSystem: React.FC<AdminBirthdayAlertSystemProps> = ({
  onNavigateToTab,
  renderMode = 'banner'
}) => {
  const { students, schoolName, updateStudent } = useSchool();
  const [now, setNow] = useState<Date>(new Date());
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('delicon_admin_dismissed_birthday_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAlertForCard, setSelectedAlertForCard] = useState<AdminBirthdayAlert | null>(null);
  const [selectedAlertForSms, setSelectedAlertForSms] = useState<AdminBirthdayAlert | null>(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState(() => {
    return localStorage.getItem('delicon_birthday_sound_muted') === 'true';
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const hasPlayedInitialAlertChime = useRef(false);

  // Update clock every second for precision countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute active birthday alerts within the 10-day countdown period
  const allBirthdayAlerts: AdminBirthdayAlert[] = useMemo(() => {
    const alerts: AdminBirthdayAlert[] = [];

    students.forEach(st => {
      if (!st.dob || typeof st.dob !== 'string') return;

      let year = 0;
      let month = 0;
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
      const isToday = now.getMonth() === month && now.getDate() === day;

      let targetDate = new Date(currentYear, month, day, 0, 0, 0, 0);
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

      // Check strictly if birthday is within the 10-day period (0 <= days <= 10 or isToday)
      if (isToday || (days >= 0 && days <= 10)) {
        const turningAge = targetDate.getFullYear() - year;
        const alertId = `bday_${st.id}_${targetDate.getFullYear()}`;
        
        let priority: 'TODAY' | 'CRITICAL' | 'UPCOMING' = 'UPCOMING';
        if (isToday) {
          priority = 'TODAY';
        } else if (days <= 3) {
          priority = 'CRITICAL';
        }

        alerts.push({
          id: alertId,
          student: st,
          className: st.className || 'Class',
          roll: st.roll || '০১',
          studentName: st.banglaName || st.name || 'শিক্ষার্থী',
          dobString: st.dob,
          birthDate,
          nextBirthday: targetDate,
          isToday,
          daysRemaining: days,
          hoursRemaining: hours,
          minutesRemaining: minutes,
          secondsRemaining: seconds,
          turningAge: turningAge > 0 ? turningAge : 0,
          priority,
          isDismissed: dismissedIds.includes(alertId)
        });
      }
    });

    // Sort: TODAY first, then by daysRemaining ascending
    return alerts.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      if (a.daysRemaining !== b.daysRemaining) return a.daysRemaining - b.daysRemaining;
      if (a.hoursRemaining !== b.hoursRemaining) return a.hoursRemaining - b.hoursRemaining;
      return a.minutesRemaining - b.minutesRemaining;
    });
  }, [students, now, dismissedIds]);

  // Active un-dismissed alerts
  const activeAlerts = useMemo(() => {
    return allBirthdayAlerts.filter(a => !a.isDismissed);
  }, [allBirthdayAlerts]);

  // Play chime for incoming alerts once
  const playAlertChime = () => {
    if (isSoundMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      
      const nowTime = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, nowTime); // D5
      osc.frequency.setValueAtTime(880.00, nowTime + 0.12); // A5
      osc.frequency.setValueAtTime(1174.66, nowTime + 0.25); // D6

      gain.gain.setValueAtTime(0.15, nowTime);
      gain.gain.exponentialRampToValueAtTime(0.001, nowTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(nowTime);
      osc.stop(nowTime + 0.6);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  useEffect(() => {
    if (activeAlerts.length > 0 && !hasPlayedInitialAlertChime.current && !isSoundMuted) {
      hasPlayedInitialAlertChime.current = true;
      playAlertChime();
    }
  }, [activeAlerts.length, isSoundMuted]);

  // Dismiss specific alert
  const handleDismissAlert = (alertId: string) => {
    setDismissedIds(prev => {
      const updated = [...prev, alertId];
      localStorage.setItem('delicon_admin_dismissed_birthday_alerts', JSON.stringify(updated));
      return updated;
    });
  };

  // Restore/re-show all alerts
  const handleRestoreAllAlerts = () => {
    setDismissedIds([]);
    localStorage.removeItem('delicon_admin_dismissed_birthday_alerts');
    setToastNotification('সকল জন্মদিন এলার্ট পুনরায় সক্রিয় করা হয়েছে।');
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Toggle sound mute
  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    localStorage.setItem('delicon_birthday_sound_muted', String(next));
  };

  // Prepare and open SMS Modal
  const handleOpenSmsModal = (alert: AdminBirthdayAlert) => {
    setSelectedAlertForSms(alert);
    const childTitle = `${alert.className} ক্লাসের রোল নং ${alert.roll} এ নাম ${alert.studentName}`;
    setSmsMessage(
      `সম্মানিত অভিভাবক, আসসালামু আলাইকুম। ${schoolName}-এর পক্ষ থেকে আপনার সন্তান ${alert.studentName} (${childTitle})-এর আসন্ন শুভ জন্মদিনে জানাই আন্তরিক উষ্ণ অভিনন্দন ও দোয়া। তার শারীরিক সুস্থতা ও উজ্জ্বল ভবিষ্যৎ কামনা করি। 🎂🎈`
    );
  };

  // Send SMS
  const handleSendSms = () => {
    if (!selectedAlertForSms) return;
    const phone = selectedAlertForSms.student.guardianPhone || selectedAlertForSms.student.fatherPhone || selectedAlertForSms.student.motherPhone || '০১৭xxxxxxxx';
    
    // Save to localStorage SMS log
    const savedLogs = localStorage.getItem('delicon_sms');
    const existing = savedLogs ? JSON.parse(savedLogs) : [];
    const newLog = {
      id: 'sms_bday_' + Date.now(),
      recipient: phone,
      recipientName: selectedAlertForSms.studentName,
      message: smsMessage,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      status: 'Sent',
      type: 'Birthday Automated Alert'
    };
    localStorage.setItem('delicon_sms', JSON.stringify([newLog, ...existing]));

    setToastNotification(`শুভেচ্ছা বার্তা সফলভাবে ${phone} নম্বরে প্রেরণ করা হয়েছে! 🎉`);
    setSelectedAlertForSms(null);
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Quick seed birthdays for test verification
  const handleSeedSampleBirthdays = () => {
    if (students.length === 0) return;

    const makeDob = (daysOffset: number, birthYear = 2015) => {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${birthYear}-${month}-${day}`;
    };

    if (students[0]) {
      updateStudent(students[0].id, {
        dob: makeDob(3, 2015),
        fatherDob: '1982-05-14',
        fatherBirthRegNo: '19822692518100123'
      });
    }

    if (students[1]) {
      updateStudent(students[1].id, {
        dob: makeDob(7, 2014),
        fatherDob: '1980-11-20',
        fatherBirthRegNo: '19802692518100789'
      });
    }

    if (students[2]) {
      updateStudent(students[2].id, {
        dob: makeDob(0, 2016),
        fatherDob: '1979-08-10',
        fatherBirthRegNo: '19792692518100555'
      });
    }

    setToastNotification('নমুনা জন্মদিন ডাটা সফলভাবে সেট হয়েছে! (আজ, ৩ দিন ও ৭ দিন পর)');
    setTimeout(() => setToastNotification(null), 3000);
  };

  // --------------------------------------------------------------------------
  // RENDER MODE: BELL DROPDOWN BUTTON (To place directly in Header)
  // --------------------------------------------------------------------------
  if (renderMode === 'bell_dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(prev => !prev)}
          className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer border ${
            activeAlerts.length > 0
              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 ring-2 ring-rose-400/30'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="শিক্ষার্থী জন্মদিন অটোমেটেড নোটিফিকেশন"
        >
          <Bell className={`h-4 w-4 ${activeAlerts.length > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`} />
          <span>জন্মদিন এলার্ট</span>
          {activeAlerts.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 text-white font-mono text-[10px] font-black px-1 animate-pulse">
              {toBanglaDigits(activeAlerts.length)}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-scale-up">
            <div className="p-3.5 bg-gradient-to-r from-rose-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cake className="h-4 w-4 text-amber-300" />
                <span className="font-black text-xs">আসন্ন ১০ দিনের জন্মদিন এলার্ট</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSound}
                  className="text-white/80 hover:text-white p-1 rounded transition"
                  title={isSoundMuted ? 'সাউন্ড আনমিউট করুন' : 'সাউন্ড মিউট করুন'}
                >
                  {isSoundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-3 space-y-2.5">
              {activeAlerts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  <p>বর্তমানে কোনো অপর্যালোচিত জন্মদিন সতর্কতা নেই।</p>
                  {allBirthdayAlerts.length > 0 && (
                    <button
                      onClick={handleRestoreAllAlerts}
                      className="mt-2 text-rose-600 font-bold hover:underline"
                    >
                      রিড করা এলার্টগুলো পুনরায় দেখুন
                    </button>
                  )}
                </div>
              ) : (
                activeAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-xl border text-xs transition ${
                      alert.isToday
                        ? 'bg-amber-50 border-amber-300'
                        : alert.priority === 'CRITICAL'
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-black text-slate-900 leading-tight">
                        <span className="text-blue-900">{alert.className}</span>, রোল: <span className="font-mono text-purple-900">{toBanglaDigits(alert.roll)}</span>
                        <div className="text-rose-950 font-bold">{alert.studentName}</div>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                        alert.isToday 
                          ? 'bg-amber-400 text-blue-950' 
                          : 'bg-rose-600 text-white'
                      }`}>
                        {alert.isToday ? 'আজকে' : `${toBanglaDigits(alert.daysRemaining)} দিন`}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-600 font-mono mt-1">
                      {alert.isToday ? (
                        <span className="text-emerald-700 font-bold">🎉 আজ শুভ জন্মদিন!</span>
                      ) : (
                        <span>কাউন্টডাউন: {toBanglaDigits(alert.daysRemaining)} দিন {toBanglaDigits(alert.hoursRemaining)} ঘণ্টা বাকি</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-slate-200/60">
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                      >
                        ✓ রিড চিহ্নিত করুন
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleOpenSmsModal(alert);
                        }}
                        className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs cursor-pointer"
                      >
                        <Send className="h-2.5 w-2.5" />
                        <span>শুভেচ্ছা এসএমএস</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {onNavigateToTab && (
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigateToTab('birthdays');
                  }}
                  className="text-xs font-bold text-blue-900 hover:underline flex items-center justify-center gap-1 w-full"
                >
                  <span>সম্পূর্ণ জন্মদিন কাউন্টডাউন প্যানেল দেখুন</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER MODE: FULL BANNER / IN-APP ALERT NOTIFICATION CENTER
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Toast Alert Feedback */}
      {toastNotification && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between gap-2 text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{toastNotification}</span>
          </div>
          <button onClick={() => setToastNotification(null)} className="text-white/80 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Alert Banner */}
      <div className={`rounded-2xl border transition-all overflow-hidden shadow-sm ${
        activeAlerts.length > 0 
          ? 'bg-gradient-to-r from-rose-50 via-amber-50/50 to-indigo-50/40 border-rose-300 ring-1 ring-rose-400/40' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-3">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
                activeAlerts.length > 0 
                  ? 'bg-gradient-to-tr from-rose-600 to-amber-500 animate-pulse' 
                  : 'bg-slate-800'
              }`}>
                {activeAlerts.length > 0 ? <Cake className="h-6 w-6" /> : <Bell className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                    <span>🚨 শিক্ষার্থী জন্মদিন ইন-অ্যাপ এলার্ট ও রিমাইন্ডার সিস্টেম</span>
                  </h3>
                  {activeAlerts.length > 0 ? (
                    <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                      {toBanglaDigits(activeAlerts.length)}টি সক্রিয় কাউন্টডাউন
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      সব সতর্কতা ক্লিয়ার
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  শিক্ষার্থীদের জন্ম তারিখের ওপর ভিত্তি করে ঠিক ১০ দিন আগে থেকে অ্যাডমিন ড্যাশবোর্ডে স্বয়ংক্রিয় এলার্ট ও কাউন্টডাউন ঘড়ি প্রদর্শিত হয়।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isSoundMuted 
                    ? 'bg-slate-100 text-slate-600 border-slate-200' 
                    : 'bg-white text-rose-700 border-rose-200 shadow-xs'
                }`}
                title={isSoundMuted ? 'সাউন্ড সক্রিয় করুন' : 'সাউন্ড বন্ধ করুন'}
              >
                {isSoundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-rose-600" />}
                <span>{isSoundMuted ? 'মিউট' : 'সাউন্ড অন'}</span>
              </button>

              {allBirthdayAlerts.some(a => a.isDismissed) && (
                <button
                  onClick={handleRestoreAllAlerts}
                  className="text-xs text-blue-900 font-bold hover:underline cursor-pointer px-2 py-1"
                >
                  সকল রিড এলার্ট দেখান
                </button>
              )}

              {allBirthdayAlerts.length === 0 && (
                <button
                  onClick={handleSeedSampleBirthdays}
                  className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-black px-3 py-1.5 rounded-xl text-xs transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>নমুনা জন্মদিন সেট করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Alerts List */}
          {activeAlerts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">বর্তমানে আগামী ১০ দিনের মধ্যে কোনো নতুন অপর্যালোচিত জন্মদিন সতর্কতা নেই।</p>
              <p className="text-[11px] text-slate-400">নতুন শিক্ষার্থীর জন্ম তারিখ যুক্ত হলে বা ১০ দিনের সময়সীমার মধ্যে প্রবেশ করলে স্বয়ংক্রিয়ভাবে নোটিফিকেশন আসবে।</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between shadow-xs transition ${
                    alert.isToday
                      ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-400/50'
                      : alert.priority === 'CRITICAL'
                      ? 'bg-rose-50/90 border-rose-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="min-w-0 pr-1">
                        {/* Requirement format: অমুক ক্লাসের রোল নং এ নাম অমুক */}
                        <div className="text-xs font-black text-slate-900 leading-tight">
                          <span className="text-blue-900 font-bold bg-blue-100/60 px-1 rounded">
                            {alert.className}
                          </span>
                          {' '}ক্লাসের রোল নং{' '}
                          <span className="font-mono text-purple-900 font-extrabold bg-purple-100/60 px-1 rounded">
                            {toBanglaDigits(alert.roll)}
                          </span>
                          {' '}এ নাম{' '}
                          <span className="text-rose-950 font-black">
                            {alert.studentName}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          📅 {toBanglaDigits(alert.nextBirthday.getDate())} {bnMonths[alert.nextBirthday.getMonth()]} ({toBanglaDigits(alert.turningAge)} বছর পূর্ণ হবে)
                        </div>
                      </div>

                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 uppercase ${
                        alert.isToday 
                          ? 'bg-amber-400 text-blue-950 animate-bounce' 
                          : alert.priority === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-900 text-white'
                      }`}>
                        {alert.isToday ? '🎉 আজ জন্মদিন' : `আর ${toBanglaDigits(alert.daysRemaining)} দিন`}
                      </span>
                    </div>

                    {/* Live Countdown Display Box */}
                    <div className="p-2 rounded-lg bg-slate-900 text-white my-2 flex items-center justify-between font-mono text-xs">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 font-sans">
                        <Clock className="h-3 w-3" />
                        <span>কাউন্টডাউন:</span>
                      </span>
                      {alert.isToday ? (
                        <span className="text-amber-400 font-black animate-pulse font-sans">
                          আজকের শুভ দিন! 🎂
                        </span>
                      ) : (
                        <span className="font-black text-cyan-300">
                          {toBanglaDigits(alert.daysRemaining)} দিন {toBanglaDigits(alert.hoursRemaining)} ঘণ্টা {toBanglaDigits(alert.minutesRemaining)} মি. {toBanglaDigits(alert.secondsRemaining)} সে.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-200/80 text-xs">
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer flex items-center gap-1"
                      title="এই সতর্কতাটি অ্যাডমিন ড্যাশবোর্ডে রিড হিসেবে লুকান"
                    >
                      <CheckCheck className="h-3 w-3 text-slate-400" />
                      <span>মার্ক রিড</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedAlertForCard(alert)}
                        className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                      >
                        <Gift className="h-3 w-3" />
                        <span>কার্ড</span>
                      </button>
                      <button
                        onClick={() => handleOpenSmsModal(alert)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Send className="h-3 w-3" />
                        <span>এসএমএস পাঠান</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* POPUP 1: Birthday Card Modal */}
      {selectedAlertForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-4 border-amber-300 relative animate-scale-up">
            <button
              onClick={() => setSelectedAlertForCard(null)}
              className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-md cursor-pointer transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-950 p-6 text-center text-white">
              <div className="text-3xl mb-1">🎉 🎂 🎈</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                {schoolName} — অ্যাডমিন বার্তা
              </span>
              <h3 className="text-2xl font-black mt-2 text-white">শুভ জন্মদিন!</h3>
              <p className="text-[11px] text-slate-200">Official Birthday Greeting</p>
            </div>

            <div className="p-6 text-center space-y-4 bg-gradient-to-b from-white to-amber-50/40">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-1 mx-auto shadow-md">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-2xl font-black text-rose-600">
                  {selectedAlertForCard.studentName.charAt(0) || '🎂'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  শিক্ষার্থীর পূর্ণ বিবরণ
                </span>
                <h4 className="text-lg font-black text-blue-950">
                  {selectedAlertForCard.studentName}
                </h4>
                <div className="text-xs font-bold text-slate-700 mt-0.5">
                  {selectedAlertForCard.className} ক্লাসের রোল নং <span className="font-mono text-rose-700">{toBanglaDigits(selectedAlertForCard.roll)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-700 leading-relaxed italic">
                &ldquo;আমাদের প্রিয় শিক্ষার্থী <span className="font-bold text-blue-950">{selectedAlertForCard.studentName}</span>-এর জন্মদিনে জানাই উষ্ণ শুভেচ্ছা ও দোয়ার ডালি। তোমার জীবন হোক আলোকোজ্জ্বল ও সফল।&rdquo;
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
                <span className="font-mono font-bold text-slate-700">
                  তারিখ: {toBanglaDigits(selectedAlertForCard.nextBirthday.getDate())} {bnMonths[selectedAlertForCard.nextBirthday.getMonth()]}, {toBanglaDigits(selectedAlertForCard.nextBirthday.getFullYear())}
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
                    const alert = selectedAlertForCard;
                    setSelectedAlertForCard(null);
                    handleOpenSmsModal(alert);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  এসএমএস পাঠান
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: Automated Birthday SMS Gateway */}
      {selectedAlertForSms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            <div className="bg-gradient-to-r from-rose-600 to-indigo-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-amber-300" />
                <h4 className="font-black text-sm">স্বয়ংক্রিয় জন্মদিনের শুভেচ্ছা এসএমএস</h4>
              </div>
              <button
                onClick={() => setSelectedAlertForSms(null)}
                className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">প্রাপক শিক্ষার্থী:</span>
                  <span className="font-bold text-slate-800">
                    {selectedAlertForSms.studentName} ({selectedAlertForSms.className}, রোল: {toBanglaDigits(selectedAlertForSms.roll)})
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-500">অভিভাবকের মোবাইল:</span>
                  <span className="font-mono font-bold text-blue-900">
                    {selectedAlertForSms.student.guardianPhone || selectedAlertForSms.student.fatherPhone || selectedAlertForSms.student.motherPhone || '০১৭xxxxxxxx'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  এসএমএস মেসেজ টেক্সট:
                </label>
                <textarea
                  rows={4}
                  value={smsMessage}
                  onChange={e => setSmsMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-blue-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setSelectedAlertForSms(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSendSms}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
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
