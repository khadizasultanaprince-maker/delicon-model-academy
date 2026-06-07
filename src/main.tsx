import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import fallbackDb from '../db.json';

// 1. Intercept localStorage globally to automatically sync state changes and bypass client-side storage quota limits
const originalSetItem = window.localStorage.setItem;
const originalGetItem = window.localStorage.getItem;
const pendingSyncs: Record<string, any> = {};

// Server database cache in memory to bypass browser localStorage length/quota boundaries
(window as any).__serverDbCache = {};
(window as any).__syncEnabled = false;

(window.localStorage as any).setItem = function(key: string, value: string) {
  // Always update our in-memory cache first to guarantee availability across components
  if (key.startsWith('delicon_')) {
    (window as any).__serverDbCache[key] = value;
  }

  // Attempt to write locally to browser storage for offline/responsive fallback
  try {
    originalSetItem.apply(this, [key, value]);
  } catch (err) {
    console.warn('[Sync] Local storage quota limit exceeded, caching in-memory only:', err);
  }

  // Sync to server if the key is related to our application state and prefixed with 'delicon_'
  if (key.startsWith('delicon_') && (window as any).__syncEnabled) {
    if (pendingSyncs[key]) {
      clearTimeout(pendingSyncs[key]);
    }

    pendingSyncs[key] = setTimeout(() => {
      fetch('/api/db/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, data: value }),
      }).catch(err => {
        console.warn('Silent local sync failed:', err);
      });
      delete pendingSyncs[key];
    }, 500);
  }
};

(window.localStorage as any).getItem = function(key: string) {
  // If the key exists in our in-memory cache, prioritize it to bypass quota failure fallbacks
  if (key.startsWith('delicon_') && (window as any).__serverDbCache && (window as any).__serverDbCache[key] !== undefined) {
    return (window as any).__serverDbCache[key];
  }
  return originalGetItem.apply(this, [key]);
};

// 2. Pre-render Initialization: Pull latest database entries from the web server before React starts up
const initApp = async () => {
  const container = document.getElementById('root')!;
  
  // Show a professional loading status while we sync web data (only takes a few milliseconds)
  const loader = document.createElement('div');
  loader.className = 'fixed inset-0 flex flex-col items-center justify-center bg-slate-900 text-white font-sans z-50';
  loader.innerHTML = `
    <div class="flex flex-col items-center gap-4 px-6 text-center text-left">
      <div class="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      <h3 class="font-black text-lg tracking-tight">ডিলিকন মেলবন্ধন ও ক্লাউড ডেটাবেজ সিঙ্ক</h3>
      <p class="text-sm text-slate-400 max-w-sm leading-relaxed" id="sync-status">অফিস ও বাড়ি সব ডিভাইসের সাথে কৃতি শিক্ষার্থীর ছবি ও লেটেস্ট ডেটা নিরাপদ সিঙ্ক্রোনাইজ করা হচ্ছে। অনুগ্রহ করে ক্ষনিক অপেক্ষা করুন...</p>
    </div>
  `;
  document.body.appendChild(loader);

  // Status timer to explain if it takes longer than expected
  const statusTimer = setTimeout(() => {
    const statusText = document.getElementById('sync-status');
    if (statusText) {
      statusText.innerText = 'ধীরগতির ইন্টারনেট ডিটেকটেড। ডেটা পুনরুদ্ধার শেষ হচ্ছে, দয়া করে অপেক্ষা করুন...';
      statusText.className = 'text-xs text-amber-300 max-w-sm leading-relaxed font-bold animate-pulse';
    }
  }, 3500);

  try {
    // Increase timeout from 2 seconds to 12 seconds to prevent premature timeout aborts on normal or slow connections in mobile devices!
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    // Completely bypass browser cache using a timestamp query parameter and Cache-Control headers
    const response = await fetch('/api/db/get?t=' + Date.now(), { 
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    clearTimeout(timeoutId);
    clearTimeout(statusTimer);

    if (response.ok) {
      const serverDb = await response.json();
      if (serverDb && Object.keys(serverDb).length > 0) {
        console.log('[Sync] Pulling latest state from server:', Object.keys(serverDb));
        
        // Save to global in-memory cache to bypass local storage quota limits
        (window as any).__serverDbCache = { ...(window as any).__serverDbCache, ...serverDb };

        // Also try writing to local storage so they remain as offline/reload fallbacks
        for (const [key, value] of Object.entries(serverDb)) {
          if (key.startsWith('delicon_')) {
            try {
              originalSetItem.apply(window.localStorage, [key, value as string]);
            } catch (err) {
              // Ignore disk quota exceeded warnings since memory cache has it
            }
          }
        }

        // CRITICAL & REVOLUTIONARY: Check if there are keys in the client's localStorage that aren't on the server yet.
        // This handles cases like when the user uploaded campus photos on their Home PC, but they didn't sync yet.
        // Opening the Home PC now will detect the local-only key and instantly sync/seed/save it to the server!
        const localOnlyKeysToBackSync: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('delicon_')) {
            if (!(key in serverDb)) {
              const val = localStorage.getItem(key);
              if (val) {
                localOnlyKeysToBackSync[key] = val;
                // Also cache it in the memory db
                (window as any).__serverDbCache[key] = val;
                console.log(`[Sync] Automatically back-syncing local-only key "${key}" to server...`);
              }
            }
          }
        }

        if (Object.keys(localOnlyKeysToBackSync).length > 0) {
          fetch('/api/db/init', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(localOnlyKeysToBackSync)
          }).catch(err => {
            console.warn('[Sync] Auto-sync of local-only keys failed:', err);
          });
        }
      } else {
        // Server database is empty. Let's upload whatever is currently in the local browser cache to seed the server.
        console.log('[Sync] Server database is empty. Seeding with current localStorage...');
        const localDataToSeed: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('delicon_')) {
            const val = localStorage.getItem(key);
            if (val) {
              localDataToSeed[key] = val;
              (window as any).__serverDbCache[key] = val;
            }
          }
        }
        if (Object.keys(localDataToSeed).length > 0) {
          await fetch('/api/db/init', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(localDataToSeed)
          });
        }
      }
    }
  } catch (err) {
    console.error('[Sync] Pre-render sync error (using local storage cache + static fallback):', err);
    clearTimeout(statusTimer);

    // If pre-render fetch fails, populate the in-memory cache with the statically bundled db.json data.
    // This allows the app to work 100% correctly as a static build on Vercel or any offline environment!
    const localDbKeys = Object.keys(localStorage).filter(k => k.startsWith('delicon_'));
    const isNewVisitor = localDbKeys.length === 0;

    // Load any keys from fallbackDb into the server database cache
    (window as any).__serverDbCache = { 
      ...fallbackDb,
      ...(window as any).__serverDbCache 
    };

    // If this is a fresh visitor with empty local storage (like a community member visiting the web link on a phone),
    // copy the statically bundled values over to localStorage so they are preserved.
    if (isNewVisitor) {
      console.log('[Sync] Fresh visitor detected. Seeding browser localStorage with bundled fallback DB!');
      for (const [key, value] of Object.entries(fallbackDb)) {
        if (key.startsWith('delicon_')) {
          try {
            originalSetItem.apply(window.localStorage, [key, value as string]);
          } catch (e) {
            // silent ignore
          }
        }
      }
    }
  } finally {
    // Clean up loader and render our React app
    loader.remove();
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    // Wait for initial render/mount of all React hook useEffect states, then safely enable background sync.
    // This perfectly saves us from initial mount effects overwriting server data!
    setTimeout(() => {
      (window as any).__syncEnabled = true;
      console.log('[Sync] Background database synchronization has been successfully enabled.');
    }, 4050);
  }
};

initApp();
