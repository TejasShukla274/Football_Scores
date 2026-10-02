// Single data entry point for the app.
// The Express backend proxies the 5DollarFootballAPI, so the browser never holds the key.

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export async function fetchMatches(date) {
    const response = await fetch(`${API_BASE}/api/matches?date=${date}`);
    return response.json();
}
