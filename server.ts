import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

// Lazy client setup to prevent crash if key is missing on start
let aiClient: GoogleGenAI | null = null;
const getAiClient = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
};

// Set high limit for JSON because user can upload base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DB_FILE = path.join(process.cwd(), 'db.json');

// Helper to read database
const getDatabase = (): Record<string, string> => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content) || {};
    }
  } catch (error) {
    console.error('Error reading db.json, returning empty object:', error);
  }
  return {};
};

// Helper to write database
const saveDatabase = (data: Record<string, string>) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
};

// API endpoints for server-side persistence
app.get('/api/db/get', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const db = getDatabase();
  res.json(db);
});

app.post('/api/db/save', (req, res) => {
  const { key, data } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Missing key parameter' });
  }
  const db = getDatabase();
  db[key] = typeof data === 'string' ? data : JSON.stringify(data);
  saveDatabase(db);
  res.json({ success: true });
});

app.post('/api/db/init', (req, res) => {
  const initialData = req.body;
  if (!initialData || typeof initialData !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const db = getDatabase();
  let updated = false;
  for (const [key, value] of Object.entries(initialData)) {
    if (key.startsWith('delicon_')) {
      db[key] = typeof value === 'string' ? value : JSON.stringify(value);
      updated = true;
    }
  }
  if (updated) {
    saveDatabase(db);
  }
  res.json({ success: true });
});

// API endpoint for Student Form AI OCR Vision Scanner
app.post('/api/gemini/scan-student-form', async (req, res) => {
  try {
    const { imageData, imageUrl } = req.body;
    
    let base64Clean = '';
    let mimeType = 'image/jpeg';

    if (imageData && typeof imageData === 'string') {
      if (imageData.startsWith('data:')) {
        const matches = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Clean = matches[2];
        } else {
          base64Clean = imageData.split(',')[1] || imageData;
        }
      } else {
        base64Clean = imageData;
      }
    } else if (imageUrl && typeof imageUrl === 'string') {
      try {
        let fetchUrl = imageUrl.trim();
        // Support postimg.cc view pages by extracting direct image URL if needed
        if (fetchUrl.includes('postimg.cc/') && !fetchUrl.includes('i.postimg.cc/')) {
          try {
            const pageRes = await fetch(fetchUrl);
            const pageHtml = await pageRes.text();
            const match = pageHtml.match(/https:\/\/i\.postimg\.cc\/[a-zA-Z0-9_\-./]+\.(jpg|jpeg|png|webp)/i);
            if (match && match[0]) {
              fetchUrl = match[0];
            }
          } catch (e) {
            console.warn('PostImages URL resolution error:', e);
          }
        }

        const imgFetch = await fetch(fetchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });
        if (imgFetch.ok) {
          const contentType = imgFetch.headers.get('content-type') || 'image/jpeg';
          if (contentType.includes('image/')) {
            mimeType = contentType.split(';')[0];
          }
          const arrayBuffer = await imgFetch.arrayBuffer();
          base64Clean = Buffer.from(arrayBuffer).toString('base64');
        }
      } catch (fetchErr: any) {
        console.warn('Image fetch warning:', fetchErr);
      }
    }

    // Try Gemini AI models if base64Clean exists and key is valid
    if (base64Clean && base64Clean.length >= 50 && process.env.GEMINI_API_KEY) {
      try {
        const ai = getAiClient();
        const prompt = `
You are an expert OCR & Student Information Sheet (তথ্য ছক / ভর্তি ফরম) Digitization AI for Bangladeshi schools (Primary, High School, Model Academy, Kindergarten).
Analyze this uploaded student form/document image carefully. It contains printed text, tabular forms, or handwritten Bengali/English entries.
Extract all discernible fields accurately into a clean JSON object.
CRITICAL ACCURACY INSTRUCTIONS:
- Read the student's actual name, class, roll, parents' names, and phone numbers directly from the document.
- Pay special attention to Bengali handwriting or print (e.g. নাম: মাহিনুর / Mahinur, শ্রেণী: ষষ্ঠ শ্রেণি / Class 6 / Class VI, ইত্যাদি).
- If a field is empty, blank, or illegible on the form, return an empty string "" for that field.
- ABSOLUTELY NEVER make up fake, hallucinated, or placeholder names or classes. If not visible, return "".

Field guidelines:
- banglaName: শিক্ষার্থীর নাম (বাংলায় - যেমন "মাহিনুর")
- name: শিক্ষার্থীর নাম (ইংরেজিতে - যেমন "MAHINUR")
- className: শ্রেণী (যেমন: "Class 6", "৬ষ্ঠ শ্রেণি", "Class 5", "Play", "Nursery", "KG", "Class 1", etc.)
- section: শাখা (যেমন: "ক", "খ", "A", "B", "")
- roll: রোল নম্বর (যেমন: "০১", "01", "৬", "")
- sessionYear: শিক্ষাবর্ষ (যেমন: "2026")
- admissionDate: ভর্তির তারিখ (YYYY-MM-DD or DD-MM-YYYY)
- version: মাধ্যম ("Bangla" or "English")
- shift: শিফট ("Morning" or "Day")
- birthRegNo: জন্ম নিবন্ধন সনদ নম্বর (১৭ ডিজিট বিআরসি নং)
- dob: জন্ম তারিখ (YYYY-MM-DD)
- bloodGroup: রক্তের গ্রুপ
- gender: লিঙ্গ ("Female" or "Male")
- religion: ধর্ম ("ইসলাম", "হিন্দু", "বৌদ্ধ", "খ্রিস্টান")
- nationality: জাতীয়তা (default "বাংলাদেশী")
- disability: বিশেষ চাহিদা / শারীরিক প্রতিবন্ধকতা
- fatherNameBn: পিতার নাম (বাংলায়)
- fatherNameEn: পিতার নাম (ইংরেজিতে)
- fatherNid: পিতার জাতীয় পরিচয়পত্র (এনআইডি) নম্বর
- fatherDob: পিতার জন্ম তারিখ (YYYY-MM-DD or DD/MM/YYYY)
- fatherBirthRegNo: পিতার জন্ম নিবন্ধন সনদ নম্বর (১৭ ডিজিট বিআরসি নং)
- fatherPhone: পিতার মোবাইল নম্বর
- fatherOccupation: পিতার পেশা
- fatherEducation: পিতার শিক্ষাগত যোগ্যতা
- fatherIncome: পিতার মাসিক/বাৎসরিক আয়
- motherNameBn: মাতার নাম (বাংলায়)
- motherNameEn: মাতার নাম (ইংরেজিতে)
- motherNid: মাতার জাতীয় পরিচয়পত্র (এনআইডি) নম্বর
- motherDob: মাতার জন্ম তারিখ (YYYY-MM-DD or DD/MM/YYYY)
- motherBirthRegNo: মাতার জন্ম নিবন্ধন সনদ নম্বর (১৭ ডিজিট বিআরসি নং)
- motherPhone: মাতার মোবাইল নম্বর
- motherOccupation: মাতার পেশা
- motherEducation: মাতার শিক্ষাগত যোগ্যতা
- guardianName: অভিভাবকের নাম
- guardianPhone: অভিভাবকের মোবাইল নম্বর
- guardianRelation: শিক্ষার্থীর সাথে সম্পর্ক
- guardianNid: অভিভাবকের এনআইডি
- presentAddress: বর্তমান ঠিকানা
- permanentAddress: স্থায়ী ঠিকানা
- previousSchool: পূর্ববর্তী বিদ্যালয়ের নাম
- previousClassRoll: পূর্ববর্তী শ্রেণী ও রোল
- tcNumberDate: ছাড়পত্র / টিসি নম্বর ও তারিখ
- detectedTextSummary: ফরম থেকে পঠিত মূল তথ্যের সংক্ষিপ্ত বাংলা বুলেট বা সারাংশ
- confidence: "High" | "Medium" | "Low"
`;

        const candidateModels = [
          'gemini-3.8-flash',
          'gemini-3.1-flash-lite',
          'gemini-flash-latest',
          'gemini-3.1-pro-preview'
        ];
        let response: any = null;

        for (const modelCandidate of candidateModels) {
          try {
            console.log(`[OCR] Trying model ${modelCandidate}...`);
            const callPromise = ai.models.generateContent({
              model: modelCandidate,
              contents: {
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: base64Clean
                    }
                  },
                  {
                    text: prompt
                  }
                ]
              },
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    banglaName: { type: Type.STRING },
                    name: { type: Type.STRING },
                    className: { type: Type.STRING },
                    section: { type: Type.STRING },
                    roll: { type: Type.STRING },
                    sessionYear: { type: Type.STRING },
                    admissionDate: { type: Type.STRING },
                    version: { type: Type.STRING },
                    shift: { type: Type.STRING },
                    birthRegNo: { type: Type.STRING },
                    dob: { type: Type.STRING },
                    bloodGroup: { type: Type.STRING },
                    gender: { type: Type.STRING },
                    religion: { type: Type.STRING },
                    nationality: { type: Type.STRING },
                    disability: { type: Type.STRING },
                    fatherNameBn: { type: Type.STRING },
                    fatherNameEn: { type: Type.STRING },
                    fatherNid: { type: Type.STRING },
                    fatherDob: { type: Type.STRING },
                    fatherBirthRegNo: { type: Type.STRING },
                    fatherPhone: { type: Type.STRING },
                    fatherOccupation: { type: Type.STRING },
                    fatherEducation: { type: Type.STRING },
                    fatherIncome: { type: Type.STRING },
                    motherNameBn: { type: Type.STRING },
                    motherNameEn: { type: Type.STRING },
                    motherNid: { type: Type.STRING },
                    motherDob: { type: Type.STRING },
                    motherBirthRegNo: { type: Type.STRING },
                    motherPhone: { type: Type.STRING },
                    motherOccupation: { type: Type.STRING },
                    motherEducation: { type: Type.STRING },
                    guardianName: { type: Type.STRING },
                    guardianPhone: { type: Type.STRING },
                    guardianRelation: { type: Type.STRING },
                    guardianNid: { type: Type.STRING },
                    presentAddress: { type: Type.STRING },
                    permanentAddress: { type: Type.STRING },
                    previousSchool: { type: Type.STRING },
                    previousClassRoll: { type: Type.STRING },
                    tcNumberDate: { type: Type.STRING },
                    detectedTextSummary: { type: Type.STRING },
                    confidence: { type: Type.STRING }
                  }
                }
              }
            });

            // Allow sufficient time for multimodal OCR image processing
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('AI Model timeout (25s)')), 25000)
            );

            response = await Promise.race([callPromise, timeoutPromise]);

            if (response && response.text) {
              console.log(`[OCR] Successfully processed with ${modelCandidate}`);
              break;
            }
          } catch (modelErr: any) {
            console.warn(`[OCR] Model ${modelCandidate} failed:`, modelErr?.message || modelErr);
          }
        }

        if (response && response.text) {
          const parsedData = JSON.parse(response.text);
          if (!parsedData.banglaName && parsedData.name) parsedData.banglaName = parsedData.name;
          if (!parsedData.name && parsedData.banglaName) parsedData.name = parsedData.banglaName;
          if (!parsedData.guardianName) parsedData.guardianName = parsedData.fatherNameBn || parsedData.motherNameBn || '';

          return res.json({
            success: true,
            data: parsedData,
            timestamp: new Date().toISOString()
          });
        }
      } catch (geminiErr) {
        console.warn('[OCR] Gemini processing error:', geminiErr);
      }
    }

    // If Gemini was unable to process, return explicit feedback without fabricating fake data
    return res.json({
      success: false,
      error: 'ai_busy',
      message: 'এআই ভিশন সার্ভিস সাময়িক ব্যস্ত থাকায় স্বয়ংক্রিয় রিডিং সম্পন্ন করা যায়নি। কোনো কাল্পনিক বা অসত্য তথ্য দিয়ে ফরম পূরণ করা হয়নি। অনুগ্রহ করে ম্যানুয়ালি সঠিক তথ্য পূরণ করুন অথবা কিছুক্ষণ পর আবার চেষ্টা করুন।',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/scan-student-form:', err);
    res.json({
      success: false,
      error: 'server_error',
      message: 'স্ক্যান প্রসেসিং ত্রুটি। অনুগ্রহ করে ম্যানুয়ালি তথ্য প্রদান করুন।',
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint for Student Performance AI Summarization
app.post('/api/gemini/summarize', async (req, res) => {
  try {
    const { student, examMarks, lang } = req.body;
    if (!student) {
      return res.status(400).json({ error: 'Missing student data' });
    }

    const ai = getAiClient();
    
    // Construct descriptive profile of student
    const languageLabel = lang === 'en' ? 'English' : 'Bangla (Bengali)';
    
    const subjectMarksText = examMarks && examMarks.length > 0
      ? examMarks.map((m: any) => `- ${m.subject} (Exam: ${m.examName || 'Exam'}): Written: ${m.writtenMarks}, MCQ: ${m.mcqMarks}, Total: ${m.totalMarks}, Grade: ${m.grade}, GPA: ${m.gpa}`).join('\n')
      : 'No detailed subject-wise marks uploaded yet.';

    const prompt = `
You are Al-Hijra AI Academic Counselor, an elite expert system that helps guardians in Bangladesh understand their children's progress.
Analyze this student's grade/performance profile and attendance. Provide an intelligent, encouraging, objective, and highly actionable digital summary report in ${languageLabel}.

STUDENT PROFILE:
- Name: ${student.name} (Bangla: ${student.banglaName})
- Class: ${student.className}
- Roll: ${student.roll}
- Attendance Percentage: ${student.attendancePct}%
- Homework Completion Status: ${student.homeworkStatus}

SUBJECT-WISE ACADEMIC PERFORMANCE (RECENT MARKS):
${subjectMarksText}

Provide your analysis structured as a JSON object of Type: Object.
The advice should speak directly to the guardian (parents) in a warm, welcoming, and constructive tone. 
Keep language native, polite, and completely constructive. Avoid clinical or harsh words.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A paragraph summary in the specified language reviewing the child's academic and behavioral standing based on indicators." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 bullets summarizing visible strengths." },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 bullets showing where student can boost results." },
            attendanceComment: { type: Type.STRING, description: "Comments on punctuality and presence context." },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable tasks parents can monitor at home." }
          },
          required: ["summary", "strengths", "improvements", "attendanceComment", "actionPlan"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (err: any) {
    console.error('Error in AI Summarize endpoint:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate academic summary report' });
  }
});

// API endpoint for AI / Imagen Recruitment Poster Generator
app.post('/api/imagen/generate-poster', async (req, res) => {
  try {
    const { 
      prompt, 
      style = 'modern-smart', 
      aspectRatio = '3:4', 
      headline, 
      targetAudience = 'guardians', 
      lang = 'bn',
      discount = 'প্রথম ১০০ জনের বিশেষ মেধা বৃত্তি'
    } = req.body;

    const ai = getAiClient();

    // 1. High-converting AI Marketing Copywriting via Gemini
    let copyData: any = null;
    try {
      const copyPrompt = `
You are an expert Chief Marketing Officer and conversion copywriter for Delicon Model Academy.
The school is running its mega admission campaign for the upcoming academic season with a bold mission:
"ENROLL 1,000 STUDENTS (১০০০ শিক্ষার্থী ভর্তি লক্ষ্যমাত্রা)".

LANGUAGE: ${lang === 'en' ? 'English' : 'Bengali (Bangla - authentic, persuasive, parent-focused)'}.

THE 5 PILLARS OF DELICON MODEL ACADEMY (UNIQUE VALUE PROPOSITIONS):
1. Digital Tracking: Real-time home study monitoring & app-based attendance/homework tracker.
2. Computer Skills: Practical coding, robotics, ICT skills from early grades.
3. Freelancing: Early career skills, graphic design, content creation, future freelance readiness.
4. English Fluency: Daily spoken English drills, Oxford-standard vocabulary, natural fluency.
5. Multimedia Classrooms: 100% smart interactive displays, 3D animated visual learning.

Generate a JSON object with:
- headline: High-converting headline (e.g., "আগামীর বিশ্বজয়ের জন্য প্রস্তুত হোক আপনার সন্তান")
- subheadline: Emotional, inspiring subtitle highlighting modern tech and ethical education
- goalBadge: "ভর্তি লক্ষ্যমাত্রা: ১০০০ শিক্ষার্থী" or "Mission 1000 Future Leaders"
- enrolledCount: number between 720 and 840 (representing currently admitted seats)
- remainingSeats: number between 160 and 280 (urgency indicator)
- uvpPoints: array of 5 items, each with:
  {
    "key": "digital_tracking" | "computer_skills" | "freelancing" | "english_fluency" | "multimedia_classrooms",
    "title": string,
    "highlight": string,
    "description": string
  }
- ctaTitle: string (e.g., "আজই আসন নিশ্চিত করুন!")
- ctaSubtitle: string (e.g., "সীমিত আসন অবশিষ্ট - অনলাইনে ফরম পূরণ করুন বা ক্যাম্পাসে আসুন")
- specialOffer: string (e.g., "${discount}")
- contactHotline: string (e.g., "+880 1711-000000")
- adCaption: Ready-to-copy social media ad post with emojis, hooks, bullet points, and admission hashtags.
`;

      const copyRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: copyPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              subheadline: { type: Type.STRING },
              goalBadge: { type: Type.STRING },
              enrolledCount: { type: Type.INTEGER },
              remainingSeats: { type: Type.INTEGER },
              uvpPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    title: { type: Type.STRING },
                    highlight: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ['key', 'title', 'highlight', 'description']
                }
              },
              ctaTitle: { type: Type.STRING },
              ctaSubtitle: { type: Type.STRING },
              specialOffer: { type: Type.STRING },
              contactHotline: { type: Type.STRING },
              adCaption: { type: Type.STRING }
            },
            required: [
              'headline', 'subheadline', 'goalBadge', 'enrolledCount', 
              'remainingSeats', 'uvpPoints', 'ctaTitle', 'ctaSubtitle', 
              'specialOffer', 'contactHotline', 'adCaption'
            ]
          }
        }
      });

      if (copyRes.text) {
        copyData = JSON.parse(copyRes.text);
      }
    } catch (copyErr) {
      console.warn('Gemini copywriting fallback triggered:', copyErr);
    }

    // 2. Attempt Imagen / GenAI image model generation
    let generatedImageUrl: string | null = null;
    let modelStatus = 'studio-preset';

    const visualPrompt = prompt || `
High-converting professional admissions recruitment poster background for a smart Bangladeshi model academy.
Show cheerful Bangladeshi school children wearing clean, smart academy uniforms, learning joyfully with laptops, robotics, and digital tablets in a modern bright multimedia smart classroom with interactive glowing holographic charts.
Rich warm ambient lighting with prestigious sapphire blue and amber gold accents, cinematic lighting, 8k commercial photography, crisp negative space in upper and lower thirds for marketing text.
`;

    try {
      const imgRes = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: visualPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio === '1:1' ? '1:1' : aspectRatio === '16:9' ? '16:9' : '3:4'
          }
        }
      });

      if (imgRes.candidates && imgRes.candidates[0]?.content?.parts) {
        for (const part of imgRes.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            modelStatus = 'ai-generated';
            break;
          }
        }
      }
    } catch (imgErr: any) {
      // Normal when on free quota or API restrictions; client handles gracefully with studio-grade presets
      modelStatus = 'preset-fallback';
    }

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      modelStatus,
      copyData,
      aspectRatio,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error in /api/imagen/generate-poster:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate poster' });
  }
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function setup() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in DEVELOPMENT mode...');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in PRODUCTION mode...');
    const distPath = path.resolve(process.cwd(), 'dist');
    console.log(`Serving static files from: ${distPath}`);
    
    // Serve static files
    app.use(express.static(distPath));
    
    // Fallback all router endpoints to index.html for React routing
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is listening on http://0.0.0.0:${PORT}`);
  });
}

setup().catch((err) => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});
