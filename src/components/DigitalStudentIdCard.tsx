/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Student } from '../types';
import { useSchool } from '../context/SchoolContext';
import { 
  ShieldCheck, Printer, Award, Download, RefreshCw, 
  Sparkles, Phone, Camera, Check, QrCode as QrIcon, 
  Eye, Copy, UserCheck, Layers, FileText, Smartphone
} from 'lucide-react';

interface DigitalStudentIdCardProps {
  student: Student;
  isStudentPortal?: boolean;
}

export const DigitalStudentIdCard: React.FC<DigitalStudentIdCardProps> = ({ 
  student,
  isStudentPortal = false 
}) => {
  const { schoolName, schoolSlogan, schoolLogoType, schoolLogoVal } = useSchool();
  
  // Customization states
  const [selectedTheme, setSelectedTheme] = useState<'navy' | 'emerald' | 'crimson' | 'purple'>('navy');
  const [cardLayout, setCardLayout] = useState<'portrait' | 'landscape'>('portrait');
  const [qrDataMode, setQrDataMode] = useState<'profile' | 'token'>('profile');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const [showTestScanModal, setShowTestScanModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Construct QR Payload based on student's profile data
  const qrPayload = React.useMemo(() => {
    if (qrDataMode === 'profile') {
      return JSON.stringify({
        school: schoolName || 'Delicon Model Academy',
        studentId: `DEL-${student.id.toUpperCase()}`,
        name: student.name,
        banglaName: student.banglaName,
        className: student.className,
        roll: student.roll,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        session: '2026',
        verified: true,
        verificationUrl: `${window.location.origin}/?verify=student&id=${student.id}`
      }, null, 2);
    } else {
      // Gate Access & RFID Token format
      return `TOKEN=DELICON-${student.id.toUpperCase()};NAME=${encodeURIComponent(student.name)};CLASS=${encodeURIComponent(student.className)};ROLL=${student.roll}`;
    }
  }, [student, qrDataMode, schoolName]);

  // Generate dynamic scannable QR code based on student profile data
  useEffect(() => {
    let isMounted = true;
    const generateQR = async () => {
      setIsGenerating(true);
      try {
        const url = await QRCode.toDataURL(qrPayload, {
          margin: 1.5,
          color: {
            dark: selectedTheme === 'navy' ? '#0f172a' : selectedTheme === 'crimson' ? '#881337' : selectedTheme === 'emerald' ? '#064e3b' : '#3b0764',
            light: '#ffffff',
          },
          width: 180,
          errorCorrectionLevel: 'M'
        });
        if (isMounted) {
          setQrCodeUrl(url);
        }
      } catch (err) {
        console.error('Failed to generate student profile QR code', err);
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    };
    generateQR();
    return () => {
      isMounted = false;
    };
  }, [student.id, qrPayload, selectedTheme]);

  // Color Presets
  const themeStyles = {
    navy: {
      primary: 'bg-blue-950',
      accent: 'text-amber-400 bg-amber-400/10',
      badge: 'bg-blue-50 text-blue-950 border-blue-200',
      border: 'border-blue-900',
      bannerGrad: 'from-blue-950 via-indigo-950 to-slate-900',
      headerBg: '#0f172a',
      accentColor: '#f59e0b',
      logoCircle: 'border-amber-400 bg-blue-900',
      glow: 'shadow-lg shadow-blue-950/20',
      mainText: 'text-blue-950'
    },
    emerald: {
      primary: 'bg-emerald-950',
      accent: 'text-emerald-400 bg-emerald-400/10',
      badge: 'bg-emerald-50 text-emerald-950 border-emerald-200',
      border: 'border-emerald-900',
      bannerGrad: 'from-emerald-950 via-teal-950 to-slate-900',
      headerBg: '#064e3b',
      accentColor: '#10b981',
      logoCircle: 'border-yellow-400 bg-emerald-950',
      glow: 'shadow-lg shadow-emerald-950/20',
      mainText: 'text-emerald-950'
    },
    crimson: {
      primary: 'bg-rose-950',
      accent: 'text-rose-300 bg-rose-400/10',
      badge: 'bg-rose-50 text-rose-900 border-rose-200',
      border: 'border-rose-900',
      bannerGrad: 'from-rose-950 via-pink-950 to-stone-900',
      headerBg: '#4c0519',
      accentColor: '#f43f5e',
      logoCircle: 'border-rose-300 bg-rose-900',
      glow: 'shadow-lg shadow-rose-950/20',
      mainText: 'text-rose-950'
    },
    purple: {
      primary: 'bg-purple-950',
      accent: 'text-purple-300 bg-purple-400/10',
      badge: 'bg-purple-50 text-purple-950 border-purple-200',
      border: 'border-purple-900',
      bannerGrad: 'from-purple-950 via-violet-950 to-slate-900',
      headerBg: '#3b0764',
      accentColor: '#c084fc',
      logoCircle: 'border-pink-300 bg-purple-900',
      glow: 'shadow-lg shadow-purple-950/20',
      mainText: 'text-purple-950'
    },
  };

  const activeTheme = themeStyles[selectedTheme];
  const studentPhoto = customPhotos[student.id];

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const newPhoto = uploadEvent.target.result as string;
          const updated = { ...customPhotos, [student.id]: newPhoto };
          setCustomPhotos(updated);
          localStorage.setItem('delicon_custom_photos', JSON.stringify(updated));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Safe Standard A4 Print (without window.open)
  const handlePrintCard = () => {
    window.print();
  };

  // High-Resolution PNG Image Download using HTML5 Canvas
  const handleDownloadImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size for crisp 300dpi ID Card output (Front & Back together: 800 x 560)
      canvas.width = 860;
      canvas.height = 560;

      // Canvas background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Function to draw a card side on canvas
      const drawCard = async (
        x: number, 
        y: number, 
        w: number, 
        h: number, 
        isBack: boolean
      ) => {
        // Draw card rounded shadow/border
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 16);
        ctx.fill();
        ctx.stroke();
        ctx.clip();

        // Header band
        ctx.fillStyle = activeTheme.headerBg;
        ctx.fillRect(x, y, w, 85);

        // Gold divider line
        ctx.fillStyle = activeTheme.accentColor;
        ctx.fillRect(x, y + 83, w, 3);

        if (!isBack) {
          // FRONT HEADER
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(schoolName || 'Delicon Model Academy', x + 55, y + 35);
          
          ctx.fillStyle = activeTheme.accentColor;
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(schoolSlogan || 'স্মার্ট শিক্ষা ও প্রযুক্তির সমন্বয়', x + 55, y + 52);

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('DELICON MODEL ACADEMY • ESTD 2012', x + 55, y + 68);

          // Crest Badge
          ctx.fillStyle = activeTheme.accentColor;
          ctx.beginPath();
          ctx.arc(x + 30, y + 42, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('D', x + 30, y + 47);
          ctx.textAlign = 'left';

          // STUDENT PHOTO / AVATAR
          const photoCenterX = x + w / 2;
          const photoCenterY = y + 155;
          const photoRadius = 45;

          ctx.save();
          ctx.beginPath();
          ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          if (studentPhoto) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = studentPhoto;
            await new Promise((resolve) => {
              img.onload = () => {
                ctx.drawImage(img, photoCenterX - photoRadius, photoCenterY - photoRadius, photoRadius * 2, photoRadius * 2);
                resolve(null);
              };
              img.onerror = () => resolve(null);
            });
          } else {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(photoCenterX - photoRadius, photoCenterY - photoRadius, photoRadius * 2, photoRadius * 2);
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 32px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(student.name.charAt(0).toUpperCase(), photoCenterX, photoCenterY + 12);
            ctx.textAlign = 'left';
          }
          ctx.restore();

          // Photo border
          ctx.strokeStyle = activeTheme.headerBg;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Active Ribbon
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.roundRect(photoCenterX + 20, photoCenterY + 24, 45, 16, 8);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('ACTIVE', photoCenterX + 26, photoCenterY + 36);

          // STUDENT NAMES
          ctx.textAlign = 'center';
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 17px sans-serif';
          ctx.fillText(student.banglaName, photoCenterX, y + 230);

          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(student.name.toUpperCase(), photoCenterX, y + 248);

          // ID Badge
          ctx.fillStyle = '#e0e7ff';
          ctx.beginPath();
          ctx.roundRect(photoCenterX - 65, y + 260, 130, 22, 11);
          ctx.fill();
          ctx.fillStyle = '#1e1b4b';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('ডিজিটাল আইডি কার্ড', photoCenterX, y + 275);

          // DETAILS BOX
          const boxX = x + 25;
          const boxY = y + 295;
          const boxW = w - 50;
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, 130, 10);
          ctx.fill();
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('শ্রেণী (Class):', boxX + 15, boxY + 28);
          ctx.fillText('রোল নং (Roll):', boxX + 15, boxY + 58);
          ctx.fillText('কার্ড আইডি (ID):', boxX + 15, boxY + 88);
          ctx.fillText('সেশন (Session):', boxX + 15, boxY + 116);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(student.className, boxX + boxW - 15, boxY + 28);
          ctx.fillText(student.roll, boxX + boxW - 15, boxY + 58);
          ctx.font = 'bold 12px monospace';
          ctx.fillText(`DEL-${student.id.toUpperCase()}`, boxX + boxW - 15, boxY + 88);
          ctx.fillText('২০২৬ সেশন', boxX + boxW - 15, boxY + 116);

          // FOOTER
          ctx.fillStyle = activeTheme.headerBg;
          ctx.fillRect(x, y + h - 35, w, 35);
          ctx.fillStyle = activeTheme.accentColor;
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('SMART DIGITAL ID', x + 15, y + h - 14);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('ক্যাম্পাস এক্সেস কার্ড', x + w - 15, y + h - 14);

        } else {
          // BACK SIDE WITH QR CODE
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText('Student Verification & Gate QR', x + 20, y + 45);
          ctx.fillStyle = activeTheme.accentColor;
          ctx.font = '9px monospace';
          ctx.fillText('OFFICIAL IDENTITY SPECIFICATION', x + 20, y + 63);

          // QR Code rendering
          const qrCenterX = x + w / 2;
          const qrImg = new Image();
          qrImg.src = qrCodeUrl;
          await new Promise((resolve) => {
            qrImg.onload = () => {
              // White box for QR
              ctx.fillStyle = '#ffffff';
              ctx.strokeStyle = '#cbd5e1';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.roundRect(qrCenterX - 75, y + 105, 150, 150, 12);
              ctx.fill();
              ctx.stroke();

              ctx.drawImage(qrImg, qrCenterX - 65, y + 115, 130, 130);
              resolve(null);
            };
            qrImg.onerror = () => resolve(null);
          });

          ctx.textAlign = 'center';
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('SCAN FOR REAL-TIME ATTENDANCE', qrCenterX, y + 275);

          // Terms
          ctx.textAlign = 'left';
          ctx.fillStyle = '#334155';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('নির্দেশনাবলী:', x + 25, y + 310);
          ctx.font = '9px sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText('১। কার্ডটি ডিলিকন মডেল একাডেমির সম্পত্তি।', x + 25, y + 328);
          ctx.fillText('২। ক্লাসে প্রবেশের পূর্বে কিউআর স্ক্যান সম্পন্ন করুন।', x + 25, y + 345);
          ctx.fillText('৩। কার্ড হারিয়ে গেলে অফিসে দ্রুত অবহিত করুন।', x + 25, y + 362);

          // Guardian Hotline Box
          const hBoxX = x + 25;
          const hBoxY = y + 375;
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.roundRect(hBoxX, hBoxY, w - 50, 45, 8);
          ctx.fill();

          ctx.fillStyle = '#64748b';
          ctx.font = '9px sans-serif';
          ctx.fillText('অভিভাবক হটলাইন ও জরুরি যোগাযোগ:', hBoxX + 12, hBoxY + 18);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(student.guardianPhone || '+880 1711-223344', hBoxX + 12, hBoxY + 36);

          // Principal Signature Footer
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(x, y + h - 45, w, 45);
          ctx.strokeStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(x, y + h - 45);
          ctx.lineTo(x + w, y + h - 45);
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText('VALID UNTIL: DEC 2026', x + 20, y + h - 20);

          ctx.textAlign = 'right';
          ctx.font = 'italic bold 11px Georgia';
          ctx.fillStyle = '#1e293b';
          ctx.fillText('Principal Seal', x + w - 20, y + h - 22);
          ctx.font = 'bold 8px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('অনুমোদিত স্বাক্ষর', x + w - 20, y + h - 10);
        }

        ctx.restore();
      };

      // Draw Front Card (Left)
      await drawCard(35, 30, 370, 500, false);
      // Draw Back Card (Right)
      await drawCard(445, 30, 370, 500, true);

      // Export as PNG
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `Delicon_ID_Card_${student.name.replace(/\s+/g, '_')}_Class_${student.className.replace(/\s+/g, '_')}.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download ID card image:', err);
    }
  };

  // Copy Profile QR Payload
  const handleCopyQrData = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2500);
  };

  return (
    <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      
      {/* Print-specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-id-card-layout, #printable-id-card-layout * {
            visibility: visible !important;
          }
          #printable-id-card-layout {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 20mm !important;
            padding: 15mm !important;
            margin: 0 !important;
            z-index: 9999999 !important;
          }
          .id-card-print-target {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      `}} />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
            Verified Student Credential • Delicon Digital System
          </div>
          <h3 className="font-black text-slate-900 text-lg sm:text-xl font-sans tracking-tight">
            ডিজিটাল স্টুডেন্ট আইডি কার্ড ও কিউআর কোড জেনারেটর
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {student.banglaName} ({student.name}) - শ্রেণী: <strong className="text-blue-900">{student.className}</strong> | রোল: <strong className="text-blue-900">{student.roll}</strong>
          </p>
        </div>

        {/* Action Controls & Downloads */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download PNG Button */}
          <button
            type="button"
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 transition-all shadow-sm cursor-pointer"
            title="উচ্চ রেজোলিউশন পিএনজি ছবি ডাউনলোড করুন"
          >
            {downloadSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-200" />
                <span>ডাউনলোড সম্পন্ন!</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 text-emerald-200" />
                <span>আইডি কার্ড ডাউনলোড (PNG)</span>
              </>
            )}
          </button>

          {/* Standard A4 Print Button */}
          <button
            type="button"
            onClick={handlePrintCard}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 transition-all shadow-sm cursor-pointer"
            title="A4 সাইজ প্রমিত প্রিন্ট"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            <span>প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Generator Studio Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        
        {/* Control 1: Theme Selector */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
            কার্ড থিম ও কালার (Card Theme)
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTheme('navy')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                selectedTheme === 'navy' 
                  ? 'bg-blue-950 text-white border-blue-950 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              রয়্যাল নেভি
            </button>
            <button
              onClick={() => setSelectedTheme('emerald')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                selectedTheme === 'emerald' 
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              এমারেল্ড
            </button>
            <button
              onClick={() => setSelectedTheme('crimson')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                selectedTheme === 'crimson' 
                  ? 'bg-rose-900 text-white border-rose-900 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ক্রিমসন
            </button>
            <button
              onClick={() => setSelectedTheme('purple')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                selectedTheme === 'purple' 
                  ? 'bg-purple-900 text-white border-purple-900 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              পার্পল
            </button>
          </div>
        </div>

        {/* Control 2: QR Payload Mode */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
            কিউআর কোড ফরম্যাট (QR Data Mode)
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setQrDataMode('profile')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                qrDataMode === 'profile'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ফুল প্রোফাইল ডাটা
            </button>
            <button
              onClick={() => setQrDataMode('token')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                qrDataMode === 'token'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              গেট এক্সেস টোকেন
            </button>
          </div>
        </div>

        {/* Control 3: Photo Upload / Customizer */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
            প্রোফাইল ছবি পরিবর্তন (Photo)
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-[11px] font-bold transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-blue-900" />
            <span>{studentPhoto ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Control 4: Quick QR Verify Test Scanner */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
            কিউআর কোড টেস্ট (Verify QR)
          </label>
          <button
            type="button"
            onClick={() => setShowTestScanModal(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-[11px] font-bold transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            <span>স্ক্যান ডাটা প্রিভিউ করুন</span>
          </button>
        </div>

      </div>

      {/* Main Interactive Live ID Card Display Container */}
      <div className="flex flex-col items-center justify-center py-6 px-2 bg-gradient-to-b from-slate-100/70 to-slate-200/40 rounded-2xl border border-slate-200/80">
        
        <div className="text-center mb-5">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
            OFFICIAL SMART STUDENT ID CARD • DELICON MODEL ACADEMY
          </span>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            প্রিন্ট ও ডিজিটাল ল্যামিনেশনের জন্য প্রস্তুত প্রমিত আইডি কার্ড
          </p>
        </div>

        {/* Dual Card Layout: Front & Back side-by-side */}
        <div 
          id="printable-id-card-layout" 
          className="flex flex-col md:flex-row gap-6 lg:gap-8 justify-center items-center"
        >
          
          {/* ========================================================
              CARD FRONT SIDE
             ======================================================== */}
          <div className="w-[270px] h-[410px] rounded-2xl bg-white border border-slate-300 flex flex-col justify-between overflow-hidden shadow-xl font-sans tracking-tight relative id-card-print-target">
            
            {/* Top School Header Band */}
            <div className={`h-[85px] bg-gradient-to-r ${activeTheme.bannerGrad} p-3 text-white flex gap-2.5 items-center relative border-b-2 border-amber-400`}>
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]" />
              
              {/* Crest Logo */}
              <div className={`h-11 w-11 rounded-full border-2 flex items-center justify-center shrink-0 text-xl overflow-hidden shadow-xs ${activeTheme.logoCircle}`}>
                {schoolLogoType === 'crest' ? (
                  <span>{schoolLogoVal}</span>
                ) : schoolLogoType === 'image' ? (
                  <img src={schoolLogoVal} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-sm text-yellow-300">{schoolLogoVal || 'D'}</span>
                )}
              </div>
              
              {/* School Names & Slogans */}
              <div className="flex flex-col justify-center min-w-0">
                <h4 className="font-black text-[11px] leading-tight text-white tracking-wide uppercase truncate">
                  {schoolName || 'ডিলিকন মডেল একাডেমি'}
                </h4>
                <p className="text-[8px] text-amber-300 leading-none mt-0.5 uppercase tracking-wider truncate font-semibold">
                  {schoolSlogan || 'স্মার্ট শিক্ষা ও প্রযুক্তির অনন্য সমন্বয়'}
                </p>
                <span className="text-[6.5px] text-zinc-300 font-bold uppercase mt-1 tracking-widest font-mono">
                  DELICON MODEL ACADEMY
                </span>
              </div>
            </div>

            {/* Information Center */}
            <div className="flex-1 p-3.5 flex flex-col items-center justify-center space-y-3">
              
              {/* Student Portrait Photo */}
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
                    <div className={`w-full h-full rounded-full bg-slate-100 flex items-center justify-center font-black text-2xl ${activeTheme.mainText}`}>
                      {student.name[0]?.toUpperCase() || 'S'}
                    </div>
                  )}
                </div>
                
                {/* Embedded Active Badge */}
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white font-black text-[7.5px] px-1.5 py-0.5 rounded-full border border-white uppercase shadow-xs select-none">
                  Active
                </span>
              </div>

              {/* Student Name & Bangla Name */}
              <div className="text-center space-y-0.5 w-full">
                <h3 className="font-black text-slate-900 text-sm tracking-wide leading-tight">
                  {student.banglaName}
                </h3>
                <p className="font-bold text-slate-500 text-[10px] leading-none uppercase font-mono tracking-tight">
                  {student.name}
                </p>
                
                {/* Secondary identifier */}
                <div className="inline-block mt-1 bg-blue-50 border border-blue-100 rounded px-2.5 py-0.5">
                  <p className="text-[8.5px] font-black text-blue-950 uppercase tracking-wide">
                    ডিজিটাল স্টুডেন্ট আইডি
                  </p>
                </div>
              </div>

              {/* Essential Credentials Grid: Class, Roll, ID */}
              <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[9.5px] space-y-1.5 font-sans leading-none">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 uppercase">শ্রেণী (Class):</span>
                  <span className="font-black text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                    {student.className}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 uppercase">রোল নং (Roll):</span>
                  <span className="font-mono font-black text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                    {student.roll}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 uppercase">কার্ড আইডি (ID):</span>
                  <span className="font-mono font-black text-blue-900 uppercase">
                    DEL-{student.id.toUpperCase()}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Safeguard Footer */}
            <div className={`h-[34px] ${activeTheme.primary} border-t-2 border-amber-400 flex items-center justify-between px-3 text-white`}>
              <span className="text-[7.5px] font-black tracking-widest font-mono text-amber-300">
                CAMPUS ACCESS BAR
              </span>
              <span className="text-[8px] font-bold text-zinc-300 font-sans">
                ২০২৬ শিক্ষাবর্ষ
              </span>
            </div>

          </div>


          {/* ========================================================
              CARD BACK SIDE (With QR Code)
             ======================================================== */}
          <div className="w-[270px] h-[410px] rounded-2xl bg-white border border-slate-300 flex flex-col justify-between overflow-hidden shadow-xl font-sans tracking-tight relative id-card-print-target">
            
            {/* Top Accent Stripe */}
            <div className={`h-3 bg-gradient-to-r ${activeTheme.bannerGrad}`} />

            {/* Scannable Center Area */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center space-y-3">
              
              {/* QR Code Canvas */}
              <div className="text-center space-y-1.5">
                <div className="p-2 bg-white border-2 border-slate-200 rounded-xl shadow-xs inline-block">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="Student Gate QR Token" 
                      className="h-28 w-28 object-contain"
                    />
                  ) : (
                    <div className="h-28 w-28 bg-slate-100 flex items-center justify-center rounded">
                      <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono leading-none">
                  {qrDataMode === 'profile' ? 'VERIFIED PROFILE QR' : 'GATE ATTENDANCE TOKEN'}
                </p>
              </div>

              {/* Instructions and safety measures */}
              <div className="w-full text-slate-600 text-[8px] space-y-1 border-t border-b border-slate-100 py-2.5 leading-relaxed">
                <p className="font-bold text-slate-800 text-center text-[8.5px] pb-0.5 font-sans">অনুমোদন ও ব্যবহারের নির্দেশনাবলী:</p>
                <p className="flex gap-1">
                  <span className="text-amber-500 font-extrabold">১।</span> 
                  এই আইডি কার্ড ডিলিকন মডেল একাডেমির অভ্যন্তরীণ সম্পত্তি।
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

              {/* Emergency / Guardian Hotline */}
              <div className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-left text-[8px]">
                <p className="text-slate-500 font-bold leading-none mb-1">জরুরি যোগাযোগ / অভিভাবক:</p>
                <p className="font-mono font-black text-slate-900 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-blue-900" />
                  {student.guardianPhone || '+880 1711-223344'}
                </p>
              </div>

            </div>

            {/* Bottom Principal Signature Seal */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[7.5px]">
              <div className="flex flex-col">
                <span className="font-bold text-slate-400 uppercase leading-none">VALID UNTIL</span>
                <span className="font-bold font-mono text-slate-800 mt-1">DECEMBER 2026</span>
              </div>
              
              {/* Authorized Principal Signature */}
              <div className="flex flex-col items-center">
                <div className="h-5 w-20 border-b border-blue-400/40 relative flex items-center justify-center">
                  <span className="text-[9px] font-serif italic text-blue-900 font-bold select-none rotate-[-4deg]">
                    Principal Seal
                  </span>
                </div>
                <span className="text-[7px] font-black tracking-wider text-slate-500 mt-1 uppercase leading-none">
                  অনুমোদিত স্বাক্ষর
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* QR Code Payload Data Preview Card */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrIcon className="h-4 w-4 text-blue-900" />
            <h4 className="font-black text-slate-900 text-xs">
              কিউআর কোডে সংরক্ষিত প্রোফাইল ডাটা (Encoded QR Payload)
            </h4>
          </div>
          <button
            onClick={handleCopyQrData}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            {copiedData ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
            <span>{copiedData ? 'কপি হয়েছে!' : 'ডাটা কপি করুন'}</span>
          </button>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[10px] text-slate-800 whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
          {qrPayload}
        </div>

        <p className="text-[10px] text-slate-500">
          💡 যেকোনো স্মার্টফোন বা ক্যাম্পাসের ডিজিটাল টার্মিনাল দিয়ে আইডি কার্ডের কিউআর কোডটি স্ক্যান করলে স্বয়ংক্রিয়ভাবে শিক্ষার্থীর সত্যতা যাচাই হবে।
        </p>
      </div>

      {/* Test Scan & Verification Modal */}
      {showTestScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">কিউআর কোড স্ক্যান সিমুলেশন</h3>
                  <span className="text-[10px] text-emerald-600 font-bold">ভেরিফিকেশন স্ট্যাটাস: সফল (Verified)</span>
                </div>
              </div>
              <button
                onClick={() => setShowTestScanModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Decoded Profile View */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full border-2 border-emerald-500 overflow-hidden bg-white shrink-0">
                  {studentPhoto ? (
                    <img src={studentPhoto} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-slate-700">
                      {student.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">{student.banglaName}</h4>
                  <p className="text-xs text-slate-600 font-mono">{student.name}</p>
                  <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    ID: DEL-{student.id.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-200/60 font-sans">
                <div>
                  <span className="text-[10px] text-slate-500 block">শ্রেণী (Class):</span>
                  <strong className="text-slate-800">{student.className}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">রোল (Roll):</span>
                  <strong className="text-slate-800">{student.roll}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">প্রতিষ্ঠান:</span>
                  <strong className="text-slate-800">{schoolName || 'Delicon Model Academy'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">শিক্ষাবর্ষ:</span>
                  <strong className="text-slate-800">২০২৬ সেশন</strong>
                </div>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => setShowTestScanModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
