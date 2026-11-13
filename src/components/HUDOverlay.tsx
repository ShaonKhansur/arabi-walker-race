import React, { useState, useEffect } from 'react';
import { GameMode, GameStateUpdate } from '../game/GameScene';
import { SoundManager } from '../game/SoundManager';
import { Volume2, VolumeX, RotateCcw, Compass, Maximize, Minimize } from 'lucide-react';

interface HUDOverlayProps {
  currentMode: GameMode;
  gameState: GameStateUpdate;
  highScore: number;
  onOpenModeSelect: () => void;
  onRestart: () => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  currentMode,
  gameState,
  highScore,
  onOpenModeSelect,
  onRestart,
}) => {
  const [isMuted, setIsMuted] = useState(SoundManager.getInstance().getMuted());
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [activeSpeech, setActiveSpeech] = useState<{
    character: 'anam' | 'araf' | 'adiba' | 'arabi';
    text: string;
  } | null>(null);

  const activeMode = currentMode || gameState.mode;

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    SoundManager.getInstance().ensureContext();
    try {
      if (!document.fullscreenElement) {
        const docEl = document.documentElement as any;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
        const orient = screen.orientation as any;
        if (orient && orient.lock) {
          await orient.lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch {
      // ignore
    }
  };

  // Update speech bubble when a new quote arrives
  useEffect(() => {
    if (gameState.speech) {
      setActiveSpeech({
        character: gameState.speech.character,
        text: gameState.speech.text,
      });

      const timer = setTimeout(() => {
        setActiveSpeech(null);
      }, 3800);

      return () => clearTimeout(timer);
    }
  }, [gameState.speech?.id]);

  const handleToggleSound = () => {
    SoundManager.getInstance().ensureContext();
    const muted = SoundManager.getInstance().toggleMute();
    setIsMuted(muted);
    if (!muted) {
      SoundManager.getInstance().playGiggle();
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 overflow-hidden select-none font-bengali">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Left Stats: Score, Distance & High Score */}
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          {/* Score & Distance Badge */}
          <div className="glass-panel px-3.5 py-1.5 md:px-5 md:py-2 rounded-2xl shadow-xl flex items-center gap-3 border border-sky-400/30">
            <div className="flex flex-col">
              <span className="text-xs text-sky-300 font-medium">দূরত্ব</span>
              <span className="text-lg md:text-2xl font-bold text-amber-300">
                {gameState.distance}{" "}
                <span className="text-xs text-amber-200">মিটার</span>
              </span>
            </div>
            <div className="h-7 w-[1px] bg-slate-600/60" />
            <div className="flex flex-col">
              <span className="text-xs text-sky-300 font-medium">পয়েন্ট</span>
              <span className="text-lg md:text-2xl font-bold text-white">
                {gameState.score}
              </span>
            </div>
            {highScore > 0 && (
              <>
                <div className="h-7 w-[1px] bg-slate-600/60 hidden sm:block" />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs text-amber-400 font-medium">
                    সেরা স্কোর
                  </span>
                  <span className="text-lg md:text-xl font-bold text-amber-400">
                    {highScore}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Player Mode Pill */}
          <button
            onClick={onOpenModeSelect}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg transition-all transform active:scale-95 flex items-center gap-1.5 border ${
              activeMode === 'araf'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-300 text-white'
                : activeMode === 'adiba'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 border-pink-300 text-white'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-300 text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>
              {activeMode === 'araf'
                ? '🧒 প্লেয়ার: আরাফ (৫ বছর)'
                : activeMode === 'adiba'
                ? '👧 প্লেয়ার: আদিবা (৯ বছর)'
                : '👦 প্লেয়ার: আনাম (১৩ বছর)'}
            </span>
          </button>
        </div>

        {/* Right Actions: Fullscreen, Sound & Restart */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            aria-label="Fullscreen Toggle"
            className="w-10 h-10 md:w-11 md:h-11 rounded-full glass-panel flex items-center justify-center text-white hover:bg-slate-700/60 transition active:scale-90 shadow-md border border-white/20"
            title={isFullscreen ? 'ফুলস্ক্রিন বন্ধ' : 'ফুলস্ক্রিন করুন'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize className="w-4 h-4 text-sky-400" />
            )}
          </button>

          <button
            onClick={handleToggleSound}
            aria-label="Sound Toggle"
            className="w-10 h-10 md:w-11 md:h-11 rounded-full glass-panel flex items-center justify-center text-white hover:bg-slate-700/60 transition active:scale-90 shadow-md border border-white/20"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-sky-400" />
            )}
          </button>

          <button
            onClick={onRestart}
            aria-label="Restart"
            className="w-10 h-10 md:w-11 md:h-11 rounded-full glass-panel flex items-center justify-center text-white hover:bg-slate-700/60 transition active:scale-90 shadow-md border border-white/20"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Center Zone: Dynamic Cartoon Speech Bubble */}
      <div className="flex flex-col items-center gap-2 pointer-events-none">
        {activeSpeech && (
          <div
            className={`transition-all duration-300 transform scale-100 animate-bounce-soft pointer-events-none z-20 ${
              activeSpeech.character === "arabi"
                ? "translate-x-16"
                : "-translate-x-16"
            }`}
          >
            <div className="relative bg-white text-slate-800 px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-sky-400 text-sm md:text-base font-bold flex items-center gap-2">
              <span className="text-xl">
                {activeSpeech.character === 'arabi'
                  ? '👶 আরাবি:'
                  : activeSpeech.character === 'adiba'
                  ? '👧 আদিবা:'
                  : activeSpeech.character === 'anam'
                  ? '👦 আনাম:'
                  : '🧒 আরাফ:'}
              </span>
              <span className="text-slate-900">{activeSpeech.text}</span>
              <div className="absolute -bottom-2.5 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom hint for Mobile / Touch screens */}
      <div className="w-full flex justify-center pb-2 pointer-events-none">
        <span className="text-[11px] sm:text-xs text-slate-400/80 bg-slate-900/60 backdrop-blur-sm px-3.5 py-1 rounded-full border border-white/10 shadow-sm animate-pulse">
          👆 স্ক্রিনের যেকোনো জায়গায় ট্যাপ করে লাফ দিন
        </span>
      </div>
    </div>
  );
};
