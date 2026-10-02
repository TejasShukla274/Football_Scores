import React from 'react';

export default function Controls({
  isLiveOnly,
  setIsLiveOnly,
  sortByTime,
  setSortByTime,
  showCalendar,
  setShowCalendar,
  selectedDate,
  todayDate,
  formatDate,
  searchQuery,
  setSearchQuery,
  allCollapsed,
  toggleCollapseAll
}) {
  const isToday = selectedDate === todayDate;

  return (
    <div className="controls">
      <button
        className={isLiveOnly ? 'on' : ''}
        onClick={() => setIsLiveOnly(!isLiveOnly)}
      >
        <i className="pulse" />
        Live
      </button>

      <button
        className={sortByTime ? 'on' : ''}
        onClick={() => setSortByTime(!sortByTime)}
      >
        By Time
      </button>

      <button
        className={showCalendar ? 'on' : ''}
        onClick={() => setShowCalendar(!showCalendar)}
      >
        Calendar · {isToday ? 'Today' : formatDate(selectedDate)}
      </button>

      <input
        className="search"
        type="search"
        placeholder="Search teams, leagues"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search matches"
      />

      <button onClick={toggleCollapseAll}>
        {allCollapsed ? 'Expand All' : 'Collapse All'}
      </button>
    </div>
  );
}
