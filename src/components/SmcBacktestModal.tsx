import React, { useState, useMemo } from 'react';
import {
  X,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  BarChart2,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Layers,
  Sparkles,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { runSmcHistoricalBacktest } from '../utils/smcBacktestingEngine';
import { SmcBacktestConfig, SmcBacktestSummary, SmcBacktestTrade } from '../types/market';
import { useTrading } from '../context/TradingContext';

interface SmcBacktestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
  onDeployToTrading?: (symbol: string) => void;
}

export const SmcBacktestModal: React.FC<SmcBacktestModalProps> = ({
  isOpen,
  onClose,
  defaultSymbol = 'NIFTY 50',
  onDeployToTrading,
}) => {
  const { cashBalance, brokerMode } = useTrading();

  // Configuration state
  const [symbol, setSymbol] = useState<string>(defaultSymbol);
  const [days, setDays] = useState<number>(30);
  const [initialCapital, setInitialCapital] = useState<number>(cashBalance || 250000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [setupFilter, setSetupFilter] = useState<'ALL' | 'LOWER_SWEEP_ONLY' | 'UPPER_SWEEP_ONLY'>('ALL');
  const [slippagePercent, setSlippagePercent] = useState<number>(0.08);

  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'TRADES' | 'EQUITY' | 'REGIMES'>('SUMMARY');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'WINS' | 'LOSSES'>('ALL');

  // Backtest result state
  const [backtestResult, setBacktestResult] = useState<SmcBacktestSummary>(() => {
    return runSmcHistoricalBacktest({
      symbol: defaultSymbol,
      days: 30,
      initialCapital: cashBalance || 250000,
      riskPerTradePercent: 1.5,
      scaleOutT1Percent: 50,
      scaleOutT2Percent: 30,
      scaleOutT3Percent: 20,
      moveSlToBreakevenAtT1: true,
      trailSlToT1AtT2: true,
      slippagePercent: 0.08,
      brokeragePerOrder: 20,
      exchangeChargesRate: 0.0005,
      setupFilter: 'ALL',
    });
  });

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const summary = runSmcHistoricalBacktest({
        symbol,
        days,
        initialCapital,
        riskPerTradePercent: riskPercent,
        scaleOutT1Percent: 50,
        scaleOutT2Percent: 30,
        scaleOutT3Percent: 20,
        moveSlToBreakevenAtT1: true,
        trailSlToT1AtT2: true,
        slippagePercent,
        brokeragePerOrder: 20,
        exchangeChargesRate: 0.0005,
        setupFilter,
      });
      setBacktestResult(summary);
      setIsRunning(false);
    }, 400);
  };

  const filteredTrades = useMemo(() => {
    if (tradeFilter === 'WINS') return backtestResult.trades.filter(t => t.isWin);
    if (tradeFilter === 'LOSSES') return backtestResult.trades.filter(t => !t.isWin);
    return backtestResult.trades;
  }, [backtestResult.trades, tradeFilter]);

  if (!isOpen) return null;

  // Visual SVG Equity Curve calculations
  const equityPoints = backtestResult.equityCurve;
  const minEquity = Math.min(...equityPoints.map(p => p.equity)) * 0.98;
  const maxEquity = Math.max(...equityPoints.map(p => p.equity)) * 1.02;
  const svgWidth = 800;
  const svgHeight = 220;

  const pointsString = equityPoints
    .map((p, idx) => {
      const x = (idx / (equityPoints.length - 1 || 1)) * svgWidth;
      const y = svgHeight - ((p.equity - minEquity) / (maxEquity - minEquity || 1)) * svgHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const benchmarkPointsString = equityPoints
    .map((p, idx) => {
      const x = (idx / (equityPoints.length - 1 || 1)) * svgWidth;
      const y = svgHeight - ((p.benchmarkEquity - minEquity) / (maxEquity - minEquity || 1)) * svgHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0b101e] border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-950">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Historical Tick Backtest Engine (ICT / SMC)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono font-bold">
                  High-Frequency Microstructure
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deterministic Order Flow Imbalance, Liquidity Sweeps &amp; ITM Multi-Target Simulation
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

        {/* Modal Body: Two Column (Config & Performance Dashboard) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Top Parameter Configuration Strip */}
          <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            {/* Symbol */}
            <div>
              <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Instrument
              </label>
              <select
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-cyan-500"
              >
                <option value="NIFTY 50">NIFTY 50</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
                <option value="FINNIFTY">FINNIFTY</option>
                <option value="RELIANCE">RELIANCE</option>
                <option value="HDFCBANK">HDFCBANK</option>
              </select>
            </div>

            {/* Time Horizon */}
            <div>
              <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Time Horizon
              </label>
              <select
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-cyan-500"
              >
                <option value={7}>Last 7 Days (Recent)</option>
                <option value={30}>Last 30 Days (Standard)</option>
                <option value={90}>Last 90 Days (Multi-Expiry)</option>
              </select>
            </div>

            {/* Initial Capital */}
            <div>
              <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Capital (₹)
              </label>
              <select
                value={initialCapital}
                onChange={e => setInitialCapital(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-cyan-500"
              >
                <option value={100000}>₹1,00,000</option>
                <option value={250000}>₹2,50,000</option>
                <option value={500000}>₹5,00,000</option>
                <option value={1000000}>₹10,00,000</option>
              </select>
            </div>

            {/* Risk Per Trade */}
            <div>
              <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Risk / Trade
              </label>
              <select
                value={riskPercent}
                onChange={e => setRiskPercent(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-cyan-500"
              >
                <option value={1.0}>1.0% (Strict SEBI)</option>
                <option value={1.5}>1.5% (Optimal)</option>
                <option value={2.0}>2.0% (Aggressive)</option>
              </select>
            </div>

            {/* Setup Filter */}
            <div>
              <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Sweep Setup
              </label>
              <select
                value={setupFilter}
                onChange={e => setSetupFilter(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-cyan-500"
              >
                <option value="ALL">All Sweeps (BSL + SSL)</option>
                <option value="LOWER_SWEEP_ONLY">Lower Sweeps (CE Only)</option>
                <option value="UPPER_SWEEP_ONLY">Upper Sweeps (PE Only)</option>
              </select>
            </div>

            {/* Execute Button */}
            <div className="flex items-end">
              <button
                onClick={handleRunBacktest}
                disabled={isRunning}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 transition cursor-pointer disabled:opacity-50"
              >
                <Play className={`h-3.5 w-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Calculating...' : 'Run Backtest'}
              </button>
            </div>
          </div>

          {/* Key Metric Scorecards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono">
            {/* Net P&L */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-semibold">Net Profit</span>
              <div
                className={`text-lg sm:text-xl font-extrabold ${
                  backtestResult.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {backtestResult.netProfit >= 0 ? '+' : ''}₹{backtestResult.netProfit.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                {backtestResult.netReturnPercent >= 0 ? '+' : ''}
                {backtestResult.netReturnPercent}% ROI
              </div>
            </div>

            {/* Win Rate */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-semibold">Win Rate</span>
              <div className="text-lg sm:text-xl font-extrabold text-cyan-300">
                {backtestResult.winRate}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {backtestResult.winningTrades}W / {backtestResult.losingTrades}L ({backtestResult.totalTrades} Total)
              </div>
            </div>

            {/* Profit Factor */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-semibold">Profit Factor</span>
              <div className="text-lg sm:text-xl font-extrabold text-white">
                {backtestResult.profitFactor}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Gross ₹{backtestResult.grossProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            {/* Max Drawdown */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-semibold">Max Drawdown</span>
              <div className="text-lg sm:text-xl font-extrabold text-rose-400">
                {backtestResult.maxDrawdownPercent.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                -₹{backtestResult.maxDrawdown.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            {/* Sharpe Ratio */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-semibold">Sharpe Ratio</span>
              <div className="text-lg sm:text-xl font-extrabold text-indigo-300">
                {backtestResult.sharpeRatio}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Sortino: <strong className="text-slate-200">{backtestResult.sortinoRatio}</strong>
              </div>
            </div>

            {/* Average Duration & R:R */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-semibold">Avg Scalp Time</span>
              <div className="text-lg sm:text-xl font-extrabold text-amber-300">
                {backtestResult.avgTradeDurationMinutes} min
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Expectancy: <strong className="text-emerald-400">+{backtestResult.expectancyR}R</strong>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {(['SUMMARY', 'TRADES', 'EQUITY', 'REGIMES'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab === 'SUMMARY' && 'Performance Summary'}
                {tab === 'TRADES' && `Trade-by-Trade Log (${backtestResult.totalTrades})`}
                {tab === 'EQUITY' && 'Equity & Drawdown Curve'}
                {tab === 'REGIMES' && 'Liquidity Regimes Breakdown'}
              </button>
            ))}
          </div>

          {/* TAB 1: SUMMARY (Visual Equity Curve + Key Takeaways) */}
          {activeTab === 'SUMMARY' && (
            <div className="space-y-4">
              {/* SVG Equity Curve Chart */}
              <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" />
                      SMC Strategy Cumulative Equity
                    </span>
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-600" />
                      Buy &amp; Hold Benchmark
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Total Ticks Ingested: <strong className="text-cyan-300">{backtestResult.totalTicksAnalyzed.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="relative h-[220px] w-full bg-slate-950/60 rounded-lg p-2 border border-slate-800/60">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2={svgWidth} y2="0" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="0" y1={svgHeight} x2={svgWidth} y2={svgHeight} stroke="#1e293b" strokeDasharray="3 3" />

                    {/* Benchmark Polyline */}
                    <polyline
                      fill="none"
                      stroke="#475569"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      points={benchmarkPointsString}
                    />

                    {/* Strategy Equity Polyline */}
                    <polyline
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                      points={pointsString}
                    />
                  </svg>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                  Monthly Performance Distribution
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {backtestResult.monthlyPerformance.map(m => (
                    <div key={m.month} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px] flex justify-between">
                        <span>{m.month}</span>
                        <span>{m.trades} Trades</span>
                      </div>
                      <div className="text-sm font-bold text-emerald-400 mt-1">
                        +₹{m.netPnl.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Win Rate: <strong className="text-white">{m.winRate}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRADES LOG (Systematic Table of All Simulated Ticks) */}
          {activeTab === 'TRADES' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setTradeFilter('ALL')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                      tradeFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'
                    }`}
                  >
                    All ({backtestResult.trades.length})
                  </button>
                  <button
                    onClick={() => setTradeFilter('WINS')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                      tradeFilter === 'WINS' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-400'
                    }`}
                  >
                    Wins ({backtestResult.winningTrades})
                  </button>
                  <button
                    onClick={() => setTradeFilter('LOSSES')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                      tradeFilter === 'LOSSES' ? 'bg-rose-950 text-rose-300' : 'text-slate-400'
                    }`}
                  >
                    Losses ({backtestResult.losingTrades})
                  </button>
                </div>

                <div className="text-slate-400">
                  Total Statutory Charges Deducted: <strong className="text-rose-300">₹{backtestResult.totalChargesPaid}</strong>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                      <th className="p-2.5">Trade #</th>
                      <th className="p-2.5">Entry Time</th>
                      <th className="p-2.5">Setup &amp; Strike</th>
                      <th className="p-2.5 text-right">Spot Entry / Exit</th>
                      <th className="p-2.5 text-right">Prem. In / Out</th>
                      <th className="p-2.5 text-center">Exit Trigger</th>
                      <th className="p-2.5 text-center">R-Multiple</th>
                      <th className="p-2.5 text-right">Net P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTrades.map(trade => (
                      <tr
                        key={trade.id}
                        className={`transition hover:bg-slate-900/60 ${
                          trade.isWin ? 'bg-emerald-950/10' : 'bg-rose-950/10'
                        }`}
                      >
                        <td className="p-2.5 font-bold text-white">{trade.id}</td>
                        <td className="p-2.5 text-slate-400">
                          <div>{trade.date}</div>
                          <div className="text-[10px] text-slate-500">{trade.entryTime.split(' ')[1]} ({trade.durationMinutes}m)</div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-white">{trade.strikeInstrument}</div>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              trade.action === 'BUY_CE'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-rose-950 text-rose-400'
                            }`}
                          >
                            {trade.setupType}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <div className="text-white">₹{trade.spotEntry.toFixed(1)}</div>
                          <div className="text-[10px] text-slate-400">Exit: ₹{trade.spotExit.toFixed(1)}</div>
                        </td>
                        <td className="p-2.5 text-right">
                          <div className="text-white">₹{trade.entryPremium.toFixed(1)}</div>
                          <div className="text-[10px] text-slate-400">₹{trade.exitPremium.toFixed(1)}</div>
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              trade.exitReason === 'TARGET_3_HIT' || trade.exitReason === 'TARGET_2_HIT' || trade.exitReason === 'TARGET_1_HIT'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : trade.exitReason === 'BREAKEVEN_EXIT'
                                ? 'bg-cyan-950 text-cyan-300'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {trade.exitReason}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-white">
                          <span className={trade.rMultiple >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple}R
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-bold">
                          <div className={trade.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {trade.netPnl >= 0 ? '+' : ''}₹{trade.netPnl.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Charges: ₹{trade.slippageAndCharges}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REGIMES BREAKDOWN */}
          {activeTab === 'REGIMES' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {backtestResult.regimeBreakdown.map(regime => (
                <div key={regime.regime} className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{regime.regime}</h4>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs font-bold">
                      {regime.trades} Executions
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Win Rate</span>
                      <span className="text-emerald-400 font-bold text-sm">{regime.winRate}%</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Net P&amp;L</span>
                      <span className="text-white font-bold text-sm">+₹{regime.netPnl.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Profit Factor</span>
                      <span className="text-cyan-300 font-bold text-sm">{regime.profitFactor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer & Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#080c16] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-amber-300/90 font-mono flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Regulatory Notice:</strong> Backtest analytics are generated based on historical high-frequency ticks. Statistical past returns do not guarantee future live performance.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition cursor-pointer"
            >
              Close
            </button>

            {onDeployToTrading && (
              <button
                onClick={() => {
                  onDeployToTrading(symbol);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/40 transition cursor-pointer"
              >
                <Briefcase className="h-3.5 w-3.5" />
                Deploy to {brokerMode === 'PAPER' ? 'Paper Trading' : 'Live SmartAPI'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
