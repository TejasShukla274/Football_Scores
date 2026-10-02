import React, { useState, useEffect, useMemo } from 'react';
import './styles.css';

// Import data services & hooks
import { getMatches, getIsoDate } from './services/api.js';
import { DEFAULT_5_LEAGUES } from './data/leagues.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';

// Import components
import NavBar from './components/NavBar.jsx';
import Controls from './components/Controls.jsx';
import Calendar from './components/Calendar.jsx';
import MatchFeed from './components/MatchFeed.jsx';
import PopularLeagues from './components/PopularLeagues.jsx';
import News from './components/News.jsx';
import Upcoming from './components/Upcoming.jsx';
import GoldenBoot from './components/GoldenBoot.jsx';
import LeagueTable from './components/LeagueTable.jsx';
import AskTed from './components/AskTed.jsx';
import MakeYour11Page from './components/MakeYour11Page.jsx';

export default function App() {
  const todayDate = useMemo(() => getIsoDate(0), []);

  // Navigation & Page state
  const [navTab, setNavTab] = useState('HOME');
  const [page, setPage] = useState(() => (window.location.hash === '#xi' ? 'xi' : 'home'));

  // Sync window location hash with page state
  useEffect(() => {
    if (page === 'xi') {
      window.history.replaceState(null, '', '#xi');
    } else {
      window.history.replaceState(null, '', '#');
    }
    window.scrollTo(0, 0);
  }, [page]);

  // Listen to hashchange event (e.g. back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      setPage(window.location.hash === '#xi' ? 'xi' : 'home');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Feed Controls state
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [isLiveOnly, setIsLiveOnly] = useState(false);
  const [sortByTime, setSortByTime] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedLeagues, setCollapsedLeagues] = useState([]);
  const [activeLeague, setActiveLeague] = useState(null);

  // Featured 5 leagues persisted in LocalStorage
  const [featuredLeagues, setFeaturedLeagues] = useLocalStorage(
    'featured_leagues',
    DEFAULT_5_LEAGUES
  );

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Fetch matches from API service for selected date
  const matches = useMemo(() => getMatches(selectedDate), [selectedDate]);

  // Apply search query filtering across home/away/league
  const searchedMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches;
    const q = searchQuery.trim().toLowerCase();
    return matches.filter(
      (m) =>
        m.home.toLowerCase().includes(q) ||
        m.away.toLowerCase().includes(q) ||
        m.league.toLowerCase().includes(q)
    );
  }, [matches, searchQuery]);

  // Calculate league match counts for left sidebar
  const leagueCounts = useMemo(() => {
    return matches.reduce((acc, m) => {
      acc[m.league] = (acc[m.league] || 0) + 1;
      return acc;
    }, {});
  }, [matches]);

  const hasLiveMatches = useMemo(
    () => matches.some((m) => m.status === 'LIVE'),
    [matches]
  );

  // Helper date formatter
  const formatDateLabel = (isoDate) => {
    const d = new Date(isoDate + 'T12:00');
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // Unique leagues list present in current search results
  const currentLeaguesInFeed = useMemo(
    () => [...new Set(searchedMatches.map((m) => m.league))],
    [searchedMatches]
  );

  const allCollapsed =
    currentLeaguesInFeed.length > 0 &&
    currentLeaguesInFeed.every((lg) => collapsedLeagues.includes(lg));

  const toggleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedLeagues([]);
    } else {
      setCollapsedLeagues(currentLeaguesInFeed);
    }
  };

  return (
    <>
      <NavBar
        currentNav={navTab}
        setNav={setNavTab}
        currentPage={page}
        setPage={setPage}
        hasLiveMatches={hasLiveMatches}
      />

      {page === 'xi' ? (
        <MakeYour11Page />
      ) : (
        <main className="layout">
          {/* LEFT COLUMN: Popular Competitions & Transfer News */}
          <aside className="col left">
            <PopularLeagues
              featuredLeagues={featuredLeagues}
              setFeaturedLeagues={setFeaturedLeagues}
              activeLeague={activeLeague}
              setActiveLeague={setActiveLeague}
              counts={leagueCounts}
            />
            <News />
          </aside>

          {/* CENTER COLUMN: Match Feed & Controls */}
          <section className="col center">
            <Controls
              isLiveOnly={isLiveOnly}
              setIsLiveOnly={setIsLiveOnly}
              sortByTime={sortByTime}
              setSortByTime={setSortByTime}
              showCalendar={showCalendar}
              setShowCalendar={setShowCalendar}
              selectedDate={selectedDate}
              todayDate={todayDate}
              formatDate={formatDateLabel}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              allCollapsed={allCollapsed}
              toggleCollapseAll={toggleCollapseAll}
            />

            {showCalendar && (
              <Calendar
                date={selectedDate}
                setDate={setSelectedDate}
                todayDate={todayDate}
                onSyncCalendar={() =>
                  triggerToast('Calendar synced (demo only, nothing was saved)')
                }
              />
            )}

            {toastMessage && (
              <div className="toast" role="status">
                {toastMessage}
              </div>
            )}

            <MatchFeed
              matches={searchedMatches}
              navTab={navTab}
              isLiveOnly={isLiveOnly}
              sortByTime={sortByTime}
              selectedDate={selectedDate}
              todayDate={todayDate}
              featuredLeagues={featuredLeagues}
              setFeaturedLeagues={setFeaturedLeagues}
              activeLeague={activeLeague}
              setActiveLeague={setActiveLeague}
              collapsedLeagues={collapsedLeagues}
              setCollapsedLeagues={setCollapsedLeagues}
              formatDate={formatDateLabel}
            />
          </section>

          {/* RIGHT COLUMN: Upcoming, Golden Boot & League Table */}
          <aside className="col right">
            <Upcoming
              onPickDate={(dateStr) => {
                setSelectedDate(dateStr);
                setNavTab('HOME');
              }}
            />
            <GoldenBoot />
            <LeagueTable />
          </aside>
        </main>
      )}

      {/* ASK TED BOTTOM OMNIBOX */}
      <AskTed
        onMatchSelect={(dateStr) => {
          setSelectedDate(dateStr);
          setNavTab('HOME');
          setActiveLeague(null);
          setSearchQuery('');
        }}
        onLeagueSelect={(leagueName) => {
          setActiveLeague(leagueName);
          setNavTab('HOME');
        }}
      />
    </>
  );
}