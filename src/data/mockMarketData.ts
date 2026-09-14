import { Ticker, OptionChainData, OptionStrike, StrategyRecommendation, AuditLog, HistoricalCandle } from '../types/market';

export const INITIAL_TICKERS: Ticker[] = [
  // Indian Benchmark Indices
  {
    symbol: 'NIFTY 50',
    name: 'Nifty 50 Index (NSE)',
    exchange: 'NSE',
    ltp: 24824.50,
    change: 142.30,
    changePercent: 0.58,
    high: 24895.80,
    low: 24680.10,
    open: 24710.00,
    close: 24682.20,
    volume: 382910400,
    lotSize: 25,
    instrumentType: 'INDEX',
    currency: 'INR',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'BANKNIFTY',
    name: 'Nifty Bank Index (NSE)',
    exchange: 'NSE',
    ltp: 51940.80,
    change: 320.45,
    changePercent: 0.62,
    high: 52120.00,
    low: 51680.00,
    open: 51750.20,
    close: 51620.35,
    volume: 194820100,
    lotSize: 15,
    instrumentType: 'INDEX',
    currency: 'INR',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'FINNIFTY',
    name: 'Nifty Financial Services (NSE)',
    exchange: 'NSE',
    ltp: 23680.20,
    change: 85.60,
    changePercent: 0.36,
    high: 23740.00,
    low: 23550.00,
    open: 23610.00,
    close: 23594.60,
    volume: 82019400,
    lotSize: 25,
    instrumentType: 'INDEX',
    currency: 'INR',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'SENSEX',
    name: 'BSE SENSEX Index',
    exchange: 'BSE',
    ltp: 81450.60,
    change: 410.25,
    changePercent: 0.51,
    high: 81680.00,
    low: 81120.00,
    open: 81200.00,
    close: 81040.35,
    volume: 124901000,
    lotSize: 10,
    instrumentType: 'INDEX',
    currency: 'INR',
    lastUpdated: new Date().toISOString(),
  },

  // Key Indian Stocks (NSE)
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE',
    ltp: 2985.40,
    change: 28.50,
    changePercent: 0.96,
    high: 3004.00,
    low: 2955.10,
    open: 2962.00,
    close: 2956.90,
    volume: 8420190,
    lotSize: 250,
    instrumentType: 'EQUITY',
    currency: 'INR',
    marketCap: '₹20.2T',
    peRatio: 28.4,
    sector: 'Energy & Conglomerate',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    exchange: 'NSE',
    ltp: 1648.70,
    change: 14.20,
    changePercent: 0.87,
    high: 1658.00,
    low: 1630.50,
    open: 1635.00,
    close: 1634.50,
    volume: 14209500,
    lotSize: 550,
    instrumentType: 'EQUITY',
    currency: 'INR',
    marketCap: '₹12.6T',
    peRatio: 19.8,
    sector: 'Banking & Finance',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    ltp: 4120.30,
    change: -18.70,
    changePercent: -0.45,
    high: 4165.00,
    low: 4102.00,
    open: 4150.00,
    close: 4139.00,
    volume: 3105400,
    lotSize: 175,
    instrumentType: 'EQUITY',
    currency: 'INR',
    marketCap: '₹15.1T',
    peRatio: 31.2,
    sector: 'Information Technology',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    exchange: 'NSE',
    ltp: 1845.20,
    change: 12.80,
    changePercent: 0.70,
    high: 1862.00,
    low: 1828.00,
    open: 1835.00,
    close: 1832.40,
    volume: 6890400,
    lotSize: 400,
    instrumentType: 'EQUITY',
    currency: 'INR',
    marketCap: '₹7.6T',
    peRatio: 27.6,
    sector: 'Information Technology',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd',
    exchange: 'NSE',
    ltp: 982.50,
    change: 22.40,
    changePercent: 2.33,
    high: 994.00,
    low: 962.00,
    open: 965.00,
    close: 960.10,
    volume: 18492000,
    lotSize: 1425,
    instrumentType: 'EQUITY',
    currency: 'INR',
    marketCap: '₹3.6T',
    peRatio: 16.4,
    sector: 'Automobile',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    exchange: 'NSE',
    ltp: 1215.80,
    change: 9.30,
    changePercent: 0.77,
    high: 1224.00,
    low: 1202.00,
    open: 1208.00,
    close: 1206.50,
    volume: 9840200,
    lotSize: 700,
    instrumentType: 'EQUITY',
    currency: 'INR',
    marketCap: '₹8.5T',
    peRatio: 18.2,
    sector: 'Banking & Finance',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd',
    exchange: 'NSE',
    ltp: 1542.10,
    change: 18.90,
    changePercent: 1.24,
    high: 1555.00,
    low: 1520.00,
    open: 1525.00,
    close: 1523.20,
    volume: 5120800,
    lotSize: 475,
    instrumentType: 'EQUITY',
    currency: 'INR',
    marketCap: '₹9.1T',
    peRatio: 48.2,
    sector: 'Telecom',
    lastUpdated: new Date().toISOString(),
  },

  // Global Indices & Macro (Angel One API Integration)
  {
    symbol: 'GIFT NIFTY',
    name: 'GIFT Nifty Futures (NSE IX)',
    exchange: 'GLOBAL',
    ltp: 24890.00,
    change: 175.00,
    changePercent: 0.71,
    high: 24945.00,
    low: 24710.00,
    open: 24730.00,
    close: 24715.00,
    volume: 94812,
    lotSize: 25,
    instrumentType: 'GLOBAL',
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'S&P 500',
    name: 'S&P 500 Index (US)',
    exchange: 'GLOBAL',
    ltp: 5625.80,
    change: 32.40,
    changePercent: 0.58,
    high: 5642.10,
    low: 5590.20,
    open: 5595.00,
    close: 5593.40,
    volume: 2450890000,
    lotSize: 1,
    instrumentType: 'GLOBAL',
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'NASDAQ 100',
    name: 'Nasdaq 100 Index (US Tech)',
    exchange: 'GLOBAL',
    ltp: 19680.40,
    change: 168.20,
    changePercent: 0.86,
    high: 19745.00,
    low: 19490.00,
    open: 19520.00,
    close: 19512.20,
    volume: 3820194000,
    lotSize: 1,
    instrumentType: 'GLOBAL',
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'DOW JONES',
    name: 'Dow Jones Industrial Average',
    exchange: 'GLOBAL',
    ltp: 41380.20,
    change: 124.50,
    changePercent: 0.30,
    high: 41490.00,
    low: 41220.00,
    open: 41270.00,
    close: 41255.70,
    volume: 1820490000,
    lotSize: 1,
    instrumentType: 'GLOBAL',
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'CRUDE OIL',
    name: 'Brent Crude Oil Spot (USD/bbl)',
    exchange: 'GLOBAL',
    ltp: 74.85,
    change: -0.92,
    changePercent: -1.21,
    high: 76.10,
    low: 74.20,
    open: 75.80,
    close: 75.77,
    volume: 489201,
    lotSize: 100,
    instrumentType: 'GLOBAL',
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'GOLD SPOT',
    name: 'Gold Spot Bullion (USD/oz)',
    exchange: 'GLOBAL',
    ltp: 2584.20,
    change: 14.60,
    changePercent: 0.57,
    high: 2595.00,
    low: 2568.00,
    open: 2570.00,
    close: 2569.60,
    volume: 248910,
    lotSize: 1,
    instrumentType: 'GLOBAL',
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'USD/INR',
    name: 'US Dollar vs Indian Rupee',
    exchange: 'GLOBAL',
    ltp: 83.88,
    change: -0.06,
    changePercent: -0.07,
    high: 83.98,
    low: 83.82,
    open: 83.94,
    close: 83.94,
    volume: 981240,
    lotSize: 1000,
    instrumentType: 'GLOBAL',
    currency: 'INR',
    lastUpdated: new Date().toISOString(),
  }
];

// Helper to generate simulated F&O Option Chain for NIFTY / BANKNIFTY
export function generateOptionChain(underlyingSymbol: string, currentPrice: number): OptionChainData {
  const step = underlyingSymbol === 'BANKNIFTY' ? 100 : underlyingSymbol === 'FINNIFTY' ? 50 : 50;
  const atm = Math.round(currentPrice / step) * step;
  const strikeCount = 13; // 6 ITM, ATM, 6 OTM
  const strikes: OptionStrike[] = [];

  let totalCallOI = 0;
  let totalPutOI = 0;
  let highestCallOI = 0;
  let highestCallOIStrike = atm + (step * 3);
  let highestPutOI = 0;
  let highestPutOIStrike = atm - (step * 3);

  for (let i = -6; i <= 6; i++) {
    const strike = atm + (i * step);
    const diff = strike - currentPrice;

    // Black-Scholes rough approximations for IV and Greeks
    const iv = Math.max(10.5, 14.2 + (Math.abs(diff) / step) * 0.35);
    
    // Call side
    const callIntrinsic = Math.max(0, currentPrice - strike);
    const timeValCall = Math.max(8, (step * 2.2) * Math.exp(-Math.pow(diff / (step * 3.5), 2)));
    const callLtp = Number((callIntrinsic + timeValCall).toFixed(2));
    const callDelta = Number(Math.max(0.05, Math.min(0.95, 0.5 - (diff / (step * 8)))).toFixed(2));
    const callOI = Math.round(1800000 + Math.sin(strike) * 900000 + (diff > 0 ? 800000 : 200000));
    const callOIChange = Math.round((Math.random() * 200000) - 60000);
    const callVol = Math.round(callOI * 0.45);

    // Put side
    const putIntrinsic = Math.max(0, strike - currentPrice);
    const timeValPut = Math.max(8, (step * 2.2) * Math.exp(-Math.pow(diff / (step * 3.5), 2)));
    const putLtp = Number((putIntrinsic + timeValPut).toFixed(2));
    const putDelta = Number(-Math.max(0.05, Math.min(0.95, 0.5 + (diff / (step * 8)))).toFixed(2));
    const putOI = Math.round(1700000 + Math.cos(strike) * 850000 + (diff < 0 ? 950000 : 250000));
    const putOIChange = Math.round((Math.random() * 190000) - 50000);
    const putVol = Math.round(putOI * 0.48);

    totalCallOI += callOI;
    totalPutOI += putOI;

    if (callOI > highestCallOI) {
      highestCallOI = callOI;
      highestCallOIStrike = strike;
    }
    if (putOI > highestPutOI) {
      highestPutOI = putOI;
      highestPutOIStrike = strike;
    }

    strikes.push({
      strikePrice: strike,
      call: {
        ltp: callLtp,
        change: Number((callLtp * 0.04 * (currentPrice > strike ? 1 : -1)).toFixed(2)),
        changePercent: Number((Math.random() * 12 - 4).toFixed(2)),
        oi: callOI,
        oiChange: callOIChange,
        volume: callVol,
        iv: Number(iv.toFixed(1)),
        delta: callDelta,
        theta: -Number((8.5 + Math.random() * 4).toFixed(2)),
        gamma: 0.0018,
        vega: 12.4,
        bid: Number((callLtp - 0.4).toFixed(2)),
        ask: Number((callLtp + 0.4).toFixed(2)),
      },
      put: {
        ltp: putLtp,
        change: Number((putLtp * 0.04 * (currentPrice < strike ? 1 : -1)).toFixed(2)),
        changePercent: Number((Math.random() * 12 - 6).toFixed(2)),
        oi: putOI,
        oiChange: putOIChange,
        volume: putVol,
        iv: Number((iv + 0.4).toFixed(1)),
        delta: putDelta,
        theta: -Number((8.2 + Math.random() * 4).toFixed(2)),
        gamma: 0.0018,
        vega: 12.2,
        bid: Number((putLtp - 0.4).toFixed(2)),
        ask: Number((putLtp + 0.4).toFixed(2)),
      }
    });
  }

  const pcr = Number((totalPutOI / (totalCallOI || 1)).toFixed(2));
  const maxPain = atm;

  return {
    underlyingSymbol,
    underlyingPrice: currentPrice,
    expiryDates: ['Current Weekly (26-SEP-2024)', 'Next Weekly (03-OCT-2024)', 'Monthly (31-OCT-2024)'],
    selectedExpiry: 'Current Weekly (26-SEP-2024)',
    strikes,
    pcr,
    maxPain,
    totalCallOI,
    totalPutOI,
    highestCallOIStrike,
    highestPutOIStrike,
    atmStrike: atm,
  };
}

// Generate realistic historical candle data with technical indicators
export function generateCandleHistory(basePrice: number, points: number = 60, timeframe: string = '1D'): HistoricalCandle[] {
  const candles: HistoricalCandle[] = [];
  let currentClose = basePrice * 0.985;
  const now = Date.now();
  const stepMs = timeframe === '1D' ? 5 * 60 * 1000 : timeframe === '1W' ? 15 * 60 * 1000 : timeframe === '1M' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  for (let i = points; i >= 0; i--) {
    const timestamp = now - (i * stepMs);
    const date = new Date(timestamp);
    const timeStr = timeframe === '1D' || timeframe === '1W'
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    const volatility = basePrice * 0.004;
    const delta = (Math.random() - 0.47) * volatility;
    const open = currentClose;
    const close = Math.round((open + delta) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * (volatility * 0.6)) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.random() * (volatility * 0.6)) * 100) / 100;
    const volume = Math.round(50000 + Math.random() * 180000);

    candles.push({
      time: timeStr,
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
    currentClose = close;
  }

  // Calculate Moving Averages, RSI, Bollinger Bands, and MACD
  let ema20 = candles[0].close;
  let ema50 = candles[0].close;
  const k20 = 2 / (20 + 1);
  const k50 = 2 / (50 + 1);

  // RSI variables
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < candles.length; i++) {
    const close = candles[i].close;
    ema20 = (close * k20) + (ema20 * (1 - k20));
    ema50 = (close * k50) + (ema50 * (1 - k50));
    candles[i].ema20 = Math.round(ema20 * 100) / 100;
    candles[i].ema50 = Math.round(ema50 * 100) / 100;

    // Bollinger bands (20 period, 2 std dev)
    if (i >= 19) {
      const slice = candles.slice(i - 19, i + 1);
      const mean = slice.reduce((acc, c) => acc + c.close, 0) / 20;
      const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / 20;
      const std = Math.sqrt(variance);
      candles[i].upperBB = Math.round((mean + (2 * std)) * 100) / 100;
      candles[i].lowerBB = Math.round((mean - (2 * std)) * 100) / 100;
    } else {
      candles[i].upperBB = Math.round((close * 1.012) * 100) / 100;
      candles[i].lowerBB = Math.round((close * 0.988) * 100) / 100;
    }

    // RSI
    if (i > 0) {
      const change = close - candles[i - 1].close;
      const gain = Math.max(0, change);
      const loss = Math.max(0, -change);
      if (i <= 14) {
        avgGain += gain / 14;
        avgLoss += loss / 14;
      } else {
        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;
      }
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      candles[i].rsi = Math.round(Math.max(10, Math.min(90, 100 - (100 / (1 + rs)))) * 10) / 10;
    } else {
      candles[i].rsi = 52.4;
    }

    // MACD
    const macdVal = (candles[i].ema20 || close) - (candles[i].ema50 || close);
    candles[i].macd = Math.round(macdVal * 100) / 100;
    candles[i].signalLine = Math.round((macdVal * 0.82) * 100) / 100;
    candles[i].histogram = Math.round(((candles[i].macd || 0) - (candles[i].signalLine || 0)) * 100) / 100;
  }

  return candles;
}

export const WORLD_CLASS_STRATEGIES: StrategyRecommendation[] = [
  {
    id: 'strat-1',
    name: 'Bull Call Debit Spread',
    category: 'DIRECTIONAL',
    marketRegime: 'Moderately Bullish Trend with Steady Low IV',
    riskLevel: 'CONSERVATIVE',
    winProbabilityPercent: 67.8, // Strictly probability in %, NEVER guarantee
    riskRewardRatio: '1 : 2.3',
    maxProfit: '₹4,850 per lot',
    maxLoss: '₹2,100 per lot',
    targetUnderlying: 25050,
    stopLossUnderlying: 24720,
    legs: [
      { action: 'BUY', instrument: 'NIFTY 24850 CE', strike: 24850, optionType: 'CE', lots: 1, estPrice: 142.50 },
      { action: 'SELL', instrument: 'NIFTY 25050 CE', strike: 25050, optionType: 'CE', lots: 1, estPrice: 58.50 },
    ],
    rationale: 'NIFTY holding firmly above 20 EMA with positive GIFT Nifty and NASDAQ cues. Delta net positive (+0.32), capping upside exposure while funding intrinsic premium through higher OTM short call.',
    sebiComplianceNotice: 'SEBI DISCLAIMER: Win probability is mathematically computed from delta & historical volatility. No returns are guaranteed. Consult a SEBI registered investment advisor.',
    greeksProfile: {
      netDelta: 0.32,
      netTheta: -3.4,
      netVega: 4.8,
    }
  },
  {
    id: 'strat-2',
    name: 'Delta-Neutral Iron Condor',
    category: 'NON_DIRECTIONAL',
    marketRegime: 'Rangebound Consolidation between Major Call/Put OI Clusters',
    riskLevel: 'BALANCED',
    winProbabilityPercent: 74.2,
    riskRewardRatio: '1 : 1.4',
    maxProfit: '₹3,750 per lot',
    maxLoss: '₹2,650 per lot',
    targetUnderlying: 24850,
    stopLossUnderlying: 24650,
    legs: [
      { action: 'BUY', instrument: 'NIFTY 24600 PE', strike: 24600, optionType: 'PE', lots: 1, estPrice: 28.00 },
      { action: 'SELL', instrument: 'NIFTY 24700 PE', strike: 24700, optionType: 'PE', lots: 1, estPrice: 54.20 },
      { action: 'SELL', instrument: 'NIFTY 25000 CE', strike: 25000, optionType: 'CE', lots: 1, estPrice: 72.80 },
      { action: 'BUY', instrument: 'NIFTY 25100 CE', strike: 25100, optionType: 'CE', lots: 1, estPrice: 41.50 },
    ],
    rationale: 'Capitalizes on accelerated weekend theta decay. Spot pinned between 24700 support and 25000 resistance. Net credit collected ₹59.50 with wide safe payoff zone.',
    sebiComplianceNotice: 'SEBI DISCLAIMER: Options trading carries high risk of capital loss. Win probability (74.2%) is an estimate based on standard deviation and does not guarantee execution profit.',
    greeksProfile: {
      netDelta: 0.02,
      netTheta: 18.6,
      netVega: -14.2,
    }
  },
  {
    id: 'strat-3',
    name: 'Long Volatility Straddle',
    category: 'VOLATILITY',
    marketRegime: 'Pre-Macro Event / RBI Policy Volatility Expansion',
    riskLevel: 'AGGRESSIVE',
    winProbabilityPercent: 54.6,
    riskRewardRatio: '1 : 3.8',
    maxProfit: 'Unlimited (₹12,000+ est)',
    maxLoss: '₹5,400 per lot',
    targetUnderlying: 25200,
    stopLossUnderlying: 24800,
    legs: [
      { action: 'BUY', instrument: 'NIFTY 24800 CE', strike: 24800, optionType: 'CE', lots: 1, estPrice: 155.00 },
      { action: 'BUY', instrument: 'NIFTY 24800 PE', strike: 24800, optionType: 'PE', lots: 1, estPrice: 125.00 },
    ],
    rationale: 'Designed for sharp directional breakouts following macroeconomic data releases. Requires an underlying swing of >1.1% to reach profitability threshold.',
    sebiComplianceNotice: 'SEBI DISCLAIMER: Strict educational research demonstration only. We are not SEBI registered advisors. F&O derivatives involve high volatility risks.',
    greeksProfile: {
      netDelta: 0.04,
      netTheta: -22.5,
      netVega: 31.0,
    }
  },
  {
    id: 'strat-4',
    name: 'Bear Put Hedge Spread',
    category: 'DIRECTIONAL',
    marketRegime: 'High Crude Shock / Negative Global Spillover Risk',
    riskLevel: 'CONSERVATIVE',
    winProbabilityPercent: 62.1,
    riskRewardRatio: '1 : 2.1',
    maxProfit: '₹4,400 per lot',
    maxLoss: '₹2,050 per lot',
    targetUnderlying: 24550,
    stopLossUnderlying: 24920,
    legs: [
      { action: 'BUY', instrument: 'NIFTY 24750 PE', strike: 24750, optionType: 'PE', lots: 1, estPrice: 118.00 },
      { action: 'SELL', instrument: 'NIFTY 24550 PE', strike: 24550, optionType: 'PE', lots: 1, estPrice: 46.50 },
    ],
    rationale: 'Provides downside protection against overnight geopolitical shocks and surging Brent crude oil prices with well-defined risk limits.',
    sebiComplianceNotice: 'SEBI DISCLAIMER: Historical probabilities do not guarantee future returns. Follow strict capital preservation rules.',
    greeksProfile: {
      netDelta: -0.28,
      netTheta: -2.8,
      netVega: 6.2,
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    user: 'demo_trader_15d',
    action: 'USER_LOGIN',
    category: 'AUTH',
    status: 'SUCCESS',
    details: 'User initiated session with 15-day free trial authorization token',
    ipAddress: '103.21.144.12'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    user: 'system_admin',
    action: 'BROKER_API_CHECK',
    category: 'DEVELOPER',
    status: 'SUCCESS',
    details: 'Angel One SmartAPI gateway ping verified: Latency 28ms, Feed Token active',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 3600000 * 1.1).toISOString(),
    user: 'demo_trader_15d',
    action: 'PRICE_ALERT_REGISTERED',
    category: 'ALERT',
    status: 'SUCCESS',
    details: 'Alert registered on NIFTY 50 >= 24900.00 with Web Push & Sound trigger',
    ipAddress: '103.21.144.12'
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    user: 'demo_trader_15d',
    action: 'ORDER_EXECUTION',
    category: 'TRADE',
    status: 'SUCCESS',
    details: 'BUY 25 Qty NIFTY 50 @ Market ₹24,824.50 (Paper Trading Mode)',
    ipAddress: '103.21.144.12'
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    user: 'system_admin',
    action: 'PAYMENT_GATEWAY_PING',
    category: 'PAYMENT',
    status: 'SUCCESS',
    details: 'Razorpay subscription endpoint synchronized (Trial 15-day policy active)',
    ipAddress: '127.0.0.1'
  }
];

export const INITIAL_GTT_ORDERS = [
  {
    id: 'gtt-001',
    symbol: 'NIFTY 50',
    side: 'BUY' as const,
    product: 'NRML' as const,
    quantity: 50,
    triggerPrice: 24700.00,
    limitPrice: 24710.00,
    trailingStopLossPoints: 40,
    trailingTargetPrice: 25100.00,
    highestLtpSeen: 24824.50,
    status: 'ACTIVE' as const,
    createdAt: new Date(Date.now() - 86400000).toLocaleDateString(),
    brokerMode: 'PAPER' as const,
  },
  {
    id: 'gtt-002',
    symbol: 'BANKNIFTY',
    side: 'SELL' as const,
    product: 'MIS' as const,
    quantity: 30,
    triggerPrice: 52400.00,
    limitPrice: 52380.00,
    trailingStopLossPoints: 80,
    trailingTargetPrice: 51200.00,
    highestLtpSeen: 51940.80,
    status: 'ACTIVE' as const,
    createdAt: new Date(Date.now() - 43200000).toLocaleDateString(),
    brokerMode: 'PAPER' as const,
  },
  {
    id: 'gtt-003',
    symbol: 'RELIANCE',
    side: 'BUY' as const,
    product: 'CNC' as const,
    quantity: 20,
    triggerPrice: 2950.00,
    limitPrice: 2955.00,
    trailingStopLossPoints: 30,
    trailingTargetPrice: 3200.00,
    highestLtpSeen: 3012.40,
    status: 'TRIGGERED' as const,
    createdAt: new Date(Date.now() - 172800000).toLocaleDateString(),
    triggeredAt: new Date(Date.now() - 86400000).toLocaleTimeString(),
    brokerMode: 'PAPER' as const,
  }
];

export const DEFAULT_WEBHOOK_SETTINGS = {
  telegram: {
    enabled: true,
    botToken: '6891238491:AAH8kqZ_DemoTelegramBotToken_TradingPro',
    chatId: '@scalpingpro_signals',
    channelName: 'ScalpingPro • Live Trade Signals',
    isConnected: true,
    autoBroadcastAiSignals: true,
    autoBroadcastGttTriggers: true,
    autoBroadcastPriceAlerts: true,
  },
  whatsapp: {
    enabled: false,
    webhookUrl: 'https://api.whatsapp.com/v1/messages/webhook-endpoint',
    recipientNumber: '+919876543210',
    isConnected: false,
  }
};

export const INITIAL_TELEGRAM_SIGNALS = [
  {
    id: 'sig-001',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    symbol: 'NIFTY 50',
    action: 'BUY' as const,
    strategyName: 'Bull Call Spread (24800 CE / 25000 CE)',
    entryPrice: 24824.50,
    target1: 25020.00,
    target2: 25150.00,
    stopLoss: 24690.00,
    riskReward: '1 : 2.4',
    winProbabilityPercent: 71.5,
    timeframe: 'Intraday / Weekly',
    rationale: 'Heavy call unwinding detected at 24800 strike; Put-Call Ratio expanded from 0.98 to 1.16 with GIFT Nifty momentum.',
    channel: '@scalpingpro_signals',
    status: 'SENT' as const,
    messageId: 1042,
    legs: [
      { action: 'BUY' as const, instrument: 'NIFTY 24800 CE', strike: 24800, optionType: 'CE' as const, lots: 1, estPrice: 142.50 },
      { action: 'SELL' as const, instrument: 'NIFTY 25000 CE', strike: 25000, optionType: 'CE' as const, lots: 1, estPrice: 48.20 }
    ],
    greeks: { netDelta: 0.28, netTheta: -3.4, netVega: 1.2 }
  },
  {
    id: 'sig-002',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    symbol: 'BANKNIFTY',
    action: 'STRATEGY' as const,
    strategyName: 'Iron Condor (Delta-Neutral Theta Harvester)',
    entryPrice: 51940.80,
    target1: 52300.00,
    target2: 51500.00,
    stopLoss: 52650.00,
    riskReward: '1 : 1.8',
    winProbabilityPercent: 68.2,
    timeframe: 'Weekly Expiry',
    rationale: 'IV Rank at 48th percentile with symmetric open interest concentration between 51500 PE and 52500 CE.',
    channel: '@scalpingpro_signals',
    status: 'SENT' as const,
    messageId: 1041,
    legs: [
      { action: 'SELL' as const, instrument: 'BANKNIFTY 52500 CE', strike: 52500, optionType: 'CE' as const, lots: 1, estPrice: 88.00 },
      { action: 'BUY' as const, instrument: 'BANKNIFTY 52800 CE', strike: 52800, optionType: 'CE' as const, lots: 1, estPrice: 32.00 },
      { action: 'SELL' as const, instrument: 'BANKNIFTY 51500 PE', strike: 51500, optionType: 'PE' as const, lots: 1, estPrice: 94.00 },
      { action: 'BUY' as const, instrument: 'BANKNIFTY 51200 PE', strike: 51200, optionType: 'PE' as const, lots: 1, estPrice: 38.00 }
    ],
    greeks: { netDelta: 0.02, netTheta: 14.8, netVega: -6.4 }
  },
  {
    id: 'sig-003',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    symbol: 'RELIANCE',
    action: 'BUY' as const,
    strategyName: 'Breakout Momentum Call (Cash / FUT Equivalent)',
    entryPrice: 2985.40,
    target1: 3040.00,
    target2: 3080.00,
    stopLoss: 2940.00,
    riskReward: '1 : 2.1',
    winProbabilityPercent: 66.8,
    timeframe: 'Swing / 3-5 Days',
    rationale: 'Consolidation breakout above 2960 resistance on 1.8x average volume with bullish RSI divergence.',
    channel: '@scalpingpro_signals',
    status: 'SENT' as const,
    messageId: 1040,
    greeks: { netDelta: 0.65, netTheta: -1.2, netVega: 0.8 }
  }
];


