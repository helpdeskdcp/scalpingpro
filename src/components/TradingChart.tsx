import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  SlidersHorizontal,
  Maximize2,
  TrendingUp,
  BarChart2,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  Eye,
  EyeOff,
  Zap,
  Crosshair,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { fetchCandleHistory } from '../services/api';
import { HistoricalCandle } from '../types/market';
import { scanSMCStructures } from '../utils/smcPatternScanner';
import { SmcScannerDrawer } from './SmcScannerDrawer';

interface TradingChartProps {
  onQuickOrder: (symbol: string, side: 'BUY' | 'SELL', price?: number) => void;
  onOpenAlertModal: (symbol: string, price: number) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({ onQuickOrder, onOpenAlertModal }) => {
  const { activeTicker, activeSymbol } = useTrading();
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [chartType, setChartType] = useState<'CANDLE' | 'LINE'>('CANDLE');
  const [candles, setCandles] = useState<HistoricalCandle[]>([]);
  const [loading, setLoading] = useState(false);

  // Technical Indicator toggles
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(false);

  // SMC Scanner toggles
  const [showSMC, setShowSMC] = useState(true);
  const [showOB, setShowOB] = useState(true);
  const [showFVG, setShowFVG] = useState(true);
  const [showSweeps, setShowSweeps] = useState(true);
  const [showBOS, setShowBOS] = useState(true);
  const [showPools, setShowPools] = useState(true);
  const [showMitigated, setShowMitigated] = useState(false);
  const [showScannerDrawer, setShowScannerDrawer] = useState(true);
  const [highlightedStructureId, setHighlightedStructureId] = useState<string | null>(null);

  // Hover Crosshair
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Fetch candle data when activeSymbol or timeframe changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchCandleHistory(activeSymbol, timeframe)
      .then(data => {
        if (isMounted) {
          setCandles(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Error fetching chart data:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSymbol, timeframe]);

  // Keep latest candle updated with activeTicker LTP
  useEffect(() => {
    if (candles.length === 0) return;
    setCandles(prev => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      const updatedClose = activeTicker.ltp;
      const updatedHigh = Math.max(last.high, updatedClose);
      const updatedLow = Math.min(last.low, updatedClose);
      return [
        ...prev.slice(0, prev.length - 1),
        {
          ...last,
          close: updatedClose,
          high: updatedHigh,
          low: updatedLow,
        },
      ];
    });
  }, [activeTicker.ltp]);

  // Run Real-Time SMC Scanner on candlestick series
  const smcResults = useMemo(() => {
    return scanSMCStructures(candles);
  }, [candles]);

  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];

  // Price Extents
  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 100, maxPrice: 200, maxVol: 1000 };
    let min = Infinity;
    let max = -Infinity;
    let mv = 0;

    candles.forEach(c => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (showBB && c.upperBB && c.upperBB > max) max = c.upperBB;
      if (showBB && c.lowerBB && c.lowerBB < min) min = c.lowerBB;
      if (c.volume > mv) mv = c.volume;
    });

    const padding = (max - min) * 0.06 || 10;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVol: mv || 1,
    };
  }, [candles, showBB]);

  // Chart coordinate mapping
  const chartWidth = 920;
  const mainHeight = 340;
  const rsiHeight = showRSI ? 80 : 0;
  const macdHeight = showMACD ? 80 : 0;
  const totalSvgHeight = mainHeight + rsiHeight + macdHeight;

  const candleSpacing = chartWidth / (candles.length || 1);
  const candleWidth = Math.max(2, candleSpacing * 0.65);

  const getY = (price: number) => {
    if (maxPrice === minPrice) return mainHeight / 2;
    return mainHeight - ((price - minPrice) / (maxPrice - minPrice)) * (mainHeight - 36) - 18;
  };

  const isPositiveOverall = activeTicker.change >= 0;

  return (
    <div className="bg-[#0b101d] rounded-xl border border-slate-800/90 flex flex-col overflow-hidden shadow-2xl">
      {/* Chart Top Header Controls */}
      <div className="p-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-[#0a0f1c]">
        {/* Symbol & Price HUD */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-base text-white">{activeTicker.symbol}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {activeTicker.exchange}
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">{activeTicker.name}</span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono font-extrabold text-lg text-white">
                {activeTicker.currency === 'USD' ? '$' : '₹'}
                {activeTicker.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                  isPositiveOverall
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                }`}
              >
                {isPositiveOverall ? '+' : ''}
                {activeTicker.change.toFixed(2)} ({isPositiveOverall ? '+' : ''}
                {activeTicker.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* OHLCV live crosshair stats */}
        {activeCandle && (
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500">O: </span>
              <span className="text-slate-200 font-semibold">{activeCandle.open.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500">H: </span>
              <span className="text-emerald-400 font-semibold">{activeCandle.high.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500">L: </span>
              <span className="text-rose-400 font-semibold">{activeCandle.low.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500">C: </span>
              <span className="text-white font-semibold">{activeCandle.close.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500">Vol: </span>
              <span className="text-cyan-400 font-semibold">{(activeCandle.volume / 1000).toFixed(1)}k</span>
            </div>
          </div>
        )}

        {/* Chart Actions & Timeframes */}
        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono font-semibold">
            {(['1D', '1W', '1M', '1Y'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded transition ${
                  timeframe === tf ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setChartType('CANDLE')}
              className={`px-2 py-1 rounded transition ${
                chartType === 'CANDLE' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Candlestick Chart"
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('LINE')}
              className={`px-2 py-1 rounded transition ${
                chartType === 'LINE' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Line Chart"
            >
              Line
            </button>
          </div>

          {/* Quick Buy / Sell */}
          <div className="flex items-center gap-1.5 pl-1">
            <button
              onClick={() => onQuickOrder(activeTicker.symbol, 'BUY')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono tracking-wider transition shadow-sm cursor-pointer active:scale-95"
            >
              BUY
            </button>
            <button
              onClick={() => onQuickOrder(activeTicker.symbol, 'SELL')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono tracking-wider transition shadow-sm cursor-pointer active:scale-95"
            >
              SELL
            </button>
          </div>
        </div>
      </div>

      {/* Primary SMC Pattern Scanner Control Bar */}
      <div className="px-3 py-1.5 bg-[#070b14] border-b border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Master SMC Switch */}
          <button
            onClick={() => setShowSMC(!showSMC)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold flex items-center gap-1.5 transition border cursor-pointer ${
              showSMC
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-950'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${showSMC ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span>SMC SCANNER {showSMC ? 'ON' : 'OFF'}</span>
          </button>

          {showSMC && (
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setShowSweeps(!showSweeps)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  showSweeps ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Liquidity Sweeps (SSL & BSL)"
              >
                <span>⚡ Sweeps ({smcResults.liquiditySweeps.length})</span>
              </button>

              <button
                onClick={() => setShowOB(!showOB)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  showOB ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Demand & Supply Order Blocks"
              >
                <Layers className="h-3 w-3" />
                <span>OB ({smcResults.orderBlocks.length})</span>
              </button>

              <button
                onClick={() => setShowFVG(!showFVG)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  showFVG ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Fair Value Gaps (Imbalance)"
              >
                <Sparkles className="h-3 w-3" />
                <span>FVG ({smcResults.fairValueGaps.length})</span>
              </button>

              <button
                onClick={() => setShowBOS(!showBOS)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  showBOS ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Market Structure Breaks (BOS/CHoCH)"
              >
                <Crosshair className="h-3 w-3" />
                <span>BOS ({smcResults.structureBreaks.length})</span>
              </button>

              <button
                onClick={() => setShowPools(!showPools)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  showPools ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle $$$ Equal Highs & Equal Lows Pools"
              >
                <span>$$$ ({smcResults.liquidityPools.length})</span>
              </button>

              <button
                onClick={() => setShowMitigated(!showMitigated)}
                className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                  showMitigated ? 'bg-slate-800 text-slate-200' : 'text-slate-600 hover:text-slate-400'
                }`}
                title="Show or hide mitigated zones"
              >
                <span>Mitigated: {showMitigated ? 'Shown' : 'Hidden'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick toggle for pattern drawer */}
          <button
            onClick={() => setShowScannerDrawer(!showScannerDrawer)}
            className="px-2.5 py-0.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <span>Scanner List</span>
            {showScannerDrawer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Standard Indicators Bar */}
      <div className="px-3 py-1 bg-[#090d17] border-b border-slate-800/60 flex items-center justify-between text-xs font-mono overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-500 text-[11px]">Indicators:</span>

          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2 py-0.2 rounded text-[10px] font-semibold border transition ${
              showEMA ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            EMA (20/50)
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2 py-0.2 rounded text-[10px] font-semibold border transition ${
              showBB ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            BB (20,2)
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-0.2 rounded text-[10px] font-semibold border transition ${
              showVolume ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Volume
          </button>

          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2 py-0.2 rounded text-[10px] font-semibold border transition ${
              showRSI ? 'bg-purple-500/15 border-purple-500/40 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            RSI (14)
          </button>

          <button
            onClick={() => setShowMACD(!showMACD)}
            className={`px-2 py-0.2 rounded text-[10px] font-semibold border transition ${
              showMACD ? 'bg-sky-500/15 border-sky-500/40 text-sky-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            MACD
          </button>
        </div>

        <button
          onClick={() => onOpenAlertModal(activeTicker.symbol, activeTicker.ltp)}
          className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
        >
          + Set Alert at ₹{activeTicker.ltp.toFixed(2)}
        </button>
      </div>

      {/* SVG Canvas Chart Area */}
      <div className="relative flex-1 p-2 bg-[#090d16] select-none">
        {loading && (
          <div className="absolute inset-0 bg-[#090d16]/70 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Scanning real-time institutional structures...
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${chartWidth} ${totalSvgHeight}`}
          className="w-full h-auto max-h-[480px] overflow-visible font-mono"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="bullishGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="bearishGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <pattern id="fvgBullPattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#06b6d4" strokeWidth="1.2" opacity="0.3" />
            </pattern>
            <pattern id="fvgBearPattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#c084fc" strokeWidth="1.2" opacity="0.3" />
            </pattern>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map(ratio => {
            const y = mainHeight * ratio;
            const priceVal = maxPrice - ratio * (maxPrice - minPrice);
            return (
              <g key={ratio}>
                <line x1={0} y1={y} x2={chartWidth} y2={y} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                <text x={chartWidth - 5} y={y - 4} fill="#64748b" fontSize="10" textAnchor="end">
                  ₹{priceVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* ============================================================ */}
          {/* SMC STRUCTURES 1: FAIR VALUE GAPS (FVG) ZONES               */}
          {/* ============================================================ */}
          {showSMC &&
            showFVG &&
            smcResults.fairValueGaps
              .filter(f => showMitigated || f.status !== 'FILLED')
              .map(fvg => {
                const isBull = fvg.type === 'BULLISH_FVG';
                const x1 = fvg.startIndex * candleSpacing;
                const x2 = Math.min(chartWidth, (fvg.endIndex + 1) * candleSpacing);
                const w = Math.max(candleSpacing * 2, x2 - x1);
                const yTop = getY(fvg.top);
                const yBottom = getY(fvg.bottom);
                const h = Math.max(3, yBottom - yTop);
                const yCe = getY(fvg.consequentEncroachment);
                const isHighlighted = highlightedStructureId === fvg.id;

                return (
                  <g key={fvg.id} className="cursor-pointer" onClick={() => setHighlightedStructureId(fvg.id)}>
                    {/* FVG Box */}
                    <rect
                      x={x1}
                      y={yTop}
                      width={w}
                      height={h}
                      fill={isBull ? 'url(#fvgBullPattern)' : 'url(#fvgBearPattern)'}
                      stroke={isBull ? '#06b6d4' : '#c084fc'}
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={fvg.status === 'FILLED' ? '2 2' : 'none'}
                      opacity={fvg.status === 'FILLED' ? 0.35 : isHighlighted ? 0.95 : 0.75}
                      rx="2"
                    />

                    {/* Consequent Encroachment (50% CE) Line */}
                    <line
                      x1={x1}
                      y1={yCe}
                      x2={x1 + w}
                      y2={yCe}
                      stroke={isBull ? '#22d3ee' : '#e879f9'}
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />

                    {/* FVG Badge */}
                    <rect
                      x={Math.max(x1 + 4, x1 + w - 75)}
                      y={yTop - 12}
                      width="70"
                      height="12"
                      fill={isBull ? '#083344' : '#3b0764'}
                      stroke={isBull ? '#06b6d4' : '#c084fc'}
                      strokeWidth="0.8"
                      rx="2"
                      opacity="0.9"
                    />
                    <text
                      x={Math.max(x1 + 39, x1 + w - 40)}
                      y={yTop - 3}
                      fill={isBull ? '#67e8f9' : '#f0abfc'}
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isBull ? 'Bull FVG' : 'Bear FVG'}
                    </text>
                  </g>
                );
              })}

          {/* ============================================================ */}
          {/* SMC STRUCTURES 2: ORDER BLOCKS (OB) DEMAND & SUPPLY ZONES    */}
          {/* ============================================================ */}
          {showSMC &&
            showOB &&
            smcResults.orderBlocks
              .filter(ob => showMitigated || ob.status !== 'MITIGATED')
              .map(ob => {
                const isBull = ob.type === 'BULLISH_OB';
                const x1 = ob.startIndex * candleSpacing;
                const x2 = Math.min(chartWidth, (ob.endIndex + 1) * candleSpacing);
                const w = Math.max(candleSpacing * 2, x2 - x1);
                const yTop = getY(ob.top);
                const yBottom = getY(ob.bottom);
                const h = Math.max(3, yBottom - yTop);
                const yMt = getY(ob.meanThreshold);
                const isHighlighted = highlightedStructureId === ob.id;

                return (
                  <g key={ob.id} className="cursor-pointer" onClick={() => setHighlightedStructureId(ob.id)}>
                    {/* OB Area Zone */}
                    <rect
                      x={x1}
                      y={yTop}
                      width={w}
                      height={h}
                      fill={isBull ? '#059669' : '#dc2626'}
                      fillOpacity={ob.status === 'MITIGATED' ? 0.12 : isHighlighted ? 0.35 : 0.22}
                      stroke={isBull ? '#10b981' : '#f43f5e'}
                      strokeWidth={isHighlighted ? 2.2 : 1.2}
                      strokeDasharray={ob.status === 'MITIGATED' ? '3 3' : 'none'}
                      rx="2"
                    />

                    {/* Mean Threshold 50% Line */}
                    <line
                      x1={x1}
                      y1={yMt}
                      x2={x1 + w}
                      y2={yMt}
                      stroke={isBull ? '#34d399' : '#fb7185'}
                      strokeWidth="1"
                      strokeDasharray="3 2"
                    />

                    {/* Label Tag */}
                    <rect
                      x={x1 + 4}
                      y={isBull ? yBottom + 2 : yTop - 13}
                      width="88"
                      height="12"
                      fill={isBull ? '#022c22' : '#450a0a'}
                      stroke={isBull ? '#10b981' : '#f43f5e'}
                      strokeWidth="0.8"
                      rx="2"
                      opacity="0.95"
                    />
                    <text
                      x={x1 + 48}
                      y={isBull ? yBottom + 11 : yTop - 4}
                      fill={isBull ? '#6ee7b7' : '#fca5a5'}
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isBull ? 'DEMAND OB' : 'SUPPLY OB'} ({ob.status})
                    </text>
                  </g>
                );
              })}

          {/* ============================================================ */}
          {/* SMC STRUCTURES 3: STRUCTURE BREAKS (BOS / CHOCH)             */}
          {/* ============================================================ */}
          {showSMC &&
            showBOS &&
            smcResults.structureBreaks.map(bos => {
              const x1 = bos.fromIndex * candleSpacing + candleSpacing / 2;
              const x2 = bos.toIndex * candleSpacing + candleSpacing / 2;
              const y = getY(bos.level);
              const isBull = bos.type.includes('BULLISH');

              return (
                <g key={bos.id}>
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke={isBull ? '#38bdf8' : '#fb923c'}
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={(x1 + x2) / 2 - 18}
                    y={y - 8}
                    width="36"
                    height="12"
                    fill="#0f172a"
                    stroke={isBull ? '#38bdf8' : '#fb923c'}
                    strokeWidth="0.8"
                    rx="2"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={y + 1}
                    fill={isBull ? '#38bdf8' : '#fb923c'}
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    BOS
                  </text>
                </g>
              );
            })}

          {/* ============================================================ */}
          {/* SMC STRUCTURES 4: EQUAL HIGHS / LOWS ($$$ POOLS)             */}
          {/* ============================================================ */}
          {showSMC &&
            showPools &&
            smcResults.liquidityPools.map(pool => {
              const x1 = pool.indices[0] * candleSpacing;
              const x2 = chartWidth;
              const y = getY(pool.price);

              return (
                <g key={pool.id}>
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                    opacity="0.75"
                  />
                  <rect x={chartWidth - 80} y={y - 8} width="75" height="12" fill="#451a03" stroke="#f59e0b" strokeWidth="0.8" rx="2" />
                  <text x={chartWidth - 42} y={y + 1} fill="#fde68a" fontSize="8" fontWeight="bold" textAnchor="middle">
                    $$$ {pool.type} POOL
                  </text>
                </g>
              );
            })}

          {/* Bollinger Bands Fill & Lines */}
          {showBB && candles.length > 1 && (
            <>
              <polygon
                points={`
                  ${candles.map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.upperBB || c.high)}`).join(' ')}
                  ${candles
                    .slice()
                    .reverse()
                    .map((c, i) => {
                      const originalIdx = candles.length - 1 - i;
                      return `${originalIdx * candleSpacing + candleSpacing / 2},${getY(c.lowerBB || c.low)}`;
                    })
                    .join(' ')}
                `}
                fill="#6366f1"
                fillOpacity="0.08"
              />
              <polyline
                points={candles
                  .map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.upperBB || c.high)}`)
                  .join(' ')}
                fill="none"
                stroke="#818cf8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <polyline
                points={candles
                  .map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.lowerBB || c.low)}`)
                  .join(' ')}
                fill="none"
                stroke="#818cf8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </>
          )}

          {/* Volume Bars */}
          {showVolume &&
            candles.map((c, i) => {
              const vHeight = (c.volume / maxVol) * 55;
              const x = i * candleSpacing + (candleSpacing - candleWidth) / 2;
              const y = mainHeight - vHeight;
              const isUp = c.close >= c.open;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x}
                  y={y}
                  width={candleWidth}
                  height={vHeight}
                  fill={isUp ? '#10b981' : '#f43f5e'}
                  opacity={0.25}
                />
              );
            })}

          {/* Candles or Line rendering */}
          {chartType === 'CANDLE' ? (
            candles.map((c, i) => {
              const isUp = c.close >= c.open;
              const color = isUp ? '#10b981' : '#f43f5e';
              const xCenter = i * candleSpacing + candleSpacing / 2;
              const xLeft = i * candleSpacing + (candleSpacing - candleWidth) / 2;
              const yHigh = getY(c.high);
              const yLow = getY(c.low);
              const yOpen = getY(c.open);
              const yClose = getY(c.close);
              const bodyY = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

              return (
                <g key={`candle-${i}`}>
                  {/* Wick */}
                  <line x1={xCenter} y1={yHigh} x2={xCenter} y2={yLow} stroke={color} strokeWidth="1.5" />
                  {/* Body */}
                  <rect x={xLeft} y={bodyY} width={candleWidth} height={bodyHeight} fill={color} rx="1" />
                </g>
              );
            })
          ) : (
            <>
              {/* Line Area */}
              <polygon
                points={`
                  0,${mainHeight}
                  ${candles.map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`).join(' ')}
                  ${chartWidth},${mainHeight}
                `}
                fill={isPositiveOverall ? 'url(#bullishGradient)' : 'url(#bearishGradient)'}
              />
              <polyline
                points={candles.map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`).join(' ')}
                fill="none"
                stroke={isPositiveOverall ? '#10b981' : '#f43f5e'}
                strokeWidth="2.2"
              />
            </>
          )}

          {/* EMA Lines */}
          {showEMA && (
            <>
              {/* EMA 20 (Cyan) */}
              <polyline
                points={candles
                  .map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.ema20 || c.close)}`)
                  .join(' ')}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.6"
              />
              {/* EMA 50 (Amber) */}
              <polyline
                points={candles
                  .map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.ema50 || c.close)}`)
                  .join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.6"
              />
            </>
          )}

          {/* ============================================================ */}
          {/* SMC STRUCTURES 5: LIQUIDITY SWEEPS (SSL & BSL SWEEP PINS)   */}
          {/* ============================================================ */}
          {showSMC &&
            showSweeps &&
            smcResults.liquiditySweeps.map(sweep => {
              const xCenter = sweep.candleIndex * candleSpacing + candleSpacing / 2;
              const isBull = sweep.type === 'SSL_SWEEP';
              const yExtreme = getY(sweep.extremePrice);
              const yLevel = getY(sweep.levelSwept);
              const isHighlighted = highlightedStructureId === sweep.id;

              return (
                <g key={sweep.id} className="cursor-pointer" onClick={() => setHighlightedStructureId(sweep.id)}>
                  {/* Swept level ray */}
                  <line
                    x1={Math.max(0, xCenter - 60)}
                    y1={yLevel}
                    x2={xCenter + 20}
                    y2={yLevel}
                    stroke={isBull ? '#10b981' : '#f43f5e'}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />

                  {/* Sweep marker pin */}
                  <circle
                    cx={xCenter}
                    cy={yExtreme}
                    r={isHighlighted ? 6 : 4.5}
                    fill={isBull ? '#10b981' : '#f43f5e'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Sweep Badge */}
                  <g transform={`translate(${xCenter - 45}, ${isBull ? yExtreme + 8 : yExtreme - 24})`}>
                    <rect
                      x="0"
                      y="0"
                      width="90"
                      height="16"
                      fill={isBull ? '#064e3b' : '#881337'}
                      stroke={isBull ? '#34d399' : '#fda4af'}
                      strokeWidth="1"
                      rx="3"
                    />
                    <text
                      x="45"
                      y="11"
                      fill="#ffffff"
                      fontSize="8.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isBull ? '⚡ SSL SWEPT' : '⚡ BSL SWEPT'}
                    </text>
                  </g>
                </g>
              );
            })}

          {/* RSI Sub-Chart */}
          {showRSI && (
            <g transform={`translate(0, ${mainHeight})`}>
              <line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#334155" strokeWidth="1" />
              <rect x={0} y={0} width={chartWidth} height={rsiHeight} fill="#060a12" opacity="0.6" />

              <line
                x1={0}
                y1={rsiHeight * 0.3}
                x2={chartWidth}
                y2={rsiHeight * 0.3}
                stroke="#f43f5e"
                strokeDasharray="2 2"
                strokeWidth="0.8"
                opacity="0.6"
              />
              <line
                x1={0}
                y1={rsiHeight * 0.7}
                x2={chartWidth}
                y2={rsiHeight * 0.7}
                stroke="#10b981"
                strokeDasharray="2 2"
                strokeWidth="0.8"
                opacity="0.6"
              />

              <text x={8} y={14} fill="#a855f7" fontSize="10" fontWeight="bold">
                RSI (14): {activeCandle?.rsi?.toFixed(1) || '52.0'}
              </text>
              <text x={chartWidth - 5} y={rsiHeight * 0.3 - 2} fill="#f43f5e" fontSize="9" textAnchor="end">
                OB 70
              </text>
              <text x={chartWidth - 5} y={rsiHeight * 0.7 - 2} fill="#10b981" fontSize="9" textAnchor="end">
                OS 30
              </text>

              <polyline
                points={candles
                  .map((c, i) => {
                    const rsiVal = c.rsi || 50;
                    const y = rsiHeight - (rsiVal / 100) * rsiHeight;
                    return `${i * candleSpacing + candleSpacing / 2},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#c084fc"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* MACD Sub-Chart */}
          {showMACD && (
            <g transform={`translate(0, ${mainHeight + rsiHeight})`}>
              <line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#334155" strokeWidth="1" />
              <rect x={0} y={0} width={chartWidth} height={macdHeight} fill="#060a12" opacity="0.6" />
              <text x={8} y={14} fill="#38bdf8" fontSize="10" fontWeight="bold">
                MACD (12, 26, 9)
              </text>

              {candles.map((c, i) => {
                const hist = c.histogram || 0;
                const hHeight = Math.min(30, Math.abs(hist) * 2.5);
                const isHistUp = hist >= 0;
                const y = isHistUp ? macdHeight / 2 - hHeight : macdHeight / 2;
                return (
                  <rect
                    key={`hist-${i}`}
                    x={i * candleSpacing + (candleSpacing - candleWidth) / 2}
                    y={y}
                    width={candleWidth}
                    height={Math.max(1, hHeight)}
                    fill={isHistUp ? '#10b981' : '#f43f5e'}
                    opacity={0.7}
                  />
                );
              })}
            </g>
          )}

          {/* Mouse Hover Crosshair Overlay */}
          {candles.map((c, i) => (
            <rect
              key={`overlay-${i}`}
              x={i * candleSpacing}
              y={0}
              width={candleSpacing}
              height={totalSvgHeight}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}

          {hoverIndex !== null && candles[hoverIndex] && (
            <g pointerEvents="none">
              <line
                x1={hoverIndex * candleSpacing + candleSpacing / 2}
                y1={0}
                x2={hoverIndex * candleSpacing + candleSpacing / 2}
                y2={totalSvgHeight}
                stroke="#38bdf8"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <line
                x1={0}
                y1={getY(candles[hoverIndex].close)}
                x2={chartWidth}
                y2={getY(candles[hoverIndex].close)}
                stroke="#38bdf8"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <rect x={chartWidth - 65} y={getY(candles[hoverIndex].close) - 10} width={65} height={20} fill="#0284c7" rx="3" />
              <text
                x={chartWidth - 32}
                y={getY(candles[hoverIndex].close) + 4}
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                ₹{candles[hoverIndex].close.toFixed(2)}
              </text>
              <rect
                x={Math.max(5, Math.min(chartWidth - 65, hoverIndex * candleSpacing - 30))}
                y={mainHeight - 18}
                width={60}
                height={16}
                fill="#1e293b"
                rx="3"
              />
              <text
                x={Math.max(35, Math.min(chartWidth - 35, hoverIndex * candleSpacing))}
                y={mainHeight - 6}
                fill="#cbd5e1"
                fontSize="9"
                textAnchor="middle"
              >
                {candles[hoverIndex].time}
              </text>
            </g>
          )}
        </svg>

        {/* Legend pills at bottom */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono mt-1 text-slate-400 px-1">
          {showSMC && (
            <>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-sm bg-emerald-500 inline-block" /> Bullish OB (Demand)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="h-2 w-2 rounded-sm bg-rose-500 inline-block" /> Bearish OB (Supply)
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="h-2 w-2 rounded-sm bg-cyan-400/40 border border-cyan-400 inline-block" /> FVG Imbalance (50% CE)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Zap className="h-2.5 w-2.5 text-amber-400" /> Liquidity Sweeps
              </span>
            </>
          )}
          <span className="text-slate-500 ml-auto">Real-Time SMC Detection Engine • Angel One SmartAPI Feed</span>
        </div>
      </div>

      {/* Real-time SMC Pattern Scanner Drawer */}
      {showScannerDrawer && (
        <SmcScannerDrawer
          smcResults={smcResults}
          symbol={activeTicker.symbol}
          currentPrice={activeTicker.ltp}
          highlightedId={highlightedStructureId}
          onSelectStructure={setHighlightedStructureId}
          onQuickOrder={(sym, side, prc) => onQuickOrder(sym, side, prc)}
          onOpenAlert={(sym, prc) => onOpenAlertModal(sym, prc)}
        />
      )}
    </div>
  );
};
