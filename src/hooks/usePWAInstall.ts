import { useState, useEffect, useCallback, useMemo } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showInAppGuide, setShowInAppGuide] = useState(false);

  // Check if iOS
  const isIOS = useMemo(() => {
    return (
      typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
    );
  }, []);

  // Detect if running inside in-app browser (Messenger, Facebook, Instagram, WhatsApp, etc.)
  const { isInApp, inAppBrowserName } = useMemo(() => {
    if (typeof navigator === 'undefined') return { isInApp: false, inAppBrowserName: '' };
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const isMessenger = /FBAN|FBAV|FB_IAB|Messenger/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isWhatsApp = /WhatsApp/i.test(ua);
    const isOtherInApp = /Line|Twitter|Snapchat|MicroMessenger|musical_ly|ByteLocale|TikTok|WeChat/i.test(ua);
    const isWebView = /wv|WebView/i.test(ua) && !/Chrome\/[.0-9]+ Mobile/i.test(ua);

    const inApp = isMessenger || isInstagram || isWhatsApp || isOtherInApp || isWebView;
    let name = 'Messenger';
    if (isInstagram) name = 'Instagram';
    else if (isWhatsApp) name = 'WhatsApp';
    else if (isMessenger) name = 'Messenger';
    else if (isOtherInApp) name = 'In-App Browser';

    return { isInApp: inApp, inAppBrowserName: name };
  }, []);

  useEffect(() => {
    // Check if app is already running standalone
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(Boolean(isStandaloneMode));
    };

    checkStandalone();
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    // 1. If inside In-App Browser (Messenger / Facebook / Instagram):
    // In-app browsers block PWA install and fullscreen orientation lock.
    // Guide user to open in Safari (iOS) or Chrome (Android).
    if (isInApp && !isInstalled) {
      setShowInAppGuide(true);
      return false;
    }

    // 2. Native PWA prompt available (Chrome / Edge / Samsung Internet)
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return true;
    }

    // 3. iOS Safari (not in-app)
    if (isIOS && !isInstalled) {
      setShowIOSGuide(true);
      return false;
    }

    // 4. Fallback for other browsers
    setShowInAppGuide(true);
    return false;
  }, [isInApp, isInstalled, deferredPrompt, isIOS]);

  const isInstallable = !isInstalled;

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isInApp,
    inAppBrowserName,
    showIOSGuide,
    setShowIOSGuide,
    showInAppGuide,
    setShowInAppGuide,
    triggerInstall,
  };
}
