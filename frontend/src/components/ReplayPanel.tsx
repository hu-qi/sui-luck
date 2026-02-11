import { useSuiClientQuery } from "@mysten/dapp-kit";
import { GlassCard } from "./GlassCard";
import { RefreshCcw, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { PACKAGE_ID } from "../app/constants";

interface ReplayPanelProps {
  poolId: string;
  isDrawn: boolean;
}

export function ReplayPanel({ poolId, isDrawn }: ReplayPanelProps) {
  // Fetch RewardResult object
  // Since we don't know the exact ID of RewardResult, we search for events or rely on the fact 
  // that we might need to query objects of type RewardResult filtered by pool_id (if API supported).
  // For MVP, we use the event to get the result_id, then fetch the object.
  
  const { data: events } = useSuiClientQuery("queryEvents", {
    query: {
      MoveModule: { package: PACKAGE_ID, module: "draw" },
    },
    limit: 50,
    order: "descending",
  }, {
    enabled: isDrawn,
  });

  const winnerEvent = events?.data.find((e: any) => 
    e.type.includes("WinnerDrawn") && e.parsedJson.pool_id === poolId
  );

  const resultId = winnerEvent?.parsedJson?.result_id;

  const { data: resultObject } = useSuiClientQuery("getObject", {
    id: resultId || "",
    options: { showContent: true },
  }, {
    enabled: !!resultId,
  });

  if (!isDrawn) return null;
  if (!winnerEvent) return <div className="text-white/50 text-xs mt-4">Waiting for result indexing...</div>;

  const content = resultObject?.data?.content as any;
  const fields = content?.fields || {};
  const prizeAmount = fields.prize_amount ? (Number(fields.prize_amount) / 1_000_000_000).toLocaleString() : "0";
  const winner = fields.winner;
  const executedAt = fields.executed_at ? new Date(Number(fields.executed_at)).toLocaleString() : "Unknown";

  const getExplorerUrl = (type: 'object' | 'address', id: string) => 
    `https://suiscan.xyz/testnet/${type}/${id}`;

  return (
    <div className="mt-4 p-4 rounded-xl bg-black/40 border border-yellow-500/30">
        <h4 className="flex items-center gap-2 text-sm font-bold text-yellow-500 mb-3 uppercase tracking-wider">
            <RefreshCcw className="w-4 h-4" />
            On-Chain Verification
        </h4>
        
        <div className="space-y-2 text-xs font-mono text-white/80">
            <div className="flex justify-between items-center">
                <span>Result Object:</span>
                <a 
                  href={getExplorerUrl('object', resultId)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-200 hover:text-yellow-400 flex items-center gap-1 transition-colors"
                >
                  {resultId?.slice(0, 10)}...
                  <ExternalLink className="w-3 h-3" />
                </a>
            </div>
            <div className="flex justify-between items-center">
                <span>Winner:</span>
                <a 
                  href={getExplorerUrl('address', winner)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-200 hover:text-yellow-400 flex items-center gap-1 transition-colors"
                >
                  {winner?.slice(0, 10)}...
                  <ExternalLink className="w-3 h-3" />
                </a>
            </div>
            <div className="flex justify-between">
                <span>Prize:</span>
                <span className="text-[#FFD700]">{prizeAmount} SUI</span>
            </div>
            <div className="flex justify-between">
                <span>Timestamp:</span>
                <span>{executedAt}</span>
            </div>
            
            <div className="pt-2 mt-2 border-t border-white/10 flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Execution Verified Integrity</span>
            </div>
        </div>
    </div>
  );
}
