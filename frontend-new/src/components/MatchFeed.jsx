import React, { useState } from 'react';
import LeagueGroup from './LeagueGroup.jsx';
import LeaguePicker from './LeaguePicker.jsx';

export default function MatchFeed({
  matches,
  navTab,
  isLiveOnly,
  sortByTime,
  selectedDate,
  todayDate,
  featuredLeagues,
  setFeaturedLeagues,
  activeLeague,
  setActiveLeague,
  collapsedLeagues,
  setCollapsedLeagues,
  formatDate
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [showAllLeagues, setShowAllLeagues] = useState(false);

  const isToday = selectedDate === todayDate;

  // Filter matches based on Nav Tab, Live toggle, Active League filter, Featured Leagues, Search
  const filteredMatches = matches.filter((m) => {
    // Nav tab filtering
    if (navTab === 'LIVE' && m.status !== 'LIVE') return false;
    if (navTab === 'UPCOMING' && m.status !== 'UP') return false;
    if (navTab === 'RESULTS' && m.status !== 'FT') return false;

    // Live toggle
    if (isLiveOnly && m.status !== 'LIVE') return false;

    // Active single league filter
    if (activeLeague) {
      if (m.league !== activeLeague) return false;
    } else if (!showAllLeagues) {
      // 5 featured leagues filter
      if (!featuredLeagues.includes(m.league)) return false;
    }

    return true;
  });

  // Unique leagues present in filtered matches
  const uniqueLeagues = [...new Set(filteredMatches.map((m) => m.league))];

  // Helper sorting for league order & kick-off times
  const getLeagueIndex = (lg) => {
    const idx = featuredLeagues.indexOf(lg);
    return idx >= 0 ? idx : 100;
  };

  const getEarliestKickoff = (lg) => {
    const lgMatches = filteredMatches.filter((m) => m.league === lg);
    return lgMatches.map((m) => m.time).sort()[0] || '23:59';
  };

  uniqueLeagues.sort((a, b) => {
    if (sortByTime) {
      return getEarliestKickoff(a).localeCompare(getEarliestKickoff(b));
    }
    return getLeagueIndex(a) - getLeagueIndex(b);
  });

  const totalLiveCount = matches.filter((m) => m.status === 'LIVE').length;

  // Adaptive Heading
  let headingText = 'MATCHES';
  if (navTab === 'LIVE') headingText = 'LIVE NOW';
  else if (navTab === 'UPCOMING') headingText = 'UPCOMING FIXTURES';
  else if (navTab === 'RESULTS') headingText = 'RESULTS';
  else if (isToday) {
    headingText = totalLiveCount > 0 ? 'ONGOING MATCHES' : "TODAY'S MATCHES";
  }

  const toggleGroupCollapse = (leagueName) => {
    setCollapsedLeagues((prev) =>
      prev.includes(leagueName)
        ? prev.filter((name) => name !== leagueName)
        : [...prev, leagueName]
    );
  };

  return (
    <section className="col center">
      <div className="feed-head">
        <h1>{headingText}</h1>
        <span className="sub">{formatDate(selectedDate)}</span>
        {totalLiveCount > 0 && (
          <span className="live-tag">{totalLiveCount} LIVE NOW</span>
        )}
      </div>

      <div className="feed-leagues">
        <span>
          {activeLeague
            ? `Showing ${activeLeague} only`
            : showAllLeagues
            ? 'Showing all leagues'
            : `Showing your 5 leagues: ${featuredLeagues.join(', ')}`}
        </span>
        <button onClick={() => setShowPicker(!showPicker)}>
          {showPicker ? 'Close' : 'Choose 5 leagues'}
        </button>
        <button
          onClick={() => {
            setShowAllLeagues(!showAllLeagues);
            setActiveLeague(null);
          }}
        >
          {showAllLeagues ? 'Back to my 5' : 'Show all'}
        </button>
      </div>

      {showPicker && (
        <div className="panel feed-pick">
          <LeaguePicker
            currentFeatured={featuredLeagues}
            onSave={(newLeagues) => {
              setFeaturedLeagues(newLeagues);
              setShowPicker(false);
              setShowAllLeagues(false);
            }}
            onCancel={() => setShowPicker(false)}
          />
        </div>
      )}

      {activeLeague && (
        <p className="chip">
          Filtering: {activeLeague}{' '}
          <button onClick={() => setActiveLeague(null)}>Clear</button>
        </p>
      )}

      {uniqueLeagues.length === 0 && (
        <p className="empty">
          No matches for {formatDate(selectedDate)} with these filters. Pick another date or clear the filters.
        </p>
      )}

      {uniqueLeagues.map((leagueName) => {
        const leagueMatches = filteredMatches
          .filter((m) => m.league === leagueName)
          .sort((a, b) => (sortByTime ? a.time.localeCompare(b.time) : 0));

        const isCollapsed = collapsedLeagues.includes(leagueName);

        return (
          <LeagueGroup
            key={leagueName}
            leagueName={leagueName}
            matches={leagueMatches}
            isCollapsed={isCollapsed}
            onToggle={() => toggleGroupCollapse(leagueName)}
          />
        );
      })}
    </section>
  );
}
