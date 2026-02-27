# Backend Setup Guide

## Step-by-Step Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
```

The `.env` file will contain:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Backend Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### 5. Verify Backend is Running
Open your browser and visit: `http://localhost:3001/api/health`

You should see:
```json
{
  "status": "ok",
  "message": "Animeprix Backend is running"
}
```

### 6. Update Frontend Environment (Optional)
Create a `.env` file in the root of your React project:
```
VITE_BACKEND_URL=http://localhost:3001/api
```

If you don't create this, it will default to `http://localhost:3001/api`.

## API Endpoints

### Search Anime
```
GET /api/search?q=naruto
```

### Get Anime Info
```
GET /api/anime/:id
```

### Get Streaming Links
```
GET /api/watch?episodeId=episode-id
GET /api/watch?animeId=anime-id&episode=1
```

### Get Trending
```
GET /api/trending
```

## Important Notes

### Streaming Links
- The backend fetches streaming links from Consumet API
- **DO NOT** embed videos directly in iframes from untrusted sources
- Streaming links should be used to:
  1. Redirect users to external players
  2. Use trusted video players (YouTube, Vimeo)
  3. Implement your own video player with proper security

### Security
- The backend acts as a proxy, hiding API keys and handling CORS
- Never expose streaming URLs directly in the frontend
- Always validate and sanitize user inputs

### CORS
- Backend allows requests from `http://localhost:5173` by default
- Update `FRONTEND_URL` in `.env` if your frontend uses a different port

