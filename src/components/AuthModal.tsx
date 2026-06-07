/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Users, LogIn, Code, X } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { portalCredentials } = useSchool();
  const isDevMode = new URLSearchParams(window.location.search).get('mode') === 'developer';
  const [activeTab, setActiveTab] = useState<'users' | 'management'>(() => {
    return isDevMode ? 'management' : 'users';
  });
  const [phoneInput, setPhoneInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = (role: UserRole) => {
    onLoginSuccess(role);
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || !passInput) {
      setErrorMessage('অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন');
      return;
    }

    const userInputClean = phoneInput.toLowerCase().trim();

    // Check with developer-configured dashboard credentials first
    const matchedCred = portalCredentials.find(
      (c) => c.user.toLowerCase().trim() === userInputClean && c.pass === passInput
    );

    if (matchedCred) {
      handleQuickLogin(matchedCred.role);
      return;
    }

    // Dynamic checks
    if (activeTab === 'users') {
      if (phoneInput === 'teacher' || phoneInput === '01711111111') {
        handleQuickLogin('Teacher');
      } else if (phoneInput === 'guardian' || phoneInput === '01822222222') {
        handleQuickLogin('Guardian');
      } else {
        // Fallback default
        handleQuickLogin('Student');
      }
    } else {
      if (userInputClean === 'dev' || userInputClean === 'developer' || passInput === 'dev' || passInput === 'dev123') {
        handleQuickLogin('Developer');
      } else {
        handleQuickLogin('Admin');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
      <div id="auth_modal_container" className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-amber-50/40 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-900" />
            <h3 className="font-bold text-slate-800 text-sm">ডিলিকন ডিজিটাল সাইন-ইন গেটওয়ে</h3>
          </div>
          <button 
            id="auth_modal_close_btn"
            onClick={onClose} 
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-150">
          <button
            id="auth_tab_users_btn"
            onClick={() => { setActiveTab('users'); setPhoneInput(''); setPassInput(''); setErrorMessage(''); }}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'users' 
                ? 'border-amber-500 text-blue-900 bg-blue-50/30' 
                : 'border-transparent text-slate-500 hover:text-blue-900'
            }`}
          >
            ১। ইউজার ও একাডেমিক পোর্টাল
          </button>
          <button
            id="auth_tab_mgt_btn"
            onClick={() => { setActiveTab('management'); setPhoneInput(''); setPassInput(''); setErrorMessage(''); }}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'management' 
                ? 'border-amber-500 text-blue-900 bg-blue-50/30' 
                : 'border-transparent text-slate-500 hover:text-blue-900'
            }`}
          >
            ২। ম্যানেজমেন্ট ও ডেভেলপার কন্ট্রোল
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {activeTab === 'users' ? 'ইউজারনেম / মোবাইল নম্বর' : 'ম্যানেজমেন্ট কী / কোড'}
              </label>
              <input 
                id="auth_phone_or_key_input"
                type="text" 
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder={activeTab === 'users' ? "যেমন: teacher বা 01711111111" : "যেমন: admin বা dev"}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-blue-900 text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                গোপন পাসওয়ার্ড
              </label>
              <input 
                id="auth_password_input"
                type="password" 
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-blue-900 text-slate-800 bg-white"
              />
            </div>

            {errorMessage && (
              <p className="text-[11px] font-semibold text-rose-500 bg-rose-50 p-2 rounded border border-rose-100">
                {errorMessage}
              </p>
            )}

            <button
              id="auth_submit_login_btn"
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 hover:bg-blue-800 p-2.5 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
            >
              <LogIn className="h-4 w-4 text-amber-500" />
              <span>নিরাপদে সাইন-ইন করুন</span>
            </button>
          </form>

          {/* Quick Demoplay sandbox triggers */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                সহজ পরীক্ষামূলক ডেমো অ্যাকাউন্টস
              </span>
            </div>
          </div>

          {activeTab === 'users' ? (
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <button
                id="demo_login_teacher_btn"
                type="button"
                onClick={() => handleQuickLogin('Teacher')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-blue-100 bg-blue-50/40 hover:bg-blue-50 transition-all text-blue-900 cursor-pointer"
              >
                <Users className="h-4 w-4 mb-1 text-blue-900" />
                <span className="text-[10px] font-bold">ডেমো শিক্ষক</span>
              </button>
              <button
                id="demo_login_guardian_btn"
                type="button"
                onClick={() => handleQuickLogin('Guardian')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-emerald-100/70 bg-emerald-50/50 hover:bg-emerald-50 transition-all text-emerald-700 cursor-pointer"
              >
                <Users className="h-4 w-4 mb-1 text-emerald-700" />
                <span className="text-[10px] font-bold">ডেমো অভিভাবক</span>
              </button>
              <button
                id="demo_login_student_btn"
                type="button"
                onClick={() => handleQuickLogin('Student')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all text-slate-700 cursor-pointer"
              >
                <Users className="h-4 w-4 mb-1 text-slate-500" />
                <span className="text-[10px] font-bold">ডেমো শিক্ষার্থী</span>
              </button>
              <button
                id="demo_login_prospect_btn"
                type="button"
                onClick={() => handleQuickLogin('Prospect')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-sky-100 bg-sky-50 val-auth-prospect hover:bg-sky-150 transition-all text-sky-700 cursor-pointer"
              >
                <Users className="h-4 w-4 mb-1 text-sky-650" />
                <span className="text-[10px] font-bold">আবেদনকারী</span>
              </button>
              <button
                id="demo_login_assistant_btn"
                type="button"
                onClick={() => handleQuickLogin('Assistant')}
                className="col-span-2 flex flex-col items-center justify-center p-2 rounded-lg border border-amber-150 bg-amber-50/40 hover:bg-amber-100/30 transition-all text-amber-900 cursor-pointer font-bold"
              >
                <Users className="h-4 w-4 mb-1 text-amber-600" />
                <span className="text-[10.5px]">অফিস সহকারী (ডাটা এন্ট্রি পোর্টাল)</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <button
                id="demo_login_admin_btn"
                onClick={() => handleQuickLogin('Admin')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-blue-150 bg-blue-50/30 hover:bg-blue-50 transition-all text-blue-900 cursor-pointer"
              >
                <Shield className="h-4 w-4 mb-1 text-blue-900" />
                <span className="text-[11px] font-bold">স্কুল এডমিন</span>
              </button>
              <button
                id="demo_login_dev_btn"
                onClick={() => handleQuickLogin('Developer')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-amber-250 bg-amber-50/30 hover:bg-amber-100/40 transition-all text-amber-900 cursor-pointer"
              >
                <Code className="h-4 w-4 mb-1 text-amber-600" />
                <span className="text-[11px] font-bold">ডেভেলপার প্যানেল</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
