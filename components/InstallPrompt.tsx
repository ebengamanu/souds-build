import React, { useState, useEffect } from 'react';
import { Download, Share, X, PlusSquare } from 'lucide-react';
import { Button } from './Button';

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isStandalone) {
        return; // Already installed
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Capture the Android install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show the prompt after a slight delay for better UX
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, just show it after a delay
    if (ios) {
        setTimeout(() => setShowPrompt(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] px-4 pb-6 animate-fade-in-up">
      <div className="bg-[#2C1B10] text-white p-4 rounded-xl shadow-2xl border border-stone-600 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 blur-[60px] opacity-20 rounded-full pointer-events-none"></div>

        <button 
            onClick={() => setShowPrompt(false)} 
            className="absolute top-2 right-2 text-stone-400 hover:text-white p-1"
        >
            <X size={20} />
        </button>

        <div className="flex gap-4 items-start">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-[#2C1B10] rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <span className="font-serif font-black text-xl">S</span>
            </div>
            
            <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight mb-1">Installer Sounds</h3>
                <p className="text-stone-300 text-xs mb-3">
                    Installez l'application pour une expérience native, une écoute hors-ligne fluide et un accès rapide.
                </p>

                {isIOS ? (
                    <div className="bg-white/10 p-3 rounded-lg text-xs space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-red-400">1.</span>
                            <span>Appuyez sur <Share size={14} className="inline mx-1"/> (Partager) dans la barre du navigateur.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-red-400">2.</span>
                            <span>Sélectionnez <span className="font-bold text-white"><PlusSquare size={14} className="inline mx-1"/> Sur l'écran d'accueil</span>.</span>
                        </div>
                    </div>
                ) : (
                    <Button 
                        onClick={handleInstallClick} 
                        fullWidth 
                        className="py-2 bg-white text-black hover:bg-stone-200 flex items-center justify-center gap-2"
                    >
                        <Download size={18} /> Installer l'Application
                    </Button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};