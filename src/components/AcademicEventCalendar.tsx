/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { AcademicEvent } from '../types';
import { 
  Calendar as CalendarIcon, Plus, Edit3, Trash2, CalendarDays, 
  ChevronLeft, ChevronRight, Filter, AlertCircle, CheckCircle, 
  Clock, MapPin, Sparkles, Tag, Users, Info, X
} from 'lucide-react';

interface AcademicEventCalendarProps {
  role: string;
}

export const AcademicEventCalendar: React.FC<AcademicEventCalendarProps> = ({ role }) => {
  const { 
    academicEvents, 
    addAcademicEvent, 
    editAcademicEvent, 
    deleteAcademicEvent 
  } = useSchool();

  const isAdmin = role === 'Admin' || role === 'Developer' || role === 'Creator';

  // State for visual calendar months & years
  // Default to June 2026 (based on local timeline of application)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // 0-indexed, so 5 is June
  const [selectedDay, setSelectedDay] = useState<number | null>(17); // 17th of June
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Admin Form States
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState<string>('');
  const [formBanglaTitle, setFormBanglaTitle] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('2026-06-17');
  const [formEndDate, setFormEndDate] = useState<string>('');
  const [formCategory, setFormCategory] = useState<AcademicEvent['category']>('Event');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formBanglaDescription, setFormBanglaDescription] = useState<string>('');
  const [formClassName, setFormClassName] = useState<string>('All Classes');
  const [formIsHoliday, setFormIsHoliday] = useState<boolean>(false);

  // Calendar translation dictionary
  const monthsBng = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  const monthsEng = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysBng = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

  // Total days count in current selected month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  // Day of the week for the 1st day of the current selected month
  const startDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  // Navigate next / prev months
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  // Check category styling presets
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Holiday':
        return { 
          bg: 'bg-rose-50 text-rose-700 border-rose-200', 
          dot: 'bg-rose-600',
          label: 'ছুটি (Holiday)'
        };
      case 'Exam':
        return { 
          bg: 'bg-amber-50 text-amber-800 border-amber-250', 
          dot: 'bg-amber-500',
          label: 'পরীক্ষা (Exam)'
        };
      case 'Event':
        return { 
          bg: 'bg-blue-50 text-blue-800 border-blue-200', 
          dot: 'bg-blue-700',
          label: 'অনুষ্ঠান (Event)'
        };
      default:
        return { 
          bg: 'bg-slate-100 text-slate-700 border-slate-200', 
          dot: 'bg-slate-500',
          label: 'অন্যান্য (Other)'
        };
    }
  };

  // Helper checking if a date falls in range
  const isDateInRange = (dateStr: string, startRangeStr: string, endRangeStr?: string) => {
    const checkDate = new Date(dateStr);
    const startDate = new Date(startRangeStr);
    // Standardize comparison to midnight
    checkDate.setHours(0,0,0,0);
    startDate.setHours(0,0,0,0);

    if (endRangeStr) {
      const endDate = new Date(endRangeStr);
      endDate.setHours(0,0,0,0);
      return checkDate >= startDate && checkDate <= endDate;
    }
    return checkDate.getTime() === startDate.getTime();
  };

  // Get active events for a specific cell date
  const getDayEvents = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    // Zero-index adjustment
    const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    return academicEvents.filter(evt => {
      // Apply category filter if any
      if (filterCategory !== 'All' && evt.category !== filterCategory) return false;
      return isDateInRange(dateStr, evt.date, evt.endDate);
    });
  };

  // Events list filtered by month/category
  const visibleMonthEvents = useMemo(() => {
    return academicEvents.filter(evt => {
      if (filterCategory !== 'All' && evt.category !== filterCategory) return false;
      
      const evtStart = new Date(evt.date);
      const isStartInMonth = evtStart.getFullYear() === currentYear && evtStart.getMonth() === currentMonth;
      
      let isEndInMonth = false;
      if (evt.endDate) {
        const evtEnd = new Date(evt.endDate);
        isEndInMonth = evtEnd.getFullYear() === currentYear && evtEnd.getMonth() === currentMonth;
      }

      return isStartInMonth || isEndInMonth;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [academicEvents, currentYear, currentMonth, filterCategory]);

  // Selected Day active details list
  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    return getDayEvents(selectedDay);
  }, [selectedDay, academicEvents, currentMonth, currentYear, filterCategory]);

  // Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formBanglaTitle || !formDate) return;

    const eventPayload = {
      title: formTitle,
      banglaTitle: formBanglaTitle,
      date: formDate,
      endDate: formEndDate || undefined,
      category: formCategory,
      description: formDescription,
      banglaDescription: formBanglaDescription,
      className: formClassName,
      isHoliday: formIsHoliday
    };

    if (editingEventId) {
      editAcademicEvent(editingEventId, eventPayload);
    } else {
      addAcademicEvent(eventPayload);
    }

    // Reset Form
    resetForm();
  };

  const handleEditClick = (evt: AcademicEvent) => {
    setEditingEventId(evt.id);
    setFormTitle(evt.title);
    setFormBanglaTitle(evt.banglaTitle);
    setFormDate(evt.date);
    setFormEndDate(evt.endDate || '');
    setFormCategory(evt.category);
    setFormDescription(evt.description);
    setFormBanglaDescription(evt.banglaDescription);
    setFormClassName(evt.className || 'All Classes');
    setFormIsHoliday(evt.isHoliday);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingEventId(null);
    setFormTitle('');
    setFormBanglaTitle('');
    setFormDate('2026-06-17');
    setFormEndDate('');
    setFormCategory('Event');
    setFormDescription('');
    setFormBanglaDescription('');
    setFormClassName('All Classes');
    setFormIsHoliday(false);
    setShowAddForm(false);
  };

  return (
    <div id="academic-event-calendar" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-2 font-sans">
            <CalendarDays className="h-4.5 w-4.5 text-blue-900" />
            প্রাতিষ্ঠানিক একাডেমিক ডায়েরি ও ছুটির ক্যালেন্ডার
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-sans">
            ছুটি, পরীক্ষার তারিখ এবং গুরুত্বপূর্ণ মাদরাসা প্রাঙ্গণের ইভেন্ট পরিবীক্ষণ
          </p>
        </div>

        {/* Admin additions option */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => {
                if (showAddForm) resetForm();
                else setShowAddForm(true);
              }}
              className="bg-indigo-950 hover:bg-indigo-900 text-white text-[10px] font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5 text-amber-300" />
              {showAddForm ? 'ফর্ম বন্ধ করুন' : 'নতুন ইভেন্ট যুক্ত করুন'}
            </button>
          )}

          {/* Quick Categories Filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-black font-sans select-none">
            {['All', 'Holiday', 'Exam', 'Event'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-white text-indigo-950 shadow-2xs border border-slate-250'
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {cat === 'All' ? 'সব' : cat === 'Holiday' ? 'ছুটি' : cat === 'Exam' ? 'পরীক্ষা' : 'অনুষ্ঠান'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Operations Editor Forms Draw */}
      {isAdmin && showAddForm && (
        <form onSubmit={handleFormSubmit} className="bg-slate-50/70 p-5 rounded-2xl border border-dashed border-indigo-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2.5 mb-2 border-slate-200">
            <h4 className="text-[11px] font-extrabold text-blue-950 flex items-center gap-1 font-sans">
              <Sparkles className="h-3.5 w-3.5 text-blue-900" />
              {editingEventId ? 'একাডেমিক ইভেন্ট আপডেট সেশন' : 'নতুন একাডেমিক ইভেন্ট অন্তর্ভুক্তি'}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-650 cursor-pointer">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            
            {/* Title Eng */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 block">ইভেন্ট শিরোনাম (English)*</label>
              <input 
                type="text" 
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g., Midterm Evaluation"
                className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-blue-600 font-sans text-slate-800"
                required
              />
            </div>

            {/* Title Bng */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 block">ইভেন্ট শিরোনাম (Bangla)*</label>
              <input 
                type="text" 
                value={formBanglaTitle}
                onChange={e => setFormBanglaTitle(e.target.value)}
                placeholder="যেমন: অর্ধ-বার্ষিক পরীক্ষা"
                className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-blue-600 font-sans text-slate-800"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 block">ইভেন্ট ক্যাটাগরি</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as AcademicEvent['category'])}
                className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-blue-600 font-sans text-slate-800"
              >
                <option value="Event">অনুষ্ঠান (Event)</option>
                <option value="Holiday">ছুটি (Holiday)</option>
                <option value="Exam">পরীক্ষা (Exam)</option>
                <option value="Other">অন্যান্য (Other)</option>
              </select>
            </div>

            {/* Target Class */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 block">কার্যকর শ্রেনী (Target Class)</label>
              <input 
                type="text" 
                value={formClassName}
                onChange={e => setFormClassName(e.target.value)}
                placeholder="e.g. All Classes, Class 5, Class 3 etc."
                className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-blue-600 font-sans text-slate-800"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 block">শুরুর তারিখ (Start Date)*</label>
              <input 
                type="date" 
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-blue-600 font-mono text-slate-800"
                required
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 block">সমাপ্তির তারিখ (End Date) - ঐচ্ছিক</label>
              <input 
                type="date" 
                value={formEndDate}
                onChange={e => setFormEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-blue-600 font-mono text-slate-800"
              />
            </div>

            {/* Holiday Toggle */}
            <div className="sm:col-span-2 flex items-center gap-2 select-none py-1 h-10">
              <input 
                type="checkbox" 
                id="formIsHoliday"
                checked={formIsHoliday}
                onChange={e => setFormIsHoliday(e.target.checked)}
                className="h-4 w-4 text-indigo-900 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="formIsHoliday" className="font-bold text-slate-700 cursor-pointer">এই ইভেন্ট উপলক্ষে মাদরাসার সাধারণ ক্লাস বন্ধ থাকবে (Is Corporate Holiday)</label>
            </div>

            {/* Desc Eng */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-extrabold text-slate-700 block">বিস্তারিত বিবরণ (English)</label>
              <textarea 
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                rows={2}
                placeholder="Internal logistics or syllabus chapters etc."
                className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-blue-600 font-sans text-slate-800 resize-none"
              />
            </div>

            {/* Desc Bng */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-extrabold text-slate-700 block">বিস্তারিত বিবরণ (Bangla)</label>
              <textarea 
                value={formBanglaDescription}
                onChange={e => setFormBanglaDescription(e.target.value)}
                rows={2}
                placeholder="সিলেবাস নির্দেশক বা সতর্কবার্তা বিষয়ক বিবরণ..."
                className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-blue-600 font-sans text-slate-800 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3 border-slate-200/60">
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-1.5 border hover:bg-slate-50 text-[10.5px] font-bold rounded-lg cursor-pointer transition-all"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-[10.5px] px-4 py-1.5 rounded-lg cursor-pointer transition-all shadow-3xs"
            >
              {editingEventId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      )}

      {/* Bento Grid layout containing Monthly Grid & Side Event Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/30 p-2.5 sm:p-5 rounded-2xl border border-slate-100">
        
        {/* BLOCK 1: Dynamic Interactive Calendar Sandbox */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
          
          {/* Calendar Controller (Header Month Scroller) */}
          <div className="flex items-center justify-between">
            <button 
              onClick={handlePrevMonth}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 border border-slate-200 cursor-pointer text-slate-500 hover:text-slate-900 transition-all"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>

            <div className="text-center font-sans">
              <span className="text-xs font-black text-slate-900 tracking-wide uppercase block">
                {monthsBng[currentMonth]} {currentYear}
              </span>
              <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block mt-0.5">
                {monthsEng[currentMonth]} {currentYear}
              </span>
            </div>

            <button 
              onClick={handleNextMonth}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 border border-slate-200 cursor-pointer text-slate-500 hover:text-slate-900 transition-all"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Render Days table head */}
          <div className="grid grid-cols-7 text-center gap-1 text-[10px] font-black text-slate-400 font-sans border-b border-slate-100 pb-2">
            {daysBng.map((dayLabel, index) => (
              <div 
                key={index} 
                className={index === 5 ? 'text-rose-500' : ''} // highlights Friday standard rest day of madarasa
              >
                {dayLabel}
              </div>
            ))}
          </div>

          {/* Render Days Grid of current Month */}
          <div className="grid grid-cols-7 gap-1.5 text-xs font-sans">
            {/* Empty days offsets */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`offset-${i}`} className="aspect-square bg-slate-50/50 rounded-lg pointer-events-none" />
            ))}

            {/* Real Calendar Active Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const cellEvents = getDayEvents(day);
              const hasEvents = cellEvents.length > 0;
              const isSelected = selectedDay === day;
              
              // Standard Friday Highlight for Rest Day
              const isFriday = (startDayOfWeek + day - 1) % 7 === 5;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-lg flex flex-col justify-between items-center p-1.5 border relative cursor-pointer group transition-all ${
                    isSelected 
                      ? 'bg-indigo-950 text-white border-indigo-950 ring-2 ring-indigo-950/20 shadow-xs scale-102' 
                      : isFriday 
                      ? 'bg-rose-50/20 text-rose-600 hover:bg-slate-100/80 border-slate-150'
                      : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Day scalar */}
                  <span className={`font-mono text-[11px] font-black leading-none ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {day < 10 ? '0' + day : day}
                  </span>

                  {/* Bullet Event Track indicators */}
                  <div className="flex gap-1 items-center justify-center min-h-[5px] w-full mt-1 flex-wrap">
                    {cellEvents.slice(0, 3).map((evt, idx) => {
                      const colors = getCategoryStyles(evt.category);
                      return (
                        <span 
                          key={idx} 
                          className={`h-1 cursor-pointer w-1 rounded-full ${isSelected ? 'bg-amber-400' : colors.dot}`} 
                          title={`${evt.banglaTitle}`} 
                        />
                      );
                    })}
                    {cellEvents.length > 3 && (
                      <span className="text-[6.5px] scale-80 font-black leading-none text-indigo-950 block">+</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* BLOCK 2: Side Event Panel details tracker  */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Headline selected date logs */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-3.5 min-h-[160px]">
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <div>
                <h4 className="text-[11px] font-extrabold text-indigo-950 uppercase font-sans tracking-wide">
                  {selectedDay ? `${monthsBng[currentMonth]} ${selectedDay} তারিখের ইভেন্ট তালিকা` : 'নির্দিষ্ট তারিখের তথ্য বিবরণী'}
                </h4>
                <p className="text-[8px] text-slate-400 font-mono font-bold mt-0.5">
                  {selectedDay ? `${monthsEng[currentMonth]} ${selectedDay}, ${currentYear}` : 'ক্যালেন্ডারে যেকোনো তারিখে ক্লিক করুন'}
                </p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <Info className="h-6 w-6 text-slate-300 mx-auto" />
                <p className="text-[10px] text-slate-400 leading-normal font-sans">
                  {selectedDay 
                    ? `উক্ত তারিখে আমাদের সাধারণ ছুটি বা পরীক্ষার কোনো ইভেন্ট তালিকাভুক্ত নেই।`
                    : `বামপাশের ক্যালেন্ডার গ্রিডে ক্লিক করে গুরুত্বপূর্ণ দিন ও ট্র্যাকিং ইভেন্ট লক্ষ্য করুন।`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents.map((evt) => {
                  const styles = getCategoryStyles(evt.category);

                  return (
                    <div 
                      key={evt.id} 
                      className={`p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 relative group`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded ${styles.bg} border border-slate-200/50`}>
                            {styles.label}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-xs mt-1.5 BanglaName tracking-wide leading-snug">
                            {evt.banglaTitle}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-tight">
                            {evt.title}
                          </p>
                        </div>

                        {/* Admin actions inside listed elements */}
                        {isAdmin && (
                          <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditClick(evt)}
                              className="h-6 w-6 rounded bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-900 transition-all cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteAcademicEvent(evt.id)}
                              className="h-6 w-6 rounded bg-white hover:bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 transition-all cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Info cards meta parameters */}
                      <div className="space-y-1.5 text-[9.5px]">
                        <p className="text-slate-550 leading-relaxed font-sans pt-0.5">
                          {evt.banglaDescription || evt.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/40 text-[8.5px] font-bold font-sans">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Users className="h-3 w-3 text-indigo-900 shrink-0" />
                            শ্রেণী: {evt.className || 'সকল শ্রেনী'}
                          </span>
                          {evt.isHoliday && (
                            <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-1 rounded border border-rose-100">
                              <Info className="h-2.5 w-2.5 shrink-0" />
                              ক্লাস বন্ধ থাকবে
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline View of entire Month */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-3.5">
            <h4 className="text-[11px] font-extrabold text-blue-900 tracking-wider uppercase font-sans border-b pb-2 mb-2">
              চলতি মাসের পূর্ণাঙ্গ নির্ঘণ্ট ({monthsBng[currentMonth]} মাসের ইভেন্ট)
            </h4>

            {visibleMonthEvents.length === 0 ? (
              <p className="text-[10px] text-slate-400 text-center py-4 font-sans">
                এই মাসে সামগ্রিকভাবে কোনো একাডেমিক ইভেন্ট সংরক্ষিত নেই।
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {visibleMonthEvents.map((evt) => {
                  const styleData = getCategoryStyles(evt.category);
                  const isCurrentDay = selectedDay && isDateInRange(`${currentYear}-${currentMonth + 1 < 10 ? '0' + (currentMonth + 1) : currentMonth + 1}-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`, evt.date, evt.endDate);

                  return (
                    <button
                      key={evt.id}
                      onClick={() => {
                        const evtDay = new Date(evt.date).getDate();
                        setSelectedDay(evtDay);
                      }}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex gap-2 justify-between items-center ${
                        isCurrentDay 
                          ? 'border-indigo-900 bg-slate-50 ring-1 ring-indigo-900/10'
                          : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex gap-2 items-center min-w-0">
                        {/* Dot indicator */}
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${styleData.dot}`} />
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-slate-800 text-[11px] truncate leading-tight tracking-wide">{evt.banglaTitle}</h5>
                          <p className="text-[8px] text-slate-400 font-mono tracking-tight uppercase truncate mt-0.5">{evt.title}</p>
                        </div>
                      </div>

                      {/* Date bounds */}
                      <span className="text-[8.5px] font-mono font-bold bg-slate-150 px-1.5 py-0.5 rounded shrink-0 text-slate-650">
                        {evt.date.substring(5)} {evt.endDate ? `to ${evt.endDate.substring(5)}` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
