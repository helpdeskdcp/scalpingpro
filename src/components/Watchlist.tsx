import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Globe,
  Layers,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronDown,
  Pin,
  LayoutGrid,
  List,
  GripVertical,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { Ticker } from '../types/market';

interface WatchlistProps {
  onQuickOrder: (symbol: string, side: 'BUY' | 'SELL') => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({ onQuickOrder }) => {
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'CARDS' | 'LIST'>('CARDS');

  // Filter tickers based on active tab
  const filteredByTab = tickers.filter(ticker => {
    if (watchlistType === 'NIFTY50') {
      return ticker.exchange === 'NSE' && ticker.instrumentType !== 'GLOBAL';
    }
    if (watchlistType === 'FO') {
      return (
        ticker.symbol === 'NIFTY 50' ||
        ticker.symbol === 'BANKNIFTY' ||
        ticker.symbol === 'FINNIFTY' ||
        ticker.symbol === 'RELIANCE' ||
        ticker.symbol === 'HDFCBANK' ||
        ticker.symbol === 'TATAMOTORS' ||
        ticker.symbol === 'INFY'
      );
    }
    if (watchlistType === 'GLOBAL') {
      return ticker.instrumentType === 'GLOBAL';
    }
    if (watchlistType === 'CUSTOM') {
      return customWatchlist.includes(ticker.symbol);
    }
    return true;
  });

  // Sort custom watchlist strictly by customWatchlist order when on CUSTOM tab
  const sortedTickers = watchlistType === 'CUSTOM'
    ? [...filteredByTab].sort((a, b) => {
        const idxA = customWatchlist.indexOf(a.symbol);
        const idxB = customWatchlist.indexOf(b.symbol);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      })
    : filteredByTab;

  // Apply search
  const displayedTickers = sortedTickers.filter(t =>
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMoveTicker = (index: number, direction: 'UP' | 'DOWN' | 'TOP') => {
    if (watchlistType === 'CUSTOM') {
      const ticker = displayedTickers[index];
      if (ticker) {
        moveCustomWatchlistSymbol(ticker.symbol, direction);
      }
    } else {
      const copy = [...tickers];
      const targetSymbol = displayedTickers[index].symbol;
      const originalIdx = copy.findIndex(t => t.symbol === targetSymbol);
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
    }
  };

  return (
    <div className="bg-[#0b101d] rounded-xl border border-slate-800/90 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header & Watchlist Tabs */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-200">
            <Layers className="h-4 w-4 text-cyan-400" />
            Watchlist
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              {displayedTickers.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-1 rounded text-[10px] transition ${
                  viewMode === 'CARDS'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Movable Cards View"
              >
                <LayoutGrid className="h-3 w-3" />
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1 rounded text-[10px] transition ${
                  viewMode === 'LIST'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Compact Table List"
              >
                <List className="h-3 w-3" />
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-800/60 transition cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setWatchlistType('NIFTY50')}
            className={`py-1.5 px-1 rounded-md font-semibold transition text-center truncate cursor-pointer ${
              watchlistType === 'NIFTY50'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nifty 50
          </button>
          <button
            onClick={() => setWatchlistType('FO')}
            className={`py-1.5 px-1 rounded-md font-semibold transition text-center truncate cursor-pointer ${
              watchlistType === 'FO'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            F&amp;O
          </button>
          <button
            onClick={() => setWatchlistType('GLOBAL')}
            className={`py-1.5 px-1 rounded-md font-semibold transition text-center truncate flex items-center justify-center gap-1 cursor-pointer ${
              watchlistType === 'GLOBAL'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-3 w-3" />
            Global
          </button>
          <button
            onClick={() => setWatchlistType('CUSTOM')}
            className={`py-1.5 px-1 rounded-md font-semibold transition text-center truncate flex items-center justify-center gap-1 cursor-pointer ${
              watchlistType === 'CUSTOM'
                ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="h-3 w-3 text-amber-400" />
            Favs
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search & filter tickers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>
      </div>

      {/* Content Area: Cards View or List View */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {displayedTickers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No instruments found matching your search.
          </div>
        ) : viewMode === 'CARDS' ? (
          /* Movable Cards Layout */
          displayedTickers.map((ticker, index) => {
            const isSelected = activeSymbol === ticker.symbol;
            const isPositive = ticker.change >= 0;
            const isCustom = customWatchlist.includes(ticker.symbol);
            const dayRangePercent =
              ticker.high > ticker.low
                ? Math.min(100, Math.max(0, ((ticker.ltp - ticker.low) / (ticker.high - ticker.low)) * 100))
                : 50;

            return (
              <div
                key={ticker.symbol}
                onClick={() => setActiveSymbol(ticker.symbol)}
                className={`p-2.5 rounded-lg border transition cursor-pointer relative group ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900/90 border-cyan-500/80 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800/80'
                }`}
              >
                {/* Top Row: Symbol, Exchange Badge, Move Controls & Favorite */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-xs text-white group-hover:text-cyan-300 transition">
                      {ticker.symbol}
                    </span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {ticker.exchange}
                    </span>
                    {ticker.instrumentType === 'GLOBAL' && (
                      <span className="text-[9px] font-mono px-1 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/40">
                        GLOBAL
                      </span>
                    )}
                  </div>

                  {/* Card Move Actions (Up, Down, Pin to Top) */}
                  <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleMoveTicker(index, 'TOP')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-cyan-400 transition"
                      title="Move card to top"
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveTicker(index, 'UP')}
                      className={`p-1 rounded hover:bg-slate-800 transition ${
                        index === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-cyan-300'
                      }`}
                      title="Move card up"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      disabled={index === displayedTickers.length - 1}
                      onClick={() => handleMoveTicker(index, 'DOWN')}
                      className={`p-1 rounded hover:bg-slate-800 transition ${
                        index === displayedTickers.length - 1
                          ? 'text-slate-700 cursor-not-allowed'
                          : 'text-slate-400 hover:text-cyan-300'
                      }`}
                      title="Move card down"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (isCustom) removeFromCustomWatchlist(ticker.symbol);
                        else addToCustomWatchlist(ticker.symbol);
                      }}
                      className={`p-1 rounded transition ${
                        isCustom ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                      }`}
                      title={isCustom ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Second Row: Company Name & LTP Price */}
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                    {ticker.name}
                  </span>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-white">
                      {ticker.currency === 'USD' ? '$' : '₹'}
                      {ticker.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Third Row: Day Range & Change % */}
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-800/60">
                  <div className="w-24">
                    <div className="flex justify-between text-[8px] text-slate-500">
                      <span>L: {ticker.low.toFixed(0)}</span>
                      <span>H: {ticker.high.toFixed(0)}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
                        style={{ width: `${dayRangePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold flex items-center gap-0.5 ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {isPositive ? '+' : ''}
                      {ticker.changePercent.toFixed(2)}%
                    </span>

                    {/* Quick Scalp Buy/Sell triggers */}
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onQuickOrder(ticker.symbol, 'BUY')}
                        className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] transition cursor-pointer shadow-sm"
                        title={`Quick Buy ${ticker.symbol}`}
                      >
                        B
                      </button>
                      <button
                        onClick={() => onQuickOrder(ticker.symbol, 'SELL')}
                        className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] transition cursor-pointer shadow-sm"
                        title={`Quick Sell ${ticker.symbol}`}
                      >
                        S
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Compact Table List View */
          <div className="divide-y divide-slate-800/60">
            {displayedTickers.map((ticker, index) => {
              const isSelected = activeSymbol === ticker.symbol;
              const isPositive = ticker.change >= 0;
              const isCustom = customWatchlist.includes(ticker.symbol);

              return (
                <div
                  key={ticker.symbol}
                  onClick={() => setActiveSymbol(ticker.symbol)}
                  className={`p-2 transition flex items-center justify-between cursor-pointer group ${
                    isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-white group-hover:text-cyan-300">
                        {ticker.symbol}
                      </span>
                      <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                        {ticker.exchange}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{ticker.name}</div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2 font-mono">
                    <div>
                      <div className="font-bold text-xs text-white">
                        {ticker.currency === 'USD' ? '$' : '₹'}
                        {ticker.ltp.toFixed(2)}
                      </div>
                      <div className={`text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onQuickOrder(ticker.symbol, 'BUY')}
                        className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px]"
                      >
                        B
                      </button>
                      <button
                        onClick={() => onQuickOrder(ticker.symbol, 'SELL')}
                        className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px]"
                      >
                        S
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Symbol Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-xl border border-slate-700 w-full max-w-md p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Add Symbol to Watchlist</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-3">
              <p className="text-xs text-slate-400 mb-2">
                Select from all Indian equity, derivatives &amp; international indices:
              </p>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 space-y-1">
                {tickers.map(ticker => {
                  const alreadyInCustom = customWatchlist.includes(ticker.symbol);
                  return (
                    <div
                      key={ticker.symbol}
                      className="py-2 flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="font-bold text-white">{ticker.symbol}</div>
                        <div className="text-[11px] text-slate-400">{ticker.name}</div>
                      </div>
                      <button
                        onClick={() => {
                          if (alreadyInCustom) {
                            removeFromCustomWatchlist(ticker.symbol);
                          } else {
                            addToCustomWatchlist(ticker.symbol);
                          }
                        }}
                        className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                          alreadyInCustom
                            ? 'bg-rose-950/70 border border-rose-700/60 text-rose-300 hover:bg-rose-900'
                            : 'bg-cyan-950/70 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900'
                        }`}
                      >
                        {alreadyInCustom ? 'Remove' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

