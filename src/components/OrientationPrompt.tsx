import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize, Download } from 'lucide-react';
import { SoundManager } from '../game/SoundManager';

interface OrientationPromptProps {
  isInstallable?: boolean;
  isInstalled?: boolean;
  onInstallClick?: () => void;
}

export const OrientationPrompt: React.FC<OrientationPromptProps> = ({
  isInstallable,
  isInstalled = false,
  onInstallClick,
}) => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check window aspect ratio
      const portrait =
        window.innerHeight > window.innerWidth && window.innerWidth < 800;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
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

      const orient = (screen.orientation ||
        (screen as any).mozOrientation ||
        (screen as any).msOrientation) as any;
      if (orient && orient.lock) {
        await orient.lock("landscape").catch(() => {});
      }
    } catch {
      // Device/browser fallback
    }
  };

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center font-bengali">
      {/* Phone Rotate Graphic */}
      <div className="relative mb-3.5">
        <div className="w-20 h-20 rounded-3xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center animate-bounce shadow-lg shadow-sky-500/20">
          <Smartphone className="w-10 h-10 text-sky-400 transform rotate-90" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 text-xs font-black shadow-md">
          ⟳
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-wide">
        মোবাইলটি ঘুরিয়ে আড়াআড়ি (Landscape) করুন
      </h3>
      <p className="text-slate-300 text-xs md:text-sm max-w-xs mb-5 leading-relaxed">
        আরাবির ওয়াকার দৌড় চমৎকারভাবে ও ফুলস্ক্রিনে খেলতে আপনার ফোনটি কাত করে
        ধরুন।
      </p>

      {/* Button 1: Fullscreen & Landscape */}
      <button
        onClick={handleAutoFullscreenAndLandscape}
        className="w-full max-w-xs px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 border border-sky-300/40 flex items-center justify-center gap-2 transform active:scale-95 transition-all mb-4"
      >
        <Maximize className="w-4 h-4" />
        <span>📱 ফুলস্ক্রিন ও ল্যান্ডস্কেপ করুন</span>
      </button>

      {/* One-Tap Install Option directly in Portrait Mode (Without rotating) */}
      {!isInstalled && onInstallClick && (
        <div className="w-full max-w-xs pt-4 border-t border-slate-800/80 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="text-xs text-amber-300 font-semibold mb-2">
            অথবা ল্যান্ডস্কেপ না ঘুরিয়েও সরাসরি ইনস্টল করুন:
          </span>
          <button
            onClick={onInstallClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 border border-yellow-200/80 flex items-center justify-center gap-2 transform active:scale-95 transition-all hover:brightness-105"
          >
            <Download className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            <span>📲 এক ট্যাপে ইনস্টল করুন (Install App)</span>
          </button>
          <p className="text-[11px] text-slate-400 mt-2 text-center leading-snug">
            ইনস্টল করলে হোমস্ক্রিনে অ্যাপ আইকন তৈরি হবে এবং চালু করলেই স্বয়ংক্রিয়ভাবে ফুলস্ক্রিন ল্যান্ডস্কেপে চলবে।
          </p>
        </div>
      )}
    </div>
  );
};
