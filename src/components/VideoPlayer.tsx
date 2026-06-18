import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  AlertTriangle, 
  Check, 
  HelpCircle, 
  RefreshCw, 
  Video, 
  ExternalLink,
  Shield,
  Clock,
  ThumbsUp,
  Eye,
  Info
} from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  autoplay?: boolean;
  aspectRatio?: 'video' | 'shorts';
  className?: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
  showDetails?: boolean;
  views?: number;
}

/**
 * Robust utility to parse and extract the 11-character YouTube Video ID from any standard/irregular YouTube format.
 */
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  // Trim spaces
  const trimmed = url.trim();
  
  // If it's already a clean 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regular expressions to match a broad scope of YouTube link types
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback check for URL parameter parsing
  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (urlObj.hostname.includes('youtube.com')) {
      const v = urlObj.searchParams.get('v');
      if (v && v.length === 11) return v;
    }
  } catch (e) {
    // Silent fail for URL parsing
  }

  return null;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title = "ভিডিও প্লেয়ার",
  autoplay = false,
  aspectRatio = 'video',
  className = '',
  onPlayStateChange,
  showDetails = false,
  views
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [isRetry, setIsRetry] = useState(false);

  // Parse ID on URL change
  useEffect(() => {
    const parsedId = extractYouTubeId(url);
    if (parsedId) {
      setVideoId(parsedId);
      setError(null);
    } else {
      setVideoId(null);
      setError("আকার্যকর বা ত্রুটিপূর্ণ লিঙ্ক! অনুগ্রহ করে সঠিক সাধারণ বা শর্টস ইউটিউব লিঙ্কটি প্রদান করুন।");
    }
    // Reset play and loaded states when URL changes
    setIsPlaying(false);
    setIsIframeLoaded(false);
  }, [url]);

  const handlePlay = () => {
    if (videoId) {
      setIsPlaying(true);
      if (onPlayStateChange) onPlayStateChange(true);
    }
  };

  const handleRetry = () => {
    setIsRetry(true);
    setTimeout(() => {
      setIsRetry(false);
      const parsedId = extractYouTubeId(url);
      if (parsedId) {
        setVideoId(parsedId);
        setError(null);
      }
    }, 800);
  };

  const isReel = aspectRatio === 'shorts';

  // Fallback poster image using official High-Quality YouTube Thumbnails
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80`;

  const fallbackThumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : '';

  return (
    <div className={`video-player-wrapper w-full select-none ${className}`}>
      <div 
        className={`relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 transition-all duration-300 ${
          isReel ? 'aspect-[9/16] max-w-[320px] mx-auto' : 'aspect-video w-full'
        }`}
      >
        <AnimatePresence mode="wait">
          {error ? (
            /* ERROR HANDLING PLACEHOLDER */
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-200 z-10"
            >
              <div className="bg-red-500/15 p-3 rounded-full border border-red-500/30 mb-3.5 animate-pulse">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-rose-400 tracking-tight leading-snug">
                ভিডিও লোড করা যায়নি
              </h4>
              <p className="text-[11px] text-slate-450 mt-1.5 max-w-xs font-sans">
                {error}
              </p>
              
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mt-4 text-left max-w-sm w-full">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  গৃহীত সঠিক লিঙ্ক ফরম্যাট সমূহ:
                </span>
                <ul className="text-[10px] text-slate-350 space-y-1 font-mono list-disc pl-3.5">
                  <li className="truncate">https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
                  <li className="truncate">https://youtu.be/dQw4w9WgXcQ</li>
                  <li className="truncate">https://www.youtube.com/shorts/h3e-eC939_A</li>
                </ul>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${isRetry ? 'animate-spin' : ''}`} />
                  <span>পুনরায় চেষ্টা করুন</span>
                </button>
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition active:scale-95"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>ইউটিউব সার্চ করুন</span>
                </a>
              </div>
            </motion.div>
          ) : isPlaying && videoId ? (
            /* ACTIVE SAFELY WRAPPED VIDEO PLAYER */
            <motion.div 
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full"
            >
              {!isIframeLoaded && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-200 z-10 overflow-hidden">
                  {/* Thumbnail background blurred for extreme aesthetics & perceived performance */}
                  <img 
                    src={thumbnailUrl} 
                    alt="Loading preview..."
                    onError={(e) => {
                      if (videoId && e.currentTarget.src !== fallbackThumbnailUrl) {
                        e.currentTarget.src = fallbackThumbnailUrl;
                      }
                    }}
                    className="absolute inset-0 w-full h-full object-cover blur-sm scale-105 opacity-50"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 z-1"></div>
                  
                  {/* High quality container with animated spinner and secure notification */}
                  <div className="relative z-10 flex flex-col items-center justify-center bg-slate-900/75 backdrop-blur-md border border-white/10 p-5 rounded-2xl max-w-[250px] shadow-2xl">
                    <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-[9.5px] uppercase font-black tracking-widest text-indigo-300 font-mono text-center">
                      STREAMBUFFER ACQUIRING
                    </p>
                    <span className="text-[8.5px] text-slate-400 mt-1 font-sans text-center">
                      সিকিউর নেটওয়ার্ক সংযোগ স্থাপন করা হচ্ছে...
                    </span>
                  </div>
                </div>
              )}
              
              <iframe
                id={`secured-youtube-iframe-${videoId}`}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="no-referrer"
                onLoad={() => setIsIframeLoaded(true)}
                className="w-full h-full border-0 rounded-2xl"
              ></iframe>
            </motion.div>
          ) : (
            /* STANDBY PREVIEW MODAL POSTER */
            <motion.div 
              key="standby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full group"
            >
              {/* Background cover image with lazy failover */}
              <img 
                src={thumbnailUrl} 
                alt={title}
                onError={(e) => {
                  // Fallback of fallback if maxresdefault doesn't exist
                  if (videoId && e.currentTarget.src !== fallbackThumbnailUrl) {
                    e.currentTarget.src = fallbackThumbnailUrl;
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Dark overlay to balance typographic readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/45 to-transparent z-1"></div>

              {/* Secure source stream verification tag */}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700/50 flex items-center gap-1.5 z-2">
                <Shield className="h-3 w-3 text-emerald-400" />
                <span className="text-[9px] text-slate-200 uppercase font-bold tracking-widest font-mono">
                  Youtube Secure Stream Verified
                </span>
              </div>

              {/* Central Premium Play Circle Button */}
              <div className="absolute inset-0 flex items-center justify-center z-2">
                <button
                  type="button"
                  onClick={handlePlay}
                  className="h-16 w-16 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-2xl border border-rose-450/40 transform transition hover:scale-110 active:scale-95 duration-200 cursor-pointer"
                  title="ভিডিও প্লে করুন"
                >
                  <Play className="h-7 w-7 text-white fill-white ml-1 animate-pulse" />
                </button>
              </div>

              {/* Metadata slide overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-2">
                <h4 className="font-extrabold text-sm sm:text-base text-white truncate leading-snug drop-shadow-md">
                  {title}
                </h4>
                <p className="text-[10px] text-slate-300 mt-1 inline-flex items-center gap-1.5 bg-slate-950/40 py-0.5 px-2 rounded backdrop-blur-2xs border border-white/5">
                  <Play className="h-2.5 w-2.5 text-white/80" />
                  <span>ক্লিক করে ভিডিও স্ট্রিম সচল করুন</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Optional details footer */}
      {showDetails && !error && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-sans px-1">
          <div className="flex items-center gap-3">
            {views !== undefined && (
              <span className="flex items-center gap-1 font-mono">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                <span>{views.toLocaleString()} views</span>
              </span>
            )}
            <span className="flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Auto-parsed Source</span>
            </span>
          </div>

          <div className="flex items-center gap-1 hover:text-indigo-650 transition cursor-help" title="ইউটিউব ভিডিও এম্বেডিং সংক্রান্ত সাহায্য">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>সাহায্য</span>
          </div>
        </div>
      )}
    </div>
  );
};
