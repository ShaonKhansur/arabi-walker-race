import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { SoundManager } from '../game/SoundManager';

interface OrientationPromptProps {
  isInstallable?: boolean;
  isInstalled?: boolean;
  isInApp?: boolean;
  inAppBrowserName?: string;
  isIOS?: boolean;
  onInstallClick?: () => void;
  onOpenInAppGuide?: () => void;
}

export const OrientationPrompt: React.FC<OrientationPromptProps> = ({
  isInstallable,
  isInstalled = false,
  isInApp = false,
  inAppBrowserName = 'Messenger',
  isIOS = false,
  onInstallClick,
  onOpenInAppGuide,
}) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check window aspect ratio
      const portrait =
        window.innerHeight > window.innerWidth && window.innerWidth < 850;
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
    if (isInApp && onOpenInAppGuide) {
      // In-app browsers block fullscreen and orientation lock
      onOpenInAppGuide();
      return;
    }

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
        await orient.lock('landscape').catch(() => {});
      }
    } catch {
      // Device/browser fallback
    }
  };

  if (!isPortrait || isDismissed) return null;

  return (
    <div
      data-no-jump="true"
      className="fixed top-2 left-2 right-2 z-40 max-w-md mx-auto pointer-events-auto font-bengali animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="glass-panel p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-sky-400/40 shadow-2xl flex items-center justify-between gap-2">
        {/* Left icon + text */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-sky-400 transform rotate-90" />
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-xs font-bold text-white truncate">
              {isInApp ? `টিপস: ${inAppBrowserName}-এ খেলছেন` : 'মোবাইল কাত করে বড় স্ক্রিনে খেলুন'}
            </span>
            <span className="text-[10px] text-sky-200/80 truncate">
              {isInApp ? 'ফুলস্ক্রিনের জন্য ডানের (...) টিপস দেখুন' : 'আড়াআড়ি ধরলে আরও পরিষ্কার দেখা যাবে'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isInApp ? (
            <button
              onClick={onOpenInAppGuide}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-[11px] font-bold active:scale-95 transition"
            >
              টিপস ↗
            </button>
          ) : (
            <button
              onClick={handleAutoFullscreenAndLandscape}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[11px] font-bold border border-sky-300/30 active:scale-95 transition flex items-center gap-1 shadow"
            >
              <Maximize className="w-3 h-3" />
              <span>ফুলস্ক্রিন</span>
            </button>
          )}

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center text-xs active:scale-90 transition"
            title="নোটিশ বন্ধ করুন"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
