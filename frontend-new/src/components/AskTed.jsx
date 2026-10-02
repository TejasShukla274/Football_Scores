import React, { useState, useMemo } from 'react';
import { HANDWRITTEN_MATCHES } from '../data/matches.js';
import { PLAYERS } from '../data/players.js';
import { ALL_LEAGUES } from '../data/leagues.js';

export default function AskTed({ onMatchSelect, onLeagueSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const cleanQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!cleanQuery) return null;

    const matches = HANDWRITTEN_MATCHES.filter((m) =>
      (m.home + m.away + m.league).toLowerCase().includes(cleanQuery)
    ).slice(0, 5);

    const players = PLAYERS.filter((p) =>
      (p.name + p.club).toLowerCase().includes(cleanQuery)
    ).slice(0, 5);

    const leagues = ALL_LEAGUES.filter((l) =>
      l.name.toLowerCase().includes(cleanQuery)
    ).slice(0, 4);

    return { matches, players, leagues };
  }, [cleanQuery]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
  };

  const formatDateLabel = (isoDate) => {
    const d = new Date(isoDate + 'T12:00');
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className={`omni ${isOpen ? 'open' : ''}`}>
      {isOpen && results && (
        <div className="omni-res">
          {!results.matches.length &&
            !results.players.length &&
            !results.leagues.length && (
              <p className="hint">No matches, players or leagues found.</p>
            )}

          {results.matches.length > 0 && (
            <>
              <h4>Matches</h4>
              {results.matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onMatchSelect(m.date);
                    handleClose();
                  }}
                >
                  {m.home} {m.status === 'UP' ? 'vs' : `${m.hs}-${m.as}`} {m.away}
                  <em>{formatDateLabel(m.date)}</em>
                </button>
              ))}
            </>
          )}

          {results.players.length > 0 && (
            <>
              <h4>Players</h4>
              {results.players.map((p) => (
                <div key={p.id} className="plain">
                  <span>{p.name}</span>
                  <em>{p.club} · {p.pos}</em>
                </div>
              ))}
            </>
          )}

          {results.leagues.length > 0 && (
            <>
              <h4>Leagues</h4>
              {results.leagues.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    onLeagueSelect(l.name);
                    handleClose();
                  }}
                >
                  {l.name}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {isOpen ? (
        <div className="omni-bar">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Ted: matches, players, leagues"
            onKeyDown={(e) => e.key === 'Escape' && handleClose()}
          />
          <button onClick={handleClose} aria-label="Close Ask Ted">
            ✕
          </button>
        </div>
      ) : (
        <button className="omni-pill" onClick={() => setIsOpen(true)}>
          Ask Ted!
        </button>
      )}
    </div>
  );
}
