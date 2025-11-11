# Random Word Polling Demo

A simple web application that demonstrates polling functionality between a Node.js backend and vanilla JavaScript frontend.

## Features

- Backend server that cycles through random words (cat, dog, mouse, horse, fox) every 5 seconds
- Frontend that polls the server every 2 seconds to display the current word
- Start/Stop controls for the word loop
- Real-time updates without page refresh

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## API Endpoints

- `POST /api/start-loop` - Starts the word loop
- `GET /api/current-word` - Gets the current word (used for polling)
- `POST /api/stop-loop` - Stops the word loop

## Architecture

- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla JavaScript with polling
- **Polling**: Frontend polls every 2 seconds, backend changes words every 5 seconds
- **CORS**: Enabled for cross-origin requests

## Files

- `server.js` - Main server file
- `public/index.html` - Frontend HTML
- `public/app.js` - Frontend JavaScript
- `package.json` - Project dependencies