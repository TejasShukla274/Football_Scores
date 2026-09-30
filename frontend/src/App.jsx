import { useEffect, useState } from "react";
import "./App.css";

function App() {

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMatches();
    }, []);

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


    // Check if match is currently live
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


    // Check if match is finished
    const isFinished = (status) => {

        return [
            "FT",
            "AET",
            "PEN"
        ].includes(status);

    };


    // Get match status
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


    // Match card
    const MatchCard = ({ match }) => {

        const homeTeam = match.teams.home;
        const awayTeam = match.teams.away;

        return (

            <div className="match-card">

                <div className="league">

                    {match.league.logo && (
                        <img
                            src={match.league.logo}
                            alt=""
                            className="league-logo"
                        />
                    )}

                    <span>
                        {match.league.name}
                    </span>

                    <span className="country">
                        {match.league.country}
                    </span>

                </div>


                <div className="match-content">

                    <div className="team">

                        <img
                            src={homeTeam.logo}
                            alt={homeTeam.name}
                            className="team-logo"
                        />

                        <span>
                            {homeTeam.name}
                        </span>

                    </div>


                    <div className="score">

                        <div className="score-number">

                            {match.goals.home ?? "-"}
                            <span> - </span>
                            {match.goals.away ?? "-"}

                        </div>

                        <div
                            className={
                                isLive(match.fixture.status.short)
                                    ? "status live"
                                    : "status"
                            }
                        >
                            {getStatus(match)}
                        </div>

                    </div>


                    <div className="team">

                        <img
                            src={awayTeam.logo}
                            alt={awayTeam.name}
                            className="team-logo"
                        />

                        <span>
                            {awayTeam.name}
                        </span>

                    </div>

                </div>

            </div>

        );

    };


    if (loading) {

        return (
            <div className="app">

                <h1>⚽ Football Scores</h1>

                <p className="loading">
                    Loading matches...
                </p>

            </div>
        );

    }


    if (error) {

        return (
            <div className="app">

                <h1>⚽ Football Scores</h1>

                <p className="error">
                    {error}
                </p>

                <button
                    onClick={fetchMatches}
                    className="refresh-button"
                >
                    Try Again
                </button>

            </div>
        );

    }


    const liveMatches = matches.filter(match =>
        isLive(match.fixture.status.short)
    );


    const finishedMatches = matches.filter(match =>
        isFinished(match.fixture.status.short)
    );


    const upcomingMatches = matches.filter(match =>
        !isLive(match.fixture.status.short) &&
        !isFinished(match.fixture.status.short)
    );


    return (

        <div className="app">

            <header>

                <div>

                    <h1>
                        ⚽ Football Scores
                    </h1>

                    <p className="today">
                        Today's Matches
                    </p>

                </div>

                <button
                    onClick={fetchMatches}
                    className="refresh-button"
                >
                    Refresh
                </button>

            </header>


            {liveMatches.length > 0 && (

                <section>

                    <h2 className="section-title live-title">
                        🔴 LIVE
                    </h2>

                    {liveMatches.map(match => (

                        <MatchCard
                            key={match.fixture.id}
                            match={match}
                        />

                    ))}

                </section>

            )}


            {finishedMatches.length > 0 && (

                <section>

                    <h2 className="section-title">
                        ✅ FINISHED
                    </h2>

                    {finishedMatches.map(match => (

                        <MatchCard
                            key={match.fixture.id}
                            match={match}
                        />

                    ))}

                </section>

            )}


            {upcomingMatches.length > 0 && (

                <section>

                    <h2 className="section-title">
                        🕐 UPCOMING
                    </h2>

                    {upcomingMatches.map(match => (

                        <MatchCard
                            key={match.fixture.id}
                            match={match}
                        />

                    ))}

                </section>

            )}


            {matches.length === 0 && (

                <p className="no-matches">
                    No matches found for today.
                </p>

            )}

        </div>

    );

}

export default App;