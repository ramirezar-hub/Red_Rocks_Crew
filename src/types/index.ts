export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
}

export interface Pick {
  id: string;
  userId: string;
  username: string;
  team: string;
  opponent?: string;
  betType: 'spread' | 'moneyline' | 'over' | 'under' | 'parlay' | 'prop';
  spread?: number;
  odds: number;
  units: number;
  result?: 'win' | 'loss' | 'push' | 'pending';
  payout?: number;
  gameDate: string;
  createdAt: string;
  source?: 'manual' | 'parsed';
  rawText?: string;
}

export interface Member {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  picks: Pick[];
  stats: MemberStats;
}

export interface MemberStats {
  totalPicks: number;
  wins: number;
  losses: number;
  pushes: number;
  pending: number;
  winRate: number;
  roi: number;
  unitsWon: number;
  unitsLost: number;
  netUnits: number;
  currentStreak: number;
  streakType: 'win' | 'loss' | 'none';
  longestWinStreak: number;
  longestLossStreak: number;
  hotScore: number;
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  spread: number;
  overUnder: number;
  homeMoneyline: number;
  awayMoneyline: number;
  gameTime: string;
  status: 'scheduled' | 'live' | 'final';
  round?: string;
  region?: string;
}

export interface TripInfo {
  year: number;
  startDate: string;
  endDate: string;
  hotel: string;
  hotelAddress: string;
  itinerary: ItineraryItem[];
  reservations: Reservation[];
}

export interface ItineraryItem {
  id: string;
  date: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
}

export interface Reservation {
  id: string;
  type: 'restaurant' | 'show' | 'activity' | 'sportsbook' | 'other';
  name: string;
  date: string;
  time: string;
  confirmationNumber?: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'promo' | 'odds' | 'injury' | 'general';
  title: string;
  message: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}

export interface BracketEntry {
  id: string;
  userId: string;
  username: string;
  picks: BracketPick[];
  score: number;
  maxPossible: number;
  rank: number;
}

export interface BracketPick {
  round: number;
  gameId: string;
  teamPicked: string;
  isCorrect?: boolean;
  points: number;
}

export interface NewsItem {
  id: string;
  type: 'tournament' | 'betting' | 'injury' | 'promo' | 'hotel';
  title: string;
  summary: string;
  source: string;
  url?: string;
  createdAt: string;
}

export interface HistoricalYear {
  year: number;
  winner: string;
  totalPicks: number;
  groupRecord: string;
  groupROI: number;
  bestMoment: string;
  worstBeat: string;
  mvp: string;
  coldestStreak: string;
  members: HistoricalMember[];
}

export interface HistoricalMember {
  name: string;
  record: string;
  roi: number;
  netUnits: number;
  rank: number;
}

export interface ParsedMessage {
  username: string;
  text: string;
  timestamp?: string;
  picks: ParsedPick[];
}

export interface ParsedPick {
  team: string;
  betType: 'spread' | 'moneyline' | 'over' | 'under' | 'parlay' | 'prop';
  spread?: number;
  units?: number;
  confidence: number;
  rawText: string;
}

export interface AppState {
  currentUser: User | null;
  members: Member[];
  games: Game[];
  tripInfo: TripInfo;
  alerts: Alert[];
  brackets: BracketEntry[];
  news: NewsItem[];
  history: HistoricalYear[];
}
