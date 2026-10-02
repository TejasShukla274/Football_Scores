import React, { useState } from 'react';
import { LEAGUE_STANDINGS } from '../data/standings.js';

export default function LeagueTable() {
  const [selectedLeague, setSelectedLeague] = useState('Premier League');

  const standings = LEAGUE_STANDINGS[selectedLeague] || LEAGUE_STANDINGS['Premier League'];

  return (
    <section className="panel">
      <h3>
        LEAGUE TABLE
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          aria-label="League"
        >
          {Object.keys(LEAGUE_STANDINGS).map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </select>
      </h3>

      <table className="tbl">
        <thead>
          <tr>
            <th>POS</th>
            <th className="t">TEAM</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GD</th>
            <th>PTS</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, idx) => (
            <tr key={row[0]}>
              <td>{idx + 1}</td>
              <td className="t">{row[0]}</td>
              {row.slice(1).map((val, cellIdx) => (
                <td
                  key={cellIdx}
                  className={cellIdx === 5 ? 'pts' : ''}
                >
                  {cellIdx === 4 && val > 0 ? `+${val}` : val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
