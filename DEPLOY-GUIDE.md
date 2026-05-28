# 🚀 Deploy SoundSnap Backend

## Choose Your Platform

### Option 1: Railway 🚂 (Recommended)
- **Pros:** Generous free tier, easy CLI, fast deploys
- **Cons:** Free tier sleeps after inactivity (cold starts)
- **Best for:** Personal use, testing

### Option 2: Render 🎨
- **Pros:** Always-on free tier, simple dashboard
- **Cons:** Slower deploys, limited free hours
- **Best for:** Production, consistent uptime

---

## 🚂 Railway Deployment (Recommended)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login
```bash
railway login
```

### Step 3: Initialize Project
```bash
cd backend
railway init
```
- Select "Empty Project"
- Name it: `soundsnap-backend`

### Step 4: Deploy
```bash
railway up
```

### Step 5: Set Environment Variables
```bash
railway variables set AUDD_API_KEY=1c149bd4c113f00a91d622761c613cb1
railway variables set PORT=3001
railway variables set NODE_ENV=production
```

### Step 6: Get Your URL
```bash
railway domain
# Output: https://soundsnap-backend-production.up.railway.app
```

### Step 7: Update Frontend
Edit `.env.production`:
```env
VITE_API_URL=https://your-railway-url.up.railway.app/api
```

Then deploy frontend:
```bash
cd ..
npm run build
npx wrangler pages deploy dist
```

---

## 🎨 Render Deployment

### Step 1: Create Account
Go to [render.com](https://render.com) and sign up (free)

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repo (or use "Public Git repository")
3. If no repo, use these settings:
   - **Name:** soundsnap-backend
   - **Runtime:** Docker
   - **Root Directory:** backend
   - **Dockerfile Path:** ./Dockerfile

### Step 3: Set Environment Variables
In Render dashboard:
```
AUDD_API_KEY=1c149bd4c113f00a91d622761c613cb1
PORT=3001
NODE_ENV=production
```

### Step 4: Deploy
Click "Create Web Service"

### Step 5: Get Your URL
Render gives you a URL like:
```
https://soundsnap-backend.onrender.com
```

### Step 6: Update Frontend
Edit `.env.production`:
```env
VITE_API_URL=https://your-render-url.onrender.com/api
```

Then deploy:
```bash
npm run build
npx wrangler pages deploy dist
```

---

## 📊 Platform Comparison

| Feature | Railway | Render |
|---------|---------|---------|
| **Free Tier** | ✅ Generous | ✅ Always-on |
| **Docker Support** | ✅ Native | ✅ Native |
| **Custom Domain** | ✅ | ✅ |
| **SSL/HTTPS** | ✅ Auto | ✅ Auto |
| **Cold Starts** | ⚠️ After inactivity | ❌ None (always-on) |
| **Deploy Speed** | ⚡ Fast | 🐢 Slower |
| **Logs** | ✅ CLI + Dashboard | ✅ Dashboard |
| **Best For** | Development | Production |

---

## 🔑 Environment Variables

Set these on whichever platform you choose:

```env
PORT=3001
NODE_ENV=production
AUDD_API_KEY=1c149bd4c113f00a91d622761c613cb1
```

---

## ✅ Verify Deployment

```bash
# Test backend health
curl https://your-backend-url.com/api/health

# Expected response:
# {"status":"ok","timestamp":"..."}

# Test song identification (if you have a file)
curl -X POST -F "file=@test.mp3" https://your-backend-url.com/api/identify
```

---

## 🔄 Update After Code Changes

### Railway:
```bash
cd backend
git add .
git commit -m "update"
git push
# Railway auto-deploys!
```

### Render:
```bash
git push
# Render auto-deploys from GitHub!
```

---

## 🐛 Troubleshooting

**Build fails?**
- Check Dockerfile is valid: `docker build -t test .`
- Verify all dependencies in package.json

**Container crashes?**
- Check logs: `railway logs` or Render dashboard
- Verify env variables are set

**CORS errors?**
- Backend must have `app.use(cors())`
- Frontend URL must be accessible

**AudD not working?**
- Verify API key is set correctly
- Check backend has internet access

---

## 💰 Costs

| Platform | Free Tier | Paid (if needed) |
|----------|-----------|------------------|
| **Railway** | $5/month credit | ~$5-20/month |
| **Render** | Always-on web service | ~$7-25/month |
| **Cloudflare Pages** | Unlimited | FREE |
| **Total** | **FREE** | ~$5-20/month |

---

## 🎯 My Recommendation

**Start with Railway** because:
1. ✅ Easier setup
2. ✅ Generous free tier
3. ✅ Faster deploys
4. ✅ Good for testing

**Switch to Render** if:
1. You need always-on service
2. Cold starts bother you
3. You want more stability

---

## 🚀 Quick Start Commands

```bash
# Option 1: Railway (Recommended)
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
railway variables set AUDD_API_KEY=1c149bd4c113f00a91d622761c613cb1

# Option 2: Render
# Just go to render.com and follow UI
```

---

## 📞 Need Help?

- **Railway Docs:** https://docs.railway.app/
- **Render Docs:** https://render.com/docs
- **Discord:** Join Railway/Render communities

---

## 🎉 After Deployment

You'll have:
- ✅ Frontend: https://soundsnap.pages.dev
- ✅ Backend: https://soundsnap-backend.railway.app (or .onrender.com)
- ✅ Share with friends!
