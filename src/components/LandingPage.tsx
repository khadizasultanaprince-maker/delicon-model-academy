/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  BookOpen, Calculator, Calendar, CheckCircle, Clock, 
  MapPin, Phone, Users, Shield, Award, Sparkles, Book,
  Tv, Compass, HelpCircle, Truck, Home, GraduationCap,
  MessageSquare, Briefcase, Mail, Send, Bell
} from 'lucide-react';
import { motion } from 'motion/react';

interface MeritStudent {
  name: string;
  className?: string;
  class?: string;
  achievement: string;
  quote: string;
  award: string;
  photoUrl: string;
}

const MeritStudentCard: React.FC<{ student: MeritStudent }> = ({ student }) => {
  const [photoError, setPhotoError] = useState(false);

  return (
    <div className="bg-gradient-to-r from-slate-50 to-white p-5 rounded-2xl border border-slate-150 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-350 text-left flex flex-col sm:flex-row gap-5 items-start relative min-h-[200px]">
      {/* Left Side: Large Portrait Picture Frame with Amber/Gold Accent */}
      <div className="w-full sm:w-28 md:w-32 aspect-[4/5] rounded-xl border-2 border-amber-300 shadow-sm overflow-hidden shrink-0 bg-gradient-to-tr from-amber-50 to-orange-50 flex items-center justify-center relative group">
        {!student.photoUrl || photoError ? (
          <div className="font-black text-amber-850 text-3xl font-sans">
            {student.name ? student.name[0] : '★'}
          </div>
        ) : (
          <img 
            src={student.photoUrl} 
            alt={student.name} 
            referrerPolicy="no-referrer"
            onError={() => setPhotoError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        
        {/* Small Aesthetic Star Badge on Photo */}
        <div className="absolute top-2 left-2 bg-amber-500 text-white rounded-full p-1 shadow-md">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>

      {/* Right Side: Information Hub */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
        <div>
          {/* Award Level Badge */}
          <div className="mb-2">
            <span className="bg-amber-50 text-amber-800 text-[9px] font-black tracking-wide px-2 py-0.5 rounded-full border border-amber-200 uppercase inline-block font-sans">
              ★ {student.award}
            </span>
          </div>

          {/* Student Name */}
          <h4 className="font-black text-slate-950 text-base leading-snug tracking-tight hover:text-blue-900 transition-colors">
            {student.name}
          </h4>

          {/* Class */}
          <p className="text-[11px] font-bold text-slate-500 mt-1">
            {student.className || student.class || 'শ্রেণী: নার্সারী'}
          </p>

          {/* Achievement Box */}
          <div className="mt-2 text-left">
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100 inline-block">
              🏆 {student.achievement}
            </span>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="text-slate-600 text-[11px] leading-relaxed mt-4 pt-3 border-t border-slate-100 italic relative text-left">
          <span className="text-slate-300 text-2xl font-serif absolute -top-1 -left-1 select-none leading-none">“</span>
          <p className="pl-4 leading-relaxed line-clamp-3 font-sans" title={student.quote}>
            {student.quote}
          </p>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<{ 
  onOpenAuth: () => void;
  onLeadAutoLogin?: (studentName: string, parentName: string, phone: string, className: string) => void;
  loggedInRole?: string | null;
}> = ({ onOpenAuth, onLeadAutoLogin, loggedInRole }) => {
  const { 
    addLead, notices, routes, stationery, devProjects, sections, students, employees, attendanceLogs, requisitions,
    schoolName, schoolSlogan, schoolLogoType, schoolLogoVal, campusPhotos, meritStudents, addEmployee
  } = useSchool();

  const isSecVisible = (secId: string) => {
    const sec = sections?.find(s => s.id === secId);
    return sec ? sec.visible : true;
  };

  const getSecTitle = (secId: string, defaultTitle: string) => {
    const sec = sections?.find(s => s.id === secId);
    return sec && sec.title ? sec.title : defaultTitle;
  };
  
  // Lead Generation state
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [desiredClass, setDesiredClass] = useState('Class 1');
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Hero slide interactive state
  const [heroSlide, setHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Campus Mugdhota Photos Gallery Slider
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Photo rendering error trackers to provide premium fallback templates
  const [studentPhotoErrors, setStudentPhotoErrors] = useState<Record<number, boolean>>({});
  const [campusPhotoErrors, setCampusPhotoErrors] = useState<Record<number, boolean>>({});

  const campusPhotosData = campusPhotos || [];

  useEffect(() => {
    if (campusPhotosData.length === 0) return;
    const photoTimer = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % campusPhotosData.length);
    }, 7500);
    return () => clearInterval(photoTimer);
  }, [campusPhotosData.length]);

  const heroSlidesData = [
    {
      badge: '🌸 পরম স্নেহে প্রস্ফুটিত কানন',
      title: 'এখানে শাসন মানে বেতের বাড়ি আর আতংক সৃষ্টি করে দিয়ে নয়। নিয়ম শৃঙখলা মেনে জীবন চলার সুশিক্ষার অনুপ্রেরণায় এগিয়ে চলা-সে হবে উজ্জল আর নির্ভিক।',
      desc: 'আমাদের অভিজ্ঞ শিক্ষক মালীগণ এখানে কঠোর শাসন ছাড়াই, নিয়ম-শৃঙ্খলার সযত্ন অনুশীলনে প্রতিটি শিশুকে রঙের ছটায়, সুকৃতিতে আর সৌরভের আভায় ফুলের মতন তিলে তিলে বিকশিত করে তোলেন।'
    },
    {
      badge: '✔ জীবনের কষ্টিপাথরে উত্তীর্ণ শিক্ষা',
      title: 'খাতায় লিখে পাশকরা সার্টিফাইড পর্যন্তই নয়। মেধায় মননে শৃঙখলায় দায়িত্ববোধে সে হয়ে ওঠবে জাস্টিফাইড সুনাগরিক-আগামীর সমাধান।',
      desc: 'শুধু পরীক্ষায় জিপিএ-৫ আর কাগজী পত্রে সার্টিফাইড হওয়া আমাদের উদ্দেশ্য নয়। ডি লিকন মডেল একাডেমীর সুদৃঢ় লক্ষ্য হচ্ছে এমনভাবে মনের ভিত্তি প্রস্তুত করা যেন প্রতিটি শিক্ষার্থী জীবনের বাস্তব পরীক্ষায় খাঁটি চরিত্র ও যোগ্যতায় জাস্টিফায়েড নাগরিক হয়।'
    },
    {
      badge: '❤ আনন্দের রঙে সাজানো সযত্ন পাঠশালা',
      title: 'শিশুরা যা কিছু প্রফুল্ল অন্তরে উপভোগ করে, মনের মণিকোঠায় আজীবন তা গেঁথে রাখে!',
      desc: 'কোনো ভীতি নেই, নেই ক্লান্তিকর একঘেয়ে লেকচারের বোঝা। কৌতূহলী প্রশ্ন আর রোমাঞ্চকর খেলাচ্ছলে শিক্ষার এমন জাদুকরী ব্যবস্থাপনা করা হয়েছে যে প্রতিটি শিক্ষার্থী আনন্দের সাথে প্রতিটি সেকেন্ড পাঠ উপভোগ করে।'
    },
    {
      badge: '💡 অসম মেধার সুষম সমাধান',
      title: 'আপনার প্রিয় সন্তানকে পরম স্নেহ মমতায় গড়ে তুলি আমরা। অপেক্ষাকৃত দুর্বল শিক্ষার্থীদের জন্যে রয়েছে বাড়তি বন্দোবস্ত-এক্সট্রা কেয়ার।',
      desc: 'সব ফুলের ফুটবার সময় এক নয়, তাই কোনো শিক্ষার্থী একটু পিছিয়ে পড়লে আমরা তাকে তুচ্ছ করি না। শিক্ষকরা অতিরিক্ত ক্লাসে মাতৃসুলভ মমতায় এবং পরম প্রণোদনায় তাদের সামনে এগিয়ে চলার আত্মবিশ্বাস যোগান।'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHeroHovered) {
        setHeroSlide((prev) => (prev + 1) % 4);
      }
    }, 14000);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  // Fee calculator state
  const [calcClass, setCalcClass] = useState('Primary');
  const [calcTransport, setCalcTransport] = useState(false);
  const [calcStationery, setCalcStationery] = useState(false);

  // FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Navigation index state for 26 sections jumping
  const [activeSection, setActiveSection] = useState(0);

  // Newsletter state
  const [newsEmail, setNewsEmail] = useState('');
  const [newsSuccess, setNewsSuccess] = useState(false);

  // Teacher Data Entry State
  const [tNameEng, setTNameEng] = useState('');
  const [tNameBng, setTNameBng] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tSubject, setTSubject] = useState('');
  const [tQual, setTQual] = useState('');
  const [tSalary, setTSalary] = useState('28000');
  const [tSuccess, setTSuccess] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [tQuery, setTQuery] = useState('');

  // Real-time Clock State & Bengali digit converter
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Time-conscious Quotes for the auto-sliding alert banner
  const timeConsciousQuotes = [
    "সময় পার হয়ে যাবার আগেই ধরে ফেলতে হয়। তুমি কি পিছিয়ে পড়ছো আলস্যে ঘুমে বা অন্য খেয়ালে!",
    "সময়কে দৌড়ে গিয়ে ধরতে হয়।",
    "তুমি বলছো, সময় যায়, আসলে যাচ্ছি আমরা",
    "তুমি কি সময়ের পরিকল্পিত ব্যবহার জানো",
    "তোমার রুটিন আছে",
    "ধর্মীয় নির্দেশনা মানেই সময় ধরে চলা",
    "সাফল্য আসে সময়ের পরিকল্পিত ব্যাবহারের সক্ষমতায়",
    "আমরা সময়টাকে পাল্টাই নিজের কাজ ও পরিশ্রম দিয়েই নয়, আরো থাকে সেই পরিকল্পনা যা মহা পরিকল্পনার অংশ হয়ে পথ চলে।",
    "আজকের কর্মব্যস্ততাই আগামী দিনের সফলতার প্রধান সোপান, তাই অলসতাকে বিদায় দাও এখনই!",
    "সময় কারো জন্য অপেক্ষা করে না, প্রতিটি সেকেন্ডই জীবন গঠনের একেকটি অনন্য সুযোগ。",
    "পরিকল্পনাহীন জীবন যেন হালবিহীন নৌকা, সময় থাকতে সঠিক সিদ্ধান্ত গ্রহণ এবং বাস্তবায়ন করুন।",
    "প্রতিটি দিনই আমাদের সামনে নতুন সম্ভাবনার দরজা খোলে, একটি মুহূর্তও যেন অবহেলায় হারিয়ে না যায়।"
  ];
  
  const [activeQuoteIdx, setActiveQuoteIdx ] = useState(0);
  const [isQuoteHovered, setIsQuoteHovered] = useState(false);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Quotes rotation interval (every 15 seconds, pause on hover)
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      if (!isQuoteHovered) {
        setActiveQuoteIdx((prev) => (prev + 1) % timeConsciousQuotes.length);
      }
    }, 15000);
    return () => clearInterval(quoteInterval);
  }, [isQuoteHovered, timeConsciousQuotes.length]);

  const toBengaliDigits = (numStr: string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return numStr.replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
  };

  const formatTimeBn = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const period = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, '0');
    
    return `${toBengaliDigits(`${hoursStr}:${minutes}:${seconds}`)} ${period}`;
  };

  // State for new interactive sections
  const [activeDtubeVideo, setActiveDtubeVideo] = useState('v1');
  const [videoViews, setVideoViews] = useState<Record<string, number>>({ v1: 320, v2: 145, v3: 88, v4: 512, v5: 390 });
  const [isPlayingDtubeVideo, setIsPlayingDtubeVideo] = useState(false);

  // D-Tube dynamic playlist for Videos and Reels
  const [dtubePlaylist, setDtubePlaylist] = useState([
    { id: 'v1', title: 'শতকরা অধ্যায়ের চমৎকার সমাধান 📐', category: 'full', url: 'https://www.youtube.com/watch?v=pAnu7S8U_wI', views: 320, author: 'মিস ফারহানা চৌধুরী', duration: '১৫:০০ মিনিট', classLabel: 'Class 5 Mathematics' },
    { id: 'v2', title: 'টেন্স এবং পার্টস অভ স্পিচ সহজে সমাধান 📝', category: 'full', url: 'https://www.youtube.com/watch?v=eG_QshOve4E', views: 145, author: 'জনাব মো: রেজওয়ানুর', duration: '১২:৩০ মিনিট', classLabel: 'Class 8 English' },
    { id: 'v3', title: 'গতি ও বলবিদ্যার বেসিক সূত্রাবলি ⚡', category: 'full', url: 'https://www.youtube.com/watch?v=Aof_Zg05qYk', views: 88, author: 'জনাব আশরাফুল আমিন', duration: '১৮:১৫ মিনিট', classLabel: 'Class 10 Physics' },
    { id: 'v4', title: 'ডিলিকন মডেল একাডেমী ক্যাম্পাসের এক ঝলক 🎬', category: 'reel', url: 'https://www.youtube.com/shorts/5e_2Iitid0Y', views: 512, author: 'ডি লিকন মিডিয়া সেল', duration: '০:৫৯ মিনিট', classLabel: 'Reel / Short' },
    { id: 'v5', title: 'ছোট্ট বন্ধুদের সৃজনশীল চিত্রাংকন প্রতিযোগীতা 🎨', category: 'reel', url: 'https://www.youtube.com/shorts/XN6-M6bC8k4', views: 390, author: 'তাহমিনা সুলতানা', duration: '০:৪৫ মিনিট', classLabel: 'Reel / Short' },
  ]);
  const [dtubeFilter, setDtubeFilter] = useState<'all' | 'full' | 'reel'>('all');
  const [customDtubeUrl, setCustomDtubeUrl] = useState('');
  const [customDtubeTitle, setCustomDtubeTitle] = useState('');
  const [customDtubeAuthor, setCustomDtubeAuthor] = useState('');
  const [customDtubeCategory, setCustomDtubeCategory] = useState<'full' | 'reel'>('full');
  const [customDtubeClass, setCustomDtubeClass] = useState('সাধারণ');
  const [dtubeInputError, setDtubeInputError] = useState('');

  const [blogLikes, setBlogLikes] = useState<Record<string, number>>({ b1: 15, b2: 24, b3: 9 });
  const [likedBlogs, setLikedBlogs] = useState<Record<string, boolean>>({});
  const [parentFeedback, setParentFeedback] = useState('');
  const [parentFeedbackSuccess, setParentFeedbackSuccess] = useState(false);
  const [simulatingClassroom, setSimulatingClassroom] = useState<string | null>(null);
  const [galleryFilter, setGalleryFilter] = useState('All');

  // Cultural Station YouTube player states
  const [culturalPlaylist, setCulturalPlaylist] = useState([
    { id: 'cp1', title: 'রবীন্দ্র জয়ন্তী ও বসন্ত উৎসব নৃত্য ২০২৬ 🌸', url: 'https://www.youtube.com/watch?v=XN6-M6bC8k4', views: 420 },
    { id: 'cp2', title: 'কবিতা আবৃত্তি ও বার্ষিক নাটক মঞ্চায়ন 🎭', url: 'https://www.youtube.com/watch?v=8XUvMOnu8cE', views: 280 },
    { id: 'cp3', title: 'স্বাধীনতা দিবসের বিতর্ক প্রতিযোগিতা 🎤', url: 'https://www.youtube.com/watch?v=Fq2CvmgoO7I', views: 195 }
  ]);
  const [activeCulturalVideoId, setActiveCulturalVideoId] = useState('cp1');
  const [isPlayingCulturalVideo, setIsPlayingCulturalVideo] = useState(false);
  const [customCulturalUrl, setCustomCulturalUrl] = useState('');
  const [customCulturalTitle, setCustomCulturalTitle] = useState('');
  const [culturalInputError, setCulturalInputError] = useState('');

  const getYouTubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  // Merit Student slide states
  const [meritSlide, setMeritSlide] = useState(0);
  const [isMeritHovered, setIsMeritHovered] = useState(false);

  useEffect(() => {
    const list = meritStudents || [];
    if (list.length <= 1) return;
    const timer = setInterval(() => {
      if (!isMeritHovered) {
        setMeritSlide((prev) => (prev + 1) % list.length);
      }
    }, 14000); // 14 seconds high-fidelity read time
    return () => clearInterval(timer);
  }, [isMeritHovered, meritStudents?.length]);

  const sectionsList = [
    { title: 'পরিচিতি ও ব্যানার', id: 'sec-hero', bg: 'bg-slate-900 text-white' },
    { title: 'মুগ্ধতা ছড়ানো ক্যাম্পাস গ্যালারি 🌸', id: 'sec-mugdhota-slider', bg: 'bg-emerald-955 text-white' },
    { title: 'আজকের ড্যাশবোর্ড ⏰', id: 'sec-today-campus-dash', bg: 'bg-slate-900 text-white' },
    { title: 'কৃতি শিক্ষার্থী 🏆', id: 'sec-merit-students', bg: 'bg-white text-slate-800' },
    { title: 'সকল শিক্ষকগন 👥', id: 'sec-all-teachers', bg: 'bg-slate-50 text-slate-800' },
    { title: 'কালচারাল স্টেশন 🎭', id: 'sec-cultural-station', bg: 'bg-slate-100 text-slate-800' },
    { title: 'ফটো গ্যালারী 📸', id: 'sec-campus-gallery-new', bg: 'bg-white text-slate-800' },
    { title: 'ডিজিটাল নোটিশবোর্ড 📢', id: 'sec-notice', bg: 'bg-amber-50 text-amber-950' },
    { title: 'একাডেমিক ব্লগ ✍️', id: 'sec-school-blog', bg: 'bg-slate-50 text-slate-800' },
    { title: 'ডিটিউব - ভিডিও হাব 📺', id: 'sec-dtube-video-hub', bg: 'bg-slate-900 text-white' },
    { title: 'অভিভাবক পাতা 👨‍👩‍👦', id: 'sec-guardian-guide-page', bg: 'bg-white text-slate-800' },
    { title: 'ডিজিটাল ক্লাসরুম 💻', id: 'sec-digital-classrooms', bg: 'bg-slate-50 text-slate-800' },
    { title: 'সহ-শিক্ষা ও স্পোর্টস ক্লাব', id: 'sec-sports', bg: 'bg-emerald-950 text-white' },
    { title: 'নিরাপদ পরিবহন', id: 'sec-transport', bg: 'bg-white text-slate-800' },
    { title: 'বেতন ও ফি হিসাবকারী', id: 'sec-fees-calc', bg: 'bg-blue-50 text-slate-900' },
    { title: 'ভর্তি ও তথ্যের আবেদন', id: 'sec-lead-form', bg: 'bg-blue-950 text-white' },
    { title: 'জিজ্ঞাসিত প্রশ্ন FAQ', id: 'sec-faq', bg: 'bg-white text-slate-800' },
    { title: 'যোগাযোগ ও ম্যাপ 🗺️', id: 'sec-contact', bg: 'bg-slate-900 text-white' }
  ];

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !studentName || !phone) return;
    addLead({
      parentName,
      studentName,
      phone,
      email: email || 'notprovided@school.com',
      desiredClass
    });
    setLeadSuccess(true);
    setTimeout(() => {
      if (onLeadAutoLogin) {
        onLeadAutoLogin(studentName, parentName, phone, desiredClass);
      }
      setLeadSuccess(false);
      setParentName('');
      setStudentName('');
      setPhone('');
      setEmail('');
    }, 1800);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail) return;
    setNewsSuccess(true);
    setTimeout(() => {
      setNewsSuccess(false);
      setNewsEmail('');
    }, 3000);
  };

  // Fees calculator math
  const getCalculatedFee = () => {
    let base = 0;
    if (calcClass === 'Play-KG') base = 1200;
    else if (calcClass === 'Primary') base = 1800;
    else base = 2500;

    let extra = 0;
    if (calcTransport) extra += 1500;
    if (calcStationery) extra += 800;

    return base + extra;
  };

  const scrollToSection = (id: string, index: number) => {
    setActiveSection(index);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative flex min-h-screen bg-slate-50">
      
      {/* COMPREHENSIVE LANDING CONTENT */}
      <main className="min-w-0 flex-1">
        
        {/* SECTION 1: HERO BANNER (RE-DESIGNED POETIC GARDEN & HIGH-CONVERSION ACCUMULATOR) */}
        <section id="sec-hero" className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white px-6 py-12 lg:px-16 border-b border-emerald-900/50">
          
          {/* Garden Aesthetic Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.18)_0%,transparent_60%)] animate-pulse duration-[8s]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.12)_0%,transparent_60%)]"></div>
            
            {/* Subtle Grid overlay for 'Justified/Structured' feel */}
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            {/* Soft drifting golden dusts */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Deep Reflection & Philosophical Paradigm (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* BRAND LOGO OF D-LICON MODEL ACADEMY */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-emerald-950/70 via-slate-900/50 to-indigo-950/30 backdrop-blur-md border-2 border-emerald-500/30 px-6 py-6 rounded-3xl w-full shadow-2xl transition-all hover:border-emerald-400/40 group">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-35 group-hover:opacity-65 transition-opacity"></div>
                  {/* Dynamic Logo Container */}
                  <div className={`h-22 w-22 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30 relative z-10 overflow-hidden ${
                    schoolLogoType === 'image' ? 'bg-white p-2' : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500'
                  }`}>
                    {schoolLogoType === 'crest' && (
                      <svg viewBox="0 0 100 100" className="h-14 w-14 text-white filter drop-shadow-md" fill="currentColor">
                        {/* Shield background */}
                        <path d="M50 5 L85 18 V55 C85 75, 50 90, 50 90 C50 90, 15 75, 15 55 V18 Z" fill="none" stroke="currentColor" strokeWidth="8" />
                        {/* Sparkling growing plant inside shield */}
                        <path d="M50 78 V38 M50 52 C58 45, 68 45, 68 52 C68 58, 55 60, 50 72 M50 52 C42 45, 32 45, 32 52 C32 58, 45 60, 50 72" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                        {/* Sun ray dots */}
                        <circle cx="50" cy="24" r="5" className="fill-amber-300" />
                      </svg>
                    )}
                    {schoolLogoType === 'text' && (
                      <span className="text-white font-sans font-black text-3xl filter drop-shadow-md tracking-normal">
                        {schoolLogoVal}
                      </span>
                    )}
                    {schoolLogoType === 'image' && (
                      <img 
                        src={schoolLogoVal} 
                        alt="Logo" 
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentNode as HTMLDivElement;
                          const fallbackNode = document.createElement('span');
                          fallbackNode.innerText = '🏫';
                          fallbackNode.className = 'text-blue-900 text-3xl font-bold';
                          parent.appendChild(fallbackNode);
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1 space-y-2 w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span className="text-[10px] font-mono tracking-widest text-emerald-400 block uppercase font-black">ESTD 2018</span>
                    <span className="h-1 w-1 bg-amber-400 rounded-full"></span>
                    <span className="text-[9.5px] bg-amber-500/15 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-black">REG-2026</span>
                    <span className="text-[9.5px] bg-emerald-500/15 text-emerald-350 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-black">ডিজিটাল ট্র্যাকিং ও স্মার্ট ক্যাম্পাস সুবিধা</span>
                  </div>
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-emerald-250 tracking-tight block leading-tight font-sans">
                    {schoolName}
                  </span>
                  <span className="text-xs sm:text-sm lg:text-base text-amber-300 block leading-relaxed font-bold border-l-2 border-emerald-500/35 pl-3.5 mt-1 select-text">
                    {schoolSlogan}
                  </span>
                </div>
              </div>

              {/* EYE-CATCHING REFLECTIVE BANNER WITH INTEGRATED INLINE CAROUSEL */}
              <div 
                onMouseEnter={() => setIsHeroHovered(true)}
                onMouseLeave={() => setIsHeroHovered(false)}
                className="bg-emerald-950/60 backdrop-blur-md rounded-3xl border-2 border-emerald-500/30 p-6 mt-4 text-left shadow-2xl relative overflow-hidden transition-all duration-500 select-none group/hero"
              >
                <div className="absolute top-4 right-4 flex gap-1.5 z-20 items-center">
                  {isHeroHovered && (
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black font-sans uppercase animate-pulse leading-none mr-2">
                      ⏸ PAUSED
                    </span>
                  )}
                  {heroSlidesData.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroSlide(idx)}
                      className={`h-2.5 w-2.5 rounded-full transition-all cursor-pointer ${
                        heroSlide === idx ? 'bg-emerald-450 w-5 bg-emerald-400' : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>

                <div className="min-h-[150px] flex flex-col justify-between">
                  <div>
                    <span className="text-[10.5px] font-black tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/20 block w-fit mb-4">
                      {heroSlidesData[heroSlide].badge}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      {heroSlidesData[heroSlide].title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-3 font-normal border-l-2 border-amber-500/40 pl-4 italic">
                      {heroSlidesData[heroSlide].desc}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-emerald-900/40 text-xs text-emerald-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400 animate-pulse shrink-0" />
                      {isHeroHovered ? (
                        <span className="text-amber-300 font-black flex items-center gap-1 animate-pulse font-sans">
                          ⏸ রিডিং মুড: মাউস রেখেই সম্পূর্ণ লেখাটি পড়তে থাকুন
                        </span>
                      ) : (
                        <span>মেধাবিকাশে কঠোর শাসন নয়, পরম প্রণোদনা সৌভাগ্য!</span>
                      )}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setHeroSlide((prev) => (prev - 1 + 4) % 4)}
                        className="h-7 w-7 bg-emerald-900/60 hover:bg-emerald-800 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer transition-all active:scale-[0.9]"
                      >
                        ‹
                      </button>
                      <button 
                        onClick={() => setHeroSlide((prev) => (prev + 1) % 4)}
                        className="h-7 w-7 bg-emerald-950 hover:bg-emerald-800 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer transition-all active:scale-[0.9]"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BENTO PARADIGM TABS OF ASSURANCE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-xs">
                      ✿
                    </span>
                    <h4 className="font-bold text-slate-100 text-xs sm:text-sm">অনুপ্রেরণাই যেখানে পরম সৌভাগ্য</h4>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-snug">
                    এখানে কোনো কঠোর শাসন নেই। নিয়ম-শৃঙ্খলার মিষ্টি ও সুস্পষ্ট অনুশীলনে প্রতিটি শিশু আনন্দের সঙ্গে শেখে ও নিজেকে বিকশিত করে।
                  </p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-6 w-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-extrabold text-xs">
                      ✔
                    </span>
                    <h4 className="font-bold text-slate-100 text-xs sm:text-sm">জাস্টিফাইড নাগরিকের সুদৃঢ় প্রত্যয়</h4>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-snug">
                    শুধু খাতায় লিখে ও মুখস্থ করে শংসাপত্র পাওয়াই শেষ কথা নয়; আমরা বিশ্বাস করি এমন শিক্ষায় যা জীবনের বাস্তব পরীক্ষায় জাস্টিফাইড।
                  </p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-extrabold text-xs">
                      ❤
                    </span>
                    <h4 className="font-bold text-slate-100 text-xs sm:text-sm">উপভোগ্য ও দীর্ঘস্থায়ী শিখন</h4>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-snug">
                    ক্লান্তিকর লেকচার নয়, প্রতিটি শিক্ষার্থী এখানে প্রতিটি মুহূর্ত প্রাণভরে উপভোগ করে এবং মনের গভীরে সযত্নে গেঁথে রাখে।
                  </p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 hover:border-teal-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-6 w-6 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300 font-extrabold text-xs">
                      💡
                    </span>
                    <h4 className="font-bold text-slate-100 text-xs sm:text-sm">অপেক্ষাকৃত দুর্বলদের জন্য বিশেষ পরশ</h4>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-snug">
                    সব শিশুর মেধা সমান নয়, তাই ডিলিকনে পিছিয়ে পড়াদের বাড়তি গুরুত্ব দেওয়া হয় যেন প্রতিটি কলিই প্রস্ফুটিত হবার অধিকার পায়।
                  </p>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Registration Lead form with immediate confirmation (5 cols) */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white/95 text-slate-900 rounded-3xl p-6 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden backdrop-blur-md">
                
                {/* Embedded decorative garden accent inside form */}
                <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 h-24 w-24 bg-amber-500/10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider block">
                      ভর্তি অনুসন্ধান ২০২৬
                    </span>
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-[10px] text-rose-600 font-bold">সীমিত আসন অবশিষ্ট</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                    আজই সিদ্ধান্ত নিন ও আসন নিশ্চিত করুন ⚡
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 mb-5 leading-snug">
                    নিচের মৌলিক তথ্যগুলো প্রদান করে সরাসরি আমাদের এক্সপার্ট প্যানেলের সাথে বিনামূল্যে ভর্তি কাউন্সেলিং সেশন শিডিউল করুন।
                  </p>

                  {leadSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center animate-bounce space-y-3">
                      <div className="h-12 w-12 bg-emerald-500 text-white rounded-full mx-auto flex items-center justify-center text-xl font-black">
                        ✓
                      </div>
                      <h4 className="font-black text-emerald-900 text-base">আবেদন সফল হয়েছে!</h4>
                      <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                        সম্মানিত অভিভাবক, আপনার দেয়া তথ্যে আমাদের প্রধান মালী (শিক্ষক প্রতিনিধি) পরবর্তী ৪ ঘণ্টার মধ্যে সরাসরি ফোনে যোগাযোগ করে ফ্রি ভিজিট ও পরামর্শের সময় নির্ধারণ করে দেবেন।
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ডিলিকন মডেল একাডেমীর প্রতি আপনার আস্থার জন্য ধন্যবাদ।
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="space-y-4">
                      
                      <div>
                        <label className="text-[10.5px] font-extrabold text-slate-700 block mb-1">
                          অভিভাবক মহোদয়ের সম্পূর্ণ নাম *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদাঃ মোহাম্মদ আসিফ হাসান"
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-extrabold text-slate-700 block mb-1">
                          আদরের শিক্ষার্থীর নাম *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদাঃ আয়রা সুবাহ"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10.5px] font-extrabold text-slate-700 block mb-1">
                            মোবাইল নাম্বার *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="যেমন: ০১XXXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10.5px] font-extrabold text-slate-700 block mb-1">
                            আকাঙ্ক্ষিত শ্রেণী *
                          </label>
                          <select
                            value={desiredClass}
                            onChange={(e) => setDesiredClass(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 transition-all"
                          >
                            <option value="Play-Group">প্লে গ্রুপ (বয়স ৩+)</option>
                            <option value="Nursery">নার্সারি (বয়স ৪+)</option>
                            <option value="KG">কেজি (বয়স ৫+)</option>
                            <option value="Class 1">শ্রেণী ১</option>
                            <option value="Class 2">শ্রেণী ২</option>
                            <option value="Class 3">শ্রেণী ৩</option>
                            <option value="Class 4">শ্রেণী ৪</option>
                            <option value="Class 5">শ্রেণী ৫</option>
                            <option value="Class 6">শ্রেণী ৬</option>
                            <option value="Class 7">শ্রেণী ৭</option>
                            <option value="Class 8">শ্রেণী ৮</option>
                            <option value="Class 9">শ্রেণী ৯</option>
                            <option value="Class 10">শ্রেণী ১০</option>
                          </select>
                        </div>
                      </div>

                      {/* Additional reassurance checkpoint */}
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled
                          className="mt-0.5 accent-emerald-600"
                        />
                        <p className="text-[9.5px] text-emerald-800 leading-tight">
                          আমি স্বীকার করছি যে আমি আমার সন্তানকে শুধুমাত্র সার্টিফিকেট নয়, সৎ, সাহসী, সহনশীল ও <strong>Justified নাগরিক</strong> হিসাবে গড়তে ইচ্ছুক।
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-xl transition-all shadow-md focus:outline-none active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-2"
                      >
                        ভর্তি নিশ্চিত করতে এক ক্লিকে বুক করুন 🚀
                      </button>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2">
                        <span>🔓 ব্যক্তিগত তথ্য ১২৮-বিট এনক্রিপশনে সুরক্ষিত</span>
                        <span className="font-bold text-slate-500">মিরপুর ডিলিকন শিক্ষা হাব</span>
                      </div>

                    </form>
                  )}

                  {/* Trust indicator right beneath form */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[9px] text-slate-650 font-bold">
                    <div>
                      <span className="block text-emerald-600 text-[11px] font-black">১০০%</span>
                      শারীরিক শাস্তি মুক্ত কানন
                    </div>
                    <div>
                      <span className="block text-amber-600 text-[11px] font-black">১:১৫</span>
                      শিক্ষক-শিক্ষার্থী অনুপাত
                    </div>
                    <div>
                      <span className="block text-indigo-600 text-[11px] font-black">১০০%</span>
                      বাস্তবভিত্তিক যুগোপযোগী পাঠ
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </section>


        {/* SECTION: GORGEOUS CAMPUS PHOTO SLIDER WITH HEALING POETIC BENGALI CALLOUTS */}
        <section id="sec-mugdhota-slider" className="bg-gradient-to-b from-slate-900 to-slate-950 py-16 px-6 lg:px-16 text-white border-b border-emerald-950 relative overflow-hidden">
          {/* Poetic Ambient Backdrop Lights */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/3 h-96 w-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-emerald-400 bg-emerald-950/60 px-4.5 py-1.5 rounded-full border border-emerald-500/25 uppercase inline-block">
                মুগ্ধতা ছড়ানো প্রগতিশীল ক্যাম্পাস গ্যালারি ও অভিভাবক অনুভূতি
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-250 tracking-tight leading-tight">
                মন থেমে যাক মুগ্ধতায়, সন্তান হাসুক চিরন্তন শ্বাশত অমর শিক্ষায় 🌸
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
                আমাদের প্রতিটি ছবি কেবল একটি দৃশ্য নয়, বরং স্নেহের ডোরে আবদ্ধ একেকটি আদর্শ মানুষ গড়ার জাদুকরী সচিত্র চিত্র। চোখ রাখুন স্লাইডারে, অনুভব করুন আমাদের ভালোবাসা।
              </p>
            </div>

            {/* MAIN IMMERSIVE SLIDER */}
            <div className="relative w-full aspect-[16/13] xs:aspect-[16/11] sm:aspect-[16/10] md:aspect-[16/9] bg-slate-950 rounded-2xl sm:rounded-3.5xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-2 border-slate-800/80 group">
              {/* Slides Container */}
              <div className="absolute inset-0 w-full h-full">
                {campusPhotosData.map((slide, sIdx) => {
                  const isActive = sIdx === activePhotoIndex;
                  return (
                    <div
                      key={sIdx}
                      className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                        isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-95 pointer-events-none'
                      }`}
                    >
                      {/* Huge Background Image */}
                      {!slide.url || campusPhotoErrors[sIdx] ? (
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-emerald-950/80 to-slate-950 flex flex-col items-center justify-center p-8 text-center select-none">
                          <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-3xl mb-4 animate-bounce">
                            🏫
                          </div>
                          <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-widest font-sans mb-1.5">ডি লিকন মডেল একাডেমী</span>
                          <h3 className="text-amber-300 font-black text-xl sm:text-2xl font-sans mt-1 max-w-xl">{slide.title}</h3>
                          <p className="text-slate-350 text-xs sm:text-sm mt-3 max-w-lg leading-relaxed">{slide.caption}</p>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none"></div>
                        </div>
                      ) : (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          referrerPolicy="no-referrer"
                          onError={() => setCampusPhotoErrors(prev => ({ ...prev, [sIdx]: true }))}
                          className="w-full h-full object-cover select-none transition-transform duration-[8000ms] ease-out group-hover:scale-105"
                        />
                      )}
                      
                      {/* Premium Ambient Dark Overlay to protect lower caption typography compatibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                      
                      {/* Live Indicator on Top Corner */}
                      <div className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] font-mono tracking-widest text-emerald-300 font-bold uppercase">ক্যাম্পাস ফ্রেম ০{sIdx + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

               {/* Slider Manual Navigation Arrows */}
              <button
                type="button"
                onClick={() => setActivePhotoIndex((prev) => (prev - 1 + campusPhotosData.length) % campusPhotosData.length)}
                className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-slate-900/70 hover:bg-emerald-500 hover:text-slate-950 font-bold text-white flex items-center justify-center cursor-pointer transition-all border border-white/10 active:scale-90 shadow-2xl brightness-110"
              >
                <span className="text-lg sm:text-2xl leading-none select-none font-sans">‹</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoIndex((prev) => (prev + 1) % campusPhotosData.length)}
                className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-slate-900/70 hover:bg-emerald-500 hover:text-slate-950 font-bold text-white flex items-center justify-center cursor-pointer transition-all border border-white/10 active:scale-90 shadow-2xl brightness-110"
              >
                <span className="text-lg sm:text-2xl leading-none select-none font-sans">›</span>
              </button>

              {/* GIANT CAPTION COUNTER AND TEXT - FIXED AND STYLIZED AT THE BOTTOM */}
              <div className="absolute bottom-0 inset-x-0 z-20 p-4 sm:p-8 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5">
                <div className="flex-1 space-y-1 sm:space-y-1.5 text-left">
                  <span className="text-[9px] sm:text-[10.5px] font-black tracking-widest text-[#10b981] bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 border border-emerald-500/20 rounded uppercase block w-fit font-sans">
                    {campusPhotosData[activePhotoIndex]?.title}
                  </span>
                  <p className="text-[10.5px] xs:text-xs sm:text-base md:text-lg lg:text-xl font-extrabold text-amber-300 leading-relaxed font-sans filter drop-shadow-sm select-text">
                    {campusPhotosData[activePhotoIndex]?.caption}
                  </p>
                </div>
                
                {/* Micro Action Button to drive engagement */}
                <button
                  onClick={() => {
                    const el = document.getElementById('sec-lead-form');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hidden sm:flex shrink-0 self-start sm:self-center px-5 py-2.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-350 active:scale-95 rounded-xl transition duration-200 cursor-pointer items-center gap-1.5 shadow-lg shadow-amber-400/20"
                >
                  সবুজ ক্যাম্পাসে চলুন 🌿
                </button>
              </div>
            </div>

            {/* SELECTION PROGRESS INDICATOR DOTS & POETIC ACCU LINES */}
            <div className="flex flex-col items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-3">
                {campusPhotosData.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setActivePhotoIndex(dotIdx)}
                    className={`h-3 rounded-full transition-all cursor-pointer ${
                      activePhotoIndex === dotIdx 
                        ? 'w-10 bg-gradient-to-r from-emerald-400 to-amber-400 ring-2 ring-emerald-500/40 shadow-md shadow-emerald-500/20' 
                        : 'w-3 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-[11.5px] sm:text-xs text-slate-450 font-bold max-w-lg mx-auto italic border-l-2 border-emerald-500 px-3.5 py-1">
                  &ldquo;শাসন নয়, আনন্দ ও পরম স্নেহেই সুরভিত হোক প্রতিটি ফুটফুটে শিশু—ডি লিকন ক্যাম্পাস সেই স্নেহের এক পরম আঙ্গিনা।&rdquo;
                </p>
              </div>
            </div>

          </div>
        </section>


        {/* SECTION: TODAY'S LIVE CAMPUS BOARD & TERMINAL (৯। আজকের ড্যাশবোর্ড) */}
        <section id="sec-today-campus-dash" className={`bg-slate-950 py-16 px-6 lg:px-16 text-white border-b border-slate-900 relative overflow-hidden ${!isSecVisible('sec-today-campus-dash') ? 'hidden' : ''}`}>
          <div className="absolute inset-0 bg-radial-gradient from-blue-900/20 to-transparent"></div>
          <div className="relative z-10 max-w-6xl mx-auto">
            {/* Center-Aligned Elegant Section Title */}
            <div className="text-center mb-10 pb-6 border-b border-slate-900">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold uppercase tracking-wider text-amber-500 shadow-sm leading-none">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ডিলিকন রিয়েলটাইম ক্যাম্পাস ড্যাশবোর্ড
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 leading-tight">
                {getSecTitle('sec-today-campus-dash', 'আজকের লাইভ ক্যাম্পাস আপডেট')}
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-rose-500 mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Live Widgets Hub: Cohesive 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mb-10 items-stretch">
              {/* ⏳ Time-Warning Reflective Quotes Slideshow */}
              <div 
                onMouseEnter={() => setIsQuoteHovered(true)}
                onMouseLeave={() => setIsQuoteHovered(false)}
                className="bg-slate-900/80 border border-amber-500/25 rounded-2xl p-5 text-xs leading-relaxed text-slate-300 relative overflow-hidden flex flex-col justify-between min-h-[170px] sm:min-h-[150px] shadow-lg shadow-amber-500/5 backdrop-blur-sm transition-all hover:border-amber-500/40 select-none group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 animate-pulse"></div>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 text-xl animate-pulse mt-0.5">⏱</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-amber-500 text-xs uppercase tracking-wider mb-2 flex items-center justify-between border-b border-amber-500/10 pb-1">
                      <span className="flex items-center gap-1.5">
                        <span>সময় সচেতনতা ও জীবন ভাবনা</span>
                        {isQuoteHovered && (
                          <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1 rounded animate-pulse">⏸ FIXED</span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400 font-mono tracking-widest">{activeQuoteIdx + 1}/{timeConsciousQuotes.length}</span>
                    </div>
                    <div className="transition-all duration-500 ease-in-out min-h-[75px] flex items-center py-1">
                      <p className="text-sm sm:text-base md:text-lg font-extrabold text-amber-100 leading-relaxed animate-fadeIn text-left italic tracking-wide">
                        “{timeConsciousQuotes[activeQuoteIdx]}”
                      </p>
                    </div>
                  </div>
                </div>
                {/* Controllers & Indicators */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveQuoteIdx((prev) => (prev - 1 + timeConsciousQuotes.length) % timeConsciousQuotes.length)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-[10px] font-bold"
                      title="পূর্ববর্তী"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQuoteIdx((prev) => (prev + 1) % timeConsciousQuotes.length)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-[10px] font-bold"
                      title="পরবর্তী"
                    >
                      ▶
                    </button>
                  </div>

                  <div className="flex justify-center gap-1">
                    {timeConsciousQuotes.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveQuoteIdx(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === activeQuoteIdx ? 'w-3.5 bg-amber-500' : 'w-1 bg-slate-700 hover:bg-slate-500'
                        }`}
                        title={`উদ্ধৃতি ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <span className="text-[8px] text-slate-500 font-bold select-none leading-none">
                    {isQuoteHovered ? '⏱ স্থির করা আছে' : '⏱ অটো-রানিং'}
                  </span>
                </div>
              </div>

              {/* ⏰ Digital Live Clock */}
              <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 text-right flex flex-col justify-center min-h-[130px] shadow-[0_0_20px_rgba(239,68,68,0.05)] backdrop-blur-sm relative overflow-hidden transition-all hover:border-rose-500/50">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-radial-gradient from-rose-500/10 to-transparent"></div>
                <span className="text-[9px] font-bold text-rose-450 tracking-wider uppercase block mb-1.5">ডিজিটাল লাইভ সময়</span>
                <div className="text-2xl font-mono font-black text-rose-500 tracking-widest leading-none drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse">
                  {formatTimeBn(currentDateTime)}
                </div>
                <span className="text-[8px] text-slate-400 mt-2 block">সেকেন্ড সেকেন্ডে চলমান...</span>
              </div>

              {/* 🌤 Weather & Calendar Section */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-xs text-right text-slate-350 flex items-center justify-between gap-4 backdrop-blur-sm transition-all hover:border-slate-700">
                <div className="text-left">
                  <p className="text-[10px] text-slate-550 uppercase tracking-wider mb-1 font-bold">আবহাওয়া আপডেট</p>
                  <p className="font-bold text-amber-500">কাপাসিয়া, গাজীপুর</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">হালকা মিষ্টি রোদ • ২৮° সেলসিয়াস</p>
                </div>
                <div className="h-10 w-px bg-slate-800"></div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-550 uppercase tracking-wider mb-1 font-bold">আজকের তারিখ</p>
                  <p className="font-bold text-slate-100">{new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono text-emerald-500 font-semibold">সরাসরি আপডেট লাইভ</p>
                </div>
              </div>
            </div>

            {/* Dynamic Calculations */}
            {(() => {
              const todayDateStr = new Date().toISOString().split('T')[0];
              const totalStudentsCount = students?.length || 0;
              const uniqueStudentsScannedToday = new Set(
                (attendanceLogs || [])
                  .filter(l => l.targetType === 'student' && l.type === 'Check-In' && l.timestamp.startsWith(todayDateStr))
                  .map(l => l.targetId)
              ).size;
              const studentPercentage = totalStudentsCount > 0 
                ? ((uniqueStudentsScannedToday / totalStudentsCount) * 100).toFixed(1) 
                : '0.0';

              const totalEmployeesCount = employees?.length || 0;
              const uniqueStaffScannedToday = new Set(
                (attendanceLogs || [])
                  .filter(l => l.targetType === 'employee' && l.type === 'Check-In' && l.timestamp.startsWith(todayDateStr))
                  .map(l => l.targetId)
              ).size;
              const staffPercentage = totalEmployeesCount > 0 
                ? ((uniqueStaffScannedToday / totalEmployeesCount) * 100).toFixed(1) 
                : '0.0';

              const totalRequisitionsCount = requisitions?.length || 0;
              const pendingRequisitionsCount = (requisitions || []).filter(r => r.status.includes('Pending')).length;

              const statsList = [
                { 
                  label: 'শিক্ষার্থী উপস্থিতি', 
                  count: `${studentPercentage}%`, 
                  detail: totalStudentsCount > 0 && uniqueStudentsScannedToday > 0 
                    ? `${uniqueStudentsScannedToday} জন বর্তমানে স্কুলে উপস্থিত` 
                    : 'কোনো শিক্ষার্থী কার্ড এখনো পাঞ্চ করা হয়নি', 
                  bg: 'from-blue-900/50 to-blue-950' 
                },
                { 
                  label: 'শিক্ষক ও স্টাফ ডিউটি', 
                  count: `${staffPercentage}%`, 
                  detail: totalEmployeesCount > 0 && uniqueStaffScannedToday > 0 
                    ? `${uniqueStaffScannedToday} জন বর্তমানে কর্মরত সক্রিয়` 
                    : 'কোনো কর্মকর্তা আজ কার্ড পাঞ্চ করেননি', 
                  bg: 'from-emerald-900/50 to-emerald-950' 
                },
                { 
                  label: 'আজকের রিকুইজিশন', 
                  count: `${pendingRequisitionsCount}টি রানিং`, 
                  detail: totalRequisitionsCount > 0 
                    ? `${totalRequisitionsCount}টি মোট রিকুইজিশন সাবমিট ট্রেইল` 
                    : 'কোনো রিকুইজিশন পেন্ডিং নেই', 
                  bg: 'from-amber-900/50 to-amber-950' 
                },
              ];

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {statsList.map((stat, idx) => (
                    <div key={idx} className={`bg-gradient-to-br ${stat.bg} p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg`}>
                      <p className="text-xs text-slate-400 font-bold uppercase">{stat.label}</p>
                      <p className="text-3.5xl font-extrabold text-white mt-1.5 mb-1 text-amber-500">{stat.count}</p>
                      <p className="text-[11px] text-slate-300">{stat.detail}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* live marquee updates and reminders */}
            <div className="mt-8 bg-slate-950 border-2 border-red-500 p-6 rounded-2xl flex flex-col md:flex-row gap-5 items-center shadow-2xl shadow-red-500/10">
              <span className="bg-red-600 border border-red-550 text-white text-xs md:text-sm font-black px-4 py-2.5 rounded-xl tracking-wider shrink-0 uppercase animate-pulse shadow-md flex items-center gap-1.5">
                📢 জরুরি ফ্লো নোটিশ:
              </span>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-rose-200 leading-relaxed text-center md:text-left drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.6)]">
                "আজ বিকাল ৪.০০ টায় ৬ষ্ঠ শ্রেণীর বিশেষ অনলাইন অভিভাবক কুইজ অনুষ্ঠিত হবে। সংশ্লিষ্ট সকল শিক্ষার্থীদের যথাসময়ে আইডি পাঞ্চ করে লগইন থাকার অনুরোধ করা হলো।"
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: MERIT STUDENTS (১। কৃতি শিক্ষার্থী) */}
        <section id="sec-merit-students" className={`bg-white py-16 px-6 lg:px-16 border-b border-slate-100 ${!isSecVisible('sec-merit-students') ? 'hidden' : ''}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center md:max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold text-amber-600 block mb-1">আমাদের স্কুলের অহংকার</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-950">{getSecTitle('sec-merit-students', 'সাফল্যের শিখরে: কৃতি শিক্ষার্থী প্রদর্শনী')}</h2>
              <p className="text-slate-600 text-xs mt-2">
                ডিলিকন মডেল একাডেমীর বোর্ড পরীক্ষা, জাতীয় কুইজ প্রতিযোগিতা এবং অলিম্পিয়াডে চমৎকার অবদান রাখা মেধাবী নক্ষত্রদের তালিকা।
              </p>
            </div>

             {(() => {
               const list = meritStudents || [];
               if (list.length === 0) {
                 return (
                   <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
                     <p className="text-slate-500 text-sm font-sans">কোনো কৃতি শিক্ষার্থী এখনও নিবন্ধিত হয়নি।</p>
                   </div>
                 );
               }
               const student = list[meritSlide] || list[0];
               if (!student) return null;

               return (
                 <div 
                   onMouseEnter={() => setIsMeritHovered(true)}
                   onMouseLeave={() => setIsMeritHovered(false)}
                   className="relative max-w-4xl mx-auto rounded-3xl bg-slate-950 p-6 md:p-10 border border-slate-800 shadow-2xl select-none overflow-hidden transition-all duration-300 text-left"
                 >
                   {/* Living Aurora Lights Background inside the slate container */}
                   <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                     <motion.div 
                       animate={{ 
                         scale: [1, 1.25, 1], 
                         x: [-30, 40, -30], 
                         y: [-25, 30, -25] 
                       }}
                       transition={{ 
                         duration: 12, 
                         repeat: Infinity, 
                         ease: "easeInOut" 
                       }}
                       className="absolute top-[-20%] left-[-20%] w-96 h-96 rounded-full bg-indigo-600/30 blur-[80px]"
                     />
                     <motion.div 
                       animate={{ 
                         scale: [1.2, 0.95, 1.2], 
                         x: [40, -30, 40], 
                         y: [30, -25, 30] 
                       }}
                       transition={{ 
                         duration: 15, 
                         repeat: Infinity, 
                         ease: "easeInOut" 
                       }}
                       className="absolute bottom-[-20%] right-[-20%] w-[450px] h-[450px] rounded-full bg-emerald-500/15 blur-[100px]"
                     />
                     <motion.div 
                       animate={{ 
                         scale: [0.9, 1.15, 0.9], 
                         x: [20, -20, 20], 
                         y: [-40, 20, -40] 
                       }}
                       transition={{ 
                         duration: 18, 
                         repeat: Infinity, 
                         ease: "easeInOut" 
                       }}
                       className="absolute top-[30%] left-[25%] w-80 h-80 rounded-full bg-amber-500/15 blur-[90px]"
                     />
                   </div>

                   {/* Main Slider Content Holder */}
                   <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-stretch min-h-[300px]">
                     {/* Left: Large portrait photo with thick amber-gold borders and shadow effect */}
                     <div className="w-48 h-60 md:w-56 md:h-72 rounded-2xl border-4 border-amber-400 shadow-xl shadow-amber-400/10 overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center relative group">
                       {!student.photoUrl || studentPhotoErrors[meritSlide] ? (
                         <div className="font-black text-amber-400 text-6xl font-sans select-none flex flex-col items-center justify-center">
                           <span>{student.name ? student.name[0] : '★'}</span>
                         </div>
                       ) : (
                         <img 
                           src={student.photoUrl} 
                           alt={student.name} 
                           referrerPolicy="no-referrer"
                           onError={() => setStudentPhotoErrors(prev => ({ ...prev, [meritSlide]: true }))}
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                         />
                       )}
                       
                       {/* Floating Luxury Star Badge */}
                       <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-lg text-[9px] px-2 py-0.5 shadow-lg border border-amber-300 uppercase font-sans flex items-center gap-1">
                         <span>★ HERO</span>
                       </div>

                       {/* Interactive Pause overlay indication */}
                       {isMeritHovered && (
                         <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center transition-all duration-300">
                           <span className="text-[10px] bg-slate-900/95 text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-full font-black tracking-widest font-sans uppercase animate-pulse">
                             ⏸ READING FEED (PAUSED)
                           </span>
                         </div>
                       )}
                     </div>

                     {/* Right: Rich textual display */}
                     <div className="flex-1 flex flex-col justify-between text-left">
                       <div>
                         {/* Class and Award Badges */}
                         <div className="flex flex-wrap gap-2 mb-3">
                           <span className="bg-amber-400/10 text-amber-300 text-[10px] font-black tracking-wider px-3 py-1 rounded-full border border-amber-400/20 uppercase inline-block font-sans">
                             ★ {student.award || 'কৃতি তারকা'}
                           </span>
                           <span className="bg-indigo-500/10 text-indigo-300 text-[10px] font-extrabold tracking-wide px-3 py-1 rounded-full border border-indigo-500/20 inline-block font-sans">
                             {student.className || student.class || 'শ্রেণী উল্লেখ নেই'}
                           </span>
                         </div>

                         {/* Student Name with Golden Gradient Accent */}
                         <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-orange-100 text-2xl md:text-3.5xl leading-tight tracking-tight select-text">
                           {student.name}
                         </h3>

                         {/* Achievement/Success Highlight Box */}
                         <div className="mt-4 inline-block">
                           <span className="bg-emerald-500/10 text-emerald-300 text-xs font-black px-3.5 py-1.5 rounded-lg border border-emerald-500/20 inline-flex items-center gap-2 shadow-xs">
                             <span className="text-sm select-none">🏆</span> 
                             <span className="font-sans font-extrabold">{student.achievement}</span>
                           </span>
                         </div>

                         {/* Heartfelt Quote/Opinion */}
                         <div className="text-slate-300 text-sm md:text-base leading-relaxed mt-6 pt-5 border-t border-slate-800/80 italic relative">
                           <span className="text-amber-500/40 text-4xl font-serif absolute -top-2 -left-2 select-none leading-none">“</span>
                           <p className="pl-6 font-sans font-medium tracking-wide">
                             {student.quote}
                           </p>
                         </div>
                       </div>

                       {/* Dynamic Read Time Countdown bar */}
                       <div className="mt-6 pt-3 border-t border-slate-800/40 flex items-center justify-between text-xs text-slate-400 font-bold">
                         <span className="flex items-center gap-1 text-slate-400">
                           {isMeritHovered ? '⏸ মাউস ধরে রেখেছেন - সময় স্থির আছে' : '✨ স্বয়ংক্রিয়ভাবে স্লাইড পরিবর্তন হচ্ছে'}
                         </span>
                         
                         {/* Manual Arrows Navigation Overlay */}
                         <div className="flex gap-2">
                           <button 
                             type="button"
                             onClick={() => {
                               setMeritSlide((prev) => (prev - 1 + list.length) % list.length);
                               setIsMeritHovered(true);
                             }}
                             className="h-8 w-8 bg-slate-900 border border-slate-850 hover:border-amber-400/55 hover:bg-slate-800 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer transition-all active:scale-[0.9] text-white"
                             title="পূর্ববর্তী কৃতি ছাত্র"
                           >
                             ‹
                           </button>
                           <span className="self-center text-[10px] font-mono text-slate-500 tracking-wider px-1">
                             {meritSlide + 1} / {list.length}
                           </span>
                           <button 
                             type="button"
                             onClick={() => {
                               setMeritSlide((prev) => (prev + 1) % list.length);
                               setIsMeritHovered(true);
                             }}
                             className="h-8 w-8 bg-slate-900 border border-slate-850 hover:border-amber-400/55 hover:bg-slate-800 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer transition-all active:scale-[0.9] text-white"
                             title="পরবর্তী কৃতি ছাত্র"
                           >
                             ›
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Sleek Progress Timer Bar that freezes on hover */}
                   <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 overflow-hidden">
                     <motion.div 
                       key={`${meritSlide}-${isMeritHovered}`}
                       initial={{ width: "0%" }}
                       animate={{ width: "100%" }}
                       transition={isMeritHovered ? { duration: 0 } : { duration: 14, ease: "linear" }}
                       className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300"
                     />
                   </div>
                 </div>
               );
             })()}
          </div>
        </section>

        {/* SECTION: ALL TEACHERS (২। সকল শিক্ষকগন) */}
        <section id="sec-all-teachers" className={`bg-slate-50 py-16 px-6 lg:px-16 border-b border-slate-205 ${!isSecVisible('sec-all-teachers') ? 'hidden' : ''}`}>
          <div className="max-w-6xl mx-auto">
            {/* Split Top Panel: Section Header & Toggle Metrics */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 mb-10 gap-6">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block mb-2 uppercase tracking-wide animate-pulse">
                  🎖️ আমাদের আসল হিরো প্যানেল
                </span>
                <h2 className="text-2xl md:text-3.5xl font-black text-slate-900">আমাদের "যুদ্ধ জয়ী বীর বিক্রম" প্রথিতযশা শিক্ষকমণ্ডলী</h2>
                <p className="text-slate-650 text-xs mt-1.5 max-w-xl">
                  ডিলিকন মডেল একাডেমীর আসল চালিকাশক্তি ও আমাদের গর্ব। আধুনিক বিজ্ঞান মনস্ক শিক্ষা ও উন্নত সুনাগরিক গড়ে তোলার মহৎ সংগ্রামে নিয়োজিত বিজয়ী বীরসৈনিকবৃন্দ।
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex flex-col justify-center text-right min-w-[124px] shadow-sm">
                  <span className="text-[9px] uppercase font-bold text-slate-400">মোট সক্রিয় শিক্ষক</span>
                  <span className="text-lg font-black text-blue-900 leading-none mt-1">
                    {(() => {
                      const defaultCount = 4;
                      const dynamicCount = (employees || []).filter(emp => emp.role === 'Teacher').length;
                      return `${defaultCount + dynamicCount} জন`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Directory List Container */}
              <div className="lg:col-span-12 space-y-6">
                
                {/* Search Bar Widget inside Directory */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">🔍</div>
                  <input
                    type="text"
                    placeholder="নাম, বিষয় বা যোগ্যতা লিখে ডিরেক্টরিতে খুঁজুন..."
                    value={tQuery}
                    onChange={e => setTQuery(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-550 border border-slate-200 text-slate-800 placeholder-slate-400 font-medium"
                  />
                  {tQuery && (
                    <button
                      onClick={() => setTQuery('')}
                      className="text-[10px] text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded"
                    >
                      ক্লিয়ার
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {(() => {
                    const defaultTeachers = [
                      { id: 't1', name: 'জনাব আশরাফুল আমিন', title: 'বিভাগীয় প্রধান (রসায়ন)', qual: 'এম.এসসি (ঢাকা বিশ্ববিদ্যালয়)', phone: '০১৭১১-**৪৫৬', iconText: 'AA' },
                      { id: 't2', name: 'মিস ফারহানা চৌধুরী', title: 'সিনিয়র গণিত ইনструкক্টর', qual: 'বি.এসসি (বুয়েট), এমএস', phone: '০১৭২২-**৭৮৯', iconText: 'FC' },
                      { id: 't3', name: 'জনাব মো: রেজওয়ানুর রহমান', title: 'ইংরেজী ও ফনিক্স বিশেষজ্ঞ', qual: 'এম.এ ইন ইংলিশ (জাহাঙ্গীরনগর)', phone: '০১৮১১-**২৩৪', iconText: 'RR' },
                      { id: 't4', name: 'মিস শাকিলা শারমিন', title: 'আইসিটি কো-অর্ডিনেটর', qual: 'বি.এসসি ইন সিএসই (জগন্নাথ)', phone: '০১৯১১-**৫৬৭', iconText: 'SS' }
                    ];

                    const dynamicTeachers = (employees || [])
                      .filter(emp => emp.role === 'Teacher')
                      .map(emp => {
                        const subject = emp.subject || (emp.name === 'Nusrat Jahan' ? 'ইংরেজী সিনিয়র শিক্ষক' : emp.name === 'Zahangir Alam' ? 'আইসিটি ও বিজ্ঞান শিক্ষক' : 'সহকারী শিক্ষক');
                        const qualification = emp.qualification || (emp.name === 'Nusrat Jahan' ? 'এম.এ ইন ইংলিশ (ঢাকা বিশ্ববিদ্যালয়)' : emp.name === 'Zahangir Alam' ? 'বি.এসসি ইন সিএসই (বুয়েট)' : 'সম্মান ও বি.এড সম্পন্ন');
                        const words = emp.name.split(' ');
                        const iconText = words.map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'TR';
                        return {
                          id: emp.id,
                          name: emp.banglaName || emp.name,
                          title: subject,
                          qual: qualification,
                          phone: emp.phone,
                          iconText: iconText,
                          isDynamic: true,
                          salary: emp.salary
                        };
                      });

                    const combined = [...defaultTeachers, ...dynamicTeachers];

                    const filtered = combined.filter(t => {
                      if (!tQuery) return true;
                      const q = tQuery.toLowerCase();
                      return (
                        t.name.toLowerCase().includes(q) ||
                        t.title.toLowerCase().includes(q) ||
                        t.qual.toLowerCase().includes(q)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="col-span-full py-12 px-4 text-center bg-white border border-slate-200 rounded-2xl w-full">
                          <p className="text-sm font-bold text-slate-500">"{tQuery}"-এর সাথে মিলে যাওয়া কোনো শিক্ষক পাওয়া যায়নি।</p>
                          <p className="text-xs text-slate-400 mt-1">অনুগ্রহ করে বানান যাচাই করুন অথবা নতুন শিক্ষকের তথ্য এন্ট্রি করুন।</p>
                        </div>
                      );
                    }

                    return filtered.map((teacher, idx) => (
                      <div key={teacher.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:shadow-lg transition-all text-center flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-amber-500 to-indigo-950"></div>
                        {teacher.isDynamic && (
                          <span className="absolute top-2.5 right-2.5 bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-250 uppercase tracking-widest leading-none font-sans">
                            সরাসরি ডাটা এন্ট্রি
                          </span>
                        )}
                        <div>
                          <div className="relative h-16 w-16 mx-auto mb-4">
                            <div className="h-full w-full bg-gradient-to-tr from-blue-900 via-indigo-950 to-amber-500 rounded-full flex items-center justify-center font-bold text-white text-base shadow-sm group-hover:scale-105 transition-transform duration-300">
                              {teacher.iconText}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-300 text-[8px] text-slate-950 font-black rounded-md px-1 py-0.5 shadow-sm uppercase scale-90 tracking-tighter">
                              🎖️ HERO
                            </div>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-sm">{teacher.name}</h4>
                          <p className="text-xs text-blue-900 font-bold mt-1 inline-block bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100">
                            {teacher.title}
                          </p>
                          <p className="text-[10.5px] text-slate-500 mt-2.5 leading-normal">{teacher.qual}</p>
                        </div>
                        
                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col gap-1.5 text-[10px]/normal text-left">
                          <div className="flex justify-between items-center text-slate-450 gap-1 flex-wrap">
                            <span>যোগাযোগ: <span className="font-mono text-slate-750 font-semibold">{teacher.phone}</span></span>
                            {teacher.isDynamic && teacher.salary && (
                              <span className="font-mono font-bold text-emerald-700 bg-emerald-50/40 border border-emerald-100 px-1 rounded">৳{teacher.salary}</span>
                            )}
                          </div>
                          <button 
                            type="button"
                            onClick={() => alert(`জনাব ${teacher.name} কে মেসেজ পাঠাতে সার্ভিস পোর্টালে শিক্ষক হিসেবে সাইন ইন করুন।`)}
                            className="w-full bg-slate-50 hover:bg-blue-900 group-hover:bg-blue-900 hover:text-white group-hover:text-white text-slate-700 font-bold py-1.5 rounded-lg transition-all text-center cursor-pointer"
                          >
                            বার্তা পাঠান
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION: CULTURAL STATION (৩। কালচারাল স্টেশন) */}
        <section id="sec-cultural-station" className="bg-slate-100 py-16 px-6 lg:px-16 border-b border-slate-200">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10 items-center">
            <div className="lg:w-1/2">
              <span className="rounded bg-indigo-100 border border-indigo-200 px-3 py-1 text-[10px] font-bold text-indigo-700 uppercase tracking-wider inline-block mb-3">
                ডিলিকন মিউজিক ও আর্ট স্টেশন
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">কালচারাল স্টেশন: ঐতিহ্য ও সংস্কৃতির মিলনমেলা</h2>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                শিক্ষা কেবল সিলেবাসে সীমাবদ্ধ নয়! ডিলিকন কালচারাল স্টেশনে কবিতা আবৃত্তি, রবীন্দ্র-নজরুল জয়ন্তী, নাটক মঞ্চায়ন এবং বার্ষিক ডিবেট ফেস্টিভ্যালের চমৎকার পরিবেশ তৈরি করা হয়েছে।
              </p>
              
              <div className="mt-6 space-y-4">
                {[
                  { title: 'স্বাধীনতা দিবস কবিতা আবৃত্তি উৎসব', desc: 'সকল শিক্ষার্থীর শ্রুতিমধুর আবৃত্তি চর্চার ডেমো রেকর্ডিংস।' },
                  { title: 'সাপ্তাহিক রিয়েলটাইম ডিবেটিং শোকাংকন', desc: 'বিতর্ক ক্লাবের পক্ষ থেকে লাইভ সেশন ও ট্রায়াল শো।' }
                ].map((item, id) => (
                  <div key={id} className="flex gap-3 items-start bg-white p-3.5 rounded-lg border border-slate-200">
                    <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-750 font-bold shrink-0 flex items-center justify-center text-[10px]">✔</span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{item.title}</h4>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 bg-white p-6 rounded-2xl border border-slate-250 shadow-md w-full space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  কালচারাল বিশেষ ইভেন্ট প্লেয়ার 📺
                </h3>
                <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  ইউটিউব লাইভ ফিড
                </span>
              </div>

              {(() => {
                const activeItem = culturalPlaylist.find(item => item.id === activeCulturalVideoId) || culturalPlaylist[0];
                const videoId = getYouTubeId(activeItem.url);

                return (
                  <div className="space-y-4">
                    {/* VIDEO FEED CONTAINER */}
                    <div className="bg-slate-950 text-white rounded-xl border border-slate-850 p-3 overflow-hidden shadow-lg relative">
                      {isPlayingCulturalVideo && videoId ? (
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-800">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title={activeItem.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            referrerPolicy="no-referrer"
                            className="w-full h-full"
                          ></iframe>
                        </div>
                      ) : (
                        <div className="aspect-video w-full rounded-lg bg-slate-900 border border-slate-800 relative flex flex-col items-center justify-center p-4 text-center group overflow-hidden">
                          {/* Ambient background accent */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-0 opacity-80"></div>
                          
                          {/* Big animated play trigger button */}
                          <button
                            onClick={() => setIsPlayingCulturalVideo(true)}
                            className="h-14 w-14 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-xl border border-rose-450/30 z-10 transition-transform active:scale-95 cursor-pointer hover:scale-105 duration-200"
                          >
                            ▶
                          </button>
                          
                          <div className="mt-4 z-10">
                            <span className="bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase inline-block mb-1">
                              PRESENTS SPECIAL EVENT
                            </span>
                            <h4 className="font-extrabold text-xs text-white leading-snug max-w-xs">{activeItem.title}</h4>
                            <p className="text-[9px] text-slate-400 mt-1">ক্লিক করে ভিডিও স্ট্রিমটি সচল করুন</p>
                          </div>
                        </div>
                      )}

                      {/* Video playback metadata status */}
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-850 text-[10px] text-slate-400">
                        <span className="font-mono text-emerald-400 font-bold">● {isPlayingCulturalVideo ? "PLAYING STREAM" : "STANDBY MODE"}</span>
                        <span className="font-sans">{activeItem.views} জন শিক্ষার্থী দেখেছে</span>
                      </div>
                    </div>

                    {/* SELECT FROM PLAYLIST */}
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">ইভেন্ট প্লেলিস্ট বাছুনঃ</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {culturalPlaylist.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveCulturalVideoId(item.id);
                              setIsPlayingCulturalVideo(true);
                              // Increment views locally
                              setCulturalPlaylist(prev => prev.map(p => p.id === item.id ? { ...p, views: p.views + 1 } : p));
                            }}
                            className={`text-left p-2 rounded-xl border transition-all text-[11px] flex flex-col justify-between h-14 cursor-pointer ${
                              activeCulturalVideoId === item.id
                                ? 'bg-indigo-50 border-indigo-250 text-indigo-900 font-extrabold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="line-clamp-1 leading-tight">{item.title}</span>
                            <span className="text-[8.5px] font-semibold text-slate-400 block mt-0.5">
                              ▷ {item.views} ভিউজ
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DYNAMIC URL FORMS WITH GRAPHICAL WRITING SHAPE */}
                    <div className="bg-slate-55 p-4 border border-indigo-100 rounded-2xl space-y-3">
                      <div className="flex items-center gap-1.5 text-indigo-900 animate-pulse">
                        <span className="text-xs font-black">🔗 কালচারাল ইভেন্টে নিজের ভিডিও লিংক সংযোগ দিনঃ</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug">
                        ইউটিউব ভিডিও-র লিংক কিংবা ১১ সংখ্যার ইউনিক ভিডিও আইডি নিচের বক্সে পেস্ট করে বাটনে চাপ দিন। প্লেয়ারটি স্বয়ংক্রিয়ভাবে ভিডিও সচল করবে।
                      </p>

                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-black text-slate-500 block mb-0.5">অনুষ্ঠানের নাম (শিরোনাম):</label>
                            <input
                              type="text"
                              placeholder="যেমন: বিজয় দিবস আবৃত্তি প্রতিযোগিতা ২০২৬"
                              value={customCulturalTitle}
                              onChange={(e) => {
                                setCustomCulturalTitle(e.target.value);
                                setCulturalInputError('');
                              }}
                              className="w-full bg-white border border-slate-250 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-500 block mb-0.5">ইউটিউব ইউআরএল লিংক / আইডিঃ</label>
                            <input
                              type="text"
                              placeholder="https://www.youtube.com/watch?v=..."
                              value={customCulturalUrl}
                              onChange={(e) => {
                                setCustomCulturalUrl(e.target.value);
                                setCulturalInputError('');
                              }}
                              className="w-full bg-white border border-slate-250 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        {culturalInputError && (
                          <p className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                            ⚠ {culturalInputError}
                          </p>
                        )}

                        <button
                          onClick={() => {
                            if (!customCulturalTitle.trim()) {
                              setCulturalInputError('অনুগ্রহ করে স্পেশাল কালচারাল ইভেন্টের একটি নাম অথবা শিরোনাম টাইপ করুন।');
                              return;
                            }
                            if (!customCulturalUrl.trim()) {
                              setCulturalInputError('দয়া করে ইউটিউব লিংক অথবা ভিডিও আইডি ইনপুট দিন।');
                              return;
                            }

                            const extractedId = getYouTubeId(customCulturalUrl);
                            if (!extractedId || extractedId.length !== 11) {
                              setCulturalInputError('আপনার দেয়া ইনপুট থেকে কোনো ইউটিউব আইডি পাওয়া যায়নি। অনুগ্রহ করে সঠিক লিংক প্রদান করুন (যেমন: https://www.youtube.com/watch?v=dQw4w9WgXcQ)।');
                              return;
                            }

                            const newId = 'cp_' + Date.now();
                            const newEvent = {
                              id: newId,
                              title: customCulturalTitle.trim() + ' 🌟',
                              url: customCulturalUrl.trim(),
                              views: 1
                            };

                            setCulturalPlaylist(prev => [newEvent, ...prev]);
                            setActiveCulturalVideoId(newId);
                            setIsPlayingCulturalVideo(true);
                            setCustomCulturalTitle('');
                            setCustomCulturalUrl('');
                            setCulturalInputError('');
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 rounded-xl transition-all cursor-pointer shadow-sm text-center"
                        >
                          ভিডিও লোড করে প্লেয়ার সচল করুন 🚀
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* SECTION: PHOTO GALLERY (৪। ফটো গ্যালারী) */}
        <section id="sec-campus-gallery-new" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
              <div>
                <span className="text-xs font-bold text-amber-600 block mb-1">ক্যাম্পাস মুহূর্তসমূহ</span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-950">ফটো গ্যালারী: ক্যাম্পাসের প্রাণবন্ত স্মৃতি</h2>
              </div>
              
              {/* Category filters */}
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-lg">
                {['All', 'Sports', 'Labs', 'Events'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGalleryFilter(cat)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      galleryFilter === cat ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-205'
                    }`}
                  >
                    {cat === 'All' ? 'সব ছবি' : cat === 'Sports' ? 'খেলাধুলা' : cat === 'Labs' ? 'গবেষণাগার' : 'বিশেষ ইভেন্ট'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'বার্ষিক ফুটবল টুর্নামেন্ট চ্যাম্পিয়নশিপ', label: 'Sports', bg: 'from-emerald-450 to-teal-500', desc: 'মিরপুর স্টেডিয়াম ফেস্টিভ্যাল' },
                { title: 'রসায়ন গবেষণাগারের হাতে-কলমে প্রজেক্ট', label: 'Labs', bg: 'from-amber-450 to-orange-500', desc: 'শিক্ষার্থীদের রাসায়নিক ট্রায়াল' },
                { title: 'মাল্টিমিডিয়া প্রজেক্টর সংযুক্ত স্মার্ট ক্লাস', label: 'Events', bg: 'from-blue-450 to-indigo-500', desc: 'আইসিটি ইন্টারেক্টিভ কুইজ' },
                { title: '২১শে ফেব্রুয়ারি প্রভাতফেরি র্যালি', label: 'Events', bg: 'from-purple-450 to-rose-500', desc: 'শহীদ স্মরণে শ্রদ্ধা নিবেদন' },
                { title: 'বার্ষিক কৃতি মেধা পুরস্কার বিতরণী', label: 'Events', bg: 'from-sky-450 to-blue-600', desc: 'প্রধান অতিথি ও শিক্ষকদের অভিভাবন' },
                { title: 'ডিজিটাল ট্র্যাকার কার্ড রিডার গেটিং', label: 'Labs', bg: 'from-emerald-400 to-indigo-500', desc: 'আরএফআইডি রিয়েলটাইম এন্ট্রি' }
              ].filter(img => galleryFilter === 'All' || img.label === galleryFilter).map((img, idx) => (
                <div key={idx} className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all hover:shadow-md">
                  <div className={`h-48 bg-gradient-to-tr ${img.bg} text-white flex flex-col justify-end p-4 transition-all group-hover:scale-[1.02] duration-300 relative`}>
                    <span className="absolute top-3 left-3 bg-slate-900/60 text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                      {img.label}
                    </span>
                    <p className="font-bold text-xs">{img.title}</p>
                    <p className="text-[10px] text-slate-100 opacity-90 mt-0.5">{img.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: BLOG (৫। ব্লগ) */}
        <section id="sec-school-blog" className="bg-slate-55 py-16 px-6 lg:px-16 border-b border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center md:max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold text-indigo-650 block mb-1">একাডেমিক ব্লগ পোস্ট</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">ডিলিকন ব্লগ: জ্ঞানচর্চ্চা ও সফল ক্যারিয়ার গাইড</h2>
              <p className="text-slate-600 text-xs mt-2">
                আমাদের ক্যাম্পাসের শিক্ষক মণ্ডলী ও বিশিষ্ট অতিথিদের লেখা শিক্ষণীয় প্রবন্ধ এবং গুরুত্বপূর্ণ ট্রিপস।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'b1', title: 'কিভাবে গণিতের ভয় কাটিয়ে উঠবেন?', author: 'মিস ফারহানা চৌধুরী (গণিত শিক্ষক)', read: '৪ মিনিট রিড', intro: 'প্রাথমিক স্তরে গাণিতিক সূত্র মুখস্থ করার চেয়ে চিত্রের সাহায্যে সমস্যা সমাধান করা বেশি ফলদায়ক। চলুন সহজ পাঁচটি কৌশল জেনে নিই...', content: 'সূত্রগুলো সরাসরি মুখস্থ করার পরিপক্বে খাতা এঁকে বুঝুন। নিয়মিত অন্তত ১৫ মিনিট বেসিক চর্চা রাখুন!' },
                { id: 'b2', title: 'ডিজিটাল স্ক্রিন ব্যবহারের সঠিক এবং স্বাস্থ্যকর নিয়ম', author: 'ম্যানেজমেন্ট হেলথ টিম', read: '৩ মিনিট রিড', intro: 'স্মার্টফোন এবং মাল্টিমিডিয়া স্ক্রিন ব্যবহারের ফলে যেন চোখের ক্লান্তি না আসে তা নিশ্চিত করতে ২০-২০-২০ নিয়মটি অত্যন্ত আবশ্যক...', content: 'টানা ২০ মিনিট পড়ার পর ২০ ফিট দুরত্বের কোনো বস্তুর দিকে অন্তত ২০ সেকেন্ড তাকিয়ে থাকুন। এতে চোখের পেশী সচল থাকে।' },
                { id: 'b3', title: '২০২৬ সালের এস.এস.সি প্রস্তুতি গাইডলাইন', author: 'মেজর এম রফিকুল ইসলাম (অধ্যক্ষ)', read: '৬ মিনিট রিড', intro: 'পরীক্ষার আগের শেষ ৩ মাসের স্টাডি রুটিন কেমন হওয়া উচিত? বিজ্ঞান ও মানবিক বিভাগের শিক্ষার্থীদের জন্য বিশেষ নির্দেশনা...', content: 'প্রথম দেড় মাসে টেস্ট পেপার সমাধান এবং শেষ দেড় মাসে প্রতি সপ্তাহে অন্তত ৩টি বোর্ড মানের পরীক্ষার মহড়া দিন।' }
              ].map((blog) => (
                <div key={blog.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-2">
                      <span>{blog.author}</span>
                      <span>{blog.read}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">{blog.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{blog.intro}</p>
                    <div className="bg-slate-50 p-2.5 rounded text-[10px] text-slate-500 border border-slate-100 hidden group-hover:block">
                      {blog.content}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4 flex items-center justify-between">
                    <button 
                      onClick={() => {
                        const isLiked = likedBlogs[blog.id];
                        setLikedBlogs(prev => ({ ...prev, [blog.id]: !isLiked }));
                        setBlogLikes(prev => ({ ...prev, [blog.id]: isLiked ? prev[blog.id] - 1 : prev[blog.id] + 1 }));
                      }}
                      className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${
                        likedBlogs[blog.id] ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <span className="text-sm">♥</span>
                      <span>{blogLikes[blog.id]} ভালবাসা প্রকাশ করুন</span>
                    </button>
                    <button 
                      onClick={() => alert(`নিবন্ধের সম্পূর্ণ সংস্করণ ও ডাউনলোড লিঙ্ক দেখতে আপনার ছাত্র পোর্টালে সাইন-ইন নিশ্চিত করুন।`)}
                      className="text-indigo-600 hover:text-indigo-855 text-[11px] font-bold"
                    >
                      আরো পড়ুন →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: DTUBE (৬। ডিটিউব) */}
        <section id="sec-dtube-video-hub" className="bg-slate-900 py-16 px-6 lg:px-16 text-white border-b border-slate-950 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center md:max-w-xl mx-auto mb-10">
              <span className="rounded bg-sky-950 text-sky-300 border border-sky-400/20 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider inline-block mb-3">D-TUBE VIDEO & REELS BANK</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">ডিটিউব: ডিলিকন ডিজিটাল ভিডিও ও রিলস ব্যাংক</h2>
              <p className="text-slate-350 text-xs mt-2">
                সহজে শিক্ষাক্রম আয়ত্ত করতে এবং স্কুলের চমৎকার কৃতি মুহূর্তগুলো দেখতে আমাদের ধারণকৃত ফুল ভিডিও লেকচার ও মোবাইল শর্টস/রিলস গ্যালারি।
              </p>

              {/* FILTER BUTTONS */}
              <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
                <button
                  onClick={() => {
                    setDtubeFilter('all');
                    setIsPlayingDtubeVideo(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    dtubeFilter === 'all' ? 'bg-sky-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  📺 সমস্ত কালেকশন ({dtubePlaylist.length})
                </button>
                <button
                  onClick={() => {
                    setDtubeFilter('full');
                    const filtered = dtubePlaylist.filter(v => v.category === 'full');
                    if (filtered.length > 0) {
                      setActiveDtubeVideo(filtered[0].id);
                    }
                    setIsPlayingDtubeVideo(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    dtubeFilter === 'full' ? 'bg-sky-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  📖 ফুল একাডেমিক ক্লাস ({dtubePlaylist.filter(v => v.category === 'full').length})
                </button>
                <button
                  onClick={() => {
                    setDtubeFilter('reel');
                    const filtered = dtubePlaylist.filter(v => v.category === 'reel');
                    if (filtered.length > 0) {
                      setActiveDtubeVideo(filtered[0].id);
                    }
                    setIsPlayingDtubeVideo(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    dtubeFilter === 'reel' ? 'bg-sky-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  ⚡ ইউটিউব শর্টস ও রিলস ({dtubePlaylist.filter(v => v.category === 'reel').length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* VIDEO PLAYER WINDOW (LEFT/CENTER) */}
              <div className="lg:col-span-8 flex flex-col justify-center">
                {(() => {
                  const activeItem = dtubePlaylist.find(item => item.id === activeDtubeVideo) || dtubePlaylist[0];
                  if (!activeItem) return null;
                  const videoId = getYouTubeId(activeItem.url);
                  const isReel = activeItem.category === 'reel';

                  return (
                    <div className="space-y-4">
                      {/* Player Container */}
                      <div className={`bg-slate-950 rounded-3xl border border-slate-800 p-4 shadow-2xl transition-all duration-300 w-full ${
                        isReel ? 'max-w-[380px] mx-auto border-purple-500/30' : 'w-full'
                      }`}>
                        
                        {/* Top bar info */}
                        <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${isPlayingDtubeVideo ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span>
                            <span className="font-bold text-[10px] tracking-wider text-slate-400 uppercase font-mono">
                              {isReel ? '📱 CHANNEL REEL / SHORT' : '🎬 FULL ACADEMIC VIDEO'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            D-TUBE MULTI-PLAYER
                          </span>
                        </div>

                        {/* Player Frame */}
                        {isPlayingDtubeVideo && videoId ? (
                          <div className={`overflow-hidden rounded-2xl border border-slate-850 bg-black ${
                            isReel ? 'aspect-[9/16] w-full max-w-[320px] mx-auto' : 'aspect-video w-full'
                          }`}>
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                              title={activeItem.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              referrerPolicy="no-referrer"
                              className="w-full h-full"
                            ></iframe>
                          </div>
                        ) : (
                          <div className={`relative flex flex-col items-center justify-center p-6 text-center overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 mx-auto ${
                            isReel ? 'aspect-[9/16] w-full max-w-[320px]' : 'aspect-video w-full'
                          }`}>
                            {/* Accent Background light */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent z-0"></div>
                            
                            {/* Big Play Button */}
                            <button
                              onClick={() => {
                                setIsPlayingDtubeVideo(true);
                                setVideoViews(prev => ({ ...prev, [activeItem.id]: (prev[activeItem.id] || 0) + 1 }));
                              }}
                              className="h-16 w-16 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-full flex items-center justify-center font-bold text-2xl shadow-2xl z-10 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                            >
                              ▶
                            </button>

                            <div className="mt-6 z-10 max-w-sm px-4">
                              <span className="bg-sky-500/10 text-sky-300 text-[8px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-sky-400/20 inline-block mb-2">
                                {activeItem.classLabel}
                              </span>
                              <h4 className="font-extrabold text-sm md:text-base text-white leading-snug line-clamp-2">{activeItem.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-1 font-semibold">শিক্ষক: {activeItem.author}</p>
                              <p className="text-[9.5px] text-slate-500 mt-2">প্লে করতে বাটনে ক্লিক করুন</p>
                            </div>
                          </div>
                        )}

                        {/* Player Bottom Info */}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5 text-[10.5px] text-slate-400">
                          <div>
                            <p className="font-bold text-slate-200 line-clamp-1">{activeItem.title}</p>
                            <p className="text-[9.5px] text-slate-405 mt-0.5">মেন্টরঃ <span className="text-sky-300 font-semibold">{activeItem.author}</span> • সময়ঃ {activeItem.duration}</p>
                          </div>
                          <span className="text-[10px] font-mono bg-slate-900 text-amber-500 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0 font-bold">
                            ▷ {videoViews[activeItem.id] || activeItem.views} ভিউজ
                          </span>
                        </div>

                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SIDEBAR & UPLOADER (RIGHT - 4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. PLAYLIST */}
                <div className="space-y-2.5">
                  <h4 className="font-black text-xs tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-2 uppercase">
                    {dtubeFilter === 'all' ? 'প্লেলিস্ট ভিডিও সমূহ' : dtubeFilter === 'full' ? 'একাডেমিক লেকচার সমূহ' : 'ইউটিউব রিলস ও শর্টস'}
                  </h4>
                  <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                    {dtubePlaylist
                      .filter(item => dtubeFilter === 'all' ? true : item.category === dtubeFilter)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveDtubeVideo(item.id);
                            setIsPlayingDtubeVideo(true);
                            setVideoViews(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
                          }}
                          className={`text-left w-full p-2.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                            activeDtubeVideo === item.id 
                              ? 'bg-sky-950/80 border-sky-500 text-sky-200 shadow-md' 
                              : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center text-xs text-sky-400 border border-slate-800 shrink-0 font-bold">
                            {item.category === 'reel' ? '📱' : '📹'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-[11px] leading-tight line-clamp-1">{item.title}</h5>
                            <p className="text-[9px] text-slate-400 truncate mt-0.5">{item.classLabel} • {item.author}</p>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 shrink-0">
                            {item.duration}
                          </span>
                        </button>
                      ))}

                    {dtubePlaylist.filter(item => dtubeFilter === 'all' ? true : item.category === dtubeFilter).length === 0 && (
                      <div className="text-center p-6 bg-slate-950/30 rounded-xl border border-slate-855 text-slate-500 text-xs">
                        কোনো ভিডিও পাওয়া যায়নি!
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. ADD YOUR YOUTUBE CHANNEL COMPONENT */}
                <div className="bg-slate-950/50 p-4 border border-sky-900/30 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-sky-450">
                    <span className="text-sm">🔗</span>
                    <span className="text-[11px] font-black">ইউটিউব ভিডিও ও রিলস সংযোগ করুন</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    আপনার একাডেমীর ইউটিউব চ্যানেল থেকে যেকোনো ফুল লেকচার ভিডিও অথবা শর্টস/রিল লিংক সংযোগ করে রিয়েলটাইমে টেস্ট ও প্লেব্যাক করতে পারেন।
                  </p>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5">ভিডিওর চমৎকার নাম (শিরোনাম):</label>
                      <input
                        type="text"
                        placeholder="যেমন: নতুন শিক্ষাক্রমের বুক রিভিউ ২০২৬"
                        value={customDtubeTitle}
                        onChange={(e) => {
                          setCustomDtubeTitle(e.target.value);
                          setDtubeInputError('');
                        }}
                        className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-0.5">টাইপ / ক্যাটাগরিঃ</label>
                        <select
                          value={customDtubeCategory}
                          onChange={(e) => setCustomDtubeCategory(e.target.value as 'full' | 'reel')}
                          className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-sky-500"
                        >
                          <option value="full">বড় একাডেমিক ভিডিও 📹</option>
                          <option value="reel">রিলস / শর্টস স্পেস 📱</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-0.5">শ্রেণী / শ্রেণীবিভাগঃ</label>
                        <input
                          type="text"
                          placeholder="Class 5 English"
                          value={customDtubeClass}
                          onChange={(e) => setCustomDtubeClass(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-0.5">শিক্ষক অথবা চ্যানেল নামঃ</label>
                        <input
                          type="text"
                          placeholder="যেমন: ডি লিকন মিডিয়া সেল"
                          value={customDtubeAuthor}
                          onChange={(e) => setCustomDtubeAuthor(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-0.5">ইউটিউব ভিডিও বা শর্টস URL লিংকঃ</label>
                        <input
                          type="text"
                          placeholder="https://www.youtube.com/watch?v=... অথবা শর্টস লিংক"
                          value={customDtubeUrl}
                          onChange={(e) => {
                            setCustomDtubeUrl(e.target.value);
                            setDtubeInputError('');
                          }}
                          className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {dtubeInputError && (
                      <p className="text-[9.5px] font-bold text-rose-450 bg-rose-950/40 p-2 rounded-xl border border-rose-900/40">
                        ⚠ {dtubeInputError}
                      </p>
                    )}

                    <button
                      onClick={() => {
                        if (!customDtubeTitle.trim()) {
                          setDtubeInputError('অনুগ্রহ করে ভিডিও অথবা রিলসের জন্য একটি টাইটেল টাইপ করুন।');
                          return;
                        }
                        if (!customDtubeUrl.trim()) {
                          setDtubeInputError('দয়া করে ইউটিউব ভিডিও বা রিলসের লিংক ইনপুট দিন।');
                          return;
                        }

                        const extractedId = getYouTubeId(customDtubeUrl);
                        if (!extractedId || extractedId.length !== 11) {
                          setDtubeInputError('ইউটিউব ভিডিওর সঠিক লিংক বা আইডি আমরা সনাক্ত করতে পারিনি। সঠিক লিংক পেস্ট করুন।');
                          return;
                        }

                        const newId = 'dt_' + Date.now();
                        const isReel = customDtubeCategory === 'reel';
                        const newVideo = {
                          id: newId,
                          title: customDtubeTitle.trim(),
                          category: customDtubeCategory,
                          url: customDtubeUrl.trim(),
                          views: 1,
                          author: customDtubeAuthor.trim() || 'ডি লিকন মিডিয়া',
                          duration: isReel ? '০:৫৯ মিনিট' : '১০:০০ মিনিট',
                          classLabel: isReel ? 'Reel / Short' : (customDtubeClass || 'সাধারণ ক্লাস')
                        };

                        setDtubePlaylist(prev => [newVideo, ...prev]);
                        setActiveDtubeVideo(newId);
                        setIsPlayingDtubeVideo(true);
                        setCustomDtubeTitle('');
                        setCustomDtubeUrl('');
                        setCustomDtubeAuthor('');
                        setCustomDtubeClass('সাধারণ');
                        setDtubeInputError('');
                      }}
                      className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 py-2 rounded-xl text-xs font-black shadow-md transition cursor-pointer text-center text-slate-950"
                    >
                      ভিডিও সংযোগ করুন ও টেস্ট প্লে দিন ➔
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* SECTION: GUARDIAN PAGE (৭। অভিভাবক পাতা) */}
        <section id="sec-guardian-guide-page" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <span className="text-xs font-bold text-rose-600 block mb-1">অভিভাবকের করণীয় ও নির্দেশিকা</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-950 mb-4">অভিভাবক পাতা: সন্তানের প্রগতির মূল চালিকাশক্তি</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                সন্তানের সোনালী ভবিষ্যৎ বিনির্মাণে কেবল স্কুলের পড়াশোনাই যথেষ্ট নয়। বাসায় তার পড়ার পরিবেশ কেমন এবং দৈনন্দিন হোমওয়ার্ক ট্র্যাকিং কিভাবে তদারকি করবেন তা জানাতেই এই অভিভাবক পাতা গাইডলাইন সরবরাহ করে।
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-850 mb-1.5">১. আরএফআইডি উপস্থিতি চেক</h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">আইডি পাঞ্চ করে সন্তানের প্রতিদিনের উপস্থিতির নিশ্চয়তা নিন। কোনো নোটিফিকেশন না আসলে সরাসরি হেল্পডেস্কে ৩ ঘটিকায় কল দিন।</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-850 mb-1.5">২. ডাবল লেজার ফি নিয়ন্ত্রণ</h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">একাউন্টেস প্যানেলে পরিশোধিত চালানের মানিরিসিট কপি নিরাপদে রাখুন। পেমেন্ট গেটওয়েতে ফি প্রদান করা মাত্রই রিকুইজিশন এসিস্ট্যান্ট বরাবরে চলে যায়।</p>
                </div>
              </div>
            </div>

            {/* FEEDBACK BOX WITH REACT STATE */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-205 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2 mb-4">অভিভাবক মতামত ও অভিযোগ বাক্স</h3>
              
              {parentFeedbackSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center border border-emerald-100">
                  <span className="text-xl">✓</span>
                  <p className="text-xs font-bold mt-1">মতামত ও পরামর্শ সফলভাবে জমা হয়েছে!</p>
                  <p className="text-[10px] text-emerald-600 mt-1">ডিলিকন এসিস্ট্যান্ট টিম খুব দ্রুত আপনার সাথে ফিডব্যাকের ভিত্তিতে যোগাযোগ করবেন।</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    স্কুলের পড়াশোনা, আরএফআইডি ট্র্যাকার ব্যবস্থা কিংবা বাসের নিরাপত্তা উন্নত করতে যেকোনো পরামর্শ সরাসরি দিন।
                  </p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">আপনার পূর্ণ মতামত লিখুন</label>
                    <textarea
                      rows={3}
                      value={parentFeedback}
                      onChange={(e) => setParentFeedback(e.target.value)}
                      placeholder="এখানে লিখুন..."
                      className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-blue-900"
                    ></textarea>
                  </div>
                  <button
                    onClick={() => {
                      if (!parentFeedback.trim()) return;
                      setParentFeedbackSuccess(true);
                      setTimeout(() => {
                        setParentFeedbackSuccess(false);
                        setParentFeedback('');
                      }, 4000);
                    }}
                    className="w-full bg-blue-905 hover:bg-blue-900 text-white font-extrabold text-[11px] py-2 whitespace-nowrap text-center rounded transition-all cursor-pointer"
                  >
                    ফিডব্যাক সাবমিট করুন
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION: DIGITAL CLASSROOM (৮। ডিজিটাল ক্লাসরুম) */}
        <section id="sec-digital-classrooms" className="bg-slate-50 py-16 px-6 lg:px-16 border-b border-slate-210">
          <div className="max-w-6xl mx-auto">
            <div className="text-center md:max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-indigo-700 block mb-1">ভার্চুয়াল লার্নিং ডেমো প্যানেল</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">ডিজিটাল ক্লাসরুম: স্মার্ট প্রযুক্তি সমৃদ্ধ শিক্ষাদান</h2>
              <p className="text-slate-600 text-xs mt-2">
                ডিলিকন ভিডিও কনফারেন্সিং এবং মাল্টিমিডিয়া ইন্টারেক্টিভ কুইজের সমন্বয়ে গঠিত শক্তিশালী ডিজিটাল ক্লাসরুম ট্রায়াল।
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-500 border-b pb-1">সক্রিয় ডিজিটাল লার্নিং ক্লাসেস</h4>
                {[
                  { classId: 'c5', className: 'Class 5 Interactive Math Class', status: 'Live Class (চলমান)', teacher: 'মিস ফারহানা চৌধুরী', duration: '১ ঘণ্টা ১০ মিনিট' },
                  { classId: 'c8', className: 'Class 8 English Grammar Phonics', status: 'Class starts in 30 mins', teacher: 'জনাব রেজওয়ানুর কবির', duration: '৪৫ মিনিট' },
                  { classId: 'c10', className: 'Class 10 Physics Mechanics Theory', status: 'Recorded Class View', teacher: 'জনাব আশরাফুল আমিন', duration: '২ ঘণ্টা' }
                ].map((cls) => (
                  <div 
                    key={cls.classId}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      simulatingClassroom === cls.classId 
                        ? 'bg-blue-905 border-indigo-400 text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350'
                    }`}
                  >
                    <h5 className="font-bold text-xs">{cls.className}</h5>
                    <p className={`text-[10px] mt-1 font-semibold ${
                      simulatingClassroom === cls.classId ? 'text-amber-400' : 'text-blue-900'
                    }`}>{cls.status}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">শিক্ষক: {cls.teacher} • সময়সীমা: {cls.duration}</p>
                    
                    <button
                      onClick={() => setSimulatingClassroom(cls.classId === simulatingClassroom ? null : cls.classId)}
                      className={`mt-3 font-bold text-[10px] py-1 px-3 rounded-md transition-all cursor-pointer ${
                        simulatingClassroom === cls.classId 
                          ? 'bg-white text-blue-950 font-bold' 
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {simulatingClassroom === cls.classId ? 'ভার্চুয়াল রুম থেকে বের হোন ⨂' : 'ভার্চুয়াল ক্লাসরুম পর্যবেক্ষণ করুন ⚡'}
                    </button>
                  </div>
                ))}
              </div>

              {/* SIMULATED ACTIVE WHITEBOARD */}
              <div className="lg:col-span-2">
                {simulatingClassroom ? (
                  <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-xl h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                        <span className="text-xs font-bold">লাইভ ভার্চুয়াল লার্নিং বোর্ড স্ক্রিন</span>
                      </div>
                      <span className="bg-slate-950 p-1 text-[8px] font-mono text-emerald-400 border border-slate-800 rounded">
                        CLASSROOM ID: {simulatingClassroom.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 my-auto">
                      <p className="text-amber-500 font-mono text-[10px] mb-2">// ক্যান্ডিড কোয়েস্ট অ্যান্ড কন্টেন্ট সিমুলেটর</p>
                      
                      {simulatingClassroom === 'c5' ? (
                        <div className="font-mono text-xs text-slate-200 space-y-2">
                          <p className="text-slate-100 font-bold">আজকের লেকচার: ১। শতকরা প্রকাশ প্রণালী</p>
                          <p className="text-slate-400 text-[10px]">প্রশ্ন: ১টি আম বিক্রেতা প্রতিটি আম ১০ টাকায় কিনে বারো টাকায় বিক্রি করেছে। তার শতকরা লাভ কত?</p>
                          <p className="text-emerald-400 text-[10px]">• লাভ = (১২ - ১০) = ২ টাকা। লাভ শতকরা = (২ / ১০) * ১০০% = ২০%।</p>
                        </div>
                      ) : simulatingClassroom === 'c8' ? (
                        <div className="font-mono text-xs text-slate-200 space-y-2">
                          <p className="text-slate-100 font-bold">আজকের লেকচার: ২। Voice Change Rules</p>
                          <p className="text-slate-400 text-[10px]">Active Sentence: "Samiul eats a fresh mango."</p>
                          <p className="text-emerald-400 text-[10px]">• Passive Form: "A fresh mango is eaten by Samiul."</p>
                        </div>
                      ) : (
                        <div className="font-mono text-xs text-slate-200 space-y-2">
                          <p className="text-slate-100 font-bold">আজকের লেকচার: ৩। স্প্রিং ধ্রুবক সম্পর্কিত আলোচনা (F=kx)</p>
                          <p className="text-slate-400 text-[10px]">যেখানে F হল বাহ্যিক বল, k হল স্প্রিং ধ্রুবক এবং x হল প্রসারণ দৈর্ঘ্য।</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-3 border-t border-slate-850 mt-4">
                      <span>সক্রিয় দর্শক: ৪২ জন শিক্ষার্থী সংযুক্ত</span>
                      <span>চ্যাট বার্তা অনলাইন চালু</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-8">
                    <Tv className="h-12 w-12 text-slate-800 mb-2" />
                    <p className="font-bold text-xs text-slate-400">কোনো ক্লাসরুম পর্যবেক্ষণ করা হচ্ছে না</p>
                    <p className="text-[10px] text-slate-500 max-w-xs mt-1">বামদিকের বাটন থেকে কাঙ্ক্ষিত শ্রেণী যুক্ত করুন এবং রিয়ালটাইম ওয়াইডবোর্ড ফিড এবং ট্রায়াল ক্লাস দেখুন।</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 2: PRINCIPAL MESSAGE */}
        <section id="sec-principal" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">অধ্যক্ষের শুভেচ্ছা বাণী</p>
            <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl mb-10">সুশিক্ষাই জাতির মেরুদণ্ড ও আমাদের পরম ব্রত</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="h-40 w-40 rounded-full bg-slate-300 shrink-0 border-4 border-white shadow-md flex items-center justify-center">
                <Users className="h-16 w-16 text-slate-500" />
              </div>
              <div>
                <p className="text-slate-600 italic leading-relaxed mb-4">
                  "ডিলিকন মডেল একাডেমী এমন একটি পরিবেশ গড়ে তুলতে চায় যেখানে প্রতিটি শিক্ষার্থী তাদের সুপ্ত প্রতিভা বিকশিত করার সুযোগ পাবে। আমরা কেবল পাঠ্যপুস্তকের শিক্ষায় সীমাবদ্ধ নই, বরং মূল্যবোধ ও নৈতিকতার সমন্বয়ে তাদের সম্পূর্ণ মানুষ হিসেবে গড়ে তুলি।"
                </p>
                <h4 className="font-bold text-slate-900 text-lg">মেজর এম রফিকুল ইসলাম (অবঃ)</h4>
                <p className="text-xs text-blue-900 font-semibold font-mono">অধ্যক্ষ, ডিলিকন মডেল একাডেমী</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: KEY HIGHLIGHTS */}
        <section id="sec-highlights" className="bg-slate-50 py-16 px-6 lg:px-16 border-b border-slate-200">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-slate-900 mb-12">কেন ডিলিকন মডেল একাডেমী সেরা?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: 'নিরাপদ ডিজিটাল ট্র্যাকিং', desc: 'শিক্ষার্থীর প্রবেশ ও প্রস্থানে অভিভাবকের মোবাইলে তাৎক্ষণিক স্বয়ংক্রিয় বাংলা এসএমএস এলার্ট।' },
                { icon: Sparkles, title: 'স্মার্ট লার্নিং এনভায়রনমেন্ট', desc: 'মাল্টিমিডিয়া প্রজেক্টর ও অত্যাধুনিক বিজ্ঞান গবেষণাগার সমৃদ্ধ শীতাতপ নিয়ন্ত্রিত শ্রেণীকক্ষ।' },
                { icon: Award, title: 'কঠোর ডিসিপ্লিন ও নিরাপত্তা', desc: 'শতভাগ সিসিটিভি ক্যামেরা নিয়ন্ত্রিত ক্যাম্পাস ও সার্বক্ষণিক নিরাপত্তা রক্ষী নিয়োজিত।' }
              ].map((h, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <h.icon className="h-5 w-5 text-blue-900" />
                    {h.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: MISSION & VISION */}
        <section id="sec-mission" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">আমাদের লক্ষ্য</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-4">উন্নত ও প্রযুক্তিসমৃদ্ধ নাগরিক গড়ে তোলা</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                আধুনিক গুণগত বিজ্ঞানভিত্তিক বৈশ্বিক আদর্শ শিক্ষার মাধ্যমে শিক্ষার্থীর শারীরিক, মানসিক ও বুদ্ধিবৃত্তিক বিকাশ নিশ্চিত করা আমাদের প্রধান লক্ষ্য।
              </p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">আমাদের রূপকল্প</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-4">একটি সম্পূর্ণ পেপারলেস হাইব্রিড ইনস্টিটিউট</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                আগামী ২০৩০ সেশনের মাঝেই আমরা ১০০% সোলার-চালিত ইকো ফ্রেন্ডলি গ্রিন ক্যাম্পাস ও শিক্ষার্থীদের সকল তথ্য ও লেনদেনে সম্পূর্ণ কাগজবিহীন পরিবেশ গড়ে তোলার লক্ষ্য রাখি।
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: HISTORY */}
        <section id="sec-history" className="bg-slate-100 py-16 px-6 lg:px-16 border-b border-slate-200">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">আমাদের গৌরবময় ধারাবাহিকতা</h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 text-sm md:text-base">
              ডিলিকন মডেল একাডেমী ২০১১ সালে একটি আদর্শ শিক্ষালয় গড়ার লক্ষ্য নিয়ে মাত্র ৫০ জন নিয়ে যাত্রা শুরু করে। আজ দীর্ঘ পথচলায় সহস্রাধিক কৃতি শিক্ষার্থী ছড়িয়ে আছে দেশ ও দেশের বাইরে।
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-slate-700">
              <span className="bg-white py-2 px-4 rounded-full border border-slate-200 shadow-sm text-xs font-semibold">প্রতিষ্ঠা: ২০১১</span>
              <span className="bg-white py-2 px-4 rounded-full border border-slate-200 shadow-sm text-xs font-semibold">মোট গ্রাজুয়েটস: ৫,০০০+</span>
              <span className="bg-white py-2 px-4 rounded-full border border-slate-200 shadow-sm text-xs font-semibold">শিক্ষক স্টাফ: ৫৫+</span>
            </div>
          </div>
        </section>

        {/* SECTION 6: SYLLABUS & CURRICULUM */}
        <section id="sec-syllabus" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-slate-900 mb-12">আমাদের শিক্ষাক্রম ও বিভাগসমূহ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50">
                <span className="rounded bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">কিণ্ডারগার্টেন</span>
                <h3 className="text-lg font-bold text-slate-800 mt-2 mb-3">প্লে থেকে ২য় শ্রেণী</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">মজার ছলে শিক্ষা, অক্ষর পরিচিতি, চিত্রাঙ্কন, রাইমস আবৃত্তি ও বেসিক গাণিতিক ধারণা সৃষ্টি করা আমাদের প্রাথমিক রূপরেখা।</p>
                <div className="text-[11px] font-semibold text-slate-500">+ দৈনিক ২ ঘণ্টা ক্লাস • নো উইকলি টেস্ট চাপ</div>
              </div>
              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50">
                <span className="rounded bg-blue-50 text-indigo-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">প্রাথমিক শাখা</span>
                <h3 className="text-lg font-bold text-slate-800 mt-2 mb-3">৩য় থেকে ৫ম শ্রেণী</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">গণিত, ইংরেজি ব্যাকরণ ও বিজ্ঞানের ভিত্তিমূল তৈরীকরণ ও সৃজনশীল মেধা পরীক্ষার জন্য শিক্ষার্থীদের প্রস্তুত করা।</p>
                <div className="text-[11px] font-semibold text-slate-500">+ ৫টি কোর বিষয় • মাসিক কুইজ পরীক্ষা</div>
              </div>
              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50">
                <span className="rounded bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">মাধ্যমিক শাখা</span>
                <h3 className="text-lg font-bold text-slate-800 mt-2 mb-3">৬ষ্ঠ থেকে ১০ম শ্রেণী</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">বিজ্ঞান, বাণিজ্য ও মানবিক গ্রুপ। এস.এস.সি বোর্ডের ফাইনাল পরীক্ষার জন্য সর্বোচ্চ স্তরের প্রস্তুতি প্র্যাক্টিক্যাল ল্যাবের মাধ্যমে নিশ্চিত করা।</p>
                <div className="text-[11px] font-semibold text-slate-500">+ আইসিটি ও প্রোগ্রামিং কোর্স অন্তর্ভুক্ত</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: SUCCESS METRICS & STATS */}
        <section id="sec-stats" className="bg-blue-900 py-16 px-6 lg:px-16 text-white border-b border-blue-950">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-5xl font-extrabold text-slate-300">১০০%</p>
              <p className="text-xs md:text-sm text-blue-50 font-semibold mt-2">এস.এস.সি বোর্ড কৃতকার্য</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-extrabold text-slate-300">১২০+</p>
              <p className="text-xs md:text-sm text-blue-50 font-semibold mt-2">জিপিএ ৫.০০ বিগত সেশনে</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-extrabold text-slate-300">১০,০০০+</p>
              <p className="text-xs md:text-sm text-blue-50 font-semibold mt-2">পাঠ্য ও সমৃদ্ধ রেফারেন্স বই</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-extrabold text-slate-300">২৪/৭</p>
              <p className="text-xs md:text-sm text-blue-50 font-semibold mt-2">নিরাপত্তা প্রহরা ও সিসিটিভি</p>
            </div>
          </div>
        </section>

        {/* SECTION 8: SCIENCE LABORATORIES */}
        <section id="sec-science-lab" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">আধুনিক বিজ্ঞানাগার</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">হাতে-কলমে পরীক্ষা ও বাস্তব জ্ঞান অর্জন</h2>
              <p className="text-slate-600 leading-relaxed text-sm mb-4">
                আমাদের পদার্থবিজ্ঞান, রসায়ন ও জীববিদ্যা গবেষণাগারে রয়েছে আধুনিক সব বৈজ্ঞানিক সরঞ্জামাবলী। দক্ষ ল্যাব কর্মকর্তাদের তত্ত্বাবধানে নিরাপত্তা বজায় রেখে প্রতিটি শিক্ষার্থী নিজে পরীক্ষাগুলি সম্পন্ন করার সুযোগ পায়।
              </p>
              <ul className="text-xs text-slate-500 font-semibold space-y-1">
                <li>• নিরাপদ অগ্নিনির্বাপক ডিজাইন সম্পন্ন</li>
                <li>• ৩০ জন শিক্ষার্থীর একসাথে গবেষণার স্থান</li>
              </ul>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="h-32 bg-blue-50/30 border border-blue-100 rounded-lg flex items-center justify-center font-bold text-indigo-700 text-xs">পদার্থ ল্যাব</div>
              <div className="h-32 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center font-bold text-amber-700 text-xs">রসায়ন ড্রপস</div>
              <div className="h-32 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center font-bold text-teal-700 text-xs">জীবতত্ত্ব উইং</div>
              <div className="h-32 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-center font-bold text-purple-700 text-xs">কম্পিউটার ল্যাব</div>
            </div>
          </div>
        </section>

        {/* SECTION 9: SMART CLASSROOM */}
        <section id="sec-smart-class" className="bg-slate-50 py-16 px-6 lg:px-16 border-b border-slate-200">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">ডিজিটাল এ্যাডভান্স প্রযুক্তিসমূহ</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">মাল্টিমিডিয়া প্রজেক্টর ও ইন্টারেক্টিভ স্মার্ট ক্লাসরুম</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                ডিলিকনের প্রতিটি ক্লাসরুমে রয়েছে হাই-ডেফিনিশন প্রজেক্টর স্ক্রিন। কঠিন বিষয়গুলো অডিও-ভিজ্যুয়াল এনিমেশন ও প্রজেক্টরের মাধ্যমে সহজেই শিক্ষার্থীদের সামনে দৃশ্যমান করা হয়, যার ফলে তাদের মেধার ধারণক্ষমতা কয়েক গুণ বাড়ে।
              </p>
            </div>
            <div className="md:w-1/2 h-44 bg-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center text-white border-2 border-slate-700 shadow-lg">
              <Tv className="h-10 w-10 text-slate-600 animate-pulse absolute" />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-bold">
                <span className="h-1 text-emerald-500 rounded-full animate-ping w-1 bg-emerald-500"></span>
                <span>Smart Screen Online</span>
              </div>
              <p className="text-xs font-mono text-emerald-400 mt-12">SELECT * FROM educational_media_stream;</p>
            </div>
          </div>
        </section>

        {/* SECTION 10: LIBRARY */}
        <section id="sec-library" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">সমৃদ্ধ লাইব্রেরী</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">হাজারো বইয়ের সম্ভার ও পড়ার জন্য শান্ত পরিবেশ</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                পাঠ্যবইয়ের বাইরেও বিশ্বজ্ঞান অর্জনের লক্ষ্যে রয়েছে আমাদের সমৃদ্ধ পাঠাগার। বিজ্ঞান কল্পকাহিনী, জীবনী, ব্যাকরণ, ইতিহাস ও অলিম্পিয়াডের প্রয়োজনীয় বিপুল বই সংগৃহীত যা শিক্ষার্থীদের লাইব্রেরী কার্ডের মাধ্যমে ধার দেওয়া হয়।
              </p>
            </div>
            <div className="md:w-1/2 p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between border-b pb-2 text-xs font-bold text-slate-700">
                <span>বিভাগ</span>
                <span>বইয়ের সংখ্যা</span>
              </div>
              <div className="space-y-2 mt-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>বিজ্ঞান ও প্রযুক্তি</span>
                  <span>২,৫০০+ কপি</span>
                </div>
                <div className="flex justify-between">
                  <span>সাহিত্য ও উপন্যাস</span>
                  <span>৩,২০০+ কপি</span>
                </div>
                <div className="flex justify-between">
                  <span>সাধারণ জ্ঞান ও কুইজ</span>
                  <span>১,২০০+ কপি</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 11: EXTRA CURRICULARS & SPORTS */}
        <section id="sec-sports" className="bg-emerald-950 py-16 px-6 lg:px-16 text-white border-b border-emerald-900">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-300 mb-4">অতিরিক্ত সহ-শিক্ষা ও ক্রীড়া ক্লাব</h2>
            <p className="text-slate-200 max-w-2xl mx-auto leading-relaxed mb-8 text-sm">
              শারীরিক সুস্থতা ও মানসিক বিনোদনের অংশ হিসেবে আমাদের রয়েছে সক্রিয় স্পোর্টস একাডেমি। ফুটবল অলিম্পিয়াড টিম, বিজ্ঞান ক্লাব, ডিবেটিং অ্যান্ড পাবলিক স্পিকিং সোসাইটি ও হ্যান্ডবল প্র্যাক্টিস টিম এর উল্লেখযোগ্য উদাহরণ।
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-emerald-900/60 p-4 rounded-lg border border-emerald-800/80 text-xs font-bold">ডিবেট ক্লাব</div>
              <div className="bg-emerald-900/60 p-4 rounded-lg border border-emerald-800/80 text-xs font-bold">সায়েন্স ফেয়ার লিগ</div>
              <div className="bg-emerald-900/60 p-4 rounded-lg border border-emerald-800/80 text-xs font-bold">বার্ষিক ক্রীড়া উৎসব</div>
              <div className="bg-emerald-950 p-4 rounded-lg border border-emerald-800/80 text-xs font-bold">চিত্রাঙ্কন ফোরাম</div>
            </div>
          </div>
        </section>

        {/* SECTION 12: TRANSPORT SYSTEM */}
        <section id="sec-transport" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center md:max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">পরিবহন সুবিধা</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">নিরাপদ স্কুল বাস সার্ভিস ও রুটসমূহ</h2>
              <p className="text-slate-600 text-sm mt-2">আমাদের ছাত্র-ছাত্রীদের যাতায়াতের সুবিধার্থে ট্র্যাকিং সুবিধাযুক্ত আরামদায়ক স্কুল পরিবহন সার্ভিস রয়েছে। নির্ধারিত রুটের সম্পূর্ণ চার্ট নিচে দেওয়া হলো।</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((route, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{route.routeName}</h4>
                    <p className="text-xs text-slate-500 mt-1">চালক: {route.driverName} • ফোন: {route.driverPhone}</p>
                    <p className="text-[10px] font-mono text-blue-900 mt-1">{route.vehicleNo}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="bg-blue-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded">৳ {route.monthlyFee} /মাস</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 13: HOSTEL ACCOMMODATION */}
        <section id="sec-hostel" className="bg-slate-50 py-16 px-6 lg:px-16 border-b border-slate-200">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">আবাসিক হোস্টেল সুবিধা</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">বাড়ির মতো নিরাপদ ও সুশৃঙ্খল পরিবেশ</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                দূরের শিক্ষার্থীদের জন্য রয়েছে ডিলিকন স্পেশাল আবাসিক হোস্টেল। পুষ্টিকর ডায়েট খাবার মেনু, দক্ষ সুপারভাইজারের নিয়মিত সাহায্য ও ২৪ ঘণ্ঠা হাউস টিউটরের তত্ত্বাবধানে এখানে পড়াশোনা চালিয়ে যাওয়ার চমৎকার ব্যবস্থা রয়েছে।
              </p>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <span className="text-lg font-bold text-slate-800">সুস্বাদু খাবার</span>
                <p className="text-xs text-slate-500 mt-1">তিন বেলা পুষ্টিকর ব্যালেন্স ডায়েট</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <span className="text-lg font-bold text-slate-800">হাউস টিউটর</span>
                <p className="text-xs text-slate-500 mt-1">শিক্ষক দ্বারা হোমওয়ার্ক সহায়তা</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 14: CODE OF CONDUCT */}
        <section id="sec-conduct" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">শৃঙ্খলা ও বিশেষ নীতিমালা</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-6">আমাদের সুনির্দিষ্ট কোড অফ কন্ডাক্ট</h2>
            <div className="text-left space-y-4 text-sm text-slate-600">
              <div className="flex gap-2 items-start">
                <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-700 font-bold shrink-0 flex items-center justify-center text-xs">১</span>
                <p><strong>পোশাকের পরিচ্ছন্নতা:</strong> ডিলিকন স্কুল ইউনিফর্ম গায়ে সুন্দর ও সুশৃঙ্খলভাবে দৈনিক উপস্থিতির বাধ্যবাধকতা বজায় রাখা।</p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-700 font-bold shrink-0 flex items-center justify-center text-xs">২</span>
                <p><strong>ডিজিটাল হাজিরা কার্ড:</strong> স্কুলে ঢোকার সময় অবশ্যই ডিজিটাল আইডি কার্ড পাঞ্চ করে হাজিরা নথিভুক্ত করতে হবে।</p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-700 font-bold shrink-0 flex items-center justify-center text-xs">৩</span>
                <p><strong>বিনয়ী আচরণ:</strong> শিক্ষকদের যথাযোগ্য সম্মান ও সহপাঠীদের সাথে সৌহার্দ্যপূর্ণ সহানুভূতিশীল আচরণ ও ব্যবহার করা আবশ্যক।</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 15: GENERAL NOTICES */}
        <section id="sec-notice" className="bg-amber-50 py-16 px-6 lg:px-16 border-b border-amber-200/60">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                  <Bell className="h-3.5 w-3.5" />
                  ঘোষণা বোর্ড
                </span>
                <h2 className="text-2xl font-bold text-amber-950 mt-1">সর্বশেষ ডিলিকন নোটিশবোর্ড</h2>
              </div>
            </div>
            <div className="space-y-4">
              {notices.map((n, idx) => (
                <div key={idx} className="p-5 bg-white border border-amber-200 rounded-xl hover:shadow-md transition-all shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2 mb-2">
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{n.category}</span>
                    <span className="text-xs text-slate-500 font-mono">{n.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">{n.banglaTitle}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 16: EVENT CALENDAR */}
        <section id="sec-events" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-2xl font-bold text-slate-900 mb-8">আপকামিং ইভেন্টস ২০২৬</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:border-slate-300 transition-all">
                <div className="text-blue-900 text-xs font-mono font-bold mb-1">১২ই জুন, ২০২৬</div>
                <h4 className="font-bold text-slate-800 text-sm">বার্ষিক মেধা ও সায়েন্স প্রজেক্ট ফেয়ার</h4>
                <p className="text-slate-500 text-xs mt-1">শিক্ষার্থীদের তৈরি রোবটিক্স ও বিজ্ঞান প্রজেক্ট প্রদর্শনী মেলা।</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:border-slate-300 transition-all">
                <div className="text-blue-900 text-xs font-mono font-bold mb-1">২৫শে জুলাই, ২০২৬</div>
                <h4 className="font-bold text-slate-800 text-sm">ইনডোর ও ফুটবল লিগ ফাইনাল ম্যাচ</h4>
                <p className="text-slate-500 text-xs mt-1">স্কুল টিমের অংশগ্রহণে ডিলিকন কাপ ফুটবলের শিরোপা ফাইট।</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 17: FEES CALCULATOR */}
        <section id="sec-fees-calc" className="bg-blue-50/30 py-16 px-6 lg:px-16 border-b border-slate-200">
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-md">
            <div className="text-center mb-6">
              <Calculator className="h-8 w-8 text-blue-900 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900 mt-2">স্মার্ট বেতন ও মাসিক ফি হিসাব করুন</h2>
              <p className="text-slate-500 text-xs mt-1">শিক্ষার শ্রেণী ও অতিরিক্ত সেবা নির্বাচন করে কাঙ্ক্ষিত মাসিক ফি হিসাব করুন।</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষা স্তর নির্বাচন করুন</label>
                <select 
                  value={calcClass} 
                  onChange={(e) => setCalcClass(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-blue-900 bg-white"
                >
                  <option value="Play-KG">Play - KG (৳ ১,২০০/মাস)</option>
                  <option value="Primary">Primary (Class 1-5) (৳ ১,৮০০/মাস)</option>
                  <option value="Secondary">Secondary (Class 6-10) (৳ ২,৫০০/মাস)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">স্কুল বাস ট্রান্সপোর্ট সুবিধা</h5>
                  <p className="text-[10px] text-slate-500">নির্ধারিত বাস রুট অনুযায়ী সার্ভিস চার্জ</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={calcTransport} 
                  onChange={(e) => setCalcTransport(e.target.checked)}
                  className="h-4 w-4 bg-white border border-slate-300 rounded text-blue-900 focus:ring-blue-800"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">স্টেশনারি ও বই কোটা</h5>
                  <p className="text-[10px] text-slate-500">মাসিক ডায়েরি, ইউনিফর্ম ও কোর বই সহ</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={calcStationery} 
                  onChange={(e) => setCalcStationery(e.target.checked)}
                  className="h-4 w-4 bg-white border border-slate-300 rounded text-blue-900 focus:ring-blue-800"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 text-center">
                <span className="text-xs text-slate-500">সর্বমোট হিসাবনিকাশকৃত মাসিক ফি:</span>
                <p className="text-3xl font-extrabold text-blue-900 mt-1">৳ {getCalculatedFee()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 18: DIGITAL ATTENDANCE SYSTEM BANNER */}
        <section id="sec-attendance-info" className="bg-sky-950 py-16 px-6 lg:px-16 text-white border-b border-sky-900">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">ডিজিটাল এটেনডেন্স ট্র্যাকিং</span>
              <h2 className="text-2xl font-bold mt-1 mb-4 leading-tight">গার্ডিয়ান ইনস্ট্যান্ট বাংলা এসএমএস সলিউশন</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                আমাদের স্কুলের প্রবেশদ্বারে ইন্টারেক্টিভ আইডি কার্ড স্ক্যানার রয়েছে। কার্ড পাঞ্চ মাত্রই শিক্ষার্থীর প্রবেশের নির্ভুল হিসাব সিস্টেমে লোড হয়ে অভিভাবকের ফোনে স্বয়ংক্রিয়ভাবে বাংলা মেসেজ চলে যায়। এটি ডিলিকন স্কুল ম্যানেজমেন্টের অন্যতম অভিনব প্রয়াস।
              </p>
            </div>
            <div className="md:w-1/2 bg-slate-900/60 p-6 rounded-2xl border border-sky-800/80">
              <div className="flex items-center gap-2 border-b border-sky-800/50 pb-3 mb-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-sky-300">Live Simulated Message Preview</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-sky-900/40 text-xs font-mono space-y-2">
                <p className="text-emerald-400">To: অভিভাবক মহোদয়</p>
                <p className="text-slate-100">"আপনার সন্তান আফিফা রহমান, শ্রেণী Class 5, রোল 01 স্কুল থেকে বাড়ির উদ্দেশ্যে রওয়া হয়েছে। আপনি সজাগ থাকুন, এগিয়ে আসুন। বাসায় পৌছা মাত্রই তার হোমওয়ার্ক সম্পন্ন করতে তাকে অনুপ্রাণিত করুন।"</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 19: LEAD GENERATION FORM */}
        <section id="sec-lead-form" className="bg-blue-950 py-16 px-6 lg:px-16 text-white border-b border-blue-800">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="rounded bg-blue-900/60 border border-indigo-800 px-3 py-1 text-xs text-slate-300 uppercase tracking-widest inline-block mb-3">
                LEAD GENERATION PORTAL
              </span>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">ডিলিকন মডেল একাডেমীতে ভর্তি ও তথ্যের সরাসরি আবেদন</h2>
              <p className="text-slate-300 text-xs max-w-lg mx-auto mt-2">
                ফরমটি পূরণ করে জমা দিন। আমাদের ভর্তি বিষয়ক টিম ২৪ ঘণ্টার মাঝে সরাসরি ফোন করে ভর্তিপ্রক্রিয়া ও কাউন্সেলিং শেষ করবে।
              </p>
            </div>

            {leadSuccess ? (
              <div className="bg-emerald-900/40 border border-emerald-500/50 p-6 rounded-xl text-center">
                <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-emerald-300">আবেদন সফলভাবে জমা হয়েছে!</h4>
                <p className="text-xs text-slate-200 mt-1">আমাদের ভর্তি হেল্পলাইন টিম শীঘ্রই আপনার মোবাইলে যোগাযোগ করবে। ধন্যবাদ।</p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">অভিভাবকের নাম <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="যেমন: খালিদ রহমান"
                      required
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-blue-800 focus:border-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">শিক্ষার্থীর নাম <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="যেমন: আফিফা রহমান"
                      required
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-blue-800 focus:border-blue-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">মোবাইল নাম্বার <span className="text-rose-500">*</span></label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="যেমন: 017xxxxxxxx"
                      required
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-blue-800 focus:border-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">কাঙ্ক্ষিত শ্রেণী</label>
                    <select 
                      value={desiredClass}
                      onChange={(e) => setDesiredClass(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:outline-blue-800"
                    >
                      <option value="Play-KG">Play / KG</option>
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-blue-800 focus:border-blue-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full rounded-lg bg-blue-900 hover:bg-blue-800 p-3 font-bold transition-all text-xs text-white uppercase tracking-wider"
                >
                  ফরমটি সাবমিট করুন
                </button>
              </form>
            )}
          </div>
        </section>

        {/* SECTION 20: MEET THE ELITE FACULTY */}
        <section id="sec-faculty" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-2xl font-bold text-slate-900 mb-8">আমাদের সুদক্ষ ও দায়িত্বশীল শিক্ষকমণ্ডলী</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'ফারজানা ইয়াসমিন', des: 'সহকারী প্রধান শিক্ষিকা (ইংরেজি বিভাগ)', exp: '১১ বছরের অভিজ্ঞতা, এম.এ (ঢাকা বিশ্ববিদ্যালয়)' },
                { name: 'মাহবুবুল আলম', des: 'সিনিয়র গণিত শিক্ষক', exp: '৯ বছরের অভিজ্ঞতা, এম.এস.সি (বুয়েট)' },
                { name: 'জেরিন সানজানা', des: 'আইসিটি কো-অর্ডিনেটর', exp: '৫ বছরের অভিজ্ঞতা, বি.এস.সি (সিএসই)' }
              ].map((fac, i) => (
                <div key={i} className="p-5 border border-slate-200 rounded-xl bg-slate-50 text-center">
                  <div className="h-16 w-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center font-bold text-blue-900 mb-3 text-lg">
                    {fac.name[0]}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{fac.name}</h4>
                  <p className="text-xs text-blue-900 font-semibold">{fac.des}</p>
                  <p className="text-[10px] text-slate-500 mt-2">{fac.exp}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 21: GUARDIANS ADVISORY FORUM */}
        <section id="sec-guardians-forum" className="bg-slate-50 py-16 px-6 lg:px-16 border-b border-slate-200">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">অভিভাবক ফোরাম</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">অভিভাবক ও বিদ্যালয়ের চমৎকার যুগলবন্দী</h2>
            <p className="text-slate-600 leading-relaxed text-sm max-w-xl mx-auto mb-6">
              প্রতি ৩ মাস অন্তর অভিভাবক ফোরাম মিটিং পরিচালনা করা হয় যাতে শিক্ষার্থীর পারিবারিক পড়াশোনার মানোন্নয়ন ও পরামর্শ বিনিময় দ্রুত করা যায়।
            </p>
            <div className="flex justify-center gap-10">
              <div className="text-center">
                <span className="text-2xl font-black text-rose-600">১২+</span>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">বাৎসরিক কাউন্সেলিং সেশন</p>
              </div>
              <div className="text-center">
                <span className="text-2xl font-black text-rose-600">৯৫%</span>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">অভিভাবক সন্তুষ্টি সূচক</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 22: STATIONERY CORNER */}
        <section id="sec-stationery" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">লাইব্রেরি ও সেলস শপ</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">ক্যাম্পাস স্টেশনারি ও স্কুল কর্নার</h2>
              </div>
              <span className="rounded bg-blue-50 px-3 py-1 text-xs text-indigo-700 font-semibold">স্টক সরাসরি স্কুল গেটে সংরক্ষিত</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stationery.map((st, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-all text-center">
                  <span className="text-xs font-mono text-slate-400 block mb-2 font-bold uppercase">{st.category}</span>
                  <h4 className="font-bold text-slate-800 text-xs truncate">{st.banglaName}</h4>
                  <p className="text-blue-900 font-extrabold text-sm mt-3">৳ {st.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 23: CAMPUS GALLERY */}
        <section id="sec-gallery" className="bg-slate-100 py-16 px-6 lg:px-16 border-b border-slate-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-2xl font-bold text-slate-900 mb-8">ক্যাম্পাস ইমেজ গ্যালারি</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="h-40 bg-zinc-300 rounded-lg flex items-center justify-center font-bold text-zinc-500 text-xs shadow-sm bg-gradient-to-tr from-slate-200 to-blue-100 shadow-sm">খেলার মাঠ</div>
              <div className="h-40 bg-zinc-300 rounded-lg flex items-center justify-center font-bold text-zinc-500 text-xs shadow-sm bg-gradient-to-tr from-blue-100 shadow-sm to-rose-100">কম্পিউটার ল্যাব ভিউ</div>
              <div className="h-40 bg-zinc-300 rounded-lg flex items-center justify-center font-bold text-zinc-500 text-xs shadow-sm bg-gradient-to-tr from-emerald-100 to-teal-100">প্রবেশ দ্বার গেট</div>
              <div className="h-40 bg-zinc-300 rounded-lg flex items-center justify-center font-bold text-zinc-500 text-xs shadow-sm bg-gradient-to-tr from-amber-100 to-sky-100">প্রধান শিক্ষক কক্ষ</div>
              <div className="h-40 bg-zinc-300 rounded-lg flex items-center justify-center font-bold text-zinc-500 text-xs shadow-sm bg-gradient-to-tr from-violet-100 to-blue-100 shadow-sm">স্মার্ট ক্লাসরুম ফিট</div>
              <div className="h-40 bg-zinc-300 rounded-lg flex items-center justify-center font-bold text-zinc-500 text-xs shadow-sm bg-gradient-to-tr from-rose-100 to-slate-100 font-mono">CC Camera Room</div>
            </div>
          </div>
        </section>

        {/* SECTION 24: IN-DEPTH FAQ ACCORDION */}
        <section id="sec-faq" className="bg-white py-16 px-6 lg:px-16 border-b border-slate-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center text-2xl font-bold text-slate-900 mb-10">সচরাচর জিজ্ঞাসিত প্রশ্নাবলী</h2>
            <div className="space-y-2">
              {[
                { q: 'ভর্তির জন্য কোন কোন নথিপত্র প্রয়োজন?', a: 'শিক্ষার্থীর সদ্য তোলা ২ কপি পাসপোর্ট সাইজ রঙ্গিন ছবি, জন্ম নিবন্ধন সার্টিফিকেটের ফটোকপি, অভিভাবকের জাতীয় পরিচয়পত্রের কপি ও পূর্বতন স্কুলের ছাড়পত্র (ট্রান্সফার সার্টিফিকেট) জমা দিতে হবে।' },
                { q: 'হাজিরা ট্র্যাকিং এলার্ট এর জন্য কি বাড়তি ফি দিতে হয়?', a: 'না, এলার্ট খরচ সম্পূর্ণ আমাদের একাডেমিক বাৎসরিক ফি ও মাসিক বেতনের অন্তর্ভুক্ত। অভিভাবককে আলাদা কোন চার্জ প্রদান করতে হবে না।' },
                { q: 'ক্লাসে শিক্ষাদানের ক্ষেত্রে কোন্ ভাষা ব্যবহার করা হয়?', a: 'আমরা জাতীয় বাংলা সিলেবাস ফ্রেমওয়ার্ক অনুসরণ করি। তবে শিক্ষার্থীদের ইংরেজি ভাষায় সুচারু দক্ষতা বাড়াতে কোর ইংলিশ স্পিকিং আওয়ার কো-কারিকুলাম যুক্ত রয়েছে।' }
              ].map((faq, i) => (
                <div key={i} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full text-left p-4 font-bold text-slate-800 text-sm flex justify-between items-center"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg text-blue-900">{activeFaq === i ? '−' : '+'}</span>
                  </button>
                  {activeFaq === i && (
                    <div className="p-4 bg-white text-slate-600 text-xs border-t leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 25: MAP & CONTACT */}
        <section id="sec-contact" className="bg-slate-900 py-16 px-6 lg:px-16 text-white border-b border-slate-950">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <span className="text-xs font-bold text-amber-600 tracking-widest uppercase block mb-2">যোগাযোগ করুন</span>
              <h2 className="text-2xl font-bold mb-6">আজই যোগাযোগ করুন</h2>
              <div className="space-y-4 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>হাউস-২২, রোড-০৪, মিরপুর-১০, ঢাকা-১২১৬</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>+৮৮০১৭১২৩৪৫৬৭৮, +৮৮০১৮২৩৪৫৬৭৮৯</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>info@deliconacademy.edu.bd</span>
                </p>
              </div>
            </div>
            
            <div className="h-44 rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-800 relative flex items-center justify-center">
              <div className="absolute top-2 right-2 bg-blue-900 px-2 py-0.5 rounded text-[9px] font-mono font-bold">Mirpur-10 Hub</div>
              <MapPin className="h-8 w-8 text-blue-900 animate-bounce" />
              <p className="text-[10px] font-mono text-slate-400 absolute mt-12 text-center leading-tight">Delicon Model Academy Campus<br/>Latitude: 23.8011 • Longitude: 90.3700</p>
            </div>
          </div>
        </section>

        {/* SECTION 26: FOOTNOTE HUB */}
        <footer className="bg-slate-950 py-12 px-6 lg:px-16 text-slate-400 text-xs border-t border-slate-900 text-center md:text-left">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-900 pb-8 mb-8">
            <div>
              <span className="text-white text-base font-bold tracking-tight">{schoolName}</span>
              <p className="mt-2 text-[11px] text-slate-500 max-w-sm">একটি আধুনিক ও ডিজিটাল স্কুল ম্যানেজমেন্ট সফটওয়্যার ও প্রগতিশীল স্মার্ট ক্যাম্পাস সুবিধা।</p>
            </div>
            
            <div className="w-full md:w-auto">
              <p className="text-white font-bold text-xs mb-2">সর্বশেষ খবরাখবরের সাবস্ক্রিপশন</p>
              {newsSuccess ? (
                <p className="text-emerald-400 text-xs font-semibold">আপনার ইমেইলটি সফলভাবে সংরক্ষিত হয়েছে!</p>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2 justify-center md:justify-start">
                  <input 
                    type="email" 
                    value={newsEmail}
                    onChange={(e) => setNewsEmail(e.target.value)}
                    placeholder="আপনার ইমেইল..."
                    required
                    className="bg-slate-900 border border-slate-800 rounded-lg text-white p-2 text-xs focus:outline-blue-900 w-52"
                  />
                  <button type="submit" className="rounded-lg bg-blue-900 text-white hover:bg-blue-800 px-4 font-bold text-xs">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600">
            <p>© {new Date().getFullYear()} Delicon Model Academy. All rights reserved. Built with Antigravity Dev Sandbox.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">প্রাইভেসি পলিসি</a>
              <a href="#" className="hover:text-white">ব্যবহারের শর্তাবলী</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
};
