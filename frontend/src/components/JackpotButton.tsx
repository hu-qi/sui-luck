import { ButtonHTMLAttributes, ReactNode } from "react";

interface JackpotButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function JackpotButton({ children, className = "", ...props }: JackpotButtonProps) {
  return (
    <button 
      className={`
        relative px-8 py-4 
        rounded-lg
        bg-gradient-to-b from-[#FFED00] via-[#FFD700] to-[#B8860B]
        text-red-900 font-black text-xl uppercase tracking-widest
        border-2 border-[#FFFFE0]
        shadow-[0_0_20px_rgba(255,215,0,0.6)]
        hover:shadow-[0_0_40px_rgba(255,215,0,0.8)]
        hover:scale-105 
        active:scale-95 
        active:border-none
        transition-all duration-200
        z-10
        ${className}
      `}
      {...props}
    >
      <span className="drop-shadow-md">{children}</span>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
    </button>
  );
}
