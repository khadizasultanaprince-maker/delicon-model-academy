/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useSchool } from '../context/SchoolContext';
import { UserRole } from '../types';
import { 
  Building, Settings, FolderClosed, Users, TrendingUp, Bus, PackageOpen, 
  Check, X, Plus, CreditCard, Clock, Bell, Trash2, ShieldCheck, Database, KeyRound, Link, Copy,
  Printer, QrCode, FileText, CheckCircle2, Layers, Bookmark, Star, Award, HelpCircle, Download, Upload, Image, RefreshCw, Video,
  Camera, CameraOff, Calendar, Book
} from 'lucide-react';
import { AttendanceSimulator } from './AttendanceSimulator';
import { AcademicEventCalendar } from './AcademicEventCalendar';
import { DigitalLibrary } from './DigitalLibrary';

interface SystemControlPanelProps {
  role: 'Admin' | 'Developer';
  onLogout: () => void;
}

const compressImage = (file: File, maxWidth = 300, maxHeight = 300, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
};

export const SystemControlPanel: React.FC<SystemControlPanelProps> = ({ role, onLogout }) => {
  const { 
    students, 
    employees, 
    attendanceLogs, 
    leads, 
    notices, 
    stationery, 
    routes, 
    devProjects,
    portalCredentials,
    sections,
    examMarks,
    requisitions,
    schoolName,
    schoolSlogan,
    schoolLogoType,
    schoolLogoVal,
    updateSchoolBranding,
    campusPhotos,
    updateCampusPhotos,
    meritStudents,
    updateMeritStudents,
    updateLeadStatus,
    deleteNotice,
    addNotice,
    paySalary,
    updateStationeryStock,
    addDevProject,
    updateDevProjectProgress,
    updateRouteStatus,
    updatePortalCredential,
    addStudent,
    addEmployee,
    updateSectionSetting,
    resetSections,
    addExamMark,
    approveRequisitionByAssistant,
    approveRequisitionByPrincipal,
    rejectRequisition,
    receiveRequisitionPayment,
    dtubePlaylist,
    culturalPlaylist,
    updateDtubePlaylist,
    updateCulturalPlaylist
  } = useSchool();

  // Active module tab within ERP
  const [activeTab, setActiveTab] = useState<'admissions' | 'finance' | 'staff' | 'inventory' | 'transport' | 'planning' | 'notices' | 'settings' | 'sections' | 'idcards' | 'exams' | 'docs' | 'requisitions' | 'db' | 'scanner' | 'dtube' | 'calendar' | 'library'>('admissions');

  const [copiedText, setCopiedText] = useState<'traffic' | 'developer' | null>(null);

  // New manual student state
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualStudentClass, setManualStudentClass] = useState('Class 1');
  const [manualStudentRoll, setManualStudentRoll] = useState('');
  const [manualStudentPhone, setManualStudentPhone] = useState('');
  const [studentFormSuccess, setStudentFormSuccess] = useState(false);

  // New manual employee state
  const [manualEmployeeName, setManualEmployeeName] = useState('');
  const [manualEmployeeBanglaName, setManualEmployeeBanglaName] = useState('');
  const [manualEmployeePost, setManualEmployeePost] = useState<'Teacher' | 'Coordinator' | 'Staff' | 'Driver' | 'Management'>('Teacher');
  const [manualEmployeeSalary, setManualEmployeeSalary] = useState('28000');
  const [manualEmployeePhone, setManualEmployeePhone] = useState('');
  const [manualEmployeeSubject, setManualEmployeeSubject] = useState('');
  const [manualEmployeeQual, setManualEmployeeQual] = useState('');
  const [employeeFormSuccess, setEmployeeFormSuccess] = useState(false);

  // ID Cards control states
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [recipientType, setRecipientType] = useState<'student' | 'employee'>('student');
  const [idCardTheme, setIdCardTheme] = useState<'navy' | 'crimson' | 'emerald' | 'charcoal' | 'violet'>('navy');
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('delicon_custom_photos');
    return saved ? JSON.parse(saved) : {};
  });
  const [customParentPhotos, setCustomParentPhotos] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('delicon_custom_parent_photos');
    return saved ? JSON.parse(saved) : {};
  });
  const [bloodGroups, setBloodGroups] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('delicon_blood_groups');
    return saved ? JSON.parse(saved) : {};
  });
  const [emergencyPhone, setEmergencyPhone] = useState('01722883344');
  const [cardValidity, setCardValidity] = useState('31-12-2027');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  React.useEffect(() => {
    if (!selectedRecipientId) {
      setQrCodeDataUrl('');
      return;
    }
    const tokenVal = `TOKEN=MIR-${selectedRecipientId.toUpperCase()}`;
    QRCode.toDataURL(tokenVal, { 
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });
  }, [selectedRecipientId]);

  // Camera capture states and handlers
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [idCardPhotoTab, setIdCardPhotoTab] = useState<'upload' | 'camera' | 'url'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  React.useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isCameraActive]);

  React.useEffect(() => {
    // If recipient ID or activeTab changes, shut down the camera stream immediately
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
    }
  }, [selectedRecipientId, activeTab]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacingMode },
        audio: false
      });
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera capture error:', err);
      setCameraError('ক্যামেরা চালু করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ব্রাউজার ক্যামেরা অনুমতি দিন ও পুনরায় চালু চেষ্টা করুন।');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Strict crop and high-quality downsampling to fit optimal profile bounds
      const targetWidth = 150;
      const targetHeight = 180;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;
        
        const targetAspect = targetWidth / targetHeight;
        const videoAspect = vWidth / vHeight;
        
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = vWidth;
        let sourceHeight = vHeight;
        
        if (videoAspect > targetAspect) {
          sourceWidth = vHeight * targetAspect;
          sourceX = (vWidth - sourceWidth) / 2;
        } else {
          sourceHeight = vWidth / targetAspect;
          sourceY = (vHeight - sourceHeight) / 2;
        }
        
        ctx.drawImage(
          video,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidth, targetHeight
        );
        
        const base64String = canvas.toDataURL('image/jpeg', 0.85);
        if (base64String && selectedRecipientId) {
          const updated = { ...customPhotos, [selectedRecipientId]: base64String };
          setCustomPhotos(updated);
          try {
            localStorage.setItem('delicon_custom_photos', JSON.stringify(updated));
          } catch (ex) {
            console.error("Storage limit exceeded inside capturePhoto", ex);
          }
          // Tear down tracks
          if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
          }
          setIsCameraActive(false);
        }
      }
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleFacingMode = async () => {
    const nextMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextMode);
    if (isCameraActive) {
      try {
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: nextMode },
          audio: false
        });
        setCameraStream(stream);
        setIsCameraActive(true);
      } catch (err) {
        console.error('Failed to toggle camera facing mode:', err);
      }
    }
  };

  // Exam Mark Entry control states
  const [selectedStudentForExam, setSelectedStudentForExam] = useState('');
  const [examType, setExamType] = useState<'Terminal' | 'Midterm'>('Terminal');
  const [examName, setExamName] = useState('First Term 2026');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [writtenMarksInput, setWrittenMarksInput] = useState('');
  const [mcqMarksInput, setMcqMarksInput] = useState('');
  const [examFormError, setExamFormError] = useState('');
  const [examSuccess, setExamSuccess] = useState(false);

  // Certificates & Transcripts center
  const [selectedDocStudent, setSelectedDocStudent] = useState('');
  const [docTemplateType, setDocTemplateType] = useState<'admit' | 'testimonial' | 'certificate' | 'leaveslip' | 'transcript'>('transcript');

  // Requisitions inputs
  const [reqComments, setReqComments] = useState('');
  const [reqAmtInput, setReqAmtInput] = useState('');
  const [reqPayId, setReqPayId] = useState('');

  const [activePayslipEmpId, setActivePayslipEmpId] = useState<string | null>(null);

  // Edit branding input states
  const [editSchoolName, setEditSchoolName] = useState(schoolName);
  const [editSchoolSlogan, setEditSchoolSlogan] = useState(schoolSlogan);
  const [editLogoType, setEditLogoType] = useState<'crest' | 'text' | 'image'>(schoolLogoType);
  const [editLogoVal, setEditLogoVal] = useState(schoolLogoVal);
  const [brandingSuccess, setBrandingSuccess] = useState(false);

  // Edit campus photos input state
  const [editPhotos, setEditPhotos] = useState(() => campusPhotos || []);
  const [photosSuccess, setPhotosSuccess] = useState(false);

  // Edit merit students input state
  const [editMeritStudents, setEditMeritStudents] = useState(() => meritStudents || []);
  const [meritStudentsSuccess, setMeritStudentsSuccess] = useState(false);
  const [photoSourceTab, setPhotoSourceTab] = useState<Record<number, 'url' | 'upload'>>({});

  // DTube hub state parameters inside SystemControlPanel

  // For unified video uploading - support 3 players with dynamic dropdown selection
  const [videoTargetPlayer, setVideoTargetPlayer] = useState<'dtube_full' | 'dtube_reel' | 'cultural'>('dtube_full');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAuthor, setVideoAuthor] = useState('');
  const [videoClassLabel, setVideoClassLabel] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoViewsInput, setVideoViewsInput] = useState('');
  
  const [videoUploadError, setVideoUploadError] = useState('');
  const [videoUploadSuccess, setVideoUploadSuccess] = useState(false);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleUnifiedVideoUpload = () => {
    if (!videoTitle.trim() || !videoUrl.trim()) {
      setVideoUploadError('ভিডিওর টাইটেল ও সঠিক ইউটিউব ভিডিও লিংক প্রদান করা আবশ্যক।');
      return;
    }

    const extractedId = getYouTubeId(videoUrl);
    if (!extractedId || extractedId.length !== 11) {
      setVideoUploadError('আপনার দেয়া ইনপুট থেকে কোনো সঠিক ইউটিউব আইডি পাওয়া যায়নি। অনুগ্রহ করে সঠিক লিংক প্রদান করুন (যেমন: https://www.youtube.com/watch?v=dQw4w9WgXcQ)।');
      return;
    }

    if (videoTargetPlayer === 'dtube_full' || videoTargetPlayer === 'dtube_reel') {
      const newDtubeVideo = {
        id: 'clock_dt_' + Date.now(),
        title: videoTitle.trim(),
        category: videoTargetPlayer === 'dtube_full' ? 'full' : 'reel',
        url: videoUrl.trim(),
        views: Math.floor(Math.random() * 200) + 15,
        author: videoAuthor.trim() || 'ডি লিকন মিডিয়া সেল',
        duration: videoDuration.trim() || (videoTargetPlayer === 'dtube_reel' ? '০:৫৯ মিনিট' : '১০:০০ মিনিট'),
        classLabel: videoClassLabel.trim() || (videoTargetPlayer === 'dtube_reel' ? 'Reel / Short' : 'Class Video')
      };

      updateDtubePlaylist([newDtubeVideo, ...dtubePlaylist]);
    } else {
      const newCulturalVideo = {
        id: 'clock_cp_' + Date.now(),
        title: videoTitle.trim() + ' 🌟',
        url: videoUrl.trim(),
        views: parseInt(videoViewsInput) || Math.floor(Math.random() * 300) + 50
      };

      updateCulturalPlaylist([newCulturalVideo, ...culturalPlaylist]);
    }

    // Success reset
    setVideoTitle('');
    setVideoUrl('');
    setVideoAuthor('');
    setVideoClassLabel('');
    setVideoDuration('');
    setVideoViewsInput('');
    setVideoUploadError('');
    setVideoUploadSuccess(true);
    setTimeout(() => setVideoUploadSuccess(false), 3000);
  };

  const handleDeleteDtubeVideo = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ভিডিওটি উচ্ছেদ করতে চান?')) {
      updateDtubePlaylist(dtubePlaylist.filter(v => v.id !== id));
    }
  };

  const handleDeleteCulturalVideo = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই কালচারাল ইভেন্ট ভিডিওটি মুছে ফেলতে চান?')) {
      updateCulturalPlaylist(culturalPlaylist.filter(v => v.id !== id));
    }
  };
  const [slidePhotoSourceTab, setSlidePhotoSourceTab] = useState<Record<number, 'url' | 'upload'>>({});
  const [sectionsSubTab, setSectionsSubTab] = useState<'visibility' | 'branding' | 'slider' | 'merit'>('merit');

  useEffect(() => {
    if (campusPhotos) {
      setEditPhotos(campusPhotos);
    }
  }, [campusPhotos]);

  useEffect(() => {
    if (meritStudents) {
      setEditMeritStudents(meritStudents);
    }
  }, [meritStudents]);

  const handleCopy = (text: string, type: 'traffic' | 'developer') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const cardThemes = {
    navy: {
      name: 'ডিজিটাল নেভি ব্লু',
      banner: 'bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 border-amber-400',
      ring: 'border-amber-400 bg-blue-50 text-blue-950',
      subText: 'text-amber-400',
      accentText: 'text-blue-950 border-amber-400',
      badge: 'bg-blue-100/80 text-blue-950 border border-blue-200',
      primaryColor: '#1e3a8a',
      secondaryColor: '#f59e0b',
    },
    crimson: {
      name: 'রয়াল ক্রিমসন লাল',
      banner: 'bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 border-rose-350',
      ring: 'border-rose-400 bg-rose-50 text-rose-950',
      subText: 'text-rose-400',
      accentText: 'text-rose-900 border-rose-300',
      badge: 'bg-rose-100/80 text-rose-950 border border-rose-200',
      primaryColor: '#9f1239',
      secondaryColor: '#fb7185',
    },
    emerald: {
      name: 'অর্গানিক এমারেল্ড গ্রিন',
      banner: 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-yellow-450',
      ring: 'border-yellow-450 bg-emerald-50 text-emerald-950',
      subText: 'text-yellow-450',
      accentText: 'text-emerald-950 border-yellow-300',
      badge: 'bg-emerald-100/80 text-emerald-950 border border-emerald-200',
      primaryColor: '#065f46',
      secondaryColor: '#facc15',
    },
    charcoal: {
      name: 'ডার্ক স্লিক চারকোল',
      banner: 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-slate-950 border-cyan-400',
      ring: 'border-cyan-400 bg-slate-100 text-slate-850',
      subText: 'text-cyan-400',
      accentText: 'text-slate-850 border-cyan-300',
      badge: 'bg-slate-200 text-slate-950 border border-slate-300',
      primaryColor: '#27272a',
      secondaryColor: '#22d3ee',
    },
    violet: {
      name: 'কসমিক ভাইওলেট বেগুনি',
      banner: 'bg-gradient-to-r from-violet-950 via-violet-900 to-fuchsia-950 border-pink-400',
      ring: 'border-pink-400 bg-violet-50 text-violet-950',
      subText: 'text-pink-400',
      accentText: 'text-violet-950 border-pink-300',
      badge: 'bg-violet-100/80 text-violet-950 border border-violet-200',
      primaryColor: '#5b21b6',
      secondaryColor: '#f472b6',
    }
  };

  const downloadCardAsImage = async (side: 'front' | 'back', memberId: string) => {
    const student = recipientType === 'student' ? students.find(s => s.id === memberId) : null;
    const employee = recipientType === 'employee' ? employees.find(e => e.id === memberId) : null;
    const details = student || employee;
    if (!details) return;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill round border / card background canvas
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, 600, 900, 32);
    } else {
      ctx.rect(0, 0, 600, 900);
    }
    ctx.fill();

    const activeTheme = cardThemes[idCardTheme];

    if (side === 'front') {
      // 1. Draw top banner
      const grd = ctx.createLinearGradient(0, 0, 600, 0);
      grd.addColorStop(0, activeTheme.primaryColor);
      grd.addColorStop(1, '#0b0f19');
      ctx.fillStyle = grd;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, 600, 240, [32, 32, 0, 0]);
      } else {
        ctx.rect(0, 0, 600, 240);
      }
      ctx.fill();

      // Accent border line
      ctx.strokeStyle = activeTheme.secondaryColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 240);
      ctx.lineTo(600, 240);
      ctx.stroke();

      // School logo emoji symbol
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(300, 70, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏫', 300, 72);

      // Model Academy title texts
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('DELICON MODEL ACADEMY', 305, 140);

      ctx.font = 'bold uppercase 12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('MIRPUR AUTOMATION LAB', 300, 175);

      // 2. Profile photo box
      const photoY = 345;
      const photoR = 75;
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = activeTheme.secondaryColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(300, photoY, photoR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Load user profile images
      const photoUrl = customPhotos[memberId];
      if (photoUrl) {
        const img = new window.Image();
        img.src = photoUrl;
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(300, photoY, photoR - 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, 300 - photoR, photoY - photoR, photoR * 2, photoR * 2);
            ctx.restore();
            resolve();
          };
          img.onerror = () => resolve();
        });
      } else {
        // Fallback initials monogram
        ctx.fillStyle = activeTheme.primaryColor;
        ctx.font = 'bold 64px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(details.name[0].toUpperCase(), 300, photoY + 2);
      }

      // Member Name
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 28px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(details.name, 300, 470);

      // Class or Role badge
      ctx.fillStyle = student ? '#eff6ff' : '#fff1f2';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(140, 505, 320, 36, 18);
      } else {
        ctx.rect(140, 505, 320, 36);
      }
      ctx.fill();

      ctx.fillStyle = student ? '#1e40af' : '#be123c';
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        student ? `শিক্ষার্থী | শ্রেণী: ${student.className}` : `এমপ্লয়ী | পদবী: ${employee?.role}`,
        300,
        523
      );

      // Grid stats divider line
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 570);
      ctx.lineTo(520, 570);
      ctx.stroke();

      // Member Info labels
      const writeParam = (label: string, value: string, x: number, y: number, align: 'left' | 'right') => {
        ctx.textAlign = align;
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px "Inter", sans-serif';
        ctx.fillText(label.toUpperCase(), x, y);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.fillText(value, x, y + 24);
      };

      writeParam('School ID', student ? `STD-${student.id.replace('s_', '')}` : `EMP-${employee?.id.replace('e_', '')}`, 80, 610, 'left');
      writeParam('রোল / কোড', student ? student.roll : 'ACTIVE STAFF', 520, 610, 'right');

      writeParam('রক্তের গ্রুপ', bloodGroups[memberId] || 'মোনা সিলেক্টেড', 80, 680, 'left');
      writeParam('মোবাইল নম্বর', student ? student.guardianPhone : (employee?.phone || 'N/A'), 520, 680, 'right');

      // Footer brand segment & gate barcode simulation
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, 770, 600, 130, [0, 0, 32, 32]);
      } else {
        ctx.rect(0, 770, 600, 130);
      }
      ctx.fill();

      // Divider stroke
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 770);
      ctx.lineTo(600, 770);
      ctx.stroke();

      // Generate a dynamic and real scannable QR Code using qrcode library
      const qrDataUrl = await QRCode.toDataURL(`TOKEN=MIR-${details.id.toUpperCase()}`, { 
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      const qrImg = new window.Image();
      qrImg.src = qrDataUrl;
      await new Promise<void>((resolve) => {
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 45, 775, 120, 120);
          resolve();
        };
        qrImg.onerror = () => resolve();
      });

      // Gate token code label
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText('SECURITY GATE ACCESS CONTROL', 185, 825);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillText(`TOKEN=MIR-${details.id.toUpperCase()}`, 185, 855);

    } else {
      // 1. Draw back top block
      const grd = ctx.createLinearGradient(0, 0, 600, 0);
      grd.addColorStop(0, activeTheme.primaryColor);
      grd.addColorStop(1, '#0f172a');
      ctx.fillStyle = grd;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, 600, 110, [32, 32, 0, 0]);
      } else {
        ctx.rect(0, 0, 600, 110);
      }
      ctx.fill();

      // Gold underbar
      ctx.strokeStyle = activeTheme.secondaryColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 110);
      ctx.lineTo(600, 110);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DELICON MODEL ACADEMY TERMS & CONDITIONS', 300, 55);

      // Instructions title
      if (recipientType === 'student') {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillText('নির্দেশনাবলী ও নিয়মাবলী:', 60, 160);

        const instructions = [
          '১. আইডি কার্ড ঝুলিয়ে রাখা আবশ্যক।',
          '২. কার্ড হস্তান্তর সম্পূর্ণ দণ্ডনীয়।',
          '৩. হারিয়ে গেলে অবিলম্বে জানান।',
          '৪. গেটে পাঞ্চ বা স্ক্যান বাধ্যতামূলক।'
        ];

        ctx.font = 'bold 13px "Inter", sans-serif';
        ctx.fillStyle = '#475569';
        let currentY = 200;
        instructions.forEach(line => {
          ctx.fillText(line, 60, currentY);
          currentY += 32;
        });

        // Parents' Joint Photo Block (X=360, width=180, height=135)
        const frameX = 360;
        const frameY = 135;
        const frameW = 180;
        const frameH = 135;

        // Draw bounding box
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = activeTheme.secondaryColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(frameX, frameY, frameW, frameH, 12);
        } else {
          ctx.rect(frameX, frameY, frameW, frameH);
        }
        ctx.fill();
        ctx.stroke();

        const parentPhotoUrl = customParentPhotos[memberId];
        if (parentPhotoUrl) {
          const img = new window.Image();
          img.src = parentPhotoUrl;
          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              if (ctx.roundRect) {
                ctx.roundRect(frameX + 3, frameY + 3, frameW - 6, frameH - 6, 9);
              } else {
                ctx.rect(frameX + 3, frameY + 3, frameW - 6, frameH - 6);
              }
              ctx.clip();
              ctx.drawImage(img, frameX + 3, frameY + 3, frameW - 6, frameH - 6);
              ctx.restore();
              resolve();
            };
            img.onerror = () => resolve();
          });
        } else {
          ctx.font = 'bold 13px "Inter", sans-serif';
          ctx.fillStyle = '#475569';
          ctx.textAlign = 'center';
          ctx.fillText('বাবা ও মায়ের', frameX + frameW / 2, frameY + 50);
          ctx.fillText('জোড়া ছবি', frameX + frameW / 2, frameY + 72);
          ctx.font = '10px "Inter", sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('(Not Uploaded)', frameX + frameW / 2, frameY + 100);
        }

        // Parent Label
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('পিতা ও মাতার ছবি / Parents', frameX + frameW / 2, frameY + frameH + 20);

      } else {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillText('নির্দেশনাবলী ও নিয়মকানুন সমূহ:', 60, 175);

        const instructions = [
          '১. এই আইডি কার্ডটি একাডেমির অফিস কর্তৃক অনুমোদিত ও সংরক্ষিত।',
          '২. ক্যাম্পাস অঙ্গনে প্রবেশকালে অবশ্যই আইডি কার্ডটি দৃশ্যমান রাখতে হবে।',
          '৩. কার্ডটি অপব্যবহার বা অন্যের কাছে হস্তান্তর সম্পূর্ণ নিষিদ্ধ।',
          '৪. আইডি কার্ড হারিয়ে গেলে অফিসে রিপোর্ট করে নতুন কার্ড সংগ্রহ করুন।',
          '৫. অপার্থিব গেট পাঞ্চিং বা এটেনডেন্স সিস্টেমে স্ক্যান বাধ্যতামূলক।'
        ];

        ctx.font = 'medium 14px "Inter", sans-serif';
        ctx.fillStyle = '#475569';
        let currentY = 215;
        instructions.forEach(line => {
          ctx.fillText(line, 60, currentY);
          currentY += 34;
        });
      }

      // Divider
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 420);
      ctx.lineTo(540, 420);
      ctx.stroke();

      // Emergency & Validity dates
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 13px "Inter", sans-serif';
      ctx.fillText('জরুরী যোগাযোগ নম্বর:', 60, 460);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 18px "Inter", sans-serif';
      ctx.fillText(emergencyPhone, 60, 490);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 13px "Inter", sans-serif';
      ctx.fillText('কার্ডের মেয়াদ উত্তীর্ণ:', 540, 460);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.fillText(cardValidity, 540, 490);

      // College branding contacts
      ctx.textAlign = 'center';
      ctx.font = 'medium 13px "Inter", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('ঠিকানা: মিরপুর ডিজিটাল পার্ক সংলগ্ন একাডেমী রোড, ঢাকা-১২১৬।', 300, 560);
      ctx.fillText('হটলাইন: +৮৮০১৭২২৮৮৩৩৪৪ | ইমেইল: info@modelacademy.edu.bd', 300, 584);

      // Signature section
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(180, 695);
      ctx.lineTo(420, 695);
      ctx.stroke();

      ctx.font = 'italic bold 26px Georgia, serif';
      ctx.fillStyle = '#312e81';
      ctx.fillText('Khadiza Sultana', 300, 660);

      ctx.font = 'bold 13px "Inter", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('অধ্যক্ষ / স্বাক্ষরকারী কর্মকর্তা', 300, 715);

      // Bottom footer solid plate
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, 800, 600, 100, [0, 0, 32, 32]);
      } else {
        ctx.rect(0, 800, 600, 100);
      }
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText('POWERED BY DELICON ADVANCED INFRASTRUCTURE', 300, 855);
    }

    const dataUrl = canvas.toDataURL('image/png');
    const tempLink = document.createElement('a');
    tempLink.href = dataUrl;
    tempLink.download = `ID-CARD-${details.name.replace(/\s+/g, '_')}-${side === 'front' ? 'FRONT' : 'BACK'}.png`;
    tempLink.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, memberId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64String = await compressImage(file, 150, 180, 0.65);
      if (base64String) {
        const updated = { ...customPhotos, [memberId]: base64String };
        setCustomPhotos(updated);
        try {
          localStorage.setItem('delicon_custom_photos', JSON.stringify(updated));
        } catch (ex) {
          console.error("Storage limit exceeded inside handlePhotoChange", ex);
          alert("দুঃখিত, ব্রাউজার মেমোরি পূর্ণ হয়ে গেছে। অতিরিক্ত ডেমো ছবি রিমুভ করে পুনরায় চেষ্টা করুন।");
        }
      }
    }
  };

  const handleParentPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, memberId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64String = await compressImage(file, 150, 180, 0.65);
      if (base64String) {
        const updated = { ...customParentPhotos, [memberId]: base64String };
        setCustomParentPhotos(updated);
        try {
          localStorage.setItem('delicon_custom_parent_photos', JSON.stringify(updated));
        } catch (ex) {
          console.error("Storage limit exceeded inside handleParentPhotoChange", ex);
          alert("দুঃখিত, ব্রাউজার মেমোরি পূর্ণ হয়ে গেছে।");
        }
      }
    }
  };

  const handleBloodGroupChange = (memberId: string, bg: string) => {
    const updated = { ...bloodGroups, [memberId]: bg };
    setBloodGroups(updated);
    localStorage.setItem('delicon_blood_groups', JSON.stringify(updated));
  };

  // Planning Form state
  const [projTitle, setProjTitle] = useState('');
  const [projBangla, setProjBangla] = useState('');
  const [projBudget, setProjBudget] = useState('');
  const [projSuccess, setProjSuccess] = useState(false);

  // Quick statistics
  const totalReceivedFees = students.reduce((sum, s) => sum + s.feesPaid, 0);
  const totalTargetFees = students.reduce((sum, s) => sum + s.totalFees, 0);
  const pendingLeads = leads.filter(l => l.status === 'Pending').length;
  const staffPaidCount = employees.filter(e => e.paymentStatus === 'Paid').length;

  const handleCreateProj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !projBudget) return;
    addDevProject({
      title: projTitle,
      banglaTitle: projBangla || projTitle,
      budget: parseFloat(projBudget) || 100000,
      progress: 0,
      status: 'Planning'
    });
    setProjTitle('');
    setProjBangla('');
    setProjBudget('');
    setProjSuccess(true);
    setTimeout(() => setProjSuccess(false), 3000);
  };

  // Logic to calculate hours for employees from logs
  const getEmployeeMinutes = (empId: string) => {
    // Collect check-out logs that have work hours calculated
    const logs = attendanceLogs.filter(log => log.targetId === empId && log.targetType === 'employee' && log.workHours);
    if (logs.length === 0) return 8.0; // Simulated fallback shift
    const sum = logs.reduce((total, log) => total + (log.workHours || 0), 0);
    return +sum.toFixed(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* ERP Header */}
      <div className="mb-6 flex flex-col justify-between border-b border-blue-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <p className="text-xs font-bold tracking-wider text-blue-900 uppercase font-mono">
              DELICON SCHOOL MANAGEMENT SOFTWARE & ERP (V3)
            </p>
          </div>
          <h1 className="text-2xl font-black text-slate-900 md:text-3xl flex items-center gap-2">
            <Building className="h-7 w-7 text-blue-900" />
            <span>ডিলিকন স্কুল অটোমেশন কন্ট্রোল প্যানেল</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">লগইন মোড: <strong className="text-blue-900 uppercase">{role} PORTAL</strong> • সর্বোচ্চ নিরাপত্তা কনফিগারেশন</p>
        </div>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button 
            onClick={onLogout}
            className="rounded-lg border border-slate-300 hover:border-amber-500 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:text-amber-600 transition-all cursor-pointer"
          >
            კონტროল პანელი লগআউট
          </button>
        </div>
      </div>

      {/* Quick Dashboard Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">মোট সংগৃহীত ফি</span>
          <p className="text-2xl font-black text-blue-900 mt-0.5">৳ {totalReceivedFees.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 mt-1">বকেয়া লক্ষ্য: ৳ {(totalTargetFees - totalReceivedFees).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">অমৌখিক ভর্তি আবেদন</span>
          <p className="text-2xl font-black text-amber-600 mt-0.5">{pendingLeads} টি ফর্ম</p>
          <p className="text-[10px] text-slate-500 mt-1">অনুমোদনের জন্য ওয়েটিং লিস্টে আছে</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">স্টাফ গেট বেতন ক্লিয়ার</span>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">{staffPaidCount} / {employees.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">কর্মচারী ও শিক্ষকমণ্ডলী পেমেন্ট সম্পন্ন</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">মোট নথিভুক্ত শিক্ষার্থী</span>
          <p className="text-2xl font-black text-blue-900 mt-0.5">{students.length} জন</p>
          <p className="text-[10px] text-slate-500 mt-1">অনলাইন রেজিস্ট্রি তালিকাভুক্ত</p>
        </div>
      </div>

      {/* Main ERP Layout - Sidebar Tabs + Module Panel */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
        
        {/* Module Menu */}
        <aside className="w-full lg:w-64 shrink-0 space-y-1">
          {[
            { id: 'admissions', label: '১। ভর্তি আবেদন ও শিক্ষার্থী এন্ট্রি', icon: Users, count: pendingLeads },
            { id: 'finance', label: '২। ফি কালেকশন ও ব্যাংক', icon: CreditCard },
            { id: 'staff', label: '৩। স্টাফ পে-রোল ও হাজিরা', icon: Clock },
            { id: 'idcards', label: '৪। কিউআর আইডি কার্ড জেনারেটর', icon: QrCode },
            { id: 'exams', label: '৫। পরীক্ষার মেট্রিক্স ও মার্কস এন্ট্রি', icon: FileText },
            { id: 'docs', label: '৬। প্রশংসাপত্র ও ট্রান্সক্রিপ্ট প্রিন্ট', icon: Award },
            { id: 'requisitions', label: '৭। রিকুইজিশন অনুমোদন হাব', icon: CheckCircle2, count: requisitions.filter(r => !r.status.includes('Principal Approved') && !r.status.includes('Rejected')).length },
            { id: 'sections', label: '৮। ল্যান্ডিং সেকশন কাস্টমাইজার 🎨', icon: Layers },
            { id: 'inventory', label: '৯। স্টেশনারি ইনভেনটরি', icon: PackageOpen },
            { id: 'transport', label: '১০। স্কুল বাস পরিবহন রুট', icon: Bus },
            { id: 'planning', label: '১১। স্কুলের উন্নয়ন প্রজেক্ট', icon: TrendingUp },
            { id: 'notices', label: '১২। বিজ্ঞপ্তিসমূহ প্রকাশনা', icon: Bell },
            { id: 'scanner', label: '১৫। আরএফআইডি গেট সিমুলেটর 🎯', icon: QrCode },
            { id: 'dtube', label: '১৬। ডি-টিউব ও কালচারাল হাব 📺', icon: Video },
            { id: 'calendar', label: '১৭। একাডেমিক ডায়েরী ও ক্যালেন্ডার 📅', icon: Calendar },
            { id: 'library', label: '১৮। ডিজিটাল একাডেমিক লাইব্রেরি 📚', icon: Book },
            { id: 'settings', label: '১৩। গেটলাইন ও সিকিউরিটি', icon: KeyRound, devOnly: true },
            { id: 'db', label: '১৪। সিস্টেম ডিবি তথ্য (ডিভ)', icon: Database, devOnly: true }
          ].filter(tab => !tab.devOnly || role === 'Developer').map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-xs font-bold transition-all border cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-blue-900 text-white border-blue-900 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <tab.icon className={`h-4.5 w-4.5 shrink-0 ${activeTab === tab.id ? 'text-amber-400' : 'text-slate-450'}`} />
                <span>{tab.label}</span>
              </div>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`rounded-xl px-2 py-0.5 text-[10px] font-extrabold ${
                  activeTab === tab.id ? 'bg-blue-850 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* ERP Modules Wrapper */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
          
          {/* 1. ADMISSIONS MANAGER */}
          {activeTab === 'admissions' && (
            <div>
              <div className="border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-sm">অনলাইন ভর্তি লিড ও অ্যাপ্লিকেশন রিকোয়েস্ট</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">সবচেয়ে নতুন অনলাইন ভর্তি ফরম তথ্য এখানে সরাসরি দৃশ্যমান হয়</p>
              </div>

              {leads.filter(l => l.status === 'Pending').length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 font-bold">বর্তমানে কোনো নতুন আবেদন ট্র্যাকার পেন্ডিং নেই!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.filter(l => l.status === 'Pending').map((lead, idx) => (
                    <div key={idx} className="p-4 border rounded-xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase font-mono">APPLICATION REQUEST</span>
                        <h4 className="font-bold text-slate-800 text-xs mt-2">আবেদনকারী শিশু: {lead.studentName}</h4>
                        <p className="text-[11px] text-slate-500">অভিভাবক: {lead.parentName} • ফোন: {lead.phone} • শ্রেণী: {lead.desiredClass}</p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto shrink-0">
                        <button 
                          onClick={() => updateLeadStatus(lead.id, 'Approved')}
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 flex-1 md:flex-none transition-all"
                        >
                          <Check className="h-4 w-4" />
                          ভর্তি অনুমোদন
                        </button>
                        <button
                          onClick={() => updateLeadStatus(lead.id, 'Rejected')}
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 flex-1 md:flex-none transition-all border border-rose-150"
                        >
                          <X className="h-4 w-4" />
                          বাতিল
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DIRECT MANUAL STUDENT ENTRY FORM */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="font-extrabold text-blue-900 text-xs flex items-center gap-2">
                    <Plus className="h-4.5 w-4.5 bg-blue-900 text-white rounded-full p-0.5 flex items-center justify-center font-bold" />
                    ম্যানুয়াল সরাসরি নতুন শিক্ষার্থী এন্ট্রি ফর্ম (অফলাইন ভর্তি)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">মিরপুর ডিলিকন স্কুল ডিরেক্টরিভুক্ত করার জন্য শিক্ষার্থীর বিবরণ ও অভিভাবকের ফোন সাবমিট করুন।</p>

                  {studentFormSuccess && (
                    <div className="bg-emerald-100 text-emerald-800 text-[11px] p-2.5 rounded-lg font-bold my-3 flex items-center gap-1.5 leading-none shadow-sm">
                      <Check className="h-4 w-4" />
                      শিক্ষার্থীর তথ্য মেইন ডাটাবেজে সফলভাবে যুক্ত হয়েছে!
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">শিক্ষার্থীর নাম (বাংলা/ইংরেজি)</label>
                      <input 
                        type="text" 
                        placeholder="উদা: রিফাত ইসলাম"
                        value={manualStudentName}
                        onChange={e => setManualStudentName(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">শ্রেণী নির্বাচন</label>
                      <select 
                        value={manualStudentClass}
                        onChange={e => setManualStudentClass(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900"
                      >
                        {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">রোল নাম্বার</label>
                      <input 
                        type="text" 
                        placeholder="উদা: ০৩"
                        value={manualStudentRoll}
                        onChange={e => setManualStudentRoll(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">অভিভাবকের মোবাইল নম্বর</label>
                      <input 
                        type="text" 
                        placeholder="উদা: 01712345678"
                        value={manualStudentPhone}
                        onChange={e => setManualStudentPhone(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 focus:border-blue-900"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        if (!manualStudentName || !manualStudentPhone) return;
                        addStudent({
                          name: manualStudentName,
                          banglaName: manualStudentName,
                          className: manualStudentClass,
                          roll: manualStudentRoll || '01',
                          guardianName: 'অভিভাবক (সরাসরি যুক্ত)',
                          guardianPhone: manualStudentPhone,
                          feesPaid: 0,
                          totalFees: 15000
                        });
                        setManualStudentName('');
                        setManualStudentRoll('');
                        setManualStudentPhone('');
                        setStudentFormSuccess(true);
                        setTimeout(() => setStudentFormSuccess(false), 3000);
                      }}
                      className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow"
                    >
                      নিশ্চিত করুন ও ডাটা যুক্ত করুন
                    </button>
                  </div>
                </div>
              </div>

              {/* Already Processed database view */}
              <div className="mt-8">
                <h4 className="font-bold text-slate-700 text-xs mb-3">ইতিপূর্বে যাচাইকৃত ক্লিয়ার্ড লিডসমূহ</h4>
                <div className="space-y-2">
                  {leads.filter(l => l.status !== 'Pending').map((lead, idx) => (
                    <div key={idx} className="p-2.5 border border-slate-100 rounded bg-white flex justify-between text-xs text-slate-600">
                      <span>{lead.studentName} (শ্রেণী: {lead.desiredClass})</span>
                      <span className={`font-semibold ${lead.status === 'Approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {lead.status === 'Approved' ? 'অনুমোদিত ও রেজিস্ট্রিকৃত' : 'বাতিলকৃত'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. FINANCE & FEES COLLECTION */}
          {activeTab === 'finance' && (
            <div>
              <div className="border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-sm">ডিলিকন ফি কালেকশন রেজিস্ট্রি ও হিসাববই</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">সকল শিক্ষার্থীর বেতন পরিশোধ রেকর্ড সরাসরি ডাটাবেজ ট্র্যাক</p>
              </div>

              <div className="space-y-3">
                {students.map((student, idx) => (
                  <div key={student.id} className="p-3.5 border rounded-xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-850 text-xs">{student.banglaName} ({student.className})</h4>
                      <p className="text-[10px] text-slate-500 font-mono">অভিভাবক: {student.guardianName} • রোল: {student.roll}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto text-xs font-semibold select-none justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">পরিশোধিত</span>
                        <span className="text-slate-800">৳ {student.feesPaid} / ৳ {student.totalFees}</span>
                      </div>
                      
                      {student.feesPaid >= student.totalFees ? (
                        <span className="bg-emerald-100 text-emerald-800 rounded px-2.5 py-1 text-[10px] font-extrabold uppercase">Paid</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 rounded px-2.5 py-1 text-[10px] font-extrabold uppercase">বকেয়া পেন্ডিং</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. STAFF PAYROLL & HOURS ACCOUNTING */}
          {activeTab === 'staff' && (
            <div>
              <div className="border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-sm">স্টাফ পে-রোল ও উপস্থিতির ভিত্তিতে কর্মঘণ্টা রিসিট</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">কর্মকর্তা ও শিক্ষকমণ্ডলীর দৈনিক কর্মঘণ্টা ট্র্যাকিং ও বেতন পরিশোধ গেট</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                {/* Left Column: Authorized Employee Entry Form */}
                <div className="lg:col-span-5 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4 h-fit">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-900"></span>
                      নতুন শিক্ষক ও স্টাফ ডাটা এন্ট্রি
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">সহকারী ও এডমিন পোর্টাল থেকে নিরাপদে নতুন শিক্ষকের তথ্য ডেটাবেজে যুক্ত করুন।</p>
                  </div>

                  {employeeFormSuccess && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10.5px] font-bold text-center">
                      ✔ ডাটাবেজে নতুন স্টাফ/শিক্ষক সফলভাবে যুক্ত হয়েছে!
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!manualEmployeeName || !manualEmployeeBanglaName || !manualEmployeePhone) {
                        alert("শিক্ষক/কর্মচারীর নাম এবং ফোন নম্বর প্রদান করা আবশ্যক।");
                        return;
                      }
                      addEmployee({
                        name: manualEmployeeName,
                        banglaName: manualEmployeeBanglaName,
                        role: manualEmployeePost,
                        salary: parseFloat(manualEmployeeSalary) || 20,
                        phone: manualEmployeePhone,
                        subject: manualEmployeeSubject || undefined,
                        qualification: manualEmployeeQual || undefined
                      });
                      setManualEmployeeName('');
                      setManualEmployeeBanglaName('');
                      setManualEmployeePhone('');
                      setManualEmployeeSubject('');
                      setManualEmployeeQual('');
                      setManualEmployeeSalary('28000');
                      setEmployeeFormSuccess(true);
                      setTimeout(() => setEmployeeFormSuccess(false), 3000);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-slate-650 block mb-1">নাম (বাংলা) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="উদা: জনাব আশরাফুল আমিন"
                        value={manualEmployeeBanglaName}
                        onChange={e => setManualEmployeeBanglaName(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-950 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-650 block mb-1">Employee's Name (English) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Ashraful Amin"
                        value={manualEmployeeName}
                        onChange={e => setManualEmployeeName(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-950 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-655 block mb-1">স্টাফ পদবী ও ক্যাটাগরি <span className="text-red-500">*</span></label>
                        <select
                          value={manualEmployeePost}
                          onChange={e => setManualEmployeePost(e.target.value as any)}
                          className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-950 font-bold"
                        >
                          <option value="Teacher">Teacher (শিক্ষক)</option>
                          <option value="Coordinator">Coordinator (সমন্বয়ক)</option>
                          <option value="Staff">Staff (সাধারণ কর্মচারী)</option>
                          <option value="Driver">Driver (ড্রাইভার)</option>
                          <option value="Management">Management (ব্যবস্থাপনা)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-655 block mb-1">মাসিক মূল বেতন (টাকা) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          required
                          value={manualEmployeeSalary}
                          onChange={e => setManualEmployeeSalary(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-950 font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-650 block mb-1">মোবাইল ফোন নম্বর <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 01711223344"
                        value={manualEmployeePhone}
                        onChange={e => setManualEmployeePhone(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-950 font-mono font-medium"
                      />
                    </div>

                    {manualEmployeePost === 'Teacher' && (
                      <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                        <div>
                          <label className="text-[10px] font-bold text-slate-650 block mb-1">শিক্ষা দানের বিষয়</label>
                          <input
                            type="text"
                            placeholder="উদা: গণিত শিক্ষক"
                            value={manualEmployeeSubject}
                            onChange={e => setManualEmployeeSubject(e.target.value)}
                            className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-950 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-650 block mb-1">ডিগ্রী ও যোগ্যতা</label>
                          <input
                            type="text"
                            placeholder="উদা: এম.এসসি, বি.এড"
                            value={manualEmployeeQual}
                            onChange={e => setManualEmployeeQual(e.target.value)}
                            className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-950 font-medium"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-indigo-950 hover:bg-slate-900 text-white font-bold text-xs p-2.5 rounded-xl transition-all cursor-pointer shadow-sm mt-2"
                    >
                      নিরাপদ ডাটাবেজে সংরক্ষণ করুন
                    </button>
                  </form>
                </div>

                {/* Right Column: Existing Employees Tracker */}
                <div className="lg:col-span-7 space-y-3">
                  {employees.map((employee, idx) => {
                    const workHrs = getEmployeeMinutes(employee.id);
                    return (
                      <div key={employee.id} className="p-4 border rounded-xl bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">{employee.banglaName}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">পদবী: <span className="font-semibold">{employee.role}</span> • ফোন: {employee.phone}</p>
                          <p className="inline-flex items-center gap-1 mt-2 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[9px] font-bold text-blue-900 uppercase font-mono">
                            <Clock className="h-3 w-3 text-amber-500" />
                            <span>মোট ট্র্যাকিং কর্মকাল: {workHrs} ঘণ্টা</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-end text-xs">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-mono">বেতন বরাদ্দ</span>
                            <span className="font-extrabold text-slate-800">৳ {employee.salary.toLocaleString()}</span>
                          </div>

                          {employee.paymentStatus === 'Paid' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="bg-emerald-100 text-emerald-800 rounded px-3 py-1 text-[10px] font-extrabold uppercase">পরিশোধিত</span>
                              <button 
                                onClick={() => setActivePayslipEmpId(employee.id)}
                                className="bg-blue-50 text-blue-950 border border-blue-150 hover:bg-blue-105 rounded font-bold text-[10px] px-2.5 py-1.5 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                <Printer className="h-3 w-3 text-amber-600" />
                                পে-স্লিপ
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => paySalary(employee.id)}
                                className="bg-blue-900 hover:bg-blue-800 text-white rounded font-bold text-[10px] px-3 py-1.5 transition-all cursor-pointer shadow-sm"
                              >
                                পেমেন্ট করুন
                              </button>
                              <button 
                                onClick={() => setActivePayslipEmpId(employee.id)}
                                className="bg-blue-50 text-blue-950 border border-blue-150 hover:bg-blue-105 rounded font-bold text-[10px] px-2.5 py-1.5 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                <Printer className="h-3 w-3 text-amber-600" />
                                পে-স্লিপ
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PRINTABLE SALARY PAYSLIP GENERATOR */}
              {activePayslipEmpId && (() => {
                const emp = employees.find(e => e.id === activePayslipEmpId);
                if (!emp) return null;
                const hoursWorked = getEmployeeMinutes(emp.id);
                const otHours = Math.max(0, hoursWorked - 8);
                const otAllowance = Math.round(otHours * 250);
                const baseSal = emp.salary;
                const conveyance = 1500;
                const homeRent = Math.round(baseSal * 0.3);
                const providentFund = Math.round(baseSal * 0.05);
                const grossPay = baseSal + conveyance + homeRent + otAllowance;
                const netSalary = grossPay - providentFund;

                return (
                  <div className="mt-8 p-6 border-2 border-dashed border-blue-200 bg-white rounded-2xl relative shadow-md" id="payslip-print-area">
                    <span className="absolute top-4 right-4 text-[9px] font-mono font-bold text-amber-500 bg-slate-900 px-2 py-0.5 rounded tracking-widest uppercase">SALARY SLIP</span>
                    
                    <div className="flex justify-between items-start border-b pb-4">
                      <div>
                        <h4 className="text-xs font-black text-blue-900">ডিলিকন মডেল একাডেমী ও রিসার্চ ইনস্টিটিউট</h4>
                        <p className="text-[10px] text-slate-500 font-medium">মিরপুর-১০, ঢাকা-১২১৬ • ইমেইল: billing@delicon.edu</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-850 uppercase tracking-wide">বেতন পরিশোধ রসিদ (মে ২০২৬)</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">রসিদ নং: DEL-PAY-2026-{emp.id.replace('e_', '')}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs py-3 border-b bg-slate-50 p-3 rounded-lg">
                      <div>
                        <p className="text-slate-500 text-[10px]">কর্মকর্তা/কর্মচারী বিবরণ</p>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{emp.banglaName}</p>
                        <p className="text-[10px] text-slate-600">পদবী: {emp.role} | আইডি: {emp.id}</p>
                      </div>
                      <div className="text-right select-none">
                        <p className="text-slate-500 text-[10px]">পেমেন্ট টাইপ ও স্ট্যাটাস</p>
                        <p className="font-extrabold text-emerald-600 text-xs mt-0.5">ব্যাংক ট্রান্সফার কমপ্লিট</p>
                        <p className="text-[10px] text-slate-600 font-mono">তারিখ: {new Date().toISOString().split('T')[0]}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">বেতন ও ভাতাদির হিসাব বিবরণী</p>
                      <table className="w-full text-xs text-left divide-y border text-slate-600">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] text-slate-500">
                            <th className="p-2 font-bold">আইটেম / খাতের নাম</th>
                            <th className="p-2 text-right font-bold">যোগ (টাকা)</th>
                            <th className="p-2 text-right font-bold">বিয়োগ/কর্তন (টাকা)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="p-2 font-medium">মূল বেতন (Base Scale)</td>
                            <td className="p-2 text-right font-mono">৳ {baseSal.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono">-</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-medium">বাড়ি ভাড়া ভাতা (House Rent 30%)</td>
                            <td className="p-2 text-right font-mono">৳ {homeRent.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono">-</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-medium">যাতায়াত ও টিফিন ভাতা (Conveyance)</td>
                            <td className="p-2 text-right font-mono">৳ {conveyance.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono">-</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-medium">অতিরিক্ত ওভারটাইম বোনাস ({otHours} ঘণ্টা)</td>
                            <td className="p-2 text-right font-mono text-emerald-600 font-bold">৳ {otAllowance.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono">-</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-medium text-rose-700">কল্যাণ ও প্রভিডেন্ট ফান্ড কর্তন (Provident Fund 5%)</td>
                            <td className="p-2 text-right font-mono">-</td>
                            <td className="p-2 text-right font-mono text-rose-600">৳ {providentFund.toLocaleString()}</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-slate-800">
                            <td className="p-2">সর্বমোট নিট বেতন (Net Payable Bank Transfer)</td>
                            <td className="p-2 text-right font-mono text-blue-900 border-t" colSpan={2}>৳ {netSalary.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="mt-4 flex justify-between items-center bg-blue-50/50 p-2.5 rounded border border-blue-150">
                      <div className="text-[10px] text-slate-500 font-medium font-sans">
                        * এই রসিদটি কম্পিউটার জেনারেটেড ও ভেরিফাইড। কোনো ফিজিক্যাল স্বাক্ষরের প্রয়োজন নেই।
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.print()}
                          className="bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded hover:bg-slate-950 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          প্রিন্ট রসিদ
                        </button>
                        <button 
                          onClick={() => setActivePayslipEmpId(null)}
                          className="bg-white text-slate-700 border font-bold text-[10px] px-3 py-1.5 rounded hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          বন্ধ করুন
                        </button>
                      </div>
                    </div>
                  </div>
                 );
                })()}
            </div>
          )}

          {/* 4B. ID CARDS DEVELOPER HUB */}
          {activeTab === 'idcards' && (
            <div>
              <div className="border-b pb-3 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-indigo-950" />
                    ডুয়াল কিউআর আইডি কার্ড ডিজাইনার ও জেনারেটর
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">শিক্ষার্থী এবং কর্মচারীদের জন্য দুই ধরনের সম্পূর্ণ আলাদা প্রফেশনাল এপিঠ-ওপিঠ কিউআর-কোড যুক্ত ডিজিটাল আইডি কার্ড প্রিন্টআউট</p>
                </div>
                {selectedRecipientId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadCardAsImage('front', selectedRecipientId)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-1.5 px-3 rounded border border-slate-300 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Download className="h-3 w-3 text-emerald-600" />
                      ডাউনলোড এপিঠ (Front)
                    </button>
                    <button
                      onClick={() => downloadCardAsImage('back', selectedRecipientId)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-1.5 px-3 rounded border border-slate-300 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Download className="h-3 w-3 text-rose-600" />
                      ডাউনলোড ওপিঠ (Back)
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-[10px] py-1.5 px-3 rounded flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Printer className="h-3 w-3 text-amber-400" />
                      কার্ড প্রিন্ট করুন
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left controls sidebar */}
                <div className="xl:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-extrabold text-[11px] text-slate-700 mb-3 border-b pb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <Settings className="h-3.5 w-3.5 text-blue-900 animate-spin-slow" />
                    কার্ড কনফিগারেশন প্যানেল
                  </h4>
                  
                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={() => { setRecipientType('student'); setSelectedRecipientId(''); }}
                      className={`flex-1 py-1.5 px-3 rounded text-[10px] font-bold text-center border cursor-pointer transition-all ${recipientType === 'student' ? 'bg-indigo-950 border-indigo-950 text-white shadow' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    >
                      শিক্ষার্থী কার্ড
                    </button>
                    <button 
                      onClick={() => { setRecipientType('employee'); setSelectedRecipientId(''); }}
                      className={`flex-1 py-1.5 px-3 rounded text-[10px] font-bold text-center border cursor-pointer transition-all ${recipientType === 'employee' ? 'bg-indigo-950 border-indigo-950 text-white shadow' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    >
                      কর্মচারী / শিক্ষক
                    </button>
                  </div>

                  <label className="text-[10px] font-bold block text-slate-600 mb-1">সদস্য নির্বাচন করুন</label>
                  <select 
                    value={selectedRecipientId}
                    onChange={e => setSelectedRecipientId(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:ring-1 focus:ring-indigo-950 mb-4 font-bold"
                  >
                    <option value="">নির্বাচন করুন...</option>
                    {recipientType === 'student' ? (
                      students.map(s => (
                        <option key={s.id} value={s.id}>{s.name || s.banglaName} {s.banglaName && s.banglaName !== s.name ? `(${s.banglaName})` : ''} (শ্রেণী: {s.className})</option>
                      ))
                    ) : (
                      employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name || e.banglaName} {e.banglaName && e.banglaName !== e.name ? `(${e.banglaName})` : ''} ({e.role})</option>
                      ))
                    )}
                  </select>

                  {selectedRecipientId ? (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-4">
                      {/* Interactive Photo Upload Area */}
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                          <Image className="h-3.5 w-3.5 text-indigo-950" />
                          ১। প্রোফাইল ছবি যুক্ত করুন (আবশ্যিক)
                        </span>
                        
                        {customPhotos[selectedRecipientId] ? (
                          <div className="flex items-center gap-3 p-2 bg-emerald-50 rounded-xl border border-emerald-150 mb-2">
                            <img 
                              src={customPhotos[selectedRecipientId]} 
                              alt="Uploaded Profile" 
                              className="h-10 w-10 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-bold text-emerald-800 leading-none">মনোযোগ: ছবি সফলভাবে আপলোড হয়েছে</p>
                              <button 
                                onClick={() => {
                                  const updated = { ...customPhotos };
                                  delete updated[selectedRecipientId];
                                  setCustomPhotos(updated);
                                  localStorage.setItem('delicon_custom_photos', JSON.stringify(updated));
                                }}
                                className="text-[8px] font-bold text-red-600 hover:underline block mt-1 cursor-pointer"
                              >
                                রিমুভ / নতুন দিন
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[9px] text-amber-700 bg-amber-50 rounded-lg p-2 font-bold mb-2 leading-tight border border-amber-200">
                            কোনো ছবি পাওয়া যায়নি। নিচে ফাইল সিলেক্ট করে ছবি বসিয়ে নিন।
                          </div>
                        )}

                        <div className="flex bg-slate-100 p-0.5 rounded-lg gap-0.5 border border-slate-200 text-[9px] font-black select-none font-sans mb-3">
                          <button
                            type="button"
                            onClick={() => setIdCardPhotoTab('upload')}
                            className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${idCardPhotoTab === 'upload' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-850'}`}
                          >
                            📂 ফাইল আপলোড
                          </button>
                          <button
                            type="button"
                            onClick={() => setIdCardPhotoTab('camera')}
                            className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${idCardPhotoTab === 'camera' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-850'}`}
                          >
                            📷 ডিভাইস ক্যামেরা
                          </button>
                          <button
                            type="button"
                            onClick={() => setIdCardPhotoTab('url')}
                            className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${idCardPhotoTab === 'url' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-850'}`}
                          >
                            🌐 অনলাইন লিংক
                          </button>
                        </div>

                        {idCardPhotoTab === 'upload' && (
                          <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-950 rounded-xl p-3 bg-white text-center cursor-pointer transition-all">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handlePhotoChange(e, selectedRecipientId)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-1">
                              <Upload className="h-5 w-5 text-slate-400 group-hover:text-indigo-950" />
                              <span className="text-[10px] font-extrabold text-slate-600">কম্পিউটার থেকে ছবি আপলোড করুন</span>
                              <span className="text-[8px] text-slate-400">PNG / JPG (অটো-রিসাইজ ও কম্প্রেশন)</span>
                            </div>
                          </div>
                        )}

                        {idCardPhotoTab === 'camera' && (
                          <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-200 space-y-3">
                            {isCameraActive ? (
                              <div className="space-y-2.5">
                                <div className="relative aspect-[5/6] max-w-[170px] mx-auto rounded-lg overflow-hidden bg-black border border-slate-300 shadow-sm">
                                  <video 
                                    ref={videoRef}
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                  />
                                  <div className="absolute top-1.5 right-1.5 flex gap-1">
                                    <button
                                      type="button"
                                      onClick={toggleFacingMode}
                                      className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer flex items-center justify-center"
                                      title="ক্যামেরা ফ্লিপ করুন"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex gap-2 justify-center">
                                  <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="px-3 py-1.5 bg-indigo-950 text-white hover:bg-indigo-900 border border-indigo-950 text-[10px] font-black rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                  >
                                    <Camera className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                                    ক্যাপচার করুন (Take Shot)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleStopCamera}
                                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-250 text-[10px] font-black rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                                  >
                                    <CameraOff className="h-3.5 w-3.5" />
                                    বন্ধ করুন
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-lg bg-white space-y-2 text-center">
                                <Camera className="h-8 w-8 text-slate-400 animate-bounce" />
                                <div className="space-y-0.5">
                                  <p className="text-[10px] font-extrabold text-slate-700">ডিভাইস ক্যামেরা এক্টিভেশন</p>
                                  <p className="text-[8px] text-slate-400">সরাসরি ক্যামেরা থেকে ছবি তুলে স্টুডেন্ট প্রোফাইল সেট করুন</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={startCamera}
                                  className="mt-1 bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-[9px] px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  <Camera className="h-3 w-3 text-amber-300" />
                                  লাইভ ক্যামেরা চালু করুন
                                </button>
                              </div>
                            )}

                            {cameraError && (
                              <div className="p-2 bg-rose-50 border border-rose-200 rounded text-[9px] text-rose-600 font-bold text-center leading-relaxed">
                                ⚠ {cameraError}
                              </div>
                            )}
                          </div>
                        )}

                        {idCardPhotoTab === 'url' && (
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-black text-slate-600 block leading-none font-sans">
                              সরাসরি অনলাইন ছবির ডিরেক্ট ইউআরএল লিংক (Image Link URL):
                            </label>
                            <input
                              type="text"
                              placeholder="যেমন: https://website.com/photo.jpg বা যেকোনো ইমেজ লিংক"
                              value={customPhotos[selectedRecipientId] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...customPhotos, [selectedRecipientId]: val };
                                setCustomPhotos(updated);
                                try {
                                  localStorage.setItem('delicon_custom_photos', JSON.stringify(updated));
                                } catch (ex) {
                                  console.error("Storage limit exceeded inside manual photo URL set item", ex);
                                }
                              }}
                              className="w-full rounded-lg border border-slate-205 bg-white p-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none transition-all placeholder-slate-400 tracking-wide font-sans text-slate-800"
                            />
                            <p className="text-[8.5px] text-slate-400 font-sans leading-relaxed">
                              আপনি ফেসবুক, হোয়াটসঅ্যাপ বা অন্য কোনো ছবির ডিরেক্ট লিংক পেস্ট করে দিতে পারেন। এটি ব্রাউজার মেমোরি বাঁচাবে।
                            </p>
                          </div>
                        )}
                      </div>

                      {recipientType === 'student' && (
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-indigo-950" />
                            ১.২। বাবা ও মায়ের জোড়া ছবি (ওপিঠের জন্য আবশ্যিক)
                          </span>
                          
                          {customParentPhotos[selectedRecipientId] ? (
                            <div className="flex items-center gap-3 p-2 bg-rose-50 rounded-xl border border-rose-150 mb-2">
                              <img 
                                src={customParentPhotos[selectedRecipientId]} 
                                alt="Uploaded Parents Joint" 
                                className="h-[30px] w-10 rounded object-cover border border-rose-400 shadow-sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[8px] font-bold text-rose-800 leading-none">জোড়া ছবি সফলভাবে আপলোড হয়েছে</p>
                                <button 
                                  onClick={() => {
                                    const updated = { ...customParentPhotos };
                                    delete updated[selectedRecipientId];
                                    setCustomParentPhotos(updated);
                                    localStorage.setItem('delicon_custom_parent_photos', JSON.stringify(updated));
                                  }}
                                  className="text-[8px] font-bold text-red-650 hover:underline block mt-1 cursor-pointer"
                                >
                                  রিমুভ / নতুন দিন
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[8.5px] text-zinc-650 bg-rose-50/50 rounded-lg p-2 font-bold mb-2 leading-tight border border-rose-100">
                              ওপিঠে পিতা ও মাতার জোড়া ছবি যুক্ত করার জন্য নিচে ফাইল সিলেক্ট করে আপলোড করুন।
                            </div>
                          )}

                          <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-950 rounded-xl p-3 bg-white text-center cursor-pointer transition-all">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleParentPhotoChange(e, selectedRecipientId)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-1">
                              <Upload className="h-5 w-5 text-slate-400 group-hover:text-indigo-950" />
                              <span className="text-[10px] font-extrabold text-slate-600">কম্পিউটার থেকে জোড়া ছবি আপলোড করুন</span>
                              <span className="text-[8px] text-slate-400">PNG / JPG (অটো-রিসাইজ ও কম্প্রেশন)</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 my-2 select-none">
                            <div className="flex-1 h-px bg-slate-100"></div>
                            <span className="text-[8.5px] font-black text-slate-400 uppercase font-sans">অথবা</span>
                            <div className="flex-1 h-px bg-slate-100"></div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9.5px] font-black text-slate-600 block leading-none font-sans">
                              বাবা-মায়ের জোড়া ছবির সরাসরি অনলাইন লিংক (Joint Image Link):
                            </label>
                            <input
                              type="text"
                              placeholder="যেমন: https://website.com/parents.jpg বা যেকোনো ইমেজ লিংক"
                              value={customParentPhotos[selectedRecipientId] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...customParentPhotos, [selectedRecipientId]: val };
                                setCustomParentPhotos(updated);
                                try {
                                  localStorage.setItem('delicon_custom_parent_photos', JSON.stringify(updated));
                                } catch (ex) {
                                  console.error("Storage limit exceeded inside manual parent photo URL set item", ex);
                                }
                              }}
                              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none transition-all placeholder-slate-400 tracking-wide font-sans text-slate-800"
                            />
                            <p className="text-[8.5px] text-slate-400 font-sans leading-relaxed">
                              বাবা-মায়ের জোড়া ছবি কোনো ড্রাইভে বা মেসেঞ্জারে থাকলে সেই ছবির ডাইরেক্ট লিংক কপি করে বসিয়ে দিন।
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Customizable Blood Group */}
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-700 block mb-1">২। রক্তের গ্রুপ</span>
                        <select
                          value={bloodGroups[selectedRecipientId] || ''}
                          onChange={(e) => handleBloodGroupChange(selectedRecipientId, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] font-bold text-slate-800 focus:outline-indigo-950"
                        >
                          <option value="">নির্বাচন করুন...</option>
                          <option value="A+">A+ (এ পজিটিভ)</option>
                          <option value="A-">A- (এ নেগেটিভ)</option>
                          <option value="B+">B+ (বি পজিটিভ)</option>
                          <option value="B-">B- (বি নেগেটিভ)</option>
                          <option value="O+">O+ (ও পজিটিভ)</option>
                          <option value="O-">O- (ও নেগেটিভ)</option>
                          <option value="AB+">AB+ (এবি পজিটিভ)</option>
                          <option value="AB-">AB- (এবি নেগেটিভ)</option>
                        </select>
                      </div>

                      {/* Canva-like Theme Circle Color Chips */}
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-700 block mb-2">৩। ক্যানভা স্টাইল থিম কালার</span>
                        <div className="flex gap-2">
                          {Object.entries(cardThemes).map(([key, themeVal]) => (
                            <button
                              key={key}
                              onClick={() => setIdCardTheme(key as any)}
                              className={`h-7 w-7 rounded-full border-2 transition-transform cursor-pointer relative shadow-sm ${idCardTheme === key ? 'scale-110 border-slate-900 ring-2 ring-slate-300' : 'border-transparent opacity-75 hover:opacity-100'}`}
                              style={{ background: themeVal.primaryColor }}
                              title={themeVal.name}
                            >
                              {idCardTheme === key && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                        <span className="text-[8px] text-zinc-500 block mt-1 font-bold">থিম কালার: {cardThemes[idCardTheme].name}</span>
                      </div>

                      {/* Configurable Emergency Phone Contact on Card Back */}
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-700 block mb-1">৪। জরুরী যোগাযোগ (ওপিঠ)</span>
                        <input
                          type="text"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] font-mono focus:outline-indigo-950 font-bold text-red-650"
                        />
                      </div>

                      {/* Card Validity Exp Date */}
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-700 block mb-1">৫। মেয়াদ উত্তীর্ণের তারিখ (ওপিঠ)</span>
                        <input
                          type="text"
                          value={cardValidity}
                          onChange={(e) => setCardValidity(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] font-mono focus:outline-indigo-950 font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] mt-4 p-3 bg-amber-50/50 border border-amber-200 text-amber-800 rounded-lg text-center font-bold">
                      ⚠️ কোনো মেম্বারকে সিলেক্ট করলে তার ছবি আপলোড, রক্তের গ্রুপ ও ক্যানভা স্টাইল থিম কালার পরিবর্তনের সম্পূর্ণ সুযোগ উন্মুক্ত হবে।
                    </div>
                  )}
                </div>

                {/* Previews Frame */}
                <div className="xl:col-span-8 bg-slate-100/40 rounded-2xl border p-6 flex flex-col items-center justify-center min-h-[440px]">
                  {selectedRecipientId ? (() => {
                    const student = recipientType === 'student' ? students.find(s => s.id === selectedRecipientId) : null;
                    const employee = recipientType === 'employee' ? employees.find(e => e.id === selectedRecipientId) : null;
                    const details = student || employee;
                    if (!details) return <p className="text-xs text-slate-400 font-bold">সদস্য পাওয়া যায়নি!</p>;

                    const activeTheme = cardThemes[idCardTheme];

                    return (
                      <div className="w-full flex flex-col items-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl justify-center items-center">
                          {/* ==================== FRONT SIDE ==================== */}
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-indigo-950 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded border border-indigo-150">
                              এপিঠ (FRONT SIDE)
                            </span>
                            
                            <div 
                              id="idcard-front-printable" 
                              className="w-64 h-96 rounded-2xl overflow-hidden shadow-xl border relative flex flex-col bg-white text-slate-800 font-sans"
                            >
                              {/* Header based on theme configuration */}
                              <div className={`p-4 text-center text-white flex flex-col items-center gap-1.5 border-b ${activeTheme.banner}`}>
                                <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center font-bold text-xs select-none shadow-sm">
                                  🏫
                                </div>
                                <div className="leading-tight">
                                  <h5 className="font-extrabold text-[10px] tracking-wide uppercase leading-none text-white">MODEL ACADEMY</h5>
                                  <span className={`text-[7px] block ${activeTheme.subText} mt-0.5 uppercase tracking-widest font-black`}>MIRPUR AUTOMATION LAB</span>
                                </div>
                              </div>

                              {/* Profile Image Frame */}
                              <div className="flex-1 flex flex-col items-center pt-4 px-4 text-center">
                                {customPhotos[selectedRecipientId] ? (
                                  <div className="h-16 w-16 rounded-full border-2 overflow-hidden shadow-md" style={{ borderColor: activeTheme.secondaryColor }}>
                                    <img 
                                      src={customPhotos[selectedRecipientId]} 
                                      alt="Uploaded Profile" 
                                      className="h-full w-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                ) : (
                                  <div className={`h-16 w-16 rounded-full border-2 flex items-center justify-center font-black text-xl shadow select-none ${activeTheme.ring}`}>
                                    {details.name[0].toUpperCase()}
                                  </div>
                                )}

                                <h4 className="font-black text-[15px] text-slate-900 mt-2 leading-tight">{details.name}</h4>
                                
                                {student ? (
                                  <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full mt-1 ${activeTheme.badge}`}>
                                    শিক্ষার্থী | শ্রেণী: {student.className}
                                  </span>
                                ) : (
                                  <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full mt-1 bg-rose-100 text-rose-950 border border-rose-200`}>
                                    এমপ্লয়ী | পদবী: {employee?.role}
                                  </span>
                                )}

                                <div className="w-full border-t border-slate-100 my-2.5"></div>

                                {/* Detail information grid */}
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px] text-left text-slate-600 w-full font-bold">
                                  <div>
                                    <span className="block text-[7px] uppercase font-black text-slate-400 font-mono leading-none">School ID</span>
                                    <span className="text-slate-800">{student ? `STD-${student.id.replace('s_', '')}` : `EMP-${employee?.id.replace('e_', '')}`}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="block text-[7px] uppercase font-black text-slate-400 font-mono leading-none">রোল / কোড</span>
                                    <span className="text-slate-800">{student ? student.roll : 'ACTIVE STAFF'}</span>
                                  </div>
                                  <div className="mt-1">
                                    <span className="block text-[7px] uppercase font-black text-slate-400 font-mono leading-none">রক্তের গ্রুপ</span>
                                    <span className="text-red-700 font-black">{bloodGroups[selectedRecipientId] || 'মোনা সিলেক্টেড'}</span>
                                  </div>
                                  <div className="text-right mt-1">
                                    <span className="block text-[7px] uppercase font-black text-slate-400 font-mono leading-none">মোবাইল নম্বর</span>
                                    <span className="text-slate-800 text-[8px] font-black">{student ? student.guardianPhone : (employee?.phone || 'N/A')}</span>
                                  </div>
                                </div>
                              </div>

                              {/* QR Scan bottom plate */}
                              <div className="p-2 text-center flex items-center justify-center gap-3 border-t bg-slate-50 relative">
                                {qrCodeDataUrl ? (
                                  <img 
                                    className="h-14 w-14 shrink-0 shadow-sm rounded p-0.5 bg-white border border-slate-200" 
                                    src={qrCodeDataUrl} 
                                    alt="QR Code" 
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="h-14 w-14 shrink-0 animate-pulse bg-slate-200 rounded"></div>
                                )}
                                <div className="text-left font-mono leading-none">
                                  <p className="text-[6.5px] text-slate-400 uppercase font-black">Gate Access Token</p>
                                  <p className="text-[9.5px] text-slate-800 font-extrabold mt-1">TOKEN=MIR-{details.id.toUpperCase()}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ==================== BACK SIDE ==================== */}
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-indigo-950 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded border border-indigo-150">
                              ওপিঠ (BACK SIDE)
                            </span>

                            <div 
                              id="idcard-back-printable" 
                              className="w-64 h-96 rounded-2xl overflow-hidden shadow-xl border relative flex flex-col bg-white text-slate-800 font-sans"
                            >
                              {/* Accent Ribbon Header */}
                              <div className={`p-2.5 text-center text-white border-b ${activeTheme.banner}`}>
                                <h5 className="font-extrabold text-[7.5px] tracking-wide uppercase leading-none text-white">TERMS & SYSTEM RULES</h5>
                              </div>

                              {/* Inst terms text content */}
                              <div className="flex-1 p-3 flex flex-col justify-between">
                                {student ? (
                                  <div className="flex gap-2 items-start justify-between">
                                    {/* Left block: Instructions */}
                                    <div className="flex-1 space-y-1">
                                      <h6 className="font-extrabold text-[8px] text-slate-700 leading-none">নির্দেশনাবলী ও নিয়মকানুন:</h6>
                                      <ul className="text-[6.5px] text-slate-500 space-y-0.5 font-bold list-decimal pl-3 leading-tight">
                                        <li>আইডি কার্ড ঝুলিয়ে রাখা আবশ্যক।</li>
                                        <li>কার্ড হস্তান্তর সম্পূর্ণ দণ্ডনীয়।</li>
                                        <li>কার্ড হারিয়ে গেলে অবিলম্বে জানান।</li>
                                        <li>পাঞ্চ বা স্ক্যান বাধ্যতামূলক।</li>
                                      </ul>
                                    </div>

                                    {/* Right block: Parents' Joint Photo */}
                                    <div className="flex flex-col items-center shrink-0">
                                      <div className="w-[85px] h-[65px] rounded border border-slate-300 overflow-hidden bg-slate-50 flex items-center justify-center relative shadow-sm">
                                        {customParentPhotos[selectedRecipientId] ? (
                                          <img
                                            src={customParentPhotos[selectedRecipientId]}
                                            alt="Parents"
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <div className="text-center p-1 flex flex-col items-center justify-center">
                                            <span className="text-[6px] text-slate-450 font-black leading-none mb-0.5">মাতা ও পিতা</span>
                                            <span className="text-[5px] text-slate-400">জোড়া ছবি</span>
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-[6px] font-extrabold text-indigo-950 mt-1 uppercase text-center bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100">অভিভাবকের ছবি</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <h6 className="font-extrabold text-[8px] text-slate-700 leading-none">নির্দেশনাবলী ও নিয়মকানুন:</h6>
                                    <ul className="text-[7px] text-slate-500 space-y-0.5 font-bold list-decimal pl-3.5 leading-snug">
                                      <li>এই আইডি কার্ডটি একাডেমির অফিস কর্তৃক অনুমোদিত ও সংরক্ষিত।</li>
                                      <li>ক্যাম্পাস অঙ্গনে প্রবেশকালে অবশ্যই কার্ড দৃশ্যমান থাকতে হবে।</li>
                                      <li>কার্ডটি অপব্যবহার বা অন্যের কাছে হস্তান্তর সম্পূর্ণ দণ্ডনীয়।</li>
                                      <li>কার্ড হারিয়ে গেলে অবিলম্বে মেম্বারশিপ ফি দিয়ে নতুন ইস্যু করুন।</li>
                                      <li>গেট এটেনডেন্স পাঞ্চিং এর জন্য নিয়মসমূহ মেনে চলুন।</li>
                                    </ul>
                                  </div>
                                )}

                                {/* Divider line */}
                                <div className="border-t border-slate-100 my-1"></div>

                                {/* Emerg & Expiry */}
                                <div className="grid grid-cols-2 gap-2 text-left">
                                  <div>
                                    <span className="block text-[6.5px] uppercase font-black text-slate-450 leading-none">জরুরী যোগাযোগ</span>
                                    <span className="text-[9px] text-red-600 font-black font-mono">{emergencyPhone}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="block text-[6.5px] uppercase font-black text-slate-450 leading-none">মেয়াদ উত্তীর্ণ:</span>
                                    <span className="text-[9px] text-slate-800 font-black font-mono">{cardValidity}</span>
                                  </div>
                                </div>

                                <div className="text-center">
                                  <p className="text-[6px] text-slate-400 font-semibold leading-none">ঠিকানা: মিরপুর ডিজিটাল পার্ক সংলগ্ন একাডেমী রোড, ঢাকা।</p>
                                  <p className="text-[6px] text-slate-400 font-semibold mt-0.5 leading-none">হটলাইন: +৮৮০১৭২২৮৮৩৩৪৪ | info@modelacademy.edu.bd</p>
                                </div>

                                {/* Signature plate */}
                                <div className="text-center pt-2 flex flex-col items-center">
                                  <span className="font-serif italic text-blue-950 font-black text-[12px] opacity-80 leading-none tracking-wide">
                                    Khadiza Sultana
                                  </span>
                                  <div className="w-2/3 border-t border-slate-200 mt-1"></div>
                                  <span className="text-[7px] text-slate-400 font-black mt-0.5 uppercase tracking-wider">অধ্যক্ষ / স্বাক্ষরকারী কর্মকর্তা</span>
                                </div>
                              </div>

                              {/* Footer plate */}
                              <div className="p-2 text-center border-t bg-slate-900 text-slate-300 font-mono text-[7px] font-black">
                                POWERED BY DELICON WORKSPACE
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive download action triggers bottom */}
                        <div className="flex gap-2.5 mt-6 border-t pt-4 w-full justify-center">
                          <button
                            onClick={() => downloadCardAsImage('front', selectedRecipientId)}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs p-2.5 px-3.5 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                          >
                            <Download className="h-4 w-4 text-emerald-400" />
                            এপিঠ (Front Side) ডাউনলোড
                          </button>
                          
                          <button
                            onClick={() => downloadCardAsImage('back', selectedRecipientId)}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs p-2.5 px-3.5 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                          >
                            <Download className="h-4 w-4 text-rose-455" />
                            ওপিঠ (Back Side) ডাউনলোড
                          </button>

                          <button
                            onClick={() => window.print()}
                            className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs p-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                          >
                            <Printer className="h-4 w-4 text-amber-400" />
                            দ্বিপাক্ষিক প্রিন্ট করুন (Print)
                          </button>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="text-center font-semibold text-slate-400">
                      <QrCode className="h-12 w-12 text-indigo-950/30 mx-auto stroke-1 animate-pulse" />
                      <p className="text-slate-400 text-xs mt-3">বামদিকের কন্ট্রোল প্যানেল থেকে মেম্বার নির্বাচন করলে এপিঠ ও ওপিঠ আইডি কার্ড ডিজাইনের লাইভ ক্যানভাস প্রদর্শিত হবে</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4C. EXAM METRICS & MARKS RECORDING HUB */}
          {activeTab === 'exams' && (
            <div>
              <div className="border-b pb-3 mb-6">
                <h3 className="font-bold text-slate-800 text-sm">পরীক্ষা ফলাফল, গ্রেড স্কোর ও মার্কস এন্ট্রি সিস্টেম</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">পার্বণিক পরীক্ষা (বছরে ৩ বার) এবং মিডটার্ম পরীক্ষার (সাপ্তাহিক ও মাসিক) উত্তরপত্র যাচাই মার্কস ডিক্লেয়ারেশন ফরমেট</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form column */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5 mb-3 uppercase">
                    <Layers className="h-4.5 w-4.5 text-amber-500" />
                    পরীক্ষার নম্বর এন্ট্রি ও গ্রেড গণনা
                  </h4>

                  {examSuccess && (
                    <div className="bg-emerald-100 text-emerald-800 text-[11px] p-2.5 rounded-lg font-bold my-3 flex items-center gap-1.5">
                      <Check className="h-4 w-4" />
                      মার্কস ডাটাবেজে সফলভাবে স্টোর করা হয়েছে!
                    </div>
                  )}

                  {examFormError && (
                    <div className="bg-rose-100 text-rose-800 text-[11px] p-2.5 rounded-lg font-bold my-3 flex items-center gap-1.5">
                      <X className="h-4 w-4" />
                      {examFormError}
                    </div>
                  )}

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">শিক্ষার্থী নির্বাচন</label>
                      <select
                        value={selectedStudentForExam}
                        onChange={e => setSelectedStudentForExam(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 focus:border-blue-900"
                      >
                        <option value="">নির্বাচن করুন...</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (শ্রেণী: {s.className} | রোল: {s.roll})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">পরীক্ষার ধরণ</label>
                        <select
                          value={examType}
                          onChange={e => {
                            setExamType(e.target.value as any);
                            setExamName(e.target.value === 'Terminal' ? 'First Term 2026' : 'Weekly Midterm 1');
                          }}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900"
                        >
                          <option value="Terminal">পার্বণিক পরীক্ষা (৩ বার বছরে)</option>
                          <option value="Midterm">মিডটার্ম পরীক্ষা (সাপ্তাহিক/মাসিক)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">পরীক্ষার নাম / পর্ব</label>
                        <input
                          type="text"
                          value={examName}
                          onChange={e => setExamName(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 focus:border-blue-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">পরীক্ষার বিষয়</label>
                        <select
                          value={selectedSubject}
                          onChange={e => setSelectedSubject(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900"
                        >
                          <option value="math">গণিত (Math)</option>
                          <option value="bangla">বাংলা (Bangla)</option>
                          <option value="english">ইংরেজি (english)</option>
                          <option value="science">বিজ্ঞান (Science)</option>
                          <option value="ict">আইসিটি (ICT)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">লিখিত নম্বর (৬০)</label>
                        <input
                          type="number"
                          placeholder="উদা: ৪২"
                          value={writtenMarksInput}
                          onChange={e => setWrittenMarksInput(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 focus:border-blue-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">এমসিকিউ (৪০)</label>
                        <input
                          type="number"
                          placeholder="উদা: ২৭"
                          value={mcqMarksInput}
                          onChange={e => setMcqMarksInput(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 focus:border-blue-900"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-900 text-white p-3 rounded-xl space-y-1 text-xs select-none shadow">
                      {(() => {
                        const writ = parseFloat(writtenMarksInput) || 0;
                        const mcq = parseFloat(mcqMarksInput) || 0;
                        const tot = writ + mcq;
                        let letterGrade = 'F';
                        let gpScore = 0.0;

                        if (tot >= 80) { letterGrade = 'A+'; gpScore = 5.0; }
                        else if (tot >= 70) { letterGrade = 'A'; gpScore = 4.0; }
                        else if (tot >= 60) { letterGrade = 'A-'; gpScore = 3.5; }
                        else if (tot >= 50) { letterGrade = 'B'; gpScore = 3.0; }
                        else if (tot >= 40) { letterGrade = 'C'; gpScore = 2.0; }
                        else if (tot >= 33) { letterGrade = 'D'; gpScore = 1.0; }

                        return (
                          <>
                            <div className="flex justify-between font-bold border-b border-blue-800 pb-1">
                              <span>মোট প্রাপ্ত নম্বর (Auto Compute):</span>
                              <span className="text-amber-400 font-bold">{tot} / ১০০</span>
                            </div>
                            <div className="flex justify-between pt-1 select-none font-bold text-[11px]">
                              <span>গ্রেড লেটার: {letterGrade}</span>
                              <span>জিপিএ পয়েন্ট: {gpScore.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          if (!selectedStudentForExam || !writtenMarksInput || !mcqMarksInput) {
                            setExamFormError('অনুগ্রহ করে সঠিক শিক্ষার্থী নির্বাচন এবং প্রাপ্ত নম্বর প্রদান করুন।');
                            return;
                          }
                          const foundStud = students.find(s => s.id === selectedStudentForExam);
                          if (!foundStud) return;

                          const writ = parseFloat(writtenMarksInput) || 0;
                          const mcq = parseFloat(mcqMarksInput) || 0;
                          const tot = writ + mcq;

                          let letterGrade = 'F';
                          let gpScore = 0.0;
                          if (tot >= 80) { letterGrade = 'A+'; gpScore = 5.0; }
                          else if (tot >= 70) { letterGrade = 'A'; gpScore = 4.0; }
                          else if (tot >= 60) { letterGrade = 'A-'; gpScore = 3.5; }
                          else if (tot >= 50) { letterGrade = 'B'; gpScore = 3.0; }
                          else if (tot >= 40) { letterGrade = 'C'; gpScore = 2.0; }
                          else if (tot >= 33) { letterGrade = 'D'; gpScore = 1.0; }

                          addExamMark({
                            studentId: selectedStudentForExam,
                            studentName: foundStud.name,
                            className: foundStud.className,
                            roll: foundStud.roll,
                            examType: examType,
                            examName: examName,
                            subject: selectedSubject,
                            writtenMarks: writ,
                            mcqMarks: mcq,
                            totalMarks: tot,
                            grade: letterGrade,
                            gpa: gpScore
                          });

                          setWrittenMarksInput('');
                          setMcqMarksInput('');
                          setExamFormError('');
                          setExamSuccess(true);
                          setTimeout(() => setExamSuccess(false), 3000);
                        }}
                        className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs p-2.5 px-4 rounded-xl shadow cursor-pointer transition-all w-full"
                      >
                        ফলাফল রেজিস্ট্রি করুন
                      </button>
                    </div>
                  </div>
                </div>

                {/* History Database Display List */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-slate-50 p-4 border-b flex justify-between items-center shrink-0">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800">সর্বশেষ সাবমিটকৃত মার্কস শিট</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">রিয়েলটাইম পরীক্ষার মার্ক রেকর্ড ও ফলাফল ডেটা</p>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded leading-none">লাইভ ডাটাবেজ</span>
                  </div>

                  <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[350px]">
                    {examMarks.length === 0 ? (
                      <p className="text-center p-8 text-xs text-slate-400 font-semibold">কোনো পরীক্ষার নম্বর এখনও ডিক্লেয়ার করা হয়নি।</p>
                    ) : (
                      examMarks.map(em => (
                        <div key={em.id} className="p-3.5 flex justify-between items-center text-xs">
                          <div>
                            <span className={`text-[8px] font-bold uppercase rounded px-1.5 py-0.5 leading-none ${em.examType === 'Terminal' ? 'bg-indigo-100 text-indigo-800' : 'bg-sky-100 text-sky-800'}`}>{em.examType === 'Terminal' ? 'পার্বণিক' : 'মিডটার্ম'}</span>
                            <h5 className="font-bold text-slate-800 text-xs mt-1.5">{em.studentName} (শ্রেণী: {em.className})</h5>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{em.examName} • বিষয়: <span className="uppercase text-blue-900 font-bold">{em.subject}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-700 font-mono">লিখিত: {em.writtenMarks} | MCQ: {em.mcqMarks}</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">সর্বমোট: <span className="text-amber-600 font-black">{em.totalMarks}</span> (গ্রেড: <span className="text-blue-900 font-black">{em.grade}</span> | GPA: {em.gpa.toFixed(2)})</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. STATIONERY INVENTORY */}
          {activeTab === 'inventory' && (
            <div>
              <div className="border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-sm">স্কুল স্টেশনারি, বই ও বুক সাপ্লাই ইনভেন্টরি</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">স্টক শেষ হওয়ার পূর্বে নতুন বই বা পোশাক সরবরাহের স্টক আপডেট করতে পারবেন</p>
              </div>

              <div className="space-y-3">
                {stationery.map((item, idx) => (
                  <div key={item.id} className="p-3 border rounded-xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{item.category}</span>
                      <h4 className="font-bold text-slate-800 text-xs mt-1">{item.banglaName}</h4>
                      <p className="text-[10px] text-blue-900 font-bold mt-1">খুচরা মূল্য: ৳ {item.price}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block text-right font-mono">মজুদ সংখ্যা</span>
                        <span className={`font-mono font-bold ${item.stock < 50 ? 'text-rose-600' : 'text-slate-700'}`}>{item.stock} টি</span>
                      </div>

                      <div className="flex gap-1">
                        <button 
                          onClick={() => updateStationeryStock(item.id, 50)}
                          className="bg-blue-900 text-white font-bold text-[10px] px-2.5 py-1.5 rounded hover:bg-blue-800 cursor-pointer font-sans"
                        >
                          +৫০ টি যোগ করুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. ACADEMIC CERTIFICATES & TRANSCRIPTS PRINT */}
          {activeTab === 'docs' && (
            <div>
              <div className="border-b pb-3 mb-6">
                <div className="flex items-center gap-2 font-sans">
                  <Award className="h-5 w-5 text-blue-900" />
                  <h3 className="font-bold text-slate-800 text-sm">৬। প্রশংসাপত্র ও ট্রান্সক্রিপ্ট প্রিন্ট</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">শিক্ষার্থীর তথ্যের উপর ভিত্তি করে প্রাতিষ্ঠানিক রিপোর্ট কার্ড, ট্রান্সক্রিপ্ট, পরীক্ষার প্রবেশপত্র এবং প্রশংসাপত্র প্রিন্ট করুন।</p>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Configuration Control Panel Left */}
                <div className="w-full lg:w-72 shrink-0 bg-slate-50/50 border border-slate-200/80 p-4.5 rounded-2xl">
                  <h4 className="font-bold text-xs text-slate-800 mb-3 text-left">কনফিগারেশন কন্ট্রোল প্যানেল</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1 text-left font-sans">শিক্ষার্থী নির্বাচন করুন</label>
                      <select
                        value={selectedDocStudent}
                        onChange={e => setSelectedDocStudent(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-blue-900 focus:border-blue-900 text-left font-sans"
                      >
                        <option value="">নির্বাচন করুন...</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (শ্রেণী: {s.className})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1 text-left font-sans">ডকুমেন্ট ফরম্যাট নির্বাচন</label>
                      <div className="space-y-1">
                        {[
                          { id: 'transcript', label: 'একাডেমিক ট্রান্সক্রিপ্ট (মার্কশীট)' },
                          { id: 'admit', label: 'পরীক্ষার প্রবেশপত্র (Admit Card)' },
                          { id: 'testimonial', label: 'প্রশংসাপত্র (Commendation Letter)' },
                          { id: 'certificate', label: 'চারিত্রিক সার্টিফিকেট (Certificate)' },
                          { id: 'leaveslip', label: 'ছুটির রিসিভ স্লিপ (Leave Slip)' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setDocTemplateType(t.id as any)}
                            className={`w-full text-left rounded p-2 text-xs font-bold transition-all border cursor-pointer font-sans ${docTemplateType === t.id ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Display Canvas Right */}
                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 min-h-[400px] shadow-sm flex flex-col justify-between items-center animate-fadeIn font-sans" id="docs-generator-canvas">
                  {selectedDocStudent ? (() => {
                    const stud = students.find(s => s.id === selectedDocStudent);
                    if (!stud) return <p className="text-xs text-slate-400 font-bold">শিক্ষার্থী খুজে পাওয়া যায়নি!</p>;

                    // Renders Academic Transcripts
                    if (docTemplateType === 'transcript') {
                      const marks = examMarks.filter(m => m.studentId === stud.id);
                      const computedAvgGPA = marks.length > 0 ? marks.reduce((sum, m) => sum + m.gpa, 0) / marks.length : 0;
                      const computedFinalGrade = computedAvgGPA >= 5.0 ? 'A+' : computedAvgGPA >= 4.0 ? 'A' : computedAvgGPA >= 3.5 ? 'A-' : computedAvgGPA >= 3.0 ? 'B' : computedAvgGPA >= 2.0 ? 'C' : computedAvgGPA >= 1.0 ? 'D' : 'F';

                      return (
                        <div className="w-full text-left">
                          <div className="border-4 border-double border-slate-300 p-6 rounded-xl bg-white relative">
                            {/* Academic Seal background mockup */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[70px] select-none text-slate-100/30 uppercase font-black tracking-widest text-center pointer-events-none font-sans">
                              VERIFIED<br/>OFFICIAL
                            </div>
                            
                            <div className="text-center pb-4 border-b">
                              <h4 className="text-base font-black text-blue-955 uppercase font-sans">ডিলিকন মডেল একাডেমী ও রিসার্চ ইনস্টিটিউট</h4>
                              <p className="text-[10px] text-slate-500 font-medium font-sans">শ্রেণীভিত্তিক চূড়ান্ত প্রাতিষ্ঠানিক রিপোর্ট মেগা-কার্ড</p>
                              <h5 className="font-bold text-xs bg-slate-900 text-white rounded px-3 py-1 inline-block mt-3 select-none">একাডেমিক ট্রান্সক্রিপ্ট ও ফিসফাল</h5>
                            </div>

                            <div className="my-4 grid grid-cols-2 text-xs py-2 bg-slate-50 p-2.5 rounded-lg border">
                              <div>
                                <p className="text-slate-500 text-[10px] text-left">শিক্ষার্থীর বিবরণ</p>
                                <p className="font-black text-slate-900 text-sm mt-0.5 text-left">{stud.name}</p>
                                <p className="text-[10px] text-slate-600 font-medium text-left">শ্রেণী: {stud.className} | রোল: {stud.roll}</p>
                                <p className="text-[10px] text-slate-600 font-medium text-left">ইউনিক আইডি: STD-2026-{stud.id.replace('s', '')}</p>
                              </div>
                              <div className="text-right select-none">
                                <p className="text-slate-500 text-[10px]">শিক্ষা বছর ও সেমিস্টার</p>
                                <p className="font-extrabold text-blue-900 text-xs mt-0.5">একাডেমিক সেশন: ২০২৬</p>
                                <p className="text-[10px] text-slate-500 font-bold">সার্টিফিকেশন মেমো</p>
                              </div>
                            </div>

                            {/* Marksheet Table */}
                            <div className="overflow-x-auto mt-4 font-sans">
                              <table className="w-full text-left text-[11px] border-collapse">
                                <thead>
                                  <tr className="border-b bg-slate-100/70 text-slate-700">
                                    <th className="p-2 font-bold">বিষয় (Subject)</th>
                                    <th className="p-2 font-bold text-center">লিখিত (Written)</th>
                                    <th className="p-2 font-bold text-center">MCQ</th>
                                    <th className="p-2 font-bold text-center">মোট প্রাপ্ত নম্বর (Total)</th>
                                    <th className="p-2 font-bold text-center">গ্রেড (Grade)</th>
                                    <th className="p-2 font-bold text-center">জিপিএ (GPA)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {marks.length === 0 ? (
                                    <tr>
                                      <td colSpan={6} className="p-4 text-center text-slate-400 font-bold">কোন মাকিং ডেটা পাওয়া যায়নি</td>
                                    </tr>
                                  ) : (
                                    marks.map((m, mIdx) => (
                                      <tr key={mIdx} className="border-b hover:bg-slate-50">
                                        <td className="p-2 font-bold capitalize">{m.subject}</td>
                                        <td className="p-2 text-center font-mono">{m.writtenMarks}</td>
                                        <td className="p-2 text-center font-mono">{m.mcqMarks}</td>
                                        <td className="p-2 text-center font-mono font-bold text-slate-900">{m.totalMarks}</td>
                                        <td className="p-2 text-center font-bold text-blue-900">{m.grade}</td>
                                        <td className="p-2 text-center font-bold font-mono">{m.gpa.toFixed(2)}</td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                                {marks.length > 0 && (
                                  <tfoot>
                                    <tr className="bg-slate-50 font-bold">
                                      <td colSpan={4} className="p-2 text-right">গড় জিপিএ (Average GPA):</td>
                                      <td className="p-2 text-center text-emerald-700 text-xs font-black">{computedFinalGrade}</td>
                                      <td className="p-2 text-center font-mono font-black text-xs text-blue-900">{computedAvgGPA.toFixed(2)}</td>
                                    </tr>
                                  </tfoot>
                                )}
                              </table>
                            </div>

                            <p className="text-[10px] text-slate-450 mt-4 leading-relaxed text-left font-sans">
                              * বিশেষ নির্দেশাবলী: কার্ড সহ পরীক্ষার শুরুর ২০ মিনিট পূর্বে নির্ধারিত স্থানে উপস্থিত হতে হবে। ক্যালকুলেটর ব্যতীত অন্য কোনো ইলেক্ট্রনিক গ্যাজেট কঠোরভাবে নিষিদ্ধ। উল্লিখিত শিক্ষার্থীর চারিত্রিক আচরণ অত্যন্ত সন্তোষজনক ও গঠনমূলক। মেধা কার্ড সংগ্রহ পূর্বক ভর্তি রিকুইজিশন স্লিপ বা প্রশংসাপত্রের জন্য এই ট্রান্সক্রিপ্ট মেমোটি ব্যবহার করা যাবে।
                            </p>
                          </div>
                        </div>
                      );
                    }

                    // Admit Card
                    if (docTemplateType === 'admit') {
                      return (
                        <div className="w-full text-left">
                          <div className="border-4 border-dashed border-blue-200 p-6 rounded-xl bg-white relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[50px] select-none text-blue-50/40 uppercase font-black tracking-widest text-center pointer-events-none">
                              ADMIT CARD
                            </div>

                            <div className="text-center pb-4 border-b border-slate-200">
                              <h4 className="text-base font-black text-blue-950 uppercase">{schoolName || 'ডিলিকন মডেল একাডেমী'}</h4>
                              <p className="text-[10px] text-slate-500 font-medium">বার্ষিক/চূড়ান্ত মূল্যায়ন পরীক্ষা - ২০২৬</p>
                              <h5 className="font-extrabold text-xs bg-slate-950 text-white rounded px-3 py-1 inline-block mt-3 select-none">পরীক্ষার প্রবেশপত্র (OFFICIAL ADMIT CARD)</h5>
                            </div>

                            <div className="my-4 grid grid-cols-2 text-xs py-2 bg-slate-50 p-2.5 rounded-lg border">
                              <div className="text-left font-sans">
                                <p className="text-slate-500 text-[9px] uppercase tracking-wide">পরীক্ষার্থীর বিবরণী</p>
                                <p className="font-black text-slate-900 text-sm mt-0.5">{stud.name}</p>
                                <p className="text-[10px] text-slate-600 font-semibold mt-0.5">শ্রেণী: {stud.className} | রোল: {stud.roll}</p>
                                <p className="text-[10px] text-slate-600 font-semibold">আইডি: STD-2026-{stud.id.replace('s', '')}</p>
                              </div>
                              <div className="text-right flex flex-col justify-between items-end font-sans">
                                <div>
                                  <p className="text-slate-500 text-[9px] uppercase tracking-wide">স্ট্যাটাস ও ভেরিফিকেশন</p>
                                  <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 inline-block mt-0.5 select-none animate-pulse">অনুমোদিত (APPROVED) ✅</span>
                                </div>
                                <p className="text-[9.5px] text-slate-500 font-bold font-mono">ইস্যু তারিখ: {new Date().toISOString().split('T')[0]}</p>
                              </div>
                            </div>

                            <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100/40 mt-3 text-[10px] text-slate-600 leading-relaxed text-left space-y-1">
                              <p className="font-bold text-blue-900">🔔 বিশেষ নির্দেশাবলী:</p>
                              <p>১. প্রবেশপত্র সহ পরীক্ষার শুরুর ২০ মিনিট পূর্বে নির্ধারিত আসনে অবশ্যই উপস্থিত হতে হবে।</p>
                              <p>২. ক্যালকুলেটর বা পরীক্ষা পরিপন্থি অন্য কোনো ইলেকট্রনিক গ্যাজেট কক্ষের ভিতর আনা কঠোরভাবে নিষিদ্ধ।</p>
                              <p>৩. পরীক্ষার হল পরিদর্শকের প্রতিটি নির্দেশনা কঠোরভাবে মেনে চলতে হবে।</p>
                            </div>

                            <div className="mt-8 flex justify-between items-end border-t pt-4">
                              <div className="text-center w-28 border-t border-slate-200 mt-2 text-[9px] font-bold text-slate-500 uppercase font-mono">স্বাক্ষর অভিভাবক</div>
                              <div className="text-center w-28 border-t border-slate-200 mt-2 text-[9px] font-bold text-slate-500 uppercase font-mono">পরীক্ষা নিয়ন্ত্রক</div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Testimonial
                    if (docTemplateType === 'testimonial') {
                      return (
                        <div className="w-full">
                          <div className="border-8 border-slate-200 p-8 rounded-xl bg-white relative text-slate-800 leading-relaxed text-center font-serif">
                            <span className="text-[9px] font-mono font-bold text-slate-400 block tracking-widest uppercase mb-4">COMMENDATION RESCRIPT TESTIMONIAL</span>
                            
                            <h4 className="text-base font-black uppercase text-blue-950 font-serif leading-none mb-1">ডিলিকন মডেল একাডেমী</h4>
                            <p className="text-[10px] text-slate-450 font-sans tracking-wide font-sans">মিরপুর-১০, ঢাকা-১২১৬ • স্থাপিত: ২০২২ খ্রিঃ</p>
                            
                            <div className="w-12 border-b-2 border-amber-500 mx-auto my-4"></div>

                            <h5 className="font-bold italic text-sm text-slate-800 my-3">প্রশংসাপত্র (Testimonial Commendation)</h5>

                            <p className="text-xs text-justify font-normal mt-4 text-slate-700 leading-relaxed indent-8 font-sans">
                              এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <span className="font-bold text-slate-900">{stud.name}</span>, অভিভাবক: <span className="font-bold text-slate-900">{stud.guardianName}</span>, মিরপুর ডিলিকন স্কুল ও রিসার্স মডেল একাডেমীর <span className="font-bold text-slate-900">{stud.className}</span> শ্রেণীতে অধ্যয়নরত আছে। তাহার শ্রেণী রোল নম্বর <span className="font-bold text-slate-900">{stud.roll}</span> এবং তাহার প্রাতিষ্ঠানিক রেজিস্ট্রি আইডি নম্বর <span className="font-bold text-slate-900">STD-2026-{stud.id.replace('s', '')}</span>। আমাদের জানামতে সে একজন অত্যন্ত বিনয়ী, মেধাবী ও চরিত্রবান শিক্ষার্থী। তাহার ক্লাসের উপস্থিতির রেকর্ড শতকরা <span className="font-bold text-slate-900">{stud.attendancePct}%</span> যাহা অত্যন্ত সন্তোষজনক।
                            </p>
                            <p className="text-xs text-justify font-normal mt-3 text-slate-700 leading-relaxed indent-8 font-sans">
                              আমি তাহার জীবনের সর্বাঙ্গীন উন্নতি ও ভবিষ্যৎ শুভ শিক্ষাজীবনের সার্বিক সফলতা কামনা করিতেছি।
                            </p>

                            <div className="mt-10 flex justify-between items-end text-[10px] font-bold text-slate-500 uppercase font-mono">
                              <div>তারিখ: {new Date().toISOString().split('T')[0]}</div>
                              <div className="text-center w-36 border-t pt-1.5 border-slate-200">
                                <span className="text-slate-800 font-black block">অধ্যক্ষের কার্যালয়</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Certificate
                    if (docTemplateType === 'certificate') {
                      return (
                        <div className="w-full">
                          <div className="border-12 border-slate-300 p-8 rounded-xl bg-orange-50/10 text-slate-850 text-center relative font-serif">
                            <span className="text-[10px] font-sans font-bold text-amber-700 block tracking-widest uppercase mb-4">CERTIFICATE OF EXCELLENCE</span>
                            
                            <h4 className="text-lg font-black uppercase text-blue-955 leading-tight">ডিলিকন মডেল একাডেমী</h4>
                            <p className="text-[10px] font-sans text-slate-500 mt-1 uppercase tracking-wider">ESTABLISHED MIRPUR EDUCATIONAL BOARD DISTRICT</p>

                            <h5 className="font-bold text-sm italic text-amber-900 my-4 font-sans">চারিত্রিক ও মেধা সার্টিফিকেট</h5>

                            <p className="text-xs mt-4 text-slate-700 leading-loose font-sans font-medium">
                              অত্যন্ত আনন্দের সাথে স্বীকৃতি প্রদান করা যাইতেছে যে, <span className="font-bold text-slate-950 text-sm">{stud.name}</span> শ্রেণি রোল: <span className="font-bold text-slate-950">{stud.roll}</span> (শ্রেণী: {stud.className}) অত্যন্ত সফলতার সাথে একাডেমীর সুশৃঙ্খল চারিত্রিক নিয়মাবলী অনুসরণ করিয়া মেধা তালিকায় বিশেষ কৃতিত্ব অর্জন করিয়াছে। তাহার সুন্দর চরিত্র ও শিক্ষাবিকাশ আমাদের মুখ উজ্জ্বল করিয়াছে।
                            </p>

                            <div className="mt-8 flex justify-between items-end text-[10px] font-medium font-sans text-slate-500">
                              <div>তারিখ: {new Date().toISOString().split('T')[0]}</div>
                              <div className="text-center w-36 border-t pt-1 border-slate-200 uppercase font-mono font-bold text-slate-800">
                                অধ্যক্ষের রেসক্রিপ্ট
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Leave Slip
                    if (docTemplateType === 'leaveslip') {
                      return (
                        <div className="w-full font-sans text-left">
                          <div className="border border-dashed border-red-300 bg-red-50/10 p-5 rounded-xl">
                            <h4 className="text-xs font-extrabold text-red-900 uppercase flex items-center gap-1">
                              <span>🎟️</span>
                              শিক্ষার্থী ছুটির মঞ্জুরিপত্র (OFFICIAL LEAVE SLIP)
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">গেইট সিকিউরিটির পাঞ্চ আউটের জন্য অনুমোদিত ফর্ম</p>

                            <div className="mt-4 space-y-2 text-xs text-slate-700">
                              <p>শিক্ষার্থীর বিবরণ: <span className="font-bold text-slate-900">{stud.name}</span> (শ্রেণী: {stud.className} | রোল: {stud.roll})</p>
                              <p>ছুটির ধরণ: <span className="font-bold text-amber-800">অর্ধ-দিবস লিজ ছুটি (Half-Day Approved Leave)</span></p>
                              <p>অভিভাবকের ফোন: <span className="font-mono font-bold text-slate-800">{stud.guardianPhone}</span></p>
                              <p>অনুমোদনের মেমো: <span className="font-mono text-slate-500">LEAVE-REF-2026-{stud.id.replace('s', '')}</span></p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-500 font-bold font-mono">
                              <span>তারিখ: {new Date().toISOString().split('T')[0]}</span>
                              <span className="text-red-700 font-extrabold">APPROVED BY ADVISOR</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })() : (
                    <div className="text-center font-bold text-slate-400 flex flex-col justify-center items-center h-48 w-full">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                      বা পাশের কনফিগারেশন প্যানেল থেকে শিক্ষার্থী নির্বাচন করলে অফিসিয়াল ডকুমেন্ট ও ট্রান্সক্রিপ্ট ভিউ দৃশ্যমান হবে
                    </div>
                  )}

                  {selectedDocStudent && (
                    <div className="mt-6 w-full flex justify-end gap-2 shrink-0 select-none">
                      <button
                        onClick={() => window.print()}
                        className="bg-slate-950 text-white font-bold text-xs p-2.5 px-4 rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-all cursor-pointer shadow"
                      >
                        <Printer className="h-4 w-4 text-amber-400" />
                        ডকুমেন্ট প্রিন্ট করুন
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 7. CENTRAL REQUISITION APPROVAL CHAMBER */}
          {activeTab === 'requisitions' && (
            <div>
              <div className="border-b pb-3 mb-6 font-sans">
                <h3 className="font-bold text-slate-800 text-sm font-sans">৭। ভর্তি ও শিক্ষক নিয়োগ রিকুইজিশন অনুমোদন হাব</h3>
                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">সহকারী পরিচালক ও অধ্যক্ষের ডাবল-সাইন ভেরিফিকেশন দ্বারা অনলাইন ভর্তি ও শিক্ষক নিয়োগ আবেদন ভেরিফাই ও সক্রিয় করুন</p>
              </div>

              <div className="space-y-4 font-sans">
                {requisitions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-bold">বর্তমানে কোনো সচল ভর্তি আবেদন বা শিক্ষক নিয়োগ রিকুইজিশন নেই।</p>
                  </div>
                ) : (
                  requisitions.map((req) => (
                    <div key={req.id} className="p-5 border rounded-2xl bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-slate-200 shadow-sm hover:shadow-md transition-all">
                      <div className="text-left font-sans">
                        <div className="flex flex-wrap items-center gap-1.5 justify-start">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                            req.type === 'Admission' ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                          }`}>
                            {req.type === 'Admission' ? 'ভর্তি আবেদন' : 'নিয়োগ আবেদন'}
                          </span>
                          
                          {/* Rich Badge according to state */}
                          {req.status === 'Pending Payment' && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold">পেমেন্ট পেন্ডিং</span>
                          )}
                          {req.status === 'Paid (Pending Assistant Approval)' && (
                            <span className="text-[9px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-extrabold">সহকারী পরিচালক পেন্ডিং</span>
                          )}
                          {req.status === 'Assistant Approved (Pending Principal Approval)' && (
                            <span className="text-[9px] bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-extrabold">অধ্যক্ষ অনুমোদন পেন্ডিং ✍️</span>
                          )}
                          {req.status === 'Principal Approved' && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">চূড়ান্ত অনুমোদিত ও সক্রিয় ✅</span>
                          )}
                          {req.status === 'Rejected' && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-extrabold">বাতিলকৃত (Rejected)</span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-slate-800 text-xs mt-2.5">
                          আবেদনকারী: <span className="text-slate-900 font-extrabold">{req.applicantName}</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                          শ্রেণী/পোস্ট: <span className="font-mono font-bold text-slate-700">{req.classNameOrPost}</span> | ফোন: <span className="font-mono">{req.phone}</span> | তারিখ: {req.subDate}
                        </p>
                        
                        <div className="bg-slate-50 p-2.5 border border-slate-150 rounded-xl mt-2 text-[10px] text-slate-600 font-semibold max-w-lg leading-relaxed text-left">
                          আবেদনের বিস্তারিত: "{req.details}"
                        </div>

                        {req.moneyReceiptNo && (
                          <p className="text-[9.5px] font-bold text-amber-700 mt-1.5 bg-amber-50 rounded px-2 py-0.5 w-fit font-mono">
                            রশিদ নম্বর: {req.moneyReceiptNo}
                          </p>
                        )}

                        {req.idCardNo && (
                          <p className="text-[9.5px] font-bold text-emerald-700 mt-1.5 bg-emerald-50 rounded px-2 py-0.5 w-fit font-mono">
                            সিস্টেম জেনারেটেড আইডি: {req.idCardNo}
                          </p>
                        )}

                        {req.rejectionComments && (
                          <p className="text-[9.5px] font-semibold text-rose-700 mt-1.5 bg-rose-50 rounded px-2 py-0.5 w-fit">
                            বাতিলকরণের কারণ: {req.rejectionComments}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0 w-full md:w-auto mt-4 md:mt-0 flex flex-col items-start md:items-end font-semibold font-sans">
                        <p className="text-[10px] text-slate-400 block font-mono">আবেদন ফি</p>
                        <p className="text-lg font-black text-blue-900 mt-0.5">৳ {req.paymentAmount ? req.paymentAmount.toLocaleString() : '500'}</p>

                        <div className="mt-3 flex flex-wrap gap-1.5 justify-start md:justify-end">
                          {/* Manual payment acceptance if pending */}
                          {req.status === 'Pending Payment' && (
                            <button
                              onClick={() => {
                                receiveRequisitionPayment(req.id, "MR-" + Math.floor(Math.random() * 90000 + 10000));
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                            >
                              ৳৫০০ পেমেন্ট নিশ্চিত করুন
                            </button>
                          )}

                          {/* Assistant Approval trigger */}
                          {req.status === 'Paid (Pending Assistant Approval)' && (
                            <button
                              onClick={() => {
                                approveRequisitionByAssistant(req.id);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded transition-all cursor-pointer shadow-sm"
                            >
                              সহকারী পরিচালক অনুমোদন
                            </button>
                          )}

                          {/* Principal Approval trigger */}
                          {req.status === 'Assistant Approved (Pending Principal Approval)' && (
                            <button
                              onClick={() => {
                                approveRequisitionByPrincipal(req.id);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded transition-all cursor-pointer shadow-sm flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" />
                              প্রধান অধ্যক্ষ অনুমোদন
                            </button>
                          )}

                          {/* Reject trigger */}
                          {(req.status === 'Pending Payment' || req.status === 'Paid (Pending Assistant Approval)' || req.status === 'Assistant Approved (Pending Principal Approval)') && (
                            <button
                              onClick={() => {
                                const comments = prompt('বাতিলকরণের কারণ/মন্তব্য লিখুন:');
                                if (comments !== null) {
                                  rejectRequisition(req.id, comments);
                                }
                              }}
                              className="bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] px-2.5 py-1.5 rounded hover:bg-rose-100 transition-all cursor-pointer"
                            >
                              বাতিল করুন
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 8. LANDING SECTION VISIBILITY CUSTOMIZER */}
          {activeTab === 'sections' && (
            <div>
              <div className="border-b pb-3 mb-6 font-sans">
                <h3 className="font-bold text-slate-800 text-sm">ওয়েবসাইট ল্যান্ডিং পেজ সেকশন কাস্টমাইজার 🎨</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">হোম পেজের প্রতিটি সেকশন দৃশ্যমান বা অদৃশ্য করুন এবং শিরোনাম বাংলা বা ইংরেজিতে এডিট করুন</p>
              </div>

              {/* Easy Navigation Sub-tabs */}
              <div className="flex flex-wrap gap-2 mb-6 border-b pb-4 font-sans select-none">
                {[
                  { id: 'merit', label: '১। কৃতি শিক্ষার্থী আপলোড হাব 🏆', icon: Award, color: 'text-amber-500 bg-amber-50' },
                  { id: 'visibility', label: '২। সেকশন দৃশ্যমান/লুকানো (Visibility)', icon: Layers, color: 'text-indigo-600 bg-indigo-50' },
                  { id: 'branding', label: '৩। ব্রান্ডিং (নাম, স্লোগান ও লগো)', icon: Star, color: 'text-blue-600 bg-blue-50/50' },
                  { id: 'slider', label: '৪। স্লাইডার গ্যালারি আপলোডার', icon: Image, color: 'text-emerald-600 bg-emerald-50' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSectionsSubTab(sub.id as any);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all border cursor-pointer ${
                      sectionsSubTab === sub.id
                        ? 'bg-blue-900 text-white border-blue-900 shadow-md scale-[1.01]'
                        : 'bg-white text-slate-705 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                    }`}
                  >
                    <sub.icon className={`h-4 w-4 shrink-0 ${sectionsSubTab === sub.id ? 'text-amber-300 animate-pulse' : 'text-slate-500'}`} />
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>

              {sectionsSubTab === 'visibility' && (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm font-sans animate-fadeIn">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 select-none font-bold">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">ওয়েবসাইট টেমপ্লেট সেকশনসমূহ নিয়ন্ত্রণ প্যানেল</h4>
                    <p className="text-[9px] text-slate-400 mt-1">সব পরিবর্তন সাথে সাথে লাইভ সেভ হবে এবং সাইট রিলোড ছাড়াই দৃশ্যমান হবে</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetSections();
                      }}
                      className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <RefreshCw className="h-3 w-3 shrink-0" />
                      সেকশনসমূহ রিসেট করুন 🔁
                    </button>
                    <span className="text-[9px] bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-black font-mono">WYSIWYG ACTIVE</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {sections.map((sec) => (
                    <div key={sec.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="max-w-md text-left">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none font-sans">SECTION MODULE = {sec.id}</span>
                        <h5 className="font-extrabold text-slate-800 text-xs mt-2 font-sans">বর্তমান শিরোনাম: {sec.title}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-sans">আইডি কোড: <span className="font-mono bg-slate-50 px-1 py-0.5 border rounded">{sec.id}</span></p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                        {/* Title Editor */}
                        <div className="flex flex-col text-left font-sans">
                          <label className="text-[9px] font-bold text-slate-600 block mb-1">শিরোনাম এডিট করুন</label>
                          <input 
                            type="text"
                            value={sec.title || ''}
                            onChange={(e) => {
                              updateSectionSetting(sec.id, e.target.value, sec.visible);
                            }}
                            placeholder="যেমন: কৃতি শিক্ষার্থী"
                            className="rounded border border-slate-200 bg-white p-1.5 px-2.5 text-xs font-semibold focus:outline-blue-900 min-w-[200px]"
                          />
                        </div>

                        {/* Visibility toggles */}
                        <div className="flex flex-col text-left font-sans">
                          <label className="text-[9px] font-bold text-slate-600 block mb-1">ভিজিবিলিটি</label>
                          <div className="flex gap-1 h-[34px] items-center">
                            <button
                              type="button"
                              onClick={() => {
                                updateSectionSetting(sec.id, sec.title, true);
                              }}
                              className={`flex-1 sm:flex-none uppercase text-[9px] font-black h-full px-3 rounded flex items-center gap-1 shadow-sm transition-all border cursor-pointer ${sec.visible ? 'bg-emerald-600 text-white border-emerald-600 font-bold scale-[1.02]' : 'bg-white text-slate-705 border-slate-200 hover:bg-slate-50'}`}
                            >
                              <Check className="h-3.5 w-3.5" />
                               দৃশ্যমান
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateSectionSetting(sec.id, sec.title, false);
                              }}
                              className={`flex-1 sm:flex-none uppercase text-[9px] font-black h-full px-3 rounded flex items-center gap-1 shadow-sm transition-all border cursor-pointer ${!sec.visible ? 'bg-rose-600 text-white border-rose-600 font-bold scale-[1.02]' : 'bg-white text-slate-705 border-slate-200 hover:bg-slate-50'}`}
                            >
                              <X className="h-3.5 w-3.5" />
                              লুকানো
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {sectionsSubTab === 'branding' && (
                <div className="mt-4 font-sans animate-fadeIn">
                  {/* 1. BRANDING EDITOR CARD */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm font-sans animate-fadeIn">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center select-none font-bold">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800">১। স্কুল নাম, স্লোগান ও লোগো কাস্টমাইজেশন এডিটর 🏫</h4>
                      <p className="text-[9px] text-slate-400 mt-1">লোগো পরিবর্তনের ক্ষেত্রে টেক্সট, ক্রিস্ট ইমোজি অথবা ইমেজ লিঙ্ক ব্যবহার করা যাবে</p>
                    </div>
                    {brandingSuccess ? (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black font-mono">SAVED SUCCESSFULLY ✅</span>
                    ) : (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black font-mono">UNSAVED CHANGES ⚠️</span>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* School Name */}
                      <div className="text-left">
                        <label className="text-xs font-bold text-slate-700 block mb-1">স্কুলের নাম (School Name)</label>
                        <input
                          type="text"
                          value={editSchoolName}
                          onChange={(e) => {
                            setEditSchoolName(e.target.value);
                            setBrandingSuccess(false);
                          }}
                          placeholder="যেমন: ডিলিকন মডেল একাডেমী"
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs font-semibold focus:outline-blue-900"
                        />
                      </div>

                      {/* School Slogan */}
                      <div className="text-left">
                        <label className="text-xs font-bold text-slate-700 block mb-1">স্লোগান (Slogan)</label>
                        <input
                          type="text"
                          value={editSchoolSlogan}
                          onChange={(e) => {
                            setEditSchoolSlogan(e.target.value);
                            setBrandingSuccess(false);
                          }}
                          placeholder="যেমন: নৈতিক ও আধুনিক শিক্ষার সূতিকাগার"
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs font-semibold focus:outline-blue-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Logo Type Selector */}
                      <div className="text-left col-span-1">
                        <label className="text-xs font-bold text-slate-700 block mb-1">লোগো টাইপ (Logo Type)</label>
                        <div className="flex gap-2">
                          {(['crest', 'text', 'image'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setEditLogoType(t);
                                if (t === 'crest' && !editLogoVal) setEditLogoVal('🏫');
                                setBrandingSuccess(false);
                              }}
                              className={`flex-1 text-[10px] font-bold py-1.5 rounded cursor-pointer transition-all border ${editLogoType === t ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                            >
                              {t === 'crest' ? '🏫 ক্রিস্ট/ইমোজি' : t === 'text' ? '✍️ টেক্সট লোগো' : '🖼️ ইমেজ ইউআরএল'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Logo Value input */}
                      <div className="text-left col-span-1">
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {editLogoType === 'crest' ? 'ইমোজি / সিম্বল (Emoji Symbol)' : editLogoType === 'text' ? 'লোগো শর্টকোড (Max 3 chars)' : 'ইমেজ ইউআরএল (Logo Image URL)'}
                        </label>
                        <input
                          type="text"
                          value={editLogoVal}
                          onChange={(e) => {
                            setEditLogoVal(e.target.value);
                            setBrandingSuccess(false);
                          }}
                          placeholder={editLogoType === 'crest' ? '🏫' : editLogoType === 'text' ? 'D' : 'https://example.com/logo.png'}
                          className="w-full rounded border border-slate-200 bg-white p-2 text-xs font-semibold focus:outline-blue-900"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          updateSchoolBranding(editSchoolName, editSchoolSlogan, editLogoType, editLogoVal);
                          setBrandingSuccess(true);
                        }}
                        className="bg-indigo-900 hover:bg-indigo-805 text-white font-extrabold text-[11px] py-1.5 px-6 rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" /> ব্র্যান্ডিং তথ্য সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {sectionsSubTab === 'slider' && (
                <div className="mt-4 font-sans animate-fadeIn">
                  {/* Connection Status & Sync Troubleshooting Assistant Banner */}
                  <div className="mb-5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 bg-blue-500/10 rounded-xl border border-blue-300 flex items-center justify-center shrink-0 text-blue-700 animate-pulse">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 leading-none">
                          <span>মন ছুঁয়ে যায় মুগ্ধতায় (ক্যাম্পাস স্লাইডার) গ্লোবাল ক্লাউড সিঙ্ক:</span>
                          <span className="text-blue-700 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">সংযুক্ত ও সক্রিয় (LIVE)</span>
                        </h4>
                        <p className="text-[10.5px] text-slate-650 mt-1 sm:max-w-xl leading-relaxed font-sans">
                          আপনার নতুন বা পুরাতন যেকোনো ডিভাইস থেকে ক্যাম্পাসের স্লাইড ছবি যোগ বা আপডেট করলে তা সরাসরি ক্লাউড ডাটাবেজে চিরতরে জমা থাকে। ছবি সেভ করার পর অন্য কোনো ডিভাইসে ক্যাশ মেমরির জন্য ছবি লোড হতে দেরি হলে এই বাটনটি চাপুন, এটি ক্যাশ মেমরি পরিষ্কার করে সরাসরি ক্লাউড ডাটাবেজ থেকে আসল ছবি আপনার স্ক্রিনে রেন্ডার করবে।
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("আপনি কি নতুন আপলোড করা ক্যাম্পাস স্লাইডারের ছবি ও তথ্য অন্য যেকোনো ডিভাইসের ব্রাউজার ক্যাশ বাইপাস করে সরাসরি ক্লাউড ডেটাবেজ থেকে রিলোড করতে চান?")) {
                          window.location.href = window.location.pathname + '?t=' + Date.now();
                        }
                      }}
                      className="w-full sm:w-auto shrink-0 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 font-bold text-[10.5px] px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 select-none hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5 text-blue-900 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4.5h-.21M4 9h5M4 9a8.001 8.001 0 0115.356-2" />
                      </svg>
                      ক্লিন রিলোড ও সুনিশ্চিত করুন 🔄
                    </button>
                  </div>

                  {/* 2. SLIDER GALLERY EDITOR CARD */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center select-none font-bold">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800">২। স্লাইডার গ্যালারি ইমেজ কন্ট্রোলার ও মাল্টিপল আপলোডার 🖼️</h4>
                      <p className="text-[9px] text-slate-400 mt-1">ল্যান্ডিং পেজ স্লাইডারে সর্বোচ্চ সংখ্যক ছবি যোগ করতে পারবেন, ছবির ইউআরএল এডিট বা পেস্ট করুন</p>
                    </div>
                    {photosSuccess ? (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black font-mono">SLIDES SAVED LIVE ✅</span>
                    ) : (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black font-mono">UNSAVED SLIDES ({editPhotos.length}) ⚠️</span>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Slides Grid list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editPhotos.map((slide, sIdx) => {
                        const isBase64 = slide.url?.startsWith('data:image/');
                        const currentTab = slidePhotoSourceTab[sIdx] || (isBase64 ? 'upload' : 'url');

                        return (
                          <div key={sIdx} className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 space-y-3 relative flex flex-col text-left">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editPhotos.filter((_, i) => i !== sIdx);
                                setEditPhotos(updated);
                                setPhotosSuccess(false);
                              }}
                              className="absolute top-2 right-2 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-350/50 p-1.5 rounded-lg transition-all bg-white shadow-sm cursor-pointer z-10"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            <div className="flex gap-3">
                              {/* Slide Number Accent */}
                              <span className="text-[10px] bg-blue-900 text-white font-extrabold h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                                {sIdx + 1}
                              </span>
                              <div className="flex-1">
                                <h5 className="font-bold text-xs text-slate-800 leading-tight">স্লাইড {sIdx + 1} বিবরণী ও ছবি</h5>
                                <p className="text-[8.5px] text-slate-400 mt-0.5 font-sans">কম্পিউটার থেকে ছবি আপলোড করতে পারেন অথবা সরাসরি লিংক বসাতে পারেন</p>
                              </div>
                            </div>

                            {/* Dual-Mode Uploader Switch for Campus slides */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase text-slate-700 font-sans tracking-wide">ছবির উৎস (Photo Source)</span>
                                {slide.url && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...editPhotos];
                                      updated[sIdx] = { ...updated[sIdx], url: '' };
                                      setEditPhotos(updated);
                                      setPhotosSuccess(false);
                                    }}
                                    className="text-[8.5px] text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 font-extrabold px-1.5 py-0.5 rounded transition-all cursor-pointer border border-rose-200"
                                  >
                                    ছবি রিমুভ (Reset)
                                  </button>
                                )}
                              </div>

                              <div className="flex bg-slate-100 p-0.5 rounded-lg gap-0.5 border border-slate-200 text-[8.5px] font-black select-none font-sans">
                                <button
                                  type="button"
                                  onClick={() => setSlidePhotoSourceTab(prev => ({ ...prev, [sIdx]: 'url' }))}
                                  className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${currentTab === 'url' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-850'}`}
                                >
                                  🌐 ওয়েব লিংক (URL)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSlidePhotoSourceTab(prev => ({ ...prev, [sIdx]: 'upload' }))}
                                  className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${currentTab === 'upload' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-850'}`}
                                >
                                  📂 ফাইল আপলোড
                                </button>
                              </div>

                              {/* Thumbnail preview inside switcher widget */}
                              <div className="w-full h-24 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center">
                                {slide.url ? (
                                  <img 
                                    src={slide.url} 
                                    alt={`Preview Slide ${sIdx + 1}`} 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentNode as HTMLDivElement;
                                      while (parent.childNodes.length > 1) {
                                        parent.removeChild(parent.lastChild!);
                                      }
                                      const msg = document.createElement('span');
                                      msg.innerText = '❌ Invalid or Broken Image Link';
                                      msg.className = 'text-[9px] text-rose-500 font-bold p-1 bg-white/90 rounded';
                                      parent.appendChild(msg);
                                    }}
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                                    <Image className="h-5 w-5 text-slate-350 animate-pulse" />
                                    <span className="text-[8px] mt-0.5 text-slate-400 font-black font-sans leading-none">কোনো ছবি নেই</span>
                                  </div>
                                )}
                              </div>

                              {currentTab === 'url' ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={slide.url?.startsWith('data:') ? '' : (slide.url || '')}
                                    onChange={(e) => {
                                      const updated = [...editPhotos];
                                      updated[sIdx] = { ...updated[sIdx], url: e.target.value };
                                      setEditPhotos(updated);
                                      setPhotosSuccess(false);
                                    }}
                                    placeholder="এখানে সরাসরি ছবির ওয়েব URL লিংক পেস্ট করুন..."
                                    className="w-full rounded shadow-xs border border-slate-200 bg-white p-1 text-[11px] focus:border-blue-900 focus:outline-none placeholder:text-slate-450 text-slate-850"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="relative border border-dashed border-slate-350 rounded-lg hover:border-slate-500 transition-colors p-2 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer">
                                    <Upload className="h-4 w-4 text-slate-500 mb-0.5 animate-bounce" />
                                    <span className="text-[8px] font-black text-slate-700 font-sans">ক্লিক করে স্লাইড ফাইল আপলোড করুন</span>
                                    <span className="text-[7px] text-slate-450 font-sans leading-none">অটো ৩KB-১৫KB-তে অপ্টিমাইজড হবে</span>
                                    <input 
                                      id={`file-upload-slide-${sIdx}`}
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const base64 = await compressImage(file, 640, 400, 0.5);
                                          if (base64) {
                                            const updated = [...editPhotos];
                                            updated[sIdx] = { ...updated[sIdx], url: base64 };
                                            setEditPhotos(updated);
                                            setPhotosSuccess(false);
                                          }
                                        }
                                      }}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Text Inputs */}
                            <div className="space-y-1.5">
                              <div>
                                <label className="text-[8.5px] font-extrabold text-slate-650 block mb-0.5 font-sans"> শিরোনাম (Slide Title) </label>
                                <input
                                  type="text"
                                  value={slide.title}
                                  onChange={(e) => {
                                    const updated = [...editPhotos];
                                    updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                                    setEditPhotos(updated);
                                    setPhotosSuccess(false);
                                  }}
                                  placeholder="স্লাইড এর মূল শিরোনাম"
                                  className="w-full rounded border border-slate-200 bg-white p-1 text-[11px] font-semibold focus:outline-blue-900 focus:border-blue-900"
                                />
                              </div>

                              <div>
                                <label className="text-[8.5px] font-extrabold text-slate-650 block mb-0.5 font-sans"> সংক্ষিপ্ত বর্ণনা (Slide Caption / Details) </label>
                                <textarea
                                  value={slide.caption}
                                  onChange={(e) => {
                                    const updated = [...editPhotos];
                                    updated[sIdx] = { ...updated[sIdx], caption: e.target.value };
                                    setEditPhotos(updated);
                                    setPhotosSuccess(false);
                                  }}
                                  placeholder="স্লাইডের বিস্তারিত বর্ণনা..."
                                  rows={2}
                                  className="w-full rounded border border-slate-205 bg-white p-1 text-[11px] font-semibold focus:outline-blue-900 resize-none font-sans"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add blank slide and Save bar */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100 justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newSlide = {
                            url: '',
                            title: 'নতুন ক্যাম্পাস ছবির রূপালী শিরোনাম 🌸',
                            caption: 'এই নতুন স্লাইডটি ল্যান্ডিং পেজে গ্যালারি কালেকশনে যুক্ত হয়েছে। এর আকর্ষণীয় বিবরণ এখানে লিখুন।'
                          };
                          setEditPhotos([...editPhotos, newSlide]);
                          setPhotosSuccess(false);
                        }}
                        className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-extrabold text-[11px] py-2 px-5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Plus className="h-4 w-4" /> আরও একটি স্লাইড ছবি যুক্ত করুন
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateCampusPhotos(editPhotos);
                          setPhotosSuccess(true);
                          setTimeout(() => {
                            setPhotosSuccess(false);
                          }, 5000);
                        }}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-650 text-white font-extrabold text-[11px] py-2 px-8 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" /> স্লাইডারের সকল ছবি সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {sectionsSubTab === 'merit' && (
                <div className="mt-4 font-sans animate-fadeIn">
                  {/* Connection Status & Sync Troubleshooting Assistant Banner */}
                  <div className="mb-5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 bg-emerald-500/10 rounded-xl border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-700 animate-pulse">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 leading-none">
                          <span>ডিলিকন গ্লোবাল ক্লাউড সিঙ্ক স্ট্যাটাস:</span>
                          <span className="text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">সংযুক্ত ও নিরাপদ (ONLINE)</span>
                        </h4>
                        <p className="text-[10px] text-slate-600 mt-1 sm:max-w-xl leading-relaxed">
                          আপনার পিসি, ল্যাপটপ বা নতুন যেকোনো ডিভাইস থেকে কৃতি শিক্ষার্থীদের তথ্য বা ছবি আপলোড করলে তা চিরদিনের জন্য আমাদের মূল ক্লাউড সার্ভারে সুরক্ষিত থাকে। ক্যাশ মেমোরির জটিলতায় অন্য ডিভাইসে ছবি সাথে সাথে ম্যাচ না করলে ডানপাশের বাটনটি দিয়ে ক্যাশ রিফ্রেশ করে সরাসরি সার্ভার থেকে ডেটা লোড করুন।
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("আপনি কি নতুন আপলোড করা ছবি ও তথ্য অন্য যেকোনো ডিভাইসের ব্রাউজার ক্যাশ বাইপাস করে সরাসরি ক্লাউড ডেটাবেজ থেকে রিলোড করতে চান?")) {
                          window.location.href = window.location.pathname + '?t=' + Date.now();
                        }
                      }}
                      className="w-full sm:w-auto shrink-0 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 font-extrabold text-[10.5px] px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 select-none hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5 text-blue-900 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4.5h-.21M4 9h5M4 9a8.001 8.001 0 0115.356-2" />
                      </svg>
                      নতুন ডিভাইসে রিলোড ও সুনিশ্চিত করুন 🔄
                    </button>
                  </div>

                  {/* 3. MERIT STUDENTS GALLERY & INFORMATION UPLOADER CARD */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center select-none font-bold">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800">৩। কৃতি শিক্ষার্থী গ্যালারি ও তথ্য আপলোডার 🏆</h4>
                      <p className="text-[9px] text-slate-400 mt-1">ল্যান্ডিং পেজের কৃতি শিক্ষার্থী সেকশনের তথ্য এবং ছবি এখান থেকে সহজেই আপলোড ও এডিট করতে পারেন</p>
                    </div>
                    {meritStudentsSuccess ? (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black font-mono font-sans animate-pulse">CHANGES SAVED ✅</span>
                    ) : (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black font-mono font-sans">UNSAVED MERIT DATA ({editMeritStudents.length}) ⚠️</span>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Merit Students Grid list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editMeritStudents.map((stud, idx) => (
                        <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-all space-y-3 relative flex flex-col text-left">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editMeritStudents.filter((_, i) => i !== idx);
                              setEditMeritStudents(updated);
                              setMeritStudentsSuccess(false);
                            }}
                            className="absolute top-2 right-2 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-300 p-1.5 rounded-lg transition-all bg-white shadow-sm cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="flex gap-3">
                            <span className="text-[10px] bg-amber-550 bg-amber-500 text-white font-extrabold h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <h5 className="font-bold text-xs text-slate-800 leading-tight">কৃতি শিক্ষার্থী {idx + 1} প্রোফাইল</h5>
                              <p className="text-[8.5px] text-slate-400 mt-0.5 font-sans">ছবি আপলোড বা লিংক দিলে ইনস্ট্যান্ট প্রিভিউ দেখা যাবে</p>
                            </div>
                          </div>

                           {/* Sustainable dual-mode image uploader / manager */}
                           <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm space-y-3.5 my-1.5 text-left">
                             <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black uppercase text-indigo-950 font-sans tracking-wide">ছবির উৎস নির্বাচন (PHOTO SOURCE)</span>
                               {stud.photoUrl && (
                                 <button
                                   type="button"
                                   onClick={() => {
                                     const updated = [...editMeritStudents];
                                     updated[idx] = { ...updated[idx], photoUrl: '' };
                                     setEditMeritStudents(updated);
                                     setMeritStudentsSuccess(false);
                                   }}
                                   className="text-[9px] text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 font-extrabold px-1.5 py-0.5 rounded transition-all cursor-pointer border border-rose-200"
                                 >
                                   ছবি রিমুভ (Reset File)
                                 </button>
                               )}
                             </div>

                             <div className="grid grid-cols-12 gap-3 items-center">
                               {/* Image Thumbnail Preview */}
                               <div className="col-span-3 h-14 w-14 rounded-full border border-slate-200 overflow-hidden relative flex items-center justify-center bg-slate-100 shadow-sm shrink-0">
                                 {stud.photoUrl ? (
                                   <img 
                                     src={stud.photoUrl} 
                                     alt={`Preview ${idx + 1}`} 
                                     referrerPolicy="no-referrer"
                                     className="w-full h-full object-cover" 
                                     onError={(e) => {
                                       const target = e.target as HTMLImageElement;
                                       target.style.display = 'none';
                                       const parent = target.parentNode as HTMLDivElement;
                                       while (parent.childNodes.length > 1) {
                                         parent.removeChild(parent.lastChild!);
                                       }
                                       const msg = document.createElement('span');
                                       msg.innerText = '❌ Broken';
                                       msg.className = 'text-[8px] font-sans text-rose-500 font-black';
                                       parent.appendChild(msg);
                                     }}
                                   />
                                 ) : (
                                   <div className="flex flex-col items-center justify-center text-slate-400 p-1">
                                     <Image className="h-4 w-4 text-slate-350 animate-pulse" />
                                     <span className="text-[7px] mt-0.5 text-slate-400 font-black font-sans text-center leading-none">NO PHOTO</span>
                                   </div>
                                 )}
                               </div>

                               {/* Source Switcher Header */}
                               <div className="col-span-9">
                                 {(() => {
                                   const isBase64 = stud.photoUrl?.startsWith('data:image/');
                                   const currentTab = photoSourceTab[idx] || (isBase64 ? 'upload' : 'url');

                                   return (
                                     <div className="space-y-2">
                                       <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200 text-[9.5px] font-black select-none font-sans">
                                         <button
                                           type="button"
                                           onClick={() => setPhotoSourceTab(prev => ({ ...prev, [idx]: 'url' }))}
                                           className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${currentTab === 'url' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-850'}`}
                                         >
                                           🌐 ওয়েব ডিরেক্ট লিংক (০ বাইট)
                                         </button>
                                         <button
                                           type="button"
                                           onClick={() => setPhotoSourceTab(prev => ({ ...prev, [idx]: 'upload' }))}
                                           className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${currentTab === 'upload' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-850'}`}
                                         >
                                           📂 কম্পিউটার ফাইল (অপ্টিমাইজড)
                                         </button>
                                       </div>
                                       
                                       {currentTab === 'url' ? (
                                          <div className="space-y-1">
                                            <input
                                              type="text"
                                              value={isBase64 ? '' : (stud.photoUrl || '')}
                                              onChange={(e) => {
                                                const updated = [...editMeritStudents];
                                                updated[idx] = { ...updated[idx], photoUrl: e.target.value };
                                                setEditMeritStudents(updated);
                                                setMeritStudentsSuccess(false);
                                              }}
                                              placeholder="এখানে সরাসরি ছবির ওয়েব URL লিংক পেস্ট করুন..."
                                              className="w-full rounded shadow-xs border border-slate-205 bg-white p-1 text-[11px] focus:outline-blue-900 focus:border-blue-900 text-slate-850 font-sans"
                                            />
                                          </div>
                                        ) : (
                                          <div className="space-y-1">
                                            <div className="relative border border-dashed border-slate-350 rounded-lg hover:border-slate-500 transition-colors p-2 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer">
                                              <Upload className="h-4 w-4 text-slate-500 mb-0.5" />
                                              <span className="text-[8.5px] font-black text-slate-700 font-sans">ডিভাইস থেকে ছবি নির্বাচন করুন</span>
                                              <span className="text-[7px] text-slate-400 font-sans leading-none font-bold">অটো ৩KB-তে রি-কম্প্রেসড হবে</span>
                                              <input 
                                                id={`file-upload-merit-${idx}`}
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    // Use strict dimensions and high jpeg compression ratio to save space (max size ~1KB to 2.5KB)
                                                    const base64 = await compressImage(file, 120, 150, 0.4);
                                                    if (base64) {
                                                      const updated = [...editMeritStudents];
                                                      updated[idx] = { ...updated[idx], photoUrl: base64 };
                                                      setEditMeritStudents(updated);
                                                      setMeritStudentsSuccess(false);
                                                    }
                                                  }
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                              />
                                            </div>
                                          </div>
                                        )}
                                     </div>
                                   );
                                 })()}
                               </div>
                             </div>

                             {/* Storage Footprint Alert Badges */}
                             {(() => {
                               const isBase64 = stud.photoUrl?.startsWith('data:image/');
                               if (isBase64) {
                                 const kbSize = Math.round((stud.photoUrl?.length || 0) * 0.75 / 102.4) / 10;
                                 return (
                                   <div className="flex items-center justify-between text-[8px] bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-100 select-none">
                                     <span className="font-extrabold font-sans">⚡ লোকাল স্টোরেজ ফুটপ্রিন্ট (সংকুচিত সাইজ)</span>
                                     <span className="font-mono bg-emerald-100 px-1 py-0.5 rounded font-black">{kbSize} KB (নিরাপদ)</span>
                                   </div>
                                 );
                               } else if (stud.photoUrl) {
                                 return (
                                   <div className="flex items-center justify-between text-[8px] bg-indigo-50/70 text-indigo-850 px-2 py-1 rounded border border-indigo-100 select-none">
                                     <span className="font-extrabold font-sans">🌐 ক্লাউড ওয়েব লিংক স্টোরেজ ফুটবল</span>
                                     <span className="font-mono bg-indigo-100 text-indigo-900 px-1 py-0.5 rounded font-black font-sans font-bold">০.০ KB (মেমোরি সেভার)</span>
                                   </div>
                                 );
                               }
                               return null;
                             })()}
                           </div>

                          {/* Info Fields */}
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="text-[9.5px] font-extrabold text-slate-600 block mb-1"> নাম (Name) </label>
                              <input
                                type="text"
                                value={stud.name}
                                onChange={(e) => {
                                  const updated = [...editMeritStudents];
                                  updated[idx] = { ...updated[idx], name: e.target.value };
                                  setEditMeritStudents(updated);
                                  setMeritStudentsSuccess(false);
                                }}
                                placeholder="যেমন: আফরিন জাহান স্মৃতি"
                                className="w-full rounded border border-slate-200 bg-white p-1.5 text-xs font-semibold focus:outline-blue-900"
                              />
                            </div>

                            <div>
                              <label className="text-[9.5px] font-extrabold text-slate-600 block mb-1"> শ্রেণী (Class Profile) </label>
                              <input
                                type="text"
                                value={stud.className || stud.class || ''}
                                onChange={(e) => {
                                  const updated = [...editMeritStudents];
                                  updated[idx] = { ...updated[idx], className: e.target.value, class: e.target.value };
                                  setEditMeritStudents(updated);
                                  setMeritStudentsSuccess(false);
                                }}
                                placeholder="যেমন: শ্রেণী: ১০ম"
                                className="w-full rounded border border-slate-200 bg-white p-1.5 text-xs font-semibold focus:outline-blue-900"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9.5px] font-extrabold text-slate-600 block mb-1"> মেধা স্থান / অর্জন (Achievement) </label>
                              <input
                                type="text"
                                value={stud.achievement}
                                onChange={(e) => {
                                  const updated = [...editMeritStudents];
                                  updated[idx] = { ...updated[idx], achievement: e.target.value };
                                  setEditMeritStudents(updated);
                                  setMeritStudentsSuccess(false);
                                }}
                                placeholder="যেমন: জিপিএ ৫.০০ (গোল্ডেন)"
                                className="w-full rounded border border-slate-200 bg-white p-1.5 text-xs font-semibold focus:outline-blue-900"
                              />
                            </div>

                            <div>
                              <label className="text-[9.5px] font-extrabold text-slate-600 block mb-1"> পুরস্কার / সম্মাননা (Award / Title) </label>
                              <input
                                type="text"
                                value={stud.award}
                                onChange={(e) => {
                                  const updated = [...editMeritStudents];
                                  updated[idx] = { ...updated[idx], award: e.target.value };
                                  setEditMeritStudents(updated);
                                  setMeritStudentsSuccess(false);
                                }}
                                placeholder="যেমন: বোর্ড মেরিট স্কলারশিপ ২০২৫"
                                className="w-full rounded border border-slate-200 bg-white p-1.5 text-xs font-semibold focus:outline-blue-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9.5px] font-extrabold text-slate-600 block mb-1"> প্রেরণা উক্তি/বাণী (Quote/Opinion) </label>
                            <textarea
                              value={stud.quote}
                              onChange={(e) => {
                                const updated = [...editMeritStudents];
                                updated[idx] = { ...updated[idx], quote: e.target.value };
                                  setEditMeritStudents(updated);
                                  setMeritStudentsSuccess(false);
                              }}
                              placeholder="শিক্ষার্থীর প্রেরণা যোগানো বিশেষ মন্তব্য এখানে লিখুন..."
                              rows={2}
                              className="w-full rounded border border-slate-200 bg-white p-1.5 text-xs font-semibold focus:outline-blue-900 resize-none font-sans"
                            />
                          </div>


                        </div>
                      ))}
                    </div>

                    {/* Add blank student and Save button container */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100 justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newStud = {
                            name: 'নতুন কৃতি শিক্ষার্থী',
                            className: 'শ্রেণী: ১০ম',
                            class: 'শ্রেণী: ১০ম',
                            achievement: 'এস.এস.সি বোর্ডে জিপিএ ৫.০০',
                            quote: 'নতুন কৃতি শিক্ষার্থীর সুন্দর প্রেরণা বাণী এখানে বসবে।',
                            award: 'মেরিট সম্মাননা ২০২৬',
                            photoUrl: ''
                          };
                          setEditMeritStudents([...editMeritStudents, newStud]);
                          setMeritStudentsSuccess(false);
                        }}
                        className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-extrabold text-[11px] py-2 px-5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Plus className="h-4 w-4" /> কৃতি শিক্ষার্থী যোগ করুন
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateMeritStudents(editMeritStudents);
                          setMeritStudentsSuccess(true);
                          setTimeout(() => {
                            setMeritStudentsSuccess(false);
                          }, 5000);
                        }}
                        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] py-2 px-8 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" /> সকল কৃতি শিক্ষার্থীর তথ্য ও ছবি সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

          {/* 10. SCHOOL BUS TRANSPORTATION ROUTES */}
          {activeTab === 'transport' && (
            <div>
              <div className="border-b pb-3 mb-6 font-sans">
                <h3 className="font-bold text-slate-800 text-sm">১০। স্কুল পরিবহন বাসের বিবরণ ও রুট কন্ট্রোল</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">সবগুলো স্কুল বাস রুটের ড্রাইভার তথ্য, গাড়ির নম্বর ও মাসিক গতিবিধি লাইভ মেইনটেন্যান্স স্ট্যাটাস এডিট করুন।</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans animate-fadeIn">
                {routes.map((rt) => (
                  <div key={rt.id} className="p-5 border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 text-left">
                          <Bus className="h-5 w-5 text-blue-900 shrink-0" />
                          <h4 className="font-extrabold text-xs text-slate-800">{rt.routeName}</h4>
                        </div>
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                          rt.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rt.status === 'Active' ? 'সচল (ACTIVE)' : 'মেইনটেন্যান্স'}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-[11px] text-slate-600 text-left">
                        <p>চালক: <span className="font-bold text-slate-800">{rt.driverName}</span></p>
                        <p>মোবাইল: <span className="font-mono text-slate-700 font-bold">{rt.driverPhone}</span></p>
                        <p>যানবাহন নম্বর: <span className="font-mono text-slate-500">{rt.vehicleNo}</span></p>
                        <p>মাসিক ফি: <span className="font-bold text-blue-900 font-mono">৳ {rt.monthlyFee}</span></p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t flex justify-end gap-1.5 select-none text-left">
                      <button
                        onClick={() => updateRouteStatus(rt.id, 'Active')}
                        className={`text-[9.5px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                          rt.status === 'Active' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        disabled={rt.status === 'Active'}
                      >
                        সক্রিয় করুন
                      </button>
                      <button
                        onClick={() => updateRouteStatus(rt.id, 'Maintenance')}
                        className={`text-[9.5px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                          rt.status === 'Maintenance' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                        disabled={rt.status === 'Maintenance'}
                      >
                        মেইন্টেন্যান্স মোড
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. DEVELOPMENT RESCRIPT PROJECTS PLANNING */}
          {activeTab === 'planning' && (
            <div>
              <div className="border-b pb-3 mb-6 font-sans">
                <h3 className="font-bold text-slate-800 text-sm font-sans">১১। স্কুলের উন্নয়ন প্রজেক্ট ও কন্সট্রাকশন প্ল্যানিং</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">প্রাতিষ্ঠানিক উন্নয়নমূলক কর্মযজ্ঞের অগ্রগতি মনিটরিং এবং বরাদ্দ বাজেট ও অগ্রগতি লেভেল আপডেট করুন</p>
              </div>

              {/* Master Creation Panel */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const title = fd.get('title') as string;
                  const banglaTitle = fd.get('banglaTitle') as string;
                  const budgetVal = fd.get('budget') as string;
                  if (!title || !banglaTitle || !budgetVal) return;
                  addDevProject({
                    title,
                    banglaTitle,
                    budget: Number(budgetVal),
                    progress: 0,
                    status: 'Planning'
                  });
                  e.currentTarget.reset();
                }}
                className="mb-8 p-5 rounded-2xl border bg-slate-50/50 flex flex-col md:flex-row gap-4 items-end font-sans font-sans"
              >
                <div className="flex-1 w-full text-left">
                  <label className="text-[9.5px] font-bold text-slate-600 block mb-1">প্রজেক্ট টাইটেল (English)</label>
                  <input required name="title" type="text" placeholder="e.g. Science Lab Reconstruction" className="w-full text-xs font-semibold p-2 border rounded bg-white focus:outline-blue-900" />
                </div>
                <div className="flex-1 w-full text-left">
                  <label className="text-[9.5px] font-bold text-slate-600 block mb-1">প্রজেক্ট নাম (বাংলায়)</label>
                  <input required name="banglaTitle" type="text" placeholder="উদা: আইসিটি এন্ড সাইন্স ল্যাব আধুনিকায়ন" className="w-full text-xs font-semibold p-2 border rounded bg-white focus:outline-blue-900" />
                </div>
                <div className="w-full md:w-44 text-left">
                  <label className="text-[9.5px] font-bold text-slate-600 block mb-1">বাজেট মেমো (টাকায়)</label>
                  <input required name="budget" type="number" placeholder="৳ ২৫০,০০০" className="w-full text-xs font-semibold p-2 border rounded bg-white focus:outline-blue-900 font-mono" />
                </div>
                <button type="submit" className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs p-2.5 px-5 rounded-xl cursor-pointer shadow transition-all shrink-0">
                  + প্রজেক্ট অ্যাড করুন
                </button>
              </form>

              {/* Grid System List */}
              <div className="space-y-4 font-sans animate-fadeIn">
                {devProjects.map((p) => {
                  return (
                    <div key={p.id} className="p-5 border rounded-2xl bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-slate-200">
                      <div className="flex-1 text-left">
                        <span className="text-[9px] font-mono text-slate-400 tracking-wider">PROJECT-ID: DP-2026-{p.id}</span>
                        <h4 className="font-extrabold text-sm text-slate-800 mt-1">{p.banglaTitle}</h4>
                        <p className="text-[10px] text-slate-500 font-medium font-mono uppercase mt-0.5">{p.title}</p>
                        <p className="text-[10.5px] font-bold text-blue-900 mt-2">মিশন বাজেট বরাদ্দ: ৳ {p.budget?.toLocaleString()}</p>
                      </div>

                      {/* Interactive Progress Indicators */}
                      <div className="w-full md:w-60 text-left space-y-3 shrink-0">
                        <div>
                          <div className="flex justify-between items-center text-[10px] mb-1 font-bold">
                            <span className="text-slate-500 font-bold">প্রজেক্ট অগ্রগতি</span>
                            <span className="text-indigo-900 font-mono">{p.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${p.progress}%` }}></div>
                          </div>
                        </div>

                        {/* Interactors */}
                        <div className="flex gap-2 text-xs">
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            value={p.progress}
                            step="5"
                            onChange={(e) => {
                              const prog = Number(e.target.value);
                              const stat = prog === 100 ? 'Completed' : prog === 0 ? 'Planning' : 'In-Progress';
                              updateDevProjectProgress(p.id, prog, stat);
                            }}
                            className="flex-1 accent-indigo-600 cursor-pointer"
                          />
                          <select
                            value={p.status}
                            onChange={(e) => {
                              const s = e.target.value as any;
                              const pVal = s === 'Completed' ? 100 : s === 'Planning' ? 0 : p.progress;
                              updateDevProjectProgress(p.id, pVal, s);
                            }}
                            className="bg-white border rounded p-1 text-[10px] font-bold text-slate-600 focus:outline-blue-900"
                          >
                            <option value="Planning">পরিকল্পনা (Planning)</option>
                            <option value="In-Progress">চলমান (In-Progress)</option>
                            <option value="Completed">সম্পন্ন (Completed)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 14. SYSTEM DB BACKUP / VERCEL SYNC */}
          {activeTab === 'db' && (
            <div className="space-y-6">
              <div className="border-b pb-3 mb-6">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Database className="h-5 w-5 text-amber-500 animate-pulse" />
                  ১৪। সিস্টেম ডিবি ব্যাকআপ ও ভার্সেল সিঙ্ক Hub
                </h3>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  লোকাল ডাটাবেজ ফাইল ব্যাকআপ এবং ক্লাউড হোস্টিং এ ব্যাকগ্রাউন্ড ডাটা সিনক্রোনাইজেশনের সেন্ট্রাল গেটওয়ে।
                </p>
              </div>

              {/* Sync Alert */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex gap-3 text-left">
                <Database className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-amber-800">ভার্সেল (Vercel) সাইটে ছবি ও ডাটা হারানোর সমস্যা দূর করুন!</h4>
                  <p className="text-[10.5px] text-amber-700 mt-1 leading-relaxed font-sans">
                    আপনার এই সাইটটি ফাইল-রুট ডাটাবেজ সিস্টেম দিয়ে তৈরি। লোকালহোস্ট থেকে যখন সরাসরি <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[9.5px]">git push</code> করা হয়, তখন পূর্বের ফাঁকা বা ব্যাকগ্রাউন্ড ডাটাটাই গিটহাবে আপলোড হয়ে যায় এবং আপনার ভার্সেল (Vercel) সাইটটিও ফাঁকা হয়ে যায়।
                  </p>
                  <div className="mt-3.5 pt-3 border-t border-amber-200/50">
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">💡 চিরস্থায়ী সমাধানের অতি সহজ ৩টি ধাপ:</p>
                    <ul className="list-decimal list-inside text-[11px] text-slate-700 mt-2 space-y-1.5 leading-relaxed pl-1 font-semibold font-sans">
                      <li>নিচে দেয়া <span className="text-amber-800">"১. ডাউনলোড করুন db.json"</span> বাটনে ক্লিক করে লেটেস্ট ফাইলটি ডাউনলোড করুন এবং আপনার কম্পিউটারের প্রোজেক্টের প্রধান রুট ডিরেক্টরিতে (root folder) পুরাতন ফাইলটির জায়গায় পেস্ট করে দিন।</li>
                      <li>এরপর <span className="text-amber-800">"২. ডাউনলোড করুন fallbackDb.ts"</span> বাটনে ক্লিক করে ফাইলটি ডাউনলোড করে আপনার প্রোজেক্টের <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">/src/fallbackDb.ts</code> ফাইলের সব কোড কপি-পেস্ট করে প্রতিস্থাপন (Replace) করে দিন।</li>
                      <li>এখন আপনার কম্পিউটার থেকে গিট কমিট এবং পুশ করুন! এবার ভার্সেল সাইটে আপনার নতুন ছবি ও কৃতি শিক্ষার্থী চিরস্থায়ীভাবে দৃশ্যমান হয়ে যাবে!</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    const dbData: Record<string, string> = {};
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('delicon_')) {
                        const val = localStorage.getItem(key);
                        if (val) dbData[key] = val;
                      }
                    }
                    if ((window as any).__serverDbCache) {
                      for (const [key, val] of Object.entries((window as any).__serverDbCache)) {
                        if (key.startsWith('delicon_') && val) {
                          dbData[key] = val as string;
                        }
                      }
                    }
                    const jsonString = JSON.stringify(dbData, null, 2);
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'db.json';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-xl flex flex-col justify-between items-start text-left shrink-0 transition-all cursor-pointer shadow-sm group hover:scale-[1.01]"
                >
                  <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500 mb-4 group-hover:bg-amber-500/20 transition-all">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-[12px] text-white">১. ডাউনলোড করুন db.json</h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">কম্পিউটারের রুট ফোল্ডারে এই ফাইলটি দিয়ে পুরাতন db.json রিপ্লেস করুন।</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const dbData: Record<string, string> = {};
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('delicon_')) {
                        const val = localStorage.getItem(key);
                        if (val) dbData[key] = val;
                      }
                    }
                    if ((window as any).__serverDbCache) {
                      for (const [key, val] of Object.entries((window as any).__serverDbCache)) {
                        if (key.startsWith('delicon_') && val) {
                          dbData[key] = val as string;
                        }
                      }
                    }
                    const fileContent = `/**
 * Statically Bundled Fallback Database for Delicon Model Academy
 * This file acts as a client-side hardcoded fallback if backend APIs are offline or when deploying to Vercel/Static hosting.
 */

const fallbackDb: Record<string, string> = ${JSON.stringify(dbData, null, 2)};

export default fallbackDb;
`;
                    const blob = new Blob([fileContent], { type: 'text/typescript' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'fallbackDb.ts';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-blue-950 hover:bg-blue-900 border border-blue-900 text-white p-4 rounded-xl flex flex-col justify-between items-start text-left shrink-0 transition-all cursor-pointer shadow-sm group hover:scale-[1.01]"
                >
                  <div className="bg-blue-400/10 p-2 rounded-lg text-blue-400 mb-4 group-hover:bg-blue-400/20 transition-all">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-[12px] text-white font-sans">২. ডাউনলোড করুন fallbackDb.ts</h5>
                    <p className="text-[10px] text-blue-200 mt-1 leading-normal font-sans">ডাউনলোড করে src/fallbackDb.ts ফাইলের সমস্ত কোড রিপ্লেস করুন।</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const dbData: Record<string, string> = {};
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('delicon_')) {
                        const val = localStorage.getItem(key);
                        if (val) dbData[key] = val;
                      }
                    }
                    if ((window as any).__serverDbCache) {
                      for (const [key, val] of Object.entries((window as any).__serverDbCache)) {
                        if (key.startsWith('delicon_') && val) {
                          dbData[key] = val as string;
                        }
                      }
                    }
                    navigator.clipboard.writeText(JSON.stringify(dbData, null, 2));
                    alert("সম্পূর্ণ ডাটা সফলভাবে ক্লিপবোর্ডে কপি হয়েছে! আপনি চাইলে এটি আপনার কম্পিউটারে যেকোনো জায়গায় পেস্ট করতে পারেন।");
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-4 rounded-xl flex flex-col justify-between items-start text-left shrink-0 transition-all cursor-pointer shadow-sm group hover:scale-[1.01] border border-slate-250"
                >
                  <div className="bg-slate-300 p-2 rounded-lg text-slate-650 mb-4">
                    <Copy className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-[12px] text-slate-900 font-sans">৩. সম্পূর্ণ ডাটা র-কপি করুন</h5>
                    <p className="text-[10px] text-slate-505 mt-1 leading-normal font-sans">সম্পূর্ণ ডাটাবেজ অবজেক্ট টেক্সট আকারে আপনার ক্লিপবোর্ডে কপি করুন।</p>
                  </div>
                </button>
              </div>

              {/* Original Raw metadata dump */}
              <div className="space-y-4 font-mono text-[11px] text-slate-700 text-left">
                <div className="p-4 bg-slate-900 border border-slate-950 text-emerald-400 rounded-xl space-y-2 font-mono">
                  <p className="font-bold text-amber-400 border-b border-slate-800 pb-1.5 font-sans">CLIENT DATABASE METADATA</p>
                  <p>Students Count: {students.length}</p>
                  <p>Employees Count: {employees.length}</p>
                  <p>Attendance Logs Length: {attendanceLogs.length}</p>
                  <p>SMS Notifications Sent: {leads.length}</p>
                </div>
                
                <div className="p-4 bg-slate-950 border text-slate-200 rounded-xl max-h-56 overflow-y-auto font-mono">
                  <p className="font-bold text-amber-400 border-b pb-1.5 mb-2 border-slate-800">RAW LOCALSTORAGE STATE DUMP</p>
                  <pre>{JSON.stringify({ studentsCount: students.length, noticesCount: notices.length, leadsCount: leads.length }, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scanner' && (
            <div className="space-y-6">
              <div className="border-b pb-3 mb-6">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-indigo-600" />
                  ১৫। ডিজিটাল আরএফআইডি / কিউআর গেটলাইন ট্র্যাকার সিমুলেটর
                </h3>
                <p className="text-[10.5px] text-slate-500 mt-0.5">ডিজিটাল এটেনডেন্স মেশিন, রিয়েল-টাইম এসএমএস ট্র্যাকিং এবং লাইভ কার্ড কুইক পাঞ্চ সিমুলেশন ল্যাব।</p>
              </div>
              <AttendanceSimulator />
            </div>
          )}

          {activeTab === 'dtube' && (
            <div className="space-y-6">
              <div className="border-b pb-3 mb-6">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Video className="h-5 w-5 text-red-650 animate-pulse" />
                  ১৬। ভিডিও কাস্টমাইজার ও মাল্টি-প্লেয়ার সেন্ট্রাল কন্ট্রোল ডেক 📺
                </h3>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  ইউনিকাইড মাল্টি-প্লেয়ার ভিডিও সিস্টেম। এখান থেকে স্কুলের বড় ক্লাস ভিডিও, রিলস/শর্টস এবং সাংস্কৃতিক কর্নারের ইউটিউব প্লে-লিস্ট সরাসরি ড্রপডাউন দিয়ে সিলেক্ট করে এডিট ও কন্ট্রোল করা যায়।
                </p>
              </div>

              {/* Redesigned Unified Video Upload Card */}
              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                <h5 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 border-b border-dashed border-slate-200 pb-2.5">
                  <Plus className="h-4 w-4 text-emerald-600 animate-bounce" /> ভিডিও আপলোড ও প্লেয়ার নির্বাচন গেটওয়ে (Unified Uploader)
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">ভিডিও প্লেয়ার চয়েস (কোন প্লেয়ারে প্লে হবে?) <span className="text-red-500">*</span></label>
                    <select
                      value={videoTargetPlayer}
                      onChange={(e) => setVideoTargetPlayer(e.target.value as 'dtube_full' | 'dtube_reel' | 'cultural')}
                      className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-900/10 font-sans"
                    >
                      <option value="dtube_full">১। ডি-টিউব বড় একাডেমিক ক্লাস ভিডিও প্লেয়ার 📹</option>
                      <option value="dtube_reel">২। ডি-টিউব মোবাইল রিলস ও শর্টস প্লেয়ার 📱</option>
                      <option value="cultural">৩। বার্ষিক সাংস্কৃতিক উৎসব ও লাইভ কর্নার প্লেয়ার 🌟</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">ভিডিওর টাইটেল / শিরোনামঃ <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="যেমন: শতকরা অধ্যায়ের চমৎকার সমাধান 📐"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">ইউটিউব ভিডিও URL বা শর্টস লিংকঃ <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=... বা শর্টস লিংক"
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setVideoUploadError('');
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 font-sans"
                    />
                  </div>

                  {videoTargetPlayer !== 'cultural' && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">শ্রেণী / শ্রেণীবিভাগঃ</label>
                        <input
                          type="text"
                          placeholder="যেমন: Class 5 Mathematics বা Reel / Short"
                          value={videoClassLabel}
                          onChange={(e) => setVideoClassLabel(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">শিক্ষক অথবা প্রেজেন্টার নামঃ</label>
                        <input
                          type="text"
                          placeholder="যেমন: মিস ফারহানা চৌধুরী"
                          value={videoAuthor}
                          onChange={(e) => setVideoAuthor(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">ভিডিও ব্যাপ্তিকালঃ (ঐচ্ছিক)</label>
                        <input
                          type="text"
                          placeholder="যেমন: ১৫:০০ মিনিট বা ০:৫৯ মিনিট"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 font-sans"
                        />
                      </div>
                    </>
                  )}

                  {videoTargetPlayer === 'cultural' && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">ভিউস কাউন্ট সংখ্যাঃ (ঐচ্ছিক)</label>
                      <input
                        type="number"
                        placeholder="যেমন: ৩৫০"
                        value={videoViewsInput}
                        onChange={(e) => setVideoViewsInput(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 font-sans"
                      />
                    </div>
                  )}
                </div>

                {videoUploadError && (
                  <p className="text-[10px] font-bold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 max-w-full font-sans text-left">
                    ⚠ {videoUploadError}
                  </p>
                )}

                {videoUploadSuccess && (
                  <p className="text-[10px] font-bold text-emerald-750 bg-emerald-50 p-2.5 rounded-lg border border-emerald-250 font-sans text-left">
                    🎉 ভিডিওটি সফলভাবে নির্বাচিত প্লে-লিস্টে যোগ করা হয়েছে! হোমপেজে যাচাই করুন।
                  </p>
                )}

                <button
                  onClick={handleUnifiedVideoUpload}
                  className="bg-blue-950 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-900 focus:outline-none cursor-pointer flex items-center gap-1.5 transition-all w-full justify-center font-sans"
                >
                  <Plus className="h-4 w-4" /> প্লে-লিস্টে লিঙ্ক যুক্ত করুন
                </button>
              </div>

              {/* View Lists side-by-side or stacked */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DTube Column */}
                <div className="bg-white border border-slate-250 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <h5 className="font-bold text-xs text-slate-850 flex items-center gap-1.5 font-sans justify-start">
                      <Video className="h-4 w-4 text-red-650" />
                      ডি-টিউব প্লে-লিস্ট ভিডিওসমূহ ({dtubePlaylist.length} টি)
                    </h5>
                  </div>
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {dtubePlaylist.map((item) => {
                      const yId = getYouTubeId(item.url);
                      return (
                        <div key={item.id} className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-2.5 flex gap-3 relative shadow-xs hover:border-blue-200 transition-all text-left">
                          <div className="w-20 shrink-0 aspect-video rounded-lg overflow-hidden relative bg-slate-100 border border-slate-150">
                            {yId ? (
                              <img 
                                src={`https://img.youtube.com/vi/${yId}/mqdefault.jpg`} 
                                alt={item.title} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                <Video className="h-4 w-4 text-slate-400" />
                              </div>
                            )}
                            <span className="absolute bottom-0.5 right-0.5 bg-black/75 px-1 py-0.5 rounded text-[7px] font-mono text-white font-bold leading-none">
                              {item.category === 'reel' ? 'রিল' : 'পূর্ণ ক্লাস'}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-6 flex flex-col justify-between">
                            <h6 className="font-bold text-[10px] text-slate-800 leading-snug truncate" title={item.title}>
                              {item.title}
                            </h6>
                            <p className="text-[8px] text-slate-500 font-bold mt-auto font-sans">শ্রেণীঃ {item.classLabel}</p>
                            <p className="text-[8px] text-slate-400 font-medium font-sans">প্রেজেন্টারঃ {item.author}</p>
                          </div>

                          <button
                            onClick={() => handleDeleteDtubeVideo(item.id)}
                            className="absolute top-1.5 right-1.5 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
                            title="বাদ দিন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cultural Column */}
                <div className="bg-white border border-slate-250 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <h5 className="font-bold text-xs text-slate-850 flex items-center gap-1.5 font-sans justify-start">
                      <Layers className="h-4 w-4 text-amber-600" />
                      সাংস্কৃতিক কর্নার ভিডিওসমূহ ({culturalPlaylist.length} টি)
                    </h5>
                  </div>
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {culturalPlaylist.map((item) => {
                      const yId = getYouTubeId(item.url);
                      return (
                        <div key={item.id} className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-2.5 flex gap-3 relative shadow-xs hover:border-amber-200 transition-all text-left">
                          <div className="w-20 shrink-0 aspect-video rounded-lg overflow-hidden relative bg-slate-100 border border-slate-150">
                            {yId ? (
                              <img 
                                src={`https://img.youtube.com/vi/${yId}/mqdefault.jpg`} 
                                alt={item.title} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                <Video className="h-4 w-4 text-slate-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-6 flex flex-col justify-between">
                            <h6 className="font-bold text-[10px] text-slate-800 leading-snug truncate" title={item.title}>
                              {item.title}
                            </h6>
                            <p className="text-[8px] text-slate-500 font-bold mt-auto font-sans">ভিউস কাউন্টঃ {item.views || 0} জন</p>
                          </div>

                          <button
                            onClick={() => handleDeleteCulturalVideo(item.id)}
                            className="absolute top-1.5 right-1.5 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
                            title="বাদ দিন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="border-b pb-3 mb-6">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-950" />
                  ১৭। প্রাতিষ্ঠানিক একাডেমিক ডায়েরী ও কালপঞ্জী সংশোধনালয় 📅
                </h3>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  মাদরাসার সাধারণ ছুটি, পরীক্ষা সূচি, সাংস্কৃতিক বা স্পোর্টস অনুষ্ঠানমালার তালিকা নিয়ন্ত্রণ করুন। এখান থেকে যুক্ত করা ইভেন্টসমূহ সরাসরি অভিভাবক ও শিক্ষার্থীদের ড্যাশবোর্ডে প্রদর্শিত হবে।
                </p>
              </div>

              <AcademicEventCalendar role={role} />
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b pb-3 mb-6">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Book className="h-5 w-5 text-indigo-950" />
                  ১৮। ডিজিটাল লাইব্রেরি এডিটোরিয়াল ও সামগ্রী সেন্টার 📚
                </h3>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  শিক্ষার্থীদের জন্য সিলেবাস, লেকচার শিট, পূর্ববর্তী পরীক্ষা প্রশ্নপত্রসমূহ এবং ই-বুক পাবলিশ করুন। এখানে যেকোনো পরিবর্তন রিয়েলটাইমে শিক্ষার্থী ও অভিভাবক ডিজিটাল পোর্টালে সিঙ্ক হবে।
                </p>
              </div>

              <DigitalLibrary role={role} />
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
