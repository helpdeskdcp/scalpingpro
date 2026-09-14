import React, { useState, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Layers,
  Star,
  Zap,
  ArrowUpDown,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  LayoutGrid,
  Table as TableIcon,
  Columns,
  ChevronUp,
  ChevronDown,
  Pin,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { Ticker } from '../types/market';

interface WatchlistTableViewProps {
  onQuickOrder: (symbol: string, side: 'BUY' | 'SELL', price?: number) => void;
  onOpenAlert?: (symbol: string, price: number) => void;
  onSelectOptionChain?: () => void;
}

type LayoutDisplayMode = 'SEPARATE_TABLES' | 'COMBINED_TABLE' | 'CARDS_GRID';

export const WatchlistTableView: React.FC<WatchlistTableViewProps> = ({
  onQuickOrder,
  onOpenAlert,
  onSelectOptionChain,
}) => {
  const {
    tickers,
    activeSymbol,
    setActiveSymbol,
    watchlistType,
    setWatchlistType,
    customWatchlist,
    addToCustomWatchlist,
    removeFromCustomWatchlist,
    moveCustomWatchlistSymbol,
    reorderTickers,
  } = useTrading();

  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutDisplayMode>('SEPARATE_TABLES');
  const [sortField, setSortField] = useState<'symbol' | 'ltp' | 'changePercent' | 'volume'>('changePercent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Move ticker up/down/top
  const handleMoveTicker = (symbol: string, direction: 'UP' | 'DOWN' | 'TOP') => {
    if (customWatchlist.includes(symbol)) {
      moveCustomWatchlistSymbol(symbol, direction);
    }
    const copy = [...tickers];
    const originalIdx = copy.findIndex(t => t.symbol === symbol);
    if (originalIdx === -1) return;

    if (direction === 'TOP') {
      const [item] = copy.splice(originalIdx, 1);
      copy.unshift(item);
    } else if (direction === 'UP' && originalIdx > 0) {
      const temp = copy[originalIdx - 1];
      copy[originalIdx - 1] = copy[originalIdx];
      copy[originalIdx] = temp;
    } else if (direction === 'DOWN' && originalIdx < copy.length - 1) {
      const temp = copy[originalIdx + 1];
      copy[originalIdx + 1] = copy[originalIdx];
      copy[originalIdx] = temp;
    }
    reorderTickers(copy);
  };

  // Segmented tables groupings
  const indicesTickers = useMemo(() => {
    return tickers.filter(t => t.instrumentType === 'INDEX' || ['NIFTY 50', 'BANKNIFTY', 'FINNIFTY', 'GIFT NIFTY'].includes(t.symbol));
  }, [tickers]);

  const equitiesTickers = useMemo(() => {
    return tickers.filter(t => t.instrumentType === 'EQUITY');
  }, [tickers]);

  const globalTickers = useMemo(() => {
    return tickers.filter(t => t.instrumentType === 'GLOBAL' || t.exchange === 'GLOBAL' || t.exchange === 'NSE IX');
  }, [tickers]);

  const customTickers = useMemo(() => {
    return customWatchlist
      .map(sym => tickers.find(t => t.symbol === sym))
      .filter((t): t is Ticker => !!t);
  }, [tickers, customWatchlist]);

  // Combined filtered tickers
  const filteredTickers = useMemo(() => {
    let list = tickers;
    if (watchlistType === 'NIFTY50') {
      list = tickers.filter(t => t.exchange === 'NSE' && t.instrumentType !== 'GLOBAL');
    } else if (watchlistType === 'FO') {
      list = tickers.filter(
        t =>
          t.symbol === 'NIFTY 50' ||
          t.symbol === 'BANKNIFTY' ||
          t.symbol === 'FINNIFTY' ||
          t.symbol === 'RELIANCE' ||
          t.symbol === 'HDFCBANK' ||
          t.symbol === 'TATAMOTORS' ||
          t.symbol === 'INFY' ||
          t.symbol === 'ICICIBANK' ||
          t.symbol === 'SBIN' ||
          t.symbol === 'BAJFINANCE'
      );
    } else if (watchlistType === 'GLOBAL') {
      list = tickers.filter(t => t.instrumentType === 'GLOBAL');
    } else if (watchlistType === 'CUSTOM') {
      list = customTickers;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [tickers, watchlistType, customTickers, searchQuery, sortField, sortOrder]);

  const handleSort = (field: 'symbol' | 'ltp' | 'changePercent' | 'volume') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Reusable Table Component for Separate Tables
  const renderSingleTable = (title: string, subtitle: string, items: Ticker[], badgeColor: string) => {
    const list = items.filter(t =>
      searchQuery.trim()
        ? t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

    if (list.length === 0 && searchQuery.trim()) return null;

    return (
      <div className="bg-[#0e1424] rounded-xl border border-slate-800/90 overflow-hidden shadow-lg mb-4">
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${badgeColor}`} />
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">{title}</h3>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {list.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{subtitle}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800/80 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="py-2 px-3 text-center w-16">Reorder</th>
                <th className="py-2 px-3 font-semibold">Symbol / Name</th>
                <th className="py-2 px-3 font-semibold text-right">LTP</th>
                <th className="py-2 px-3 font-semibold text-right">24h Change</th>
                <th className="py-2 px-3 font-semibold text-center hidden md:table-cell">Day Range (L - H)</th>
                <th className="py-2 px-3 font-semibold text-right hidden lg:table-cell">Volume</th>
                <th className="py-2 px-4 font-semibold text-right">Scalping Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {list.map((ticker, index) => {
                const isSelected = activeSymbol === ticker.symbol;
                const isPositive = ticker.change >= 0;
                const isFav = customWatchlist.includes(ticker.symbol);
                const dayRangePercent =
                  ticker.high > ticker.low
                    ? Math.min(100, Math.max(0, ((ticker.ltp - ticker.low) / (ticker.high - ticker.low)) * 100))
                    : 50;

                return (
                  <tr
                    key={ticker.symbol}
                    onClick={() => setActiveSymbol(ticker.symbol)}
                    className={`group transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/50 border-l-2 border-l-cyan-400'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Reorder Buttons & Fav */}
                    <td className="py-2 px-2 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => handleMoveTicker(ticker.symbol, 'TOP')}
                          className="p-0.5 rounded hover:bg-slate-800 text-slate-600 hover:text-cyan-400 transition"
                          title="Pin to top"
                        >
                          <Pin className="h-3 w-3" />
                        </button>
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveTicker(ticker.symbol, 'UP')}
                          className={`p-0.5 rounded transition ${
                            index === 0 ? 'text-slate-800 cursor-not-allowed' : 'text-slate-500 hover:text-cyan-300'
                          }`}
                          title="Move up"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          disabled={index === list.length - 1}
                          onClick={() => handleMoveTicker(ticker.symbol, 'DOWN')}
                          className={`p-0.5 rounded transition ${
                            index === list.length - 1 ? 'text-slate-800 cursor-not-allowed' : 'text-slate-500 hover:text-cyan-300'
                          }`}
                          title="Move down"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() =>
                            isFav ? removeFromCustomWatchlist(ticker.symbol) : addToCustomWatchlist(ticker.symbol)
                          }
                          className="p-0.5 text-slate-600 hover:text-amber-400 transition ml-0.5"
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star
                            className={`h-3 w-3 ${
                              isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      </div>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-xs group-hover:text-cyan-300 transition">
                          {ticker.symbol}
                        </span>
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          {ticker.exchange}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px] sm:max-w-[220px]">
                        {ticker.name}
                      </div>
                    </td>

                    {/* LTP */}
                    <td className="py-2 px-3 text-right font-bold text-white text-xs">
                      {ticker.currency === 'USD' ? '$' : '₹'}
                      {ticker.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Change */}
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isPositive ? '+' : ''}
                        {ticker.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Day Range */}
                    <td className="py-2 px-3 hidden md:table-cell">
                      <div className="w-32 mx-auto">
                        <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                          <span>{ticker.low.toFixed(0)}</span>
                          <span>{ticker.high.toFixed(0)}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
                            style={{ width: `${dayRangePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-2 px-3 text-right hidden lg:table-cell text-slate-300 text-[11px]">
                      {(ticker.volume / 100000).toFixed(2)} L
                    </td>

                    {/* Scalping Buttons */}
                    <td className="py-2 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onQuickOrder(ticker.symbol, 'BUY', ticker.ltp)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow transition active:scale-95 cursor-pointer"
                        >
                          BUY
                        </button>
                        <button
                          onClick={() => onQuickOrder(ticker.symbol, 'SELL', ticker.ltp)}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shadow transition active:scale-95 cursor-pointer"
                        >
                          SELL
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0b101d] rounded-xl border border-slate-800/90 shadow-2xl flex flex-col overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-slate-800/90 bg-gradient-to-r from-slate-900 to-[#0c1220] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                Systematic Market Watchlist
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                {filteredTickers.length} Instruments
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Real-Time Market Depth, PCR &amp; One-Click Scalping Execution
            </p>
          </div>
        </div>

        {/* Layout Modes Toggle (Separate Tables / Combined Table / Cards Grid) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setLayoutMode('SEPARATE_TABLES')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                layoutMode === 'SEPARATE_TABLES'
                  ? 'bg-cyan-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Separate Tables by Market Segment"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Separate Tables</span>
            </button>
            <button
              onClick={() => setLayoutMode('COMBINED_TABLE')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                layoutMode === 'COMBINED_TABLE'
                  ? 'bg-cyan-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Combined Unified Table"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Single Table</span>
            </button>
            <button
              onClick={() => setLayoutMode('CARDS_GRID')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                layoutMode === 'CARDS_GRID'
                  ? 'bg-cyan-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Movable Card Matrix"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Categories Bar & Search */}
      <div className="px-4 py-2.5 bg-[#090d16] border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {layoutMode !== 'SEPARATE_TABLES' && (
            <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['NIFTY50', 'FO', 'GLOBAL', 'CUSTOM'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setWatchlistType(tab)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                    watchlistType === tab
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'NIFTY50' && 'Nifty 50'}
                  {tab === 'FO' && 'F&O'}
                  {tab === 'GLOBAL' && 'Global'}
                  {tab === 'CUSTOM' && `Favorites (${customWatchlist.length})`}
                </button>
              ))}
            </div>
          )}

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol (e.g. NIFTY, RELIANCE)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live WebSocket 100ms
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px]">Click row to select</span>
        </div>
      </div>

      {/* Main Content Render */}
      <div className="p-4 overflow-y-auto max-h-[750px]">
        {layoutMode === 'SEPARATE_TABLES' ? (
          /* Separate Segmented Tables */
          <div>
            {customTickers.length > 0 &&
              renderSingleTable(
                '⭐ My Pinned Favorites (Custom)',
                'Priority monitored instruments with reordering controls',
                customTickers,
                'bg-amber-400'
              )}

            {renderSingleTable(
              'Benchmark Indices & Derivatives',
              'Nifty 50, Bank Nifty, Fin Nifty & Index Futures',
              indicesTickers,
              'bg-cyan-400'
            )}

            {renderSingleTable(
              'F&O High Beta Equities',
              'Liquid Large-cap stocks with Options & Futures chains',
              equitiesTickers,
              'bg-indigo-400'
            )}

            {renderSingleTable(
              'Global Macro & International Indices',
              'S&P 500, Nasdaq, GIFT Nifty & Commodities',
              globalTickers,
              'bg-emerald-400'
            )}
          </div>
        ) : layoutMode === 'CARDS_GRID' ? (
          /* Movable Cards Matrix Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredTickers.map((ticker, index) => {
              const isSelected = activeSymbol === ticker.symbol;
              const isPositive = ticker.change >= 0;
              const isFav = customWatchlist.includes(ticker.symbol);
              const dayRangePercent =
                ticker.high > ticker.low
                  ? Math.min(100, Math.max(0, ((ticker.ltp - ticker.low) / (ticker.high - ticker.low)) * 100))
                  : 50;

              return (
                <div
                  key={ticker.symbol}
                  onClick={() => setActiveSymbol(ticker.symbol)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-400/90 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  <div>
                    {/* Header with symbol, exchange and card move buttons */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-sm text-white">
                          {ticker.symbol}
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {ticker.exchange}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleMoveTicker(ticker.symbol, 'TOP')}
                          className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-cyan-400 transition"
                          title="Pin to top"
                        >
                          <Pin className="h-3 w-3" />
                        </button>
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveTicker(ticker.symbol, 'UP')}
                          className={`p-1 rounded transition ${
                            index === 0 ? 'text-slate-800 cursor-not-allowed' : 'text-slate-400 hover:text-cyan-300'
                          }`}
                          title="Move card up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={index === filteredTickers.length - 1}
                          onClick={() => handleMoveTicker(ticker.symbol, 'DOWN')}
                          className={`p-1 rounded transition ${
                            index === filteredTickers.length - 1
                              ? 'text-slate-800 cursor-not-allowed'
                              : 'text-slate-400 hover:text-cyan-300'
                          }`}
                          title="Move card down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            isFav ? removeFromCustomWatchlist(ticker.symbol) : addToCustomWatchlist(ticker.symbol)
                          }
                          className="p-1 text-slate-500 hover:text-amber-400 transition"
                          title={isFav ? 'Remove favorite' : 'Add favorite'}
                        >
                          <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate mb-3">{ticker.name}</div>

                    {/* Price and 24h change */}
                    <div className="flex items-baseline justify-between font-mono mb-3">
                      <div className="text-lg font-black text-white">
                        {ticker.currency === 'USD' ? '$' : '₹'}
                        {ticker.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div
                        className={`text-xs font-bold flex items-center gap-0.5 ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {isPositive ? '+' : ''}
                        {ticker.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    {/* Day Range Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400">
                        <span>L: {ticker.low.toFixed(0)}</span>
                        <span>H: {ticker.high.toFixed(0)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
                          style={{ width: `${dayRangePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scalping buy & sell buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onQuickOrder(ticker.symbol, 'BUY', ticker.ltp)}
                      className="py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow transition active:scale-95 cursor-pointer text-center"
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => onQuickOrder(ticker.symbol, 'SELL', ticker.ltp)}
                      className="py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow transition active:scale-95 cursor-pointer text-center"
                    >
                      SELL
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Combined Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider select-none">
                  <th className="py-2.5 px-3 font-semibold text-center w-10">Fav</th>
                  <th
                    onClick={() => handleSort('symbol')}
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Symbol / Name</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('ltp')}
                    className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>LTP (₹)</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('changePercent')}
                    className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>24h Change</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center hidden md:table-cell">
                    Day Range (Low - High)
                  </th>
                  <th
                    onClick={() => handleSort('volume')}
                    className="py-2.5 px-3 font-semibold text-right hidden sm:table-cell cursor-pointer hover:text-white transition"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Volume</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right hidden lg:table-cell">
                    Open Interest / PCR
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-right">Quick Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTickers.map(ticker => {
                  const isSelected = activeSymbol === ticker.symbol;
                  const isPositive = ticker.change >= 0;
                  const isFav = customWatchlist.includes(ticker.symbol);
                  const dayRangePercent =
                    ticker.high > ticker.low
                      ? Math.min(100, Math.max(0, ((ticker.ltp - ticker.low) / (ticker.high - ticker.low)) * 100))
                      : 50;

                  return (
                    <tr
                      key={ticker.symbol}
                      onClick={() => setActiveSymbol(ticker.symbol)}
                      className={`group transition cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() =>
                            isFav ? removeFromCustomWatchlist(ticker.symbol) : addToCustomWatchlist(ticker.symbol)
                          }
                          className="text-slate-500 hover:text-amber-400 transition"
                        >
                          <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        </button>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="font-extrabold text-white text-xs group-hover:text-cyan-300 transition">
                            {ticker.symbol}
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            {ticker.exchange}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                          {ticker.name}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-white text-xs">
                        {ticker.currency === 'USD' ? '$' : '₹'}
                        {ticker.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 font-bold ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {isPositive ? '+' : ''}
                          {ticker.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3 hidden md:table-cell">
                        <div className="w-36 mx-auto">
                          <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                            <span>L: {ticker.low.toFixed(0)}</span>
                            <span>H: {ticker.high.toFixed(0)}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full"
                              style={{ width: `${dayRangePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right hidden sm:table-cell text-slate-300">
                        <div>{(ticker.volume / 100000).toFixed(2)} Lakh</div>
                      </td>

                      <td className="py-2.5 px-3 text-right hidden lg:table-cell font-mono">
                        <div className="text-cyan-300">
                          OI: {((ticker.openInterest || 1250000) / 100000).toFixed(2)} L
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onQuickOrder(ticker.symbol, 'BUY', ticker.ltp)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer"
                          >
                            BUY
                          </button>
                          <button
                            onClick={() => onQuickOrder(ticker.symbol, 'SELL', ticker.ltp)}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer"
                          >
                            SELL
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Real-time Angel One SmartAPI Feed Tick-by-Tick</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Active Selection: <strong className="text-cyan-300">{activeSymbol}</strong></span>
          {onSelectOptionChain && (
            <button
              onClick={onSelectOptionChain}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 underline"
            >
              Open Options Matrix <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

