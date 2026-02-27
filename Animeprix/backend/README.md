# Animeprix Backend Server

Express.js backend proxy server for Animeprix frontend.

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if needed (defaults work for local development)

3. **Start the Server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Verify it's running:**
   Visit `http://localhost:3001/api/health`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/search?q=query` - Search anime
- `GET /api/anime/:id` - Get anime info by ID
- `GET /api/watch?episodeId=...` - Get streaming links
- `GET /api/trending` - Get trending anime

## CORS Configuration

The server is configured to allow requests from `http://localhost:5173` (Vite default).
Update `FRONTEND_URL` in `.env` if your frontend runs on a different port.

