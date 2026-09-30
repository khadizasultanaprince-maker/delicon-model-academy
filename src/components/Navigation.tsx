/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sparkles, KeyRound, Monitor, ScanLine, Menu, X, Landmark, Cake } from 'lucide-react';
import { UserRole } from '../types';
import { useSchool } from '../context/SchoolContext';
import { BirthdayReminderCountdown } from './BirthdayReminderCountdown';

interface NavigationProps {
  activeView: 'home' | 'scanner' | 'portal' | 'poster';
  setActiveView: (view: 'home' | 'scanner' | 'portal' | 'poster') => void;
  onOpenAuth: () => void;
  loggedInRole: UserRole | null;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeView, 
  setActiveView, 
  onOpenAuth,
  loggedInRole,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);
  const { schoolName, schoolSlogan, schoolLogoType, schoolLogoVal, students } = useSchool();

  // Calculate count of students with birthdays within 10 days
  const upcomingBirthdaysCount = useMemo(() => {
    const today = new Date();
    let count = 0;
    students.forEach(st => {
      if (!st.dob) return;
      const parts = st.dob.split('-');
      if (parts.length === 3) {
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const thisYearBirthday = new Date(today.getFullYear(), m, d);
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        let target = thisYearBirthday;
        if (target < startOfToday && !(today.getMonth() === m && today.getDate() === d)) {
          target = new Date(today.getFullYear() + 1, m, d);
        }
        const diffDays = Math.ceil((target.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 10) {
          count++;
        }
      }
    });
    return count;
  }, [students]);

  const navItems = [
    { id: 'home', label: '১। হোম পেইজ ও বিবরণ', icon: Landmark },
    { id: 'poster', label: '২। ভর্তি পোস্টার জেনারেটর (AI)', icon: Sparkles },
    { id: 'scanner', label: '৩। ডিজিটাল ট্র্যাকার ডিভাইস', icon: ScanLine },
    { id: 'portal', label: '৪। ডিজিটাল পোর্টাল ও ERP', icon: KeyRound }
  ];

  const showAdminTabs = loggedInRole === 'Admin' || loggedInRole === 'Developer' || loggedInRole === 'Partner';
  const visibleNavItems = showAdminTabs ? navItems : [];

  const handleNavClick = (viewId: any) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-950 bg-blue-900 text-white shadow-md animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Institution Branding */}
          <div className="flex items-center gap-4 cursor-pointer select-none" onClick={() => handleNavClick('home')}>
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg border-2 border-white/20 overflow-hidden ${
              schoolLogoType === 'image' ? 'bg-white p-1' : 'bg-amber-400 text-blue-900 font-extrabold text-2xl font-sans'
            }`}>
              {schoolLogoType === 'image' ? (
                <img 
                  src={schoolLogoVal} 
                  alt="Logo" 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentNode as HTMLDivElement;
                    const fallback = document.createElement('span');
                    fallback.innerText = '🏫';
                    fallback.className = 'text-blue-900 text-xl font-bold';
                    parent.appendChild(fallback);
                  }}
                />
              ) : schoolLogoType === 'text' ? (
                <span className="text-blue-950 font-black text-lg">{schoolLogoVal}</span>
              ) : (
                <span className="text-blue-950 font-black text-lg">{schoolLogoVal || 'D'}</span>
              )}
            </div>
            <div className="min-w-0 pr-4">
              <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white font-sans leading-tight">{schoolName}</span>
              <span className="block text-[10px] sm:text-xs font-bold tracking-wide text-amber-300 font-sans max-w-[320px] sm:max-w-xl truncate leading-none mt-1">{schoolSlogan}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as any)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeView === item.id 
                    ? 'bg-blue-850 text-amber-400 border-b-2 border-amber-400 shadow-sm' 
                    : 'text-slate-150 hover:text-amber-200 hover:bg-blue-800/40'
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 ${activeView === item.id ? 'text-amber-400' : 'text-slate-300'}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Sign In controls & Poster CTA */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Birthday Reminder Button */}
            <button
              onClick={() => setBirthdayModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold px-3 py-2 text-xs transition shadow-sm cursor-pointer border border-rose-400/40 active:scale-95"
              title="শিক্ষার্থী জন্মদিন রিমাইন্ডার ও লাইভ কাউন্টডাউন"
            >
              <Cake className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>জন্মদিন</span>
              {upcomingBirthdaysCount > 0 && (
                <span className="bg-amber-400 text-blue-950 font-black px-1.5 py-0.2 rounded-full text-[10px]">
                  {upcomingBirthdaysCount}
                </span>
              )}
            </button>

            {!loggedInRole && (
              <a
                href="#sec-lead-form"
                onClick={() => {
                  if (activeView !== 'home') setActiveView('home');
                }}
                className="flex items-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 font-black px-3.5 py-2 text-xs transition-all shadow-sm cursor-pointer"
              >
                <span>📝 ভর্তি আবেদন</span>
              </a>
            )}

            {showAdminTabs && (
              <button
                onClick={() => handleNavClick('poster')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  activeView === 'poster'
                    ? 'bg-amber-400 text-blue-950 font-black shadow-md'
                    : 'bg-blue-800 hover:bg-blue-750 text-amber-300 border border-amber-400/30'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>পোস্টার জেনারেটর (AI)</span>
              </button>
            )}

            {loggedInRole ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-[9px] font-bold tracking-widest text-[#10b981] uppercase font-mono">AUTHORIZED GATE</span>
                  <span className="block text-xs font-bold text-slate-100">{loggedInRole}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="rounded-lg bg-blue-800 border border-blue-700 hover:bg-blue-700 hover:text-amber-200 text-white font-bold px-3.5 py-1.5 text-xs transition-all"
                >
                  সাইন-আউট
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 rounded-lg bg-blue-800 hover:bg-blue-750 border border-white/20 text-white font-bold px-4 py-2 text-xs transition-all shadow-md cursor-pointer"
              >
                <KeyRound className="h-4 w-4 text-amber-300" />
                <span>সার্ভিস লগইন</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            {!loggedInRole && (
              <a
                href="#sec-lead-form"
                onClick={() => {
                  if (activeView !== 'home') setActiveView('home');
                }}
                className="flex items-center justify-center rounded-lg bg-amber-400 hover:bg-amber-300 px-2.5 py-2 text-blue-950 text-xs font-black shadow-sm"
              >
                <span>ভর্তি</span>
              </a>
            )}
            {showAdminTabs && (
              <button
                onClick={() => handleNavClick('poster')}
                className="flex items-center justify-center rounded-lg bg-blue-800 hover:bg-blue-750 p-2 text-amber-300 border border-amber-400/40 shadow-sm"
                title="পোস্টার জেনারেটর"
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-300" />
              </button>
            )}
            {!loggedInRole && (
              <button
                onClick={onOpenAuth}
                className="flex items-center justify-center rounded-lg bg-blue-800 hover:bg-blue-750 border border-white/20 p-2 text-amber-300 shadow-sm"
              >
                <KeyRound className="h-4.5 w-4.5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-200 hover:bg-blue-800 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden shrink-0 border-t border-blue-950 bg-blue-950 px-4 py-4 space-y-2 animate-fade-in">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as any)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
                activeView === item.id 
                  ? 'bg-blue-800 text-amber-400 font-bold' 
                  : 'text-slate-150 hover:bg-blue-900'
              }`}
            >
              <item.icon className="h-4.5 w-4.5 text-slate-300" />
              <span>{item.label}</span>
            </button>
          ))}
          
          {/* Mobile Birthday Button */}
          <button
            onClick={() => {
              setBirthdayModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-rose-700 to-pink-700 text-white shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Cake className="h-4.5 w-4.5 text-amber-300" />
              <span>🎂 শিক্ষার্থী জন্মদিন রিমাইন্ডার ও কাউন্টডাউন</span>
            </div>
            {upcomingBirthdaysCount > 0 && (
              <span className="bg-amber-400 text-blue-950 px-2 py-0.5 rounded-full font-black text-[10px]">
                {upcomingBirthdaysCount} জন
              </span>
            )}
          </button>
          
          {loggedInRole && (
            <div className="border-t border-blue-905 pt-3 mt-2 flex items-center justify-between">
              <div>
                <span className="block text-[8px] font-bold text-emerald-400 font-mono">AUTHORIZED ROLE</span>
                <span className="block text-xs font-bold text-slate-150">{loggedInRole}</span>
              </div>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="rounded bg-rose-600 text-white font-bold px-3 py-1.5 text-xs border border-rose-500"
              >
                লগআউট করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* Birthday Modal */}
      {birthdayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl my-auto animate-scale-up">
            <button
              onClick={() => setBirthdayModalOpen(false)}
              className="absolute -top-3 -right-3 z-30 h-9 w-9 rounded-full bg-slate-900 text-white hover:bg-rose-600 flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>
            <BirthdayReminderCountdown />
          </div>
        </div>
      )}
    </header>
  );
};
