"use client";

import { useCurrentAccount, useSignAndExecuteTransaction, ConnectModal, useSuiClientQuery } from "@mysten/dapp-kit";
import { Ticket, Plus, Clock, Trophy } from "lucide-react";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { PACKAGE_ID } from "./constants";
import { BackgroundFluid } from "@/components/BackgroundFluid";
import { PoolCard } from "@/components/PoolCard";
import { JackpotButton } from "@/components/JackpotButton";

export default function Home() {
  const account = useCurrentAccount();

  // Fetch Pool Created Events
  const { data: events, isLoading } = useSuiClientQuery("queryEvents", {
    query: {
      MoveModule: {
        package: PACKAGE_ID,
        module: "draw",
      },
    },
    order: "descending",
  }, {
    refetchInterval: 10000,
  });

  const pools = events?.data
    .filter((event) => event.type.includes("PoolCreated")) 
    .map((event) => {
      const parsedJson = event.parsedJson as any;
      if (!parsedJson) return null;
      
      return {
        poolId: parsedJson.pool_id,
        creator: parsedJson.creator,
        description: parsedJson.description || "Untitled Draw",
        ticketPrice: parsedJson.ticket_price,
        endTime: Number(parsedJson.end_time),
      };
    })
    .filter((pool): pool is NonNullable<typeof pool> => pool !== null) || [];

  const totalPrizePool = pools.reduce((acc, _) => acc + 0, 0); // Need real-time balance for accurate sum
  // For platform stats, we can just show active pool count and a placeholder or better estimate
  
  const scrollToDraws = () => {
    document.getElementById("active-draws")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen text-[#FFD700] font-sans selection:bg-[#FFD700] selection:text-black">
      <BackgroundFluid />

      {/* Header */}
      <nav className="fixed top-0 w-full z-50 border-b-2 border-[#FFD700]/50 bg-[#2a0000]/90 backdrop-blur-md shadow-[0_5px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 flex items-center justify-center bg-[#FFD700] rounded-sm shadow-[0_0_10px_#FFD700] animate-pulse">
                <span className="text-3xl">🐴</span>
             </div>
            <div className="flex flex-col">
                <span className="font-black text-xl tracking-widest text-[#FFD700] uppercase drop-shadow-md leading-none">
                SUI • LUCK
                </span>
                <span className="text-xs text-[#FFD700] tracking-[0.2em] font-serif">金馬獻瑞</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/create">
              <button className="hidden md:flex items-center gap-2 px-6 py-2 rounded-sm bg-[#FFD700] text-black border-2 border-[#FFFF00] font-bold uppercase tracking-wider hover:bg-[#FFFF00] transition-colors shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                <Plus className="w-5 h-5" />
                Create Draw (開局)
              </button>
            </Link>
            <ConnectModal trigger={
                <button className="px-6 py-2 rounded-sm border-2 border-[#FFD700] text-[#FFD700] font-bold uppercase tracking-wider hover:bg-[#FFD700] hover:text-black transition-all">
                    {account ? `${account.address.slice(0, 6)}...` : "Connect Wallet"}
                </button>
            } />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-44 pb-20 px-6 text-center">
        <div className="inline-block px-4 py-2 mb-6 border-2 border-[#FFD700] bg-black/50 rounded-full">
            <span className="text-[#FFD700] font-bold text-sm tracking-widest uppercase animate-pulse">★ 恭喜發財 • Good Fortune For All ★</span>
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFF00] via-[#FFD700] to-[#B8860B] drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
          LUCKY DRAW
        </h1>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 tracking-wider uppercase text-shadow">
          Year of the <span className="text-[#FFD700]">Golden Horse</span>
        </h2>
        
        <p className="text-xl text-[#FFD700]/80 max-w-2xl mx-auto mb-12 font-medium">
          2026 丙午马年 • Fully On-Chain • Fair & Transparent
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            {pools.length > 0 ? (
                 <JackpotButton onClick={scrollToDraws} className="text-2xl px-12 py-6">
                    EXPLORE DRAWS (寻找好运)
                 </JackpotButton>
            ) : (
                <Link href="/create">
                    <JackpotButton className="text-2xl px-12 py-6">
                        LAUNCH FIRST DRAW (第一个开局)
                    </JackpotButton>
                </Link>
            )}
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto p-8 rounded-2xl bg-black/40 border border-[#FFD700]/20 backdrop-blur-sm">
            <div className="flex flex-col">
                <span className="text-[#FFD700]/60 text-xs uppercase tracking-widest mb-1">Active Pools</span>
                <span className="text-3xl font-black text-white">{pools.length}</span>
            </div>
            <div className="flex flex-col border-x border-white/10 px-4">
                <span className="text-[#FFD700]/60 text-xs uppercase tracking-widest mb-1">Status</span>
                <span className="text-green-400 text-3xl font-black uppercase tracking-tighter">Live</span>
            </div>
            <div className="hidden md:flex flex-col">
                <span className="text-[#FFD700]/60 text-xs uppercase tracking-widest mb-1">Network</span>
                <span className="text-white text-3xl font-black uppercase tracking-tighter">Sui Testnet</span>
            </div>
        </div>
      </div>

      {/* Pools Grid */}
      <div id="active-draws" className="max-w-7xl mx-auto px-6 pb-24 scroll-mt-24">
        <div className="flex items-center justify-between mb-8 border-b-2 border-[#FFD700]/30 pb-4">
          <h2 className="text-3xl font-black flex items-center gap-2 uppercase tracking-widest text-[#FFD700]">
            <Trophy className="w-8 h-8 text-[#FFD700]" />
            Active Draws
          </h2>
          <div className="text-lg font-bold text-[#FFD700]/60">
            {pools.length} OPEN POOLS
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#FFD700] text-2xl font-black animate-bounce">LOADING FORTUNE...</div>
        ) : pools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 rounded-3xl bg-gradient-to-b from-[#3a0000] to-black border-2 border-dashed border-[#FFD700]/40 group hover:border-[#FFD700] transition-colors duration-500">
            <div className="w-20 h-20 mb-6 bg-[#FFD700]/10 rounded-full flex items-center justify-center border border-[#FFD700]/30 group-hover:scale-110 transition-transform">
                <Plus className="w-10 h-10 text-[#FFD700]/50 group-hover:text-[#FFD700]" />
            </div>
            <p className="text-2xl text-[#FFD700]/80 mb-8 font-bold text-center">No active luck found.<br/>Be the first to create one!</p>
            <Link href="/create">
              <JackpotButton className="px-10 py-5">START A LUCKY DRAW</JackpotButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pools.map((pool) => (
              <PoolCard key={pool.poolId} pool={pool} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
