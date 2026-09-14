import {
  HistoricalCandle,
  SmcOrderBlock,
  SmcFairValueGap,
  SmcLiquiditySweep,
  SmcStructureBreak,
  SmcLiquidityPool,
  SmcScanResults,
} from '../types/market';

/**
 * Real-time Smart Money Concepts (SMC) Pattern Scanner
 * Algorithmic identification of Order Blocks, Fair Value Gaps, Liquidity Sweeps,
 * Market Structure Breaks (BOS/CHoCH), and Liquidity Pools (EQH/EQL).
 */
export function scanSMCStructures(candles: HistoricalCandle[]): SmcScanResults {
  if (!candles || candles.length < 5) {
    return {
      orderBlocks: [],
      fairValueGaps: [],
      liquiditySweeps: [],
      structureBreaks: [],
      liquidityPools: [],
      activeSetupSummary: {
        bias: 'NEUTRAL',
        keyLevel: 0,
        recommendedAction: 'Insufficient candle data for SMC scan',
        freshObCount: 0,
        activeFvgCount: 0,
        recentSweep: null,
      },
    };
  }

  const orderBlocks: SmcOrderBlock[] = [];
  const fairValueGaps: SmcFairValueGap[] = [];
  const liquiditySweeps: SmcLiquiditySweep[] = [];
  const structureBreaks: SmcStructureBreak[] = [];
  const liquidityPools: SmcLiquidityPool[] = [];

  const n = candles.length;
  const currentLtp = candles[n - 1].close;

  // Average True Range (ATR 14) and Avg Volume calculation for relative filters
  const atrs: number[] = [];
  let volSum = 0;
  for (let i = 1; i < n; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    atrs.push(tr);
    volSum += candles[i].volume;
  }
  const avgAtr = atrs.reduce((a, b) => a + b, 0) / (atrs.length || 1);
  const avgVol = volSum / (n - 1 || 1);

  // --------------------------------------------------------------------------
  // 1. FAIR VALUE GAPS (FVG) SCANNER (3-Candle Imbalance)
  // --------------------------------------------------------------------------
  for (let i = 1; i < n - 1; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const next = candles[i + 1];

    // Bullish FVG (Candle 1 High < Candle 3 Low)
    if (next.low > prev.high) {
      const bottom = prev.high;
      const top = next.low;
      const gapSize = top - bottom;

      // Minimum gap threshold (at least 15% of ATR) to filter noise
      if (gapSize >= avgAtr * 0.15) {
        const ce = (top + bottom) / 2;
        let status: SmcFairValueGap['status'] = 'ACTIVE';
        let fillPercent = 0;
        let endIndex = n - 1;

        // Check subsequent candle mitigation
        for (let j = i + 2; j < n; j++) {
          const testCandle = candles[j];
          if (testCandle.low <= bottom) {
            status = 'FILLED';
            fillPercent = 100;
            endIndex = j;
            break;
          } else if (testCandle.low < top) {
            status = 'PARTIALLY_FILLED';
            const filledDepth = top - testCandle.low;
            fillPercent = Math.max(fillPercent, Math.min(100, Math.round((filledDepth / gapSize) * 100)));
          }
        }

        fairValueGaps.push({
          id: `fvg-bull-${i}`,
          type: 'BULLISH_FVG',
          startIndex: i - 1,
          endIndex,
          top: Number(top.toFixed(2)),
          bottom: Number(bottom.toFixed(2)),
          consequentEncroachment: Number(ce.toFixed(2)),
          status,
          fillPercent,
          label: `Bullish FVG (${status === 'ACTIVE' ? 'Active' : status === 'PARTIALLY_FILLED' ? `${fillPercent}% Filled` : 'Mitigated'})`,
          createdTime: curr.time,
        });
      }
    }

    // Bearish FVG (Candle 1 Low > Candle 3 High)
    if (prev.low > next.high) {
      const top = prev.low;
      const bottom = next.high;
      const gapSize = top - bottom;

      if (gapSize >= avgAtr * 0.15) {
        const ce = (top + bottom) / 2;
        let status: SmcFairValueGap['status'] = 'ACTIVE';
        let fillPercent = 0;
        let endIndex = n - 1;

        for (let j = i + 2; j < n; j++) {
          const testCandle = candles[j];
          if (testCandle.high >= top) {
            status = 'FILLED';
            fillPercent = 100;
            endIndex = j;
            break;
          } else if (testCandle.high > bottom) {
            status = 'PARTIALLY_FILLED';
            const filledDepth = testCandle.high - bottom;
            fillPercent = Math.max(fillPercent, Math.min(100, Math.round((filledDepth / gapSize) * 100)));
          }
        }

        fairValueGaps.push({
          id: `fvg-bear-${i}`,
          type: 'BEARISH_FVG',
          startIndex: i - 1,
          endIndex,
          top: Number(top.toFixed(2)),
          bottom: Number(bottom.toFixed(2)),
          consequentEncroachment: Number(ce.toFixed(2)),
          status,
          fillPercent,
          label: `Bearish FVG (${status === 'ACTIVE' ? 'Active' : status === 'PARTIALLY_FILLED' ? `${fillPercent}% Filled` : 'Mitigated'})`,
          createdTime: curr.time,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 2. SWING PIVOTS FOR LIQUIDITY SWEEPS, BOS, CHOCH & EQUAL HIGHS/LOWS
  // --------------------------------------------------------------------------
  interface SwingPoint {
    index: number;
    price: number;
    type: 'HIGH' | 'LOW';
    time: string;
  }

  const swingPivots: SwingPoint[] = [];
  const pivotRadius = 2; // 5-candle pivot

  for (let i = pivotRadius; i < n - pivotRadius; i++) {
    const c = candles[i];
    let isHigh = true;
    let isLow = true;

    for (let j = 1; j <= pivotRadius; j++) {
      if (candles[i - j].high >= c.high || candles[i + j].high >= c.high) isHigh = false;
      if (candles[i - j].low <= c.low || candles[i + j].low <= c.low) isLow = false;
    }

    if (isHigh) {
      swingPivots.push({ index: i, price: c.high, type: 'HIGH', time: c.time });
    }
    if (isLow) {
      swingPivots.push({ index: i, price: c.low, type: 'LOW', time: c.time });
    }
  }

  // --------------------------------------------------------------------------
  // 3. LIQUIDITY SWEEPS (SSL & BSL Sweeps / Turtle Soup)
  // --------------------------------------------------------------------------
  const swingLows = swingPivots.filter(p => p.type === 'LOW');
  const swingHighs = swingPivots.filter(p => p.type === 'HIGH');

  // Check SSL sweeps (Sell-Side Liquidity below previous swing low)
  for (const swLow of swingLows) {
    for (let i = swLow.index + 1; i < n; i++) {
      const c = candles[i];
      // Wick goes below swing low, but candle closes back ABOVE swing low
      if (c.low < swLow.price && c.close > swLow.price) {
        const lowerWick = Math.min(c.open, c.close) - c.low;
        const body = Math.abs(c.close - c.open);
        // Valid rejection wick condition: lower wick > 40% of entire candle range
        if (lowerWick >= body * 0.5) {
          const volMultiplier = c.volume / (avgVol || 1);
          liquiditySweeps.push({
            id: `sweep-ssl-${i}-${swLow.index}`,
            type: 'SSL_SWEEP',
            candleIndex: i,
            levelSwept: Number(swLow.price.toFixed(2)),
            extremePrice: Number(c.low.toFixed(2)),
            rejectionClose: Number(c.close.toFixed(2)),
            sweepVolume: c.volume,
            institutionalReaction: volMultiplier >= 1.1,
            label: `SSL Swept (${swLow.price.toFixed(0)} Liquidity Grab)`,
            biasResult: 'BULLISH',
            createdTime: c.time,
          });
          break; // only record the initial clean sweep
        }
      }
    }
  }

  // Check BSL sweeps (Buy-Side Liquidity above previous swing high)
  for (const swHigh of swingHighs) {
    for (let i = swHigh.index + 1; i < n; i++) {
      const c = candles[i];
      // Wick goes above swing high, but candle closes back BELOW swing high
      if (c.high > swHigh.price && c.close < swHigh.price) {
        const upperWick = c.high - Math.max(c.open, c.close);
        const body = Math.abs(c.close - c.open);
        if (upperWick >= body * 0.5) {
          const volMultiplier = c.volume / (avgVol || 1);
          liquiditySweeps.push({
            id: `sweep-bsl-${i}-${swHigh.index}`,
            type: 'BSL_SWEEP',
            candleIndex: i,
            levelSwept: Number(swHigh.price.toFixed(2)),
            extremePrice: Number(c.high.toFixed(2)),
            rejectionClose: Number(c.close.toFixed(2)),
            sweepVolume: c.volume,
            institutionalReaction: volMultiplier >= 1.1,
            label: `BSL Swept (${swHigh.price.toFixed(0)} Liquidity Grab)`,
            biasResult: 'BEARISH',
            createdTime: c.time,
          });
          break;
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. ORDER BLOCKS (OB) SCANNER (Institutional Demand & Supply Zones)
  // --------------------------------------------------------------------------
  for (let i = 2; i < n - 2; i++) {
    const c0 = candles[i];
    const c1 = candles[i + 1];
    const c2 = candles[i + 2];

    const isBearishC0 = c0.close < c0.open;
    const isBullishC0 = c0.close > c0.open;

    // Bullish Order Block (Last bearish candle before violent 2-bar bullish displacement)
    if (isBearishC0) {
      const displacement = (c2.close - c0.close);
      const isStrongImpulse = displacement > avgAtr * 1.3 && (c1.close > c0.high || c2.close > c0.high);

      if (isStrongImpulse) {
        const top = Math.max(c0.open, c0.high);
        const bottom = c0.low;
        const mt = (top + bottom) / 2;
        let status: SmcOrderBlock['status'] = 'FRESH';
        let mitigationIndex: number | undefined;
        let endIndex = n - 1;

        for (let j = i + 3; j < n; j++) {
          const test = candles[j];
          if (test.low < bottom) {
            status = 'MITIGATED';
            mitigationIndex = j;
            endIndex = j;
            break;
          } else if (test.low <= top) {
            status = 'TESTED';
          }
        }

        const volScore = Number((c0.volume / (avgVol || 1)).toFixed(1));

        orderBlocks.push({
          id: `ob-bull-${i}`,
          type: 'BULLISH_OB',
          startIndex: i,
          endIndex,
          top: Number(top.toFixed(2)),
          bottom: Number(bottom.toFixed(2)),
          meanThreshold: Number(mt.toFixed(2)),
          status,
          volumeScore: volScore,
          mitigationIndex,
          label: `Bullish OB (${status === 'FRESH' ? 'Fresh Demand' : status === 'TESTED' ? 'Tested' : 'Mitigated'})`,
          createdTime: c0.time,
        });
      }
    }

    // Bearish Order Block (Last bullish candle before violent 2-bar bearish displacement)
    if (isBullishC0) {
      const displacement = (c0.close - c2.close);
      const isStrongImpulse = displacement > avgAtr * 1.3 && (c1.close < c0.low || c2.close < c0.low);

      if (isStrongImpulse) {
        const top = c0.high;
        const bottom = Math.min(c0.open, c0.low);
        const mt = (top + bottom) / 2;
        let status: SmcOrderBlock['status'] = 'FRESH';
        let mitigationIndex: number | undefined;
        let endIndex = n - 1;

        for (let j = i + 3; j < n; j++) {
          const test = candles[j];
          if (test.high > top) {
            status = 'MITIGATED';
            mitigationIndex = j;
            endIndex = j;
            break;
          } else if (test.high >= bottom) {
            status = 'TESTED';
          }
        }

        const volScore = Number((c0.volume / (avgVol || 1)).toFixed(1));

        orderBlocks.push({
          id: `ob-bear-${i}`,
          type: 'BEARISH_OB',
          startIndex: i,
          endIndex,
          top: Number(top.toFixed(2)),
          bottom: Number(bottom.toFixed(2)),
          meanThreshold: Number(mt.toFixed(2)),
          status,
          volumeScore: volScore,
          mitigationIndex,
          label: `Bearish OB (${status === 'FRESH' ? 'Fresh Supply' : status === 'TESTED' ? 'Tested' : 'Mitigated'})`,
          createdTime: c0.time,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 5. EQUAL HIGHS (EQH) & EQUAL LOWS (EQL) LIQUIDITY POOLS
  // --------------------------------------------------------------------------
  const eqTolerance = currentLtp * 0.0012; // 0.12% price tolerance

  // Check Equal Highs
  for (let i = 0; i < swingHighs.length; i++) {
    for (let j = i + 1; j < swingHighs.length; j++) {
      const p1 = swingHighs[i];
      const p2 = swingHighs[j];
      if (Math.abs(p1.price - p2.price) <= eqTolerance && (p2.index - p1.index) >= 3) {
        liquidityPools.push({
          id: `eqh-${p1.index}-${p2.index}`,
          type: 'EQH',
          indices: [p1.index, p2.index],
          price: Number(((p1.price + p2.price) / 2).toFixed(2)),
          label: `$$$ EQH Liquidity Pool (${((p1.price + p2.price) / 2).toFixed(1)})`,
          createdTime: p2.time,
        });
      }
    }
  }

  // Check Equal Lows
  for (let i = 0; i < swingLows.length; i++) {
    for (let j = i + 1; j < swingLows.length; j++) {
      const p1 = swingLows[i];
      const p2 = swingLows[j];
      if (Math.abs(p1.price - p2.price) <= eqTolerance && (p2.index - p1.index) >= 3) {
        liquidityPools.push({
          id: `eql-${p1.index}-${p2.index}`,
          type: 'EQL',
          indices: [p1.index, p2.index],
          price: Number(((p1.price + p2.price) / 2).toFixed(2)),
          label: `$$$ EQL Liquidity Pool (${((p1.price + p2.price) / 2).toFixed(1)})`,
          createdTime: p2.time,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 6. MARKET STRUCTURE BREAKS (BOS & CHOCH)
  // --------------------------------------------------------------------------
  for (let i = 1; i < swingHighs.length; i++) {
    const prevHigh = swingHighs[i - 1];
    for (let j = prevHigh.index + 1; j < n; j++) {
      if (candles[j].close > prevHigh.price) {
        structureBreaks.push({
          id: `bos-bull-${prevHigh.index}-${j}`,
          type: 'BOS_BULLISH',
          fromIndex: prevHigh.index,
          toIndex: j,
          level: prevHigh.price,
          label: `BOS (Bullish Break @ ${prevHigh.price.toFixed(0)})`,
          createdTime: candles[j].time,
        });
        break;
      }
    }
  }

  for (let i = 1; i < swingLows.length; i++) {
    const prevLow = swingLows[i - 1];
    for (let j = prevLow.index + 1; j < n; j++) {
      if (candles[j].close < prevLow.price) {
        structureBreaks.push({
          id: `bos-bear-${prevLow.index}-${j}`,
          type: 'BOS_BEARISH',
          fromIndex: prevLow.index,
          toIndex: j,
          level: prevLow.price,
          label: `BOS (Bearish Break @ ${prevLow.price.toFixed(0)})`,
          createdTime: candles[j].time,
        });
        break;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 7. ACTIVE SMC SETUP SUMMARY
  // --------------------------------------------------------------------------
  const freshObs = orderBlocks.filter(o => o.status === 'FRESH' || o.status === 'TESTED');
  const activeFvgs = fairValueGaps.filter(f => f.status === 'ACTIVE' || f.status === 'PARTIALLY_FILLED');
  const recentSweep = liquiditySweeps.length > 0 ? liquiditySweeps[liquiditySweeps.length - 1] : null;

  let bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let recommendedAction = 'Monitoring price action for institutional sweep or OB tap';
  let keyLevel = currentLtp;

  if (recentSweep && recentSweep.candleIndex >= n - 10) {
    if (recentSweep.type === 'SSL_SWEEP') {
      bias = 'BULLISH';
      keyLevel = recentSweep.levelSwept;
      recommendedAction = `Bullish Setup: SSL swept at ₹${recentSweep.levelSwept.toFixed(2)}. Look for CE scalps on FVG/OB retest.`;
    } else {
      bias = 'BEARISH';
      keyLevel = recentSweep.levelSwept;
      recommendedAction = `Bearish Setup: BSL swept at ₹${recentSweep.levelSwept.toFixed(2)}. Look for PE scalps on Supply OB retest.`;
    }
  } else if (freshObs.length > 0) {
    const nearestBullOb = freshObs.filter(o => o.type === 'BULLISH_OB' && o.top <= currentLtp).pop();
    const nearestBearOb = freshObs.filter(o => o.type === 'BEARISH_OB' && o.bottom >= currentLtp).shift();

    if (nearestBullOb && Math.abs(currentLtp - nearestBullOb.top) < avgAtr * 1.5) {
      bias = 'BULLISH';
      keyLevel = nearestBullOb.meanThreshold;
      recommendedAction = `Price approaching Fresh Demand OB (₹${nearestBullOb.bottom} - ₹${nearestBullOb.top}). Watch for bullish reaction.`;
    } else if (nearestBearOb && Math.abs(nearestBearOb.bottom - currentLtp) < avgAtr * 1.5) {
      bias = 'BEARISH';
      keyLevel = nearestBearOb.meanThreshold;
      recommendedAction = `Price approaching Fresh Supply OB (₹${nearestBearOb.bottom} - ₹${nearestBearOb.top}). Watch for supply rejection.`;
    }
  }

  return {
    orderBlocks: orderBlocks.slice(-8), // keep most relevant recent zones
    fairValueGaps: fairValueGaps.slice(-10),
    liquiditySweeps: liquiditySweeps.slice(-6),
    structureBreaks: structureBreaks.slice(-6),
    liquidityPools: liquidityPools.slice(-6),
    activeSetupSummary: {
      bias,
      keyLevel: Number(keyLevel.toFixed(2)),
      recommendedAction,
      freshObCount: freshObs.length,
      activeFvgCount: activeFvgs.length,
      recentSweep,
    },
  };
}
