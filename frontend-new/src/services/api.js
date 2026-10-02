/**
 * API Service Layer
 * 
 * This service is the SINGLE point of contact for all data fetched by UI components.
 * Currently, it reads mock data from `src/data/`.
 * 
 * TO CONNECT REAL BACKEND / API-FOOTBALL LATER:
 * Replace the return statements in these functions with fetch calls to your Express backend
 * e.g., fetch(`http://localhost:5000/api/matches?date=${isoDate}`).json()
 * The component contracts remain completely unchanged!
 */

import { generateSeededMatchesForDate, getIsoDate } from '../data/matches.js';
import { ALL_LEAGUES, DEFAULT_5_LEAGUES } from '../data/leagues.js';
import { PLAYERS } from '../data/players.js';
import { LEAGUE_STANDINGS } from '../data/standings.js';
import { NEWS_ITEMS } from '../data/news.js';
import { TOP_SCORERS } from '../data/scorers.js';

export { getIsoDate };

/**
 * Fetch matches for a specific date (YYYY-MM-DD format)
 * Returns hand-written mock matches for today +-2 days or seeded generated matches for any date.
 */
export const getMatches = (isoDate) => {
  // FUTURE API INTEGRATION:
  // return fetch(`/api/matches?date=${isoDate}`).then(res => res.json());
  return generateSeededMatchesForDate(isoDate);
};

/**
 * Fetch all available leagues and default 5 leagues
 */
export const getLeagues = () => {
  // FUTURE API INTEGRATION:
  // return fetch('/api/leagues').then(res => res.json());
  return {
    allLeagues: ALL_LEAGUES,
    default5: DEFAULT_5_LEAGUES
  };
};

/**
 * Fetch all player records for Make Your 11 and search
 */
export const getPlayers = () => {
  // FUTURE API INTEGRATION:
  // return fetch('/api/players').then(res => res.json());
  return PLAYERS;
};

/**
 * Fetch standings table for a selected league
 */
export const getStandings = (leagueName = "Premier League") => {
  // FUTURE API INTEGRATION:
  // return fetch(`/api/standings?league=${encodeURIComponent(leagueName)}`).then(res => res.json());
  return LEAGUE_STANDINGS[leagueName] || LEAGUE_STANDINGS["Premier League"];
};

/**
 * Fetch transfer news items
 */
export const getNews = () => {
  // FUTURE API INTEGRATION:
  // return fetch('/api/news').then(res => res.json());
  return NEWS_ITEMS;
};

/**
 * Fetch Golden Boot top scorers
 */
export const getScorers = () => {
  // FUTURE API INTEGRATION:
  // return fetch('/api/scorers').then(res => res.json());
  return TOP_SCORERS;
};
