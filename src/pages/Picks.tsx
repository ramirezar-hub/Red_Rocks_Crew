import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatOdds, formatSpread, formatUnits, getHotLevel } from '../utils/calculations';
import { format, parseISO } from 'date-fns';
import { Pick, Member } from '../types';

export default function Picks() {
  const { members, addPick, updatePickResult } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Form state for new pick
  const [newPick, setNewPick] = useState({
    username: '',
    team: '',
    opponent: '',
    betType: 'spread' as Pick['betType'],
    spread: 0,
    odds: -110,
    units: 1,
  });

  // Get all picks sorted by date
  const allPicks = members
    .flatMap((m) => m.picks.map((p) => ({ ...p, memberName: m.name })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredPicks = allPicks.filter((pick) => {
    if (filterUser !== 'all' && pick.username !== filterUser) return false;
    if (filterResult !== 'all' && pick.result !== filterResult) return false;
    return true;
  });

  // Daily stats
  const today = new Date().toISOString().split('T')[0];
  const todaysPicks = allPicks.filter((p) => p.createdAt.split('T')[0] === today);
  const todaysWins = todaysPicks.filter((p) => p.result === 'win').length;
  const todaysLosses = todaysPicks.filter((p) => p.result === 'loss').length;

  const handleAddPick = () => {
    if (!newPick.username || !newPick.team) {
      alert('Please select a member and enter a team');
      return;
    }

    addPick({
      userId: newPick.username,
      username: newPick.username,
      team: newPick.team,
      opponent: newPick.opponent || undefined,
      betType: newPick.betType,
      spread: newPick.betType === 'spread' ? newPick.spread : undefined,
      odds: newPick.odds,
      units: newPick.units,
      result: 'pending',
      gameDate: today,
      source: 'manual',
    });

    setNewPick({
      username: '',
      team: '',
      opponent: '',
      betType: 'spread',
      spread: 0,
      odds: -110,
      units: 1,
    });
    setShowAddModal(false);
  };

  // Group picks by user for comparison view
  const picksByUser = members.reduce((acc, member) => {
    acc[member.username] = member.picks.filter(
      (p) => p.createdAt.split('T')[0] === today || p.result === 'pending'
    );
    return acc;
  }, {} as Record<string, Pick[]>);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            Pick Aggregator
          </h1>
          <p className="text-slate-400 mt-1">
            Track all group picks, compare plays, and update results
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Pick
        </button>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Today's Picks</p>
          <p className="text-2xl font-bold text-white">{todaysPicks.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Today's Record</p>
          <p className="text-2xl font-bold text-white">
            <span className="text-green-400">{todaysWins}</span>-
            <span className="text-red-400">{todaysLosses}</span>
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            {allPicks.filter((p) => p.result === 'pending' || !p.result).length}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Picks</p>
          <p className="text-2xl font-bold text-white">{allPicks.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Member:</label>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.username}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Result:</label>
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="win">Wins</option>
            <option value="loss">Losses</option>
            <option value="push">Pushes</option>
          </select>
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            Compare
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Member</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Pick</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Odds</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Units</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Result</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">P/L</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredPicks.map((pick) => (
                  <tr key={pick.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{pick.memberName}</span>
                        <span className="text-sm">
                          {getHotLevel(
                            members.find((m) => m.username === pick.username)?.stats.hotScore || 50
                          ).emoji}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{pick.team}</p>
                      {pick.opponent && (
                        <p className="text-xs text-slate-400">vs {pick.opponent}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-300">
                        {pick.betType === 'spread' && pick.spread !== undefined
                          ? formatSpread(pick.spread)
                          : pick.betType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{formatOdds(pick.odds)}</td>
                    <td className="px-4 py-3 text-slate-300">{pick.units}u</td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">
                      {pick.result && pick.result !== 'pending' && pick.payout !== undefined ? (
                        <span
                          className={`font-semibold ${
                            pick.payout >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {formatUnits(pick.payout)}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(!pick.result || pick.result === 'pending') && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updatePickResult(pick.id, 'win')}
                            className="px-2 py-1 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded text-xs transition-colors"
                          >
                            W
                          </button>
                          <button
                            onClick={() => updatePickResult(pick.id, 'loss')}
                            className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded text-xs transition-colors"
                          >
                            L
                          </button>
                          <button
                            onClick={() => updatePickResult(pick.id, 'push')}
                            className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 rounded text-xs transition-colors"
                          >
                            P
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPicks.length === 0 && (
            <div className="p-8 text-center text-slate-400">No picks found matching filters</div>
          )}
        </div>
      )}

      {/* Compare View */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const memberPicks = picksByUser[member.username] || [];
            const hotLevel = getHotLevel(member.stats.hotScore);

            return (
              <div
                key={member.id}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{hotLevel.emoji}</span>
                    <span className="font-semibold text-white">{member.name}</span>
                  </div>
                  <span className="text-sm text-slate-400">
                    {member.stats.wins}-{member.stats.losses}
                  </span>
                </div>

                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {memberPicks.length > 0 ? (
                    memberPicks.map((pick) => (
                      <div
                        key={pick.id}
                        className={`p-3 rounded-lg border ${
                          pick.result === 'win'
                            ? 'bg-green-500/10 border-green-500/30'
                            : pick.result === 'loss'
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-slate-700/50 border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{pick.team}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              pick.result === 'win'
                                ? 'bg-green-500/20 text-green-400'
                                : pick.result === 'loss'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-slate-600 text-slate-300'
                            }`}
                          >
                            {pick.result?.toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {pick.betType === 'spread' && pick.spread !== undefined
                            ? formatSpread(pick.spread)
                            : pick.betType.toUpperCase()}{' '}
                          | {pick.units}u
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-4">No pending picks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Pick Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Add New Pick</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Member</label>
                <select
                  value={newPick.username}
                  onChange={(e) => setNewPick({ ...newPick, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select member...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.username}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Team</label>
                <input
                  type="text"
                  value={newPick.team}
                  onChange={(e) => setNewPick({ ...newPick, team: e.target.value })}
                  placeholder="e.g., UConn"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Bet Type</label>
                <select
                  value={newPick.betType}
                  onChange={(e) =>
                    setNewPick({ ...newPick, betType: e.target.value as Pick['betType'] })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="spread">Spread</option>
                  <option value="moneyline">Moneyline</option>
                  <option value="over">Over</option>
                  <option value="under">Under</option>
                  <option value="parlay">Parlay</option>
                  <option value="prop">Prop</option>
                </select>
              </div>

              {newPick.betType === 'spread' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Spread</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPick.spread}
                    onChange={(e) => setNewPick({ ...newPick, spread: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Odds</label>
                  <input
                    type="number"
                    value={newPick.odds}
                    onChange={(e) => setNewPick({ ...newPick, odds: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Units</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newPick.units}
                    onChange={(e) => setNewPick({ ...newPick, units: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPick}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Add Pick
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
