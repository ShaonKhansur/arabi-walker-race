import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, MoreHorizontal, Compass } from 'lucide-react';

interface InAppBrowserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  browserName?: string;
}

export const InAppBrowserGuideModal: React.FC<InAppBrowserGuideModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  browserName = 'Messenger',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetBrowser = isIOS ? 'Safari' : 'Chrome';

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleOpenExternal = () => {
    if (!isIOS) {
      // Android Intent scheme to escape in-app browser and open directly in Chrome
      try {
        const urlWithoutScheme = window.location.href.replace(/^https?:\/\//, '');
        window.location.href = `intent://${urlWithoutScheme}#Intent;scheme=https;package=com.android.chrome;end`;
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md font-bengali animate-in fade-in duration-200">
      {/* Visual Pointer to top-right corner where '...' is in Messenger */}
      <div className="absolute top-2 right-4 flex flex-col items-end pointer-events-none animate-bounce">
        <div className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-2xl flex items-center gap-1.5 border border-white">
          <span>এখানে চাপুন</span>
          <span className="text-base font-bold">↗</span>
        </div>
        <div className="w-0.5 h-6 bg-gradient-to-t from-transparent to-amber-400 mr-4" />
      </div>

      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/50 rounded-3xl p-5 md:p-6 max-w-sm w-full shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1.5 rounded-full bg-slate-800/80"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-3.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-white/30 text-slate-950">
          <Compass className="w-9 h-9 animate-spin-slow stroke-[2.2]" />
        </div>

        <h3 className="text-lg md:text-xl font-black text-white mb-1.5">
          {browserName} থেকে {targetBrowser}-এ খুলুন
        </h3>

        <p className="text-slate-300 text-xs mb-4 leading-relaxed">
          {browserName}-এর ভেতর থেকে সরাসরি অ্যাপ ইনস্টল বা ফুলস্ক্রিন করা যায় না। সম্পূর্ণ মজা পেতে এবং এক-ট্যাপে ইনস্টল করতে:
        </p>

        {/* Steps */}
        <div className="space-y-2.5 text-left text-xs bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/80 mb-4">
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-[11px]">
              ১
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>স্ক্রিনের একদম উপরে ডানে</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700 text-white rounded-md font-black border border-slate-600">
                <MoreHorizontal className="w-3.5 h-3.5" /> (তিন ডট)
              </span>
              <span>চাপুন।</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-[11px]">
              ২
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>মেন্যু থেকে</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-md font-bold border border-amber-400/40">
                <ExternalLink className="w-3.5 h-3.5" /> Open in {targetBrowser}
              </span>
              <span>বাছুন।</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-[11px]">
              ৩
            </span>
            <span>
              {targetBrowser}-এ পেজটি খুললেই সাথে সাথে <strong>এক ট্যাপে ইনস্টল</strong> ও ফুলস্ক্রিনে খেলতে পারবেন!
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isIOS ? (
            <button
              onClick={handleOpenExternal}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              <span>সরাসরি Chrome-এ খুলুন 🚀</span>
            </button>
          ) : null}

          <button
            onClick={handleCopyLink}
            className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>লিংক কপি হয়েছে! {targetBrowser}-এ পেস্ট করুন</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>গেমের লিংক কপি করুন</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition"
          >
            ঠিক আছে, বুঝেছি
          </button>
        </div>
      </div>
    </div>
  );
};

