import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize } from 'lucide-react';
import { SoundManager } from '../game/SoundManager';

export const OrientationPrompt: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check window aspect ratio
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 800;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleAutoFullscreenAndLandscape = async () => {
    SoundManager.getInstance().ensureContext();
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }

      const orient = (screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation) as any;
      if (orient && orient.lock) {
        await orient.lock('landscape').catch(() => {});
      }
    } catch {
      // Device/browser fallback
    }
  };

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center font-bengali">
      <div className="w-20 h-20 rounded-3xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center mb-4 animate-bounce">
        <Smartphone className="w-10 h-10 text-sky-400 transform rotate-90" />
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
        মোবাইলটি ঘুরিয়ে আড়াআড়ি (Landscape) করুন
      </h3>
      <p className="text-slate-300 text-xs md:text-sm max-w-xs mb-5">
        আরাবির ওয়াকার দৌড় চমৎকারভাবে ও ফুলস্ক্রিনে খেলতে আপনার ফোনটি কাত করে ধরুন।
      </p>

      <button
        onClick={handleAutoFullscreenAndLandscape}
        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white font-extrabold text-sm shadow-xl border border-sky-300/40 flex items-center gap-2 transform active:scale-95 transition-all"
      >
        <Maximize className="w-4 h-4" />
        <span>📱 ফুলস্ক্রিন ও ল্যান্ডস্কেপ করুন</span>
      </button>
    </div>
  );
};

