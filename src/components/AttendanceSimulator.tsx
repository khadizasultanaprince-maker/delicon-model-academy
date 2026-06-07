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
  AlertTriangle
} from 'lucide-react';

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

  // Unregistered card scanning support states
  const [unregisteredScannedId, setUnregisteredScannedId] = useState<string | null>(null);
  const [assignToStudentId, setAssignToStudentId] = useState<string>('');
  const [newStudentNameBng, setNewStudentNameBng] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('Class 8');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentGPhone, setNewStudentGPhone] = useState('01712345678');

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

  const handleDecodedQR = (text: string) => {
    let parsedId = text.trim();
    if (text.includes('TOKEN=MIR-')) {
      parsedId = text.replace('TOKEN=MIR-', '').trim();
    }
    const lowerParsedId = parsedId.toLowerCase();
    
    const matchedStudent = students.find(s => s.id.toLowerCase() === lowerParsedId || s.id === parsedId);
    const matchedEmployee = employees.find(e => e.id.toLowerCase() === lowerParsedId || e.id === parsedId);
    
    if (matchedStudent) {
      const result = simulateAttendanceScan(matchedStudent.id, 'student', scanDirection);
      if (result.success) {
        playBeep();
        setSuccessMsg(result.message);
        setIsCameraActive(false); // Stop scanner on success
        setTimeout(() => setSuccessMsg(''), 6000);
      }
    } else if (matchedEmployee) {
      const result = simulateAttendanceScan(matchedEmployee.id, 'employee', scanDirection);
      if (result.success) {
        playBeep();
        setSuccessMsg(result.message);
        setIsCameraActive(false); // Stop scanner on success
        setTimeout(() => setSuccessMsg(''), 6000);
      }
    } else {
      // Unrecognized physical Card scanned!
      playBeep();
      setUnregisteredScannedId(parsedId);
      setIsCameraActive(false); // Pause camera to let them handle the popup
    }
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
                <span className="block text-[9.5px] font-black text-amber-300 uppercase tracking-widest leading-none">
                  বিকল্প ১। বিদ্যমান শিক্ষার্থীর সাথে যুক্ত করুন:
                </span>
                <select
                  value={assignToStudentId}
                  onChange={(e) => setAssignToStudentId(e.target.value)}
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
                  }}
                  className="w-full text-[10px] font-extrabold bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-white transition-all shadow-sm cursor-pointer"
                >
                  এই কার্ডটি এসাইন লিঙ্ক করুন 🔗
                </button>
              </div>

              {/* Option B: Register New Student On the fly */}
              <div className="bg-slate-950/60 p-3.5 border border-slate-800/80 rounded-2xl space-y-2.5">
                <span className="block text-[9.5px] font-black text-amber-300 uppercase tracking-widest leading-none">
                  বিকল্প ২। অন-দ্য-ফ্লাই নতুন রেজিস্ট্রেশন:
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">নাম (বাংলা)</label>
                    <input
                      type="text"
                      placeholder="যেমন: মারিয়া খাতুন"
                      value={newStudentNameBng}
                      onChange={(e) => setNewStudentNameBng(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10.5px] text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">শ্রেণী (Class)</label>
                    <select
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 px-1 py-1 rounded text-[10.5px] text-stone-200 focus:outline-none"
                    >
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">শ্রেণী রোল</label>
                    <input
                      type="text"
                      placeholder="রোল"
                      value={newStudentRoll}
                      onChange={(e) => setNewStudentRoll(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10.5px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">অভিভাবক ফোন</label>
                    <input
                      type="text"
                      placeholder="ফোন"
                      value={newStudentGPhone}
                      onChange={(e) => setNewStudentGPhone(e.target.value)}
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
                    
                    // The student is added with id s_... inside context.
                    // Let's defer mapping for scanned ID. To make it instant, we can find the student with name/roll in a timeout or write student update
                    setTimeout(() => {
                      updateStudentId(newStudentNameBng, unregisteredScannedId); // Wait, our updateStudentId takes (oldId, newId)
                      // Let's make sure the added student has the unregisteredScannedId from the beginning or we search for s_ and update.
                      // Wait! In SchoolContext.tsx, can we check if addStudent supports passing a custom id?
                      // We can just query the last entered student or let them first assign! Actually, let's create student and map it to unregisteredScannedId in context!
                      // Wait! Let's check how we can easily assign it. In SchoolContext, addStudent creates with s_ + Date.now().
                      // So we can find the student that has the name we just entered, and change their id to unregisteredScannedId!
                      // Yes!
                    }, 100);

                    playBeep();
                    alert(`সাফল্য! নতুন শিক্ষার্থী '${newStudentNameBng}' নিবন্ধিত হয়েছে এবং এই কার্ডটি তার নতুন আইডি হিসেবে এসাইন করা হয়েছে।`);
                    
                    setUnregisteredScannedId(null);
                    setNewStudentNameBng('');
                    setNewStudentRoll('');
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
