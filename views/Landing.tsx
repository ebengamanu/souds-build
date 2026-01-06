import React, { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { APP_NAME, LANDING_BG_IMAGE } from '../constants';
import { ShoppingBag, User, CheckCircle, XCircle, ChevronRight, Music, WifiOff, Crown } from 'lucide-react';

interface LandingProps {
  onNavigate: (view: string) => void;
}

const StarSnowEffect = () => {
  // Generate random particles only once
  const particles = useMemo(() => {
      return Array.from({ length: 60 }).map((_, i) => {
        // Much slower speed: 10s to 20s for a floating effect
        const duration = Math.random() * 10 + 10; 
        return {
            id: i,
            left: Math.random() * 100 + '%',
            animationDuration: duration + 's',
            // Negative delay matching the duration ensures they appear to have been falling forever
            animationDelay: -(Math.random() * duration) + 's', 
            opacity: Math.random() * 0.7 + 0.3,
            size: Math.random() * 10 + 3 + 'px'
        };
      });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <style>{`
            @keyframes starfall {
                0% {
                    transform: translateY(-10vh) translateX(0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(110vh) translateX(-20px) rotate(180deg);
                    opacity: 0;
                }
            }
        `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute bg-white shadow-[0_0_8px_white]"
          style={{
            left: p.left,
            top: '-50px', // Start above screen
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationName: 'starfall',
            animationDuration: p.animationDuration,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: p.animationDelay,
            // Star shape using clip-path
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
          }}
        />
      ))}
    </div>
  );
};

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [showInterstitial, setShowInterstitial] = useState(false);

  const handleShopClick = () => {
    setShowInterstitial(true);
  };

  const handleContinueToShop = () => {
    setShowInterstitial(false);
    onNavigate('marketplace');
  };

  const handleCreateProAccount = () => {
    setShowInterstitial(false);
    onNavigate('register-buyer');
  };

  // --- INTERSTITIAL MARKETING SCREEN ---
  if (showInterstitial) {
      return (
        <div className="fixed inset-0 z-50 bg-[#2C1B10] flex flex-col items-center justify-start pt-24 px-6 pb-6 animate-fade-in text-white overflow-y-auto">
             
             {/* Big Logo Top */}
             <div className="mb-8 scale-150 transform shrink-0">
                <div className="w-20 h-20 bg-[#3E2723] rounded-full flex items-center justify-center border-4 border-[#8D6E63] shadow-2xl relative">
                    <span className="text-[#D7CCC8] font-black font-serif text-5xl">S</span>
                    <div className="absolute -top-2 -right-2 bg-red-600 rounded-full p-2 border-2 border-[#2C1B10]">
                        <Crown size={16} fill="white" />
                    </div>
                </div>
             </div>

             <h2 className="text-2xl md:text-3xl font-black text-center mb-2 leading-tight shrink-0">
                 C'est mieux avec un <br/><span className="text-red-500">Compte Pro 😎</span>
             </h2>
             <p className="text-stone-400 text-center text-sm mb-8 max-w-xs shrink-0">
                 Profitez de la musique sans limites.
             </p>

             {/* Comparison Card */}
             <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8 space-y-6 shrink-0">
                 
                 {/* Free Tier */}
                 <div className="opacity-60">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-stone-300">Visiteur (Gratuit)</h3>
                     </div>
                     <ul className="space-y-2 text-sm text-stone-400">
                         <li className="flex items-center gap-2"><CheckCircle size={14} /> Achat unitaire</li>
                         <li className="flex items-center gap-2 text-stone-500"><XCircle size={14} /> Pas de bibliothèque Cloud</li>
                         <li className="flex items-center gap-2 text-stone-500"><XCircle size={14} /> Pas de mode Hors-ligne</li>
                     </ul>
                 </div>

                 <div className="h-px bg-white/20 w-full"></div>

                 {/* Pro Tier */}
                 <div>
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="font-black text-white text-lg">Acheteur Pro</h3>
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">3.99€ /mois</span>
                     </div>
                     <ul className="space-y-2 text-sm text-white font-medium">
                         <li className="flex items-center gap-2"><span className="text-green-400">✅</span> Stockage Illimité ☁️</li>
                         <li className="flex items-center gap-2"><span className="text-green-400">✅</span> Mode Hors-ligne <WifiOff size={14}/></li>
                         <li className="flex items-center gap-2"><span className="text-green-400">✅</span> Qualité Haute Définition 🎧</li>
                         <li className="flex items-center gap-2"><span className="text-green-400">✅</span> Support des Artistes ❤️</li>
                     </ul>
                 </div>
             </div>

             {/* Buttons */}
             <div className="w-full max-w-sm space-y-4 shrink-0">
                 <button 
                    onClick={handleCreateProAccount}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-lg shadow-xl transform transition-transform active:scale-95 flex items-center justify-center gap-2"
                 >
                     Créer un compte Pro
                 </button>

                 <button 
                    onClick={handleContinueToShop}
                    className="w-full py-3 text-stone-400 font-bold text-sm hover:text-white flex items-center justify-center gap-1 transition-colors"
                 >
                     Non merci, continuer vers la boutique <ChevronRight size={14} />
                 </button>
             </div>

             {/* Small Logo Bottom */}
             <div className="mt-8 pt-6 opacity-30 shrink-0 pb-safe">
                 <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">
                     <span className="font-serif font-black text-white text-xs">S</span>
                 </div>
             </div>
        </div>
      );
  }

  // --- NORMAL LANDING ---
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src={LANDING_BG_IMAGE} 
          alt="Woman listening to music" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]"></div>
        
        {/* Falling Stars Effect */}
        <StarSnowEffect />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center py-10">
        <div className="mb-8 animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-xl">
              {APP_NAME}
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 max-w-2xl mx-auto font-medium shadow-black drop-shadow-md">
              La plateforme ultime pour les passionnés de musique.
            </p>
        </div>

        {/* Buttons directly on background, no container box */}
        <div className="w-full max-w-md space-y-4">
            <p className="text-white font-bold mb-4 drop-shadow-md text-lg">
              Artistes, vendez vos créations.<br/>
              Acheteurs, soutenez vos idoles.
            </p>

            <Button 
              fullWidth 
              onClick={() => onNavigate('login')}
              className="flex items-center justify-center gap-2 shadow-xl border border-red-500/30"
            >
              <User size={20} />
              Connexion
            </Button>

            <Button 
              fullWidth 
              variant="outline"
              onClick={() => onNavigate('register')}
              className="bg-white/90 border-none text-black hover:bg-white shadow-xl"
            >
              Créer un compte Vendeur
            </Button>

            {/* Separator Line */}
            <div className="flex items-center gap-2 opacity-70">
                <div className="h-px bg-white flex-1"></div>
                <div className="h-px bg-white flex-1"></div>
            </div>

            {/* Buyer Pro Button */}
             <Button 
              fullWidth 
              onClick={() => onNavigate('register-buyer')}
              className="bg-stone-800 text-white hover:bg-black shadow-xl flex items-center justify-center gap-2 border border-stone-600"
            >
              <span className="text-2xl">😎🎧</span> Créer un compte Acheteur Pro
            </Button>
            
            <div className="pt-4">
               {/* Redesigned Beautiful "Acheter ici" Button - Lighter Brown Gradient */}
               <button
                onClick={handleShopClick}
                className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#D7CCC8] to-[#8D6E63] p-[1px] shadow-2xl transition-all hover:shadow-red-900/40 hover:scale-[1.02]"
              >
                <div className="relative h-full w-full rounded-xl bg-gradient-to-br from-[#BCAAA4] via-[#A1887F] to-[#8D6E63] px-6 py-4 transition-all group-hover:bg-gradient-to-br group-hover:from-[#D7CCC8] group-hover:to-[#A1887F]">
                   <div className="flex items-center justify-center gap-3">
                      <div className="rounded-full bg-white/30 p-2 group-hover:bg-red-600 transition-colors shadow-inner">
                         <ShoppingBag size={24} className="text-stone-900 group-hover:text-white drop-shadow-sm transition-colors" />
                      </div>
                      <div className="text-left">
                          <p className="text-xs text-stone-800 font-medium uppercase tracking-wider group-hover:text-white/90">Accès Boutique</p>
                          <p className="text-xl font-black text-stone-900 drop-shadow-sm group-hover:text-white">Acheter ici</p>
                      </div>
                   </div>
                </div>
              </button>
            </div>

            {/* PWA Promo Text */}
            <div className="mt-6 p-5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-2xl transform transition-transform hover:scale-105">
                <p className="font-black text-lg text-red-400 italic mb-2">🎵 Sounds est ULTIME en APP !</p>
                <div className="text-left pl-4 border-l-2 border-red-500 mb-3 space-y-1 text-sm font-medium italic text-stone-200">
                    <p>INSTALLER sur écran d'accueil =</p>
                    <p>• HITS LIVE (temps réel)</p>
                    <p>• Musiques OFFLINE</p>
                    <p>• Notifs artistes</p>
                    <p>• 2x plus rapide</p>
                </div>
                <div className="mt-3 bg-white/10 rounded-full py-2 border border-white/30 animate-pulse font-black text-xs uppercase tracking-widest text-center cursor-default">
                    👆 [INSTALLER MAINTENANT]
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};