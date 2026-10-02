import React, { useState, useEffect } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar({ date, setDate, todayDate, onSyncCalendar }) {
  const [yearNum, monthNum] = date.split('-').map(Number);
  const [viewState, setViewState] = useState({ y: yearNum, m: monthNum - 1 });

  useEffect(() => {
    setViewState({ y: yearNum, m: monthNum - 1 });
  }, [date, yearNum, monthNum]);

  const { y, m } = viewState;

  // Monday-first offset
  const firstDay = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const daysGrid = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const formatIso = (dayVal) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
  };

  const shiftMonth = (delta) => {
    const nextDate = new Date(y, m + delta, 1);
    setViewState({ y: nextDate.getFullYear(), m: nextDate.getMonth() });
  };

  const yearRange = Array.from({ length: 31 }, (_, i) => 2015 + i);

  return (
    <div className="cal">
      <div className="cal-top">
        <button onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
        <h2>{MONTH_NAMES[m].toUpperCase()}</h2>
        <button onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
      </div>

      <div className="cal-grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayHeader, idx) => (
          <span key={idx} className="dow">{dayHeader}</span>
        ))}

        {daysGrid.map((dayNum, idx) => {
          if (dayNum === null) return <span key={`empty-${idx}`} />;
          const iso = formatIso(dayNum);
          const isSelected = iso === date;
          const isToday = iso === todayDate;

          return (
            <button
              key={iso}
              className={`${isSelected ? 'sel ' : ''}${isToday ? 'today' : ''}`}
              onClick={() => setDate(iso)}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      <div className="cal-foot">
        <i />
        <select
          value={y}
          onChange={(e) => setViewState({ y: +e.target.value, m })}
          aria-label="Year"
        >
          {yearRange.map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
        <i />
      </div>

      <div className="cal-row">
        <select
          value={m}
          onChange={(e) => setViewState({ y, m: +e.target.value })}
          aria-label="Month"
        >
          {MONTH_NAMES.map((name, idx) => (
            <option key={name} value={idx}>{name}</option>
          ))}
        </select>

        <button onClick={() => setDate(todayDate)}>Today</button>

        <button className="sync" onClick={onSyncCalendar}>
          Sync Calendar
        </button>
      </div>
    </div>
  );
}
