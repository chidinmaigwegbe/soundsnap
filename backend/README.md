# SoundSnap Backend API

Express.js backend for SoundSnap music identification app.

## Features

- **File Upload**: Accepts audio/video files for song identification
- **URL Downloads**: Downloads videos from TikTok, Instagram, YouTube and extracts audio
- **AudD Integration**: Sends audio to AudD API for song recognition
- **Audio Extraction**: Uses ffmpeg to extract audio from video files

## Prerequisites

```bash
# Install yt-dlp (for video downloads)
pip3 install yt-dlp

# Install ffmpeg (for audio extraction)
brew install ffmpeg  # macOS
# or
apt-get install ffmpeg  # Ubuntu
```

## Setup

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file:

```env
PORT=3001
AUDD_API_KEY=your_audd_api_key_here
NODE_ENV=development
```

## Running

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3001`

## API Endpoints

### POST /api/identify
Upload an audio/video file for identification.

**Request**: multipart/form-data with `file` field
**Response**:
```json
{
  "success": true,
  "song": {
    "title": "Song Name",
    "artist": "Artist Name",
    "album": "Album Name",
    "apple_music_url": "...",
    "spotify_url": "..."
  }
}
```

### POST /api/identify-from-url
Identify song from a TikTok/Instagram/YouTube URL.

**Request**: JSON body with `url` field
**Response**: Same as `/api/identify`

### GET /api/health
Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```
