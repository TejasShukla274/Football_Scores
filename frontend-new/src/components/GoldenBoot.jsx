import React from 'react';
import { TOP_SCORERS } from '../data/scorers.js';

const TeamBadge = ({ name }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3);
  return <span className="badge">{initials}</span>;
};

export default function GoldenBoot() {
  return (
    <section className="panel">
      <h3>GOLDEN BOOT RACE</h3>
      <ol className="boot">
        {TOP_SCORERS.map((scorer) => (
          <li key={scorer.name} className={`r${scorer.rank}`}>
            <span className="rank">{scorer.rank}</span>
            <TeamBadge name={scorer.club} />
            <div>
              <b>{scorer.name}</b>
              <small>{scorer.club}</small>
            </div>
            <strong>
              {scorer.goals}
              <small> goals</small>
            </strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
