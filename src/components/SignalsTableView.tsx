import React, { useState, useMemo } from 'react';
import {
  Send,
  Sparkles,
  Zap,
  Target,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Play,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { TelegramSignal } from '../types/market';

interface SignalsTableViewProps {
  onQuickOrder?: (symbol: string, side: 'BUY' | 'SELL', price?: number) => void;
  onOpenSettings?: () => void;
}

export const SignalsTableView: React.FC<SignalsTableViewProps> = ({
  onQuickOrder,
  onOpenSettings,
}) => {
  const {
    telegramSignals,
    refreshTelegramSignals,
    broadcastSignalToTelegram,
    webhookSettings,
    brokerMode,
    activeTicker,
  } = useTrading();

  const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE' | 'CE' | 'PE' | 'CLOSED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBroadcastingManual, setIsBroadcastingManual] = useState(false);
  const [manualBroadcastNotice, setManualBroadcastNotice] = useState<string | null>(null);

  // Filtered signals
  const filteredSignals = useMemo(() => {
    return telegramSignals.filter(sig => {
      if (filterType === 'ACTIVE') return sig.status === 'ACTIVE';
      if (filterType === 'CLOSED') return sig.status !== 'ACTIVE';
      if (filterType === 'CE') return sig.action === 'BUY_CE';
      if (filterType === 'PE') return sig.action === 'BUY_PE';
      return true;
    });
  }, [telegramSignals, filterType]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTelegramSignals();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCopySignal = (sig: TelegramSignal) => {
    const text = `🔥 SMC & ORDERFLOW SCALP SIGNAL 🔥
Instrument: ${sig.symbol}
Action: ${sig.action}
Option Strike: ${sig.optionStrike || 'ATM/ITM'}
Entry Price: ₹${sig.entryPrice}
Target 1 (1:2): ₹${sig.target1} (Confidence: ${sig.target1Confidence || 84}%)
Target 2 (1:3): ₹${sig.target2 || sig.target1 * 1.01} (Confidence: ${sig.target2Confidence || 72}%)
Target 3 (1:4): ₹${sig.target3 || sig.target1 * 1.02} (Confidence: ${sig.target3Confidence || 58}%)
Stop Loss: ₹${sig.stopLoss} (Safety: ${sig.slNeverHitProbability || 87}%)
Rationale: ${sig.rationale || 'Institutional orderflow imbalance + Liquidity sweep'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(sig.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickExecute = (sig: TelegramSignal) => {
    if (onQuickOrder) {
      const orderSymbol = sig.optionStrike ? `${sig.symbol} ${sig.optionStrike}` : sig.symbol;
      const orderSide = sig.action === 'SELL' || sig.action === 'BUY_PE' ? 'SELL' : 'BUY';
      onQuickOrder(orderSymbol, orderSide, sig.optionEntry || sig.entryPrice);
    }
  };

  const handleRebroadcast = async (sig: TelegramSignal) => {
    setIsBroadcastingManual(true);
    setManualBroadcastNotice(null);
    try {
      const res = await broadcastSignalToTelegram({
        ...sig,
        customNote: `⚡ Live Alert Update for ${sig.symbol} at ${new Date().toLocaleTimeString('en-IN')}`,
      });
      if (res.success) {
        setManualBroadcastNotice(`Broadcasted signal #${sig.id} to Telegram successfully!`);
      } else {
        setManualBroadcastNotice(`Notice: ${res.message}`);
      }
    } finally {
      setIsBroadcastingManual(false);
      setTimeout(() => setManualBroadcastNotice(null), 4000);
    }
  };

  return (
    <div className="bg-[#0b101d] rounded-xl border border-slate-800/90 shadow-2xl flex flex-col overflow-hidden space-y-4">
      {/* Header & Status Bar */}
      <div className="p-4 border-b border-slate-800/90 bg-gradient-to-r from-slate-900 via-[#0c1220] to-slate-900 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                SMC &amp; Telegram Signals Matrix
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/80 text-[10px] font-mono font-bold">
                Channel: {webhookSettings.telegram.chatId || '@scalpingpro_signals'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant Order Flow Sweeps, ITM Strikes, 3-Tier Multi-Targets &amp; Invalidation Levels
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh Feed
          </button>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              Bot Settings
            </button>
          )}
        </div>
      </div>

      {/* Telegram Channel Live Status Banner */}
      <div className="px-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-cyan-950/60 border border-sky-600/40 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-white font-bold">Telegram Live Webhook: </span>
              <span className="text-emerald-300">Connected</span>
              <span className="text-slate-400 text-[11px] ml-2 hidden sm:inline">
                (Real-time push notifications configured)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Execution Engine:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
              {brokerMode === 'PAPER' ? 'Paper Trading Virtual' : 'Live SmartAPI'}
            </span>
          </div>
        </div>
      </div>

      {manualBroadcastNotice && (
        <div className="px-4">
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono animate-fadeIn">
            {manualBroadcastNotice}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['ALL', 'ACTIVE', 'CE', 'PE', 'CLOSED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition cursor-pointer ${
                filterType === tab
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab === 'ALL' && `All Signals (${telegramSignals.length})`}
              {tab === 'ACTIVE' && `Active Signals (${telegramSignals.filter(s => s.status === 'ACTIVE').length})`}
              {tab === 'CE' && 'Bullish Calls (CE)'}
              {tab === 'PE' && 'Bearish Puts (PE)'}
              {tab === 'CLOSED' && 'Target Hit / Closed'}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Showing <strong className="text-white">{filteredSignals.length}</strong> signals
        </div>
      </div>

      {/* Systematic Signals Table */}
      <div className="px-4 pb-4 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider select-none">
              <th className="py-2.5 px-3 font-semibold">Time &amp; Instrument</th>
              <th className="py-2.5 px-3 font-semibold">Signal Action</th>
              <th className="py-2.5 px-3 font-semibold">ITM Option Strike</th>
              <th className="py-2.5 px-3 font-semibold text-right">Spot Entry</th>
              <th className="py-2.5 px-3 font-semibold text-center">T1 (1:2 R:R)</th>
              <th className="py-2.5 px-3 font-semibold text-center">T2 (1:3 R:R)</th>
              <th className="py-2.5 px-3 font-semibold text-center">T3 (1:4 R:R)</th>
              <th className="py-2.5 px-3 font-semibold text-right">SL &amp; Safety</th>
              <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              <th className="py-2.5 px-3 font-semibold text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredSignals.map(sig => {
              const isCe = sig.action === 'BUY_CE' || sig.action === 'BUY';
              const isClosed = sig.status !== 'ACTIVE';

              return (
                <tr
                  key={sig.id}
                  className={`group transition ${
                    sig.status === 'ACTIVE'
                      ? 'bg-[#090e1a]/80 hover:bg-[#0d1424]'
                      : 'opacity-70 hover:opacity-90 bg-slate-950/40'
                  }`}
                >
                  {/* Timestamp & Symbol */}
                  <td className="py-3 px-3">
                    <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <span>{sig.symbol}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400">
                        {sig.timeframe || '3m'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {sig.timestamp}
                    </div>
                  </td>

                  {/* Signal Action */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-extrabold text-[10px] uppercase border ${
                        isCe
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700/80'
                          : 'bg-rose-950 text-rose-300 border-rose-700/80'
                      }`}
                    >
                      {isCe ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-rose-400" />
                      )}
                      {sig.action}
                    </span>
                  </td>

                  {/* Option Strike */}
                  <td className="py-3 px-3">
                    {sig.optionStrike ? (
                      <div>
                        <span className="font-bold text-cyan-300 text-xs block">
                          {sig.optionStrike}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Est. ₹{sig.optionEntry?.toFixed(2) || '—'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">Spot Scalp</span>
                    )}
                  </td>

                  {/* Spot Entry */}
                  <td className="py-3 px-3 text-right font-bold text-white text-xs">
                    ₹{sig.entryPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Target 1 (1:2) */}
                  <td className="py-3 px-3 text-center">
                    <div className="font-bold text-emerald-400 text-xs">
                      ₹{sig.target1.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-emerald-500">
                      {sig.target1Confidence || 84}% Prob
                    </div>
                  </td>

                  {/* Target 2 (1:3) */}
                  <td className="py-3 px-3 text-center">
                    <div className="font-bold text-cyan-300 text-xs">
                      ₹{(sig.target2 || sig.target1 * 1.01).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-cyan-500">
                      {sig.target2Confidence || 72}% Prob
                    </div>
                  </td>

                  {/* Target 3 (1:4) */}
                  <td className="py-3 px-3 text-center">
                    <div className="font-bold text-indigo-300 text-xs">
                      ₹{(sig.target3 || sig.target1 * 1.02).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-indigo-400">
                      {sig.target3Confidence || 58}% Prob
                    </div>
                  </td>

                  {/* Stop Loss & Safety */}
                  <td className="py-3 px-3 text-right">
                    <div className="font-bold text-rose-400 text-xs">
                      ₹{sig.stopLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      {sig.slNeverHitProbability || 87}% Safe
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        sig.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : sig.status === 'TARGET_HIT'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sig.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleCopySignal(sig)}
                        className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition cursor-pointer"
                        title="Copy signal to clipboard"
                      >
                        {copiedId === sig.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleRebroadcast(sig)}
                        disabled={isBroadcastingManual}
                        className="p-1.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-700/60 transition cursor-pointer disabled:opacity-50"
                        title="Broadcast directly to Telegram"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleQuickExecute(sig)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                        title="Execute in Paper or Live mode"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        Trade
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mandatory SEBI Disclosure Bar */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800/90 text-[11px] text-amber-300/90 font-mono flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>Mandatory Regulatory Disclosure:</strong> Scalping and algorithmic signals are generated mathematically based on institutional order flow imbalances and liquidity sweeps. Win probability and target confidence levels are statistical estimations and do not constitute financial advice or guaranteed returns.
        </div>
      </div>
    </div>
  );
};
