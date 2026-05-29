# 🎵 SoundSnap

A beautiful music identification web app that lets you identify songs and share them with your boyfriend on WhatsApp.

## ✨ Features

- 🎤 **Record Audio**: Capture songs playing around you
- 📁 **Upload Files**: Support for audio and video files
- 🔗 **Paste Links**: Download and identify from TikTok, Instagram, or YouTube URLs
- 💬 **WhatsApp Share**: One-click sharing with pre-filled song details
- 🎨 **Beautiful UI**: Interactive particle background with mouse tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3 (for yt-dlp)
- ffmpeg (for audio extraction)

### Installation

```bash
# Install yt-dlp and ffmpeg (macOS)
pip3 install yt-dlp
brew install ffmpeg

# Clone and setup
git clone <repo-url>
cd soundsnap
```

### Run Backend

```bash
cd backend
npm install

# Create .env file
echo "PORT=3001" > .env
echo "AUDD_API_KEY=your_key_here" >> .env

# Start server
npm run dev
```

Backend runs on `http://localhost:3001`

### Run Frontend

```bash
# In another terminal
cd soundsnap
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🏗️ Architecture

```
soundsnap/
├── src/
│   ├── App.jsx          # Main React app
│   ├── api.js           # API client
│   └── index.css        # Styles
├── backend/
│   ├── server.js        # Express server
│   ├── package.json     # Backend deps
│   └── .env            # Backend config
├── .env                # Frontend config
└── package.json        # Frontend deps
```

## 🎯 API Endpoints

### POST /api/identify
Upload audio/video file for song identification.

### POST /api/identify-from-url
Identify song from TikTok/Instagram/YouTube URL.

### GET /api/health
Health check.

## 🛠️ Built With

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Express.js, Multer, yt-dlp, ffmpeg
- **API**: AudD Music Recognition API

## 🔒 Security

- File uploads limited to 50MB
- Temporary files auto-deleted after 1 minute
- CORS enabled for development

## 📝 License

Private - For personal use
