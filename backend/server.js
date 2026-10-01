process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());


// Get today's football matches
app.get("/api/matches", async (req, res) => {

    try {

        // Get requested date or default to today's date in YYYY-MM-DD format
        const targetDate = req.query.date || new Date().toISOString().split("T")[0];

        // Request matches from API-Football for the specified date
        const response = await axios.get(
            "https://v3.football.api-sports.io/fixtures",
            {
                params: {
                    date: targetDate
                },

                headers: {
                    "x-apisports-key": process.env.API_KEY
                }
            }
        );


        // Send the football data to React
        res.json(response.data);

    } catch (error) {

        // Print the error message in the terminal
        console.log("ERROR MESSAGE:", error.message);

        // Print API error details if available
        if (error.response) {

            console.log("STATUS:", error.response.status);

            console.log(
                "API RESPONSE:",
                error.response.data
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


// Start the server
app.listen(5000, () => {

    console.log(
        "Backend running at http://localhost:5000"
    );

});