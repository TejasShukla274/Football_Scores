process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());

// API-Football v3 compatible host: same endpoints, parameters and JSON
// envelope as api-sports.io, served by 5DollarFootballAPI with our key.
const API_BASE = "https://api-football.5dollarfootballapi.com";


// Get matches for a requested date and serve them to the React app
app.get("/api/matches", async (req, res) => {

    try {

        // Requested date or default to today's date in YYYY-MM-DD format
        const targetDate = req.query.date || new Date().toISOString().split("T")[0];

        const response = await axios.get(
            `${API_BASE}/fixtures`,
            {
                params: { date: targetDate },
                headers: {
                    "x-apisports-key": process.env.API_KEY
                }
            }
        );

        const body = response.data;

        // The provider reports key, parameter and plan problems as HTTP 200
        // with the message under `errors` (API-Football convention)
        const upstreamErrors = body.errors;
        const hasErrors = Array.isArray(upstreamErrors)
            ? upstreamErrors.length > 0
            : Boolean(upstreamErrors && Object.keys(upstreamErrors).length);

        if (hasErrors) {
            console.log("UPSTREAM ERRORS:", JSON.stringify(upstreamErrors));

            return res.status(502).json({
                error: "Upstream rejected the request",
                status: 200,
                details: upstreamErrors
            });
        }

        // Forward quota headers so the remaining window stays visible
        for (const header of ["x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset"]) {
            if (response.headers[header]) {
                res.set(header, response.headers[header]);
            }
        }

        // Full API-Football envelope: { get, errors, results, paging, response }
        res.json(body);

    } catch (error) {

        // Print the error message in the terminal
        console.log("ERROR MESSAGE:", error.message);

        // Print API error details if available
        if (error.response) {

            console.log("STATUS:", error.response.status);

            console.log(
                "API RESPONSE:",
                JSON.stringify(error.response.data)
            );
        }

        // Send error information to the browser
        res.status(500).json({

            error: "Failed to fetch matches",

            status: error.response?.status || "unknown",

            details: error.response?.data || error.message

        });

    }

});


// Start the server (PORT set by hosting platforms, defaults to 5001)
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {

    console.log(
        `Backend running at http://localhost:${PORT}`
    );

});
