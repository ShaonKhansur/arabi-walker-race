import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

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

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center font-bengali">
      <div className="w-20 h-20 rounded-3xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center mb-5 animate-bounce">
        <Smartphone className="w-10 h-10 text-sky-400 transform rotate-90" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-2">
        মোবাইলটি ঘুরিয়ে আড়াআড়ি (Landscape) করুন
      </h3>
      <p className="text-slate-300 text-sm max-w-xs">
        আরাবির ওয়াকার দৌড় সবচেয়ে চমৎকারভাবে খেলতে আপনার ফোনটি কাত করে ধরুন।
      </p>
    </div>
  );
};

