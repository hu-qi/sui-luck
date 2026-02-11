import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Ticket, Clock, Trophy, User, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PACKAGE_ID } from "../app/constants";
import { GoldCard } from "./GoldCard";
import { JackpotButton } from "./JackpotButton";
import { ReplayPanel } from "./ReplayPanel";

// Status Constants
const STATUS_ACTIVE = 1;
const STATUS_CLOSED = 2;
const STATUS_DRAWN = 3;

interface PoolInitialData {
  poolId: string;
  creator: string;
  description: string;
  ticketPrice: string;
  endTime: number;
}

interface PoolCardProps {
  pool: PoolInitialData;
}

export function PoolCard({ pool }: PoolCardProps) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [buying, setBuying] = useState(false);
  const [executing, setExecuting] = useState(false);

  // Fetch Real-time Pool Data
  const { data: objectData, refetch } = useSuiClientQuery("getObject", {
    id: pool.poolId,
    options: { showContent: true },
  }, {
    refetchInterval: 5000,
  });

  const content = objectData?.data?.content as any;
  const fields = content?.fields || {};
  
  const participants = (fields.participants as string[]) || [];
  const balance = fields.reward_balance || "0"; 
  const status = fields.status || 0; 
  
  // Fetch Winner Event if Drawn
  const { data: winnerEvents } = useSuiClientQuery("queryEvents", {
    query: {
      MoveModule: { package: PACKAGE_ID, module: "draw" },
    },
  }, {
    enabled: status === STATUS_DRAWN,
  });

  const winnerEvent = winnerEvents?.data.find((e: any) => e.parsedJson.pool_id === pool.poolId && e.type.includes("WinnerDrawn"));
  const winner = winnerEvent?.parsedJson?.winner;

  const myTickets = account 
    ? participants.filter(p => p.toLowerCase() === account.address.toLowerCase()).length 
    : 0;

  useEffect(() => {
    if (participants.length > 0) {
      console.log("Pool Participants:", participants);
      console.log("My Address:", account?.address);
    }
  }, [participants, account]);
  
  const poolBalance = (Number(balance) / 1_000_000_000).toLocaleString();

  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const distance = pool.endTime - now;

      if (distance <= 0) {
        setTimeLeft("00:00:00");
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      const h = Math.floor(distance / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [pool.endTime]);

  const buyTicket = async () => {
    if (!account) {
        toast.error("Please connect your wallet");
        return;
    }
    
    setBuying(true);
    const toastId = toast.loading("Processing ticket purchase...");

    try {
      const tx = new Transaction();
      // Lower gas budget to 20M MIST (0.02 SUI) to be more balance-friendly
      tx.setGasBudget(20_000_000);

      const ticketPriceStr = pool.ticketPrice.toString();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(ticketPriceStr)]);
      
      tx.moveCall({
        target: `${PACKAGE_ID}::draw::join_pool`,
        arguments: [
          tx.object(pool.poolId),
          coin,
          tx.object("0x6"), // Clock
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            const status = result.effects?.status?.status;
            console.log("Transaction Result:", result);

            if (status === "success") {
              toast.success("Good Luck! 🐴 Your ticket is ready!", { id: toastId });
              
              // Exponential backoff or multiple retries for indexing lag
              let retries = 0;
              const interval = setInterval(() => {
                refetch();
                retries++;
                if (retries > 3) clearInterval(interval);
              }, 2000);
            } else {
              const errMsg = result.effects?.status?.error || "Transaction failed on-chain";
              toast.error(`Chain Error: ${errMsg}`, { id: toastId });
            }
            setBuying(false);
          },
          onError: (error: any) => {
             console.error("Transaction Error:", error);
             const errorMsg = error.message || "";
             if (errorMsg.includes("InsufficientBalance") || errorMsg.includes("gas balance")) {
                 toast.error("Insufficient Balance! Need more SUI for Gas.", { id: toastId });
             } else {
                 toast.error(`Purchase failed: ${error.shortMessage || error.message || "User rejected"}`, { id: toastId });
             }
             setBuying(false);
          }
        }
      );
    } catch (e: any) {
      console.error("Construction error:", e);
      toast.error(`Setup failed: ${e.message}`, { id: toastId });
      setBuying(false);
    }
  };

  const executeDraw = async () => {
    if (!account) {
        toast.error("Please connect your wallet");
        return;
    }
    
    setExecuting(true);
    const toastId = toast.loading("Executing Draw on-chain...");

    try {
      const tx = new Transaction();
      tx.setGasBudget(100_000_000);
      
      tx.moveCall({
        target: `${PACKAGE_ID}::draw::execute_draw`,
        arguments: [
          tx.object(pool.poolId),
          tx.object("0x6"), // Clock
          tx.object("0x8"), // Random
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Draw success:", result);
            toast.success("Draw completed! 🎉", { id: toastId });
            setTimeout(() => refetch(), 1500);
            setExecuting(false);
          },
          onError: (error) => {
             console.error("Draw failed:", error);
             toast.error(`Execution failed: ${error.message}`, { id: toastId });
             setExecuting(false);
          }
        }
      );
    } catch (e: any) {
      console.error("Execution error:", e);
      toast.error(`Draw failed: ${e.message}`, { id: toastId });
      setExecuting(false);
    }
  };

  const isEnded = status === STATUS_DRAWN || status === STATUS_CLOSED;
  const isDrawn = status === STATUS_DRAWN;
  const isReadyToDraw = !isEnded && isExpired;

  return (
    <GoldCard className="flex flex-col h-full hover:scale-[1.02] transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 rounded-full bg-[#FFD700] border-4 border-yellow-300 flex items-center justify-center shadow-lg">
          <DollarSign className="w-8 h-8 text-red-900" />
        </div>
        <div className={`px-4 py-1 rounded-sm text-sm font-black uppercase tracking-widest border-2 ${
          isEnded || (isReadyToDraw && participants.length === 0)
            ? "bg-gray-800 border-gray-600 text-gray-400" 
            : isReadyToDraw 
              ? "bg-yellow-500 border-yellow-300 text-black animate-bounce"
              : "bg-red-600 border-red-400 text-white animate-pulse"
        }`}>
          {isEnded || (isReadyToDraw && participants.length === 0) ? "ENDED" : isReadyToDraw ? "READY TO DRAW" : "LIVE"}
        </div>
      </div>

      <h3 className="text-2xl font-black text-[#FFD700] mb-2 uppercase tracking-wide drop-shadow-md line-clamp-1" title={pool.description}>
        {pool.description}
      </h3>
      <p className="text-xs text-yellow-600 mb-6 font-mono truncate border-b border-white/10 pb-2">REF: {pool.poolId.slice(0, 8)}</p>
      
      <div className="space-y-3 mb-8 flex-grow">
        {/* Ticket Price */}
        <div className="flex items-center justify-between text-sm p-3 bg-red-950/50 border border-yellow-900/30 rounded">
          <span className="text-yellow-600">ENTRY COST</span>
          <span className="font-mono font-bold text-xl text-white">{(Number(pool.ticketPrice) / 1_000_000_000)} SUI</span>
        </div>

        {/* Prize Pool */}
        <div className="flex items-center justify-between text-sm p-3 bg-red-950/50 border border-yellow-900/30 rounded">
          <span className="text-yellow-600 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFD700]" />
            JACKPOT
          </span>
          <span className="font-black text-2xl text-[#FFD700] text-gold-gradient">{poolBalance} SUI</span>
        </div>

        {/* My Tickets */}
        {account && (
          <div className="flex items-center justify-between text-sm p-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded">
            <span className="text-[#FFD700] flex items-center gap-2">
              <User className="w-4 h-4" />
              YOUR TICKETS
            </span>
            <span className="font-bold text-white text-lg">{myTickets}</span>
          </div>
        )}

        {/* End Time */}
        <div className="flex items-center justify-between text-sm px-1 text-yellow-500/80">
          <span>{isReadyToDraw ? "READY SINCE" : isEnded || (isReadyToDraw && participants.length === 0) ? "CLOSED AT" : "CLOSES IN"}</span>
          <span className="flex items-center gap-1 font-mono font-bold text-white">
            <Clock className="w-3 h-3 text-yellow-500" />
            {!isEnded && !isReadyToDraw ? timeLeft : new Date(pool.endTime).toLocaleString()}
          </span>
        </div>
      </div>

      {isReadyToDraw ? (
        <JackpotButton
          onClick={executeDraw}
          disabled={executing || participants.length === 0}
          className={`w-full !from-red-600 !to-red-900 !text-white ${participants.length === 0 ? 'opacity-50 cursor-not-allowed !from-gray-700 !to-gray-900' : ''}`}
        >
          {executing ? "DRAWING..." : participants.length === 0 ? "ACTIVITY ENDED" : "TRIGGER DRAW"}
        </JackpotButton>
      ) : !isEnded ? (
        <JackpotButton
          onClick={buyTicket}
          disabled={buying}
          className="w-full"
        >
          {buying ? "PROCESSING..." : "BUY TICKET"}
        </JackpotButton>
      ) : (
        <div className="w-full">
            <div className="w-full py-4 bg-black/40 text-center text-yellow-600 font-bold border border-yellow-900/50 uppercase">
                 WINNER: {winner ? `${winner.slice(0,6)}...${winner.slice(-4)}` : "PENDING..."}
            </div>
            {isDrawn && <ReplayPanel poolId={pool.poolId} isDrawn={isDrawn} />}
        </div>
      )}
    </GoldCard>
  );
}

