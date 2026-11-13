import React from 'react';
import { GameMode } from '../game/GameScene';
import { RotateCcw, Award, Compass, Play, Sparkles } from 'lucide-react';
import { SoundManager } from '../game/SoundManager';

interface GameOverModalProps {
  winner: 'player' | 'arabi';
  mode: GameMode;
  score: number;
  distance: number;
  highScore: number;
  isNewHigh: boolean;
  onRestart: () => void;
  onSelectModeAndRestart: (mode: GameMode) => void;
  onOpenModeSelect?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  mode,
  score,
  distance,
  highScore,
  isNewHigh,
  onRestart,
  onSelectModeAndRestart,
  onOpenModeSelect,
}) => {
  const isPlayerWinner = winner === 'player';
  const playerName = mode === 'araf' ? 'আরাফ' : mode === 'adiba' ? 'আদিবা' : 'আনাম';

  // If Arabi wins, trigger her joyful giggle sound!
  React.useEffect(() => {
    if (!isPlayerWinner) {
      SoundManager.getInstance().playGiggle();
    }
  }, [isPlayerWinner]);

  return (
    <div
      data-no-jump="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/85 backdrop-blur-md font-bengali overflow-y-auto"
    >
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-sky-500/30 rounded-3xl p-4 md:p-6 max-w-md w-full max-h-[95dvh] overflow-y-auto shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient */}
        <div
          className={`absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
            isPlayerWinner ? 'bg-emerald-500/25' : 'bg-rose-500/25'
          }`}
        />

        {/* Winner Tag Badge */}
        <div
          className={`mb-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold uppercase tracking-wider border shadow-lg ${
            isPlayerWinner
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-emerald-500/20'
              : 'bg-rose-500/20 text-rose-300 border-rose-400/50 shadow-rose-500/20'
          }`}
        >
          <span>{isPlayerWinner ? `🏆 বিজয়ী: ${playerName}!` : '🍼 বিজয়ী: ছোট্ট আরাবি!'}</span>
        </div>

        {/* Character avatar header with celebratory bounce */}
        <div className="relative mx-auto w-32 h-32 mb-3">
          <img
            src={
              isPlayerWinner
                ? mode === 'araf'
                  ? '/assets/sprites/araf-run.png'
                  : mode === 'adiba'
                  ? '/assets/sprites/adiba-run.png'
                  : '/assets/sprites/anam-run.png'
                : '/assets/sprites/arabi-walker.png'
            }
            alt="Result Character"
            className={`w-full h-full object-contain filter drop-shadow-2xl ${
              isPlayerWinner ? 'animate-bounce' : 'animate-bounce-soft'
            }`}
          />
          {isPlayerWinner ? (
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 rounded-full p-2 shadow-xl border-2 border-white animate-spin-slow">
              <Sparkles className="w-6 h-6 fill-slate-950" />
            </div>
          ) : (
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-pink-400 to-rose-500 text-white rounded-full p-2 shadow-xl border-2 border-white animate-pulse">
              <span className="text-lg">🍼</span>
            </div>
          )}
        </div>

        {/* Dynamic Result Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 mb-1">
          {isPlayerWinner
            ? `হুররে! ${playerName} জিতেছে! 🎉🏆`
            : 'হিহিহি! আরাবি জিতে গেছে! 🍼💨'}
        </h2>

        <p className="text-slate-300 text-xs md:text-sm mb-4 font-medium leading-relaxed">
          {isPlayerWinner
            ? `সব খেলনা সুন্দরভাবে লাফিয়ে পার হয়ে ${playerName} দৌড়ে গিয়ে আরাবিকে জাপটে ধরেছে!`
            : 'আরাবি ১০০% দুধ খেয়ে রকেটের মতো স্পিডে সবাইকে ফেলে পালিয়ে গেল! 😄'}
        </p>

        {/* New High Score Badge */}
        {isNewHigh && (
          <div className="mb-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/50 text-amber-300 text-xs md:text-sm font-bold animate-pulse">
            <Award className="w-4 h-4 text-amber-400" />
            <span>নতুন সেরা রেকর্ড! 🏆</span>
          </div>
        )}

        {/* Score & Distance Summary Card */}
        <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-700/80 flex items-center justify-around mb-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">অতিক্রান্ত দূরত্ব</span>
            <span className="text-xl md:text-2xl font-bold text-amber-300">
              {distance} <span className="text-xs text-amber-200">মিটার</span>
            </span>
          </div>

          <div className="h-9 w-[1px] bg-slate-700" />

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">অর্জিত পয়েন্ট</span>
            <span className="text-xl md:text-2xl font-bold text-white">
              {score}
            </span>
          </div>
        </div>

        {/* Action Buttons: Play Again for Araf, Adiba, Anam */}
        <div className="flex flex-col gap-2">
          {/* Button 1: Play as Araf */}
          <button
            onClick={() => onSelectModeAndRestart('araf')}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all transform active:scale-98 flex items-center justify-center gap-2 border ${
              mode === 'araf' && isPlayerWinner
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-600/30 border-emerald-300/40 ring-2 ring-emerald-400'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 border-emerald-400/40'
            }`}
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>🧒 আরাফ দিয়ে খেলুন (৫ বছর)</span>
          </button>

          {/* Button 2: Play as Adiba */}
          <button
            onClick={() => onSelectModeAndRestart('adiba')}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all transform active:scale-98 flex items-center justify-center gap-2 border ${
              mode === 'adiba' && isPlayerWinner
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-pink-600/30 border-pink-300/40 ring-2 ring-pink-400'
                : 'bg-gradient-to-r from-pink-600 to-rose-700 hover:brightness-110 border-pink-400/40'
            }`}
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>👧 আদিবা দিয়ে খেলুন (৯ বছর)</span>
          </button>

          {/* Button 3: Play as Anam */}
          <button
            onClick={() => onSelectModeAndRestart('anam')}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all transform active:scale-98 flex items-center justify-center gap-2 border ${
              mode === 'anam' && isPlayerWinner
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-600/30 border-indigo-300/40 ring-2 ring-indigo-400'
                : 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:brightness-110 border-indigo-400/40'
            }`}
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>👦 আনাম দিয়ে খেলুন (১৩ বছর)</span>
          </button>

          {/* Button 4: Start anew from character select banner */}
          {onOpenModeSelect && (
            <button
              onClick={onOpenModeSelect}
              className="mt-1 w-full py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 font-bold text-xs border border-sky-400/30 transition flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>🔄 শুরুর মতো প্লেয়ার বেছে নিন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
