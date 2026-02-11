"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function CasinoAd() {
  const [isVisible, setIsVisible] = useState(false);
  const [isBlinking, setIsBlinking] = useState(true);

  useEffect(() => {
    // Show after 3 seconds
    const timer = setTimeout(() => setIsVisible(true), 3000);
    
    // Blink effect for the text
    const blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
    }, 500);

    return () => {
        clearTimeout(timer);
        clearInterval(blinkInterval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[999] w-64 animate-in fade-in slide-in-from-right-10 duration-500">
      <div className="relative group overflow-hidden rounded-lg border-4 border-[#FFD700] shadow-[0_0_50px_rgba(255,215,0,0.5)] bg-black">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 z-20 p-1 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors shadow-lg"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ad Body (Share to X) */}
        <a 
          href={`https://x.com/intent/tweet?text=${encodeURIComponent("🧧 我在 #Sui 鏈上金馬賭場領到了新年好運！💧全鏈上公平抽獎，馬到功成！🐴✨ 快來跟我一起參與 Sui New Year Draw 吧！")}&url=${encodeURIComponent("https://sui-luck.vercel.app")}&hashtags=Sui,YearOfGoldenHorse,VibeSui`}
          target="_blank" 
          rel="noopener noreferrer"
          className="relative aspect-[4/5] w-full block cursor-pointer"
        >
          <img 
            src="/casino-ad.png" 
            alt="Golden Horse Dealer" 
            className="object-cover w-full h-full"
          />
          
          {/* Flashy Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-transparent to-transparent"></div>
          
          {/* Animated Text */}
          <div className="absolute bottom-4 left-0 w-full text-center px-2 pointer-events-none">
            <div className={`text-xl font-black italic uppercase tracking-tighter transition-all duration-300 ${isBlinking ? 'text-[#FFD700] scale-110' : 'text-white scale-100'} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
                性感金馬 線上開獎
            </div>
            <div className={`mt-1 text-sm font-black tracking-widest bg-yellow-400 text-black py-0.5 px-2 inline-block rounded skew-x-[-15deg]`}>
                ★ GOLDEN HORSE ★
            </div>
            <div className="mt-2 text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest animate-pulse">
                澳門首家鏈上賭場上線啦
            </div>
          </div>

          {/* Shiny Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease_in_out] pointer-events-none"></div>
        </a>
      </div>
    </div>
  );
}
