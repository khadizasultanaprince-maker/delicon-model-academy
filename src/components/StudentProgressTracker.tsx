import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Compass, 
  BookOpen, 
  ClipboardList, 
  Milestone, 
  Trophy, 
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Student } from '../types';

interface StudentProgressTrackerProps {
  student: Student;
}

interface AcademicModule {
  id: string;
  name: string;
  banglaName: string;
  subject: string;
  chapters: number;
}

interface AcademicAssignment {
  id: string;
  title: string;
  banglaTitle: string;
  subject: string;
  dueDate: string;
  estimatedHours: number;
}

// Tailored syllabus modules per class to look completely custom and authoritative
const DEFAULT_MODULES_BY_CLASS: Record<string, AcademicModule[]> = {
  'Class 10': [
    { id: 'm1', name: 'Al-Jabr & Analytical Geometry', banglaName: 'বীজগণিত ও স্থানাঙ্ক জ্যামিতি', subject: 'Math', chapters: 5 },
    { id: 'm2', name: 'Structural Chemistry & Bonding', banglaName: 'পদার্থের গঠন ও রাসায়নিক বন্ধন', subject: 'Science', chapters: 4 },
    { id: 'm3', name: 'Classical Bengali Prose and Grammar', banglaName: 'বাংলা গদ্য এবং ব্যাকরণ সংকলন', subject: 'Bangla', chapters: 6 },
    { id: 'm4', name: 'English Formal Syntax & Rhetoric', banglaName: 'ইংরেজি ফর্মাল সিনট্যাক্স ও রাইটিং', subject: 'English', chapters: 5 },
    { id: 'm5', name: 'Religions & Moral Philosophies', banglaName: 'ইসলাম ও নৈতিক শিক্ষা প্রোটোকল', subject: 'Religion', chapters: 3 }
  ],
  'default': [
    { id: 'md1', name: 'Fundamentals of Mathematics', banglaName: 'গণিত ও যুক্তিবিদ্যা অনুশীলন', subject: 'Math', chapters: 4 },
    { id: 'md2', name: 'Basic Physics & Nature Mechanics', banglaName: 'প্রাথমিক বিজ্ঞান ও প্রকৃতি বিজ্ঞান', subject: 'Science', chapters: 3 },
    { id: 'md3', name: 'Bengali Sentence Construction', banglaName: 'বাংলা বাক্য গঠন ও সহজ ব্যাকরণ', subject: 'Bangla', chapters: 5 },
    { id: 'md4', name: 'Basic English Comprehension', banglaName: 'ইংরেজি ভোকাবুলারি ও রিডিং স্কিল', subject: 'English', chapters: 4 }
  ]
};

const DEFAULT_ASSIGNMENTS_BY_CLASS: Record<string, AcademicAssignment[]> = {
  'Class 10': [
    { id: 'a1', title: 'Quadratic Equations Exercise Sheet', banglaTitle: 'দ্বিঘাত সমীকরণ সমাধান অ্যাসাইনমেন্ট', subject: 'Math', dueDate: '2026-06-22', estimatedHours: 3 },
    { id: 'a2', title: 'Periodic Table Properties Diagram', banglaTitle: 'পর্যায় সারণী ও পর্যায়বৃত্ত ধর্ম চার্ট', subject: 'Science', dueDate: '2026-06-25', estimatedHours: 4 },
    { id: 'a3', title: 'Creative Essay on Digital Bangladesh', banglaTitle: 'স্মার্ট বাংলাদেশ ও আমাদের ভবিষ্যৎ প্রবন্ধ', subject: 'Bangla', dueDate: '2026-06-28', estimatedHours: 2 },
    { id: 'a4', title: 'Grammar: Prepositions & Passive Voices', banglaTitle: 'পার্টস অফ স্পিচ ও ভয়েস চেঞ্জ অনুশীলনী', subject: 'English', dueDate: '2026-07-02', estimatedHours: 2 }
  ],
  'default': [
    { id: 'ad1', title: 'Mental Math & Multiplications Lab', banglaTitle: 'মানসাঙ্ক ও গুণের নামতা অনুশীলনী', subject: 'Math', dueDate: '2026-06-23', estimatedHours: 2 },
    { id: 'ad2', title: 'Water Cycle Drawing & Lab Report', banglaTitle: 'পানি চক্রের চিত্র অংকন ও বিবরণ', subject: 'Science', dueDate: '2026-06-26', estimatedHours: 3 },
    { id: 'ad3', title: 'Bengali Handwriting Practice', banglaTitle: 'বাংলা সুন্দর হস্তাক্ষর অনুশীলন', subject: 'Bangla', dueDate: '2026-06-29', estimatedHours: 1 }
  ]
};

// Milestones corresponding to academic percentages
const MILESTONES = [
  { pct: 0, title: 'Session Launch', banglaTitle: 'সেশন প্রারম্ভ', desc: 'Syllabus and orientation unlocked.' },
  { pct: 25, title: 'Quarter Mark', banglaTitle: 'প্রথম চতুর্থাংশ', desc: 'First assessment review and portfolio check.' },
  { pct: 50, title: 'Mid-Term Evaluation', banglaTitle: 'অর্ধ-বার্ষিকী পরীক্ষা', desc: 'Central standard mid-term completed.' },
  { pct: 75, title: 'Pre-Test Portfolio', banglaTitle: 'প্রাক-নির্বাচনী পর্যায়', desc: 'Final revisions & board style drills.' },
  { pct: 100, title: 'Session Graduate', banglaTitle: 'সেশন সম্পন্ন', desc: 'Promotion certificate eligibility.' }
];

export const StudentProgressTracker: React.FC<StudentProgressTrackerProps> = ({ student }) => {
  // Get tailored modules/assignments or fallback
  const modules = DEFAULT_MODULES_BY_CLASS[student.className] || DEFAULT_MODULES_BY_CLASS['default'];
  const assignments = DEFAULT_ASSIGNMENTS_BY_CLASS[student.className] || DEFAULT_ASSIGNMENTS_BY_CLASS['default'];

  // Local Storage key based on student ID to preserve student status
  const moduleStorageKey = `stud_mod_completed_${student.id}`;
  const assignmentStorageKey = `stud_ass_completed_${student.id}`;

  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<string[]>([]);

  // Load persistence configurations safely
  useEffect(() => {
    const savedModules = localStorage.getItem(moduleStorageKey);
    const savedAssignments = localStorage.getItem(assignmentStorageKey);

    if (savedModules) {
      setCompletedModules(JSON.parse(savedModules));
    } else {
      // By default, mark first module and assignment completed to present nice initial visuals
      const initialMod = [modules[0].id];
      setCompletedModules(initialMod);
      localStorage.setItem(moduleStorageKey, JSON.stringify(initialMod));
    }

    if (savedAssignments) {
      setCompletedAssignments(JSON.parse(savedAssignments));
    } else {
      const initialAss = [assignments[0].id];
      setCompletedAssignments(initialAss);
      localStorage.setItem(assignmentStorageKey, JSON.stringify(initialAss));
    }
  }, [student.id, moduleStorageKey, assignmentStorageKey]);

  // Toggle helpers
  const toggleModule = (id: string) => {
    const next = completedModules.includes(id)
      ? completedModules.filter(m => m !== id)
      : [...completedModules, id];
    setCompletedModules(next);
    localStorage.setItem(moduleStorageKey, JSON.stringify(next));
  };

  const toggleAssignment = (id: string) => {
    const next = completedAssignments.includes(id)
      ? completedAssignments.filter(a => a !== id)
      : [...completedAssignments, id];
    setCompletedAssignments(next);
    localStorage.setItem(assignmentStorageKey, JSON.stringify(next));
  };

  const resetProgress = () => {
    setCompletedModules([]);
    setCompletedAssignments([]);
    localStorage.setItem(moduleStorageKey, JSON.stringify([]));
    localStorage.setItem(assignmentStorageKey, JSON.stringify([]));
  };

  // Progress percentage logic
  const totalTasks = modules.length + assignments.length;
  const completedTasksCount = completedModules.length + completedAssignments.length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Circular progress metrics (Radius = 60, Stroke = 10, circumference = 2 * PI * r)
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  // Determine current active milestone
  const currentMilestone = [...MILESTONES].reverse().find(m => progressPct >= m.pct) || MILESTONES[0];

  return (
    <div id={`student-progress-tracker-${student.id}`} className="bg-white rounded-2xl border border-slate-205 shadow-sm p-6 mb-6">
      
      {/* Header and explanation */}
      <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] text-blue-900 font-extrabold uppercase tracking-wider font-mono">
              Academic Roadmap Tracker
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
            শিক্ষার্থীর পড়াশোনা ও মডিউল অগ্রগতি ট্র্যাকার
          </h3>
          <p className="text-[10.5px] text-slate-500 mt-0.5">
            কারিকুলাম ভিত্তিক সিলেবাস কমপ্লিশন রেট এবং প্রজেক্ট অ্যাসাইনমেন্টের রিয়েল-টাইম ট্র্যাক ট্রেইল।
          </p>
        </div>

        {/* Refresh tool to clear tests */}
        <button
          type="button"
          onClick={resetProgress}
          className="p-1 px-2.5 hover:bg-slate-100 text-slate-450 hover:text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
          title="রিসেট প্রগ্রেস"
        >
          <RefreshCw className="h-3 w-3" />
          <span>রিসেট ট্র্যাকার</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Circular Progress Box */}
        <div className="bg-slate-50/50 border border-slate-150 p-5 rounded-xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-4 font-mono">
            Syllabus Coverage Progress
          </span>

          {/* Styled SVG Circle Meter */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circular track */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-200"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Animated Progress foreground ring */}
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-indigo-900"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-850 tracking-tight">
                {progressPct}%
              </span>
              <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider mt-0.5">
                COMPLETED
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>চলতি মাইলস্টোন: {currentMilestone.banglaTitle}</span>
            </div>
            <p className="text-[10px] text-slate-450 tracking-wide">
              {completedTasksCount} of {totalTasks} milestones achieved
            </p>
          </div>
        </div>

        {/* Middle Syllabus Modules (Interactive Click) */}
        <div className="space-y-3">
          <div className="flex items-center gap-1 border-b border-slate-100 pb-1.5 mb-2">
            <BookOpen className="h-4 w-4 text-indigo-700" />
            <h4 className="font-extrabold text-[12px] text-slate-800">
              ১। একাডেমিক মডিউল কমপ্লিশন ({completedModules.length}/{modules.length})
            </h4>
          </div>

          <div className="space-y-2">
            {modules.map((m) => {
              const isDone = completedModules.includes(m.id);
              return (
                <div 
                  key={m.id}
                  onClick={() => toggleModule(m.id)}
                  className={`p-3 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isDone 
                      ? 'bg-emerald-50/30 border-emerald-200/60' 
                      : 'bg-white border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button type="button" className="shrink-0 transition">
                      {isDone ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="h-4.5 w-4.5 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">
                        {m.banglaName}
                      </p>
                      <p className="text-[9.5px] text-slate-400 capitalize font-medium mt-0.5 truncate">
                        {m.name} &bull; {m.chapters} Chapters
                      </p>
                    </div>
                  </div>
                  
                  {/* Subject Badges */}
                  <span className="text-[8px] bg-slate-100 font-bold border rounded px-1.5 py-0.5 text-slate-500 font-mono">
                    {m.subject}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Upcoming Projects & Homework (Interactive Click) */}
        <div className="space-y-3">
          <div className="flex items-center gap-1 border-b border-slate-100 pb-1.5 mb-2">
            <ClipboardList className="h-4 w-4 text-blue-900" />
            <h4 className="font-extrabold text-[12px] text-slate-800">
              ২। হোমওয়ার্ক ও সাবমিশন ট্র্যাক ({completedAssignments.length}/{assignments.length})
            </h4>
          </div>

          <div className="space-y-2">
            {assignments.map((a) => {
              const isDone = completedAssignments.includes(a.id);
              return (
                <div 
                  key={a.id}
                  onClick={() => toggleAssignment(a.id)}
                  className={`p-3 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isDone 
                      ? 'bg-emerald-50/30 border-emerald-200/65' 
                      : 'bg-white border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button type="button" className="shrink-0 transition">
                      {isDone ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="h-4.5 w-4.5 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-[11.5px] truncate">
                        {a.banglaTitle}
                      </p>
                      <p className="text-[9px] text-rose-500 font-bold font-sans mt-0.5">
                        🗓️ ডেডলাইন: {a.dueDate}
                      </p>
                    </div>
                  </div>

                  <span className="text-[8px] font-black font-mono text-emerald-800 bg-emerald-50 border border-emerald-100 px-1 rounded shrink-0">
                    {a.estimatedHours}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Visual Roadmap Milestones Pathway */}
      <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
        <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1">
          <Milestone className="h-4 w-4 text-indigo-900 animate-pulse" />
          ৩। বার্ষিক একাডেমিক সেশন মাইলস্টোন রোডম্যাপ (Interactive Journey Pathway)
        </h5>

        <div className="relative pt-2 pb-6">
          {/* Timeline continuous bar background */}
          <div className="absolute top-7 left-3 sm:left-auto sm:-translate-x-1/2 sm:left-1/2 right-3 h-1 bg-slate-150 rounded" />
          
          {/* Colored Active line based on syllabus completed */}
          <div 
            className="absolute top-7 left-3 h-1 bg-gradient-to-r from-teal-500 to-indigo-905 rounded transition-all duration-700" 
            style={{ width: `calc(${progressPct}% - 24px)` }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-4 relative">
            {MILESTONES.map((m) => {
              const reached = progressPct >= m.pct;
              return (
                <div key={m.pct} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center group pr-2">
                  
                  {/* Step point badge circle */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 transition-all duration-300 shrink-0 ${
                    reached 
                      ? 'bg-indigo-950 border-indigo-200 text-teal-300 font-extrabold shadow-sm scale-110 z-10' 
                      : 'bg-white border-slate-200 text-slate-405 z-10'
                  }`}>
                    {reached ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-teal-400 stroke-[3px]" />
                    ) : (
                      <span className="text-[9px] font-bold font-mono">{m.pct}%</span>
                    )}
                  </div>

                  {/* Descriptions block */}
                  <div className="ml-3 sm:ml-0 sm:mt-2.5 min-w-0">
                    <p className={`text-xs font-bold transition-colors ${reached ? 'text-slate-800' : 'text-slate-400'}`}>
                      {m.banglaTitle}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans mt-0.5 leading-snug">
                      {m.desc}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
