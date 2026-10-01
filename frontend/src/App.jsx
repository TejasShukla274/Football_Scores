import { useEffect, useState } from "react";
import "./App.css";

function App() {

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Stores the expanded/collapsed state of each league
    const [expandedLeagues, setExpandedLeagues] = useState({});


    // Fetch matches when the page loads
    useEffect(() => {
        fetchMatches();
    }, []);


    // Fetch matches from the existing backend
    const fetchMatches = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/matches"
            );

            const data = await response.json();

            if (data.error) {

                setError("Unable to load matches");

                return;

            }

            setMatches(data.response || []);

        } catch (error) {

            console.log(error);

            setError("Unable to connect to backend");

        } finally {

            setLoading(false);

        }

    };


    // Check whether a match is currently live
    const isLive = (status) => {

        return [
            "1H",
            "2H",
            "HT",
            "ET",
            "BT",
            "P",
            "LIVE",
            "INT"
        ].includes(status);

    };


    // Check whether a match has finished
    const isFinished = (status) => {

        return [
            "FT",
            "AET",
            "PEN"
        ].includes(status);

    };


    // Get the correct status text
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


        return new Date(
            match.fixture.date
        ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    };


    // Group all matches according to their league
    const groupMatchesByLeague = () => {

        const grouped = {};


        matches.forEach((match) => {

            const leagueName = match.league.name;


            if (!grouped[leagueName]) {

                grouped[leagueName] = {

                    name: leagueName,

                    country: match.league.country,

                    logo: match.league.logo,

                    matches: []

                };

            }


            grouped[leagueName].matches.push(match);

        });


        return Object.values(grouped);

    };


    // Expand or collapse a league
    const toggleLeague = (leagueName) => {

        setExpandedLeagues((previous) => {

            return {

                ...previous,

                [leagueName]: !previous[leagueName]

            };

        });

    };


    // Individual match
    const MatchCard = ({ match }) => {

        const homeTeam = match.teams.home;

        const awayTeam = match.teams.away;


        return (

            <div className="match-card">


                {/* Home team */}

                <div className="team home-team">

                    <img
                        src={homeTeam.logo}
                        alt={homeTeam.name}
                        className="team-logo"
                    />

                    <span>
                        {homeTeam.name}
                    </span>

                </div>


                {/* Score */}

                <div className="match-score">

                    <div className="score-number">

                        {match.goals.home ?? "-"}
                        {" - "}
                        {match.goals.away ?? "-"}

                    </div>


                    <div
                        className={
                            isLive(match.fixture.status.short)
                                ? "match-status live"
                                : "match-status"
                        }
                    >

                        {getStatus(match)}

                    </div>

                </div>


                {/* Away team */}

                <div className="team away-team">

                    <span>
                        {awayTeam.name}
                    </span>

                    <img
                        src={awayTeam.logo}
                        alt={awayTeam.name}
                        className="team-logo"
                    />

                </div>


            </div>

        );

    };


    // Loading
    if (loading) {

        return (

            <div className="app">

                <h1 className="page-title">
                    ⚽ Football Scores
                </h1>

                <div className="loading">
                    Loading matches...
                </div>

            </div>

        );

    }


    // Error
    if (error) {

        return (

            <div className="app">

                <h1 className="page-title">
                    ⚽ Football Scores
                </h1>

                <div className="error">
                    {error}
                </div>

                <button
                    className="refresh-button"
                    onClick={fetchMatches}
                >
                    Try Again
                </button>

            </div>

        );

    }


    // Create league groups
    const leagues = groupMatchesByLeague();


    return (

        <div className="app">


            {/* Page heading */}

            <div className="top-section">

                <div>

                    <h1 className="page-title">
                        ⚽ Football Scores
                    </h1>

                    <p className="page-subtitle">
                        Today's Matches
                    </p>

                </div>


                <button
                    className="refresh-button"
                    onClick={fetchMatches}
                >
                    Refresh
                </button>

            </div>


            {/* League groups */}

            <div className="leagues-container">

                {leagues.map((league) => {

                    /*
                     * If the league has never been clicked,
                     * it is expanded by default.
                     */
                    const isExpanded =
                        expandedLeagues[league.name] !== false;


                    return (

                        <div
                            className="league-group"
                            key={league.name}
                        >


                            {/* ========================= */}
                            {/* LEAGUE HEADER */}
                            {/* ========================= */}

                            <div
                                className="league-header"
                                onClick={() =>
                                    toggleLeague(league.name)
                                }
                            >

                                <div className="league-details">


                                    {/* League logo */}

                                    <img
                                        src={league.logo}
                                        alt={league.name}
                                        className="league-logo"
                                    />


                                    {/* League name */}

                                    <div>

                                        <h2>
                                            {league.name}
                                        </h2>

                                        <p>
                                            {league.country}
                                        </p>

                                    </div>

                                </div>


                                {/* Arrow */}

                                <div className="collapse-arrow">

                                    {isExpanded ? "▲" : "▼"}

                                </div>

                            </div>


                            {/* ========================= */}
                            {/* MATCHES INSIDE LEAGUE */}
                            {/* ========================= */}

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


            {/* No matches */}

            {matches.length === 0 && (

                <div className="no-matches">

                    No matches found for today.

                </div>

            )}

        </div>

    );

}


export default App;