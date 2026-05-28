# 🚀 Deploy to Cloudflare (Full Stack)

## Overview
- **Frontend:** Cloudflare Pages (FREE)
- **Backend:** Cloudflare Containers (Paid plan required)

## Prerequisites
- Cloudflare account with Workers Paid plan
- Wrangler CLI installed: `npm install -g wrangler`
- Logged in: `wrangler login`

---

## Step 1: Deploy Backend to Cloudflare Containers

```bash
cd backend

# Install containers CLI
npm install -g wrangler

# Build and push container image
wrangler containers images build
wrangler containers images push

# Deploy worker + container
wrangler deploy
```

### Configuration (wrangler.toml already created):
```toml
name = "soundsnap-backend"
main = "worker.js"
compatibility_date = "2026-05-28"

[[containers]]
class_name = "SoundSnapContainer"
image = "./Dockerfile"
max_instances = 5

[[durable_objects.bindings]]
class_name = "SoundSnapContainer"
name = "SOUNDSNAP_CONTAINER"
```

### Environment Variables:
```bash
wrangler secret put AUDD_API_KEY
# Enter: 1c149bd4c113f00a91d622761c613cb1

wrangler secret put PORT
# Enter: 3001
```

---

## Step 2: Deploy Frontend to Cloudflare Pages

```bash
cd ..

# Build
npm run build

# Deploy
npx wrangler pages deploy dist
```

### Update API URL:
Edit `.env.production`:
```env
VITE_API_URL=https://soundsnap-backend.your-account.workers.dev/api
```

---

## Step 3: Verify Deployment

```bash
# Check backend health
curl https://soundsnap-backend.your-account.workers.dev/api/health

# Check frontend
curl https://soundsnap.pages.dev
```

---

## 🐛 Troubleshooting

**Container not starting?**
- Check logs: `wrangler tail`
- Verify Dockerfile builds locally: `docker build -t test .`

**CORS errors?**
- Backend must include: `app.use(cors({ origin: '*' }))`

**AudD not responding?**
- Verify API key is set: `wrangler secret list`
- Check container has internet access

**File uploads fail?**
- Check container storage limits
- May need R2 bucket for file storage

---

## 💰 Costs

| Service | Plan | Estimated Cost |
|---------|------|---------------|
| Pages | Free | $0 |
| Workers | Paid | $5/month base |
| Containers | Usage | ~$0.01/1M requests |
| **Total** | | **~$5-10/month** |

---

## 🔄 Updates

```bash
# Update backend
wrangler containers images build
wrangler containers images push
wrangler deploy

# Update frontend
npm run build
npx wrangler pages deploy dist
```

---

## 📚 Resources

- [Cloudflare Containers Docs](https://developers.cloudflare.com/containers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

## ⚠️ Notes

1. **Cloudflare Containers** is newer than Workers. If you hit issues, try Railway/Render instead
2. **Free tier** doesn't include Containers - you need a paid plan
3. **File uploads** might need R2 bucket for persistence
4. **AudD API** has its own rate limits (100 requests/day free)

---

## 🎯 Alternative: Hybrid Deployment

If Containers has issues:
- **Frontend:** Cloudflare Pages (FREE) ✅
- **Backend:** Railway or Render (FREE tier)
- **Result:** $0/month, still shareable URL
