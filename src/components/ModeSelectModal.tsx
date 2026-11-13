import React from 'react';
import { GameMode } from '../game/GameScene';
import { Sparkles, Heart, Play, Zap } from 'lucide-react';

interface ModeSelectModalProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onClose: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  currentMode,
  onSelectMode,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-bengali">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-sky-500/30 rounded-3xl p-5 md:p-6 max-w-2xl w-full shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Main Game Banner (new-characters-sheet.jpeg) */}
        <div className="relative w-full h-32 md:h-44 rounded-2xl overflow-hidden mb-3.5 border-2 border-sky-400/40 shadow-xl group">
          <img
            src="/assets/bg/new-characters-banner.jpg"
            alt="আরাবি ওয়াকার রান - New Characters Banner"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
            <span className="bg-sky-500/90 text-white text-xs md:text-sm font-extrabold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
              👶 আরাবি ওয়াকার রান
            </span>
            <span className="bg-amber-400/90 text-slate-950 text-xs md:text-sm font-extrabold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border border-white/30">
              🏃‍♂️ তাড়া করো!
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl md:text-3xl">👶</span>
          <h2 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-amber-200 to-emerald-300">
            কে খেলবে? প্লেয়ার বেছে নিন
          </h2>
        </div>
        <p className="text-slate-300 text-xs md:text-sm mb-4 font-medium">
          আরাবি সামনে ওয়াকার নিয়ে ছুটছে আর খেলনা ছুড়ছে! কে আরাবিকে ধরবে?
        </p>

        {/* 3 Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-left">
          {/* 1. Araf Mode (Easy / Kids 5y) */}
          <div
            onClick={() => onSelectMode('araf')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all transform active:scale-95 relative overflow-hidden flex flex-col justify-between ${
              currentMode === 'araf'
                ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                : 'bg-slate-900/60 border-slate-700/80 hover:border-emerald-500/50'
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src="/assets/sprites/araf-run.png"
                  alt="Araf"
                  className="w-12 h-12 object-contain filter drop-shadow shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ৫ বছর
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">আরাফ (সহজ)</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">
                ধীর গতি ও আরামদায়ক জাম্পিং টাইমিং।
              </p>
            </div>

            {currentMode === 'araf' ? (
              <div className="mt-3 text-center py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-400/40">
                ✓ নির্বাচিত
              </div>
            ) : (
              <div className="mt-3 text-center py-1 text-slate-400 text-xs">
                ক্লিক করে বাছুন
              </div>
            )}
          </div>

          {/* 2. Adiba Mode (Medium / Sister 9y) */}
          <div
            onClick={() => onSelectMode('adiba')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all transform active:scale-95 relative overflow-hidden flex flex-col justify-between ${
              currentMode === 'adiba'
                ? 'bg-gradient-to-br from-pink-950/60 to-slate-900 border-pink-400 shadow-lg shadow-pink-500/20 scale-[1.02]'
                : 'bg-slate-900/60 border-slate-700/80 hover:border-pink-500/50'
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src="/assets/sprites/adiba-run.png"
                  alt="Adiba"
                  className="w-12 h-12 object-contain filter drop-shadow shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300 bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-500/30">
                    ৯ বছর
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">আদিবা (মাঝারি)</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">
                চঞ্চল গতি ও চটপটে খেলনা এড়ানোর কৌশল।
              </p>
            </div>

            {currentMode === 'adiba' ? (
              <div className="mt-3 text-center py-1 bg-pink-500/20 text-pink-300 rounded-lg text-xs font-bold border border-pink-400/40">
                ✓ নির্বাচিত
              </div>
            ) : (
              <div className="mt-3 text-center py-1 text-slate-400 text-xs">
                ক্লিক করে বাছুন
              </div>
            )}
          </div>

          {/* 3. Anam Mode (Challenge 13y) */}
          <div
            onClick={() => onSelectMode('anam')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all transform active:scale-95 relative overflow-hidden flex flex-col justify-between ${
              currentMode === 'anam'
                ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-400 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                : 'bg-slate-900/60 border-slate-700/80 hover:border-indigo-500/50'
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src="/assets/sprites/anam-run.png"
                  alt="Anam"
                  className="w-12 h-12 object-contain filter drop-shadow shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/30">
                    ১৩ বছর
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">আনাম (চ্যালেঞ্জ)</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">
                উচ্চ গতি ও টানটান উত্তেজনার তাড়া।
              </p>
            </div>

            {currentMode === 'anam' ? (
              <div className="mt-3 text-center py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-400/40">
                ✓ নির্বাচিত
              </div>
            ) : (
              <div className="mt-3 text-center py-1 text-slate-400 text-xs">
                ক্লিক করে বাছুন
              </div>
            )}
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-lg shadow-xl shadow-indigo-600/30 transition-all transform active:scale-98 flex items-center justify-center gap-2 border border-sky-300/40"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>খেলা শুরু করুন! 🎮</span>
        </button>
      </div>
    </div>
  );
};
