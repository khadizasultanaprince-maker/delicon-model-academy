import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  Bot, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Download, 
  Printer, 
  Calendar, 
  AlertCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Student, ExamMark } from '../types';

interface AcademicAiAssistantProps {
  student: Student;
  examMarks: ExamMark[];
}

interface SummaryReport {
  summary: string;
  strengths: string[];
  improvements: string[];
  attendanceComment: string;
  actionPlan: string[];
}

export const AcademicAiAssistant: React.FC<AcademicAiAssistantProps> = ({ student, examMarks }) => {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Filter exam marks for the current student
  const studentMarks = examMarks.filter(m => m.studentId === student.id);

  const stepsByLanguage = {
    bn: [
      "শিক্ষার্থীর শ্রেণী এবং রোল নম্বর মেলাচ্ছি...",
      "বিগত হাজিরার পরিসংখ্যান ও সক্রিয়তা হিসেব করছি...",
      "বিষয়ভিত্তিক পরীক্ষার জিপিএ ও ফলাফল বিশ্লেষণ করছি...",
      "এআই কাউন্সেলর দ্বারা চূড়ান্ত পোর্টফোলিও ও পরিকল্পনা সাজাচ্ছি..."
    ],
    en: [
      "Matching student class and roll registration details...",
      "Calculating recent attendance and active engagement ratio...",
      "Analyzing subject-wise terminal examination GPA structures...",
      "Finalizing dynamic academic portfolio with AI expert insights..."
    ]
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateSummary = async () => {
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setReport(null);

    // Simulate animated step-by-step loading for superior caregiver experience
    const steps = stepsByLanguage[lang];
    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(i);
      await delay(1200);
    }

    try {
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student,
          examMarks: studentMarks,
          lang
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Server returned error during generation');
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error('AI Generation error:', err);
      setError(
        lang === 'bn' 
          ? 'এআই রিপোর্ট তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে লাইভ সিক্রেটস বা ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।'
          : 'Failed to generate academic review. Please check your system configuration or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReportTxt = () => {
    if (!report) return;

    const banner = "========================================================\n" +
                   `          AL-HIJRA AI ACADEMIC DIALECTIC REPORT (${lang.toUpperCase()})\n` +
                   "========================================================\n";
    
    const profile = `Student Name: ${student.name} (${student.banglaName})\n` +
                    `Class: ${student.className} | Roll: ${student.roll}\n` +
                    `Attendance: ${student.attendancePct}% | Homework: ${student.homeworkStatus}\n` +
                    `Generated On: ${new Date().toLocaleString()}\n\n`;

    const summarySec = `[Overall Executive Summary]\n${report.summary}\n\n`;
    const attendanceSec = `[Attendance & Engagement Insight]\n${report.attendanceComment}\n\n`;

    const strengthsSec = `[Student Strengths & Capabilities]\n` + report.strengths.map(s => `- ${s}`).join('\n') + `\n\n`;
    const improvementSec = `[Targeted Areas of Study Improvement]\n` + report.improvements.map(i => `- ${i}`).join('\n') + `\n\n`;
    const actionPlanSec = `[Actionable Roadmap for Parents / Guardians]\n` + report.actionPlan.map(a => `- ${a}`).join('\n') + `\n\n`;

    const footer = "========================================================\n" +
                   "Al-Hijra Smart Model Academy System - Powered by Gemini AI\n";

    const content = banner + profile + summarySec + attendanceSec + strengthsSec + improvementSec + actionPlanSec + footer;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.name.replace(/\s+/g, '_')}_Academic_AI_Report_${lang}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="academic-ai-assistant-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* High Contrast Header with custom aesthetic color */}
      <div className="bg-gradient-to-r from-teal-900 to-blue-900 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500/20 p-2.5 rounded-xl border border-teal-400/30">
            <Bot className="h-6 w-6 text-teal-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-400/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/30 font-mono tracking-widest">
                GEMINI AI POWERED
              </span>
            </div>
            <h3 className="font-black text-lg mt-1 tracking-tight">
              অ্যাকাডেমিক এআই কাউন্সেলর ড্যাশবোর্ড
            </h3>
            <p className="text-slate-300 text-xs mt-0.5 font-medium">
              Academic AI Assistant for Caregivers & Guardian Reviews
            </p>
          </div>
        </div>

        {/* Language Selection Bar (Pure CSS/Tailwind layout) */}
        <div className="flex bg-slate-800/60 p-1 rounded-lg border border-slate-700/50 shrink-0">
          <button 
            type="button"
            onClick={() => setLang('bn')} 
            className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
              lang === 'bn' 
                ? 'bg-teal-500 text-slate-900 shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            বাংলা 🇧🇩
          </button>
          <button 
            type="button"
            onClick={() => setLang('en')} 
            className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
              lang === 'en' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            English 🇬🇧
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Core Description Box */}
        <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 mb-6 text-slate-700">
          <div className="flex gap-2.5 items-start">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800 mb-1">
                {lang === 'bn' ? 'সম্মানিত অভিভাবকবৃন্দ,' : 'Dear Guardians,'}
              </p>
              <p className="text-xs leading-relaxed text-slate-600">
                {lang === 'bn' 
                  ? 'আপনার সন্তান আমাদের একাডেমিতে কেমন অংশগ্রহণ করছে, তার হাজিরা পরিসংখ্যান ও সাম্প্রতিক পরীক্ষার উত্তরপত্র বিশ্লেষণ করে একটি তাৎক্ষণিক এআই একাডেমিক রিভিউ রিপোর্ট কার্ড তৈরি করুন। এটি আপনাকে হোমওয়ার্ক নির্দেশনা নিশ্চিত করতে একমুখী দূরদর্শিতা দেবে।'
                  : 'Synthesize student grades, class check-ins, and performance statistics securely using Generative AI. Get structural highlights, improvements needed, and caregiver roadmap actions.'}
              </p>
            </div>
          </div>
        </div>

        {/* Input Parameters Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {lang === 'bn' ? 'শিক্ষার্থী' : 'Student Name'}
            </span>
            <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
              {lang === 'bn' ? student.banglaName : student.name}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {lang === 'bn' ? 'শ্রেণী ও রোল' : 'Class & Roll'}
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              {student.className} – रोल: {student.roll}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {lang === 'bn' ? 'হাজিরার গড় হার' : 'Total Attendance'}
            </span>
            <span className="text-xs font-bold block mt-0.5 text-blue-800">
              {student.attendancePct}%
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {lang === 'bn' ? 'হোমওয়ার্ক প্রটোকল' : 'Homework Task'}
            </span>
            <span className={`text-xs font-bold block mt-0.5 ${
              student.homeworkStatus === 'Completed' ? 'text-emerald-700' :
              student.homeworkStatus === 'Needs-Motivation' ? 'text-amber-700' : 'text-slate-600'
            }`}>
              {student.homeworkStatus}
            </span>
          </div>
        </div>

        {/* Subject wise marks summary to reassure guardians we provide true context */}
        {studentMarks.length > 0 && (
          <div className="mb-6 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
            <h4 className="text-xs font-extrabold text-slate-705 mb-2 flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-blue-800" />
              {lang === 'bn' ? `সাম্প্রতিক পরীক্ষার মূল্যায়ন ট্রেইল (${studentMarks.length}টি বিষয়)` : `Recent School Examination Marks (${studentMarks.length} Items)`}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-650">
              {studentMarks.map(item => (
                <div key={item.id} className="p-2 border border-slate-100 bg-white rounded shadow-2xs">
                  <div className="font-bold text-slate-800 truncate capitalise">{item.subject}</div>
                  <div className="text-[10px] text-slate-400">{item.examName}</div>
                  <div className="mt-1 flex justify-between">
                    <span>{lang === 'bn' ? 'মার্কস:' : 'Mark:'} {item.totalMarks}</span>
                    <span className="font-extrabold text-blue-900 font-mono">{item.grade} ({item.gpa})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active trigger states */}
        <div className="flex flex-col items-center justify-center py-4 border-t border-slate-100">
          {!loading && !report && (
            <button
              id="ai-generate-init-btn"
              type="button"
              onClick={generateSummary}
              className="px-6 py-3 bg-gradient-to-r from-teal-800 to-blue-900 text-white rounded-xl font-bold text-xs hover:from-teal-700 hover:to-blue-800 shadow-sm flex items-center gap-2 transition duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-teal-300" />
              {lang === 'bn' ? 'এআই কাউন্সেলর রিভিউ শুরু করুন' : 'Initiate AI Counselor Dialogue'}
            </button>
          )}

          {/* Loading Milestones Progress Bar Sequence */}
          {loading && (
            <div className="w-full max-w-md p-4 bg-slate-50 rounded-xl border border-slate-150 shadow-2xs">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-teal-700 animate-spin" />
                <span className="text-xs font-bold text-slate-800">
                  {lang === 'bn' ? 'এআই স্যানিটাইজিং চলছে...' : 'AI Processing Active...'}
                </span>
              </div>
              
              {/* Stepper visually representation */}
              <div className="mt-4 space-y-2">
                {stepsByLanguage[lang].map((stepText, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      idx < loadingStep 
                        ? 'bg-emerald-500 text-white' 
                        : idx === loadingStep 
                          ? 'bg-teal-800 text-white animate-pulse' 
                          : 'bg-slate-200 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`font-medium ${idx === loadingStep ? 'text-teal-900 font-bold' : idx < loadingStep ? 'text-slate-400' : 'text-slate-400'}`}>
                      {stepText}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000 ease-in-out" 
                  style={{ width: `${((loadingStep + 1) / stepsByLanguage[lang].length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error fallback display */}
          {error && (
            <div className="w-full max-w-lg p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 mt-2">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">{lang === 'bn' ? 'অপারেশন ব্যর্থ হয়েছে' : 'Operation Failed'}</p>
                  <p className="text-xs mt-1 leading-relaxed">{error}</p>
                  <button 
                    type="button"
                    onClick={generateSummary} 
                    className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-900 font-extrabold px-3 py-1.5 rounded transition duration-150 cursor-pointer"
                  >
                    {lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Process'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic AI Output Presentation */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="border border-slate-250 rounded-2xl bg-gradient-to-b from-slate-50/50 to-white overflow-hidden shadow-xs mt-4"
            >
              {/* Header inside report sheet */}
              <div className="bg-slate-100 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    {lang === 'bn' ? 'রিসার্চ ড্রাফট' : 'AI Generated Evaluation'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-850 mt-0.5 font-bold">
                    <Brain className="h-4 w-4 text-blue-900" />
                    <span>আল-হিজরা ডিজিটাল কাউন্সেলিং রিপোর্ট ({lang.toUpperCase()})</span>
                  </div>
                </div>

                {/* Print and Export Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={downloadReportTxt}
                    className="p-1 px-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-600" />
                    <span>{lang === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-1 px-3.5 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-500" />
                    <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                  </button>
                </div>
              </div>

              {/* Structured Grid Elements of Gemini output */}
              <div className="p-6 space-y-6">
                
                {/* Executive Summary Statement */}
                <div className="space-y-2">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    {lang === 'bn' ? 'সার্বিক মূল্যায়ন সারসংক্ষেপ' : 'Executive Academic Overview'}
                  </h5>
                  <div className="bg-teal-50/40 p-4 rounded-xl border border-teal-100/60 text-slate-750 text-xs leading-relaxed font-medium">
                    {report.summary}
                  </div>
                </div>

                {/* Grid for Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Strengths */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-black text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                      <Award className="h-4 w-4 text-emerald-600" />
                      {lang === 'bn' ? 'বিশেষ দক্ষতাসমূহ ও শক্তি' : 'Core Capabilities & Strengths'}
                    </h5>
                    <div className="space-y-2">
                      {report.strengths.map((str, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start bg-emerald-50/20 border border-emerald-100 p-3 rounded-lg text-xs font-semibold text-slate-750">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Areas for focus improvement */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-black text-indigo-900 uppercase tracking-wide flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-indigo-700" />
                      {lang === 'bn' ? 'মনোযোগ বা মানোন্নয়নের ক্ষেত্র' : 'Areas Requiring Focused Study'}
                    </h5>
                    <div className="space-y-2">
                      {report.improvements.map((imp, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start bg-indigo-50/20 border border-indigo-100 p-3 rounded-lg text-xs font-semibold text-slate-750">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Attendance Insight Comment */}
                <div className="pt-2">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Calendar className="h-4 w-4 text-blue-800" />
                    {lang === 'bn' ? 'উপস্থিতি ও ক্লাসরুম নিয়মানুবর্তিতা' : 'Punctuality & Presence Evaluation'}
                  </h5>
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-xs text-slate-705 leading-relaxed italic">
                    &ldquo;{report.attendanceComment}&rdquo;
                  </div>
                </div>

                {/* Actionable Advice Framework */}
                <div className="bg-teal-900 text-teal-100 p-6 rounded-2xl border border-teal-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-black uppercase tracking-widest text-teal-300">
                      {lang === 'bn' ? 'অভিভাবকদের জন্য প্রাত্যহিক রোডম্যাপ পদক্ষেপ' : 'Home-Study Action Roadmap for Guardians'}
                    </h5>
                  </div>
                  <div className="space-y-3 font-medium text-xs">
                    {report.actionPlan.map((act, idx) => (
                      <div key={idx} className="flex gap-3 items-start border-b border-teal-850/60 pb-3 last:border-0 last:pb-0">
                        <span className="w-5 h-5 rounded-md bg-teal-800 text-teal-300 flex items-center justify-center text-[11px] font-black shrink-0 font-mono">
                          0{idx + 1}
                        </span>
                        <span className="leading-relaxed">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Section to clear/re-run */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={generateSummary}
                  className="px-4 py-2 bg-slate-300/80 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-teal-800" />
                  <span>{lang === 'bn' ? 'নতুন রিভিউ তৈরি করুন' : 'Re-Evaluate Academic Summary'}</span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
