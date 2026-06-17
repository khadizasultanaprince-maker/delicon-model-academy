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
