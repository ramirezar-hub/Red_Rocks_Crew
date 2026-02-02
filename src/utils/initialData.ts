import { Member, Game, TripInfo, Alert, NewsItem, HistoricalYear, Pick } from '../types';

// Sample picks for demo purposes
const createSamplePicks = (username: string): Pick[] => {
  const picks: Pick[] = [];
  const teams = ['UConn', 'Purdue', 'Houston', 'Duke', 'Tennessee', 'Auburn', 'Kentucky', 'Kansas'];
  const results: Array<'win' | 'loss' | 'push' | 'pending'> = ['win', 'win', 'loss', 'win', 'loss', 'win', 'pending', 'pending'];

  for (let i = 0; i < 8; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (7 - i));

    const result = results[i];
    const units = Math.floor(Math.random() * 3) + 1;
    const odds = Math.random() > 0.5 ? -110 : Math.floor(Math.random() * 200) + 100;

    let payout = 0;
    if (result === 'win') {
      payout = odds > 0 ? units * (odds / 100) : units * (100 / Math.abs(odds));
    } else if (result === 'loss') {
      payout = -units;
    }

    picks.push({
      id: crypto.randomUUID(),
      userId: username,
      username,
      team: teams[i],
      betType: Math.random() > 0.5 ? 'spread' : 'moneyline',
      spread: Math.random() > 0.5 ? Math.floor(Math.random() * 14) - 7 : undefined,
      odds,
      units,
      result,
      payout,
      gameDate: date.toISOString().split('T')[0],
      createdAt: date.toISOString(),
      source: 'manual',
    });
  }

  return picks;
};

// Create varying pick histories for each member
const createMemberPicks = (username: string, pattern: 'hot' | 'cold' | 'neutral' | 'streak'): Pick[] => {
  const picks: Pick[] = [];
  const teams = ['UConn', 'Purdue', 'Houston', 'Duke', 'Tennessee', 'Auburn', 'Kentucky', 'Kansas', 'Arizona', 'Marquette'];

  let resultPattern: Array<'win' | 'loss' | 'pending'>;

  switch (pattern) {
    case 'hot':
      resultPattern = ['win', 'win', 'win', 'win', 'win', 'loss', 'win', 'win', 'pending', 'pending'];
      break;
    case 'cold':
      resultPattern = ['loss', 'loss', 'loss', 'win', 'loss', 'loss', 'loss', 'win', 'pending', 'pending'];
      break;
    case 'streak':
      resultPattern = ['win', 'win', 'win', 'win', 'loss', 'loss', 'loss', 'loss', 'pending', 'pending'];
      break;
    default:
      resultPattern = ['win', 'loss', 'win', 'loss', 'win', 'loss', 'win', 'loss', 'pending', 'pending'];
  }

  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (9 - i));

    const result = resultPattern[i];
    const units = Math.floor(Math.random() * 3) + 1;
    const odds = -110;

    let payout = 0;
    if (result === 'win') {
      payout = units * (100 / 110);
    } else if (result === 'loss') {
      payout = -units;
    }

    picks.push({
      id: crypto.randomUUID(),
      userId: username,
      username,
      team: teams[i],
      betType: i % 3 === 0 ? 'moneyline' : 'spread',
      spread: i % 3 !== 0 ? Math.floor(Math.random() * 14) - 7 : undefined,
      odds,
      units,
      result,
      payout,
      gameDate: date.toISOString().split('T')[0],
      createdAt: date.toISOString(),
      source: 'manual',
    });
  }

  return picks;
};

// Calculate stats from picks
const calculateMemberStats = (picks: Pick[]) => {
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

  const totalUnitsRisked = completedPicks.reduce((sum, p) => sum + p.units, 0);
  const roi = totalUnitsRisked > 0 ? (netUnits / totalUnitsRisked) * 100 : 0;

  // Calculate streaks
  const decidedPicks = picks
    .filter((p) => p.result === 'win' || p.result === 'loss')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  let currentStreak = 0;
  let streakType: 'win' | 'loss' | 'none' = 'none';

  if (decidedPicks.length > 0) {
    streakType = decidedPicks[0].result as 'win' | 'loss';
    currentStreak = 1;

    for (let i = 1; i < decidedPicks.length; i++) {
      if (decidedPicks[i].result === streakType) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate hot score
  const recentPicks = decidedPicks.slice(0, 10);
  let hotScore = 50;

  if (recentPicks.length > 0) {
    const recentWins = recentPicks.filter((p) => p.result === 'win').length;
    const recentWinRate = (recentWins / recentPicks.length) * 100;
    const baseScore = 25 + (recentWinRate / 2);

    let streakModifier = 0;
    if (streakType === 'win') {
      streakModifier = Math.min(currentStreak * 5, 25);
    } else if (streakType === 'loss') {
      streakModifier = -Math.min(currentStreak * 5, 25);
    }

    hotScore = Math.max(0, Math.min(100, Math.round(baseScore + streakModifier)));
  }

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
    longestWinStreak: Math.max(currentStreak, 3),
    longestLossStreak: Math.max(currentStreak, 2),
    hotScore,
  };
};

// Create members with varying performance
const mikePicks = createMemberPicks('mike', 'hot');
const danPicks = createMemberPicks('dan', 'cold');
const chrisPicks = createMemberPicks('chris', 'neutral');
const alexPicks = createMemberPicks('alex', 'streak');
const jordanPicks = createMemberPicks('jordan', 'hot');

export const initialMembers: Member[] = [
  {
    id: '1',
    name: 'Mike',
    username: 'mike',
    avatar: undefined,
    picks: mikePicks,
    stats: calculateMemberStats(mikePicks),
  },
  {
    id: '2',
    name: 'Dan',
    username: 'dan',
    avatar: undefined,
    picks: danPicks,
    stats: calculateMemberStats(danPicks),
  },
  {
    id: '3',
    name: 'Chris',
    username: 'chris',
    avatar: undefined,
    picks: chrisPicks,
    stats: calculateMemberStats(chrisPicks),
  },
  {
    id: '4',
    name: 'Alex',
    username: 'alex',
    avatar: undefined,
    picks: alexPicks,
    stats: calculateMemberStats(alexPicks),
  },
  {
    id: '5',
    name: 'Jordan',
    username: 'jordan',
    avatar: undefined,
    picks: jordanPicks,
    stats: calculateMemberStats(jordanPicks),
  },
];

export const initialGames: Game[] = [
  {
    id: '1',
    homeTeam: 'UConn',
    awayTeam: 'San Diego State',
    spread: -8.5,
    overUnder: 142.5,
    homeMoneyline: -350,
    awayMoneyline: 280,
    gameTime: '2026-03-20T19:00:00Z',
    status: 'scheduled',
    round: 'Sweet 16',
    region: 'East',
  },
  {
    id: '2',
    homeTeam: 'Purdue',
    awayTeam: 'Gonzaga',
    spread: -4.5,
    overUnder: 151.5,
    homeMoneyline: -180,
    awayMoneyline: 155,
    gameTime: '2026-03-20T21:30:00Z',
    status: 'scheduled',
    round: 'Sweet 16',
    region: 'Midwest',
  },
  {
    id: '3',
    homeTeam: 'Houston',
    awayTeam: 'Duke',
    spread: -2.5,
    overUnder: 138.5,
    homeMoneyline: -135,
    awayMoneyline: 115,
    gameTime: '2026-03-21T19:00:00Z',
    status: 'scheduled',
    round: 'Sweet 16',
    region: 'South',
  },
  {
    id: '4',
    homeTeam: 'Tennessee',
    awayTeam: 'Creighton',
    spread: -6.5,
    overUnder: 135.5,
    homeMoneyline: -260,
    awayMoneyline: 215,
    gameTime: '2026-03-21T21:30:00Z',
    status: 'scheduled',
    round: 'Sweet 16',
    region: 'West',
  },
  {
    id: '5',
    homeTeam: 'Auburn',
    awayTeam: 'Yale',
    homeScore: 78,
    awayScore: 65,
    spread: -12.5,
    overUnder: 145.5,
    homeMoneyline: -650,
    awayMoneyline: 480,
    gameTime: '2026-03-19T12:00:00Z',
    status: 'final',
    round: 'Round of 32',
    region: 'East',
  },
  {
    id: '6',
    homeTeam: 'Kentucky',
    awayTeam: 'Oakland',
    homeScore: 80,
    awayScore: 76,
    spread: -15.5,
    overUnder: 148.5,
    homeMoneyline: -1200,
    awayMoneyline: 750,
    gameTime: '2026-03-19T14:30:00Z',
    status: 'final',
    round: 'Round of 32',
    region: 'South',
  },
];

export const initialTripInfo: TripInfo = {
  year: 2026,
  startDate: '2026-03-19',
  endDate: '2026-03-22',
  hotel: 'Circa Resort & Casino',
  hotelAddress: '8 Fremont Street Experience, Las Vegas, NV 89101',
  itinerary: [
    {
      id: '1',
      date: '2026-03-19',
      time: '10:00 AM',
      title: 'Arrival & Check-in',
      description: 'Meet at hotel lobby, check in to rooms',
      location: 'Circa Resort & Casino',
    },
    {
      id: '2',
      date: '2026-03-19',
      time: '12:00 PM',
      title: 'Stadium Swim',
      description: 'Watch the first games at the pool',
      location: 'Circa Stadium Swim',
    },
    {
      id: '3',
      date: '2026-03-19',
      time: '6:00 PM',
      title: 'Dinner at Barry\'s Downtown Prime',
      description: 'Steakhouse dinner - reservation confirmed',
      location: 'Circa Resort',
    },
    {
      id: '4',
      date: '2026-03-20',
      time: '9:00 AM',
      title: 'Sportsbook Session',
      description: 'Morning lines review and betting',
      location: 'Circa Sportsbook',
    },
    {
      id: '5',
      date: '2026-03-20',
      time: '7:00 PM',
      title: 'Sweet 16 Games',
      description: 'Watch parties at various sportsbooks',
      location: 'Las Vegas Strip',
    },
    {
      id: '6',
      date: '2026-03-21',
      time: '10:00 AM',
      title: 'Golf at TPC Las Vegas',
      description: 'Morning golf round',
      location: 'TPC Las Vegas',
    },
    {
      id: '7',
      date: '2026-03-21',
      time: '7:00 PM',
      title: 'Sweet 16 Day 2',
      description: 'Final Sweet 16 games',
      location: 'Westgate SuperBook',
    },
    {
      id: '8',
      date: '2026-03-22',
      time: '11:00 AM',
      title: 'Checkout & Departure',
      description: 'Check out and head to airport',
      location: 'Circa Resort & Casino',
    },
  ],
  reservations: [
    {
      id: '1',
      type: 'restaurant',
      name: 'Barry\'s Downtown Prime',
      date: '2026-03-19',
      time: '6:00 PM',
      confirmationNumber: 'BDP-2026-3847',
      notes: 'Party of 5, private dining room requested',
    },
    {
      id: '2',
      type: 'activity',
      name: 'TPC Las Vegas Golf',
      date: '2026-03-21',
      time: '10:00 AM',
      confirmationNumber: 'TPC-2026-9182',
      notes: 'Clubs rental included',
    },
    {
      id: '3',
      type: 'show',
      name: 'Absinthe Show',
      date: '2026-03-20',
      time: '10:00 PM',
      confirmationNumber: 'ABS-2026-4521',
      notes: 'Front row VIP seats',
    },
  ],
};

export const initialAlerts: Alert[] = [
  {
    id: '1',
    type: 'promo',
    title: 'Circa Sportsbook Promo',
    message: 'Bet $100 on any Sweet 16 game, get $50 free bet!',
    createdBy: 'mike',
    createdAt: new Date().toISOString(),
    expiresAt: '2026-03-20T23:59:59Z',
  },
  {
    id: '2',
    type: 'odds',
    title: 'Line Movement Alert',
    message: 'UConn line moved from -7.5 to -8.5. Sharp money on UConn!',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'injury',
    title: 'Injury Update',
    message: 'Duke PG questionable for Sweet 16 matchup',
    createdBy: 'chris',
    createdAt: new Date().toISOString(),
  },
];

export const initialNews: NewsItem[] = [
  {
    id: '1',
    type: 'tournament',
    title: 'Sweet 16 Preview: Top Seeds Look Strong',
    summary: 'All four #1 seeds advance to the Sweet 16 for the first time since 2019.',
    source: 'ESPN',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'betting',
    title: 'Sharp Money Report: Where the Wiseguys Are',
    summary: 'Professional bettors loading up on Purdue and the under in Houston-Duke.',
    source: 'Action Network',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'injury',
    title: 'Duke Guard Cleared to Play',
    summary: 'Star point guard passed concussion protocol, will start vs Houston.',
    source: 'CBS Sports',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'promo',
    title: 'Westgate SuperBook: Free $25 Bet',
    summary: 'Sign up for SuperBook app and get $25 free bet for March Madness.',
    source: 'Vegas Insider',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    type: 'hotel',
    title: 'Pool Party at Circa This Weekend',
    summary: 'Stadium Swim hosting special March Madness viewing party with DJs.',
    source: 'Circa News',
    createdAt: new Date().toISOString(),
  },
];

export const initialHistory: HistoricalYear[] = [
  {
    year: 2025,
    winner: 'Mike',
    totalPicks: 156,
    groupRecord: '87-69',
    groupROI: 8.2,
    bestMoment: 'Chris hit a 5-leg parlay on Elite 8 Saturday for +2500',
    worstBeat: 'Dan lost 4 straight games on a bad beat backdoor cover',
    mvp: 'Mike',
    coldestStreak: 'Alex went 2-11 on Day 2',
    members: [
      { name: 'Mike', record: '24-12', roi: 18.5, netUnits: 12.4, rank: 1 },
      { name: 'Jordan', record: '21-15', roi: 10.2, netUnits: 7.8, rank: 2 },
      { name: 'Chris', record: '19-17', roi: 5.5, netUnits: 4.2, rank: 3 },
      { name: 'Alex', record: '14-22', roi: -12.3, netUnits: -8.5, rank: 4 },
      { name: 'Dan', record: '9-27', roi: -22.1, netUnits: -15.2, rank: 5 },
    ],
  },
  {
    year: 2024,
    winner: 'Chris',
    totalPicks: 142,
    groupRecord: '78-64',
    groupROI: 5.4,
    bestMoment: 'Jordan called UConn national championship in January',
    worstBeat: 'Mike had Purdue ML in the championship game',
    mvp: 'Chris',
    coldestStreak: 'Mike went 1-8 on opening Thursday',
    members: [
      { name: 'Chris', record: '22-10', roi: 22.1, netUnits: 14.8, rank: 1 },
      { name: 'Dan', record: '18-14', roi: 8.8, netUnits: 6.2, rank: 2 },
      { name: 'Alex', record: '16-16', roi: 0.5, netUnits: 0.3, rank: 3 },
      { name: 'Jordan', record: '13-19', roi: -8.2, netUnits: -5.5, rank: 4 },
      { name: 'Mike', record: '9-23', roi: -18.5, netUnits: -12.1, rank: 5 },
    ],
  },
  {
    year: 2023,
    winner: 'Dan',
    totalPicks: 128,
    groupRecord: '71-57',
    groupROI: 7.8,
    bestMoment: 'Group went 8-0 on Final Four weekend',
    worstBeat: 'FAU backdoor cover cost Alex a $500 parlay',
    mvp: 'Dan',
    coldestStreak: 'Jordan started 0-6',
    members: [
      { name: 'Dan', record: '20-8', roi: 25.5, netUnits: 16.2, rank: 1 },
      { name: 'Mike', record: '17-11', roi: 12.4, netUnits: 8.5, rank: 2 },
      { name: 'Alex', record: '15-13', roi: 4.2, netUnits: 2.8, rank: 3 },
      { name: 'Chris', record: '12-16', roi: -5.5, netUnits: -3.8, rank: 4 },
      { name: 'Jordan', record: '7-21', roi: -18.8, netUnits: -12.5, rank: 5 },
    ],
  },
];
