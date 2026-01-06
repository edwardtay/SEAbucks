"use client";

import { TrendingUp, DollarSign, Users, Zap } from "lucide-react";

interface MerchantStatsProps {
  // In production, these would come from blockchain indexer
  totalVolume?: number;
  transactionCount?: number;
  uniquePayers?: number;
  avgTransactionSize?: number;
}

export function MerchantStats({
  totalVolume = 0,
  transactionCount = 0,
  uniquePayers = 0,
  avgTransactionSize = 0,
}: MerchantStatsProps) {
  const stats = [
    {
      label: "Total Volume",
      value: totalVolume > 0 ? `$${totalVolume.toLocaleString()}` : "$0",
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Transactions",
      value: transactionCount.toString(),
      icon: Zap,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Unique Payers",
      value: uniquePayers.toString(),
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Avg. Size",
      value: avgTransactionSize > 0 ? `$${avgTransactionSize.toFixed(2)}` : "$0",
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-slate-900/40 border border-slate-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <div className="text-xl font-bold text-white">{stat.value}</div>
          <div className="text-xs text-slate-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Compact version for sidebar
export function CompactStats({ volume, count }: { volume: number; count: number }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <DollarSign className="w-4 h-4 text-green-400" />
        <span className="text-white font-medium">${volume.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-1">
        <Zap className="w-4 h-4 text-blue-400" />
        <span className="text-white font-medium">{count} txns</span>
      </div>
    </div>
  );
}
