import React, { useState } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Navbar } from './components/Navbar';
import { SebiComplianceBanner } from './components/SebiComplianceBanner';
import { Watchlist } from './components/Watchlist';
import { WatchlistTableView } from './components/WatchlistTableView';
import { SignalsTableView } from './components/SignalsTableView';
import { TradingChart } from './components/TradingChart';
import { OptionChain } from './components/OptionChain';
import { AiStrategyEngine } from './components/AiStrategyEngine';
import { MarketSentimentGauge } from './components/MarketSentimentGauge';
import { GlobalMarketMacro } from './components/GlobalMarketMacro';
import { PortfolioView } from './components/PortfolioView';
import { OrderExecutionModal } from './components/OrderExecutionModal';
import { PriceAlertsModal } from './components/PriceAlertsModal';
import { BrokerAuthModal } from './components/BrokerAuthModal';
import { DeveloperSettingsModal } from './components/DeveloperSettingsModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SebiDocumentationModal } from './components/SebiDocumentationModal';
import { TelegramSignalsModal } from './components/TelegramSignalsModal';
import { useDeviceDetect } from './hooks/useDeviceDetect';
import {
  LayoutDashboard,
  Layers,
  BrainCircuit,
  Briefcase,
  Globe,
  ShieldAlert,
  Send,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Table,
  LineChart,
  Sparkles,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { activeSymbol, activeTicker, brokerMode } = useTrading();
  const device = useDeviceDetect();

  // Systematic View Navigation Tabs
  const [mainView, setMainView] = useState<
    'WATCHLIST' | 'TERMINAL' | 'STRATEGY' | 'SIGNALS' | 'PORTFOLIO' | 'GLOBAL'
  >('TERMINAL');

  // Modal states
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderParams, setOrderParams] = useState<{
    symbol?: string;
    side?: 'BUY' | 'SELL';
    price?: number;
  }>({});

  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [alertParams, setAlertParams] = useState<{
    symbol?: string;
    price?: number;
  }>({});

  const [brokerModalOpen, setBrokerModalOpen] = useState(false);
  const [developerModalOpen, setDeveloperModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [sebiDocModalOpen, setSebiDocModalOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);

  // Quick order handler
  const handleQuickOrder = (symbol: string, side: 'BUY' | 'SELL', price?: number) => {
    setOrderParams({ symbol, side, price });
    setOrderModalOpen(true);
  };

  // Quick alert handler
  const handleOpenAlert = (symbol: string, price: number) => {
    setAlertParams({ symbol, price });
    setAlertsModalOpen(true);
  };

  // Option trade selection from Option Chain
  const handleSelectOptionTrade = (
    symbol: string,
    strike: number,
    type: 'CE' | 'PE',
    price: number
  ) => {
    const formattedSymbol = `${symbol} ${strike} ${type}`;
    setOrderParams({
      symbol: formattedSymbol,
      side: 'BUY',
      price,
    });
    setOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 pb-16 md:pb-0">
      {/* Top Navbar */}
      <Navbar
        onOpenBrokerAuth={() => setBrokerModalOpen(true)}
        onOpenDeveloperModal={() => setDeveloperModalOpen(true)}
        onOpenSubscriptionModal={() => setSubscriptionModalOpen(true)}
        onOpenAlertsModal={() => setAlertsModalOpen(true)}
        onOpenSebiDocModal={() => setSebiDocModalOpen(true)}
        onOpenTelegramModal={() => setTelegramModalOpen(true)}
      />

      {/* Mandatory SEBI Compliance Ribbon */}
      <SebiComplianceBanner onOpenDocModal={() => setSebiDocModalOpen(true)} />

      {/* Main Systematic Workspace Navigation & Device Auto-Detection Bar */}
      <div className="bg-[#090d18] border-b border-slate-800/80 px-3 sm:px-4 py-1.5 sticky top-0 z-30 backdrop-blur-md bg-opacity-95">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
          {/* Systematic Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setMainView('WATCHLIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                mainView === 'WATCHLIST'
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Table className="h-3.5 w-3.5 text-cyan-400" />
              Watchlist Table
            </button>

            <button
              onClick={() => setMainView('TERMINAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                mainView === 'TERMINAL'
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LineChart className="h-3.5 w-3.5 text-cyan-400" />
              Terminal &amp; F&amp;O Chain
            </button>

            <button
              onClick={() => setMainView('STRATEGY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                mainView === 'STRATEGY'
                  ? 'bg-indigo-950/90 text-indigo-300 border border-indigo-500/60 shadow-sm shadow-indigo-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BrainCircuit className="h-3.5 w-3.5 text-indigo-400" />
              SMC &amp; Strategy Engine
            </button>

            <button
              onClick={() => setMainView('SIGNALS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                mainView === 'SIGNALS'
                  ? 'bg-sky-950/90 text-sky-300 border border-sky-500/60 shadow-sm shadow-sky-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Send className="h-3.5 w-3.5 text-sky-400" />
              Signals Table (Telegram)
            </button>

            <button
              onClick={() => setMainView('PORTFOLIO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                mainView === 'PORTFOLIO'
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-sm shadow-emerald-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
              Paper Trading &amp; Orders
            </button>

            <button
              onClick={() => setMainView('GLOBAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                mainView === 'GLOBAL'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              Global Macro
            </button>
          </div>

          {/* Right Status Badges & Device Auto-Detect Indicator */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono shrink-0">
            {/* Device Auto-Detect Badge */}
            <div className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              {device.isMobile ? (
                <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
              ) : device.isTablet ? (
                <Tablet className="h-3.5 w-3.5 text-indigo-400" />
              ) : (
                <Monitor className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>
                {device.isAndroid
                  ? 'Android Auto-Detected'
                  : device.isMobile
                  ? 'Mobile Auto-Fit'
                  : device.isTablet
                  ? 'Tablet Auto-Fit'
                  : 'Desktop Fit-to-Page'}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">100% Fit</span>
            </div>

            <div className="text-slate-400">
              Active: <strong className="text-white">{activeSymbol}</strong>
            </div>

            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">
                {brokerMode === 'PAPER' ? 'Virtual Paper (₹2.45L)' : 'Live Angel One'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Systematic Content Area (Responsive Fit-to-Page Layout) */}
      <main className="max-w-[1920px] w-full mx-auto p-2 sm:p-4 flex-1 space-y-4">
        {/* VIEW 1: Full Systematic Watchlist Table */}
        {mainView === 'WATCHLIST' && (
          <WatchlistTableView
            onQuickOrder={handleQuickOrder}
            onOpenAlert={handleOpenAlert}
            onSelectOptionChain={() => setMainView('TERMINAL')}
          />
        )}

        {/* VIEW 2: Complete Terminal View (Split Desktop / Adaptive Tablet & Mobile) */}
        {mainView === 'TERMINAL' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {/* Left Column: Fast Watchlist Sidebar */}
            <div className="xl:col-span-3 h-[520px] xl:h-[calc(100vh-160px)] sticky top-[72px]">
              <Watchlist onQuickOrder={handleQuickOrder} />
            </div>

            {/* Right Column: Chart, Option Matrix & Sentiment */}
            <div className="xl:col-span-9 space-y-4">
              {/* Radial Market Sentiment */}
              <MarketSentimentGauge onExploreStrategy={() => setMainView('STRATEGY')} />

              {/* Technical Chart */}
              <TradingChart
                onQuickOrder={handleQuickOrder}
                onOpenAlertModal={handleOpenAlert}
              />

              {/* F&O Option Chain */}
              <OptionChain onSelectOptionTrade={handleSelectOptionTrade} />
            </div>
          </div>
        )}

        {/* VIEW 3: Smart Money & AI Strategy Engine */}
        {mainView === 'STRATEGY' && (
          <div className="space-y-4">
            <MarketSentimentGauge onExploreStrategy={() => {}} />
            <AiStrategyEngine />
          </div>
        )}

        {/* VIEW 4: Signals Table (Telegram & Algorithm Signals Feed) */}
        {mainView === 'SIGNALS' && (
          <SignalsTableView
            onQuickOrder={handleQuickOrder}
            onOpenSettings={() => setTelegramModalOpen(true)}
          />
        )}

        {/* VIEW 5: Paper Trading, Live Positions, Holdings & Orders Tables */}
        {mainView === 'PORTFOLIO' && (
          <div className="space-y-4">
            <PortfolioView />
          </div>
        )}

        {/* VIEW 6: Global Macro & Indices */}
        {mainView === 'GLOBAL' && (
          <div className="space-y-4">
            <GlobalMarketMacro />
          </div>
        )}
      </main>

      {/* Mobile / Android / Tablet Bottom Navigation Dock */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080d19]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl font-mono text-[10px]">
        <button
          onClick={() => setMainView('WATCHLIST')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            mainView === 'WATCHLIST' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Table className="h-4 w-4" />
          <span>Watchlist</span>
        </button>

        <button
          onClick={() => setMainView('TERMINAL')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            mainView === 'TERMINAL' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LineChart className="h-4 w-4" />
          <span>Terminal</span>
        </button>

        <button
          onClick={() => setMainView('STRATEGY')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            mainView === 'STRATEGY' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BrainCircuit className="h-4 w-4" />
          <span>SMC Strategy</span>
        </button>

        <button
          onClick={() => setMainView('SIGNALS')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            mainView === 'SIGNALS' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Send className="h-4 w-4" />
          <span>Signals</span>
        </button>

        <button
          onClick={() => setMainView('PORTFOLIO')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            mainView === 'PORTFOLIO' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Paper Trade</span>
        </button>
      </div>

      {/* Footer Regulatory Seals & Disclosures */}
      <footer className="bg-[#050810] border-t border-slate-800/80 py-4 px-4 text-xs font-mono text-slate-500">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>
              <strong>Regulatory Notice:</strong> Strictly for educational, research, and algorithmic simulation purposes. We are not a SEBI-registered broker or financial advisor. No guarantees (गॅरंटी) provided.
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setSebiDocModalOpen(true)}
              className="hover:text-amber-300 underline cursor-pointer"
            >
              SEBI Disclosures
            </button>
            <span>•</span>
            <button
              onClick={() => setBrokerModalOpen(true)}
              className="hover:text-cyan-300 underline cursor-pointer"
            >
              Angel One SmartAPI
            </button>
            <span>•</span>
            <button
              onClick={() => setDeveloperModalOpen(true)}
              className="hover:text-indigo-300 underline cursor-pointer"
            >
              Developer Audit Registry
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <OrderExecutionModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        defaultSymbol={orderParams.symbol}
        defaultSide={orderParams.side}
        defaultPrice={orderParams.price}
      />

      <PriceAlertsModal
        isOpen={alertsModalOpen}
        onClose={() => setAlertsModalOpen(false)}
        defaultSymbol={alertParams.symbol}
        defaultPrice={alertParams.price}
      />

      <BrokerAuthModal
        isOpen={brokerModalOpen}
        onClose={() => setBrokerModalOpen(false)}
      />

      <DeveloperSettingsModal
        isOpen={developerModalOpen}
        onClose={() => setDeveloperModalOpen(false)}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />

      <SebiDocumentationModal
        isOpen={sebiDocModalOpen}
        onClose={() => setSebiDocModalOpen(false)}
      />

      <TelegramSignalsModal
        isOpen={telegramModalOpen}
        onClose={() => setTelegramModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <TradingProvider>
      <DashboardContent />
    </TradingProvider>
  );
}
