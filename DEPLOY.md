# SoundSnap Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Railway (Recommended - FREE)

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and setup:**
```bash
cd backend
railway login
railway init
```

3. **Add environment variables:**
```bash
railway variables set AUDD_API_KEY=your_key_here
railway variables set PORT=3001
```

4. **Deploy:**
```bash
railway up
```

5. **Get your URL:**
```bash
railway domain
```

### Option 2: Render (FREE)

1. Go to [render.com](https://render.com)
2. Create "New Web Service"
3. Connect your GitHub repo
4. Use these settings:
   - **Runtime:** Docker
   - **Build Command:** `docker build -t soundsnap-backend .`
   - **Start Command:** `docker run -p $PORT:3001 soundsnap-backend`
5. Add Environment Variables:
   - `AUDD_API_KEY=your_key_here`
   - `PORT=3001`

### Option 3: Fly.io (PAID)

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Launch and deploy:
```bash
fly launch
cd backend
fly deploy
```

### Option 4: Your Computer (Local)

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:3001`

---

## 🌐 Frontend Deployment (Cloudflare Pages)

1. Update `.env.production`:
```env
VITE_API_URL=https://your-backend-url.com/api
```

2. Build and deploy:
```bash
cd soundsnap
npm run build
npx wrangler pages deploy dist
```

3. Follow prompts to create project

---

## 🔑 Environment Variables

Create `.env` file:
```env
PORT=3001
AUDD_API_KEY=your_audd_api_key_here
NODE_ENV=production
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check passes: `curl https://your-api.com/api/health`
- [ ] Frontend can connect to backend
- [ ] File uploads work
- [ ] URL detection works
- [ ] WhatsApp sharing works

---

## 🐛 Troubleshooting

**CORS errors?**
- Make sure backend has `app.use(cors())`
- Check that frontend URL is allowed

**File too large?**
- Railway/Render free tiers have upload limits
- Consider implementing chunked uploads

**AudD not working?**
- Verify API key is set
- Check that ffmpeg is installed in container

---

## 📦 Files for Deployment

```
backend/
├── server.js          # Main server
├── package.json       # Dependencies
├── Dockerfile         # Container config
├── .dockerignore      # Ignore files
├── railway.toml       # Railway config
├── .env              # Environment variables
└── deploy.sh         # Deployment script
```
