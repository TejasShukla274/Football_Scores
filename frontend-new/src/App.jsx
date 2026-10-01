import { useEffect, useState } from "react";
import "./App.css";

function App() {
    // Current date in YYYY-MM-DD format
    const getTodayDateString = () => new Date().toISOString().split("T")[0];

    const [selectedDate, setSelectedDate] = useState(getTodayDateString());
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter state: "all" | "live" | "byTime"
    const [activeFilter, setActiveFilter] = useState("all");

    // Stores expanded/collapsed state of each league { [leagueName]: boolean }
    const [expandedLeagues, setExpandedLeagues] = useState({});

    // Fetch matches whenever selectedDate changes
    useEffect(() => {
        fetchMatches(selectedDate);
    }, [selectedDate]);

    // Fetch matches from the backend endpoint with optional date parameter
    const fetchMatches = async (dateParam = selectedDate) => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`http://localhost:5000/api/matches?date=${dateParam}`);
            const data = await response.json();

            if (data.error) {
                setError("Unable to load matches");
                return;
            }

            setMatches(data.response || []);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Unable to connect to backend");
        } finally {
            setLoading(false);
        }
    };

    // Check whether a match is currently live
    const isLive = (status) => {
        return ["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"].includes(status);
    };

    // Check whether a match has finished
    const isFinished = (status) => {
        return ["FT", "AET", "PEN"].includes(status);
    };

    // Format match status display
    const getStatus = (match) => {
        const status = match.fixture.status.short;

        if (status === "HT") {
            return "HT";
        }

        if (isLive(status)) {
            return `${match.fixture.status.elapsed || ""}'`;
        }

        if (isFinished(status)) {
            return "FT";
        }

        return new Date(match.fixture.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Date navigation handlers (previous day / next day)
    const changeDateByDays = (days) => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + days);
        const formatted = current.toISOString().split("T")[0];
        setSelectedDate(formatted);
    };

    // Filter and sort match list based on activeFilter
    const getFilteredAndSortedMatches = () => {
        let list = [...matches];

        if (activeFilter === "live") {
            list = list.filter((match) => isLive(match.fixture.status.short));
        }

        if (activeFilter === "byTime") {
            list.sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));
        }

        return list;
    };

    // Group matches according to their league name (match.league.name)
    const groupMatchesByLeague = (matchList) => {
        const grouped = {};

        matchList.forEach((match) => {
            const leagueName = match.league?.name || "Other";

            if (!grouped[leagueName]) {
                grouped[leagueName] = {
                    name: leagueName,
                    country: match.league?.country || "",
                    logo: match.league?.logo || "",
                    matches: []
                };
            }

            grouped[leagueName].matches.push(match);
        });

        return Object.values(grouped);
    };

    // Expand or collapse an individual league
    const toggleLeague = (leagueName) => {
        setExpandedLeagues((previous) => {
            const currentState = previous[leagueName] !== false; // defaults to expanded (true)
            return {
                ...previous,
                [leagueName]: !currentState
            };
        });
    };

    // Filtered matches and league groups
    const processedMatches = getFilteredAndSortedMatches();
    const leagues = groupMatchesByLeague(processedMatches);

    // Determine if all visible leagues are collapsed
    const areAllCollapsed =
        leagues.length > 0 &&
        leagues.every((league) => expandedLeagues[league.name] === false);

    // Global toggle: Collapse All or Expand All
    const toggleAllLeagues = () => {
        const shouldExpand = areAllCollapsed;
        const nextState = {};
        leagues.forEach((league) => {
            nextState[league.name] = shouldExpand;
        });
        setExpandedLeagues(nextState);
    };

    // Chevron SVG icon
    const ChevronIcon = ({ isExpanded }) => (
        <svg
            className={`chevron-svg ${isExpanded ? "expanded" : "collapsed"}`}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );

    // Individual Match Card component
    const MatchCard = ({ match }) => {
        const homeTeam = match.teams.home;
        const awayTeam = match.teams.away;
        const live = isLive(match.fixture.status.short);

        return (
            <div className="match-card">
                {/* Home team */}
                <div className="team home-team">
                    <span className="team-name">{homeTeam.name}</span>
                    {homeTeam.logo && (
                        <img
                            src={homeTeam.logo}
                            alt={homeTeam.name}
                            className="team-logo"
                        />
                    )}
                </div>

                {/* Score and Status */}
                <div className="match-score">
                    <div className="score-number">
                        {match.goals.home ?? "-"}
                        <span className="score-dash"> - </span>
                        {match.goals.away ?? "-"}
                    </div>

                    <div className={live ? "match-status live" : "match-status"}>
                        {live && <span className="live-dot" />}
                        {getStatus(match)}
                    </div>
                </div>

                {/* Away team */}
                <div className="team away-team">
                    {awayTeam.logo && (
                        <img
                            src={awayTeam.logo}
                            alt={awayTeam.name}
                            className="team-logo"
                        />
                    )}
                    <span className="team-name">{awayTeam.name}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="app">
            {/* Top Page Header */}
            <header className="top-section">
                <div>
                    <h1 className="page-title">⚽ Football Scores</h1>
                    <p className="page-subtitle">Live Scores & Fixtures</p>
                </div>

                <button className="refresh-button" onClick={() => fetchMatches(selectedDate)}>
                    Refresh
                </button>
            </header>

            {/* Controls Bar: Calendar / Date Picker */}
            <div className="controls-bar">
                <div className="date-picker-container">
                    <button
                        className="date-nav-btn"
                        onClick={() => changeDateByDays(-1)}
                        title="Previous Day"
                    >
                        ‹
                    </button>

                    <div className="date-input-wrapper">
                        <input
                            type="date"
                            className="date-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <button
                        className="date-nav-btn"
                        onClick={() => changeDateByDays(1)}
                        title="Next Day"
                    >
                        ›
                    </button>

                    {selectedDate !== getTodayDateString() && (
                        <button
                            className="today-reset-btn"
                            onClick={() => setSelectedDate(getTodayDateString())}
                        >
                            Today
                        </button>
                    )}
                </div>
            </div>

            {/* Controls Bar: Match Filters & Global Expand/Collapse All */}
            <div className="filters-and-actions-bar">
                {/* Filter buttons: All, Live, By Time */}
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                        onClick={() => setActiveFilter("all")}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${activeFilter === "live" ? "active" : ""}`}
                        onClick={() => setActiveFilter("live")}
                    >
                        <span className="filter-live-dot" />
                        Live
                    </button>
                    <button
                        className={`filter-btn ${activeFilter === "byTime" ? "active" : ""}`}
                        onClick={() => setActiveFilter("byTime")}
                    >
                        By Time
                    </button>
                </div>

                {/* Global Collapse All / Expand All button */}
                {leagues.length > 0 && (
                    <button
                        className="global-toggle-btn"
                        onClick={toggleAllLeagues}
                    >
                        {areAllCollapsed ? "Expand All ▲" : "Collapse All ▼"}
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="loading">
                    <div className="spinner"></div>
                    <span>Loading matches for {selectedDate}...</span>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="error">
                    <p>{error}</p>
                    <button className="refresh-button" onClick={() => fetchMatches(selectedDate)}>
                        Try Again
                    </button>
                </div>
            )}

            {/* League Groups */}
            {!loading && !error && leagues.length > 0 && (
                <div className="leagues-container">
                    {leagues.map((league) => {
                        const isExpanded = expandedLeagues[league.name] !== false;

                        return (
                            <div
                                className={`league-group ${isExpanded ? "expanded" : "collapsed"}`}
                                key={league.name}
                            >
                                {/* League Header */}
                                <div
                                    className="league-header"
                                    onClick={() => toggleLeague(league.name)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            toggleLeague(league.name);
                                        }
                                    }}
                                >
                                    <div className="league-details">
                                        {league.logo && (
                                            <img
                                                src={league.logo}
                                                alt={league.name}
                                                className="league-logo"
                                            />
                                        )}

                                        <div className="league-info-text">
                                            <h2 className="league-name">{league.name}</h2>
                                            {league.country && (
                                                <span className="league-country">{league.country}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="league-header-right">
                                        <span className="match-count-badge">
                                            {league.matches.length}
                                        </span>
                                        <div className="collapse-arrow">
                                            <ChevronIcon isExpanded={isExpanded} />
                                        </div>
                                    </div>
                                </div>

                                {/* Matches inside League */}
                                {isExpanded && (
                                    <div className="matches-container">
                                        {league.matches.map((match) => (
                                            <MatchCard
                                                key={match.fixture.id}
                                                match={match}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* No matches for selected criteria */}
            {!loading && !error && leagues.length === 0 && (
                <div className="no-matches">
                    No matches found for the selected filter on {selectedDate}.
                </div>
            )}
        </div>
    );
}

export default App;