"use client";

import { useSignAndExecuteTransaction, ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { PACKAGE_ID } from "../constants";
import { BackgroundFluid } from "@/components/BackgroundFluid";
import { GlassCard } from "@/components/GlassCard";
import { LiquidButton } from "@/components/LiquidButton";
import { ArrowLeft, Calendar, Coins, Type, Trophy, Plus } from "lucide-react";
import Link from "next/link";

export default function CreateDraw() {
  const router = useRouter();
  const account = useCurrentAccount();
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    price: "0.1",
    durationMinutes: "1440", // Default to 24 hours
  });

  const durationLabel = {
    "1": "1 分鐘 (測試)",
    "5": "5 分鐘",
    "10": "10 分鐘",
    "60": "1 小時",
    "360": "6 小時",
    "1440": "24 小時",
    "2880": "48 小時",
    "10080": "7 天",
  }[formData.durationMinutes];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
        toast.error("請先連接錢包");
        return;
    }
    
    setLoading(true);
    const toastId = toast.loading("正在初始化鏈上協定...");

    try {
      const tx = new Transaction();
      const priceMist = BigInt(Math.floor(parseFloat(formData.price) * 1_000_000_000));
      const durationMs = parseInt(formData.durationMinutes) * 60 * 1000;
      const endTime = BigInt(Date.now() + durationMs);

      tx.setSender(account.address);
      tx.setGasBudget(50_000_000);

      tx.moveCall({
        target: `${PACKAGE_ID}::draw::create_pool`,
        arguments: [
          tx.pure.string(formData.description),
          tx.pure.u64(priceMist.toString()), 
          tx.pure.u64(endTime.toString()),  
          tx.object("0x6"), // Clock
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            toast.success("馬到功成！活動已發佈", { id: toastId });
            queryClient.invalidateQueries({ queryKey: ["sui-client", "queryEvents"] });
            // Add a small delay for indexing
            setTimeout(() => {
              router.push("/");
            }, 2000);
          },
          onError: (error) => {
            toast.error(`啟動失敗: ${error.message}`, { id: toastId });
          },
          onSettled: () => setLoading(false),
        }
      );
    } catch (e: any) {
      toast.error(`錯誤: ${e.message}`, { id: toastId });
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-[#FFD700] font-sans flex items-center justify-center p-6">
      <BackgroundFluid />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding & Info */}
        <div className="space-y-8">
            <Link href="/" className="inline-flex items-center gap-2 text-[#FFD700]/50 hover:text-[#FFD700] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            返回首頁
            </Link>

            <div className="space-y-4">
                <div className="w-16 h-16 bg-[#FFD700] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.3)] animate-pulse">
                    <span className="text-4xl">🐴</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight text-white uppercase italic">
                    Launch <span className="text-[#FFD700]">Fortune</span>
                </h1>
                <p className="text-xl text-[#FFD700]/70 max-w-md font-medium">
                    基於 Sui 物件模型構建的去中心化活動基礎設施。規則透明，鏈上可查。
                </p>
            </div>

            <div className="space-y-4 pt-8 border-t border-[#FFD700]/20">
                <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-[#FFD700]/10 rounded-lg text-[#FFD700]"><Trophy className="w-5 h-5"/></div>
                    <div>
                        <h3 className="font-bold text-white uppercase tracking-wider">自動開獎協定</h3>
                        <p className="text-sm text-[#FFD700]/50">到達預設時間後，任何人均可點擊觸發，結果由 Sui Random 隨機產生。</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-green-500/10 rounded-lg text-green-500"><Plus className="w-5 h-5"/></div>
                    <div>
                        <h3 className="font-bold text-white uppercase tracking-wider">Keeper 激勵機制</h3>
                        <p className="text-sm text-[#FFD700]/50">觸發開獎的執行者將自動獲得獎池 1% 的 Gas 補償與獎勵。</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side: Form & Preview */}
        <div className="relative group">
            {/* Design Ornament */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-[#FFD700] rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            
            <GlassCard className="relative !p-8 border-2 border-[#FFD700]/40 rounded-[2rem]">
            <form onSubmit={handleCreate} className="space-y-8">
                
                {/* Description */}
                <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#FFD700]">
                    <Type className="w-4 h-4" />
                    活動名稱 (Event Name)
                </label>
                <input
                    type="text"
                    required
                    placeholder="例如：每日金馬大抽獎"
                    className="w-full bg-black/40 border border-[#FFD700]/20 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD700] transition-all shadow-inner"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Price */}
                    <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#FFD700]">
                        <Coins className="w-4 h-4" />
                        門票價格 (SUI)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        className="w-full bg-black/40 border border-[#FFD700]/20 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#FFD700] transition-all"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    </div>

                    {/* Duration */}
                    <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#FFD700]">
                        <Calendar className="w-4 h-4" />
                        持續時長
                    </label>
                    <div className="relative">
                        <select
                            className="w-full bg-black/40 border border-[#FFD700]/20 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#FFD700] transition-all appearance-none cursor-pointer"
                            value={formData.durationMinutes}
                            onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                        >
                            <option value="1">1 分鐘 (測試)</option>
                            <option value="5">5 分鐘</option>
                            <option value="10">10 分鐘</option>
                            <option value="60">1 小時</option>
                            <option value="360">6 小時</option>
                            <option value="1440">24 小時</option>
                            <option value="2880">48 小時</option>
                            <option value="10080">7 天</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFD700]/50">▼</div>
                    </div>
                    </div>
                </div>

                {/* Micro Preview */}
                <div className="p-4 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl">
                    <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold">
                        <span className="text-[#FFD700]/60 text-[10px]">Protocol Preview</span>
                        <span className="text-green-500">Immutable After Launch</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">{formData.price} SUI</span>
                        <span className="text-sm text-[#FFD700]/40">for {durationLabel}</span>
                    </div>
                </div>

                <div className="pt-2">
                {!account ? (
                    <ConnectModal trigger={
                        <button type="button" className="w-full py-4 rounded-xl bg-[#FFD700] text-black font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                            連接錢包開啟好運
                        </button>
                    } />
                ) : loading ? (
                  <button disabled className="w-full py-4 rounded-xl bg-white/10 text-white/50 font-black uppercase tracking-widest cursor-not-allowed">
                    正在寫入區塊鏈...
                  </button>
                ) : (
                    <LiquidButton type="submit" className="w-full justify-center !rounded-xl !py-4">
                    LAUNCH ACTIVITY (發佈活動)
                    </LiquidButton>
                )}
                </div>

                <p className="text-center text-[10px] text-white/30 uppercase tracking-tighter">
                發佈活動代表您同意去中心化協議。開獎過程由 Sui Random 自動執行，結果不可篡改。
                </p>
            </form>
            </GlassCard>
        </div>
      </div>
    </main>
  );
}
