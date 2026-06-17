/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Student } from '../types';
import { useSchool } from '../context/SchoolContext';
import { ShieldCheck, Printer, Eye, Award, Download, RefreshCw, Sparkles, Phone, CalendarRange } from 'lucide-react';

interface DigitalStudentIdCardProps {
  student: Student;
}

export const DigitalStudentIdCard: React.FC<DigitalStudentIdCardProps> = ({ student }) => {
  const { schoolName, schoolSlogan, schoolLogoType, schoolLogoVal } = useSchool();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<'navy' | 'crimson' | 'emerald' | 'purple'>('navy');
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});

  // Fetch custom photos on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('delicon_custom_photos');
      if (saved) {
        setCustomPhotos(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom photos in ID Card component', e);
    }
  }, [student.id]);

  // Generate real dynamic scannable QR code of MIR- student token 
  useEffect(() => {
    const generateQR = async () => {
      try {
        const tokenVal = `TOKEN=MIR-${student.id.toUpperCase()}`;
        const url = await QRCode.toDataURL(tokenVal, {
          margin: 1.5,
          color: {
            dark: '#111827',
            light: '#ffffff',
          },
          width: 130,
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    };
    generateQR();
  }, [student.id]);

  // Custom styling presets based on themes
  const themeStyles = {
    navy: {
      primary: 'bg-indigo-950',
      accent: 'text-amber-400 bg-amber-400/10',
      badge: 'bg-blue-50 text-indigo-950 border-blue-200',
      border: 'border-indigo-900',
      bannerGrad: 'from-blue-950 via-indigo-950 to-slate-900',
      logoCircle: 'border-amber-400 bg-indigo-900',
      glow: 'shadow-lg shadow-indigo-950/20',
      mainText: 'text-indigo-950'
    },
    crimson: {
      primary: 'bg-rose-900',
      accent: 'text-rose-300 bg-rose-400/10',
      badge: 'bg-rose-50 text-rose-900 border-rose-200',
      border: 'border-rose-800',
      bannerGrad: 'from-rose-900 via-rose-950 to-stone-900',
      logoCircle: 'border-rose-300 bg-rose-900',
      glow: 'shadow-lg shadow-rose-950/20',
      mainText: 'text-rose-900'
    },
    emerald: {
      primary: 'bg-emerald-950',
      accent: 'text-yellow-400 bg-yellow-400/10',
      badge: 'bg-emerald-50 text-emerald-950 border-emerald-200',
      border: 'border-emerald-900',
      bannerGrad: 'from-emerald-950 via-emerald-900 to-slate-900',
      logoCircle: 'border-yellow-400 bg-emerald-950',
      glow: 'shadow-lg shadow-emerald-950/20',
      mainText: 'text-emerald-950'
    },
    purple: {
      primary: 'bg-violet-950',
      accent: 'text-pink-400 bg-pink-400/10',
      badge: 'bg-violet-50 text-violet-950 border-violet-200',
      border: 'border-violet-900',
      bannerGrad: 'from-violet-950 via-fuchsia-950 to-slate-900',
      logoCircle: 'border-pink-300 bg-violet-900',
      glow: 'shadow-lg shadow-violet-950/20',
      mainText: 'text-violet-950'
    },
  };

  const activeTheme = themeStyles[selectedTheme];

  // Printable ID Card handler using standard print dialog targeting printable cards block
  const triggerPrintCard = () => {
    const printContent = document.getElementById('printable-id-card-layout');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const customStyles = `
      <html>
        <head>
          <title>STUDENT-ID-CARD-${student.name.replace(/\s+/g, '_')}</title>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              background-color: #ffffff;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .id-card-to-print {
              border: 1px solid #e2e8f0;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body onload="setTimeout(function(){ window.print(); window.close(); }, 500)">
          <div class="flex gap-12 flex-row scale-110">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(customStyles);
    printWindow.document.close();
  };

  const studentPhoto = customPhotos[student.id];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      
      {/* Configuration Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-2 font-sans">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-900" />
            ডিজিটাল কিউআর স্টুডেন্ট আইডি কার্ড (ID Card)
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-sans">
            স্বয়ংক্রিয় প্রিন্ট ও প্রমিত ল্যামিনেশন ফরম্যাটে আইডি কার্ড রেন্ডারিং
          </p>
        </div>

        {/* Action Button & Theme Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Theme circles */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 select-none">
            <button
              onClick={() => setSelectedTheme('navy')}
              className={`h-3.5 w-3.5 rounded-full bg-indigo-905 cursor-pointer ring-offset-1 transition-all ${selectedTheme === 'navy' ? 'ring-2 ring-indigo-950 scale-115' : 'opacity-80'}`}
              title="ডিজিটাল নেভি ব্লু"
            />
            <button
              onClick={() => setSelectedTheme('crimson')}
              className={`h-3.5 w-3.5 rounded-full bg-rose-805 cursor-pointer ring-offset-1 transition-all ${selectedTheme === 'crimson' ? 'ring-2 ring-rose-700 scale-115' : 'opacity-80'}`}
              title="রয়াল ক্রিমসন লাল"
            />
            <button
              onClick={() => setSelectedTheme('emerald')}
              className={`h-3.5 w-3.5 rounded-full bg-emerald-805 cursor-pointer ring-offset-1 transition-all ${selectedTheme === 'emerald' ? 'ring-2 ring-emerald-700 scale-115' : 'opacity-80'}`}
              title="অর্গানিক এমারেল্ড গ্রিন"
            />
            <button
              onClick={() => setSelectedTheme('purple')}
              className={`h-3.5 w-3.5 rounded-full bg-violet-805 cursor-pointer ring-offset-1 transition-all ${selectedTheme === 'purple' ? 'ring-2 ring-violet-700 scale-115' : 'opacity-80'}`}
              title="কসমিক ভাইওলেট বেগুনি"
            />
          </div>

          <button
            type="button"
            onClick={triggerPrintCard}
            className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-black text-[10px] px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <Printer className="h-3.5 w-3.5 text-amber-300" />
            আইডি কার্ড প্রিন্ট করুন
          </button>
        </div>
      </div>

      {/* Visual Identity Preview Sandbox */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center py-4 bg-slate-50/50 rounded-2xl border border-slate-100">
        
        {/* Container for grabbing clone into print window */}
        <div id="printable-id-card-layout" className="flex flex-col sm:flex-row gap-6">
          
          {/* ==================== CARD FRONT ==================== */}
          <div className={`w-[260px] h-[390px] rounded-2xl bg-white border border-slate-200 flex flex-col justify-between overflow-hidden shadow-md font-sans tracking-tight relative id-card-to-print`}>
            
            {/* Top Wave/Header Band */}
            <div className={`h-[80px] bg-gradient-to-r ${activeTheme.bannerGrad} p-3 text-white flex gap-2 items-center relative border-b-2 border-amber-400`}>
              {/* Top background visual grids */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]" />
              
              {/* Crest Logo */}
              <div className={`h-11 w-11 rounded-full border flex items-center justify-center shrink-0 text-xl overflow-hidden shadow-xs ${activeTheme.logoCircle}`}>
                {schoolLogoType === 'crest' ? (
                  <span>{schoolLogoVal}</span>
                ) : schoolLogoType === 'image' ? (
                  <img src={schoolLogoVal} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-sm text-yellow-300">{schoolLogoVal || 'D'}</span>
                )}
              </div>
              
              {/* School Names titles */}
              <div className="flex flex-col justify-center min-w-0">
                <h4 className="font-extrabold text-[10.5px] leading-tight text-white tracking-wide uppercase truncate">
                  {schoolName || 'মিরাজুল মাদারিস মাদরাসা'}
                </h4>
                <p className="text-[7.5px] text-amber-205 leading-none mt-0.5 uppercase tracking-wider truncate opacity-90">
                  {schoolSlogan || 'দ্বীনি ও আধুনিক শিক্ষার সমন্বয়'}
                </p>
                <span className="text-[6.5px] text-zinc-300 font-bold uppercase mt-1 tracking-widest font-mono">
                  MIRAJUL MADARIS ACADEMY
                </span>
              </div>
            </div>

            {/* Main Information Center Container */}
            <div className="flex-1 p-3.5 flex flex-col items-center justify-center space-y-3">
              
              {/* Profile Photo Display Frame */}
              <div className="relative">
                <div className={`h-22 w-22 rounded-full border-2 p-1 bg-white ${activeTheme.border} ${activeTheme.glow} flex items-center justify-center overflow-hidden`}>
                  {studentPhoto ? (
                    <img 
                      src={studentPhoto} 
                      alt={student.name}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-full h-full rounded-full bg-slate-100 flex items-center justify-center font-bold text-2xl ${activeTheme.mainText}`}>
                      {student.name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Embedded Active Badge Ribbon */}
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-black text-[7.5px] px-1.5 py-0.5 rounded-full border border-white uppercase shadow-xs select-none">
                  Active
                </span>
              </div>

              {/* Names & Class Metadata */}
              <div className="text-center space-y-1 w-full">
                <h3 className="font-black text-slate-900 text-xs tracking-wide leading-none BanglaName">
                  {student.banglaName}
                </h3>
                <p className="font-bold text-slate-500 text-[9.5px] leading-none uppercase font-mono tracking-tight pt-0.5">
                  {student.name}
                </p>
                
                {/* Secondary label identifier tag */}
                <div className={`inline-block mt-1 bg-indigo-50 border border-slate-100 rounded px-2.5 py-0.5`}>
                  <p className="text-[8.5px] font-extrabold text-indigo-950">
                    স্টুডেন্ট আইডি (Student ID)
                  </p>
                </div>
              </div>

              {/* Essential Credentials Grid */}
              <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[9px] space-y-1.5 font-sans leading-none">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 uppercase">শ্রেণী:</span>
                  <span className="font-black text-slate-900 bg-white border border-slate-200 px-1.5 py-0.5 rounded">{student.className}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 uppercase">রোল নং (Roll):</span>
                  <span className="font-mono font-black text-slate-900 bg-white border border-slate-200 px-1.5 py-0.5 rounded">{student.roll}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 uppercase">কার্ড নং (ID):</span>
                  <span className="font-mono font-black text-slate-900 uppercase">MIR-{student.id.toUpperCase()}</span>
                </div>
              </div>

            </div>

            {/* Bottom Safe Guard Stamp footer */}
            <div className={`h-[32px] ${activeTheme.primary} border-t-2 border-amber-400 flex items-center justify-between px-3 text-white`}>
              <span className="text-[7px] font-black tracking-widest font-mono text-amber-300">
                CAMPUS ACCESS BAR
              </span>
              <span className="text-[7.5px] font-bold text-zinc-300 font-sans">
                ২০২৬ শিক্ষাবর্ষ
              </span>
            </div>

          </div>


          {/* ==================== CARD BACK ==================== */}
          <div className="w-[260px] h-[390px] rounded-2xl bg-white border border-slate-200 flex flex-col justify-between overflow-hidden shadow-md font-sans tracking-tight relative id-card-to-print">
            
            {/* Top accent design highlight */}
            <div className={`h-2.5 bg-gradient-to-r ${activeTheme.bannerGrad}`} />

            {/* Primary scannable core area */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center space-y-4">
              
              {/* QR Code Canvas rendering area */}
              <div className="text-center space-y-2">
                <div className="p-1.5 bg-white border-2 border-slate-200 rounded-xl shadow-xs inline-block">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="Student Gate QR Token" 
                      className="h-26 w-26 object-contain"
                    />
                  ) : (
                    <div className="h-26 w-26 bg-slate-100 flex items-center justify-center rounded">
                      <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest font-mono leading-none">
                  Scan for Gate Attendance
                </p>
              </div>

              {/* Instructions and safety measures list */}
              <div className="w-full text-slate-600 text-[7px] space-y-1 border-t border-b border-slate-100 py-3 leading-relaxed">
                <p className="font-bold text-slate-800 text-center text-[7.5px] pb-1 font-sans">অনুমোদন ও ব্যবহারের নির্দেশনাবলী:</p>
                <p className="flex gap-1">
                  <span className="text-amber-500 font-extrabold">১।</span> 
                  এই আইডি কার্ড মিরাজুল মাদারিস মাদরাসার অভ্যন্তরীণ সম্পত্তি।
                </p>
                <p className="flex gap-1">
                  <span className="text-amber-500 font-extrabold">২।</span> 
                  ক্যাম্পাস গেটে প্রবেশের সময় অবশ্যই কিউআর কোড স্ক্যান করতে হবে।
                </p>
                <p className="flex gap-1">
                  <span className="text-amber-500 font-extrabold">৩।</span> 
                  কার্ড হারিয়ে গেলে তাৎক্ষণিকভাবে অ্যাডমিন দপ্তরে যোগাযোগ করুন।
                </p>
              </div>

              {/* Parental / Emergency Hotlines */}
              <div className="w-full bg-slate-50 p-2 rounded-lg border border-slate-150/75 text-left text-[7.5px]">
                <p className="text-slate-500 font-bold leading-none mb-1">অভিভাবক ফোন নম্বর:</p>
                <p className="font-mono font-black text-slate-800 flex items-center gap-1">
                  <Phone className="h-2.5 w-2.5 text-blue-900" />
                  {student.guardianPhone || 'N/A'}
                </p>
              </div>

            </div>

            {/* Bottom Principal Signature Seal */}
            <div className="p-3 bg-slate-50 border-t border-slate-150 flex items-center justify-between text-[7px]">
              <div className="flex flex-col">
                <span className="font-bold text-slate-400 uppercase leading-none">VALID UNTIL</span>
                <span className="font-bold font-mono text-slate-800 mt-1">DECEMBER 2026</span>
              </div>
              
              {/* Authorized Principal signature */}
              <div className="flex flex-col items-center">
                <div className="h-5 w-18 border-b border-indigo-400/40 relative flex items-center justify-center">
                  <span className="text-[8px] font-serif italic text-blue-900/60 font-bold select-none rotate-[-4deg]">
                    Principal
                  </span>
                </div>
                <span className="text-[6.5px] font-black tracking-wider text-slate-500 mt-1 uppercase leading-none">অনুমোদিত সই</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Guide Card Alert explaining dynamic QR features */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-205/60 text-xs flex gap-2.5 items-start">
        <Sparkles className="h-4.5 w-4.5 text-blue-900 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-extrabold text-blue-950 text-[10.5px]">রিয়েল-টাইম আরএফআইডি / কিউআর কোড স্ক্যান সুবিধা</h4>
          <p className="text-[9.5px] text-slate-500 leading-normal font-sans">
            এই আইডি কার্ডের পিছনের কিউআর কোডে যুক্ত আছে ইউনিক রিফ ডিরেক্টরি টোকেন <code className="bg-white border border-slate-200 px-1 py-0.5 font-mono text-[8px] text-indigo-950 rounded select-all font-bold">TOKEN=MIR-{student.id.toUpperCase()}</code> যা আমাদের ক্যাম্পাসের গেট স্ক্যানার ও আরএফআইডি সিমুলেটরে স্পর্শ করার সাথে সাথে তাৎক্ষণিক প্রবেশ নিশ্চিত করে এবং আপনার ফোনে এসএমএস নোটিফিকেশন পাঠায়।
          </p>
        </div>
      </div>

    </div>
  );
};
