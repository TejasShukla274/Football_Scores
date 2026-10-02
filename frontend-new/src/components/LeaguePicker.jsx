import React, { useState } from 'react';
import { ALL_LEAGUES } from '../data/leagues.js';

export default function LeaguePicker({ currentFeatured, onSave, onCancel }) {
  const [selected, setSelected] = useState(currentFeatured);

  const toggleLeague = (name) => {
    setSelected((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      }
      if (prev.length < 5) {
        return [...prev, name];
      }
      return prev;
    });
  };

  const isComplete = selected.length === 5;

  return (
    <div className="lp">
      <p className="hint">
        {isComplete
          ? 'Five selected. Untick one to swap it.'
          : `Select ${5 - selected.length} more (exactly 5 required).`}
      </p>

      <ul className="lg-list lp-grid">
        {ALL_LEAGUES.map((league) => {
          const isChecked = selected.includes(league.name);
          const isDisabled = !isChecked && selected.length >= 5;

          return (
            <li key={league.id}>
              <label className={isChecked ? 'on' : ''}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => toggleLeague(league.name)}
                />
                {league.name}
                {isChecked && ' ✓'}
              </label>
            </li>
          );
        })}
      </ul>

      <div className="lp-actions">
        <button
          className="save"
          disabled={!isComplete}
          onClick={() => onSave(selected)}
        >
          Save 5 leagues
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
