import React, { useState, useEffect } from 'react';
import {
  Zap,
  Target,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Crosshair,
  TrendingUp,
  Percent,
  Play,
  RotateCcw,
  Sliders,
  Check,
  X,
  FileText
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { evaluateSmcLiquiditySweepStrategy } from '../utils/smcStrategyEngine';
import { SMCStrategySignal, SMCStrikeCandidate } from '../types/market';
import { SmcBacktestModal } from './SmcBacktestModal';
import { BarChart2 } from 'lucide-react';

export const SmcStrategyCard: React.FC = () => {
  const {
    activeTicker,
    brokerMode,
    placeOrder,
    webhookSettings,
    broadcastSignalToTelegram,
    cashBalance,
  } = useTrading();

  const [setupMode, setSetupMode] = useState<'LOWER_SWEEP' | 'UPPER_SWEEP' | 'NO_TRADE_DEMO'>('LOWER_SWEEP');
  const [backtestModalOpen, setBacktestModalOpen] = useState<boolean>(false);
  const [smcSignal, setSmcSignal] = useState<SMCStrategySignal>(() =>
    evaluateSmcLiquiditySweepStrategy({
      symbol: activeTicker.symbol,
      spot: activeTicker.ltp,
      bias: 'BULLISH',
      forceSetup: 'LOWER_SWEEP',
      accountCapital: cashBalance || 250000,
    })
  );

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);
  const [selectedStrikeCandidate, setSelectedStrikeCandidate] = useState<SMCStrikeCandidate | null>(null);

  // Recalculate SMC signal whenever activeTicker or setupMode changes
  useEffect(() => {
    const res = evaluateSmcLiquiditySweepStrategy({
      symbol: activeTicker.symbol,
      spot: activeTicker.ltp,
      bias: setupMode === 'UPPER_SWEEP' ? 'BEARISH' : 'BULLISH',
      forceSetup: setupMode,
      accountCapital: cashBalance || 250000,
    });
    setSmcSignal(res);
    setSelectedStrikeCandidate(res.strikeRanking[0] || null);
  }, [activeTicker.symbol, activeTicker.ltp, setupMode, cashBalance]);

  const handleBroadcastSmc = async () => {
    setIsBroadcasting(true);
    setBroadcastFeedback(null);
    try {
      const res = await broadcastSignalToTelegram({
        symbol: smcSignal.underlying,
        action: smcSignal.decision === 'BUY_CE' ? 'BUY_CE' : smcSignal.decision === 'BUY_PE' ? 'BUY_PE' : 'STRATEGY',
        strategyName: `Liquidity Sweep + Order Flow Scalp (ICT/SMC)`,
        entryPrice: smcSignal.entryUnderlying,
        target1: smcSignal.target1Underlying,
        target2: smcSignal.target2Underlying,
        target3: smcSignal.target3Underlying,
        target1Rr: smcSignal.rrT1,
        target2Rr: smcSignal.rrT2,
        target3Rr: smcSignal.rrT3,
        target1Confidence: smcSignal.confidenceT1,
        target2Confidence: smcSignal.confidenceT2,
        target3Confidence: smcSignal.confidenceT3,
        slNeverHitProbability: smcSignal.slSafetyConfidence,
        scalpingConfidence: smcSignal.scalpingConfidence,
        stopLoss: smcSignal.stopUnderlying,
        riskReward: '1 : 2.5 (Dynamic Scalp)',
        winProbabilityPercent: smcSignal.scalpingConfidence,
        timeframe: '3m Entry / 5m Sweep Context',
        rationale: smcSignal.reason,
        optionStrike: smcSignal.optionSymbol,
        optionType: smcSignal.optionType,
        optionEntry: smcSignal.entryOption,
        optionSl: smcSignal.stopOption,
        optionT1: smcSignal.target1Option,
        optionT2: smcSignal.target2Option,
        optionT3: smcSignal.target3Option,
        smcDetails: smcSignal,
        channel: webhookSettings.telegram.chatId,
      });

      setBroadcastFeedback(`✅ SMC Trade Signal broadcasted to ${webhookSettings.telegram.chatId || '@scalpingpro_signals'} successfully!`);
      setTimeout(() => setBroadcastFeedback(null), 6000);
    } catch (err: any) {
      setBroadcastFeedback(`⚠️ Broadcast error: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleExecuteSmc = () => {
    if (smcSignal.decision === 'NO_TRADE') {
      setBroadcastFeedback('⛔ Cannot execute: Trade setup violates hard risk rules.');
      setTimeout(() => setBroadcastFeedback(null), 4000);
      return;
    }

    const orderRes = placeOrder({
      symbol: smcSignal.optionSymbol,
      side: 'BUY',
      type: 'MARKET',
      product: 'NRML',
      quantity: smcSignal.quantity || activeTicker.lotSize,
    });

    if (orderRes.success) {
      setBroadcastFeedback(`⚡ Executed ${smcSignal.lots} Lot(s) of ${smcSignal.optionSymbol} @ ~₹${smcSignal.entryOption.toFixed(2)} in ${brokerMode} mode!`);
    } else {
      setBroadcastFeedback(`⚠️ Execution failed: ${orderRes.message}`);
    }
    setTimeout(() => setBroadcastFeedback(null), 5000);
  };

  const isBuyCe = smcSignal.decision === 'BUY_CE';
  const isNoTrade = smcSignal.decision === 'NO_TRADE';

  return (
    <div className="space-y-4">
      {/* Top Controller: Setup Trigger Simulator */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Smart Money Concept (SMC) &amp; Liquidity Imbalance Engine
            </span>
            <div className="text-[11px] text-slate-400">
              11-Step Master Quant Algorithm: Sweeps, Structure Shift (CHoCH), Delta Absorption, ITM Option Strike Selection
            </div>
          </div>
        </div>

        {/* Setup Simulation Selector & Backtest Trigger */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-[10px] text-slate-500 px-1.5 font-sans font-medium">Test Setup:</span>
          <button
            onClick={() => setSetupMode('LOWER_SWEEP')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              setupMode === 'LOWER_SWEEP'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="h-3 w-3" />
            Lower Sweep (Buy ITM CE)
          </button>
          <button
            onClick={() => setSetupMode('UPPER_SWEEP')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              setupMode === 'UPPER_SWEEP'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="h-3 w-3" />
            Upper Sweep (Buy ITM PE)
          </button>
          <button
            onClick={() => setSetupMode('NO_TRADE_DEMO')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              setupMode === 'NO_TRADE_DEMO'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <X className="h-3 w-3" />
            No-Trade Matrix Test
          </button>

          <button
            onClick={() => setBacktestModalOpen(true)}
            className="px-3 py-1 rounded-md text-xs font-bold bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/60 text-indigo-300 transition flex items-center gap-1.5 ml-1 cursor-pointer shadow-sm shadow-indigo-950"
          >
            <BarChart2 className="h-3.5 w-3.5 text-indigo-400" />
            Backtest Tick Data
          </button>
        </div>
      </div>

      {/* Main SMC Analysis Board */}
      <div className={`p-4 rounded-xl border shadow-xl space-y-4 ${
        isNoTrade
          ? 'bg-amber-950/20 border-amber-800/80'
          : isBuyCe
          ? 'bg-gradient-to-b from-[#06141a] to-[#071018] border-cyan-800/70'
          : 'bg-gradient-to-b from-[#18090f] to-[#11070c] border-rose-800/70'
      }`}>
        {/* Header Summary */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-extrabold uppercase tracking-wider border ${
                isNoTrade
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : isBuyCe
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-rose-950 text-rose-300 border-rose-700'
              }`}>
                {isNoTrade ? '⛔ NO TRADE (VIOLATION)' : isBuyCe ? '🟢 BUY ITM CALL (CE) SCALP' : '🔴 BUY ITM PUT (PE) SCALP'}
              </span>
              <span className="text-sm font-bold text-white tracking-wide">
                {smcSignal.optionSymbol}
              </span>
              <span className="text-xs font-mono text-slate-400">
                (Spot: ₹{smcSignal.spot.toFixed(2)})
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-3xl">
              {smcSignal.reason}
            </p>
          </div>

          {/* Scalping Alpha & SL Safety Badges */}
          <div className="flex items-center gap-3 text-right font-mono">
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Scalp Alpha Score
              </div>
              <div className="text-xl font-extrabold text-cyan-400">
                {smcSignal.scalpingConfidence}%
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/90 border border-emerald-900/60">
              <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center justify-end gap-1">
                <CheckCircle2 className="h-3 w-3" />
                SL Safety / Never-Hit
              </div>
              <div className="text-xl font-extrabold text-emerald-400">
                {smcSignal.slSafetyConfidence}%
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Tier Targets & Stop Loss Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 font-mono text-xs">
          {/* Entry & Stop Loss */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans font-bold">
              <span>ENTRY &amp; STRUCTURAL SL</span>
              <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-slate-400 text-[11px]">Option Entry:</span>
              <span className="text-white font-extrabold text-sm">₹{smcSignal.entryOption.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline justify-between text-rose-400">
              <span className="text-[11px]">Option Stop Loss:</span>
              <span className="font-extrabold">₹{smcSignal.stopOption.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
              <span>Spot Entry: ₹{smcSignal.entryUnderlying}</span>
              <span>SL: ₹{smcSignal.stopUnderlying}</span>
            </div>
          </div>

          {/* Target 1 (1:2 R:R) */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-800/60 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-sans font-bold">
              <span>TARGET 1 (1:2 R:R)</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">
                {smcSignal.confidenceT1}% Conf
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-slate-400 text-[11px]">Option Target:</span>
              <span className="text-emerald-300 font-extrabold text-sm">₹{smcSignal.target1Option.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline justify-between text-slate-300">
              <span className="text-[11px]">Est. Profit / Lot:</span>
              <span className="font-extrabold text-emerald-400">+₹{smcSignal.rewardAmountT1.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
              <span>Spot: ₹{smcSignal.target1Underlying}</span>
              <span>1:2 Risk-Reward</span>
            </div>
          </div>

          {/* Target 2 (1:3 R:R) */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-800/60 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-cyan-400 font-sans font-bold">
              <span>TARGET 2 (1:3 R:R)</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px]">
                {smcSignal.confidenceT2}% Conf
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-slate-400 text-[11px]">Option Target:</span>
              <span className="text-cyan-300 font-extrabold text-sm">₹{smcSignal.target2Option.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline justify-between text-slate-300">
              <span className="text-[11px]">Est. Profit / Lot:</span>
              <span className="font-extrabold text-cyan-400">+₹{smcSignal.rewardAmountT2.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
              <span>Spot: ₹{smcSignal.target2Underlying}</span>
              <span>1:3 Risk-Reward</span>
            </div>
          </div>

          {/* Target 3 (1:4 R:R) */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-800/60 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-indigo-400 font-sans font-bold">
              <span>TARGET 3 (1:4 R:R)</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px]">
                {smcSignal.confidenceT3}% Conf
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-slate-400 text-[11px]">Option Target:</span>
              <span className="text-indigo-300 font-extrabold text-sm">₹{smcSignal.target3Option.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline justify-between text-slate-300">
              <span className="text-[11px]">Est. Profit / Lot:</span>
              <span className="font-extrabold text-indigo-400">+₹{smcSignal.rewardAmountT3.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
              <span>Spot: ₹{smcSignal.target3Underlying}</span>
              <span>1:4 Runner Scalp</span>
            </div>
          </div>
        </div>

        {/* ITM Option Strike Selection & Ranking Engine Table */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                ITM Option Strike Selection &amp; Ranking Engine
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Ranking Score Formula: ITM Fit + Delta (0.60–0.75) + Liquidity + Spread - Slippage Risk
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-1.5 px-2">Rank / Strike</th>
                  <th className="py-1.5 px-2">Type</th>
                  <th className="py-1.5 px-2">Delta</th>
                  <th className="py-1.5 px-2">LTP</th>
                  <th className="py-1.5 px-2">IV</th>
                  <th className="py-1.5 px-2">Spread</th>
                  <th className="py-1.5 px-2">OI &amp; Volume</th>
                  <th className="py-1.5 px-2">Algorithm Score</th>
                  <th className="py-1.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {smcSignal.strikeRanking.map((candidate, idx) => (
                  <tr
                    key={idx}
                    className={`transition ${
                      candidate.isSelected
                        ? 'bg-cyan-950/40 text-cyan-200 font-semibold'
                        : 'text-slate-300 hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-2 px-2 flex items-center gap-1.5">
                      <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        candidate.isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span>{smcSignal.underlying.replace(/\s+/g, '')} {candidate.strike}</span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        candidate.optionType === 'CE' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {candidate.optionType}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-cyan-300 font-bold">
                      {candidate.delta > 0 ? `+${candidate.delta.toFixed(2)}` : candidate.delta.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-white font-bold">₹{candidate.ltp.toFixed(2)}</td>
                    <td className="py-2 px-2 text-slate-400">{candidate.iv}%</td>
                    <td className="py-2 px-2 text-slate-300">₹{candidate.spread.toFixed(2)}</td>
                    <td className="py-2 px-2 text-slate-400 text-[11px]">
                      OI {(candidate.oi / 100000).toFixed(1)}L | Vol {(candidate.volume / 100000).toFixed(1)}L
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-amber-300">{candidate.score}/100</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right">
                      {candidate.isSelected ? (
                        <span className="px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-300 border border-cyan-500/60 text-[10px] font-bold">
                          SELECTED ITM
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-normal">Alternate</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 10-Point Pre-Trade Audit Checklist */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                10-Point Pre-Trade Compliance &amp; Validation Checklist
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {smcSignal.checklistPassed.length}/10 Passed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs font-mono">
            {smcSignal.checklistPassed.map((item, idx) => (
              <div key={idx} className="p-1.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-300/90 text-[11px] flex items-center gap-1.5">
                <span>{item}</span>
              </div>
            ))}
            {smcSignal.checklistFailed.map((item, idx) => (
              <div key={idx} className="p-1.5 rounded bg-rose-950/30 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-1.5 font-bold">
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls & Dispatch Feedback */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-[11px] text-amber-300/90 leading-tight max-w-lg">
            <strong>SEBI Risk Disclosure:</strong> Scalping options involves extreme velocity risk. Targets (T1: 1:2, T2: 1:3, T3: 1:4) are mathematical projections. Strict Stop-Loss discipline required.
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setBacktestModalOpen(true)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <BarChart2 className="h-4 w-4 text-indigo-400" />
              Backtest (Tick Data)
            </button>

            <button
              onClick={handleBroadcastSmc}
              disabled={isBroadcasting || isNoTrade}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-500/70 text-sky-300 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-sky-950/40 disabled:opacity-50"
              title={`Broadcast SMC Signal to ${webhookSettings.telegram.chatId || '@scalpingpro_signals'}`}
            >
              <Send className="h-4 w-4 fill-current" />
              {isBroadcasting ? 'Broadcasting to Telegram...' : 'Broadcast to Telegram Channel'}
            </button>

            <button
              onClick={handleExecuteSmc}
              disabled={isNoTrade}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" />
              Execute Scalp ({brokerMode})
            </button>
          </div>
        </div>

        {broadcastFeedback && (
          <div className="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/60 text-cyan-300 text-xs font-mono animate-fade-in flex items-center justify-between">
            <span>{broadcastFeedback}</span>
            <button onClick={() => setBroadcastFeedback(null)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Historical Tick Backtesting Modal */}
      <SmcBacktestModal
        isOpen={backtestModalOpen}
        onClose={() => setBacktestModalOpen(false)}
        defaultSymbol={activeTicker.symbol}
        onDeployToTrading={() => handleExecuteSmc()}
      />
    </div>
  );
};
