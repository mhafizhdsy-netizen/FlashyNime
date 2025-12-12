
import React, { useEffect, useState } from 'react';
import { X, Download, Share, PlusSquare, Zap } from 'lucide-react';
import { Button } from './ui';

export const PWAModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Handle beforeinstallprompt (Chrome/Android)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      checkShouldShow();
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Initial check (in case event fired before mount or for iOS)
    checkShouldShow();

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const checkShouldShow = () => {
    const hasSeen = localStorage.getItem('pwa_prompt_seen');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (!hasSeen && !isStandalone) {
      // Small delay to not annoy user immediately
      setTimeout(() => setIsOpen(true), 3000);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsOpen(false);
      }
    }
    localStorage.setItem('pwa_prompt_seen', 'true');
  };

  const handleClose = () => {
      setIsOpen(false);
      localStorage.setItem('pwa_prompt_seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-none p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto animate-scale-in">
        <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-3 rounded-xl shadow-lg shadow-violet-500/20 mb-2">
                <Zap className="text-white w-8 h-8 fill-white" />
            </div>
            
            <div>
                <h3 className="text-xl font-bold text-white mb-2">Install FlashyNime</h3>
                <p className="text-slate-400 text-sm">
                    {isIOS 
                        ? "Install our app for the best experience. Faster load times and full screen viewing."
                        : "Add FlashyNime to your home screen for quick access and a better streaming experience."
                    }
                </p>
            </div>

            {isIOS ? (
                <div className="w-full bg-slate-800/50 rounded-xl p-4 text-left space-y-3 text-sm text-slate-300 border border-white/5">
                    <div className="flex items-center gap-3">
                        <Share className="w-5 h-5 text-blue-400" />
                        <span>Tap the <strong>Share</strong> button</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <PlusSquare className="w-5 h-5 text-slate-200" />
                        <span>Select <strong>Add to Home Screen</strong></span>
                    </div>
                </div>
            ) : (
                <Button onClick={handleInstall} className="w-full gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                    <Download className="w-4 h-4" /> Install App
                </Button>
            )}

            <button onClick={handleClose} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Maybe later
            </button>
        </div>
      </div>
    </div>
  );
};
