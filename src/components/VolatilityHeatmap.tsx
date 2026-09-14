import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { OptionChainData, OptionStrike } from '../types/market';
import {
  Flame,
  Activity,
  Zap,
  TrendingUp,
  Sliders,
  Maximize2,
  Info,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';

interface VolatilityHeatmapProps {
  chainData: OptionChainData;
  underlyingPrice: number;
  symbol: string;
  onSelectOptionTrade: (symbol: string, strike: number, type: 'CE' | 'PE', price: number) => void;
}

export type HeatmapMetric = 'IV' | 'MOMENTUM_RATIO' | 'GAMMA_ACCELERATION' | 'VOLUME_BURST';

interface StrikeHeatmapItem {
  strikePrice: number;
  isATM: boolean;
  distanceFromATM: number;
  call: {
    ltp: number;
    iv: number;
    volume: number;
    oi: number;
    delta: number;
    gamma: number;
    theta: number;
    momentumScore: number;
    volOiRatio: number;
    gammaScore: number;
  };
  put: {
    ltp: number;
    iv: number;
    volume: number;
    oi: number;
    delta: number;
    gamma: number;
    theta: number;
    momentumScore: number;
    volOiRatio: number;
    gammaScore: number;
  };
}

export const VolatilityHeatmap: React.FC<VolatilityHeatmapProps> = ({
  chainData,
  underlyingPrice,
  symbol,
  onSelectOptionTrade,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [metric, setMetric] = useState<HeatmapMetric>('IV');
  const [strikeRange, setStrikeRange] = useState<'ALL' | 'ATM_10' | 'ATM_6'>('ATM_10');
  const [hoveredStrike, setHoveredStrike] = useState<{
    strike: number;
    type: 'CE' | 'PE';
    item: StrikeHeatmapItem;
    x: number;
    y: number;
  } | null>(null);

  // Compute normalized metrics for all strikes
  const heatmapData: StrikeHeatmapItem[] = useMemo(() => {
    if (!chainData || !chainData.strikes) return [];

    const raw = chainData.strikes.map(s => {
      const isATM = s.strikePrice === chainData.atmStrike;
      const distanceFromATM = s.strikePrice - underlyingPrice;

      // Call metrics
      const cVol = s.call.volume || 1;
      const cOi = s.call.oi || 1;
      const cVolOiRatio = Number((cVol / Math.max(1000, cOi)).toFixed(2));
      const cGammaScore = Number((s.call.gamma * cVol).toFixed(2));
      const cMomentumScore = Number((s.call.iv * 0.4 + cVolOiRatio * 30 + Math.abs(s.call.delta) * 30).toFixed(1));

      // Put metrics
      const pVol = s.put.volume || 1;
      const pOi = s.put.oi || 1;
      const pVolOiRatio = Number((pVol / Math.max(1000, pOi)).toFixed(2));
      const pGammaScore = Number((s.put.gamma * pVol).toFixed(2));
      const pMomentumScore = Number((s.put.iv * 0.4 + pVolOiRatio * 30 + Math.abs(s.put.delta) * 30).toFixed(1));

      return {
        strikePrice: s.strikePrice,
        isATM,
        distanceFromATM,
        call: {
          ...s.call,
          momentumScore: cMomentumScore,
          volOiRatio: cVolOiRatio,
          gammaScore: cGammaScore,
        },
        put: {
          ...s.put,
          momentumScore: pMomentumScore,
          volOiRatio: pVolOiRatio,
          gammaScore: pGammaScore,
        },
      };
    });

    // Filter by strike range if selected
    if (strikeRange === 'ATM_6') {
      const atmIdx = raw.findIndex(s => s.isATM);
      const start = Math.max(0, atmIdx - 6);
      const end = Math.min(raw.length, atmIdx + 7);
      return raw.slice(start, end);
    }
    if (strikeRange === 'ATM_10') {
      const atmIdx = raw.findIndex(s => s.isATM);
      const start = Math.max(0, atmIdx - 10);
      const end = Math.min(raw.length, atmIdx + 11);
      return raw.slice(start, end);
    }
    return raw;
  }, [chainData, underlyingPrice, strikeRange]);

  // Find top momentum strikes
  const topCallMomentum = useMemo(() => {
    if (heatmapData.length === 0) return null;
    return [...heatmapData].sort((a, b) => b.call.momentumScore - a.call.momentumScore)[0];
  }, [heatmapData]);

  const topPutMomentum = useMemo(() => {
    if (heatmapData.length === 0) return null;
    return [...heatmapData].sort((a, b) => b.put.momentumScore - a.put.momentumScore)[0];
  }, [heatmapData]);

  // D3 Render Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || heatmapData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 900;
    const margin = { top: 40, right: 30, bottom: 45, left: 30 };
    const width = containerWidth - margin.left - margin.right;
    const height = Math.max(260, heatmapData.length * 28 + 40);

    svg.attr('width', containerWidth).attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Metrics value extractors
    const getValue = (item: StrikeHeatmapItem, type: 'CE' | 'PE') => {
      const data = type === 'CE' ? item.call : item.put;
      if (metric === 'IV') return data.iv;
      if (metric === 'MOMENTUM_RATIO') return data.volOiRatio;
      if (metric === 'GAMMA_ACCELERATION') return data.gammaScore;
      return data.volume;
    };

    // Calculate min/max domains for color scale
    const allValues: number[] = [];
    heatmapData.forEach(d => {
      allValues.push(getValue(d, 'CE'));
      allValues.push(getValue(d, 'PE'));
    });

    const minVal = d3.min(allValues) || 10;
    const maxVal = d3.max(allValues) || 40;

    // D3 Color Scales
    // Calls: Teal / Emerald to Cyan
    const callColorScale = d3
      .scaleSequential()
      .domain([minVal, maxVal])
      .interpolator(d3.interpolateHcl('#0d2826', '#10b981'));

    // Puts: Indigo / Crimson to Rose
    const putColorScale = d3
      .scaleSequential()
      .domain([minVal, maxVal])
      .interpolator(d3.interpolateHcl('#290e1f', '#f43f5e'));

    // Y Scale (Strikes)
    const yScale = d3
      .scaleBand()
      .domain(heatmapData.map(d => String(d.strikePrice)))
      .range([0, height])
      .padding(0.12);

    const halfWidth = (width - 120) / 2;
    const centerColWidth = 120;
    const centerStartX = halfWidth;

    // Background header ribbons
    // Calls Header (Left)
    g.append('rect')
      .attr('x', 0)
      .attr('y', -30)
      .attr('width', halfWidth)
      .attr('height', 24)
      .attr('fill', '#064e3b')
      .attr('fill-opacity', 0.4)
      .attr('rx', 4);

    g.append('text')
      .attr('x', halfWidth / 2)
      .attr('y', -14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#34d399')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text('CALLS (CE) VOLATILITY HEATMAP');

    // Strike Center Header
    g.append('rect')
      .attr('x', centerStartX)
      .attr('y', -30)
      .attr('width', centerColWidth)
      .attr('height', 24)
      .attr('fill', '#0f172a')
      .attr('rx', 4);

    g.append('text')
      .attr('x', centerStartX + centerColWidth / 2)
      .attr('y', -14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#38bdf8')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text('STRIKE PRICE');

    // Puts Header (Right)
    g.append('rect')
      .attr('x', centerStartX + centerColWidth)
      .attr('y', -30)
      .attr('width', halfWidth)
      .attr('height', 24)
      .attr('fill', '#881337')
      .attr('fill-opacity', 0.4)
      .attr('rx', 4);

    g.append('text')
      .attr('x', centerStartX + centerColWidth + halfWidth / 2)
      .attr('y', -14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fb7185')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text('PUTS (PE) VOLATILITY HEATMAP');

    // Render Grid Rows for each Strike
    heatmapData.forEach(item => {
      const y = yScale(String(item.strikePrice)) || 0;
      const rowHeight = yScale.bandwidth();
      const isATM = item.isATM;

      const callVal = getValue(item, 'CE');
      const putVal = getValue(item, 'PE');

      // 1. CALL HEATMAP CELL
      const callCellGroup = g
        .append('g')
        .attr('class', 'call-cell cursor-pointer')
        .on('click', () => {
          onSelectOptionTrade(symbol, item.strikePrice, 'CE', item.call.ltp);
        })
        .on('mouseenter', (event) => {
          const [mx, my] = d3.pointer(event, containerRef.current);
          setHoveredStrike({
            strike: item.strikePrice,
            type: 'CE',
            item,
            x: mx,
            y: my,
          });
        })
        .on('mouseleave', () => setHoveredStrike(null));

      callCellGroup
        .append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', halfWidth)
        .attr('height', rowHeight)
        .attr('fill', callColorScale(callVal))
        .attr('rx', 3)
        .attr('stroke', isATM ? '#10b981' : '#1e293b')
        .attr('stroke-width', isATM ? 1.5 : 0.5)
        .attr('fill-opacity', 0.85);

      // Call Volume Bar inside heatmap cell
      const maxVol = d3.max(heatmapData, d => d.call.volume) || 1;
      const barW = (item.call.volume / maxVol) * (halfWidth * 0.4);
      callCellGroup
        .append('rect')
        .attr('x', halfWidth - barW - 4)
        .attr('y', y + 3)
        .attr('width', barW)
        .attr('height', rowHeight - 6)
        .attr('fill', '#34d399')
        .attr('fill-opacity', 0.25)
        .attr('rx', 2);

      // Call Text Label
      callCellGroup
        .append('text')
        .attr('x', 10)
        .attr('y', y + rowHeight / 2 + 4)
        .attr('fill', '#ffffff')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(`₹${item.call.ltp.toFixed(1)}  (IV: ${item.call.iv}%)`);

      // Call Momentum Tag
      if (topCallMomentum && topCallMomentum.strikePrice === item.strikePrice) {
        callCellGroup
          .append('text')
          .attr('x', halfWidth - 10)
          .attr('y', y + rowHeight / 2 + 3)
          .attr('text-anchor', 'end')
          .attr('fill', '#6ee7b7')
          .attr('font-size', '9px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'extrabold')
          .text('⚡ HIGH MOMENTUM');
      }

      // 2. CENTER STRIKE CELL
      const centerGroup = g.append('g');

      centerGroup
        .append('rect')
        .attr('x', centerStartX)
        .attr('y', y)
        .attr('width', centerColWidth)
        .attr('height', rowHeight)
        .attr('fill', isATM ? '#0284c7' : '#090d16')
        .attr('stroke', isATM ? '#38bdf8' : '#334155')
        .attr('stroke-width', isATM ? 1.5 : 1)
        .attr('rx', 3);

      centerGroup
        .append('text')
        .attr('x', centerStartX + centerColWidth / 2)
        .attr('y', y + rowHeight / 2 + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', isATM ? '#ffffff' : '#f8fafc')
        .attr('font-size', '12px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(isATM ? `${item.strikePrice} (ATM)` : String(item.strikePrice));

      // 3. PUT HEATMAP CELL
      const putCellGroup = g
        .append('g')
        .attr('class', 'put-cell cursor-pointer')
        .on('click', () => {
          onSelectOptionTrade(symbol, item.strikePrice, 'PE', item.put.ltp);
        })
        .on('mouseenter', (event) => {
          const [mx, my] = d3.pointer(event, containerRef.current);
          setHoveredStrike({
            strike: item.strikePrice,
            type: 'PE',
            item,
            x: mx,
            y: my,
          });
        })
        .on('mouseleave', () => setHoveredStrike(null));

      const putStartX = centerStartX + centerColWidth;

      putCellGroup
        .append('rect')
        .attr('x', putStartX)
        .attr('y', y)
        .attr('width', halfWidth)
        .attr('height', rowHeight)
        .attr('fill', putColorScale(putVal))
        .attr('rx', 3)
        .attr('stroke', isATM ? '#f43f5e' : '#1e293b')
        .attr('stroke-width', isATM ? 1.5 : 0.5)
        .attr('fill-opacity', 0.85);

      // Put Volume Bar
      const maxPutVol = d3.max(heatmapData, d => d.put.volume) || 1;
      const putBarW = (item.put.volume / maxPutVol) * (halfWidth * 0.4);
      putCellGroup
        .append('rect')
        .attr('x', putStartX + 4)
        .attr('y', y + 3)
        .attr('width', putBarW)
        .attr('height', rowHeight - 6)
        .attr('fill', '#fb7185')
        .attr('fill-opacity', 0.25)
        .attr('rx', 2);

      // Put Text Label
      putCellGroup
        .append('text')
        .attr('x', putStartX + halfWidth - 10)
        .attr('y', y + rowHeight / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#ffffff')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(`₹${item.put.ltp.toFixed(1)}  (IV: ${item.put.iv}%)`);

      // Put Momentum Tag
      if (topPutMomentum && topPutMomentum.strikePrice === item.strikePrice) {
        putCellGroup
          .append('text')
          .attr('x', putStartX + 10)
          .attr('y', y + rowHeight / 2 + 3)
          .attr('text-anchor', 'start')
          .attr('fill', '#fda4af')
          .attr('font-size', '9px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'extrabold')
          .text('⚡ HIGH MOMENTUM');
      }
    });

    // Bottom Color Gradient Legend
    const legendY = height + 15;
    const legendW = 180;
    const legendH = 8;

    // Call Gradient
    const defs = svg.append('defs');
    const callGrad = defs
      .append('linearGradient')
      .attr('id', 'call-legend-grad')
      .attr('x1', '0%')
      .attr('x2', '100%');
    callGrad.append('stop').attr('offset', '0%').attr('stop-color', '#0d2826');
    callGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981');

    g.append('rect')
      .attr('x', 0)
      .attr('y', legendY)
      .attr('width', legendW)
      .attr('height', legendH)
      .attr('fill', 'url(#call-legend-grad)')
      .attr('rx', 2);

    g.append('text')
      .attr('x', 0)
      .attr('y', legendY + 20)
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text(`Low IV (${minVal.toFixed(1)}%)`);

    g.append('text')
      .attr('x', legendW)
      .attr('y', legendY + 20)
      .attr('text-anchor', 'end')
      .attr('fill', '#34d399')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text(`High IV (${maxVal.toFixed(1)}%)`);

    // Put Gradient
    const putGrad = defs
      .append('linearGradient')
      .attr('id', 'put-legend-grad')
      .attr('x1', '0%')
      .attr('x2', '100%');
    putGrad.append('stop').attr('offset', '0%').attr('stop-color', '#290e1f');
    putGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f43f5e');

    const putLegendX = width - legendW;
    g.append('rect')
      .attr('x', putLegendX)
      .attr('y', legendY)
      .attr('width', legendW)
      .attr('height', legendH)
      .attr('fill', 'url(#put-legend-grad)')
      .attr('rx', 2);

    g.append('text')
      .attr('x', putLegendX)
      .attr('y', legendY + 20)
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text(`Low IV (${minVal.toFixed(1)}%)`);

    g.append('text')
      .attr('x', width)
      .attr('y', legendY + 20)
      .attr('text-anchor', 'end')
      .attr('fill', '#fb7185')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text(`High IV (${maxVal.toFixed(1)}%)`);

  }, [heatmapData, metric, symbol, onSelectOptionTrade]);

  return (
    <div className="bg-[#090d16] rounded-xl border border-slate-800 p-4 space-y-4">
      {/* Heatmap Control & Insight Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">D3 Volatility &amp; Momentum Heatmap</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                Live D3.js Render
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Identify volatility skew, gamma inflection points &amp; high-momentum ITM/OTM strike clusters
            </p>
          </div>
        </div>

        {/* Metric & Zoom Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMetric('IV')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                metric === 'IV' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              Implied Volatility (IV %)
            </button>
            <button
              onClick={() => setMetric('MOMENTUM_RATIO')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                metric === 'MOMENTUM_RATIO'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vol / OI Momentum
            </button>
            <button
              onClick={() => setMetric('GAMMA_ACCELERATION')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                metric === 'GAMMA_ACCELERATION'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gamma Explosion
            </button>
          </div>

          {/* Range Focus */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setStrikeRange('ATM_6')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                strikeRange === 'ATM_6' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              ±6 ATM Focus
            </button>
            <button
              onClick={() => setStrikeRange('ATM_10')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                strikeRange === 'ATM_10' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              ±10 Active Strikes
            </button>
            <button
              onClick={() => setStrikeRange('ALL')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                strikeRange === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              All Strikes
            </button>
          </div>
        </div>
      </div>

      {/* Top High-Momentum Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        {topCallMomentum && (
          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-emerald-900/50 text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] text-emerald-400 block font-bold uppercase">Top Call Momentum Strike</span>
                <span className="text-white font-bold">{symbol} {topCallMomentum.strikePrice} CE</span>
                <span className="text-slate-400 text-[10px] ml-2">₹{topCallMomentum.call.ltp} (IV: {topCallMomentum.call.iv}%)</span>
              </div>
            </div>
            <button
              onClick={() => onSelectOptionTrade(symbol, topCallMomentum.strikePrice, 'CE', topCallMomentum.call.ltp)}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
            >
              Instant Buy CE
            </button>
          </div>
        )}

        {topPutMomentum && (
          <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-rose-900/50 text-rose-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] text-rose-400 block font-bold uppercase">Top Put Momentum Strike</span>
                <span className="text-white font-bold">{symbol} {topPutMomentum.strikePrice} PE</span>
                <span className="text-slate-400 text-[10px] ml-2">₹{topPutMomentum.put.ltp} (IV: {topPutMomentum.put.iv}%)</span>
              </div>
            </div>
            <button
              onClick={() => onSelectOptionTrade(symbol, topPutMomentum.strikePrice, 'PE', topPutMomentum.put.ltp)}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
            >
              Instant Buy PE
            </button>
          </div>
        )}
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative overflow-x-auto w-full">
        <svg ref={svgRef} className="w-full select-none" />

        {/* Floating Quantitative Tooltip */}
        {hoveredStrike && (
          <div
            className="absolute pointer-events-none z-30 p-3 rounded-xl bg-slate-900/95 border border-cyan-500/60 shadow-2xl backdrop-blur-md text-xs font-mono text-white min-w-[220px]"
            style={{
              left: Math.min(window.innerWidth - 260, hoveredStrike.x + 20),
              top: hoveredStrike.y - 40,
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-bold text-cyan-300">
                {symbol} {hoveredStrike.strike} {hoveredStrike.type}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  hoveredStrike.type === 'CE' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                }`}
              >
                {hoveredStrike.item.isATM ? 'ATM STRIKE' : `${hoveredStrike.item.distanceFromATM > 0 ? '+' : ''}${hoveredStrike.item.distanceFromATM} pts`}
              </span>
            </div>

            {(() => {
              const opt = hoveredStrike.type === 'CE' ? hoveredStrike.item.call : hoveredStrike.item.put;
              return (
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">LTP (Premium):</span>
                    <span className="font-bold text-white">₹{opt.ltp.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Implied Volatility:</span>
                    <span className="font-bold text-amber-300">{opt.iv}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delta (Δ):</span>
                    <span className="font-bold text-cyan-300">{opt.delta > 0 ? `+${opt.delta}` : opt.delta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gamma (γ):</span>
                    <span className="font-bold text-purple-300">{opt.gamma}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Theta (θ decay):</span>
                    <span className="font-bold text-rose-400">{opt.theta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volume:</span>
                    <span className="text-white">{(opt.volume / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vol / OI Ratio:</span>
                    <span className="font-bold text-emerald-400">{opt.volOiRatio}x</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800 text-[10px] text-cyan-400 font-sans">
                    💡 Click cell to trigger instant buy execution
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
