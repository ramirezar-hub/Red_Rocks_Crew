import { Pick, MemberStats } from '../types';

export function calculateStats(picks: Pick[]): Omit<MemberStats, 'hotScore'> {
  const completedPicks = picks.filter((p) => p.result && p.result !== 'pending');
  const wins = picks.filter((p) => p.result === 'win').length;
  const losses = picks.filter((p) => p.result === 'loss').length;
  const pushes = picks.filter((p) => p.result === 'push').length;
  const pending = picks.filter((p) => !p.result || p.result === 'pending').length;

  const totalDecided = wins + losses;
  const winRate = totalDecided > 0 ? (wins / totalDecided) * 100 : 0;

  const unitsWon = picks
    .filter((p) => p.result === 'win')
    .reduce((sum, p) => sum + (p.payout || 0), 0);

  const unitsLost = picks
    .filter((p) => p.result === 'loss')
    .reduce((sum, p) => sum + Math.abs(p.payout || 0), 0);

  const netUnits = unitsWon - unitsLost;

  const totalUnitsRisked = picks
    .filter((p) => p.result && p.result !== 'pending' && p.result !== 'push')
    .reduce((sum, p) => sum + p.units, 0);

  const roi = totalUnitsRisked > 0 ? (netUnits / totalUnitsRisked) * 100 : 0;

  // Calculate streaks
  const { currentStreak, streakType, longestWinStreak, longestLossStreak } =
    calculateStreaks(picks);

  return {
    totalPicks: picks.length,
    wins,
    losses,
    pushes,
    pending,
    winRate,
    roi,
    unitsWon,
    unitsLost,
    netUnits,
    currentStreak,
    streakType,
    longestWinStreak,
    longestLossStreak,
  };
}

function calculateStreaks(picks: Pick[]): {
  currentStreak: number;
  streakType: 'win' | 'loss' | 'none';
  longestWinStreak: number;
  longestLossStreak: number;
} {
  const decidedPicks = picks
    .filter((p) => p.result === 'win' || p.result === 'loss')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (decidedPicks.length === 0) {
    return {
      currentStreak: 0,
      streakType: 'none',
      longestWinStreak: 0,
      longestLossStreak: 0,
    };
  }

  // Current streak
  let currentStreak = 1;
  const streakType = decidedPicks[0].result as 'win' | 'loss';

  for (let i = 1; i < decidedPicks.length; i++) {
    if (decidedPicks[i].result === streakType) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Longest streaks
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let tempWinStreak = 0;
  let tempLossStreak = 0;

  for (const pick of decidedPicks) {
    if (pick.result === 'win') {
      tempWinStreak++;
      tempLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
    } else {
      tempLossStreak++;
      tempWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, tempLossStreak);
    }
  }

  return {
    currentStreak,
    streakType,
    longestWinStreak,
    longestLossStreak,
  };
}

export function calculateHotScore(picks: Pick[]): number {
  // Hot score is 0-100, with 50 being neutral
  // Factors: recent win rate, streak, ROI trend

  const recentPicks = picks
    .filter((p) => p.result === 'win' || p.result === 'loss')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  if (recentPicks.length === 0) return 50;

  const recentWins = recentPicks.filter((p) => p.result === 'win').length;
  const recentWinRate = (recentWins / recentPicks.length) * 100;

  // Calculate streak bonus/penalty
  let streakModifier = 0;
  let currentStreak = 1;
  const streakType = recentPicks[0]?.result;

  for (let i = 1; i < recentPicks.length; i++) {
    if (recentPicks[i].result === streakType) {
      currentStreak++;
    } else {
      break;
    }
  }

  if (streakType === 'win') {
    streakModifier = Math.min(currentStreak * 5, 25);
  } else {
    streakModifier = -Math.min(currentStreak * 5, 25);
  }

  // Calculate ROI component
  const recentPayouts = recentPicks.reduce((sum, p) => sum + (p.payout || 0), 0);
  const recentUnits = recentPicks.reduce((sum, p) => sum + p.units, 0);
  const recentROI = recentUnits > 0 ? (recentPayouts / recentUnits) * 100 : 0;
  const roiModifier = Math.max(-15, Math.min(15, recentROI / 10));

  // Base score from win rate (0-50 maps to 25-75)
  const baseScore = 25 + (recentWinRate / 2);

  // Final score with modifiers
  let hotScore = baseScore + streakModifier + roiModifier;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(hotScore)));
}

export function getHotLevel(hotScore: number): {
  level: 'freezing' | 'cold' | 'cool' | 'neutral' | 'warm' | 'hot' | 'fire';
  emoji: string;
  color: string;
} {
  if (hotScore >= 85) return { level: 'fire', emoji: '🔥', color: '#ef4444' };
  if (hotScore >= 70) return { level: 'hot', emoji: '🔥', color: '#f97316' };
  if (hotScore >= 60) return { level: 'warm', emoji: '☀️', color: '#eab308' };
  if (hotScore >= 40) return { level: 'neutral', emoji: '😐', color: '#6b7280' };
  if (hotScore >= 30) return { level: 'cool', emoji: '❄️', color: '#06b6d4' };
  if (hotScore >= 15) return { level: 'cold', emoji: '🥶', color: '#3b82f6' };
  return { level: 'freezing', emoji: '💀', color: '#8b5cf6' };
}

export function formatOdds(odds: number): string {
  if (odds > 0) return `+${odds}`;
  return odds.toString();
}

export function formatSpread(spread: number): string {
  if (spread > 0) return `+${spread}`;
  if (spread === 0) return 'PK';
  return spread.toString();
}

export function formatUnits(units: number): string {
  if (units >= 0) return `+${units.toFixed(2)}u`;
  return `${units.toFixed(2)}u`;
}
