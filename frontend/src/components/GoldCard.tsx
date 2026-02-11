import { ReactNode } from "react";

interface GoldCardProps {
  children: ReactNode;
  className?: string;
}

export function GoldCard({ children, className = "" }: GoldCardProps) {
  return (
    <div className={`
      relative 
      overflow-hidden
      rounded-xl 
      bg-gradient-to-b from-[#2a0000] to-black
      border-2 border-[#FFD700]
      shadow-[0_0_20px_rgba(255,215,0,0.2)]
      p-6 
      group
      transition-all duration-300
      hover:shadow-[0_0_40px_rgba(255,215,0,0.5)]
      hover:-translate-y-1
      ${className}
    `}>
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FFFF00] rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#FFFF00] rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#FFFF00] rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FFFF00] rounded-br-lg" />

      {/* Content */}
      <div className="relative z-10 text-[#FFD700]">
        {children}
      </div>
    </div>
  );
}
