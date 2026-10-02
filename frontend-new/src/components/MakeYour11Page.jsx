import React, { useState } from 'react';
import { PLAYERS } from '../data/players.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const FORMATION_LAYOUTS = {
  '4-3-3': [
    ['LW', 'ST', 'RW'],
    ['CM', 'CM', 'CM'],
    ['LB', 'CB', 'CB', 'RB'],
    ['GK']
  ],
  '4-4-2': [
    ['ST', 'ST'],
    ['LM', 'CM', 'CM', 'RM'],
    ['LB', 'CB', 'CB', 'RB'],
    ['GK']
  ],
  '4-2-3-1': [
    ['ST'],
    ['LW', 'CAM', 'RW'],
    ['CDM', 'CDM'],
    ['LB', 'CB', 'CB', 'RB'],
    ['GK']
  ],
  '3-5-2': [
    ['ST', 'ST'],
    ['LWB', 'CM', 'CAM', 'CM', 'RWB'],
    ['CB', 'CB', 'CB'],
    ['GK']
  ],
  '3-4-3': [
    ['LW', 'ST', 'RW'],
    ['LM', 'CM', 'CM', 'RM'],
    ['CB', 'CB', 'CB'],
    ['GK']
  ],
  '5-3-2': [
    ['ST', 'ST'],
    ['CM', 'CM', 'CM'],
    ['LWB', 'CB', 'CB', 'CB', 'RWB'],
    ['GK']
  ]
};

const POSITION_GROUPS = {
  GK: 'GK',
  LB: 'DEF', CB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF',
  CM: 'MID', CAM: 'MID', CDM: 'MID', LM: 'MID', RM: 'MID',
  ST: 'FWD', LW: 'FWD', RW: 'FWD'
};

const getPosGroup = (slotCode) => POSITION_GROUPS[slotCode] || 'FWD';
const getPlayerById = (id) => PLAYERS.find((p) => p.id === id);

export default function MakeYour11Page() {
  const [xiData, setXiData] = useLocalStorage('xi_state', {
    formation: '4-3-3',
    picks: Array(11).fill(null)
  });

  const [activeSlotIdx, setActiveSlotIdx] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  const rows = FORMATION_LAYOUTS[xiData.formation] || FORMATION_LAYOUTS['4-3-3'];
  const flatSlotCodes = rows.flat();

  const selectedCount = xiData.picks.filter(Boolean).length;

  // Calculate current week number in the year
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);

  const handleFormationChange = (newFormation) => {
    const existingPicks = xiData.picks.filter(Boolean);
    const newFlatSlots = FORMATION_LAYOUTS[newFormation].flat();

    const usedPlayerIds = new Set();
    const newPicks = newFlatSlots.map((slotCode) => {
      const neededGroup = getPosGroup(slotCode);
      const matchId = existingPicks.find((pid) => {
        if (usedPlayerIds.has(pid)) return false;
        const player = getPlayerById(pid);
        return player && player.pos === neededGroup;
      });

      if (matchId) {
        usedPlayerIds.add(matchId);
        return matchId;
      }
      return null;
    });

    setXiData({ formation: newFormation, picks: newPicks });
  };

  const handleSelectPlayer = (slotIndex, playerId) => {
    const nextPicks = [...xiData.picks];
    nextPicks[slotIndex] = playerId;
    setXiData({ ...xiData, picks: nextPicks });
    setActiveSlotIdx(null);
    setFilterQuery('');
  };

  const activeSlotCode = activeSlotIdx !== null ? flatSlotCodes[activeSlotIdx] : null;
  const activePosGroup = activeSlotCode ? getPosGroup(activeSlotCode) : null;

  const eligiblePlayers = activeSlotIdx === null ? [] : PLAYERS.filter((p) => {
    if (p.pos !== activePosGroup) return false;
    if (xiData.picks.includes(p.id) && xiData.picks[activeSlotIdx] !== p.id) return false;
    if (filterQuery) {
      return (p.name + p.club).toLowerCase().includes(filterQuery.toLowerCase());
    }
    return true;
  });

  let currentSlotTracker = 0;

  return (
    <main className="xi-page">
      <section className="panel">
        <h3>MAKE YOUR 11</h3>

        <div className="xi-meta">
          <span>MY XI · Week {weekNumber}</span>
          <select
            value={xiData.formation}
            onChange={(e) => handleFormationChange(e.target.value)}
            aria-label="Formation"
          >
            {Object.keys(FORMATION_LAYOUTS).map((fmt) => (
              <option key={fmt} value={fmt}>{fmt}</option>
            ))}
          </select>
        </div>

        <div className="pitch">
          {rows.map((rowSlots, rowIdx) => (
            <div key={rowIdx} className="prow">
              {rowSlots.map((slotCode) => {
                const slotIdx = currentSlotTracker++;
                const playerId = xiData.picks[slotIdx];
                const player = getPlayerById(playerId);

                return (
                  <button
                    key={slotIdx}
                    className={`slot ${player ? 'filled' : ''}`}
                    onClick={() => setActiveSlotIdx(slotIdx)}
                  >
                    <span className="dot">
                      {player ? player.name.split(' ').pop().slice(0, 1) : '+'}
                    </span>
                    <b>{player ? player.name : slotCode}</b>
                    {player && <small>{player.club}</small>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <p className={`xi-count ${selectedCount === 11 ? 'done' : ''}`}>
          {selectedCount === 11
            ? '11 players selected — XI complete'
            : `${selectedCount}/11 players selected`}
        </p>

        {activeSlotIdx !== null && (
          <div className="picker">
            <div className="picker-head">
              <b>Pick {activePosGroup} · {activeSlotCode}</b>
              <button onClick={() => setActiveSlotIdx(null)}>Close</button>
            </div>

            <input
              autoFocus
              placeholder="Filter players"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />

            {xiData.picks[activeSlotIdx] && (
              <button
                className="rm"
                onClick={() => handleSelectPlayer(activeSlotIdx, null)}
              >
                Remove {getPlayerById(xiData.picks[activeSlotIdx])?.name}
              </button>
            )}

            <ul>
              {eligiblePlayers.map((p) => (
                <li key={p.id}>
                  <button onClick={() => handleSelectPlayer(activeSlotIdx, p.id)}>
                    <b>{p.name}</b>
                    <span>{p.club}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
