import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
} from 'recharts';

export default function History() {
  const { history, members } = useApp();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const selectedHistory = selectedYear
    ? history.find((h) => h.year === selectedYear)
    : null;

  // Aggregate stats across years
  const totalYears = history.length;
  const memberWins: Record<string, number> = {};
  history.forEach((year) => {
    if (!memberWins[year.winner]) memberWins[year.winner] = 0;
    memberWins[year.winner]++;
  });

  // Year over year ROI data
  const roiByYear = history
    .map((h) => ({
      year: h.year.toString(),
      roi: h.groupROI,
    }))
    .reverse();

  // All-time leaderboard
  const allTimeStats: Record<
    string,
    { name: string; totalWins: number; totalLosses: number; totalROI: number; years: number }
  > = {};

  history.forEach((year) => {
    year.members.forEach((m) => {
      if (!allTimeStats[m.name]) {
        allTimeStats[m.name] = { name: m.name, totalWins: 0, totalLosses: 0, totalROI: 0, years: 0 };
      }
      const [wins, losses] = m.record.split('-').map(Number);
      allTimeStats[m.name].totalWins += wins;
      allTimeStats[m.name].totalLosses += losses;
      allTimeStats[m.name].totalROI += m.roi;
      allTimeStats[m.name].years++;
    });
  });

  const allTimeLeaderboard = Object.values(allTimeStats)
    .map((s) => ({
      ...s,
      avgROI: s.totalROI / s.years,
      winRate: (s.totalWins / (s.totalWins + s.totalLosses)) * 100,
    }))
    .sort((a, b) => b.avgROI - a.avgROI);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <span className="text-4xl">📊</span>
          Historical Archive
        </h1>
        <p className="text-slate-400 mt-1">
          Year-over-year records, best moments, and legendary performances
        </p>
      </div>

      {/* Year Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedYear(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedYear === null
              ? 'bg-orange-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All Time
        </button>
        {history.map((h) => (
          <button
            key={h.year}
            onClick={() => setSelectedYear(h.year)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedYear === h.year
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {h.year}
          </button>
        ))}
      </div>

      {/* All Time View */}
      {selectedYear === null && (
        <>
          {/* Trophy Case */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🏆</span>
              Trophy Case
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(memberWins)
                .sort((a, b) => b[1] - a[1])
                .map(([name, wins], idx) => (
                  <div
                    key={name}
                    className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700"
                  >
                    <span className="text-3xl">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                    </span>
                    <p className="font-bold text-white mt-2">{name}</p>
                    <p className="text-sm text-slate-400">
                      {wins} {wins === 1 ? 'Championship' : 'Championships'}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Year over Year ROI */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Group ROI by Year</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiByYear}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${(value as number)?.toFixed(1) ?? 0}%`, 'ROI']}
                  />
                  <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                    {roiByYear.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.roi >= 0 ? '#22c55e' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* All-Time Leaderboard */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">All-Time Leaderboard</h2>
              <p className="text-sm text-slate-400">Combined stats across all years</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Record
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Win %
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Avg ROI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {allTimeLeaderboard.map((member, idx) => (
                    <tr key={member.name} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            idx === 0
                              ? 'bg-yellow-500 text-yellow-900'
                              : idx === 1
                              ? 'bg-slate-400 text-slate-900'
                              : idx === 2
                              ? 'bg-orange-700 text-orange-100'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{member.name}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {member.totalWins}-{member.totalLosses}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{member.winRate.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            member.avgROI >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {member.avgROI >= 0 ? '+' : ''}{member.avgROI.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hall of Fame / Hall of Shame */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>✨</span>
                Best Moments
              </h2>
              <div className="space-y-3">
                {history.map((year) => (
                  <div key={year.year} className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-green-400 font-medium">{year.year}</p>
                    <p className="text-white mt-1">{year.bestMoment}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>💔</span>
                Worst Beats
              </h2>
              <div className="space-y-3">
                {history.map((year) => (
                  <div key={year.year} className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-red-400 font-medium">{year.year}</p>
                    <p className="text-white mt-1">{year.worstBeat}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Selected Year View */}
      {selectedHistory && (
        <>
          {/* Year Header */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-white">
                  March Madness {selectedHistory.year}
                </h2>
                <p className="text-slate-400 mt-1">
                  Group Record: {selectedHistory.groupRecord} | ROI:{' '}
                  <span
                    className={
                      selectedHistory.groupROI >= 0 ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    {selectedHistory.groupROI >= 0 ? '+' : ''}
                    {selectedHistory.groupROI}%
                  </span>
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-slate-400 text-sm">Champion</p>
                <p className="text-2xl font-bold text-yellow-400 flex items-center gap-2 justify-center md:justify-end">
                  <span>🏆</span>
                  {selectedHistory.winner}
                </p>
              </div>
            </div>
          </div>

          {/* Year Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Total Picks</p>
              <p className="text-2xl font-bold text-white">{selectedHistory.totalPicks}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Group Record</p>
              <p className="text-2xl font-bold text-white">{selectedHistory.groupRecord}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">MVP</p>
              <p className="text-2xl font-bold text-yellow-400">{selectedHistory.mvp}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Coldest Streak</p>
              <p className="text-lg font-bold text-blue-400">{selectedHistory.coldestStreak}</p>
            </div>
          </div>

          {/* Year Leaderboard */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">
                {selectedHistory.year} Standings
              </h2>
            </div>
            <div className="divide-y divide-slate-700">
              {selectedHistory.members.map((member) => (
                <div
                  key={member.name}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-slate-700/30 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      member.rank === 1
                        ? 'bg-yellow-500 text-yellow-900'
                        : member.rank === 2
                        ? 'bg-slate-400 text-slate-900'
                        : member.rank === 3
                        ? 'bg-orange-700 text-orange-100'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {member.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white flex items-center gap-2">
                      {member.name}
                      {member.name === selectedHistory.winner && <span>🏆</span>}
                    </p>
                    <p className="text-sm text-slate-400">Record: {member.record}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        member.netUnits >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {member.netUnits >= 0 ? '+' : ''}{member.netUnits.toFixed(1)}u
                    </p>
                    <p className="text-sm text-slate-400">
                      {member.roi >= 0 ? '+' : ''}{member.roi.toFixed(1)}% ROI
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Year Highlights */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>✨</span>
                Best Moment
              </h3>
              <p className="text-slate-300">{selectedHistory.bestMoment}</p>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>💔</span>
                Worst Beat
              </h3>
              <p className="text-slate-300">{selectedHistory.worstBeat}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
