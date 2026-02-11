import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`
      relative 
      overflow-hidden
      rounded-2xl 
      bg-white/5 
      border border-white/10 
      backdrop-blur-xl 
      shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] 
      p-6 
      group
      transition-all duration-300
      hover:shadow-[0_8px_32px_0_rgba(255,215,0,0.2)]
      hover:border-white/20
      ${className}
    `}>
      {/* Internal shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
