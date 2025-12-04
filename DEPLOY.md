# Quick Deployment Guide

## 🚀 3-Step Deployment to Render.com

### Step 1: Push to GitHub (5 minutes)

```bash
# Initialize git and commit
git init
git add .
git commit -m "Initial commit: kwrds scraper API"

# Create repository at https://github.com/new
# Then push to GitHub:
git remote add origin https://github.com/YOUR_USERNAME/kwrds-scraper-api.git
git branch -M main
git push -u origin main
```

### Step 2: Create Web Service on Render (2 minutes)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository: `kwrds-scraper-api`
4. Settings:
   - **Name**: `kwrds-scraper-api`
   - **Environment**: `Docker`
   - **Region**: Your nearest region
   - **Branch**: `main`
5. Click **"Create Web Service"**

### Step 3: Wait for Deployment ⏳

- Build takes **2-5 minutes**
- Service will be live at: `https://your-service-name.onrender.com`

---

## 🧪 Test Your API

Once deployed, test with:

```bash
# Health check
curl https://your-service-name.onrender.com/health

# Scrape a keyword
curl "https://your-service-name.onrender.com/api/scrape?keyword=firewood"
```

---

## 📝 Environment Variables

**No environment variables needed!** Render automatically sets:
- `PORT=3000`
- `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` (in Docker)

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Render logs tab |
| 500 errors | Wait for cold start (first request) |
| Timeout | Free tier is slower, request takes 15-20s |
| Service sleeping | Free tier sleeps after 15 min inactivity |

---

## 📱 API Usage Examples

### JavaScript/Node.js

```javascript
fetch('https://your-service-name.onrender.com/api/scrape?keyword=firewood')
  .then(r => r.json())
  .then(data => console.log(data.data));
```

### Python

```python
import requests

response = requests.get(
    'https://your-service-name.onrender.com/api/scrape',
    params={'keyword': 'firewood'}
)
print(response.json())
```

### cURL

```bash
curl "https://your-service-name.onrender.com/api/scrape?keyword=firewood"
```

---

## 💾 File Structure

```
project/
├── src/
│   └── index.js          ← Main server code
├── package.json          ← Dependencies
├── Dockerfile            ← Docker config
├── .dockerignore         ← Docker ignore
├── .gitignore           ← Git ignore
├── .env.example         ← Env template
├── README.md            ← Full documentation
└── DEPLOY.md            ← This file
```

---

## ✅ Checklist Before Deploying

- [ ] All code pushed to GitHub
- [ ] `src/index.js` exists
- [ ] `package.json` has correct dependencies
- [ ] `Dockerfile` is in root directory
- [ ] `.gitignore` configured
- [ ] README.md is complete

---

## 🎉 You're Done!

Your API is now live and production-ready! 

**Share your endpoint:** `https://your-service-name.onrender.com/api/scrape?keyword=YOUR_KEYWORD`
