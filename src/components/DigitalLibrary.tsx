/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { LibraryResource } from '../types';
import { 
  Book, FileText, Download, Eye, Plus, Search, Filter, Trash2, Edit3, 
  Layers, Clock, BookOpen, Sparkles, Check, CheckCircle, DownloadCloud, 
  ExternalLink, FileDown, X, User, Tag, Calendar, AlertCircle, FileSpreadsheet
} from 'lucide-react';

interface DigitalLibraryProps {
  role: string;
}

export const DigitalLibrary: React.FC<DigitalLibraryProps> = ({ role }) => {
  const { 
    libraryResources, 
    addLibraryResource, 
    editLibraryResource, 
    deleteLibraryResource, 
    incrementDownloadCount 
  } = useSchool();

  const isAdmin = ['Admin', 'Developer', 'Creator', 'Teacher', 'Assistant'].includes(role);

  // Filter States
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reader Modal State
  const [readingResource, setReadingResource] = useState<LibraryResource | null>(null);

  // Dowloading Simulation State for visual feedback
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Admin Add / Edit Form State
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formBanglaTitle, setFormBanglaTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<LibraryResource['category']>('Lecture Note');
  const [formClassName, setFormClassName] = useState<string>('Class 5');
  const [formSubject, setFormSubject] = useState<string>('');
  const [formBanglaSubject, setFormBanglaSubject] = useState<string>('');
  const [formUploadedBy, setFormUploadedBy] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formBanglaContent, setFormBanglaContent] = useState<string>('');
  const [formFileSize, setFormFileSize] = useState<string>('1.5 MB');

  // Subjects lists
  const availableClasses = ['All', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'All Classes'];

  // Categories helper
  const categoryMap: Record<LibraryResource['category'], { labelBng: string; labelEng: string; color: string; icon: any }> = {
    'Syllabus': { 
      labelBng: 'সিলেবাস', 
      labelEng: 'Syllabus', 
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200', 
      icon: BookOpen 
    },
    'Lecture Note': { 
      labelBng: 'লেকচার শিট', 
      labelEng: 'Lecture Note', 
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200', 
      icon: FileSpreadsheet 
    },
    'Question Paper': { 
      labelBng: 'প্রশ্নপত্র সংগ্রহ', 
      labelEng: 'Past Question', 
      color: 'bg-amber-50 text-amber-800 border-amber-200', 
      icon: FileText 
    },
    'E-Book': { 
      labelBng: 'ই-বুক ও গাইড', 
      labelEng: 'E-Book Study Guide', 
      color: 'bg-pink-50 text-pink-800 border-pink-200', 
      icon: Book 
    }
  };

  // Filtered dataset
  const filteredResources = useMemo(() => {
    return libraryResources.filter(res => {
      const matchCat = activeCategory === 'All' || res.category === activeCategory;
      const matchClass = selectedClass === 'All' || res.className === selectedClass;
      
      const query = searchQuery.trim().toLowerCase();
      const matchQuery = !query || 
        res.title.toLowerCase().includes(query) || 
        res.banglaTitle.toLowerCase().includes(query) || 
        res.subject.toLowerCase().includes(query) || 
        res.banglaSubject.toLowerCase().includes(query) || 
        res.uploadedBy.toLowerCase().includes(query);

      return matchCat && matchClass && matchQuery;
    });
  }, [libraryResources, activeCategory, selectedClass, searchQuery]);

  // Actual safe PDF/Text attachment generator block
  const handleDownloadFile = (res: LibraryResource) => {
    setDownloadingId(res.id);
    setDownloadProgress(0);

    // Increment download metrics
    incrementDownloadCount(res.id);

    // Simulate progress ticks
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Generate a highly realistic simulated document file download
          try {
            const docContent = `
========================================================================
AL-HIJRA ACADEMIC DIGITAL REPOSITORY
========================================================================
SUBJECT: ${res.subject} (${res.banglaSubject})
CLASS: ${res.className}
CATEGORY: ${res.category}
PUBLISHED DATE: ${res.publishDate}
UPLOADED BY: ${res.uploadedBy}
------------------------------------------------------------------------
DOCUMENT TITLE (ENGLISH): ${res.title}
DOCUMENT TITLE (BANGLA): ${res.banglaTitle}
------------------------------------------------------------------------
DOCUMENT CONTENTS & SYLLABUS LAYOUT:

${res.content}

------------------------------------------------------------------------
${res.banglaContent ? `বাংলা সেশন নির্দেশিকা:\n\n${res.banglaContent}` : ''}
------------------------------------------------------------------------
Copyright © 2026 Al-Hijra Digital Learning Hub. All rights reserved.
Generated successfully via offline credentials.
========================================================================
`;
            const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${res.title.replace(/\s+/g, '_')}_document.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch (e) {
            console.error("PDF text compilation failed", e);
          }
          
          setTimeout(() => setDownloadingId(null), 1000);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  // Submission handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formBanglaTitle || !formSubject || !formBanglaSubject || !formUploadedBy || !formContent) {
      alert('সবগুলো আবশ্যক ফিল্ড পূরণ করুন!');
      return;
    }

    const payload = {
      title: formTitle,
      banglaTitle: formBanglaTitle,
      category: formCategory,
      className: formClassName,
      subject: formSubject,
      banglaSubject: formBanglaSubject,
      uploadedBy: formUploadedBy,
      fileSize: formFileSize,
      content: formContent,
      banglaContent: formBanglaContent || undefined
    };

    if (editingResourceId) {
      editLibraryResource(editingResourceId, payload);
    } else {
      addLibraryResource(payload);
    }

    resetForm();
  };

  const handleEditClick = (res: LibraryResource) => {
    setEditingResourceId(res.id);
    setFormTitle(res.title);
    setFormBanglaTitle(res.banglaTitle);
    setFormCategory(res.category);
    setFormClassName(res.className);
    setFormSubject(res.subject);
    setFormBanglaSubject(res.banglaSubject);
    setFormUploadedBy(res.uploadedBy);
    setFormContent(res.content);
    setFormBanglaContent(res.banglaContent || '');
    setFormFileSize(res.fileSize);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingResourceId(null);
    setFormTitle('');
    setFormBanglaTitle('');
    setFormCategory('Lecture Note');
    setFormClassName('Class 5');
    setFormSubject('');
    setFormBanglaSubject('');
    setFormUploadedBy(role === 'Teacher' ? 'জনাব শিক্ষক মহোদয়' : 'মাদরাসা অ্যাডমিনিস্ট্রেটর');
    setFormContent('');
    setFormBanglaContent('');
    setFormFileSize('1.5 MB');
    setShowForm(false);
  };

  return (
    <div id="digital-academic-library" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      
      {/* Title block banner & introductory headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="bg-indigo-50 text-indigo-900 border border-indigo-150 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
            Digital Academic Library
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2 flex items-center gap-2 font-sans">
            <Book className="h-5 w-5 text-indigo-900 shrink-0" />
            ডিজিটাল একাডেমিক লাইব্রেরি ও পাঠাগার উইং
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            পরীক্ষার নমুনা প্রশ্নপত্র, লেকচার শিট, টার্ম সিলেবাস ও পিডিএফ রিসোর্স ডাউনলোড করুন
          </p>
        </div>

        {/* Action center buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <button
              onClick={() => {
                if (showForm) resetForm();
                else setShowForm(true);
              }}
              className="bg-indigo-950 hover:bg-indigo-900 text-white text-[11px] font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              <Plus className="h-4 w-4 text-amber-305" />
              {showForm ? 'আপলোড উইন্ডো বন্ধ করুন' : 'নতুন রিসোর্স আপলোড'}
            </button>
          )}
        </div>
      </div>

      {/* Admin Creator Form Draw */}
      {isAdmin && showForm && (
        <form onSubmit={handleFormSubmit} className="bg-indigo-50/20 p-5 rounded-2xl border border-dashed border-indigo-200 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
            <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5 font-sans">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {editingResourceId ? 'রিসোর্স তথ্য এডিট ও সংশোধন' : 'অফিসিয়াল শিক্ষাবর্ষের স্টাডি মেটারিয়ালস আপলোড ফরম'}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            
            {/* Title Eng */}
            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="font-extrabold text-slate-700">রিসোর্স শিরোনাম (English)*</label>
              <input 
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Class 5 Mathematics Term 1 Past Question Paper"
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-900"
                required
              />
            </div>

            {/* Category dropdown */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700">রিসোর্স প্রকার (Category)*</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as LibraryResource['category'])}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-900"
              >
                <option value="Syllabus">সিলেবাস (Syllabus)</option>
                <option value="Lecture Note">লেকচার শিট (Lecture Note)</option>
                <option value="Question Paper">প্রশ্নপত্র সংগ্রহ (Question Paper)</option>
                <option value="E-Book">ই-বুক ও বই (E-Book)</option>
              </select>
            </div>

            {/* Bangla Title */}
            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="font-extrabold text-slate-700">রিসোর্স শিরোনাম (বাংলা)*</label>
              <input 
                type="text"
                value={formBanglaTitle}
                onChange={e => setFormBanglaTitle(e.target.value)}
                placeholder="যেমন: ৫ম শ্রেনী গণিত ১ম সাময়িক নমুনা প্রশ্ন"
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-900"
                required
              />
            </div>

            {/* Target Class dropdown */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700">টার্গেট শ্রেণী (Class)*</label>
              <select
                value={formClassName}
                onChange={e => setFormClassName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-900"
              >
                {availableClasses.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c === 'All Classes' ? 'সকল শ্রেনী' : c}</option>
                ))}
              </select>
            </div>

            {/* Subject Eng */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700">বিষয় (Subject Eng)*</label>
              <input 
                type="text"
                value={formSubject}
                onChange={e => setFormSubject(e.target.value)}
                placeholder="e.g. Mathematics, English, Arabic"
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-900"
                required
              />
            </div>

            {/* Subject Bangla */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700">বিষয় (বিষয় বাংলা)*</label>
              <input 
                type="text"
                value={formBanglaSubject}
                onChange={e => setFormBanglaSubject(e.target.value)}
                placeholder="যেমন: গণিত, ইংরেজি, তাজবিদ"
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-900"
                required
              />
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700">সংকলক / আপলোডার (Uploaded By)*</label>
              <input 
                type="text"
                value={formUploadedBy}
                onChange={e => setFormUploadedBy(e.target.value)}
                placeholder="যেমন: জনাব কামরুল হাসান"
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-900"
                required
              />
            </div>

            {/* File size & Mock file size helper */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700">ফাইল সাইজ (যেমন: 1.5 MB)</label>
              <input 
                type="text"
                value={formFileSize}
                onChange={e => setFormFileSize(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-900 text-slate-700"
              />
            </div>

            {/* Content Eng */}
            <div className="space-y-1 md:col-span-3">
              <label className="font-extrabold text-slate-700 block">বিস্তারিত সিলেবাস রূপরেখা / বইয়ের বিষয়বস্তু (English)*</label>
              <textarea 
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                rows={4}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-900 font-mono resize-none text-[11px]"
                placeholder="Type structural questions, main syllabus units, or document layout in English..."
                required
              />
            </div>

            {/* Content Bangla */}
            <div className="space-y-1 md:col-span-3">
              <label className="font-extrabold text-slate-700 block">বিস্তারিত সিলেবাস রূপরেখা / বইয়ের বিষয়বস্তু (বাংলা)</label>
              <textarea 
                value={formBanglaContent}
                onChange={e => setFormBanglaContent(e.target.value)}
                rows={4}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-indigo-900 resize-none text-[11.5px]"
                placeholder="বাংলায় অধ্যায়ভিত্তিক আলোচনা, প্রধান দিক-নির্দেশকসমূহ লিখুন (ঐচ্ছিক)..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-indigo-100 pt-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border hover:bg-slate-50 text-[10.5px] font-bold rounded-lg cursor-pointer transition-all"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-[10.5px] px-5 py-2 rounded-lg cursor-pointer transition-all shadow-sm"
            >
              {editingResourceId ? 'তথ্য সংরক্ষণ' : 'লাইব্রেরিতে পাবলিশ করুন'}
            </button>
          </div>
        </form>
      )}

      {/* FILTER CONTROLS HUB */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-4 text-xs font-sans">
        
        {/* Search Input */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="রিসোর্স শিরোনাম, আপলোডার বা বিষয় খুঁজুন..."
            className="w-full bg-white border border-slate-250 rounded-lg pl-9 pr-3.5 py-2 text-xs focus:outline-indigo-900 text-slate-800 font-sans"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories Tab selector */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-all text-[11px] ${
              activeCategory === 'All' 
                ? 'bg-indigo-950 border-indigo-950 text-white shadow-xs' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            সব রিসোর্স
          </button>
          {Object.entries(categoryMap).map(([catKey, val]) => (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-all text-[11px] flex items-center gap-1.5 ${
                activeCategory === catKey 
                  ? 'bg-indigo-950 border-indigo-950 text-white shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <val.icon className="h-3.5 w-3.5" />
              {val.labelBng}
            </button>
          ))}
        </div>

        {/* Class Filter Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
          <span className="text-[10px] uppercase font-bold text-slate-450 shrink-0 font-mono">
            Filter Class:
          </span>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-900 cursor-pointer"
          >
            <option value="All">শ্রেণী: সকল</option>
            {availableClasses.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c === 'All Classes' ? 'সকল শ্রেনী' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* RESOURCES DISPLAY BENTO GRID */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
          <AlertCircle className="h-10 w-10 text-slate-350 mx-auto" />
          <h4 className="text-slate-800 font-bold text-sm">কোনো একাডেমিক স্টাডি রিসোর্স খুঁজে পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
            আপনার ফিল্টার পরিবর্তন করে অনুসন্ধান করুন অথবা আপনার নির্ধারিত শ্রেণীর জন্য নতুন পরীক্ষার ফাইল আপলোড করতে প্রশাসনকে অবহিত করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => {
            const catInfo = categoryMap[res.category];
            const CatIcon = catInfo.icon;
            const isDownloading = downloadingId === res.id;

            return (
              <div 
                key={res.id} 
                className="bg-white p-4.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col justify-between gap-4 group relative"
              >
                {/* Upper block */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    {/* Badge Category */}
                    <span className={`inline-flex items-center gap-1 text-[8.5px] font-bold px-2 py-0.5 rounded border ${catInfo.color}`}>
                      <CatIcon className="h-3 w-3" />
                      {catInfo.labelBng}
                    </span>

                    {/* Badge Class */}
                    <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-md font-mono">
                      {res.className === 'All Classes' ? 'সকল শ্রেনী' : res.className}
                    </span>
                  </div>

                  {/* Title pair */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-xs tracking-wide group-hover:text-indigo-950 duration-75 line-clamp-2 leading-snug">
                      {res.banglaTitle}
                    </h4>
                    <p className="text-[10px] text-slate-450 font-mono font-medium tracking-tight line-clamp-1">
                      {res.title}
                    </p>
                  </div>

                  {/* Parameters Metadata */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 pt-2 text-[10px] font-sans text-slate-500 border-t border-slate-100/60 pb-1">
                    <span className="flex items-center gap-1.5 truncate">
                      <Tag className="h-3.5 w-3.5 text-indigo-700 shrink-0" />
                      বিষয়: <b>{res.banglaSubject}</b>
                    </span>
                    <span className="flex items-center gap-1.5 truncate">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      আপলোডার: <b>{res.uploadedBy.split(' ')[0]}</b>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      তারিখ: <b className="font-mono">{res.publishDate}</b>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      সাইজ: <b className="font-mono text-indigo-900">{res.fileSize}</b>
                    </span>
                  </div>
                </div>

                {/* Bottom Trigger Buttons */}
                <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-slate-100">
                  <span className="text-[9.5px] text-slate-400 font-bold font-sans">
                    ডাউনলোড করা হয়েছে: <b className="text-slate-800 font-mono">{res.downloadCount} বার</b>
                  </span>

                  <div className="flex gap-1.5">
                    {/* Read Online */}
                    <button
                      onClick={() => setReadingResource(res)}
                      className="bg-slate-50 hover:bg-slate-150 text-slate-650 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      title="অনলাইন ডায়েরি রিডার"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      ভিউ
                    </button>

                    {/* Download simulation button */}
                    <button
                      onClick={() => handleDownloadFile(res)}
                      disabled={isDownloading}
                      className="bg-indigo-950 hover:bg-indigo-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-95 disabled:opacity-80"
                    >
                      {isDownloading ? (
                        <>
                          <div className="h-3 w-3 border-2 border-slate-200 border-t-white rounded-full animate-spin shrink-0" />
                          {downloadProgress}%
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 text-amber-300" />
                          ডাউনলোড
                        </>
                      )}
                    </button>

                    {/* Admin Options */}
                    {isAdmin && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(res)}
                          className="h-7 w-7 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 flex items-center justify-center text-indigo-900 transition-all cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('আপনি কি নিশ্চিতভাবে এই পাঠ্য আইটেমটি লাইব্রেরি থেকে মুছে ফেলতে চান?')) {
                              deleteLibraryResource(res.id);
                            }
                          }}
                          className="h-7 w-7 rounded bg-rose-50 hover:bg-rose-100 border border-rose-150 flex items-center justify-center text-rose-600 transition-all cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: STYLIZED ON-SCREEN PDF ONLINE READER AND VIEWER */}
      {readingResource && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-100 animate-fadeIn" id="document-online-reader-modal">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-indigo-950 text-white rounded-t-2xl">
              <div className="min-w-0 pr-4">
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-white/20 text-yellow-350">
                  Online Document Reader
                </span>
                <h3 className="font-black text-xs BanglaName tracking-wide truncate mt-1">
                  {readingResource.banglaTitle}
                </h3>
              </div>
              <button 
                onClick={() => setReadingResource(null)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-all shrink-0"
              >
                <X className="h-4.5 w-4.5 text-white" />
              </button>
            </div>

            {/* Document stats bar */}
            <div className="bg-slate-50 border-b border-slate-150 px-5 py-2.5 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-sans gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold">শ্রেণী: <span className="text-indigo-900">{readingResource.className}</span></span>
                <span className="font-bold">বিষয়: <span className="text-indigo-900">{readingResource.banglaSubject}</span></span>
                <span className="font-bold">সাইজ: <span className="text-slate-800 font-mono">{readingResource.fileSize}</span></span>
              </div>
              <span className="font-bold">আপলোড করেছেন: <span className="text-slate-705">{readingResource.uploadedBy}</span></span>
            </div>

            {/* Simulated PDF Screen Reader Sheet Page */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60 font-sans space-y-6">
              
              {/* Cover Page Outline Decoration */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm relative space-y-6 mx-auto max-w-lg min-h-[460px] flex flex-col justify-between">
                
                {/* Decorative border corners */}
                <div className="absolute top-2 left-2 right-2 bottom-2 border border-dashed border-indigo-150 pointer-events-none rounded" />

                {/* Top logo block */}
                <div className="text-center pt-2">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest block uppercase font-mono">
                    AL-HIJRA ISLAMIC MODEL ACADEMY
                  </span>
                  <h4 className="text-xs font-serif font-black tracking-normal text-slate-900 mt-1">
                    ডিজিটাল একাডেমিক সংরক্ষণাগার ও রিসোর্স ফাইল
                  </h4>
                </div>

                {/* Main title center */}
                <div className="text-center space-y-3.5 my-6">
                  <span className="h-10 w-10 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-900">
                    <FileDown className="h-5 w-5" />
                  </span>
                  <div className="space-y-1 px-4">
                    <h1 className="text-sm font-black text-slate-900 leading-snug tracking-wide">
                      {readingResource.banglaTitle}
                    </h1>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 italic">
                      {readingResource.title}
                    </p>
                  </div>
                </div>

                {/* Document contents inner card representation */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 space-y-3 font-sans text-xs text-slate-850">
                  <div className="flex items-center gap-1.5 border-b border-indigo-100 pb-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-900" />
                    <span className="font-black text-[10.5px] text-indigo-950">মুল শিক্ষণ ও সিলেবাসের রূপরেখা</span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-[10.5px]">
                    {readingResource.banglaContent || readingResource.content}
                  </div>
                </div>

                {/* Bottom credit info */}
                <div className="text-center text-[9px] text-slate-450 border-t pt-4 border-slate-100">
                  <p>প্রকাশনা কাল: <b className="font-mono">{readingResource.publishDate}</b> | আপলোডার: {readingResource.uploadedBy}</p>
                  <p className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-slate-400">CLASSROOM REPOSITORY - SECURE OFFLINE SYSTEM</p>
                </div>

              </div>

            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="p-4 border-t border-slate-150 flex items-center justify-between bg-slate-50 rounded-b-2xl">
              <span className="text-[10px] text-slate-450 font-bold">
                * এই ফাইলটি আপনার ডিভাইসে নিরাপদ টেক্সট ফাইল আকারে ডাউনলোড করতে পারেন।
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setReadingResource(null)}
                  className="px-4 py-1.5 border text-[11px] font-black hover:bg-slate-150 rounded-lg cursor-pointer transition-all"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={() => {
                    handleDownloadFile(readingResource);
                  }}
                  className="bg-indigo-950 hover:bg-indigo-900 text-white py-1.5 px-4 rounded-lg text-[11px] font-black cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  পিডিএফ ডাউনলোড
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
