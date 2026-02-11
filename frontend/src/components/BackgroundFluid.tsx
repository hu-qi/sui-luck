export function BackgroundFluid() {
  return (
    <div className="fixed inset-0 -z-50 bg-[#2a0000] overflow-hidden pointer-events-none">
      {/* Abstract CSS Landscape - Year of the Horse */}
      
      {/* 1. Golden Sun / Moon */}
      <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-b from-[#FFD700] to-[#FF8C00] opacity-20 blur-3xl" />
      <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-64 h-64 rounded-full bg-[#FFD700] opacity-10 blur-xl" />

      {/* 2. Stylized Mountains (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-black to-transparent opacity-80" />
      <div className="absolute -bottom-20 -left-20 w-[60%] h-[50%] bg-[#1a0000] rounded-[100%] blur-sm border-t-4 border-[#FFD700]/20" />
      <div className="absolute -bottom-20 -right-20 w-[60%] h-[60%] bg-[#150000] rounded-[100%] blur-sm border-t-4 border-[#FFD700]/20" />

      {/* 3. Falling Elements (Fortune) */}
      <div className="absolute inset-0 select-none overflow-hidden">
        {/* Animated Coins & Lanterns */}
        <div className="absolute top-10 left-[10%] text-4xl animate-bounce duration-[3000ms] opacity-60">🧧</div>
        <div className="absolute top-40 right-[20%] text-4xl animate-bounce duration-[4000ms] opacity-60">🏮</div>
        <div className="absolute bottom-40 left-[15%] text-2xl animate-pulse duration-[2000ms] text-[#FFD700]">✦</div>
        <div className="absolute top-20 right-[5%] text-3xl animate-pulse duration-[3000ms] text-[#FFD700]">✦</div>
        
        {/* Giant Watermark Characters */}
        <div className="absolute top-1/2 left-10 text-[10rem] font-serif font-black text-[#FFD700] opacity-5 -rotate-12 blur-sm">馬</div>
        <div className="absolute bottom-20 right-10 text-[8rem] font-serif font-black text-[#FFD700] opacity-5 rotate-12 blur-sm">福</div>
      </div>

      {/* 4. Pattern Overlay (Traditional) */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #FFD700 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }} 
      />
    </div>
  );
}
