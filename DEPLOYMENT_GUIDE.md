# LyricalGenius Deployment Guide

This guide covers deploying LyricalGenius to both **Vercel** and **Cloudflare Pages**.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Cloudflare Pages Deployment](#cloudflare-pages-deployment)
- [Post-Deployment Setup](#post-deployment-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- **Vercel account** (https://vercel.com) OR **Cloudflare account** (https://dash.cloudflare.com)
- **Google Cloud account** with Gemini API access (https://makersuite.google.com)
- **ElevenLabs account** (optional, for voiceover features) (https://elevenlabs.io)

### Required API Keys
1. **GEMINI_API_KEY** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **ELEVENLABS_API_KEY** (optional) - Get from [ElevenLabs Dashboard](https://elevenlabs.io/app/settings/api-keys)

### Local Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd lyricalgenius

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Add your API keys to .env.local
# GEMINI_API_KEY=your_key_here
# ELEVENLABS_API_KEY=your_key_here (optional)

# Test locally
npm run dev
```

---

## Environment Variables

Both platforms require the following environment variables to be set:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI transcription |
| `ELEVENLABS_API_KEY` | No | ElevenLabs API key for voiceover generation |

**Important**: Never commit API keys to your repository. They should only be set in platform environment variable settings.

---

## Vercel Deployment

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Preview deployment
   npm run deploy:vercel:preview
   
   # Production deployment
   npm run deploy:vercel
   ```

4. **Set Environment Variables**
   - Go to your project dashboard on https://vercel.com
   - Navigate to Settings → Environment Variables
   - Add:
     - `GEMINI_API_KEY` = your_gemini_api_key
     - `ELEVENLABS_API_KEY` = your_elevenlabs_api_key (optional)
   - Apply to: Production, Preview, and Development
   - Click "Save"

5. **Redeploy** (after adding environment variables)
   ```bash
   npm run deploy:vercel
   ```

### Method 2: Vercel Dashboard (GitHub Integration)

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import on Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the Vite framework

3. **Configure Environment Variables**
   - During import or in Project Settings
   - Add `GEMINI_API_KEY` and `ELEVENLABS_API_KEY`

4. **Deploy**
   - Vercel will automatically deploy
   - Every push to `main` triggers a new deployment

### Vercel Configuration
The project includes `vercel.json` with:
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites configured
- API routes in `/api` folder (Node.js runtime)

---

## Cloudflare Pages Deployment

### Method 1: Wrangler CLI (Recommended)

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   # Preview deployment
   npm run deploy:cloudflare:preview
   
   # Production deployment
   npm run deploy:cloudflare
   ```

5. **Set Environment Variables**
   
   **Option A: Via Wrangler CLI**
   ```bash
   # Set secrets (encrypted environment variables)
   wrangler pages secret put GEMINI_API_KEY
   # Enter your key when prompted
   
   wrangler pages secret put ELEVENLABS_API_KEY
   # Enter your key when prompted
   ```
   
   **Option B: Via Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to Workers & Pages → Your Project
   - Go to Settings → Environment Variables
   - Add:
     - `GEMINI_API_KEY` = your_gemini_api_key
     - `ELEVENLABS_API_KEY` = your_elevenlabs_api_key (optional)
   - Apply to Production and Preview
   - Save and redeploy

### Method 2: Cloudflare Dashboard (GitHub Integration)

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Pages Project**
   - Go to https://dash.cloudflare.com
   - Navigate to Workers & Pages
   - Click "Create application" → "Pages" → "Connect to Git"
   - Select your repository

3. **Configure Build Settings**
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables:
     - `NODE_VERSION` = `18` (or higher)

4. **Add Environment Variables**
   - In Settings → Environment Variables
   - Add `GEMINI_API_KEY` and `ELEVENLABS_API_KEY`

5. **Deploy**
   - Cloudflare will build and deploy
   - Every push to `main` triggers a new deployment

### Cloudflare Configuration

The project includes:
- `wrangler.toml` - Main configuration file
- `functions/api/` - Cloudflare Pages Functions (serverless)
- SPA routing via `public/_redirects`

**Important Differences from Vercel:**
- Cloudflare Pages Functions use a different format (no `@vercel/node`)
- Functions are in `/functions` folder (not `/api`)
- API endpoints work the same: `/api/transcribe`, `/api/voiceover`

---

## Post-Deployment Setup

### 1. Verify Deployment
After deployment, verify:
- ✅ Site loads at your domain
- ✅ Can create a new project
- ✅ Can upload audio files
- ✅ **Auto Lyrics button works** (tests API integration)
- ✅ Captions render on timeline
- ✅ Preview canvas displays correctly

### 2. Test Auto Lyrics Feature
1. Upload a short audio file (MP3, WAV)
2. Go to Text/Captions tab
3. Click "Generate Auto Lyrics"
4. Verify:
   - Loading spinner appears
   - Transcription completes
   - Captions appear on timeline
   - Preview shows lyrics with animation

### 3. Custom Domain (Optional)

**Vercel:**
- Go to Project Settings → Domains
- Add your custom domain
- Configure DNS (Vercel provides instructions)

**Cloudflare Pages:**
- Go to Workers & Pages → Your Project → Custom Domains
- Add your custom domain
- Cloudflare automatically configures DNS if domain is on Cloudflare

---

## Troubleshooting

### Issue: Auto Lyrics Button Shows "API Key Not Configured"

**Cause**: Environment variables not set correctly

**Solution:**
1. Verify `GEMINI_API_KEY` is set in platform dashboard
2. Redeploy after adding environment variables
3. Check API key is valid (test in Google AI Studio)

### Issue: API Endpoints Return 404

**Vercel:**
- Verify `/api` folder exists with `.ts` files
- Check `vercel.json` includes rewrites
- Ensure `@vercel/node` is in devDependencies

**Cloudflare:**
- Verify `/functions/api` folder exists
- Check build output includes functions
- Review Cloudflare Pages deployment logs

### Issue: Build Fails with TypeScript Errors

**Solution:**
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Environment Variables Not Working

**Vercel:**
- Must start with `VITE_` prefix for client-side access
- Backend variables (API keys) should NOT have `VITE_` prefix
- Redeploy after adding variables

**Cloudflare:**
- Use `wrangler pages secret put` for sensitive values
- Redeploy after adding secrets
- Check "Functions" tab in dashboard for logs

### Issue: CORS Errors

**Both Platforms:**
- API functions should return proper CORS headers
- Frontend and backend are on same domain (no CORS issues)
- If using custom domain, ensure it's properly configured

### Check Deployment Logs

**Vercel:**
```bash
vercel logs <deployment-url>
```

**Cloudflare:**
- Dashboard → Workers & Pages → Your Project → Logs
- Real-time function logs available

---

## Performance Optimization

### Caching
Both platforms automatically cache static assets. For optimal performance:
- Vite builds are optimized by default
- Lazy loading of components
- Code splitting enabled

### Serverless Function Limits

**Vercel:**
- Free tier: 100GB-hours/month
- Execution time: 10s (Hobby), 60s (Pro)
- Payload limit: 4.5MB

**Cloudflare Pages:**
- Free tier: 100,000 requests/day
- Execution time: 1ms CPU time (Free), 50ms (Paid)
- Payload limit: 100MB

**Recommendation**: For high-traffic apps with heavy transcription use, consider Vercel Pro or Cloudflare Workers Paid plan.

---

## Security Best Practices

1. **Never commit `.env` or `.env.local` files**
2. **Rotate API keys periodically**
3. **Set up rate limiting** for production (via platform features)
4. **Enable HTTPS only** (default on both platforms)
5. **Review API usage** in Google Cloud Console and ElevenLabs Dashboard

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Google Gemini API**: https://ai.google.dev/docs
- **ElevenLabs API**: https://docs.elevenlabs.io/

---

## Quick Reference

### Vercel Commands
```bash
vercel login              # Login
vercel                    # Deploy preview
vercel --prod            # Deploy production
vercel logs              # View logs
vercel env add           # Add environment variable
```

### Cloudflare Commands
```bash
wrangler login                        # Login
wrangler pages deploy dist            # Deploy
wrangler pages secret put KEY_NAME    # Add secret
wrangler pages deployment list        # List deployments
wrangler tail                         # Live logs
```

### Build Commands
```bash
npm run build                         # Build for production
npm run preview                       # Preview build locally
npm run deploy:vercel                 # Deploy to Vercel
npm run deploy:cloudflare            # Deploy to Cloudflare
```

---

**Last Updated**: December 2024  
**Version**: 2.0.0
