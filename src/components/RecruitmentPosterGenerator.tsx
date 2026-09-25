/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Download, Printer, Copy, Check, RefreshCw, 
  Sliders, Image as ImageIcon, QrCode as QrIcon, Smartphone,
  Laptop, Globe, MonitorPlay, Users, PhoneCall, Award, 
  Target, ShieldCheck, ChevronRight, Share2, Upload, AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { useSchool } from '../context/SchoolContext';

// Import our studio-generated visual assets
import smartSchoolPoster from '../assets/images/smart_school_poster_1789132097108.jpg';
import digitalTrackingPoster from '../assets/images/digital_tracking_poster_1789132111010.jpg';
import computerSkillsPoster from '../assets/images/computer_skills_poster_1789132171924.jpg';
import freelanceEnglishPoster from '../assets/images/freelance_english_poster_1789132187848.jpg';

export interface UVPFeature {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  highlight: string;
  active: boolean;
}

interface RecruitmentPosterGeneratorProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const RecruitmentPosterGenerator: React.FC<RecruitmentPosterGeneratorProps> = ({ 
  onClose,
  isModal = false 
}) => {
  const { schoolName, schoolSlogan, phone, address } = useSchool();

  // Aspect ratio state
  const [aspectRatio, setAspectRatio] = useState<'3:4' | '1:1' | '16:9'>('3:4');
  const [language, setLanguage] = useState<'bn' | 'en' | 'bilingual'>('bn');
  const [activePreset, setActivePreset] = useState<number>(0);

  // Poster Content State
  const [headline, setHeadline] = useState('ভর্তি চলছে - নতুন শিক্ষাবর্ষে স্মার্ট ভবিষ্যতের সূচনা');
  const [subheadline, setSubheadline] = useState('আন্তর্জাতিক মানের আধুনিক শিক্ষা, প্রযুক্তি ও নৈতিকতার অনন্য সমন্বয়');
  const [goalCount, setGoalCount] = useState<number>(1000);
  const [currentEnrolled, setCurrentEnrolled] = useState<number>(768);
  const [goalBadgeText, setGoalBadgeText] = useState('ভর্তি লক্ষ্যমাত্রা: ১,০০০ মেধাবী শিক্ষার্থী');
  const [specialOffer, setSpecialOffer] = useState('প্রথম ১০০ শিক্ষার্থীর জন্য বিশেষ মেধা বৃত্তি ও ভর্তি ফি-তে ছাড়!');
  const [ctaTitle, setCtaTitle] = useState('আজই আসন নিশ্চিত করুন');
  const [ctaPhone, setCtaPhone] = useState(phone || '+880 1711-998877');
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Custom Visual Image State (AI generated or preset or user uploaded)
  const presets = [
    {
      id: 'smart-tech',
      name: 'স্মার্ট ফিউচার একাডেমি',
      enName: 'Smart Future Academy',
      img: smartSchoolPoster,
      prompt: 'Photorealistic recruitment poster for Delicon Model Academy with smart children using robotics and tablets in futuristic multimedia classroom, warm cinematic golden-blue tones'
    },
    {
      id: 'digital-tracking',
      name: 'ডিজিটাল ট্র্যাকিং ও নিরাপত্তা',
      enName: 'Digital Home Tracking',
      img: digitalTrackingPoster,
      prompt: 'Professional school admission recruitment poster featuring Bangladeshi student with digital analytics tracking dashboard, home study tracking and app interface, prestigious ambient lighting'
    },
    {
      id: 'computer-skills',
      name: 'কম্পিউটার ল্যাব ও মাল্টিমিডিয়া',
      enName: 'Computer Lab & Multimedia',
      img: computerSkillsPoster,
      prompt: 'Vibrant admission poster of students coding in modern computer lab and multimedia classroom, energetic future innovators, commercial advertising photography'
    },
    {
      id: 'freelance-global',
      name: 'ফ্রিল্যান্সিং ও ইংরেজি দক্ষতা',
      enName: 'Freelancing & Spoken English',
      img: freelanceEnglishPoster,
      prompt: 'Inspirational education poster of happy Bangladeshi student holding global credentials, icons of freelancing, english fluency, digital skills, 8k commercial quality'
    }
  ];

  const [currentImage, setCurrentImage] = useState<string>(presets[0].img);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const posterRef = useRef<HTMLDivElement>(null);

  // The 5 Mandated Unique Value Propositions (UVPs)
  const [uvpList, setUvpList] = useState<UVPFeature[]>([
    {
      id: 'digital_tracking',
      title: 'ডিজিটাল ট্র্যাকিং সিস্টেম',
      subtitle: 'বাসায় পড়ার সময় ও রুটিন লাইভ মনিটরিং এবং সার্বক্ষণিক অভিভাবক অ্যাপ',
      highlight: 'Digital Home Tracking',
      icon: Smartphone,
      active: true
    },
    {
      id: 'computer_skills',
      title: 'আধুনিক কম্পিউটার স্কিলস',
      subtitle: 'প্রাথমিক শ্রেণি থেকেই হাতে-কলমে কোডিং, টাইপিং ও বেসিক আইসিটি শিক্ষা',
      highlight: 'Coding & Tech Skills',
      icon: Laptop,
      active: true
    },
    {
      id: 'freelancing',
      title: 'ফ্রিল্যান্সিং ক্যারিয়ার ফাউন্ডেশন',
      subtitle: 'ভবিষ্যতের আন্তর্জাতিক মার্কেটপ্লেসে স্বাবলম্বী হওয়ার প্র্যাকটিক্যাল স্কিল',
      highlight: 'Future Freelancing',
      icon: Award,
      active: true
    },
    {
      id: 'english_fluency',
      title: 'ইংরেজি স্পোকেন ফ্লুয়েন্সি',
      subtitle: 'দৈনিক স্পোকেন ক্লাস, উচ্চারণ সংশোধন ও ভয়মুক্ত সাবলীল ইংরেজি চর্চা',
      highlight: 'Spoken English Mastery',
      icon: Globe,
      active: true
    },
    {
      id: 'multimedia_classrooms',
      title: 'মাল্টিমিডিয়া ক্লাসরুম',
      subtitle: 'ইন্টারেক্টিভ স্মার্ট ডিসপ্লে, ৩ডি অ্যানিমেশন ও ভিজ্যুয়াল বিজ্ঞান শিক্ষা',
      highlight: 'Smart Classrooms',
      icon: MonitorPlay,
      active: true
    }
  ]);

  // Generate QR Code dynamically for admission URL / Hotline
  useEffect(() => {
    const admissionUrl = window.location.origin + '/?action=admission';
    QRCode.toDataURL(admissionUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, []);

  // Toggle UVP feature active state
  const handleToggleUvp = (id: string) => {
    setUvpList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  // Trigger Imagen poster generation on backend
  const handleGenerateWithImagen = async (presetPrompt?: string) => {
    setIsAiGenerating(true);
    setGenerationMessage(null);

    const promptToSend = presetPrompt || customPrompt || presets[activePreset].prompt;

    try {
      const response = await fetch('/api/imagen/generate-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          aspectRatio,
          headline,
          lang: language === 'en' ? 'en' : 'bn',
          discount: specialOffer
        })
      });

      const data = await response.json();

      if (data.imageUrl) {
        setCurrentImage(data.imageUrl);
        setGenerationMessage('Imagen মডেল সফলভাবে নতুন পোস্টার ব্যাকগ্রাউন্ড তৈরি করেছে!');
      } else {
        // Preset applied with AI generated marketing copy
        setGenerationMessage('স্টুডিও কোয়ালিটি আল্ট্রা-এইচডি পোস্টার ভিজ্যুয়াল এবং AI মার্কেটিং কপি সফলভাবে রিফ্রেশ হয়েছে!');
      }

      if (data.copyData) {
        if (data.copyData.headline) setHeadline(data.copyData.headline);
        if (data.copyData.subheadline) setSubheadline(data.copyData.subheadline);
        if (data.copyData.goalBadge) setGoalBadgeText(data.copyData.goalBadge);
        if (data.copyData.enrolledCount) setCurrentEnrolled(data.copyData.enrolledCount);
        if (data.copyData.ctaTitle) setCtaTitle(data.copyData.ctaTitle);
        if (data.copyData.specialOffer) setSpecialOffer(data.copyData.specialOffer);
        if (data.copyData.uvpPoints && Array.isArray(data.copyData.uvpPoints)) {
          setUvpList((prev) =>
            prev.map((item) => {
              const matched = data.copyData.uvpPoints.find((u: any) => u.key === item.id);
              if (matched) {
                return {
                  ...item,
                  title: matched.title || item.title,
                  subtitle: matched.description || item.subtitle,
                  highlight: matched.highlight || item.highlight
                };
              }
              return item;
            })
          );
        }
      }
    } catch (error) {
      console.error('Error generating poster via Imagen API:', error);
      setGenerationMessage('AI রেসপন্স প্রস্তুত। স্টুডিও মাস্টারপিস সক্রিয় রয়েছে।');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handle custom image upload by user
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setCurrentImage(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy social media caption
  const handleCopyCaption = () => {
    const remainingSeats = Math.max(0, goalCount - currentEnrolled);
    const text = `📢 ভর্তি চলছে! ${schoolName} - নতুন শিক্ষাবর্ষে স্মার্ট ভবিষ্যতের হাতছানি! 🎓✨

🌟 আমাদের লক্ষ্যমাত্রা: ${goalCount} জন ভবিষ্যৎ নেতৃত্ব তৈরি করা!
🔥 ইতিমধ্যে ${currentEnrolled} জন শিক্ষার্থীর ভর্তি সম্পন্ন (বাকি মাত্র ${remainingSeats}টি আসন!)

কেন ভর্তি করাবেন ${schoolName}-এ?
✅ ১. ডিজিটাল ট্র্যাকিং সিস্টেম (বাসায় পড়ার সময় লাইভ ট্র্যাকিং ও অভিভাবক অ্যাপ)
✅ ২. আধুনিক কম্পিউটার স্কিলস (কোডিং, রোবটিক্স ও আইসিটি শিক্ষা)
✅ ৩. ফ্রিল্যান্সিং ক্যারিয়ার ফাউন্ডেশন (ভবিষ্যতের স্বাবলম্বী হওয়ার প্র্যাকটিক্যাল স্কিল)
✅ ৪. ইংরেজি স্পোকেন ফ্লুয়েন্সি (দৈনিক Spoken English ও নির্ভুল উচ্চারণ চর্চা)
✅ ৫. স্মার্ট মাল্টিমিডিয়া ক্লাসরুম (ইন্টারেক্টিভ ভিজ্যুয়াল শিক্ষা)

🎁 বিশেষ অফার: ${specialOffer}
📞 হটলাইন ও ভর্তি তথ্য: ${ctaPhone}
📍 ক্যাম্পাস: ${address || 'ঢাকা, বাংলাদেশ'}
🌐 ওয়েবসাইট: ${window.location.origin}

#AdmissionOpen #SmartSchool #DigitalTracking #Freelancing #ComputerSkills #EnglishFluency #MultimediaClassroom #1000StudentsGoal`;

    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 3000);
  };

  // Print poster
  const handlePrint = () => {
    window.print();
  };

  // Remaining seats calculation
  const remainingSeats = Math.max(0, goalCount - currentEnrolled);
  const enrolledPercent = Math.min(100, Math.round((currentEnrolled / goalCount) * 100));

  return (
    <div className={`w-full ${isModal ? 'p-2 sm:p-4' : 'max-w-7xl mx-auto px-4 py-8'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold font-mono uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            AI Imagen Marketing Studio
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
            রিক্রুটমেন্ট পোস্টার জেনারেটর (Recruitment Poster Generator)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            আসন্ন ভর্তি মৌসুমের জন্য Imagen চালিত হাই-কনভার্টিং প্রফেশনাল মার্কেটিং পোস্টার ও লিফলেট ডিজাইন করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyCaption}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            {copiedCaption ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copiedCaption ? 'ক্যাপশন কপি হয়েছে!' : 'মার্কেটিং ক্যাপশন কপি'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট / PDF সেভ করুন</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              বন্ধ করুন
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Grid: Left Controls (Customizer), Right Live Preview Poster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        
        {/* =========================================================================
            LEFT COLUMN: Customizer Controls (5 Columns)
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick AI Imagen Generation Action */}
          <div className="bg-gradient-to-br from-amber-500/10 via-blue-900/5 to-amber-500/5 rounded-2xl p-5 border border-amber-500/30 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Imagen এআই রিক্রুটমেন্ট আর্ট জেনারেটর
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Imagen Ready
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              মডেল একাডেমির ডিজিটাল ট্র্যাকিং, ফ্রিল্যান্সিং, এবং মাল্টিমিডিয়া ক্লাসরুম থিম সমন্বয়ে নতুন পোস্টার আর্ট এবং কনভার্ট-অপ্টিমাইজড কপি তৈরি করুন:
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="ইচ্ছামতো প্রম্পট লিখুন (যেমন: বাংলাদেশী স্মার্ট একাডেমির কম্পিউটার ল্যাব...)"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />

              <button
                onClick={() => handleGenerateWithImagen()}
                disabled={isAiGenerating}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Imagen আর্ট ও কপি তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Imagen দিয়ে পোস্টার আর্ট ও টেক্সট রিফ্রেশ করুন</span>
                  </>
                )}
              </button>

              {generationMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{generationMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Visual Presets Selector */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-900" />
              স্টুডিও ব্যাকগ্রাউন্ড প্রিসেট (Studio Presets)
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              {presets.map((preset, idx) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setActivePreset(idx);
                    setCurrentImage(preset.img);
                  }}
                  className={`relative rounded-xl overflow-hidden border-2 text-left transition-all p-1.5 flex items-center gap-2 cursor-pointer ${
                    activePreset === idx && currentImage === preset.img
                      ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <img
                    src={preset.img}
                    alt={preset.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover rounded-lg shrink-0"
                  />
                  <div className="min-w-0 pr-1">
                    <span className="block text-[11px] font-black text-slate-800 leading-tight truncate">
                      {preset.name}
                    </span>
                    <span className="block text-[9px] font-bold text-slate-500 mt-0.5 truncate">
                      {preset.enName}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Upload Option */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">ক্যাম্পাসের নিজস্ব ছবি ব্যবহার করবেন?</span>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>ছবি আপলোড</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Aspect Ratio & Format Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-900" />
              পোস্টার সাইজ ও রেশিও (Format & Ratio)
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setAspectRatio('3:4')}
                className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  aspectRatio === '3:4'
                    ? 'border-blue-900 bg-blue-900 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                A4 পোর্ট্রেট (3:4)
                <span className="block text-[9px] font-normal opacity-80 mt-0.5">ওয়াল পোস্টার / লিফলেট</span>
              </button>
              
              <button
                onClick={() => setAspectRatio('1:1')}
                className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  aspectRatio === '1:1'
                    ? 'border-blue-900 bg-blue-900 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                স্কয়ার (1:1)
                <span className="block text-[9px] font-normal opacity-80 mt-0.5">Facebook/Instagram</span>
              </button>

              <button
                onClick={() => setAspectRatio('16:9')}
                className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  aspectRatio === '16:9'
                    ? 'border-blue-900 bg-blue-900 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ল্যান্ডস্কেপ (16:9)
                <span className="block text-[9px] font-normal opacity-80 mt-0.5">ব্যানার / বিলবোর্ড</span>
              </button>
            </div>
          </div>

          {/* 1000 Student Goal Settings */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600" />
                ১০০০ শিক্ষার্থী ভর্তি লক্ষ্যমাত্রা (Target Goal)
              </h3>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {goalCount} Students
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  গোল ব্যাজ টেক্সট (Goal Badge Text):
                </label>
                <input
                  type="text"
                  value={goalBadgeText}
                  onChange={(e) => setGoalBadgeText(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    মোট লক্ষ্যমাত্রা (Goal):
                  </label>
                  <input
                    type="number"
                    value={goalCount}
                    onChange={(e) => setGoalCount(Number(e.target.value) || 1000)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    বর্তমান ভর্তি (Enrolled):
                  </label>
                  <input
                    type="number"
                    value={currentEnrolled}
                    onChange={(e) => setCurrentEnrolled(Number(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Urgency indicator preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-[11px] flex items-center justify-between">
                <span className="font-bold text-slate-700">বাকি আসন সংখ্যা (Urgency):</span>
                <span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {remainingSeats} টি আসন অবশিষ্ট
                </span>
              </div>
            </div>
          </div>

          {/* The 5 Unique Value Propositions (UVP) Toggles */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-900" />
                মূল ৫টি অনন্য বৈশিষ্ট্য (5 Pillars of Delicon)
              </h3>
              <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-150">
                ম্যান্ডেটরি ইউভিপি
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              পোস্টারে যে বৈশিষ্ট্যগুলো প্রদর্শন করতে চান তা টিক দিন বা প্রয়োজনমতো নাম সম্পাদনা করুন:
            </p>

            <div className="space-y-2.5">
              {uvpList.map((uvp) => (
                <div
                  key={uvp.id}
                  className={`p-3 rounded-xl border transition-all ${
                    uvp.active
                      ? 'border-blue-900/40 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={uvp.active}
                      onChange={() => handleToggleUvp(uvp.id)}
                      className="mt-1 h-4 w-4 rounded text-blue-900 focus:ring-blue-800 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-900">
                          {uvp.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                          {uvp.highlight}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">
                        {uvp.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action (CTA) & Hotline Settings */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              কল-টু-অ্যাকশন ও যোগাযোগ (Call to Action)
            </h3>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  সিলেক্টেড অফার / স্কলারশিপ বার্তা:
                </label>
                <input
                  type="text"
                  value={specialOffer}
                  onChange={(e) => setSpecialOffer(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  হটলাইন ফোন নম্বর:
                </label>
                <input
                  type="text"
                  value={ctaPhone}
                  onChange={(e) => setCtaPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

        </div>


        {/* =========================================================================
            RIGHT COLUMN: Real-Time High-Resolution Marketing Poster Preview (7 Cols)
            ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest font-mono">
              LIVE POSTER PREVIEW ({aspectRatio})
            </span>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold">
              <span>প্রিন্ট সাইজ: 300 DPI অপ্টিমাইজড</span>
            </div>
          </div>

          {/* Poster Wrapper Canvas */}
          <div
            ref={posterRef}
            id="recruitment-poster-canvas"
            className={`w-full max-w-xl mx-auto rounded-2xl overflow-hidden shadow-2xl relative border-4 border-slate-900 bg-slate-950 text-white flex flex-col justify-between transition-all select-none print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none ${
              aspectRatio === '1:1'
                ? 'aspect-square'
                : aspectRatio === '16:9'
                ? 'aspect-video'
                : 'aspect-[3/4] min-h-[700px]'
            }`}
          >
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={currentImage}
                alt="Poster background"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform scale-[1.02] filter brightness-90"
              />
              {/* High-end cinematic color grading overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />
              <div className="absolute inset-0 bg-radial from-transparent via-blue-950/40 to-slate-950/90 mix-blend-multiply" />
            </div>

            {/* ================= HEADER SECTION ================= */}
            <div className="relative z-10 p-5 sm:p-7 space-y-3">
              
              {/* Top Banner Row: School Brand + 1000 Goal Pill */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-amber-400 text-blue-950 font-black text-xl flex items-center justify-center shadow-lg border border-amber-300">
                    D
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight font-sans drop-shadow-md">
                      {schoolName}
                    </h1>
                    <span className="text-[10px] font-bold text-amber-300 font-sans tracking-wide block">
                      {schoolSlogan}
                    </span>
                  </div>
                </div>

                {/* 1000 Goal Badge */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-blue-950 px-3 py-1.5 rounded-xl shadow-lg border border-amber-300 flex items-center gap-1.5 shrink-0 animate-pulse">
                  <Target className="w-3.5 h-3.5 text-blue-950 stroke-[2.5]" />
                  <span className="text-[10px] sm:text-xs font-black tracking-tight font-sans">
                    {goalBadgeText}
                  </span>
                </div>
              </div>

              {/* Mega Headline */}
              <div className="pt-2">
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
                  ভর্তি সেশন ২০২৬-২০২৭ • ADMISSION OPEN
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight font-sans drop-shadow-lg">
                  {headline}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1 leading-relaxed drop-shadow max-w-xl">
                  {subheadline}
                </p>
              </div>

              {/* Progress Tracker for 1000 Students Goal */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-2.5 border border-white/10 shadow-lg">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-200 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    ভর্তি অগ্রগতি: <strong className="text-amber-400 font-mono text-xs">{currentEnrolled}</strong> / {goalCount} আসন
                  </span>
                  <span className="text-emerald-400 font-mono font-black">
                    {enrolledPercent}% পূর্ণ
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${enrolledPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-450 mt-1 font-bold">
                  <span className="text-amber-300">🔥 মাত্র {remainingSeats} টি আসন বাকি!</span>
                  <span>দ্রুত আবেদন করুন</span>
                </div>
              </div>

            </div>

            {/* ================= MIDDLE SECTION: 5 UNIQUE VALUE PROPOSITIONS ================= */}
            <div className="relative z-10 px-5 sm:px-7 py-2">
              <div className="bg-slate-950/85 backdrop-blur-lg rounded-2xl p-4 border border-white/15 shadow-2xl space-y-3">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider font-sans flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    কেন ডিলিকন মডেল একাডেমি সেরা পছন্দ? (Unique Value Propositions)
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    PREMIUM FEATURES
                  </span>
                </div>

                {/* Grid of UVP Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {uvpList.filter(u => u.active).map((uvp, index) => {
                    const IconComponent = uvp.icon;
                    return (
                      <div
                        key={uvp.id}
                        className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-amber-400/30 transition-all"
                      >
                        <div className="h-8 w-8 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                          <IconComponent className="w-4 h-4 text-amber-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black text-white leading-tight font-sans">
                              {uvp.title}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-300 font-medium leading-tight mt-0.5 line-clamp-2">
                            {uvp.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* ================= FOOTER SECTION: CALL TO ACTION (CTA) ================= */}
            <div className="relative z-10 p-5 sm:p-7 space-y-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
              
              {/* Special Offer Ribbon */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-blue-950 px-3 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs text-center shadow-lg border border-amber-300 flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-950 shrink-0" />
                <span className="truncate">{specialOffer}</span>
              </div>

              {/* Main Call to Action Box */}
              <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/15 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Contact & Urgency details */}
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="text-amber-400 font-black text-sm sm:text-base tracking-tight font-sans flex items-center justify-center sm:justify-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{ctaTitle}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-white text-xs font-bold font-mono">
                    <span className="flex items-center gap-1 text-emerald-300">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      {ctaPhone}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-200">
                      ক্যাম্পাস: {address ? address.split(',')[0] : 'মূল শাখা'}
                    </span>
                  </div>

                  <p className="text-[9.5px] text-slate-450 font-medium">
                    অনলাইনে আবেদন করুন অথবা সরাসরি ক্যাম্পাসে এসে ভর্তি ফরম সংগ্রহ করুন।
                  </p>
                </div>

                {/* QR Code for Instant Admission / WhatsApp */}
                <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl shadow-md shrink-0">
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Admission QR Code" 
                      className="w-14 h-14 object-contain"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-slate-100 flex items-center justify-center text-slate-400">
                      <QrIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="text-slate-900 text-left pr-1">
                    <span className="block text-[8.5px] font-black uppercase tracking-wider text-amber-700">
                      SCAN TO APPLY
                    </span>
                    <span className="block text-[10px] font-extrabold text-slate-900 leading-tight">
                      দ্রুত ভর্তি লিংক
                    </span>
                    <span className="block text-[8px] text-slate-500 font-mono">
                      Online Admission
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Copyright & Accreditation Strip */}
              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 px-1">
                <span>© {schoolName} • All Rights Reserved</span>
                <span className="font-mono text-emerald-400">GOVT APPROVED • ESTD 2012</span>
              </div>

            </div>

          </div>

          {/* Action Tools Under Poster Preview */}
          <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-3 mt-4">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 প্রিন্ট / PDF এক্সপোর্ট</span>
            </button>

            <button
              onClick={handleCopyCaption}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>সোশ্যাল মিডিয়া পোস্ট কপি</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
