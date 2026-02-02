import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getHotLevel, formatUnits } from '../utils/calculations';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { Member } from '../types';

export default function WhosHot() {
  const { members, getLeaderboard } = useApp();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [sortBy, setSortBy] = useState<'hotScore' | 'netUnits' | 'winRate' | 'roi'>('hotScore');

  const sortedMembers = [...members].sort((a, b) => {
    switch (sortBy) {
      case 'hotScore':
        return b.stats.hotScore - a.stats.hotScore;
      case 'netUnits':
        return b.stats.netUnits - a.stats.netUnits;
      case 'winRate':
        return b.stats.winRate - a.stats.winRate;
      case 'roi':
        return b.stats.roi - a.stats.roi;
      default:
        return 0;
    }
  });

  // Prepare chart data for all members
  const hotScoreData = members.map((m) => ({
    name: m.name,
    hotScore: m.stats.hotScore,
    fill: getHotLevel(m.stats.hotScore).color,
  }));

  const unitsData = members.map((m) => ({
    name: m.name,
    units: m.stats.netUnits,
    fill: m.stats.netUnits >= 0 ? '#22c55e' : '#ef4444',
  }));

  // Prepare cumulative units chart data for selected member
  const getMemberCumulativeData = (member: Member) => {
    const sortedPicks = [...member.picks]
      .filter((p) => p.result && p.result !== 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let cumulative = 0;
    return sortedPicks.map((pick, idx) => {
      cumulative += pick.payout || 0;
      return {
        date: format(parseISO(pick.createdAt), 'MM/dd'),
        units: Number(cumulative.toFixed(2)),
        pick: `${pick.team} ${pick.result}`,
      };
    });
  };

  // Radial bar chart data for hot meter
  const radialData = sortedMembers.map((m, idx) => ({
    name: m.name,
    hotScore: m.stats.hotScore,
    fill: getHotLevel(m.stats.hotScore).color,
  }));

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="text-4xl">🔥</span>
            Who's Hot
          </h1>
          <p className="text-slate-400 mt-1">
            Track betting performance, streaks, and hotness scores
          </p>
        </div>

        <div className="flex gap-2">
          {(['hotScore', 'netUnits', 'winRate', 'roi'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === sort
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {sort === 'hotScore'
                ? 'Hot Score'
                : sort === 'netUnits'
                ? 'Units'
                : sort === 'winRate'
                ? 'Win %'
                : 'ROI'}
            </button>
          ))}
        </div>
      </div>

      {/* Hot Meter Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {sortedMembers.map((member, index) => {
          const hotLevel = getHotLevel(member.stats.hotScore);
          const isSelected = selectedMember?.id === member.id;

          return (
            <button
              key={member.id}
              onClick={() => setSelectedMember(isSelected ? null : member)}
              className={`relative overflow-hidden rounded-xl p-4 text-left transition-all ${
                isSelected
                  ? 'bg-slate-700 ring-2 ring-orange-500 scale-105'
                  : 'bg-slate-800 border border-slate-700 hover:border-slate-600 hover:scale-102'
              }`}
            >
              {/* Rank Badge */}
              <div
                className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0
                    ? 'bg-yellow-500 text-yellow-900'
                    : index === 1
                    ? 'bg-slate-400 text-slate-900'
                    : index === 2
                    ? 'bg-orange-700 text-orange-100'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                #{index + 1}
              </div>

              {/* Hot Score Meter */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{hotLevel.emoji}</span>
                  <div>
                    <p className="font-bold text-white text-lg">{member.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{hotLevel.level}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${member.stats.hotScore}%`,
                      background: `linear-gradient(90deg, ${hotLevel.color}, ${hotLevel.color}88)`,
                    }}
                  />
                </div>
                <p className="text-right text-xs text-slate-400 mt-1">
                  {member.stats.hotScore}/100
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-400">Record</p>
                  <p className="font-semibold text-white">
                    {member.stats.wins}-{member.stats.losses}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Win %</p>
                  <p className="font-semibold text-white">{member.stats.winRate.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Units</p>
                  <p
                    className={`font-semibold ${
                      member.stats.netUnits >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {formatUnits(member.stats.netUnits)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Streak</p>
                  <p
                    className={`font-semibold ${
                      member.stats.streakType === 'win' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {member.stats.currentStreak}
                    {member.stats.streakType === 'win' ? 'W' : 'L'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hot Score Comparison */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Hot Score Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotScoreData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
                <YAxis type="category" dataKey="name" stroke="#64748b" width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="hotScore" radius={[0, 4, 4, 0]}>
                  {hotScoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Units Comparison */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Net Units</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value) => [`${(value as number)?.toFixed(2) ?? 0}u`, 'Units']}
                />
                <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                  {unitsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Selected Member Detail */}
      {selectedMember && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getHotLevel(selectedMember.stats.hotScore).emoji}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedMember.name}'s Performance</h3>
                <p className="text-sm text-slate-400">
                  {selectedMember.stats.totalPicks} total picks
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-white">
                  {selectedMember.stats.winRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">ROI</p>
                <p
                  className={`text-2xl font-bold ${
                    selectedMember.stats.roi >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {selectedMember.stats.roi >= 0 ? '+' : ''}
                  {selectedMember.stats.roi.toFixed(1)}%
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Best Streak</p>
                <p className="text-2xl font-bold text-green-400">
                  {selectedMember.stats.longestWinStreak}W
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Worst Streak</p>
                <p className="text-2xl font-bold text-red-400">
                  {selectedMember.stats.longestLossStreak}L
                </p>
              </div>
            </div>

            {/* Cumulative Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getMemberCumulativeData(selectedMember)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#f8fafc' }}
                    formatter={(value) => [`${(value as number)?.toFixed(2) ?? 0}u`, 'Cumulative']}
                  />
                  <Line
                    type="monotone"
                    dataKey="units"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: '#f97316', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#f97316' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Picks */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-3">Recent Picks</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedMember.picks
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((pick) => (
                    <div
                      key={pick.id}
                      className="flex items-center justify-between bg-slate-700/50 rounded-lg px-4 py-2"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {pick.team}{' '}
                          {pick.betType === 'spread' && pick.spread !== undefined
                            ? `${pick.spread > 0 ? '+' : ''}${pick.spread}`
                            : pick.betType.toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-400">
                          {format(parseISO(pick.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            pick.result === 'win'
                              ? 'bg-green-500/20 text-green-400'
                              : pick.result === 'loss'
                              ? 'bg-red-500/20 text-red-400'
                              : pick.result === 'push'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-slate-600 text-slate-300'
                          }`}
                        >
                          {pick.result?.toUpperCase() || 'PENDING'}
                        </span>
                        <p
                          className={`text-sm mt-1 ${
                            (pick.payout || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {pick.payout !== undefined && pick.payout !== 0
                            ? formatUnits(pick.payout)
                            : `${pick.units}u risked`}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Streak Champions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🏆</span> Hottest Streaks
          </h3>
          <div className="space-y-3">
            {sortedMembers
              .filter((m) => m.stats.streakType === 'win' && m.stats.currentStreak > 0)
              .sort((a, b) => b.stats.currentStreak - a.stats.currentStreak)
              .slice(0, 3)
              .map((member, idx) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="text-white font-medium">{member.name}</span>
                  </div>
                  <span className="text-green-400 font-bold">
                    {member.stats.currentStreak}W streak
                  </span>
                </div>
              ))}
            {sortedMembers.filter((m) => m.stats.streakType === 'win' && m.stats.currentStreak > 0)
              .length === 0 && (
              <p className="text-slate-400 text-center py-4">No active win streaks</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🥶</span> Cold Streak Champions
          </h3>
          <div className="space-y-3">
            {sortedMembers
              .filter((m) => m.stats.streakType === 'loss' && m.stats.currentStreak > 0)
              .sort((a, b) => b.stats.currentStreak - a.stats.currentStreak)
              .slice(0, 3)
              .map((member, idx) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {idx === 0 ? '💀' : idx === 1 ? '☠️' : '👻'}
                    </span>
                    <span className="text-white font-medium">{member.name}</span>
                  </div>
                  <span className="text-blue-400 font-bold">
                    {member.stats.currentStreak}L streak
                  </span>
                </div>
              ))}
            {sortedMembers.filter((m) => m.stats.streakType === 'loss' && m.stats.currentStreak > 0)
              .length === 0 && (
              <p className="text-slate-400 text-center py-4">No active loss streaks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
