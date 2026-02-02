import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { format, parseISO, differenceInDays } from 'date-fns';
import { getHotLevel, formatSpread, formatOdds } from '../utils/calculations';

export default function Dashboard() {
  const { members, games, tripInfo, alerts, getLeaderboard, getHottestMember, getColdestMember } = useApp();

  const leaderboard = getLeaderboard();
  const hottestMember = getHottestMember();
  const coldestMember = getColdestMember();

  const tripStart = parseISO(tripInfo.startDate);
  const daysUntilTrip = differenceInDays(tripStart, new Date());

  const todaysGames = games.filter((g) => g.status !== 'final').slice(0, 4);
  const completedGames = games.filter((g) => g.status === 'final').slice(0, 2);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -right-10 -bottom-10 opacity-20">
          <svg className="w-64 h-64" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="currentColor" />
            <path d="M50 5 A45 45 0 0 1 95 50" stroke="currentColor" fill="none" strokeWidth="2" />
            <path d="M50 5 A45 45 0 0 0 5 50" stroke="currentColor" fill="none" strokeWidth="2" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="2" />
            <path d="M50 5 Q30 50 50 95" stroke="currentColor" fill="none" strokeWidth="2" />
            <path d="M50 5 Q70 50 50 95" stroke="currentColor" fill="none" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                March Madness Vegas 2026
              </h1>
              <p className="text-orange-100 text-lg">
                {tripInfo.hotel} | {format(tripStart, 'MMM d')} - {format(parseISO(tripInfo.endDate), 'MMM d, yyyy')}
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
              {daysUntilTrip > 0 ? (
                <>
                  <p className="text-5xl font-extrabold text-white">{daysUntilTrip}</p>
                  <p className="text-orange-100 text-sm">days to go</p>
                </>
              ) : daysUntilTrip === 0 ? (
                <>
                  <p className="text-3xl font-extrabold text-white">TODAY!</p>
                  <p className="text-orange-100 text-sm">Let's go!</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-extrabold text-white">LIVE</p>
                  <p className="text-orange-100 text-sm">Trip in progress!</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                alert.type === 'promo'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : alert.type === 'odds'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : alert.type === 'injury'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-slate-700 border-slate-600 text-slate-300'
              }`}
            >
              <span className="text-xl">
                {alert.type === 'promo' ? '💰' : alert.type === 'odds' ? '📊' : alert.type === 'injury' ? '🏥' : '📢'}
              </span>
              <div className="flex-1">
                <p className="font-semibold">{alert.title}</p>
                <p className="text-sm opacity-80">{alert.message}</p>
              </div>
              <span className="text-xs opacity-60">{alert.createdBy}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Hottest Member */}
        {hottestMember && (
          <Link
            to="/whos-hot"
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getHotLevel(hottestMember.stats.hotScore).emoji}</span>
              <span className="text-orange-400 text-sm font-medium">Hottest</span>
            </div>
            <p className="text-xl font-bold text-white">{hottestMember.name}</p>
            <p className="text-sm text-slate-400">
              {hottestMember.stats.currentStreak > 0 && hottestMember.stats.streakType === 'win'
                ? `${hottestMember.stats.currentStreak}W streak`
                : `${hottestMember.stats.winRate.toFixed(0)}% win rate`}
            </p>
          </Link>
        )}

        {/* Coldest Member */}
        {coldestMember && (
          <Link
            to="/whos-hot"
            className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getHotLevel(coldestMember.stats.hotScore).emoji}</span>
              <span className="text-blue-400 text-sm font-medium">Coldest</span>
            </div>
            <p className="text-xl font-bold text-white">{coldestMember.name}</p>
            <p className="text-sm text-slate-400">
              {coldestMember.stats.currentStreak > 0 && coldestMember.stats.streakType === 'loss'
                ? `${coldestMember.stats.currentStreak}L streak`
                : `${coldestMember.stats.winRate.toFixed(0)}% win rate`}
            </p>
          </Link>
        )}

        {/* Group Record */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-slate-400 text-sm font-medium">Group Record</span>
          </div>
          <p className="text-xl font-bold text-white">
            {members.reduce((sum, m) => sum + m.stats.wins, 0)}-
            {members.reduce((sum, m) => sum + m.stats.losses, 0)}
          </p>
          <p className="text-sm text-slate-400">
            {members.reduce((sum, m) => sum + m.stats.pending, 0)} pending
          </p>
        </div>

        {/* Total Units */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💵</span>
            <span className="text-slate-400 text-sm font-medium">Group Units</span>
          </div>
          {(() => {
            const totalUnits = members.reduce((sum, m) => sum + m.stats.netUnits, 0);
            return (
              <>
                <p className={`text-xl font-bold ${totalUnits >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalUnits >= 0 ? '+' : ''}{totalUnits.toFixed(2)}u
                </p>
                <p className="text-sm text-slate-400">
                  {members.reduce((sum, m) => sum + m.stats.totalPicks, 0)} total picks
                </p>
              </>
            );
          })()}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Games */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Today's Games</h2>
            <Link to="/brackets" className="text-orange-400 hover:text-orange-300 text-sm">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-slate-700">
            {todaysGames.length > 0 ? (
              todaysGames.map((game) => (
                <div key={game.id} className="p-4 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-orange-400 font-medium">{game.round}</span>
                    <span className="text-xs text-slate-500">
                      {format(parseISO(game.gameTime), 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{game.awayTeam}</p>
                      <p className="text-slate-400">@</p>
                      <p className="font-semibold text-white">{game.homeTeam}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-slate-300">{formatSpread(game.spread)}</p>
                      <p className="text-slate-500">O/U {game.overUnder}</p>
                      <p className="text-slate-400">{formatOdds(game.homeMoneyline)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                No games scheduled for today
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Leaderboard</h2>
            <Link to="/whos-hot" className="text-orange-400 hover:text-orange-300 text-sm">
              Details →
            </Link>
          </div>
          <div className="divide-y divide-slate-700">
            {leaderboard.map((member, index) => (
              <div
                key={member.id}
                className="px-4 py-3 flex items-center gap-4 hover:bg-slate-700/50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0
                      ? 'bg-yellow-500 text-yellow-900'
                      : index === 1
                      ? 'bg-slate-400 text-slate-900'
                      : index === 2
                      ? 'bg-orange-700 text-orange-100'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white flex items-center gap-2">
                    {member.name}
                    <span className="text-lg">{getHotLevel(member.stats.hotScore).emoji}</span>
                  </p>
                  <p className="text-sm text-slate-400">
                    {member.stats.wins}-{member.stats.losses} ({member.stats.winRate.toFixed(0)}%)
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      member.stats.netUnits >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {member.stats.netUnits >= 0 ? '+' : ''}
                    {member.stats.netUnits.toFixed(2)}u
                  </p>
                  <p className="text-xs text-slate-500">
                    {member.stats.roi >= 0 ? '+' : ''}{member.stats.roi.toFixed(1)}% ROI
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Itinerary Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Trip Itinerary</h2>
          <p className="text-sm text-slate-400">{tripInfo.hotel} - {tripInfo.hotelAddress}</p>
        </div>
        <div className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tripInfo.itinerary.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                    {format(parseISO(item.date), 'EEE, MMM d')}
                  </span>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
                <p className="font-semibold text-white text-sm">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                )}
                {item.location && (
                  <p className="text-xs text-slate-500 mt-1">📍 {item.location}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Results */}
      {completedGames.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white">Recent Results</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {completedGames.map((game) => (
              <div key={game.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{game.round} - {game.region}</p>
                    <p className="font-semibold text-white">
                      {game.awayTeam} {game.awayScore} @ {game.homeTeam} {game.homeScore}
                    </p>
                  </div>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    FINAL
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
