# Quick Start: Deploy in 5 Minutes

Choose your platform and follow the steps:

## 🚀 Vercel (Easiest)

### 1. One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/lyricalgenius)

### 2. Or Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
npx vercel

# Add environment variables when prompted or via dashboard
# GEMINI_API_KEY = your_key_here
```

---

## ☁️ Cloudflare Pages

### 1. Quick Deploy
```bash
# Install Wrangler
npm i -g wrangler

# Login
wrangler login

# Build and deploy
npm run build
npx wrangler pages deploy dist

# Set secrets
wrangler pages secret put GEMINI_API_KEY
# Paste your key when prompted
```

### 2. Or Dashboard Deploy
1. Go to https://dash.cloudflare.com
2. Workers & Pages → Create application → Pages → Connect to Git
3. Select repo, set build command: `npm run build`, output: `dist`
4. Add environment variable: `GEMINI_API_KEY`
5. Deploy!

---

## 🔑 Get Your API Keys

### Google Gemini (Required)
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### ElevenLabs (Optional)
1. Visit https://elevenlabs.io/app/settings/api-keys
2. Generate new key
3. Copy the key

---

## ✅ Verify Deployment

After deployment:
1. Visit your site URL
2. Upload an audio file
3. Click "Generate Auto Lyrics"
4. If captions appear on timeline → Success! 🎉

---

## 🆘 Need Help?

**API not working?**
- Check environment variables are set correctly
- Verify API key is valid
- Redeploy after adding environment variables

**Build failing?**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**More help**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
