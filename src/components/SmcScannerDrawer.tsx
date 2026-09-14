import React, { useState } from 'react';
import {
  Zap,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Crosshair,
  Bell,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  SmcScanResults,
  SmcOrderBlock,
  SmcFairValueGap,
  SmcLiquiditySweep,
  SmcStructureBreak,
  SmcLiquidityPool,
} from '../types/market';

interface SmcScannerDrawerProps {
  smcResults: SmcScanResults;
  symbol: string;
  currentPrice: number;
  highlightedId: string | null;
  onSelectStructure: (id: string | null) => void;
  onQuickOrder: (symbol: string, side: 'BUY' | 'SELL', price?: number) => void;
  onOpenAlert: (symbol: string, price: number) => void;
}

export const SmcScannerDrawer: React.FC<SmcScannerDrawerProps> = ({
  smcResults,
  symbol,
  currentPrice,
  highlightedId,
  onSelectStructure,
  onQuickOrder,
  onOpenAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'SWEEPS' | 'OB' | 'FVG' | 'STRUCTURE'>('ALL');
  const [isExpanded, setIsExpanded] = useState(true);

  const { orderBlocks, fairValueGaps, liquiditySweeps, structureBreaks, liquidityPools, activeSetupSummary } = smcResults;

  const totalStructures =
    orderBlocks.length + fairValueGaps.length + liquiditySweeps.length + structureBreaks.length + liquidityPools.length;

  return (
    <div className="bg-[#080d19] border-t border-slate-800/90 flex flex-col font-mono text-xs">
      {/* Header Bar with Institutional Bias & Collapse Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2 bg-gradient-to-r from-slate-950 via-slate-900 to-[#080d19] flex items-center justify-between cursor-pointer select-none hover:bg-slate-900/90 transition border-b border-slate-800/60"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-extrabold text-[11px] shadow-sm">
            <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>REAL-TIME SMC PATTERN SCANNER</span>
          </div>

          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Detected <strong className="text-white">{totalStructures}</strong> Institutional Structures
          </span>

          {/* Institutional Setup Bias Pill */}
          <div
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border ${
              activeSetupSummary.bias === 'BULLISH'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : activeSetupSummary.bias === 'BEARISH'
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            {activeSetupSummary.bias === 'BULLISH' ? (
              <TrendingUp className="h-3 w-3 text-emerald-400" />
            ) : activeSetupSummary.bias === 'BEARISH' ? (
              <TrendingDown className="h-3 w-3 text-rose-400" />
            ) : (
              <ShieldCheck className="h-3 w-3 text-slate-400" />
            )}
            <span>BIAS: {activeSetupSummary.bias}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-400 hidden md:block truncate max-w-[320px]">
            {activeSetupSummary.recommendedAction}
          </div>
          <button className="text-slate-400 hover:text-white transition p-1">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Drawer */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Filter Category Tabs & Quick Summary Stats */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                  activeTab === 'ALL' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({totalStructures})
              </button>
              <button
                onClick={() => setActiveTab('SWEEPS')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeTab === 'SWEEPS' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="h-3 w-3 text-amber-400" />
                Sweeps ({liquiditySweeps.length})
              </button>
              <button
                onClick={() => setActiveTab('OB')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeTab === 'OB' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="h-3 w-3 text-indigo-400" />
                Order Blocks ({orderBlocks.length})
              </button>
              <button
                onClick={() => setActiveTab('FVG')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeTab === 'FVG' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3 w-3 text-cyan-400" />
                FVGs ({fairValueGaps.length})
              </button>
              <button
                onClick={() => setActiveTab('STRUCTURE')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeTab === 'STRUCTURE' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crosshair className="h-3 w-3 text-emerald-400" />
                BOS / Pools ({structureBreaks.length + liquidityPools.length})
              </button>
            </div>

            {/* Live Recommendation Badge */}
            <div className="text-[11px] bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Key Reaction Level:</span>
              <strong className="text-cyan-300 font-bold">₹{activeSetupSummary.keyLevel.toFixed(2)}</strong>
            </div>
          </div>

          {/* Cards Grid of Detected SMC Structures */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {/* 1. LIQUIDITY SWEEPS */}
            {(activeTab === 'ALL' || activeTab === 'SWEEPS') &&
              liquiditySweeps.map(sweep => {
                const isSelected = highlightedId === sweep.id;
                const isBull = sweep.type === 'SSL_SWEEP';
                return (
                  <div
                    key={sweep.id}
                    onClick={() => onSelectStructure(isSelected ? null : sweep.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-950'
                        : isBull
                        ? 'bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-800/50'
                        : 'bg-rose-950/20 hover:bg-rose-950/40 border-rose-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isBull
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {sweep.type === 'SSL_SWEEP' ? '⚡ SSL SWEEP (DEMAND)' : '⚡ BSL SWEEP (SUPPLY)'}
                          </span>
                          {sweep.institutionalReaction && (
                            <span className="px-1 py-0.2 rounded text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                              INSTITUTIONAL
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">{sweep.createdTime}</span>
                      </div>

                      <div className="font-extrabold text-white text-xs mb-1">
                        {isBull ? 'Sell-Side Liquidity Swept' : 'Buy-Side Liquidity Swept'} @ ₹{sweep.levelSwept.toFixed(2)}
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-0.5 mb-2">
                        <div className="flex justify-between">
                          <span>Wick Extreme:</span>
                          <strong className={isBull ? 'text-emerald-400' : 'text-rose-400'}>
                            ₹{sweep.extremePrice.toFixed(2)}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Rejection Close:</span>
                          <span className="text-white">₹{sweep.rejectionClose.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onOpenAlert(symbol, sweep.levelSwept);
                        }}
                        className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1"
                        title="Set alert at swept level"
                      >
                        <Bell className="h-3 w-3" /> Alert
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onQuickOrder(symbol, isBull ? 'BUY' : 'SELL', sweep.rejectionClose);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm transition active:scale-95 ${
                            isBull ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                          }`}
                        >
                          Quick {isBull ? 'BUY (CE)' : 'SELL (PE)'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* 2. ORDER BLOCKS */}
            {(activeTab === 'ALL' || activeTab === 'OB') &&
              orderBlocks.map(ob => {
                const isSelected = highlightedId === ob.id;
                const isBull = ob.type === 'BULLISH_OB';
                return (
                  <div
                    key={ob.id}
                    onClick={() => onSelectStructure(isSelected ? null : ob.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-950'
                        : isBull
                        ? 'bg-slate-900/80 hover:bg-slate-850 border-emerald-800/40'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-rose-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            isBull
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isBull ? 'DEMAND ORDER BLOCK' : 'SUPPLY ORDER BLOCK'}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            ob.status === 'FRESH'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                              : ob.status === 'TESTED'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ob.status}
                        </span>
                      </div>

                      <div className="font-bold text-white text-xs mb-1">
                        Zone: ₹{ob.bottom.toFixed(1)} – ₹{ob.top.toFixed(1)}
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-0.5 mb-2">
                        <div className="flex justify-between">
                          <span>Mean Threshold (50% MT):</span>
                          <span className="text-cyan-300 font-bold">₹{ob.meanThreshold.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vol Displacement:</span>
                          <span className="text-slate-300">{ob.volumeScore}x ATR Volume</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onOpenAlert(symbol, ob.meanThreshold);
                        }}
                        className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1"
                      >
                        <Bell className="h-3 w-3" /> Set Alert
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onQuickOrder(symbol, isBull ? 'BUY' : 'SELL', ob.meanThreshold);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm transition active:scale-95 ${
                          isBull ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                        }`}
                      >
                        Trade {isBull ? 'Demand' : 'Supply'}
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* 3. FAIR VALUE GAPS */}
            {(activeTab === 'ALL' || activeTab === 'FVG') &&
              fairValueGaps.map(fvg => {
                const isSelected = highlightedId === fvg.id;
                const isBull = fvg.type === 'BULLISH_FVG';
                return (
                  <div
                    key={fvg.id}
                    onClick={() => onSelectStructure(isSelected ? null : fvg.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-950'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            isBull
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                              : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {isBull ? 'BULLISH FVG IMBALANCE' : 'BEARISH FVG IMBALANCE'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {fvg.status === 'FILLED' ? '100% Mitigated' : fvg.status === 'PARTIALLY_FILLED' ? `${fvg.fillPercent}% Filled` : 'Unfilled'}
                        </span>
                      </div>

                      <div className="font-bold text-white text-xs mb-1">
                        Imbalance: ₹{fvg.bottom.toFixed(1)} – ₹{fvg.top.toFixed(1)}
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-0.5 mb-2">
                        <div className="flex justify-between">
                          <span>Consequent Encroachment (50% CE):</span>
                          <span className="text-cyan-300 font-bold">₹{fvg.consequentEncroachment.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gap Size:</span>
                          <span className="text-slate-300">₹{(fvg.top - fvg.bottom).toFixed(2)} pts</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onOpenAlert(symbol, fvg.consequentEncroachment);
                        }}
                        className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1"
                      >
                        <Bell className="h-3 w-3" /> Alert CE
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onQuickOrder(symbol, isBull ? 'BUY' : 'SELL', fvg.consequentEncroachment);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm transition active:scale-95 ${
                          isBull ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-purple-600 hover:bg-purple-500'
                        }`}
                      >
                        Trade {isBull ? 'CE Fill' : 'Supply Fill'}
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* 4. STRUCTURE BREAKS & LIQUIDITY POOLS */}
            {(activeTab === 'ALL' || activeTab === 'STRUCTURE') && (
              <>
                {structureBreaks.map(bos => (
                  <div
                    key={bos.id}
                    onClick={() => onSelectStructure(highlightedId === bos.id ? null : bos.id)}
                    className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-850 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                          {bos.type.includes('BULLISH') ? 'BOS BULLISH BREAK' : 'BOS BEARISH BREAK'}
                        </span>
                        <span className="text-[10px] text-slate-500">{bos.createdTime}</span>
                      </div>
                      <div className="font-bold text-white text-xs mb-1">
                        Breakout Level: ₹{bos.level.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Market Structure shift confirming institutional trend continuation.
                      </div>
                    </div>
                    <div className="pt-2 mt-1 border-t border-slate-800/60 flex justify-end">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onQuickOrder(symbol, bos.type.includes('BULLISH') ? 'BUY' : 'SELL', bos.level);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        Follow Trend
                      </button>
                    </div>
                  </div>
                ))}

                {liquidityPools.map(pool => (
                  <div
                    key={pool.id}
                    onClick={() => onSelectStructure(highlightedId === pool.id ? null : pool.id)}
                    className="p-2.5 rounded-lg border border-amber-900/40 bg-amber-950/10 hover:bg-amber-950/20 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {pool.type === 'EQH' ? '$$$ EQUAL HIGHS POOL' : '$$$ EQUAL LOWS POOL'}
                        </span>
                        <span className="text-[10px] text-slate-500">{pool.createdTime}</span>
                      </div>
                      <div className="font-bold text-amber-200 text-xs mb-1">
                        Liquidity Magnet: ₹{pool.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Retail stop cluster. High probability of sweep prior to directional expansion.
                      </div>
                    </div>
                    <div className="pt-2 mt-1 border-t border-slate-800/60 flex justify-end">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onOpenAlert(symbol, pool.price);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 hover:bg-amber-500 text-white"
                      >
                        Alert on Sweep
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
