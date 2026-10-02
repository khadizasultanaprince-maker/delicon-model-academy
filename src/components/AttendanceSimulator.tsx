/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'motion/react';
import { 
  ScanLine, Smartphone, CheckCircle, Clock, Volume2, ShieldAlert,
  Calendar, Eye, BookOpen, UserSquare2, RefreshCcw, Camera, CameraOff,
  AlertTriangle, Check, X, ShieldCheck, CheckCircle2, Sparkles, UserCheck,
  Edit3, Search, HelpCircle, Info, SlidersHorizontal, ArrowRight, ChevronDown,
  ChevronUp, RotateCcw
} from 'lucide-react';

interface ScannedVerificationTarget {
  id: string;
  type: 'student' | 'employee';
  name: string;
  banglaName: string;
  className?: string;
  roll?: string;
  role?: string;
  phone?: string;
  guardianName?: string;
  photoUrl?: string;
  direction: 'Check-In' | 'Check-Out';
  rawScanText?: string;
  verifiedFields: {
    name: boolean;
    classOrRole: boolean;
    phone: boolean;
    direction: boolean;
  };
}

export const AttendanceSimulator: React.FC = () => {
  const { 
    students, 
    employees, 
    attendanceLogs, 
    smsLogs, 
    simulateAttendanceScan,
    updateStudentId,
    addStudent
  } = useSchool();

  const [activeScanType, setActiveScanType] = useState<'student' | 'employee'>('student');
  const [selectedId, setSelectedId] = useState('');
  const [scanDirection, setScanDirection] = useState<'Check-In' | 'Check-Out'>('Check-In');
  const [scanning, setScanning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Camera Scan Verification Modal state
  const [cameraVerification, setCameraVerification] = useState<ScannedVerificationTarget | null>(null);

  // Dedicated single-field verification popup target (opens focused modal for a specific field)
  const [fieldPopupTarget, setFieldPopupTarget] = useState<'name' | 'classOrRole' | 'phone' | 'direction' | null>(null);

  // Safety confirmation dialog when user attempts to submit with unverified fields
  const [showIncompleteConfirmWarning, setShowIncompleteConfirmWarning] = useState(false);

  // Inline correction / editing state inside camera modal
  const [editingFieldKey, setEditingFieldKey] = useState<'name' | 'classOrRole' | 'phone' | null>(null);
  const [tempEditName, setTempEditName] = useState('');
  const [tempEditClass, setTempEditClass] = useState('Class 6');
  const [tempEditRoll, setTempEditRoll] = useState('');
  const [tempEditPhone, setTempEditPhone] = useState('');

  // Student Switcher inside camera modal (in case camera detected wrong student card)
  const [showStudentSwitcher, setShowStudentSwitcher] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Unregistered card scanning support states
  const [unregisteredScannedId, setUnregisteredScannedId] = useState<string | null>(null);
  const [assignToStudentId, setAssignToStudentId] = useState<string>('');
  const [isAssignVerified, setIsAssignVerified] = useState(false);
  const [newStudentNameBng, setNewStudentNameBng] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('Class 6');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentGPhone, setNewStudentGPhone] = useState('01712345678');
  const [verifiedOnTheFlyFields, setVerifiedOnTheFlyFields] = useState({
    name: false,
    class: false,
    roll: false,
    phone: false
  });

  // Interactive RFID virtual card coordinate & simulation states
  const [isPlacingCard, setIsPlacingCard] = useState(false);
  const [cardY, setCardY] = useState(0);
  const [cardScale, setCardScale] = useState(1);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Play physically authentic gate scan beep synthesizer
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz high-pitch beep
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (err) {
      console.error('Audio beep failed:', err);
    }
  };

  // Helper to parse QR codes with different formats
  const parseScannedQR = (rawText: string) => {
    const text = rawText.trim();
    let parsedId = text;
    let parsedName = '';
    let parsedClass = '';
    let parsedRoll = '';
    let parsedPhone = '';

    if (parsedId.includes('TOKEN=MIR-')) {
      parsedId = parsedId.replace('TOKEN=MIR-', '').trim();
    }

    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const data = JSON.parse(text);
        if (data.id) parsedId = String(data.id);
        if (data.name || data.banglaName) parsedName = String(data.banglaName || data.name);
        if (data.className || data.class) parsedClass = String(data.className || data.class);
        if (data.roll) parsedRoll = String(data.roll);
        if (data.phone || data.guardianPhone) parsedPhone = String(data.phone || data.guardianPhone);
      } catch {
        // not JSON
      }
    }

    if (text.includes('?') && (text.includes('id=') || text.includes('roll='))) {
      try {
        const url = new URL(text, 'http://localhost');
        if (url.searchParams.get('id')) parsedId = url.searchParams.get('id')!;
        if (url.searchParams.get('name')) parsedName = url.searchParams.get('name')!;
        if (url.searchParams.get('class')) parsedClass = url.searchParams.get('class')!;
        if (url.searchParams.get('roll')) parsedRoll = url.searchParams.get('roll')!;
        if (url.searchParams.get('phone')) parsedPhone = url.searchParams.get('phone')!;
      } catch {
        // ignore
      }
    }

    const lines = text.split(/[\n,;]+/);
    for (const line of lines) {
      const [k, ...v] = line.split(':');
      if (k && v.length) {
        const key = k.trim().toLowerCase();
        const val = v.join(':').trim();
        if (key === 'id' || key === 'আইডি') parsedId = val;
        if (key === 'name' || key === 'নাম') parsedName = val;
        if (key === 'class' || key === 'শ্রেণি' || key === 'শ্রেণী') parsedClass = val;
        if (key === 'roll' || key === 'রোল') parsedRoll = val;
        if (key === 'phone' || key === 'মোবাইল') parsedPhone = val;
      }
    }

    return { parsedId, parsedName, parsedClass, parsedRoll, parsedPhone };
  };

  const handleDecodedQR = (rawText: string) => {
    const { parsedId, parsedName, parsedClass, parsedRoll, parsedPhone } = parseScannedQR(rawText);
    const lowerParsedId = parsedId.toLowerCase();
    
    // Stop camera immediately to prevent duplicate or mistaken readings
    setIsCameraActive(false);
    playBeep();

    // 1. Match student by ID
    let matchedStudent = students.find(s => s.id.toLowerCase() === lowerParsedId || s.id === parsedId);
    
    // 2. Match student by parsed name if not found by ID
    if (!matchedStudent && parsedName) {
      matchedStudent = students.find(s => 
        (s.banglaName && s.banglaName.toLowerCase().includes(parsedName.toLowerCase())) ||
        (s.name && s.name.toLowerCase().includes(parsedName.toLowerCase()))
      );
    }

    // 3. Fallback check for Mahinur or Class 6 keywords if scanned text has them
    if (!matchedStudent && (parsedId.includes('মাহিনুর') || rawText.includes('মাহিনুর') || rawText.toLowerCase().includes('mahinur'))) {
      matchedStudent = students.find(s => 
        s.banglaName?.includes('মাহিনুর') || s.name?.toLowerCase().includes('mahinur')
      );
    }

    // 4. Match student by class & roll
    if (!matchedStudent && parsedClass && parsedRoll) {
      matchedStudent = students.find(s => 
        s.className?.toLowerCase().includes(parsedClass.toLowerCase()) && s.roll === parsedRoll
      );
    }

    const matchedEmployee = employees.find(e => e.id.toLowerCase() === lowerParsedId || e.id === parsedId);
    
    if (matchedStudent) {
      setCameraVerification({
        id: matchedStudent.id,
        type: 'student',
        name: matchedStudent.name,
        banglaName: matchedStudent.banglaName || matchedStudent.name,
        className: matchedStudent.className,
        roll: matchedStudent.roll,
        phone: matchedStudent.guardianPhone,
        guardianName: matchedStudent.guardianName,
        photoUrl: matchedStudent.photoUrl,
        direction: scanDirection,
        rawScanText: rawText,
        // Crucial: Set to FALSE initially so user has confirmation control on each field
        verifiedFields: {
          name: false,
          classOrRole: false,
          phone: false,
          direction: false
        }
      });
      setTempEditName(matchedStudent.banglaName || matchedStudent.name);
      setTempEditClass(matchedStudent.className || 'Class 6');
      setTempEditRoll(matchedStudent.roll || '');
      setTempEditPhone(matchedStudent.guardianPhone || '');
      setEditingFieldKey(null);
      setFieldPopupTarget(null);
      setShowIncompleteConfirmWarning(false);
      setShowStudentSwitcher(false);
    } else if (matchedEmployee) {
      setCameraVerification({
        id: matchedEmployee.id,
        type: 'employee',
        name: matchedEmployee.name,
        banglaName: matchedEmployee.banglaName || matchedEmployee.name,
        role: matchedEmployee.role,
        phone: matchedEmployee.phone,
        direction: scanDirection,
        rawScanText: rawText,
        verifiedFields: {
          name: false,
          classOrRole: false,
          phone: false,
          direction: false
        }
      });
      setTempEditName(matchedEmployee.banglaName || matchedEmployee.name);
      setTempEditClass('');
      setTempEditRoll('');
      setTempEditPhone(matchedEmployee.phone || '');
      setEditingFieldKey(null);
      setFieldPopupTarget(null);
      setShowIncompleteConfirmWarning(false);
      setShowStudentSwitcher(false);
    } else {
      // Unrecognized physical Card scanned!
      setUnregisteredScannedId(parsedId || rawText);
      setVerifiedOnTheFlyFields({ name: false, class: false, roll: false, phone: false });
    }
  };

  // Switch student if camera scanned wrong student card
  const handleSelectDifferentStudent = (studentId: string) => {
    const s = students.find(item => item.id === studentId);
    if (!s) return;
    setCameraVerification({
      id: s.id,
      type: 'student',
      name: s.name,
      banglaName: s.banglaName || s.name,
      className: s.className,
      roll: s.roll,
      phone: s.guardianPhone,
      guardianName: s.guardianName,
      photoUrl: s.photoUrl,
      direction: scanDirection,
      rawScanText: cameraVerification?.rawScanText,
      verifiedFields: {
        name: true,
        classOrRole: true,
        phone: true,
        direction: true
      }
    });
    setTempEditName(s.banglaName || s.name);
    setTempEditClass(s.className || 'Class 6');
    setTempEditRoll(s.roll || '');
    setTempEditPhone(s.guardianPhone || '');
    setShowStudentSwitcher(false);
    setEditingFieldKey(null);
  };

  // Save inline correction made by user
  const handleSaveInlineEdit = (field: 'name' | 'classOrRole' | 'phone') => {
    if (!cameraVerification) return;
    setCameraVerification(prev => {
      if (!prev) return null;
      if (field === 'name') {
        return {
          ...prev,
          banglaName: tempEditName.trim() || prev.banglaName,
          name: tempEditName.trim() || prev.name,
          verifiedFields: { ...prev.verifiedFields, name: true }
        };
      } else if (field === 'classOrRole') {
        return {
          ...prev,
          className: tempEditClass,
          roll: tempEditRoll.trim(),
          verifiedFields: { ...prev.verifiedFields, classOrRole: true }
        };
      } else if (field === 'phone') {
        return {
          ...prev,
          phone: tempEditPhone.trim(),
          verifiedFields: { ...prev.verifiedFields, phone: true }
        };
      }
      return prev;
    });
    setEditingFieldKey(null);
  };

  // Confirm attendance with safety check
  const handleConfirmVerification = (force = false) => {
    if (!cameraVerification) return;
    
    const allVerified = Object.values(cameraVerification.verifiedFields).every(Boolean);
    if (!allVerified && !force) {
      setShowIncompleteConfirmWarning(true);
      return;
    }

    const result = simulateAttendanceScan(
      cameraVerification.id, 
      cameraVerification.type, 
      cameraVerification.direction
    );

    if (result.success) {
      playBeep();
      setSuccessMsg(result.message);
      setCameraVerification(null);
      setShowIncompleteConfirmWarning(false);
      setFieldPopupTarget(null);
      setTimeout(() => setSuccessMsg(''), 6000);
    } else {
      alert(result.message || 'উপস্থিতি রেকর্ড করতে সমস্যা হয়েছে।');
    }
  };

  const toggleFieldVerification = (field: 'name' | 'classOrRole' | 'phone' | 'direction') => {
    if (!cameraVerification) return;
    setCameraVerification(prev => {
      if (!prev) return null;
      return {
        ...prev,
        verifiedFields: {
          ...prev.verifiedFields,
          [field]: !prev.verifiedFields[field]
        }
      };
    });
  };

  React.useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    const qrRegionId = 'live-camera-reader-element';
    
    if (isCameraActive) {
      setCameraError(null);
      
      // Delay initialization slightly to let the div mount in render cycle
      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode(qrRegionId);
          html5QrCode.start(
            { facingMode: 'environment' }, // Back camera
            {
              fps: 12,
              qrbox: (w, h) => {
                const size = Math.min(w, h) * 0.75;
                return { width: size, height: size };
              }
            },
            (decodedText) => {
              handleDecodedQR(decodedText);
            },
            () => {
              // Verbose error logs ignored for smooth background scanning
            }
          ).catch((err) => {
            console.error('Camera initialization error:', err);
            setCameraError('ক্যামেরা চালু করা যায়নি বা অনুমতি পাওয়া যায়নি। অনুগ্রহ করে মোবাইল ব্রাউজার সেটিংসে ক্যামেরা এক্সেস অনুমতি দিয়ে পুনরায় চেষ্টা করুন।');
            setIsCameraActive(false);
          });
        } catch (e) {
          console.error('Html5Qrcode instance error:', e);
          setCameraError('স্ক্যান সিস্টেম লোড হতে সমস্যা হয়েছে।');
          setIsCameraActive(false);
        }
      }, 300);
      
      return () => {
        clearTimeout(timer);
        if (html5QrCode) {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(err => console.error('Stop scanner error:', err));
          }
        }
      };
    }
  }, [isCameraActive, scanDirection]);

  // Default selection when students/employees are ready
  React.useEffect(() => {
    if (activeScanType === 'student' && students.length > 0) {
      setSelectedId(students[0].id);
    } else if (activeScanType === 'employee' && employees.length > 0) {
      setSelectedId(employees[0].id);
    }
  }, [activeScanType, students, employees]);

  const handleScanSimulation = (overrideId?: string) => {
    const idToScan = overrideId || selectedId;
    if (!idToScan || scanning) return;
    
    setSelectedId(idToScan);
    setScanning(true);
    setIsPlacingCard(true);
    setSuccessMsg('');
    
    // Animate virtual card gliding upwards into the sensor area
    setCardY(-95);
    setCardScale(1.08);

    setTimeout(() => {
      // Trigger physically authentic RFID scanner beep
      playBeep();
      
      const result = simulateAttendanceScan(idToScan, activeScanType, scanDirection);
      setScanning(false);
      
      // Pull virtual card back down smoothly
      setTimeout(() => {
        setIsPlacingCard(false);
        setCardY(0);
        setCardScale(1);
      }, 700);

      if (result.success) {
        setSuccessMsg(result.message);
        // Reset message indicator
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        setSuccessMsg('ত্রুটি: স্ক্যান সম্পন্ন করা যায়নি।');
      }
    }, 1500); //snappy physical sensory response delay
  };

  const selectedPerson = activeScanType === 'student'
    ? students.find(s => s.id === selectedId)
    : employees.find(e => e.id === selectedId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Intro Header */}
      <div className="mb-6 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-blue-900 animate-pulse" />
          <p className="text-xs font-bold tracking-wider text-blue-900 uppercase font-mono">
            LIVE HARDWARE HARNESS
          </p>
        </div>
        <h1 className="text-2xl font-black text-slate-800 md:text-3xl">
          ডিজিটাল এটেনডেন্স ট্র্যাকার ও RFID আইডি কার্ড স্ক্যানার ডিভাইস
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          এটি একটি লাইভ প্রোটোটাইপ সিমুলেটর। এখানে আইডি কার্ড পাঞ্চ করে স্কুলের উপস্থিতি ও বহির্গমন এবং এর সাথে অভিভাবকের ফোনে তাৎক্ষণিক স্বয়ংক্রিয় মেসেজ পাঠানোর প্রক্রিয়াটি পরীক্ষা করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PHYSICAL DEVICE COBALT CASING MOCKUP (4Cols) */}
        <div className="lg:col-span-4 bg-slate-900 text-white rounded-3xl p-6 border-4 border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
          <div className="absolute inset-0 bg-radial-gradient from-blue-900/10 to-transparent"></div>
          
          {/* Hardware Header screen */}
          <div>
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center font-mono text-[10px] text-blue-300">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                RFID READER V3.5
              </span>
              <span>TIME: {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
            </div>

            {/* Simulated LCD Screen/Cam Feed */}
            <div className="mt-4 bg-slate-950 rounded-2xl border-2 border-slate-850 font-mono text-xs text-emerald-400 min-h-[160px] flex flex-col justify-center text-center overflow-hidden relative">
              {isCameraActive ? (
                <div className="absolute inset-0 w-full h-full bg-black flex flex-col justify-between">
                  <div id="live-camera-reader-element" className="w-full h-full absolute inset-0 object-cover"></div>
                  
                  {/* Glowing camera scanning indicator overlay */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] animate-[bounce_2.5s_infinite] z-20 pointer-events-none"></div>
                  
                  {/* Floating badge */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded text-[8px] font-bold text-white z-20 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>ক্যামেরার সামনে আইডি কার্ডের QR মেলুন</span>
                  </div>
                </div>
              ) : scanning ? (
                <div className="p-4 space-y-3 flex flex-col items-center justify-center h-full">
                  <div className="h-8 w-8 rounded-full border-4 border-t-emerald-400 border-r-emerald-500/20 border-b-emerald-400 border-l-emerald-500/20 animate-spin mb-1"></div>
                  <p className="text-emerald-300 font-bold animate-pulse text-[10px] tracking-widest uppercase mb-0.5">READING RFID SERIAL...</p>
                  <p className="text-[9px] text-slate-400">আইডি কার্ডটি সেন্সরের কাছে উপস্থাপন করা হচ্ছে</p>
                </div>
              ) : successMsg ? (
                <div className="p-5 space-y-1">
                  <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto animate-bounce" />
                  <p className="text-white font-bold text-[11px] leading-snug">{successMsg}</p>
                </div>
              ) : isPlacingCard ? (
                <div className="p-4 flex flex-col items-center justify-center text-blue-300 h-full">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping mb-2"></div>
                  <p className="font-bold text-[10.5px] tracking-widest uppercase">CONNECTING RFID INTERFACE...</p>
                </div>
              ) : (
                <div className="p-5 space-y-1.5 text-slate-400">
                  <p className="text-emerald-400 font-bold font-mono tracking-wider">READY TO SCAN</p>
                  <p className="text-[10px]">নিচের ৪ নম্বর আরএফআইডি কার্ডটিতে মাউস বা আঙ্গুল দিয়ে সরাসরি ক্লিক করে সেন্সরে স্পর্শ করান।</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Hardware Setup Controls */}
          <div className="mt-6 space-y-4">
            
            {/* Target Select Option */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">১। অবজেক্ট টাইপ</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setActiveScanType('student')}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    activeScanType === 'student' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  শিক্ষার্থী (Student)
                </button>
                <button 
                  onClick={() => setActiveScanType('employee')}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    activeScanType === 'employee' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  স্টাফ (Employee)
                </button>
              </div>
            </div>

            {/* Interactive Card Holder Rack */}
            <div>
              <label className="block text-[10.5px] font-extrabold text-blue-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>২। আরএফআইডি রাকের কার্ডসমূহ (র‍্যাক থেকে টাচ করুন)</span>
                <span className="text-[8px] bg-blue-950 text-blue-300 border border-blue-900 px-1.5 py-0.5 rounded font-mono">TAP CARD DIRECTLY</span>
              </label>
              
              <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto bg-slate-950/65 p-2 rounded-xl border border-slate-800 pr-1">
                {activeScanType === 'student' ? (
                  students.map(s => {
                    const isSelected = selectedId === s.id;
                    const isScannedToday = attendanceLogs.some(l => l.targetId === s.id && l.type === 'Check-In');
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleScanSimulation(s.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden group cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-950/80 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black leading-tight flex items-center gap-1 justify-between">
                            <span className="truncate">{s.banglaName}</span>
                            {isScannedToday ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 shadow-sm" title="আজ উপস্থিত"></span>
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-700 shrink-0" title="সক্ষম কিন্তু স্ক্যানড নয়"></span>
                            )}
                          </p>
                          <p className="text-[8.5px] text-slate-400">শ্রেণী: {s.className} • রোল: {s.roll}</p>
                          <p className="text-[7.5px] text-blue-400 font-mono tracking-wider">ID: {s.id.toUpperCase()}</p>
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[7.5px] text-emerald-400 font-bold bg-slate-950 border border-emerald-990 px-1 rounded">TAP</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  employees.map(e => {
                    const isSelected = selectedId === e.id;
                    const isScannedToday = attendanceLogs.some(l => l.targetId === e.id && l.type === 'Check-In');
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => handleScanSimulation(e.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden group cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-950/80 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black leading-tight flex items-center gap-1 justify-between">
                            <span className="truncate">{e.banglaName}</span>
                            {isScannedToday ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 shadow-sm" title="আজ কর্মরত"></span>
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-700 shrink-0" title="সক্রিয় কিন্তু অফলগ"></span>
                            )}
                          </p>
                          <p className="text-[8.5px] text-slate-400">পদবী: {e.role}</p>
                          <p className="text-[7.5px] text-blue-400 font-mono tracking-wider">ID: {e.id.toUpperCase()}</p>
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[7.5px] text-emerald-400 font-bold bg-slate-950 border border-emerald-990 px-1 rounded">TAP</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Scan State direction selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">৩। অ্যাকশন ধরণ</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setScanDirection('Check-In')}
                  className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    scanDirection === 'Check-In' ? 'bg-blue-900 text-white shadow' : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  {activeScanType === 'student' ? 'প্রবেশ (Entry)' : 'চেক-ইন'}
                </button>
                <button 
                  onClick={() => setScanDirection('Check-Out')}
                  className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                    scanDirection === 'Check-Out' ? 'bg-rose-750 text-white shadow' : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  {activeScanType === 'student' ? 'ছুটি (Exit)' : 'চেক-আউট'}
                </button>
              </div>
            </div>

            {/* Big hardware trigger button & Interactive virtual RFID tag preview */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleScanSimulation}
                disabled={scanning || isCameraActive}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-800 text-white font-bold p-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-blue-500/30 cursor-pointer select-none"
              >
                <ScanLine className="h-4 w-4 animate-pulse" />
                <span>{scanning ? 'ডিভাইসে কার্ড স্পর্শ হচ্ছে...' : 'SIMULATE TAG SCAN'}</span>
              </button>

              {/* Physical Card Swipe/Tap Simulation HUD */}
              {selectedPerson && (
                <div className="border-t border-slate-800/80 pt-4 relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ৪। আরএফআইডি স্মার্ট আইডি কার্ড
                    </span>
                    <span className="text-[10px] font-extrabold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-900/60 animate-pulse">
                      স্পর্শ করুন 👆
                    </span>
                  </div>
                  
                  {/* Visual ID Card for selected person */}
                  <div className="relative h-44 w-full select-none">
                    <motion.div
                      style={{ y: cardY, scale: cardScale }}
                      animate={{ y: cardY, scale: cardScale }}
                      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                      onClick={handleScanSimulation}
                      className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 rounded-2xl border-2 border-slate-700 shadow-2xl p-4 flex flex-col justify-between cursor-pointer overflow-hidden group hover:border-emerald-500/50 transition-all z-10"
                    >
                      {/* Glossy overlay effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      {/* Card Header */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5 text-left">
                          <p className="text-[8px] tracking-wider text-blue-400 font-black uppercase font-mono">DELICON MODEL ACADEMY</p>
                          <p className="text-[7px] text-slate-400">SECURE DIGITAL IDENTIFICATION</p>
                        </div>
                        {/* Golden smart chip mockup */}
                        <div className="h-6 w-8 bg-gradient-to-br from-amber-400 via-yellow-250 to-amber-500 rounded-md border border-amber-600/75 shadow flex flex-col justify-between p-1">
                          <div className="h-px bg-amber-800/40 w-full"></div>
                          <div className="h-px bg-amber-800/40 w-full"></div>
                          <div className="h-px bg-amber-800/40 w-full"></div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex gap-3 items-center my-1.5">
                        {/* Avatar initials badge */}
                        <div className="h-12 w-12 rounded-xl bg-blue-900/40 border border-blue-700/50 flex flex-col items-center justify-center text-white text-xs font-black shadow-inner">
                          <span>{selectedPerson.banglaName.substring(0, 3)}</span>
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-extrabold text-white leading-tight">{selectedPerson.banglaName}</h4>
                          <p className="text-[9px] text-slate-300 font-semibold mt-0.5">
                            {activeScanType === 'student' 
                              ? `শ্রেণী: ${(selectedPerson as any).className} | রোল: ${(selectedPerson as any).roll}` 
                              : `পদবী: ${(selectedPerson as any).role}`}
                          </p>
                          <span className="inline-block bg-blue-950 text-blue-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-blue-900/60 font-mono mt-1">
                            UID: {selectedPerson.id.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer NFC/RFID wave indicators */}
                      <div className="border-t border-slate-800/80 pt-1.5 flex items-center justify-between text-[8px] text-slate-450">
                        <span className="flex items-center gap-1 font-mono font-bold text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          RFID CHIP V3.5 ACTIVE
                        </span>
                        <span className="text-blue-400 font-extrabold group-hover:text-emerald-400 group-hover:underline transition-colors uppercase tracking-wider">
                          টাচ করতে ক্লিক করুন →
                        </span>
                      </div>
                    </motion.div>
                  </div>
                  
                  <p className="text-[9px] text-slate-400 text-center mt-2 leading-relaxed font-semibold">
                    💡 <span className="text-slate-300">ইন্টারেক্টিভ গাইড:</span> আপনি সরাসরি এই আইডি কার্ডটিতে টাচ/ক্লিক করুন। তাহলে এটি গতিশীলভাবে সেন্সরের কাছে ভেসে গিয়ে গেটের বিপ বাজাবে এবং অভিভাবকের ফোনে SMS পাঠাবে!
                  </p>
                </div>
              )}
            </div>

            {/* Camera Scan Toggle Button */}
            <div className="pt-2 border-t border-slate-850/60 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCameraActive(!isCameraActive);
                  setCameraError(null);
                }}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all border cursor-pointer select-none ${
                  isCameraActive 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-md' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-550 shadow-md shadow-emerald-950/20'
                }`}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="h-4.5 w-4.5" />
                    <span>ক্যামেরা স্ক্যানার বন্ধ করুন</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4.5 w-4.5 animate-pulse" />
                    <span>মোবাইল ক্যামেরা দিয়ে লাইভ কুইক স্ক্যান করুন</span>
                  </>
                )}
              </button>
              
              {cameraError && (
                <p className="text-[9px] text-red-400 font-extrabold mt-2 leading-snug bg-red-950/40 p-2.5 rounded-xl border border-red-900/30">
                  ⚠️ {cameraError}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* RECIPIENT SMARTPHONE SMS DISPLAY CONTAINER (4Cols) */}
        <div className="lg:col-span-4 bg-slate-200 rounded-3xl p-4 border-8 border-slate-300 shadow-lg min-h-[500px] flex flex-col justify-between max-w-sm mx-auto w-full relative">
          
          {/* Phone Header notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-20"></div>

          {/* Screen Content */}
          <div className="bg-white rounded-2xl flex-1 flex flex-col justify-between overflow-hidden border border-slate-300/80 mt-2">
            
            {/* Phone Network status row */}
            <div className="bg-slate-100 px-3 py-1.5 flex justify-between items-center text-[9px] font-bold text-slate-500 font-mono select-none pt-4">
              <span>Delicon SIM</span>
              <span>100% LTE</span>
              <span>12:00 PM</span>
            </div>

            {/* SMS Screen Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5] text-xs">
              <div className="text-center">
                <span className="bg-slate-300/60 rounded px-2 py-0.5 text-[8px] font-bold text-slate-600 uppercase font-mono">TODAY • DELICON MESSAGE SYSTEM</span>
              </div>

              {smsLogs.length === 0 ? (
                <div className="text-center p-6 text-slate-400 italic">
                  <Smartphone className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-[9px]">কোন বার্তা এখনো পাওয়া যায়নি। বামে কার্ড স্ক্যান করে মেসেজ ট্রিগার করুন!</p>
                </div>
              ) : (
                smsLogs.map((log, i) => (
                  <div key={i} className="flex flex-col items-start max-w-[90%] bg-white p-3 rounded-2xl rounded-tl-none border shadow-sm relative pt-6 animate-fade-in">
                    <span className="absolute top-1.5 left-3 text-[8px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1 font-mono">
                      <Volume2 className="h-2.5 w-2.5 text-amber-500" />
                      <span>SMS SENT OK</span>
                    </span>
                    <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">"{log.text}"</p>
                    <span className="text-[8px] text-slate-400 font-mono text-right block w-full mt-1.5">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </div>

            {/* Simulated Phone Keyboard / Footer mock */}
            <div className="bg-slate-50 border-t p-2 text-center text-[10px] text-slate-400 font-semibold font-mono">
              SECURED GUARDIAN GATEWAY
            </div>

          </div>
        </div>

        {/* REAL-TIME AUDITING ATTENDANCE LOG SHEETS & WORK HOURS ACCOUNTING (4Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[500px]">
          
          <div>
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4 flex justify-between items-center">
              <span>লাইভ সিস্টেম অডিট রেজিস্ট্রি</span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-900 border border-blue-200 font-mono">DB LOGS</span>
            </h3>

            {attendanceLogs.length === 0 ? (
              <div className="text-center p-10 text-slate-400 italic text-xs">
                <Clock className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                <p>সিস্টেম ডেটা শূন্য। স্ক্যান করে হাজির রেকর্ড তৈরি করুন।</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {attendanceLogs.map((log, i) => (
                  <div key={i} className="p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-all">
                    <div>
                      <p className="font-bold text-slate-800">{log.targetName}</p>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        {log.targetType === 'student' ? 'Student' : 'Staff'} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                        log.type === 'Check-In' ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {log.type === 'Check-In' ? 'Check-In' : 'Check-Out'}
                      </span>
                      {log.workHours && (
                        <p className="text-[10px] font-bold text-slate-500 font-mono mt-1">
                          {log.workHours}h work
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-3 mt-4 text-[10px] text-slate-400 leading-snug">
            <p className="font-bold text-slate-600 mb-1 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              হিসাব নিকাশ ও তথ্য যাচাই
            </p>
            <p>এই ডাটাবেজ লগসমূহ সরাসরি স্কুল ম্যানেজমেন্ট সফটওয়্যার এর ফাইন্যান্স, প্রক্টরিয়াল এবং বেতন প্যানেলে হিসাব করা হয়।</p>
          </div>

        </div>

      </div>

      {/* CAMERA SCAN VERIFICATION & FIELD CONFIRMATION MODAL */}
      {cameraVerification && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-white space-y-4 shadow-2xl relative overflow-hidden animate-fade-in my-auto">
            {/* Top gradient glow */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500"></div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                    <span>ক্যামেরা স্ক্যান যাচাইকরণ ও তথ্য নিশ্চয়তা</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    ভুল তথ্য প্রতিরোধে প্রতিটি ফিল্ডের পাশের বোতাম চেপে নিশ্চিত করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCameraVerification(null);
                  setEditingFieldKey(null);
                  setFieldPopupTarget(null);
                  setShowStudentSwitcher(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Safety & Anti-Error Notice Banner */}
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 text-[11px] text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-300">ভুল তথ্য ফিল্ডে বসানো প্রতিরোধ ব্যবস্থা সক্রিয়</p>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  ক্যামেরা স্ক্যান থেকে প্রাপ্ত তথ্য সরাসরি সেভ হয় না। প্রতিটি তথ্যের সত্যতা নিশ্চিত করতে পাশের <strong className="text-emerald-300">"নিশ্চিত করুন"</strong> বাটনে চাপুন অথবা ভুল থাকলে <strong className="text-blue-300">"সংশোধন"</strong> করুন।
                </p>
              </div>
            </div>

            {/* Scanned Card Code & Quick Student Switcher Bar */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  <span>স্ক্যানকৃত আইডি কার্ড:</span>
                </span>
                <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  {cameraVerification.id.toUpperCase()}
                </span>
              </div>

              {/* Student Switcher Button (in case camera detected wrong student card) */}
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowStudentSwitcher(!showStudentSwitcher)}
                  className="text-[10.5px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{showStudentSwitcher ? 'শিক্ষার্থী তালিকা লুকান' : 'ভুল শিক্ষার্থী সনাক্ত হয়েছে? সঠিক শিক্ষার্থী নির্বাচন করুন'}</span>
                </button>
                <span className="text-[9px] text-slate-400 font-mono">
                  {cameraVerification.type === 'student' ? 'শিক্ষার্থী প্রোফাইল' : 'স্টাফ প্রোফাইল'}
                </span>
              </div>

              {/* Collapsible Student Switcher Dropdown */}
              {showStudentSwitcher && (
                <div className="p-2.5 bg-slate-900 rounded-lg border border-blue-500/40 space-y-2 mt-1 animate-fade-in">
                  <p className="text-[10px] text-blue-300 font-bold">
                    সঠিক শিক্ষার্থী নির্বাচন করুন (যেমন: মাহিনুর, ষষ্ঠ শ্রেণি):
                  </p>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleSelectDifferentStudent(e.target.value);
                    }}
                    value={cameraVerification.id}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- শিক্ষার্থী বাছাই করুন --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.banglaName} (শ্রেণি: {s.className}, রোল: {s.roll}) [ID: {s.id}]
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Verification Progress Bar */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>তথ্য যাচাই অগ্রগতি</span>
                </span>
                <span className="font-mono font-bold text-blue-400">
                  {Object.values(cameraVerification.verifiedFields).filter(Boolean).length}/৪ ফিল্ড নিশ্চিত
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    Object.values(cameraVerification.verifiedFields).every(Boolean)
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                      : 'bg-gradient-to-r from-amber-500 to-blue-500'
                  }`}
                  style={{ width: `${(Object.values(cameraVerification.verifiedFields).filter(Boolean).length / 4) * 100}%` }}
                ></div>
              </div>
              {Object.values(cameraVerification.verifiedFields).every(Boolean) ? (
                <p className="text-[9.5px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>সকল ফিল্ড সফলভাবে নিশ্চিত হয়েছে। এখন উপস্থিতি অনুমোদন করতে পারেন।</span>
                </p>
              ) : (
                <p className="text-[9.5px] text-amber-300 font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>নিচের প্রতিটি ফিল্ডের পাশের 'নিশ্চিত করুন' বাটনে ক্লিক করে তথ্য সঠিকতা যাচাই করুন।</span>
                </p>
              )}
            </div>

            {/* Field-by-Field Verification Cards */}
            <div className="space-y-2.5 text-xs">
              
              {/* FIELD 1: Student Name */}
              <div className={`p-3 rounded-xl border transition-all ${
                cameraVerification.verifiedFields.name 
                  ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/30' 
                  : 'bg-slate-950/60 border-amber-500/40 ring-1 ring-amber-500/20'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase">১। শিক্ষার্থীর নাম</span>
                      {cameraVerification.verifiedFields.name ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" /> নাম যাচাইকৃত
                        </span>
                      ) : (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="h-2.5 w-2.5" /> যাচাই আবশ্যক
                        </span>
                      )}
                    </div>
                    {editingFieldKey === 'name' ? (
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="text"
                          value={tempEditName}
                          onChange={(e) => setTempEditName(e.target.value)}
                          placeholder="শিক্ষার্থীর নাম লিখুন"
                          className="w-full bg-slate-900 border border-blue-500 px-2.5 py-1.5 rounded-lg text-xs text-white focus:outline-none"
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveInlineEdit('name')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9.5px] font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            সংরক্ষণ ও নিশ্চিত
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFieldKey(null)}
                            className="bg-slate-800 text-slate-400 hover:text-white text-[9.5px] px-2 py-1 rounded cursor-pointer"
                          >
                            বাতিল
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="font-black text-white text-sm block">
                          {cameraVerification.banglaName}
                        </span>
                        {cameraVerification.name && cameraVerification.name !== cameraVerification.banglaName && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            EN: {cameraVerification.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFieldPopupTarget('name')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="ভেরিফিকেশন পপআপে বিস্তারিত দেখুন"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFieldKey(editingFieldKey === 'name' ? null : 'name');
                        setTempEditName(cameraVerification.banglaName);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="নাম সংশোধন করুন"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFieldVerification('name')}
                      className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        cameraVerification.verifiedFields.name
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md animate-pulse'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{cameraVerification.verifiedFields.name ? '✓ নাম সঠিক' : 'নিশ্চিত করুন'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* FIELD 2: Class & Roll */}
              <div className={`p-3 rounded-xl border transition-all ${
                cameraVerification.verifiedFields.classOrRole 
                  ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/30' 
                  : 'bg-slate-950/60 border-amber-500/40 ring-1 ring-amber-500/20'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase">
                        {cameraVerification.type === 'student' ? '২। শ্রেণী ও রোল' : '২। পদবী'}
                      </span>
                      {cameraVerification.verifiedFields.classOrRole ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" /> শ্রেণি/রোল যাচাইকৃত
                        </span>
                      ) : (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="h-2.5 w-2.5" /> যাচাই আবশ্যক
                        </span>
                      )}
                    </div>
                    {editingFieldKey === 'classOrRole' ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[8.5px] text-slate-400 block">শ্রেণি</label>
                          <select
                            value={tempEditClass}
                            onChange={(e) => setTempEditClass(e.target.value)}
                            className="w-full bg-slate-900 border border-blue-500 px-2 py-1 rounded text-xs text-white"
                          >
                            <option value="Class 1">Class 1</option>
                            <option value="Class 2">Class 2</option>
                            <option value="Class 3">Class 3</option>
                            <option value="Class 4">Class 4</option>
                            <option value="Class 5">Class 5</option>
                            <option value="Class 6">Class 6 (ষষ্ঠ)</option>
                            <option value="Class 7">Class 7</option>
                            <option value="অষ্টম শ্রেণি">অষ্টম শ্রেণি (Class 8)</option>
                            <option value="নবম শ্রেণি">নবম শ্রেণি (Class 9)</option>
                            <option value="দশম শ্রেণি">দশম শ্রেণি (Class 10)</option>
                            <option value="এসএসসি পরীক্ষার্থী">এসএসসি পরীক্ষার্থী (SSC Examinee)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[8.5px] text-slate-400 block">রোল</label>
                          <input
                            type="text"
                            value={tempEditRoll}
                            onChange={(e) => setTempEditRoll(e.target.value)}
                            placeholder="রোল নম্বর"
                            className="w-full bg-slate-900 border border-blue-500 px-2 py-1 rounded text-xs text-white"
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleSaveInlineEdit('classOrRole')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9.5px] font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            সংরক্ষণ ও নিশ্চিত
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFieldKey(null)}
                            className="bg-slate-800 text-slate-400 hover:text-white text-[9.5px] px-2 py-1 rounded cursor-pointer"
                          >
                            বাতিল
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="font-bold text-blue-300 text-xs block">
                        {cameraVerification.type === 'student' 
                          ? `${cameraVerification.className || 'শ্রেণী উল্লেখ নেই'} • রোল: ${cameraVerification.roll || 'N/A'}`
                          : (cameraVerification.role || 'স্টাফ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFieldPopupTarget('classOrRole')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="ভেরিফিকেশন পপআপে বিস্তারিত দেখুন"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFieldKey(editingFieldKey === 'classOrRole' ? null : 'classOrRole');
                        setTempEditClass(cameraVerification.className || 'Class 6');
                        setTempEditRoll(cameraVerification.roll || '');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="শ্রেণি ও রোল সংশোধন করুন"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFieldVerification('classOrRole')}
                      className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        cameraVerification.verifiedFields.classOrRole
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md animate-pulse'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{cameraVerification.verifiedFields.classOrRole ? '✓ শ্রেণি সঠিক' : 'নিশ্চিত করুন'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* FIELD 3: Guardian Mobile & SMS Target */}
              <div className={`p-3 rounded-xl border transition-all ${
                cameraVerification.verifiedFields.phone 
                  ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/30' 
                  : 'bg-slate-950/60 border-amber-500/40 ring-1 ring-amber-500/20'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase">৩। অভিভাবক মোবাইল (SMS নোটিফিকেশন যাবে)</span>
                      {cameraVerification.verifiedFields.phone ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" /> মোবাইল যাচাইকৃত
                        </span>
                      ) : (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="h-2.5 w-2.5" /> যাচাই আবশ্যক
                        </span>
                      )}
                    </div>
                    {editingFieldKey === 'phone' ? (
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="text"
                          value={tempEditPhone}
                          onChange={(e) => setTempEditPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full bg-slate-900 border border-blue-500 px-2.5 py-1.5 rounded-lg text-xs text-white font-mono"
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveInlineEdit('phone')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9.5px] font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            সংরক্ষণ ও নিশ্চিত
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFieldKey(null)}
                            className="bg-slate-800 text-slate-400 hover:text-white text-[9.5px] px-2 py-1 rounded cursor-pointer"
                          >
                            বাতিল
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-amber-300 text-xs block">
                        {cameraVerification.phone || 'মোবাইল নম্বর সংযুক্ত নেই'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFieldPopupTarget('phone')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="ভেরিফিকেশন পপআপে বিস্তারিত দেখুন"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFieldKey(editingFieldKey === 'phone' ? null : 'phone');
                        setTempEditPhone(cameraVerification.phone || '');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="মোবাইল নম্বর সংশোধন করুন"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFieldVerification('phone')}
                      className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        cameraVerification.verifiedFields.phone
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md animate-pulse'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{cameraVerification.verifiedFields.phone ? '✓ মোবাইল সঠিক' : 'নিশ্চিত করুন'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* FIELD 4: Scan Direction (Check-In or Check-Out) */}
              <div className={`p-3 rounded-xl border transition-all ${
                cameraVerification.verifiedFields.direction 
                  ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/30' 
                  : 'bg-slate-950/60 border-amber-500/40 ring-1 ring-amber-500/20'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase">৪। উপস্থিতির ধরণ</span>
                      {cameraVerification.verifiedFields.direction ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" /> ধরণ যাচাইকৃত
                        </span>
                      ) : (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="h-2.5 w-2.5" /> যাচাই আবশ্যক
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCameraVerification(prev => prev ? ({ ...prev, direction: 'Check-In' }) : null);
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                          cameraVerification.direction === 'Check-In'
                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        প্রবেশ (Check-In)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCameraVerification(prev => prev ? ({ ...prev, direction: 'Check-Out' }) : null);
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                          cameraVerification.direction === 'Check-Out'
                            ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400/40'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        ছুটি (Check-Out)
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFieldVerification('direction')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                      cameraVerification.verifiedFields.direction
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md animate-pulse'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{cameraVerification.verifiedFields.direction ? '✓ ধরণ সঠিক' : 'নিশ্চিত করুন'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Button to Verify All Fields at once */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setCameraVerification(prev => prev ? ({
                    ...prev,
                    verifiedFields: { name: true, classOrRole: true, phone: true, direction: true }
                  }) : null);
                }}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors p-1 rounded hover:bg-blue-950/40"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" />
                <span>সকল ফিল্ড একসাথে সঠিক নিশ্চিত করুন</span>
              </button>
              <span className="text-[10px] text-slate-400 font-mono">
                {Object.values(cameraVerification.verifiedFields).filter(Boolean).length}/৪ ফিল্ড নিশ্চিত
              </span>
            </div>

            {/* Confirmation & Cancel Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCameraVerification(null);
                  setEditingFieldKey(null);
                  setFieldPopupTarget(null);
                  setShowStudentSwitcher(false);
                }}
                className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all text-center cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={() => handleConfirmVerification(false)}
                className={`py-2.5 px-3 rounded-xl text-white text-xs font-black shadow-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  Object.values(cameraVerification.verifiedFields).every(Boolean)
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/40'
                }`}
              >
                <CheckCircle className="h-4 w-4 text-amber-200" />
                <span>
                  {Object.values(cameraVerification.verifiedFields).every(Boolean)
                    ? 'উপস্থিতি অনুমোদন করুন'
                    : `উপস্থিতি চূড়ান্ত করুন (${Object.values(cameraVerification.verifiedFields).filter(Boolean).length}/৪ যাচাইকৃত)`}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DEDICATED FOCUSED FIELD VERIFICATION POPUP */}
      {fieldPopupTarget && cameraVerification && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[130] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl max-w-sm w-full p-5 text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <h4 className="text-xs font-black uppercase text-blue-300">
                  {fieldPopupTarget === 'name' && 'ফিল্ড ভেরিফিকেশন: শিক্ষার্থীর নাম'}
                  {fieldPopupTarget === 'classOrRole' && 'ফিল্ড ভেরিফিকেশন: শ্রেণি ও রোল'}
                  {fieldPopupTarget === 'phone' && 'ফিল্ড ভেরিফিকেশন: অভিভাবকের মোবাইল নম্বর'}
                  {fieldPopupTarget === 'direction' && 'ফিল্ড ভেরিফিকেশন: উপস্থিতির ধরণ'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setFieldPopupTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">বর্তমান মান:</span>
                <p className="font-bold text-white text-sm">
                  {fieldPopupTarget === 'name' && cameraVerification.banglaName}
                  {fieldPopupTarget === 'classOrRole' && `${cameraVerification.className || 'শ্রেণি নেই'} (রোল: ${cameraVerification.roll || 'N/A'})`}
                  {fieldPopupTarget === 'phone' && (cameraVerification.phone || 'কোন নম্বর পাওয়া যায়নি')}
                  {fieldPopupTarget === 'direction' && (cameraVerification.direction === 'Check-In' ? 'প্রবেশ (Check-In)' : 'ছুটি (Check-Out)')}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-2 space-y-1 text-[11px] text-slate-300">
                <p className="font-semibold text-amber-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>যাচাইকরণ প্রক্রিয়া:</span>
                </p>
                <p className="text-[10.5px] text-slate-400 leading-relaxed">
                  ক্যামেরা দিয়ে আইডি কার্ড স্ক্যানের সময় অপটিক্যাল রিডিংয়ে ভুল তথ্য প্রতিরোধ করার উদ্দেশ্যে এই ফিল্ডটি যাচাই করা হচ্ছে। যদি উপরের তথ্যটি সঠিক হয়, নিচের বাটনে চাপুন।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFieldPopupTarget(null)}
                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all text-center"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setCameraVerification(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      verifiedFields: {
                        ...prev.verifiedFields,
                        [fieldPopupTarget]: true
                      }
                    };
                  });
                  setFieldPopupTarget(null);
                }}
                className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all text-center flex items-center justify-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                <span>সঠিক হিসেবে নিশ্চিত</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAFETY WARNING MODAL FOR INCOMPLETE VERIFICATION */}
      {showIncompleteConfirmWarning && cameraVerification && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[140] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-sm w-full p-6 text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="h-7 w-7 animate-bounce" />
              <div>
                <h3 className="text-sm font-extrabold">সতর্কতা: যাচাই অসম্পূর্ণ!</h3>
                <p className="text-[10px] text-slate-400">ভুল তথ্য এড়াতে ফিল্ড নিশ্চিতকরণ প্রয়োজন</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার ৪টি ফিল্ডের মধ্যে <strong className="text-amber-400">{4 - Object.values(cameraVerification.verifiedFields).filter(Boolean).length}টি ফিল্ড</strong> এখনো যাচাই করা হয়নি। ক্যামেরা স্ক্যানের ভুল তথ্য প্রতিরোধে প্রতিটি ফিল্ডের পাশের 'নিশ্চিত করুন' বাটন চাপুন।
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIncompleteConfirmWarning(false)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                ফিরে গিয়ে প্রতিটি ফিল্ড নিশ্চিত করুন 🔍
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIncompleteConfirmWarning(false);
                  handleConfirmVerification(true);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl text-[11px] transition-all cursor-pointer"
              >
                সব তথ্য সঠিক ধরে উপস্থিতি চূড়ান্ত করুন →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNREGISTERED CARD MODAL WITH FIELD-BY-FIELD CONFIRMATION */}
      {unregisteredScannedId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-sm w-full p-6 text-white space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="h-6 w-6 animate-bounce" />
              <h3 className="text-sm font-extrabold tracking-tight">নতুন আরএফআইডি / কিউআর কার্ড সনাক্ত হয়েছে!</h3>
            </div>
            
            <p className="text-[11px] text-slate-300 leading-relaxed">
              একটি স্মার্ট কার্ড আইডি স্ক্যান করা হয়েছে যার কোড: <strong className="text-amber-400 font-mono text-xs bg-slate-950 px-2.5 py-1 rounded border border-slate-800 ml-1 inline-block">{unregisteredScannedId}</strong>।
              এটি এখনো আমাদের শিক্ষার্থীদের ডেটাবেজে নিবন্ধিত নেই। আপনি এই কার্ডটি কী করতে চান?
            </p>

            <div className="space-y-4 pt-1">
              {/* Option A: Assign to Existing */}
              <div className="bg-slate-950/60 p-3.5 border border-slate-800/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="block text-[9.5px] font-black text-amber-300 uppercase tracking-widest leading-none">
                    বিকল্প ১। বিদ্যমান শিক্ষার্থীর সাথে যুক্ত করুন:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAssignVerified(!isAssignVerified)}
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                      isAssignVerified ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isAssignVerified ? '✓ নিশ্চিত' : 'যাচাই?'}
                  </button>
                </div>
                <select
                  value={assignToStudentId}
                  onChange={(e) => {
                    setAssignToStudentId(e.target.value);
                    setIsAssignVerified(false);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-blue-300 font-bold focus:border-blue-500 focus:outline-none"
                >
                  <option value="" className="text-slate-500">-- শিক্ষার্থী নির্বাচন করুন --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="text-slate-200">
                      {s.banglaName} (শ্রেণী: {s.className}, রোল: {s.roll})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!assignToStudentId) {
                      alert('দয়া করে তালিকায় থাকা একজন শিক্ষার্থী নির্বাচন করুন।');
                      return;
                    }
                    updateStudentId(assignToStudentId, unregisteredScannedId);
                    playBeep();
                    alert(`সাফল্য! এই কার্ডটি ${students.find(s => s.id === assignToStudentId)?.banglaName || ''} এর ডিজিটাল প্রোফাইলের সাথে পার্মানেন্টলি লিংক আপ করা হয়েছে। এখন এই কার্ডটি দিয়ে সরাসরি স্ক্যান করতে পারবেন।`);
                    setSelectedId(unregisteredScannedId);
                    setUnregisteredScannedId(null);
                    setAssignToStudentId('');
                    setIsAssignVerified(false);
                  }}
                  className="w-full text-[10px] font-extrabold bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-white transition-all shadow-sm cursor-pointer"
                >
                  এই কার্ডটি এসাইন লিঙ্ক করুন 🔗
                </button>
              </div>

              {/* Option B: Register New Student On the fly with Field Confirmation Buttons */}
              <div className="bg-slate-950/60 p-3.5 border border-slate-800/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="block text-[9.5px] font-black text-amber-300 uppercase tracking-widest leading-none">
                    বিকল্প ২। অন-দ্য-ফ্লাই নতুন রেজিস্ট্রেশন:
                  </span>
                  <button
                    type="button"
                    onClick={() => setVerifiedOnTheFlyFields({ name: true, class: true, roll: true, phone: true })}
                    className="text-[8px] text-amber-300 hover:underline font-bold cursor-pointer"
                  >
                    সকল ফিল্ড নিশ্চিত
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[8px] text-slate-400 block">নাম (বাংলা)</label>
                      <button
                        type="button"
                        onClick={() => setVerifiedOnTheFlyFields(prev => ({ ...prev, name: !prev.name }))}
                        className={`text-[7.5px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          verifiedOnTheFlyFields.name ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {verifiedOnTheFlyFields.name ? '✓ নিশ্চিত' : 'যাচাই?'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="যেমন: মারিয়া খাতুন"
                      value={newStudentNameBng}
                      onChange={(e) => {
                        setNewStudentNameBng(e.target.value);
                        setVerifiedOnTheFlyFields(prev => ({ ...prev, name: false }));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10.5px] text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[8px] text-slate-400 block">শ্রেণী (Class)</label>
                      <button
                        type="button"
                        onClick={() => setVerifiedOnTheFlyFields(prev => ({ ...prev, class: !prev.class }))}
                        className={`text-[7.5px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          verifiedOnTheFlyFields.class ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {verifiedOnTheFlyFields.class ? '✓ নিশ্চিত' : 'যাচাই?'}
                      </button>
                    </div>
                    <select
                      value={newStudentClass}
                      onChange={(e) => {
                        setNewStudentClass(e.target.value);
                        setVerifiedOnTheFlyFields(prev => ({ ...prev, class: false }));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 px-1 py-1 rounded text-[10.5px] text-stone-200 focus:outline-none"
                    >
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="অষ্টম শ্রেণি">অষ্টম শ্রেণি (Class 8)</option>
                      <option value="নবম শ্রেণি">নবম শ্রেণি (Class 9)</option>
                      <option value="দশম শ্রেণি">দশম শ্রেণি (Class 10)</option>
                      <option value="এসএসসি পরীক্ষার্থী">এসএসসি পরীক্ষার্থী (SSC Examinee)</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[8px] text-slate-400 block">শ্রেণী রোল</label>
                      <button
                        type="button"
                        onClick={() => setVerifiedOnTheFlyFields(prev => ({ ...prev, roll: !prev.roll }))}
                        className={`text-[7.5px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          verifiedOnTheFlyFields.roll ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {verifiedOnTheFlyFields.roll ? '✓ নিশ্চিত' : 'যাচাই?'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="রোল"
                      value={newStudentRoll}
                      onChange={(e) => {
                        setNewStudentRoll(e.target.value);
                        setVerifiedOnTheFlyFields(prev => ({ ...prev, roll: false }));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10.5px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[8px] text-slate-400 block">অভিভাবক ফোন</label>
                      <button
                        type="button"
                        onClick={() => setVerifiedOnTheFlyFields(prev => ({ ...prev, phone: !prev.phone }))}
                        className={`text-[7.5px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          verifiedOnTheFlyFields.phone ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {verifiedOnTheFlyFields.phone ? '✓ নিশ্চিত' : 'যাচাই?'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="ফোন"
                      value={newStudentGPhone}
                      onChange={(e) => {
                        setNewStudentGPhone(e.target.value);
                        setVerifiedOnTheFlyFields(prev => ({ ...prev, phone: false }));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10.5px] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!newStudentNameBng || !newStudentRoll) {
                      alert('দয়া করে নাম ও রোল ফিল্ড পূরণ করুন।');
                      return;
                    }
                    // Generate new student
                    addStudent({
                      name: newStudentNameBng,
                      banglaName: newStudentNameBng,
                      className: newStudentClass,
                      roll: newStudentRoll,
                      guardianName: 'অভিভাবক (সিস্টেম জেনারেটেড)',
                      guardianPhone: newStudentGPhone,
                      feesPaid: 0,
                      totalFees: 15000,
                    });
                    
                    setTimeout(() => {
                      updateStudentId(newStudentNameBng, unregisteredScannedId);
                    }, 100);

                    playBeep();
                    alert(`সাফল্য! নতুন শিক্ষার্থী '${newStudentNameBng}' নিবন্ধিত হয়েছে এবং এই কার্ডটি তার নতুন আইডি হিসেবে এসাইন করা হয়েছে।`);
                    
                    setUnregisteredScannedId(null);
                    setNewStudentNameBng('');
                    setNewStudentRoll('');
                    setVerifiedOnTheFlyFields({ name: false, class: false, roll: false, phone: false });
                  }}
                  className="w-full text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-xl text-white transition-all shadow-sm cursor-pointer"
                >
                  রেজিস্টার ও কার্ড লিংক করুন ✨
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setUnregisteredScannedId(null);
                setAssignToStudentId('');
                setIsAssignVerified(false);
                setVerifiedOnTheFlyFields({ name: false, class: false, roll: false, phone: false });
              }}
              className="w-full text-center text-slate-400 hover:text-white text-[10px] uppercase font-bold py-1 transition-colors block cursor-pointer"
            >
              বন্ধ করুন (Close Panel)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
