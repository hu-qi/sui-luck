import { ButtonHTMLAttributes, ReactNode } from "react";

interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function LiquidButton({ children, variant = "primary", className = "", ...props }: LiquidButtonProps) {
  const baseStyles = "relative px-8 py-3 rounded-full font-bold tracking-wide transition-all duration-300 overflow-hidden group active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_0_15px_rgba(255,75,75,0.4)] hover:shadow-[0_0_25px_rgba(255,75,75,0.6)] border border-white/20",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10 hover:border-white/30",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
    </button>
  );
}
