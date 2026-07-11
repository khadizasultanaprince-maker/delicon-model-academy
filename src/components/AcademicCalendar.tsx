/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { AcademicEvent } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  Sparkles, 
  Clock, 
  MapPin, 
  Tag, 
  Users, 
  Info, 
  X, 
  CalendarDays, 
  AlertTriangle,
  FileText,
  BookmarkCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface AcademicCalendarProps {
  role?: string;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ role = 'Admin' }) => {
  const { 
    academicEvents, 
    addAcademicEvent, 
    editAcademicEvent, 
    deleteAcademicEvent 
  } = useSchool();

  // User checking - Admin, Developer, and Teacher can manage events
  const canManageEvents = ['Admin', 'Developer', 'Teacher', 'Creator'].includes(role);

  // Active dates
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form States for CRUD operations
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  const [formTitle, setFormTitle] = useState<string>('');
  const [formBanglaTitle, setFormBanglaTitle] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(today.toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState<string>('');
  const [formCategory, setFormCategory] = useState<AcademicEvent['category']>('Event');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formBanglaDescription, setFormBanglaDescription] = useState<string>('');
  const [formClassName, setFormClassName] = useState<string>('All Classes');
  const [formIsHoliday, setFormIsHoliday] = useState<boolean>(false);
  
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  // Localization utilities for Bangla translation
  const monthsBng = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  const monthsEng = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysBng = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  const daysEng = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Convert English numbers to Bangla numbers
  const toBanglaNumber = (num: number | string): string => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (digit) => banglaDigits[parseInt(digit)]);
  };

  // Days in month calculation
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  // First day of week index
  const startDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  // Navigate to Next/Prev month
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

  // Styles per Category mapping
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Holiday':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/50',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          accent: 'border-l-4 border-l-rose-500',
          label: 'ছুটি (Holiday)'
        };
      case 'Exam':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/50',
          badge: 'bg-amber-100 text-amber-900 border-amber-250',
          dot: 'bg-amber-500',
          accent: 'border-l-4 border-l-amber-500',
          label: 'পরীক্ষা (Exam)'
        };
      case 'Event':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/50',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          dot: 'bg-blue-600',
          accent: 'border-l-4 border-l-blue-600',
          label: 'অনুষ্ঠান (Event)'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100/50',
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-400',
          accent: 'border-l-4 border-l-slate-400',
          label: 'অন্যান্য (Other)'
        };
    }
  };

  // Check if target date string is in date-range (inclusive)
  const isDateInRange = (dateStr: string, startRange: string, endRange?: string) => {
    const target = new Date(dateStr);
    const start = new Date(startRange);
    target.setHours(0,0,0,0);
    start.setHours(0,0,0,0);

    if (endRange) {
      const end = new Date(endRange);
      end.setHours(0,0,0,0);
      return target >= start && target <= end;
    }
    return target.getTime() === start.getTime();
  };

  // Fetch events for a specific day cell
  const getDayEvents = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    return academicEvents.filter(evt => {
      // Category filter
      if (filterCategory !== 'All' && evt.category !== filterCategory) return false;
      
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(query) || evt.banglaTitle.includes(query);
        const matchDesc = evt.description.toLowerCase().includes(query) || evt.banglaDescription.includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      return isDateInRange(dateStr, evt.date, evt.endDate);
    });
  };

  // Month-wide events filter
  const monthEvents = useMemo(() => {
    return academicEvents.filter(evt => {
      if (filterCategory !== 'All' && evt.category !== filterCategory) return false;
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(query) || evt.banglaTitle.includes(query);
        const matchDesc = evt.description.toLowerCase().includes(query) || evt.banglaDescription.includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      const evtStart = new Date(evt.date);
      const isStartInMonth = evtStart.getFullYear() === currentYear && evtStart.getMonth() === currentMonth;

      let isEndInMonth = false;
      if (evt.endDate) {
        const evtEnd = new Date(evt.endDate);
        isEndInMonth = evtEnd.getFullYear() === currentYear && evtEnd.getMonth() === currentMonth;
      }

      return isStartInMonth || isEndInMonth;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [academicEvents, currentYear, currentMonth, filterCategory, searchQuery]);

  // Selected Day events
  const selectedDayEventsList = useMemo(() => {
    if (selectedDay === null) return [];
    return getDayEvents(selectedDay);
  }, [selectedDay, academicEvents, currentYear, currentMonth, filterCategory, searchQuery]);

  // Form Reset
  const handleResetForm = () => {
    setEditingEventId(null);
    setFormTitle('');
    setFormBanglaTitle('');
    setFormDate(today.toISOString().split('T')[0]);
    setFormEndDate('');
    setFormCategory('Event');
    setFormDescription('');
    setFormBanglaDescription('');
    setFormClassName('All Classes');
    setFormIsHoliday(false);
    setFormError('');
    setShowForm(false);
  };

  // Submit Handler (Add/Edit)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!formTitle.trim()) {
      setFormError('English title is required.');
      return;
    }
    if (!formBanglaTitle.trim()) {
      setFormError('বাংলা শিরোনাম আবশ্যক।');
      return;
    }
    if (!formDate) {
      setFormError('শুরুর তারিখ আবশ্যক।');
      return;
    }

    const eventData = {
      title: formTitle.trim(),
      banglaTitle: formBanglaTitle.trim(),
      date: formDate,
      endDate: formEndDate ? formEndDate : undefined,
      category: formCategory,
      description: formDescription.trim(),
      banglaDescription: formBanglaDescription.trim(),
      className: formClassName.trim() || 'All Classes',
      isHoliday: formIsHoliday
    };

    try {
      if (editingEventId) {
        editAcademicEvent(editingEventId, eventData);
        setFormSuccess(true);
      } else {
        addAcademicEvent(eventData);
        setFormSuccess(true);
      }

      setTimeout(() => {
        handleResetForm();
        setFormSuccess(false);
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving event.');
    }
  };

  // Trigger Edit Form
  const handleEditInit = (evt: AcademicEvent) => {
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
    setShowForm(true);
    setFormError('');
  };

  return (
    <div id="central-academic-calendar" className="bg-slate-50/50 p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-left">
      
      {/* Title & Info Control Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-sans tracking-tight">
            <CalendarIcon className="h-5.5 w-5.5 text-indigo-700 animate-pulse shrink-0" />
            একাডেমিক ক্যালেন্ডার ও ডায়েরি স্টেশন 📅
          </h2>
          <p className="text-[11px] font-medium text-slate-500 leading-normal font-sans max-w-xl">
            মাদরাসার ছুটির দিনসমূহ, বোর্ড বা মূল্যায়ন পরীক্ষা এবং বার্ষিক ক্রীড়া বা সাংস্কৃতিক উৎসবের পূর্ণাঙ্গ তফসিল ট্র্যাকার। রিয়েল-টাইম ডাটাবেজের সাথে সরাসরি সমন্বিত।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {canManageEvents && (
            <button
              onClick={() => {
                if (showForm) handleResetForm();
                else setShowForm(true);
              }}
              className="bg-indigo-950 hover:bg-indigo-900 text-white font-black text-[10px] sm:text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="h-4 w-4 text-amber-300 shrink-0" />
              {showForm ? 'ফর্ম বন্ধ করুন ✕' : 'নতুন ইভেন্ট যুক্ত করুন 🚀'}
            </button>
          )}

          <div className="text-[10px] bg-slate-100 border border-slate-200 rounded-lg p-0.5 font-bold flex select-none">
            {['All', 'Holiday', 'Exam', 'Event'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                  filterCategory === cat
                    ? 'bg-white text-indigo-950 border border-slate-250 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat === 'All' ? 'সব' : cat === 'Holiday' ? 'ছুটি' : cat === 'Exam' ? 'পরীক্ষা' : 'অনুষ্ঠান'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS MINI RAIL */}
      <div className="bg-white p-3.5 border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:flex-1">
          <input
            type="text"
            placeholder="ইভেন্ট বা ছুটির নাম দিয়ে সার্চ করুন (যেমন: ঈদ, পরীক্ষা, স্বাধীনতা দিবস)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all font-sans text-slate-800"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-650 font-black cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 shrink-0 select-none">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span>মোট {toBanglaNumber(monthEvents.length)} টি ইভেন্ট ফিল্টারড</span>
        </div>
      </div>

      {/* CRUD MANAGEMENT FORM CONTAINER */}
      {canManageEvents && showForm && (
        <form onSubmit={handleFormSubmit} className="bg-gradient-to-br from-indigo-50/30 via-white to-white border border-dashed border-indigo-200 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
          <div className="flex justify-between items-center border-b border-indigo-100 pb-3 mb-2">
            <h4 className="font-extrabold text-indigo-950 text-xs sm:text-sm flex items-center gap-2 font-sans">
              <Sparkles className="h-4.5 w-4.5 text-indigo-650 animate-pulse" />
              {editingEventId ? 'সাংস্কৃতিক/একাডেমিক ইভেন্ট সংশোধন করুন 🛠' : 'নতুন প্রাতিষ্ঠানিক ইভেন্ট যুক্তকরণ ডেক 📝'}
            </h4>
            <button
              type="button"
              onClick={handleResetForm}
              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
            
            {/* Title Eng */}
            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-600 block">ইভেন্ট শিরোনাম (English)*</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Independence Day Special Program"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-850 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
                required
              />
            </div>

            {/* Title Bangla */}
            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-600 block">ইভেন্ট শিরোনাম (বাংলা)*</label>
              <input
                type="text"
                value={formBanglaTitle}
                onChange={(e) => setFormBanglaTitle(e.target.value)}
                placeholder="যেমন: স্বাধীনতা দিবসের বিশেষ আলোচনা সভা"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-850 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
                required
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-600 block">ইভেন্ট ক্যাটাগরি বা ধরণ*</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as AcademicEvent['category'])}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-850 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
              >
                <option value="Event">উৎসব ও অনুষ্ঠান (Event)</option>
                <option value="Holiday">মাদরাসা সাধারণ ছুটি (Holiday)</option>
                <option value="Exam">পরীক্ষা ও মূল্যায়ন (Exam)</option>
                <option value="Other">অন্যান্য প্রয়োজনীয় ইভেন্ট (Other)</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-600 block">কার্যকর বা শুরুর তারিখ*</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold font-mono"
                required
              />
            </div>

            {/* End Date */}
            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-600 block">সমাপ্তির তারিখ (ঐচ্ছিক - একাধিক দিন হলে)</label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold font-mono"
              />
            </div>

            {/* Class Name target */}
            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-600 block">কার্যকর শ্রেণী (Target Class)</label>
              <input
                type="text"
                value={formClassName}
                onChange={(e) => setFormClassName(e.target.value)}
                placeholder="যেমন: All Classes, Class 5, Class 8"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-850 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
              />
            </div>

            {/* General Corporate Holiday Toggle */}
            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 select-none py-1 border border-slate-200/50 bg-slate-50 p-2.5 rounded-xl">
              <input
                type="checkbox"
                id="calFormIsHoliday"
                checked={formIsHoliday}
                onChange={(e) => setFormIsHoliday(e.target.checked)}
                className="h-4 w-4 text-indigo-900 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="calFormIsHoliday" className="font-bold text-slate-700 cursor-pointer text-[10.5px]">
                এই ইভেন্ট বা ছুটির দিনে মাদরাসার নিয়মিত সমস্ত ক্লাস বন্ধ থাকবে (Is Madrasah Official Holiday)
              </label>
            </div>

            {/* Description English */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-3 text-left">
              <label className="font-bold text-slate-600 block">ইভেন্ট বিবরণ বা সিলেবাস নোটিশ (English)</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                placeholder="Detail guidelines, materials needed, specific instructions for students..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 resize-none font-sans"
              />
            </div>

            {/* Description Bangla */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-3 text-left">
              <label className="font-bold text-slate-600 block">ইভেন্ট বিবরণ বা সিলেবাস নোটিশ (বাংলা)</label>
              <textarea
                value={formBanglaDescription}
                onChange={(e) => setFormBanglaDescription(e.target.value)}
                rows={2}
                placeholder="সিলেবাস নোটিশ, নির্দিষ্ট নির্দেশনা, শিক্ষার্থীদের অভিভাবক নোটিশ কিংবা অন্যান্য তথ্য..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 resize-none font-sans"
              />
            </div>
          </div>

          {formError && (
            <p className="text-[10.5px] font-bold text-rose-600 bg-rose-50 px-3 py-2.5 rounded-xl border border-rose-250 flex items-center gap-1.5 font-sans">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>⚠ {formError}</span>
            </p>
          )}

          {formSuccess && (
            <p className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-250 flex items-center gap-1.5 font-sans animate-pulse">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>🎉 ইভেন্টটি সফলভাবে মাদরাসা ডাটাবেজে হালনাগাদ করা হয়েছে!</span>
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 border hover:bg-slate-50 text-[11px] font-black rounded-xl cursor-pointer transition-all font-sans"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              className="bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-[11px] px-5 py-2 rounded-xl cursor-pointer shadow-sm transition-all font-sans"
            >
              {editingEventId ? 'ইভেন্ট আপডেট নিশ্চিত করুন 💾' : 'নতুন ইভেন্ট সংরক্ষণ করুন 🚀'}
            </button>
          </div>
        </form>
      )}

      {/* BENTO LAYOUT BOXES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-3 sm:p-5 rounded-3xl border border-slate-200 shadow-3xs">
        
        {/* BLOCK 1: Dynamic Monthly Calendar Grid */}
        <div className="lg:col-span-7 bg-white space-y-5">
          
          {/* Calendar month selector header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              onClick={handlePrevMonth}
              className="h-9 w-9 border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-center cursor-pointer text-slate-500 hover:text-indigo-950 transition-all shadow-3xs"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <h3 className="text-sm font-black text-slate-900 font-sans tracking-wide">
                {monthsBng[currentMonth]} {toBanglaNumber(currentYear)} খ্রিঃ
              </h3>
              <p className="text-[9px] font-bold text-slate-400 font-mono tracking-widest uppercase mt-0.5">
                {monthsEng[currentMonth]} {currentYear}
              </p>
            </div>

            <button
              onClick={handleNextMonth}
              className="h-9 w-9 border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-center cursor-pointer text-slate-500 hover:text-indigo-950 transition-all shadow-3xs"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Days Grid Headings */}
          <div className="grid grid-cols-7 text-center gap-1.5 text-[10.5px] font-black text-slate-400 font-sans select-none border-b border-slate-100 pb-2.5">
            {daysBng.map((dayLabel, index) => (
              <div
                key={index}
                className={index === 5 ? 'text-rose-600 font-black' : 'text-slate-400'}
              >
                {dayLabel}
              </div>
            ))}
          </div>

          {/* Days Grid Items */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-xs font-sans">
            {/* Empty Offset cells */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`cal-offset-${i}`} className="aspect-square bg-slate-50/40 border border-transparent rounded-xl pointer-events-none" />
            ))}

            {/* Days active cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const cellEvents = getDayEvents(day);
              const isSelected = selectedDay === day;
              
              // Standard Friday Highlight (Rest Day)
              const isFriday = (startDayOfWeek + day - 1) % 7 === 5;

              return (
                <button
                  key={`cal-day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-xl border p-1.5 flex flex-col justify-between items-center relative cursor-pointer group transition-all ${
                    isSelected
                      ? 'bg-indigo-950 border-indigo-950 text-white ring-2 ring-indigo-950/15 shadow-sm scale-102'
                      : isFriday
                      ? 'bg-rose-50/30 border-rose-100 hover:bg-rose-50/60 text-rose-600 font-black'
                      : 'bg-slate-50/55 border-slate-200/80 hover:bg-white text-slate-800'
                  }`}
                >
                  <span className={`text-[11px] font-black leading-none font-mono ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {day < 10 ? '0' + day : day}
                  </span>

                  {/* Bullet Event Dots */}
                  <div className="flex gap-0.5 sm:gap-1 items-center justify-center min-h-[6px] w-full flex-wrap mt-1">
                    {cellEvents.slice(0, 3).map((evt, idx) => {
                      const theme = getCategoryTheme(evt.category);
                      return (
                        <span
                          key={idx}
                          className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-amber-400 animate-pulse' : theme.dot}`}
                          title={`${evt.banglaTitle}`}
                        />
                      );
                    })}
                    {cellEvents.length > 3 && (
                      <span className={`text-[6px] leading-none font-black ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                        +{cellEvents.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* COLOR LEGEND INDICATORS */}
          <div className="flex flex-wrap items-center justify-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150 text-[9.5px] font-bold font-sans">
            <span className="text-slate-500">কালার গাইডঃ</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-rose-700">ছুটি (Holiday)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-amber-700">পরীক্ষা (Exam)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="text-blue-700">অনুষ্ঠান (Event)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span className="text-slate-600">অন্যান্য (Other)</span>
            </div>
          </div>
        </div>

        {/* BLOCK 2: Side Event Panels / Logs */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* SELECTED DAY ACTIVE DETAIL VIEW */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3 shadow-3xs">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <div>
                <h4 className="text-[11px] font-extrabold text-indigo-950 font-sans tracking-wide">
                  {selectedDay ? `${monthsBng[currentMonth]} ${toBanglaNumber(selectedDay)} তারিখের বিস্তারিত তথ্য` : 'তারিখ নির্বাচন করুন'}
                </h4>
                <p className="text-[8px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">
                  {selectedDay ? `${monthsEng[currentMonth]} ${selectedDay}, ${currentYear}` : 'ক্যালেন্ডারে যেকোনো ঘরে চাপ দিন'}
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
            </div>

            {selectedDayEventsList.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Info className="h-6 w-6 text-slate-300 mx-auto" />
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed max-w-xs mx-auto">
                  {selectedDay 
                    ? `উক্ত তারিখে কোনো প্রাতিষ্ঠানিক ছুটি, পরীক্ষা বা বিশেষ ইভেন্ট তালিকাভুক্ত নেই।`
                    : `বামপাশের ক্যালেন্ডার গ্রিডে ক্লিক করে দিনের বিস্তারিত ইভেন্ট নোটিশ দেখুন।`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {selectedDayEventsList.map((evt) => {
                  const theme = getCategoryTheme(evt.category);
                  return (
                    <div
                      key={evt.id}
                      className={`p-3 bg-white border border-slate-200/80 rounded-xl space-y-2 text-left relative group hover:border-indigo-200 transition-all ${theme.accent}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded border ${theme.badge} scale-95 origin-left`}>
                            {theme.label}
                          </span>
                          <h5 className="font-extrabold text-slate-900 text-[11px] mt-1.5 leading-snug tracking-wide">
                            {evt.banglaTitle}
                          </h5>
                          <span className="block text-[8.5px] font-bold text-slate-400 font-mono uppercase tracking-tight">
                            {evt.title}
                          </span>
                        </div>

                        {canManageEvents && (
                          <div className="flex gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditInit(evt)}
                              className="p-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-100 cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteAcademicEvent(evt.id)}
                              className="p-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded border border-rose-100 cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-550 leading-relaxed font-sans">
                        {evt.banglaDescription || evt.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[8.5px] font-bold text-slate-400 border-t border-slate-100 pt-1.5 font-sans">
                        <span className="flex items-center gap-0.5">
                          <Users className="h-3 w-3 text-indigo-900 shrink-0" />
                          শ্রেনীঃ {evt.className || 'সকল শ্রেণী'}
                        </span>
                        {evt.isHoliday && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-100 px-1 py-0.5 rounded">
                            মাদরাসা সাধারণ ছুটি 🔒
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MONTH TIMELINE CHRONOLOGICAL LIST */}
          <div className="bg-white p-4 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-[11px] font-extrabold text-indigo-950 font-sans tracking-wider uppercase border-b border-slate-100 pb-2">
              {monthsBng[currentMonth]} মাসের পূর্ণাঙ্গ ইভেন্ট নির্ঘণ্ট 📋
            </h4>

            {monthEvents.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-sans text-center py-6 leading-relaxed">
                উক্ত মাসে কোনো গুরুত্বপূর্ণ ইভেন্ট বা ছুটি সংরক্ষিত নেই।
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {monthEvents.map((evt) => {
                  const theme = getCategoryTheme(evt.category);
                  const isCurrentlySelected = selectedDay && isDateInRange(
                    `${currentYear}-${currentMonth + 1 < 10 ? '0' + (currentMonth + 1) : currentMonth + 1}-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`,
                    evt.date,
                    evt.endDate
                  );

                  return (
                    <button
                      key={evt.id}
                      onClick={() => {
                        const dayNum = new Date(evt.date).getDate();
                        setSelectedDay(dayNum);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex gap-3 justify-between items-center ${
                        isCurrentlySelected
                          ? 'border-indigo-950 bg-slate-50 ring-1 ring-indigo-950/10 shadow-xs'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex gap-2.5 items-center min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${theme.dot}`} />
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-slate-800 text-[11px] truncate leading-tight tracking-wide">
                            {evt.banglaTitle}
                          </h5>
                          <span className="block text-[8px] text-slate-400 font-mono tracking-tight uppercase truncate mt-0.5">
                            {evt.title}
                          </span>
                        </div>
                      </div>

                      <span className="text-[8.5px] font-mono font-bold bg-slate-100 border border-slate-150 px-2 py-0.5 rounded text-slate-600 shrink-0">
                        {evt.date.substring(5)} {evt.endDate ? `~ ${evt.endDate.substring(5)}` : ''}
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
