/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, AlertTriangle, AlertCircle, Calendar, Plus, Trash2, Edit3, 
  Check, CheckCheck, X, Search, Filter, Megaphone, Pin, Printer, 
  ExternalLink, ChevronDown, ChevronUp, Share2, Sparkles, User, Users,
  Clock, ShieldAlert, BookOpen, GraduationCap, HeartHandshake, ShieldCheck,
  KeyRound, Lock, Unlock, ToggleLeft, ToggleRight, Table
} from 'lucide-react';
import { Notice, UserRole } from '../types';
import { useSchool } from '../context/SchoolContext';

// Helper to convert Bengali numerals if present
export const normalizeDateDigits = (str: string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));
};

// Check if a notice's expiry date has passed
export const isNoticeExpired = (notice: Notice, referenceDate: Date = new Date()): boolean => {
  if (!notice.expiryDate || !notice.expiryDate.trim()) return false;
  try {
    const cleanExpiry = normalizeDateDigits(notice.expiryDate.trim());
    const todayStr = referenceDate.toISOString().split('T')[0];
    
    // Check standard YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanExpiry)) {
      return todayStr > cleanExpiry;
    }
    const expiryTime = new Date(cleanExpiry).getTime();
    if (isNaN(expiryTime)) return false;
    return referenceDate.getTime() > expiryTime;
  } catch {
    return false;
  }
};

// Expiry badge information
export const getExpiryBadgeInfo = (notice: Notice) => {
  if (!notice.expiryDate || !notice.expiryDate.trim()) return null;
  const expired = isNoticeExpired(notice);
  const cleanExpiry = normalizeDateDigits(notice.expiryDate.trim());
  
  if (expired) {
    return {
      isExpired: true,
      label: `মেয়াদ শেষ (${notice.expiryDate})`,
      subtext: 'ড্যাশবোর্ড থেকে লুকানো',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
    };
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const dToday = new Date(todayStr).getTime();
    const dExpiry = new Date(cleanExpiry).getTime();
    const diffDays = Math.round((dExpiry - dToday) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return {
        isExpired: false,
        label: `মেয়াদ: আজ পর্যন্ত (${notice.expiryDate})`,
        subtext: 'আজকের পর স্বয়ংক্রিয়ভাবে লুকানো হবে',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
      };
    }
    if (diffDays <= 3) {
      return {
        isExpired: false,
        label: `মেয়াদ: আর ${diffDays} দিন (${notice.expiryDate})`,
        subtext: 'শীঘ্রই মেয়াদ শেষ হবে',
        badgeClass: 'bg-orange-100 text-orange-900 border-orange-300'
      };
    }
    return {
      isExpired: false,
      label: `মেয়াদ: ${notice.expiryDate} পর্যন্ত`,
      subtext: `${diffDays} দিন বাকি`,
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    };
  } catch {
    return {
      isExpired: false,
      label: `মেয়াদ: ${notice.expiryDate}`,
      subtext: '',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  }
};

interface NoticeBoardProps {
  role?: UserRole;
  compact?: boolean;
  audienceFilter?: 'All' | 'Students' | 'Guardians';
  onNoticeCountChange?: (unreadCount: number, urgentCount: number) => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ 
  role = 'Student', 
  compact = false,
  audienceFilter: defaultAudienceFilter = 'All',
  onNoticeCountChange
}) => {
  const { notices, addNotice, deleteNotice, editNotice, schoolName, schoolSlogan } = useSchool();

  const isRoleAdmin = ['Admin', 'Developer', 'Teacher', 'Creator', 'Assistant'].includes(role);

  // Admin Control Toggle State persisted in LocalStorage
  const [adminControlActive, setAdminControlActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('delicon_notice_admin_control');
      return saved !== null ? JSON.parse(saved) : isRoleAdmin;
    } catch {
      return isRoleAdmin;
    }
  });

  // Local Storage for Read/Unread state
  const [readNoticeIds, setReadNoticeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('delicon_read_notices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Local Storage for Dismissed Urgent Alert banners
  const [dismissedUrgentIds, setDismissedUrgentIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('delicon_dismissed_urgent_notices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Urgent' | 'General' | 'Exam' | 'Holiday' | 'Event' | 'Expired'>('All');
  const [selectedAudience, setSelectedAudience] = useState<'All' | 'Students' | 'Guardians'>(defaultAudienceFilter);
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
  const [printNotice, setPrintNotice] = useState<Notice | null>(null);
  const [showAdminTableView, setShowAdminTableView] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPasscode, setUnlockPasscode] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Administrative Form states (Add & Edit)
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBanglaTitle, setFormBanglaTitle] = useState('');
  const [formCategory, setFormCategory] = useState<Notice['category']>('General');
  const [formContent, setFormContent] = useState('');
  const [formIsUrgent, setFormIsUrgent] = useState(false);
  const [formPriority, setFormPriority] = useState<Notice['priority']>('Normal');
  const [formTargetAudience, setFormTargetAudience] = useState<Notice['targetAudience']>('All');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formExpiryDate, setFormExpiryDate] = useState<string>('');
  const [formPublishedBy, setFormPublishedBy] = useState(() => `${role} Desk`);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Sync Admin Control state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('delicon_notice_admin_control', JSON.stringify(adminControlActive));
    } catch (e) {
      console.warn('Failed to save admin control state', e);
    }
  }, [adminControlActive]);

  // Sync read states to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('delicon_read_notices', JSON.stringify(readNoticeIds));
    } catch (e) {
      console.warn('Failed to save read notices to localStorage', e);
    }
  }, [readNoticeIds]);

  // Sync dismissed urgent banners to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('delicon_dismissed_urgent_notices', JSON.stringify(dismissedUrgentIds));
    } catch (e) {
      console.warn('Failed to save dismissed urgent alerts to localStorage', e);
    }
  }, [dismissedUrgentIds]);

  // Handle Admin Control Toggle
  const handleToggleAdminControl = () => {
    if (adminControlActive) {
      setAdminControlActive(false);
    } else {
      if (isRoleAdmin) {
        setAdminControlActive(true);
      } else {
        // Show unlock modal for quick passkey
        setUnlockPasscode('');
        setUnlockError('');
        setShowUnlockModal(true);
      }
    }
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = unlockPasscode.trim().toLowerCase();
    if (clean === 'admin' || clean === 'dev' || clean === '1234' || clean === 'dev123' || clean === '') {
      setAdminControlActive(true);
      setShowUnlockModal(false);
      setUnlockPasscode('');
      setUnlockError('');
    } else {
      setUnlockError('ভুল পাসকোড! অনুগ্রহ করে admin বা dev ব্যবহার করুন।');
    }
  };

  // Mark single notice as read/unread
  const toggleReadStatus = (noticeId: string) => {
    setReadNoticeIds(prev => 
      prev.includes(noticeId) 
        ? prev.filter(id => id !== noticeId) 
        : [...prev, noticeId]
    );
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const allIds = notices.map(n => n.id);
    setReadNoticeIds(allIds);
  };

  // Dismiss urgent banner
  const handleDismissUrgent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedUrgentIds(prev => [...prev, id]);
  };

  // Toggle Urgent status of a notice
  const handleToggleUrgentNotice = (notice: Notice, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextUrgent = !notice.isUrgent && notice.category !== 'Urgent';
    editNotice(notice.id, {
      isUrgent: nextUrgent,
      priority: nextUrgent ? 'Urgent' : 'Normal',
      category: nextUrgent ? 'Urgent' : (notice.category === 'Urgent' ? 'General' : notice.category)
    });
  };

  // Direct Delete Notice
  const handleDeleteNotice = (notice: Notice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`আপনি কি নিশ্চিত যে "${notice.banglaTitle || notice.title}" নোটিশটি ডাটাবেজ থেকে মুছে ফেলতে চান?`)) {
      deleteNotice(notice.id);
    }
  };

  // Counts of active vs expired notices
  const activeNoticesCount = useMemo(() => notices.filter(n => !isNoticeExpired(n)).length, [notices]);
  const expiredNoticesCount = useMemo(() => notices.filter(n => isNoticeExpired(n)).length, [notices]);

  // Quick extend expiry for admin
  const handleQuickExtendExpiry = (notice: Notice, additionalDays = 7, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const base = new Date();
    base.setDate(base.getDate() + additionalDays);
    const newExpiry = base.toISOString().split('T')[0];
    editNotice(notice.id, { expiryDate: newExpiry });
  };

  // Filtered and Sorted notices list (Auto-hide expired from dashboard, Urgent & Pinned always at top)
  const filteredNotices = useMemo(() => {
    return notices
      .filter(item => {
        const isExpired = isNoticeExpired(item);

        // In 'Expired' category (only in Admin mode), show only expired notices
        if (selectedCategory === 'Expired') {
          if (!isExpired) return false;
        } else {
          // In all other categories (All, Urgent, Exam, Holiday, etc.), AUTOMATICALLY HIDE EXPIRED NOTICES!
          if (isExpired) return false;
        }

        const matchesCategory = (selectedCategory === 'All' || selectedCategory === 'Expired')
          ? true 
          : selectedCategory === 'Urgent' 
            ? (item.isUrgent || item.category === 'Urgent' || item.priority === 'Urgent')
            : item.category === selectedCategory;

        const matchesAudience = selectedAudience === 'All'
          ? true
          : (!item.targetAudience || item.targetAudience === 'All' || item.targetAudience === selectedAudience);

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q 
          ? true 
          : (item.title || '').toLowerCase().includes(q) ||
            (item.banglaTitle || '').toLowerCase().includes(q) ||
            (item.content || '').toLowerCase().includes(q) ||
            (item.date || '').includes(q) ||
            (item.expiryDate || '').includes(q);

        return matchesCategory && matchesAudience && matchesSearch;
      })
      .sort((a, b) => {
        const aUrgent = a.isUrgent || a.category === 'Urgent' || a.priority === 'Urgent' ? 1 : 0;
        const bUrgent = b.isUrgent || b.category === 'Urgent' || b.priority === 'Urgent' ? 1 : 0;
        if (aUrgent !== bUrgent) return bUrgent - aUrgent;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [notices, selectedCategory, selectedAudience, searchQuery]);

  // Urgent active notices for top marquee / alert banner (Excludes Expired Notices)
  const activeUrgentAlerts = useMemo(() => {
    return notices.filter(n => 
      !isNoticeExpired(n) &&
      (n.isUrgent || n.category === 'Urgent' || n.priority === 'Urgent') &&
      !dismissedUrgentIds.includes(n.id)
    );
  }, [notices, dismissedUrgentIds]);

  // Notify parent of unread and urgent counts (Excludes Expired Notices)
  useEffect(() => {
    if (onNoticeCountChange) {
      const unreadCount = notices.filter(n => !isNoticeExpired(n) && !readNoticeIds.includes(n.id)).length;
      const urgentCount = activeUrgentAlerts.length;
      onNoticeCountChange(unreadCount, urgentCount);
    }
  }, [notices, readNoticeIds, activeUrgentAlerts, onNoticeCountChange]);

  // Open Create Form
  const handleOpenCreate = (isUrgentTemplate = false) => {
    setEditingNoticeId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormExpiryDate('');
    setFormPublishedBy(role === 'Student' ? 'অধ্যক্ষ মহোদয়ের কার্যালয়' : `${role} Desk`);
    
    if (isUrgentTemplate) {
      setFormTitle('Emergency Weather & Academic Advisory');
      setFormBanglaTitle('🚨 জরুরি বিজ্ঞপ্তি: বিশেষ ক্লাস সূচি ও জরুরি অ্যাকাডেমিক নির্দেশনা');
      setFormCategory('Urgent');
      setFormContent('সকল সম্মানিত অভিভাবক ও শিক্ষার্থীদের দৃষ্টি আকর্ষণ করে জানানো যাচ্ছে যে, বিশেষ প্রশাসনিক নির্দেশনায় আগামীকাল ক্লাস সূচিতে পরিবর্তন আনা হয়েছে। নির্ধারিত সময় মেনে উপস্থিত হওয়ার অনুরোধ করা হলো।');
      setFormIsUrgent(true);
      setFormPriority('Urgent');
      setFormTargetAudience('All');
      // Set urgent alert default expiry to 3 days from now
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setFormExpiryDate(d.toISOString().split('T')[0]);
    } else {
      setFormTitle('');
      setFormBanglaTitle('');
      setFormCategory('General');
      setFormContent('');
      setFormIsUrgent(false);
      setFormPriority('Normal');
      setFormTargetAudience('All');
    }
    setShowPublishModal(true);
  };

  // Open Edit Form
  const handleOpenEdit = (n: Notice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingNoticeId(n.id);
    setFormTitle(n.title);
    setFormBanglaTitle(n.banglaTitle || n.title);
    setFormCategory(n.category);
    setFormContent(n.content);
    setFormIsUrgent(!!n.isUrgent || n.category === 'Urgent' || n.priority === 'Urgent');
    setFormPriority(n.priority || (n.isUrgent ? 'Urgent' : 'Normal'));
    setFormTargetAudience(n.targetAudience || 'All');
    setFormDate(n.date || new Date().toISOString().split('T')[0]);
    setFormExpiryDate(n.expiryDate || '');
    setFormPublishedBy(n.publishedBy || `${role} Desk`);
    setShowPublishModal(true);
  };

  // Submit Notice Form (Add or Edit)
  const handleSubmitNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() && !formBanglaTitle.trim()) return;

    const noticePayload: any = {
      title: formTitle.trim() || formBanglaTitle.trim(),
      banglaTitle: formBanglaTitle.trim() || formTitle.trim(),
      category: formIsUrgent ? 'Urgent' : formCategory,
      content: formContent.trim(),
      date: formDate,
      isUrgent: formIsUrgent,
      priority: formIsUrgent ? 'Urgent' : formPriority,
      targetAudience: formTargetAudience,
      publishedBy: formPublishedBy.trim() || `${role} Desk`,
      expiryDate: formExpiryDate ? formExpiryDate.trim() : undefined
    };

    if (editingNoticeId) {
      editNotice(editingNoticeId, noticePayload);
      setEditingNoticeId(null);
    } else {
      addNotice(noticePayload);
    }

    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setShowPublishModal(false);
      setFormTitle('');
      setFormBanglaTitle('');
      setFormContent('');
      setFormIsUrgent(false);
      setFormExpiryDate('');
    }, 1200);
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      
      {/* 1. URGENT ALERTS BROADCAST TICKER */}
      {activeUrgentAlerts.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-500 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-4 text-white shadow-lg animate-pulse-subtle">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
                <AlertTriangle className="h-5 w-5 text-amber-200 animate-bounce" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-200 border border-white/30">
                  <ShieldAlert className="h-3 w-3" />
                  <span>জরুরি অ্যাকাডেমিক অ্যালার্ট ({activeUrgentAlerts.length} টি সক্রিয়)</span>
                </div>
                {activeUrgentAlerts.map(alert => (
                  <div key={alert.id} className="mt-1.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="font-black text-sm text-white underline decoration-amber-300 decoration-2">
                      {alert.banglaTitle || alert.title}
                    </span>
                    <span className="text-xs text-rose-100 line-clamp-1 max-w-xl">
                      {alert.content}
                    </span>
                    <button
                      onClick={(e) => handleDismissUrgent(alert.id, e)}
                      className="text-[10px] text-amber-200 hover:text-white underline font-bold mt-0.5 sm:mt-0"
                    >
                      বাতিল করুন
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => {
                setSelectedCategory('Urgent');
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="hidden sm:flex shrink-0 items-center gap-1 rounded-xl bg-white text-rose-900 font-extrabold px-3 py-1.5 text-xs shadow-md hover:bg-amber-100 transition-all cursor-pointer"
            >
              <span>বিস্তারিত পড়ুন</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. NOTICE BOARD MAIN HEADER & ADMIN CONTROL TOGGLE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-700 flex items-center justify-center text-amber-400 shadow-md">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg md:text-xl">
                  প্রাতিষ্ঠানিক ডিজিটাল নোটিশবোর্ড ও লাইভ অ্যালার্ট
                </h3>
                <span className="rounded-full bg-blue-100 text-blue-900 px-2.5 py-0.5 text-xs font-bold font-mono">
                  {activeNoticesCount} টি সক্রিয় নোটিশ
                </span>
                {adminControlActive && expiredNoticesCount > 0 && (
                  <button
                    onClick={() => setSelectedCategory('Expired')}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold font-mono cursor-pointer transition-colors ${
                      selectedCategory === 'Expired'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                    }`}
                    title="মেয়াদোত্তীর্ণ নোটিশসমূহ দেখুন ও মেয়াদ বৃদ্ধি করুন"
                  >
                    ⌛ {expiredNoticesCount} টি মেয়াদোত্তীর্ণ (লুকানো)
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                দৈনিক অ্যাকাডেমিক রুটিন, পরীক্ষার সময়সূচি, ছুটির ক্যালেন্ডার ও প্রশাসনিক জরুরি ঘোষণা
              </p>
            </div>
          </div>

          {/* Action Bar & Admin Control Switch */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Admin Control Activation Switch */}
            <button
              onClick={handleToggleAdminControl}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border cursor-pointer ${
                adminControlActive
                  ? 'bg-amber-500 text-blue-950 border-amber-400 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="অ্যাডমিন কন্ট্রোল মোড টগল করুন"
            >
              <ShieldCheck className={`h-4 w-4 ${adminControlActive ? 'text-blue-950' : 'text-amber-500'}`} />
              <span>{adminControlActive ? '🛡️ অ্যাডমিন কন্ট্রোল: সক্রিয়' : '🛡️ অ্যাডমিন কন্ট্রোল মোড'}</span>
            </button>

            {/* Mark All as Read button */}
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              title="সকল নোটিশ পঠিত করুন"
            >
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              <span>সব পঠিত</span>
            </button>
          </div>
        </div>

        {/* 3. DEDICATED ADMIN CONTROL HUB (WHEN ACTIVE) */}
        {adminControlActive && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/90 via-blue-50/50 to-indigo-50/40 p-4 shadow-xs animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/20 px-2 py-0.5 text-[10.5px] font-black text-amber-900 border border-amber-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  <span>অ্যাডমিন কন্ট্রোল সেন্টার (Admin Control Active)</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-1">
                  নোটিশ সরাসরি সংযোজন, সম্পাদনা, এক্সপায়ারি ডেট নির্ধারণ, রেড অ্যালার্ট জারি বা মুছে ফেলার সম্পূর্ণ নিয়ন্ত্রণ
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenCreate(false)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white px-3.5 py-2 text-xs font-bold shadow transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-amber-400" />
                  <span>নতুন নোটিশ যোগ করুন</span>
                </button>

                <button
                  onClick={() => handleOpenCreate(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 text-xs font-bold shadow transition-all cursor-pointer"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-200 animate-pulse" />
                  <span>🚨 দ্রুত জরুরি অ্যালার্ট</span>
                </button>

                <button
                  onClick={() => setShowAdminTableView(prev => !prev)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    showAdminTableView
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                  title="টেবিল ভিউ টগল"
                >
                  <Table className="h-4 w-4 text-indigo-600" />
                  <span>{showAdminTableView ? 'কার্ড ভিউতে ফিরুন' : 'ম্যানেজমেন্ট টেবিল'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. FILTER TABS & SEARCH CONTROLS */}
        <div className="mt-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'All', label: 'সকল সক্রিয় নোটিশ', icon: Bell },
              { id: 'Urgent', label: '🚨 জরুরি অ্যালার্ট', icon: AlertTriangle, highlight: true },
              { id: 'Exam', label: '📝 পরীক্ষা সংক্রান্ত', icon: BookOpen },
              { id: 'Holiday', label: '🏖️ ছুটির নোটিশ', icon: Calendar },
              { id: 'Event', label: '🎪 ইভেন্ট ও অনুষ্ঠান', icon: Sparkles },
              { id: 'General', label: '📢 সাধারণ বার্তা', icon: Megaphone },
              ...(adminControlActive && expiredNoticesCount > 0 ? [
                { id: 'Expired', label: `⌛ মেয়াদোত্তীর্ণ (${expiredNoticesCount})`, icon: Clock, expiredTab: true }
              ] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? (tab as any).highlight 
                      ? 'bg-rose-600 text-white shadow-sm'
                      : (tab as any).expiredTab
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-blue-900 text-white shadow-sm'
                    : (tab as any).highlight
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : (tab as any).expiredTab
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box & Audience Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder="বিজ্ঞপ্তি খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-blue-900"
              />
            </div>

            <select
              value={selectedAudience}
              onChange={e => setSelectedAudience(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-blue-900"
            >
              <option value="All">সকলের জন্য</option>
              <option value="Students">শিক্ষার্থী</option>
              <option value="Guardians">অভিভাবক</option>
            </select>
          </div>

        </div>

        {/* Expired Tab Banner for Admin */}
        {selectedCategory === 'Expired' && (
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50/90 p-3 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-700 shrink-0" />
              <span>
                <strong>মেয়াদোত্তীর্ণ নোটিশসমূহ:</strong> নির্ধারিত এক্সপায়ারি তারিখ পার হয়ে যাওয়ায় নোটিশগুলো ড্যাশবোর্ড থেকে স্বয়ংক্রিয়ভাবে অদৃশ্য (Auto-hide) হয়েছে। আপনি চাইলে <strong>"এডিট"</strong> বা <strong>"+৭ দিন বৃদ্ধি"</strong> করে পুনরায় সক্রিয় করতে পারেন।
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer"
            >
              সক্রিয় নোটিশ তালিকায় ফিরুন
            </button>
          </div>
        )}

      </div>

      {/* 5. ADMIN CONTROL TABLE VIEW (WHEN TOGGLED) */}
      {adminControlActive && showAdminTableView && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto animate-fade-in">
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <h4 className="font-black text-slate-800 text-xs flex items-center gap-2">
              <Table className="h-4 w-4 text-blue-900" />
              <span>নোটিশ পরিচালনা ও দ্রুত সম্পাদনা টেবিল ({filteredNotices.length} টি নোটিশ)</span>
            </h4>
            <span className="text-[11px] text-slate-400">সরাসরি এডিট, মেয়াদ বৃদ্ধি বা ডিলিট বোতামে ক্লিক করুন</span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b text-[11px] font-bold text-slate-600">
                <th className="p-3">তারিখ</th>
                <th className="p-3">শিরোনাম (বাংলা / ইংরেজি)</th>
                <th className="p-3">ক্যাটাগরি</th>
                <th className="p-3">মেয়াদ (Expiry Date)</th>
                <th className="p-3">প্রাপক</th>
                <th className="p-3">জরুরি স্ট্যাটাস</th>
                <th className="p-3 text-right">অ্যাডমিন অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotices.map((n) => {
                const isUrgent = n.isUrgent || n.category === 'Urgent';
                const isExpired = isNoticeExpired(n);
                return (
                  <tr key={n.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{n.date}</td>
                    <td className="p-3">
                      <span className="font-extrabold text-slate-850 block">{n.banglaTitle || n.title}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-xs block">{n.content}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700">
                        {n.category}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {n.expiryDate ? (
                        <div>
                          <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
                            isExpired ? 'text-rose-600 line-through' : 'text-slate-700'
                          }`}>
                            <Clock className="h-3 w-3 text-slate-400" />
                            {n.expiryDate}
                          </span>
                          <span className={`block text-[9.5px] font-bold ${
                            isExpired ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            {isExpired ? '⚠️ মেয়াদ শেষ (Hidden)' : 'সক্রিয়'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">স্থায়ী (No Expiry)</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-600 text-[11px]">
                      {n.targetAudience === 'All' ? 'সকল' : n.targetAudience || 'সকল'}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={(e) => handleToggleUrgentNotice(n, e)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          isUrgent ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="জরুরি স্ট্যাটাস পরিবর্তন করুন"
                      >
                        {isUrgent ? '🚨 জরুরি অ্যালার্ট' : 'সাধারণ'}
                      </button>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isExpired && (
                          <button
                            onClick={(e) => handleQuickExtendExpiry(n, 7, e)}
                            className="flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 px-2 py-1 text-[11px] font-bold cursor-pointer"
                            title="মেয়াদ ৭ দিন বাড়ান"
                          >
                            <Plus className="h-3 w-3" />
                            <span>+৭ দিন</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleOpenEdit(n, e)}
                          className="flex items-center gap-1 rounded border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2 py-1 text-[11px] font-bold cursor-pointer"
                          title="সম্পাদনা"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>এডিট</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteNotice(n, e)}
                          className="rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 p-1 text-[11px] cursor-pointer"
                          title="ডিলিট"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. NOTICES FEED CARDS LIST */}
      {filteredNotices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Bell className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-700 text-sm">কোনো নোটিশ বা বিজ্ঞপ্তি পাওয়া যায়নি!</h4>
          <p className="text-xs text-slate-400 mt-1">অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা নতুন নোটিশ প্রকাশ করুন।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice) => {
            const isRead = readNoticeIds.includes(notice.id);
            const isUrgent = notice.isUrgent || notice.category === 'Urgent' || notice.priority === 'Urgent';
            const isExpanded = expandedNoticeId === notice.id;

            return (
              <div 
                key={notice.id}
                onClick={() => {
                  if (!isRead) toggleReadStatus(notice.id);
                  setExpandedNoticeId(isExpanded ? null : notice.id);
                }}
                className={`group rounded-2xl border transition-all cursor-pointer p-4 md:p-5 shadow-xs hover:shadow-md ${
                  isUrgent 
                    ? 'border-rose-400 bg-gradient-to-r from-rose-50/90 via-red-50/50 to-white hover:border-rose-500 ring-2 ring-rose-200/50' 
                    : !isRead 
                      ? 'border-indigo-300 bg-gradient-to-r from-blue-50/60 to-white hover:border-blue-400' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                
                {/* Notice Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Urgent Warning Badge */}
                    {isUrgent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs animate-pulse">
                        <AlertTriangle className="h-3 w-3" />
                        <span>জরুরি অ্যালার্ট</span>
                      </span>
                    )}

                    {/* Category Badge */}
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      notice.category === 'Exam' 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : notice.category === 'Holiday'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : notice.category === 'Event'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-blue-100 text-blue-900 border border-blue-200'
                    }`}>
                      {notice.category === 'Exam' ? 'পরীক্ষা' : notice.category === 'Holiday' ? 'ছুটি' : notice.category === 'Event' ? 'ইভেন্ট' : 'সাধারণ নোটিশ'}
                    </span>

                    {/* Audience Tag */}
                    {notice.targetAudience && notice.targetAudience !== 'All' && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                        {notice.targetAudience === 'Students' ? 'শিক্ষার্থীদের জন্য' : 'অভিভাবকদের জন্য'}
                      </span>
                    )}

                    {/* Expiry Date Badge */}
                    {notice.expiryDate && (() => {
                      const badge = getExpiryBadgeInfo(notice);
                      if (!badge) return null;
                      return (
                        <span 
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${badge.badgeClass}`}
                          title={badge.subtext}
                        >
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                      );
                    })()}

                    {/* Expired & Hidden Indicator (Admin View) */}
                    {isNoticeExpired(notice) && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-600 text-white px-2 py-0.5 text-[10px] font-black animate-pulse">
                        ⚠️ ড্যাশবোর্ডে লুকানো
                      </span>
                    )}

                    {/* New/Unread indicator */}
                    {!isRead && !isNoticeExpired(notice) && (
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-ping" title="নতুন নোটিশ" />
                    )}
                  </div>

                  {/* Date and Read status */}
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {notice.date}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReadStatus(notice.id);
                      }}
                      className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                        isRead ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                      title={isRead ? 'পঠিত হিসেবে চিহ্নিত' : 'অপঠিত চিহ্নিত করুন'}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="mt-2 text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                  {notice.banglaTitle || notice.title}
                </h4>
                {notice.title && notice.title !== notice.banglaTitle && (
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {notice.title}
                  </p>
                )}

                {/* Content preview / full */}
                <p className={`mt-2 text-xs text-slate-700 leading-relaxed ${
                  isExpanded ? '' : 'line-clamp-2'
                }`}>
                  {notice.content}
                </p>

                {/* Footer Controls & Admin Action Buttons */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {notice.publishedBy || 'অধ্যক্ষ মহোদয়ের কার্যালয়'}
                  </span>

                  <div className="flex items-center gap-2">
                    
                    {/* Admin Direct Actions on Card */}
                    {adminControlActive && (
                      <div className="flex items-center gap-1 bg-amber-50/80 border border-amber-200 px-2 py-0.5 rounded-lg mr-1">
                        {isNoticeExpired(notice) && (
                          <button
                            onClick={(e) => handleQuickExtendExpiry(notice, 7, e)}
                            className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 transition-colors cursor-pointer"
                            title="মেয়াদ আরও ৭ দিন বাড়িয়ে সক্রিয় করুন"
                          >
                            <Plus className="h-3 w-3" />
                            <span>+৭ দিন সক্রিয়</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => handleToggleUrgentNotice(notice, e)}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                            isUrgent ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-rose-600'
                          }`}
                          title="জরুরি অ্যালার্ট টগল"
                        >
                          {isUrgent ? 'জরুরি সক্রিয়' : 'জরুরি করুন'}
                        </button>
                        
                        <button
                          onClick={(e) => handleOpenEdit(notice, e)}
                          className="p-1 text-blue-900 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                          title="সরাসরি সম্পাদনা করুন"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteNotice(notice, e)}
                          className="p-1 text-rose-600 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Print Notice */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrintNotice(notice);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                      title="নোটিশ প্রিন্ট বা PDF সেভ করুন"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>

                    <span className="text-[11px] text-blue-900 font-bold flex items-center gap-0.5">
                      {isExpanded ? (
                        <><span>সংক্ষিপ্ত করুন</span><ChevronUp className="h-3.5 w-3.5" /></>
                      ) : (
                        <><span>বিস্তারিত পড়ুন</span><ChevronDown className="h-3.5 w-3.5" /></>
                      )}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: PUBLISH / EDIT NOTICE MODAL (ADMIN CONTROL) */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center font-bold">
                  {editingNoticeId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800">
                    {editingNoticeId ? 'বিজ্ঞপ্তি সম্পাদনা ও সংশোধন' : 'নতুন অ্যাকাডেমিক বিজ্ঞপ্তি বা জরুরি অ্যালার্ট প্রকাশ'}
                  </h4>
                  <span className="text-[10px] text-slate-400">অ্যাডমিন কন্ট্রোল সেন্টার</span>
                </div>
              </div>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {publishSuccess ? (
              <div className="py-8 text-center space-y-2 animate-fade-in">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">বিজ্ঞপ্তি সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে!</h4>
                <p className="text-xs text-slate-400">লোকাল স্টোরেজ ও সার্ভার ডাটাবেজে তাৎক্ষণিক যুক্ত হয়েছে।</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitNotice} className="space-y-4 text-xs">
                
                {/* Urgent Alert Checkbox */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 flex items-center gap-3">
                  <input 
                    type="checkbox"
                    id="is_urgent_checkbox"
                    checked={formIsUrgent}
                    onChange={e => setFormIsUrgent(e.target.checked)}
                    className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <label htmlFor="is_urgent_checkbox" className="font-bold text-rose-900 cursor-pointer flex-1">
                    🚨 এটি কি একটি জরুরি অ্যালার্ট? (Urgent Red Alert)
                    <span className="block text-[10px] font-normal text-rose-700">
                      সবার উপরে লাল সতর্কবার্তা হিসেবে পিন করা থাকবে এবং ব্রডকাস্ট ব্যানারে ফ্ল্যাশ করবে।
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">বিজ্ঞপ্তির শিরোনাম (বাংলায়)</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: ঘূর্ণিঝড়ের পূর্বাভাসে আগামীকাল স্কুল বন্ধের জরুরি ঘোষণা"
                    value={formBanglaTitle}
                    onChange={e => setFormBanglaTitle(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-blue-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Notice Title (English - Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Urgent Notice: School closure due to severe weather"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-blue-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-blue-900 font-bold"
                    >
                      <option value="General">সাধারণ ঘোষণা (General)</option>
                      <option value="Exam">পরীক্ষা সংক্রান্ত (Exam)</option>
                      <option value="Holiday">ছুটির বিজ্ঞপ্তি (Holiday)</option>
                      <option value="Event">ইভেন্ট ও কালচারাল (Event)</option>
                      <option value="Urgent">জরুরি অ্যালার্ট (Urgent Alert)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">উদ্দিষ্ট প্রাপক</label>
                    <select
                      value={formTargetAudience}
                      onChange={e => setFormTargetAudience(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-blue-900 font-bold"
                    >
                      <option value="All">সকলের জন্য (All)</option>
                      <option value="Students">শিক্ষার্থীদের জন্য (Students)</option>
                      <option value="Guardians">অভিভাবকদের জন্য (Guardians)</option>
                      <option value="Teachers">শিক্ষকবৃন্দের জন্য (Teachers)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">প্রকাশের তারিখ</label>
                    <input 
                      type="date"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-blue-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">প্রশাসনিক স্বাক্ষরকারী</label>
                    <input 
                      type="text"
                      placeholder="অধ্যক্ষ মহোদয়ের কার্যালয়"
                      value={formPublishedBy}
                      onChange={e => setFormPublishedBy(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-blue-900"
                    />
                  </div>
                </div>

                {/* Expiry Date Field (Optional) with Auto-Hide explanation */}
                <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-blue-50/40 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-600" />
                      <span>মেয়াদ শেষ হওয়ার তারিখ (Expiry Date - ঐচ্ছিক)</span>
                    </label>
                    {formExpiryDate && (
                      <button
                        type="button"
                        onClick={() => setFormExpiryDate('')}
                        className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                      >
                        ✕ মেয়াদ মুছুন (স্থায়ী নোটিশ)
                      </button>
                    )}
                  </div>

                  <input 
                    type="date"
                    value={formExpiryDate}
                    onChange={e => setFormExpiryDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-blue-900 font-mono"
                  />

                  <p className="text-[10.5px] text-slate-500 leading-normal">
                    💡 <strong>স্বয়ংক্রিয় হাইড সুবিধা:</strong> এই তারিখ অতিক্রান্ত হওয়ার পর নোটিশটি সাধারণ ড্যাশবোর্ড থেকে নিজে থেকেই অদৃশ্য (Auto-hide) হয়ে যাবে। খালি রাখলে নোটিশটি স্থায়ী হিসেবে প্রদর্শিত হবে।
                  </p>
                  
                  {/* Quick Expiry Date Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">দ্রুত মেয়াদ সেট:</span>
                    {[
                      { label: '+৩ দিন', days: 3 },
                      { label: '+৭ দিন', days: 7 },
                      { label: '+১৫ দিন', days: 15 },
                      { label: '+৩০ দিন (১ মাস)', days: 30 },
                      { label: '+২ মাস', days: 60 },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + preset.days);
                          setFormExpiryDate(d.toISOString().split('T')[0]);
                        }}
                        className="rounded-md border border-indigo-200 bg-white hover:bg-indigo-600 hover:text-white px-2 py-0.5 text-[10px] font-bold text-indigo-900 transition-colors cursor-pointer shadow-2xs"
                      >
                        {preset.label}
                      </button>
                    ))}
                    {formExpiryDate && (
                      <button
                        type="button"
                        onClick={() => setFormExpiryDate('')}
                        className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        স্থায়ী
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ / নোটিশ কন্টেন্ট</label>
                  <textarea 
                    rows={4}
                    placeholder="নোটিশের বিস্তারিত বার্তা এখানে লিখুন..."
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-blue-900 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowPublishModal(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-900 hover:bg-blue-800 px-5 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
                  >
                    {editingNoticeId ? 'হালনাগাদ সংরক্ষণ করুন' : 'বিজ্ঞপ্তি প্রকাশ করুন'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: ADMIN UNLOCK PASSCODE MODAL */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="font-black text-slate-900 text-base">অ্যাডমিন কন্ট্রোল অ্যাক্সেস</h4>
              <p className="text-xs text-slate-500">
                নোটিশ সংযোজন বা সম্পাদনার সুবিধা চালু করতে কোড প্রদান করুন (অথবা সরাসরি আনলক চাপুন):
              </p>

              <form onSubmit={handleUnlockAdmin} className="space-y-3 text-left pt-2">
                <div>
                  <input 
                    type="password"
                    placeholder="কোড: admin বা dev"
                    value={unlockPasscode}
                    onChange={e => setUnlockPasscode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-amber-500 font-mono text-center"
                    autoFocus
                  />
                  {unlockError && (
                    <p className="text-[10.5px] font-bold text-rose-600 mt-1 text-center">{unlockError}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUnlockModal(false)}
                    className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-blue-950 py-2 text-xs font-black shadow-md cursor-pointer"
                  >
                    আনলক করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PRINTABLE NOTICE SHEET */}
      {printNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-6 print:hidden">
              <span className="text-xs font-bold text-slate-500">অফিসিয়াল বিজ্ঞপ্তি প্রিন্ট লেআউট</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2 text-xs cursor-pointer shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>প্রিন্ট / PDF সেভ</span>
                </button>
                <button
                  onClick={() => setPrintNotice(null)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h2 className="text-2xl font-black text-slate-900">{schoolName || 'ডিলিকন মডেল একাডেমী'}</h2>
              <p className="text-xs text-slate-600 font-semibold">{schoolSlogan}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">মিরপুর ক্যাম্পাস, ঢাকা • নোটিশ নং: NOT-{printNotice.id.toUpperCase()}</p>
              <div className="mt-3 inline-block bg-slate-900 text-white font-black text-xs px-4 py-1 rounded">
                অফিসিয়াল নোটিশ বোর্ড ও জরুরি বিজ্ঞপ্তি
              </div>
            </div>

            {/* Notice Meta */}
            <div className="flex flex-wrap justify-between items-center text-xs font-bold text-slate-700 border-b border-dashed pb-3 mb-4 gap-2">
              <span>প্রকাশের তারিখ: {printNotice.date}</span>
              {printNotice.expiryDate && (
                <span className="text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  কার্যকর মেয়াদ: {printNotice.expiryDate} পর্যন্ত
                </span>
              )}
              <span>শ্রেণী/বিভাগ: {printNotice.targetAudience === 'All' ? 'সার্বজনীন' : printNotice.targetAudience}</span>
            </div>

            {/* Content */}
            <div className="space-y-4 my-6">
              <h3 className="text-lg font-black text-slate-900 border-l-4 border-blue-900 pl-3">
                {printNotice.banglaTitle || printNotice.title}
              </h3>
              <p className="text-xs text-slate-800 leading-loose whitespace-pre-line text-justify">
                {printNotice.content}
              </p>
            </div>

            {/* Signature */}
            <div className="mt-16 flex justify-between items-center text-center text-xs pt-8 border-t border-slate-200">
              <div>
                <div className="w-36 border-t border-slate-700"></div>
                <p className="font-bold mt-1 text-[11px]">একাডেমিক কো-অর্ডিনেটর</p>
              </div>
              <div>
                <div className="w-36 border-t border-slate-700"></div>
                <p className="font-bold mt-1 text-[11px]">অধ্যক্ষ / প্রধান শিক্ষক</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
