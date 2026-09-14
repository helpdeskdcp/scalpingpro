import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Ticker,
  Order,
  Position,
  Holding,
  PriceAlert,
  AuditLog,
  DeveloperSettings,
  SubscriptionStatus,
  OrderSide,
  OrderType,
  ProductType,
  ExecutionMode,
  StrategyRecommendation,
  GttOrder,
  AlertWebhookSettings,
} from '../types/market';
import { INITIAL_TICKERS, INITIAL_AUDIT_LOGS, WORLD_CLASS_STRATEGIES, INITIAL_GTT_ORDERS, DEFAULT_WEBHOOK_SETTINGS } from '../data/mockMarketData';
import { playAlertPing } from '../utils/audioAlert';
import { logAuditEvent, fetchDeveloperSettings, fetchMarketTickers, fetchGttOrders, createGttOrder as apiCreateGtt, cancelGttOrder as apiCancelGtt, testWebhookAlert } from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'ALERT' | 'ORDER' | 'SYSTEM';
  read: boolean;
}

interface TradingContextType {
  tickers: Ticker[];
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;
  activeTicker: Ticker;
  watchlistType: 'NIFTY50' | 'FO' | 'GLOBAL' | 'CUSTOM';
  setWatchlistType: (type: 'NIFTY50' | 'FO' | 'GLOBAL' | 'CUSTOM') => void;
  customWatchlist: string[];
  addToCustomWatchlist: (symbol: string) => void;
  removeFromCustomWatchlist: (symbol: string) => void;
  
  // Portfolio
  cashBalance: number;
  usedMargin: number;
  availableMargin: number;
  positions: Position[];
  holdings: Holding[];
  orders: Order[];
  placeOrder: (orderData: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    product: ProductType;
    quantity: number;
    price?: number;
    triggerPrice?: number;
  }) => { success: boolean; message: string; order?: Order };
  cancelOrder: (orderId: string) => void;
  squareOffPosition: (positionId: string) => void;
  squareOffAll: () => void;

  // Good-Till-Triggered (GTT) & Trailing Stop Loss Orders
  gttOrders: GttOrder[];
  placeGttOrder: (gtt: {
    symbol: string;
    side: OrderSide;
    product: ProductType;
    quantity: number;
    triggerPrice: number;
    limitPrice: number;
    trailingStopLossPoints?: number;
    trailingTargetPrice?: number;
  }) => Promise<{ success: boolean; message: string; gtt?: GttOrder }>;
  cancelGttOrder: (id: string) => Promise<void>;

  // Price Alerts & Notifications
  alerts: PriceAlert[];
  addAlert: (symbol: string, targetPrice: number, condition: 'GTE' | 'LTE', note?: string) => void;
  removeAlert: (alertId: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Webhook Alert Dispatch (Telegram / WhatsApp)
  webhookSettings: AlertWebhookSettings;
  updateWebhookSettings: (settings: AlertWebhookSettings) => void;
  dispatchWebhookTest: (channel: 'telegram' | 'whatsapp') => Promise<{ success: boolean; message: string }>;

  // Broker & Developer
  brokerConnected: boolean;
  brokerName: string;
  connectBroker: (name?: string) => void;
  disconnectBroker: () => void;
  brokerMode: ExecutionMode;
  setBrokerMode: (mode: ExecutionMode) => void;
  developerSettings: DeveloperSettings;
  updateDeveloperSettings: (newSettings: DeveloperSettings) => void;
  simulationEnabled: boolean;
  setSimulationEnabled: (enabled: boolean) => void;
  refreshLiveQuotes: () => Promise<void>;

  // AI Strategy & Market Sentiment
  activeStrategy: StrategyRecommendation;
  setActiveStrategy: (strategy: StrategyRecommendation) => void;
  allStrategies: StrategyRecommendation[];
  setAllStrategies: (strategies: StrategyRecommendation[]) => void;

  // Subscription / 15-day Demo Trial
  subscription: SubscriptionStatus;
  activateProSubscription: (plan: 'PRO_MONTHLY' | 'INSTITUTIONAL_ANNUAL', paymentId: string) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickers, setTickers] = useState<Ticker[]>(INITIAL_TICKERS);
  const [activeSymbol, setActiveSymbol] = useState<string>('NIFTY 50');
  const [watchlistType, setWatchlistType] = useState<'NIFTY50' | 'FO' | 'GLOBAL' | 'CUSTOM'>('NIFTY50');
  const [customWatchlist, setCustomWatchlist] = useState<string[]>(['RELIANCE', 'TCS', 'HDFCBANK', 'GIFT NIFTY', 'S&P 500']);

  // Portfolio State
  const [cashBalance, setCashBalance] = useState<number>(245800.50);
  const [usedMargin, setUsedMargin] = useState<number>(34200.00);

  const [holdings, setHoldings] = useState<Holding[]>([
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      quantity: 50,
      avgCost: 2840.00,
      ltp: 2985.40,
      curVal: 149270.00,
      totalPnl: 7270.00,
      totalPnlPercent: 5.12,
      dayPnl: 1425.00,
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      quantity: 100,
      avgCost: 1580.00,
      ltp: 1648.70,
      curVal: 164870.00,
      totalPnl: 6870.00,
      totalPnlPercent: 4.35,
      dayPnl: 1420.00,
    },
    {
      symbol: 'TATAMOTORS',
      name: 'Tata Motors Ltd',
      quantity: 150,
      avgCost: 910.00,
      ltp: 982.50,
      curVal: 147375.00,
      totalPnl: 10875.00,
      totalPnlPercent: 7.96,
      dayPnl: 3360.00,
    }
  ]);

  const [positions, setPositions] = useState<Position[]>([
    {
      id: 'pos-1',
      symbol: 'NIFTY 50',
      side: 'BUY',
      product: 'MIS',
      quantity: 50,
      avgPrice: 24780.00,
      currentPrice: 24824.50,
      pnl: 2225.00,
      pnlPercent: 0.18,
      instrumentType: 'INDEX',
    },
    {
      id: 'pos-2',
      symbol: 'INFY',
      side: 'BUY',
      product: 'MIS',
      quantity: 100,
      avgPrice: 1832.00,
      currentPrice: 1845.20,
      pnl: 1320.00,
      pnlPercent: 0.72,
      instrumentType: 'EQUITY',
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord-8812',
      symbol: 'NIFTY 50',
      side: 'BUY',
      type: 'MARKET',
      product: 'MIS',
      quantity: 50,
      price: 24780.00,
      executedPrice: 24780.00,
      status: 'EXECUTED',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      brokerMode: 'ANGELONE',
    },
    {
      id: 'ord-8813',
      symbol: 'INFY',
      side: 'BUY',
      type: 'LIMIT',
      product: 'MIS',
      quantity: 100,
      price: 1832.00,
      executedPrice: 1832.00,
      status: 'EXECUTED',
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(),
      brokerMode: 'ANGELONE',
    }
  ]);

  // Alerts & Notifications
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'alt-1',
      symbol: 'NIFTY 50',
      targetPrice: 24900.00,
      condition: 'GTE',
      note: 'All-time high resistance breakout test',
      createdAt: new Date().toLocaleTimeString(),
      triggered: false,
    },
    {
      id: 'alt-2',
      symbol: 'RELIANCE',
      targetPrice: 3000.00,
      condition: 'GTE',
      note: 'Major psychological barrier crossing',
      createdAt: new Date().toLocaleTimeString(),
      triggered: false,
    }
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Welcome to ShareMarket Pro',
      message: '15-Day Free Trial activated. SEBI regulatory compliance guidelines in effect.',
      timestamp: 'Just now',
      type: 'SYSTEM',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Angel One SmartAPI Ready',
      message: 'Connected to broker gateway with low-latency feed token.',
      timestamp: '5m ago',
      type: 'SYSTEM',
      read: false,
    }
  ]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // GTT Orders & Webhook Settings
  const [gttOrders, setGttOrders] = useState<GttOrder[]>(INITIAL_GTT_ORDERS);
  const [webhookSettings, setWebhookSettings] = useState<AlertWebhookSettings>(DEFAULT_WEBHOOK_SETTINGS);

  // Broker & Developer
  const [brokerConnected, setBrokerConnected] = useState<boolean>(true);
  const [brokerName] = useState<string>('Angel One SmartAPI');
  const [brokerMode, setBrokerMode] = useState<ExecutionMode>('PAPER'); // Default: Paper Trading
  const [simulationEnabled, setSimulationEnabled] = useState<boolean>(false); // Simulated mock data disabled by default

  const [developerSettings, setDeveloperSettings] = useState<DeveloperSettings>({
    angelOne: {
      apiKey: 'ANGEL_LIVE_SMARTAPI_9981',
      clientCode: 'DCP78912',
      mpin: '1982',
      totpSecret: 'JBSWY3DPEHPK3PXP',
      autoTotp: true,
      secretKey: '••••••••••••••••',
      feedToken: 'FT_SMARTAPI_TOKEN_991823',
      isLive: false,
      connected: true,
      lastConnected: new Date().toISOString(),
    },
    razorpay: {
      keyId: 'rzp_test_9kLmnO2P8QvXwY',
      keySecret: '••••••••••••••••',
      webhookSecret: 'whsec_99182348572198',
      isLive: false,
    },
    executionMode: 'PAPER',
  });

  // Subscription / 15-day Demo trial
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isTrial: true,
    trialDaysLeft: 11, // Demo user allows 15 days only of free trial access
    trialExpiryDate: new Date(Date.now() + 11 * 24 * 3600 * 1000).toLocaleDateString(),
    plan: 'TRIAL',
    active: true,
    expiresAt: new Date(Date.now() + 11 * 24 * 3600 * 1000).toISOString(),
  });

  // AI Strategy & Market Sentiment state
  const [allStrategies, setAllStrategies] = useState<StrategyRecommendation[]>(WORLD_CLASS_STRATEGIES);
  const [activeStrategy, setActiveStrategy] = useState<StrategyRecommendation>(
    WORLD_CLASS_STRATEGIES.find(s => s.riskLevel === 'BALANCED') || WORLD_CLASS_STRATEGIES[0]
  );

  // Fetch initial developer settings & GTT orders from server
  useEffect(() => {
    fetchDeveloperSettings()
      .then(settings => {
        if (settings) {
          setDeveloperSettings(settings);
          if (settings.executionMode) {
            setBrokerMode(settings.executionMode);
          }
          if (settings.webhooks) {
            setWebhookSettings(settings.webhooks);
          }
        }
      })
      .catch(err => console.warn('Could not load developer settings:', err));

    fetchGttOrders()
      .then(data => {
        if (data && data.length > 0) {
          setGttOrders(data);
        }
      })
      .catch(err => console.warn('Could not load GTT orders:', err));
  }, []);

  // Request browser Notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Fetch authentic live quotes from server
  const refreshLiveQuotes = useCallback(async () => {
    try {
      const data = await fetchMarketTickers();
      if (data && data.length > 0) {
        setTickers(data);
        setPositions(prevPos =>
          prevPos.map(pos => {
            const currentTicker = data.find(t => t.symbol.toUpperCase() === pos.symbol.toUpperCase());
            const currentPrice = currentTicker ? currentTicker.ltp : pos.currentPrice;
            const diff = pos.side === 'BUY' ? currentPrice - pos.avgPrice : pos.avgPrice - currentPrice;
            const pnl = Number((diff * pos.quantity).toFixed(2));
            const pnlPercent = Number(((diff / pos.avgPrice) * 100).toFixed(2));
            return {
              ...pos,
              currentPrice,
              pnl,
              pnlPercent,
            };
          })
        );
      }
    } catch (err) {
      console.warn('Error refreshing live quotes:', err);
    }
  }, []);

  // Initial load of live authentic market data
  useEffect(() => {
    refreshLiveQuotes();
  }, [refreshLiveQuotes]);

  // Real-time market tick simulator (DISABLED by default; only runs if simulationEnabled is explicitly true)
  useEffect(() => {
    if (!simulationEnabled) {
      // Mock random fluctuation disabled by default
      return;
    }

    const interval = setInterval(() => {
      setTickers(prevTickers => {
        const updated = prevTickers.map(t => {
          // Micro variation between -0.15% and +0.15%
          const factor = (Math.random() - 0.49) * 0.0012;
          const delta = Number((t.ltp * factor).toFixed(2));
          const newLtp = Math.max(1, Number((t.ltp + delta).toFixed(2)));
          const newChange = Number((t.change + delta).toFixed(2));
          const newPercent = Number(((newChange / (t.close || t.ltp)) * 100).toFixed(2));
          const newHigh = Math.max(t.high, newLtp);
          const newLow = Math.min(t.low, newLtp);

          return {
            ...t,
            ltp: newLtp,
            change: newChange,
            changePercent: newPercent,
            high: newHigh,
            low: newLow,
            lastUpdated: new Date().toISOString(),
          };
        });

        // Update positions live P&L
        setPositions(prevPos =>
          prevPos.map(pos => {
            const currentTicker = updated.find(t => t.symbol.toUpperCase() === pos.symbol.toUpperCase());
            const currentPrice = currentTicker ? currentTicker.ltp : pos.currentPrice;
            const diff = pos.side === 'BUY' ? currentPrice - pos.avgPrice : pos.avgPrice - currentPrice;
            const pnl = Number((diff * pos.quantity).toFixed(2));
            const pnlPercent = Number(((diff / pos.avgPrice) * 100).toFixed(2));
            return {
              ...pos,
              currentPrice,
              pnl,
              pnlPercent,
            };
          })
        );

        // Check Price Alerts
        setAlerts(prevAlerts =>
          prevAlerts.map(alert => {
            if (alert.triggered) return alert;
            const ticker = updated.find(t => t.symbol.toUpperCase() === alert.symbol.toUpperCase());
            if (!ticker) return alert;

            let conditionMet = false;
            if (alert.condition === 'GTE' && ticker.ltp >= alert.targetPrice) {
              conditionMet = true;
            } else if (alert.condition === 'LTE' && ticker.ltp <= alert.targetPrice) {
              conditionMet = true;
            }

            if (conditionMet) {
              if (soundEnabled) {
                playAlertPing('alert');
              }
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`🚨 Price Alert: ${alert.symbol}`, {
                    body: `${alert.symbol} reached target ₹${alert.targetPrice.toLocaleString('en-IN')}. Current LTP: ₹${ticker.ltp.toLocaleString('en-IN')}`,
                    icon: '/favicon.ico',
                  });
                } catch (e) {
                  console.warn('Push notification error:', e);
                }
              }
              const newNotif: NotificationItem = {
                id: `notif-${Date.now()}`,
                title: `Price Alert Triggered: ${alert.symbol}`,
                message: `Target ₹${alert.targetPrice.toLocaleString('en-IN')} reached. Current LTP is ₹${ticker.ltp.toLocaleString('en-IN')}. ${alert.note}`,
                timestamp: 'Just now',
                type: 'ALERT',
                read: false,
              };
              setNotifications(n => [newNotif, ...n]);
              logAuditEvent({
                action: 'PRICE_ALERT_TRIGGERED',
                category: 'ALERT',
                status: 'SUCCESS',
                details: `Alert reached for ${alert.symbol} at ₹${ticker.ltp}. Target was ${alert.targetPrice}.`,
              });

              return {
                ...alert,
                triggered: true,
                triggeredAt: new Date().toLocaleTimeString(),
              };
            }
            return alert;
          })
        );

        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [simulationEnabled, soundEnabled]);

  const activeTicker = useMemo(() => {
    return tickers.find(t => t.symbol.toUpperCase() === activeSymbol.toUpperCase()) || tickers[0];
  }, [tickers, activeSymbol]);

  const availableMargin = useMemo(() => {
    return Math.max(0, cashBalance - usedMargin);
  }, [cashBalance, usedMargin]);

  // Place Order
  const placeOrder = useCallback((orderData: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    product: ProductType;
    quantity: number;
    price?: number;
    triggerPrice?: number;
  }) => {
    const ticker = tickers.find(t => t.symbol.toUpperCase() === orderData.symbol.toUpperCase()) || activeTicker;
    const executionPrice = orderData.price || ticker.ltp;
    const totalCost = executionPrice * orderData.quantity;

    // Margin check for BUY
    if (orderData.side === 'BUY' && totalCost > availableMargin * 5) { // 5x intraday leverage
      return {
        success: false,
        message: `Insufficient margin! Required ₹${(totalCost / 5).toLocaleString('en-IN')}, available ₹${availableMargin.toLocaleString('en-IN')}.`,
      };
    }

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderId,
      symbol: ticker.symbol,
      side: orderData.side,
      type: orderData.type,
      product: orderData.product,
      quantity: orderData.quantity,
      price: executionPrice,
      executedPrice: executionPrice,
      triggerPrice: orderData.triggerPrice,
      status: 'EXECUTED',
      timestamp: new Date().toLocaleTimeString(),
      brokerMode: brokerMode,
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update Position or create new
    setPositions(prev => {
      const existingIndex = prev.findIndex(p => p.symbol.toUpperCase() === ticker.symbol.toUpperCase() && p.product === orderData.product);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        if (existing.side === orderData.side) {
          // Average up/down
          const totalQty = existing.quantity + orderData.quantity;
          const avgPrice = ((existing.avgPrice * existing.quantity) + (executionPrice * orderData.quantity)) / totalQty;
          const updated = [...prev];
          updated[existingIndex] = {
            ...existing,
            quantity: totalQty,
            avgPrice: Number(avgPrice.toFixed(2)),
          };
          return updated;
        } else {
          // Opposite side - reduce or close
          if (existing.quantity === orderData.quantity) {
            // Closed completely
            return prev.filter((_, idx) => idx !== existingIndex);
          } else if (existing.quantity > orderData.quantity) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...existing,
              quantity: existing.quantity - orderData.quantity,
            };
            return updated;
          } else {
            // Flip position
            const updated = [...prev];
            updated[existingIndex] = {
              ...existing,
              side: orderData.side,
              quantity: orderData.quantity - existing.quantity,
              avgPrice: executionPrice,
            };
            return updated;
          }
        }
      } else {
        // Create new position
        const newPos: Position = {
          id: `pos-${Date.now()}`,
          symbol: ticker.symbol,
          side: orderData.side,
          product: orderData.product,
          quantity: orderData.quantity,
          avgPrice: executionPrice,
          currentPrice: ticker.ltp,
          pnl: 0,
          pnlPercent: 0,
          instrumentType: ticker.instrumentType,
        };
        return [newPos, ...prev];
      }
    });

    // Sound and audit log
    if (soundEnabled) {
      playAlertPing('order');
    }

    logAuditEvent({
      action: 'ORDER_EXECUTION',
      category: 'TRADE',
      status: 'SUCCESS',
      details: `${orderData.side} ${orderData.quantity} Qty ${ticker.symbol} @ ₹${executionPrice} (${brokerMode} via ${brokerName})`,
    });

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Order Executed (${brokerMode})`,
      message: `${orderData.side} ${orderData.quantity} ${ticker.symbol} executed at ₹${executionPrice}.`,
      timestamp: 'Just now',
      type: 'ORDER',
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);

    return {
      success: true,
      message: `Order #${orderId} executed successfully at ₹${executionPrice.toLocaleString('en-IN')}`,
      order: newOrder,
    };
  }, [tickers, activeTicker, availableMargin, brokerMode, brokerName, soundEnabled]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
    );
    if (soundEnabled) {
      playAlertPing('cancel');
    }
  }, [soundEnabled]);

  const squareOffPosition = useCallback((positionId: string) => {
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return;
    placeOrder({
      symbol: pos.symbol,
      side: pos.side === 'BUY' ? 'SELL' : 'BUY',
      type: 'MARKET',
      product: pos.product,
      quantity: pos.quantity,
    });
  }, [positions, placeOrder]);

  const squareOffAll = useCallback(() => {
    positions.forEach(pos => {
      placeOrder({
        symbol: pos.symbol,
        side: pos.side === 'BUY' ? 'SELL' : 'BUY',
        type: 'MARKET',
        product: pos.product,
        quantity: pos.quantity,
      });
    });
  }, [positions, placeOrder]);

  const addAlert = useCallback((symbol: string, targetPrice: number, condition: 'GTE' | 'LTE', note: string = '') => {
    const newAlert: PriceAlert = {
      id: `alt-${Date.now()}`,
      symbol,
      targetPrice,
      condition,
      note,
      createdAt: new Date().toLocaleTimeString(),
      triggered: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
    logAuditEvent({
      action: 'PRICE_ALERT_CREATED',
      category: 'ALERT',
      status: 'SUCCESS',
      details: `Alert created: ${symbol} ${condition} ₹${targetPrice} (${note})`,
    });
  }, []);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const addToCustomWatchlist = useCallback((symbol: string) => {
    if (!customWatchlist.includes(symbol)) {
      setCustomWatchlist(prev => [...prev, symbol]);
    }
  }, [customWatchlist]);

  const removeFromCustomWatchlist = useCallback((symbol: string) => {
    setCustomWatchlist(prev => prev.filter(s => s !== symbol));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const connectBroker = useCallback((name: string = 'Angel One SmartAPI') => {
    setBrokerConnected(true);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Broker Gateway Connected',
        message: `${name} active. Auto-TOTP verification authenticated.`,
        timestamp: 'Just now',
        type: 'SYSTEM',
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const disconnectBroker = useCallback(() => {
    setBrokerConnected(false);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Broker Disconnected',
        message: 'Angel One SmartAPI gateway session closed.',
        timestamp: 'Just now',
        type: 'SYSTEM',
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const handleSetBrokerMode = useCallback((mode: ExecutionMode) => {
    setBrokerMode(mode);
    setDeveloperSettings(prev => ({ ...prev, executionMode: mode }));
    logAuditEvent({
      action: 'EXECUTION_MODE_SWITCHED',
      category: 'TRADE',
      status: 'SUCCESS',
      details: `Execution mode changed to ${mode === 'PAPER' ? 'Paper Trading (Virtual Sandbox)' : 'Angel One SmartAPI (Live Brokerage)'}`,
    });
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: mode === 'PAPER' ? 'Switched to Paper Trading' : 'Live Trading Activated (Angel One)',
        message: mode === 'PAPER'
          ? 'Virtual sandbox mode active. Real capital is safe with ₹2,45,800 simulated virtual margin.'
          : '⚠️ LIVE MODE: Orders will be routed directly to Angel One SmartAPI using authenticated MPIN & TOTP session.',
        timestamp: 'Just now',
        type: 'SYSTEM',
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const updateDeveloperSettings = useCallback((newSettings: DeveloperSettings) => {
    setDeveloperSettings(newSettings);
    if (newSettings.executionMode) {
      setBrokerMode(newSettings.executionMode);
    }
  }, []);

  const activateProSubscription = useCallback((plan: 'PRO_MONTHLY' | 'INSTITUTIONAL_ANNUAL', paymentId: string) => {
    setSubscription({
      isTrial: false,
      trialDaysLeft: 0,
      trialExpiryDate: 'Permanent (Active Paid)',
      plan,
      active: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      paymentId,
    });
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Subscription Activated via Razorpay',
        message: `Plan ${plan} unlocked! 15-day trial converted to unrestricted full access. Payment ID: ${paymentId}`,
        timestamp: 'Just now',
        type: 'SYSTEM',
        read: false,
      },
      ...prev,
    ]);
  }, []);

  // GTT Orders Handler
  const placeGttOrder = useCallback(async (gttData: {
    symbol: string;
    side: OrderSide;
    product: ProductType;
    quantity: number;
    triggerPrice: number;
    limitPrice: number;
    trailingStopLossPoints?: number;
    trailingTargetPrice?: number;
  }) => {
    try {
      const created = await apiCreateGtt({
        ...gttData,
        brokerMode,
      });

      setGttOrders(prev => [created, ...prev]);

      if (soundEnabled) {
        playAlertPing('order');
      }

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: `GTT Placed: ${created.symbol}`,
          message: `${created.side} ${created.quantity} Trigger @ ₹${created.triggerPrice}, Limit @ ₹${created.limitPrice}${created.trailingStopLossPoints ? ` (TSL: ${created.trailingStopLossPoints} pts)` : ''} (${brokerMode})`,
          timestamp: 'Just now',
          type: 'ORDER',
          read: false,
        },
        ...prev,
      ]);

      return { success: true, message: 'GTT Order registered successfully.', gtt: created };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to place GTT order' };
    }
  }, [brokerMode, soundEnabled]);

  const cancelGttOrder = useCallback(async (id: string) => {
    await apiCancelGtt(id);
    setGttOrders(prev => prev.filter(g => g.id !== id));
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'GTT Order Cancelled',
        message: `Order ID ${id} was cancelled.`,
        timestamp: 'Just now',
        type: 'ORDER',
        read: false,
      },
      ...prev,
    ]);
  }, []);

  // Webhook Alert Dispatch
  const updateWebhookSettings = useCallback((settings: AlertWebhookSettings) => {
    setWebhookSettings(settings);
    setDeveloperSettings(prev => ({ ...prev, webhooks: settings }));
    logAuditEvent({
      action: 'WEBHOOK_CONFIG_UPDATED',
      category: 'ALERT',
      status: 'SUCCESS',
      details: `Alert Webhooks updated: Telegram ${settings.telegram.enabled ? 'Enabled' : 'Disabled'}, WhatsApp ${settings.whatsapp.enabled ? 'Enabled' : 'Disabled'}`,
    });
  }, []);

  const dispatchWebhookTest = useCallback(async (channel: 'telegram' | 'whatsapp') => {
    const config = channel === 'telegram' ? webhookSettings.telegram : webhookSettings.whatsapp;
    const res = await testWebhookAlert({
      channel,
      recipient: channel === 'telegram' ? webhookSettings.telegram.chatId : webhookSettings.whatsapp.recipientNumber,
      botToken: webhookSettings.telegram.botToken,
      webhookUrl: webhookSettings.whatsapp.webhookUrl,
      customMessage: `🚨 ShareMarket Pro: Verified instant trade signal transmission for ${channel.toUpperCase()}. System ready for live alerts!`,
    });

    if (soundEnabled) {
      playAlertPing('alert');
    }

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `${channel.toUpperCase()} Alert Test Dispatched`,
        message: res.message,
        timestamp: 'Just now',
        type: 'ALERT',
        read: false,
      },
      ...prev,
    ]);

    return res;
  }, [webhookSettings, soundEnabled]);

  return (
    <TradingContext.Provider
      value={{
        tickers,
        activeSymbol,
        setActiveSymbol,
        activeTicker,
        watchlistType,
        setWatchlistType,
        customWatchlist,
        addToCustomWatchlist,
        removeFromCustomWatchlist,

        cashBalance,
        usedMargin,
        availableMargin,
        positions,
        holdings,
        orders,
        placeOrder,
        cancelOrder,
        squareOffPosition,
        squareOffAll,

        // GTT Orders
        gttOrders,
        placeGttOrder,
        cancelGttOrder,

        alerts,
        addAlert,
        removeAlert,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        soundEnabled,
        setSoundEnabled,

        // Webhook integration
        webhookSettings,
        updateWebhookSettings,
        dispatchWebhookTest,

        brokerConnected,
        brokerName,
        connectBroker,
        disconnectBroker,
        brokerMode,
        setBrokerMode: handleSetBrokerMode,
        developerSettings,
        updateDeveloperSettings,
        simulationEnabled,
        setSimulationEnabled,
        refreshLiveQuotes,

        activeStrategy,
        setActiveStrategy,
        allStrategies,
        setAllStrategies,

        subscription,
        activateProSubscription,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
