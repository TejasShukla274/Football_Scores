# Football Scores

A live football scores web app. Pick a day, get every match for that date grouped by league, with live scores ticking as games run.

The browser never touches the football data API. A small Express server holds the API key and proxies requests, so the key stays out of the frontend and out of git.

## Features

- Date navigation: browse fixtures day by day
- Matches grouped by league and country, collapsible per league
- Live match states: running clock (63'), half-time, full-time
- Filters: all matches, live only, sorted by kickoff time
- Dark mode

## Architecture

```
Browser (React + Vite)  ->  Express API  ->  5DollarFootballAPI (api.5dollarfootballapi.com)
frontend-new : 5173        backend : 5001
```

One endpoint sits between the UI and the data source: `GET /api/matches?date=YYYY-MM-DD`.

## Tech stack

| Layer    | Tools                                        |
| -------- | -------------------------------------------- |
| Frontend | React 19, Vite 8, plain CSS                   |
| Backend  | Node.js, Express 5, axios, cors, dotenv       |
| Data     | 5DollarFootballAPI v1 (free tier: top-5 leagues, 60 requests/hour) |
| Runtime  | Docker (optional) or plain Node 20+           |

## Project structure

```
├── frontend-new/     # React app (the current UI)
├── backend/          # Express API
├── frontend/         # First version of the site, kept for reference
├── docker-compose.yml
└── README.md
```

## Quick start

Prerequisites: Node.js 20+ with npm, and a free API key from [5dollarfootballapi.com](https://5dollarfootballapi.com/) (top-5 leagues, 60 requests/hour, no card).

### Option 1: npm

```bash
# Terminal 1 - backend
cd backend
npm install
cp .env.example .env      # paste your key into API_KEY
npm start                 # http://localhost:5001

# Terminal 2 - frontend
cd frontend-new
npm install
npm run dev               # http://localhost:5173
```

### Option 2: Docker

```bash
docker compose up --build
# frontend  http://localhost:8080
# backend   http://localhost:5001
```

The compose file injects `backend/.env` at runtime. The secret never lands in an image layer.


## Environment variables

| Variable      | Where          | Required | Default               | Purpose                                |
| ------------- | -------------- | -------- | --------------------- | -------------------------------------- |
| `API_KEY`     | `backend/.env` | yes      | -                     | 5DollarFootballAPI key, sent as `Authorization: Bearer` |
| `VITE_API_BASE` | frontend build | no       | `http://localhost:5001` | Backend URL baked in at build time    |
| `PORT`          | backend runtime | no      | `5001`                  | Set automatically by hosting platforms |

## Deployment (free tier)

**Frontend on Vercel**

1. Import the repo, set Root Directory to `frontend-new`.
2. Framework preset: Vite. Build command `npm run build`, output directory `dist`.
3. Add `VITE_API_BASE` (Settings -> Environment Variables) pointing at your deployed backend, then redeploy.

Vercel builds the Vite app natively. The Dockerfile is ignored there, so Docker costs you nothing on this path.

**Backend on Render, Railway, or Fly.io**

1. Create a web service from the repo, root directory `backend`.
2. Build command `npm ci --omit=dev`, start command `node server.js`.
3. Set `API_KEY` in the service environment.

All three have free tiers (Render spins the service down after inactivity). Each accepts the plain Node path or, if a host prefers containers, `backend/Dockerfile` is ready. Point `VITE_API_BASE` at the service URL and the frontend talks to it directly; the API allows cross-origin requests.

## Local-only files

`.agents/` (agent skills) and `skills-lock.json` are gitignored. They live on your machine only and never enter the repository.

## Data attribution

Football data by [5DollarFootballAPI](https://5dollarfootballapi.com) - required attribution while running on the free plan.
