import React from 'react';
import { HANDWRITTEN_MATCHES, getIsoDate } from '../data/matches.js';

export default function Upcoming({ onPickDate }) {
  const todayStr = getIsoDate(0);

  const upcomingList = HANDWRITTEN_MATCHES
    .filter((m) => m.status === 'UP' && m.date >= todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);

  const formatDayName = (isoDate) => {
    const d = new Date(isoDate + 'T12:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long' });
  };

  return (
    <section className="panel">
      <h3>UPCOMING MATCHES</h3>
      <ul className="up-list">
        {upcomingList.map((m) => (
          <li key={m.id}>
            <button onClick={() => onPickDate(m.date)}>
              <small>{m.league}</small>
              <b>{m.home} vs {m.away}</b>
              <span>{formatDayName(m.date)} · {m.time}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
