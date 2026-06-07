import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

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
