import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { parseGroupChat, formatParsedPick } from '../utils/textParser';
import { ParsedMessage, ParsedPick, Pick } from '../types';

export default function Parser() {
  const { members, addBulkPicks } = useApp();
  const [inputText, setInputText] = useState('');
  const [parsedMessages, setParsedMessages] = useState<ParsedMessage[]>([]);
  const [selectedPicks, setSelectedPicks] = useState<Map<string, ParsedPickWithMeta>>(new Map());
  const [step, setStep] = useState<'input' | 'review' | 'assign'>('input');

  interface ParsedPickWithMeta extends ParsedPick {
    messageIndex: number;
    pickIndex: number;
    assignedUser?: string;
    units: number;
    odds: number;
  }

  const handleParse = () => {
    const messages = parseGroupChat(inputText);
    setParsedMessages(messages);

    // Create initial selection with all picks
    const picks = new Map<string, ParsedPickWithMeta>();
    messages.forEach((msg, msgIdx) => {
      msg.picks.forEach((pick, pickIdx) => {
        const key = `${msgIdx}-${pickIdx}`;
        const matchedUser = members.find(
          (m) =>
            m.username.toLowerCase() === msg.username.toLowerCase() ||
            m.name.toLowerCase() === msg.username.toLowerCase()
        );

        picks.set(key, {
          ...pick,
          messageIndex: msgIdx,
          pickIndex: pickIdx,
          assignedUser: matchedUser?.username,
          units: pick.units || 1,
          odds: -110,
        });
      });
    });

    setSelectedPicks(picks);
    setStep('review');
  };

  const togglePick = (key: string) => {
    setSelectedPicks((prev) => {
      const newPicks = new Map(prev);
      if (newPicks.has(key)) {
        newPicks.delete(key);
      } else {
        const [msgIdx, pickIdx] = key.split('-').map(Number);
        const msg = parsedMessages[msgIdx];
        const pick = msg.picks[pickIdx];
        const matchedUser = members.find(
          (m) =>
            m.username.toLowerCase() === msg.username.toLowerCase() ||
            m.name.toLowerCase() === msg.username.toLowerCase()
        );

        newPicks.set(key, {
          ...pick,
          messageIndex: msgIdx,
          pickIndex: pickIdx,
          assignedUser: matchedUser?.username,
          units: pick.units || 1,
          odds: -110,
        });
      }
      return newPicks;
    });
  };

  const updatePickUser = (key: string, username: string) => {
    setSelectedPicks((prev) => {
      const newPicks = new Map(prev);
      const pick = newPicks.get(key);
      if (pick) {
        newPicks.set(key, { ...pick, assignedUser: username });
      }
      return newPicks;
    });
  };

  const updatePickUnits = (key: string, units: number) => {
    setSelectedPicks((prev) => {
      const newPicks = new Map(prev);
      const pick = newPicks.get(key);
      if (pick) {
        newPicks.set(key, { ...pick, units });
      }
      return newPicks;
    });
  };

  const updatePickOdds = (key: string, odds: number) => {
    setSelectedPicks((prev) => {
      const newPicks = new Map(prev);
      const pick = newPicks.get(key);
      if (pick) {
        newPicks.set(key, { ...pick, odds });
      }
      return newPicks;
    });
  };

  const handleSubmit = () => {
    const picksToAdd: Omit<Pick, 'id' | 'createdAt'>[] = [];

    selectedPicks.forEach((pick) => {
      if (pick.assignedUser) {
        picksToAdd.push({
          userId: pick.assignedUser,
          username: pick.assignedUser,
          team: pick.team,
          betType: pick.betType,
          spread: pick.spread,
          odds: pick.odds,
          units: pick.units,
          result: 'pending',
          gameDate: new Date().toISOString().split('T')[0],
          source: 'parsed',
          rawText: pick.rawText,
        });
      }
    });

    if (picksToAdd.length > 0) {
      addBulkPicks(picksToAdd);
      setInputText('');
      setParsedMessages([]);
      setSelectedPicks(new Map());
      setStep('input');
      alert(`Added ${picksToAdd.length} picks!`);
    }
  };

  const exampleText = `Mike: I like UConn -8.5, 2 units. Lock of the day!
Dan: Taking Purdue ML today. 1u
Chris: Over 145 in the Houston game, small play
Alex: Duke spread looks nice, going 3u on Duke -2.5
Jordan: Hammer Kentucky ML, this is a lock 🔥`;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <span className="text-4xl">💬</span>
          Text Thread Parser
        </h1>
        <p className="text-slate-400 mt-1">
          Paste your group chat messages and automatically detect picks
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {['input', 'review', 'assign'].map((s, idx) => (
          <React.Fragment key={s}>
            <button
              onClick={() => {
                if (s === 'input') setStep('input');
                else if (s === 'review' && parsedMessages.length > 0) setStep('review');
                else if (s === 'assign' && selectedPicks.size > 0) setStep('assign');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                step === s
                  ? 'bg-orange-500 text-white'
                  : step === 'assign' && s === 'review'
                  ? 'bg-slate-700 text-slate-300'
                  : step === 'review' && s === 'input'
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s ? 'bg-white text-orange-500' : 'bg-slate-600 text-slate-400'
                }`}
              >
                {idx + 1}
              </span>
              {s === 'input' ? 'Paste Text' : s === 'review' ? 'Review Picks' : 'Confirm'}
            </button>
            {idx < 2 && <div className="w-8 h-0.5 bg-slate-700" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Input */}
      {step === 'input' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-white">
                Paste Group Chat Messages
              </label>
              <button
                onClick={() => setInputText(exampleText)}
                className="text-sm text-orange-400 hover:text-orange-300"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Paste your group chat here. Supported formats:\n\nName: message\n[timestamp] Name: message\n@name: message\n\nExample:\nMike: I like UConn -8.5, 2 units\nDan: Taking Purdue ML today`}
              className="w-full h-64 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-mono text-sm"
            />

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                The parser will detect team names, bet types (spread, ML, over/under), and unit sizes
              </p>
              <button
                onClick={handleParse}
                disabled={!inputText.trim()}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Parse Messages →
              </button>
            </div>
          </div>

          {/* Supported Formats Info */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Supported Formats</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-2">Message formats:</p>
                <ul className="space-y-1 text-slate-300">
                  <li>• <code className="bg-slate-700 px-1 rounded">Name: message</code> (iMessage/SMS)</li>
                  <li>• <code className="bg-slate-700 px-1 rounded">[time] Name: message</code> (WhatsApp)</li>
                  <li>• <code className="bg-slate-700 px-1 rounded">@name: message</code> (Slack)</li>
                  <li>• <code className="bg-slate-700 px-1 rounded">Name - message</code> (GroupMe)</li>
                </ul>
              </div>
              <div>
                <p className="text-slate-400 mb-2">Bet detection:</p>
                <ul className="space-y-1 text-slate-300">
                  <li>• Spreads: <code className="bg-slate-700 px-1 rounded">+7.5</code>, <code className="bg-slate-700 px-1 rounded">-3</code></li>
                  <li>• Moneyline: <code className="bg-slate-700 px-1 rounded">ML</code>, <code className="bg-slate-700 px-1 rounded">moneyline</code></li>
                  <li>• Totals: <code className="bg-slate-700 px-1 rounded">over 145</code>, <code className="bg-slate-700 px-1 rounded">under 138</code></li>
                  <li>• Units: <code className="bg-slate-700 px-1 rounded">2u</code>, <code className="bg-slate-700 px-1 rounded">3 units</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 'review' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Detected Picks</h3>
                <p className="text-sm text-slate-400">
                  Found {parsedMessages.reduce((sum, m) => sum + m.picks.length, 0)} picks from{' '}
                  {parsedMessages.length} messages
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const allKeys: string[] = [];
                    parsedMessages.forEach((msg, msgIdx) => {
                      msg.picks.forEach((_, pickIdx) => {
                        allKeys.push(`${msgIdx}-${pickIdx}`);
                      });
                    });
                    if (selectedPicks.size === allKeys.length) {
                      setSelectedPicks(new Map());
                    } else {
                      allKeys.forEach((key) => {
                        if (!selectedPicks.has(key)) {
                          togglePick(key);
                        }
                      });
                    }
                  }}
                  className="text-sm text-orange-400 hover:text-orange-300"
                >
                  {selectedPicks.size ===
                  parsedMessages.reduce((sum, m) => sum + m.picks.length, 0)
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
              {parsedMessages.map((message, msgIdx) => (
                <div key={msgIdx} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-slate-300">
                      {message.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{message.username}</p>
                      <p className="text-sm text-slate-400 mt-1">{message.text}</p>
                    </div>
                  </div>

                  <div className="ml-11 space-y-2">
                    {message.picks.map((pick, pickIdx) => {
                      const key = `${msgIdx}-${pickIdx}`;
                      const isSelected = selectedPicks.has(key);

                      return (
                        <button
                          key={pickIdx}
                          onClick={() => togglePick(key)}
                          className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-orange-500/20 border border-orange-500/50'
                              : 'bg-slate-700/50 border border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-orange-500 border-orange-500'
                                  : 'border-slate-500'
                              }`}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className="text-white font-medium">{formatParsedPick(pick)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                pick.confidence >= 0.8
                                  ? 'bg-green-500/20 text-green-400'
                                  : pick.confidence >= 0.6
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-slate-600 text-slate-300'
                              }`}
                            >
                              {(pick.confidence * 100).toFixed(0)}% confident
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('input')}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep('assign')}
              disabled={selectedPicks.size === 0}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue ({selectedPicks.size} picks) →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Assign & Confirm */}
      {step === 'assign' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Assign Picks to Members</h3>
              <p className="text-sm text-slate-400">
                Review and adjust pick details before adding to the tracker
              </p>
            </div>

            <div className="divide-y divide-slate-700 max-h-[500px] overflow-y-auto">
              {Array.from(selectedPicks.entries()).map(([key, pick]) => {
                const message = parsedMessages[pick.messageIndex];

                return (
                  <div key={key} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-white text-lg">{pick.team}</p>
                        <p className="text-sm text-slate-400">
                          {pick.betType === 'spread' && pick.spread !== undefined
                            ? `Spread: ${pick.spread > 0 ? '+' : ''}${pick.spread}`
                            : pick.betType.toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 italic">"{pick.rawText}"</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {/* User Assignment */}
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Assign to:</label>
                          <select
                            value={pick.assignedUser || ''}
                            onChange={(e) => updatePickUser(key, e.target.value)}
                            className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">Select member...</option>
                            {members.map((m) => (
                              <option key={m.id} value={m.username}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Units */}
                        <div className="flex gap-3">
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Units:</label>
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={pick.units}
                              onChange={(e) => updatePickUnits(key, parseFloat(e.target.value) || 1)}
                              className="w-20 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          {/* Odds */}
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Odds:</label>
                            <input
                              type="number"
                              value={pick.odds}
                              onChange={(e) => updatePickOdds(key, parseInt(e.target.value) || -110)}
                              className="w-24 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => togglePick(key)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Total Picks</p>
                <p className="text-xl font-bold text-white">{selectedPicks.size}</p>
              </div>
              <div>
                <p className="text-slate-400">Assigned</p>
                <p className="text-xl font-bold text-green-400">
                  {Array.from(selectedPicks.values()).filter((p) => p.assignedUser).length}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Unassigned</p>
                <p className="text-xl font-bold text-yellow-400">
                  {Array.from(selectedPicks.values()).filter((p) => !p.assignedUser).length}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Total Units</p>
                <p className="text-xl font-bold text-white">
                  {Array.from(selectedPicks.values())
                    .filter((p) => p.assignedUser)
                    .reduce((sum, p) => sum + p.units, 0)
                    .toFixed(1)}
                  u
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('review')}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={Array.from(selectedPicks.values()).filter((p) => p.assignedUser).length === 0}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add {Array.from(selectedPicks.values()).filter((p) => p.assignedUser).length} Picks to
              Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
