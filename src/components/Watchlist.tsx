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
  } = useTrading();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

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

  // Apply search
  const displayedTickers = filteredByTab.filter(t =>
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0b101d] rounded-xl border border-slate-800/90 flex flex-col h-full overflow-hidden">
      {/* Header & Watchlist Tabs */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-200">
            <Layers className="h-4 w-4 text-cyan-400" />
            Watchlist
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {displayedTickers.length}
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 transition"
          >
            <Plus className="h-3 w-3" />
            Add Symbol
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setWatchlistType('NIFTY50')}
            className={`py-1.5 px-2 rounded-md font-semibold transition text-center truncate ${
              watchlistType === 'NIFTY50'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nifty 50
          </button>
          <button
            onClick={() => setWatchlistType('FO')}
            className={`py-1.5 px-2 rounded-md font-semibold transition text-center truncate ${
              watchlistType === 'FO'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            F&amp;O
          </button>
          <button
            onClick={() => setWatchlistType('GLOBAL')}
            className={`py-1.5 px-2 rounded-md font-semibold transition text-center truncate flex items-center justify-center gap-1 ${
              watchlistType === 'GLOBAL'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-3 w-3" />
            Global
          </button>
          <button
            onClick={() => setWatchlistType('CUSTOM')}
            className={`py-1.5 px-2 rounded-md font-semibold transition text-center truncate flex items-center justify-center gap-1 ${
              watchlistType === 'CUSTOM'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="h-3 w-3 text-amber-400" />
            Custom
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search stock, index, global..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>
      </div>

      {/* List of Tickers */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {displayedTickers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No instruments found matching your search.
          </div>
        ) : (
          displayedTickers.map(ticker => {
            const isSelected = activeSymbol === ticker.symbol;
            const isPositive = ticker.change >= 0;
            const isCustom = customWatchlist.includes(ticker.symbol);

            return (
              <div
                key={ticker.symbol}
                onClick={() => setActiveSymbol(ticker.symbol)}
                className={`p-2.5 transition flex items-center justify-between cursor-pointer group ${
                  isSelected
                    ? 'bg-slate-800/70 border-l-2 border-cyan-400'
                    : 'hover:bg-slate-900/70'
                }`}
              >
                {/* Left: Symbol details */}
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-white group-hover:text-cyan-300 transition">
                      {ticker.symbol}
                    </span>
                    <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                      {ticker.exchange}
                    </span>
                    {ticker.instrumentType === 'GLOBAL' && (
                      <span className="text-[9px] font-mono px-1 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/40">
                        GLOBAL
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[170px] mt-0.5">
                    {ticker.name}
                  </div>
                </div>

                {/* Right: LTP, Change %, Quick Order triggers */}
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <div className="font-mono font-bold text-xs text-white">
                      {ticker.currency === 'USD' ? '$' : '₹'}
                      {ticker.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div
                      className={`text-[11px] font-mono font-semibold flex items-center justify-end gap-0.5 ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3 inline" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 inline" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}
                        {ticker.change.toFixed(2)} ({isPositive ? '+' : ''}
                        {ticker.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {/* Hover Quick Buy/Sell Buttons */}
                  <div className="hidden group-hover:flex items-center gap-1 pl-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onQuickOrder(ticker.symbol, 'BUY');
                      }}
                      className="px-2 py-1 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[10px] tracking-wide transition shadow-sm"
                      title={`Instant Buy ${ticker.symbol}`}
                    >
                      B
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onQuickOrder(ticker.symbol, 'SELL');
                      }}
                      className="px-2 py-1 rounded bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-[10px] tracking-wide transition shadow-sm"
                      title={`Instant Sell ${ticker.symbol}`}
                    >
                      S
                    </button>
                    {watchlistType === 'CUSTOM' ? (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          removeFromCustomWatchlist(ticker.symbol);
                        }}
                        className="p-1 rounded bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                        title="Remove from Custom Watchlist"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    ) : (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (isCustom) removeFromCustomWatchlist(ticker.symbol);
                          else addToCustomWatchlist(ticker.symbol);
                        }}
                        className={`p-1 rounded ${
                          isCustom ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
                        }`}
                        title={isCustom ? 'Remove star' : 'Add to Custom Watchlist'}
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
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
                className="text-slate-400 hover:text-white text-xs"
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
                      className="py-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold font-mono text-white">{ticker.symbol}</div>
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
                        className={`px-3 py-1 rounded text-[11px] font-semibold transition ${
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
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
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
