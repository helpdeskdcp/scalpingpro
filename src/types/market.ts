export type Exchange = 'NSE' | 'BSE' | 'GLOBAL' | 'MCX';
export type InstrumentType = 'EQUITY' | 'INDEX' | 'FUT' | 'OPT' | 'GLOBAL';

export interface MarketDepthItem {
  price: number;
  orders: number;
  quantity: number;
}

export interface Ticker {
  symbol: string;
  name: string;
  exchange: Exchange;
  ltp: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
  lotSize: number;
  instrumentType: InstrumentType;
  currency: string;
  marketCap?: string;
  peRatio?: number;
  sector?: string;
  bidDepth?: MarketDepthItem[];
  askDepth?: MarketDepthItem[];
  lastUpdated: string;
}

export interface HistoricalCandle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  upperBB?: number;
  lowerBB?: number;
  rsi?: number;
  macd?: number;
  signalLine?: number;
  histogram?: number;
}

export interface OptionLegData {
  ltp: number;
  change: number;
  changePercent: number;
  oi: number;
  oiChange: number;
  volume: number;
  iv: number;
  delta: number;
  theta: number;
  gamma: number;
  vega: number;
  bid: number;
  ask: number;
}

export interface OptionStrike {
  strikePrice: number;
  call: OptionLegData;
  put: OptionLegData;
}

export interface OptionChainData {
  underlyingSymbol: string;
  underlyingPrice: number;
  expiryDates: string[];
  selectedExpiry: string;
  strikes: OptionStrike[];
  pcr: number; // Put-Call Ratio
  maxPain: number;
  totalCallOI: number;
  totalPutOI: number;
  highestCallOIStrike: number;
  highestPutOIStrike: number;
  atmStrike: number;
}

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
export type ProductType = 'MIS' | 'CNC' | 'NRML';
export type OrderStatus = 'EXECUTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
export type ExecutionMode = 'PAPER' | 'ANGELONE';

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  product: ProductType;
  quantity: number;
  price: number;
  triggerPrice?: number;
  status: OrderStatus;
  executedPrice?: number;
  timestamp: string;
  brokerMode: ExecutionMode;
  notes?: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: OrderSide;
  product: ProductType;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  instrumentType: InstrumentType;
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  ltp: number;
  curVal: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'GTE' | 'LTE';
  note: string;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
}

export interface GttOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  product: ProductType;
  quantity: number;
  triggerPrice: number;
  limitPrice: number;
  trailingStopLossPoints?: number; // points to trail stop loss upwards
  trailingTargetPrice?: number;
  highestLtpSeen?: number;
  status: 'ACTIVE' | 'TRIGGERED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  triggeredAt?: string;
  brokerMode: ExecutionMode;
}

export interface AlertWebhookSettings {
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
    isConnected: boolean;
    channelName?: string;
    autoBroadcastAiSignals?: boolean;
    autoBroadcastGttTriggers?: boolean;
    autoBroadcastPriceAlerts?: boolean;
  };
  whatsapp: {
    enabled: boolean;
    webhookUrl: string;
    recipientNumber: string;
    isConnected: boolean;
  };
}

export interface SMCStrikeCandidate {
  strike: number;
  optionType: 'CE' | 'PE';
  delta: number;
  ltp: number;
  iv: number;
  oi: number;
  volume: number;
  spread: number;
  score: number;
  isSelected: boolean;
  reason: string;
}

export interface SMCStrategySignal {
  decision: 'BUY_CE' | 'BUY_PE' | 'NO_TRADE';
  underlying: string;
  spot: number;
  setup: 'LOWER_SWEEP' | 'UPPER_SWEEP' | 'RANGE_SWEEP' | 'FVG_IMBALANCE_REACTION';
  bias: 'BULLISH' | 'BEARISH' | 'RANGE';
  strike: number;
  optionSymbol: string;
  optionType: 'CE' | 'PE';
  entryUnderlying: number;
  entryOption: number;
  stopUnderlying: number;
  stopOption: number;
  target1Underlying: number;
  target1Option: number;
  target2Underlying: number;
  target2Option: number;
  target3Underlying: number;
  target3Option: number;
  rrT1: string; // "1:2"
  rrT2: string; // "1:3"
  rrT3: string; // "1:4"
  confidenceT1: number; // e.g. 84.5%
  confidenceT2: number; // e.g. 72.8%
  confidenceT3: number; // e.g. 58.4%
  slSafetyConfidence: number; // "Never-Hit Probability" e.g. 88.2%
  scalpingConfidence: number; // e.g. 86.0%
  riskAmount: number;
  rewardAmountT1: number;
  rewardAmountT2: number;
  rewardAmountT3: number;
  quantity: number;
  lots: number;
  strikeRanking: SMCStrikeCandidate[];
  checklistPassed: string[];
  checklistFailed: string[];
  htfContext: {
    pdh: number;
    pdl: number;
    swingHigh: number;
    swingLow: number;
    eqhEqlMarked: boolean;
    bias: 'BULLISH' | 'BEARISH' | 'RANGE';
  };
  confirmation3m: {
    chochOrBos: 'CHoCH' | 'BOS' | 'NONE';
    secondaryType: 'CISD' | 'FVG' | 'ORDER_BLOCK';
    candleClosed: boolean;
    timeframe: string;
  };
  orderFlowImbalance: {
    deltaImbalanceRatio: number;
    bidAskDelta: number;
    institutionalAbsorption: boolean;
  };
  reason: string;
  timestamp: string;
}

export interface TelegramSignal {
  id: string;
  timestamp: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'STRATEGY' | 'ALERT' | 'BUY_CE' | 'BUY_PE' | 'NO_TRADE';
  strategyName?: string;
  entryPrice: number;
  target1: number;
  target2?: number;
  target3?: number;
  target1Rr?: string; // "1:2"
  target2Rr?: string; // "1:3"
  target3Rr?: string; // "1:4"
  target1Confidence?: number; // %
  target2Confidence?: number; // %
  target3Confidence?: number; // %
  slNeverHitProbability?: number; // %
  scalpingConfidence?: number; // %
  stopLoss: number;
  riskReward: string;
  winProbabilityPercent?: number;
  timeframe?: string;
  rationale?: string;
  optionStrike?: string;
  optionType?: 'CE' | 'PE';
  optionEntry?: number;
  optionSl?: number;
  optionT1?: number;
  optionT2?: number;
  optionT3?: number;
  smcDetails?: Partial<SMCStrategySignal>;
  legs?: StrategyLeg[];
  greeks?: { netDelta?: number; netTheta?: number; netVega?: number };
  channel: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  messageId?: number;
  rawText?: string;
}

export interface BacktestResult {
  strategyId: string;
  strategyName: string;
  timeframe: '6M' | '1Y' | '3Y';
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  winRatePercent: number;
  profitFactor: number;
  cagrPercent: number;
  maxDrawdownPercent: number;
  netPnl: number;
  sharpeRatio: number;
  monthlyBreakdown: { month: string; pnl: number; winRate: number; trades: number }[];
  equityCurve: { date: string; equity: number; benchmark: number }[];
}

export interface StrategyLeg {
  action: 'BUY' | 'SELL';
  instrument: string;
  strike?: number;
  optionType?: 'CE' | 'PE';
  expiry?: string;
  lots: number;
  estPrice: number;
}

export interface StrategyRecommendation {
  id: string;
  name: string;
  category: 'DIRECTIONAL' | 'NON_DIRECTIONAL' | 'VOLATILITY' | 'MOMENTUM';
  marketRegime: string;
  riskLevel: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  winProbabilityPercent: number; // strictly % probability, NEVER guarantees
  riskRewardRatio: string;
  maxProfit: string;
  maxLoss: string;
  targetUnderlying: number;
  stopLossUnderlying: number;
  legs: StrategyLeg[];
  rationale: string;
  sebiComplianceNotice: string;
  greeksProfile: {
    netDelta: number;
    netTheta: number;
    netVega: number;
  };
}

export type AuditCategory = 'AUTH' | 'TRADE' | 'ALERT' | 'DEVELOPER' | 'PAYMENT' | 'SYSTEM';
export type AuditStatus = 'SUCCESS' | 'WARNING' | 'FAILED';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: AuditCategory;
  status: AuditStatus;
  details: string;
  ipAddress: string;
}

export interface AngelOneCredentials {
  apiKey: string;
  clientCode: string;
  secretKey: string;
  mpin?: string;
  totpSecret?: string;
  autoTotp?: boolean;
  feedToken: string;
  jwtToken?: string;
  refreshToken?: string;
  isLive: boolean;
  connected: boolean;
  lastConnected?: string;
}

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  isLive: boolean;
}

export interface DeveloperSettings {
  angelOne: AngelOneCredentials;
  razorpay: RazorpayCredentials;
  executionMode: ExecutionMode;
  webhooks?: AlertWebhookSettings;
}

export interface SubscriptionStatus {
  isTrial: boolean;
  trialDaysLeft: number;
  trialExpiryDate: string;
  plan: 'TRIAL' | 'PRO_MONTHLY' | 'INSTITUTIONAL_ANNUAL';
  active: boolean;
  expiresAt: string;
  paymentId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tradingBalance: number;
  usedMargin: number;
  availableMargin: number;
  brokerConnected: boolean;
  brokerName: string;
  subscription: SubscriptionStatus;
}

export interface HistoricalTick {
  time: string;
  timestamp: number;
  price: number;
  volume: number;
  bid: number;
  ask: number;
  orderFlowDelta: number; // buy volume - sell volume
  sessionHigh: number;
  sessionLow: number;
  prevDayHigh: number;
  prevDayLow: number;
  sweepDetected?: 'BSL_SWEEP' | 'SSL_SWEEP' | 'EQL_SWEEP' | 'EQH_SWEEP';
  fvgZone?: { top: number; bottom: number; type: 'BULLISH' | 'BEARISH' };
}

export interface SmcBacktestConfig {
  symbol: string;
  days: number; // 7, 30, 90 days
  initialCapital: number;
  riskPerTradePercent: number; // e.g., 1.5%
  scaleOutT1Percent: number; // default 50%
  scaleOutT2Percent: number; // default 30%
  scaleOutT3Percent: number; // default 20%
  moveSlToBreakevenAtT1: boolean;
  trailSlToT1AtT2: boolean;
  slippagePercent: number; // default 0.08%
  brokeragePerOrder: number; // ₹20 flat Angel One brokerage
  exchangeChargesRate: number; // STT, GST, SEBI fee ~ 0.05%
  setupFilter?: 'ALL' | 'LOWER_SWEEP_ONLY' | 'UPPER_SWEEP_ONLY' | 'HIGH_CONFIDENCE_ONLY';
}

export interface SmcBacktestTrade {
  id: string;
  tradeNumber: number;
  date: string;
  entryTime: string;
  exitTime: string;
  symbol: string;
  setupType: 'LOWER_SWEEP_BULLISH' | 'UPPER_SWEEP_BEARISH';
  action: 'BUY_CE' | 'BUY_PE';
  strikeInstrument: string;
  spotEntry: number;
  spotExit: number;
  spotSl: number;
  spotT1: number;
  spotT2: number;
  spotT3: number;
  entryPremium: number;
  exitPremium: number;
  contracts: number;
  lots: number;
  quantity: number;
  riskAmount: number;
  grossPnl: number;
  slippageAndCharges: number;
  netPnl: number;
  pnlPercent: number;
  capitalAfterTrade: number;
  returnOnCapital: number;
  exitReason: 'TARGET_1_HIT' | 'TARGET_2_HIT' | 'TARGET_3_HIT' | 'SL_HIT' | 'BREAKEVEN_EXIT' | 'EOD_SQUAREOFF';
  durationMinutes: number;
  rMultiple: number; // R:R achieved (e.g. +2.8R, -1.0R, +0.2R)
  isWin: boolean;
}

export interface SmcBacktestSummary {
  config: SmcBacktestConfig;
  symbol: string;
  periodLabel: string;
  totalTicksAnalyzed: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // %
  lossRate: number; // %
  initialCapital: number;
  finalCapital: number;
  netProfit: number; // ₹
  netReturnPercent: number; // %
  profitFactor: number;
  grossProfit: number;
  grossLoss: number;
  avgWin: number;
  avgLoss: number;
  winLossRatio: number;
  maxDrawdown: number; // ₹
  maxDrawdownPercent: number; // %
  sharpeRatio: number;
  sortinoRatio: number;
  expectancyR: number; // R per trade
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgTradeDurationMinutes: number;
  totalChargesPaid: number;
  equityCurve: {
    tradeNumber: number;
    date: string;
    equity: number;
    drawdown: number;
    drawdownPercent: number;
    benchmarkEquity: number;
  }[];
  monthlyPerformance: {
    month: string;
    trades: number;
    winRate: number;
    netPnl: number;
    returnPercent: number;
  }[];
  regimeBreakdown: {
    regime: string;
    trades: number;
    winRate: number;
    netPnl: number;
    profitFactor: number;
  }[];
  trades: SmcBacktestTrade[];
}

export type SmcStructureType = 'ORDER_BLOCK' | 'FAIR_VALUE_GAP' | 'LIQUIDITY_SWEEP' | 'STRUCTURE_BREAK' | 'LIQUIDITY_POOL';

export interface SmcOrderBlock {
  id: string;
  type: 'BULLISH_OB' | 'BEARISH_OB';
  startIndex: number;
  endIndex: number;
  top: number;
  bottom: number;
  meanThreshold: number; // 50% equilibrium level
  status: 'FRESH' | 'TESTED' | 'MITIGATED';
  volumeScore: number;
  label: string;
  mitigationIndex?: number;
  createdTime: string;
}

export interface SmcFairValueGap {
  id: string;
  type: 'BULLISH_FVG' | 'BEARISH_FVG';
  startIndex: number;
  endIndex: number;
  top: number;
  bottom: number;
  consequentEncroachment: number; // 50% CE level
  status: 'ACTIVE' | 'PARTIALLY_FILLED' | 'FILLED';
  fillPercent: number;
  label: string;
  createdTime: string;
}

export interface SmcLiquiditySweep {
  id: string;
  type: 'SSL_SWEEP' | 'BSL_SWEEP';
  candleIndex: number;
  levelSwept: number;
  extremePrice: number;
  rejectionClose: number;
  sweepVolume: number;
  institutionalReaction: boolean;
  label: string;
  biasResult: 'BULLISH' | 'BEARISH';
  createdTime: string;
}

export interface SmcStructureBreak {
  id: string;
  type: 'BOS_BULLISH' | 'BOS_BEARISH' | 'CHOCH_BULLISH' | 'CHOCH_BEARISH';
  fromIndex: number;
  toIndex: number;
  level: number;
  label: string;
  createdTime: string;
}

export interface SmcLiquidityPool {
  id: string;
  type: 'EQH' | 'EQL';
  indices: number[];
  price: number;
  label: string;
  createdTime: string;
}

export interface SmcScanResults {
  orderBlocks: SmcOrderBlock[];
  fairValueGaps: SmcFairValueGap[];
  liquiditySweeps: SmcLiquiditySweep[];
  structureBreaks: SmcStructureBreak[];
  liquidityPools: SmcLiquidityPool[];
  activeSetupSummary: {
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    keyLevel: number;
    recommendedAction: string;
    freshObCount: number;
    activeFvgCount: number;
    recentSweep: SmcLiquiditySweep | null;
  };
}

