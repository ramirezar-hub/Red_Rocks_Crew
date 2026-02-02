import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatSpread, formatOdds } from '../utils/calculations';
import { format, parseISO } from 'date-fns';

export default function Brackets() {
  const { games, members } = useApp();
  const [selectedRound, setSelectedRound] = useState<string>('all');

  const rounds = ['Round of 64', 'Round of 32', 'Sweet 16', 'Elite 8', 'Final Four', 'Championship'];
  const regions = ['East', 'West', 'South', 'Midwest'];

  // Group games by round
  const gamesByRound = games.reduce((acc, game) => {
    const round = game.round || 'Other';
    if (!acc[round]) acc[round] = [];
    acc[round].push(game);
    return acc;
  }, {} as Record<string, typeof games>);

  // Calculate "How busted are we?" meter based on pending bracket picks
  const totalGames = games.length;
  const completedGames = games.filter((g) => g.status === 'final').length;
  const correctPicks = Math.floor(completedGames * 0.65); // Simulated for demo
  const bustedScore = totalGames > 0 ? (correctPicks / Math.max(completedGames, 1)) * 100 : 100;

  const filteredGames =
    selectedRound === 'all' ? games : games.filter((g) => g.round === selectedRound);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="text-4xl">🏀</span>
            Game & Bracket Tracking
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time scores, bracket standings, and group morale meter
          </p>
        </div>
      </div>

      {/* How Busted Are We? Meter */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">How Busted Are We?</h2>
          <span className="text-3xl">
            {bustedScore >= 70 ? '🎉' : bustedScore >= 50 ? '😅' : bustedScore >= 30 ? '😰' : '💀'}
          </span>
        </div>

        <div className="h-6 bg-slate-700 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${bustedScore}%`,
              background:
                bustedScore >= 70
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : bustedScore >= 50
                  ? 'linear-gradient(90deg, #eab308, #ca8a04)'
                  : bustedScore >= 30
                  ? 'linear-gradient(90deg, #f97316, #ea580c)'
                  : 'linear-gradient(90deg, #ef4444, #dc2626)',
            }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">
            {correctPicks}/{completedGames} correct picks
          </span>
          <span
            className={`font-semibold ${
              bustedScore >= 70
                ? 'text-green-400'
                : bustedScore >= 50
                ? 'text-yellow-400'
                : bustedScore >= 30
                ? 'text-orange-400'
                : 'text-red-400'
            }`}
          >
            {bustedScore.toFixed(0)}% bracket health
          </span>
        </div>

        <p className="text-sm text-slate-500 mt-3">
          {bustedScore >= 70
            ? "Looking good! The group brackets are holding strong! 💪"
            : bustedScore >= 50
            ? "Some chaos, but we're hanging in there..."
            : bustedScore >= 30
            ? "Brackets are taking hits. Time for revenge bets! 😤"
            : "Complete chaos. The madness got us... 🪦"}
        </p>
      </div>

      {/* Round Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedRound('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedRound === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All Games
        </button>
        {rounds.map((round) => (
          <button
            key={round}
            onClick={() => setSelectedRound(round)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedRound === round
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {round}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className={`bg-slate-800 border rounded-xl overflow-hidden transition-all ${
              game.status === 'live'
                ? 'border-green-500 animate-pulse-hot'
                : game.status === 'final'
                ? 'border-slate-600'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            {/* Game Header */}
            <div className="px-4 py-2 bg-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-orange-400">{game.round}</span>
                {game.region && (
                  <span className="text-xs text-slate-400">| {game.region}</span>
                )}
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  game.status === 'live'
                    ? 'bg-green-500/20 text-green-400'
                    : game.status === 'final'
                    ? 'bg-slate-600 text-slate-300'
                    : 'bg-slate-600 text-slate-400'
                }`}
              >
                {game.status === 'live'
                  ? 'LIVE'
                  : game.status === 'final'
                  ? 'FINAL'
                  : format(parseISO(game.gameTime), 'h:mm a')}
              </span>
            </div>

            {/* Teams */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p
                    className={`font-semibold text-lg ${
                      game.status === 'final' && game.awayScore! > game.homeScore!
                        ? 'text-green-400'
                        : 'text-white'
                    }`}
                  >
                    {game.awayTeam}
                  </p>
                </div>
                <div className="text-right">
                  {game.status === 'final' || game.status === 'live' ? (
                    <span
                      className={`text-2xl font-bold ${
                        game.awayScore! > game.homeScore! ? 'text-green-400' : 'text-white'
                      }`}
                    >
                      {game.awayScore}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">{formatOdds(game.awayMoneyline)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p
                    className={`font-semibold text-lg ${
                      game.status === 'final' && game.homeScore! > game.awayScore!
                        ? 'text-green-400'
                        : 'text-white'
                    }`}
                  >
                    {game.homeTeam}
                  </p>
                </div>
                <div className="text-right">
                  {game.status === 'final' || game.status === 'live' ? (
                    <span
                      className={`text-2xl font-bold ${
                        game.homeScore! > game.awayScore! ? 'text-green-400' : 'text-white'
                      }`}
                    >
                      {game.homeScore}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">{formatOdds(game.homeMoneyline)}</span>
                  )}
                </div>
              </div>

              {/* Betting Lines */}
              {game.status === 'scheduled' && (
                <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    Spread: <span className="text-white">{formatSpread(game.spread)}</span>
                  </span>
                  <span className="text-slate-400">
                    O/U: <span className="text-white">{game.overUnder}</span>
                  </span>
                </div>
              )}

              {/* Group Picks on this game */}
              {(() => {
                const gamePicks = members.flatMap((m) =>
                  m.picks.filter(
                    (p) =>
                      p.team === game.homeTeam ||
                      p.team === game.awayTeam
                  ).map((p) => ({ ...p, memberName: m.name }))
                );

                if (gamePicks.length === 0) return null;

                return (
                  <div className="mt-4 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Group Picks:</p>
                    <div className="flex flex-wrap gap-2">
                      {gamePicks.map((pick) => (
                        <span
                          key={pick.id}
                          className={`text-xs px-2 py-1 rounded ${
                            pick.result === 'win'
                              ? 'bg-green-500/20 text-green-400'
                              : pick.result === 'loss'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {pick.memberName}: {pick.team}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <p className="text-slate-400">No games found for this round</p>
        </div>
      )}

      {/* Bracket Standings */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Bracket Standings</h2>
          <p className="text-sm text-slate-400">Group bracket competition</p>
        </div>

        <div className="divide-y divide-slate-700">
          {members
            .map((member, index) => ({
              ...member,
              bracketScore: Math.floor(Math.random() * 100) + 50, // Simulated
              maxPossible: 150,
            }))
            .sort((a, b) => b.bracketScore - a.bracketScore)
            .map((member, index) => (
              <div
                key={member.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-700/30 transition-colors"
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
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="text-sm text-slate-400">
                    Max possible: {member.maxPossible} pts
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{member.bracketScore}</p>
                  <p className="text-xs text-slate-400">points</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Region Champions (Placeholder) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {regions.map((region) => (
          <div
            key={region}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center"
          >
            <p className="text-sm text-slate-400 mb-2">{region} Region</p>
            <p className="text-lg font-bold text-white">TBD</p>
            <p className="text-xs text-slate-500 mt-1">Champion</p>
          </div>
        ))}
      </div>
    </div>
  );
}
