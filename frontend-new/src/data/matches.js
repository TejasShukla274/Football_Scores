// Helper function to get ISO date string (YYYY-MM-DD) offset by N days from today
export const getIsoDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createMatch = (offsetDays, league, time, home, away, hs, as, status, min) => ({
  id: `${getIsoDate(offsetDays)}-${league}-${home}-${away}`,
  date: getIsoDate(offsetDays),
  league,
  time,
  home,
  away,
  hs,
  as,
  status, // "LIVE" | "FT" | "UP"
  min
});

// Hand-crafted matches for Today (0), Yesterday (-1), 2 Days Ago (-2), Tomorrow (+1), 2 Days Ahead (+2)
export const HANDWRITTEN_MATCHES = [
  // TODAY (0)
  createMatch(0, "Premier League", "17:30", "Arsenal", "Chelsea", 2, 1, "LIVE", 67),
  createMatch(0, "Premier League", "15:00", "Liverpool", "Tottenham", 1, 0, "FT"),
  createMatch(0, "Premier League", "20:00", "Man City", "Newcastle", null, null, "UP"),
  createMatch(0, "La Liga", "19:30", "Barcelona", "Sevilla", 2, 0, "LIVE", 45),
  createMatch(0, "La Liga", "16:15", "Atletico", "Betis", 1, 1, "FT"),
  createMatch(0, "Champions League", "21:00", "Bayern Munich", "PSG", 0, 0, "LIVE", 12),
  createMatch(0, "Champions League", "18:45", "Inter Milan", "Porto", 3, 1, "FT"),
  createMatch(0, "Serie A", "20:45", "Juventus", "AC Milan", 0, 0, "LIVE", 89),
  createMatch(0, "Bundesliga", "15:30", "Dortmund", "Leverkusen", null, null, "UP"),
  createMatch(0, "Ligue 1", "21:00", "Marseille", "Lyon", null, null, "UP"),

  // YESTERDAY (-1)
  createMatch(-1, "Premier League", "17:30", "Aston Villa", "Everton", 2, 2, "FT"),
  createMatch(-1, "Bundesliga", "18:30", "RB Leipzig", "Stuttgart", 3, 0, "FT"),
  createMatch(-1, "Serie A", "20:45", "Napoli", "Roma", 1, 0, "FT"),
  createMatch(-1, "Europa League", "21:00", "Ajax", "Villarreal", 1, 2, "FT"),

  // 2 DAYS AGO (-2)
  createMatch(-2, "Premier League", "20:00", "Chelsea", "Liverpool", 0, 1, "FT"),
  createMatch(-2, "La Liga", "21:00", "Real Madrid", "Girona", 4, 1, "FT"),
  createMatch(-2, "Serie A", "18:30", "Lazio", "Fiorentina", 2, 0, "FT"),

  // TOMORROW (+1)
  createMatch(1, "Premier League", "17:30", "Arsenal", "Man City", null, null, "UP"),
  createMatch(1, "La Liga", "20:00", "Barcelona", "Real Madrid", null, null, "UP"),
  createMatch(1, "Bundesliga", "17:30", "Bayern Munich", "Dortmund", null, null, "UP"),
  createMatch(1, "MLS", "02:00", "Inter Miami", "LA Galaxy", null, null, "UP"),

  // 2 DAYS AHEAD (+2)
  createMatch(2, "Serie A", "19:00", "Inter Milan", "Juventus", null, null, "UP"),
  createMatch(2, "Champions League", "21:00", "Real Madrid", "Liverpool", null, null, "UP"),
  createMatch(2, "Saudi Pro League", "20:00", "Al Hilal", "Al Nassr", null, null, "UP")
];

// Seeded PRNG for generating stable random fixtures for any date
const pseudoRandom = (seed) => {
  let s = seed | 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const TEAMS_BY_LEAGUE = {
  "Premier League": ["Arsenal", "Liverpool", "Man City", "Chelsea", "Tottenham", "Newcastle", "Aston Villa", "Everton"],
  "La Liga": ["Real Madrid", "Barcelona", "Atletico", "Sevilla", "Betis", "Villarreal", "Valencia", "Girona"],
  "Bundesliga": ["Bayern Munich", "Dortmund", "Leverkusen", "RB Leipzig", "Stuttgart", "Frankfurt", "Freiburg", "Wolfsburg"],
  "Serie A": ["Inter Milan", "AC Milan", "Juventus", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina"],
  "Ligue 1": ["PSG", "Marseille", "Monaco", "Lyon", "Lille", "Nice", "Rennes", "Lens"],
  "Champions League": ["Real Madrid", "Man City", "Bayern Munich", "PSG", "Inter Milan", "Arsenal", "Barcelona", "Porto"],
  "Europa League": ["Ajax", "Villarreal", "Roma", "Lazio", "Benfica", "Sporting", "Galatasaray", "Rangers"],
  "MLS": ["Inter Miami", "LA Galaxy", "LAFC", "Seattle", "Atlanta", "NY Red Bulls"],
  "Saudi Pro League": ["Al Hilal", "Al Nassr", "Al Ahli", "Al Ittihad"]
};

const SAMPLE_LEAGUES = [
  "Premier League", "Premier League", "La Liga", "La Liga", 
  "Bundesliga", "Serie A", "Serie A", "Ligue 1", "Champions League", 
  "Europa League", "MLS", "Saudi Pro League"
];

const TIMES = ["13:30", "15:00", "16:30", "18:45", "20:00", "21:00"];

export const generateSeededMatchesForDate = (isoDate) => {
  const existing = HANDWRITTEN_MATCHES.filter((m) => m.date === isoDate);
  if (existing.length > 0) return existing;

  // Calculate integer seed from string date
  let seed = 7;
  for (let i = 0; i < isoDate.length; i++) {
    seed = (seed * 31 + isoDate.charCodeAt(i)) | 0;
  }

  let prngIndex = 0;
  const nextRandom = () => {
    prngIndex++;
    return pseudoRandom(seed + prngIndex * 100);
  };

  const getRandomItem = (arr) => arr[Math.floor(nextRandom() * arr.length)];

  const todayStr = getIsoDate(0);
  const isPast = isoDate < todayStr;
  
  const count = 4 + Math.floor(nextRandom() * 4); // 4-7 matches per day
  const matches = [];

  for (let i = 0; i < count; i++) {
    const league = getRandomItem(SAMPLE_LEAGUES);
    const teams = TEAMS_BY_LEAGUE[league] || ["Team A", "Team B", "Team C", "Team D"];
    const home = getRandomItem(teams);
    let away = getRandomItem(teams);
    if (away === home) {
      away = teams[(teams.indexOf(home) + 1) % teams.length];
    }
    const time = getRandomItem(TIMES);
    const hs = isPast ? Math.floor(nextRandom() * 4) : null;
    const as = isPast ? Math.floor(nextRandom() * 4) : null;

    matches.push({
      id: `${isoDate}-${i}-${league}`,
      date: isoDate,
      league,
      time,
      home,
      away,
      hs,
      as,
      status: isPast ? "FT" : "UP",
      min: null
    });
  }

  return matches;
};
