/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProvider } from './context/SchoolContext';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { AttendanceSimulator } from './components/AttendanceSimulator';
import { AuthModal } from './components/AuthModal';
import { DashboardPortals } from './components/DashboardPortals';
import { SystemControlPanel } from './components/SystemControlPanel';
import { UserRole } from './types';
import { Shield, Sparkles, KeyRound, Monitor, ScanLine, CreditCard, ChevronRight } from 'lucide-react';

function AppContent() {
  const [activeView, setActiveView] = useState<'home' | 'scanner' | 'portal'>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loggedInRole, setLoggedInRole] = useState<UserRole | null>(null);
  const [prospectData, setProspectData] = useState<{
    studentName: string;
    parentName: string;
    phone: string;
    className: string;
  } | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'developer') {
      setActiveView('portal');
      setAuthModalOpen(true);
    }
  }, []);

  const handleLoginSuccess = (role: UserRole) => {
    setLoggedInRole(role);
    setActiveView('portal'); // instantly jump to portal dashboard on logon!
  };

  const handleLogout = () => {
    setLoggedInRole(null);
    setProspectData(null);
    setActiveView('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-50 selection:text-blue-900 antialiased">
      
      {/* Dynamic Nav Header */}
      <Navigation 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onOpenAuth={() => setAuthModalOpen(true)}
        loggedInRole={loggedInRole}
        onLogout={handleLogout}
      />

      {/* Main Content Grid */}
      <div className="transition-all duration-300">
        {activeView === 'home' && (
          <LandingPage 
            onOpenAuth={() => setAuthModalOpen(true)} 
            loggedInRole={loggedInRole}
            onLeadAutoLogin={(stName, guardName, ph, cl) => {
              setProspectData({ studentName: stName, parentName: guardName, phone: ph, className: cl });
              setLoggedInRole('Prospect');
              setActiveView('portal');
            }}
          />
        )}
        
        {activeView === 'scanner' && (
          <AttendanceSimulator />
        )}
        
        {activeView === 'portal' && (
          <>
            {loggedInRole ? (
              // If authorized, route to correct dashboard tier
              loggedInRole === 'Admin' || loggedInRole === 'Developer' ? (
                <SystemControlPanel role={loggedInRole} onLogout={handleLogout} />
              ) : (
                <DashboardPortals 
                  role={loggedInRole} 
                  onLogout={handleLogout} 
                  prospectData={prospectData}
                  onUpgradeToGuardian={() => {
                    setLoggedInRole('Guardian');
                  }}
                />
              )
            ) : (
              // Secure lockdown splash screen if not signed in
              <div className="mx-auto max-w-4xl px-4 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-150 text-blue-900 shadow-sm mb-6">
                  <Shield className="h-7 w-7 animate-pulse" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 md:text-4xl leading-tight">
                  ডিলিকন ডিজিটাল গেটওয়ে পোর্টাল লকডাউন
                </h1>
                <p className="text-xs text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
                  নিরাপত্তা স্বার্থে একাডেমিক তথ্য, রুটিন, রেজাল্ট কার্ড, এটেনডেন্স লগ ও ম্যানেজমেন্ট ইআরপি সফটওয়্যার ব্যবহার করতে সাইন-ইন করা আবশ্যক।
                </p>
                
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-3 text-xs transition-all shadow-md cursor-pointer"
                  >
                    <KeyRound className="h-4.5 w-4.5" />
                    পোর্টাল সাইন-ইন গেট খুলুন
                  </button>
                  <button
                    onClick={() => setActiveView('home')}
                    className="rounded-lg border border-slate-300 bg-white hover:bg-slate-550 text-slate-700 font-bold px-6 py-3 text-xs transition-all cursor-pointer"
                  >
                    ফিরে যান মূল ওয়েবসাইটে
                  </button>
                </div>

                {/* Secure Badge */}
                <div className="mt-12 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-500 font-mono shadow-sm">
                  <span>SSL SECURED CONNECT</span>
                  <span className="text-emerald-500">• ONLINE</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>


      {/* Global Interactive Sign In Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <AppContent />
    </SchoolProvider>
  );
}
