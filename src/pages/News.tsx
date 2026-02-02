import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';

export default function News() {
  const { news, alerts, addAlert } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'general' as 'promo' | 'odds' | 'injury' | 'general',
    title: '',
    message: '',
  });

  const categories = [
    { id: 'all', label: 'All', icon: '📰' },
    { id: 'tournament', label: 'Tournament', icon: '🏀' },
    { id: 'betting', label: 'Betting', icon: '💰' },
    { id: 'injury', label: 'Injuries', icon: '🏥' },
    { id: 'promo', label: 'Promos', icon: '🎁' },
    { id: 'hotel', label: 'Vegas', icon: '🎰' },
  ];

  const filteredNews =
    selectedCategory === 'all' ? news : news.filter((n) => n.type === selectedCategory);

  const handleAddAlert = () => {
    if (!newAlert.title || !newAlert.message) {
      alert('Please fill in all fields');
      return;
    }

    addAlert({
      type: newAlert.type,
      title: newAlert.title,
      message: newAlert.message,
      createdBy: 'You',
    });

    setNewAlert({ type: 'general', title: '', message: '' });
    setShowAddAlert(false);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="text-4xl">📰</span>
            News Feed
          </h1>
          <p className="text-slate-400 mt-1">
            Tournament news, betting insights, injuries, and Vegas promos
          </p>
        </div>

        <button
          onClick={() => setShowAddAlert(true)}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Share Alert
        </button>
      </div>

      {/* Group Alerts */}
      {alerts.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🔔</span>
              Group Alerts
            </h2>
          </div>
          <div className="divide-y divide-slate-700">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 ${
                  alert.type === 'promo'
                    ? 'bg-green-500/5'
                    : alert.type === 'odds'
                    ? 'bg-yellow-500/5'
                    : alert.type === 'injury'
                    ? 'bg-red-500/5'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {alert.type === 'promo'
                      ? '💰'
                      : alert.type === 'odds'
                      ? '📊'
                      : alert.type === 'injury'
                      ? '🏥'
                      : '📢'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          alert.type === 'promo'
                            ? 'text-green-400'
                            : alert.type === 'odds'
                            ? 'text-yellow-400'
                            : alert.type === 'injury'
                            ? 'text-red-400'
                            : 'text-white'
                        }`}
                      >
                        {alert.title}
                      </h3>
                      <span className="text-xs text-slate-500">
                        by {alert.createdBy}
                      </span>
                    </div>
                    <p className="text-slate-300">{alert.message}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {format(parseISO(alert.createdAt), 'h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.map((item) => (
          <article
            key={item.id}
            className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors"
          >
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    item.type === 'tournament'
                      ? 'bg-orange-500/20 text-orange-400'
                      : item.type === 'betting'
                      ? 'bg-green-500/20 text-green-400'
                      : item.type === 'injury'
                      ? 'bg-red-500/20 text-red-400'
                      : item.type === 'promo'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
                <span className="text-xs text-slate-500">{item.source}</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-slate-400 text-sm line-clamp-3">{item.summary}</p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {format(parseISO(item.createdAt), 'MMM d, h:mm a')}
                </span>
                {item.url && (
                  <button className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                    Read more →
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <p className="text-slate-400">No news found for this category</p>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Quick Links</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 p-4">
          <a
            href="https://www.espn.com/mens-college-basketball/tournament/bracket"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span className="text-2xl">🏀</span>
            <div>
              <p className="font-medium text-white">ESPN Bracket</p>
              <p className="text-sm text-slate-400">Live bracket updates</p>
            </div>
          </a>
          <a
            href="https://www.actionnetwork.com/ncaab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-medium text-white">Action Network</p>
              <p className="text-sm text-slate-400">Betting insights</p>
            </div>
          </a>
          <a
            href="https://www.vegasinsider.com/college-basketball/odds/las-vegas/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span className="text-2xl">🎰</span>
            <div>
              <p className="font-medium text-white">Vegas Insider</p>
              <p className="text-sm text-slate-400">Live Vegas odds</p>
            </div>
          </a>
        </div>
      </div>

      {/* Sportsbook Promos */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-green-500/30">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>💰</span>
            Vegas Sportsbook Promos
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <p className="font-medium text-white">Circa Sportsbook</p>
              <p className="text-sm text-slate-400">Bet $100, Get $50 Free Bet</p>
            </div>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <p className="font-medium text-white">Westgate SuperBook</p>
              <p className="text-sm text-slate-400">$25 Free Bet on signup</p>
            </div>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <p className="font-medium text-white">Caesars Palace</p>
              <p className="text-sm text-slate-400">Odds boost on Sweet 16</p>
            </div>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
              Limited
            </span>
          </div>
        </div>
      </div>

      {/* Add Alert Modal */}
      {showAddAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Share Alert with Group</h3>
              <button
                onClick={() => setShowAddAlert(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) =>
                    setNewAlert({
                      ...newAlert,
                      type: e.target.value as typeof newAlert.type,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="promo">💰 Promo</option>
                  <option value="odds">📊 Odds Movement</option>
                  <option value="injury">🏥 Injury</option>
                  <option value="general">📢 General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="e.g., Found a great promo!"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  placeholder="Share the details..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddAlert(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAlert}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Share Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
