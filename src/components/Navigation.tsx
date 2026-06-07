/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, KeyRound, Monitor, ScanLine, Menu, X, Landmark } from 'lucide-react';
import { UserRole } from '../types';
import { useSchool } from '../context/SchoolContext';

interface NavigationProps {
  activeView: 'home' | 'scanner' | 'portal';
  setActiveView: (view: 'home' | 'scanner' | 'portal') => void;
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
  const { schoolName, schoolSlogan, schoolLogoType, schoolLogoVal } = useSchool();

  const navItems = [
    { id: 'home', label: '১। হোম পেইজ ও বিবরণ', icon: Landmark },
    { id: 'scanner', label: '২। ডিজিটাল ট্র্যাকার ডিভাইস', icon: ScanLine },
    { id: 'portal', label: '৩। ডিজিটাল পোর্টাল ও ERP', icon: KeyRound }
  ];

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
            {navItems.map((item) => (
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

          {/* User Sign In controls */}
          <div className="hidden lg:flex items-center gap-2">
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
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold px-4 py-2 text-xs transition-all shadow-md shadow-amber-500/15 cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                <span>সার্ভিস লগইন</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            {!loggedInRole && (
              <button
                onClick={onOpenAuth}
                className="flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 p-2 text-blue-950 shadow-sm"
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
          {navItems.map((item) => (
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
    </header>
  );
};
