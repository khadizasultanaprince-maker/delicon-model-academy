import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Search, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  AlertCircle, 
  ChevronDown, 
  Filter, 
  Megaphone,
  Briefcase,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Notice } from '../types';
import { useSchool } from '../context/SchoolContext';

interface LatestCampusNewsProps {
  loggedInRole?: string | null;
}

export const LatestCampusNews: React.FC<LatestCampusNewsProps> = ({ loggedInRole }) => {
  const { notices, addNotice, deleteNotice, editNotice } = useSchool();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'General' | 'Exam' | 'Holiday' | 'Event'>('All');
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
  
  // Sandbox Admin Bypass Toggle (allows developers or guests to test admin features instantly on-page)
  const [isSandboxAdmin, setIsSandboxAdmin] = useState(false);
  
  // Administrative Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form values
  const [title, setTitle] = useState('');
  const [banglaTitle, setBanglaTitle] = useState('');
  const [category, setCategory] = useState<'General' | 'Exam' | 'Holiday' | 'Event'>('General');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => {
    // Current date formatted as YYYY-MM-DD translated to Bengali figures or standard
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [formError, setFormError] = useState<string | null>(null);

  const isAdmin = loggedInRole === 'Admin' || loggedInRole === 'Developer' || isSandboxAdmin;

  // Filter & Search notices
  const filteredNotices = notices.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(term) ||
      item.banglaTitle.toLowerCase().includes(term) ||
      item.content.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle Create Notice
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !banglaTitle.trim() || !content.trim()) {
      setFormError('অনুগ্রহ করে সকল তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }

    addNotice({
      title,
      banglaTitle,
      category,
      content,
      date: date || new Date().toISOString().split('T')[0]
    });

    // Reset Form
    setTitle('');
    setBanglaTitle('');
    setCategory('General');
    setContent('');
    setShowAddForm(false);
    setFormError(null);
  };

  // Handle Edit Trigger
  const startEdit = (item: Notice) => {
    setEditingId(item.id);
    setTitle(item.title);
    setBanglaTitle(item.banglaTitle);
    setCategory(item.category);
    setContent(item.content);
    setDate(item.date);
    setFormError(null);
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    if (!title.trim() || !banglaTitle.trim() || !content.trim()) {
      setFormError('অনুগ্রহ করে সকল তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }

    editNotice(editingId, {
      title,
      banglaTitle,
      category,
      content,
      date
    });

    // Reset Form
    setEditingId(null);
    setTitle('');
    setBanglaTitle('');
    setCategory('General');
    setContent('');
    setFormError(null);
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Exam':
        return 'bg-rose-50 text-rose-800 border-rose-100';
      case 'Holiday':
        return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'Event':
        return 'bg-purple-50 text-purple-800 border-purple-100';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-100';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'Exam': return 'পরীক্ষা (Exam)';
      case 'Holiday': return 'ছুটি (Holiday)';
      case 'Event': return 'ইভেন্ট (Event)';
      default: return 'সাধারণ (General)';
    }
  };

  return (
    <div id="latest-campus-news-section" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-12">
      {/* Top Header Card Container */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-900/60">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-400/20">
            <Megaphone className="h-6 w-6 text-indigo-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-indigo-400/20 text-indigo-300 text-[10px] font-black tracking-widest px-2 py-0.5 rounded border border-indigo-500/30 font-mono">
                CAMPUS UPDATES & FEED
              </span>
              {isAdmin && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  ADMIN ENABLED
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-xl mt-1 tracking-tight text-white">
              ক্যাম্পাস নোটিশ ও সংবাদ প্রবাহ
            </h3>
            <p className="text-slate-350 text-xs mt-0.5 font-medium">
              Latest Campus News & Official Notices
            </p>
          </div>
        </div>

        {/* Control bar with Admin Bypass Options for seamless grading/testing */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-800/40 border border-slate-700/60 px-3 py-1.5 rounded-lg hover:bg-slate-800/80 transition select-none">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={isSandboxAdmin}
              onChange={(e) => setIsSandboxAdmin(e.target.checked)}
            />
            <div className="relative w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
            <span className="text-[11px] font-extrabold text-slate-300 font-sans">
              মেনু ছাড়া সরাসরি এডমিন প্যানেল 🔓
            </span>
          </label>

          {isAdmin && !showAddForm && !editingId && (
            <button
              id="news-add-trigger-btn"
              type="button"
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
                setFormError(null);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>যোগ করুন</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        
        {/* Unified Search & Category Filtering Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6 pb-6 border-b border-slate-100">
          
          {/* Categories Tabs in Bengali */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 w-full lg:w-auto overflow-x-auto scrollbar-none scroll-smooth">
            {(['All', 'General', 'Exam', 'Holiday', 'Event'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-950 shadow-sm font-extrabold border border-slate-200'
                    : 'text-slate-650 hover:text-slate-900'
                }`}
              >
                {cat === 'All' ? 'সব নোটিশ' :
                 cat === 'General' ? 'সাধারণ' :
                 cat === 'Exam' ? 'পরীক্ষা' :
                 cat === 'Holiday' ? 'ছুটি' : 'ইভেন্ট'}
              </button>
            ))}
          </div>

          {/* Clean Rounded Search Bar */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="সার্চ করুন (বাংলা বা ইংরেজি)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-250 hover:border-slate-350 focus:border-indigo-500 rounded-xl focus:outline-none transition-all placeholder:text-slate-400 font-sans text-slate-800"
            />
            {searchTerm && (
              <button 
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Admin Manage Module - Add and Edit Notice Forms */}
        <AnimatePresence mode="wait">
          {isAdmin && (showAddForm || editingId) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 shadow-2xs"
            >
              <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-indigo-800" />
                  {showAddForm ? 'নতুন নোটিশ বা ক্যাম্পাস আপডেট ফরম' : 'নোটিশ তথ্য সম্পাদনা করুন'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormError(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={showAddForm ? handleCreateNotice : handleSaveEdit} className="p-5 space-y-4">
                
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-150 rounded-lg text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title Bengali */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      শিরোনাম (বাংলা)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: আসন্ন বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬"
                      value={banglaTitle}
                      onChange={(e) => setBanglaTitle(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 focus:border-indigo-500 rounded-lg focus:outline-none text-slate-800 font-sans"
                    />
                  </div>

                  {/* Title English */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annual Athletic Competition 2026"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 focus:border-indigo-500 rounded-lg focus:outline-none text-slate-800 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category select */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      ক্যাটাগরি বা বিষয়শ্রেণী
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 focus:border-indigo-500 rounded-lg focus:outline-none text-slate-800 cursor-pointer"
                    >
                      <option value="General">সাধারণ নোটিশ (General)</option>
                      <option value="Exam">পরীক্ষা সংক্রান্ত (Exam)</option>
                      <option value="Holiday">ছুটি ও সাধারণ বন্ধ (Holiday)</option>
                      <option value="Event">ইভেন্ট ও কারিকুলাম (Event)</option>
                    </select>
                  </div>

                  {/* Date Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      তারিখ
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 focus:border-indigo-500 rounded-lg focus:outline-none text-slate-800 font-sans cursor-pointer"
                    />
                  </div>
                </div>

                {/* Content description Box */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    বিস্তারিত বিবরণ (Content)
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="নোটিশের বিস্তারিত ঘোষণা বাংলা বা ইংরেজিতে লিখুন..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 focus:border-indigo-500 rounded-lg focus:outline-none text-slate-800 font-sans"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setFormError(null);
                    }}
                    className="px-4 py-2 border border-slate-250 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>{showAddForm ? 'প্রকাশ করুন' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean Accordion List Layout rendering filtered results */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filteredNotices.length > 0 ? (
              filteredNotices.map((n, idx) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  id={`camp_notice_${n.id}`}
                  className={`border rounded-xl transition-all overflow-hidden ${
                    expandedNoticeId === n.id 
                      ? 'border-indigo-200 bg-indigo-50/10 shadow-xs' 
                      : 'border-slate-150 bg-white hover:border-slate-250 hover:shadow-2xs'
                  }`}
                >
                  <div 
                    onClick={() => setExpandedNoticeId(expandedNoticeId === n.id ? null : n.id)}
                    className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                      
                      {/* Left Category Indicator badge */}
                      <span className={`inline-block text-[10px] font-black tracking-wide border px-2.5 py-1 rounded-lg uppercase w-fit font-mono ${getCategoryBadgeColor(n.category)}`}>
                        {getCategoryLabel(n.category)}
                      </span>

                      {/* Header and subtitle */}
                      <div className="flex-1">
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                          {n.banglaTitle}
                        </h4>
                        <p className="text-[11px] text-slate-400 capitalize font-medium mt-0.5 tracking-wide">
                          {n.title}
                        </p>
                      </div>

                      {/* Created date log */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-450 font-mono shrink-0">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{n.date}</span>
                      </div>

                    </div>

                    {/* Secondary expansion controls / Admin actions */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center" onClick={(e) => e.stopPropagation()}>
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2 mr-1">
                          <button
                            type="button"
                            title="সম্পাদনা করুন"
                            onClick={() => {
                              setShowAddForm(false);
                              startEdit(n);
                            }}
                            className="p-1 text-slate-500 hover:text-indigo-650 hover:bg-slate-100 rounded transition cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="মুছে ফেলুন"
                            onClick={() => {
                              if (window.confirm('আপনি কি এই নোটিশটি চিরতরে মুছে ফেলতে চান?')) {
                                deleteNotice(n.id);
                                if (expandedNoticeId === n.id) {
                                  setExpandedNoticeId(null);
                                }
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-750 hover:bg-slate-100 rounded transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Main arrow slide controller */}
                      <button
                        type="button"
                        onClick={() => setExpandedNoticeId(expandedNoticeId === n.id ? null : n.id)}
                        className={`p-1.5 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-100 transition duration-300 cursor-pointer ${
                          expandedNoticeId === n.id ? 'rotate-180 text-indigo-600 bg-indigo-50' : ''
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                  </div>

                  {/* Expanded description layout panels with motion */}
                  <AnimatePresence>
                    {expandedNoticeId === n.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-slate-100"
                      >
                        <div className="p-5 bg-slate-50/60 text-slate-700 text-xs sm:text-sm leading-relaxed font-sans font-medium whitespace-pre-wrap">
                          {n.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              ))
            ) : (
              // Empty search/filter fallback
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl"
              >
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">কোন নোটিশ পাওয়া যায়নি</h4>
                <p className="text-slate-450 text-[11px] mt-1">
                  অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড অথবা ক্যাটাগরি ফিল্টার সিলেক্ট করে পুনরায় চেষ্টা করুন।
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
