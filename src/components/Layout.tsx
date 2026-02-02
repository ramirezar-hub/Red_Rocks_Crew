import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/whos-hot', label: "Who's Hot", icon: '🔥' },
  { path: '/picks', label: 'Picks', icon: '🎯' },
  { path: '/parser', label: 'Parser', icon: '💬' },
  { path: '/brackets', label: 'Brackets', icon: '🏀' },
  { path: '/news', label: 'News', icon: '📰' },
  { path: '/history', label: 'History', icon: '📊' },
];

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo-basketball.svg"
                alt="Red Rocks Crew"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Red Rocks Crew</h1>
                <p className="text-xs text-slate-400">March Madness 2026</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300 hidden sm:block">
                Hey, <span className="font-semibold text-orange-400">{user?.displayName}</span>
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-slate-700 overflow-x-auto">
          <div className="flex px-4 py-2 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  location.pathname === item.path
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src="/logo-r.svg"
            alt="RRC"
            className="h-8 mx-auto mb-2 opacity-50"
          />
          <p className="text-sm text-slate-500">
            Red Rocks Crew - Vegas 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
