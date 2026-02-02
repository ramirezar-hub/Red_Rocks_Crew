import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, Pick, Game, TripInfo, Alert, BracketEntry, NewsItem, HistoricalYear, MemberStats } from '../types';
import { calculateStats, calculateHotScore } from '../utils/calculations';
import { initialMembers, initialGames, initialTripInfo, initialAlerts, initialNews, initialHistory } from '../utils/initialData';

interface AppContextType {
  members: Member[];
  games: Game[];
  tripInfo: TripInfo;
  alerts: Alert[];
  brackets: BracketEntry[];
  news: NewsItem[];
  history: HistoricalYear[];
  addPick: (pick: Omit<Pick, 'id' | 'createdAt'>) => void;
  updatePickResult: (pickId: string, result: Pick['result']) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  removeAlert: (alertId: string) => void;
  addMember: (name: string, username: string) => void;
  updateTripInfo: (info: Partial<TripInfo>) => void;
  getLeaderboard: () => Member[];
  getHottestMember: () => Member | null;
  getColdestMember: () => Member | null;
  addBulkPicks: (picks: Omit<Pick, 'id' | 'createdAt'>[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MEMBERS_KEY = 'rrc_members';
const GAMES_KEY = 'rrc_games';
const TRIP_KEY = 'rrc_trip';
const ALERTS_KEY = 'rrc_alerts';
const BRACKETS_KEY = 'rrc_brackets';
const NEWS_KEY = 'rrc_news';
const HISTORY_KEY = 'rrc_history';

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [tripInfo, setTripInfo] = useState<TripInfo>(initialTripInfo);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [brackets, setBrackets] = useState<BracketEntry[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [history, setHistory] = useState<HistoricalYear[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const storedMembers = localStorage.getItem(MEMBERS_KEY);
      const storedGames = localStorage.getItem(GAMES_KEY);
      const storedTrip = localStorage.getItem(TRIP_KEY);
      const storedAlerts = localStorage.getItem(ALERTS_KEY);
      const storedBrackets = localStorage.getItem(BRACKETS_KEY);
      const storedNews = localStorage.getItem(NEWS_KEY);
      const storedHistory = localStorage.getItem(HISTORY_KEY);

      setMembers(storedMembers ? JSON.parse(storedMembers) : initialMembers);
      setGames(storedGames ? JSON.parse(storedGames) : initialGames);
      setTripInfo(storedTrip ? JSON.parse(storedTrip) : initialTripInfo);
      setAlerts(storedAlerts ? JSON.parse(storedAlerts) : initialAlerts);
      setBrackets(storedBrackets ? JSON.parse(storedBrackets) : []);
      setNews(storedNews ? JSON.parse(storedNews) : initialNews);
      setHistory(storedHistory ? JSON.parse(storedHistory) : initialHistory);
    };

    loadData();
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (members.length > 0) {
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    }
  }, [members]);

  useEffect(() => {
    if (games.length > 0) {
      localStorage.setItem(GAMES_KEY, JSON.stringify(games));
    }
  }, [games]);

  useEffect(() => {
    localStorage.setItem(TRIP_KEY, JSON.stringify(tripInfo));
  }, [tripInfo]);

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(NEWS_KEY, JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const recalculateMemberStats = (member: Member): Member => {
    const stats = calculateStats(member.picks);
    const hotScore = calculateHotScore(member.picks);
    return {
      ...member,
      stats: {
        ...stats,
        hotScore,
      },
    };
  };

  const addPick = (pick: Omit<Pick, 'id' | 'createdAt'>) => {
    const newPick: Pick = {
      ...pick,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setMembers((prev) =>
      prev.map((member) => {
        if (member.username === pick.username) {
          const updatedMember = {
            ...member,
            picks: [...member.picks, newPick],
          };
          return recalculateMemberStats(updatedMember);
        }
        return member;
      })
    );
  };

  const addBulkPicks = (picks: Omit<Pick, 'id' | 'createdAt'>[]) => {
    const newPicks: Pick[] = picks.map((pick) => ({
      ...pick,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }));

    setMembers((prev) =>
      prev.map((member) => {
        const memberPicks = newPicks.filter((p) => p.username === member.username);
        if (memberPicks.length > 0) {
          const updatedMember = {
            ...member,
            picks: [...member.picks, ...memberPicks],
          };
          return recalculateMemberStats(updatedMember);
        }
        return member;
      })
    );
  };

  const updatePickResult = (pickId: string, result: Pick['result']) => {
    setMembers((prev) =>
      prev.map((member) => {
        const pickIndex = member.picks.findIndex((p) => p.id === pickId);
        if (pickIndex !== -1) {
          const updatedPicks = [...member.picks];
          const pick = updatedPicks[pickIndex];

          let payout = 0;
          if (result === 'win') {
            payout = pick.odds > 0
              ? pick.units * (pick.odds / 100)
              : pick.units * (100 / Math.abs(pick.odds));
          } else if (result === 'loss') {
            payout = -pick.units;
          }

          updatedPicks[pickIndex] = {
            ...pick,
            result,
            payout,
          };

          const updatedMember = {
            ...member,
            picks: updatedPicks,
          };
          return recalculateMemberStats(updatedMember);
        }
        return member;
      })
    );
  };

  const addAlert = (alert: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const removeAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const addMember = (name: string, username: string) => {
    const newMember: Member = {
      id: crypto.randomUUID(),
      name,
      username: username.toLowerCase(),
      picks: [],
      stats: {
        totalPicks: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        pending: 0,
        winRate: 0,
        roi: 0,
        unitsWon: 0,
        unitsLost: 0,
        netUnits: 0,
        currentStreak: 0,
        streakType: 'none',
        longestWinStreak: 0,
        longestLossStreak: 0,
        hotScore: 50,
      },
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const updateTripInfo = (info: Partial<TripInfo>) => {
    setTripInfo((prev) => ({ ...prev, ...info }));
  };

  const getLeaderboard = (): Member[] => {
    return [...members].sort((a, b) => b.stats.netUnits - a.stats.netUnits);
  };

  const getHottestMember = (): Member | null => {
    if (members.length === 0) return null;
    return members.reduce((hottest, member) =>
      member.stats.hotScore > hottest.stats.hotScore ? member : hottest
    );
  };

  const getColdestMember = (): Member | null => {
    if (members.length === 0) return null;
    return members.reduce((coldest, member) =>
      member.stats.hotScore < coldest.stats.hotScore ? member : coldest
    );
  };

  return (
    <AppContext.Provider
      value={{
        members,
        games,
        tripInfo,
        alerts,
        brackets,
        news,
        history,
        addPick,
        updatePickResult,
        addAlert,
        removeAlert,
        addMember,
        updateTripInfo,
        getLeaderboard,
        getHottestMember,
        getColdestMember,
        addBulkPicks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
