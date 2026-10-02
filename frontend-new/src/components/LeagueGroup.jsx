import React from 'react';
import MatchRow from './MatchRow.jsx';

export default function LeagueGroup({ leagueName, matches, isCollapsed, onToggle }) {
  const matchCount = matches.length;

  return (
    <section className="group">
      <button
        className="g-head"
        onClick={onToggle}
        aria-expanded={!isCollapsed}
      >
        <span className={`arrow ${isCollapsed ? 'shut' : ''}`}>▼</span>
        <b>{leagueName}</b>
        <span className="count">
          {matchCount} {matchCount === 1 ? 'MATCH' : 'MATCHES'}
        </span>
      </button>

      <div className={`accordion-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="accordion-inner">
          <ul>
            {matches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
