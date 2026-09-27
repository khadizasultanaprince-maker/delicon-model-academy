/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student } from '../types';
import { 
  Sparkles, Upload, Link as LinkIcon, Camera, Eye, EyeOff, Check, AlertCircle, 
  Trash2, Edit3, Plus, Search, Filter, Printer, FileText, UserCheck, 
  RefreshCw, CheckCircle2, Clock, ShieldCheck, ChevronDown, ChevronUp,
  Image, ExternalLink, HelpCircle, Save, X, Phone, User, QrCode,
  Layers, Award, RotateCcw
} from 'lucide-react';
import { DigitalStudentIdCard } from './DigitalStudentIdCard';

interface StudentDataEntryManagerProps {
  currentRole?: string;
  onOpenIdCard?: (student: Student) => void;
}

export const StudentDataEntryManager: React.FC<StudentDataEntryManagerProps> = ({ 
  currentRole = 'Developer',
  onOpenIdCard
}) => {
  const { 
    students, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    purgeDemoStudents, 
    restoreDemoStudents, 
    importMeritStudentsToDirectory,
    meritStudents,
    schoolName, 
    schoolSlogan, 
    schoolLogoVal 
  } = useSchool();

  // Standard academic classes list
  const ALL_CLASSES = [
    'প্লে (Play)',
    'নার্সারী (Nursery)',
    'কেজি (KG)',
    'Class 1',
    'Class 2',
    'Class 3',
    'Class 4',
    'Class 5',
    'Class 6',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
  ];

  // Helper to normalize class identifiers
  const normalizeClassKey = (clsName: string): string => {
    const c = (clsName || '').toLowerCase().trim();
    if (c.includes('প্লে') || c.includes('play')) return 'প্লে (Play)';
    if (c.includes('নার্সারী') || c.includes('nursery')) return 'নার্সারী (Nursery)';
    if (c.includes('কেজি') || c.includes('kg')) return 'কেজি (KG)';
    if (c.includes('1') || c.includes('১ম') || c.includes('প্রথম')) return 'Class 1';
    if (c.includes('2') || c.includes('২য়') || c.includes('দ্বিতীয়')) return 'Class 2';
    if (c.includes('3') || c.includes('৩য়') || c.includes('তৃতীয়')) return 'Class 3';
    if (c.includes('4') || c.includes('৪র্থ') || c.includes('চতুর্থ')) return 'Class 4';
    if (c.includes('5') || c.includes('৫ম') || c.includes('পঞ্চম')) return 'Class 5';
    if (c.includes('6') || c.includes('৬ষ্ঠ') || c.includes('ষষ্ঠ')) return 'Class 6';
    if (c.includes('7') || c.includes('৭ম') || c.includes('সপ্তম')) return 'Class 7';
    if (c.includes('8') || c.includes('৮ম') || c.includes('অষ্টম')) return 'Class 8';
    if (c.includes('9') || c.includes('৯ম') || c.includes('নবম')) return 'Class 9';
    if (c.includes('10') || c.includes('১০ম') || c.includes('দশম')) return 'Class 10';
    return clsName;
  };

  // Helper to detect initial demo/mock student entries
  const isDemoStudent = (st: Student): boolean => {
    if (st.isDemo) return true;
    if (['s1', 's2', 's3', 's4'].includes(st.id)) return true;
    if (['Afifa Rahman', 'Tanvir Ahmed', 'Raisa Yasmin', 'Tahsin Islam'].includes(st.name || '')) return true;
    return false;
  };

  const demoStudents = students.filter(isDemoStudent);
  const realStudents = students.filter(s => !isDemoStudent(s));
  const realStudentsCount = realStudents.length;
  const demoStudentsCount = demoStudents.length;

  // Breakdown statistics per class
  const classBreakdown = ALL_CLASSES.map(cls => {
    const inClass = students.filter(s => normalizeClassKey(s.className) === normalizeClassKey(cls) || s.className === cls);
    const realInClass = inClass.filter(s => !isDemoStudent(s));
    const demoInClass = inClass.filter(s => isDemoStudent(s));
    return {
      className: cls,
      total: inClass.length,
      realCount: realInClass.length,
      demoCount: demoInClass.length,
      completeCount: inClass.filter(s => s.entryStatus === 'Complete' || calculateCompleteness(s) >= 80).length,
      partialCount: inClass.filter(s => s.entryStatus !== 'Complete' && calculateCompleteness(s) < 80).length,
    };
  });

  const handlePurgeAllDemoData = () => {
    if (confirm(`আপনি কি নিশ্চিত যে সমস্ত প্রাথমিক ডেমো শিক্ষার্থী (${demoStudentsCount} জন) স্থায়ীভাবে মুছে ফেলতে চান?\n\nআপনার নিজস্ব এন্ট্রি করা কোনো আসল শিক্ষার্থীর তথ্য ডিলিট হবে না।`)) {
      purgeDemoStudents();
      alert(`সমস্ত ডেমো ডাটা সফলভাবে মুছে ফেলা হয়েছে!\n\nবর্তমানে ডাটাবেজে মূল শিক্ষার্থীর সংখ্যা: ${realStudentsCount} জন।`);
    }
  };

  const handleRestoreDemoData = () => {
    if (confirm(`আপনি কি প্রাথমিক ডেমো শিক্ষার্থী ডাটা রিস্টোর করতে চান?`)) {
      restoreDemoStudents();
      alert(`ডেমো ডাটা সফলভাবে রিস্টোর করা হয়েছে।`);
    }
  };

  const handleImportMeritStudents = () => {
    if (confirm(`কৃতি শিক্ষার্থী প্রদর্শনীতে থাকা ১১ জন কৃতি শিক্ষার্থীকে মূল শিক্ষার্থী ডিরেক্টরিতে স্বয়ংক্রিয়ভাবে ইম্পোর্ট করতে চান?\n\nএতে তাদের নাম, ছবি ও শ্রেণী অনুযায়ী প্রাথমিক প্রোফাইল তৈরি হবে, যা আপনি পরবর্তীতে আরও তথ্য দিয়ে আপডেট করতে পারবেন।`)) {
      const added = importMeritStudentsToDirectory();
      alert(`সাফল্য! ${added} জন শিক্ষার্থীকে কৃতি তালিকা থেকে মূল ডাটাবেজে সফলভাবে যুক্ত করা হয়েছে!`);
    }
  };

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Currently Editing Student (null = New Student)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Form State - All fields optional to allow progressive / partial entries
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    banglaName: '',
    className: 'Class 5',
    section: 'A',
    roll: '',
    sessionYear: '2026',
    admissionDate: new Date().toISOString().split('T')[0],
    version: 'Bangla',
    shift: 'Morning',
    birthRegNo: '',
    dob: '',
    bloodGroup: '',
    gender: 'Male',
    religion: 'ইসলাম',
    nationality: 'বাংলাদেশী',
    disability: '',
    photoUrl: '',
    fatherNameBn: '',
    fatherNameEn: '',
    fatherNid: '',
    fatherPhone: '',
    fatherOccupation: '',
    fatherEducation: '',
    fatherIncome: '',
    motherNameBn: '',
    motherNameEn: '',
    motherNid: '',
    motherPhone: '',
    motherOccupation: '',
    motherEducation: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: 'পিতা',
    guardianNid: '',
    guardianEmail: '',
    presentAddress: '',
    permanentAddress: '',
    previousSchool: '',
    previousClassRoll: '',
    tcNumberDate: '',
    formImageRefUrl: '',
    birthCertScanUrl: '',
    parentsNidScanUrl: '',
    entryStatus: 'Draft',
    entryNotes: '',
    feesPaid: 0,
    totalFees: 15000,
  });

  // AI OCR Scanning States
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanImagePreview, setScanImagePreview] = useState<string | null>(null);
  const [scanInputUrl, setScanInputUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);
  const [showImagePreviewModal, setShowImagePreviewModal] = useState<string | null>(null);
  const [showPrintModalStudent, setShowPrintModalStudent] = useState<Student | null>(null);
  const [showIdCardModalStudent, setShowIdCardModalStudent] = useState<Student | null>(null);

  // Section Accordion Collapses
  const [openSections, setOpenSections] = useState({
    academic: true,
    personal: true,
    parents: true,
    guardian: true,
    address: true,
    priorSchool: false,
    attachment: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper to calculate data completeness percentage
  const calculateCompleteness = (st: Partial<Student>) => {
    const keyFields = [
      st.banglaName, st.name, st.className, st.roll, st.birthRegNo, st.dob, st.gender,
      st.fatherNameBn, st.fatherPhone, st.motherNameBn, st.guardianName, st.guardianPhone,
      st.presentAddress, st.formImageRefUrl || st.photoUrl
    ];
    const filled = keyFields.filter(f => f && String(f).trim().length > 0).length;
    return Math.round((filled / keyFields.length) * 100);
  };

  // Handle Form input change
  const handleInputChange = (field: keyof Student, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Copy Present Address to Permanent Address
  const handleCopyAddress = () => {
    if (formData.presentAddress) {
      setFormData(prev => ({ ...prev, permanentAddress: prev.presentAddress }));
    }
  };

  // Helper to compress/scale down large scanned images for super-fast and reliable AI OCR
  const compressImageForOcr = (file: File, maxDimension = 1600, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Select a local file for AI scanning
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScanFile(file);
      setScanErrorMessage(null);
      setScanSuccessMessage(null);
      try {
        const compressedBase64 = await compressImageForOcr(file);
        setScanImagePreview(compressedBase64);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setScanImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Perform AI Scan via Gemini 3.8 Flash
  const handlePerformAiScan = async () => {
    if (!scanImagePreview && !scanInputUrl.trim()) {
      setScanErrorMessage('অনুগ্রহ করে স্ক্যান করা ফরমের ফাইল নির্বাচন করুন অথবা ফরম ইমেজ লিংক পেস্ট করুন।');
      return;
    }

    setIsScanning(true);
    setScanErrorMessage(null);
    setScanSuccessMessage(null);

    try {
      const payload: any = {};
      if (scanImagePreview) {
        payload.imageData = scanImagePreview;
      } else if (scanInputUrl.trim()) {
        payload.imageUrl = scanInputUrl.trim();
      }

      const res = await fetch('/api/gemini/scan-student-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'এআই স্ক্যান সম্পন্ন করা যায়নি।');
      }

      const extracted = result.data;

      // Auto-populate form data with extracted fields
      setFormData(prev => ({
        ...prev,
        banglaName: extracted.banglaName || prev.banglaName,
        name: extracted.name || prev.name,
        className: extracted.className || prev.className || 'Class 5',
        section: extracted.section || prev.section || 'A',
        roll: extracted.roll || prev.roll || '01',
        sessionYear: extracted.sessionYear || prev.sessionYear || '2026',
        admissionDate: extracted.admissionDate || prev.admissionDate,
        version: extracted.version === 'English' ? 'English' : 'Bangla',
        shift: extracted.shift === 'Day' ? 'Day' : 'Morning',
        birthRegNo: extracted.birthRegNo || prev.birthRegNo,
        dob: extracted.dob || prev.dob,
        bloodGroup: extracted.bloodGroup || prev.bloodGroup,
        gender: extracted.gender === 'Female' ? 'Female' : 'Male',
        religion: extracted.religion || prev.religion || 'ইসলাম',
        nationality: extracted.nationality || prev.nationality || 'বাংলাদেশী',
        disability: extracted.disability || prev.disability,
        fatherNameBn: extracted.fatherNameBn || prev.fatherNameBn,
        fatherNameEn: extracted.fatherNameEn || prev.fatherNameEn,
        fatherNid: extracted.fatherNid || prev.fatherNid,
        fatherPhone: extracted.fatherPhone || prev.fatherPhone,
        fatherOccupation: extracted.fatherOccupation || prev.fatherOccupation,
        fatherEducation: extracted.fatherEducation || prev.fatherEducation,
        fatherIncome: extracted.fatherIncome || prev.fatherIncome,
        motherNameBn: extracted.motherNameBn || prev.motherNameBn,
        motherNameEn: extracted.motherNameEn || prev.motherNameEn,
        motherNid: extracted.motherNid || prev.motherNid,
        motherPhone: extracted.motherPhone || prev.motherPhone,
        motherOccupation: extracted.motherOccupation || prev.motherOccupation,
        motherEducation: extracted.motherEducation || prev.motherEducation,
        guardianName: extracted.guardianName || prev.guardianName || extracted.fatherNameBn || extracted.motherNameBn,
        guardianPhone: extracted.guardianPhone || prev.guardianPhone || extracted.fatherPhone || extracted.motherPhone,
        guardianRelation: extracted.guardianRelation || prev.guardianRelation || 'পিতা',
        guardianNid: extracted.guardianNid || prev.guardianNid,
        presentAddress: extracted.presentAddress || prev.presentAddress,
        permanentAddress: extracted.permanentAddress || prev.permanentAddress,
        previousSchool: extracted.previousSchool || prev.previousSchool,
        previousClassRoll: extracted.previousClassRoll || prev.previousClassRoll,
        tcNumberDate: extracted.tcNumberDate || prev.tcNumberDate,
        formImageRefUrl: scanInputUrl.trim() || prev.formImageRefUrl,
        entryStatus: 'Partial',
        entryNotes: extracted.detectedTextSummary ? `[এআই সারাংশ]: ${extracted.detectedTextSummary}` : prev.entryNotes
      }));

      // If user uploaded a photo, also keep reference
      if (scanInputUrl.trim()) {
        setFormData(prev => ({ ...prev, formImageRefUrl: scanInputUrl.trim() }));
      }

      setScanSuccessMessage('⚡ ফরমটি এআই দিয়ে সফলভাবে রিড করা হয়েছে এবং তথ্য ছকে স্বয়ংক্রিয়ভাবে ইনপুট করা হয়েছে! অনুগ্রহ করে নিচে মিলিয়ে দেখে সেভ করুন।');
      
      // Auto open all sections to review
      setOpenSections({
        academic: true,
        personal: true,
        parents: true,
        guardian: true,
        address: true,
        priorSchool: true,
        attachment: true
      });

      // Smooth scroll to form fields
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      console.error('Scan error:', err);
      let errorMsg = err?.message || 'ফরমটি এআই দিয়ে স্ক্যান করার সময় সমস্যা হয়েছে।';
      if (typeof errorMsg === 'string') {
        if (errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE')) {
          errorMsg = 'এআই সার্ভারে বর্তমানে সাময়িক চাপ রয়েছে। নিচের "পুনরায় স্ক্যান করুন" বোতামে চাপুন, স্বয়ংক্রিয় ব্যাকআপ মডেলে দ্রুত প্রসেস হয়ে যাবে।';
        } else if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
          errorMsg = 'রিকোয়েস্টের সীমা অতিক্রম করেছে। ক্ষনিক অপেক্ষা করে পুনরায় চেষ্টা করুন।';
        } else if (errorMsg.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(errorMsg);
            errorMsg = parsed.error?.message || parsed.message || parsed.error || errorMsg;
          } catch (e) {}
        }
      }
      setScanErrorMessage(errorMsg);
    } finally {
      setIsScanning(false);
    }
  };

  // Submit / Save or Update Student
  const handleSaveStudent = () => {
    // Provide sensible defaults if not filled, ensuring zero blocking
    const effectiveBanglaName = formData.banglaName?.trim() || formData.name?.trim() || 'নামবিহীন শিক্ষার্থী';
    const effectiveName = formData.name?.trim() || formData.banglaName?.trim() || 'Unnamed Student';
    const effectiveClass = formData.className || 'Class 5';
    const effectiveRoll = formData.roll?.trim() || String(students.filter(s => s.className === effectiveClass).length + 1).padStart(2, '0');
    const effectiveGuardianName = formData.guardianName?.trim() || formData.fatherNameBn?.trim() || formData.motherNameBn?.trim() || 'অভিভাবক';
    const effectiveGuardianPhone = formData.guardianPhone?.trim() || formData.fatherPhone?.trim() || '01700000000';

    const completeness = calculateCompleteness(formData);
    const calculatedStatus: Student['entryStatus'] = completeness >= 80 ? 'Complete' : completeness >= 40 ? 'Partial' : 'Draft';

    const studentPayload: any = {
      ...formData,
      banglaName: effectiveBanglaName,
      name: effectiveName,
      className: effectiveClass,
      roll: effectiveRoll,
      guardianName: effectiveGuardianName,
      guardianPhone: effectiveGuardianPhone,
      feesPaid: formData.feesPaid ?? 0,
      totalFees: formData.totalFees ?? 15000,
      entryStatus: formData.entryStatus && formData.entryStatus !== 'Draft' ? formData.entryStatus : calculatedStatus,
      lastUpdated: new Date().toISOString()
    };

    if (editingStudentId) {
      updateStudent(editingStudentId, studentPayload);
      alert(`শিক্ষার্থী "${effectiveBanglaName}"-এর তথ্য সফলভাবে হালনাগাদ (Update) করা হয়েছে!`);
      setEditingStudentId(null);
    } else {
      addStudent(studentPayload);
      alert(`শিক্ষার্থী "${effectiveBanglaName}"-এর তথ্য সফলভাবে ডাটাবেজে যুক্ত করা হয়েছে!`);
    }

    // Reset Form to initial clean state
    handleResetForm();
  };

  // Reset form to blank
  const handleResetForm = () => {
    setEditingStudentId(null);
    setFormData({
      name: '',
      banglaName: '',
      className: 'Class 5',
      section: 'A',
      roll: '',
      sessionYear: '2026',
      admissionDate: new Date().toISOString().split('T')[0],
      version: 'Bangla',
      shift: 'Morning',
      birthRegNo: '',
      dob: '',
      bloodGroup: '',
      gender: 'Male',
      religion: 'ইসলাম',
      nationality: 'বাংলাদেশী',
      disability: '',
      photoUrl: '',
      fatherNameBn: '',
      fatherNameEn: '',
      fatherNid: '',
      fatherPhone: '',
      fatherOccupation: '',
      fatherEducation: '',
      fatherIncome: '',
      motherNameBn: '',
      motherNameEn: '',
      motherNid: '',
      motherPhone: '',
      motherOccupation: '',
      motherEducation: '',
      guardianName: '',
      guardianPhone: '',
      guardianRelation: 'পিতা',
      guardianNid: '',
      guardianEmail: '',
      presentAddress: '',
      permanentAddress: '',
      previousSchool: '',
      previousClassRoll: '',
      tcNumberDate: '',
      formImageRefUrl: '',
      birthCertScanUrl: '',
      parentsNidScanUrl: '',
      entryStatus: 'Draft',
      entryNotes: '',
      feesPaid: 0,
      totalFees: 15000,
    });
    setScanFile(null);
    setScanImagePreview(null);
    setScanInputUrl('');
    setScanSuccessMessage(null);
    setScanErrorMessage(null);
  };

  // Load existing student for editing
  const handleEditStudent = (st: Student) => {
    setEditingStudentId(st.id);
    setFormData({
      ...st,
    });
    if (st.formImageRefUrl) {
      setScanInputUrl(st.formImageRefUrl);
    }
    // Scroll to form
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Filtered Students list
  const filteredStudents = students.filter(st => {
    const matchesSearch = 
      (st.banglaName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.roll || '').includes(searchQuery) ||
      (st.guardianPhone || '').includes(searchQuery) ||
      (st.birthRegNo || '').includes(searchQuery) ||
      (st.fatherNameBn || '').includes(searchQuery);

    const matchesClass = filterClass === 'All' || st.className === filterClass;
    const matchesStatus = filterStatus === 'All' || 
      (filterStatus === 'Complete' && st.entryStatus === 'Complete') ||
      (filterStatus === 'Partial' && (st.entryStatus === 'Partial' || !st.entryStatus)) ||
      (filterStatus === 'Draft' && st.entryStatus === 'Draft') ||
      (filterStatus === 'Verified' && st.entryStatus === 'Verified');

    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-300 border border-amber-400/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>ডেভেলপার ও অ্যাডমিন সুপার-প্যানেল ({currentRole})</span>
            </div>
            <h2 className="mt-2 text-xl md:text-2xl font-black tracking-tight">
              শিক্ষার্থী তথ্য ছক ও এআই ভিশন অটো-স্ক্যানার
            </h2>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              কোন নির্দিষ্ট তথ্যের প্রায়োরিটি বা বাধ্যবাধকতা নেই। যখন যেটুকু তথ্য পাবেন সেটুকুই এন্ট্রি করুন। তথ্যসূত্র হিসেবে ফরমের ইমেজ লিংক পেস্ট করে রাখুন বা সরাসরি স্ক্যান কপি আপলোড করুন। পরবর্তীতে নতুন তথ্য পেলে এক ক্লিকেই আপডেট করে নিতে পারবেন।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                handleResetForm();
                formRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold px-4 py-2.5 text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>নতুন শিক্ষার্থী এন্ট্রি</span>
            </button>
          </div>
        </div>

        {/* Quick Statistics Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <span className="text-slate-400 block text-[10px] font-bold">মোট নিবন্ধিত শিক্ষার্থী</span>
            <span className="text-lg font-black text-white">{students.length} জন</span>
          </div>
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/30 p-3 backdrop-blur-sm">
            <span className="text-emerald-300 block text-[10px] font-bold">মূল শিক্ষার্থী (Real)</span>
            <span className="text-lg font-black text-emerald-300">{realStudentsCount} জন</span>
          </div>
          <div className={`rounded-xl p-3 backdrop-blur-sm border ${
            demoStudentsCount > 0 
              ? 'bg-rose-500/20 border-rose-400/40 text-rose-300' 
              : 'bg-white/10 border-white/10 text-slate-300'
          }`}>
            <span className="block text-[10px] font-bold">ডেমো ডাটা (Demo)</span>
            <span className="text-lg font-black">{demoStudentsCount} জন</span>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <span className="text-amber-300 block text-[10px] font-bold">সম্পূর্ণ এন্ট্রি (Complete)</span>
            <span className="text-lg font-black text-amber-300">
              {students.filter(s => s.entryStatus === 'Complete' || calculateCompleteness(s) >= 80).length} জন
            </span>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <span className="text-cyan-300 block text-[10px] font-bold">ফরম ইমেজ লিংক এটাচড</span>
            <span className="text-lg font-black text-cyan-300">
              {students.filter(s => s.formImageRefUrl && s.formImageRefUrl.trim().length > 0).length} টি
            </span>
          </div>
        </div>
      </div>

      {/* 1. AI DOCUMENT OCR SCANNER BOX */}
      <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-indigo-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-indigo-950 text-sm md:text-base flex items-center gap-2">
                <span>⚡ এআই স্ক্যানার: স্ক্যান করা ফাইল থেকে স্বয়ংক্রিয় রিড ও ডেটা এন্ট্রি</span>
                <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-indigo-900 border border-amber-400/40">
                  Gemini 3.8 Flash OCR
                </span>
              </h3>
              <p className="text-[11px] text-indigo-800">
                ভর্তি ফরম বা তথ্য ছকের ছবি আপলোড বা লিংক দিলে এআই স্বয়ংক্রিয়ভাবে শিক্ষার্থীর নাম, শ্রেণী, অভিভাবকের ফোন ইত্যাদি সনাক্ত করে ফরম পূরণ করবে।
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Method A: File Upload or Camera */}
          <div className="rounded-xl bg-white p-4 border border-indigo-100 shadow-sm flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-indigo-600" />
                <span>পদ্ধতি ১: স্ক্যান করা ফরম ফাইল / ছবি আপলোড</span>
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/70 p-4 text-center transition-all"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileSelect} 
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 group-hover:scale-110 transition-transform">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-bold text-indigo-900">
                    {scanFile ? scanFile.name : 'ছবি বেছে নিন অথবা ক্যামেরা দিয়ে তুলুন'}
                  </div>
                  <p className="text-[10px] text-slate-400">JPG, PNG, WebP ফরম্যাট সমর্থিত</p>
                </div>
              </div>

              {scanImagePreview && (
                <div className="mt-3 flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <img 
                    src={scanImagePreview} 
                    alt="Preview" 
                    className="h-12 w-12 object-cover rounded border cursor-pointer hover:opacity-80"
                    onClick={() => setShowImagePreviewModal(scanImagePreview)}
                  />
                  <div className="flex-1 min-w-0 text-[11px]">
                    <span className="font-bold text-slate-700 block truncate">{scanFile?.name || 'স্ক্যান করা ফাইল'}</span>
                    <button 
                      onClick={() => setShowImagePreviewModal(scanImagePreview)}
                      className="text-indigo-600 hover:underline flex items-center gap-1 text-[10px] font-semibold"
                    >
                      <Eye className="h-3 w-3" /> বড় আকারে দেখুন
                    </button>
                  </div>
                  <button 
                    onClick={() => { setScanFile(null); setScanImagePreview(null); }}
                    className="text-rose-500 hover:bg-rose-50 p-1.5 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Method B: Image Link Paste */}
          <div className="rounded-xl bg-white p-4 border border-indigo-100 shadow-sm flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-indigo-600" />
                <span>পদ্ধতি ২: তথ্যসূত্র হিসেবে ফরমের ইমেজ লিংক পেস্ট করুন</span>
              </label>

              <p className="text-[11px] text-slate-500 mb-2">
                পোস্টইমেজ (PostImages), গুগল ড্রাইভ, ক্লাউড বা যেকোনো অনলাইন ফরম ইমেজের লিংক দিন:
              </p>

              <div className="flex gap-2">
                <input 
                  type="url"
                  placeholder="যেমন: https://i.postimg.cc/xyz/form.jpg"
                  value={scanInputUrl}
                  onChange={e => setScanInputUrl(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-indigo-600 text-slate-800 bg-white"
                />
                {scanInputUrl.trim() && (
                  <button
                    onClick={() => setShowImagePreviewModal(scanInputUrl.trim())}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1"
                    title="প্রিভিউ"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={handlePerformAiScan}
                disabled={isScanning || (!scanImagePreview && !scanInputUrl.trim())}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-black text-white shadow-md transition-all cursor-pointer ${
                  isScanning || (!scanImagePreview && !scanInputUrl.trim())
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-indigo-500/20'
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-amber-300" />
                    <span>এআই দিয়ে ফরম রিড ও প্রসেসিং হচ্ছে, ক্ষনিক অপেক্ষা করুন...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>⚡ স্ক্যান করা ফাইল থেকে এআই অটো-রিড ও ফিলআপ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scan Status Messages */}
        {scanSuccessMessage && (
          <div className="mt-4 rounded-xl bg-emerald-100/90 border border-emerald-300 p-3.5 text-xs font-bold text-emerald-900 flex items-start gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{scanSuccessMessage}</span>
            </div>
            <button onClick={() => setScanSuccessMessage(null)} className="text-emerald-800 hover:text-emerald-950">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {scanErrorMessage && (
          <div className="mt-4 rounded-xl bg-rose-100/90 border border-rose-300 p-3.5 text-xs font-bold text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
            <div className="flex items-start gap-2 flex-1">
              <AlertCircle className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{scanErrorMessage}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePerformAiScan}
                disabled={isScanning}
                className="flex items-center gap-1 bg-rose-700 hover:bg-rose-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>পুনরায় স্ক্যান করুন</span>
              </button>
              <button 
                type="button"
                onClick={() => setScanErrorMessage(null)} 
                className="text-rose-800 hover:text-rose-950 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. COMPREHENSIVE DATA ENTRY FORM (তথ্য ছক) */}
      <div ref={formRef} className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        
        {/* Form Header with Edit Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
              editingStudentId ? 'bg-amber-500' : 'bg-blue-900'
            }`}>
              {editingStudentId ? <Edit3 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                {editingStudentId ? 'শিক্ষার্থীর তথ্য সংশোধন ও হালনাগাদ (Edit Mode)' : 'নতুন শিক্ষার্থী তথ্য ছক এন্ট্রি (New Entry)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                তথ্য প্রাপ্তির হার: <span className="font-bold text-indigo-700">{calculateCompleteness(formData)}%</span> • 
                {calculateCompleteness(formData) >= 80 ? ' সম্পূর্ণ এন্ট্রি' : ' আংশিক/চলমান এন্ট্রি (পরে আপডেট করা যাবে)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editingStudentId && (
              <button
                onClick={handleResetForm}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="h-3.5 w-3.5" />
                <span>এডিট বাতিল</span>
              </button>
            )}
            <button
              onClick={handleSaveStudent}
              className="flex items-center gap-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold px-5 py-2.5 text-xs transition-all shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4 text-amber-400" />
              <span>{editingStudentId ? 'তথ্য হালনাগাদ করুন (Update)' : 'তথ্য সংরক্ষণ করুন (Save)'}</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: প্রাতিষ্ঠানিক তথ্য (Academic Information) */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('academic')}
            className="flex w-full items-center justify-between bg-slate-100/70 px-4 py-3 text-left font-bold text-slate-800 text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[10px] font-black text-white">১</span>
              <span>প্রাতিষ্ঠানিক তথ্য (Academic Information)</span>
            </div>
            {openSections.academic ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>

          {openSections.academic && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-white">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">শ্রেণী (Class)</label>
                <select 
                  value={formData.className || 'Class 5'}
                  onChange={e => handleInputChange('className', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                >
                  {['প্লে (Play)', 'নার্সারী (Nursery)', 'কেজি (KG)', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">শাখা / সেকশন (Section)</label>
                <input 
                  type="text" 
                  placeholder="যেমন: ক, খ, A, B"
                  value={formData.section || ''}
                  onChange={e => handleInputChange('section', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">রোল নম্বর (Roll No)</label>
                <input 
                  type="text" 
                  placeholder="যেমন: ০১ বা 01"
                  value={formData.roll || ''}
                  onChange={e => handleInputChange('roll', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">শিক্ষাবর্ষ / সেশন (Session Year)</label>
                <input 
                  type="text" 
                  placeholder="২০২৬"
                  value={formData.sessionYear || '2026'}
                  onChange={e => handleInputChange('sessionYear', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ভর্তির তারিখ (Admission Date)</label>
                <input 
                  type="date" 
                  value={formData.admissionDate || ''}
                  onChange={e => handleInputChange('admissionDate', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">মাধ্যম (Version)</label>
                <select 
                  value={formData.version || 'Bangla'}
                  onChange={e => handleInputChange('version', e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                >
                  <option value="Bangla">বাংলা মাধ্যম</option>
                  <option value="English">ইংরেজি ভার্সন</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">শিফট (Shift)</label>
                <select 
                  value={formData.shift || 'Morning'}
                  onChange={e => handleInputChange('shift', e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                >
                  <option value="Morning">প্রভাতী (Morning)</option>
                  <option value="Day">দিবা (Day)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">মাসিক/সেশন ফি (Total Fees)</label>
                <input 
                  type="number" 
                  placeholder="15000"
                  value={formData.totalFees ?? 15000}
                  onChange={e => handleInputChange('totalFees', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: শিক্ষার্থীর ব্যক্তিগত তথ্য (Personal Details) */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('personal')}
            className="flex w-full items-center justify-between bg-slate-100/70 px-4 py-3 text-left font-bold text-slate-800 text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[10px] font-black text-white">২</span>
              <span>শিক্ষার্থীর ব্যক্তিগত তথ্য (Student's Personal Information)</span>
            </div>
            {openSections.personal ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>

          {openSections.personal && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-white">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">শিক্ষার্থীর পূর্ণ নাম (বাংলায়)</label>
                <input 
                  type="text" 
                  placeholder="যেমন: আফিফা রহমান"
                  value={formData.banglaName || ''}
                  onChange={e => handleInputChange('banglaName', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">শিক্ষার্থীর নাম (ইংরেজিতে CAPITAL)</label>
                <input 
                  type="text" 
                  placeholder="e.g. AFIFA RAHMAN"
                  value={formData.name || ''}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900 uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">জন্ম নিবন্ধন সনদ নম্বর (১৭ ডিজিট BRC)</label>
                <input 
                  type="text" 
                  placeholder="যেমন: 20152692518100000"
                  value={formData.birthRegNo || ''}
                  onChange={e => handleInputChange('birthRegNo', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">জন্ম তারিখ (Date of Birth)</label>
                <input 
                  type="date" 
                  value={formData.dob || ''}
                  onChange={e => handleInputChange('dob', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">লিঙ্গ (Gender)</label>
                <select 
                  value={formData.gender || 'Male'}
                  onChange={e => handleInputChange('gender', e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                >
                  <option value="Male">ছাত্র (Male)</option>
                  <option value="Female">ছাত্রী (Female)</option>
                  <option value="Other">অন্যান্য (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">রক্তের গ্রুপ (Blood Group)</label>
                <select 
                  value={formData.bloodGroup || ''}
                  onChange={e => handleInputChange('bloodGroup', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                >
                  <option value="">নির্বাচন করুন (অজানা হলে খালি রাখুন)</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ধর্ম (Religion)</label>
                <select 
                  value={formData.religion || 'ইসলাম'}
                  onChange={e => handleInputChange('religion', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                >
                  <option value="ইসলাম">ইসলাম</option>
                  <option value="হিন্দু">হিন্দু</option>
                  <option value="বৌদ্ধ">বৌদ্ধ</option>
                  <option value="খ্রিস্টান">খ্রিস্টান</option>
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">জাতীয়তা (Nationality)</label>
                <input 
                  type="text" 
                  value={formData.nationality || 'বাংলাদেশী'}
                  onChange={e => handleInputChange('nationality', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">শিক্ষার্থীর ছবির লিংক (Photo URL/Base64)</label>
                <input 
                  type="text" 
                  placeholder="https://... বা ড্রাইভ লিংক"
                  value={formData.photoUrl || ''}
                  onChange={e => handleInputChange('photoUrl', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: পিতা ও মাতার তথ্য (Parents' Information) */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('parents')}
            className="flex w-full items-center justify-between bg-slate-100/70 px-4 py-3 text-left font-bold text-slate-800 text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[10px] font-black text-white">৩</span>
              <span>পিতা ও মাতার বিবরণ (Father & Mother's Information)</span>
            </div>
            {openSections.parents ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>

          {openSections.parents && (
            <div className="p-4 space-y-4 bg-white">
              
              {/* Father Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-blue-50/20">
                <span className="text-xs font-black text-blue-900 block mb-2">👨 পিতার তথ্য (Father's Details)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">পিতার নাম (বাংলা)</label>
                    <input 
                      type="text" 
                      placeholder="উদা: মোঃ খালিদ রহমান"
                      value={formData.fatherNameBn || ''}
                      onChange={e => handleInputChange('fatherNameBn', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">পিতার নাম (English)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MD. KHALID RAHMAN"
                      value={formData.fatherNameEn || ''}
                      onChange={e => handleInputChange('fatherNameEn', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">পিতার মোবাইল নম্বর</label>
                    <input 
                      type="text" 
                      placeholder="01712345678"
                      value={formData.fatherPhone || ''}
                      onChange={e => handleInputChange('fatherPhone', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">পিতার জাতীয় পরিচয়পত্র (NID)</label>
                    <input 
                      type="text" 
                      placeholder="NID নম্বর"
                      value={formData.fatherNid || ''}
                      onChange={e => handleInputChange('fatherNid', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">পিতার পেশা</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: ব্যবসায়ী / চাকুরীজীবী"
                      value={formData.fatherOccupation || ''}
                      onChange={e => handleInputChange('fatherOccupation', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">পিতার মাসিক আয়</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: ৩০,০০০ টাকা"
                      value={formData.fatherIncome || ''}
                      onChange={e => handleInputChange('fatherIncome', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* Mother Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/20">
                <span className="text-xs font-black text-emerald-900 block mb-2">👩 মাতার তথ্য (Mother's Details)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">মাতার নাম (বাংলা)</label>
                    <input 
                      type="text" 
                      placeholder="উদা: ফাতেমা আক্তার"
                      value={formData.motherNameBn || ''}
                      onChange={e => handleInputChange('motherNameBn', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">মাতার নাম (English)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. FATEMA AKTER"
                      value={formData.motherNameEn || ''}
                      onChange={e => handleInputChange('motherNameEn', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">মাতার মোবাইল নম্বর</label>
                    <input 
                      type="text" 
                      placeholder="01812345678"
                      value={formData.motherPhone || ''}
                      onChange={e => handleInputChange('motherPhone', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">মাতার জাতীয় পরিচয়পত্র (NID)</label>
                    <input 
                      type="text" 
                      placeholder="NID নম্বর"
                      value={formData.motherNid || ''}
                      onChange={e => handleInputChange('motherNid', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">মাতার পেশা</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: গৃহিণী / শিক্ষিকা"
                      value={formData.motherOccupation || ''}
                      onChange={e => handleInputChange('motherOccupation', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 4: অভিভাবকের তথ্য ও জরুরী যোগাযোগ (Guardian & Emergency) */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('guardian')}
            className="flex w-full items-center justify-between bg-slate-100/70 px-4 py-3 text-left font-bold text-slate-800 text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[10px] font-black text-white">৪</span>
              <span>অভিভাবকের বিবরণ ও জরুরী যোগাযোগ (Guardian & Emergency Contact)</span>
            </div>
            {openSections.guardian ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>

          {openSections.guardian && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-white">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">অভিভাবকের নাম (Guardian Name)</label>
                <input 
                  type="text" 
                  placeholder="উদা: মোঃ খালিদ রহমান"
                  value={formData.guardianName || ''}
                  onChange={e => handleInputChange('guardianName', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">শিক্ষার্থীর সাথে সম্পর্ক (Relationship)</label>
                <select 
                  value={formData.guardianRelation || 'পিতা'}
                  onChange={e => handleInputChange('guardianRelation', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                >
                  <option value="পিতা">পিতা</option>
                  <option value="মাতা">মাতা</option>
                  <option value="চাচা">চাচা</option>
                  <option value="মামা">মামা</option>
                  <option value="বড় ভাই">বড় ভাই</option>
                  <option value="অন্যান্য আইনগত অভিভাবক">অন্যান্য আইনগত অভিভাবক</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">অভিভাবকের মোবাইল নম্বর (SMS & জরুরি যোগাযোগ)</label>
                <input 
                  type="text" 
                  placeholder="01712345678"
                  value={formData.guardianPhone || ''}
                  onChange={e => handleInputChange('guardianPhone', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900 font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">অভিভাবকের জাতীয় পরিচয়পত্র (NID)</label>
                <input 
                  type="text" 
                  placeholder="NID নম্বর"
                  value={formData.guardianNid || ''}
                  onChange={e => handleInputChange('guardianNid', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">অভিভাবকের ইমেইল (ঐচ্ছিক)</label>
                <input 
                  type="email" 
                  placeholder="email@example.com"
                  value={formData.guardianEmail || ''}
                  onChange={e => handleInputChange('guardianEmail', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: ঠিকানার বিবরণ (Address Information) */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('address')}
            className="flex w-full items-center justify-between bg-slate-100/70 px-4 py-3 text-left font-bold text-slate-800 text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[10px] font-black text-white">৫</span>
              <span>ঠিকানার বিবরণ (Present & Permanent Address)</span>
            </div>
            {openSections.address ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>

          {openSections.address && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">বর্তমান ঠিকানা (Present Address)</label>
                <textarea 
                  rows={2}
                  placeholder="গ্রাম/মহল্লা, বাসা/রোড, ডাকঘর, উপজেলা, জেলা"
                  value={formData.presentAddress || ''}
                  onChange={e => handleInputChange('presentAddress', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-600">স্থায়ী ঠিকানা (Permanent Address)</label>
                  <button 
                    type="button" 
                    onClick={handleCopyAddress}
                    className="text-[10px] text-blue-700 hover:underline font-bold"
                  >
                    বর্তমান ঠিকানার অনুরূপ করুন
                  </button>
                </div>
                <textarea 
                  rows={2}
                  placeholder="গ্রাম/মহল্লা, ডাকঘর, উপজেলা, জেলা"
                  value={formData.permanentAddress || ''}
                  onChange={e => handleInputChange('permanentAddress', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: পূর্ববর্তী প্রতিষ্ঠানের তথ্য (Prior School Information) */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('priorSchool')}
            className="flex w-full items-center justify-between bg-slate-100/70 px-4 py-3 text-left font-bold text-slate-800 text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[10px] font-black text-white">৬</span>
              <span>পূর্ববর্তী প্রতিষ্ঠানের তথ্য (Previous School Details - ঐচ্ছিক)</span>
            </div>
            {openSections.priorSchool ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>

          {openSections.priorSchool && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">পূর্ববর্তী স্কুলের নাম</label>
                <input 
                  type="text" 
                  placeholder="উদা: মিরপুর আইডিয়াল স্কুল"
                  value={formData.previousSchool || ''}
                  onChange={e => handleInputChange('previousSchool', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">পূর্ববর্তী শ্রেণী ও রোল</label>
                <input 
                  type="text" 
                  placeholder="যেমন: ৪র্থ শ্রেণী, রোল: ০২"
                  value={formData.previousClassRoll || ''}
                  onChange={e => handleInputChange('previousClassRoll', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">টিসি / ছাড়পত্র নম্বর ও তারিখ</label>
                <input 
                  type="text" 
                  placeholder="যেমন: TC-2025-982"
                  value={formData.tcNumberDate || ''}
                  onChange={e => handleInputChange('tcNumberDate', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 7: তথ্যসূত্র ও এটাচমেন্ট (Reference & Attachments) */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('attachment')}
            className="flex w-full items-center justify-between bg-slate-100/70 px-4 py-3 text-left font-bold text-slate-800 text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[10px] font-black text-white">৭</span>
              <span>তথ্যসূত্র ও স্ক্যান ফরম ইমেজ লিংক এটাচমেন্ট (Reference Form Link & Notes)</span>
            </div>
            {openSections.attachment ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>

          {openSections.attachment && (
            <div className="p-4 space-y-3 text-xs bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-indigo-900">
                      <LinkIcon className="h-3.5 w-3.5 text-indigo-600" />
                      তথ্যসূত্র ফরমের ইমেজ লিংক (Source Form Image URL)
                    </span>
                    {formData.formImageRefUrl && (
                      <button
                        type="button"
                        onClick={() => setShowImagePreviewModal(formData.formImageRefUrl!)}
                        className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Eye className="h-3 w-3" /> ইমেজ প্রিভিউ
                      </button>
                    )}
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://i.postimg.cc/... অথবা ড্রাইভ লিংক"
                    value={formData.formImageRefUrl || ''}
                    onChange={e => handleInputChange('formImageRefUrl', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    ভবিষ্যতে তথ্য ভেরিফাই করার জন্য ফরমের ছবি বা স্ক্যান কপির ওয়েব লিংক এখানে পেস্ট করে রাখুন।
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ডেটা এন্ট্রি পর্যায় (Status)</label>
                  <select 
                    value={formData.entryStatus || 'Draft'}
                    onChange={e => handleInputChange('entryStatus', e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                  >
                    <option value="Draft">খসড়া (Draft - সামান্য তথ্য প্রাপ্ত)</option>
                    <option value="Partial">আংশিক প্রাপ্ত (Partial - আরও তথ্য প্রয়োজন)</option>
                    <option value="Complete">সম্পূর্ণ তথ্য প্রাপ্ত (Complete Entry)</option>
                    <option value="Verified">যাচাইকৃত ও চূড়ান্ত (Verified & Approved)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  অতিরিক্ত মন্তব্য / নোট (ভবিষ্যতের তথ্যের বিবরণ বা রিমাইন্ডার)
                </label>
                <textarea 
                  rows={2}
                  placeholder="যেমন: জন্ম সনদ এখনও পাওয়া যায়নি, অভিভাবক আগামী রবিবার জমা দেবেন..."
                  value={formData.entryNotes || ''}
                  onChange={e => handleInputChange('entryNotes', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-blue-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Bottom Action Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>কোন তথ্যে আটকে থাকবে না — যখন যা পাওয়া যাবে সংরক্ষণ করুন, পরে ইচ্ছামতো আপডেট করুন।</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetForm}
              className="flex-1 sm:flex-none rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 text-xs transition-all cursor-pointer"
            >
              রিসেট / খালি করুন
            </button>
            <button
              type="button"
              onClick={handleSaveStudent}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-black px-6 py-2.5 text-xs transition-all shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4 text-amber-400" />
              <span>{editingStudentId ? 'তথ্য হালনাগাদ করুন (Update)' : 'ডাটাবেজে যুক্ত করুন (Save)'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2.5 CLASS-WISE ENTRY BREAKDOWN & DEMO DATA MANAGEMENT */}
      <div className="space-y-4">
        
        {/* A. Demo Data Notification & Cleaning Control */}
        <div className={`rounded-2xl border p-5 shadow-sm transition-all ${
          demoStudentsCount > 0 
            ? 'border-amber-300 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90' 
            : 'border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-slate-50'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center shadow-xs text-white ${
                demoStudentsCount > 0 ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                {demoStudentsCount > 0 ? <AlertCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm md:text-base font-black text-slate-900">
                    {demoStudentsCount > 0 
                      ? `সিস্টেমে ${demoStudentsCount} জন প্রাথমিক ডেমো শিক্ষার্থী রেকর্ড বিদ্যমান আছে` 
                      : `সমস্ত ডেমো ডাটা সফলভাবে মুছে ফেলা হয়েছে (১০০% ক্লিন ডাটাবেজ)`}
                  </h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                    demoStudentsCount > 0 
                      ? 'bg-amber-100 text-amber-900 border-amber-300' 
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {demoStudentsCount > 0 ? `ডেমো ডাটা: ${demoStudentsCount} জন` : 'জিরো ডেমো ডাটা'}
                  </span>
                  <span className="rounded-full bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black">
                    মূল এন্ট্রি: {realStudentsCount} জন
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {demoStudentsCount > 0 
                    ? `প্রাথমিক ডেমো শিক্ষার্থীরা হলো: আফিফা রহমান (৫ম), তানভীর আহমেদ (৫ম), রাইসা ইয়াসমিন (৪র্থ) ও তাহসিন ইসলাম (৩য়)। আপনার আসল কাজের হিসাব নিখুঁত ও পরিপূরক রাখতে নিচের বোতামে ক্লিক করে এক ক্লিকেই সব ডেমো ডাটা মুছে ফেলতে পারেন।`
                    : `বর্তমানে সিস্টেমে কোনো কৃত্রিম বা ডেমো শিক্ষার্থী নেই। আপনি যে শিক্ষার্থী এন্ট্রি করবেন শুধুমাত্র সেটিই থাকবে। এছাড়া আপনার ওয়েবসাইটে পূর্বে সেভ করা ১১ জন কৃতি শিক্ষার্থীকে চাইলে এক ক্লিকে মূল শিক্ষার্থী তালিকায় ইম্পোর্ট করে নিতে পারেন।`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
              {demoStudentsCount > 0 ? (
                <button
                  onClick={handlePurgeAllDemoData}
                  className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white px-5 py-2.5 text-xs font-black shadow-md cursor-pointer transition-all w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>সব ডেমো ডাটা ডিলিট করুন ({demoStudentsCount} জন)</span>
                </button>
              ) : (
                <>
                  {meritStudents && meritStudents.length > 0 && (
                    <button
                      onClick={handleImportMeritStudents}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-black shadow-xs cursor-pointer transition-all w-full sm:w-auto"
                      title="কৃতি শিক্ষার্থীর নাম ও ছবি মূল শিক্ষার্থী ডিরেক্টরিতে ইম্পোর্ট করুন"
                    >
                      <Award className="h-4 w-4 text-amber-300" />
                      <span>কৃতি শিক্ষার্থী তালিকা থেকে ইম্পোর্ট ({meritStudents.length} জন)</span>
                    </button>
                  )}
                  <button
                    onClick={handleRestoreDemoData}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 px-3 py-2.5 text-[11px] font-bold cursor-pointer transition-all"
                    title="প্রয়োজনে ডেমো ডাটা রিস্টোর করুন"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>ডেমো রিস্টোর</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* B. Class-Wise Student Breakdown Matrix & Filter Cards */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-900">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="font-black text-slate-800 text-base">
                  শ্রেণি ভিত্তিক শিক্ষার্থী এন্ট্রি তথ্য ও পরিসংখ্যান
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                প্রতিটি শ্রেণীর কার্ডে ক্লিক করে সরাসরি সেই শ্রেণীর শিক্ষার্থীদের তালিকা ফিল্টার করে দেখতে পারেন:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterClass('All')}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                  filterClass === 'All' 
                    ? 'bg-blue-900 text-white shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                সকল শ্রেণী ({students.length} জন)
              </button>
            </div>
          </div>

          {/* 13 Class Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {classBreakdown.map((item) => {
              const isSelected = filterClass === item.className || filterClass === normalizeClassKey(item.className);
              const hasData = item.total > 0;

              return (
                <div
                  key={item.className}
                  onClick={() => setFilterClass(item.className)}
                  className={`relative rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm' 
                      : hasData 
                        ? 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300' 
                        : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="text-[11px] font-black text-slate-800 block truncate" title={item.className}>
                      {item.className}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={`text-xl font-black ${hasData ? 'text-blue-950' : 'text-slate-300'}`}>
                        {item.total}
                      </span>
                      <span className="text-[10px] text-slate-500">জন</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1 text-[9px]">
                    {hasData ? (
                      <>
                        <span className="rounded bg-emerald-100 text-emerald-800 px-1 py-0.5 font-bold">
                          মূল: {item.realCount}
                        </span>
                        {item.demoCount > 0 && (
                          <span className="rounded bg-rose-100 text-rose-800 px-1 py-0.5 font-bold">
                            ডেমো: {item.demoCount}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[9.5px] text-slate-400 italic">খালি (০)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Summary Pill Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
              <span>মোট শ্রেণী: <strong className="text-slate-900">{ALL_CLASSES.length}টি</strong></span>
              <span>•</span>
              <span>এন্ট্রি সম্পন্ন শ্রেণী: <strong className="text-emerald-700">{classBreakdown.filter(c => c.total > 0).length}টি</strong></span>
              <span>•</span>
              <span>সর্বোচ্চ এন্ট্রি: <strong className="text-blue-900">
                {classBreakdown.slice().sort((a,b) => b.total - a.total)[0]?.className} ({classBreakdown.slice().sort((a,b) => b.total - a.total)[0]?.total} জন)
              </strong></span>
            </div>

            {filterClass !== 'All' && (
              <button
                onClick={() => setFilterClass('All')}
                className="text-blue-900 hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>ফিল্টার মুছুন (সব দেখুন)</span>
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 3. REGISTERED STUDENTS DIRECTORY (তালিকা ও আপডেট কন্ট্রোল) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        
        {/* Directory Search & Filter Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b pb-4 mb-4">
          <div>
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <span>নিবন্ধিত শিক্ষার্থীদের ডিরেক্টরি ও তথ্যভাণ্ডার</span>
              <span className="rounded-full bg-blue-100 text-blue-900 px-2 py-0.5 text-xs font-bold font-mono">
                {filteredStudents.length} জন
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              যেকোনো শিক্ষার্থীর পাশে "✏️ তথ্য হালনাগাদ" বোতামে ক্লিক করে নতুন পাওয়া তথ্য যুক্ত করে আপডেট করে নিন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 md:w-56">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3" />
              <input 
                type="text"
                placeholder="নাম, রোল, ফোন বা BRC..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-blue-900"
              />
            </div>

            {/* Class Filter */}
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:outline-blue-900 font-semibold"
            >
              <option value="All">সকল শ্রেণী</option>
              {['প্লে (Play)', 'নার্সারী (Nursery)', 'কেজি (KG)', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:outline-blue-900 font-semibold"
            >
              <option value="All">সকল পর্যায়</option>
              <option value="Complete">সম্পূর্ণ (Complete)</option>
              <option value="Partial">আংশিক (Partial)</option>
              <option value="Draft">খসড়া (Draft)</option>
            </select>
          </div>
        </div>

        {/* Students Table / Grid */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <User className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি!</p>
            <p className="text-[10px] text-slate-400 mt-1">অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা নতুন শিক্ষার্থী এন্ট্রি করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600">
                  <th className="p-3">শিক্ষার্থী ও ছবি</th>
                  <th className="p-3">শ্রেণী ও রোল</th>
                  <th className="p-3">পিতা/মাতা ও ফোন</th>
                  <th className="p-3">তথ্যসূত্র ইমেজ লিংক</th>
                  <th className="p-3">তথ্য প্রাপ্তির হার</th>
                  <th className="p-3 text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const completeness = calculateCompleteness(student);
                  const isComplete = completeness >= 80;

                  return (
                    <tr key={student.id} className="hover:bg-blue-50/20 transition-colors">
                      
                      {/* Name & Photo */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-600">
                            {student.photoUrl ? (
                              <img src={student.photoUrl} alt="Photo" className="h-full w-full object-cover" />
                            ) : (
                              <span>{student.banglaName ? student.banglaName[0] : '🎓'}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-850 text-xs">{student.banglaName || student.name}</span>
                              {isDemoStudent(student) ? (
                                <span className="inline-flex items-center gap-0.5 rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[9px] font-black text-rose-700">
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  <span>ডেমো ডাটা</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-black text-emerald-800">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                  <span>মূল শিক্ষার্থী</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block font-sans uppercase">{student.name || '---'}</span>
                            {student.birthRegNo && (
                              <span className="text-[9.5px] text-slate-400 block font-mono">BRC: {student.birthRegNo}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Class & Roll */}
                      <td className="p-3">
                        <span className="font-bold text-slate-700 block">{student.className}</span>
                        <span className="text-[10px] text-slate-500 block">রোল: {student.roll} {student.section ? `• শাখা: ${student.section}` : ''}</span>
                        <span className="text-[9.5px] text-slate-400 block font-mono">সেশন: {student.sessionYear || '2026'}</span>
                      </td>

                      {/* Parents & Phone */}
                      <td className="p-3">
                        <span className="font-semibold text-slate-700 block text-[11px]">
                          {student.fatherNameBn || student.guardianName}
                        </span>
                        <span className="text-[10px] text-blue-900 font-bold block flex items-center gap-1 font-mono">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {student.guardianPhone || student.fatherPhone || 'ফোন নম্বর নেই'}
                        </span>
                      </td>

                      {/* Attached Form Image Link */}
                      <td className="p-3">
                        {student.formImageRefUrl ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setShowImagePreviewModal(student.formImageRefUrl!)}
                              className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100"
                              title="স্ক্যান কপি দেখুন"
                            >
                              <Eye className="h-3 w-3" />
                              <span>স্ক্যান ফরম</span>
                            </button>
                            <a
                              href={student.formImageRefUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-indigo-600 p-1"
                              title="লিংক খুলুন"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">সংযুক্ত নেই</span>
                        )}
                      </td>

                      {/* Progress Completeness */}
                      <td className="p-3">
                        <div className="w-24">
                          <div className="flex justify-between text-[9.5px] font-bold mb-1">
                            <span className={isComplete ? 'text-emerald-700' : 'text-amber-700'}>
                              {completeness}%
                            </span>
                            <span className="text-slate-400 text-[9px]">
                              {isComplete ? 'সম্পূর্ণ' : 'আংশিক'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                isComplete ? 'bg-emerald-500' : completeness >= 40 ? 'bg-amber-500' : 'bg-rose-400'
                              }`} 
                              style={{ width: `${completeness}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Edit / Update Button */}
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1.5 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                            title="তথ্য হালনাগাদ ও সম্পাদন"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-amber-700" />
                            <span>তথ্য হালনাগাদ</span>
                          </button>

                          {/* Print Form Sheet */}
                          <button
                            onClick={() => setShowPrintModalStudent(student)}
                            className="rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 p-1.5 transition-all cursor-pointer"
                            title="পূর্ণাঙ্গ তথ্য ছক ভিউ ও প্রিন্ট"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>

                          {/* Digital ID Card */}
                          <button
                            onClick={() => {
                              if (onOpenIdCard) {
                                onOpenIdCard(student);
                              } else {
                                setShowIdCardModalStudent(student);
                              }
                            }}
                            className="rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 p-1.5 transition-all cursor-pointer"
                            title="ডিজিটাল আইডি কার্ড"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি নিশ্চিত যে "${student.banglaName || student.name}" এর এন্ট্রি মুছে ফেলতে চান?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-400 p-1.5 transition-all cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      </div>

      {/* MODAL 1: IMAGE PREVIEW MODAL */}
      {showImagePreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b bg-slate-50">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-indigo-600" />
                <h4 className="font-bold text-xs text-slate-800">তথ্যসূত্র স্ক্যান ফরম প্রিভিউ</h4>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={showImagePreviewModal} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> নতুন ট্যাবে খুলুন
                </a>
                <button 
                  onClick={() => setShowImagePreviewModal(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto bg-slate-100">
              <img 
                src={showImagePreviewModal} 
                alt="Document preview" 
                className="max-h-[70vh] max-w-full object-contain rounded shadow"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  alert('ইমেজটি লোড করা সম্ভব হয়নি। লিংকটি সঠিক আছে কিনা যাচাই করুন।');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE OFFICIAL BANGLADESHI STUDENT INFORMATION SHEET (তথ্য ছক প্রিন্ট মোডাল) */}
      {showPrintModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Top Action Bar */}
            <div className="flex items-center justify-between border-b pb-4 mb-6 print:hidden">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <FileText className="h-4 w-4 text-amber-500" />
                <span>প্রাতিষ্ঠানিক শিক্ষার্থী ভর্তি ও পূর্ণাঙ্গ তথ্য ছক (Official Information Sheet)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2 text-xs cursor-pointer shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>প্রিন্ট করুন / PDF সেভ করুন</span>
                </button>
                <button
                  onClick={() => setShowPrintModalStudent(null)}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 text-slate-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Printable Sheet Layout */}
            <div id="printable-student-info-sheet" className="font-sans text-slate-900 text-xs">
              
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
                <h1 className="text-2xl font-black tracking-tight">{schoolName || 'ডিলিকন মডেল একাডেমী'}</h1>
                <p className="text-xs text-slate-700 font-semibold">{schoolSlogan}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">মিরপুর, ঢাকা • ইমেইল: info@delicon.edu.bd • ফোন: +৮৮০ ১৭১১-০০০০০০</p>
                <div className="mt-3 inline-block bg-slate-900 text-white font-black text-xs px-4 py-1 rounded">
                  শিক্ষার্থী ভর্তি ও ব্যক্তিগত তথ্য ছক - {showPrintModalStudent.sessionYear || '২০২৬'}
                </div>
              </div>

              {/* Photo Box & Registration Meta */}
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p><span className="font-bold">আইডি নং:</span> DEL-{showPrintModalStudent.id.toUpperCase()}</p>
                  <p><span className="font-bold">শ্রেণী:</span> {showPrintModalStudent.className} | <span className="font-bold">শাখা:</span> {showPrintModalStudent.section || 'A'} | <span className="font-bold">রোল:</span> {showPrintModalStudent.roll}</p>
                  <p><span className="font-bold">ভর্তির তারিখ:</span> {showPrintModalStudent.admissionDate || '---'}</p>
                  <p><span className="font-bold">ভার্সন:</span> {showPrintModalStudent.version || 'বাংলা'} | <span className="font-bold">শিফট:</span> {showPrintModalStudent.shift || 'প্রভাতী'}</p>
                </div>
                <div className="h-28 w-24 border-2 border-slate-400 rounded flex flex-col items-center justify-center text-center p-1 bg-slate-50 text-[10px] text-slate-400">
                  {showPrintModalStudent.photoUrl ? (
                    <img src={showPrintModalStudent.photoUrl} alt="Photo" className="h-full w-full object-cover" />
                  ) : (
                    <span>শিক্ষার্থীর পাসপোর্ট ছবি</span>
                  )}
                </div>
              </div>

              {/* Information Grid Table */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <td colSpan={2} className="p-2 text-blue-900">১। শিক্ষার্থীর ব্যক্তিগত বিবরণ</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold w-1/3 bg-slate-50">শিক্ষার্থীর নাম (বাংলা):</td>
                      <td className="p-2 font-bold">{showPrintModalStudent.banglaName || '---'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">শিক্ষার্থীর নাম (ইংরেজি):</td>
                      <td className="p-2 uppercase font-semibold">{showPrintModalStudent.name || '---'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">জন্ম নিবন্ধন সনদ নম্বর (BRC):</td>
                      <td className="p-2 font-mono">{showPrintModalStudent.birthRegNo || '---'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">জন্ম তারিখ ও লিঙ্গ:</td>
                      <td className="p-2">{showPrintModalStudent.dob || '---'} | লিঙ্গ: {showPrintModalStudent.gender === 'Female' ? 'ছাত্রী' : 'ছাত্র'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">রক্তের গ্রুপ ও ধর্ম:</td>
                      <td className="p-2">{showPrintModalStudent.bloodGroup || 'অজানা'} | ধর্ম: {showPrintModalStudent.religion || 'ইসলাম'} | জাতীয়তা: {showPrintModalStudent.nationality || 'বাংলাদেশী'}</td>
                    </tr>

                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <td colSpan={2} className="p-2 text-blue-900">২। পিতা ও মাতার বিবরণ</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">পিতার নাম (বাংলা/ইংরেজি):</td>
                      <td className="p-2">{showPrintModalStudent.fatherNameBn || '---'} {showPrintModalStudent.fatherNameEn ? `(${showPrintModalStudent.fatherNameEn})` : ''}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">পিতার ফোন ও এনআইডি:</td>
                      <td className="p-2">ফোন: {showPrintModalStudent.fatherPhone || '---'} | NID: {showPrintModalStudent.fatherNid || '---'} | পেশা: {showPrintModalStudent.fatherOccupation || '---'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">মাতার নাম (বাংলা/ইংরেজি):</td>
                      <td className="p-2">{showPrintModalStudent.motherNameBn || '---'} {showPrintModalStudent.motherNameEn ? `(${showPrintModalStudent.motherNameEn})` : ''}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">মাতার ফোন ও পেশা:</td>
                      <td className="p-2">ফোন: {showPrintModalStudent.motherPhone || '---'} | পেশা: {showPrintModalStudent.motherOccupation || '---'}</td>
                    </tr>

                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <td colSpan={2} className="p-2 text-blue-900">৩। অভিভাবক ও যোগাযোগের ঠিকানা</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">অভিভাবকের নাম ও সম্পর্ক:</td>
                      <td className="p-2 font-bold">{showPrintModalStudent.guardianName || '---'} ({showPrintModalStudent.guardianRelation || 'পিতা'}) | ফোন: {showPrintModalStudent.guardianPhone || '---'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">বর্তমান ঠিকানা:</td>
                      <td className="p-2">{showPrintModalStudent.presentAddress || '---'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">স্থায়ী ঠিকানা:</td>
                      <td className="p-2">{showPrintModalStudent.permanentAddress || '---'}</td>
                    </tr>

                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <td colSpan={2} className="p-2 text-blue-900">৪। তথ্যসূত্র ও এন্ট্রি স্ট্যাটাস</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-slate-50">তথ্যসূত্র ও নোট:</td>
                      <td className="p-2">
                        স্ট্যাটাস: <span className="font-bold">{showPrintModalStudent.entryStatus || 'খসড়া'}</span> | 
                        তথ্যসূত্র লিংক: {showPrintModalStudent.formImageRefUrl || 'সংযুক্ত নেই'}
                        {showPrintModalStudent.entryNotes && (
                          <p className="mt-1 text-[11px] text-slate-500 italic">নোট: {showPrintModalStudent.entryNotes}</p>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="mt-16 flex justify-between items-center text-center text-xs pt-8">
                <div>
                  <div className="w-40 border-t border-slate-700"></div>
                  <p className="font-bold mt-1">অভিভাবকের স্বাক্ষর</p>
                </div>
                <div>
                  <div className="w-40 border-t border-slate-700"></div>
                  <p className="font-bold mt-1">ডেটা এন্ট্রি অপারেটর</p>
                </div>
                <div>
                  <div className="w-40 border-t border-slate-700"></div>
                  <p className="font-bold mt-1">অধ্যক্ষ / প্রধান শিক্ষক</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DIGITAL ID CARD PREVIEW */}
      {showIdCardModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <QrCode className="h-4 w-4 text-amber-400" />
                <span>ডিজিটাল আইডি কার্ড জেনারেটর প্রিভিউ</span>
              </h4>
              <button 
                onClick={() => setShowIdCardModalStudent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="bg-slate-950 p-4 rounded-xl flex justify-center">
              <DigitalStudentIdCard student={showIdCardModalStudent} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
