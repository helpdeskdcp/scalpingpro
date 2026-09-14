import React, { useState } from 'react';
import {
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
  Copy,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  MessageSquare,
  Bot,
  Hash,
  Sliders,
  Play
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { TelegramSignal } from '../types/market';

interface TelegramSignalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramSignalsModal: React.FC<TelegramSignalsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    webhookSettings,
    updateWebhookSettings,
    telegramSignals,
    broadcastSignalToTelegram,
    refreshTelegramSignals,
    activeTicker,
    activeStrategy,
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'FEED' | 'SETTINGS' | 'COMPOSE'>('FEED');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  // Compose Custom / AI Signal Form
  const [composeSymbol, setComposeSymbol] = useState(activeTicker.symbol || 'NIFTY 50');
  const [composeAction, setComposeAction] = useState<'BUY' | 'SELL' | 'STRATEGY'>('BUY');
  const [composeStrategyName, setComposeStrategyName] = useState('Bull Call Spread (Alpha Setup)');
  const [composeEntryPrice, setComposeEntryPrice] = useState(activeTicker.ltp.toString());
  const [composeTarget1, setComposeTarget1] = useState((activeTicker.ltp * 1.01).toFixed(2));
  const [composeTarget2, setComposeTarget2] = useState((activeTicker.ltp * 1.025).toFixed(2));
  const [composeStopLoss, setComposeStopLoss] = useState((activeTicker.ltp * 0.992).toFixed(2));
  const [composeRiskReward, setComposeRiskReward] = useState('1 : 2.4');
  const [composeWinProb, setComposeWinProb] = useState('72.5');
  const [composeTimeframe, setComposeTimeframe] = useState('Intraday / Scalping');
  const [composeRationale, setComposeRationale] = useState('Heavy Call unwinding at ATM strike with high PCR expansion.');
  const [composeCustomNote, setComposeCustomNote] = useState('Strict risk control required. Maintain strict stop-loss.');

  if (!isOpen) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBroadcastAiCurrentStrategy = async () => {
    setIsBroadcasting(true);
    setBroadcastFeedback(null);
    try {
      const res = await broadcastSignalToTelegram({
        symbol: activeTicker.symbol,
        action: activeStrategy.category === 'DIRECTIONAL_BULL' ? 'BUY' : activeStrategy.category === 'DIRECTIONAL_BEAR' ? 'SELL' : 'STRATEGY',
        strategyName: activeStrategy.name,
        entryPrice: activeTicker.ltp,
        target1: Number((activeTicker.ltp * 1.012).toFixed(2)),
        target2: Number((activeTicker.ltp * 1.024).toFixed(2)),
        stopLoss: Number((activeTicker.ltp * 0.992).toFixed(2)),
        riskReward: activeStrategy.riskRewardRatio,
        winProbabilityPercent: activeStrategy.winProbabilityPercent,
        timeframe: 'Intraday (F&O Expiry)',
        rationale: activeStrategy.rationale,
        legs: activeStrategy.legs,
        greeks: activeStrategy.greeksProfile,
        channel: webhookSettings.telegram.chatId,
      });
      setBroadcastFeedback(res.message);
    } catch (err: any) {
      setBroadcastFeedback(err.message || 'Signal broadcast failed.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleBroadcastCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    setBroadcastFeedback(null);
    try {
      const res = await broadcastSignalToTelegram({
        symbol: composeSymbol,
        action: composeAction,
        strategyName: composeStrategyName,
        entryPrice: parseFloat(composeEntryPrice) || activeTicker.ltp,
        target1: parseFloat(composeTarget1) || activeTicker.ltp * 1.01,
        target2: parseFloat(composeTarget2) || activeTicker.ltp * 1.02,
        stopLoss: parseFloat(composeStopLoss) || activeTicker.ltp * 0.99,
        riskReward: composeRiskReward,
        winProbabilityPercent: parseFloat(composeWinProb) || 70,
        timeframe: composeTimeframe,
        rationale: composeRationale,
        customNote: composeCustomNote,
        channel: webhookSettings.telegram.chatId,
      });
      setBroadcastFeedback(res.message);
      setActiveTab('FEED');
    } catch (err: any) {
      setBroadcastFeedback(err.message || 'Broadcast failed.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0b1120] border border-slate-700/90 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-sky-950/80 via-[#0e172a] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Telegram Trading Signals Channel
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {webhookSettings.telegram.chatId || '@scalpingpro_signals'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated probabilistic algorithmic trade alerts, Greek setups, and GTT trigger broadcasts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('FEED')}
              className={`py-3 px-3.5 text-xs font-bold font-mono transition flex items-center gap-2 border-b-2 ${
                activeTab === 'FEED'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              Live Signals Feed ({telegramSignals.length})
            </button>
            <button
              onClick={() => setActiveTab('COMPOSE')}
              className={`py-3 px-3.5 text-xs font-bold font-mono transition flex items-center gap-2 border-b-2 ${
                activeTab === 'COMPOSE'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Dispatch New Signal
            </button>
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`py-3 px-3.5 text-xs font-bold font-mono transition flex items-center gap-2 border-b-2 ${
                activeTab === 'SETTINGS'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              Channel &amp; Bot Config
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshTelegramSignals()}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs flex items-center gap-1 font-mono"
              title="Refresh Signals"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {broadcastFeedback && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{broadcastFeedback}</span>
            </div>
            <button
              onClick={() => setBroadcastFeedback(null)}
              className="text-emerald-400 hover:text-emerald-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: LIVE SIGNALS FEED */}
          {activeTab === 'FEED' && (
            <div className="space-y-3">
              {/* Quick AI Broadcast Hero Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-900 border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active AI Alpha Setup
                    </span>
                    <span className="text-white font-bold text-xs">{activeTicker.symbol}</span>
                  </div>
                  <div className="text-xs text-slate-200 font-semibold">{activeStrategy.name}</div>
                  <div className="text-[11px] text-slate-400">
                    Est. Win Probability: <strong className="text-emerald-400">{activeStrategy.winProbabilityPercent}%</strong> • Risk-Reward: <strong className="text-cyan-300">{activeStrategy.riskRewardRatio}</strong>
                  </div>
                </div>

                <button
                  onClick={handleBroadcastAiCurrentStrategy}
                  disabled={isBroadcasting}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 transition shadow-lg shadow-sky-900/30 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5 fill-current" />
                  {isBroadcasting ? 'Broadcasting...' : '1-Click Broadcast Signal'}
                </button>
              </div>

              {/* Signals History Feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>DISPATCHED TELEGRAM SIGNALS</span>
                  <span>Channel: {webhookSettings.telegram.chatId}</span>
                </div>

                {telegramSignals.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 space-y-2">
                    <Send className="h-8 w-8 mx-auto text-slate-600" />
                    <p className="text-sm">No signals broadcasted yet.</p>
                    <p className="text-xs text-slate-500">Dispatch your first signal or enable automated AI broadcasts.</p>
                  </div>
                ) : (
                  telegramSignals.map(sig => {
                    const isBuy = sig.action === 'BUY';
                    const isSell = sig.action === 'SELL';
                    return (
                      <div
                        key={sig.id}
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3 font-mono text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-extrabold flex items-center gap-1 ${
                                isBuy
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : isSell
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                              }`}
                            >
                              {isBuy ? <TrendingUp className="h-3 w-3" /> : isSell ? <TrendingDown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                              {sig.action}
                            </span>
                            <span className="text-white font-extrabold text-sm">{sig.symbol}</span>
                            {sig.strategyName && (
                              <span className="text-slate-400 text-xs hidden sm:inline">
                                • {sig.strategyName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 text-[10px] font-bold">
                              {sig.channel}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              {sig.status}
                            </span>
                          </div>
                        </div>

                        {/* Recommended ITM Option Contract Strip if available */}
                        {sig.optionStrike && (
                          <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-700/50 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-black">
                                ITM CONTRACT
                              </span>
                              <span className="text-white font-extrabold text-xs">{sig.optionStrike}</span>
                              <span className="text-cyan-300 text-[11px]">
                                Entry: ₹{sig.optionEntry?.toFixed(2) || '—'} | SL: ₹{sig.optionSl?.toFixed(2) || '—'}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-300 flex items-center gap-2">
                              <span>T1: <strong className="text-emerald-400">₹{sig.optionT1?.toFixed(2) || '—'}</strong></span>
                              <span>T2: <strong className="text-cyan-300">₹{sig.optionT2?.toFixed(2) || '—'}</strong></span>
                              <span>T3: <strong className="text-indigo-300">₹{sig.optionT3?.toFixed(2) || '—'}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* Trade Parameters Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                            <span className="text-slate-500 text-[10px] block">Spot Entry</span>
                            <span className="font-bold text-white">₹{sig.entryPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-emerald-900/60">
                            <div className="flex justify-between items-center text-[10px] text-emerald-400">
                              <span>T1 ({sig.target1Rr || '1:2'})</span>
                              <span>{sig.target1Confidence || 84}%</span>
                            </div>
                            <span className="font-bold text-emerald-400">₹{sig.target1.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-cyan-900/60">
                            <div className="flex justify-between items-center text-[10px] text-cyan-400">
                              <span>T2 ({sig.target2Rr || '1:3'})</span>
                              <span>{sig.target2Confidence || 72}%</span>
                            </div>
                            <span className="font-bold text-cyan-300">₹{(sig.target2 || sig.target1 * 1.01).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-indigo-900/60">
                            <div className="flex justify-between items-center text-[10px] text-indigo-400">
                              <span>T3 ({sig.target3Rr || '1:4'})</span>
                              <span>{sig.target3Confidence || 58}%</span>
                            </div>
                            <span className="font-bold text-indigo-300">₹{(sig.target3 || sig.target1 * 1.02).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-rose-900/60">
                            <div className="flex justify-between items-center text-[10px] text-rose-400">
                              <span>SL Invalidation</span>
                              <span className="text-emerald-400 font-bold">{sig.slNeverHitProbability || 87}% Safe</span>
                            </div>
                            <span className="font-bold text-rose-400">₹{sig.stopLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>

                        {/* Rationale & SEBI compliance note */}
                        {sig.rationale && (
                          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                            <strong className="text-slate-400">Rationale:</strong> {sig.rationale}
                          </div>
                        )}

                        {/* Legs breakdown if any */}
                        {sig.legs && sig.legs.length > 0 && (
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            {sig.legs.map((leg, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded border ${
                                  leg.action === 'BUY'
                                    ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300'
                                    : 'bg-rose-950/60 border-rose-600/40 text-rose-300'
                                }`}
                              >
                                {leg.action} {leg.instrument} @ ~₹{leg.estPrice}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                          <span className="italic">SEBI Compliance: Probabilistic estimate only. Zero return guarantee.</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(sig.rawText || `${sig.symbol} ${sig.action} @ ${sig.entryPrice} Target: ${sig.target1} SL: ${sig.stopLoss}`, sig.id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            {copiedId === sig.id ? 'Copied HTML!' : 'Copy Telegram Text'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMPOSE NEW SIGNAL */}
          {activeTab === 'COMPOSE' && (
            <form onSubmit={handleBroadcastCustom} className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-white font-bold text-sm">Dispatch Live Trading Signal to Telegram</div>
                <div className="text-slate-400 text-xs">
                  Compose high-probability trading setups and transmit formatted signals instantly to your subscribers.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Symbol / Asset</label>
                  <input
                    type="text"
                    value={composeSymbol}
                    onChange={e => setComposeSymbol(e.target.value)}
                    required
                    placeholder="NIFTY 50"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Trade Action</label>
                  <select
                    value={composeAction}
                    onChange={e => setComposeAction(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:border-sky-500"
                  >
                    <option value="BUY">BUY (Long Signal)</option>
                    <option value="SELL">SELL (Short Signal)</option>
                    <option value="STRATEGY">STRATEGY (F&amp;O Multi-Leg)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Strategy / Setup Name</label>
                  <input
                    type="text"
                    value={composeStrategyName}
                    onChange={e => setComposeStrategyName(e.target.value)}
                    placeholder="Bull Call Spread"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Entry Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={composeEntryPrice}
                    onChange={e => setComposeEntryPrice(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Target 1 (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={composeTarget1}
                    onChange={e => setComposeTarget1(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Target 2 (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={composeTarget2}
                    onChange={e => setComposeTarget2(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-300 font-bold focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Stop Loss (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={composeStopLoss}
                    onChange={e => setComposeStopLoss(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-rose-400 font-bold focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Risk-Reward Ratio</label>
                  <input
                    type="text"
                    value={composeRiskReward}
                    onChange={e => setComposeRiskReward(e.target.value)}
                    placeholder="1 : 2.4"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    value={composeWinProb}
                    onChange={e => setComposeWinProb(e.target.value)}
                    placeholder="71.5"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Timeframe</label>
                  <input
                    type="text"
                    value={composeTimeframe}
                    onChange={e => setComposeTimeframe(e.target.value)}
                    placeholder="Intraday / Scalping"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Technical / Quantitative Rationale</label>
                <textarea
                  rows={2}
                  value={composeRationale}
                  onChange={e => setComposeRationale(e.target.value)}
                  placeholder="Reasons for entering the trade based on OI, IV, or Breakout..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Custom Note / Advice</label>
                <input
                  type="text"
                  value={composeCustomNote}
                  onChange={e => setComposeCustomNote(e.target.value)}
                  placeholder="Strict stop loss recommended. Maintain risk management."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Target Channel: <strong className="text-sky-400">{webhookSettings.telegram.chatId || '@scalpingpro_signals'}</strong>
                </span>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono tracking-wider flex items-center gap-2 transition shadow-lg shadow-sky-900/40 cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4 fill-current" />
                  {isBroadcasting ? 'Broadcasting...' : 'Broadcast to Telegram Channel'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TELEGRAM SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Telegram Bot &amp; Channel Configuration</div>
                      <div className="text-[11px] text-slate-400">
                        Create a bot with @BotFather on Telegram, add it as Admin to your channel, and set the token here.
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookSettings.telegram.enabled}
                      onChange={e =>
                        updateWebhookSettings({
                          ...webhookSettings,
                          telegram: { ...webhookSettings.telegram, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Telegram Bot Token (@BotFather)</label>
                    <input
                      type="text"
                      value={webhookSettings.telegram.botToken}
                      onChange={e =>
                        updateWebhookSettings({
                          ...webhookSettings,
                          telegram: { ...webhookSettings.telegram, botToken: e.target.value },
                        })
                      }
                      placeholder="6891238491:AAH8kqZ_DemoTelegramBotToken_TradingPro"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Channel Username / Chat ID</label>
                    <input
                      type="text"
                      value={webhookSettings.telegram.chatId}
                      onChange={e =>
                        updateWebhookSettings({
                          ...webhookSettings,
                          telegram: { ...webhookSettings.telegram, chatId: e.target.value },
                        })
                      }
                      placeholder="@scalpingpro_signals or -100123456789"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Channel Display Title</label>
                  <input
                    type="text"
                    value={webhookSettings.telegram.channelName || 'ScalpingPro • Live Trade Signals'}
                    onChange={e =>
                      updateWebhookSettings({
                        ...webhookSettings,
                        telegram: { ...webhookSettings.telegram, channelName: e.target.value },
                      })
                    }
                    placeholder="ScalpingPro • Live Trade Signals"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-sky-500"
                  />
                </div>

                {/* Automation Switches */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Automated Signal Broadcast Rules
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                      <div>
                        <div className="text-white font-semibold text-[11px]">AI Alpha Strategies</div>
                        <div className="text-[10px] text-slate-400">Auto-push calculated setups</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={webhookSettings.telegram.autoBroadcastAiSignals !== false}
                        onChange={e =>
                          updateWebhookSettings({
                            ...webhookSettings,
                            telegram: { ...webhookSettings.telegram, autoBroadcastAiSignals: e.target.checked },
                          })
                        }
                        className="rounded border-slate-700 text-sky-600 focus:ring-0"
                      />
                    </label>

                    <label className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                      <div>
                        <div className="text-white font-semibold text-[11px]">GTT Trigger Events</div>
                        <div className="text-[10px] text-slate-400">Broadcast executed levels</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={webhookSettings.telegram.autoBroadcastGttTriggers !== false}
                        onChange={e =>
                          updateWebhookSettings({
                            ...webhookSettings,
                            telegram: { ...webhookSettings.telegram, autoBroadcastGttTriggers: e.target.checked },
                          })
                        }
                        className="rounded border-slate-700 text-sky-600 focus:ring-0"
                      />
                    </label>

                    <label className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                      <div>
                        <div className="text-white font-semibold text-[11px]">Price &amp; OI Breakouts</div>
                        <div className="text-[10px] text-slate-400">Alert on key market moves</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={webhookSettings.telegram.autoBroadcastPriceAlerts !== false}
                        onChange={e =>
                          updateWebhookSettings({
                            ...webhookSettings,
                            telegram: { ...webhookSettings.telegram, autoBroadcastPriceAlerts: e.target.checked },
                          })
                        }
                        className="rounded border-slate-700 text-sky-600 focus:ring-0"
                      />
                    </label>
                  </div>
                </div>

                {/* Setup Instructions */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                  <div className="text-sky-400 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Telegram Channel Connection Guide:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Open Telegram and search for <strong>@BotFather</strong>.</li>
                    <li>Send <code>/newbot</code> and follow instructions to get your <strong>Bot API Token</strong>.</li>
                    <li>Create your Telegram Channel (e.g. <code>@scalpingpro_signals</code>) and add your bot as an <strong>Administrator</strong> with &quot;Post Messages&quot; permission.</li>
                    <li>Enter the Bot Token and Channel Handle above to enable live signal streaming!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            Connected to <strong>{webhookSettings.telegram.chatId || '@scalpingpro_signals'}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
