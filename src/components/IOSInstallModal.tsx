import React from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-bengali animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-sky-400/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded-full bg-slate-800/80"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg border border-white/20">
          <img src="/pwa-192x192.png" alt="Arabi Run" className="w-12 h-12 rounded-xl object-cover" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          iPhone / iPad এ ইনস্টল করুন
        </h3>
        <p className="text-slate-300 text-xs mb-5 leading-relaxed">
          কোনো অ্যাপ স্টোর ছাড়াই গেমটি এক ট্যাপে সম্পূর্ণ ফুলস্ক্রিনে খেলতে আপনার হোম স্ক্রিনে যুক্ত করুন:
        </p>

        <div className="space-y-3 text-left text-xs bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 mb-5">
          <div className="flex items-center gap-3 text-sky-200">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 font-bold text-sky-300">
              ১
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Safari ব্রাউজারের নিচে</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700 rounded-md font-bold text-white">
                <Share className="w-3.5 h-3.5" /> Share
              </span>
              <span>বাটনে চাপুন।</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sky-200">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 font-bold text-sky-300">
              ২
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>মেনু স্ক্রল করে</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700 rounded-md font-bold text-white">
                <PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen
              </span>
              <span>বাছুন।</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sky-200">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 font-bold text-sky-300">
              ৩
            </span>
            <span>উপরে <strong>"Add"</strong> চাপুন। গেমের আইকন আপনার ফোনে চলে আসবে!</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-md active:scale-95 transition"
        >
          ঠিক আছে, বুঝেছি!
        </button>
      </div>
    </div>
  );
};
